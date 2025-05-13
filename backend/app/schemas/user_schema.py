from marshmallow import Schema, fields, validate, post_load, ValidationError
from app.models import User
from app.utils import validate_email, validate_password, validate_username
from datetime import datetime
import re

class BaseUserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=[
        validate.Length(min=3, max=50),
        validate.Regexp(r'^[a-zA-Z0-9_]+$', error="Only letters, numbers and underscores allowed")
    ])
    email = fields.Email(required=True, validate=[
        validate.Length(max=100),
        validate.Email(error="Not a valid email address")
    ])
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    is_admin = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    last_login = fields.DateTime(dump_only=True)

class UserCreateSchema(BaseUserSchema):
    password = fields.Str(
        required=True,
        load_only=True,
        validate=[
            validate.Length(min=8),
            validate.Regexp(
                r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$',
                error="Password must contain at least one uppercase, lowercase letter and number"
            )
        ]
    )

    @post_load
    def make_user(self, data, **kwargs):
        # Auto-generate username if not provided
        if 'username' not in data or not data['username']:
            data['username'] = f"{data['first_name'].lower()}_{data['last_name'].lower()}"
    
        # Clean username to remove invalid characters
        data['username'] = re.sub(r'[^a-zA-Z0-9_]', '', data['username'])
    
        return data  # ✅ You MUST return the modified data


class UserLoginSchema(Schema):
    email = fields.Email(required=True, validate=validate.Email())
    password = fields.Str(required=True, load_only=True)

class UserPublicSchema(BaseUserSchema):
    """For API responses - excludes sensitive data"""
    class Meta:
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                 'is_admin', 'created_at', 'last_login')

class UserUpdateSchema(Schema):
    username = fields.Str(validate=[
        validate.Length(min=3, max=50),
        validate.Regexp(r'^[a-zA-Z0-9_]+$')
    ])
    email = fields.Email(validate=validate.Length(max=100))
    first_name = fields.Str(validate=validate.Length(min=1, max=50))
    last_name = fields.Str(validate=validate.Length(min=1, max=50))
    current_password = fields.Str(load_only=True)
    new_password = fields.Str(load_only=True, validate=[
        validate.Length(min=8),
        validate.Regexp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$')
    ])

# Schema instances
user_schema = UserPublicSchema()
user_create_schema = UserCreateSchema()
user_login_schema = UserLoginSchema()
user_update_schema = UserUpdateSchema()
users_schema = UserPublicSchema(many=True)