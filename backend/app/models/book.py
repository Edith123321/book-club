from app import db

class Book(db.Model):
    __tablename__ = 'books'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    year = db.Column(db.Integer, nullable=False)

    # New fields added to match frontend expectations
    cover = db.Column(db.String(255), nullable=True, default='https://via.placeholder.com/300x400?text=No+Cover')
    published = db.Column(db.String(50), nullable=True, default='Unknown')
    pages = db.Column(db.Integer, nullable=True, default=0)
    rating = db.Column(db.Float, nullable=True, default=0.0)
    genres = db.Column(db.PickleType, nullable=True, default=[])
    
    # Add the relationship to Summary and include cascade='all, delete-orphan'
    summaries = db.relationship('Summary', back_populates='book', cascade='all, delete-orphan')

    def __init__(self, title, author, genre, description, year, cover=None, published=None, pages=None, rating=None, genres=None):
        self.title = title
        self.author = author
        self.genre = genre
        self.description = description
        self.year = year
        self.cover = cover or 'https://via.placeholder.com/300x400?text=No+Cover'
        self.published = published or 'Unknown'
        self.pages = pages or 0
        self.rating = rating or 0.0
        self.genres = genres or []

    def __repr__(self):
        return f'<Book {self.title} by {self.author}>'

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "genre": self.genre,
            "description": self.description,
            "year": self.year,
            "cover": self.cover,
            "published": self.published,
            "pages": self.pages,
            "rating": self.rating,
            "genres": self.genres
        }
