import React from "react";
import "../styles/Navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-purple">Book</span>
        <span className="logo-yellow">Nook</span>
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
        <button className="navbar-login">
         < Link to = '/log-in' className="navbar-login-link">Log In</Link>
          </button>
      </div>
    </nav>
  );
};

export default Navbar;