import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiEye, FiPlus, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import '../../styles/AdminPages.css';

const AdminUsers = () => {
  // Sample data
  const initialUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Member', status: 'Active', created: '2025-01-15', lastLogin: '2025-03-20' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Member', status: 'Active', created: '2025-02-10', lastLogin: '2025-04-18' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Member', status: 'Inactive', created: '2025-03-05', lastLogin: '2025-05-01' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Admin', status: 'Active', created: '2025-02-01', lastLogin: '2025-04-19' },
  ];

  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Member',
    status: 'Active'
  });

  // Stats calculation
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'Active').length;
  const inactiveUsers = users.filter(user => user.status === 'Inactive').length;
  const newUsers = users.filter(user => {
    const createdDate = new Date(user.created);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  }).length;

  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  // Filter users based on search term
  const filteredUsers = sortedUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD operations
  const handleAddUser = () => {
    const newId = Math.max(...users.map(user => user.id)) + 1;
    setUsers([...users, { ...newUser, id: newId, created: new Date().toISOString().split('T')[0], lastLogin: '' }]);
    setShowAddForm(false);
    setNewUser({ name: '', email: '', role: 'Member', status: 'Active' });
  };

  const handleEditUser = () => {
    setUsers(users.map(user => user.id === currentUser.id ? currentUser : user));
    setShowEditForm(false);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditForm) {
      setCurrentUser({ ...currentUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
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
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info">
                    <div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.created}</td>
                <td>{user.lastLogin || 'Never'}</td>
                <td className="actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => {
                      setCurrentUser({...user});
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
            ))}
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
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
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
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={currentUser.email}
                onChange={handleInputChange}
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