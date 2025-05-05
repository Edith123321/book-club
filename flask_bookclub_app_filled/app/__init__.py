from flask import Flask
from flask_cors import CORS  
from .extensions import db, migrate, bcrypt

def create_app(config_class=None):
    app = Flask(__name__)
    
    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI='postgresql://edith:edith@localhost:5432/bookclub',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SECRET_KEY='your-secret-key-here',  # Should be an environment variable in production
        JSON_SORT_KEYS=False  # Maintain JSON response order
    )
    
    if config_class:
        app.config.from_object(config_class)
    
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    
    CORS(app)  
    
    from .routes import bp as main_bp
    app.register_blueprint(main_bp)
    
    with app.app_context():
        db.create_all()
    
    return app