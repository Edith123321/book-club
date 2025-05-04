from flask import Blueprint, request, jsonify
from app.models import db, User
from ..middleware import token_required

following_bp = Blueprint('following', __name__, url_prefix='/api/following')

# --------------------------
# Follow a user
# --------------------------
@following_bp.route('/<int:user_id>', methods=['POST'])
@token_required
def follow_user(current_user, user_id):
    user_to_follow = User.query.get_or_404(user_id)

    if current_user.id == user_id:
        return jsonify({'error': 'You cannot follow yourself'}), 400

    if current_user.follow(user_to_follow):
        db.session.commit()
        return jsonify({
            'message': f'You are now following {user_to_follow.username}',
            'following': True,
            'followers_count': user_to_follow.followers.count()
        }), 200

    return jsonify({'error': 'Already following this user'}), 400

# --------------------------
# Unfollow a user
# --------------------------
@following_bp.route('/<int:user_id>', methods=['DELETE'])
@token_required
def unfollow_user(current_user, user_id):
    user_to_unfollow = User.query.get_or_404(user_id)

    if current_user.unfollow(user_to_unfollow):
        db.session.commit()
        return jsonify({
            'message': f'You have unfollowed {user_to_unfollow.username}',
            'following': False,
            'followers_count': user_to_unfollow.followers.count()
        }), 200

    return jsonify({'error': 'Not following this user'}), 400

# --------------------------
# Check if current user is following another user
# --------------------------
@following_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def check_following(current_user, user_id):
    target_user = User.query.get_or_404(user_id)
    
    return jsonify({
        'is_following': current_user.is_following(target_user),
        'followers_count': target_user.followers.count(),
        'following_count': target_user.following.count()
    }), 200

# --------------------------
# Get current user's followers
# --------------------------
@following_bp.route('/followers', methods=['GET'])
@token_required
def get_followers(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    followers_paginated = current_user.followers.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'followers': [{
            'id': follower.id,
            'username': follower.username,
            'avatar': getattr(follower, 'avatar_url', None)
        } for follower in followers_paginated.items],
        'total': followers_paginated.total,
        'pages': followers_paginated.pages,
        'current_page': followers_paginated.page
    }), 200

# --------------------------
# Get users followed by current user
# --------------------------
@following_bp.route('/following', methods=['GET'])
@token_required
def get_following(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    following_paginated = current_user.following.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'following': [{
            'id': user.id,
            'username': user.username,
            'avatar': getattr(user, 'avatar_url', None)
        } for user in following_paginated.items],
        'total': following_paginated.total,
        'pages': following_paginated.pages,
        'current_page': following_paginated.page
    }), 200
