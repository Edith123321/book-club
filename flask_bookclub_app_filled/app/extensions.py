from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt  # Add this import

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()  # Add this line