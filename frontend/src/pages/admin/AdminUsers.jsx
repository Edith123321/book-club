import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiChevronUp, FiChevronDown, FiEdit, FiTrash2 } from 'react-icons/fi';


const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    is_admin: false,
    is_active: true,
    password: 'defaultPassword'
  });


  // Stats
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [inactiveUsers, setInactiveUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);


  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/users/');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
       
        // Handle both array response and paginated response
        const usersData = Array.isArray(data) ? data : (data.users || []);
        setUsers(usersData);
        setFilteredUsers(sortUsers(usersData));
        calculateStats(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
   
    fetchUsers();
  }, []);


  // Calculate statistics
  const calculateStats = (users) => {
    setTotalUsers(users.length);
    setActiveUsers(users.filter(user => user.is_active).length);
    setInactiveUsers(users.filter(user => !user.is_active).length);
   
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    setNewUsers(users.filter(user => {
      const createdDate = new Date(user.created_at || user.date_joined);
      return createdDate > thirtyDaysAgo;
    }).length);
  };


  // Filter and sort users based on search term and sort config
  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(sortUsers(filtered));
  }, [searchTerm, users, sortConfig]);


  // Sort functionality
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };


  const sortUsers = (users) => {
    return [...users].sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key);
      const bValue = getSortValue(b, sortConfig.key);


      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };


  const getSortValue = (user, key) => {
    switch(key) {
      case 'username':
        return user.username.toLowerCase();
      case 'email':
        return user.email.toLowerCase();
      case 'is_admin':
        return user.is_admin ? 1 : 0;
      case 'is_active':
        return user.is_active ? 1 : 0;
      case 'created_at':
        return new Date(user.created_at || user.date_joined);
      case 'last_login':
        return user.last_login ? new Date(user.last_login) : new Date(0);
      default:
        return '';
    }
  };


  // Form handling
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
   
    if (showEditForm) {
      setCurrentUser(prev => ({ ...prev, [name]: inputValue }));
    } else {
      setNewUser(prev => ({ ...prev, [name]: inputValue }));
    }
  };


  // Add new user
  const handleAddUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }


      const result = await response.json();
      setUsers(prev => [...prev, result]);
      setShowAddForm(false);
      setNewUser({
        username: '',
        email: '',
        is_admin: false,
        is_active: true,
        password: 'defaultPassword'
      });
    } catch (error) {
      console.error('Error adding user:', error);
      alert(error.message);
    }
  };


  // Edit user
  const handleEditUser = async () => {
    try {
      const response = await fetch(`http://localhost:5000/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser.username,
          email: currentUser.email,
          is_admin: currentUser.is_admin,
          is_active: currentUser.is_active,
          bio: currentUser.bio || ''
        })
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }


      const result = await response.json();
      setUsers(prev => prev.map(user =>
        user.id === currentUser.id ? result : user
      ));
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.message);
    }
  };


  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
   
    try {
      const response = await fetch(`http://localhost:5000/users/${id}`, {
        method: 'DELETE'
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }


      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.message);
    }
  };


  // Toggle user status
  const toggleUserStatus = async (user) => {
    try {
      const response = await fetch(`http://localhost:5000/users/${user.id}/${user.is_active ? 'deactivate' : 'activate'}`, {
        method: 'PATCH'
      });


      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }


      const updatedUser = await response.json();
      setUsers(prev => prev.map(u =>
        u.id === user.id ? updatedUser : u
      ));
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert(error.message);
    }
  };


  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Users Management</h2>
        <button
          className="add-btn"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus /> Add User
        </button>
      </div>


      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p>{activeUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Inactive Users</h3>
          <p>{inactiveUsers}</p>
        </div>
        <div className="stat-card">
          <h3>New Users (30d)</h3>
          <p>{newUsers}</p>
        </div>
      </div>


      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>


      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('username')}>
                Username {sortConfig.key === 'username' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th>Email</th>
              <th onClick={() => requestSort('is_admin')}>
                Role {sortConfig.key === 'is_admin' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('is_active')}>
                Status {sortConfig.key === 'is_active' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('created_at')}>
                Created {sortConfig.key === 'created_at' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                    </div>
                  </td>
                  <td className="user-email">{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.is_admin ? 'admin' : 'member'}`}>
                      {user.is_admin ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}
                      onClick={() => toggleUserStatus(user)}
                      style={{ cursor: 'pointer' }}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td className="actions">
                    <button
                      className="action-btn edit"
                      onClick={() => {
                        setCurrentUser({
                          ...user,
                          password: '' // Clear password for security
                        });
                        setShowEditForm(true);
                      }}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  No users found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Add User Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New User</h3>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_admin"
                  checked={newUser.is_admin}
                  onChange={handleInputChange}
                />
                Admin User
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={newUser.is_active}
                  onChange={handleInputChange}
                />
                Active User
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleAddUser}
                disabled={!newUser.username || !newUser.email || !newUser.password}
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Edit User Modal */}
      {showEditForm && currentUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit User</h3>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={currentUser.username}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={currentUser.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={currentUser.bio || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_admin"
                  checked={currentUser.is_admin}
                  onChange={handleInputChange}
                />
                Admin User
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={currentUser.is_active}
                  onChange={handleInputChange}
                />
                Active User
              </label>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleEditUser}
                disabled={!currentUser.username || !currentUser.email}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminUsers;

