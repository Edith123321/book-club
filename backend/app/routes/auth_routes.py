from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from app.models.user import User
from app.utils import validate_email, validate_password, validate_username
import jwt
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('email') or not data.get('password') or not data.get('username'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    email = data['email'].strip().lower()
    username = data['username'].strip()
    password = data['password']
    
    # Validate inputs
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    if not validate_password(password):
        return jsonify({'error': 'Password must be at least 8 characters with letters and numbers'}), 400
    if not validate_username(username):
        return jsonify({'error': 'Username must be 3-50 characters (letters, numbers, underscores)'}), 400
    
    # Check if user exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already taken'}), 409
    
    # Create user (default non-admin)
    try:
        new_user = User(
            email=email,
            username=username,
            password=password,
            is_admin=False
        )
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    user = User.query.filter_by(email=data['email'].strip().lower()).first()
    
    if not user or not user.verify_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Generate JWT token
    token = user.generate_auth_token()
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200