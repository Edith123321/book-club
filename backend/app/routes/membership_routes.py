from flask import Blueprint, request, jsonify
from app import db
from app.models.membership import Membership
from app.models.user import User
from app.models.book_club import BookClub
from app.schemas.membership_schema import membership_schema, memberships_schema

from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

membership_bp = Blueprint('membership_bp', __name__, url_prefix='/memberships')

# Create a new membership (user joins a book club)
@membership_bp.route('/', methods=['POST'])
def create_membership():
    data = request.get_json()

    user_id = data.get('user_id')
    book_club_id = data.get('book_club_id')

    # Ensure user and book club exist
    user = User.query.get_or_404(user_id)
    book_club = BookClub.query.get_or_404(book_club_id)

    new_membership = Membership(
        user_id=user_id,
        book_club_id=book_club_id
    )

    db.session.add(new_membership)
    db.session.commit()

    return membership_schema.jsonify(new_membership), 201

# Get all memberships (for admin view, for example)
@membership_bp.route('/', methods=['GET'])
def get_memberships():
    memberships = Membership.query.all()
    return memberships_schema.jsonify(memberships), 200

# Get a specific membership by ID
@membership_bp.route('/<int:id>', methods=['GET'])
def get_membership(id):
    membership = Membership.query.get_or_404(id)
    return membership_schema.jsonify(membership), 200

# Update membership (e.g., changing the book club for a user)
@membership_bp.route('/<int:id>', methods=['PUT'])
def update_membership(id):
    membership = Membership.query.get_or_404(id)
    data = request.get_json()

    # Update fields based on input, e.g., change book club
    book_club_id = data.get('book_club_id', membership.book_club_id)

    # Ensure the new book club exists
    book_club = BookClub.query.get_or_404(book_club_id)

    membership.book_club_id = book_club_id

    db.session.commit()
    return membership_schema.jsonify(membership), 200

# Delete a membership (e.g., user leaves a book club)
@membership_bp.route('/<int:id>', methods=['DELETE'])
def delete_membership(id):
    membership = Membership.query.get_or_404(id)
    db.session.delete(membership)
    db.session.commit()
    return jsonify({'message': 'Membership deleted'}), 200

@membership_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_memberships():
    current_user_id = get_jwt_identity()
    memberships = Membership.query.filter_by(user_id=current_user_id).all()
    book_clubs = []
    for membership in memberships:
        club = membership.book_club
        if club:
            book_clubs.append({
                'id': club.id,
                'bookClubName': club.bookClubName,
                'description': club.description,
                'genres': club.genres.split(',') if club.genres else [],
                'currentBook': club.currentBook.to_dict() if club.currentBook else None,
                'members': [m.user_id for m in Membership.query.filter_by(book_club_id=club.id).all()]
            })
    return jsonify(book_clubs), 200
