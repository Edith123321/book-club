from marshmallow import fields
from app import ma
from app.models.meeting import Meeting

class MeetingSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Meeting
        include_fk = True
        load_instance = True
    
    created_at = fields.DateTime(format='iso')
    updated_at = fields.DateTime(format='iso')
    meeting_time = fields.DateTime(format='iso')

# Create schema instances
meeting_schema = MeetingSchema()
meetings_schema = MeetingSchema(many=True)

# Explicitly export the schemas
_all_ = ['meeting_schema', 'meetings_schema']