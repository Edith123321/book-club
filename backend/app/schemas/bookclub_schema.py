from marshmallow import Schema, fields

class BookClubSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    description = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
