from flask import Blueprint, request, jsonify
from app.models.user import User
from app.models.following import follows
from app.middleware import token_required
from app.utils import validate_email, validate_password, validate_username
from app import db

user_bp = Blueprint('user', __name__, url_prefix='/api/users')  # Fixed __name__

# --------------------------
# User Profile Routes
# --------------------------

@user_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Get authenticated user's profile"""
    return jsonify({
        'message': 'Profile retrieved',
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'created_at': current_user.created_at.isoformat()
        }
    }), 200

@user_bp.route('/me', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile"""
    data = request.get_json()
    updates = {}

    if 'username' in data:
        if not validate_username(data['username']):
            return jsonify({'error': 'Invalid username format'}), 400
        if User.query.filter(User.username == data['username'], User.id != current_user.id).first():
            return jsonify({'error': 'Username taken'}), 409
        updates['username'] = data['username']

    if 'email' in data:
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email'}), 400
        if User.query.filter(User.email == data['email'], User.id != current_user.id).first():
            return jsonify({'error': 'Email exists'}), 409
        updates['email'] = data['email']

    try:
        User.query.filter_by(id=current_user.id).update(updates)
        db.session.commit()
        return jsonify({'message': 'Profile updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# --------------------------
# Security Routes
# --------------------------

@user_bp.route('/me/password', methods=['PUT'])
@token_required
def change_password(current_user):
    """Change user password"""
    data = request.get_json()
    
    if not all(k in data for k in ['current_password', 'new_password']):
        return jsonify({'error': 'Missing password fields'}), 400
    
    if not current_user.verify_password(data['current_password']):
        return jsonify({'error': 'Current password incorrect'}), 401
    
    if not validate_password(data['new_password']):
        return jsonify({'error': 'Password must be 8+ chars with letters and numbers'}), 400

    try:
        current_user.password = data['new_password']
        db.session.commit()
        return jsonify({'message': 'Password updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# --------------------------
# Social Features
# --------------------------

@user_bp.route('/<int:user_id>/follow', methods=['POST'])
@token_required
def follow_user(current_user, user_id):
    """Follow another user"""
    if current_user.id == user_id:
        return jsonify({'error': 'Cannot follow yourself'}), 400

    target = User.query.get_or_404(user_id)

    if current_user.is_following(target):
        return jsonify({'error': 'Already following'}), 400

    try:
        follow = Follow(follower_id=current_user.id, followed_id=target.id)
        db.session.add(follow)
        db.session.commit()
        return jsonify({'message': f'Now following {target.username}'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/<int:user_id>/unfollow', methods=['POST'])
@token_required
def unfollow_user(current_user, user_id):
    """Unfollow a user"""
    target = User.query.get_or_404(user_id)

    if not current_user.is_following(target):
        return jsonify({'error': 'Not following this user'}), 400

    try:
        Follow.query.filter_by(
            follower_id=current_user.id,
            followed_id=target.id
        ).delete()
        db.session.commit()
        return jsonify({'message': f'Unfollowed {target.username}'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@user_bp.route('/follow/<int:user_id>', methods=['POST'], endpoint='follow_user_alt')
@token_required
def follow_user_alt(user_id):
    if 'user_id' not in session:
        return jsonify({'error': 'token required'}), 401
        
    current_user = User.query.get(session['user_id'])
    user_to_follow = User.query.get_or_404(user_id)
    
    if current_user.id == user_id:
        return jsonify({'error': 'Cannot follow yourself'}), 400
    
    if current_user.follow(user_to_follow):
        db.session.commit()
        return jsonify({'message': f'Now following {user_to_follow.username}'}), 200
    return jsonify({'error': 'Already following this user'}), 400

@user_bp.route('/invites/<int:invite_id>/accept', methods=['POST'])
@token_required
def accept_invite(invite_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Token required'}), 401
        
    invite = Invite.query.filter_by(
        id=invite_id,
        recipient_id=session['user_id']
    ).first_or_404()
    
    if invite.status != InviteStatus.PENDING:
        return jsonify({'error': 'Invite already processed'}), 400
    
    invite.status = InviteStatus.ACCEPTED
    db.session.commit()
    
    return jsonify({'message': 'Invite accepted'}), 200