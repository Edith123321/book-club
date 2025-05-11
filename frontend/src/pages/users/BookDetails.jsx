import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    content: '',
    rating: 5,
    username: ''
  });

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        
        // Fetch book details
        const bookResponse = await fetch(`http://localhost:5000/books/${id}`);
        if (!bookResponse.ok) {
          throw new Error('Failed to fetch book');
        }
        const bookData = await bookResponse.json();
        setBook(bookData);

        // Fetch reviews separately
        const reviewsResponse = await fetch(`http://localhost:5000/reviews?book_id=${id}&_expand=user`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
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
      const reviewToSubmit = {
        content: newReview.content,
        rating: Number(newReview.rating),
        book_id: Number(id),
        username: newReview.username // This should ideally be the logged-in user's name
      };

      const response = await fetch(`http://localhost:5000/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewToSubmit)
      });

      if (!response.ok) {
        throw new Error('Failed to add review');
      }

      const addedReview = await response.json();
      
      // Fetch the newly added review with user details
      const reviewWithUser = await fetch(`http://localhost:5000/reviews/${addedReview.id}?_expand=user`)
        .then(res => res.json());
      
      setReviews(prev => [...prev, reviewWithUser]);
      setNewReview({
        content: '',
        rating: 5,
        username: ''
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
            src={book.cover_image_url || '/default-book-cover.jpg'} 
            alt={`${book.title} cover`} 
            className="book-cover" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-book-cover.jpg';
            }}
          />
          <div className="quick-info">
            <p><span className="info-label">Author:</span> {book.author || 'Unknown'}</p>
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
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <h4>{review.user?.username || review.username || 'Anonymous'}</h4>
                  <div className="review-rating">
                    {Array(5).fill().map((_, i) => (
                      <span key={i} className={i < review.rating ? 'star-filled' : 'star-empty'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="review-text">{review.content}</p>
                <p className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
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
              <div className="form-group">
                <label>Rating</label>
                <select
                  name="rating"
                  value={newReview.rating}
                  onChange={handleInputChange}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} ★</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Your Review</label>
              <textarea
                name="content"
                value={newReview.content}
                onChange={handleInputChange}
                required
                minLength={20}
                maxLength={1000}
                placeholder="Share your thoughts about this book..."
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

        .book-cover {
          width: 100%;
          height: auto;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          border-radius: 4px;
        }

        .quick-info {
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .info-label {
          font-weight: bold;
          color: #555;
        }

        .rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding: 0.3rem 0.6rem;
          background-color: #f8f8f8;
          border-radius: 20px;
        }

        .stars {
          color: #ffc107;
        }

        .rating-value {
          font-weight: bold;
        }

        .book-details h1 {
          margin: 0;
          font-size: 2rem;
          color: #222;
        }

        .book-details h2 {
          margin: 0.5rem 0 1.5rem;
          font-size: 1.2rem;
          font-weight: normal;
          color: #666;
        }

        .genres-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 1rem 0;
        }

        .genre-tag {
          padding: 0.3rem 0.8rem;
          background-color: #e0e0e0;
          border-radius: 20px;
          font-size: 0.8rem;
        }

        .description-section {
          margin-top: 2rem;
        }

        .description-section h3 {
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .reviews-section {
          margin-top: 2rem;
          border-top: 1px solid #eee;
          padding-top: 2rem;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }

        .review-card {
          padding: 1.5rem;
          border: 1px solid #eee;
          border-radius: 8px;
          background-color: #fafafa;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .review-card h4 {
          margin: 0;
          font-size: 1rem;
        }

        .review-rating {
          color: #ffc107;
        }

        .star-filled {
          color: #ffc107;
        }

        .star-empty {
          color: #ddd;
        }

        .review-text {
          margin: 1rem 0;
          line-height: 1.5;
        }

        .review-date {
          font-size: 0.8rem;
          color: #999;
          text-align: right;
        }

        .add-review-form {
          margin-top: 3rem;
          padding: 2rem;
          background-color: #f8f8f8;
          border-radius: 8px;
        }

        .add-review-form h4 {
          margin-top: 0;
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          flex: 1;
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          font-size: 1rem;
        }

        .form-group textarea {
          min-height: 150px;
          resize: vertical;
        }

        .submit-review-btn {
          background-color: #4a6fa5;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-review-btn:hover {
          background-color: #3a5a8a;
        }
      `}</style>
    </div>
  );
};

export default BookDetails;