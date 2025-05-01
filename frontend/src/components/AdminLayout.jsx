import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/admin/users', icon: 'fas fa-users', label: 'Users' },
    { path: '/admin/books', icon: 'fas fa-book', label: 'Books' },
    { path: '/admin/bookclubs', icon: 'fas fa-users-between-lines', label: 'Book Clubs' },
    { path: '/admin/schedules', icon: 'fas fa-calendar-alt', label: 'Schedules' },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>BookNook Admin</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`fas ${sidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <i className={item.icon}></i>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`admin-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="admin-header">
          <div className="header-left">
            <button 
              className="mobile-sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <h3>Admin Panel</h3>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Admin" />
              <span>Admin</span>
            </div>
            <button className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> {sidebarOpen && 'Logout'}
            </button>
          </div>
        </header>
        
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;