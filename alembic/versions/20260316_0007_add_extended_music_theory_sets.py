"""legacy compatibility no-op for historical extended music migration

Revision ID: 20260316_0007
Revises: 20260316_0006
Create Date: 2026-03-16 06:00:00

"""
from typing import Sequence, Union

# revision identifiers, used by Alembic.
revision: str = "20260316_0007"
down_revision: Union[str, Sequence[str], None] = "20260316_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
