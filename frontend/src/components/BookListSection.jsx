import React, { useState } from 'react';
import '../styles/BookListSection.css';
import bookClubsData from './bookClubsData';
import { Link, useNavigate } from 'react-router-dom';

const BookListSection = () => {
    const navigate = useNavigate()

    const handleViewAllBookClubs = () => {
        navigate('/bookclubs')
    }
    const [joinedClubs, setJoinedClubs] = useState([]);

    const handleJoinClick = (clubId) => {
        if (joinedClubs.includes(clubId)) {
            setJoinedClubs(joinedClubs.filter(id => id !== clubId));
        } else {
            setJoinedClubs([...joinedClubs, clubId]);
        }
    };

    return (
        <div className="book-clubs-section">
            <div className="bookclubs-title">
                <h1>Popular BookClubs</h1>
                <p>Join these active communities of passionate readers</p>
            </div>

            <div className="book-clubs-container">
                {bookClubsData.slice(0, 3).map((club) => (
                    <div
                        key={club.id}
                        className="book-club-card"
                        onClick={() => navigate(`/bookclub/${club.id}`)}
                        style={{ cursor: 'pointer' }}
                    >                        <div className="club-header">
                            <h2 className="club-name">{club.bookClubName}</h2>
                            <span className="member-count">{club.members.length} members</span>
                        </div>

                        <p className="club-description">{club.description}</p>
                        <div className="genres-container">
                            {club.genres.map((genre, index) => (
                                <span key={index} className="genre-tag">{genre}</span>
                            ))}
                        </div>
                        <div className="book-and-button-container">
                            <div className="current-book">
                                <h4>Currently Reading:</h4>
                                <div className="book-info">
                                    <img src={club.currentBook.cover} alt={club.currentBook.title} className="book-cover" />
                                    <div>
                                        <p className="book-title">{club.currentBook.title}</p>
                                        <p className="book-author">by {club.currentBook.author}</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                className={`join-club-button ${joinedClubs.includes(club.id) ? 'joined' : ''}`}
                                onClick={() => handleJoinClick(club.id)}
                            >
                                {joinedClubs.includes(club.id) ? 'Joined ✓' : 'Join Now'}
                            </button>
                        </div>


                    </div>

                ))}
            </div>
            <div className="view-all-container">
                <button onClick={handleViewAllBookClubs} className="view-all-button">View All Bookclubs</button>
            </div>

        </div >
    );
};

export default BookListSection;