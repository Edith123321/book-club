from app import db

class Summary(db.Model):
    __tablename__ = 'summaries'

    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(500))
    book_id = db.Column(db.Integer, db.ForeignKey('books.id', ondelete='CASCADE'))  # Ensure ondelete='CASCADE'
    book = db.relationship('Book', back_populates='summaries')

    def __init__(self, content, book_id):
        self.content = content
        self.book_id = book_id

    def __repr__(self):
        return f'<Summary for Book {self.book_id}>'

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "book_id": self.book_id
        }
