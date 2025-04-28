import React from 'react'
import booksData from './booksData';

const BooksSection = () => {
    return (
        <div className="book-list">
          {booksData.slice(0,3).map(book => (
            <div key={book.id} className="book-card">
              <img src={book.cover} alt={book.title} />
              <h3>{book.title}</h3>
              <p>by {book.author}</p>
              <p>Rating: {book.rating}/5</p>
              <div className="genres">
                {book.genres.map(genre => (
                  <span key={genre}>{genre}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
}

export default BooksSection
