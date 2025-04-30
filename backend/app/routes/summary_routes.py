from flask import Blueprint, request, jsonify
from app import db
from app.models.summary import Summary
from app.schemas.summary_schema import summary_schema, summaries_schema

summary_bp = Blueprint('summary_bp', __name__, url_prefix='/summaries')

@summary_bp.route('/', methods=['POST'])
def create_summary():
    data = request.get_json()
    new_summary = Summary(
        content=data.get('content'),
        book_id=data.get('book_id')
    )
    db.session.add(new_summary)
    db.session.commit()
    return summary_schema.jsonify(new_summary), 201

@summary_bp.route('/', methods=['GET'])
def get_summaries():
    summaries = Summary.query.all()
    return summaries_schema.jsonify(summaries), 200

@summary_bp.route('/<int:id>', methods=['GET'])
def get_summary(id):
    summary = Summary.query.get_or_404(id)
    return summary_schema.jsonify(summary), 200

@summary_bp.route('/<int:id>', methods=['PUT'])
def update_summary(id):
    summary = Summary.query.get_or_404(id)
    data = request.get_json()
    summary.content = data.get('content', summary.content)
    db.session.commit()
    return summary_schema.jsonify(summary), 200

@summary_bp.route('/<int:id>', methods=['DELETE'])
def delete_summary(id):
    summary = Summary.query.get_or_404(id)
    db.session.delete(summary)
    db.session.commit()
    return jsonify({'message': 'Summary deleted'}), 200
