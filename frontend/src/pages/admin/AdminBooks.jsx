import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import '../../styles/AdminPages.css';

// Constants
const API_URL = 'http://127.0.0.1:5000/books';
const DEBOUNCE_DELAY = 300; // milliseconds for search debouncing

const AdminBooks = () => {
  // State management
  const [state, setState] = useState({
    books: [],
    loading: true,
    error: null,
    searchTerm: '',
    sortConfig: { key: null, direction: 'asc' },
    showForm: false,
    currentBook: null
  });
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: '',
    rating: '',
    genres: '',
    description: '',
    pages: '',
    published: '',
    founder: '',
    ratingReview: ''
  });

  // Memoized fetch function with error handling
  const fetchBooks = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.status !== "success") {
        throw new Error(result.message || "Failed to fetch books");
      }
      
      setState(prev => ({
        ...prev,
        books: result.data?.books || result.data || [],
        loading: false
      }));
    } catch (error) {
      console.error('Failed to fetch books:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  }, []);

  // Fetch books on mount and handle cleanup
  useEffect(() => {
    const abortController = new AbortController();
    
    const loadData = async () => {
      await fetchBooks();
    };
    
    loadData();
    
    return () => {
      abortController.abort(); // Cleanup on unmount
    };
  }, [fetchBooks]);

  // Debounced search
  useEffect(() => {
    const timerId = setTimeout(() => {
      // Search logic will be handled in filteredBooks memo
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timerId);
    };
  }, [state.searchTerm]);

  // Sorting logic
  const sortedBooks = useMemo(() => {
    const { books, sortConfig } = state;
    if (!sortConfig.key) return books;

    return [...books].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc' 
        ? (aValue < bValue ? -1 : 1)
        : (aValue > bValue ? -1 : 1);
    });
  }, [state.books, state.sortConfig]);

  // Filtering logic with debouncing
  const filteredBooks = useMemo(() => {
    const term = state.searchTerm.toLowerCase();
    return sortedBooks.filter(book =>
      (book.title || '').toLowerCase().includes(term) ||
      (book.author || '').toLowerCase().includes(term)
    );
  }, [sortedBooks, state.searchTerm]);

  // CRUD operations
  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!state.currentBook;
    
    try {
      const payload = {
        ...formData,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        pages: formData.pages ? parseInt(formData.pages) : null,
        genres: formData.genres ? formData.genres.split(',').map(g => g.trim()) : []
      };

      const response = await fetch(
        isEdit ? `${API_URL}/${state.currentBook.id}` : API_URL,
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'add'} book`);
      }

      await fetchBooks();
      resetForm();
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'add'} book:`, error);
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete book');
      }
      
      await fetchBooks();
    } catch (error) {
      console.error('Failed to delete book:', error);
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  // Helper functions
  const requestSort = (key) => {
    setState(prev => ({
      ...prev,
      sortConfig: {
        key,
        direction: prev.sortConfig.key === key && prev.sortConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
      }
    }));
  };

  const openEditForm = (book) => {
    setState(prev => ({ ...prev, currentBook: book, showForm: true }));
    setFormData({
      ...book,
      genres: book.genres ? (Array.isArray(book.genres) ? book.genres.join(', ') : book.genres) : '',
      rating: book.rating || '',
      pages: book.pages || '',
      published: book.published || ''
    });
  };

  const resetForm = () => {
    setState(prev => ({ ...prev, currentBook: null, showForm: false }));
    setFormData({
      title: '',
      author: '',
      cover: '',
      rating: '',
      genres: '',
      description: '',
      pages: '',
      published: '',
      founder: '',
      ratingReview: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Stats calculation
  const stats = useMemo(() => {
    const { books } = state;
    const totalBooks = books.length;
    const averageRating = books.reduce((sum, book) => sum + (book.rating || 0), 0) / (books.length || 1);
    const recentBooks = books.filter(book => {
      if (!book.published) return false;
      try {
        const publishedYear = new Date(book.published).getFullYear();
        return publishedYear >= new Date().getFullYear() - 1;
      } catch {
        return false;
      }
    }).length;

    return { 
      totalBooks, 
      averageRating: isNaN(averageRating) ? 0 : averageRating.toFixed(1),
      recentBooks 
    };
  }, [state.books]);

  // Render loading state
  if (state.loading) {
    return (
      <div className="admin-page loading">
        <div className="loading-spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <div className="admin-page error">
        <p>Error loading books: {state.error}</p>
        <button onClick={fetchBooks}>Retry</button>
      </div>
    );
  }

  // Main render
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
              {['title', 'author', 'rating', 'genres', 'pages', 'published'].map((col) => (
                <th key={col} onClick={() => requestSort(col)}>
                  {col.charAt(0).toUpperCase() + col.slice(1)}{' '}
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
                  <td>{book.genres ? (Array.isArray(book.genres) ? book.genres.join(', ') : book.genres) : ''}</td>
                  <td>{book.pages || 'N/A'}</td>
                  <td>{book.published || 'Unknown'}</td>
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
                <td colSpan="7" className="no-results">
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
              {['title', 'author', 'cover', 'rating', 'pages', 'published', 'founder', 'ratingReview'].map((field) => (
                <div className="form-group" key={field}>
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
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
                <label>Genres (comma separated)</label>
                <input
                  type="text"
                  name="genres"
                  value={formData.genres}
                  onChange={handleInputChange}
                  placeholder="e.g. Fiction, Sci-Fi, Adventure"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter book description..."
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