import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiUsers, FiBook, FiCalendar, FiSearch } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
import '../../styles/MyBookClubs.css';

const MyBookClubs = () => {
  // State for active tab (My Clubs or Joined Clubs)
  const [activeTab, setActiveTab] = useState('myClubs');
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for filter and sort
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest');
  
  // Sample data for book clubs
  const [bookClubs, setBookClubs] = useState([
    {
      id: 1,
      name: 'The Page Turners',
      categories: ['Fiction', 'Classics'],
      members: 42,
      currentBook: 'To Kill a Mockingbird',
      nextMeeting: 'May 15, 2023',
      status: 'Active',
      color: 'purple',
      initials: 'PT',
      owner: true
    },
    {
      id: 2,
      name: 'Mystery Mavens',
      categories: ['Mystery', 'Thriller'],
      members: 38,
      currentBook: 'The Silent Patient',
      nextMeeting: 'May 18, 2023',
      status: 'Active',
      color: 'blue',
      initials: 'MM',
      owner: true
    },
    {
      id: 3,
      name: 'Fiction Fanatics',
      categories: ['Contemporary', 'Literary'],
      members: 35,
      currentBook: 'The Midnight Library',
      nextMeeting: 'May 22, 2023',
      status: 'Pending',
      color: 'orange',
      initials: 'FF',
      owner: true
    },
    {
      id: 4,
      name: 'Science Fiction Society',
      categories: ['Sci-Fi', 'Fantasy'],
      members: 27,
      currentBook: 'Project Hail Mary',
      nextMeeting: 'May 25, 2023',
      status: 'Active',
      color: 'green',
      initials: 'SF',
      owner: false
    },
    {
      id: 5,
      name: 'Historical Perspectives',
      categories: ['History', 'Biography'],
      members: 31,
      currentBook: 'The Splendid and the Vile',
      nextMeeting: 'May 27, 2023',
      status: 'Active',
      color: 'red',
      initials: 'HP',
      owner: false
    }
  ]);

  // Function to handle club creation
  const handleCreateClub = () => {
    alert('Create new club modal would open here');
  };

  // Function to handle club editing
  const handleEditClub = (id) => {
    alert(`Edit club with ID: ${id}`);
  };

  // Function to handle club deletion
  const handleDeleteClub = (id) => {
    if (window.confirm('Are you sure you want to delete this book club?')) {
      setBookClubs(bookClubs.filter(club => club.id !== id));
      alert(`Club with ID: ${id} deleted`);
    }
  };

  // Function to view club details
  const handleViewDetails = (id) => {
    alert(`View details for club with ID: ${id}`);
  };

  // Filter clubs based on search query, category filter, and active tab
  const filteredClubs = bookClubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || 
      club.categories.some(cat => cat.toLowerCase() === categoryFilter.toLowerCase());
    const matchesTab = activeTab === 'myClubs' ? club.owner : !club.owner;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  // Sort clubs based on sort option
  const sortedClubs = [...filteredClubs].sort((a, b) => {
    if (sortBy === 'Newest') {
      return new Date(b.nextMeeting) - new Date(a.nextMeeting);
    } else if (sortBy === 'Oldest') {
      return new Date(a.nextMeeting) - new Date(b.nextMeeting);
    } else if (sortBy === 'Name A-Z') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'Name Z-A') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  return (
    <div className="book-clubs-container">
      <header className="page-header">
        <div className="header-content">
          <h1>My Book Clubs</h1>
          <p>Manage your book clubs and memberships</p>
        </div>
        <button className="create-club-btn" onClick={handleCreateClub}>
          <FaPlus /> Create New Club
        </button>
      </header>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'myClubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('myClubs')}
        >
          My Clubs <span className="count">3</span>
        </button>
        <button 
          className={`tab ${activeTab === 'joinedClubs' ? 'active' : ''}`}
          onClick={() => setActiveTab('joinedClubs')}
        >
          Joined Clubs <span className="count">5</span>
        </button>
      </div>

      <div className="filters">
        <div className="search">
          <FiSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input 
            type="text" 
            placeholder="Search clubs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option>All Categories</option>
            <option>Fiction</option>
            <option>Classics</option>
            <option>Mystery</option>
            <option>Thriller</option>
            <option>Contemporary</option>
            <option>Literary</option>
            <option>Sci-Fi</option>
            <option>Fantasy</option>
            <option>History</option>
            <option>Biography</option>
          </select>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Newest</option>
            <option>Oldest</option>
            <option>Name A-Z</option>
            <option>Name Z-A</option>
          </select>
        </div>
      </div>

      <div className="clubs-grid">
        {sortedClubs.map(club => (
          <div className="club-card" key={club.id}>
            <div className={`club-header ${club.color}`}>
              <div className="club-actions">
                <button className="edit-btn" onClick={() => handleEditClub(club.id)}>
                  <FiEdit2 />
                </button>
                <button className="delete-btn" onClick={() => handleDeleteClub(club.id)}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <div className="club-content">
              <div className={`club-avatar ${club.color}`}>
                {club.initials}
              </div>
              <h2 className="club-name">{club.name}</h2>
              <div className="club-categories">
                {club.categories.join(', ')}
              </div>
              <div className="club-details">
                <div className="detail">
                  <FiUsers /> {club.members} members
                </div>
                <div className="detail">
                  <FiBook /> Currently reading: {club.currentBook}
                </div>
                <div className="detail">
                  <FiCalendar /> Next meeting: {club.nextMeeting}
                </div>
              </div>
              <div className="club-footer">
                <span className={`status ${club.status.toLowerCase()}`}>
                  {club.status}
                </span>
                <button 
                  className="view-details-btn"
                  onClick={() => handleViewDetails(club.id)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookClubs;