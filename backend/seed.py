from app import create_app, db
from app.models.book import Book
from app.models.summary import Summary
from app.models.review import Review
from app.models.bookclub import BookClub
from app.models.user import User
from app.models.invite import Invite, InviteStatus
from app.models.following import follows as follows_table
from app.models.meeting import Meeting
from app.models.membership import Membership
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
from sqlalchemy import text, inspect
import traceback
from app.utils import generate_invite_token
import random
import logging
from sqlalchemy import MetaData


logger = logging.getLogger(__name__)

def clear_database():
    """Clear all data from database while respecting foreign key constraints"""
    print("🧹 Clearing existing data...")
   
    try:
        # Get metadata and reflect all tables
        meta = MetaData()
        meta.reflect(bind=db.engine)
       
        # Define tables in proper deletion order to respect foreign keys
        tables_to_clear = [
            'invite', 'reviews', 'summaries',
            'meetings', 'follows', 'memberships',
            'bookclubs', 'books', 'users'
        ]
       
        # Disable foreign key checks (alternative approach)
        db.session.execute(text('SET CONSTRAINTS ALL DEFERRED'))
        db.session.commit()
       
        # Clear each table
        for table_name in tables_to_clear:
            if table_name not in meta.tables:
                print(f"⚠ Table {table_name} not found - skipping")
                continue
           
            print(f"  Clearing {table_name}...")
            db.session.execute(text(f'DELETE FROM {table_name}'))
            db.session.commit()
       
        print("✅ Database cleared successfully")
        return True
       
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error clearing database: {e}")
        traceback.print_exc()
        return False
       
        # Ensure foreign key checks are re-enabled
        try:
            db.session.execute(text('SET session_replication_role = DEFAULT;'))
            db.session.commit()
        except Exception as e:
            print(f"⚠ Could not re-enable constraints: {e}")
           
        return False

def seed_users():
    """Seed 10 test users with realistic data"""
    print("👤 Creating test users...")
    users = [
        User(
            username='admin',
            first_name='Caroline',
            last_name='Syowai',
            email='admin@bookclub.com',
            password='admin123',  # Will be hashed automatically
            created_at=datetime.now() - timedelta(days=100),
            last_login=datetime.now(),
            is_active=True,
            is_admin=True,
            bio='System administrator and book enthusiast',
            avatar_url='https://example.com/avatars/admin.jpg'
        ),
        User(
            username='bookworm',
            first_name='Caroline',
            last_name='Syowai',
            email='bookworm@example.com',
            password='readmore123',
            created_at=datetime.now() - timedelta(days=90),
            last_login=datetime.now() - timedelta(days=2),
            is_active=True,
            bio='Voracious reader of all genres',
            avatar_url='https://example.com/avatars/bookworm.jpg'
        ),
        User(
            username='literaturelover',
            first_name='Caroline',
            last_name='Syowai',
            email='litlover@example.com',
            password='classics456',
            created_at=datetime.now() - timedelta(days=80),
            last_login=datetime.now() - timedelta(days=5),
            is_active=True,
            bio='Classic literature specialist',
            avatar_url='https://example.com/avatars/literature.jpg'
        ),
        User(
            username='scififan',
            email='scifi@example.com',
            first_name='Caroline',
            last_name='Syowai',
            password='spacetravel1',
            created_at=datetime.now() - timedelta(days=70),
            last_login=datetime.now() - timedelta(hours=12),
            is_active=True,
            bio='Science fiction and fantasy lover',
            avatar_url='https://example.com/avatars/scifi.jpg'
        ),
        User(
            username='mysteryreader',
            email='mystery@example.com',
            password='whodunit789',
            created_at=datetime.now() - timedelta(days=60),
            last_login=datetime.now() - timedelta(days=1),
            is_active=True,
            bio='Always trying to solve the mystery first',
            avatar_url='https://example.com/avatars/mystery.jpg'
        ),
        User(
            username='historybuff',
            email='history@example.com',
            password='pasttimes2',
            created_at=datetime.now() - timedelta(days=50),
            last_login=datetime.now() - timedelta(days=3),
            is_active=True,
            bio='Historical fiction and non-fiction reader',
            avatar_url='https://example.com/avatars/history.jpg'
        ),
        User(
            username='poetrylover',
            email='poetry@example.com',
            first_name='Caroline',
            last_name='Syowai',
            password='verses456',
            created_at=datetime.now() - timedelta(days=40),
            last_login=datetime.now() - timedelta(hours=6),
            is_active=True,
            bio='Contemporary and classic poetry',
            avatar_url='https://example.com/avatars/poetry.jpg'
        ),
        User(
            username='fantasyfan',
            email='fantasy@example.com',
            first_name='Caroline',
            last_name='Syowai',
            password='dragons123',
            created_at=datetime.now() - timedelta(days=30),
            last_login=datetime.now() - timedelta(days=4),
            is_active=True,
            bio='Epic fantasy and worldbuilding enthusiast',
            avatar_url='https://example.com/avatars/fantasy.jpg'
        ),
        User(
            username='biographyreader',
            email='bio@example.com',
            password='lifestories7',
            created_at=datetime.now() - timedelta(days=20),
            last_login=datetime.now() - timedelta(hours=3),
            is_active=True,
            bio='Fascinated by people\'s life stories',
            avatar_url='https://example.com/avatars/biography.jpg'
        ),
        User(
            username='youngadult',
            email='ya@example.com',
            first_name='Caroline',
            last_name='Syowai',
            password='teenreads8',
            created_at=datetime.now() - timedelta(days=10),
            last_login=datetime.now(),
            is_active=True,
            bio='Young adult fiction specialist',
            avatar_url='https://example.com/avatars/ya.jpg'
        )
    ]
    db.session.add_all(users)
    db.session.commit()
    return users

