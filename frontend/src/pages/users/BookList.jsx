import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiSearch } from 'react-icons/ci';
import Navbar from '../../components/Navbar';
import "../../styles/BookList.css";

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
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

        const genres = new Set();
        data.forEach(book => book.genres.forEach(g => genres.add(g)));
        setAllGenres(['All', ...Array.from(genres)]);

        if (!localStorage.getItem('allBooks')) {
          localStorage.setItem('allBooks', JSON.stringify(data));
        }

      } catch (err) {
        console.error('Error fetching books:', err);
      }
    };

    fetchBooks();

    const savedMyBooks = localStorage.getItem('myBooks');
    if (savedMyBooks) {
      setMyBooks(JSON.parse(savedMyBooks));
    }
  }, []);

  const handleReadBook = (book, e) => {
    e.stopPropagation();
    const exists = myBooks.find(b => b.id === book.id);
    if (!exists) {
      const updatedMyBooks = [...myBooks, { 
        ...book, 
        progress: 0,
        currentPage: 0,
        totalPages: book.totalPages || 300 // Default if not specified
      }];
      setMyBooks(updatedMyBooks);
      localStorage.setItem('myBooks', JSON.stringify(updatedMyBooks));
    }
  };

  const handlePageUpdate = (id, currentPage, totalPages, e) => {
    e.stopPropagation();
    const progress = Math.min(Math.round((currentPage / totalPages) * 100), 100);
    const updatedBooks = myBooks.map(book => 
      book.id === id ? { ...book, currentPage, progress } : book
    );
    setMyBooks(updatedBooks);
    localStorage.setItem('myBooks', JSON.stringify(updatedBooks));
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updatedBooks = myBooks.filter(book => book.id !== id);
    setMyBooks(updatedBooks);
    localStorage.setItem('myBooks', JSON.stringify(updatedBooks));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGenre('All');
    setSortOption('rating-desc');
  };

  const filteredBooks = (activeTab === 'all' ? books : myBooks)
    .filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || book.genres.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'rating-desc': return b.rating - a.rating;
        case 'rating-asc': return a.rating - b.rating;
        case 'title-asc': return a.title.localeCompare(b.title);
        case 'title-desc': return b.title.localeCompare(a.title);
        case 'author-asc': return a.author.localeCompare(b.author);
        case 'author-desc': return b.author.localeCompare(a.author);
        default: return 0;
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
            filteredBooks.map((book) => {
              const isMine = myBooks.some(b => b.id === book.id);
              const completed = book.progress === 100;
              const totalPages = book.totalPages || 300;
              const currentPage = book.currentPage || 0;
              
              return (
                <div
                  key={book.id}
                  className={`book-card ${completed ? 'completed' : ''}`}
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  

                  <div className="book-details">
                    <div>
                    <img
                      src={book.cover_image_url || 'https://via.placeholder.com/150x200?text=No+Cover'}
                      alt={`${book.title} cover`}
                      className="book-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150x200?text=No+Cover';
                      }}
                    />
                    {completed && <div className="completed-badge">Completed</div>}
                  </div>
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    
                    <div className="book-rating">
                      <span className="stars">
                        {'★'.repeat(Math.floor(book.rating))}
                        {'☆'.repeat(5 - Math.floor(book.rating))}
                      </span>
                      <span className="rating-value">{book.rating.toFixed(1)}</span>
                    </div>

                    {activeTab === 'all' ? (
                      <button
                        className={`read-book-button ${isMine ? 'added' : ''}`}
                        onClick={(e) => handleReadBook(book, e)}
                        disabled={isMine}
                      >
                        {isMine ? '✓ In Your Library' : '+ Add to Library'}
                      </button>
                    ) : (
                      <div className="progress-section" onClick={e => e.stopPropagation()}>
                        <div className="progress-bar-container">
                          <input
                            type="range"
                            min="0"
                            max={totalPages}
                            value={currentPage}
                            onChange={(e) => handlePageUpdate(book.id, parseInt(e.target.value), totalPages, e)}
                            className={`progress-slider ${completed ? 'completed' : ''}`}
                          />
                          <div className="page-input-container">
                            <span>Page: </span>
                            <input
                              type="number"
                              min="0"
                              max={totalPages}
                              value={currentPage}
                              onChange={(e) => handlePageUpdate(book.id, parseInt(e.target.value), totalPages, e)}
                              className="page-input"
                            />
                            <span> / {totalPages}</span>
                          </div>
                        </div>
                        <button 
                          className="delete-button"
                          onClick={(e) => handleDelete(book.id, e)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results">
              <p>No books found matching your criteria</p>
              <button onClick={resetFilters} className="reset-btn">Reset Filters</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookList;