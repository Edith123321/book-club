from app import create_app
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create Flask application
app = create_app()

# ✅ Correct CORS configuration — allows all routes, not just /api/*
CORS(app, resources={
    r"/*": {
        "origins": os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(','),
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

if __name__ == '__main__':
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', '5000'))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')
    
    app.run(
        host=host,
        port=port,
        debug=debug,
        threaded=True
    )
