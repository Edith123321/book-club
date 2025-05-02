// src/pages/BookList.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import booksData from '../../components/booksData';
import '../../styles/BookList.css'; // Import the separate CSS file

const BookList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortOption, setSortOption] = useState('rating-desc');

  const allGenres = ['All', ...new Set(booksData.flatMap(book => book.genres))];

  const filteredBooks = booksData
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || book.genres.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch(sortOption) {
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'author-asc': return a.author.localeCompare(b.author);
        case 'author-desc': return b.author.localeCompare(a.author);
        case 'rating-desc': return b.rating - a.rating;
        case 'rating-asc': return a.rating - b.rating;
        default: return 0;
      }
    });

  return (
    <div className="book-list-page">
      <div className="controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search books or authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-container">
          <label>Genre:</label>
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            {allGenres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
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
                <img src={book.cover} alt={`${book.title} cover`} className="book-cover" />
                <div className="book-info">
                  <h3>{book.title}</h3>
                  <p className="author">{book.author}</p>
                  <div className="rating">
                    <span className="stars">
                      {"★".repeat(Math.floor(book.rating))}{"☆".repeat(5 - Math.floor(book.rating))}
                    </span>
                    <span>({book.rating.toFixed(1)})</span>
                  </div>
                  <div className="genres">
                    {book.genres.slice(0, 2).map(genre => (
                      <span key={genre} className="genre-tag">{genre}</span>
                    ))}
                    {book.genres.length > 2 && (
                      <span className="more-tag">+{book.genres.length - 2}</span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No books found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedGenre('All');
              }}
              className="reset-btn"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;
