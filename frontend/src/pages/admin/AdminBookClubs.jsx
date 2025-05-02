import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import '../../styles/AdminPages.css';

const AdminBookClubs = () => {
  // Sample data
  const initialClubs = [
    { id: 1, name: "Fantasy Readers", members: 24, currentBook: "The Name of the Wind", nextMeeting: "2023-07-15", status: "Active" },
    { id: 2, name: "Sci-Fi Enthusiasts", members: 18, currentBook: "Dune", nextMeeting: "2023-07-20", status: "Active" },
    { id: 3, name: "Mystery Lovers", members: 15, currentBook: "Gone Girl", nextMeeting: "2023-08-05", status: "Upcoming" },
    { id: 4, name: "Classic Literature", members: 12, currentBook: "Pride and Prejudice", nextMeeting: "", status: "Inactive" },
  ];

  const [clubs, setClubs] = useState(initialClubs);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentClub, setCurrentClub] = useState(null);
  const [newClub, setNewClub] = useState({
    name: '',
    members: '',
    currentBook: '',
    nextMeeting: '',
    status: 'Active'
  });

  // Stats calculation
  const totalClubs = clubs.length;
  const activeClubs = clubs.filter(club => club.status === "Active").length;
  const upcomingClubs = clubs.filter(club => club.status === "Upcoming").length;
  const averageMembers = Math.round(clubs.reduce((sum, club) => sum + club.members, 0) / clubs.length);

  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedClubs = React.useMemo(() => {
    let sortableClubs = [...clubs];
    if (sortConfig.key) {
      sortableClubs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableClubs;
  }, [clubs, sortConfig]);

  // Filter clubs based on search term
  const filteredClubs = sortedClubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.currentBook.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD operations
  const handleAddClub = () => {
    const newId = Math.max(...clubs.map(club => club.id)) + 1;
    setClubs([...clubs, { ...newClub, id: newId, members: parseInt(newClub.members) || 0 }]);
    setShowAddForm(false);
    setNewClub({ name: '', members: '', currentBook: '', nextMeeting: '', status: 'Active' });
  };

  const handleEditClub = () => {
    setClubs(clubs.map(club => club.id === currentClub.id ? currentClub : club));
    setShowEditForm(false);
  };

  const handleDeleteClub = (id) => {
    if (window.confirm('Are you sure you want to delete this book club?')) {
      setClubs(clubs.filter(club => club.id !== id));
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditForm) {
      setCurrentClub({ ...currentClub, [name]: value });
    } else {
      setNewClub({ ...newClub, [name]: value });
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Book Clubs Management</h2>
        <button 
          className="add-btn"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus /> Add Club
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Clubs</h3>
          <p>{totalClubs}</p>
        </div>
        <div className="stat-card">
          <h3>Active Clubs</h3>
          <p>{activeClubs}</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Clubs</h3>
          <p>{upcomingClubs}</p>
        </div>
        <div className="stat-card">
          <h3>Avg. Members</h3>
          <p>{isNaN(averageMembers) ? 0 : averageMembers}</p>
        </div>
      </div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search book clubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('name')}>
                Club Name {sortConfig.key === 'name' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('members')}>
                Members {sortConfig.key === 'members' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('currentBook')}>
                Current Book {sortConfig.key === 'currentBook' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('nextMeeting')}>
                Next Meeting {sortConfig.key === 'nextMeeting' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('status')}>
                Status {sortConfig.key === 'status' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClubs.map(club => (
              <tr key={club.id}>
                <td>{club.name}</td>
                <td>{club.members}</td>
                <td>{club.currentBook}</td>
                <td>{club.nextMeeting || 'Not scheduled'}</td>
                <td>
                  <span className={`status-badge ${club.status.toLowerCase()}`}>
                    {club.status}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => {
                      setCurrentClub({...club});
                      setShowEditForm(true);
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Club Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Book Club</h3>
            <div className="form-group">
              <label>Club Name</label>
              <input
                type="text"
                name="name"
                value={newClub.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Current Book</label>
              <input
                type="text"
                name="currentBook"
                value={newClub.currentBook}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Members Count</label>
              <input
                type="number"
                name="members"
                value={newClub.members}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Next Meeting</label>
              <input
                type="date"
                name="nextMeeting"
                value={newClub.nextMeeting}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={newClub.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
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
                onClick={handleAddClub}
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
            <h3>Edit Book Club</h3>
            <div className="form-group">
              <label>Club Name</label>
              <input
                type="text"
                name="name"
                value={currentClub.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Current Book</label>
              <input
                type="text"
                name="currentBook"
                value={currentClub.currentBook}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Members Count</label>
              <input
                type="number"
                name="members"
                value={currentClub.members}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Next Meeting</label>
              <input
                type="date"
                name="nextMeeting"
                value={currentClub.nextMeeting}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={currentClub.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
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
                onClick={handleEditClub}
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

export default AdminBookClubs;