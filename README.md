updated README.md
# Book Club

## Project Overview
Book Club is a web application designed to help users create and join book clubs, share book recommendations, and engage with other readers. The project consists of a backend API built with Python and a frontend built with React.

## Features
- User registration and authentication
- Create and manage book clubs
- Join existing book clubs
- Share and discuss book recommendations
- Responsive user interface

## Technologies Used
- Backend: Python, Flask (assumed from typical structure), SQLAlchemy, Alembic for database migrations
- Frontend: React, HTML, CSS
- Database: Relational database (e.g., PostgreSQL or SQLite)

## Backend Setup
### Prerequisites
- Python 3.x installed
- Virtual environment tool (optional but recommended)
- Database setup (PostgreSQL, SQLite, or other supported by SQLAlchemy)

### Installation
1. Create and activate a virtual environment:
   python3 -m venv venv
   source venv/bin/activate
   
2. Install dependencies:
   pip install -r backend/requirements.txt

3. Configure your database connection in `backend/app/config.py`.

### Database Migrations
To apply database migrations, run:
cd backend
alembic upgrade head


### Seeding the Database
To seed the database with initial test data, run:
python3 backend/seed.py

### Running the Backend Server
Run the backend server with:
 flask run


## Frontend Setup
### Prerequisites
- Node.js and npm installed

### Installation and Running
1. Navigate to the frontend directory:
   cd frontend

2. Install dependencies:
   npm install

3. Start the development server:
   npm run dev

4. Open your browser and go to `http://localhost:5173`.

## API Endpoints (Backend)
### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login (returns JWT token) |
| `/auth/register` | POST | Register new user |

### Health Check
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service status check |

### Users
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users/` | GET | Get all users |
| `/users/` | POST | Create new user |
| `/users/<int:user_id>` | GET | Get specific user |
| `/users/<int:user_id>` | PUT | Update user |
| `/users/<int:user_id>` | DELETE | Delete user |
| `/users/<int:user_id>/activate` | PATCH | Activate user |
| `/users/<int:user_id>/deactivate` | PATCH | Deactivate user |
| `/users/default-avatar` | GET | Get default avatar |

### Book Clubs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/bookclubs/` | GET | Get all book clubs |
| `/bookclubs/` | POST | Create new book club |
| `/bookclubs/<int:club_id>` | GET | Get specific book club |
| `/bookclubs/<int:club_id>` | PUT | Update book club |
| `/bookclubs/<int:club_id>` | DELETE | Delete book club |

### Books
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/books/` | GET | Get all books |
| `/books/` | POST | Add new book |
| `/books/<int:id>` | GET | Get specific book |
| `/books/<int:id>` | PUT | Update book |
| `/books/<int:id>` | DELETE | Delete book |

### Meetings
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/meetings/` | GET | Get all meetings |
| `/meetings/` | POST | Create new meeting |
| `/meetings/<int:id>` | GET | Get specific meeting |
| `/meetings/<int:id>` | PUT | Update meeting |
| `/meetings/<int:id>` | DELETE | Delete meeting |

### Reviews
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reviews/` | GET | Get all reviews |
| `/reviews/` | POST | Create new review |
| `/reviews/<int:id>` | GET | Get specific review |
| `/reviews/<int:id>` | PUT | Update review |
| `/reviews/<int:id>` | DELETE | Delete review |

### Summaries
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/summaries/` | GET | Get all summaries |
| `/summaries/` | POST | Create new summary |
| `/summaries/<int:id>` | GET | Get specific summary |
| `/summaries/<int:id>` | PUT | Update summary |
| `/summaries/<int:id>` | DELETE | Delete summary |

### Following
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/follow/<int:user_id>` | GET | Check if following user |
| `/follow/<int:user_id>` | POST | Follow user |
| `/follow/<int:user_id>` | DELETE | Unfollow user |
| `/follow/me/followers` | GET | Get current user's followers |
| `/follow/me/following` | GET | Get who current user follows |
| `/follow/<int:user_id>/followers` | GET | Get user's followers |
| `/follow/<int:user_id>/following` | GET | Get who user follows |

### Memberships
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/memberships/memberships` | GET | Get all memberships |
| `/memberships/bookclubs/<int:bookclub_id>/memberships` | POST | Create membership |
| `/memberships/memberships/<int:id>` | GET | Get specific membership |
| `/memberships/memberships/<int:id>` | PUT | Update membership |
| `/memberships/memberships/<int:id>` | DELETE | Delete membership |

### Invitations
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/invites/` | POST | Send invitation |
| `/invites/sent` | GET | Get sent invitations |
| `/invites/accept/<token>` | POST | Accept invitation |

### Admin Endpoints
Require admin privileges

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/users` | GET | Get all users (admin) |
| `/admin/users/<int:user_id>` | GET | Get user (admin) |
| `/admin/users/<int:user_id>` | PUT | Update user (admin) |
| `/admin/users/<int:user_id>` | DELETE | Delete user (admin) |
| `/admin/book-clubs` | GET | Get all book clubs (admin) |
| `/admin/book-clubs/<int:club_id>` | GET | Get book club (admin) |
| `/admin/book-clubs/<int:club_id>` | DELETE | Delete book club (admin) |

## Error Responses
Standard error responses include:
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting
API is rate limited to 100 requests per minute per IP address.


## Contributing
Contributions are welcome! Please fork the repository and create a pull request. Please follow the existing code style and include tests for new features.

## Support
For support, please open an issue on the GitHub repository or contact the project maintainer.

## License
This project is licensed by MLT.