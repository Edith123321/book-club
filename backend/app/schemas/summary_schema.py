from app.models.summary import Summary
from app import ma
 

class SummarySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Summary
        load_instance = True
        include_relationships = False
        include_fk = True

summary_schema = SummarySchema()
summaries_schema = SummarySchema(many=True)
