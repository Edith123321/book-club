from datetime import datetime
from app import db

class Membership(db.Model):
    __tablename__ = 'memberships'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_club_id = db.Column(db.Integer, db.ForeignKey('book_clubs.id'), nullable=False)
    role = db.Column(db.String(50), default='member')
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships (Commented out as we are not working on the BookClub model)
    # user = db.relationship('User', back_populates='memberships')
    # book_club = db.relationship('BookClub', back_populates='memberships')

    def __repr__(self):
        return f"<Membership user_id={self.user_id} book_club_id={self.book_club_id} role={self.role}>"
