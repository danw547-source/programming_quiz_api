"""legacy compatibility no-op for historical category question migration

Revision ID: 20260316_0004
Revises: 20260316_0003
Create Date: 2026-03-16 01:30:00

"""
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "20260316_0004"
down_revision: Union[str, Sequence[str], None] = "20260316_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
