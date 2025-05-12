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
  const [newReview, setNewReview] = useState({ content: '', rating: 5, book_id: null });
  const [newSummary, setNewSummary] = useState({ content: '', book_id: null });
  const [books, setBooks] = useState([]);

  const BASE_URL = 'http://127.0.0.1:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const clubResponse = await fetch(`${BASE_URL}/bookclubs/${id}`);
        if (!clubResponse.ok) throw new Error('Failed to fetch club details');
        const clubData = await clubResponse.json();
        setClub(clubData);

        const booksResponse = await fetch(`${BASE_URL}/books?club_id=${id}`);
        if (booksResponse.ok) {
          const booksData = await booksResponse.json();
          setBooks(booksData);
        }

        const summariesResponse = await fetch(`${BASE_URL}/summaries?bookclub_id=${id}&_expand=book&_expand=user`);
        if (summariesResponse.ok) {
          const summariesData = await summariesResponse.json();
          setSummaries(summariesData);
        }

        if (clubData.current_book?.id) {
          const reviewsResponse = await fetch(`${BASE_URL}/reviews?book_id=${clubData.current_book.id}&_expand=book&_expand=user`);
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
        // Debug localStorage
        console.log('All localStorage items:');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          console.log(`${key}: ${localStorage.getItem(key)}`);
        }
        
        // Get userId from localStorage with verbose debugging
        let userId = localStorage.getItem('userId');
        console.log('Raw userId from localStorage:', userId, typeof userId);
        
        // Check the ACTUAL key being used for user ID (it might be different)
        // Common variations to check
        const possibleKeys = ['userId', 'user_id', 'id', 'userID', 'user', 'uid'];
        let foundUserId = null;
        
        for (const key of possibleKeys) {
          const value = localStorage.getItem(key);
          if (value) {
            console.log(`Found potential user ID in key "${key}": ${value}`);
            foundUserId = foundUserId || value;
          }
        }
        
        // If we found a user ID in a different key, use that
        if (!userId && foundUserId) {
          console.log(`Using user ID from alternative key: ${foundUserId}`);
          userId = foundUserId;
        }
        
        // If still no user ID, look for any user-related object that might contain the ID
        if (!userId) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            
            // Try to parse as JSON and look for user ID
            try {
              const parsedValue = JSON.parse(value);
              if (parsedValue && (parsedValue.id || parsedValue.userId || parsedValue.user_id)) {
                console.log(`Found user ID in JSON object at key "${key}":`, parsedValue);
                userId = parsedValue.id || parsedValue.userId || parsedValue.user_id;
                break;
              }
            } catch (e) {
              // Not valid JSON, continue
            }
          }
        }
        
        // Check if userId exists at all after our best efforts
        if (!userId) {
          console.warn('No userId found in localStorage after extensive search');
          setError('You must be logged in to add a summary. No user ID found.');
          return;
        }
        
        console.log('Final userId being used:', userId);
        
        const bookclubId = id;
        
        // Log the request body for debugging
        const requestBody = {
          bookclub_id: bookclubId,
          user_id: parseInt(userId, 10) || userId, // Try to convert to number but fall back to original
          content: newSummary.content.trim(),
        };
        console.log('Sending request body:', requestBody);
  
        const response = await fetch(`${BASE_URL}/summaries/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
  
        console.log('Response status:', response.status);
        let responseData;
        
        try {
          responseData = await response.json();
          console.log('Response data:', responseData);
        } catch (err) {
          console.error('Failed to parse response as JSON:', err);
        }
  
        if (response.ok) {
          setSummaries([...summaries, responseData]);
          setNewSummary({ content: '' });
          setError(''); // Clear any previous errors
        } else {
          throw new Error(responseData?.error || 'Failed to add summary');
        }
      } catch (err) {
        console.error("Add Summary Error:", err);
        setError(err.message);
      }
    }
  };
  

  if (loading) return <div className="loading">Loading book club details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!club) return <div className="not-found">Book club not found</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">← Back</button>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <img src={club.current_book?.cover || 'https://via.placeholder.com/300x450'} alt="Cover" className="w-full md:w-1/3 rounded shadow" />

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
          <p className={`inline-block px-3 py-1 text-sm rounded-full ${club.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{club.status}</p>
          <p className="mt-2 text-gray-600">Members: {club.member_count}</p>
        </div>
      </div>

      <div className="flex gap-4 border-b mb-6">
        {['about', 'current-book', 'summaries', 'reviews'].map(tab => (
          <button
            key={tab}
            className={`py-2 px-4 ${activeTab === tab ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-600'}`}
            onClick={() => setActiveTab(tab)}
            disabled={tab === 'current-book' && !club.current_book}
          >
            {tab.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {activeTab === 'about' && (
        <div>
          <h2 className="text-2xl font-semibold mb-2">About This Club</h2>
          <p className="mb-4">{club.synopsis || 'No description available'}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p><strong>Created:</strong> {new Date(club.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Owner:</strong> {club.owner?.username || 'Unknown'}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'current-book' && club.current_book && (
        <div className="flex flex-col md:flex-row gap-6">
          <img src={club.current_book.cover || 'https://via.placeholder.com/200x300'} alt="Book Cover" className="w-48 rounded shadow" />
          <div>
            <h2 className="text-2xl font-semibold mb-1">{club.current_book.title}</h2>
            <p className="mb-3 text-gray-600">by {club.current_book.author}</p>
            <p>{club.current_book.description}</p>
          </div>
        </div>
      )}

      {activeTab === 'summaries' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Book Summaries</h2>
          {summaries.length ? summaries.slice(0,3).map(summary => (
            <div key={summary.id} className="mb-4 p-4 border rounded shadow-sm">
              <div className="flex justify-between mb-2">
                <h3 className="text-lg font-semibold">{summary.book?.title}</h3>
                <span className="text-sm text-gray-500">{new Date(summary.created_at).toLocaleDateString()}</span>
              </div>
              <p className="mb-2">{summary.content}</p>
              <p className="text-sm text-gray-600">By {summary.user?.username || 'Anonymous'}</p>
            </div>
          )) : <p>No summaries yet. Be the first to add one!</p>}

          <form onSubmit={handleAddSummary} className="mt-6 p-4 border rounded">
            <h3 className="text-lg font-semibold mb-2">Add a Summary</h3>
            <select value={newSummary.book_id || ''} onChange={e => setNewSummary({ ...newSummary, book_id: e.target.value })} className="w-full p-2 border mb-2 rounded">
              <option value="" disabled>Select Book</option>
              {books.map(book => <option key={book.id} value={book.id}>{book.title}</option>)}
            </select>
            <textarea value={newSummary.content} onChange={e => setNewSummary({ ...newSummary, content: e.target.value })} className="w-full p-2 border mb-2 rounded" rows="3" placeholder="Write your summary..."></textarea>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit Summary</button>
          </form>
        </div>
      )}

      {/* Add similar section for reviews with better UI */}

      <Footer />
    </div>
  );
};

export default BookClubDetails;
