import { useState } from 'react';
import { useParams } from 'react-router-dom';
import booksData from '../../components/booksData';

const BookDetailsPage = () => {
  const { id } = useParams();
  const [newReview, setNewReview] = useState({ title: '', description: '', username: '' });
  const [reviews, setReviews] = useState([]);

  const book = booksData.find(book => book.id === parseInt(id));

  if (!book) {
    return <div className="not-found">Book not found</div>;
  }

  const handleAddReview = (e) => {
    e.preventDefault();
    if (newReview.title && newReview.description && newReview.username) {
      setReviews([...reviews, newReview]);
      setNewReview({ title: '', description: '', username: '' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  return (
    <div className="book-details-page">
      <div className="book-main-grid">
        {/* Left Column - Book Cover */}
        <div className="book-cover-container">
          <img src={book.cover} alt={`${book.title} cover`} className="book-cover" />
          <div className="quick-info">
            <p><span className="info-label">Published:</span> {book.published}</p>
            <p><span className="info-label">Pages:</span> {book.pages}</p>
            <div className="rating-badge">
              <span className="stars">{"★".repeat(Math.floor(book.rating))}{"☆".repeat(5 - Math.floor(book.rating))}</span>
              <span className="rating-value">{book.rating.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Book Details */}
        <div className="book-details">
          <h1>{book.title}</h1>
          <h2>by {book.author}</h2>
          
          <div className="genres-container">
            {book.genres.map((genre, index) => (
              <span key={index} className="genre-tag">{genre}</span>
            ))}
          </div>

          <div className="description-section">
            <h3>About This Book</h3>
            <p>{book.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews Section - Full Width Below */}
      <div className="reviews-section">
        <h3>Reader Reviews ({book.reviews.length + reviews.length})</h3>
        
        <div className="reviews-grid">
          {[...book.reviews, ...reviews].map((review, index) => (
            <div key={index} className="review-card">
              <h4>{review.title}</h4>
              <p className="review-text">{review.description}</p>
              <p className="reviewer">— {review.username}</p>
            </div>
          ))}
        </div>

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
              />
            </div>
            
            <button type="submit" className="submit-review-btn">
              Post Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;

// CSS Styles
const styles = `
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

  .book-cover-container {
    position: sticky;
    top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .book-cover {
    width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .quick-info {
    background: #f8f5ff;
    padding: 1.25rem;
    border-radius: 8px;
    border-left: 4px solid #7b2cbf;
  }

  .quick-info p {
    margin: 0.5rem 0;
    font-size: 0.95rem;
  }

  .info-label {
    font-weight: 600;
    color: #5a189a;
  }

  .rating-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    margin-top: 0.5rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .stars {
    color: #ff9e00;
    font-size: 1.1rem;
  }

  .rating-value {
    font-weight: 600;
    color: #5a189a;
  }

  .book-details {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .book-details h1 {
    font-size: 2.2rem;
    margin: 0;
    color: #3c096c;
    line-height: 1.2;
  }

  .book-details h2 {
    font-size: 1.4rem;
    margin: 0;
    color: #7b2cbf;
    font-weight: 500;
  }

  .genres-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }

  .genre-tag {
    background: #e0aaff;
    color: #3c096c;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .description-section h3 {
    color: #5a189a;
    margin: 1rem 0 0.5rem;
    font-size: 1.3rem;
  }

  .description-section p {
    line-height: 1.7;
    margin: 0;
  }

  .reviews-section {
    border-top: 1px solid #eee;
    padding-top: 2rem;
  }

  .reviews-section h3 {
    color: #3c096c;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .review-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border-top: 3px solid #9d4edd;
  }

  .review-card h4 {
    margin: 0 0 0.5rem;
    color: #3c096c;
    font-size: 1.1rem;
  }

  .review-text {
    margin: 0.5rem 0;
    line-height: 1.6;
    color: #555;
  }

  .reviewer {
    font-style: italic;
    color: #777;
    margin: 0.5rem 0 0;
    font-size: 0.9rem;
  }

  .add-review-form {
    background: #f9f4ff;
    padding: 2rem;
    border-radius: 8px;
    margin-top: 2rem;
  }

  .add-review-form h4 {
    color: #5a189a;
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.3rem;
  }

  .form-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .form-group {
    flex: 1;
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #5a189a;
    font-size: 0.95rem;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: inherit;
    font-size: 1rem;
    transition: border 0.2s;
  }

  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #9d4edd;
    box-shadow: 0 0 0 2px rgba(157, 78, 221, 0.2);
  }

  .form-group textarea {
    min-height: 120px;
    resize: vertical;
  }

  .submit-review-btn {
    background: linear-gradient(to right, #7b2cbf, #9d4edd);
    color: white;
    border: none;
    padding: 0.8rem 1.75rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .submit-review-btn:hover {
    background: linear-gradient(to right, #6a1b9a, #7b2cbf);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }

  @media (max-width: 900px) {
    .book-main-grid {
      grid-template-columns: 1fr;
    }
    
    .book-cover-container {
      position: static;
      flex-direction: row;
      align-items: center;
    }
    
    .quick-info {
      flex: 1;
    }
  }

  @media (max-width: 600px) {
    .book-cover-container {
      flex-direction: column;
    }
    
    .form-row {
      flex-direction: column;
      gap: 0;
    }
    
    .reviews-grid {
      grid-template-columns: 1fr;
    }
  }
`;


const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);