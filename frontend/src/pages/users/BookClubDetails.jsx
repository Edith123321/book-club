import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer';
import '../../styles/BookClubDetails.css';

const BookClubDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [newReview, setNewReview] = useState({ content: '', rating: 5 });
  const [newSummary, setNewSummary] = useState({ content: '' });

  const BASE_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch club details
        const clubResponse = await fetch(`${BASE_URL}/bookclubs/${id}`);
        if (!clubResponse.ok) throw new Error('Failed to fetch club details');
        const clubData = await clubResponse.json();
        setClub(clubData);
        
        // Fetch summaries for this book club
        const summariesResponse = await fetch(`${BASE_URL}/summaries?bookclub_id=${id}`);
        if (summariesResponse.ok) {
          const summariesData = await summariesResponse.json();
          setSummaries(summariesData);
        }
        
        // Fetch reviews for the current book if exists
        if (clubData.current_book?.id) {
          const reviewsResponse = await fetch(`${BASE_URL}/reviews?book_id=${clubData.current_book.id}`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (newReview.content.trim() && club?.current_book?.id) {
      try {
        const userId = localStorage.getItem('userId');
        
        const response = await fetch(`${BASE_URL}/reviews/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            book_id: club.current_book.id,
            user_id: userId,
            content: newReview.content,
            rating: newReview.rating,
          }),
        });

        if (response.ok) {
          const addedReview = await response.json();
          setReviews([...reviews, addedReview]);
          setNewReview({ content: '', rating: 5 });
        } else {
          throw new Error('Failed to add review');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleAddSummary = async (e) => {
    e.preventDefault();
    if (newSummary.content.trim()) {
      try {
        const userId = localStorage.getItem('userId');
        
        const response = await fetch(`${BASE_URL}/summaries/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookclub_id: id,
            user_id: userId,
            content: newSummary.content,
          }),
        });

        if (response.ok) {
          const addedSummary = await response.json();
          setSummaries([...summaries, addedSummary]);
          setNewSummary({ content: '' });
        } else {
          throw new Error('Failed to add summary');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading book club details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!club) return <div className="not-found">Book club not found</div>;

  return (
    <div className="book-club-details">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/bookclubs')}>
        ← Back to Book Clubs
      </button>

      {/* Club Header */}
      <div className="club-header">
        <div className="club-cover-container">
          <img
            src={club.cover_image || 'https://via.placeholder.com/300x450'}
            alt={`${club.name} cover`}
            className="club-cover"
          />
        </div>
        
        <div className="club-meta">
          <h1>{club.name}</h1>
          <div className={`club-status ${club.status.toLowerCase()}`}>
            {club.status}
          </div>
          <div className="club-members">
            <span className="member-count">{club.member_count} members</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="club-tabs">
        <button 
          className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
        <button 
          className={`tab-button ${activeTab === 'current-book' ? 'active' : ''}`}
          onClick={() => setActiveTab('current-book')}
        >
          Current Book
        </button>
        <button 
          className={`tab-button ${activeTab === 'summaries' ? 'active' : ''}`}
          onClick={() => setActiveTab('summaries')}
        >
          Summaries
        </button>
        {club.current_book && (
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Book Reviews
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'about' && (
          <div className="about-section">
            <h2>About This Club</h2>
            <div className="synopsis-container">
              <h3>Synopsis</h3>
              <p className="synopsis">{club.synopsis}</p>
            </div>
            
            <div className="meeting-info">
              <h3>Meeting Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Frequency:</span>
                  <span className="info-value">Weekly</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Next Meeting:</span>
                  <span className="info-value">May 15, 2023</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Format:</span>
                  <span className="info-value">Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'current-book' && club.current_book && (
          <div className="current-book-section">
            <div className="book-card">
              <div className="book-cover-container">
                <img
                  src={club.current_book.cover}
                  alt={`${club.current_book.title} cover`}
                  className="book-cover"
                />
              </div>
              
              <div className="book-details">
                <h2>{club.current_book.title}</h2>
                <p className="author">by {club.current_book.author}</p>
                
                <div className="book-description">
                  <h3>Description</h3>
                  <p>{club.current_book.description}</p>
                </div>
                
                {club.current_book.progress && (
                  <div className="reading-progress">
                    <h3>Reading Progress</h3>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${club.current_book.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {club.current_book.progress}% complete • {club.current_book.pagesRead} pages read
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summaries' && (
          <div className="summaries-section">
            <h2>Book Summaries</h2>
            
            <div className="summaries-grid">
              {summaries.length > 0 ? (
                summaries.map((summary) => (
                  <div key={summary.id} className="summary-card">
                    <div className="summary-header">
                      <span className="summary-date">
                        {new Date(summary.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="summary-content">{summary.content}</p>
                  </div>
                ))
              ) : (
                <p className="no-content">No summaries yet. Add one!</p>
              )}
            </div>
            
            <form onSubmit={handleAddSummary} className="add-summary-form">
              <h3>Add a New Summary</h3>
              <textarea
                placeholder="Share your summary of the book..."
                value={newSummary.content}
                onChange={(e) => setNewSummary({...newSummary, content: e.target.value})}
                required
                className="summary-input"
              />
              <button type="submit" className="submit-button">
                Post Summary
              </button>
            </form>
          </div>
        )}

        {activeTab === 'reviews' && club.current_book && (
          <div className="reviews-section">
            <h2>Book Reviews</h2>
            <p className="review-subtitle">Reviews for {club.current_book.title}</p>
            
            <div className="reviews-grid">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < review.rating ? 'star-filled' : 'star-empty'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-content">{review.content}</p>
                  </div>
                ))
              ) : (
                <p className="no-content">No reviews yet for this book.</p>
              )}
            </div>

            <form onSubmit={handleAddReview} className="add-review-form">
              <h3>Add Your Review</h3>
              <div className="rating-input">
                <label>Rating:</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} star{num !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Share your thoughts about the book..."
                value={newReview.content}
                onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                required
                className="review-input"
              />
              <button type="submit" className="submit-button">
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BookClubDetails;