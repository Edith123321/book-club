from datetime import datetime
from sqlalchemy import event
from .extensions import db

# schemas.py
from marshmallow import Schema, fields, pre_load
import re

def camel_to_snake(name):
    return re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()

class BookClubSchema(Schema):
    id = fields.Int(dump_only=True)
    book_club_name = fields.Str(required=True)
    status = fields.Str(required=True)

    @pre_load
    def convert_keys_to_snake_case(self, data, **kwargs):
        return {camel_to_snake(k): v for k, v in data.items()}


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    avatar = db.Column(db.String(200), default='default_avatar.jpg')
    bio = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_active = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    memberships = db.relationship('ClubMember', back_populates='user', cascade='all, delete-orphan')
    reviews = db.relationship('Review', back_populates='user', cascade='all, delete-orphan')
    discussions = db.relationship('Discussion', back_populates='author', cascade='all, delete-orphan')
    summaries = db.relationship('Summary', back_populates='author', cascade='all, delete-orphan')
    replies = db.relationship('DiscussionReply', back_populates='author', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        from .extensions import bcrypt
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        from .extensions import bcrypt
        return bcrypt.check_password_hash(self.password_hash, password)

class Book(db.Model):
    __tablename__ = 'books'
    
    id = db.Column(db.Integer, primary_key=True)
    isbn = db.Column(db.String(13), unique=True)  # Added ISBN field
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    cover = db.Column(db.String(200))
    rating = db.Column(db.Float)
    genres = db.Column(db.String(200))
    description = db.Column(db.Text)
    pages = db.Column(db.Integer)
    published = db.Column(db.Date)
    review = db.Column(db.String(500))
    
    # Relationships
    reviews = db.relationship('Review', back_populates='book', cascade='all, delete-orphan')
    clubs = db.relationship('BookClub', secondary='club_books', back_populates='books')

    def __repr__(self):
        return f'<Book {self.title} by {self.author}>'

    def to_dict(self):
        return {
            'id': self.id,
            'isbn': self.isbn,
            'title': self.title,
            'author': self.author,
            'cover': self.cover,
            'rating': self.rating,
            'genres': self.genres.split(',') if self.genres else [],
            'description': self.description,
            'pages': self.pages,
            'published': self.published.isoformat() if self.published else None,
            'rating_review': self.rating_review
        }

# Association table for many-to-many relationship between BookClub and Book
club_books = db.Table('club_books',
    db.Column('club_id', db.Integer, db.ForeignKey('book_clubs.id'), primary_key=True),
    db.Column('book_id', db.Integer, db.ForeignKey('books.id'), primary_key=True),
    db.Column('added_at', db.DateTime, default=datetime.utcnow)
)

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    book = db.relationship('Book', back_populates='reviews')
    user = db.relationship('User', back_populates='reviews')

    def __repr__(self):
        return f'<Review {self.id} for Book {self.book_id}>'

class BookClub(db.Model):
    __tablename__ = 'book_clubs'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    cover = db.Column(db.String(200))
    description = db.Column(db.Text, nullable=False)
    meeting_frequency = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Current book fields
    current_book_id = db.Column(db.Integer, db.ForeignKey('books.id'))  # Added foreign key
    current_book_progress = db.Column(db.String(50))
    
    # Next meeting fields
    next_meeting_date = db.Column(db.Date)
    next_meeting_time = db.Column(db.String(50))
    next_meeting_location = db.Column(db.String(200))
    next_meeting_agenda = db.Column(db.Text)
    
    # Relationships
    members = db.relationship('ClubMember', back_populates='club', cascade='all, delete-orphan')
    discussions = db.relationship('Discussion', back_populates='club', cascade='all, delete-orphan')
    books = db.relationship('Book', secondary=club_books, back_populates='clubs')
    current_book = db.relationship('Book', foreign_keys=[current_book_id])

    def __repr__(self):
        return f'<BookClub {self.name}>'

class ClubMember(db.Model):
    __tablename__ = 'club_members'
    
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20), default='member')
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    club_id = db.Column(db.Integer, db.ForeignKey('book_clubs.id'), nullable=False)
    
    # Relationships
    user = db.relationship('User', back_populates='memberships')
    club = db.relationship('BookClub', back_populates='members')

    def __repr__(self):
        return f'<ClubMember {self.user_id} in Club {self.club_id}>'

class Discussion(db.Model):
    __tablename__ = 'discussions'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)  # Added title field
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)
    
    # Foreign Keys
    club_id = db.Column(db.Integer, db.ForeignKey('book_clubs.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    club = db.relationship('BookClub', back_populates='discussions')
    author = db.relationship('User', back_populates='discussions')
    replies = db.relationship('DiscussionReply', back_populates='discussion', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Discussion {self.id} in Club {self.club_id}>'

class DiscussionReply(db.Model):
    __tablename__ = 'discussion_replies'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    discussion_id = db.Column(db.Integer, db.ForeignKey('discussions.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    discussion = db.relationship('Discussion', back_populates='replies')
    author = db.relationship('User', back_populates='replies')

    def __repr__(self):
        return f'<Reply {self.id} to Discussion {self.discussion_id}>'

class Summary(db.Model):
    __tablename__ = 'summaries'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    club_id = db.Column(db.Integer, db.ForeignKey('book_clubs.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))  # Added book reference
    
    # Relationships
    club = db.relationship('BookClub')
    author = db.relationship('User', back_populates='summaries')
    book = db.relationship('Book')

    def __repr__(self):
        return f'<Summary {self.id} for Club {self.club_id}>'

# Indexes for better performance
event.listen(User.username, 'set', lambda target, value, oldvalue, initiator: value.lower() if value else value)
event.listen(User.email, 'set', lambda target, value, oldvalue, initiator: value.lower() if value else value)