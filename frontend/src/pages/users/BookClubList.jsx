import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import '../../styles/BookClubList.css';
import { CiSearch } from "react-icons/ci";
import bookClubsData from '../../components/bookClubsData';
import Footer from '../../components/Footer';

const BookClubList = () => {
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  const allCategories = ['all', ...new Set(bookClubsData.flatMap(club => club.genres))];

  const handleJoinClub = (clubId, e) => {
    e.stopPropagation();
    if (joinedClubs.includes(clubId)) {
      setJoinedClubs(joinedClubs.filter(id => id !== clubId));
    } else {
      setJoinedClubs([...joinedClubs, clubId]);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'my') {
      navigate('/my-bookclubs');
    }
  };

  const filteredClubs = bookClubsData.filter(club => {
    const tabMatch = activeTab === 'all' ||
      (activeTab === 'my' && joinedClubs.includes(club.id));
    const searchMatch = club.bookClubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === 'all' ||
      club.genres.includes(selectedCategory);
    return tabMatch && searchMatch && categoryMatch;
  });

  return (
    <div className="book-club-list-page">
      <Navbar />

      <div className="section-container">
        <div className="section-heading-container">
          <div className="heading-p">
            <h1>Book Clubs</h1>
            <p>Find your perfect reading community and connect with fellow book lovers</p>
          </div>
          <div className="heading-button">
            <button className="create-button">Create New Book Club</button>
          </div>
        </div>

        <div className="search-sort-heading">
          <div className="two-p">
            <p
              className={activeTab === 'all' ? "active-tab" : ""}
              onClick={() => handleTabChange('all')}
            >
              All Book Clubs
            </p>
            <p
              className={activeTab === 'my' ? "active-tab" : ""}
              onClick={() => handleTabChange('my')}
            >
              My Book Clubs
            </p>
          </div>
        </div>

        {activeTab === 'all' && (
          <div className="search-categories">
            <div className="search">
              <CiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for a book club..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="categories">
              <select
                name="categories"
                className="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {allCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="book-clubs-container">
        {filteredClubs.length > 0 ? (
          filteredClubs.map((club) => (
            <div
              key={club.id}
              className="book-club-card"
              onClick={() => navigate(`/bookclub/${club.id}`)}
            >
              <div className="club-header">
                <h2 className="club-name">{club.bookClubName}</h2>
                <span className="member-count">{club.members.length} members</span>
              </div>

              <p className="club-description">{club.description.slice(0,100)}...</p>

              <div className="genres-container">
                {club.genres.map((genre, index) => (
                  <span key={index} className="genre-tag">{genre}</span>
                ))}
              </div>

              <div className="book-and-button-container">
                <div className="current-book">
                  <h4>Currently Reading:</h4>
                  <div className="book-info">
                    <img
                      src={club.currentBook.cover}
                      alt={club.currentBook.title}
                      className="book-cover"
                    />
                    <div className="book-details">
                      <p className="book-title">{club.currentBook.title}</p>
                      <p className="book-author">by {club.currentBook.author}</p>
                    </div>
                  </div>
                </div>

                <button
                  className={`join-button ${joinedClubs.includes(club.id) ? 'joined' : ''}`}
                  onClick={(e) => handleJoinClub(club.id, e)}
                >
                  {joinedClubs.includes(club.id) ? 'Joined' : 'Join now'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No book clubs found matching your criteria.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BookClubList;