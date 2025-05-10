from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from app.models.bookclub import BookClub
from app.models.membership import Membership
from app.models.book import Book
from app.models.user import User
from app.extensions import db
from sqlalchemy.orm import joinedload

bookclub_bp = Blueprint('bookclub', __name__)

# ---------- Helper Functions ----------

def validate_required_fields(data, required_fields):
    """Validate presence of required fields"""
    missing = [field for field in required_fields if field not in data or data[field] is None]
    if missing:
        return jsonify({
            'message': f'Missing required fields: {", ".join(missing)}'
        }), 400
    return None

def get_or_404(model, instance_id, description="Resource"):
    """Get instance or return 404 response"""
    instance = model.query.get(instance_id)
    if not instance:
        current_app.logger.warning(f'{description} not found: ID {instance_id}')
        return None
    return instance

# ---------- Book Club Routes ----------

@bookclub_bp.route('/', methods=['GET'])
def get_all_clubs():
    """Get all book clubs with detailed information"""
    try:
        clubs = BookClub.query.options(
            joinedload(BookClub.memberships),
            joinedload(BookClub.owner)
        ).all()
        
        clubs_data = [{
            'id': club.id,
            'name': club.name,
            'synopsis': club.synopsis,
            'created_at': club.created_at.isoformat() if club.created_at else None,
            'owner_id': club.owner_id,
            'member_count': len(club.memberships),
            'current_book': club.current_book,
            'status': club.status
        } for club in clubs]
        
        return jsonify({'bookclubs': clubs_data}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching clubs: {str(e)}", exc_info=True)
        return jsonify({'message': 'Failed to fetch clubs'}), 500

@bookclub_bp.route('/', methods=['POST'])
def create_club():
    """Create a new book club"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No input data provided'}), 400
    
    # Validate required fields
    required_fields = ['name', 'owner_id']
    if error_response := validate_required_fields(data, required_fields):
        return error_response

    try:
        # Verify owner exists
        owner = get_or_404(User, data['owner_id'], 'Owner user')
        if not owner:
            return jsonify({'message': 'Owner user not found'}), 404

        # Create new club
        new_club = BookClub(
            name=data['name'],
            synopsis=data.get('synopsis'),
            status=data.get('status', 'Active'),
            owner_id=data['owner_id'],
            current_book=data.get('current_book')
        )
        
        db.session.add(new_club)
        db.session.flush()  # Get the ID before commit

        # Add owner as admin member
        db.session.add(Membership(
            user_id=data['owner_id'],
            bookclub_id=new_club.id,
            role='admin'
        ))

        # Add other members if specified
        if 'members' in data:
            for member_data in data['members']:
                if member_data.get('user_id') != data['owner_id']:
                    db.session.add(Membership(
                        user_id=member_data['user_id'],
                        bookclub_id=new_club.id,
                        role=member_data.get('role', 'member')
                    ))

        db.session.commit()
        
        return jsonify({
            'message': 'Book club created successfully',
            'club': new_club.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating club: {str(e)}", exc_info=True)
        return jsonify({
            'message': 'Failed to create club',
            'error': str(e) if current_app.config['DEBUG'] else None
        }), 500

@bookclub_bp.route('/<int:club_id>', methods=['GET'])
def get_club(club_id):
    """Get detailed information about a specific club"""
    try:
        club = BookClub.query.options(
            joinedload(BookClub.memberships).joinedload(Membership.user),
            joinedload(BookClub.owner)
        ).get(club_id)
        
        if not club:
            return jsonify({'message': 'Book club not found'}), 404

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
            'members': [{
                'user_id': m.user_id,
                'username': m.user.username,
                'role': m.role,
                'joined_at': m.joined_at.isoformat() if m.joined_at else None
            } for m in club.memberships],
            'current_book': club.current_book,
            'member_count': len(club.memberships)
        }

        return jsonify(response_data), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching club {club_id}: {str(e)}", exc_info=True)
        return jsonify({'message': 'Failed to fetch club'}), 500

@bookclub_bp.route('/<int:club_id>', methods=['PUT'])
def update_club(club_id):
    """Update book club details"""
    club = get_or_404(BookClub, club_id, 'Book Club')
    if not club:
        return jsonify({'message': 'Book club not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No update data provided'}), 400

    try:
        if 'name' in data:
            club.name = data['name']
        if 'synopsis' in data:
            club.synopsis = data['synopsis']
        if 'status' in data:
            club.status = data['status']
        
        if 'owner_id' in data:
            new_owner = get_or_404(User, data['owner_id'], 'User')
            if not new_owner:
                return jsonify({'message': 'New owner not found'}), 404
            club.owner_id = data['owner_id']

        if 'current_book' in data:
            club.current_book = data['current_book']

        club.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Club updated successfully',
            'club': club.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating club {club_id}: {str(e)}", exc_info=True)
        return jsonify({
            'message': 'Failed to update club',
            'error': str(e) if current_app.config['DEBUG'] else None
        }), 500

@bookclub_bp.route('/<int:club_id>', methods=['DELETE'])
def delete_club(club_id):
    """Delete a book club and its associations"""
    club = get_or_404(BookClub, club_id, 'Book Club')
    if not club:
        return jsonify({'message': 'Book club not found'}), 404

    try:
        # Delete associated memberships
        Membership.query.filter_by(bookclub_id=club_id).delete()
        db.session.delete(club)
        db.session.commit()

        return jsonify({'message': 'Club deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting club {club_id}: {str(e)}", exc_info=True)
        return jsonify({
            'message': 'Failed to delete club',
            'error': str(e) if current_app.config['DEBUG'] else None
        }), 500

# ... (keep current_book specific routes as they are)