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

def clear_database():
    print("🧹 Clearing existing data...")
    try:
        # Alternative approach without session_replication_role
        # Get table names in proper deletion order
        inspector = inspect(db.engine)
        table_names = inspector.get_table_names()
        
        # Manually order tables based on dependencies
        ordered_tables = tables = ['invites', 'reviews', 'summaries', 'books','meetings', 'follows', 'memberships', 'bookclubs', 'users']

        
        # Verify all tables exist
        for table in ordered_tables:
            if table not in table_names:
                raise ValueError(f"Table {table} not found in database")
        
        # Disable triggers temporarily if possible (safer than session_replication_role)
        try:
            db.session.execute(text('SET CONSTRAINTS ALL DEFERRED'))
        except:
            pass  # Skip if not supported
        
        # Delete in proper order
        for table in ordered_tables:
            db.session.execute(text(f'DELETE FROM {table}'))
        
        db.session.commit()
        return True
        
    except Exception as e:
        db.session.rollback()
        print(f"⚠ Error clearing data: {e}")
        traceback.print_exc()
        return False

def seed_database():
    app = create_app()
    with app.app_context():
        if not clear_database():
            print("❌ Database clearing failed - aborting seed")
            return

        try:
            print("👤 Creating test users...")
            users = [
                User(
                    username='admin',
                    email='admin@bookclub.com',
                    password_hash=generate_password_hash('admin123'),
                    created_at=datetime.now(),
                    last_login=datetime.now(),
                    is_active=True
                ),
                User(
                    username='booklover',
                    email='member@bookclub.com',
                    password_hash=generate_password_hash('password123'),
                    created_at=datetime.now(),
                    last_login=datetime.now() - timedelta(days=5),
                    is_active=True
                ),
                User(
                    username='readerbee',
                    email='reader@bookclub.com',
                    password_hash=generate_password_hash('read1234'),
                    created_at=datetime.now(),
                    last_login=datetime.now() - timedelta(days=10),
                    is_active=True
                ),
                User(
                    username='literaturefan',
                    email='litfan@bookclub.com',
                    password_hash=generate_password_hash('lit12345'),
                    created_at=datetime.now() - timedelta(days=15),
                    last_login=datetime.now() - timedelta(days=2),
                    is_active=True
                ),
                User(
                    username='scifigeek',
                    email='scifi@bookclub.com',
                    password_hash=generate_password_hash('scifi123'),
                    created_at=datetime.now() - timedelta(days=20),
                    last_login=datetime.now() - timedelta(days=1),
                    is_active=True
                ),
                User(
                    username='mysteryreader',
                    email='mystery@bookclub.com',
                    password_hash=generate_password_hash('mystery123'),
                    created_at=datetime.now() - timedelta(days=25),
                    last_login=datetime.now() - timedelta(hours=12),
                    is_active=True
                ),
                User(
                    username='fantasylover',
                    email='fantasy@bookclub.com',
                    password_hash=generate_password_hash('fantasy123'),
                    created_at=datetime.now() - timedelta(days=30),
                    last_login=datetime.now() - timedelta(hours=6),
                    is_active=True
                ),
                User(
                    username='historybuff',
                    email='history@bookclub.com',
                    password_hash=generate_password_hash('history123'),
                    created_at=datetime.now() - timedelta(days=35),
                    last_login=datetime.now() - timedelta(days=3),
                    is_active=True
                ),
                User(
                    username='poetryenthusiast',
                    email='poetry@bookclub.com',
                    password_hash=generate_password_hash('poetry123'),
                    created_at=datetime.now() - timedelta(days=40),
                    last_login=datetime.now() - timedelta(days=7),
                    is_active=True
                ),
                User(
                    username='biographyfan',
                    email='biofan@bookclub.com',
                    password_hash=generate_password_hash('bio12345'),
                    created_at=datetime.now() - timedelta(days=45),
                    last_login=datetime.now() - timedelta(days=4),
                    is_active=True
                )
            ]
            db.session.add_all(users)

            user1 = User(
                username='admin',
                email='admin@bookclub.com',
                password_hash=generate_password_hash('admin123'),
                created_at=datetime.now(),
                last_login=datetime.now(),
                is_active=True,
                is_admin = True
            )
            user2 = User(
                username='booklover',
                email='member@bookclub.com',
                password_hash=generate_password_hash('password123'),
                created_at=datetime.now(),
                last_login=datetime.now() - timedelta(days=5),
                is_active=True,
                is_admin=False
            )
            user3 = User(
                username='readerbee',
                email='reader@bookclub.com',
                password_hash=generate_password_hash('read1234'),
                created_at=datetime.now(),
                last_login=datetime.now() - timedelta(days=10),  # Example: last login 10 days ago
                is_active=True ,
                is_admin=False # Add this line
            )
            db.session.add_all([user1, user2, user3])

            db.session.commit()

            print("📖 Adding books...")
            books = [
                Book(
                    title="1984",
                    author="George Orwell",
                    genres=["Dystopian", "Political Fiction", "Science Fiction"],
                    rating=4.17,
                    synopsis="In a chilling dystopia where the Party maintains absolute control through pervasive surveillance and psychological manipulation, Winston Smith works at the Ministry of Truth rewriting history. When he begins a forbidden relationship with Julia and encounters the mysterious O'Brien, Winston dares to imagine rebellion against Big Brother.",
                    cover_image_url="https://m.media-amazon.com/images/I/71kXYs4tCvL._AC_UF1000,1000_QL80_.jpg",
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
                    synopsis="Set in the racially charged American South during the Great Depression, this Pulitzer Prize-winning novel follows young Scout Finch as her father, Atticus, defends Tom Robinson, a black man falsely accused of rape.",
                    cover_image_url="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg/1200px-To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg",
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
                    synopsis="Set in a distant future amidst a feudal interstellar society, Dune tells the story of young Paul Atreides as his family assumes control of the desert planet Arrakis, the only source of the universe's most valuable substance: the spice melange.",
                    cover_image_url="https://i0.wp.com/kibangabooks.com/wp-content/uploads/2023/12/Dune-book-by-Frank-Herbert1716096236.jpg?fit=720%2C720&ssl=1",
                    date_published=datetime(1965, 8, 1),
                    language="English",
                    pages=412,
                    date_added=datetime.now()
                ),
                Book(
                    title="The Great Gatsby",
                    author="F. Scott Fitzgerald",
                    genres=["Classic", "Literary Fiction", "Romance"],
                    rating=3.93,
                    synopsis="A portrait of the Jazz Age in all of its decadence and excess, The Great Gatsby captures the American Dream and its corruption through the tragic story of Jay Gatsby and his love for Daisy Buchanan.",
                    cover_image_url="https://i.ebayimg.com/images/g/~WkAAOSwanRhXs5S/s-l960.webp",
                    date_published=datetime(1925, 4, 10),
                    language="English",
                    pages=180,
                    date_added=datetime.now()
                ),
                Book(
                    title="Pride and Prejudice",
                    author="Jane Austen",
                    genres=["Classic", "Romance", "Historical Fiction"],
                    rating=4.28,
                    synopsis="The romantic clash between the opinionated Elizabeth Bennet and the proud Mr. Darcy is a splendid performance of civilized sparring in this classic comedy of manners.",
                    cover_image_url="https://eachdaykart.com/cdn/shop/files/36_a1f6255b-f9cd-45f9-a89e-653667ac8bc2_457x707.webp?v=1729874774",
                    date_published=datetime(1813, 1, 28),
                    language="English",
                    pages=279,
                    date_added=datetime.now()
                ),
                Book(
                    title="The Hobbit",
                    author="J.R.R. Tolkien",
                    genres=["Fantasy", "Adventure", "Classic"],
                    rating=4.28,
                    synopsis="The adventure of Bilbo Baggins, a hobbit who embarks on an unexpected journey with a company of dwarves to reclaim their mountain home from the dragon Smaug.",
                    cover_image_url="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHIzm56W-N4vQhJsDLWcsku0JUjqfaOPYapQ&s",
                    date_published=datetime(1937, 9, 21),
                    language="English",
                    pages=310,
                    date_added=datetime.now()
                ),
                Book(
                    title="The Catcher in the Rye",
                    author="J.D. Salinger",
                    genres=["Classic", "Coming-of-Age", "Literary Fiction"],
                    rating=3.81,
                    synopsis="The story of Holden Caulfield and his peculiar odyssey through the streets of New York, trying to come to terms with the 'phoniness' of the adult world.",
                    cover_image_url="https://booksandyou.in/cdn/shop/files/TheCatcherintheRye_1.webp?v=1714498776&width=713",
                    date_published=datetime(1951, 7, 16),
                    language="English",
                    pages=234,
                    date_added=datetime.now()
                ),
                Book(
                    title="The Lord of the Rings",
                    author="J.R.R. Tolkien",
                    genres=["Fantasy", "Adventure", "Classic"],
                    rating=4.52,
                    synopsis="The epic tale of Frodo Baggins and his quest to destroy the One Ring, battling the forces of the Dark Lord Sauron.",
                    cover_image_url="https://cdn.shoplightspeed.com/shops/611345/files/5297743/mariner-books-the-lord-of-the-rings-omnibus-1-3.jpg",
                    date_published=datetime(1954, 7, 29),
                    language="English",
                    pages=1178,
                    date_added=datetime.now()
                ),
                Book(
                    title="Brave New World",
                    author="Aldous Huxley",
                    genres=["Dystopian", "Science Fiction", "Classic"],
                    rating=3.99,
                    synopsis="A dystopian novel set in a futuristic World State, inhabited by genetically modified citizens and an intelligence-based social hierarchy.",
                    cover_image_url="https://i.ebayimg.com/images/g/gWwAAeSwh5JoElb0/s-l1600.webp",
                    date_published=datetime(1932, 1, 1),
                    language="English",
                    pages=288,
                    date_added=datetime.now()
                ),
                Book(
                    title="The Alchemist",
                    author="Paulo Coelho",
                    genres=["Fantasy", "Adventure", "Philosophical Fiction"],
                    rating=3.86,
                    synopsis="The story of Santiago, an Andalusian shepherd boy who dreams of finding a worldly treasure located somewhere in Egypt.",
                    cover_image_url="https://i.ebayimg.com/images/g/uRoAAOSwFTpi2ke5/s-l1600.webp",
                    date_published=datetime(1988, 1, 1),
                    language="English",
                    pages=208,
                    date_added=datetime.now()
                )
            ]
            db.session.add_all(books)
            db.session.commit()

            print("📚 Creating book clubs...")
            clubs = [
                BookClub(
                    name="Classic Literature Circle",
                    owner_id=users[0].id,
                    synopsis="A vibrant community dedicated to exploring and analyzing timeless literary classics from around the world.",
                    created_at=datetime(2023, 1, 15),
                    current_book={
                        "title": "Pride and Prejudice",
                        "author": "Jane Austen",
                        "description": "A romantic novel that explores manners, upbringing, morality, and marriage in early 19th-century England.",
                        "progress": 45,
                        "cover": "https://eachdaykart.com/cdn/shop/files/36_a1f6255b-f9cd-45f9-a89e-653667ac8bc2_457x707.webp?v=1729874774",
                        "pagesRead": 134
                    }
                ),
                BookClub(
                    name="Sci-Fi & Fantasy Explorers",
                    owner_id=users[1].id,
                    synopsis="A passionate group that journeys through galaxies, parallel dimensions, and enchanted lands via the pages of science fiction and fantasy books.",
                    created_at=datetime(2023, 2, 20),
                    current_book={
                        "title": "Dune",
                        "author": "Frank Herbert",
                        "description": "A science fiction epic that follows the story of Paul Atreides on the desert planet Arrakis.",
                        "progress": 67,
                        "cover": "https://i0.wp.com/kibangabooks.com/wp-content/uploads/2023/12/Dune-book-by-Frank-Herbert1716096236.jpg?w=720&ssl=1",
                        "pagesRead": 412
                    }
                ),
                BookClub(
                    name="Modern Reads Book Club",
                    owner_id=users[2].id,
                    synopsis="Focusing on contemporary novels from the past decade, we examine trending authors, diverse voices, and thought-provoking themes in modern literature.",
                    created_at=datetime(2023, 3, 10),
                    current_book={
                        "title": "The Night Circus",
                        "author": "Erin Morgenstern",
                        "description": "A phantasmagorical novel centered on a magical competition between two young illusionists.",
                        "progress": 32,
                        "cover": "https://i.ebayimg.com/images/g/AWgAAeSwfMxoAtrm/s-l1600.webp",
                        "pagesRead": 110
                    }
                ),
                BookClub(
                    name="Mystery & Thriller Enthusiasts",
                    owner_id=users[3].id,
                    synopsis="For fans of whodunits, psychological thrillers, and crime novels where we try to solve the mystery before the big reveal.",
                    created_at=datetime(2023, 4, 5),
                    current_book={
                        "title": "Gone Girl",
                        "author": "Gillian Flynn",
                        "description": "A psychological thriller about a woman who disappears on her fifth wedding anniversary.",
                        "progress": 58,
                        "cover": "https://i.ebayimg.com/images/g/Z0cAAeSwOLZoFM3e/s-l1600.webp",
                        "pagesRead": 210
                    }
                ),
                BookClub(
                    name="Historical Fiction Society",
                    owner_id=users[4].id,
                    synopsis="Exploring different eras through meticulously researched historical fiction that brings the past to life.",
                    created_at=datetime(2023, 5, 12),
                    current_book={
                        "title": "The Book Thief",
                        "author": "Markus Zusak",
                        "description": "A story set in Nazi Germany about a young girl who steals books and shares them with others.",
                        "progress": 72,
                        "cover": "https://i0.wp.com/kibangabooks.com/wp-content/uploads/2023/12/The-Book-Thief-by-Markus-Zusak.jpeg?fit=1024%2C1024&ssl=1",
                        "pagesRead": 320
                    }
                ),
                BookClub(
                    name="Non-Fiction Readers",
                    owner_id=users[5].id,
                    synopsis="Exploring the real world through biographies, memoirs, science, history, and other non-fiction works.",
                    created_at=datetime(2023, 6, 8),
                    current_book={
                        "title": "Sapiens",
                        "author": "Yuval Noah Harari",
                        "description": "A brief history of humankind, exploring the evolution of our species.",
                        "progress": 39,
                        "cover": "https://i.ebayimg.com/images/g/PWQAAeSwMt5oGdDv/s-l1600.webp",
                        "pagesRead": 150
                    }
                ),
                BookClub(
                    name="Poetry & Short Stories",
                    owner_id=users[6].id,
                    synopsis="Appreciating the beauty of language through poetry collections and short story anthologies.",
                    created_at=datetime(2023, 7, 15),
                    current_book={
                        "title": "Milk and Honey",
                        "author": "Rupi Kaur",
                        "description": "A collection of poetry and prose about survival, violence, abuse, love, and femininity.",
                        "progress": 85,
                        "cover": "https://i0.wp.com/kibangabooks.com/wp-content/uploads/2023/11/Milk-and-Honey-By-Rupi-Kaur.jpeg?w=768&ssl=1",
                        "pagesRead": 120
                    }
                ),
                BookClub(
                    name="Young Adult Bookworms",
                    owner_id=users[7].id,
                    synopsis="For fans of young adult fiction, discussing coming-of-age stories and teen perspectives.",
                    created_at=datetime(2023, 8, 20),
                    current_book={
                        "title": "The Hunger Games",
                        "author": "Suzanne Collins",
                        "description": "A dystopian novel about a televised fight to the death between teenagers.",
                        "progress": 63,
                        "cover": "https://cdn.waterstones.com/bookjackets/large/9781/4071/9781407132082.jpg",
                        "pagesRead": 250
                    }
                ),
                BookClub(
                    name="Business & Self-Improvement",
                    owner_id=users[8].id,
                    synopsis="Reading and discussing books that help us grow professionally and personally.",
                    created_at=datetime(2023, 9, 10),
                    current_book={
                        "title": "Atomic Habits",
                        "author": "James Clear",
                        "description": "A guide to building good habits and breaking bad ones.",
                        "progress": 47,
                        "cover": "https://i.ebayimg.com/images/g/jOsAAOSwXWBmAnJo/s-l960.webp",
                        "pagesRead": 130
                    }
                ),
                BookClub(
                    name="Science & Technology",
                    owner_id=users[9].id,
                    synopsis="Exploring the latest in scientific discoveries and technological advancements through books.",
                    created_at=datetime(2023, 10, 5),
                    current_book={
                        "title": "The Gene",
                        "author": "Siddhartha Mukherjee",
                        "description": "An intimate history of the gene and the science of heredity.",
                        "progress": 29,
                        "cover": "https://i.ebayimg.com/images/g/~IcAAOSwgQJgI7St/s-l960.webp",
                        "pagesRead": 90
                    }
                )
            ]
            db.session.add_all(clubs)
            db.session.commit()

            print("🧾 Creating Memberships...")
            memberships = []
            for i in range(10):
                # Each user joins 3 random clubs
                for club in random.sample(clubs, 3):
                    memberships.append(
                        Membership(
                            user_id=users[i].id,
                            bookclub_id=club.id,
                            joined_at=datetime.now() - timedelta(days=random.randint(1, 30))
                        )
                    )
            db.session.add_all(memberships)
            db.session.commit()

            print("✍ Adding summaries...")
            summaries = []
            for i in range(10):
                for j in range(2):  # 2 summaries per book
                    summaries.append(
                        Summary(
                            content=f"Detailed analysis of {books[i].title} by {books[i].author}. This book explores themes of {', '.join(books[i].genres[:2])} in a profound way. The characters are well-developed and the plot keeps you engaged throughout. The author's style is particularly noteworthy for its {['clarity', 'depth', 'humor', 'insight', 'originality'][i%5]}.",
                            book_id=books[i].id,
                            user_id=users[i].id,
                            bookclub_id=clubs[i].id
                        )
                    )
            db.session.add_all(summaries)
            db.session.commit()

            print("⭐ Adding reviews...")
            reviews = []
            for i in range(10):
                for j in range(2):  # 2 reviews per book
                    reviews.append(
                        Review(
                            content=f"My thoughts on {books[i].title}: This book was {['amazing', 'thought-provoking', 'entertaining', 'challenging', 'inspiring'][i%5]}. I particularly enjoyed the way the author handled the theme of {books[i].genres[0]}. The ending was {['satisfying', 'unexpected', 'heartbreaking', 'open-ended', 'perfect'][i%5]}.",
                            rating=random.randint(3, 5),
                            user_id=users[i].id,
                            book_id=books[i].id
                        )
                    )
            db.session.add_all(reviews)
            db.session.commit()

            print("📩 Creating invites...")
            invites = []
            for i in range(10):
                for j in range(2):  # 2 invites per user
                    sender = users[i]
                    recipient = users[(i+1)%10]
                    club = clubs[(i+j)%10]
                    invites.append(
                        Invite(
                            sender_id=sender.id,
                            recipient_id=recipient.id,
                            bookclub_id=club.id,
                            status=random.choice(list(InviteStatus)),
                            token=generate_invite_token(sender.id, club.id, recipient.id)
                        )
                    )
            db.session.add_all(invites)
            db.session.commit()

            print("📅 Creating meetings...")
            meetings = []
            for i in range(10):
                for j in range(2):  # 2 meetings per club
                    meetings.append(
                        Meeting(
                            bookclub_id=clubs[i].id,
                            meeting_date=datetime.now() + timedelta(days=random.randint(1, 30)),
                            creator_id=clubs[i].owner_id,
                            agenda=f"Discussion of {clubs[i].current_book['title']}:\n1. Opening thoughts\n2. Character analysis\n3. Theme exploration\n4. Final thoughts"
                        )
                    )
            db.session.add_all(meetings)
            db.session.commit()

            print("🤝 Creating follows...")
            follows = []
            for i in range(10):
                for j in range(3):  # Each user follows 3 others
                    follower = users[i]
                    followed = users[(i+j+1)%10]
                    if follower != followed:
                        follows.append(
                            {
                                'follower_id': follower.id,
                                'followed_id': followed.id,
                                'created_at': datetime.now() - timedelta(days=random.randint(1, 30))
                            }
                        )
            # Using SQLAlchemy core for bulk insert
            if follows:
                db.session.execute(follows_table.insert(), follows)
                db.session.commit()

            print("🎉 Database successfully seeded with complete data!")

        except Exception as e:
            db.session.rollback()
            print(f"❌ Seeding failed: {e}")
            traceback.print_exc()

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_database()