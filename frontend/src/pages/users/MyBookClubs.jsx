import { useState } from 'react';
import '../../styles/MyBookClubs.css';
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

const MyBookClub = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState('myClubs');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest');
  const [formData, setFormData] = useState({
    clubName: '',
    description: '',
    categories: [],
    meetingFrequency: '',
    meetingFormat: '',
  });
  const [editFormData, setEditFormData] = useState({
    clubName: '',
    description: '',
    categories: [],
    meetingFrequency: '',
    meetingFormat: '',
  });
  const [editingClubId, setEditingClubId] = useState(null);
  const [errors, setErrors] = useState({});

  // Sample data for the book clubs
  const [myBookClubs, setMyBookClubs] = useState([
    {
      id: 1,
      initials: 'PT',
      name: 'The Page Turners',
      categories: ['Fiction', 'Classics'],
      members: 42,
      currentBook: 'To Kill a Mockingbird',
      nextMeeting: 'May 15, 2023',
      status: 'Active',
      color: 'banner-purple',
      description: 'A club for fiction lovers.',
      meetingFrequency: 'Monthly',
      meetingFormat: 'In-person',
    },
    {
      id: 2,
      initials: 'MM',
      name: 'Mystery Mavens',
      categories: ['Mystery', 'Thriller'],
      members: 38,
      currentBook: 'The Silent Patient',
      nextMeeting: 'May 18, 2023',
      status: 'Active',
      color: 'banner-blue',
      description: 'A club for mystery and thriller enthusiasts.',
      meetingFrequency: 'Bi-weekly',
      meetingFormat: 'Virtual',
    },
    {
      id: 3,
      initials: 'FF',
      name: 'Fiction Fanatics',
      categories: ['Contemporary', 'Literary'],
      members: 35,
      currentBook: 'The Midnight Library',
      nextMeeting: 'May 22, 2023',
      status: 'Pending',
      color: 'banner-orange',
      description: 'A club for contemporary and literary fiction lovers.',
      meetingFrequency: 'Weekly',
      meetingFormat: 'Hybrid',
    },
  ]);

  const joinedClubs = [
    {
      id: 4,
      initials: 'SF',
      name: 'Sci-Fi Explorers',
      categories: ['Science Fiction'],
      members: 27,
      currentBook: 'Dune',
      nextMeeting: 'May 20, 2023',
      status: 'Active',
      color: 'banner-green',
      description: 'A club for science fiction enthusiasts.',
      meetingFrequency: 'Monthly',
      meetingFormat: 'In-person',
    },
    {
      id: 5,
      initials: 'HC',
      name: 'Historical Chronicles',
      categories: ['Non-Fiction', 'History'],
      members: 31,
      currentBook: 'Sapiens',
      nextMeeting: 'May 25, 2023',
      status: 'Active',
      color: 'banner-pink',
      description: 'A club for history and non-fiction lovers.',
      meetingFrequency: 'Bi-weekly',
      meetingFormat: 'Virtual',
    },
  ];

  const categories = ['Fiction', 'Non-Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Classics'];
  const meetingFormats = ['In-person', 'Virtual', 'Hybrid'];

  const getRandomColor = () =>
    ['banner-purple', 'banner-blue', 'banner-orange', 'banner-green', 'banner-pink'][
      Math.floor(Math.random() * 5)
    ];

  const toggleCreateForm = () => setShowCreateForm(!showCreateForm);

  const handleInputChange = (e, isEditForm = false) => {
    const { name, value } = e.target;
    if (isEditForm) {
      setEditFormData({ ...editFormData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleCategorySelect = (category, isEditForm = false) => {
    if (isEditForm) {
      const updatedCategories = editFormData.categories.includes(category)
        ? editFormData.categories.filter((c) => c !== category)
        : [...editFormData.categories, category];
      setEditFormData({ ...editFormData, categories: updatedCategories });
    } else {
      const updatedCategories = formData.categories.includes(category)
        ? formData.categories.filter((c) => c !== category)
        : [...formData.categories, category];
      setFormData({ ...formData, categories: updatedCategories });
    }
    if (errors.categories) setErrors({ ...errors, categories: '' });
  };

  const handleFormatSelect = (format, isEditForm = false) => {
    if (isEditForm) {
      setEditFormData({ ...editFormData, meetingFormat: format });
    } else {
      setFormData({ ...formData, meetingFormat: format });
    }
    if (errors.meetingFormat) setErrors({ ...errors, meetingFormat: '' });
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.clubName.trim()) newErrors.clubName = 'Club name is required';
    if (!data.description.trim()) newErrors.description = 'Description is required';
    if (data.categories.length === 0)
      newErrors.categories = 'Please select at least one category';
    if (!data.meetingFrequency) newErrors.meetingFrequency = 'Meeting frequency is required';
    if (!data.meetingFormat) newErrors.meetingFormat = 'Meeting format is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e, isEditForm = false) => {
    e.preventDefault();
    const data = isEditForm ? editFormData : formData;
    if (!validateForm(data)) return;

    if (isEditForm) {
      const updatedClubs = myBookClubs.map((club) =>
        club.id === editingClubId
          ? {
              ...club,
              name: data.clubName,
              description: data.description,
              categories: data.categories,
              meetingFrequency: data.meetingFrequency,
              meetingFormat: data.meetingFormat,
            }
          : club
      );
      setMyBookClubs(updatedClubs);
      setShowEditForm(false);
    } else {
      const newId = myBookClubs.length > 0 ? Math.max(...myBookClubs.map((club) => club.id)) + 1 : 1;

      const newClub = {
        id: newId,
        initials: data.clubName
          .split(' ')
          .map((word) => word[0])
          .slice(0, 2)
          .join('')
          .padEnd(2, 'X'),
        name: data.clubName,
        description: data.description,
        categories: data.categories,
        members: 1,
        currentBook: 'Not set',
        nextMeeting: 'Not scheduled',
        status: 'Active',
        color: getRandomColor(),
        meetingFrequency: data.meetingFrequency,
        meetingFormat: data.meetingFormat,
      };

      setMyBookClubs((prev) => [...prev, newClub]);
      setShowCreateForm(false);
    }

    setFormData({
      clubName: '',
      description: '',
      categories: [],
      meetingFrequency: '',
      meetingFormat: '',
    });
    setEditFormData({
      clubName: '',
      description: '',
      categories: [],
      meetingFrequency: '',
      meetingFormat: '',
    });
    setEditingClubId(null);
  };

  const handleEdit = (club) => {
    setEditingClubId(club.id);
    setEditFormData({
      clubName: club.name,
      description: club.description,
      categories: club.categories,
      meetingFrequency: club.meetingFrequency,
      meetingFormat: club.meetingFormat,
    });
    setShowEditForm(true);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this book club?');
    if (confirmed) {
      setMyBookClubs(myBookClubs.filter((club) => club.id !== id));
    }
  };

  const displayedClubs = activeTab === 'myClubs' ? myBookClubs : joinedClubs;

  const filteredClubs = displayedClubs.filter((club) => {
    const nameMatch = club.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch =
      categoryFilter === 'All Categories' || club.categories.some((cat) => cat === categoryFilter);
    return nameMatch && categoryMatch;
  });

  const sortedClubs = [...filteredClubs].sort((a, b) => {
    if (sortBy === 'Newest') return b.id - a.id;
    if (sortBy === 'Alphabetical') return a.name.localeCompare(b.name);
    if (sortBy === 'Members') return b.members - a.members;
    return 0;
  });

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
            onClick={toggleCreateForm}
          >
            <FiPlus className="mr-2" />
            Create New Club
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex space-x-8">
            <button
              className={`pb-3 px-1 nav-link ${
                activeTab === 'myClubs' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('myClubs')}
            >
              My Clubs{' '}
              <span className="ml-1 bg-gray-200 text-gray-700 px-2 py-0.5 text-xs rounded-full">
                {myBookClubs.length}
              </span>
            </button>
            <button
              className={`pb-3 px-1 nav-link ${
                activeTab === 'joinedClubs' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('joinedClubs')}
            >
              Joined Clubs{' '}
              <span className="ml-1 bg-gray-200 text-gray-700 px-2 py-0.5 text-xs rounded-full">
                {joinedClubs.length}
              </span>
            </button>
          </div>
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
                <div className={`club-banner ${club.color}`}>
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
                    <span className="text-white">{club.initials}</span>
                  </div>
                </div>
                <div className="body relative p-4">
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-text-dark">{club.name}</h3>
                    <div className="text-text-light text-sm mt-1">
                      {club.categories.join(', ')}
                    </div>
                    <div className="flex items-center mt-3 text-text-light">
                      <FiUsers className="mr-2" />
                      <span>{club.members} members</span>
                    </div>
                    <div className="flex items-center mt-2 text-text-light">
                      <FiBook className="mr-2" />
                      <span>Currently reading: {club.currentBook}</span>
                    </div>
                    <div className="flex items-center mt-2 text-text-light">
                      <FiCalendar className="mr-2" />
                      <span>Next meeting: {club.nextMeeting}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span
                        className={`status-badge status-${club.status.toLowerCase()}`}
                      >
                        {club.status}
                      </span>
                      <a
                        href="#"
                        className="text-primary-color hover:text-primary-hover text-sm font-medium"
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-text-light text-center py-10">No clubs found.</p>
          )}
        </div>

        {/* Create New Club Form Modal */}
        {showCreateForm && (
          <div className="modal-overlay">
            <div className="modal-content animate-fadeIn">
              <div className="modal-header">
                <h2>Create New Book Club</h2>
                <button onClick={toggleCreateForm}>
                  <FiX size={24} />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  {/* Club Name Input */}
                  <div className="mb-4">
                    <label htmlFor="clubName" className="form-label">Club Name*</label>
                    <input
                      type="text"
                      id="clubName"
                      name="clubName"
                      value={formData.clubName}
                      onChange={(e) => handleInputChange(e)}
                      className="form-input"
                    />
                    {errors.clubName && (
                      <p className="form-error">{errors.clubName}</p>
                    )}
                  </div>

                  {/* Description Input */}
                  <div className="mb-4">
                    <label htmlFor="description" className="form-label">Description*</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange(e)}
                      placeholder="Tell us about your book club..."
                      rows="4"
                      className="form-textarea"
                    />
                    {errors.description && (
                      <p className="form-error">{errors.description}</p>
                    )}
                  </div>

                  {/* Categories Selection */}
                  <div className="mb-4">
                    <label className="form-label">Categories*</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategorySelect(category)}
                          className={`category-btn ${formData.categories.includes(category) ? 'selected' : ''}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    {errors.categories && (
                      <p className="form-error">{errors.categories}</p>
                    )}
                  </div>

                  {/* Meeting Frequency */}
                  <div className="mb-4">
                    <label htmlFor="meetingFrequency" className="form-label">Meeting Frequency*</label>
                    <select
                      id="meetingFrequency"
                      name="meetingFrequency"
                      value={formData.meetingFrequency}
                      onChange={(e) => handleInputChange(e)}
                      className="form-select"
                    >
                      <option value="">Select frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                    {errors.meetingFrequency && (
                      <p className="form-error">{errors.meetingFrequency}</p>
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
                          className={`format-btn ${formData.meetingFormat === format ? 'selected' : ''}`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                    {errors.meetingFormat && (
                      <p className="form-error">{errors.meetingFormat}</p>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={toggleCreateForm}
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
                <form onSubmit={(e) => handleSubmit(e, true)}>
                  {/* Club Name Input */}
                  <div className="mb-4">
                    <label htmlFor="editClubName" className="form-label">Club Name*</label>
                    <input
                      type="text"
                      id="editClubName"
                      name="clubName"
                      value={editFormData.clubName}
                      onChange={(e) => handleInputChange(e, true)}
                      className="form-input"
                    />
                    {errors.clubName && (
                      <p className="form-error">{errors.clubName}</p>
                    )}
                  </div>

                  {/* Description Input */}
                  <div className="mb-4">
                    <label htmlFor="editDescription" className="form-label">Description*</label>
                    <textarea
                      id="editDescription"
                      name="description"
                      value={editFormData.description}
                      onChange={(e) => handleInputChange(e, true)}
                      placeholder="Tell us about your book club..."
                      rows="4"
                      className="form-textarea"
                    />
                    {errors.description && (
                      <p className="form-error">{errors.description}</p>
                    )}
                  </div>

                  {/* Categories Selection */}
                  <div className="mb-4">
                    <label className="form-label">Categories*</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategorySelect(category, true)}
                          className={`category-btn ${editFormData.categories.includes(category) ? 'selected' : ''}`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    {errors.categories && (
                      <p className="form-error">{errors.categories}</p>
                    )}
                  </div>

                  {/* Meeting Frequency */}
                  <div className="mb-4">
                    <label htmlFor="editMeetingFrequency" className="form-label">Meeting Frequency*</label>
                    <select
                      id="editMeetingFrequency"
                      name="meetingFrequency"
                      value={editFormData.meetingFrequency}
                      onChange={(e) => handleInputChange(e, true)}
                      className="form-select"
                    >
                      <option value="">Select frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                    {errors.meetingFrequency && (
                      <p className="form-error">{errors.meetingFrequency}</p>
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
                          onClick={() => handleFormatSelect(format, true)}
                          className={`format-btn ${editFormData.meetingFormat === format ? 'selected' : ''}`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                    {errors.meetingFormat && (
                      <p className="form-error">{errors.meetingFormat}</p>
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
