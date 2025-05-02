import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import booksData from '../../components/booksData';
import styles from '../../styles/BookDetails.module.css';
import commonStyles from '../../styles/common.module.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const BookDetails = () => {
  const { id } = useParams();
  const bookId = parseInt(id, 10);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching delay
    setLoading(true);
    const foundBook = booksData.find((b) => b.id === bookId);
    setBook(foundBook);
    setLoading(false);
  }, [bookId]);

  if (loading) {
    return <div>Loading book details...</div>;
  }

  if (!book) {
    return <div>Sorry, the book you are looking for was not found.</div>;
  }

  return (
    <div>
      <Navbar />
      <button
        className={commonStyles.blueButton}
        onClick={() => alert('Read Book button clicked')}
        aria-label="Read Book"
      >
        Read Book
      </button>
      <div className={styles.bookDetailsContainer}>
        <div className={styles.topMiddle}>
          <section className={styles.section}>
          <h1 className={styles.bookTitle}>{book.title}</h1>
          <h3 className={styles.bookFounder}>By:{book.founder}</h3>

          </section>
         
        </div>
        <div className={styles.mainContent}>
          <div className={styles.leftSide}>
            <img src={book.cover} alt={book.title} className={styles.bookCover} />
          </div>
          <div className={styles.middleSide}>
            <section className={styles.section}>
              <h2>Synopsis</h2>
              <p>{book.description}</p>
            </section>
          </div>
          {/* Removed rating sections from rightSide */}

        </div>
        <div className={styles.bottomSection}>
          <h2>Previous Reviews</h2>

          <div className={styles.ratingBottomLeft}>
            <section className={styles.section}>
              <h2>Book Rating</h2>
              <p>{book.rating} / 5⭐⭐⭐</p>
            </section>
            <div className={styles.ratingBottomLeft}></div>
            <section className={styles.section}>
              
              <p>{book.ratingReview}</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookDetails;
