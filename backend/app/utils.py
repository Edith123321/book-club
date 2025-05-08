import re
from functools import wraps
from flask import request, jsonify, current_app
from itsdangerous import URLSafeTimedSerializer
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Validation Functions (add these at the top)
def validate_email(email: str) -> bool:
    """Validate email format using regex"""
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> bool:
    """Validate password meets complexity requirements"""
    if len(password) < 8:
        return False
    if not any(char.isdigit() for char in password):
        return False
    if not any(char.isalpha() for char in password):
        return False
    return True

def validate_username(username: str) -> bool:
    """Validate username format and length"""
    pattern = r'^[a-zA-Z0-9_]{3,50}$'
    return re.match(pattern, username) is not None

# Invite Token Functions (keep these at the bottom)
def invite_token_required(f):
    """Decorator for verifying invite tokens"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = kwargs.get('token')
        if not token:
            return jsonify({"error": "Token is missing"}), 401
        
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        try:
            invite_data = s.loads(token, max_age=604800)  # 1 week expiration
            kwargs['invite_data'] = invite_data
        except Exception as e:
            return jsonify({"error": "Invalid or expired token", "details": str(e)}), 401
            
        return f(*args, **kwargs)
    return decorated

def generate_invite_token(sender_id, bookclub_id, recipient_id):
    """Generate a secure token for invites"""
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return s.dumps({
        'sender_id': sender_id,
        'bookclub_id': bookclub_id,
        'recipient_id': recipient_id,
        'created_at': datetime.utcnow().isoformat()
    })