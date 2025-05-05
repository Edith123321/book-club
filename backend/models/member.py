from models import db
from datetime import datetime

class Member(db.Model):
    __tablename__ = 'members'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    avatar_url = db.Column(db.String(500))
    email = db.Column(db.String(255), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    book_clubs = db.relationship('BookClub', secondary='book_club_members', back_populates='members')
    discussions = db.relationship('Discussion', backref='member', lazy=True)

    def to_dict(self):
        return {
            'name': self.name,
            'avatar': self.avatar_url,
            'email': self.email
        }