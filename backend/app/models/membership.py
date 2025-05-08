from datetime import datetime
from app.extensions import db  # ✅ CORRECT

class Membership(db.Model):
    __tablename__ = 'memberships'  # Fixed double underscores
    
    id = db.Column(db.Integer, primary_key=True)
    bookclub_id = db.Column(db.Integer, db.ForeignKey('bookclubs.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False)
    role = db.Column(db.String(50), default='member', nullable=False)
    status = db.Column(db.String(20), default='active')  # Added status field

    # Relationships
    bookclub = db.relationship('BookClub', back_populates='memberships')
    user = db.relationship('User', back_populates='memberships')
    role = db.Column(db.String(50), default='member')  

    def _init_(self, bookclub_id, user_id, role='member'):
        self.bookclub_id = bookclub_id
        self.user_id = user_id
        self.role = role

    def _repr_(self):
        return f"<Membership {self.id}: User {self.user_id} in Club {self.bookclub_id} as {self.role}>"

    def to_dict(self):
        return {
            'id': self.id,
            'bookclub_id': self.bookclub_id,
            'user_id': self.user_id,
            'joined_at': self.joined_at.isoformat(),
            'role': self.role,
            'status': self.status,
            'user': self.user.to_dict() if self.user else None,
            'bookclub': self.bookclub.to_dict() if self.bookclub else None
        }
