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
            user1 = User(
                username='admin',
                email='admin@bookclub.com',
                password_hash=generate_password_hash('admin123'),
                created_at=datetime.now(),
                last_login=datetime.now(),
                is_active=True
            )
            user2 = User(
                username='booklover',
                email='member@bookclub.com',
                password_hash=generate_password_hash('password123'),
                created_at=datetime.now(),
                last_login=datetime.now() - timedelta(days=5),
                is_active=True
            )
            user3 = User(
                username='readerbee',
                email='reader@bookclub.com',
                password_hash=generate_password_hash('read1234'),
                created_at=datetime.now(),
                last_login=datetime.now() - timedelta(days=10),  # Example: last login 10 days ago
                is_active=True  # Add this line
            )
            db.session.add_all([user1, user2, user3])
            db.session.commit()

            print("📚 Creating book clubs...")
            club1 = BookClub(
                name="Classic Literature Circle",
                owner_id=user1.id,
                synopsis="A vibrant community dedicated to exploring and analyzing timeless literary classics from around the world. We meet weekly to discuss themes, historical contexts, and personal interpretations of works from authors like Shakespeare, Austen, Dickens, and more. Our group welcomes both casual readers and scholarly types, with discussions ranging from surface-level plot points to deep literary analysis.",
                created_at=datetime(2023, 1, 15)
            )
            club2 = BookClub(
                name="Sci-Fi & Fantasy Explorers",
                owner_id=user2.id,
                synopsis="A passionate group that journeys through galaxies, parallel dimensions, and enchanted lands via the pages of science fiction and fantasy books. From Asimov to Zelazny, we explore world-building, futuristic technologies, and magical systems. Each month we select a new book or series to discuss, with special meetings dedicated to comparing adaptations and analyzing genre trends.",
                created_at=datetime(2023, 2, 20)
            )
            club3 = BookClub(
                name="Modern Reads Book Club",
                owner_id=user3.id,
                synopsis="Focusing on contemporary novels from the past decade, we examine trending authors, diverse voices, and thought-provoking themes in modern literature. Our discussions often extend beyond the books to current events and social issues they reflect. We prioritize works that challenge perspectives and introduce readers to new cultural experiences.",
                created_at=datetime(2023, 3, 10)
            )
            db.session.add_all([club1, club2, club3])
            db.session.commit()

            print("🧾 Creating Memberships...")
            memberships = [
                Membership(user_id=user1.id, bookclub_id=club1.id, joined_at=datetime(2023, 1, 16)),
                Membership(user_id=user2.id, bookclub_id=club2.id, joined_at=datetime(2023, 2, 21)),
                Membership(user_id=user3.id, bookclub_id=club3.id, joined_at=datetime(2023, 3, 11)),
                Membership(user_id=user1.id, bookclub_id=club2.id, joined_at=datetime(2023, 3, 15)),
                Membership(user_id=user2.id, bookclub_id=club1.id, joined_at=datetime(2023, 4, 1)),
                Membership(user_id=user3.id, bookclub_id=club1.id, joined_at=datetime(2023, 4, 3))
            ]
            db.session.add_all(memberships)
            db.session.commit()

            print("📖 Adding books...")
            book1 = Book(
                title="1984",
                author="George Orwell",
                genres=["Dystopian", "Political Fiction", "Science Fiction"],
                rating=4.17,
                synopsis="In a chilling dystopia where the Party maintains absolute control through pervasive surveillance and psychological manipulation, Winston Smith works at the Ministry of Truth rewriting history. When he begins a forbidden relationship with Julia and encounters the mysterious O'Brien, Winston dares to imagine rebellion against Big Brother. Orwell's masterpiece explores themes of totalitarianism, censorship, and the manipulation of truth that remain frighteningly relevant today. The novel introduces concepts like Newspeak, doublethink, and the Thought Police that have entered our cultural lexicon as warnings against government overreach.",
                cover_image_url="https://example.com/images/1984.jpg",
                date_published=datetime(1949, 6, 8),
                language="English",
                pages=328,
                date_added=datetime.now()
            )
            book2 = Book(
                title="To Kill a Mockingbird",
                author="Harper Lee",
                genres=["Classic", "Coming-of-Age", "Historical Fiction"],
                rating=4.28,
                synopsis="Set in the racially charged American South during the Great Depression, this Pulitzer Prize-winning novel follows young Scout Finch as her father, Atticus, defends Tom Robinson, a black man falsely accused of rape. Through Scout's innocent eyes, the story explores complex themes of racial injustice, moral growth, and the coexistence of good and evil. The novel's enduring wisdom about human nature and its powerful portrayal of integrity continue to resonate with readers worldwide. Memorable characters like Boo Radley and Calpurnia create a rich tapestry of small-town life and moral dilemmas.",
                cover_image_url="https://example.com/images/mockingbird.jpg",
                date_published=datetime(1960, 7, 11),
                language="English",
                pages=281,
                date_added=datetime.now()
            )
            book3 = Book(
                title="Dune",
                author="Frank Herbert",
                genres=["Science Fiction", "Adventure", "Space Opera"],
                rating=4.25,
                synopsis="Set in a distant future amidst a feudal interstellar society, Dune tells the story of young Paul Atreides as his family assumes control of the desert planet Arrakis, the only source of the universe's most valuable substance: the spice melange. This epic saga explores complex themes of politics, religion, ecology, and human evolution, creating one of the most detailed and immersive worlds in science fiction history. The novel's influence can be seen across the genre, from Star Wars to modern ecological science fiction. Its intricate world-building includes the Fremen culture, the Bene Gesserit sisterhood, and the giant sandworms that produce the spice.",
                cover_image_url="https://example.com/images/dune.jpg",
                date_published=datetime(1965, 8, 1),
                language="English",
                pages=412,
                date_added=datetime.now()
            )
            db.session.add_all([book1, book2, book3])
            db.session.commit()

            print("✍ Adding summaries...")
            summaries = [
                Summary(
                    content="1984 presents a terrifying vision of a totalitarian future where the government, led by the enigmatic Big Brother, controls every aspect of life. The protagonist Winston Smith secretly rebels by keeping a diary and having a forbidden relationship. The novel's concepts of Newspeak, doublethink, and the Thought Police have entered our cultural lexicon as warnings against government overreach and the manipulation of truth. Particularly chilling is the way the Party rewrites history to match its current narrative, demonstrating how control of information leads to control of thought itself.",
                    book_id=book1.id, 
                    user_id=user1.id, 
                    bookclub_id=club1.id
                ),
                Summary(
                    content="To Kill a Mockingbird is both a coming-of-age story and a powerful examination of racial injustice in the American South. Through Scout's narration, we see how her father Atticus Finch's courageous defense of Tom Robinson impacts their small town. The novel beautifully captures childhood innocence while confronting harsh realities about prejudice and moral courage. Memorable scenes like the Halloween pageant and the confrontation at the jailhouse create a nuanced portrait of a community grappling with its own contradictions.",
                    book_id=book2.id, 
                    user_id=user2.id, 
                    bookclub_id=club2.id
                ),
                Summary(
                    content="Dune creates an incredibly detailed universe where political intrigue, ecological concerns, and messianic themes intertwine. The desert planet Arrakis and its native Fremen culture are vividly realized, with the spice melange serving as both a valuable resource and a metaphor for the addictive nature of power. Paul Atreides' transformation into Muad'Dib raises profound questions about destiny and the consequences of leadership. The novel's ecological themes about desert adaptation and water conservation remain strikingly relevant today.",
                    book_id=book3.id, 
                    user_id=user3.id, 
                    bookclub_id=club3.id
                )
            ]
            db.session.add_all(summaries)
            db.session.commit()

            print("⭐ Adding reviews...")
            reviews = [
                Review(
                    content="Orwell's 1984 remains one of the most important books of the 20th century. Its depiction of surveillance, propaganda, and thought control grows more relevant with each passing year. The ending is particularly haunting - a sobering reminder of how easily truth can be manipulated and individuality crushed under authoritarian rule. What makes the novel truly terrifying is how plausible its vision of totalitarianism feels, with modern technology making many of Orwell's imagined surveillance methods actually possible today.",
                    rating=5, 
                    user_id=user1.id, 
                    book_id=book1.id
                ),
                Review(
                    content="Harper Lee's masterpiece is both heartbreaking and uplifting. Atticus Finch stands as one of literature's great moral heroes, while Scout's narration perfectly captures childhood wonder and confusion. The courtroom scenes are tense and powerful, but it's the small moments of human connection that make this book truly special. The novel's treatment of racism remains painfully relevant, and its lessons about empathy and standing up for what's right continue to inspire readers of all ages.",
                    rating=5, 
                    user_id=user2.id, 
                    book_id=book2.id
                ),
                Review(
                    content="Dune is science fiction at its most ambitious and philosophical. Herbert creates an entire ecosystem and culture that feels completely real. The political maneuvering is as tense as any thriller, while the ecological themes give the story deeper resonance. Paul's journey from noble son to messianic figure raises fascinating questions about power and destiny. The novel's intricate plotting and rich world-building set a standard that few sci-fi works have matched since its publication.",
                    rating=5, 
                    user_id=user3.id, 
                    book_id=book3.id
                )
            ]
            db.session.add_all(reviews)
            db.session.commit()

            print("📩 Creating invites...")
            invites = [
                Invite(
                    sender_id=user1.id, 
                    recipient_id=user2.id, 
                    bookclub_id=club1.id, 
                    status=InviteStatus.PENDING,
                    token=generate_invite_token(user1.id, club1.id, user2.id)),
                
                Invite(
                    sender_id=user2.id, 
                    recipient_id=user3.id, 
                    bookclub_id=club2.id, 
                    status=InviteStatus.ACCEPTED,
                    token=generate_invite_token(user1.id, club1.id, user2.id))
                
            ]
            db.session.add_all(invites)
            db.session.commit()

            print("📅 Creating meetings...")
            meetings = [
                Meeting(
                    bookclub_id=club1.id, 
                    meeting_date=datetime.now() + timedelta(days=7), 
                    creator_id=user1.id,
                    agenda="Discussion of George Orwell's 1984:\n1. Opening thoughts (15 min)\n2. Themes of surveillance (30 min)\n3. Relevance to modern politics (30 min)\n4. Closing discussion (15 min)"
                ),
                Meeting(
                    bookclub_id=club2.id, 
                    meeting_date=datetime.now() + timedelta(days=10), 
                    creator_id=user2.id,
                    agenda="Sci-Fi Worldbuilding Workshop:\n1. Analyzing Dune's ecological systems (30 min)\n2. Comparing with other sci-fi worlds (30 min)\n3. Writing exercise (30 min)"
                )
            ]
            db.session.add_all(meetings)
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