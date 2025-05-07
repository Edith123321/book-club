from flask import Blueprint, request, jsonify
from app.models.bookclub import BookClub, CurrentBook
from app.models.membership import Membership
from app.models.book import Book
from app.models.user import User
from app import db
from datetime import datetime

bookclub_bp = Blueprint('bookclub', __name__)

# ---------- Helper Functions ----------

def get_instance_or_404(model, id, name='Resource'):
    instance = model.query.get(id)
    if not instance:
        return jsonify({'message': f'{name} not found'}), 404
    return instance

def commit_session():
    try:
        db.session.commit()
        return None
    except Exception as e:
        db.session.rollback()
        return str(e)

# ---------- Routes ----------

@bookclub_bp.route('/', methods=['GET'])
def get_all_clubs():
    try:
        print("Attempting to query all book clubs...")  # Debug
        clubs = BookClub.query.all()
        print(f"Found {len(clubs)} clubs")  # Debug
        
        clubs_data = []
        for club in clubs:
            try:
                print(f"Processing club {club.id}")  # Debug
                club_data = {
                    'id': club.id,
                    'name': club.name,
                    # Add other basic fields here
                }
                
                # Safely add relationships if they exist
                if hasattr(club, 'creator'):
                    club_data['creator_id'] = club.user_id
                
                clubs_data.append(club_data)
                
            except Exception as e:
                print(f"Error processing club {getattr(club, 'id', 'unknown')}: {str(e)}")
                continue
                
        return jsonify(clubs_data), 200
        
    except Exception as e:
        import traceback
        print("Full error traceback:")
        print(traceback.format_exc())
        return jsonify({
            'message': 'Failed to fetch clubs',
            'error': str(e),
            'details': 'Check server logs for more information'
        }), 500
@bookclub_bp.route('/', methods=['POST'])
def create_club():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'creator_id']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({'message': f'Missing required fields: {", ".join(missing_fields)}'}), 400

        # Check if user exists
        creator = User.query.get(data['creator_id'])
        if not creator:
            return jsonify({'message': f'User with ID {data["creator_id"]} not found'}), 404

        # Create the book club
        new_club = BookClub(
            name=data['name'],
            synopsis=data.get('synopsis'),
            status=data.get('status', 'Active'),
            creator_id=data['creator_id']
        )
        db.session.add(new_club)
        db.session.flush()  # Get the ID before commit

        # Create admin membership for creator
        membership = Membership(
            user_id=data['creator_id'],
            bookclub_id=new_club.id,
            role='admin'
        )
        db.session.add(membership)

        # Handle additional members if provided
        if 'memberships' in data:
            for member in data['memberships']:
                if member['user_id'] != data['creator_id']:  # Don't duplicate creator
                    db.session.add(Membership(
                        user_id=member['user_id'],
                        bookclub_id=new_club.id,
                        role=member.get('role', 'member')
                    ))

        db.session.commit()

        return jsonify({
            'message': 'Club created successfully',
            'club': {
                'id': new_club.id,
                'name': new_club.name,
                'creator_id': new_club.creator_id,
                'status': new_club.status
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'message': 'Failed to create club',
            'error': str(e)
        }), 500
    
    
@bookclub_bp.route('/<int:club_id>', methods=['PUT'])
def update_club(club_id):
    data = request.get_json()
    club = BookClub.query.get(club_id)
    if not club:
        return jsonify({'message': 'Club not found'}), 404

    try:
        club.name = data.get('name', club.name)
        club.synopsis = data.get('synopsis', club.synopsis)
        club.status = data.get('status', club.status)

        if 'user_id' in data:
            new_owner = User.query.get(data['user_id'])
            if not new_owner:
                return jsonify({'message': 'New owner user not found'}), 404
            club.user_id = data['user_id']

        club.updated_at = datetime.utcnow()
        error = commit_session()
        if error:
            return jsonify({'message': 'Failed to update club', 'error': error}), 500

        return jsonify(club.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error updating club', 'error': str(e)}), 500

@bookclub_bp.route('/<int:club_id>', methods=['DELETE'])
def delete_club(club_id):
    club = BookClub.query.get(club_id)
    if not club:
        return jsonify({'message': 'Club not found'}), 404

    try:
        Membership.query.filter_by(bookclub_id=club_id).delete()
        CurrentBook.query.filter_by(bookclub_id=club_id).delete()
        db.session.delete(club)

        error = commit_session()
        if error:
            return jsonify({'message': 'Failed to delete club', 'error': error}), 500

        return jsonify({'message': 'Club deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error deleting club', 'error': str(e)}), 500

@bookclub_bp.route('/<int:club_id>/current-book', methods=['POST'])
def set_current_book(club_id):
    data = request.get_json()
    book_id = data.get('book_id')
    if not book_id:
        return jsonify({'message': 'Book ID is required'}), 400

    club = BookClub.query.get(club_id)
    book = Book.query.get(book_id)
    if not club or not book:
        return jsonify({'message': 'Club or Book not found'}), 404

    try:
        existing = CurrentBook.query.filter_by(bookclub_id=club_id).first()
        if existing:
            existing.end_date = datetime.utcnow()

        new_current = CurrentBook(
            bookclub_id=club_id,
            book_id=book_id,
            start_date=datetime.utcnow()
        )
        db.session.add(new_current)

        error = commit_session()
        if error:
            return jsonify({'message': 'Failed to set current book', 'error': error}), 500

        return jsonify({
            'message': 'Current book set successfully',
            'currentbook': new_current.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'message': 'Error setting current book', 'error': str(e)}), 500

@bookclub_bp.route('/<int:club_id>/members', methods=['GET'])
def get_club_members(club_id):
    club = BookClub.query.get(club_id)
    if not club:
        return jsonify({'message': 'Club not found'}), 404

    try:
        memberships = Membership.query.filter_by(bookclub_id=club_id).all()
        return jsonify([m.to_dict() for m in memberships]), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch members', 'error': str(e)}), 500

@bookclub_bp.route('/<int:club_id>/members', methods=['POST'])
def add_member(club_id):
    data = request.get_json()
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    club = BookClub.query.get(club_id)
    user = User.query.get(user_id)
    if not club or not user:
        return jsonify({'message': 'Club or User not found'}), 404

    if Membership.query.filter_by(bookclub_id=club_id, user_id=user_id).first():
        return jsonify({'message': 'User already a member'}), 400

    try:
        membership = Membership(
            user_id=user_id,
            bookclub_id=club_id,
            role=data.get('role', 'member')
        )
        db.session.add(membership)

        error = commit_session()
        if error:
            return jsonify({'message': 'Failed to add member', 'error': error}), 500

        return jsonify({'message': 'Member added', 'membership': membership.to_dict()}), 201
    except Exception as e:
        return jsonify({'message': 'Error adding member', 'error': str(e)}), 500

@bookclub_bp.route('/<int:club_id>/members/<int:user_id>', methods=['DELETE'])
def remove_member(club_id, user_id):
    membership = Membership.query.filter_by(bookclub_id=club_id, user_id=user_id).first()
    if not membership:
        return jsonify({'message': 'Membership not found'}), 404

    try:
        db.session.delete(membership)
        error = commit_session()
        if error:
            return jsonify({'message': 'Failed to remove member', 'error': error}), 500

        return jsonify({'message': 'Member removed'}), 200
    except Exception as e:
        return jsonify({'message': 'Error removing member', 'error': str(e)}), 500
