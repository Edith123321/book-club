from models import db
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime

class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    cover = db.Column(db.String(500))
    rating = db.Column(db.Float)
    description = db.Column(db.Text)
    pages = db.Column(db.Integer)
    published = db.Column(db.String(100))
    founder = db.Column(db.String(255))
    rating_review = db.Column(db.String(500))
    
    # Relationships
    reviews = db.relationship('Review', backref='book', lazy=True, cascade='all, delete-orphan')
    genres = db.relationship('Genre', secondary='book_genres', back_populates='books')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'cover': self.cover,
            'rating': self.rating,
            'description': self.description,
            'pages': self.pages,
            'published': self.published,
            'founder': self.founder,
            'ratingReview': self.rating_review,
            'genres': [genre.name for genre in self.genres],
            'reviews': [review.to_dict() for review in self.reviews]
        }

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    title = db.Column(db.String(255))
    description = db.Column(db.Text)
    username = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    likes = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'username': self.username,
            'created_at': self.created_at.isoformat(),
            'likes': self.likes
        }

book_genres = db.Table('book_genres',
    db.Column('book_id', db.Integer, db.ForeignKey('books.id'), primary_key=True),
    db.Column('genre_id', db.Integer, db.ForeignKey('genres.id'), primary_key=True)
)