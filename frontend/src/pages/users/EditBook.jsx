import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/AddBook.css'; // Reusing the same styles

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  // Fetch book data (in a real app, this would be an API call)
  useEffect(() => {
    // Mock data fetch - replace with actual API call
    const fetchBook = async () => {
      // This would be your actual API call:
      // const response = await fetch(`/api/books/${id}`);
      // const data = await response.json();

      // Mock data for demonstration:
      const mockBook = {
        id: 1,
        title: "The Midnight Library",
        author: "Matt Haig",
        cover: "https://i.pinimg.com/474x/ea/87/e5/ea87e5dd6bd36ccea9299fc024f08c09.jpg",
        rating: 4.02,
        genres: ["Fiction", "Fantasy", "Self-Help"],
        synopsis: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
        datePublished: "2020-08-13",
        language: "English",
        pages: 304
      };

      setBookData(mockBook);
    };

    fetchBook();
  }, [id]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Book updated:', bookData);
    // Here you would typically send the updated data to your backend
    // Then navigate back to the book details or books list
    navigate(`/book/${id}`);
  };

  return (
    <div className="add-book-page">
      <div className="form-container">
        <div className="form-header-container">
          <div className="form-header">
            <h1>Edit Book</h1>
            <p>Update the details of this book in our library</p>
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
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(`/books/${id}`)}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;