"""legacy compatibility no-op for historical music theory migration

Revision ID: 20260316_0005
Revises: 20260316_0004
Create Date: 2026-03-16 03:30:00

"""
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "20260316_0005"
down_revision: Union[str, Sequence[str], None] = "20260316_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
