from marshmallow import fields
from app import ma
from app.models.summary import Summary

class SummarySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Summary
        include_fk = True
        load_instance = True
    
    created_at = fields.DateTime(format='iso')
    updated_at = fields.DateTime(format='iso')

summary_schema = SummarySchema()
summaries_schema = SummarySchema(many=True)

_all_ = ['summary_schema', 'summaries_schema']