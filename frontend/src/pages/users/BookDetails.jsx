import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import booksData from '../../components/booksData';
import styles from '../../styles/BookClubDetails.module.css';

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
    <div className={styles.bookDetailsContainer}>
      <h1>{book.title}</h1>
      <h3>By {book.author}</h3>
      <img src={book.cover} alt={book.title} className={styles.bookCover} />
      <section className={styles.section}>
        <h2>Synopsis</h2>
        <p>{book.description}</p>
      </section>
      <section className={styles.section}>
        <h2>Founder</h2>
        <p>{book.founder}</p>
      </section>
      <section className={styles.section}>
        <h2>Book Rating</h2>
        <p>{book.rating} / 5</p>
      </section>
      <section className={styles.section}>
        <h2>Rating Review</h2>
        <p>{book.ratingReview}</p>
      </section>
    </div>
  );
};

export default BookDetails;
