from app import create_app, db
from app.models.book import Book
from app.models.summary import Summary
from datetime import datetime

app = create_app()

with app.app_context():
    # Clear any existing records (optional, to avoid duplicates)
    Summary.query.delete()  # Delete summaries first to avoid foreign key constraint issues
    Book.query.delete()     # Now delete books after summaries

    # Step 1: Seed Books
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

    # Add books to the session
    db.session.add_all(books)
    
    # Step 2: Commit the Books to the Database
    db.session.commit()  # This saves the books and assigns them IDs

    # Step 3: Check if books have been committed (optional debugging)
    print("Books committed:")
    for book in books:
        print(f"Book {book.title} has ID {book.id}")

    # Step 4: Seed Summaries
    summaries = [
        Summary(content="An insightful warning about totalitarianism.", book_id=books[0].id),
        Summary(content="A touching story about racial injustice.", book_id=books[1].id),
        Summary(content="An examination of the American Dream gone wrong.", book_id=books[2].id)
    ]

    # Add summaries to the session
    db.session.add_all(summaries)

    # Step 5: Commit the Summaries to the Database
    db.session.commit()

    print("📚 Database seeded successfully with book and summary data.")


