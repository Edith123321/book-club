import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/AddBook.css';




const AddBookClub = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    synopsis: '',
    current_book: { title: '', author: '', cover: '' }
  });
  const [errors, setErrors] = useState({});




  // Pull the logged-in user out of localStorage (or wherever you store it)
  const [ownerId, setOwnerId] = useState(null);
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setOwnerId(user.id);
      } catch {
        console.warn("Couldn't parse userData from localStorage");
      }
    }
  }, []);




  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Book Club Name is required';
    if (!formData.synopsis.trim()) errs.synopsis = 'Description is required';
    if (!formData.current_book.title.trim()) errs.currentBookTitle = 'Current Book Title is required';
    if (!formData.current_book.author.trim()) errs.currentBookAuthor = 'Current Book Author is required';
    return errs;
  };




  const handleChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('current_book.')) {
      const field = name.split('.')[1];
      setFormData(f => ({
        ...f,
        current_book: { ...f.current_book, [field]: value }
      }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };




  const handleSubmit = async e => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    if (!ownerId) {
      alert('You must be logged in to create a club');
      return;
    }




    try {
      const resp = await fetch('http://127.0.0.1:5000/bookclubs/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          synopsis: formData.synopsis,
          owner_id: ownerId,
          // only include current_book if title+author provided
          current_book: formData.current_book.title
            ? formData.current_book
            : null
        })
      });




      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Failed to create book club');
      }




      const data = await resp.json();
      console.log('Book club created:', data);
      navigate('/bookclubs');
    } catch (err) {
      console.error('Error:', err);
      alert(err.message);
    }
  };




  const handleCancel = () => navigate('/bookclubs');




  return (
    <div className='add-book-page'>
      <div className="form-container">
        <div className="form-header-container">
          <div className="form-header">
            <h1>Add a New Book Club</h1>
            <p>Contribute to our growing library by adding a club</p>
          </div>
        </div>


        <div className="form-container">
          <form onSubmit={handleSubmit} className="book-form">
            <div className="form-group">
              <label>Book Club Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>


            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="synopsis"
                value={formData.synopsis}
                onChange={handleChange}
              />
              {errors.synopsis && <span className="error">{errors.synopsis}</span>}
            </div>


            <h4>Current Book Details</h4>


            <div className="form-group">
              <label>Title *</label>
              <input
                name="current_book.title"
                value={formData.current_book.title}
                onChange={handleChange}
              />
              {errors.currentBookTitle && <span className="error">{errors.currentBookTitle}</span>}
            </div>


            <div className="form-group">
              <label>Author *</label>
              <input
                name="current_book.author"
                value={formData.current_book.author}
                onChange={handleChange}
              />
              {errors.currentBookAuthor && <span className="error">{errors.currentBookAuthor}</span>}
            </div>


            <div className="form-group">
              <label>Cover Image URL</label>
              <input
                name="current_book.cover"
                value={formData.current_book.cover}
                onChange={handleChange}
              />
            </div>


            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="submit-button">
                Create Book Club
              </button>
            </div>
          </form>
        </div>


      </div>
    </div>


  );
};




export default AddBookClub;









