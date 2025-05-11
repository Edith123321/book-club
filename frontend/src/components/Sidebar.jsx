import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard" },
    { path: "/admin/users", label: "Users" },
    { path: "/admin/books", label: "Books" },
    { path: "/admin/bookclubs", label: "Book Clubs" },
  ];

  return (
    <>
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay that appears when sidebar is open */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={closeSidebar}
        />
      )}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <h2 className="sidebar-title">BookNook</h2>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path} 
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;