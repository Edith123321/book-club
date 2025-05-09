import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/AddBook.css';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    cover: '',
    rating: 0,
    genres: [],
    synopsis: '',
    date_published: '',
    language: 'English',
    pages: 0
  });

  const genreOptions = [
    'Fiction', 'Fantasy', 'Self-Help', 'Science Fiction', 'Mystery',
    'Romance', 'Thriller', 'Biography', 'History', 'Nonfiction'
  ];

  // Fetch book data from backend
  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/books/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch book');
        }
        
        const data = await response.json();
        setBookData({
          title: data.title || '',
          author: data.author || '',
          cover: data.cover || '',
          rating: data.rating || 0,
          genres: data.genres || [],
          synopsis: data.synopsis || '',
          date_published: data.date_published || data.datePublished || '',
          language: data.language || 'English',
          pages: data.pages || 0
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData(prev => ({
      ...prev,
      [name]: name === 'rating' || name === 'pages' ? Number(value) : value
    }));
  };

  const handleGenreChange = (genre) => {
    setBookData(prev => {
      if (prev.genres.includes(genre)) {
        return {
          ...prev,
          genres: prev.genres.filter(g => g !== genre)
        };
      } else {
        return {
          ...prev,
          genres: [...prev.genres, genre]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...bookData,
          updated_by: currentUser.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update book');
      }

      navigate(`/books/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading">Loading book details...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="add-book-page">
      <div className="form-container">
        <div className="form-header-container">
          <div className="form-header">
            <h1>Edit Book</h1>
            <p>Update the details of this book in our library</p>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-group">
            <label htmlFor="title">Book Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={bookData.title}
              onChange={handleChange}
              placeholder="The Midnight Library"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author*</label>
            <input
              type="text"
              id="author"
              name="author"
              value={bookData.author}
              onChange={handleChange}
              placeholder="Matt Haig"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cover">Cover Image URL*</label>
            <input
              type="url"
              id="cover"
              name="cover"
              value={bookData.cover}
              onChange={handleChange}
              placeholder="https://example.com/book-cover.jpg"
              required
              disabled={isLoading}
            />
            {bookData.cover && (
              <div className="cover-preview">
                <img src={bookData.cover} alt="Cover preview" />
                <span>Current Cover</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rating">Rating (0-5)*</label>
            <input
              type="number"
              id="rating"
              name="rating"
              min="0"
              max="5"
              step="0.1"
              value={bookData.rating}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_published">Publication Date</label>
            <input
              type="date"
              id="date_published"
              name="date_published"
              value={bookData.date_published}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="language">Language*</label>
            <select
              id="language"
              name="language"
              value={bookData.language}
              onChange={handleChange}
              required
              disabled={isLoading}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pages">Number of Pages</label>
            <input
              type="number"
              id="pages"
              name="pages"
              value={bookData.pages}
              onChange={handleChange}
              min="1"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Genres*</label>
            <div className="genre-checkboxes">
              {genreOptions.map(genre => (
                <div key={genre} className="genre-option">
                  <input
                    type="checkbox"
                    id={`genre-${genre}`}
                    checked={bookData.genres.includes(genre)}
                    onChange={() => handleGenreChange(genre)}
                    disabled={isLoading}
                  />
                  <label htmlFor={`genre-${genre}`}>{genre}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="synopsis">Synopsis*</label>
            <textarea
              id="synopsis"
              name="synopsis"
              value={bookData.synopsis}
              onChange={handleChange}
              placeholder="Between life and death there is a library..."
              rows="5"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(`/books/${id}`)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;