def seed_books():
    """Seed 10 books with complete details"""
    print("📖 Adding books...")
    books = [
        Book(
            title="1984",
            author="George Orwell",
            genres=["Dystopian", "Political Fiction"],
            rating=4.17,
            synopsis="A dystopian novel set in a totalitarian regime where even thoughts are controlled.",
            cover_image_url="https://m.media-amazon.com/images/I/71kXYs4tCvL._AC_UF1000,1000_QL80_.jpg",
            date_published=datetime(1949, 6, 8),
            pages=328,
            language="English"
        ),
        Book(
            title="To Kill a Mockingbird",
            author="Harper Lee",
            genres=["Classic", "Southern Gothic"],
            rating=4.28,
            synopsis="A story of racial injustice and moral growth in the American South.",
            cover_image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg/1200px-To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg",
            date_published=datetime(1960, 7, 11),
            pages=281,
            language="English"
        ),
        Book(
            title="Dune",
            author="Frank Herbert",
            genres=["Science Fiction", "Space Opera"],
            rating=4.25,
            synopsis="A science fiction epic about politics, religion, and ecology on a desert planet.",
            cover_image_url="https://i0.wp.com/kibangabooks.com/wp-content/uploads/2023/12/Dune-book-by-Frank-Herbert1716096236.jpg?fit=720%2C720&ssl=1",
            date_published=datetime(1965, 8, 1),
            pages=412,
            language="English"
        ),
        Book(
            title="Pride and Prejudice",
            author="Jane Austen",
            genres=["Classic", "Romance"],
            rating=4.28,
            synopsis="The romantic clash between Elizabeth Bennet and the proud Mr. Darcy.",
            cover_image_url= "https://i.ebayimg.com/images/g/~WkAAOSwanRhXs5S/s-l960.webp",
            date_published=datetime(1813, 1, 28),
            pages=279,
            language="English"
        ),
        Book(
            title="The Great Gatsby",
            author="F. Scott Fitzgerald",
            genres=["Classic", "Literary Fiction"],
            rating=3.93,
            synopsis="A portrait of the Jazz Age and the American Dream's corruption.",
            cover_image_url="https://eachdaykart.com/cdn/shop/files/36_a1f6255b-f9cd-45f9-a89e-653667ac8bc2_457x707.webp?v=1729874774",
            date_published=datetime(1925, 4, 10),
            pages=180,
            language="English"
        ),
        Book(
            title="The Hobbit",
            author="J.R.R. Tolkien",
            genres=["Fantasy", "Adventure"],
            rating=4.28,
            synopsis="The adventure of Bilbo Baggins, a hobbit who embarks on an unexpected journey.",
            cover_image_url="https://booksandyou.in/cdn/shop/files/TheCatcherintheRye_1.webp?v=1714498776&width=713",
            date_published=datetime(1937, 9, 21),
            pages=310,
            language="English"
        ),
        Book(
            title="Brave New World",
            author="Aldous Huxley",
            genres=["Dystopian", "Science Fiction"],
            rating=3.99,
            synopsis="A dystopian novel set in a futuristic World State with genetically modified citizens.",
            cover_image_url="https://cdn.shoplightspeed.com/shops/611345/files/5297743/mariner-books-the-lord-of-the-rings-omnibus-1-3.jpg",
            date_published=datetime(1932, 1, 1),
            pages=288,
            language="English"
        ),
        Book(
            title="The Catcher in the Rye",
            author="J.D. Salinger",
            genres=["Classic", "Coming-of-Age"],
            rating=3.81,
            synopsis="Holden Caulfield's peculiar odyssey through New York streets.",
            cover_image_url="https://i.ebayimg.com/images/g/gWwAAeSwh5JoElb0/s-l1600.webp",
            date_published=datetime(1951, 7, 16),
            pages=234,
            language="English"
        ),
        Book(
            title="The Lord of the Rings",
            author="J.R.R. Tolkien",
            genres=["Fantasy", "Adventure"],
            rating=4.52,
            synopsis="The epic tale of Frodo Baggins and his quest to destroy the One Ring.",
            cover_image_url="https://i.ebayimg.com/images/g/uRoAAOSwFTpi2ke5/s-l1600.webp",
            date_published=datetime(1954, 7, 29),
            pages=1178,
            language="English"
        ),
        Book(
            title="The Alchemist",
            author="Paulo Coelho",
            genres=["Fantasy", "Philosophical Fiction"],
            rating=3.86,
            synopsis="The story of Santiago, an Andalusian shepherd boy who dreams of finding treasure.",
            cover_image_url="https://i.ebayimg.com/images/g/uRoAAOSwFTpi2ke5/s-l1600.webp",
            date_published=datetime(1988, 1, 1),
            pages=208,
            language="English"
        )
    ]
    db.session.add_all(books)
    db.session.commit()
    return books

