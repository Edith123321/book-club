import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import Navbar from '../../components/Navbar';
import "../../styles/BookList.css"

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortOption, setSortOption] = useState('rating-desc');
  const [activeTab, setActiveTab] = useState('all');
  const [allGenres, setAllGenres] = useState(['All']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/books/');
        const data = await response.json();
        setBooks(data);

        // Extract all unique genres
        const genres = new Set();
        data.forEach(book => book.genres.forEach(g => genres.add(g)));
        setAllGenres(['All', ...Array.from(genres)]);
      } catch (err) {
        console.error('Error fetching books:', err);
      }
    };

    fetchBooks();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setSortOption('rating-desc');
  };

  const filteredBooks = books
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || book.genres.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'rating-asc':
          return a.rating - b.rating;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'author-asc':
          return a.author.localeCompare(b.author);
        case 'author-desc':
          return b.author.localeCompare(a.author);
        default:
          return 0;
      }
    });

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
                    src={book.cover_image_url || 'https://via.placeholder.com/150x200?text=No+Cover'}
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
