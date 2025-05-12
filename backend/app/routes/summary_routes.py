from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.summary import Summary
from app.models.user import User
from app.models.bookclub import BookClub
from app.schemas.summary_schema import summary_schema, summaries_schema

summary_bp = Blueprint('summary_bp', __name__, url_prefix='/summaries')

@summary_bp.route('/', methods=['POST'])
def create_summary():
    """Create a new summary with comprehensive error handling"""
    # Debug incoming request
    print("\n=== New Summary Request ===")
    print("Headers:", request.headers)
    print("Raw data:", request.data)
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400

        # Debug received data
        print("Parsed JSON:", data)

        # Validate required fields
        required_fields = ['content', 'user_id']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'error': 'Missing required fields',
                'missing': missing_fields,
                'received_data': data
            }), 400

        # Process user_id
        user_id = data['user_id']
        print(f"Processing user_id: {user_id} (type: {type(user_id)})")

        try:
            # Convert to int if string
            if isinstance(user_id, str):
                user_id = int(user_id)
        except (ValueError, TypeError):
            return jsonify({
                'error': 'Invalid user_id format',
                'details': f'Could not convert {user_id} to integer',
                'type_received': str(type(user_id))
            }), 400

        # Debug database state before query
        print("\nDatabase State Before Query:")
        print("All User IDs:", [u.id for u in User.query.all()])
        db.session.commit()  # Ensure clean session

        # Query user with explicit session
        user = db.session.query(User).get(user_id)
        print(f"User Query Result for ID {user_id}:", user)

        if not user:
            available_users = [u.id for u in User.query.all()]
            print("Available User IDs:", available_users)
            return jsonify({
                'error': 'User not found',
                'requested_id': user_id,
                'available_ids': available_users,
                'debug_note': 'User exists but query returned None. Check session/db connection.'
            }), 404

        # Process bookclub_id if provided
        bookclub_id = None
        if 'bookclub_id' in data and data['bookclub_id'] is not None:
            try:
                bookclub_id = int(data['bookclub_id'])
                bookclub = db.session.query(BookClub).get(bookclub_id)
                if not bookclub:
                    available_clubs = [b.id for b in BookClub.query.all()]
                    return jsonify({
                        'error': 'Book club not found',
                        'requested_id': bookclub_id,
                        'available_ids': available_clubs
                    }), 404
            except (ValueError, TypeError):
                return jsonify({
                    'error': 'Invalid bookclub_id format',
                    'details': 'Must be an integer or null'
                }), 400

        # Validate content
        content = data['content'].strip()
        if not content:
            return jsonify({'error': 'Content cannot be empty'}), 400

        # Create summary
        new_summary = Summary(
            content=content,
            user_id=user_id,
            bookclub_id=bookclub_id
        )

        db.session.add(new_summary)
        db.session.commit()

        print("Successfully created summary:", new_summary.id)
        return summary_schema.jsonify(new_summary), 201

    except Exception as e:
        db.session.rollback()
        print("\n!!! ERROR !!!")
        print("Type:", type(e))
        print("Details:", str(e))
        return jsonify({
            'error': 'Internal server error',
            'details': str(e),
            'stacktrace': str(e.__traceback__) if hasattr(e, '__traceback__') else None
        }), 500


@summary_bp.route('/', methods=['GET'])
def get_summaries():
    """Get all summaries with error handling"""
    try:
        summaries = Summary.query.all()
        return summaries_schema.jsonify(summaries), 200
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch summaries',
            'details': str(e)
        }), 500


@summary_bp.route('/<int:id>', methods=['GET'])
def get_summary(id):
    """Get a single summary by ID"""
    try:
        summary = Summary.query.get_or_404(id)
        return summary_schema.jsonify(summary), 200
    except Exception as e:
        return jsonify({
            'error': 'Summary not found',
            'requested_id': id,
            'details': str(e)
        }), 404


@summary_bp.route('/<int:id>', methods=['PUT'])
def update_summary(id):
    """Update an existing summary"""
    try:
        summary = Summary.query.get_or_404(id)
        data = request.get_json()

        # Validate content
        if 'content' in data:
            content = data['content'].strip()
            if not content:
                return jsonify({'error': 'Content cannot be empty'}), 400
            summary.content = content

        # Validate user_id
        if 'user_id' in data:
            try:
                user_id = int(data['user_id'])
                user = db.session.query(User).get(user_id)
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                summary.user_id = user_id
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid user_id format'}), 400

        # Validate bookclub_id
        if 'bookclub_id' in data:
            if data['bookclub_id'] is None:
                summary.bookclub_id = None
            else:
                try:
                    bookclub_id = int(data['bookclub_id'])
                    bookclub = db.session.query(BookClub).get(bookclub_id)
                    if not bookclub:
                        return jsonify({'error': 'Book club not found'}), 404
                    summary.bookclub_id = bookclub_id
                except (ValueError, TypeError):
                    return jsonify({'error': 'Invalid bookclub_id format'}), 400

        db.session.commit()
        return summary_schema.jsonify(summary), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update summary',
            'details': str(e)
        }), 500


@summary_bp.route('/<int:id>', methods=['DELETE'])
def delete_summary(id):
    """Delete a summary"""
    try:
        summary = Summary.query.get_or_404(id)
        db.session.delete(summary)
        db.session.commit()
        return jsonify({
            'message': 'Summary deleted successfully',
            'deleted_id': id
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to delete summary',
            'details': str(e)
        }), 500