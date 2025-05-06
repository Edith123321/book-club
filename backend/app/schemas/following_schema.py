from marshmallow import Schema, fields
from datetime import datetime

class FollowSchema(Schema):
    follower_id = fields.Int(required=True)
    followed_id = fields.Int(required=True)
    created_at = fields.DateTime(format='%Y-%m-%d %H:%M:%S')

follow_schema = FollowSchema()
follows_schema = FollowSchema(many=True)
