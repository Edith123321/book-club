import React, { useState } from 'react';
import { FiBook, FiFileText, FiPlusCircle } from 'react-icons/fi'; // Feather icons
import '../../styles/AddBook.css';

const AddBook = () => {
  const [showModal, setShowModal] = useState(false);
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    totalPages: '',
    currentPage: '0',
    status: 'reading', // New property to track book status
  });

  const [books, setBooks] = useState([]); // Store all books
  const [activeTab, setActiveTab] = useState('all'); // Track active tab

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    console.log('Book saved:', bookData);

    // Add the new book to the list
    setBooks(prevBooks => [...prevBooks, { ...bookData, id: Date.now() }]);

    // Reset modal and form
    setShowModal(false);
    setBookData({
      title: '',
      author: '',
      totalPages: '',
      currentPage: '0',
      status: 'reading',
    });
  };

  // Filter books based on the active tab
  const filteredBooks = books.filter(book => {
    if (activeTab === 'all') return true; // Show all books
    if (activeTab === 'reading') return book.status === 'reading';
    if (activeTab === 'completed') return book.status === 'completed';
  });

  return (
    <div className="reading-tracker-container">
      {/* Progress Section */}
      <div className="progress-section">
        <h1 className="progress-title">My Reading Progress</h1>
        <p className="progress-subtitle">Track your reading journey and celebrate your progress</p>

        {/* Stats Container */}
        <div className="stats-container">
          <div className="stat-box">
            <span className="stat-label">Books Reading</span>
            <span className="stat-value reading">{books.filter(book => book.status === 'reading').length}</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">Books Completed</span>
            <span className="stat-value completed">{books.filter(book => book.status === 'completed').length}</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">Total Books</span>
            <span className="stat-value total">{books.length}</span>
          </div>

          {/* Add Book Button */}
          <button
            className="add-book-btn"
            onClick={() => setShowModal(true)}
          >
            <FiPlusCircle size={18} />
            <span>Add New Book</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Books
          </button>
          <button
            className={`tab-btn ${activeTab === 'reading' ? 'active' : ''}`}
            onClick={() => setActiveTab('reading')}
          >
            Currently Reading
          </button>
          <button
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="empty-state">
            <div className="book-icon">
              <FiBook size={48} color="#D1D5DB" />
            </div>
            <h3 className="empty-title">No books added yet</h3>
            <p className="empty-subtitle">Start tracking your reading progress by adding your first book</p>
            <button
              className="add-first-book-btn"
              onClick={() => setShowModal(true)}
            >
              Add Your First Book
            </button>
          </div>
        )}

        {/* Display Books */}
        {filteredBooks.length > 0 && (
          <div className="books-list">
            {filteredBooks.map(book => (
              <div key={book.id} className="book-card">
                <h3>{book.title}</h3>
                <p>Author: {book.author}</p>
                <p>Total Pages: {book.totalPages}</p>
                <p>Current Page: {book.currentPage}</p>
                <p>Status: {book.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Adding Books */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Book</h2>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Book Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={bookData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="author">Author</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={bookData.author}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalPages">Total Pages</label>
                <input
                  type="number"
                  id="totalPages"
                  name="totalPages"
                  value={bookData.totalPages}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentPage">Current Page</label>
                <input
                  type="number"
                  id="currentPage"
                  name="currentPage"
                  value={bookData.currentPage}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSubmit}
                >
                  Save Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBook;