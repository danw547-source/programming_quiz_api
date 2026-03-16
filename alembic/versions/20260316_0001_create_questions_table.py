"""create questions table

Revision ID: 20260316_0001
Revises:
Create Date: 2026-03-16 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260316_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "questions" not in inspector.get_table_names():
        op.create_table(
            "questions",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("question_set", sa.String(length=50), nullable=False),
            sa.Column("prompt", sa.Text(), nullable=False),
            sa.Column("options", sa.JSON(), nullable=False),
            sa.Column("answer", sa.Text(), nullable=False),
            sa.Column("explanation", sa.Text(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    indexes = {index["name"] for index in inspector.get_indexes("questions")}
    index_name = op.f("ix_questions_question_set")
    if index_name not in indexes:
        op.create_index(index_name, "questions", ["question_set"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "questions" not in inspector.get_table_names():
        return

    index_name = op.f("ix_questions_question_set")
    indexes = {index["name"] for index in inspector.get_indexes("questions")}
    if index_name in indexes:
        op.drop_index(index_name, table_name="questions")

    op.drop_table("questions")
