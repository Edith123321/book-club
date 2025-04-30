import React from 'react';
import styles from '../../styles/BookClubDetails.module.css';
import booksData from '../../components/booksData';
import { FaShareAlt } from 'react-icons/fa';
import { MdJoinRight } from 'react-icons/md';
import { MdOutlineEditNote } from "react-icons/md";


const BookClubDetails = () => {
  // Select a book for the "Currently Reading" section
  const currentBook = booksData.find(book => book.id === 1); // The Midnight Library

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.clubName}>Classic Literature Club</h1>
        <div className={styles.actionButtons}>
          <button className={styles.subscribeButton} title="join club">
            <MdJoinRight className={styles.subscribeIcon} /> Join Club
          </button>
          <button className={styles.shareButton} title="Share">
            <FaShareAlt className={styles.shareIcon} /> Share
          </button>
          <button
            className={styles.editButton}
            title="Edit Book Club"
            onClick={() => window.location.href = '/edit-bookclub/1'}
          >
            <MdOutlineEditNote className={styles.editIcon} /> 
            
          </button>
        </div>
      </header>
      
      {/* New update icon button fixed at bottom center */}
      <div className={styles.updateIconContainer} title="Edit Book Club" onClick={() => window.location.href = '/edit-bookclub/1'}>
        <MdOutlineEditNote className={styles.updateIcon} />
      </div>

      <div className={styles.infoSection}>
        <p><strong>Founder:</strong> Jane Austen</p>
        <p><strong>Year Founded:</strong> January 2024</p>
        <p><strong>Members:</strong> 👥 42</p>
      </div>

      <section className={styles.aboutSection}>
        <h2>About this club</h2>
        <p>
          Welcome to the Classic Literature Club! We're dedicated to exploring timeless literary works that have shaped our culture and understanding of the human experience.
          From ancient epics to 20th-century masterpieces, we delve into the themes, characters, and historical contexts of these influential texts.
          Join us for engaging discussions, thought-provoking analyses, and a shared love for the written word. Whether you're a seasoned reader or just starting your literary journey, there's a place for you here.
          Our club meets monthly to discuss a selected book, and we also host special events such as author talks, film screenings, and writing workshops.
          We believe in the power of literature to inspire, challenge, and connect us. Together, let's explore the beauty and complexity of classic literature.
          We look forward to welcoming you to our next meeting!
        </p>
      </section>

      <div className={styles.bottomSections}>
        <section className={styles.currentlyReadingSection}>
          <h2>Currently Reading</h2>
          <div className={styles.bookCard}>
            <img src={currentBook.cover} alt={currentBook.title} className={styles.bookCover} />
            <div className={styles.bookInfo}>
              <h3 className={styles.bookTitle}>{currentBook.title}</h3>
              <p className={styles.bookAuthor}>by {currentBook.author}</p>
              <p className={styles.bookRating}>⭐⭐⭐⭐: {currentBook.rating}</p>
              <p className={styles.bookDescription}>
                A captivating novel about the infinite possibilities of life and the choices we make.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.nextMeetingSection}>
          <h2>Next Meeting</h2>
          <div className={styles.meetingDetails}>
            <span className={styles.calendarEmoji}>📅</span>
            <div className={styles.meetingInfo}>
              <p><strong>Date & Time:</strong> February 15, 2024, 6:00 PM</p>
              <p><strong>Venue:</strong> Community Library, Room 3</p>
            </div>
            <button className={styles.upcomingButton}>Upcoming</button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BookClubDetails;
