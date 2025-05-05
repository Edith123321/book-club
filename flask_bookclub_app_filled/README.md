# BookClub Flask API

## Setup

1. Install dependencies
```
pip install -r requirements.txt
```

2. Set up PostgreSQL and update `.env`

3. Run migrations:
```
flask db init
flask db migrate -m "initial"
flask db upgrade
```

4. Start server:
```
flask run
```
