from datetime import datetime
from app import db

class BookClub(db.Model):
    __tablename__ = 'book_clubs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    synopsis = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    owner = db.relationship('User', back_populates='owned_clubs')
    memberships = db.relationship('BookClubMember', back_populates='book_club', cascade='all, delete-orphan')
    current_book = db.relationship('CurrentBook', back_populates='book_club', uselist=False, cascade='all, delete-orphan')
    summaries = db.relationship('Summary', back_populates='book_club', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'synopsis': self.synopsis,
            'created_at': self.created_at.isoformat(),
            'owner_id': self.owner_id,
            'member_count': len(self.memberships),
            'current_book': self.current_book.to_dict() if self.current_book else None
        }



class BookClubMember(db.Model):
    __tablename__ = 'book_club_members'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_club_id = db.Column(db.Integer, db.ForeignKey('book_clubs.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='memberships')
    book_club = db.relationship('BookClub', back_populates='memberships')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'book_club_id': self.book_club_id,
            'joined_at': self.joined_at.isoformat(),
            'user': self.user.to_dict() if self.user else None
        }




class CurrentBook(db.Model):
    __tablename__ = 'current_books'

    id = db.Column(db.Integer, primary_key=True)
    book_club_id = db.Column(db.Integer, db.ForeignKey('book_clubs.id'), unique=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)

    # Relationships
    book_club = db.relationship('BookClub', back_populates='current_book')
    book = db.relationship('Book')

    def to_dict(self):
        return {
            'id': self.id,
            'book_club_id': self.book_club_id,
            'book_id': self.book_id,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'book': self.book.to_dict() if self.book else None
        }
