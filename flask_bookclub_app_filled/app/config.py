import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://edith:edith@localhost:5432/bookclub')
    SQLALCHEMY_TRACK_MODIFICATIONS = False