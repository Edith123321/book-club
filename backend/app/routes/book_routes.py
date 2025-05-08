from flask import Blueprint, request, jsonify
from datetime import datetime
from app.extensions import db  # ✅ CORRECT
from app.models.book import Book

book_bp = Blueprint('books', __name__, url_prefix='/books')

# GET all books
@book_bp.route('/', methods=['GET'])
def get_books():
    try:
        books = Book.query.all()
        return jsonify([book.to_dict() for book in books]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch books", "details": str(e)}), 500

# GET single book by ID
@book_bp.route('/<int:id>', methods=['GET'])
def get_book(id):
    try:
        book = Book.query.get(id)
        if book:
            return jsonify(book.to_dict()), 200
        return jsonify({"error": "Book not found"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to fetch book", "details": str(e)}), 500

# POST create a new book
@book_bp.route('/', methods=['POST'])
def create_book():
    data = request.get_json()
    try:
        required_fields = ['title', 'author']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        new_book = Book(
            title=data['title'],
            author=data['author'],
            genres=data.get('genres', []),
            synopsis=data.get('synopsis'),
            rating=data.get('rating'),
            language=data.get('language'),
            pages=data.get('pages'),
            date_published=datetime.strptime(data['date_published'], "%Y-%m-%d") if data.get('date_published') else None,
            cover_image_url=data.get('cover_image_url'),
            date_added=datetime.strptime(data['date_added'], "%Y-%m-%d") if data.get('date_added') else datetime.utcnow()
        )
        db.session.add(new_book)
        db.session.commit()
        return jsonify(new_book.to_dict()), 201
    except Exception as e:
        return jsonify({"error": "Failed to create book", "details": str(e)}), 500

# PUT update book
@book_bp.route('/<int:id>', methods=['PUT'])
def update_book(id):
    try:
        book = Book.query.get(id)
        if not book:
            return jsonify({"error": "Book not found"}), 404

        data = request.get_json()
        book.title = data.get('title', book.title)
        book.author = data.get('author', book.author)
        book.genres = data.get('genres', book.genres)
        book.synopsis = data.get('synopsis', book.synopsis)
        book.rating = data.get('rating', book.rating)
        book.language = data.get('language', book.language)
        book.pages = data.get('pages', book.pages)
        book.cover_image_url = data.get('cover_image_url', book.cover_image_url)
        if data.get('date_published'):
            book.date_published = datetime.strptime(data['date_published'], "%Y-%m-%d")
        if data.get('date_added'):
            book.date_added = datetime.strptime(data['date_added'], "%Y-%m-%d")

        db.session.commit()
        return jsonify(book.to_dict()), 200
    except Exception as e:
        return jsonify({"error": "Failed to update book", "details": str(e)}), 500

# DELETE book
@book_bp.route('/<int:id>', methods=['DELETE'])
def delete_book(id):
    try:
        book = Book.query.get(id)
        if not book:
            return jsonify({"error": "Book not found"}), 404

        db.session.delete(book)
        db.session.commit()
        return jsonify({"message": "Book deleted"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to delete book", "details": str(e)}), 500
