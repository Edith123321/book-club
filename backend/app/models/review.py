from app.extensions import db  # ✅ CORRECT
from datetime import datetime

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    # Temporarily remove foreign key constraints
    user_id = db.Column(db.Integer, nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)  # Establish foreign key to books table

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

   
    book = db.relationship('Book', back_populates='reviews')

    def __repr__(self):
        return f"<Review id={self.id} rating={self.rating}>"
