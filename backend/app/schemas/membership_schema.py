from marshmallow import fields
from app import ma
from app.models import Membership

class MembershipSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Membership
        include_fk = True
        load_instance = True
    
    # Customizing fields if necessary
    joined_at = fields.DateTime(format='iso')
    user = fields.Nested('UserSchema', exclude=('password_hash',))
    bookclub = fields.Nested('BookClubSchema', exclude=('memberships',))

membership_schema = MembershipSchema()
memberships_schema = MembershipSchema(many=True)
