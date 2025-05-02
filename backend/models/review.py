from . import db

class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    title = db.Column(db.String(255))
    description = db.Column(db.Text)
    username = db.Column(db.String(100))

    def to_dict(self):
        return {
            'title': self.title,
            'description': self.description,
            'username': self.username
        }