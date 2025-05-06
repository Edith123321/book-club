from flask import Blueprint, request, jsonify
from app.models import Membership, db
from app.schemas.membership_schema import membership_schema, memberships_schema

membership_bp = Blueprint('memberships', __name__)

@membership_bp.route('/memberships', methods=['GET'])
def get_memberships():
    memberships = Membership.query.all()
    return jsonify(memberships_schema.dump(memberships))

@membership_bp.route('/memberships/<int:id>', methods=['GET'])
def get_membership(id):
    membership = Membership.query.get_or_404(id)
    return jsonify(membership_schema.dump(membership))

@membership_bp.route('/bookclubs/<int:bookclub_id>/memberships', methods=['POST'])
def create_membership(bookclub_id):
    data = request.get_json()
    membership = Membership(
        bookclub_id=bookclub_id,
        user_id=data['user_id'],
        role=data.get('role', 'member'),
        status=data.get('status', 'active')  # Make sure status is included in the request
    )
    db.session.add(membership)
    db.session.commit()
    return jsonify(membership_schema.dump(membership)), 201

@membership_bp.route('/memberships/<int:id>', methods=['PUT'])
def update_membership(id):
    membership = Membership.query.get_or_404(id)
    data = request.get_json()

    if 'role' in data:
        membership.role = data['role']
    if 'status' in data:
        membership.status = data['status']

    db.session.commit()
    return jsonify(membership_schema.dump(membership))

@membership_bp.route('/memberships/<int:id>', methods=['DELETE'])
def delete_membership(id):
    membership = Membership.query.get_or_404(id)
    db.session.delete(membership)
    db.session.commit()
    return jsonify({'message': 'Membership deleted'}), 200
