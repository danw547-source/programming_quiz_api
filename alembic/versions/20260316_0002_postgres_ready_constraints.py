"""add question constraints and composite index

Revision ID: 20260316_0002
Revises: 20260316_0001
Create Date: 2026-03-16 00:30:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "20260316_0002"
down_revision: Union[str, Sequence[str], None] = "20260316_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


CHECK_CONSTRAINTS = (
    ("ck_questions_question_set_not_blank", "length(trim(question_set)) > 0"),
    ("ck_questions_question_set_lowercase", "question_set = lower(question_set)"),
    ("ck_questions_prompt_not_blank", "length(trim(prompt)) > 0"),
    ("ck_questions_answer_not_blank", "length(trim(answer)) > 0"),
    ("ck_questions_explanation_not_blank", "length(trim(explanation)) > 0"),
)


def upgrade() -> None:
    bind = op.get_bind()
    dialect_name = bind.dialect.name
    inspector = sa.inspect(bind)
    existing_indexes = {index["name"] for index in inspector.get_indexes("questions")}

    with op.batch_alter_table("questions", recreate="always") as batch_op:
        if "ix_questions_question_set" in existing_indexes:
            batch_op.drop_index(op.f("ix_questions_question_set"))

        for constraint_name, constraint_sql in CHECK_CONSTRAINTS:
            batch_op.create_check_constraint(constraint_name, constraint_sql)

        batch_op.create_index("ix_questions_question_set_id", ["question_set", "id"], unique=False)

    if dialect_name == "postgresql":
        op.alter_column(
            "questions",
            "options",
            type_=postgresql.JSONB(),
            postgresql_using="options::jsonb",
            existing_type=sa.JSON(),
        )


def downgrade() -> None:
    bind = op.get_bind()
    dialect_name = bind.dialect.name

    if dialect_name == "postgresql":
        op.alter_column(
            "questions",
            "options",
            type_=sa.JSON(),
            postgresql_using="options::json",
            existing_type=postgresql.JSONB(),
        )

    with op.batch_alter_table("questions", recreate="always") as batch_op:
        batch_op.drop_index("ix_questions_question_set_id")

        for constraint_name, _ in CHECK_CONSTRAINTS:
            batch_op.drop_constraint(constraint_name, type_="check")

        batch_op.create_index(op.f("ix_questions_question_set"), ["question_set"], unique=False)
