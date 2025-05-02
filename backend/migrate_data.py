import os
from app import app, db
from models.book import Book, Review, book_genres
from models.genre import Genre
from models.book_club import BookClub, CurrentBook, Meeting, Discussion, book_club_genres, book_club_members
from models.member import Member
import json

def load_books_data():
    with open('static/data/booksData.json') as f:
        return json.load(f)

def load_clubs_data():
    with open('static/data/bookClubsData.json') as f:
        return json.load(f)

def migrate_books():
    books_data = load_books_data()
    
    with app.app_context():
        # Clear existing data
        db.session.query(Review).delete()
        db.session.query(book_genres).delete()
        db.session.query(Book).delete()
        db.session.query(Genre).delete()
        db.session.commit()

        genre_cache = {}
        
        for book_data in books_data:
            # Handle genres
            genres = []
            for genre_name in book_data.get('genres', []):
                if genre_name not in genre_cache:
                    genre = Genre(name=genre_name)
                    db.session.add(genre)
                    genre_cache[genre_name] = genre
                genres.append(genre_cache[genre_name])
            
            # Create book
            book = Book(
                title=book_data['title'],
                author=book_data['author'],
                cover=book_data['cover'],
                rating=book_data['rating'],
                description=book_data['description'],
                pages=book_data['pages'],
                published=book_data['published'],
                founder=book_data['founder'],
                rating_review=book_data['ratingReview']
            )
            book.genres = genres
            db.session.add(book)
            db.session.flush()
            
            # Add reviews
            for review_data in book_data.get('reviews', []):
                review = Review(
                    book_id=book.id,
                    title=review_data['title'],
                    description=review_data['description'],
                    username=review_data['username']
                )
                db.session.add(review)
        
        db.session.commit()
        print(f"Migrated {len(books_data)} books")

def migrate_clubs():
    clubs_data = load_clubs_data()
    
    with app.app_context():
        # Clear existing club data
        db.session.query(Discussion).delete()
        db.session.query(Meeting).delete()
        db.session.query(CurrentBook).delete()
        db.session.query(book_club_genres).delete()
        db.session.query(book_club_members).delete()
        db.session.query(Member).delete()
        db.session.query(Genre).delete()
        db.session.query(BookClub).delete()
        db.session.commit()

        member_cache = {}
        genre_cache = {}
        
        for club_data in clubs_data:
            # Handle members
            members = []
            for member_data in club_data.get('members', []):
                if member_data['name'] not in member_cache:
                    member = Member(
                        name=member_data['name'],
                        avatar_url=member_data['avatar'],
                        email=f"{member_data['name'].lower().replace(' ', '.')}@example.com"
                    )
                    db.session.add(member)
                    member_cache[member_data['name']] = member
                members.append(member_cache[member_data['name']])
            
            # Handle genres
            genres = []
            for genre_name in club_data.get('genres', []):
                if genre_name not in genre_cache:
                    genre = Genre(name=genre_name)
                    db.session.add(genre)
                    genre_cache[genre_name] = genre
                genres.append(genre_cache[genre_name])
            
            # Create club
            club = BookClub(
                book_club_name=club_data['bookClubName'],
                description=club_data['description'],
                meeting_frequency=club_data['meetingFrequency'],
                club_cover_url=club_data.get('clubCover', ''),
                status='Active'
            )
            club.members = members
            club.genres = genres
            db.session.add(club)
            db.session.flush()
            
            # Add current book
            if 'currentBook' in club_data:
                current_book = CurrentBook(
                    book_club_id=club.id,
                    title=club_data['currentBook']['title'],
                    author=club_data['currentBook']['author'],
                    description=club_data['currentBook']['description'],
                    cover_url=club_data['currentBook']['cover'],
                    progress=club_data['currentBook']['progress'],
                    pages_read=club_data['currentBook']['pagesRead']
                )
                db.session.add(current_book)
            
            # Add next meeting
            if 'nextMeeting' in club_data and club_data['nextMeeting']['date']:
                meeting = Meeting(
                    book_club_id=club.id,
                    meeting_date=club_data['nextMeeting']['date'],
                    meeting_time=club_data['nextMeeting']['time'],
                    location=club_data['nextMeeting']['location'],
                    agenda=club_data['nextMeeting']['agenda']
                )
                db.session.add(meeting)
            
            # Add discussions
            for discussion_data in club_data.get('discussions', []):
                member = member_cache.get(discussion_data['user'])
                if not member:
                    member = Member(
                        name=discussion_data['user'],
                        avatar_url='',
                        email=f"anonymous.{discussion_data['user'].lower().replace(' ', '.')}@example.com"
                    )
                    db.session.add(member)
                    member_cache[discussion_data['user']] = member
                
                discussion = Discussion(
                    book_club_id=club.id,
                    member_id=member.id,
                    comment=discussion_data['comment'],
                    likes=discussion_data['likes']
                )
                db.session.add(discussion)
        
        db.session.commit()
        print(f"Migrated {len(clubs_data)} book clubs")

if __name__ == '__main__':
    migrate_books()
    migrate_clubs()