from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app import db
class BookClub(db.Model):
    __tablename__ = 'book_clubs'

    id = Column(Integer, primary_key=True)
    bookClubName = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    genres = Column(String(200), nullable=True)  # Comma separated genres
    current_book_id = Column(Integer, ForeignKey('books.id'))
    currentBook = relationship('Book')

    def to_dict(self):
        from app.models.membership import Membership
        return {
            'id': self.id,
            'bookClubName': self.bookClubName,
            'description': self.description,
            'genres': self.genres.split(',') if self.genres else [],
            'currentBook': self.currentBook.to_dict() if self.currentBook else None,
            'members': [m.user_id for m in Membership.query.filter_by(book_club_id=self.id).all()]
        }
