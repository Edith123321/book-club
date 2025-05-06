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
        """Custom user creation with additional validation"""
        # Manual validation as backup
        if not validate_email(data['email']):
            raise ValidationError("Invalid email format", "email")
        if not validate_password(data['password']):
            raise ValidationError("Password must be 8+ chars with letters and numbers", "password")
        if not validate_username(data['username']):
            raise ValidationError("Invalid username format", "username")

        # Check for existing users
        if User.query.filter_by(email=data['email']).first():
            raise ValidationError("Email already registered", "email")
        if User.query.filter_by(username=data['username']).first():
            raise ValidationError("Username already taken", "username")

        user = User(
            username=data['username'],
            email=data['email'],
            is_admin=False
        )
        user.password = data['password']  # Triggers password hashing
        return user

class UserLoginSchema(Schema):
    email = fields.Email(required=True, validate=validate.Email())
    password = fields.Str(required=True, load_only=True)

class UserPublicSchema(BaseUserSchema):
    """For API responses - excludes sensitive data"""
    class Meta:
        fields = ('id', 'username', 'email', 'is_admin', 'created_at')

class UserUpdateSchema(Schema):
    username = fields.Str(validate=[
        validate.Length(min=3, max=50),
        validate.Regexp(r'^[a-zA-Z0-9_]+$')
    ])
    email = fields.Email(validate=validate.Length(max=100))
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