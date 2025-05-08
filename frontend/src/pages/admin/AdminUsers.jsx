import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiChevronUp, FiChevronDown, FiEdit, FiTrash2 } from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Member',
    status: 'Active'
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
        
        setUsers(data.users || data); // Handle both formats
        calculateStats(data.users || data);
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

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
      // Handle nested properties and null values
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
      case 'name': 
        return user.name || user.username || '';
      case 'role':
        return user.is_admin ? 'Admin' : 'Member';
      case 'status':
        return user.is_active ? 'Active' : 'Inactive';
      case 'created':
        return new Date(user.created_at || user.date_joined);
      case 'lastLogin':
        return user.last_login ? new Date(user.last_login) : new Date(0);
      default:
        return '';
    }
  };

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditForm) {
      setCurrentUser(prev => ({ ...prev, [name]: value }));
    } else {
      setNewUser(prev => ({ ...prev, [name]: value }));
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
        body: JSON.stringify({
          username: newUser.name,
          email: newUser.email,
          is_admin: newUser.role === 'Admin',
          is_active: newUser.status === 'Active',
          password: 'defaultPassword' // In a real app, you'd generate or prompt for this
        })
      });

      if (!response.ok) throw new Error('Failed to add user');

      const result = await response.json();
      setUsers(prev => [...prev, result]);
      setShowAddForm(false);
      setNewUser({
        name: '',
        email: '',
        role: 'Member',
        status: 'Active'
      });
    } catch (error) {
      console.error('Error adding user:', error);
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
          username: currentUser.name,
          email: currentUser.email,
          is_admin: currentUser.role === 'Admin',
          is_active: currentUser.status === 'Active'
        })
      });

      if (!response.ok) throw new Error('Failed to update user');

      const result = await response.json();
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id ? result : user
      ));
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/users/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
              <th onClick={() => requestSort('name')}>
                User {sortConfig.key === 'name' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('role')}>
                Role {sortConfig.key === 'role' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('status')}>
                Status {sortConfig.key === 'status' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('created')}>
                Created {sortConfig.key === 'created' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('lastLogin')}>
                Last Login {sortConfig.key === 'lastLogin' && (
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
                      <div>
                        <div className="user-name">{user.name || user.username}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.is_admin ? 'admin' : 'member'}`}>
                      {user.is_admin ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at || user.date_joined)}</td>
                  <td>{formatDate(user.last_login)}</td>
                  <td className="actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => {
                        setCurrentUser({
                          ...user,
                          name: user.name || user.username,
                          role: user.is_admin ? 'Admin' : 'Member',
                          status: user.is_active ? 'Active' : 'Inactive'
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
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newUser.name}
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
              <label>Role</label>
              <select
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
              >
                <option value="Member">Member</option>
                <option value="Moderator">Moderator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={newUser.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
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
                disabled={!newUser.name || !newUser.email}
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
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={currentUser.name}
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
              <label>Role</label>
              <select
                name="role"
                value={currentUser.role}
                onChange={handleInputChange}
              >
                <option value="Member">Member</option>
                <option value="Moderator">Moderator</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={currentUser.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
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
                disabled={!currentUser.name || !currentUser.email}
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