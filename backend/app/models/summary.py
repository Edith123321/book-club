from app.extensions import db  # ✅
from datetime import datetime

class Summary(db.Model):
    __tablename__ = 'summaries'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # book_id = db.Column(db.Integer, db.ForeignKey('books.id', ondelete='CASCADE'), nullable=False)
    bookclub_id = db.Column(db.Integer, db.ForeignKey('bookclubs.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # ✅ Relationships
    user = db.relationship('User', back_populates='summaries')  # Re-add this
    bookclub = db.relationship('BookClub', back_populates='summaries')

    def __init__(self, content, user_id, bookclub_id=None):
        self.content = content
        self.user_id = user_id
        self.bookclub_id = bookclub_id

    def __repr__(self):
        return f'<Summary {self.id} by User {self.user_id} in Club {self.bookclub_id}>'

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "user_id": self.user_id,
            "bookclub_id": self.bookclub_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
