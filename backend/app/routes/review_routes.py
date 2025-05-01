from flask import Blueprint, request, jsonify
from app import db
from app.models.review import Review
from app.schemas.review_schema import review_schema, reviews_schema

review_bp = Blueprint('review_bp', __name__, url_prefix='/reviews')

# GET all reviews
@review_bp.route('/', methods=['GET'])
def get_reviews():
    try:
        reviews = Review.query.all()
        return reviews_schema.jsonify(reviews), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch reviews", "details": str(e)}), 500

# POST a new review
@review_bp.route('/', methods=['POST'])
def create_review():
    data = request.get_json()
    try:
        new_review = Review(
            content=data['content'],
            rating=data['rating'],
            user_id=data['user_id'],
            book_id=data['book_id']
        )
        db.session.add(new_review)
        db.session.commit()
        return review_schema.jsonify(new_review), 201
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400
    except Exception as e:
        return jsonify({"error": "Failed to create review", "details": str(e)}), 500

# GET single review
@review_bp.route('/<int:id>', methods=['GET'])
def get_review(id):
    try:
        review = Review.query.get_or_404(id)
        return review_schema.jsonify(review), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch review", "details": str(e)}), 500

# PUT update review
@review_bp.route('/<int:id>', methods=['PUT'])
def update_review(id):
    try:
        review = Review.query.get_or_404(id)
        data = request.get_json()
        review.content = data.get('content', review.content)
        review.rating = data.get('rating', review.rating)
        db.session.commit()
        return review_schema.jsonify(review), 200
    except Exception as e:
        return jsonify({"error": "Failed to update review", "details": str(e)}), 500

# DELETE review
@review_bp.route('/<int:id>', methods=['DELETE'])
def delete_review(id):
    try:
        review = Review.query.get_or_404(id)
        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to delete review", "details": str(e)}), 500
