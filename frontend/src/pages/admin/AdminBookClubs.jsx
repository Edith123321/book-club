import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronUp, FiChevronDown, FiUsers, FiBook } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/AdminPages.css';

const API_BASE_URL = 'http://localhost:5000';

const AdminBookClubs = () => {
  // State management
  const [state, setState] = useState({
    clubs: [],
    users: [],
    books: [],
    loading: true,
    error: null,
    searchTerm: '',
    sortConfig: { key: null, direction: 'asc' },
    showAddForm: false,
    showEditForm: false,
    showMemberForm: false,
    currentClub: null,
    newClub: {
      name: '',
      synopsis: '',
      user_id: '',
      current_book_id: ''
    },
    newMember: {
      user_id: '',
      role: 'member'
    }
  });

  // Destructure state for easier access
  const {
    clubs, users, books, loading, error, searchTerm, sortConfig,
    showAddForm, showEditForm, showMemberForm, currentClub, 
    newClub, newMember
  } = state;

  // Memoized stats calculations
  const stats = useMemo(() => {
    const totalClubs = clubs.length;
    const activeClubs = clubs.filter(club => club.status === "Active").length;
    const averageMembers = clubs.length > 0 
      ? Math.round(clubs.reduce((sum, club) => sum + (club.memberships?.length || 1), 0) / clubs.length)
      : 0;

    return { totalClubs, activeClubs, averageMembers };
  }, [clubs]);

  // Fetch all necessary data
  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
  
      const [clubsRes, usersRes, booksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/bookclubs/`),
        fetch(`${API_BASE_URL}/users/`),
        fetch(`${API_BASE_URL}/books/`)
      ]);
  
      if (!clubsRes.ok || !usersRes.ok || !booksRes.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const clubsData = await clubsRes.json();
      const usersData = await usersRes.json();
      const booksData = await booksRes.json();
  
      // Handle the users data structure properly
      const usersList = Array.isArray(usersData) ? usersData : 
                       (usersData.users || usersData.data || []);
  
      setState(prev => ({
        ...prev,
        clubs: clubsData,
        users: usersList,
        books: Array.isArray(booksData) ? booksData : [],
        loading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.message,
        loading: false,
        users: [],
        books: []
      }));
      toast.error(`Failed to load data: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper functions
  const getUserName = useCallback((userId) => {
  if (!Array.isArray(users)) return 'Unknown User';
  const user = users.find(u => u.id === userId);
  return user ? user.username : 'Unknown User';
}, [users]);

  const getBookTitle = useCallback((bookId) => {
    if (!bookId) return 'None';
    const book = books.find(b => b.id === bookId);
    return book ? book.title : 'Unknown Book';
  }, [books]);

  // Sorting function
  const requestSort = useCallback((key) => {
    setState(prev => {
      let direction = 'asc';
      if (prev.sortConfig.key === key && prev.sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      return { ...prev, sortConfig: { key, direction } };
    });
  }, []);

  // Sorted and filtered clubs
  const { sortedClubs, filteredClubs } = useMemo(() => {
    let sortedClubs = [...clubs];
    
    if (sortConfig.key) {
      sortedClubs.sort((a, b) => {
        let aValue, bValue;
        
        if (sortConfig.key === 'user_name') {
          aValue = getUserName(a.user_id);
          bValue = getUserName(b.user_id);
        } else if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aValue = keys.reduce((obj, key) => obj?.[key], a);
          bValue = keys.reduce((obj, key) => obj?.[key], b);
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    const filtered = sortedClubs.filter(club =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(club.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBookTitle(club.currentbook?.book_id).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return { sortedClubs, filteredClubs: filtered };
  }, [clubs, sortConfig, searchTerm, getUserName, getBookTitle]);

  // State updater helper
  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // CRUD operations
  const handleAddClub = async () => {
    try {
      if (!newClub.name || !newClub.user_id) {
        throw new Error('Club name and owner are required');
      }

      const response = await fetch(`${API_BASE_URL}/bookclubs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClub.name,
          synopsis: newClub.synopsis,
          user_id: newClub.user_id,
          current_book_id: newClub.current_book_id || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add club');
      }

      await fetchData();
      updateState({ 
        showAddForm: false,
        newClub: {
          name: '',
          synopsis: '',
          user_id: '',
          current_book_id: ''
        },
        error: null
      });
      toast.success('Book club added successfully!');
    } catch (err) {
      updateState({ error: err.message });
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleEditClub = async () => {
    try {
      if (!currentClub.name || !currentClub.user_id) {
        throw new Error('Club name and owner are required');
      }

      const response = await fetch(
        `${API_BASE_URL}/bookclubs/${currentClub.id}/`, 
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: currentClub.name,
            synopsis: currentClub.synopsis,
            user_id: currentClub.user_id,
            current_book_id: currentClub.current_book_id || null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update club');
      }

      await fetchData();
      updateState({ showEditForm: false, error: null });
      toast.success('Book club updated successfully!');
    } catch (err) {
      updateState({ error: err.message });
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDeleteClub = async (id) => {
    if (window.confirm('Are you sure you want to delete this book club?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/bookclubs/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete club');
        }

        await fetchData();
        toast.success('Book club deleted successfully!');
      } catch (err) {
        updateState({ error: err.message });
        toast.error(`Error: ${err.message}`);
      }
    }
  };

  const handleAddMember = async (clubId) => {
    try {
      if (!newMember.user_id) {
        throw new Error('User ID is required');
      }

      const response = await fetch(
        `${API_BASE_URL}/bookclubs/${clubId}/members`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: newMember.user_id,
            role: newMember.role
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add member');
      }

      await fetchData();
      updateState({ 
        showMemberForm: false,
        newMember: {
          user_id: '',
          role: 'member'
        },
        error: null
      });
      toast.success('Member added successfully!');
    } catch (err) {
      updateState({ error: err.message });
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleRemoveMember = async (clubId, userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/bookclubs/${clubId}/members/${userId}`, 
          {
            method: 'DELETE'
          }
        );

        if (!response.ok) {
          throw new Error('Failed to remove member');
        }

        await fetchData();
        toast.success('Member removed successfully!');
      } catch (err) {
        updateState({ error: err.message });
        toast.error(`Error: ${err.message}`);
      }
    }
  };

  const handleSetCurrentBook = async (clubId, bookId) => {
    try {
      if (!bookId) {
        throw new Error('Book ID is required');
      }

      const response = await fetch(
        `${API_BASE_URL}/bookclubs/${clubId}/current-book`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book_id: bookId
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to set current book');
      }

      await fetchData();
      toast.success('Current book set successfully!');
    } catch (err) {
      updateState({ error: err.message });
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditForm) {
      updateState({ currentClub: { ...currentClub, [name]: value } });
    } else if (showMemberForm) {
      updateState({ newMember: { ...newMember, [name]: value } });
    } else {
      updateState({ newClub: { ...newClub, [name]: value } });
    }
  };

  // Loading and error states
  if (loading) return (
    <div className="admin-page loading-state">
      <div className="spinner"></div>
      <p>Loading book clubs data...</p>
    </div>
  );

  if (error) return (
    <div className="admin-page error-state">
      <p>Error loading data: {error}</p>
      <button onClick={fetchData} className="retry-btn">
        Retry
      </button>
    </div>
  );

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