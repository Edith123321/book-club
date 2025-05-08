import React, { useEffect, useState } from 'react';
import {
  FiBook, FiUsers, FiSearch, FiEdit, FiTrash2, FiPlus, FiChevronUp, FiChevronDown,
} from 'react-icons/fi';
import '../../styles/AdminPages.css' // Optional if you have styles

const AdminBookClubs = () => {
  const [bookClubs, setBookClubs] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalClubs: 0, averageMembers: 0 });
  const [newClub, setNewClub] = useState({ name: '', synopsis: '', user_id: '', current_book_id: '' });
  const [currentClub, setCurrentClub] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [clubsRes, usersRes, booksRes] = await Promise.all([
        fetch('http://127.0.0.1:5000/bookclubs/'),
        fetch('http://127.0.0.1:5000/users'),
        fetch('http://127.0.0.1:5000/books')
      ]);

      const [clubsData, usersData, booksData] = await Promise.all([
        clubsRes.json(),
        usersRes.json(),
        booksRes.json()
      ]);

      // Ensure users is an array
      setUsers(Array.isArray(usersData) ? usersData : []);
      setBookClubs(clubsData);
      setBooks(booksData);
      setStats({
        totalClubs: clubsData.length,
        averageMembers: (
          clubsData.reduce((acc, club) => acc + (club.memberships?.length || 1), 0) / clubsData.length
        ).toFixed(1),
      });
    } catch (err) {
      setError('Failed to load data. Please check your backend.');
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showAddForm) {
      setNewClub(prev => ({ ...prev, [name]: value }));
    } else if (showEditForm && currentClub) {
      setCurrentClub(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddClub = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/bookclubs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClub),
      });
      if (!res.ok) throw new Error('Add failed');
      await fetchAllData();
      setShowAddForm(false);
      setNewClub({ name: '', synopsis: '', user_id: '', current_book_id: '' });
    } catch {
      setError('Failed to add club.');
    }
  };

  const handleEditClub = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/bookclubs/${currentClub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentClub),
      });
      if (!res.ok) throw new Error('Edit failed');
      await fetchAllData();
      setShowEditForm(false);
    } catch {
      setError('Failed to update club.');
    }
  };

  const handleDeleteClub = async (id) => {
    if (!window.confirm('Are you sure you want to delete this club?')) return;
    try {
      await fetch(`http://127.0.0.1:5000/bookclubs/${id}`, { method: 'DELETE' });
      await fetchAllData();
    } catch {
      setError('Failed to delete club.');
    }
  };

  const handleSetCurrentBook = async (clubId, bookId) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/bookclubs/${clubId}/set_current_book`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: bookId }),
      });
      if (!res.ok) throw new Error('Failed to update book');
      await fetchAllData();
    } catch {
      setError('Could not set current book');
    }
  };

  const getBookTitle = (bookId) => books.find(book => book.id === bookId)?.title || '—';
  const getUserName = (userId) => {
    if (!Array.isArray(users)) return 'Unknown';
    return users.find(user => user.id === userId)?.username || 'Unknown';
  };
  const userList = Array.isArray(users) ? users.map(user => (
    <div key={user.id}>{user.username}</div>
  )) : null; // or show a fallback message

  const requestSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const sortedClubs = [...bookClubs].sort((a, b) => {
    const key = sortConfig.key;
    const aVal = key.includes('.') ? key.split('.').reduce((o, k) => o?.[k], a) : a[key];
    const bVal = key.includes('.') ? key.split('.').reduce((o, k) => o?.[k], b) : b[key];
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredClubs = sortedClubs.filter(club => {
    const owner = getUserName(club.user_id);
    const book = getBookTitle(club.currentbook?.book_id);
    return (
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const updateState = (updates) => {
    if ('showAddForm' in updates) setShowAddForm(updates.showAddForm);
    if ('showEditForm' in updates) setShowEditForm(updates.showEditForm);
    if ('showMemberForm' in updates) setShowMemberForm(updates.showMemberForm);
    if ('currentClub' in updates) setCurrentClub(updates.currentClub);
    if ('searchTerm' in updates) setSearchTerm(updates.searchTerm);
    if ('error' in updates) setError(updates.error);
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Book Clubs Management</h2>
        <button
          className="add-btn"
          onClick={() => updateState({ showAddForm: true })}
        >
          <FiPlus /> Add Club
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiBook />
          </div>
          <div className="stat-content">
            <h3>Total Clubs</h3>
            <p>{stats.totalClubs}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>Avg. Members</h3>
            <p>{stats.averageMembers}</p>
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search book clubs by name, owner, or current book..."
          value={searchTerm}
          onChange={(e) => updateState({ searchTerm: e.target.value })}
        />
      </div>

      <div className="data-table-container">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('name')}>
                  <div className="th-content">
                    Club Name
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </div>
                </th>
                <th onClick={() => requestSort('memberships.length')}>
                  <div className="th-content">
                    Members
                    {sortConfig.key === 'memberships.length' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </div>
                </th>
                <th onClick={() => requestSort('currentbook.book_id')}>
                  <div className="th-content">
                    Current Book
                    {sortConfig.key === 'currentbook.book_id' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </div>
                </th>
                <th onClick={() => requestSort('user_id')}>
                  <div className="th-content">
                    Owner
                    {sortConfig.key === 'user_id' && (
                      sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                    )}
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClubs.length > 0 ? (
                filteredClubs.map(club => (
                  <tr key={club.id}>
                    <td>
                      <div className="club-name-cell">
                        <span className="club-name">{club.name}</span>
                        {club.synopsis && (
                          <div className="club-synopsis-tooltip">
                            <span className="tooltip-text">{club.synopsis}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{club.memberships?.length || 1}</td>
                    <td>
                      {getBookTitle(club.currentbook?.book_id)}
                      {books.length > 0 && (
                        <select
                          className="book-select"
                          value={club.currentbook?.book_id || ''}
                          onChange={(e) => handleSetCurrentBook(club.id, e.target.value)}
                        >
                          <option value="">Change Book</option>
                          {books.map(book => (
                            <option key={book.id} value={book.id}>
                              {book.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>{getUserName(club.user_id)}</td>
                    <td className="actions">
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          updateState({
                            currentClub: {
                              ...club,
                              current_book_id: club.currentbook?.book_id || ''
                            },
                            showEditForm: true
                          });
                        }}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteClub(club.id)}
                      >
                        <FiTrash2 />
                      </button>
                      <button
                        className="action-btn members"
                        onClick={() => {
                          updateState({
                            currentClub: club,
                            showMemberForm: true
                          });
                        }}
                      >
                        <FiUsers />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    No clubs found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Club Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Book Club</h3>
              <button
                className="close-btn"
                onClick={() => updateState({ showAddForm: false, error: null })}
              >
                &times;
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-body">
              <div className="form-group">
                <label>Club Name*</label>
                <input
                  type="text"
                  name="name"
                  value={newClub.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter club name"
                />
              </div>
              <div className="form-group">
                <label>Synopsis</label>
                <textarea
                  name="synopsis"
                  value={newClub.synopsis}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the club"
                />
              </div>
              <div className="form-group">
                <label>Owner*</label>
                <select
                  name="user_id"
                  value={newClub.user_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Owner</option>
                  {Array.isArray(users) && users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Current Book</label>
                <select
                  name="current_book_id"
                  value={newClub.current_book_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select Current Book</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => updateState({ showAddForm: false, error: null })}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleAddClub}
                disabled={!newClub.name || !newClub.user_id}
              >
                Add Club
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Club Modal */}
      {showEditForm && currentClub && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Book Club</h3>
              <button
                className="close-btn"
                onClick={() => updateState({ showEditForm: false, error: null })}
              >
                &times;
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-body">
              <div className="form-group">
                <label>Club Name*</label>
                <input
                  type="text"
                  name="name"
                  value={currentClub.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Synopsis</label>
                <textarea
                  name="synopsis"
                  value={currentClub.synopsis}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Owner*</label>
                <select
                  name="user_id"
                  value={currentClub.user_id}
                  onChange={handleInputChange}
                  required
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Current Book</label>
                <select
                  name="current_book_id"
                  value={currentClub.current_book_id}
                  onChange={handleInputChange}
                >
                  <option value="">No Current Book</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => updateState({ showEditForm: false, error: null })}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleEditClub}
                disabled={!currentClub.name || !currentClub.user_id}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberForm && currentClub && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Member to {currentClub.name}</h3>
              <button
                className="close-btn"
                onClick={() => updateState({ showMemberForm: false, error: null })}
              >
                &times;
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-body">
              <div className="form-group">
                <label>User*</label>
                <select
                  name="user_id"
                  value={newMember.user_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select User</option>
                  {users
                    .filter(user => !currentClub.memberships?.some(m => m.user_id === user.id))
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.email})
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={newMember.role}
                  onChange={handleInputChange}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => updateState({ showMemberForm: false, error: null })}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={() => handleAddMember(currentClub.id)}
                disabled={!newMember.user_id}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookClubs;