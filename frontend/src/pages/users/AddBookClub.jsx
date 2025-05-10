import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminPages.css';

const AddBookClub = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bookClubName: '',
    description: '',
    genres: '',
    currentBookTitle: '',
    currentBookAuthor: '',
    currentBookCover: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.bookClubName.trim()) newErrors.bookClubName = 'Book Club Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.currentBookTitle.trim()) newErrors.currentBookTitle = 'Current Book Title is required';
    if (!formData.currentBookAuthor.trim()) newErrors.currentBookAuthor = 'Current Book Author is required';
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  const payload = {
    ...formData,
    genres: formData.genres
      .split(',')
      .map(genre => genre.trim())
      .filter(genre => genre), // removes empty strings
  };

  try {
    const response = await fetch('http://127.0.0.1:5000/bookclubs/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create book club');
    }

    const data = await response.json();
    console.log('Book club created:', data);

    // Redirect after success
    navigate('/bookclubs');
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create book club. Please try again.');
  }
};


  const handleCancel = () => {
    navigate('/bookclubs');
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="header-section">
          <h1>Add a New Book Club</h1>
          <p>More Than a Club—It’s a Reading Family, lets keep Turning Pages, Sharing Stories.</p>
        </div>
        <h3>Create a New Book Club</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="bookClubName">Book Club Name *</label>
            <input
              type="text"
              id="bookClubName"
              name="bookClubName"
              value={formData.bookClubName}
              onChange={handleChange}
            />
            {errors.bookClubName && <span className="error">{errors.bookClubName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <span className="error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="genres">Genres (comma separated)</label>
            <input
              type="text"
              id="genres"
              name="genres"
              value={formData.genres}
              onChange={handleChange}
              placeholder="e.g. Fiction, Mystery, Fantasy"
            />
          </div>

          <h4>Current Book Details</h4>

          <div className="form-group">
            <label htmlFor="currentBookTitle">Title *</label>
            <input
              type="text"
              id="currentBookTitle"
              name="currentBookTitle"
              value={formData.currentBookTitle}
              onChange={handleChange}
            />
            {errors.currentBookTitle && <span className="error">{errors.currentBookTitle}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="currentBookAuthor">Author *</label>
            <input
              type="text"
              id="currentBookAuthor"
              name="currentBookAuthor"
              value={formData.currentBookAuthor}
              onChange={handleChange}
            />
            {errors.currentBookAuthor && <span className="error">{errors.currentBookAuthor}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="currentBookCover">Cover Image URL</label>
            <input
              type="text"
              id="currentBookCover"
              name="currentBookCover"
              value={formData.currentBookCover}
              onChange={handleChange}
              placeholder="http://example.com/cover.jpg"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>Cancel</button>
            <button type="submit" className="submit-btn">Create Book Club</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBookClub;
