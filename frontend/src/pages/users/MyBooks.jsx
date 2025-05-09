import React, { useEffect, useState } from 'react';
// import './MyBooks.css';

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch books from the backend on mount
  useEffect(() => {
    fetch('/books')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        return response.json();
      })
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching books:', error);
        setLoading(false);
      });
  }, []);

  const updateProgress = (id, newProgress) => {
    const updatedBooks = books.map(book =>
      book.id === id ? { ...book, progress: newProgress } : book
    );
    setBooks(updatedBooks);

    // Optionally send update to backend
    fetch(`https://127.0.0.1:5000/books/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: newProgress })
    }).catch(err => console.error('Update failed:', err));
  };

  const deleteBook = (id) => {
    setBooks(prev => prev.filter(book => book.id !== id));

    // Optionally delete from backend
    fetch(`https://127.0.0.1:5000/books/${id}`, {
      method: 'DELETE'
    }).catch(err => console.error('Delete failed:', err));
  };

  if (loading) return <div>Loading books...</div>;

  return (
    <div className="mybooks-container">
      <h2>Books I'm Reading</h2>
      {books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        books.map(book => (
          <div key={book.id} className="book-card">
            <h3>{book.title}</h3>
            <label>Progress: {book.progress || 0}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={book.progress || 0}
              onChange={(e) => updateProgress(book.id, Number(e.target.value))}
            />
            <div className="actions">
              <button onClick={() => deleteBook(book.id)}>🗑 Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBooks;
