from flask import Blueprint, request, jsonify
from app import db
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
        new_book = Book(
            title=data['title'],
            author=data['author'],
            genre=data.get('genre', 'Unknown'),
            description=data.get('description'),
            year=data.get('year', 0)
        )
        db.session.add(new_book)
        db.session.commit()
        return jsonify(new_book.to_dict()), 201
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400
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
        book.genre = data.get('genre', book.genre)
        book.description = data.get('description', book.description)
        book.year = data.get('year', book.year)

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
