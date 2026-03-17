"""Add tech support question sets (windows os, software and productivity, hardware, networking)

Revision ID: 20260317_0008
Revises: 20260316_0007
Create Date: 2026-03-17 00:00:00

"""
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "20260317_0008"
down_revision: Union[str, Sequence[str], None] = "20260316_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
