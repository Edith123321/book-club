from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from .config import Config
from flask_jwt_extended import JWTManager

# Initialize extensions without binding to app
db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()
cors = CORS()
jwt = JWTManager()

def create_app(config_class=Config):
    """Application factory function"""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    cors.init_app(app)
    jwt.init_app(app)

    # Import and register blueprints
    register_blueprints(app)

    # Import models AFTER db initialization
    with app.app_context():
        from app.models.user import User
        from app.models.book import Book
        from app.models.summary import Summary
        from app.models.review import Review
        from app.models.bookclub import BookClub
        from app.models.meeting import Meeting
        from app.models.invite import Invite
        from app.models.membership import Membership
        
        # Only create tables if not using migrations
        if not app.config.get('MIGRATIONS_ENABLED', True):
            db.create_all()

    return app

def register_blueprints(app):
    """Register all application blueprints"""
    # Import blueprints inside the function to avoid circular imports
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

    app.register_blueprint(book_bp, url_prefix='/books')
    app.register_blueprint(summary_bp, url_prefix='/summaries')
    app.register_blueprint(review_bp, url_prefix='/reviews')
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(following_bp, url_prefix='/follow')
    app.register_blueprint(bookclub_bp, url_prefix='/bookclubs')
    app.register_blueprint(meeting_bp, url_prefix='/meetings')
    app.register_blueprint(membership_bp, url_prefix='/memberships')
    app.register_blueprint(invite_bp, url_prefix='/invites')
    app.register_blueprint(admin_bp, url_prefix='/admin')

    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy'}, 200