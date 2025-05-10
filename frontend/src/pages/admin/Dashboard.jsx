import React, { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiCalendar, FiBookmark, FiFileText, FiBarChart2 } from 'react-icons/fi';
import '../../styles/AdminPages.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    activeClubs: 0,
    upcomingEvents: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [bookSummaries, setBookSummaries] = useState([]);
  const [bookAnalytics, setBookAnalytics] = useState({
    mostReadBooks: [],
    averageRatings: [],
    readingTrends: { labels: [], data: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookClubs, setBookClubs] = useState([]);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all required data
        const [bookClubsRes, booksRes, usersRes, summariesRes, reviewsRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/bookclubs/'),
          fetch('http://127.0.0.1:5000/books'),
          fetch('http://127.0.0.1:5000/users'),
          fetch('http://127.0.0.1:5000/summaries'),
          fetch('http://127.0.0.1:5000/reviews')
        ]);

        // Check for errors
        if (!bookClubsRes.ok) throw new Error('Failed to fetch book clubs');
        if (!booksRes.ok) throw new Error('Failed to fetch books');
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        if (!summariesRes.ok) throw new Error('Failed to fetch summaries');
        if (!reviewsRes.ok) throw new Error('Failed to fetch reviews');

        // Parse responses
        const [bookClubsData, booksData, usersData, summariesData, reviewsData] = await Promise.all([
          bookClubsRes.json(),
          booksRes.json(),
          usersRes.json(),
          summariesRes.json(),
          reviewsRes.json()
        ]);

        // Process data from endpoints
        const bookClubs = Array.isArray(bookClubsData) ? bookClubsData : bookClubsData.bookclubs || [];
        const books = Array.isArray(booksData) ? booksData : booksData.books || [];
        const users = Array.isArray(usersData) ? usersData : usersData.users || [];
        const summaries = Array.isArray(summariesData) ? summariesData : summariesData.summaries || [];
        const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData.reviews || [];

        // Calculate statistics
        const activeClubs = bookClubs.length;

        // Get top 3 most reviewed books
        const bookReviewCounts = {};
        reviews.forEach(review => {
          bookReviewCounts[review.book_id] = (bookReviewCounts[review.book_id] || 0) + 1;
        });

        const mostReadBooks = Object.entries(bookReviewCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([bookId, count]) => {
            const book = books.find(b => b.id === bookId) || {};
            return {
              title: book.title || 'Unknown Book',
              read_count: count
            };
          });

        // Calculate average ratings by genre
        const genreRatings = {};
        reviews.forEach(review => {
          const book = books.find(b => b.id === review.book_id);
          if (book && book.genre) {
            if (!genreRatings[book.genre]) {
              genreRatings[book.genre] = { total: 0, count: 0 };
            }
            genreRatings[book.genre].total += review.rating;
            genreRatings[book.genre].count += 1;
          }
        });

        const averageRatings = Object.entries(genreRatings).map(([genre, data]) => ({
          genre,
          rating: data.total / data.count
        }));

        // Generate reading trends (last 6 months)
        const now = new Date();
        const monthLabels = [];
        const monthCounts = [];

        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          monthLabels.push(date.toLocaleString('default', { month: 'short' }));

          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const count = reviews.filter(review => {
            const reviewDate = new Date(review.created_at);
            return reviewDate >= monthStart && reviewDate <= monthEnd;
          }).length;

          monthCounts.push(count);
        }

        // Update state with calculated data
        setStats({
          totalUsers: users.length,
          totalBooks: books.length,
          activeClubs,
          upcomingEvents: 0 // You'll need to fetch events separately or calculate from book clubs
        });

        setRecentActivities(generateRecentActivities(bookClubs, books, users, summaries, reviews));
        setBookSummaries(summaries.slice(0, 3));
        setBookAnalytics({
          mostReadBooks,
          averageRatings,
          readingTrends: {
            labels: monthLabels,
            data: monthCounts
          }
        });

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to generate recent activities
  const generateRecentActivities = (bookClubs, books, users, summaries, reviews) => {
    const activities = [];

    // Get recent book clubs (limit 2)
    const recentClubs = [...bookClubs]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);

    recentClubs.forEach(club => {
      const owner = users.find(u => u.id === club.owner_id);
      activities.push({
        id: `club-${club.id}`,
        action: "New book club created",
        user: owner?.username || 'Unknown',
        time: formatTimeAgo(club.created_at)
      });
    });

    // Get recent reviews (limit 2)
    const recentReviews = [...reviews]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);

    recentReviews.forEach(review => {
      const book = books.find(b => b.id === review.book_id);
      const user = users.find(u => u.id === review.user_id);
      activities.push({
        id: `review-${review.id}`,
        action: `New review for ${book?.title || 'book'}`,
        user: user?.username || 'Unknown',
        time: formatTimeAgo(review.created_at)
      });
    });

    return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4);
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Format stats for display
  const displayStats = [
    { title: "Total Users", value: stats.totalUsers, icon: <FiUsers />, color: "#6A1B9A" },
    { title: "Total Books", value: stats.totalBooks, icon: <FiBook />, color: "#4CAF50" },
    { title: "Active Clubs", value: stats.activeClubs, icon: <FiBookmark />, color: "#2196F3" },
    { title: "Upcoming Events", value: stats.upcomingEvents, icon: <FiCalendar />, color: "#FFC107" }
  ];

  if (loading) {
    return <div className="admin-page loading">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="admin-page error">
        <p>Error loading dashboard: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2>Dashboard Overview</h2>

      <div className="stats-grid">
        {displayStats.map((stat, index) => (
          <div className="stat-card" key={index} style={{ borderLeft: `4px solid ${stat.color}` }}>
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3><FiFileText /> Recent Activities</h3>
          <a href="/admin/activities" className="view-all">View All</a>
        </div>
        <div className="activities-list">
          {recentActivities.length > 0 ? (
            recentActivities.map(activity => (
              <div className="activity-item" key={activity.id}>
                <div className="activity-action">{activity.action}</div>
                <div className="activity-meta">
                  <span className="activity-user">{activity.user}</span>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No recent activities found</p>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3><FiFileText /> Book Club Summaries</h3>
          <a href="/admin/book-summaries" className="view-all">View All</a>
        </div>
        <div className="summaries-grid">
          {bookSummaries.length > 0 ? (
            bookSummaries.slice(0, 3).map((summary, index) => {
              const bookClub = Array.isArray(bookClubs)
                ? bookClubs.find(bc => bc.id === summary?.club_id) || {}
                : {};

              return (
                <div className="summary-card" key={index}>
                  <div className="summary-header">
                    <h4>{summary.book_title}</h4>
                    <span className="club-tag">{bookClub.name || 'Unknown Club'}</span>
                  </div>
                  <p className="summary-text">{summary.content}</p>
                  <div className="summary-footer">
                    <div className="rating">
                      <span className="stars">{"★".repeat(Math.floor(summary.rating || 0))}</span>
                      <span>{(summary.rating || 0).toFixed(1)}</span>
                    </div>
                    <div className="date">{formatTimeAgo(summary.created_at)}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-data">No book summaries available</p>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h3><FiBarChart2 /> Book Analytics</h3>
          <a href="/admin/book-analytics" className="view-all">View Details</a>
        </div>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Most Read Books</h4>
            <ul className="book-list">
              {bookAnalytics.mostReadBooks.length > 0 ? (
                bookAnalytics.mostReadBooks.map((book, index) => (
                  <li key={index}>
                    <span className="book-title">{book.title}</span>
                    <span className="read-count">{book.read_count} reads</span>
                  </li>
                ))
              ) : (
                <li className="no-data">No data available</li>
              )}
            </ul>
          </div>

          <div className="analytics-card">
            <h4>Average Ratings by Genre</h4>
            <ul className="rating-list">
              {bookAnalytics.averageRatings.length > 0 ? (
                bookAnalytics.averageRatings.map((rating, index) => (
                  <li key={index}>
                    <span className="genre">{rating.genre}</span>
                    <div className="rating-bar">
                      <div
                        className="rating-fill"
                        style={{ width: `${(rating.rating / 5) * 100}%` }}
                      ></div>
                      <span className="rating-value">{rating.rating.toFixed(1)}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="no-data">No rating data available</li>
              )}
            </ul>
          </div>

          <div className="analytics-card">
            <h4>Monthly Reading Trends</h4>
            <div className="trend-chart">
              {bookAnalytics.readingTrends.labels.length > 0 ? (
                <>
                  <div className="chart-bars">
                    {bookAnalytics.readingTrends.data.map((value, index) => (
                      <div
                        key={index}
                        className="chart-bar"
                        style={{
                          height: `${(value / Math.max(...bookAnalytics.readingTrends.data, 1)) * 100}%`
                        }}
                        title={`${bookAnalytics.readingTrends.labels[index]}: ${value}`}
                      ></div>
                    ))}
                  </div>
                  <div className="chart-labels">
                    {bookAnalytics.readingTrends.labels.map((label, index) => (
                      <span key={index}>{label}</span>
                    ))}
                  </div>
                  <div className="chart-legend">Books read per month</div>
                </>
              ) : (
                <p className="no-data">No trend data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;