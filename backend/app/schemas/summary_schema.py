from app import ma
from app.models.summary import Summary

class SummarySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Summary
        load_instance = True

summary_schema = SummarySchema()
summaries_schema = SummarySchema(many=True)
