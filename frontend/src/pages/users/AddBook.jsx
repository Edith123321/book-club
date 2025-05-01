import React, { useState } from 'react';
import { FiPlusCircle, FiBook, FiFileText } from 'react-icons/fi';
import '../../styles/AddBooks.css';

const AddBook = () => {
  const [showModal, setShowModal] = useState(false);
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    totalPages: '',
    currentPage: '0'
  });

  const [bookStats, setBookStats] = useState({
    booksReading: 0,
    booksCompleted: 0,
    totalBooks: 0
  });

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

    setBookStats(prev => ({
      booksReading: prev.booksReading + 1,
      booksCompleted: prev.booksCompleted,
      totalBooks: prev.totalBooks + 1
    }));

    setShowModal(false);
    setBookData({
      title: '',
      author: '',
      totalPages: '',
      currentPage: '0'
    });
  };

  return (
    <div className="reading-tracker-container">
      {/* Formats Section Removed as per earlier request */}

      <div className="progress-section">
        <h1 className="progress-title">My Reading Progress</h1>
        <p className="progress-subtitle">Track your reading journey and celebrate your progress</p>

        <div className="stats-container">
          <div className="stat-box">
            <span className="stat-label">Books Reading</span>
            <span className="stat-value reading">{bookStats.booksReading}</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">Books Completed</span>
            <span className="stat-value completed">{bookStats.booksCompleted}</span>
          </div>

          <div className="stat-box">
            <span className="stat-label">Total Books</span>
            <span className="stat-value total">{bookStats.totalBooks}</span>
          </div>

          <button 
            className="add-book-btn"
            onClick={() => setShowModal(true)}
          >
            <FiPlusCircle size={18} />
            <span>Add New Book</span>
          </button>
        </div>

        <div className="tabs-container">
          <button className="tab-btn active">All Books</button>
          <button className="tab-btn">Currently Reading</button>
          <button className="tab-btn">Completed</button>
        </div>

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
      </div>

      {/* Modal */}
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