from flask import Blueprint, jsonify, request
from werkzeug.exceptions import BadRequest, NotFound, Conflict, Unauthorized
from .models import db, Book, Review, BookClub, ClubMember, Discussion, User
from .extensions import bcrypt
from datetime import datetime
import re
import logging
from sqlalchemy.exc import IntegrityError

bp = Blueprint('main', __name__)

# ---------------------------
# Helper Functions
# ---------------------------
def book_schema(book):
    """Serialize book object to dictionary"""
    return {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "cover": book.cover,
        "rating": book.rating,
        "genres": book.genres.split(',') if book.genres else [],
        "description": book.description,
        "pages": book.pages,
        "published": book.published.isoformat() if book.published else None,
        "reviews": [review_schema(r) for r in book.reviews]
    }

def review_schema(review):
    """Serialize review object to dictionary"""
    return {
        "id": review.id,
        "title": review.title,
        "description": review.description,
        "username": review.username,
        "book_id": review.book_id,
        "created_at": review.created_at.isoformat(),
        "rating": review.rating
    }

def user_schema(user):
    """Serialize user object to dictionary"""
    return {
        "id": user.id,
        "username": user.username,
        "name": user.name,
        "avatar": user.avatar,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

# ---------------------------
# Error Handlers
# ---------------------------
@bp.errorhandler(400)
def bad_request_error(e):
    return jsonify(error=str(e)), 400

@bp.errorhandler(404)
def not_found_error(e):
    return jsonify(error="Resource not found"), 404

@bp.errorhandler(409)
def conflict_error(e):
    return jsonify(error="Resource already exists"), 409

# ---------------------------
# Book Routes
# ---------------------------
@bp.route("/books", methods=["GET"])
def list_books():
    """Get paginated list of books"""
    try:
        books = Book.query.all()  # Start with simple query
        
        # For debugging - log the first book
        if books:
            logging.info(f"First book: {books[0].title}")
        else:
            logging.info("No books found in database")
        
        return jsonify({
            'status': 'success',
            'data': {
                'books': [book_schema(b) for b in books]
            }
        })
        
    except Exception as e:
        logging.error(f"Error loading books: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    

@bp.route("/books/<int:book_id>", methods=["GET"])
def get_book(book_id):
    """Get details of a specific book"""
    book = Book.query.get_or_404(book_id)
    return jsonify(book_schema(book))

@bp.route('/books', methods=['POST'])
def create_book():
    """Create a new book"""
    data = request.get_json()
    
    # Validation
    if not data.get('title'):
        raise BadRequest("Title is required")
    if not data.get('author'):
        raise BadRequest("Author is required")
    if 'pages' in data and (not isinstance(data['pages'], int) or data['pages'] < 0):
        raise BadRequest("Pages must be a positive integer")
    if 'rating' in data and (not isinstance(data['rating'], (int, float)) or data['rating'] < 0 or data['rating'] > 5):
        raise BadRequest("Rating must be between 0 and 5")
    
    try:
        # Prepare data
        book_data = {
            'title': data['title'],
            'author': data['author'],
            'cover': data.get('cover'),
            'rating': data.get('rating'),
            'genres': ','.join(data['genres']) if 'genres' in data and isinstance(data['genres'], list) else None,
            'description': data.get('description'),
            'pages': data.get('pages'),
            'published': datetime.fromisoformat(data['published']) if 'published' in data else None
        }

        new_book = Book(**book_data)
        db.session.add(new_book)
        db.session.commit()
        
        return jsonify(book_schema(new_book)), 201
    except IntegrityError:
        db.session.rollback()
        raise Conflict("Book already exists")
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@bp.route("/books/<int:book_id>", methods=["PUT"])
def update_book(book_id):
    """Update an existing book"""
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    
    try:
        # Update fields
        if 'title' in data:
            book.title = data['title']
        if 'author' in data:
            book.author = data['author']
        if 'cover' in data:
            book.cover = data['cover']
        if 'rating' in data:
            if not isinstance(data['rating'], (int, float)) or data['rating'] < 0 or data['rating'] > 5:
                raise BadRequest("Rating must be between 0 and 5")
            book.rating = data['rating']
        if 'genres' in data:
            book.genres = ','.join(data['genres']) if isinstance(data['genres'], list) else data['genres']
        if 'description' in data:
            book.description = data['description']
        if 'pages' in data:
            if not isinstance(data['pages'], int) or data['pages'] < 0:
                raise BadRequest("Pages must be a positive integer")
            book.pages = data['pages']
        if 'published' in data:
            book.published = datetime.fromisoformat(data['published'])
        
        db.session.commit()
        return jsonify(book_schema(book))
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@bp.route("/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    """Delete a book"""
    book = Book.query.get_or_404(book_id)
    try:
        db.session.delete(book)
        db.session.commit()
        return jsonify({"message": "Book deleted"}), 204
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

# ---------------------------
# Review Routes
# ---------------------------
@bp.route("/books/<int:book_id>/reviews", methods=["GET"])
def get_book_reviews(book_id):
    """Get all reviews for a book"""
    Book.query.get_or_404(book_id)  # Verify book exists
    reviews = Review.query.filter_by(book_id=book_id).all()
    return jsonify([review_schema(r) for r in reviews])

@bp.route("/books/<int:book_id>/reviews", methods=["POST"])
def create_review(book_id):
    """Create a new review for a book"""
    data = request.get_json()
    
    # Validation
    if not data or not all(key in data for key in ['title', 'description', 'username', 'rating']):
        raise BadRequest("Missing required fields")
    if not isinstance(data['rating'], (int, float)) or data['rating'] < 0 or data['rating'] > 5:
        raise BadRequest("Rating must be between 0 and 5")
    
    try:
        review = Review(
            book_id=book_id,
            title=data['title'],
            description=data['description'],
            username=data['username'],
            rating=data['rating']
        )
        db.session.add(review)
        db.session.commit()
        return jsonify(review_schema(review)), 201
    except IntegrityError:
        db.session.rollback()
        raise Conflict("Review could not be created")
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@bp.route("/reviews/<int:review_id>", methods=["PUT"])
def update_review(review_id):
    """Update a review"""
    review = Review.query.get_or_404(review_id)
    data = request.get_json()
    
    try:
        if 'title' in data:
            review.title = data['title']
        if 'description' in data:
            review.description = data['description']
        if 'rating' in data:
            if not isinstance(data['rating'], (int, float)) or data['rating'] < 0 or data['rating'] > 5:
                raise BadRequest("Rating must be between 0 and 5")
            review.rating = data['rating']
        
        db.session.commit()
        return jsonify(review_schema(review))
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@bp.route("/reviews/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):
    """Delete a review"""
    review = Review.query.get_or_404(review_id)
    try:
        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted"}), 204
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))


# ---------------------------
@bp.route("/users", methods=["GET"])
def list_users():
    users = User.query.all()
    return jsonify([user_schema(u) for u in users])

@bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify(user_schema(user))

@bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    
    # Validation
    required_fields = ['username', 'password', 'email']
    if not all(field in data for field in required_fields):
        raise BadRequest("Missing required fields")
    
    if not validate_email(data['email']):
        raise BadRequest("Invalid email format")
    
    if not validate_password(data['password']):
        raise BadRequest("Password must be 8+ chars with 1 digit and 1 uppercase")
    
    if User.query.filter_by(username=data['username']).first():
        raise Conflict("Username already exists")
    
    if User.query.filter_by(email=data['email']).first():
        raise Conflict("Email already registered")

    try:
        user = User(
            username=data['username'],
            password_hash=bcrypt.generate_password_hash(data['password']).decode('utf-8'),
            email=data['email'],
            name=data.get('name'),
            avatar=data.get('avatar')
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user_schema(user)), 201
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@bp.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    try:
        if 'username' in data and data['username'] != user.username:
            if User.query.filter_by(username=data['username']).first():
                raise Conflict("Username already taken")
            user.username = data['username']
        
        if 'email' in data and data['email'] != user.email:
            if not validate_email(data['email']):
                raise BadRequest("Invalid email format")
            if User.query.filter_by(email=data['email']).first():
                raise Conflict("Email already registered")
            user.email = data['email']
        
        if 'password' in data:
            if not validate_password(data['password']):
                raise BadRequest("Invalid password format")
            user.password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        if 'name' in data:
            user.name = data['name']
        
        if 'avatar' in data:
            user.avatar = data['avatar']
        
        db.session.commit()
        return jsonify(user_schema(user))
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@bp.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted"}), 204
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

# ---------------------------
# Book Club Routes (CRUD)
# ---------------------------
@bp.route("/clubs", methods=["GET"])
def list_clubs():
    clubs = BookClub.query.all()
    return jsonify([club_schema(c) for c in clubs])

@bp.route("/clubs/<int:club_id>", methods=["GET"])
def get_club(club_id):
    club = BookClub.query.get_or_404(club_id)
    return jsonify(club_schema(club))

@bp.route("/clubs", methods=["POST"])
def create_club():
    data = request.get_json()
    
    # Validation
    if not data.get('name'):
        raise BadRequest("Club name is required")
    if not data.get('description'):
        raise BadRequest("Description is required")
    
    try:
        club = BookClub(
            name=data['name'],
            description=data['description'],
            current_book=data.get('current_book'),
            next_meeting=data.get('next_meeting')
        )
        db.session.add(club)
        db.session.commit()
        return jsonify(club_schema(club)), 201
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@bp.route("/clubs/<int:club_id>", methods=["PUT"])
def update_club(club_id):
    club = BookClub.query.get_or_404(club_id)
    data = request.get_json()
    
    try:
        if 'name' in data:
            club.name = data['name']
        if 'description' in data:
            club.description = data['description']
        if 'current_book' in data:
            club.current_book = data['current_book']
        if 'next_meeting' in data:
            club.next_meeting = data['next_meeting']
        
        db.session.commit()
        return jsonify(club_schema(club))
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@bp.route("/clubs/<int:club_id>", methods=["DELETE"])
def delete_club(club_id):
    club = BookClub.query.get_or_404(club_id)
    try:
        db.session.delete(club)
        db.session.commit()
        return jsonify({"message": "Club deleted"}), 204
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

# ---------------------------
# Club Member Routes
# ---------------------------
@bp.route("/clubs/<int:club_id>/members", methods=["POST"])
def add_member(club_id):
    data = request.get_json()
    
    if not data or 'user_id' not in data:
        raise BadRequest("User ID is required")
    
    # Check if user exists
    user = User.query.get(data['user_id'])
    if not user:
        raise NotFound("User not found")
    
    # Check if already a member
    if ClubMember.query.filter_by(club_id=club_id, user_id=data['user_id']).first():
        raise Conflict("User is already a member")
    
    try:
        member = ClubMember(
            club_id=club_id,
            user_id=data['user_id'],
            role=data.get('role', 'member')
        )
        db.session.add(member)
        db.session.commit()
        return jsonify(member_schema(member)), 201
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))

@bp.route("/clubs/<int:club_id>/members/<int:user_id>", methods=["DELETE"])
def remove_member(club_id, user_id):
    member = ClubMember.query.filter_by(club_id=club_id, user_id=user_id).first()
    if not member:
        raise NotFound("Member not found")
    
    try:
        db.session.delete(member)
        db.session.commit()
        return jsonify({"message": "Member removed"}), 204
    except Exception as e:
        db.session.rollback()
        raise BadRequest(str(e))