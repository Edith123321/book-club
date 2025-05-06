import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';

import Navbar from '../../components/Navbar';
import '../../styles/BookList.css';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortOption, setSortOption] = useState('rating-desc');
  const [activeTab, setActiveTab] = useState('all');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://127.0.0.1:5000/books');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.status !== 'success') {
          throw new Error(result.message || 'Failed to fetch books');
        }

        setBooks(result.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const allGenres = useMemo(() => {
    const genres = new Set(['All']);
    books.forEach(book => {
      (book.genres || []).forEach(genre => genres.add(genre));
    });
    return Array.from(genres);
  }, [books]);

  const filteredBooks = useMemo(() => {
    let filtered = books;

    if (activeTab === 'featured') {
      filtered = filtered.filter(book => (book.rating || 0) >= 4);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        (book.title || '').toLowerCase().includes(term) ||
        (book.author || '').toLowerCase().includes(term)
      );
    }

    if (selectedGenre !== 'All') {
      filtered = filtered.filter(book =>
        (book.genres || []).includes(selectedGenre)
      );
    }

    filtered = [...filtered].sort((a, b) => {
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      const aTitle = a.title || '';
      const bTitle = b.title || '';
      const aAuthor = a.author || '';
      const bAuthor = b.author || '';

      switch (sortOption) {
        case 'title-asc': return aTitle.localeCompare(bTitle);
        case 'title-desc': return bTitle.localeCompare(aTitle);
        case 'author-asc': return aAuthor.localeCompare(bAuthor);
        case 'author-desc': return bAuthor.localeCompare(aAuthor);
        case 'rating-asc': return aRating - bRating;
        case 'rating-desc': return bRating - aRating;
        default: return 0;
      }
    });

    return filtered;
  }, [books, activeTab, searchTerm, selectedGenre, sortOption]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'featured' ? '/my-books' : '/books');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setActiveTab('all');
    setSortOption('rating-desc');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error loading books: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="book-list-page">
        <div className="section-container">
          <div className="section-heading-container">
            <div className="heading-p">
              <h1>Book Collection</h1>
              <p>Discover and explore our extensive collection of books</p>
            </div>
            <div className="heading-button">
              <button className="create-button" onClick={() => navigate('/add-book')}>
                Add New Book
              </button>
            </div>
          </div>

          <div className="search-sort-heading">
            <div className="two-p">
              <p className={activeTab === 'all' ? 'active-tab' : ''} onClick={() => handleTabChange('all')}>
                All Books
              </p>
              <p className={activeTab === 'featured' ? 'active-tab' : ''} onClick={() => handleTabChange('featured')}>
                My Books
              </p>
            </div>
          </div>
        </div>

        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search books or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon"><CiSearch /></span>
          </div>

          <div className="filter-container">
            <label>Genre:</label>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
              {allGenres.map(genre => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-container">
            <label>Sort by:</label>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="rating-asc">Rating (Low to High)</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="author-asc">Author (A-Z)</option>
              <option value="author-desc">Author (Z-A)</option>
            </select>
          </div>
        </div>

        <div className="book-grid">
          {filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <div key={book.id} className="book-card">
                <Link to={`/book/${book.id}`}>
                  <img
                    src={book.cover || 'https://via.placeholder.com/150x200?text=No+Cover'}
                    alt={`${book.title} cover`}
                    className="book-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150x200?text=No+Cover';
                    }}
                  />
                  <div className="book-info">
                    <h3>{book.title || 'Untitled Book'}</h3>
                    <p className="author">{book.author || 'Unknown Author'}</p>
                    <div className="rating">
                      <span className="stars">
                        {'★'.repeat(Math.floor(book.rating || 0))}
                        {'☆'.repeat(5 - Math.floor(book.rating || 0))}
                      </span>
                      <span>({(book.rating || 0).toFixed(1)})</span>
                    </div>
                    <div className="genres">
                      {(book.genres || []).slice(0, 2).map(genre => (
                        <span key={genre} className="genre-tag">{genre}</span>
                      ))}
                      {(book.genres || []).length > 2 && (
                        <span className="more-tag">+{(book.genres.length - 2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No books found matching your criteria</p>
              <button onClick={resetFilters} className="reset-btn">
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookList;
