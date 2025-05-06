from flask import Blueprint, request, jsonify, session
from app.models import db, Invite, User, BookClub, InviteStatus
from app.middleware import token_required
from datetime import datetime

invite_bp = Blueprint('invite', __name__, url_prefix='/api/invites')

# Send Invite
@invite_bp.route('/', methods=['POST'])
@token_required
def send_invite():
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
        sender_id=session['user_id'],
        recipient_id=data['recipient_id'],
        bookclub_id=data['bookclub_id'],
        status=InviteStatus.PENDING
    ).first()
    
    if existing_invite:
        return jsonify({'error': 'Invite already sent'}), 400
    
    try:
        new_invite = Invite(
            sender_id=session['user_id'],
            recipient_id=data['recipient_id'],
            bookclub_id=data['bookclub_id'],
            status=InviteStatus.PENDING
        )
        db.session.add(new_invite)
        db.session.commit()
        
        return jsonify({
            'message': 'Invite sent successfully',
            'invite': {
                'id': new_invite.id,
                'sender': new_invite.sender.username,
                'recipient': new_invite.recipient.username,
                'bookclub': new_invite.bookclub.name,
                'status': new_invite.status.value,
                'created_at': new_invite.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Get User's Received Invites
@invite_bp.route('/received', methods=['GET'])
@token_required
def get_received_invites():
    invites = Invite.query.filter_by(
        recipient_id=session['user_id'],
        status=InviteStatus.PENDING
    ).all()
    
    return jsonify({
        'invites': [{
            'id': i.id,
            'sender': i.sender.username,
            'bookclub': {
                'id': i.bookclub.id,
                'name': i.bookclub.name
            },
            'created_at': i.created_at.isoformat()
        } for i in invites]
    }), 200

# Accept Invite
@invite_bp.route('/<int:invite_id>/accept', methods=['POST'])
@token_required
def accept_invite(invite_id):
    invite = Invite.query.filter_by(
        id=invite_id,
        recipient_id=session['user_id']
    ).first_or_404()
    
    if invite.status != InviteStatus.PENDING:
        return jsonify({'error': 'Invite already processed'}), 400
    
    try:
        # Add user to book club
        invite.bookclub.members.append(invite.recipient)
        
        # Update invite status
        invite.status = InviteStatus.ACCEPTED
        invite.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Invite accepted',
            'bookclub': {
                'id': invite.bookclub.id,
                'name': invite.bookclub.name
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Decline Invite
@invite_bp.route('/<int:invite_id>/decline', methods=['POST'])
@token_required
def decline_invite(invite_id):
    invite = Invite.query.filter_by(
        id=invite_id,
        recipient_id=session['user_id']
    ).first_or_404()
    
    if invite.status != InviteStatus.PENDING:
        return jsonify({'error': 'Invite already processed'}), 400
    
    try:
        invite.status = InviteStatus.DECLINED
        invite.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Invite declined'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Get Sent Invites
@invite_bp.route('/sent', methods=['GET'])
@token_required
def get_sent_invites():
    invites = Invite.query.filter_by(
        sender_id=session['user_id']
    ).all()
    
    return jsonify({
        'invites': [{
            'id': i.id,
            'recipient': i.recipient.username,
            'bookclub': {
                'id': i.bookclub.id,
                'name': i.bookclub.name
            },
            'status': i.status.value,
            'created_at': i.created_at.isoformat(),
            'updated_at': i.updated_at.isoformat() if i.updated_at else None
        } for i in invites]
        }), 200
