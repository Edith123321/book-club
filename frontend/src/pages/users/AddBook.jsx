import React, { useState } from 'react';
import { FaBook } from 'react-icons/fa';
import '../../styles/AddBooks.css';

const AddBooks = () => {
  const [books, setBooks] = useState([]);
  const [showAddBook, setShowAddBook] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [format, setFormat] = useState('Hardcover');
  const [price, setPrice] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddBook = () => {
    if (editingIndex !== null) {
      const updatedBooks = books.map((book, index) =>
        index === editingIndex ? { title, author, totalPages, currentPage, format, price } : book
      );
      setBooks(updatedBooks);
      setEditingIndex(null);
    } else {
      setBooks([...books, { title, author, totalPages, currentPage, format, price }]);
    }
    setTitle('');
    setAuthor('');
    setTotalPages('');
    setCurrentPage('');
    setFormat('Hardcover');
    setPrice('');
    setShowAddBook(false);
  };

  const handleEditBook = (index) => {
    const book = books[index];
    setTitle(book.title);
    setAuthor(book.author);
    setTotalPages(book.totalPages);
    setCurrentPage(book.currentPage);
    setFormat(book.format);
    setPrice(book.price);
    setEditingIndex(index);
    setShowAddBook(true);
  };

  const handleDeleteBook = (index) => {
    setBooks(books.filter((_, i) => i !== index));
  };

  return (
    <div className="add-books-container">
      <div className="available-formats">
        <h3>Available Formats</h3>
        <div className="format-options">
          <label>
            <input
              type="radio"
              name="format"
              value="Hardcover"
              checked={format === 'Hardcover'}
              onChange={(e) => setFormat(e.target.value)}
            />
            Hardcover $18.99
          </label>
          <label>
            <input
              type="radio"
              name="format"
              value="Paperback"
              checked={format === 'Paperback'}
              onChange={(e) => setFormat(e.target.value)}
            />
            Paperback $12.99
          </label>
          <label>
            <input
              type="radio"
              name="format"
              value="E-Book"
              checked={format === 'E-Book'}
              onChange={(e) => setFormat(e.target.value)}
            />
            E-Book $7.99
          </label>
          <label>
            <input
              type="radio"
              name="format"
              value="Audiobook"
              checked={format === 'Audiobook'}
              onChange={(e) => setFormat(e.target.value)}
            />
            Audiobook $14.95
          </label>
        </div>
      </div>

      <div className="reading-progress">
        <h2>My Reading Progress</h2>
        <p>Track your reading journey and celebrate your progress</p>
        <div className="book-stats">
          <div>Books Reading: {books.length}</div>
          <div>Books Completed: 0</div>
          <div>Total Books: {books.length}</div>
        </div>
        <button onClick={() => setShowAddBook(true)}>Add New Book</button>
      </div>

      <div className="book-list">
        {books.length > 0 ? (
          books.map((book, index) => (
            <div key={index} className="book-item">
              <div className="book-details">
                <h3>{book.title}</h3>
                <p>Author: {book.author}</p>
                <p>Total Pages: {book.totalPages}</p>
                <p>Current Page: {book.currentPage}</p>
                <p>Format: {book.format}</p>
                <p>Price: ${book.price}</p>
              </div>
              <div className="book-actions">
                <button onClick={() => handleEditBook(index)}>Edit</button>
                <button onClick={() => handleDeleteBook(index)}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-books">
            <FaBook size={50} color="#616161" />
            <p>No books added yet</p>
            <p>Start tracking your reading progress by adding your first book</p>
            <button onClick={() => setShowAddBook(true)}>Add Your First Book</button>
          </div>
        )}
      </div>

      {showAddBook && (
        <div className="add-book-dropdown">
          <div className="add-book-form">
            <h3>Add New Book</h3>
            <input
              type="text"
              placeholder="Book Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <input
              type="number"
              placeholder="Total Pages"
              value={totalPages}
              onChange={(e) => setTotalPages(e.target.value)}
            />
            <input
              type="number"
              placeholder="Current Page"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
            />
            <input
              type="text"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <div className="add-book-actions">
              <button onClick={() => setShowAddBook(false)}>Cancel</button>
              <button onClick={handleAddBook}>Save Book</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBooks;
