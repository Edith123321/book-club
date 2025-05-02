from models import db
from datetime import datetime

class BookClub(db.Model):
    __tablename__ = 'book_clubs'

    id = db.Column(db.Integer, primary_key=True)
    book_club_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    meeting_frequency = db.Column(db.String(100))
    club_cover_url = db.Column(db.String(500))
    status = db.Column(db.String(50), default='Active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    current_book = db.relationship('CurrentBook', back_populates='book_club', uselist=False, cascade='all, delete-orphan')
    meetings = db.relationship('Meeting', back_populates='book_club', cascade='all, delete-orphan')
    discussions = db.relationship('Discussion', back_populates='book_club', cascade='all, delete-orphan')
    genres = db.relationship('Genre', secondary='book_club_genres', back_populates='book_clubs')
    members = db.relationship('Member', secondary='book_club_members', back_populates='book_clubs')

    def to_dict(self):
        return {
            'id': self.id,
            'bookClubName': self.book_club_name,
            'description': self.description,
            'meetingFrequency': self.meeting_frequency,
            'clubCoverUrl': self.club_cover_url,
            'status': self.status,
            'currentBook': self.current_book.to_dict() if self.current_book else None,
            'nextMeeting': self.meetings[0].to_dict() if self.meetings else None,
            'genres': [genre.name for genre in self.genres],
            'members': [member.to_dict() for member in self.members],
            'discussions': [discussion.to_dict() for discussion in self.discussions]
        }

book_club_genres = db.Table('book_club_genres',
    db.Column('book_club_id', db.Integer, db.ForeignKey('book_clubs.id'), primary_key=True),
    db.Column('genre_id', db.Integer, db.ForeignKey('genres.id'), primary_key=True)
)

book_club_members = db.Table('book_club_members',
    db.Column('book_club_id', db.Integer, db.ForeignKey('book_clubs.id'), primary_key=True),
    db.Column('member_id', db.Integer, db.ForeignKey('members.id'), primary_key=True),
    db.Column('join_date', db.DateTime, default=datetime.utcnow),
    db.Column('is_admin', db.Boolean, default=False)
)