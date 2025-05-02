import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = "postgresql://edith:edith@localhost:5432/book_club"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
