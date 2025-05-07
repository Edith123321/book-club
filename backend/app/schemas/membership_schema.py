from marshmallow import fields
from app import ma
from app.models import Membership
from app.schemas.user_schema import UserPublicSchema
from app.schemas.bookclub_schema import BookClubSchema

class MembershipSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Membership
        include_fk = True
        load_instance = True

    joined_at = fields.DateTime(format='iso')
    user = fields.Nested(UserPublicSchema)
    bookclub = fields.Nested(BookClubSchema)  # ✅ No 'memberships' to exclude

membership_schema = MembershipSchema()
memberships_schema = MembershipSchema(many=True)
