from app.extensions import db  # ✅ CORRECT
from datetime import datetime
from enum import Enum
from .user import User
from .bookclub import BookClub



class InviteStatus(Enum):
    PENDING = 'PENDING'
    ACCEPTED = 'ACCEPTED'
    DECLINED = 'DECLINED'

class Invite(db.Model):
    __tablename__ = 'invites'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    bookclub_id = db.Column(db.Integer, db.ForeignKey('bookclubs.id'))
    status = db.Column(db.Enum(InviteStatus), default=InviteStatus.PENDING, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    token = db.Column(db.String(512), unique=True, nullable=False)
    
    # Relationships
    sender = db.relationship('User', foreign_keys=[sender_id], back_populates='sent_invites')
    recipient = db.relationship('User', foreign_keys=[recipient_id], back_populates='received_invites')
    bookclub = db.relationship('BookClub')