from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app.models.user import User
from app.extensions import db  # ✅ CORRECT
from datetime import datetime
from app.utils import validate_email, validate_password, validate_username
from marshmallow import ValidationError
from app.schemas.user_schema import user_create_schema

auth_bp = Blueprint('auth', __name__)

# ----------------------
# Register Route
# ----------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    try:
        data = request.get_json()

        required_fields = ['username', 'email', 'password']
        if not all(field in data for field in required_fields):
            return jsonify({
                "error": "Missing fields",
                "required": required_fields
            }), 400

        # Validate using schema
        user_create_schema.load(data)

        # Check if email or username already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already registered"}), 409

        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Username already taken"}), 409

        # Create user — model will hash password via setter
        new_user = User(
            username=data['username'],
            email=data['email'],
            password=data['password']  # auto-hashed in model
        )

        db.session.add(new_user)
        db.session.commit()

        return jsonify({
            "message": "User registered successfully",
            "user_id": new_user.id,
            "username": new_user.username
        }), 201

    except ValidationError as ve:
        return jsonify({"error": "Validation error", "messages": ve.messages}), 422
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Registration failed",
            "details": str(e)
        }), 500


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

        access_token = create_access_token(identity=user.id)

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