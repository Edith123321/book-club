from marshmallow import Schema, fields
from marshmallow_enum import EnumField
from app.models import InviteStatus

class InviteSchema(Schema):
    id = fields.Int(dump_only=True)
    sender_id = fields.Int(required=True)
    recipient_id = fields.Int(required=True)
    bookclub_id = fields.Int(required=True)
    status = EnumField(InviteStatus, by_value=True, dump_default=InviteStatus.PENDING)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
