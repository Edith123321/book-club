from flask import Blueprint, request, jsonify
from app.models.bookclub import BookClub, BookClubMember, CurrentBook
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
        description=data.get('description', ''),
        owner_id=data['owner_id']
    )
    
    db.session.add(club)
    db.session.commit()
    
    membership = BookClubMember(
        user_id=data['owner_id'],
        bookclub_id=club.id
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
    club_data['members'] = [member.user.to_dict() for member in club.members]
    
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
    
    if not data.get('owner_id') or data['owner_id'] != club.owner_id:
        return jsonify({'message': 'Only the club owner can update the club'}), 403
    
    club.name = data.get('name', club.name)
    club.description = data.get('description', club.description)
    db.session.commit()
    
    return jsonify(club.to_dict()), 200

@bookclub_bp.route('/<int:club_id>', methods=['DELETE'])
def delete_club(club_id):
    data = request.get_json()
    club = BookClub.query.get(club_id)
    if not club:
        return jsonify({'message': 'Club not found'}), 404
    
    if not data or data.get('owner_id') != club.owner_id:
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
    
    existing_member = BookClubMember.query.filter_by(
        user_id=data['user_id'],
        bookclub_id=club_id
    ).first()
    
    if existing_member:
        return jsonify({'message': 'Already a member of this club'}), 400
    
    membership = BookClubMember(
        user_id=data['user_id'],
        bookclub_id=club_id
    )
    
    db.session.add(membership)
    db.session.commit()
    
    return jsonify({'message': 'Successfully joined the club'}), 200

@bookclub_bp.route('/<int:club_id>/current-book', methods=['POST'])
def set_currentbook(club_id):
    data = request.get_json()
    
    if not data or not data.get('book_id') or not data.get('owner_id'):
        return jsonify({'message': 'Book ID and owner ID are required'}), 400
    
    club = BookClub.query.get(club_id)
    if not club:
        return jsonify({'message': 'Club not found'}), 404
    
    if club.owner_id != data['owner_id']:
        return jsonify({'message': 'Only the club owner can set the current book'}), 403
    
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
