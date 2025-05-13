from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash
from datetime import datetime
from app.extensions import db
from app.models.user import User
from typing import Dict, Any


user_bp = Blueprint('users', __name__, url_prefix='/api/users')


# Helper function for validation
def validate_user_data(data: Dict[str, Any], is_update: bool = False) -> Dict[str, Any]:
    errors = {}
   
    if not is_update or 'username' in data:
        if not data.get('username'):
            errors['username'] = 'Username is required'
        elif len(data['username']) > 50:
            errors['username'] = 'Username must be 50 characters or less'
   
    if not is_update or 'email' in data:
        if not data.get('email'):
            errors['email'] = 'Email is required'
        elif '@' not in data['email']:
            errors['email'] = 'Valid email is required'
   
    if not is_update or 'password' in data:
        if not is_update and not data.get('password'):
            errors['password'] = 'Password is required'
        elif data.get('password') and len(data['password']) < 8:
            errors['password'] = 'Password must be at least 8 characters'
   
    return errors


# CREATE - Register new user
@user_bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json()
   
    # Validate input
    errors = validate_user_data(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
   
    # Check for existing user
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
   
    try:
        new_user = User(
            username=data['username'],
            email=data['email'],
            bio=data.get('bio', ''),
            avatar_url=data.get('avatar_url', 'default-avatar.png'),
            is_admin=data.get('is_admin', False),
            is_active=data.get('is_active', True)
        )
        new_user.password = data['password']  # Uses the password setter
       
        db.session.add(new_user)
        db.session.commit()
       
        return jsonify(new_user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'User creation failed', 'details': str(e)}), 500


# READ - Get all users (with pagination)
# READ - Get all users (without pagination)
@user_bp.route('/', methods=['GET'])
def get_users():
    try:
        include_rels = request.args.get('include_relationships', 'false').lower() == 'true'
       
        # Get all users without pagination
        users = User.query.all()
       
        return jsonify({
            'users': [user.to_dict(include_relationships=include_rels) for user in users],
            'total': len(users)
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch users', 'details': str(e)}), 500
# READ - Get single user
@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
       
        include_rels = request.args.get('include_relationships', 'false').lower() == 'true'
        return jsonify(user.to_dict(include_relationships=include_rels)), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user', 'details': str(e)}), 500


# UPDATE - Update user
@user_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
       
        data = request.get_json()
       
        # Validate input
        errors = validate_user_data(data, is_update=True)
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
       
        # Check for duplicate username/email
        if 'username' in data and data['username'] != user.username:
            if User.query.filter(User.id != user_id, User.username == data['username']).first():
                return jsonify({'error': 'Username already exists'}), 409
       
        if 'email' in data and data['email'] != user.email:
            if User.query.filter(User.id != user_id, User.email == data['email']).first():
                return jsonify({'error': 'Email already exists'}), 409
       
        # Update fields
        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']
        if 'password' in data:
            user.password = data['password']
        if 'bio' in data:
            user.bio = data['bio']
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
        if 'is_admin' in data:
            user.is_admin = data['is_admin']
        if 'is_active' in data:
            user.is_active = data['is_active']
       
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'User update failed', 'details': str(e)}), 500


# DELETE - Delete user
@user_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
       
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'User deletion failed', 'details': str(e)}), 500


# Additional endpoints for user management
@user_bp.route('/<int:user_id>/activate', methods=['PATCH'])
def activate_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
       
        user.is_active = True
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Activation failed', 'details': str(e)}), 500


@user_bp.route('/<int:user_id>/deactivate', methods=['PATCH'])
def deactivate_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
       
        user.is_active = False
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Deactivation failed', 'details': str(e)}), 500


# Serve default avatar
@user_bp.route('/default-avatar', methods=['GET'])
def get_default_avatar():
    return send_from_directory('static', 'default-avatar.png')


# Get user's followers
@user_bp.route('/<int:user_id>/followers', methods=['GET'])
def get_user_followers(user_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
       
        user = User.query.get_or_404(user_id)
        followers_paginated = user.followers.paginate(page=page, per_page=per_page, error_out=False)


        return jsonify({
            'followers': [follower.to_dict() for follower in followers_paginated.items],
            'total': followers_paginated.total,
            'pages': followers_paginated.pages,
            'current_page': followers_paginated.page
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch followers', 'details': str(e)}), 500


# Get users followed by a user
@user_bp.route('/<int:user_id>/following', methods=['GET'])
def get_user_following(user_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
       
        user = User.query.get_or_404(user_id)
        following_paginated = user.following.paginate(page=page, per_page=per_page, error_out=False)


        return jsonify({
            'following': [followed.to_dict() for followed in following_paginated.items],
            'total': following_paginated.total,
            'pages': following_paginated.pages,
            'current_page': following_paginated.page
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch following', 'details': str(e)}), 500

