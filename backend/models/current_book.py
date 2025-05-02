from models import db

class CurrentBook(db.Model):
    __tablename__ = 'current_books'

    id = db.Column(db.Integer, primary_key=True)
    book_club_id = db.Column(db.Integer, db.ForeignKey('book_clubs.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    author = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    cover_url = db.Column(db.String(500))
    progress = db.Column(db.String(100))
    pages_read = db.Column(db.String(50))

    book_club = db.relationship('BookClub', back_populates='current_book')

    def to_dict(self):
        return {
            'title': self.title,
            'author': self.author,
            'description': self.description,
            'cover': self.cover_url,
            'progress': self.progress,
            'pagesRead': self.pages_read
        }