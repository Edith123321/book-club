from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '629333f548b1'
down_revision = 'cda9faa2b01f'
branch_labels = None
depends_on = None


def upgrade():
    # Existing changes to 'books' and 'reviews' tables
    with op.batch_alter_table('books', schema=None) as batch_op:
        batch_op.add_column(sa.Column('genres', sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column('synopsis', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('date_published', sa.DateTime(), nullable=False, server_default=sa.text("NOW()")))
        batch_op.add_column(sa.Column('rating', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('language', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('pages', sa.Integer(), nullable=True))
        batch_op.drop_column('description')
        batch_op.drop_column('year')
        batch_op.drop_column('genre')

    with op.batch_alter_table('reviews', schema=None) as batch_op:
        batch_op.create_foreign_key('fk_reviews_book_id', 'books', ['book_id'], ['id'])

    # Adding 'book_club' table
    op.create_table(
        'book_club',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    # Existing downgrade changes to 'books' and 'reviews' tables
    with op.batch_alter_table('reviews', schema=None) as batch_op:
        batch_op.drop_constraint('fk_reviews_book_id', type_='foreignkey')

    with op.batch_alter_table('books', schema=None) as batch_op:
        batch_op.add_column(sa.Column('genre', sa.VARCHAR(length=50), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('year', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.add_column(sa.Column('description', sa.VARCHAR(length=500), autoincrement=False, nullable=True))
        batch_op.drop_column('pages')
        batch_op.drop_column('language')
        batch_op.drop_column('rating')
        batch_op.drop_column('date_published')
        batch_op.drop_column('synopsis')
        batch_op.drop_column('genres')

    # Dropping 'book_club' table
    op.drop_table('book_club')
