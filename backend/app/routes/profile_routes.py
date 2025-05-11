from flask import Blueprint, jsonify, request
from app.models import User, follows
from app.extensions import db
import jwt
from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity



profile_bp = Blueprint('profile', __name__, url_prefix='/api/users')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
            
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
                
            request.current_user = current_user
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(*args, **kwargs)
    return decorated

@profile_bp.route('/<int:user_id>', methods=['GET'])
@token_required
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
@token_required
def get_follow_status(user_id):
    current_user_id = request.current_user.id
    if current_user_id == user_id:
        return jsonify({'isFollowing': False}), 200

    follow = db.session.execute(
        follows.select().where(
            follows.c.follower_id == current_user_id,
            follows.c.followed_id == user_id
        )
    ).first()

    return jsonify({'isFollowing': follow is not None})


@profile_bp.route('/<int:user_id>/followers/count', methods=['GET'])
def get_followers_count(user_id):
    count = db.session.execute(
        db.select(db.func.count()).select_from(follows).where(
            follows.c.followed_id == user_id
        )
    ).scalar()
    return jsonify({'count': count})


@profile_bp.route('/<int:user_id>/following/count', methods=['GET'])
def get_following_count(user_id):
    count = db.session.execute(
        db.select(db.func.count()).select_from(follows).where(
            follows.c.follower_id == user_id
        )
    ).scalar()
    return jsonify({'count': count})


@profile_bp.route('/<int:user_id>/followers', methods=['GET'])
def get_followers(user_id):
    followers = db.session.query(User).join(
        follows, follows.c.follower_id == User.id
    ).filter(
        follows.c.followed_id == user_id
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
        follows, follows.c.followed_id == User.id
    ).filter(
        follows.c.follower_id == user_id
    ).all()

    return jsonify([{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'avatar_url': user.avatar_url
    } for user in following])


@profile_bp.route('/<int:user_id>/follow', methods=['POST'])
@token_required
def follow_user(user_id):
    current_user_id = request.current_user.id

    if current_user_id == user_id:
        return jsonify({'error': 'Cannot follow yourself'}), 400

    existing_follow = db.session.execute(
        follows.select().where(
            follows.c.follower_id == current_user_id,
            follows.c.followed_id == user_id
        )
    ).first()

    if existing_follow:
        return jsonify({'error': 'Already following this user'}), 400

    insert_stmt = follows.insert().values(
        follower_id=current_user_id,
        followed_id=user_id
    )
    db.session.execute(insert_stmt)
    db.session.commit()

    return jsonify({'message': 'Successfully followed user'}), 201


@profile_bp.route('/<int:user_id>/follow', methods=['DELETE'])
@token_required
def unfollow_user(user_id):
    current_user_id = request.current_user.id

    delete_stmt = follows.delete().where(
        follows.c.follower_id == current_user_id,
        follows.c.followed_id == user_id
    )
    result = db.session.execute(delete_stmt)

    if result.rowcount == 0:
        return jsonify({'error': 'Not following this user'}), 400

    db.session.commit()
    return jsonify({'message': 'Successfully unfollowed user'}), 200


@profile_bp.route('/<int:user_id>', methods=['GET'])
@token_required
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

@profile_bp.route('/<int:user_id>', methods=['PUT'])
@token_required
def update_user_profile(user_id):
    current_user_id = get_jwt_identity()

    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Validate username
    if 'username' in data:
        if not data['username'] or len(data['username']) < 3:
            return jsonify({'error': 'Username must be at least 3 characters'}), 400
            
        existing_user = User.query.filter(
            User.username == data['username'],
            User.id != user_id
        ).first()
        if existing_user:
            return jsonify({'error': 'Username already taken'}), 400
        user.username = data['username']

    # Validate email
    if 'email' in data:
        if not data['email'] or '@' not in data['email']:
            return jsonify({'error': 'Invalid email format'}), 400
            
        existing_email = User.query.filter(
            User.email == data['email'],
            User.id != user_id
        ).first()
        if existing_email:
            return jsonify({'error': 'Email already in use'}), 400
        user.email = data['email']

    # Update optional fields
    if 'bio' in data:
        user.bio = data['bio'][:500]  # Limit bio length
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']

    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'avatar_url': user.avatar_url,
                'bio': user.bio
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Database error: ' + str(e)}), 500


@profile_bp.route('/<int:user_id>/change-password', methods=['POST'])
@token_required
def change_password(user_id):
    current_user_id = request.current_user.id

    if current_user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password required'}), 400

    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401

    user.set_password(data['new_password'])
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'})
