import React, { useState } from 'react';
import '../../styles/AddBook.css';
import { useNavigate } from 'react-router-dom';


// const navigate = useNavigate();

const AddBook = () => {
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    cover: '',
    rating: '',
    genres: [],
    synopsis: '',
    datePublished: '',
    language: '',
    pages: ''
  });

  const genreOptions = [
    'Fiction', 'Fantasy', 'Self-Help', 'Science Fiction', 'Mystery',
    'Romance', 'Thriller', 'Biography', 'History', 'Nonfiction'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData(prev => ({
      ...prev,
      [name]: value
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

    try {
      const response = await fetch('http://127.0.0.1:5000/books/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
      });

      if (!response.ok) {
        throw new Error(`Failed to add book: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Book successfully submitted:', result);
      alert('Book added successfully!');
      navigate('/books')
      
      setBookData({
        title: '',
        author: '',
        cover: '',
        rating: '',
        genres: [],
        synopsis: '',
        datePublished: '',
        language: '',
        pages: ''
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to submit book. Please try again.');
    }
    
  };


  return (
    <div className="add-book-page">
      
      <div className="form-container">
      <div className="form-header-container">
        <div className="form-header">
          <h1>Add a New Book</h1>
          <p>Contribute to our growing library by adding your favorite reads</p>
        </div>
      </div>

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
            />
            {bookData.cover && (
              <div className="cover-preview">
                <img src={bookData.cover} alt="Cover preview" />
                <span>Cover Preview</span>
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
              step="0.01"
              value={bookData.rating}
              onChange={handleChange}
              placeholder="4.02"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="datePublished">Publication Date</label>
            <input
              type="date"
              id="datePublished"
              name="datePublished"
              value={bookData.datePublished}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="language">Language*</label>
            <input
              type="text"
              id="language"
              name="language"
              value={bookData.language}
              onChange={handleChange}
              placeholder="English"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pages">Number of Pages</label>
            <input
              type="number"
              id="pages"
              name="pages"
              value={bookData.pages}
              onChange={handleChange}
              placeholder="304"
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
              placeholder="Between life and death there is a library, and within that library, the shelves go on forever..."
              rows="5"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Add Book
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBook;