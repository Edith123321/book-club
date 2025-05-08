from flask import Blueprint, request, jsonify
from datetime import datetime
from app.models.bookclub import BookClub, CurrentBook
from app.models.membership import Membership
from app.models.book import Book
from app.models.user import User
from app.extensions import db  # ✅ CORRECT
from datetime import datetime
from app import db

bookclub_bp = Blueprint('bookclub', __name__)

# ---------- Helper Functions ----------

def get_instance_or_404(model, instance_id, name='Resource'):
    """Fetch instance or return 404 response"""
    instance = model.query.get(instance_id)
    if not instance:
        return None, jsonify({'message': f'{name} not found'}), 404
    return instance, None

def commit_session():
    """Commit database session with error handling"""
    try:
        db.session.commit()
        return None
    except Exception as e:
        db.session.rollback()
        return str(e)

def validate_required_fields(data, required_fields):
    """Validate presence of required fields"""
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({
            'message': f'Missing required fields: {", ".join(missing)}'
        }), 400
    return None

# ---------- Book Club Routes ----------

@bookclub_bp.route('/', methods=['GET'])
def get_all_clubs():
    """Get all book clubs with basic information"""
    try:
        clubs = BookClub.query.all()
        clubs_data = [{
            'id': club.id,
            'name': club.name,
            'creator_id': club.creator_id,
            'status': club.status
        } for club in clubs]
        
        return jsonify(clubs_data), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Failed to fetch clubs',
            'error': str(e)
        }), 500

@bookclub_bp.route('/', methods=['POST'])
def create_club():
    """Create a new book club"""
    try:
        data = request.get_json()
        
        # Validate input
        if error_response := validate_required_fields(data, ['name', 'creator_id']):
            return error_response

        creator, error_response = get_instance_or_404(User, data['creator_id'], 'User')
        if error_response:
            return error_response

        # Create book club
        new_club = BookClub(
            name=data['name'],
            synopsis=data.get('synopsis'),
            status=data.get('status', 'Active'),
            creator_id=data['creator_id']
        )
        db.session.add(new_club)
        db.session.flush()

        # Add creator as admin
        Membership.create_admin(
            user_id=data['creator_id'],
            bookclub_id=new_club.id
        )

        # Add other members if specified
        for member in data.get('memberships', []):
            if member['user_id'] != data['creator_id']:
                Membership.create_member(
                    user_id=member['user_id'],
                    bookclub_id=new_club.id,
                    role=member.get('role', 'member')
                )

        if error := commit_session():
            return jsonify({'message': 'Failed to create club', 'error': error}), 500

        return jsonify({
            'message': 'Club created successfully',
            'club': new_club.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Failed to create club',
            'error': str(e)
        }), 500

@bookclub_bp.route('/<int:club_id>', methods=['PUT'])
def update_club(club_id):
    """Update book club details"""
    club, error_response = get_instance_or_404(BookClub, club_id)
    if error_response:
        return error_response

    try:
        data = request.get_json()
        club.name = data.get('name', club.name)
        club.synopsis = data.get('synopsis', club.synopsis)
        club.status = data.get('status', club.status)
        club.updated_at = datetime.utcnow()

        if 'user_id' in data:
            new_owner, error_response = get_instance_or_404(User, data['user_id'], 'User')
            if error_response:
                return error_response
            club.creator_id = data['user_id']

        if error := commit_session():
            return jsonify({'message': 'Failed to update club', 'error': error}), 500

        return jsonify(club.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating club', 'error': str(e)}), 500

@bookclub_bp.route('/<int:club_id>', methods=['DELETE'])
def delete_club(club_id):
    """Delete a book club and its associations"""
    club, error_response = get_instance_or_404(BookClub, club_id)
    if error_response:
        return error_response

    try:
        # Delete associated records
        Membership.query.filter_by(bookclub_id=club_id).delete()
        CurrentBook.query.filter_by(bookclub_id=club_id).delete()
        db.session.delete(club)

        if error := commit_session():
            return jsonify({'message': 'Failed to delete club', 'error': error}), 500

        return jsonify({'message': 'Club deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error deleting club', 'error': str(e)}), 500

# ---------- Current Book Routes ----------

@bookclub_bp.route('/<int:club_id>/current-book', methods=['POST'])
def set_current_book(club_id):
    """Set the current book for a club"""
    club, error_response = get_instance_or_404(BookClub, club_id)
    if error_response:
        return error_response

    data = request.get_json()
    if error_response := validate_required_fields(data, ['book_id']):
        return error_response

    book, error_response = get_instance_or_404(Book, data['book_id'], 'Book')
    if error_response:
        return error_response

    try:
        # End previous current book if exists
        if current := CurrentBook.get_current(club_id):
            current.end_date = datetime.utcnow()

        # Set new current book
        new_current = CurrentBook(
            bookclub_id=club_id,
            book_id=data['book_id'],
            start_date=datetime.utcnow()
        )
        db.session.add(new_current)

        if error := commit_session():
            return jsonify({'message': 'Failed to set current book', 'error': error}), 500

        return jsonify({
            'message': 'Current book set successfully',
            'current_book': new_current.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error setting current book', 'error': str(e)}), 500

# ---------- Membership Routes ----------

@bookclub_bp.route('/<int:club_id>/members', methods=['GET'])
def get_club_members(club_id):
    """Get all members of a book club"""
    club, error_response = get_instance_or_404(BookClub, club_id)
    if error_response:
        return error_response

    try:
        memberships = Membership.query.filter_by(bookclub_id=club_id).all()
        return jsonify([m.to_dict() for m in memberships]), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch members', 'error': str(e)}), 500

@bookclub_bp.route('/<int:club_id>/members', methods=['POST'])
def add_member(club_id):
    """Add a member to a book club"""
    club, error_response = get_instance_or_404(BookClub, club_id)
    if error_response:
        return error_response

    data = request.get_json()
    if error_response := validate_required_fields(data, ['user_id']):
        return error_response

    user, error_response = get_instance_or_404(User, data['user_id'], 'User')
    if error_response:
        return error_response

    if Membership.exists(club_id, data['user_id']):
        return jsonify({'message': 'User already a member'}), 400

    try:
        membership = Membership(
            user_id=data['user_id'],
            bookclub_id=club_id,
            role=data.get('role', 'member')
        )
        db.session.add(membership)

        if error := commit_session():
            return jsonify({'message': 'Failed to add member', 'error': error}), 500

        return jsonify({
            'message': 'Member added',
            'membership': membership.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error adding member', 'error': str(e)}), 500

@bookclub_bp.route('/<int:club_id>/members/<int:user_id>', methods=['DELETE'])
def remove_member(club_id, user_id):
    """Remove a member from a book club"""
    membership = Membership.query.filter_by(
        bookclub_id=club_id,
        user_id=user_id
    ).first()

    if not membership:
        return jsonify({'message': 'Membership not found'}), 404

    try:
        db.session.delete(membership)
        if error := commit_session():
            return jsonify({'message': 'Failed to remove member', 'error': error}), 500

        return jsonify({'message': 'Member removed'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error removing member', 'error': str(e)}), 500