from app import create_app, db
from app.models.book import Book
from app.models.summary import Summary
from app.models.review import Review
from app.models.bookclub import BookClub
from app.models.user import User
from app.models.bookclub import BookClub, BookClubMember
from werkzeug.security import generate_password_hash
from datetime import datetime
from faker import Faker

fake = Faker()

def seed_database():
    app = create_app()

    with app.app_context():
        print("🧹 Clearing existing data...")
        # Clear data in the right order
        Review.query.delete()
        Summary.query.delete()
        BookClubMember.query.delete()
        BookClub.query.delete()
        Book.query.delete()
        User.query.delete()
        db.session.commit()

        print("👤 Creating test users...")
        admin = User(
            username='admin',
            email='admin@bookclub.com',
            password_hash=generate_password_hash('admin123'),
            created_at=datetime.now()
        )

        member = User(
            username='booklover',
            email='member@bookclub.com',
            password_hash=generate_password_hash('password123'),
            created_at=datetime.now()
        )

        db.session.add_all([admin, member])
        db.session.commit()

        print("📚 Creating book clubs...")
        club1 = BookClub(
            name="Classic Literature Circle",
            owner_id=admin.id,
            synopsis=(
                "A gathering for enthusiasts of timeless literary works. We explore the depth and beauty of "
                "classic novels that have shaped literature across centuries. Our discussions focus on "
                "historical context, authorial intent, and modern relevance of these masterpieces. "
                "From Shakespeare to Austen, Dickens to Tolstoy - we celebrate the enduring power of "
                "great storytelling."
            ),
            created_at=datetime(2023, 1, 15)
        )

        club2 = BookClub(
            name="Sci-Fi & Fantasy Explorers",
            owner_id=member.id,
            synopsis=(
                "Venture into imaginative worlds beyond our own! This club journeys through the vast "
                "landscapes of science fiction and fantasy literature. We analyze world-building techniques, "
                "speculative technologies, and mythological influences. Whether you prefer hard sci-fi or "
                "epic fantasy, dystopias or space operas, join us in exploring the limitless possibilities "
                "of speculative fiction."
            ),
            created_at=datetime(2023, 2, 20)
        )

        db.session.add_all([club1, club2])
        db.session.commit()

        print("👥 Creating memberships...")
        membership1 = BookClubMember(user_id=admin.id, book_club_id=club1.id)
        membership2 = BookClubMember(user_id=member.id, book_club_id=club2.id)

        db.session.add_all([membership1, membership2])
        db.session.commit()

        print("📖 Adding books with detailed synopses...")
        books = [
            Book(
                title="1984",
                author="George Orwell",
                genres=["Dystopian", "Political Fiction", "Science Fiction"],
                rating=4.17,
                synopsis=(
                    "In a chilling dystopia where the Party maintains absolute control through pervasive surveillance "
                    "and psychological manipulation, Winston Smith works at the Ministry of Truth rewriting history. "
                    "When he begins a forbidden relationship with Julia and encounters the mysterious O'Brien, Winston "
                    "dares to imagine rebellion against Big Brother..."
                ),
                cover_image_url="https://example.com/images/1984.jpg",
                date_published=datetime(1949, 6, 8),
                language="English",
                pages=328,
                date_added=datetime.now()
            ),
            Book(
                title="To Kill a Mockingbird",
                author="Harper Lee",
                genres=["Classic", "Coming-of-Age", "Historical Fiction"],
                rating=4.28,
                synopsis=(
                    "Set in the racially charged American South during the Great Depression, this Pulitzer Prize-winning novel "
                    "follows young Scout Finch as her father, Atticus, defends Tom Robinson, a black man falsely accused of rape..."
                ),
                cover_image_url="https://example.com/images/mockingbird.jpg",
                date_published=datetime(1960, 7, 11),
                language="English",
                pages=281,
                date_added=datetime.now()
            ),
            Book(
                title="Dune",
                author="Frank Herbert",
                genres=["Science Fiction", "Adventure", "Space Opera"],
                rating=4.25,
                synopsis=(
                    "Set in a distant future amidst a feudal interstellar society, Dune tells the story of young Paul Atreides "
                    "as his family assumes control of the desert planet Arrakis, the only source of the universe's most valuable "
                    "substance: the spice melange..."
                ),
                cover_image_url="https://example.com/images/dune.jpg",
                date_published=datetime(1965, 8, 1),
                language="English",
                pages=412,
                date_added=datetime.now()
            )
        ]
        db.session.add_all(books)
        db.session.commit()

        print("✍ Adding summaries...")
        summaries = [
            Summary(
                content=(
                    "Orwell's 1984 remains one of the most powerful warnings against authoritarianism ever written..."
                ),
                book_id=books[0].id,
                user_id=admin.id,
                book_club_id=club1.id
            ),
            Summary(
                content=(
                    "To Kill a Mockingbird masterfully explores racial injustice through the innocent perspective of a child..."
                ),
                book_id=books[1].id,
                user_id=member.id,
                book_club_id=club1.id
            ),
            Summary(
                content=(
                    "Dune's brilliance lies in its intricate world-building and exploration of complex themes like "
                    "ecology, religion, and political power..."
                ),
                book_id=books[2].id,
                user_id=admin.id,
                book_club_id=club2.id
            )
        ]
        db.session.add_all(summaries)
        db.session.commit()

        print("⭐ Adding reviews...")
        reviews = [
            Review(
                content="Absolutely chilling in its portrayal of totalitarianism. The ending haunts me to this day.",
                rating=5,
                user_id=admin.id,
                book_id=books[0].id
            ),
            Review(
                content="A beautiful, heartbreaking story that remains painfully relevant.",
                rating=5,
                user_id=member.id,
                book_id=books[1].id
            ),
            Review(
                content="The world-building is unparalleled, but the pacing can be slow at times.",
                rating=4,
                user_id=admin.id,
                book_id=books[2].id
            )
        ]
        db.session.add_all(reviews)
        db.session.commit()

        print("✅ Database successfully seeded with:")
        print(f"- {len(books)} books")
        print(f"- 2 book clubs")
        print(f"- {len(summaries)} summaries")
        print(f"- {len(reviews)} reviews")
        print(f"- {User.query.count()} users")

if __name__ == '__main__':
    seed_database()
