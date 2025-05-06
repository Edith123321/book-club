from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from .config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()

def create_app():
    app = Flask(__name__)  # Fixed: double underscores
    app.config.from_object(Config)

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    CORS(app)

    # Import models within app context
    with app.app_context():
        from app.models.user import User
        from app.models.book import Book
        from app.models.summary import Summary
        from app.models.review import Review
        from app.models.bookclub import BookClub
        from app.models.meeting import Meeting
        from app.models.invite import Invite
        from app.models.membership import Membership

        # Create tables
        db.create_all()

    # Import and register blueprints
    from app.routes.book_routes import book_bp
    from app.routes.summary_routes import summary_bp
    from app.routes.review_routes import review_bp
    from app.routes.bookclub_routes import bookclub_bp
    from app.routes.auth_routes import auth_bp
    from app.routes.user_routes import user_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.meeting_routes import meeting_bp
    from app.routes.membership_routes import membership_bp
    from app.routes.invite_routes import invite_bp
    from app.routes.following_routes import following_bp

    app.register_blueprint(book_bp)
    app.register_blueprint(summary_bp)
    app.register_blueprint(review_bp)
    app.register_blueprint(bookclub_bp, url_prefix='/bookclubs')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(meeting_bp, url_prefix='/meetings')
    app.register_blueprint(membership_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(invite_bp)
    app.register_blueprint(following_bp)

    return app