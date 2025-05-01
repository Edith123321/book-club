import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import '../../styles/AdminPages.css';

const AdminBooks = () => {
  // Sample data
  const initialBooks = [
    { id: 1, title: "The Midnight Library", author: "Matt Haig", category: "Fiction", price: 12.99, stock: 45, status: "Available" },
    { id: 2, title: "Atomic Habits", author: "James Clear", category: "Self-Help", price: 14.99, stock: 32, status: "Available" },
    { id: 3, title: "Dune", author: "Frank Herbert", category: "Sci-Fi", price: 10.99, stock: 0, status: "Out of Stock" },
    { id: 4, title: "Where the Crawdads Sing", author: "Delia Owens", category: "Fiction", price: 11.49, stock: 18, status: "Available" },
  ];

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

  // Stats calculation
  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.status === "Available").length;
  const outOfStockBooks = books.filter(book => book.status === "Out of Stock").length;
  const fictionBooks = books.filter(book => book.category === "Fiction").length;

  // Sorting function
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
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBooks;
  }, [books, sortConfig]);

  // Filter books based on search term
  const filteredBooks = sortedBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD operations
  const handleAddBook = () => {
    const newId = Math.max(...books.map(book => book.id)) + 1;
    setBooks([...books, { ...newBook, id: newId }]);
    setShowAddForm(false);
    setNewBook({ title: '', author: '', category: 'Fiction', price: '', stock: '', status: 'Available' });
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

  // Form handlers
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
        <button 
          className="add-btn"
          onClick={() => setShowAddForm(true)}
        >
          <FiPlus /> Add Book
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Books</h3>
          <p>{totalBooks}</p>
        </div>
        <div className="stat-card">
          <h3>Available</h3>
          <p>{availableBooks}</p>
        </div>
        <div className="stat-card">
          <h3>Out of Stock</h3>
          <p>{outOfStockBooks}</p>
        </div>
        <div className="stat-card">
          <h3>Fiction Books</h3>
          <p>{fictionBooks}</p>
        </div>
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
              <th onClick={() => requestSort('title')}>
                Book {sortConfig.key === 'title' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('author')}>
                Author {sortConfig.key === 'author' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('category')}>
                Category {sortConfig.key === 'category' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('price')}>
                Price {sortConfig.key === 'price' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('stock')}>
                Stock {sortConfig.key === 'stock' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th onClick={() => requestSort('status')}>
                Status {sortConfig.key === 'status' && (
                  sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map(book => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>
                  <span className="category-badge">{book.category}</span>
                </td>
                <td>${book.price}</td>
                <td>{book.stock}</td>
                <td>
                  <span className={`status-badge ${book.status.toLowerCase().replace(' ', '-')}`}>
                    {book.status}
                  </span>
                </td>
                <td className="actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => {
                      setCurrentBook({...book});
                      setShowEditForm(true);
                    }}
                  >
                    <FiEdit />
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Book Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Book</h3>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={newBook.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                name="author"
                value={newBook.author}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={newBook.category}
                onChange={handleInputChange}
              >
                <option value="Fiction">Fiction</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Mystery">Mystery</option>
                <option value="Biography">Biography</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={newBook.price}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={newBook.stock}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={newBook.status}
                onChange={handleInputChange}
              >
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={handleAddBook}
              >
                Add Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditForm && currentBook && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Book</h3>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={currentBook.title}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                name="author"
                value={currentBook.author}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={currentBook.category}
                onChange={handleInputChange}
              >
                <option value="Fiction">Fiction</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Mystery">Mystery</option>
                <option value="Biography">Biography</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={currentBook.price}
                onChange={handleInputChange}
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={currentBook.stock}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={currentBook.status}
                onChange={handleInputChange}
              >
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowEditForm(false)}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={handleEditBook}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;