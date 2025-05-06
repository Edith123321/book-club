"""Is active column added

Revision ID: 6bd8de107b9b
Revises: 7f7546605176
Create Date: 2025-05-05 23:57:52.118984
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '6bd8de107b9b'
down_revision = '7f7546605176'
branch_labels = None
depends_on = None


def upgrade():
    # Step 1: Add 'is_active' column as nullable
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_active', sa.Boolean(), nullable=True))

    # Step 2: Update all rows where 'is_active' is NULL to set it to a default value (e.g., TRUE)
    op.execute("UPDATE users SET is_active = TRUE WHERE is_active IS NULL")

    # Step 3: Alter the column to be NOT NULL
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column(
            'is_active',
            existing_type=sa.Boolean(),
            nullable=False
        )

    # Step 4: Add other columns (if necessary)
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('last_login', sa.DateTime(), nullable=True))


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('is_active')
        batch_op.drop_column('last_login')
