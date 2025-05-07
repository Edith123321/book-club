from flask import Blueprint, jsonify
from app import db
from app.models.membership import Membership
from app.models.user import User
from app.models.book import Book

# Since BookClub model is missing, we will define a simple BookClub model here for demonstration
# In a real scenario, this should be properly defined in models/book_club.py

from app.models.book_club import BookClub

book_club_bp = Blueprint('book_club', __name__, url_prefix='/bookclubs')

@book_club_bp.route('/', methods=['GET'])
def get_book_clubs():
    try:
        book_clubs = BookClub.query.all()
        return jsonify([club.to_dict() for club in book_clubs]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch book clubs", "details": str(e)}), 500

@book_club_bp.route('/<int:id>', methods=['GET'])
def get_book_club(id):
    try:
        club = BookClub.query.get(id)
        if club:
            return jsonify(club.to_dict()), 200
        return jsonify({"error": "Book club not found"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to fetch book club", "details": str(e)}), 500
