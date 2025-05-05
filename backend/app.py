from flask import Flask, jsonify
from flask_migrate import Migrate
from config import Config
from models import db
from models.book import Book
from models.book_club import BookClub
from models.review import Review
from models.genre import Genre
from models.member import Member
from models.meeting import Meeting
from models.discussion import Discussion
from models.current_book import CurrentBook

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
migrate = Migrate(app, db)

@app.route('/')
def index():
    return jsonify({"message": "Book Club API"})

# Import blueprints/controllers here later

if __name__ == '__main__':
    app.run(debug=True)