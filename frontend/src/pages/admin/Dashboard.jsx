import React from 'react';
import { FiUsers, FiBook, FiCalendar, FiBookmark } from 'react-icons/fi';
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

      <div className="dashboard-sections">
        <div className="recent-activities">
          <h3>Recent Activities</h3>
          <div className="activity-list">
            {recentActivities.map(activity => (
              <div className="activity-item" key={activity.id}>
                <div className="activity-details">
                  <span className="activity-action">{activity.action}</span>
                  <span className="activity-user">by {activity.user}</span>
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-links">
          <h3>Quick Actions</h3>
          <div className="links-grid">
            <a href="/admin/users/add" className="quick-link">
              <FiUsers /> Add New User
            </a>
            <a href="/admin/books/add" className="quick-link">
              <FiBook /> Add New Book
            </a>
            <a href="/admin/bookclubs/add" className="quick-link">
              <FiBookmark /> Create Club
            </a>
            <a href="/admin/schedules/add" className="quick-link">
              <FiCalendar /> Schedule Event
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;