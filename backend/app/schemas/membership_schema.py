from app import ma
from app.models.membership import Membership

class MembershipSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Membership
        load_instance = True

membership_schema = MembershipSchema()
memberships_schema = MembershipSchema(many=True)
