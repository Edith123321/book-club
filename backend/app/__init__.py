from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from .config import Config

db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    CORS(app)

    # Import models to register them with SQLAlchemy
    from app.models.user import User
    from app.models.book import Book
    from app.models.summary import Summary
    from app.models.review import Review
    from app.models.bookclub import BookClub

    # Import and register blueprints
    from app.routes.book_routes import book_bp
    from app.routes.summary_routes import summary_bp
    from app.routes.review_routes import review_bp
    from app.routes.bookclub_routes import bookclub_bp

    app.register_blueprint(book_bp)
    app.register_blueprint(summary_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(bookclub_bp, url_prefix='/bookclubs')
    return app
