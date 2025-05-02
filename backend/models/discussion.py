from models import db
from datetime import datetime

class Discussion(db.Model):
    __tablename__ = 'discussions'

    id = db.Column(db.Integer, primary_key=True)
    book_club_id = db.Column(db.Integer, db.ForeignKey('book_clubs.id'), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('members.id'))
    comment = db.Column(db.Text, nullable=False)
    likes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'user': self.member.name if self.member else 'Anonymous',
            'comment': self.comment,
            'timestamp': self.created_at.isoformat(),
            'likes': self.likes
        }