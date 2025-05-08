from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Invite, User, BookClub
from app.extensions import db
from app.utils import invite_token_required, generate_invite_token
from app.models.invite import InviteStatus
from datetime import datetime

invite_bp = Blueprint('invite', __name__, url_prefix='/api/invites')

# Send Invite (JWT protected)
@invite_bp.route('/', methods=['POST'])
@jwt_required()
def send_invite():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    if not all(k in data for k in ['recipient_id', 'bookclub_id']):
        return jsonify({'error': 'Missing required fields'}), 400

    # Check if recipient exists
    recipient = User.query.get(data['recipient_id'])
    if not recipient:
        return jsonify({'error': 'Recipient not found'}), 404

    # Check if book club exists
    bookclub = BookClub.query.get(data['bookclub_id'])
    if not bookclub:
        return jsonify({'error': 'Book club not found'}), 404

    # Check for existing invite
    existing_invite = Invite.query.filter_by(
        sender_id=current_user_id,
        recipient_id=data['recipient_id'],
        bookclub_id=data['bookclub_id'],
        status='PENDING'
    ).first()
    
    if existing_invite:
        return jsonify({'error': 'Invite already sent'}), 400

    try:
        # Generate unique token for this invite
        invite_token = generate_invite_token(
            current_user_id,
            data['bookclub_id'],
            data['recipient_id']
        )

        new_invite = Invite(
            sender_id=current_user_id,
            recipient_id=data['recipient_id'],
            bookclub_id=data['bookclub_id'],
            token=invite_token,
            status=InviteStatus.PENDING
        )

        db.session.add(new_invite)
        db.session.commit()

        return jsonify({
            'message': 'Invite sent successfully',
            'invite_id': new_invite.id,
            'invite_token': invite_token
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Accept Invite (Token based)
@invite_bp.route('/accept/<token>', methods=['POST'])
@invite_token_required
def accept_invite(token, invite_data):
    try:
        # Find the pending invite
        invite = Invite.query.filter_by(
            token=token,
            status='PENDING'
        ).first_or_404()

        # Get the bookclub and user
        bookclub = BookClub.query.get(invite_data['bookclub_id'])
        user = User.query.get(invite_data['recipient_id'])

        # Add user to bookclub members
        if user not in bookclub.members:
            bookclub.members.append(user)

        # Update invite status
        invite.status = 'ACCEPTED'
        invite.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'message': 'Successfully joined book club',
            'bookclub_id': bookclub.id,
            'bookclub_name': bookclub.name
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Get Sent Invites (JWT protected)
@invite_bp.route('/sent', methods=['GET'])
@jwt_required()
def get_sent_invites():
    current_user_id = get_jwt_identity()
    
    try:
        # Get all invites sent by current user
        sent_invites = Invite.query.filter_by(
            sender_id=current_user_id
        ).order_by(Invite.created_at.desc()).all()

        # Format response
        invites_data = []
        for invite in sent_invites:
            invites_data.append({
                'id': invite.id,
                'recipient_id': invite.recipient_id,
                'recipient_name': invite.recipient.username,
                'bookclub_id': invite.bookclub_id,
                'bookclub_name': invite.bookclub.name,
                'status': invite.status.value,
                'created_at': invite.created_at.isoformat(),
                'updated_at': invite.updated_at.isoformat() if invite.updated_at else None,
                'token': invite.token
            })

        return jsonify({
            'count': len(invites_data),
            'invites': invites_data
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500