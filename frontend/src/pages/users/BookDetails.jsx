import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    title: '',
    username: '',
    description: ''
  });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:5000/books/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch book');
        }
        const data = await response.json();
        setBook(data);
        setReviews(data.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/books/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview)
      });

      if (!response.ok) {
        throw new Error('Failed to add review');
      }

      const addedReview = await response.json();
      setReviews(prev => [...prev, addedReview]);
      setNewReview({
        title: '',
        username: '',
        description: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading book details...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!book) return <p>No book found.</p>;

  return (
    <div className="book-details-page">
      <div className="book-main-grid">
        {/* Left Column - Book Cover */}
        <div className="book-cover-container">
          <img 
            src={book.cover || '/default-book-cover.jpg'} 
            alt={`${book.title} cover`} 
            className="book-cover" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-book-cover.jpg';
            }}
          />
          <div className="quick-info">
            <p><span className="info-label">Published:</span> {book.published || 'Unknown'}</p>
            <p><span className="info-label">Pages:</span> {book.pages || 'Unknown'}</p>
            {book.rating && (
              <div className="rating-badge">
                <span className="stars">
                  {"★".repeat(Math.floor(book.rating))}
                  {"☆".repeat(5 - Math.floor(book.rating))}
                </span>
                <span className="rating-value">{book.rating.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Book Details */}
        <div className="book-details">
          <h1>{book.title}</h1>
          <h2>by {book.author || 'Unknown author'}</h2>
          
          {book.genres && book.genres.length > 0 && (
            <div className="genres-container">
              {book.genres.map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>
          )}

          <div className="description-section">
            <h3>About This Book</h3>
            <p>{book.synopsis || 'No description available.'}</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h3>Reader Reviews ({reviews.length})</h3>
        
        {reviews.length > 0 ? (
          <div className="reviews-grid">
            {reviews.map((review, index) => (
              <div key={index} className="review-card">
                <h4>{review.title}</h4>
                <p className="review-text">{review.content}</p>
                <p className="reviewer">— {review.username}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}

        <div className="add-review-form">
          <h4>Share Your Thoughts</h4>
          <form onSubmit={handleAddReview}>
            <div className="form-row">
              <div className="form-group">
                <label>Review Title</label>
                <input
                  type="text"
                  name="title"
                  value={newReview.title}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  name="username"
                  value={newReview.username}
                  onChange={handleInputChange}
                  required
                  maxLength={50}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Your Review</label>
              <textarea
                name="description"
                value={newReview.description}
                onChange={handleInputChange}
                required
                minLength={20}
                maxLength={1000}
              />
            </div>
            
            <button type="submit" className="submit-review-btn">
              Post Review
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .book-details-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .book-main-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        /* [Rest of your CSS styles...] */
      `}</style>
    </div>
  );
};

export default BookDetails;