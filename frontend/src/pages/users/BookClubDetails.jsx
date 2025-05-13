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
  const [newReview, setNewReview] = useState({ content: '', rating: 5, book_id: 1 }); // Hardcoded book_id
  const [newSummary, setNewSummary] = useState({ content: '', book_id: 1 }); // Hardcoded book_id
  const [books, setBooks] = useState([]);

  const BASE_URL = 'http://127.0.0.1:5000';
  const HARDCODED_USER_ID = 1; // Hardcoded user_id

  // Fetch all club data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch club details
        const clubResponse = await fetch(`${BASE_URL}/bookclubs/${id}`);
        if (!clubResponse.ok) throw new Error('Failed to fetch club details');
        const clubData = await clubResponse.json();
        setClub(clubData);

        // Fetch club books
        const booksResponse = await fetch(`${BASE_URL}/books?club_id=${id}`);
        if (booksResponse.ok) {
          const booksData = await booksResponse.json();
          setBooks(booksData);
        }

        // Fetch summaries
        const summariesResponse = await fetch(`${BASE_URL}/summaries?bookclub_id=${id}&_expand=book&_expand=user`);
        if (summariesResponse.ok) {
          const summariesData = await summariesResponse.json();
          setSummaries(summariesData);
        }

        // Fetch reviews for the hardcoded book_id
        const reviewsResponse = await fetch(`${BASE_URL}/reviews/book/1`); // Hardcoded book_id
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

    fetchData();
  }, [id]);

  // Handle adding a new review
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.content.trim()) return;

    try {
      const response = await fetch(`${BASE_URL}/reviews/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: 114, // Hardcoded book_id
          user_id: 120, // Hardcoded user_id
          content: newReview.content,
          rating: newReview.rating,
        }),
      });

      if (response.ok) {
        const addedReview = await response.json();
        // Fetch user details for the new review
        const userResponse = await fetch(`${BASE_URL}/users/${HARDCODED_USER_ID}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          addedReview.user = userData;
        }
        setReviews([...reviews, addedReview]);
        setNewReview({ content: '', rating: 5, book_id: 1 });
      } else {
        throw new Error('Failed to add review');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle adding a new summary
  const handleAddSummary = async (e) => {
    e.preventDefault();
    if (!newSummary.content.trim()) return;

    try {
      const response = await fetch(`${BASE_URL}/summaries/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookclub_id: 120,
          
          user_id: 122, // Hardcoded user_id
          content: newSummary.content.trim(),
        }),
      });

      if (response.ok) {
        const addedSummary = await response.json();
        // Fetch book and user details for the new summary
        const [bookResponse, userResponse] = await Promise.all([
          fetch(`${BASE_URL}/books`), // Hardcoded book_id
          fetch(`${BASE_URL}/users/`)
        ]);
        
        if (bookResponse.ok) addedSummary.book = await bookResponse.json();
        if (userResponse.ok) addedSummary.user = await userResponse.json();
        
        setSummaries([...summaries, addedSummary]);
        setNewSummary({ content: '', book_id: 1 });
      } else {
        throw new Error('Failed to add summary');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading book club details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!club) return <div>Book club not found</div>;

  return (
    <div className="book-club-container">
      <button onClick={() => navigate(-1)} className="back-button">← Back</button>

      {/* Club Header with Current Book */}
      <div className="club-header-container">
        <div className="club-info-section">
          {/* <img 
            src={club.cover_image_url || 'https://via.placeholder.com/200x200'} 
            alt="Club" 
            className="club-image" 
          /> */}
          <div className="club-info">
            <h1 className="club-name">{club.name}</h1>
            <span className={`club-status ${club.status === 'Active' ? 'active' : 'inactive'}`}>
              {club.status}
            </span>
            <p className="club-members">Members: {club.member_count}</p>
          </div>
        </div>

        {club.current_book && (
          <div className="current-book-section">
            <h2>Current Book</h2>
            <div className="current-book-content">
              <img 
                src={club.current_book.cover || 'https://via.placeholder.com/150x225'} 
                alt="Book Cover" 
                className="book-cover" 
              />
              <div className="book-info">
                <h3>{club.current_book.title}</h3>
                <p className="book-author">by {club.current_book.author}</p>
                <p className="book-description">
                  {club.current_book.description || 'No description available'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        {['about', 'summaries', 'reviews'].map(tab => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'about' && (
          <div className="about-section">
            <h2>About This Club</h2>
            <p>{club.synopsis || 'No description available'}</p>
            <div className="club-meta">
              <p><strong>Created:</strong> {new Date(club.created_at).toLocaleDateString()}</p>
              <p><strong>Owner:</strong> {club.owner?.username || 'Unknown'}</p>
            </div>
          </div>
        )}

        {activeTab === 'summaries' && (
          <div className="summaries-section">
            <h2>Book Summaries</h2>
            {summaries.length > 0 ? (
              <div className="summaries-grid">
                {summaries.slice(-5).map(summary => (
                  <div key={summary.id} className="summary-card">
                    <div className="summary-header">
                      <h3>{summary.book?.title}</h3>
                      <span className="summary-date">
                        {new Date(summary.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="summary-content">{summary.content}</p>
                    <p className="summary-author">By {summary.user?.username}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-content">No summaries yet. Be the first to add one!</p>
            )}

            <form onSubmit={handleAddSummary} className="summary-form">
              <h3>Add a Summary</h3>
              <textarea
                value={newSummary.content}
                onChange={e => setNewSummary({ ...newSummary, content: e.target.value })}
                placeholder="Write your summary..."
                rows="4"
                required
              />
              <button type="submit" className="submit-button">Submit Summary</button>
            </form>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <h2>Book Reviews</h2>
            <div className="reviews-grid">
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="reviewer">{review.user?.username }</span>
                      <div className="rating">
                        {Array(5).fill().map((_, i) => (
                          <span
                            key={i}
                            className={`star ${i < review.rating ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                    <p className="review-content">{review.content}</p>
                  </div>
                ))
              ) : (
                <p className="no-content">No reviews yet. Be the first to share your thoughts!</p>
              )}
            </div>

            <form onSubmit={handleAddReview} className="review-form">
              <h3>Add Your Review</h3>
              <div className="form-group">
                <label>Rating:</label>
                <select
                  value={newReview.rating}
                  onChange={e => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                >
                  {[5,4,3,2,1].map(num => (
                    <option key={num} value={num}>
                      {num} ★
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={newReview.content}
                onChange={e => setNewReview({...newReview, content: e.target.value})}
                placeholder="Share your thoughts about this book..."
                rows="5"
                required
              />
              <button type="submit" className="submit-button">
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BookClubDetails;

