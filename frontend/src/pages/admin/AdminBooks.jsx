import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import '../../styles/AdminPages.css';
import booksData from '../../components/booksData';

const AdminBooks = () => {
  const initialBooks = booksData;

  const [books, setBooks] = useState(initialBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    category: 'Fiction',
    price: '',
    stock: '',
    status: 'Available'
  });

  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.status === "Available").length;
  const outOfStockBooks = books.filter(book => book.status === "Out of Stock").length;
  const fictionBooks = books.filter(book => book.category === "Fiction").length;

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedBooks = React.useMemo(() => {
    let sortableBooks = [...books];
    if (sortConfig.key) {
      sortableBooks.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableBooks;
  }, [books, sortConfig]);

  const filteredBooks = sortedBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBook = () => {
    const newId = Math.max(0, ...books.map(book => book.id)) + 1;
    setBooks([...books, { ...newBook, id: newId }]);
    setShowAddForm(false);
    setNewBook({
      title: '',
      author: '',
      category: 'Fiction',
      price: '',
      stock: '',
      status: 'Available'
    });
  };

  const handleEditBook = () => {
    setBooks(books.map(book => book.id === currentBook.id ? currentBook : book));
    setShowEditForm(false);
  };

  const handleDeleteBook = (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      setBooks(books.filter(book => book.id !== id));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (showEditForm) {
      setCurrentBook({ ...currentBook, [name]: value });
    } else {
      setNewBook({ ...newBook, [name]: value });
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Books Management</h2>
        <button className="add-btn" onClick={() => setShowAddForm(true)}>
          <FiPlus /> Add Book
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><h3>Total Books</h3><p>{totalBooks}</p></div>
        <div className="stat-card"><h3>Available</h3><p>{availableBooks}</p></div>
        <div className="stat-card"><h3>Out of Stock</h3><p>{outOfStockBooks}</p></div>
        <div className="stat-card"><h3>Fiction Books</h3><p>{fictionBooks}</p></div>
      </div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              {['title', 'author', 'category', 'price', 'stock', 'status'].map(col => (
                <th key={col} onClick={() => requestSort(col)}>
                  {col[0].toUpperCase() + col.slice(1)}{' '}
                  {sortConfig.key === col && (
                    sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                  )}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map(book => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td><span className="category-badge">{book.category}</span></td>
                <td>${book.price}</td>
                <td>{book.stock}</td>
                {/* <td><span className={`status-badge ${book.status.toLowerCase().replace(' ', '-')}`}>{book.status}</span></td> */}
                <td className="actions">
                  <button className="action-btn edit" onClick={() => { setCurrentBook({ ...book }); setShowEditForm(true); }}>
                    <FiEdit />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteBook(book.id)}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Book</h3>
            {['title', 'author', 'price', 'stock'].map(field => (
              <div className="form-group" key={field}>
                <label>{field[0].toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                  name={field}
                  value={newBook[field]}
                  onChange={handleInputChange}
                  step={field === 'price' ? '0.01' : undefined}
                />
              </div>
            ))}
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={newBook.category} onChange={handleInputChange}>
                <option>Fiction</option>
                <option>Self-Help</option>
                <option>Sci-Fi</option>
                <option>Mystery</option>
                <option>Biography</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={newBook.status} onChange={handleInputChange}>
                <option>Available</option>
                <option>Out of Stock</option>
                <option>Coming Soon</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleAddBook}>Add Book</button>
            </div>
          </div>
        </div>
      )}

      {showEditForm && currentBook && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Book</h3>
            {['title', 'author', 'price', 'stock'].map(field => (
              <div className="form-group" key={field}>
                <label>{field[0].toUpperCase() + field.slice(1)}</label>
                <input
                  type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                  name={field}
                  value={currentBook[field]}
                  onChange={handleInputChange}
                  step={field === 'price' ? '0.01' : undefined}
                />
              </div>
            ))}
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={currentBook.category} onChange={handleInputChange}>
                <option>Fiction</option>
                <option>Self-Help</option>
                <option>Sci-Fi</option>
                <option>Mystery</option>
                <option>Biography</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={currentBook.status} onChange={handleInputChange}>
                <option>Available</option>
                <option>Out of Stock</option>
                <option>Coming Soon</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowEditForm(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleEditBook}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;
