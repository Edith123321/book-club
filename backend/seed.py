from app import create_app, db
from app.models.book import Book

app = create_app()

with app.app_context():
    # Optional: Clear existing books
    Book.query.delete()

    # Seed books
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

    print("📚 Database seeded successfully with book data.")
