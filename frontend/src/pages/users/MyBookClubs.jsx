import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiUsers,
  FiBook,
  FiCalendar,
  FiChevronDown,
  FiX,
} from 'react-icons/fi';
import '../../styles/MyBookClubs.css';

const MyBookClub = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookClubs, setBookClubs] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    genres: [],
    meeting_frequency: '',
    meeting_format: '',
  });
  const [editingClub, setEditingClub] = useState(null);
  const [errors, setErrors] = useState({});

  const categories = ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Classics'];
  const meetingFormats = ['In-person', 'Virtual', 'Hybrid'];

  // Fetch user's book clubs from backend
  useEffect(() => {
    const fetchBookClubs = async () => {
      try {
        const response = await fetch(`http://localhost:5000/bookclubs/user/${currentUser.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch book clubs');
        }
        
        const data = await response.json();
        setBookClubs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchBookClubs();
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleGenreSelect = (genre) => {
    const updatedGenres = formData.genres.includes(genre)
      ? formData.genres.filter((g) => g !== genre)
      : [...formData.genres, genre];
    setFormData({ ...formData, genres: updatedGenres });
    if (errors.genres) setErrors({ ...errors, genres: '' });
  };

  const handleFormatSelect = (format) => {
    setFormData({ ...formData, meeting_format: format });
    if (errors.meeting_format) setErrors({ ...errors, meeting_format: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Club name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.genres.length === 0) newErrors.genres = 'Please select at least one genre';
    if (!formData.meeting_frequency) newErrors.meeting_frequency = 'Meeting frequency is required';
    if (!formData.meeting_format) newErrors.meeting_format = 'Meeting format is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5000/bookclubs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          creator_id: currentUser.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create book club');
      }

      const newClub = await response.json();
      setBookClubs([...bookClubs, newClub]);
      setShowCreateForm(false);
      setFormData({
        name: '',
        description: '',
        genres: [],
        meeting_frequency: '',
        meeting_format: '',
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(`http://localhost:5000/bookclubs/${editingClub.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update book club');
      }

      const updatedClub = await response.json();
      setBookClubs(bookClubs.map(club => 
        club.id === updatedClub.id ? updatedClub : club
      ));
      setShowEditForm(false);
      setEditingClub(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this book club?');
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/bookclubs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete book club');
      }

      setBookClubs(bookClubs.filter(club => club.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (club) => {
    setEditingClub(club);
    setFormData({
      name: club.name,
      description: club.description,
      genres: club.genres,
      meeting_frequency: club.meeting_frequency,
      meeting_format: club.meeting_format,
    });
    setShowEditForm(true);
  };

  // Filter and sort clubs
  const filteredClubs = bookClubs.filter(club => {
    const nameMatch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = categoryFilter === 'All Categories' || 
                         club.genres.some(genre => genre === categoryFilter);
    return nameMatch && categoryMatch;
  });

  const sortedClubs = [...filteredClubs].sort((a, b) => {
    if (sortBy === 'Newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'Alphabetical') return a.name.localeCompare(b.name);
    if (sortBy === 'Members') return b.member_count - a.member_count;
    return 0;
  });

  const getRandomColor = () => {
    const colors = ['banner-purple', 'banner-blue', 'banner-orange', 'banner-green', 'banner-pink'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  if (isLoading) return <div className="loading">Loading your book clubs...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="bg-light-bg min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="header-logo">
            <span className="text-primary-color">Book</span>
            <span className="text-secondary-color">Nook</span>
          </h1>
          <div className="flex items-center">
            <div className="relative mr-3">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-color"
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              {/* Avatar placeholder */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-dark">My Book Clubs</h2>
            <p className="text-text-light">Manage your book clubs and memberships</p>
          </div>
          <button
            className="btn btn-primary flex items-center"
            onClick={() => setShowCreateForm(true)}
          >
            <FiPlus className="mr-2" />
            Create New Club
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between mb-6 filters-container">
          <div className="relative w-full md:w-1/3 mb-4 md:mb-0 search-input">
            <input
              type="text"
              placeholder="Search clubs..."
              className="w-full border border-border-color rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-color form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="flex space-x-3 filter-selects">
            <select
              className="border border-border-color rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-color form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              className="border border-border-color rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-primary-color form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="Newest">Sort By: Newest</option>
              <option value="Alphabetical">Sort By: Alphabetical</option>
              <option value="Members">Sort By: Most Members</option>
            </select>
          </div>
        </div>

        {/* Club Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 club-grid">
          {sortedClubs.length > 0 ? (
            sortedClubs.map((club) => (
              <div key={club.id} className="club-card animate-slideDown">
                <div className={`club-banner ${getRandomColor()}`}>
                  <div className="banner-actions">
                    <button
                      className="banner-action"
                      onClick={() => handleEdit(club)}
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      className="banner-action"
                      onClick={() => handleDelete(club.id)}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                  <div className="club-initials">
                    <span className="text-white">
                      {club.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                </div>
                <div className="body relative p-4">
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-text-dark">{club.name}</h3>
                    <div className="text-text-light text-sm mt-1">
                      {club.genres.join(', ')}
                    </div>
                    <div className="flex items-center mt-3 text-text-light">
                      <FiUsers className="mr-2" />
                      <span>{club.member_count} members</span>
                    </div>
                    <div className="flex items-center mt-2 text-text-light">
                      <FiBook className="mr-2" />
                      <span>Currently reading: {club.current_book || 'Not set'}</span>
                    </div>
                    <div className="flex items-center mt-2 text-text-light">
                      <FiCalendar className="mr-2" />
                      <span>Next meeting: {club.next_meeting || 'Not scheduled'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="status-badge status-active">
                        Active
                      </span>
                      <button
                        onClick={() => navigate(`/bookclubs/${club.id}`)}
                        className="text-primary-color hover:text-primary-hover text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-text-light mb-4">You haven't joined any book clubs yet.</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Club
              </button>
            </div>
          )}
        </div>

        {/* Create New Club Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content animate-fadeIn">
              <div className="modal-header">
                <h2>Create New Book Club</h2>
                <button onClick={() => setShowCreateForm(false)}>
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateSubmit}>
                  {/* Club Name Input */}
                  <div className="mb-4">
                    <label htmlFor="name" className="form-label">Club Name*</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    {errors.name && (
                      <p className="form-error">{errors.name}</p>
                    )}
                  </div>

                  {/* Description Input */}
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label">Description*</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Tell us about your book club..."
                      rows="4"
                      className="form-textarea"
                    />
                    {errors.description && (
                      <p className="form-error">{errors.description}</p>
                    )}
                  </div>

                  {/* Genres Selection */}
                  <div className="mb-4">
                    <label className="form-label">Genres*</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleGenreSelect(category)}
                          className={`category-btn ${formData.genres.includes(category) ? 'selected' : ''}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    {errors.genres && (
                      <p className="form-error">{errors.genres}</p>
                    )}
                  </div>

                  {/* Meeting Frequency */}
                  <div className="mb-4">
                    <label htmlFor="meeting_frequency" className="form-label">Meeting Frequency*</label>
                    <select
                      id="meeting_frequency"
                      name="meeting_frequency"
                      value={formData.meeting_frequency}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                    {errors.meeting_frequency && (
                      <p className="form-error">{errors.meeting_frequency}</p>
                    )}
                  </div>

                  {/* Meeting Format */}
                  <div className="mb-6">
                    <label className="form-label">Meeting Format*</label>
                    <div className="grid grid-cols-3 gap-3">
                      {meetingFormats.map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => handleFormatSelect(format)}
                          className={`format-btn ${formData.meeting_format === format ? 'selected' : ''}`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                    {errors.meeting_format && (
                      <p className="form-error">{errors.meeting_format}</p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Create Club
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Club Form Modal */}
        {showEditForm && (
          <div className="modal-overlay">
            <div className="modal-content animate-fadeIn">
              <div className="modal-header">
                <h2>Edit Book Club</h2>
                <button onClick={() => setShowEditForm(false)}>
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditSubmit}>
                  {/* Club Name Input */}
                  <div className="mb-4">
                    <label htmlFor="editName" className="form-label">Club Name*</label>
                    <input
                      type="text"
                      id="editName"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    {errors.name && (
                      <p className="form-error">{errors.name}</p>
                    )}
                  </div>

                  {/* Description Input */}
                  <div className="mb-4">
                    <label htmlFor="editDescription" className="form-label">Description*</label>
                    <textarea
                      id="editDescription"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Tell us about your book club..."
                      rows="4"
                      className="form-textarea"
                    />
                    {errors.description && (
                      <p className="form-error">{errors.description}</p>
                    )}
                  </div>

                  {/* Genres Selection */}
                  <div className="mb-4">
                    <label className="form-label">Genres*</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleGenreSelect(category)}
                          className={`category-btn ${formData.genres.includes(category) ? 'selected' : ''}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    {errors.genres && (
                      <p className="form-error">{errors.genres}</p>
                    )}
                  </div>

                  {/* Meeting Frequency */}
                  <div className="mb-4">
                    <label htmlFor="editMeetingFrequency" className="form-label">Meeting Frequency*</label>
                    <select
                      id="editMeetingFrequency"
                      name="meeting_frequency"
                      value={formData.meeting_frequency}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                    {errors.meeting_frequency && (
                      <p className="form-error">{errors.meeting_frequency}</p>
                    )}
                  </div>

                  {/* Meeting Format */}
                  <div className="mb-6">
                    <label className="form-label">Meeting Format*</label>
                    <div className="grid grid-cols-3 gap-3">
                      {meetingFormats.map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => handleFormatSelect(format)}
                          className={`format-btn ${formData.meeting_format === format ? 'selected' : ''}`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                    {errors.meeting_format && (
                      <p className="form-error">{errors.meeting_format}</p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowEditForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyBookClub;