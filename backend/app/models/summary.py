from app import db
from datetime import datetime

class Summary(db.Model):
    __tablename__ = 'summaries'  # Corrected typo

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships with proper cascade settings
    book_id = db.Column(db.Integer, db.ForeignKey('books.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    book_club_id = db.Column(db.Integer, db.ForeignKey('book_clubs.id', ondelete='CASCADE'), nullable=False)

    # Relationship definitions
    book = db.relationship('Book', back_populates='summaries')
    user = db.relationship('User', back_populates='summaries')
    book_club = db.relationship('BookClub', back_populates='summaries')

    def __init__(self, content, book_id, user_id, book_club_id):  # Corrected constructor
        self.content = content
        self.book_id = book_id
        self.user_id = user_id
        self.book_club_id = book_club_id

    def __repr__(self):  # Corrected representation method
        return f'<Summary {self.id} for Book {self.book_id} in Club {self.book_club_id}>'

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "book_id": self.book_id,
            "user_id": self.user_id,
            "book_club_id": self.book_club_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "user": self.user.to_dict() if self.user else None,
            "book": self.book.to_dict() if self.book else None
        }
