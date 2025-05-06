from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from datetime import datetime
from app.models.user import User
from app import db
from app.utils import validate_email, validate_password, validate_username
from marshmallow import ValidationError
from app.schemas.user_schema import user_create_schema

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        user_data = user_create_schema.load(request.get_json())  # This returns a User object, not a dict

        # Validate input and other steps...

        # Create new user
        new_user = User(
            email=user_data.email,
            username=user_data.username,
            is_admin=False
        )

        # Set the password using the setter method to hash it
        new_user.password = user_data.password  # This triggers the setter for password hashing

        db.session.add(new_user)
        db.session.commit()

        # Return success response
        return jsonify({
            'message': 'Registration successful',
            'user': {
                'id': new_user.id,
                'email': new_user.email,
                'username': new_user.username,
                'is_admin': new_user.is_admin
            }
        }), 201

    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()  # Rollback on error
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()

        if not data or 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password required'}), 400

        # Ensure email is case-insensitive and strip spaces
        email = data['email'].strip().lower()
        user = User.query.filter_by(email=email).first()

        # Log the user object for debugging
        print(f"User found: {user}")  # Log the user object

        if not user or not user.verify_password(data['password']):
            # Log failed login attempt
            print(f"Failed login attempt for email: {email}")
            return jsonify({'error': 'Invalid credentials'}), 401

        # Generate token
        token = user.generate_auth_token()

        return jsonify({
            'token': token,
            'user_id': user.id,
            'is_admin': user.is_admin
        }), 200

    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500
