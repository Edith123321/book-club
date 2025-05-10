import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../styles/BookClubList.css';

const BookClubList = () => {
  // State management
  const [allClubs, setAllClubs] = useState([]);
  const [myClubIds, setMyClubIds] = useState(() => {
    const storedIds = localStorage.getItem('myBookClubIds');
    return storedIds ? JSON.parse(storedIds) : [];
  });
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [clubToDelete, setClubToDelete] = useState(null);
  const navigate = useNavigate();

  // Constants
  const BASE_URL = 'http://127.0.0.1:5000';

  // Fetch book clubs
  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/bookclubs/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllClubs(data.bookclubs || []); // Access the bookclubs array from response
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle club membership
  const handleClubMembership = (clubId, action) => {
    try {
      let updatedIds;
      
      if (action === 'join') {
        updatedIds = [...myClubIds, clubId];
      } else {
        updatedIds = myClubIds.filter(id => id !== clubId);
      }
      
      setMyClubIds(updatedIds);
      localStorage.setItem('myBookClubIds', JSON.stringify(updatedIds));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete club
  const handleDeleteClub = async (clubId) => {
    try {
      const response = await fetch(`${BASE_URL}/bookclubs/${clubId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setAllClubs(allClubs.filter(club => club.id !== clubId));
      setMyClubIds(myClubIds.filter(id => id !== clubId));
      localStorage.setItem('myBookClubIds', JSON.stringify(
        myClubIds.filter(id => id !== clubId)
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter clubs based on search term
  const filterClubs = (clubs) => {
    if (!Array.isArray(clubs)) return [];

    return clubs.filter(club => {
      const name = club.name?.toLowerCase() || '';
      const synopsis = club.synopsis?.toLowerCase() || '';

      return name.includes(searchTerm.toLowerCase()) || 
             synopsis.includes(searchTerm.toLowerCase());
    });
  };

  // Effects
  useEffect(() => {
    fetchClubs();
  }, []);

  // Derived values
  const clubsToFilter = activeTab === 'all' 
    ? allClubs 
    : allClubs.filter(club => myClubIds.includes(club.id));
  
  const filteredClubs = filterClubs(clubsToFilter);
  const isClubJoined = (clubId) => myClubIds.includes(clubId);
  const isOwner = (club) => {
    const currentUserId = localStorage.getItem('userId');
    return club.owner_id === currentUserId;
  };

  // Render club card
  const renderClubCard = (club) => (
  <div 
    key={club.id}
    className="book-club-card"
    onClick={() => navigate(`/bookclub/${club.id}`)}
    role="button"
    tabIndex={0}
    aria-label={`View ${club.name} details`}
  >
    <div className="club-header">
      <h2 className="club-name">{club.name}</h2>
      <span className="member-count">{club.member_count} members</span>
      <span className={`status-badge ${club.status.toLowerCase()}`}>
        {club.status}
      </span>
    </div>

    <p className="club-synopsis">
      {club.synopsis?.slice(0, 150)}...
    </p>

    {/* Side-by-side layout for 'Currently Reading' */}
    <div className="current-reading-container" style={{ display: 'flex', gap: '1rem' }}>
      <h4 style={{ flexShrink: 0 }}>Currently Reading:</h4>
      <div className="book-details">
        <p className="book-title">{club.current_book?.title}</p>
        <p className="book-author">by {club.current_book?.author}</p>
        {club.current_book?.progress && (
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${club.current_book.progress}%` }}
            ></div>
            <span>{club.current_book.progress}% complete</span>
          </div>
        )}
      </div>
    </div>

    {/* Bottom actions */}
    <div className="club-actions">
      <button
        className={`join-button ${isClubJoined(club.id) ? 'joined' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          handleClubMembership(club.id, isClubJoined(club.id) ? 'leave' : 'join');
        }}
        aria-label={isClubJoined(club.id) ? 'Leave club' : 'Join club'}
      >
        {isClubJoined(club.id) ? 'Joined' : 'Join now'}
      </button>

      {isOwner(club) && (
        <>
          <button
            className="edit-button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit-bookclub/${club.id}`);
            }}
            aria-label={`Edit ${club.name}`}
          >
            Edit
          </button>
          <button
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              setClubToDelete(club.id);
              setShowDeleteConfirmation(true);
            }}
            aria-label={`Delete ${club.name}`}
          >
            Delete
          </button>
        </>
      )}
    </div>
  </div>
);


  // Loading and error states
  if (loading) return <div className="loading">Loading book clubs...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="book-club-list-page">
      <Navbar />

      <div className="section-container">
        <div className="section-heading-container">
          <div className="heading-p">
            <h1>Book Clubs</h1>
            <p>Find your perfect reading community and connect with fellow book lovers</p>
          </div>
          <button 
            className="create-button" 
            onClick={() => navigate('/add-bookclub')}
            aria-label="Create new book club"
          >
            Create New Book Club
          </button>
        </div>

        <div className="search-sort-heading">
          <div className="two-p">
            <button
              className={`tab-button ${activeTab === 'all' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('all')}
              aria-label="View all book clubs"
            >
              All Book Clubs
            </button>
            <button
              className={`tab-button ${activeTab === 'my' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('my')}
              aria-label="View my book clubs"
            >
              My Book Clubs
            </button>
          </div>
        </div>

        <div className="search-categories">
          <div className="search">
            <CiSearch className="search-icon" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search for a book club..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search book clubs"
            />
          </div>
        </div>
      </div>

      <div className="book-clubs-container">
        {filteredClubs.length > 0 ? (
          filteredClubs.map(renderClubCard)
        ) : (
          <div className="no-results">
            <p>No book clubs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this book club? This action cannot be undone.</p>
            <div className="modal-buttons">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={() => {
                  handleDeleteClub(clubToDelete);
                  setShowDeleteConfirmation(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default BookClubList;