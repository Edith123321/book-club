import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import '../../styles/AdminPages.css';

const AdminSchedules = () => {
  const initialSchedules = [
    { id: 1, eventName: "Monthly Book Discussion", club: "Fantasy Readers", date: "2023-07-15", time: "18:00", location: "Virtual", status: "Confirmed" },
    { id: 2, eventName: "Author Q&A Session", club: "All Members", date: "2023-07-22", time: "19:30", location: "Main Library", status: "Confirmed" },
    { id: 3, eventName: "New Releases Preview", club: "Sci-Fi Enthusiasts", date: "2023-08-05", time: "17:00", location: "Online", status: "Pending" },
    { id: 4, eventName: "Book Signing Event", club: "Classic Literature", date: "2023-08-12", time: "14:00", location: "Downtown Bookstore", status: "Cancelled" },
  ];

  const [schedules, setSchedules] = useState(initialSchedules);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    eventName: '',
    club: '',
    date: '',
    time: '',
    location: '',
    status: 'Confirmed'
  });

  const totalEvents = schedules.length;
  const confirmedEvents = schedules.filter(schedule => schedule.status === "Confirmed").length;
  const pendingEvents = schedules.filter(schedule => schedule.status === "Pending").length;
  const upcomingEvents = schedules.filter(schedule => {
    const eventDate = new Date(schedule.date);
    const today = new Date();
    return eventDate >= today;
  }).length;

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSchedules = React.useMemo(() => {
    let sortableSchedules = [...schedules];
    if (sortConfig.key) {
      sortableSchedules.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableSchedules;
  }, [schedules, sortConfig]);

  const filteredSchedules = sortedSchedules.filter(schedule =>
    schedule.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.club.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSchedule = () => {
    const newId = Math.max(...schedules.map(schedule => schedule.id)) + 1;
    setSchedules([...schedules, { ...newSchedule, id: newId }]);
    setShowAddForm(false);
    setNewSchedule({ eventName: '', club: '', date: '', time: '', location: '', status: 'Confirmed' });
  };

  const handleEditSchedule = () => {
    setSchedules(schedules.map(schedule => schedule.id === currentSchedule.id ? currentSchedule : schedule));
    setShowEditForm(false);
  };

  const handleDeleteSchedule = (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditForm) {
      setCurrentSchedule({ ...currentSchedule, [name]: value });
    } else {
      setNewSchedule({ ...newSchedule, [name]: value });
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Schedules Management</h2>
        <button className="add-btn" onClick={() => setShowAddForm(true)}>
          <FiPlus /> Add Schedule
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><h3>Total Events</h3><p>{totalEvents}</p></div>
        <div className="stat-card"><h3>Confirmed</h3><p>{confirmedEvents}</p></div>
        <div className="stat-card"><h3>Pending</h3><p>{pendingEvents}</p></div>
        <div className="stat-card"><h3>Upcoming</h3><p>{upcomingEvents}</p></div>
      </div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search schedules..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              {['eventName', 'club', 'date', 'time', 'location', 'status'].map(key => (
                <th key={key} onClick={() => requestSort(key)}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}{" "}
                  {sortConfig.key === key && (
                    sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                  )}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.map(schedule => (
              <tr key={schedule.id}>
                <td>{schedule.eventName}</td>
                <td>{schedule.club}</td>
                <td>{schedule.date}</td>
                <td>{schedule.time}</td>
                <td>{schedule.location}</td>
                <td>
                  <span className={`status-badge ${schedule.status.toLowerCase()}`}>
                    {schedule.status}
                  </span>
                </td>
                <td className="actions">
                  <button className="action-btn edit" onClick={() => {
                    setCurrentSchedule({ ...schedule });
                    setShowEditForm(true);
                  }}>
                    <FiEdit />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteSchedule(schedule.id)}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Schedule</h3>
            {['eventName', 'date', 'time', 'location'].map(field => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === 'date' ? 'date' : field === 'time' ? 'time' : 'text'}
                  name={field}
                  value={newSchedule[field]}
                  onChange={handleInputChange}
                />
              </div>
            ))}
            <div className="form-group">
              <label>Club</label>
              <select name="club" value={newSchedule.club} onChange={handleInputChange}>
                <option value="">Select Club</option>
                <option value="Fantasy Readers">Fantasy Readers</option>
                <option value="Sci-Fi Enthusiasts">Sci-Fi Enthusiasts</option>
                <option value="Mystery Lovers">Mystery Lovers</option>
                <option value="Classic Literature">Classic Literature</option>
                <option value="All Members">All Members</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={newSchedule.status} onChange={handleInputChange}>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleAddSchedule}>Add Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditForm && currentSchedule && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Schedule</h3>
            {['eventName', 'date', 'time', 'location'].map(field => (
              <div className="form-group" key={field}>
                <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === 'date' ? 'date' : field === 'time' ? 'time' : 'text'}
                  name={field}
                  value={currentSchedule[field]}
                  onChange={handleInputChange}
                />
              </div>
            ))}
            <div className="form-group">
              <label>Club</label>
              <select name="club" value={currentSchedule.club} onChange={handleInputChange}>
                <option value="">Select Club</option>
                <option value="Fantasy Readers">Fantasy Readers</option>
                <option value="Sci-Fi Enthusiasts">Sci-Fi Enthusiasts</option>
                <option value="Mystery Lovers">Mystery Lovers</option>
                <option value="Classic Literature">Classic Literature</option>
                <option value="All Members">All Members</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={currentSchedule.status} onChange={handleInputChange}>
                <option value="Confirmed">Confirmed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowEditForm(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleEditSchedule}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedules;
