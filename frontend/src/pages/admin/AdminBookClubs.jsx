import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import '../../styles/AdminPages.css';
import bookClubsData from '../../components/bookClubsData';

const AdminBookClubs = () => {
  const initialClubs = bookClubsData;

  const [clubs, setClubs] = useState(initialClubs);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentClub, setCurrentClub] = useState(null);
  const [newClub, setNewClub] = useState({
    bookClubName: '',
    members: [{ name: '', avatar: '' }],
    currentBook: {
      title: '',
      author: '',
      description: '',
      cover: '',
      progress: '',
      pagesRead: ''
    },
    nextMeeting: {
      date: '',
      time: '',
      location: '',
      agenda: ''
    },
    status: 'Active'
  });

  // Stats calculation
  const totalClubs = clubs.length;
  const activeClubs = clubs.filter(club => club.status === "Active").length;
  const upcomingClubs = clubs.filter(club => club.status === "Upcoming").length;
  const averageMembers = Math.round(clubs.reduce((sum, club) => sum + club.members.length, 0) / clubs.length);

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
        // Handle nested objects
        let aValue, bValue;
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          aValue = a[keys[0]][keys[1]];
          bValue = b[keys[0]][keys[1]];
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
    return sortableClubs;
  }, [clubs, sortConfig]);

  // Filter clubs based on search term
  const filteredClubs = sortedClubs.filter(club =>
    club.bookClubName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.currentBook.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD operations
  const handleAddClub = () => {
    const newId = Math.max(...clubs.map(club => club.id)) + 1;
    setClubs([...clubs, { 
      ...newClub, 
      id: newId,
      members: newClub.members.filter(m => m.name), // Remove empty members
      genres: [],
      discussions: [],
      meetingFrequency: '',
      description: ''
    }]);
    setShowAddForm(false);
    setNewClub({
      bookClubName: '',
      members: [{ name: '', avatar: '' }],
      currentBook: {
        title: '',
        author: '',
        description: '',
        cover: '',
        progress: '',
        pagesRead: ''
      },
      nextMeeting: {
        date: '',
        time: '',
        location: '',
        agenda: ''
      },
      status: 'Active'
    });
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

  const handleNestedInputChange = (e, parentKey, childKey) => {
    const { value } = e.target;
    if (showEditForm) {
      setCurrentClub({
        ...currentClub,
        [parentKey]: {
          ...currentClub[parentKey],
          [childKey]: value
        }
      });
    } else {
      setNewClub({
        ...newClub,
        [parentKey]: {
          ...newClub[parentKey],
          [childKey]: value
        }
      });
    }
  };

  const handleMemberChange = (index, field, value) => {
    if (showEditForm) {
      const updatedMembers = [...currentClub.members];
      updatedMembers[index][field] = value;
      setCurrentClub({
        ...currentClub,
        members: updatedMembers
      });
    } else {
      const updatedMembers = [...newClub.members];
      updatedMembers[index][field] = value;
      setNewClub({
        ...newClub,
        members: updatedMembers
      });
    }
  };

  const addMemberField = () => {
    if (showEditForm) {
      setCurrentClub({
        ...currentClub,
        members: [...currentClub.members, { name: '', avatar: '' }]
      });
    } else {
      setNewClub({
        ...newClub,
        members: [...newClub.members, { name: '', avatar: '' }]
      });
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
              <th onClick={() => requestSort('bookClubName')}>
                Club Name {sortConfig.key === 'bookClubName' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('members.length')}>
                Members {sortConfig.key === 'members.length' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('currentBook.title')}>
                Current Book {sortConfig.key === 'currentBook.title' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('nextMeeting.date')}>
                Next Meeting {sortConfig.key === 'nextMeeting.date' && (
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
                <td>{club.bookClubName}</td>
                <td>{club.members.length}</td>
                <td>{club.currentBook.title}</td>
                <td>{club.nextMeeting.date || 'Not scheduled'}</td>
                <td>
                  <span className={`status-badge ${club.status ? club.status.toLowerCase() : 'active'}`}>
                    {club.status || 'Active'}
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
                name="bookClubName"
                value={newClub.bookClubName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Current Book Title</label>
              <input
                type="text"
                name="title"
                value={newClub.currentBook.title}
                onChange={(e) => handleNestedInputChange(e, 'currentBook', 'title')}
              />
            </div>
            <div className="form-group">
              <label>Book Author</label>
              <input
                type="text"
                name="author"
                value={newClub.currentBook.author}
                onChange={(e) => handleNestedInputChange(e, 'currentBook', 'author')}
              />
            </div>
            <div className="form-group">
              <label>Members</label>
              {newClub.members.map((member, index) => (
                <div key={index} className="member-input-group">
                  <input
                    type="text"
                    placeholder="Member name"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Avatar URL"
                    value={member.avatar}
                    onChange={(e) => handleMemberChange(index, 'avatar', e.target.value)}
                  />
                </div>
              ))}
              <button 
                type="button" 
                className="add-member-btn"
                onClick={addMemberField}
              >
                Add Member
              </button>
            </div>
            <div className="form-group">
              <label>Next Meeting Date</label>
              <input
                type="text"
                name="date"
                value={newClub.nextMeeting.date}
                onChange={(e) => handleNestedInputChange(e, 'nextMeeting', 'date')}
              />
            </div>
            <div className="form-group">
              <label>Meeting Time</label>
              <input
                type="text"
                name="time"
                value={newClub.nextMeeting.time}
                onChange={(e) => handleNestedInputChange(e, 'nextMeeting', 'time')}
              />
            </div>
            <div className="form-group">
              <label>Meeting Location</label>
              <input
                type="text"
                name="location"
                value={newClub.nextMeeting.location}
                onChange={(e) => handleNestedInputChange(e, 'nextMeeting', 'location')}
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
                name="bookClubName"
                value={currentClub.bookClubName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Current Book Title</label>
              <input
                type="text"
                name="title"
                value={currentClub.currentBook.title}
                onChange={(e) => handleNestedInputChange(e, 'currentBook', 'title')}
              />
            </div>
            <div className="form-group">
              <label>Book Author</label>
              <input
                type="text"
                name="author"
                value={currentClub.currentBook.author}
                onChange={(e) => handleNestedInputChange(e, 'currentBook', 'author')}
              />
            </div>
            <div className="form-group">
              <label>Members</label>
              {currentClub.members.map((member, index) => (
                <div key={index} className="member-input-group">
                  <input
                    type="text"
                    placeholder="Member name"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Avatar URL"
                    value={member.avatar}
                    onChange={(e) => handleMemberChange(index, 'avatar', e.target.value)}
                  />
                </div>
              ))}
              <button 
                type="button" 
                className="add-member-btn"
                onClick={addMemberField}
              >
                Add Member
              </button>
            </div>
            <div className="form-group">
              <label>Next Meeting Date</label>
              <input
                type="text"
                name="date"
                value={currentClub.nextMeeting.date}
                onChange={(e) => handleNestedInputChange(e, 'nextMeeting', 'date')}
              />
            </div>
            <div className="form-group">
              <label>Meeting Time</label>
              <input
                type="text"
                name="time"
                value={currentClub.nextMeeting.time}
                onChange={(e) => handleNestedInputChange(e, 'nextMeeting', 'time')}
              />
            </div>
            <div className="form-group">
              <label>Meeting Location</label>
              <input
                type="text"
                name="location"
                value={currentClub.nextMeeting.location}
                onChange={(e) => handleNestedInputChange(e, 'nextMeeting', 'location')}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={currentClub.status || 'Active'}
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