from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models.user import User
from app.extensions import db
from datetime import datetime
import re
from marshmallow import ValidationError
from app.schemas.user_schema import user_create_schema

auth_bp = Blueprint('auth', __name__)

def generate_valid_username(email, first_name, last_name):
    """Generate a username that passes validation rules"""
    # Use email prefix
    username_base = email.split('@')[0]
    username = re.sub(r'[^a-zA-Z0-9_]', '', username_base)

    # Fallback if username is too short
    if len(username) < 3:
        name_combo = f"{first_name}_{last_name}".lower()
        username = re.sub(r'[^a-z0-9_]', '', name_combo)

    # Ensure minimum length
    if len(username) < 3:
        username += "_user"

    return username[:50]

@auth_bp.route('/register', methods=['POST'])
def register():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    try:
        data = request.get_json()
        print("Received data:", data)

        # Generate a valid username
        username = data.get('username')
        if not username or not re.match(r'^[a-zA-Z0-9_]+$', username):
            new_email = data.get('newEmail')
            first_name = data.get('firstName')
            last_name = data.get('lastName')

            if not all([new_email, first_name, last_name]):
                return jsonify({"error": "Missing required fields"}), 400

            username = generate_valid_username(new_email, first_name, last_name)

        registration_data = {
            'email': data.get('newEmail'),
            'password': data.get('newPassword'),
            'first_name': data.get('firstName'),
            'last_name': data.get('lastName'),
            'username': username
        }

        print("Processed registration data:", registration_data)

        # Validate input
        validated_data = user_create_schema.load(registration_data)
        print("Validation passed:", validated_data)

        # Check if email or username already exist
        if User.query.filter_by(email=validated_data['email']).first():
            return jsonify({"error": "Email already registered"}), 409
        if User.query.filter_by(username=validated_data['username']).first():
            return jsonify({"error": "Username already taken"}), 409

        # Create and save new user
        new_user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],  # Assumes hashing in model
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow()
        )

        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=str(new_user.id))

        return jsonify({
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "email": new_user.email,
                "username": new_user.username
            },
            "access_token": access_token
        }), 201

    except ValidationError as ve:
        print("Validation error:", ve.messages)
        return jsonify({"error": "Validation failed", "details": ve.messages}), 422

    except Exception as e:
        db.session.rollback()
        print("Registration error:", str(e))
        return jsonify({"error": "Registration failed", "details": str(e)}), 500

# ----------------------
# Login Route
# ----------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    try:
        data = request.get_json()

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({
                "error": "Missing credentials",
                "required": {"email": "string", "password": "string"}
            }), 400

        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.verify_password(password):
            return jsonify({"error": "Invalid password"}), 401

        # Update last login timestamp
        user.update_last_login()
        db.session.commit()

        # ✅ FIX: ensure identity is a string
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user_id": user.id,
            "username": user.username
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Login failed",
            "details": str(e)
        }), 500
