from app.extensions import db  # ✅ CORRECT
from datetime import datetime

class Summary(db.Model):
    __tablename__ = 'summaries'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    book_id = db.Column(db.Integer, db.ForeignKey('books.id', ondelete='CASCADE'), nullable=False)
    bookclub_id = db.Column(db.Integer, db.ForeignKey('bookclubs.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    book = db.relationship('Book', back_populates='summaries')
    user = db.relationship('User', back_populates='summaries')
    bookclub = db.relationship('BookClub', back_populates='summaries')

    def __init__(self, content, book_id, user_id, bookclub_id=None):
        self.content = content
        self.book_id = book_id
        self.user_id = user_id
        self.bookclub_id = bookclub_id

    def __repr__(self):
        return f'<Summary {self.id} for Book {self.book_id} in Club {self.bookclub_id}>'

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "book_id": self.book_id,
            "user_id": self.user_id,
            "bookclub_id": self.bookclub_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
