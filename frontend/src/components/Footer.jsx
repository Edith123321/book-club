import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <span className="logo-text">BookNook</span>
          <p className="footer-slogan">Where readers connect</p>
        </div>
        
        <div className="footer-links">
          <div className="link-column">
            <h4>Explore</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/books">Books</a></li>
              <li><a href="/clubs">Book Clubs</a></li>
              <li><a href="/discussions">Discussions</a></li>
            </ul>
          </div>
          
          <div className="link-column">
            <h4>Community</h4>
            <ul>
              <li><a href="/events">Events</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/recommendations">Recommendations</a></li>
            </ul>
          </div>
          
          <div className="link-column">
            <h4>Company</h4>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="social-icons">
          <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
          <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          <a href="#" aria-label="Goodreads"><i className="fab fa-goodreads-g"></i></a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} BookNook. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;