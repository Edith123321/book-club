from datetime import datetime
from app import db
from sqlalchemy.dialects.postgresql import ARRAY
from .review import Review

class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    genres = db.Column(db.JSON, nullable=True)
    synopsis = db.Column(db.Text, nullable=True)
    date_published = db.Column(db.DateTime, nullable=True)
    cover_image_url = db.Column(db.String, nullable=True)
    date_added = db.Column(db.DateTime, default=datetime.utcnow)
    rating = db.Column(db.Float, nullable=True)
    language = db.Column(db.String(50), nullable=True)
    pages = db.Column(db.Integer, nullable=True)

    # Define relationships here after both classes have been defined
    summaries = db.relationship('Summary', back_populates='book', cascade='all, delete-orphan')

    # Use a string reference to the 'Review' class to avoid circular imports
    reviews = db.relationship('Review', back_populates='book', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "genres": self.genres,
            "synopsis": self.synopsis,
            "date_published": self.date_published.isoformat() if self.date_published else None,
            "cover_image_url": self.cover_image_url,
            "date_added": self.date_added.isoformat() if self.date_added else None,
            "rating": self.rating,
            "language": self.language,
            "pages": self.pages
        }

    def __repr__(self):
        return f'<Book {self.title} by {self.author}>'
