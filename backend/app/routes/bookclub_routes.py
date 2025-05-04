from flask import Blueprint, request, jsonify
from app.models.bookclub import BookClub, CurrentBook
from app.models.membership import Membership
from app.models.book import Book
from app.models.user import User
from app import db
from datetime import datetime

bookclub_bp = Blueprint('bookclub', __name__)

@bookclub_bp.route('/', methods=['GET'])
def get_all_clubs():
    clubs = BookClub.query.all()
    return jsonify([club.to_dict() for club in clubs]), 200

@bookclub_bp.route('/', methods=['POST'])
def create_club():
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('owner_id'):
        return jsonify({'message': 'Name and owner ID are required'}), 400
    
    owner = User.query.get(data['owner_id'])
    if not owner:
        return jsonify({'message': 'Owner not found'}), 404
    
    club = BookClub(
        name=data['name'],
        synopsis=data.get('synopsis', ''),
        owner_id=data['owner_id']
    )
    
    db.session.add(club)
    db.session.commit()
    
    # Create membership for owner with 'owner' role
    membership = Membership(
        user_id=data['owner_id'],
        bookclub_id=club.id,
        role='owner'
    )
    db.session.add(membership)
    db.session.commit()
    
    return jsonify(club.to_dict()), 201

@bookclub_bp.route('/<int:club_id>', methods=['GET'])
def get_club(club_id):
    club = BookClub.query.get(club_id)
    if not club:
        return jsonify({'message': 'Club not found'}), 404
    
    club_data = club.to_dict()
    club_data['members'] = [membership.user.to_dict() for membership in club.memberships]
    
    if club.currentbook:
        club_data['currentbook'] = {
            'book': club.currentbook.book.to_dict(),
            'start_date': club.currentbook.start_date.isoformat(),
            'end_date': club.currentbook.end_date.isoformat() if club.currentbook.end_date else None
        }
    
    return jsonify(club_data), 200

@bookclub_bp.route('/<int:club_id>', methods=['PUT'])
def update_club(club_id):
    data = request.get_json()
    club = BookClub.query.get(club_id)
    if not club:
        return jsonify({'message': 'Club not found'}), 404
    
    # Check if requester is owner
    owner_membership = Membership.query.filter_by(
        bookclub_id=club_id,
        user_id=club.owner_id,
        role='owner'
    ).first()
    
    if not owner_membership or not data.get('user_id') or data['user_id'] != club.owner_id:
        return jsonify({'message': 'Only the club owner can update the club'}), 403
    
    club.name = data.get('name', club.name)
    club.synopsis = data.get('synopsis', club.synopsis)
    db.session.commit()
    
    return jsonify(club.to_dict()), 200

@bookclub_bp.route('/<int:club_id>', methods=['DELETE'])
def delete_club(club_id):
    data = request.get_json()
    club = BookClub.query.get(club_id)
    if not club:
        return jsonify({'message': 'Club not found'}), 404
    
    # Check if requester is owner
    owner_membership = Membership.query.filter_by(
        bookclub_id=club_id,
        user_id=club.owner_id,
        role='owner'
    ).first()
    
    if not owner_membership or not data or data.get('user_id') != club.owner_id:
        return jsonify({'message': 'Only the club owner can delete the club'}), 403
    
    db.session.delete(club)
    db.session.commit()
    return jsonify({'message': 'Club deleted successfully'}), 200

@bookclub_bp.route('/<int:club_id>/join', methods=['POST'])
def join_club(club_id):
    data = request.get_json()
    
    if not data or not data.get('user_id'):
        return jsonify({'message': 'User ID is required'}), 400
    
    club = BookClub.query.get(club_id)
    if not club:
        return jsonify({'message': 'Club not found'}), 404
    
    user = User.query.get(data['user_id'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    existing_membership = Membership.query.filter_by(
        user_id=data['user_id'],
        bookclub_id=club_id
    ).first()
    
    if existing_membership:
        return jsonify({'message': 'Already a member of this club'}), 400
    
    membership = Membership(
        user_id=data['user_id'],
        bookclub_id=club_id,
        role='member'  # Default role
    )
    
    db.session.add(membership)
    db.session.commit()
    
    return jsonify({
        'message': 'Successfully joined the club',
        'membership': membership.to_dict()
    }), 200

@bookclub_bp.route('/<int:club_id>/current-book', methods=['POST'])
def set_currentbook(club_id):
    data = request.get_json()
    
    if not data or not data.get('book_id') or not data.get('user_id'):
        return jsonify({'message': 'Book ID and user ID are required'}), 400
    
    club = BookClub.query.get(club_id)
    if not club:
        return jsonify({'message': 'Club not found'}), 404
    
    # Check if user is owner or admin
    requester_membership = Membership.query.filter_by(
        bookclub_id=club_id,
        user_id=data['user_id']
    ).first()
    
    if not requester_membership or requester_membership.role not in ['owner', 'admin']:
        return jsonify({'message': 'Only owners or admins can set the current book'}), 403
    
    book = Book.query.get(data['book_id'])
    if not book:
        return jsonify({'message': 'Book not found'}), 404
    
    currentbook = CurrentBook.query.filter_by(bookclub_id=club_id).first()
    if currentbook:
        currentbook.end_date = datetime.utcnow()
    
    new_currentbook = CurrentBook(
        bookclub_id=club_id,
        book_id=data['book_id'],
        start_date=datetime.utcnow()
    )
    
    db.session.add(new_currentbook)
    db.session.commit()
    
    return jsonify({
        'message': 'Current book set successfully',
        'currentbook': new_currentbook.to_dict()
    }), 200

@bookclub_bp.route('/<int:club_id>/members', methods=['GET'])
def get_club_members(club_id):
    memberships = Membership.query.filter_by(bookclub_id=club_id).all()
    return jsonify([membership.to_dict() for membership in memberships]), 200

@bookclub_bp.route('/<int:club_id>/members/<int:user_id>', methods=['PUT'])
def update_member_role(club_id, user_id):
    data = request.get_json()
    
    if not data or not data.get('role') or not data.get('requester_id'):
        return jsonify({'message': 'Role and requester ID are required'}), 400
    
    # Check if requester is owner
    requester_membership = Membership.query.filter_by(
        bookclub_id=club_id,
        user_id=data['requester_id'],
        role='owner'
    ).first()
    
    if not requester_membership:
        return jsonify({'message': 'Only the club owner can update roles'}), 403
    
    membership = Membership.query.filter_by(
        bookclub_id=club_id,
        user_id=user_id
    ).first()
    
    if not membership:
        return jsonify({'message': 'Membership not found'}), 404
    
    membership.role = data['role']
    db.session.commit()
    
    return jsonify(membership.to_dict()), 200