from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User,follows
from app.extensions import db

profile_bp = Blueprint('profile', __name__, url_prefix='/api/users')

@profile_bp.route('/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'avatar_url': user.avatar_url,
        'bio': user.bio,
        'created_at': user.created_at.isoformat()
    })

@profile_bp.route('/<int:user_id>/follow-status', methods=['GET'])
@jwt_required()
def get_follow_status(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id == user_id:
        return jsonify({'isFollowing': False}), 200
    
    follow = Follow.query.filter_by(
        follower_id=current_user_id,
        followed_id=user_id
    ).first()
    
    return jsonify({'isFollowing': follow is not None})

@profile_bp.route('/<int:user_id>/followers/count', methods=['GET'])
def get_followers_count(user_id):
    count = Follow.query.filter_by(followed_id=user_id).count()
    return jsonify({'count': count})

@profile_bp.route('/<int:user_id>/following/count', methods=['GET'])
def get_following_count(user_id):
    count = Follow.query.filter_by(follower_id=user_id).count()
    return jsonify({'count': count})

@profile_bp.route('/<int:user_id>/followers', methods=['GET'])
def get_followers(user_id):
    followers = db.session.query(User).join(
        Follow, Follow.follower_id == User.id
    ).filter(
        Follow.followed_id == user_id
    ).all()
    
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'avatar_url': user.avatar_url
    } for user in followers])

@profile_bp.route('/<int:user_id>/following', methods=['GET'])
def get_following(user_id):
    following = db.session.query(User).join(
        Follow, Follow.followed_id == User.id
    ).filter(
        Follow.follower_id == user_id
    ).all()
    
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'avatar_url': user.avatar_url
    } for user in following])

@profile_bp.route('/<int:user_id>/follow', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    current_user_id = get_jwt_identity()
    
    if current_user_id == user_id:
        return jsonify({'error': 'Cannot follow yourself'}), 400
    
    existing_follow = Follow.query.filter_by(
        follower_id=current_user_id,
        followed_id=user_id
    ).first()
    
    if existing_follow:
        return jsonify({'error': 'Already following this user'}), 400
    
    new_follow = Follow(
        follower_id=current_user_id,
        followed_id=user_id
    )
    db.session.add(new_follow)
    db.session.commit()
    
    return jsonify({'message': 'Successfully followed user'}), 201

@profile_bp.route('/<int:user_id>/follow', methods=['DELETE'])
@jwt_required()
def unfollow_user(user_id):
    current_user_id = get_jwt_identity()
    
    follow = Follow.query.filter_by(
        follower_id=current_user_id,
        followed_id=user_id
    ).first()
    
    if not follow:
        return jsonify({'error': 'Not following this user'}), 400
    
    db.session.delete(follow)
    db.session.commit()
    
    return jsonify({'message': 'Successfully unfollowed user'}), 200