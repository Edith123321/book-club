import React from 'react';
import booksData from './booksData';
import '../styles/BooksSection.css';
import { Link, useNavigate } from 'react-router-dom';

const BooksSection = () => {
    const navigate = useNavigate()

    const handleMoreBooks=()=>{
        navigate('/books')

    }
    return (
        <div className='books-section'>
            <div className="section-header">
                <h1>Trending Books</h1>
                <p>Most discussed books this month</p>
            </div>
            <div className="book-list">
                {booksData.slice(0, 3).map(book => (
                    <Link to = '/bookclub/:id' className='book-list-link'>
                    <div key={book.id} className="book-card">
                        <div className="book-cover-container">
                            <img src={book.cover} alt={book.title} className="book-cover" />
                        </div>
                        <div className="book-details">
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">by {book.author}</p>
                            <div className="genres">
                                {book.genres.slice(0, 2).map(genre => (
                                    <span key={genre} className="genre-tag">{genre}</span>
                                ))}
                                {book.genres.length > 2 && (
                                    <span className="genre-tag">+{book.genres.length - 2}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    </Link>
                ))}
            </div>
            <button onClick={handleMoreBooks} className="view-all-btn">View All Trending Books</button>
        </div>
    );
};

export default BooksSection;