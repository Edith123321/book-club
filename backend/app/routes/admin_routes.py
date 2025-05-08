from flask import Blueprint, request, jsonify 
from ..models import User, BookClub, Summary, Membership
from app.extensions import db  # ✅ CORRECT
from ..middleware import token_required, admin_required
from datetime import datetime
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)

# --------------------------
# User CRUD Operations
# --------------------------

@admin_bp.route('/users', methods=['GET'])
@token_required
@admin_required
def get_all_users(current_user):
    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@token_required
@admin_required
def get_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict()), 200

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@token_required
@admin_required
def update_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if 'username' in data:
        if User.query.filter(User.username == data['username'], User.id != user_id).first():
            return jsonify({'error': 'Username already taken'}), 400
        user.username = data['username']

    if 'email' in data:
        if User.query.filter(User.email == data['email'], User.id != user_id).first():
            return jsonify({'error': 'Email already registered'}), 400
        user.email = data['email']

    if 'is_admin' in data:
        user.is_admin = bool(data['is_admin'])

    db.session.commit()
    return jsonify(user.to_dict()), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_user(current_user, user_id):
    if current_user.id == user_id:
        return jsonify({'error': 'Cannot delete yourself'}), 400

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200

# --------------------------
# Book Club CRUD Operations
# --------------------------

@admin_bp.route('/book-clubs', methods=['GET'])
@token_required
@admin_required
def get_all_bookclubs(current_user):
    bookclubs = BookClub.query.all()
    result = []
    for club in bookclubs:
        result.append({
            'id': club.id,
            'name': club.name,
            'description': club.description,
            'created_at': club.created_at.isoformat(),
            'member_count': len(club.members),
            'book_count': len(club.books)
        })
    return jsonify(result), 200

@admin_bp.route('/book-clubs/<int:club_id>', methods=['GET'])
@token_required
@admin_required
def get_bookclub(current_user, club_id):
    club = BookClub.query.get_or_404(club_id)
    return jsonify({
        'id': club.id,
        'name': club.name,
        'description': club.description,
        'created_at': club.created_at.isoformat(),
        'members': [{'id': m.id, 'username': m.username} for m in club.members],
        'books': [{
            'id': b.id,
            'title': b.book_title,
            'author': b.book_author,
            'read_at': b.read_at.isoformat() if b.read_at else None
        } for b in club.books]
    }), 200

@admin_bp.route('/book-clubs/<int:club_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_bookclub(current_user, club_id):
    club = BookClub.query.get_or_
