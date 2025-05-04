from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask import current_app
import jwt
from app import db  

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    summaries = db.relationship('Summary', back_populates='user', cascade='all, delete-orphan')
    
    # Following relationships (simplified)
    following = db.relationship(
        'User', secondary='follows',
        primaryjoin='User.id==follows.c.follower_id',
        secondaryjoin='User.id==follows.c.followed_id',
        backref=db.backref('followers', lazy='dynamic'),
        lazy='dynamic'
    )
    
    # Invite relationships
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



    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_auth_token(self, expires_in=86400):  # 24 hours
        return jwt.encode(
            {
                'id': self.id,
                'is_admin': self.is_admin,
                'exp': datetime.utcnow() + timedelta(seconds=expires_in)
            },
            current_app.config['SECRET_KEY'],
            algorithm='HS256'
        )

    @staticmethod
    def verify_auth_token(token):
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            return User.query.get(data['id'])
        except:
            return None

    def is_following(self, user):
        return self.following.filter_by(id=user.id).first() is not None

    def follow(self, user):
        if not self.is_following(user):
            self.following.append(user)
            return True
        return False

    def unfollow(self, user):
        if self.is_following(user):
            self.following.remove(user)
            return True
        return False

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
            }