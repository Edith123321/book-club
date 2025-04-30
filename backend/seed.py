from app import create_app, db
from app.models.book import Book
from app.models.summary import Summary
from app.models.review import Review  # ✅ Import Review model
from datetime import datetime

app = create_app()

with app.app_context():
    # Clear existing records in proper order
    Review.query.delete()     # ✅ Delete reviews first due to FK constraints
    Summary.query.delete()
    Book.query.delete()

    #  Seed Books
    books = [
        Book(
            title="1984",
            author="George Orwell",
            genre="Dystopian",
            year=1949,
            description="A dystopian novel about surveillance and totalitarianism."
        ),
        Book(
            title="To Kill a Mockingbird",
            author="Harper Lee",
            genre="Classic",
            year=1960,
            description="A novel on race, class, and justice in the American South."
        ),
        Book(
            title="The Great Gatsby",
            author="F. Scott Fitzgerald",
            genre="Tragedy",
            year=1925,
            description="A story of wealth, love, and the American dream."
        )
    ]
    db.session.add_all(books)
    db.session.commit()

    print("Books committed:")
    for book in books:
        print(f"Book {book.title} has ID {book.id}")

    #  Seed Summaries
    summaries = [
        Summary(content="An insightful warning about totalitarianism.", book_id=books[0].id),
        Summary(content="A touching story about racial injustice.", book_id=books[1].id),
        Summary(content="An examination of the American Dream gone wrong.", book_id=books[2].id)
    ]
    db.session.add_all(summaries)
    db.session.commit()

    # ✅ Seed Reviews
    reviews = [
        Review(content="Loved the deep themes and writing style!", rating=5, user_id=1, book_id=books[0].id),
        Review(content="Powerful and emotional narrative.", rating=4, user_id=1, book_id=books[1].id),
        Review(content="Didn’t connect much with the characters.", rating=3, user_id=1, book_id=books[2].id)
    ]
    db.session.add_all(reviews)
    db.session.commit()

    print("✅ Database seeded with books, summaries, and reviews.")
