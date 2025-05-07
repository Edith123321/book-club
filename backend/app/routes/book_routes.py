from flask import Blueprint, jsonify, abort
from app.models.book import Book
from app.models.review import Review
from app.models.user import User
from app import db

book_bp = Blueprint('book_bp', __name__)

@book_bp.route('/books/', methods=['GET'])
def get_books():
    books = Book.query.all()
    books_list = []
    for book in books:
        books_list.append({
            "id": book.id,
            "title": book.title,
            "author": book.author,
            "cover": book.cover,
            "genres": book.genres,
            "rating": book.rating
        })
    return jsonify(books_list)

@book_bp.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        abort(404, description="Book not found")

    # Prepare reviews data
    reviews_data = []
    for review in book.reviews:
        user = User.query.get(review.user_id)
        reviews_data.append({
            "title": review.title or "No Title",
            "description": review.content,
            "username": user.username if user else "Anonymous"
        })

    book_data = {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "genre": book.genre,
        "description": book.description,
        "year": book.year,
        "cover": book.cover,
        "published": book.published,
        "pages": book.pages,
        "rating": book.rating,
        "genres": book.genres,
        "reviews": reviews_data
    }

    return jsonify(book_data)
