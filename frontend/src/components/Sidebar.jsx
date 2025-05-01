import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">BookNook</h2>
      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className="sidebar-link">
          Dashboard
        </NavLink>
        <NavLink to="/admin/users" className="sidebar-link">
          Users
        </NavLink>
        <NavLink to="/admin/books" className="sidebar-link">
          Books
        </NavLink>
        <NavLink to="/admin/bookclubs" className="sidebar-link">
          Book Clubs
        </NavLink>
        <NavLink to="/admin/schedules" className="sidebar-link">
          Schedules
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
