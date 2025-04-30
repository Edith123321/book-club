from flask import Blueprint, request, jsonify
from app import db
from app.models.summary import Summary
from app.schemas.summary_schema import summary_schema, summaries_schema

summary_bp = Blueprint('summary_bp', __name__, url_prefix='/summaries')

# POST a new summary
@summary_bp.route('/', methods=['POST'])
def create_summary():
    data = request.get_json()
    try:
        new_summary = Summary(
            content=data['content'],
            book_id=data['book_id']
        )
        db.session.add(new_summary)
        db.session.commit()
        return summary_schema.jsonify(new_summary), 201
    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400
    except Exception as e:
        return jsonify({"error": "Failed to create summary", "details": str(e)}), 500

# GET all summaries
@summary_bp.route('/', methods=['GET'])
def get_summaries():
    try:
        summaries = Summary.query.all()
        return summaries_schema.jsonify(summaries), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch summaries", "details": str(e)}), 500

# GET single summary
@summary_bp.route('/<int:id>', methods=['GET'])
def get_summary(id):
    try:
        summary = Summary.query.get_or_404(id)
        return summary_schema.jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch summary", "details": str(e)}), 500

# PUT update summary
@summary_bp.route('/<int:id>', methods=['PUT'])
def update_summary(id):
    try:
        summary = Summary.query.get_or_404(id)
        data = request.get_json()
        summary.content = data.get('content', summary.content)
        db.session.commit()
        return summary_schema.jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": "Failed to update summary", "details": str(e)}), 500

# DELETE summary
@summary_bp.route('/<int:id>', methods=['DELETE'])
def delete_summary(id):
    try:
        summary = Summary.query.get_or_404(id)
        db.session.delete(summary)
        db.session.commit()
        return jsonify({"message": "Summary deleted"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to delete summary", "details": str(e)}), 500
