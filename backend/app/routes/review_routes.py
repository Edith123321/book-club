from flask import Blueprint

review_bp = Blueprint('review', __name__)

@review_bp.route('/reviews')
def get_reviews():
    return {"message": "List of reviews"}

