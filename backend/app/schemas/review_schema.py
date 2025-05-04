from app import ma
from app.models import Review

class ReviewSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Review
        load_instance = True

    id = ma.auto_field()
    content = ma.auto_field()
    rating = ma.auto_field()
    user_id = ma.auto_field()
    book_id = ma.auto_field()
    created_at = ma.auto_field()

review_schema = ReviewSchema()
reviews_schema = ReviewSchema(many=True)