def seed_book_clubs(users):
    """Seed 10 book clubs with realistic data"""
    print("📚 Creating book clubs...")
    clubs = [
        BookClub(
            name="Classic Literature Circle",
            owner_id=users[0].id,
            synopsis="A club for classic literature enthusiasts to discuss timeless works.",
            current_book={
                "title": "Pride and Prejudice",
                "author": "Jane Austen",
                "progress": 45,
                "cover": "https://eachdaykart.com/cdn/shop/files/36_a1f6255b-f9cd-45f9-a89e-653667ac8bc2_457x707.webp?v=1729874774",
                "pagesRead": 125
            },
            created_at=datetime.now() - timedelta(days=90)
        ),
        BookClub(
            name="Sci-Fi Explorers",
            owner_id=users[1].id,
            synopsis="For fans of science fiction to explore futuristic worlds and ideas.",
            current_book={
                "title": "Dune",
                "author": "Frank Herbert",
                "progress": 67,
                "cover": "https://i0.wp.com/kibangabooks.com/wp-content/uploads/2023/12/Dune-book-by-Frank-Herbert1716096236.jpg?w=720&ssl=1",
                "pagesRead": 276
            },
            created_at=datetime.now() - timedelta(days=80)
        ),
        BookClub(
            name="Mystery & Thriller Readers",
            owner_id=users[2].id,
            synopsis="Solving mysteries and discussing thrilling plots together.",
            current_book={
                "title": "The Girl with the Dragon Tattoo",
                "author": "Stieg Larsson",
                "progress": 52,
                "cover": "https://i.ebayimg.com/images/g/Z0cAAeSwOLZoFM3e/s-l1600.webp",
                "pagesRead": 210
            },
            created_at=datetime.now() - timedelta(days=70)
        ),
        BookClub(
            name="Fantasy Book Club",
            owner_id=users[3].id,
            synopsis="Exploring magical worlds and epic fantasy stories.",
            current_book={
                "title": "The Name of the Wind",
                "author": "Patrick Rothfuss",
                "progress": 38,
                "cover": "https://i0.wp.com/kibangabooks.com/wp-content/uploads/2023/12/The-Book-Thief-by-Markus-Zusak.jpeg?fit=1024%2C1024&ssl=1",
                "pagesRead": 180
            },
            created_at=datetime.now() - timedelta(days=60)
        ),
        BookClub(
            name="Historical Fiction Society",
            owner_id=users[4].id,
            synopsis="Bringing history to life through well-researched fiction.",
            current_book={
                "title": "The Book Thief",
                "author": "Markus Zusak",
                "progress": 72,
                "cover": "https://i.ebayimg.com/images/g/PWQAAeSwMt5oGdDv/s-l1600.webp",
                "pagesRead": 320
            },
            created_at=datetime.now() - timedelta(days=50)
        ),
        BookClub(
            name="Non-Fiction Readers",
            owner_id=users[5].id,
            synopsis="Exploring the real world through well-written non-fiction.",
            current_book={
                "title": "Sapiens",
                "author": "Yuval Noah Harari",
                "progress": 29,
                "cover": "https://i0.wp.com/kibangabooks.com/wp-content/uploads/2023/11/Milk-and-Honey-By-Rupi-Kaur.jpeg?w=768&ssl=1",
                "pagesRead": 90
            },
            created_at=datetime.now() - timedelta(days=40)
        ),
        BookClub(
            name="Poetry Appreciation",
            owner_id=users[6].id,
            synopsis="Reading and discussing poetry from around the world.",
            current_book={
                "title": "Milk and Honey",
                "author": "Rupi Kaur",
                "progress": 85,
                "cover": "https://cdn.waterstones.com/bookjackets/large/9781/4071/9781407132082.jpg",
                "pagesRead": 120
            },
            created_at=datetime.now() - timedelta(days=30)
        ),
        BookClub(
            name="Young Adult Bookworms",
            owner_id=users[7].id,
            synopsis="For fans of young adult fiction and coming-of-age stories.",
            current_book={
                "title": "The Hunger Games",
                "author": "Suzanne Collins",
                "progress": 63,
                "cover": "https://i.ebayimg.com/images/g/jOsAAOSwXWBmAnJo/s-l960.webp",
                "pagesRead": 250
            },
            created_at=datetime.now() - timedelta(days=20)
        ),
        BookClub(
            name="Business & Self-Improvement",
            owner_id=users[8].id,
            synopsis="Reading books that help us grow professionally and personally.",
            current_book={
                "title": "Atomic Habits",
                "author": "James Clear",
                "progress": 47,
                "cover": "https://i.ebayimg.com/images/g/~IcAAOSwgQJgI7St/s-l960.webp",
                "pagesRead": 130
            },
            created_at=datetime.now() - timedelta(days=10)
        ),
        BookClub(
            name="Contemporary Fiction",
            owner_id=users[9].id,
            synopsis="Discussing modern fiction and its relevance to today's world.",
            current_book={
                "title": "Normal People",
                "author": "Sally Rooney",
                "progress": 55,
                "cover": "https://i.ebayimg.com/images/g/AWgAAeSwfMxoAtrm/s-l1600.webp",
                "pagesRead": 180
            },
            created_at=datetime.now() - timedelta(days=5)
        )
    ]
    db.session.add_all(clubs)
    db.session.commit()
    return clubs

