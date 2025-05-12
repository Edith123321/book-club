import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AddBook.css';

const AddBookClub = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    synopsis: '',
    owner_id: 1, // You should get this from your auth system or state
    current_book: {
      title: '',
      author: '',
      cover: ''
    }
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Book Club Name is required';
    if (!formData.synopsis.trim()) newErrors.synopsis = 'Description is required';
    if (!formData.current_book.title.trim()) newErrors.currentBookTitle = 'Current Book Title is required';
    if (!formData.current_book.author.trim()) newErrors.currentBookAuthor = 'Current Book Author is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested current_book fields
    if (name.startsWith('current_book.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        current_book: {
          ...prev.current_book,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/bookclubs/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          synopsis: formData.synopsis,
          owner_id: formData.owner_id, // This should come from your auth system
          current_book: formData.current_book.title ? formData.current_book : null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create book club');
      }

      const data = await response.json();
      console.log('Book club created:', data);

      // Redirect after success
      navigate('/bookclubs');
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Failed to create book club. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/bookclubs');
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="form-header-container">
          
          <h1>Add a New Book Club</h1>
          <p>More Than a Club—It's a Reading Family, lets keep Turning Pages, Sharing Stories.</p>
        </div>
        <h3>Create a New Book Club</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Book Club Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="synopsis">Description *</label>
            <textarea
              id="synopsis"
              name="synopsis"
              value={formData.synopsis}
              onChange={handleChange}
            />
            {errors.synopsis && <span className="error">{errors.synopsis}</span>}
          </div>

          <h4>Current Book Details</h4>

          <div className="form-group">
            <label htmlFor="current_book.title">Title *</label>
            <input
              type="text"
              id="current_book.title"
              name="current_book.title"
              value={formData.current_book.title}
              onChange={handleChange}
            />
            {errors.currentBookTitle && <span className="error">{errors.currentBookTitle}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="current_book.author">Author *</label>
            <input
              type="text"
              id="current_book.author"
              name="current_book.author"
              value={formData.current_book.author}
              onChange={handleChange}
            />
            {errors.currentBookAuthor && <span className="error">{errors.currentBookAuthor}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="current_book.cover">Cover Image URL</label>
            <input
              type="text"
              id="current_book.cover"
              name="current_book.cover"
              value={formData.current_book.cover}
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