from datetime import datetime
from app import db

class BookClub(db.Model):
    __tablename__ = 'bookclubs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    synopsis = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    owner = db.relationship('User', foreign_keys=[owner_id])
    
    # Relationships
    owner = db.relationship('User', back_populates='owned_clubs')
    memberships = db.relationship('Membership', back_populates='bookclub', cascade='all, delete-orphan')
    currentbook = db.relationship('CurrentBook', back_populates='bookclub', uselist=False, cascade='all, delete-orphan')
    summaries = db.relationship('Summary', back_populates='bookclub', cascade='all, delete-orphan')
    meetings = db.relationship('Meeting', back_populates='bookclub', cascade='all, delete-orphan')

    
    

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'synopsis': self.synopsis,
            'created_at': self.created_at.isoformat(),
            'owner_id': self.owner_id,
            'member_count': len(self.memberships),
            'currentbook': self.currentbook.to_dict() if self.currentbook else None
        }


class CurrentBook(db.Model):
    __tablename__ = 'current_books'  # ✅ Correct

    id = db.Column(db.Integer, primary_key=True)
    bookclub_id = db.Column(db.Integer, db.ForeignKey('bookclubs.id'), unique=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)

    # Relationships
    bookclub = db.relationship('BookClub', back_populates='currentbook')  # ✅ Match name used in BookClub
    book = db.relationship('Book')

    def to_dict(self):
        return {
            'id': self.id,
            'bookclub_id': self.bookclub_id,
            'book_id': self.book_id,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'book': self.book.to_dict() if self.book else None
        }
