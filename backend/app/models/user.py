from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)

follows = db.Table(
    'follows',
    db.Column('follower_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('followed_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('created_at', db.DateTime, default=datetime.utcnow)
)

class User(db.Model):
    __tablename__ = 'users'
    
    # Core Fields
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    bio = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.String(255), default='default-avatar.png')
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    summaries = db.relationship('Summary', back_populates='user', cascade='all, delete-orphan')
    following = db.relationship(
        'User', secondary=follows,
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
        self.updated_at = datetime.utcnow()

    def verify_password(self, password: str) -> bool:
        """Securely verify password against stored hash"""
        return check_password_hash(self.password_hash, password)

    # Social Features
    def is_following(self, user: 'User') -> bool:
        """Check if this user follows another user"""
        if user is None:
            return False
        return self.following.filter(follows.c.followed_id == user.id).first() is not None

    def follow(self, user: 'User') -> bool:
        """Follow another user with validation"""
        if user is None or self.id == user.id:
            return False  # Can't follow yourself or None
        
        if not self.is_following(user):
            self.following.append(user)
            self.updated_at = datetime.utcnow()
            db.session.commit()
            logger.info(f"User {self.id} started following {user.id}")
            return True
        return False

    def unfollow(self, user: 'User') -> bool:
        """Unfollow a user"""
        if user is None:
            return False
            
        if self.is_following(user):
            self.following.remove(user)
            self.updated_at = datetime.utcnow()
            db.session.commit()
            logger.info(f"User {self.id} unfollowed {user.id}")
            return True
        return False

    def get_followers(self, page: int = 1, per_page: int = 10) -> List['User']:
        """Get paginated list of followers"""
        return self.followers.paginate(page=page, per_page=per_page, error_out=False)

    def get_following(self, page: int = 1, per_page: int = 10) -> List['User']:
        """Get paginated list of users being followed"""
        return self.following.paginate(page=page, per_page=per_page, error_out=False)

    # Serialization
    def to_dict(self, include_relationships: bool = False) -> Dict[str, Any]:
        """Convert user to dictionary with optional relationships"""
        base_data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'is_admin': self.is_admin,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        
        if include_relationships:
            base_data.update({
                'following_count': self.following.count(),
                'followers_count': self.followers.count(),
                'owned_clubs_count': len(self.owned_clubs),
                'summaries_count': len(self.summaries)
            })
            
        return base_data

    def to_public_dict(self) -> Dict[str, Any]:
        """Public-facing user information (without sensitive data)"""
        return {
            'id': self.id,
            'username': self.username,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'following_count': self.following.count(),
            'followers_count': self.followers.count()
        }

    # Utility Methods
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
        db.session.commit()

    def deactivate_account(self):
        """Deactivate user account"""
        self.is_active = False
        self.updated_at = datetime.utcnow()
        db.session.commit()
        logger.info(f"User {self.id} deactivated their account")

    def activate_account(self):
        """Activate user account"""
        self.is_active = True
        self.updated_at = datetime.utcnow()
        db.session.commit()
        logger.info(f"User {self.id} activated their account")

    def update_profile(self, **kwargs):
        """Update user profile fields"""
        allowed_fields = {'username', 'email', 'bio', 'avatar_url'}
        for field, value in kwargs.items():
            if field in allowed_fields and hasattr(self, field):
                setattr(self, field, value)
        self.updated_at = datetime.utcnow()
        db.session.commit()

    def __repr__(self):
        return f'<User {self.username} ({self.email})>'