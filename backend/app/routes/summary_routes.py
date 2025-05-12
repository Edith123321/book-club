from flask import Blueprint, request, jsonify
from app.extensions import db  # ✅ CORRECT
from app.models.summary import Summary
from app.models.book import Book
from app.models.user import User  # Added missing import
from app.models.bookclub import BookClub
from app.schemas.summary_schema import summary_schema, summaries_schema

summary_bp = Blueprint('summary_bp', __name__, url_prefix='/summaries')

@summary_bp.route('/', methods=['POST'])
def create_summary():
    data = request.get_json()
    
    # Validate required fields
    if not all(key in data for key in ['content', 'book_id', 'user_id']):
        return jsonify({'error': 'Missing required fields (content, book_id, user_id)'}), 400
        
    # Verify book and user exist
    if not Book.query.get(data['book_id']):
        return jsonify({'error': 'Book not found'}), 404
    if not User.query.get(data['user_id']):
        return jsonify({'error': 'User not found'}), 404
        
    # Handle optional bookclub_id
    bookclub_id = data.get('bookclub_id')  # Will be None if not provided
    if bookclub_id is not None:  # Only check if provided
        if not BookClub.query.get(bookclub_id):
            return jsonify({'error': 'Book club not found'}), 404

    try:
        new_summary = Summary(
            content=data['content'],
            book_id=data['book_id'],
            user_id=data['user_id'],
            bookclub_id=bookclub_id  # Can be None
        )
        db.session.add(new_summary)
        db.session.commit()
        return summary_schema.jsonify(new_summary), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/', methods=['GET'])
def get_summaries():
    try:
        summaries = Summary.query.all()
        return summaries_schema.jsonify(summaries), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch summaries", "details": str(e)}), 500

@summary_bp.route('/<int:id>', methods=['GET'])
def get_summary(id):
    try:
        summary = Summary.query.get_or_404(id)
        return summary_schema.jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": "Summary not found", "details": str(e)}), 404

@summary_bp.route('/<int:id>', methods=['PUT'])
def update_summary(id):
    try:
        summary = Summary.query.get_or_404(id)
        data = request.get_json()
        
        if 'content' in data:
            summary.content = data['content']
        if 'book_id' in data:
            if not Book.query.get(data['book_id']):
                return jsonify({'error': 'Book not found'}), 404
            summary.book_id = data['book_id']
        if 'user_id' in data:
            if not User.query.get(data['user_id']):
                return jsonify({'error': 'User not found'}), 404
            summary.user_id = data['user_id']
        if 'bookclub_id' in data:
            if data['bookclub_id'] is not None and not BookClub.query.get(data['bookclub_id']):
                return jsonify({'error': 'Book club not found'}), 404
            summary.bookclub_id = data['bookclub_id']
            
        db.session.commit()
        return summary_schema.jsonify(summary), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update summary", "details": str(e)}), 500

@summary_bp.route('/<int:id>', methods=['DELETE'])
def delete_summary(id):
    try:
        summary = Summary.query.get_or_404(id)
        db.session.delete(summary)
        db.session.commit()
        return jsonify({"message": "Summary deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete summary", "details": str(e)}), 500
    

@summary_bp.route('/book/<int:book_id>', methods=['GET'])
def get_summary_by_book(book_id):
    try:
        summaries = Summary.query.filter_by(book_id=book_id).all()
        if not summaries:
            return jsonify({'error': 'No summaries found for this book'}), 404
        return summaries_schema.jsonify(summaries), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch summaries for the book', 'details': str(e)}), 500


