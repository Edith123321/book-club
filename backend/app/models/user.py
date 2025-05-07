from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

class User(db.Model):
    __tablename__ = 'users'
    
    # Core Fields
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)  # Add is_active field
    last_login = db.Column(db.DateTime, nullable=True)  # New field for last login
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    summaries = db.relationship('Summary', back_populates='user', cascade='all, delete-orphan')
    following = db.relationship(
        'User', secondary='follows',
        primaryjoin='User.id==follows.c.follower_id',
        secondaryjoin='User.id==follows.c.followed_id',
        backref=db.backref('followers', lazy='dynamic'),
        lazy='dynamic'
    )
    sent_invites = db.relationship('Invite', foreign_keys='Invite.sender_id', 
                                 back_populates='sender', lazy='dynamic')
    received_invites = db.relationship('Invite', foreign_keys='Invite.recipient_id',
                                     back_populates='recipient', lazy='dynamic')
    owned_clubs = db.relationship('BookClub', back_populates='owner')
    memberships = db.relationship('Membership', back_populates='user', cascade='all, delete-orphan')
    created_meetings = db.relationship(
        "Meeting",
        back_populates="creator",
        cascade="all, delete-orphan"
    )

    # Password Handling
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password: str):
        """Automatically hashes passwords when set"""
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")
        self.password_hash = generate_password_hash(
            password,
            method='pbkdf2:sha512',
            salt_length=16
        )

    def verify_password(self, password: str) -> bool:
        """Securely verify password against stored hash"""
        return check_password_hash(self.password_hash, password)

    # Social Features
    def is_following(self, user: 'User') -> bool:
        """Check if this user follows another user"""
        return self.following.filter_by(id=user.id).first() is not None

    def follow(self, user: 'User') -> bool:
        """Follow another user with validation"""
        if self.id == user.id:
            return False  # Can't follow yourself
        if not self.is_following(user):
            self.following.append(user)
            db.session.commit()
            return True
        return False

    def unfollow(self, user: 'User') -> bool:
        """Unfollow a user"""
        if self.is_following(user):
            self.following.remove(user)
            db.session.commit()
            return True
        return False

    # Serialization
    def to_dict(self, include_relationships: bool = False) -> Dict[str, Any]:
        """Convert user to dictionary with optional relationships"""
        base_data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'is_active': self.is_active,  # Include is_active in dict
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_relationships:
            base_data.update({
                'following_count': self.following.count(),
                'followers_count': self.followers.count(),
                'owned_clubs_count': len(self.owned_clubs)
            })
            
        return base_data

    # Utility Methods
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
        db.session.commit()

    def deactivate_account(self):
        """Deactivate user account"""
        self.is_active = False
        db.session.commit()

    def _repr_(self):
        return f'<User {self.username} ({self.email})>'