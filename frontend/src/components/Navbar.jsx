import React, { useState, useEffect, useRef } from "react";
import "../styles/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaSignOutAlt, FaCog, FaPen, FaSignInAlt } from "react-icons/fa";
import md5 from 'md5';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Check for logged in user on component mount and when auth changes
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Listen for auth changes from other components
    const handleAuthChange = () => {
      const updatedUser = localStorage.getItem('userData');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

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
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsDropdownOpen(false);
    window.dispatchEvent(new Event('authChange'));
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
              className="user-icon-wrapper"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-haspopup="true"
              aria-expanded={isDropdownOpen}
            >
              <FaUserCircle className="user-profile-icon" size={28} />
            </div>
            
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <Link 
                  to={`/profile/${user.id}`} 
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUserCircle className="dropdown-icon" />
                  <span>My Profile</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaCog className="dropdown-icon" />
                  <span>Settings</span>
                </Link>
                <Link 
                  to="/profile/edit" 
                  className="dropdown-item"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaPen className="dropdown-icon" />
                  <span>Edit Profile</span>
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
          <Link to="/log-in" className="navbar-login">
            <FaSignInAlt className="login-icon" />
            <span>Log In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;