from flask import Blueprint, request, jsonify
from app import db
from app.models.book import Book

book_bp = Blueprint('books', __name__, url_prefix='/books')

# GET /books - Get all books
@book_bp.route('/', methods=['GET'])
def get_books():
    books = Book.query.all()
    return jsonify([book.to_dict() for book in books]), 200

# GET /books/<int:id> - Get one book by ID
@book_bp.route('/<int:id>', methods=['GET'])
def get_book(id):
    book = Book.query.get(id)
    if book:
        return jsonify(book.to_dict()), 200
    return jsonify({"error": "Book not found"}), 404

# POST /books - Create a new book
@book_bp.route('/', methods=['POST'])
def create_book():
    data = request.get_json()
    try:
        new_book = Book(
            title=data['title'],
            author=data['author'],
            genre=data.get('genre', 'Unknown'),  # default if not provided
            description=data.get('description'),
            year=data.get('year', 0)  # default if not provided
        )
        db.session.add(new_book)
        db.session.commit()
        return jsonify(new_book.to_dict()), 201
    except KeyError as e:
        return jsonify({"error": f"Missing field: {str(e)}"}), 400

# PUT /books/<id> - Update book
@book_bp.route('/<int:id>', methods=['PUT'])
def update_book(id):
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

# DELETE /books/<id> - Delete book
@book_bp.route('/<int:id>', methods=['DELETE'])
def delete_book(id):
    book = Book.query.get(id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    db.session.delete(book)
    db.session.commit()
    return jsonify({"message": "Book deleted"}), 200
