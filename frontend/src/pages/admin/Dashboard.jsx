import React from 'react';
import { FiUsers, FiBook, FiCalendar, FiBookmark, FiFileText, FiBarChart2 } from 'react-icons/fi';
import '../../styles/AdminPages.css';

const Dashboard = () => {
  const stats = [
    { title: "Total Users", value: 1245, icon: <FiUsers />, color: "#6A1B9A" },
    { title: "Total Books", value: 856, icon: <FiBook />, color: "#4CAF50" },
    { title: "Active Clubs", value: 42, icon: <FiBookmark />, color: "#2196F3" },
    { title: "Upcoming Events", value: 15, icon: <FiCalendar />, color: "#FFC107" }
  ];

  const recentActivities = [
    { id: 1, action: "New book added", user: "Admin", time: "10 mins ago" },
    { id: 2, action: "User registered", user: "John Doe", time: "25 mins ago" },
    { id: 3, action: "Book club created", user: "Jane Smith", time: "1 hour ago" },
    { id: 4, action: "Event scheduled", user: "Admin", time: "2 hours ago" }
  ];

  // Sample data for book summaries
  const bookSummaries = [
    { 
      bookTitle: "The Midnight Library", 
      clubName: "Fantasy Readers", 
      summary: "Members explored the concept of parallel lives and regrets...",
      rating: 4.2,
      date: "2023-06-15"
    },
    { 
      bookTitle: "Atomic Habits", 
      clubName: "Self-Improvement Group", 
      summary: "Discussion focused on habit formation and small changes...",
      rating: 4.5,
      date: "2023-05-28"
    },
    { 
      bookTitle: "Dune", 
      clubName: "Sci-Fi Enthusiasts", 
      summary: "Deep dive into world-building and political themes...",
      rating: 4.7,
      date: "2023-04-10"
    }
  ];

  // Sample data for book analytics
  const bookAnalytics = {
    mostReadBooks: [
      { title: "The Midnight Library", readCount: 18 },
      { title: "Atomic Habits", readCount: 15 },
      { title: "Where the Crawdads Sing", readCount: 12 }
    ],
    averageRatings: [
      { genre: "Fiction", rating: 4.3 },
      { genre: "Self-Help", rating: 4.1 },
      { genre: "Sci-Fi", rating: 4.5 }
    ],
    readingTrends: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      data: [45, 52, 60, 58, 65, 72]
    }
  };

  return (
    <div className="admin-page">
      <h2>Dashboard Overview</h2>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
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
          <h3><FiFileText /> Book Club Summaries</h3>
          <a href="/admin/book-summaries" className="view-all">View All</a>
        </div>
        <div className="summaries-grid">
          {bookSummaries.map((summary, index) => (
            <div className="summary-card" key={index}>
              <div className="summary-header">
                <h4>{summary.bookTitle}</h4>
                <span className="club-tag">{summary.clubName}</span>
              </div>
              <p className="summary-text">{summary.summary}</p>
              <div className="summary-footer">
                <div className="rating">
                  <span className="stars">{"★".repeat(Math.floor(summary.rating))}</span>
                  <span>{summary.rating.toFixed(1)}</span>
                </div>
                <div className="date">{summary.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Book Analytics Section */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3><FiBarChart2 /> Book Analytics</h3>
          <a href="/admin/book-analytics" className="view-all">View Details</a>
        </div>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>Most Read Books</h4>
            <ul className="book-list">
              {bookAnalytics.mostReadBooks.map((book, index) => (
                <li key={index}>
                  <span className="book-title">{book.title}</span>
                  <span className="read-count">{book.readCount} reads</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="analytics-card">
            <h4>Average Ratings by Genre</h4>
            <ul className="rating-list">
              {bookAnalytics.averageRatings.map((rating, index) => (
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
              ))}
            </ul>
          </div>
          <div className="analytics-card">
            <h4>Monthly Reading Trends</h4>
            <div className="trend-chart">
              {/* This would be replaced with an actual chart component in a real app */}
              <div className="chart-placeholder">
                <div className="chart-bars">
                  {bookAnalytics.readingTrends.data.map((value, index) => (
                    <div 
                      key={index} 
                      className="chart-bar" 
                      style={{ height: `${(value / 100) * 100}%` }}
                      title={`${bookAnalytics.readingTrends.labels[index]}: ${value}`}
                    ></div>
                  ))}
                </div>
                <div className="chart-labels">
                  {bookAnalytics.readingTrends.labels.map((label, index) => (
                    <span key={index}>{label}</span>
                  ))}
                </div>
              </div>
              <div className="chart-legend">Books read per month</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;