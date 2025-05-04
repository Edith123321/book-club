from marshmallow import Schema, fields, validate, post_load
from app.models import User

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True, validate=validate.Length(max=100))
    is_admin = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class UserCreateSchema(UserSchema):
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))

    @post_load
    def make_user(self, data, **kwargs):
        user = User(
            username=data["username"],
            email=data["email"]
        )
        user.password = data["password"]  # This uses the password setter for hashing
        return user


class UserLoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)
