"""
Database layer: ORM model, engine setup, migration runner, and seed sync.

`initialize_database()` is called once at startup (via the FastAPI lifespan).
It runs Alembic migrations to bring the schema up to date, then inserts any
seed questions that are missing from the database.  Both steps are idempotent,
so restarting the server is always safe.
"""
from collections.abc import Generator

from alembic import command
from alembic.config import Config
from sqlalchemy import JSON, CheckConstraint, Index, String, Text, create_engine, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from app.config import PROJECT_ROOT, get_settings
from app.models.question import Question
from app.repositories.json_question_repository import JsonQuestionRepository


class Base(DeclarativeBase):
    pass


# JSON is used for SQLite; JSONB (binary JSON) is used for PostgreSQL — faster
# indexing and smaller storage.  with_variant() picks the right type at
# connection time so the same model definition works for both databases.
QUESTION_OPTIONS_TYPE = JSON().with_variant(JSONB(), "postgresql")


class QuestionRecord(Base):
    """SQLAlchemy ORM model that maps to the `questions` table."""

    __tablename__ = "questions"
    __table_args__ = (
        # Database-level constraints catch invalid data even if it bypasses the
        # application layer (e.g., a direct SQL INSERT during data migration).
        CheckConstraint("length(trim(question_set)) > 0", name="ck_questions_question_set_not_blank"),
        CheckConstraint("question_set = lower(question_set)", name="ck_questions_question_set_lowercase"),
        CheckConstraint("length(trim(prompt)) > 0", name="ck_questions_prompt_not_blank"),
        CheckConstraint("length(trim(answer)) > 0", name="ck_questions_answer_not_blank"),
        CheckConstraint("length(trim(explanation)) > 0", name="ck_questions_explanation_not_blank"),
        # Composite index for the most common query pattern: filter by
        # question_set, then look up by id within that set.
        Index("ix_questions_question_set_id", "question_set", "id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    question_set: Mapped[str] = mapped_column(String(50))
    prompt: Mapped[str] = mapped_column(Text)
    options: Mapped[list[str]] = mapped_column(QUESTION_OPTIONS_TYPE)
    answer: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)


settings = get_settings()
engine = create_engine(
    settings.database_url,
    # Connection pooling for better performance:
    # pre_ping=True checks connections are alive before reusing them
    # pool_size=20 maintains 20 ready connections (SQLite uses 1 thread, so lower is ok)
    # max_overflow=10 allows up to 10 additional connections if needed
    pool_pre_ping=True,
    pool_size=5 if settings.database_url.startswith("sqlite") else 20,
    max_overflow=5 if settings.database_url.startswith("sqlite") else 10,
    # SQLite raises "SQLite objects created in a thread can only be used in that
    # same thread" by default.  FastAPI's async handling may use different
    # threads, so we disable the check.  This is safe because SQLAlchemy's
    # session-per-request pattern prevents concurrent session sharing.
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
)
# autoflush=False: prevents SQLAlchemy from issuing unexpected INSERT/UPDATE
# statements mid-transaction when objects are accessed via relationships.
# expire_on_commit=False: keeps loaded objects usable after commit without
# triggering a lazy reload.
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

ALEMBIC_INI_PATH = PROJECT_ROOT / "alembic.ini"
ALEMBIC_SCRIPT_LOCATION = PROJECT_ROOT / "alembic"


def get_session() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session


def run_migrations() -> None:
    alembic_config = Config(str(ALEMBIC_INI_PATH))
    alembic_config.set_main_option("script_location", str(ALEMBIC_SCRIPT_LOCATION))
    alembic_config.set_main_option("sqlalchemy.url", settings.database_url)
    command.upgrade(alembic_config, "head")


def initialize_database() -> None:
    """Run migrations then insert any seed questions not yet in the database."""
    run_migrations()

    with SessionLocal() as session:
        seed_repository = JsonQuestionRepository(settings.question_seed_file)
        seed_questions = seed_repository.get_all()

        # Fetch existing IDs in one query to avoid N+1 SELECT statements when
        # checking whether each seed question is already present.
        existing_ids = set(session.scalars(select(QuestionRecord.id)))
        missing_records = [
            _to_record(question)
            for question in seed_questions
            if question.id not in existing_ids
        ]

        if not missing_records:
            return

        # Insert in batches of 100 for better performance (avoids memory overhead
        # of holding all records in a single large batch, and gives the database
        # more manageable transactions).
        batch_size = 100
        for i in range(0, len(missing_records), batch_size):
            batch = missing_records[i : i + batch_size]
            session.add_all(batch)
            session.commit()
            # Clear the session after each batch to free memory and prevent
            # the session from holding references to old ORM objects.
            session.expunge_all()


def _to_record(question: Question) -> QuestionRecord:
    return QuestionRecord(
        id=question.id,
        question_set=question.question_set,
        prompt=question.prompt,
        options=question.options,
        answer=question.answer,
        explanation=question.explanation,
    )