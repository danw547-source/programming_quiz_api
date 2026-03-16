"""seed all quiz question sets from JSON

Revision ID: 20260316_0003
Revises: 20260316_0002
Create Date: 2026-03-16 01:00:00

"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260316_0003"
down_revision: Union[str, Sequence[str], None] = "20260316_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


QUESTIONS_JSON_PATH = Path(__file__).resolve().parents[2] / "app" / "data" / "questions.json"

QUESTIONS_TABLE = sa.table(
    "questions",
    sa.column("id", sa.Integer()),
    sa.column("question_set", sa.String(length=50)),
    sa.column("prompt", sa.Text()),
    sa.column("options", sa.JSON()),
    sa.column("answer", sa.Text()),
    sa.column("explanation", sa.Text()),
)


def _load_seed_questions() -> list[dict]:
    with QUESTIONS_JSON_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def _sync_missing_seed_rows() -> None:
    questions_to_add = _load_seed_questions()
    if not questions_to_add:
        return

    bind = op.get_bind()
    target_ids = [question["id"] for question in questions_to_add]
    existing_ids = {
        row[0]
        for row in bind.execute(
            sa.select(QUESTIONS_TABLE.c.id).where(QUESTIONS_TABLE.c.id.in_(target_ids))
        )
    }

    missing_rows = [question for question in questions_to_add if question["id"] not in existing_ids]
    if missing_rows:
        op.bulk_insert(QUESTIONS_TABLE, missing_rows)


def upgrade() -> None:
    _sync_missing_seed_rows()


def downgrade() -> None:
    seed_questions = _load_seed_questions()
    if not seed_questions:
        return

    seed_ids = [question["id"] for question in seed_questions]
    bind = op.get_bind()
    bind.execute(sa.delete(QUESTIONS_TABLE).where(QUESTIONS_TABLE.c.id.in_(seed_ids)))
