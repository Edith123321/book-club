from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from app.models.bookclub import BookClub, CurrentBook
from app.models.membership import Membership
from app.models.book import Book
from app.models.user import User
from app.extensions import db

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
        current_app.logger.error(f"Database error: {str(e)}")
        return str(e)

def validate_required_fields(data, required_fields):
    """Validate presence of required fields"""
    missing = [field for field in required_fields if field not in data or data[field] is None]
    if missing:
        return jsonify({
            'message': f'Missing required fields: {", ".join(missing)}'
        }), 400
    return None

# ---------- Book Club Routes ----------

@bookclub_bp.route('/', methods=['GET'])
def get_all_clubs():
    """Get all book clubs with detailed information"""
    try:
        clubs = BookClub.query.options(
            db.joinedload(BookClub.memberships),
            db.joinedload(BookClub.currentbook)
        ).all()
        
        clubs_data = []
        for club in clubs:
            club_data = {
                'id': club.id,
                'name': club.name,
                'owner_id': club.owner_id,
                'synopsis': club.synopsis,
                'status': club.status,
                'created_at': club.created_at.isoformat() if club.created_at else None,
                'member_count': len(club.memberships),
                'current_book': club.currentbook.to_dict() if club.currentbook else None
            }
            clubs_data.append(club_data)
        
        return jsonify({'clubs': clubs_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching clubs: {str(e)}")
        return jsonify({
            'message': 'An error occurred while fetching clubs',
            'error': str(e)
        }), 500

@bookclub_bp.route('/', methods=['POST'])
def create_club():
    """Create a new book club"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No input data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'owner_id']
        if error_response := validate_required_fields(data, required_fields):
            return error_response

        # Verify owner exists
        owner = User.query.get(data['owner_id'])
        if not owner:
            return jsonify({'message': 'Owner user not found'}), 404

        # Create new club
        new_club = BookClub(
            name=data['name'],
            synopsis=data.get('synopsis'),
            status=data.get('status', 'Active'),
            owner_id=data['owner_id']
        )
        
        db.session.add(new_club)
        db.session.flush()  # Get the ID before commit

        # Add owner as admin member
        new_membership = Membership(
            user_id=data['owner_id'],
            bookclub_id=new_club.id,
            role='admin'
        )
        db.session.add(new_membership)

        # Add other members if specified
        for member_data in data.get('members', []):
            if member_data['user_id'] != data['owner_id']:
                Membership.create_member(
                    user_id=member_data['user_id'],
                    bookclub_id=new_club.id,
                    role=member_data.get('role', 'member')
                )

        if error := commit_session():
            return jsonify({'message': 'Database error', 'error': error}), 500

        return jsonify({
            'message': 'Book club created successfully',
            'club': new_club.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating club: {str(e)}")
        return jsonify({
            'message': 'An error occurred while creating the club',
            'error': str(e)
        }), 500

@bookclub_bp.route('/<int:club_id>', methods=['GET'])
def get_club(club_id):
    """Get detailed information about a specific club"""
    try:
        club = BookClub.query.options(
            db.joinedload(BookClub.memberships),
            db.joinedload(BookClub.currentbook).joinedload(CurrentBook.book),
            db.joinedload(BookClub.owner)
        ).get(club_id)
        
        if not club:
            return jsonify({'message': 'Book club not found'}), 404

        members = [{
            'user_id': m.user_id,
            'role': m.role,
            'joined_at': m.joined_at.isoformat() if m.joined_at else None
        } for m in club.memberships]

        response_data = {
            'id': club.id,
            'name': club.name,
            'synopsis': club.synopsis,
            'status': club.status,
            'created_at': club.created_at.isoformat(),
            'owner': {
                'id': club.owner.id,
                'username': club.owner.username
            },
            'members': members,
            'current_book': club.currentbook.to_dict() if club.currentbook else None,
            'member_count': len(members)
        }

        return jsonify(response_data), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching club {club_id}: {str(e)}")
        return jsonify({
            'message': 'An error occurred while fetching the club',
            'error': str(e)
        }), 500

@bookclub_bp.route('/<int:club_id>', methods=['PUT'])
def update_club(club_id):
    """Update book club details"""
    club, error_response = get_instance_or_404(BookClub, club_id, 'Book Club')
    if error_response:
        return error_response

    try:
        data = request.get_json()
        club.name = data.get('name', club.name)
        club.synopsis = data.get('synopsis', club.synopsis)
        club.status = data.get('status', club.status)
        
        if 'owner_id' in data:
            new_owner, error_response = get_instance_or_404(User, data['owner_id'], 'User')
            if error_response:
                return error_response
            club.owner_id = data['owner_id']

        club.updated_at = datetime.utcnow()

        if error := commit_session():
            return jsonify({'message': 'Failed to update club', 'error': error}), 500

        return jsonify({
            'message': 'Club updated successfully',
            'club': club.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating club {club_id}: {str(e)}")
        return jsonify({
            'message': 'An error occurred while updating the club',
            'error': str(e)
        }), 500

@bookclub_bp.route('/<int:club_id>', methods=['DELETE'])
def delete_club(club_id):
    """Delete a book club and its associations"""
    club, error_response = get_instance_or_404(BookClub, club_id, 'Book Club')
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
        current_app.logger.error(f"Error deleting club {club_id}: {str(e)}")
        return jsonify({
            'message': 'An error occurred while deleting the club',
            'error': str(e)
        }), 500