from datetime import datetime
from app.extensions import db  # ✅ CORRECT
from sqlalchemy.dialects.postgresql import JSON

class BookClub(db.Model):
    __tablename__ = 'bookclubs'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    synopsis = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(20), default='Active')  # Add this
    current_book = db.Column(JSON)  # Storing current book as JSON (title, author, etc.)

    # Relationships
    owner = db.relationship('User', back_populates='owned_clubs')
    memberships = db.relationship('Membership', back_populates='bookclub', cascade='all, delete-orphan')
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
            'current_book': self.current_book  # Ensure that the current book is included
        }
