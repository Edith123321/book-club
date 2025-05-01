import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import styles from '../../styles/BookClubDetails.module.css';
import booksData from '../../components/booksData';
import { FaShareAlt, FaBookReader } from 'react-icons/fa';
import { MdJoinRight } from 'react-icons/md';
import { MdOutlineEditNote } from "react-icons/md";

const mockClubsData = [

  {
    id: '1',
    name: 'Classic Literature Club',
    founder: 'Jane Austen',
    yearFounded: 'January 2024',
    members: 42,
    about: `Welcome to the Classic Literature Club! We're dedicated to exploring timeless literary works that have shaped our culture and understanding of the human experience.
    From ancient epics to 20th-century masterpieces, we delve into the themes, characters, and historical contexts of these influential texts.
    Join us for engaging discussions, thought-provoking analyses, and a shared love for the written word. Whether you're a seasoned reader or just starting your literary journey, there's a place for you here.
    Our club meets monthly to discuss a selected book, and we also host special events such as author talks, film screenings, and writing workshops.
    We believe in the power of literature to inspire, challenge, and connect us. Together, let's explore the beauty and complexity of classic literature.
    We look forward to welcoming you to our next meeting!`,
    nextMeeting: {
      dateTime: 'February 15, 2024, 6:00 PM',
      venue: 'Community Library, Room 3',
    }
  },
  {
    id: '2',
    name: 'Modern Fiction Club',
    founder: 'George Orwell',
    yearFounded: 'March 2023',
    members: 30,
    about: `The Modern Fiction Club focuses on contemporary novels and stories that reflect current societal issues and trends.
    We explore diverse voices and narratives that challenge traditional storytelling.
    Join us for lively discussions and meetups.`,
    nextMeeting: {
      dateTime: 'March 10, 2024, 7:00 PM',
      venue: 'Downtown Bookstore, Room 1',
    }
  }
];

const BookClubDetails = () => {
  
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Fetch club details by id from mock data
    const foundClub = mockClubsData.find(c => c.id === id) || mockClubsData[0];
    setClub(foundClub);
    setComments([]); // Reset comments when club changes (could be fetched from backend)
    setNewComment('');
  }, [id]);

  // Select a book for the "Currently Reading" section
  const currentBook = booksData.find(book => book.id === 1); // The Midnight Library

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    setComments(prev => [...prev, { id: Date.now(), text: newComment.trim() }]);
    setNewComment('');
  };

  if (!club) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <header className={styles.header}>
        <h1><FaBookReader className={styles.iconBlue} /> </h1>
          <h1 className={styles.clubName}>{club.name}</h1>
          <div className={styles.actionButtons}>
            <button className={styles.subscribeButton} title="join club">
              <MdJoinRight className={styles.subscribeIcon} /> Join Club
            </button>
            <button className={styles.shareButton} title="Share">
              <FaShareAlt className={styles.shareIcon} /> Share
            </button>
            <button
              className={styles.editButton}
              title="Update Book Club"
              onClick={() => window.location.href = `/Edit-bookclub/${club.id}`}
            >
              <MdOutlineEditNote className={styles.editIcon} />
            </button>
          </div>
        </header>

        <div className={styles.infoSection}>
          <p><FaBookReader className={styles.iconBlue} /> <strong>Founder:</strong> {club.founder}</p>
          <p><FaBookReader className={styles.iconBlue} /> <strong>Year Founded:</strong> {club.yearFounded}</p>
          <p><FaBookReader className={styles.iconBlue} /> <strong>Members:</strong> 👥 {club.members}</p>
        </div>

        <section className={styles.aboutSection}>
          <h2>About this club</h2>
          <p>{club.about}</p>
        </section>

        <div className={styles.bottomSections}>
          <section className={styles.currentlyReadingSection}>
            <h2> Currently Reading</h2>
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
            <div className={styles.readingProgress}>
              <h5>Club Reading Progress</h5>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarLabel}></div>
                  <span className={styles.progressLabel}>50%</span>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '50%' }}></div>
                </div>
                <span className={styles.chapterText}>Chapter 15 of 30</span>
              </div>
            </div>
          </section>

          <section className={styles.nextMeetingSection}>
            <h2>Next Meeting</h2>
            <div className={styles.meetingDetails}>
              <span className={styles.calendarEmoji}>📅</span>
              <div className={styles.meetingInfo}>
                <p><strong>Date & Time:</strong> {club.nextMeeting.dateTime}</p>
                <p><strong>Venue:</strong> {club.nextMeeting.venue}</p>
              </div>
              <button className={styles.upcomingButton}>Upcoming</button>
            </div>
          </section>

          <section className={styles.commentsSection}>
            <h2>Rate us⭐⭐⭐</h2>
            <form onSubmit={handleAddComment} className={styles.commentForm}>
              <textarea
                className={styles.commentInput}
                placeholder="Add your review here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <button type="submit" className={styles.commentSubmitButton}>Add Review</button>
            </form>
            <div className={styles.commentsList}>
              {comments.length === 0 && <p>No comments yet.</p>}
              {comments.map(comment => (
                <div key={comment.id} className={styles.commentItem}>
                  {comment.text}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default BookClubDetails;
