"""Updated migration to reflect new bookclub_id and other changes

Revision ID: 5e07d678c655
Revises: 88bec73f5a8b
Create Date: 2025-05-04 09:51:52.370317
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '5e07d678c655'
down_revision = '88bec73f5a8b'
branch_labels = None
depends_on = None


def upgrade():
    # ### Alter 'current_books' table ###
    with op.batch_alter_table('current_books', schema=None) as batch_op:
        batch_op.add_column(sa.Column('bookclub_id', sa.Integer(), nullable=True))
        batch_op.drop_constraint('current_books_book_club_id_key', type_='unique')
        batch_op.create_unique_constraint(None, ['bookclub_id'])
        batch_op.drop_constraint('current_books_book_club_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'bookclubs', ['bookclub_id'], ['id'])
        batch_op.drop_column('book_club_id')

    # ### Alter 'invites' table ###
    with op.batch_alter_table('invites', schema=None) as batch_op:
        batch_op.add_column(sa.Column('bookclub_id', sa.Integer(), nullable=True))
        batch_op.drop_constraint('invites_book_club_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'bookclubs', ['bookclub_id'], ['id'])
        batch_op.drop_column('book_club_id')

    # ### Alter 'meetings' table ###
    with op.batch_alter_table('meetings', schema=None) as batch_op:
        batch_op.add_column(sa.Column('bookclub_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('creator_id', sa.Integer(), nullable=True))
        batch_op.drop_constraint('meetings_book_club_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'users', ['creator_id'], ['id'])
        batch_op.create_foreign_key(None, 'bookclubs', ['bookclub_id'], ['id'])
        batch_op.drop_column('book_club_id')

    # ### Alter 'memberships' table ###
    with op.batch_alter_table('memberships', schema=None) as batch_op:
        batch_op.add_column(sa.Column('bookclub_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('status', sa.String(length=20), nullable=True))
        batch_op.alter_column('joined_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=True)
        batch_op.drop_constraint('memberships_book_club_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'bookclubs', ['bookclub_id'], ['id'])
        batch_op.drop_column('book_club_id')

    # ### Alter 'summaries' table ###
    with op.batch_alter_table('summaries', schema=None) as batch_op:
        batch_op.add_column(sa.Column('bookclub_id', sa.Integer(), nullable=True))
        batch_op.drop_constraint('summaries_user_id_fkey', type_='foreignkey')
        batch_op.drop_constraint('summaries_book_club_id_fkey', type_='foreignkey')
        batch_op.create_foreign_key(None, 'bookclubs', ['bookclub_id'], ['id'])
        batch_op.create_foreign_key(None, 'users', ['user_id'], ['id'])
        batch_op.drop_column('book_club_id')

    # ### Alter 'users' table ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('is_admin',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               existing_server_default=sa.text('false'))

    # ### End Alembic commands ###


def downgrade():
    # ### Revert changes for 'users' table ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('is_admin',
               existing_type=sa.BOOLEAN(),
               nullable=True,
               existing_server_default=sa.text('false'))

    # ### Revert changes for 'summaries' table ###
    with op.batch_alter_table('summaries', schema=None) as batch_op:
        batch_op.add_column(sa.Column('book_club_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('summaries_book_club_id_fkey', 'book_clubs', ['book_club_id'], ['id'], ondelete='CASCADE')
        batch_op.create_foreign_key('summaries_user_id_fkey', 'users', ['user_id'], ['id'], ondelete='CASCADE')
        batch_op.drop_column('bookclub_id')

    # ### Revert changes for 'memberships' table ###
    with op.batch_alter_table('memberships', schema=None) as batch_op:
        batch_op.add_column(sa.Column('book_club_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('memberships_book_club_id_fkey', 'book_clubs', ['book_club_id'], ['id'])
        batch_op.alter_column('joined_at',
               existing_type=postgresql.TIMESTAMP(),
               nullable=False)
        batch_op.drop_column('status')
        batch_op.drop_column('bookclub_id')

    # ### Revert changes for 'meetings' table ###
    with op.batch_alter_table('meetings', schema=None) as batch_op:
        batch_op.add_column(sa.Column('book_club_id', sa.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('meetings_book_club_id_fkey', 'book_clubs', ['book_club_id'], ['id'])
        batch_op.drop_column('creator_id')
        batch_op.drop_column('bookclub_id')

    # ### Revert changes for 'invites' table ###
    with op.batch_alter_table('invites', schema=None) as batch_op:
        batch_op.add_column(sa.Column('book_club_id', sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('invites_book_club_id_fkey', 'book_clubs', ['book_club_id'], ['id'])
        batch_op.drop_column('bookclub_id')

    # ### Revert changes for 'current_books' table ###
    with op.batch_alter_table('current_books', schema=None) as batch_op:
        batch_op.add_column(sa.Column('book_club_id', sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('current_books_book_club_id_fkey', 'book_clubs', ['book_club_id'], ['id'])
        batch_op.drop_constraint(None, type_='unique')
        batch_op.create_unique_constraint('current_books_book_club_id_key', ['book_club_id'])
        batch_op.drop_column('bookclub_id')

    # ### Create missing tables ###
    op.create_table('membership',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('bookclub_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('joined_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column('role', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('status', sa.VARCHAR(length=20), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['bookclub_id'], ['bookclubs.id'], name='membership_bookclub_id_fkey'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='membership_user_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='membership_pkey')
    )
    op.create_table('book_clubs',
    sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('book_clubs_id_seq'::regclass)"), autoincrement=True, nullable=False),
    sa.Column('name', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.Column('owner_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('synopsis', sa.TEXT(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], name='book_clubs_owner_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='book_clubs_pkey'),
    postgresql_ignore_search_path=False
    )
    op.create_table('book_club_members',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('book_club_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('joined_at', postgresql.TIMESTAMP(), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['book_club_id'], ['book_clubs.id'], name='book_club_members_book_club_id_fkey'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='book_club_members_user_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='book_club_members_pkey')
    )
    # ### end Alembic commands ###
