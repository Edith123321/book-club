from models import db

class Genre(db.Model):
    __tablename__ = 'genres'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

    # Relationships
    books = db.relationship('Book', secondary='book_genres', back_populates='genres')
    book_clubs = db.relationship('BookClub', secondary='book_club_genres', back_populates='genres')

    def __repr__(self):
        return f'<Genre {self.name}>'