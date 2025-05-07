import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

class Config:
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://bookclub_user:syowai@localhost:5432/bookclub_db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Security Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_fallback_secret_key_here')  # For Flask sessions
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)  # Default to SECRET_KEY if not set
    
    # JWT Configuration
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # Token expiration time
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)  # Refresh token expiration
    
    # Application Settings
    DEBUG = os.getenv('FLASK_DEBUG', 'False') == 'True'
    TESTING = False
    
    # CORS Configuration (if needed)
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '').split(',') if os.getenv('CORS_ORIGINS') else []
