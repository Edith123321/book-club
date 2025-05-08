import React, { useState, useEffect, useRef } from "react";
import "../styles/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle, FaSignOutAlt, FaCog, FaPen } from "react-icons/fa";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/log-in");
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" className="logo-link">
          <span className="logo-purple">Book</span>
          <span className="logo-yellow">Nook</span>
        </Link>
      </div>
      
      <ul className="navbar-links">
        <li className="nav-item">
          <Link to="/" className="nav-link">Home</Link>
        </li>
        <li className="nav-item">
          <Link to="/bookclubs" className="nav-link">Book Clubs</Link>
        </li>
        <li className="nav-item">
          <Link to="/books" className="nav-link">Books</Link>
        </li>
      </ul>
      
      <div className="navbar-actions">
        {user ? (
          <div className="user-menu-container" ref={dropdownRef}>
            <div 
              className="user-avatar" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <FaUserCircle className="avatar-icon" />
              <span className="username">{user.username || user.email}</span>
            </div>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link 
                  to="/profile" 
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaPen className="dropdown-icon" />
                  <span>Update Profile</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaCog className="dropdown-icon" />
                  <span>Settings</span>
                </Link>
                <button 
                  className="dropdown-item logout-button"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="dropdown-icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="navbar-login">
            <Link to="/log-in" className="navbar-login-link">Log In</Link>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;