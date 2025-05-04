from flask import Blueprint, request, jsonify
from app import db
from app.schemas.meeting_schema import MeetingSchema  # Only import the schema
from app.models import Meeting

# Initialize the schema
meeting_schema = MeetingSchema()
meetings_schema = MeetingSchema(many=True)

meeting_bp = Blueprint('meeting', __name__)

# Create a new meeting
@meeting_bp.route('/', methods=['POST'])
def create_meeting():
    data = request.get_json()
    try:
        # Validate the incoming data with the schema
        meeting = meeting_schema.load(data)

        # Create the meeting
        new_meeting = Meeting(
            bookclub_id=meeting['bookclub_id'],
            meeting_date=meeting['meeting_date'],
            agenda=meeting['agenda']
        )
        db.session.add(new_meeting)
        db.session.commit()

        return meeting_schema.jsonify(new_meeting), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Get all meetings
@meeting_bp.route('/', methods=['GET'])
def get_all_meetings():
    meetings = Meeting.query.all()
    return meetings_schema.jsonify(meetings)

# Get a specific meeting by ID
@meeting_bp.route('/<int:id>', methods=['GET'])
def get_meeting(id):
    meeting = Meeting.query.get(id)
    if not meeting:
        return jsonify({'message': 'Meeting not found'}), 404
    return meeting_schema.jsonify(meeting)

# Update a meeting
@meeting_bp.route('/<int:id>', methods=['PUT'])
def update_meeting(id):
    meeting = Meeting.query.get(id)
    if not meeting:
        return jsonify({'message': 'Meeting not found'}), 404

    data = request.get_json()
    try:
        # Validate and update fields
        meeting.meeting_date = data.get('meeting_date', meeting.meeting_date)
        meeting.agenda = data.get('agenda', meeting.agenda)

        db.session.commit()
        return meeting_schema.jsonify(meeting)

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Delete a meeting
@meeting_bp.route('/<int:id>', methods=['DELETE'])
def delete_meeting(id):
    meeting = Meeting.query.get(id)
    if not meeting:
        return jsonify({'message': 'Meeting not found'}), 404

    db.session.delete(meeting)
    db.session.commit()
    return jsonify({'message': 'Meeting deleted successfully'}), 200
