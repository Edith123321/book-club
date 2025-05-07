import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiChevronUp, FiChevronDown, FiEdit, FiTrash2 } from 'react-icons/fi';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    averageRating: 0,
    recentBooks: 0
  });
  const [state, setState] = useState({
    showForm: false,
    searchTerm: '',
    sortConfig: { key: 'title', direction: 'asc' },
    currentBook: null
  });
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genres: [],
    synopsis: '',
    rating: '',
    language: '',
    pages: '',
    date_published: '',
    cover_image_url: '',
    date_added: new Date().toISOString().split('T')[0] // Default to today
  });

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/books');
        if (!response.ok) throw new Error('Failed to fetch books');
        const data = await response.json();
        setBooks(data);
        
        // Calculate stats
        const totalBooks = data.length;
        const avgRating = totalBooks > 0 
          ? (data.reduce((sum, book) => sum + (book.rating || 0), 0) / totalBooks).toFixed(1)
          : 0;
        const currentDate = new Date();
        const recentBooks = data.filter(book => {
          if (!book.date_added) return false;
          const addedDate = new Date(book.date_added);
          const diffTime = Math.abs(currentDate - addedDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 30; // Books added in last 30 days
        }).length;
        
        setStats({
          totalBooks,
          averageRating: avgRating,
          recentBooks
        });
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    
    fetchBooks();
  }, []);

  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (state.sortConfig.key === key && state.sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setState(prev => ({ ...prev, sortConfig: { key, direction } }));
  };

  // Filter and sort books
  const filteredBooks = React.useMemo(() => {
    let filtered = [...books];
    
    // Filter by search term
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(book => 
        (book.title && book.title.toLowerCase().includes(term)) ||
        (book.author && book.author.toLowerCase().includes(term)) ||
        (book.genres && book.genres.join(' ').toLowerCase().includes(term)) ||
        (book.language && book.language.toLowerCase().includes(term))
      );
    }
    
    // Sort
    if (state.sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[state.sortConfig.key];
        const bValue = b[state.sortConfig.key];
        
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        
        if (aValue < bValue) {
          return state.sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return state.sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [books, state.searchTerm, state.sortConfig]);

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenresChange = (e) => {
    const genres = e.target.value.split(',').map(g => g.trim()).filter(g => g);
    setFormData(prev => ({ ...prev, genres }));
  };

  const openEditForm = (book) => {
    setFormData({
      title: book.title || '',
      author: book.author || '',
      genres: book.genres || [],
      synopsis: book.synopsis || '',
      rating: book.rating || '',
      language: book.language || '',
      pages: book.pages || '',
      date_published: book.date_published ? book.date_published.split('T')[0] : '',
      cover_image_url: book.cover_image_url || '',
      date_added: book.date_added ? book.date_added.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setState(prev => ({ ...prev, showForm: true, currentBook: book }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      genres: [],
      synopsis: '',
      rating: '',
      language: '',
      pages: '',
      date_published: '',
      cover_image_url: '',
      date_added: new Date().toISOString().split('T')[0]
    });
    setState(prev => ({ ...prev, showForm: false, currentBook: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author) {
      alert('Title and Author are required fields');
      return;
    }

    const bookData = {
      ...formData,
      rating: formData.rating ? parseFloat(formData.rating) : null,
      pages: formData.pages ? parseInt(formData.pages) : null
    };
    
    try {
      let response;
      if (state.currentBook) {
        // Update existing book
        response = await fetch(`http://127.0.0.1:5000/books/${state.currentBook.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookData)
        });
      } else {
        
        response = await fetch('http://127.0.0.1:5000/books/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookData)
        });
      }
      
      const result = await response.json();
      if (response.ok) {
        // Refresh books list
        const updatedResponse = await fetch('http://127.0.0.1:5000/books');
        const updatedBooks = await updatedResponse.json();
        setBooks(updatedBooks);
        resetForm();
      } else {
        console.error('Error saving book:', result.error);
        alert(result.error || 'Failed to save book');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while saving the book');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/books/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setBooks(prev => prev.filter(book => book.id !== id));
        } else {
          const result = await response.json();
          console.error('Error deleting book:', result.error);
          alert(result.error || 'Failed to delete book');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting the book');
      }
    }
  };

  return (
    <div className="admin-page">
      {/* Header and controls */}
      <div className="page-header">
        <h2>Books Management</h2>
        <button className="add-btn" onClick={() => setState(prev => ({ ...prev, showForm: true }))}>
          <FiPlus /> Add Book
        </button>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Books</h3><p>{stats.totalBooks}</p></div>
        <div className="stat-card"><h3>Avg Rating</h3><p>{stats.averageRating}</p></div>
        <div className="stat-card"><h3>Recent Books</h3><p>{stats.recentBooks}</p></div>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search books..."
          value={state.searchTerm}
          onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
        />
      </div>

      {/* Books table */}
      <div className="data-table">
        <table>
          <thead>
            <tr>
              {['title', 'author', 'rating', 'genres', 'pages', 'date_published', 'language'].map((col) => (
                <th key={col} onClick={() => requestSort(col)}>
                  {col.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}{' '}
                  {state.sortConfig.key === col && (
                    state.sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />
                  )}
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>{book.title || 'Untitled'}</td>
                  <td>{book.author || 'Unknown'}</td>
                  <td>{book.rating ? book.rating.toFixed(1) : 'N/A'}</td>
                  <td>{book.genres ? book.genres.join(', ') : ''}</td>
                  <td>{book.pages || 'N/A'}</td>
                  <td>{book.date_published ? book.date_published.split('T')[0] : 'Unknown'}</td>
                  <td>{book.language || 'N/A'}</td>
                  <td className="actions">
                    <button 
                      className="action-btn edit" 
                      onClick={() => openEditForm(book)}
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(book.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-results">
                  No books found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Book form modal */}
      {state.showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{state.currentBook ? 'Edit Book' : 'Add New Book'}</h3>
            <form onSubmit={handleSubmit}>
              {['title', 'author', 'cover_image_url', 'rating', 'pages', 'language'].map((field) => (
                <div className="form-group" key={field}>
                  <label>{field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</label>
                  <input
                    type={field === 'rating' || field === 'pages' ? 'number' : 'text'}
                    name={field}
                    value={formData[field] || ''}
                    onChange={handleInputChange}
                    step={field === 'rating' ? '0.1' : undefined}
                    placeholder={field === 'rating' ? '0.0 - 5.0' : ''}
                    required={field === 'title' || field === 'author'}
                  />
                </div>
              ))}
              
              <div className="form-group">
                <label>Date Published</label>
                <input
                  type="date"
                  name="date_published"
                  value={formData.date_published}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Date Added</label>
                <input
                  type="date"
                  name="date_added"
                  value={formData.date_added}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Genres (comma separated)</label>
                <input
                  type="text"
                  name="genres"
                  value={formData.genres.join(', ')}
                  onChange={handleGenresChange}
                  placeholder="e.g. Fiction, Sci-Fi, Adventure"
                />
              </div>
              
              <div className="form-group">
                <label>Synopsis</label>
                <textarea
                  name="synopsis"
                  value={formData.synopsis || ''}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter book synopsis..."
                />
              </div>
              
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>
                <button type="submit" className="submit-btn">
                  {state.currentBook ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;