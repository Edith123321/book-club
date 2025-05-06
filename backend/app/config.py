class Config:
    SQLALCHEMY_DATABASE_URI = 'postgresql://bookclub_user:syowai@localhost:5432/bookclub_db'  # Adjust for your DB
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # To disable the modification tracking
    SECRET_KEY = 'your_secret_key_here'  # Your secret key for session management
