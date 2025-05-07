from dotenv import load_dotenv
load_dotenv()

from app import create_app, db
from app.models.book import Book
from app.models.summary import Summary
from app.models.review import Review
from app.models.user import User
from datetime import datetime

app = create_app()

def upsert_user(session, username, email):
    user = session.query(User).filter_by(username=username).first()
    if user:
        user.email = email
    else:
        user = User(username=username, email=email)
        session.add(user)
    return user

def upsert_book(session, title, author, genre, year, description):
    book = session.query(Book).filter_by(title=title).first()
    if book:
        book.author = author
        book.genre = genre
        book.year = year
        book.description = description
    else:
        book = Book(title=title, author=author, genre=genre, year=year, description=description)
        session.add(book)
    return book

def upsert_summary(session, content, book_id):
    summary = session.query(Summary).filter_by(book_id=book_id).first()
    if summary:
        summary.content = content
    else:
        summary = Summary(content=content, book_id=book_id)
        session.add(summary)
    return summary

def upsert_review(session, content, rating, user_id, book_id):
    review = session.query(Review).filter_by(user_id=user_id, book_id=book_id).first()
    if review:
        review.content = content
        review.rating = rating
    else:
        review = Review(content=content, rating=rating, user_id=user_id, book_id=book_id)
        session.add(review)
    return review

with app.app_context():
    # Seed Users
    user = upsert_user(db.session, "testuser", "testuser@example.com")
    db.session.commit()

    # Seed Books
    book1 = upsert_book(db.session, "1984", "George Orwell", "Dystopian", 1949, "A dystopian novel about surveillance and totalitarianism.")
    book2 = upsert_book(db.session, "To Kill a Mockingbird", "Harper Lee", "Classic", 1960, "A novel on race, class, and justice in the American South.")
    book3 = upsert_book(db.session, "The Great Gatsby", "F. Scott Fitzgerald", "Tragedy", 1925, "A story of wealth, love, and the American dream.")
    db.session.commit()

    print("Books committed:")
    print(f"Book {book1.title} has ID {book1.id}")
    print(f"Book {book2.title} has ID {book2.id}")
    print(f"Book {book3.title} has ID {book3.id}")

    # Seed Summaries
    upsert_summary(db.session, "An insightful warning about totalitarianism.", book1.id)
    upsert_summary(db.session, "A touching story about racial injustice.", book2.id)
    upsert_summary(db.session, "An examination of the American Dream gone wrong.", book3.id)
    db.session.commit()

    # Seed Reviews
    upsert_review(db.session, "Loved the deep themes and writing style!", 5, user.id, book1.id)
    upsert_review(db.session, "Powerful and emotional narrative.", 4, user.id, book2.id)
    upsert_review(db.session, "Didn’t connect much with the characters.", 3, user.id, book3.id)
    db.session.commit()

    print("✅ Database seeded with users, books, summaries, and reviews.")