def seed_memberships(users, clubs):
    """Seed club memberships with realistic join dates"""
    print("🧾 Creating Memberships...")
    memberships = []
   
    # Ensure each club has at least 3 members
    for club in clubs:
        # Owner is automatically a member
        memberships.append(
            Membership(
                user_id=club.owner_id,
                bookclub_id=club.id,
                joined_at=club.created_at
            )
        )
       
        # Add 2-4 additional random members
        potential_members = [u for u in users if u.id != club.owner_id]
        for user in random.sample(potential_members, min(4, len(potential_members))):
            memberships.append(
                Membership(
                    user_id=user.id,
                    bookclub_id=club.id,
                    joined_at=club.created_at + timedelta(days=random.randint(1, 14))
                )
            )
   
    db.session.add_all(memberships)
    db.session.commit()
    return memberships

def seed_follows(users):
    """Seed follower relationships between users"""
    print("🤝 Creating follows...")
    follows_data = []
   
    for user in users:
        # Each user follows 3-5 others
        to_follow = random.sample(
            [u for u in users if u != user],
            min(5, len(users)-1)
        )
       
        for followed in to_follow:
            follows_data.append({
                'follower_id': user.id,
                'followed_id': followed.id,
                'created_at': datetime.now() - timedelta(days=random.randint(1, 90))
            })
   
    if follows_data:
        db.session.execute(follows_table.insert(), follows_data)
        db.session.commit()
    return follows_data

