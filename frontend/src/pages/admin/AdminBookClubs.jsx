import React, { useState, useEffect } from 'react';
import { FiBook, FiUsers, FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import '../../styles/AdminPages.css';

const AdminBookClubs = () => {
  // State management
  const [bookClubs, setBookClubs] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showForm, setShowForm] = useState(false);
  const [currentClub, setCurrentClub] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    synopsis: '',
    status: 'Active',
    owner_id: '',
    current_book: {
      title: '',
      author: '',
      description: '',
      progress: 0,
      pagesRead: 0,
      cover: ''
    }
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalClubs: 0,
    activeClubs: 0,
    clubsWithBooks: 0,
    averageMembers: 0
  });

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [clubsRes, booksRes, usersRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/bookclubs/'),
          fetch('http://127.0.0.1:5000/books/'),
          fetch('http://127.0.0.1:5000/users/')
        ]);

        // Check for HTTP errors
        if (!clubsRes.ok) throw new Error('Failed to fetch clubs');
        if (!booksRes.ok) throw new Error('Failed to fetch books');
        if (!usersRes.ok) throw new Error('Failed to fetch users');

        const [clubsData, booksData, usersData] = await Promise.all([
          clubsRes.json(),
          booksRes.json(),
          usersRes.json()
        ]);

        // Process data with proper fallbacks
        const processedClubs = (
          Array.isArray(clubsData) ? clubsData :
          clubsData?.bookclubs ? clubsData.bookclubs :
          clubsData?.data ? clubsData.data :
          []
        );

        const processedBooks = (
          Array.isArray(booksData) ? booksData :
          booksData?.books ? booksData.books :
          booksData?.data ? booksData.data :
          []
        );

        const processedUsers = (
          Array.isArray(usersData) ? usersData :
          usersData?.users ? usersData.users :
          usersData?.data ? usersData.data :
          []
        );

        // Validate we got arrays
        if (!Array.isArray(processedClubs)) throw new Error('Invalid clubs data format');
        if (!Array.isArray(processedBooks)) throw new Error('Invalid books data format');
        if (!Array.isArray(processedUsers)) throw new Error('Invalid users data format');

        setBookClubs(processedClubs);
        setBooks(processedBooks);
        setUsers(processedUsers);
        calculateStats(processedClubs);

      } catch (err) {
        console.error('Fetch error:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics
  const calculateStats = (clubs) => {
    const activeClubs = clubs.filter(c => c.status === 'Active').length;
    const clubsWithBooks = clubs.filter(c => c.current_book && c.current_book.title).length;
    const totalMembers = clubs.reduce((sum, club) => sum + (club.member_count || 0), 0);
    const avgMembers = clubs.length > 0 ? totalMembers / clubs.length : 0;

    setStats({
      totalClubs: clubs.length,
      activeClubs,
      clubsWithBooks,
      averageMembers: avgMembers
    });
  };

  // Filter and sort clubs
  useEffect(() => {
  const filtered = bookClubs.filter(club => {
    const searchLower = searchTerm.toLowerCase();
    return (
      club.name?.toLowerCase().includes(searchLower) ||
      club.current_book?.title?.toLowerCase().includes(searchLower) ||
      club.synopsis?.toLowerCase().includes(searchLower) ||
      getOwnerName(club.owner_id)?.toLowerCase().includes(searchLower)
    );
  });
  setFilteredClubs(sortClubs(filtered));
}, [searchTerm, bookClubs, sortConfig, users]);


  // Sorting functionality
  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortClubs = (clubs) => {
    return [...clubs].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortValue = (club, key) => {
    switch (key) {
      case 'name': return club.name || '';
      case 'owner': return getOwnerName(club.owner_id);
      case 'created_at': return new Date(club.created_at || 0);
      case 'current_book.title': return club.current_book?.title || '';
      case 'member_count': return club.member_count || 0;
      default: return club[key] || '';
    }
  };

  // Helper functions
  const getOwnerName = (ownerId) => {
    if (!ownerId) return 'Unknown';
    const owner = users.find(u => u.id === ownerId);
    return owner ? owner.username : 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in formData) {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        current_book: { ...prev.current_book, [name]: value }
      }));
    }
  };

  const openEditForm = (club) => {
    setCurrentClub(club);
    setFormData({
      name: club.name || '',
      synopsis: club.synopsis || '',
      status: club.status || 'Active',
      owner_id: club.owner_id || '',
      current_book: club.current_book || {
        title: '',
        author: '',
        description: '',
        progress: 0,
        pagesRead: 0,
        cover: ''
      }
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      synopsis: '',
      status: 'Active',
      owner_id: '',
      current_book: {
        title: '',
        author: '',
        description: '',
        progress: 0,
        pagesRead: 0,
        cover: ''
      }
    });
    setCurrentClub(null);
    setShowForm(false);
    setError(null);
  };

  // API operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = currentClub
        ? `http://127.0.0.1:5000/bookclubs/${currentClub.id}`
        : 'http://127.0.0.1:5000/bookclubs/';

      const method = currentClub ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      const result = await response.json();
      
      // Update state based on operation
      if (currentClub) {
        setBookClubs(prev => prev.map(c => c.id === currentClub.id ? result : c));
      } else {
        setBookClubs(prev => [...prev, result]);
      }
      
      resetForm();
    } catch (err) {
      console.error('Operation error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this club?')) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/bookclubs/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Delete failed');

      setBookClubs(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message);
    }
  };

  // Render loading state
  if (isLoading && bookClubs.length === 0) {
    return <div className="admin-page loading">Loading book clubs...</div>;
  }

  // Render error state
  if (error && bookClubs.length === 0) {
    return (
      <div className="admin-page error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Book Clubs Management</h2>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <FiPlus /> Add Club
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <FiBook className="stat-icon" />
          <div className="stat-content">
            <h3>Total Clubs</h3>
            <p>{stats.totalClubs}</p>
          </div>
        </div>
        <div className="stat-card">
          <FiUsers className="stat-icon" />
          <div className="stat-content">
            <h3>Active Clubs</h3>
            <p>{stats.activeClubs}</p>
          </div>
        </div>
        <div className="stat-card">
          <FiBook className="stat-icon" />
          <div className="stat-content">
            <h3>Clubs with Books</h3>
            <p>{stats.clubsWithBooks}</p>
          </div>
        </div>
        <div className="stat-card">
          <FiUsers className="stat-icon" />
          <div className="stat-content">
            <h3>Avg. Members</h3>
            <p>{stats.averageMembers.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search clubs by name, book, owner, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Clubs Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')}>
                <div className="th-content">
                  Name
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                  )}
                </div>
              </th>
              <th onClick={() => requestSort('current_book.title')}>
                <div className="th-content">
                  Current Book
                  {sortConfig.key === 'current_book.title' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                  )}
                </div>
              </th>
              <th onClick={() => requestSort('owner')}>
                <div className="th-content">
                  Owner
                  {sortConfig.key === 'owner' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                  )}
                </div>
              </th>
              <th onClick={() => requestSort('created_at')}>
                <div className="th-content">
                  Created
                  {sortConfig.key === 'created_at' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                  )}
                </div>
              </th>
              <th onClick={() => requestSort('member_count')}>
                <div className="th-content">
                  Members
                  {sortConfig.key === 'member_count' && (
                    sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                  )}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClubs.length > 0 ? (
              filteredClubs.map(club => {
                const currentBook = club.current_book || {};
                const membersCount = club.member_count || 0;
                const createdAt = formatDate(club.created_at);
                const ownerName = getOwnerName(club.owner_id);

                return (
                  <tr key={club.id}>
                    <td>
                      <div className="club-name-cell">
                        <span className="club-name">{club.name || 'Unnamed Club'}</span>
                        {/* {club.synopsis && (
                          <div className="club-synopsis-tooltip">
                            <span className="tooltip-text">{club.synopsis}</span>
                          </div>
                        )} */}
                      </div>
                    </td>
                    <td>
                      {currentBook.title ? (
                        <>
                          <strong>{currentBook.title}</strong>
                          <div className="book-meta">
                            by {currentBook.author || 'Unknown'} • {currentBook.progress || 0}%
                            {currentBook.pagesRead && ` (${currentBook.pagesRead} pages)`}
                          </div>
                        </>
                      ) : (
                        'No current book'
                      )}
                    </td>
                    <td>{ownerName}</td>
                    <td>{createdAt}</td>
                    <td>{membersCount}</td>
                    <td className="actions">
                      <button
                        className="action-btn edit"
                        onClick={() => openEditForm(club)}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(club.id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  {bookClubs.length === 0 ? 'No book clubs found' : 'No matching clubs found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{currentClub ? 'Edit Book Club' : 'Add New Book Club'}</h3>
              <button className="close-btn" onClick={resetForm}>
                &times;
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Club Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Synopsis</label>
                <textarea
                  name="synopsis"
                  value={formData.synopsis}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Owner *</label>
                <select
                  name="owner_id"
                  value={formData.owner_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Owner</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <h4>Current Book Details</h4>

              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.current_book.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.current_book.author}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.current_book.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Progress (%)</label>
                  <input
                    type="number"
                    name="progress"
                    min="0"
                    max="100"
                    value={formData.current_book.progress}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Pages Read</label>
                  <input
                    type="number"
                    name="pagesRead"
                    min="0"
                    value={formData.current_book.pagesRead}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Cover Image URL</label>
                <input
                  type="text"
                  name="cover"
                  value={formData.current_book.cover}
                  onChange={handleInputChange}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookClubs;