from flask import Blueprint, request, jsonify
from app.models import User
from app.extensions import db
from ..middleware import token_required
import logging

logger = logging.getLogger(__name__)
following_bp = Blueprint('following', __name__, url_prefix='/api/following')

# --------------------------
# Follow a user
# --------------------------

@following_bp.route('/users/<int:user_id>/followers/id', methods=['GET'])
def get_followers_count_by_id(user_id):
    user = User.query.get_or_404(user_id)
    count = user.user.followers.count()
    return jsonify({"count": count})

@following_bp.route('/users/<int:user_id>/following/id', methods=['GET'])
def get_following_count_by_id(user_id):
    user = User.query.get_or_404(user_id)
    count = user.following.count()
    return jsonify({"count": count})


@following_bp.route('/<int:user_id>', methods=['POST'])
@token_required
def follow_user(current_user, user_id):
    try:
        user_to_follow = User.query.get_or_404(user_id)

        if current_user.id == user_id:
            logger.warning(f"User {current_user.id} attempted to follow themselves")
            return jsonify({
                'error': 'You cannot follow yourself',
                'code': 'SELF_FOLLOW'
            }), 400

        if current_user.is_following(user_to_follow):
            logger.info(f"User {current_user.id} already follows {user_id}")
            return jsonify({
                'error': 'Already following this user',
                'code': 'ALREADY_FOLLOWING'
            }), 400

        current_user.follow(user_to_follow)
        db.session.commit()

        logger.info(f"User {current_user.id} started following {user_id}")
        return jsonify({
            'message': f'You are now following {user_to_follow.username}',
            'following': True,
            'followers_count': user_to_follow.followers.count(),
            'following_count': user_to_follow.following.count(),
            'user': user_to_follow.to_public_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error following user: {str(e)}")
        db.session.rollback()
        return jsonify({
            'error': 'Failed to follow user',
            'details': str(e)
        }), 500


# --------------------------
# Unfollow a user
# --------------------------
@following_bp.route('/<int:user_id>', methods=['DELETE'])
@token_required
def unfollow_user(current_user, user_id):
    try:
        user_to_unfollow = User.query.get_or_404(user_id)

        if not current_user.is_following(user_to_unfollow):
            logger.info(f"User {current_user.id} not following {user_id}")
            return jsonify({
                'error': 'Not following this user',
                'code': 'NOT_FOLLOWING'
            }), 400

        if current_user.unfollow(user_to_unfollow):
            db.session.commit()
            logger.info(f"User {current_user.id} unfollowed {user_id}")
            return jsonify({
                'message': f'You have unfollowed {user_to_unfollow.username}',
                'following': False,
                'followers_count': user_to_unfollow.followers.count(),
                'following_count': user_to_unfollow.following.count(),
                'user': user_to_unfollow.to_public_dict()
            }), 200

    except Exception as e:
        logger.error(f"Error unfollowing user: {str(e)}")
        db.session.rollback()
        return jsonify({
            'error': 'Failed to unfollow user',
            'details': str(e)
        }), 500

# --------------------------
# Check follow status
# --------------------------
@following_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def check_following(current_user, user_id):
    try:
        target_user = User.query.get_or_404(user_id)
        
        return jsonify({
            'is_following': current_user.is_following(target_user),
            'followers_count': target_user.followers.count(),
            'following_count': target_user.following.count(),
            'user': target_user.to_public_dict()
        }), 200
    except Exception as e:
        logger.error(f"Error checking follow status: {str(e)}")
        return jsonify({
            'error': 'Failed to check follow status',
            'details': str(e)
        }), 500

# --------------------------
# Get user's followers
# --------------------------
@following_bp.route('/<int:user_id>/followers', methods=['GET'])
def get_user_followers(user_id):
    try:
        user = User.query.get_or_404(user_id)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        minimal = request.args.get('minimal', 'false').lower() == 'true'

        followers_paginated = user.get_followers(page=page, per_page=per_page)

        if minimal:
            followers_data = [{
                'id': follower.id,
                'username': follower.username,
                'avatar_url': follower.avatar_url
            } for follower in followers_paginated.items]
        else:
            followers_data = [follower.to_public_dict() for follower in followers_paginated.items]

        return jsonify({
            'followers': followers_data,
            'total': followers_paginated.total,
            'pages': followers_paginated.pages,
            'current_page': followers_paginated.page
        }), 200
    except Exception as e:
        logger.error(f"Error fetching followers: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch followers',
            'details': str(e)
        }), 500

# --------------------------
# Get users followed by user
# --------------------------
@following_bp.route('/<int:user_id>/following', methods=['GET'])
def get_user_following(user_id):
    try:
        user = User.query.get_or_404(user_id)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        minimal = request.args.get('minimal', 'false').lower() == 'true'

        following_paginated = user.get_following(page=page, per_page=per_page)

        if minimal:
            following_data = [{
                'id': user.id,
                'username': user.username,
                'avatar_url': user.avatar_url
            } for user in following_paginated.items]
        else:
            following_data = [user.to_public_dict() for user in following_paginated.items]

        return jsonify({
            'following': following_data,
            'total': following_paginated.total,
            'pages': following_paginated.pages,
            'current_page': following_paginated.page
        }), 200
    except Exception as e:
        logger.error(f"Error fetching following: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch following',
            'details': str(e)
        }), 500

# --------------------------
# Get current user's followers (authenticated)
# --------------------------
@following_bp.route('/me/followers', methods=['GET'])
@token_required
def get_current_user_followers(current_user):
    return get_user_followers(current_user.id)

# --------------------------
# Get users followed by current user (authenticated)
# --------------------------
@following_bp.route('/me/following', methods=['GET'])
@token_required
def get_current_user_following(current_user):
    return get_user_following(current_user.id)