def seed_invites(users, clubs):
    """Seed invitations between users and clubs"""
    print("📩 Creating invites...")
    invites = []
    statuses = list(InviteStatus)
   
    for _ in range(20):  # Create 20 invites
        sender = random.choice(users)
        recipient = random.choice([u for u in users if u != sender])
        club = random.choice(clubs)
       
        invites.append(
            Invite(
                sender_id=sender.id,
                recipient_id=recipient.id,
                bookclub_id=club.id,
                status=random.choice(statuses),
                token=generate_invite_token(sender.id, club.id, recipient.id),
                created_at=datetime.now() - timedelta(days=random.randint(1, 30))
            )
        )
   
    db.session.add_all(invites)
    db.session.commit()
    return invites

def seed_meetings(clubs):
    """Seed past and upcoming meetings for clubs"""
    print("📅 Creating meetings...")
    meetings = []
   
    for club in clubs:
        # Create 2 past meetings
        for i in range(1, 3):
            meetings.append(
                Meeting(
                    bookclub_id=club.id,
                    meeting_date=datetime.now() - timedelta(days=7*i),
                    creator_id=club.owner_id,
                    agenda=f"Discussion of {club.current_book['title']}:\n1. Initial impressions\n2. Character analysis\n3. Themes discussion\n4. Final thoughts"
                )
            )
       
        # Create 1 upcoming meeting
        meetings.append(
            Meeting(
                bookclub_id=club.id,
                meeting_date=datetime.now() + timedelta(days=7),
                creator_id=club.owner_id,
                agenda=f"Upcoming discussion of {club.current_book['title']}:\n1. Progress check\n2. Key chapters analysis\n3. Predictions\n4. Next reading assignment"
            )
        )
   
    db.session.add_all(meetings)
    db.session.commit()
    return meetings

def seed_summaries(users, books, clubs):
    """Seed book summaries"""
    print("✍ Adding summaries...")
    summaries = []
   
    for book in books:
        # Create 2-3 summaries per book
        for _ in range(random.randint(2, 3)):
            user = random.choice(users)
            club = random.choice(clubs)
           
            summaries.append(
                Summary(
                    content=f"A comprehensive summary of {book.title} focusing on its themes of {', '.join(book.genres)}. The book explores...",
                    book_id=book.id,
                    user_id=user.id,
                    bookclub_id=club.id
                )
            )
   
    db.session.add_all(summaries)
    db.session.commit()
    return summaries

def seed_reviews(users, books):
    """Seed book reviews"""
    print("⭐ Adding reviews...")
    reviews = []
   
    for book in books:
        # Create 2-4 reviews per book
        for _ in range(random.randint(2, 4)):
            user = random.choice(users)
           
            reviews.append(
                Review(
                    content=f"My review of {book.title}: This book was {random.choice(['amazing', 'thought-provoking', 'entertaining', 'challenging', 'inspiring'])}. I particularly enjoyed...",
                    rating=random.randint(3, 5),
                    user_id=user.id,
                    book_id=book.id,
                    created_at=datetime.now() - timedelta(days=random.randint(1, 60))
                )
            )
   
    db.session.add_all(reviews)
    db.session.commit()
    return reviews

def seed_database():
    """Main function to seed all database tables"""
    app = create_app()
    with app.app_context():
        if not clear_database():
            print("❌ Database clearing failed - aborting seed")
            return

        try:
            # Seed core data
            users = seed_users()
            books = seed_books()
            clubs = seed_book_clubs(users)
           
            # Seed relationships and content
            memberships = seed_memberships(users, clubs)
            follows = seed_follows(users)
            invites = seed_invites(users, clubs)
            meetings = seed_meetings(clubs)
            summaries = seed_summaries(users, books, clubs)
            reviews = seed_reviews(users, books)
           
            print("\n🎉 Database successfully seeded with:")
            print(f"  - {len(users)} users")
            print(f"  - {len(books)} books")
            print(f"  - {len(clubs)} book clubs")
            print(f"  - {len(memberships)} memberships")
            print(f"  - {len(follows)} follows")
            print(f"  - {len(invites)} invites")
            print(f"  - {len(meetings)} meetings")
            print(f"  - {len(summaries)} summaries")
            print(f"  - {len(reviews)} reviews")

        except Exception as e:
            db.session.rollback()
            print(f"❌ Seeding failed: {e}")
            traceback.print_exc()

if __name__ == "__main__":
    seed_database()