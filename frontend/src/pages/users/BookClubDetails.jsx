import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookClubsData from '../../components/bookClubsData';
import Footer from '../../components/Footer';
import '../../styles/BookClubDetails.css'

const BookClubDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [discussions, setDiscussions] = useState([]);

  const club = bookClubsData.find((club) => club.id === parseInt(id));

  if (!club) {
    return <div className="not-found">Book club not found</div>;
  }

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const comment = {
        user: 'You',
        comment: newComment,
        timestamp: 'Just now',
        likes: 0,
      };
      setDiscussions([...discussions, comment]);
      setNewComment('');
    }
  };

  return (
    <div className="book-club-details">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/bookclubs')}>
        ← Back to Book Clubs
      </button>

      <div className="club-header">
        <div className="club-cover-container">
          <img
            src={club.clubCover}
            alt={`${club.bookClubName} cover`}
            className="club-cover"
          />
          <div className="club-meta">
            <h1>{club.bookClubName}</h1>
            <div className="genres">
              {club.genres.map((genre, index) => (
                <span key={index} className="genre-tag">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="club-description">
          <p>{club.description}</p>
          <div className="meeting-info">
            <p>
              <strong>Meets:</strong> {club.meetingFrequency}
            </p>
          </div>
        </div>
      </div>

      <div className="club-content-grid">
        <div className="current-book-section">
          <h2>Current Book</h2>
          <div className="current-book-card">
            <div className="book-cover-container">
              <img
                src={club.currentBook.cover}
                alt={`${club.currentBook.title} cover`}
              />
            </div>
            <div className="book-info">
              <h3>{club.currentBook.title}</h3>
              <p className="author">by {club.currentBook.author}</p>
              <p className="description">{club.currentBook.description}</p>
              <div className="progress">
                <p>
                  <strong>Progress:</strong> {club.currentBook.progress}
                </p>
                <p>
                  <strong>Pages read:</strong> {club.currentBook.pagesRead}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="next-meeting-section">
          <h2>Next Meeting</h2>
          <div className="meeting-card">
            <div className="meeting-details">
              <p>
                <strong>Date:</strong> {club.nextMeeting.date}
              </p>
              <p>
                <strong>Time:</strong> {club.nextMeeting.time}
              </p>
              <p>
                <strong>Location:</strong> {club.nextMeeting.location}
              </p>
              <p>
                <strong>Agenda:</strong> {club.nextMeeting.agenda}
              </p>
            </div>
            <button className="rsvp-button">RSVP</button>
          </div>

          <div className="members-section">
            <h3>Members ({club.members.length})</h3>
            <div className="members-grid">
              {club.members.map((member, index) => (
                <div key={index} className="member-card">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="member-avatar"
                  />
                  <p className="member-name">{member.name}</p>
                </div>
              ))}
              <div className="join-card">
                <button className="join-button">+ Join Club</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="discussions-section">
        <h2>Discussions</h2>
        {[...club.discussions, ...discussions].map((discussion, index) => (
          <div key={index} className="discussion-card">
            <div className="user-info">
              <img
                src={
                  discussion.user === 'You'
                    ? 'https://randomuser.me/api/portraits/lego/1.jpg'
                    : club.members.find((m) => m.name === discussion.user)
                        ?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg'
                }
                alt={discussion.user}
                className="user-avatar"
              />
              <div>
                <p className="user-name">{discussion.user}</p>
                <p className="timestamp">{discussion.timestamp}</p>
              </div>
            </div>
            <p className="comment">{discussion.comment}</p>
            <div className="comment-actions">
              <button className="like-button">
                ♡ {discussion.likes > 0 && <span>{discussion.likes}</span>}
              </button>
              <button className="reply-button">Reply</button>
            </div>
          </div>
        ))}

        <form onSubmit={handleAddComment} className="add-comment-form">
          <textarea
            placeholder="Share your thoughts about the current book..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <button type="submit" className="submit-comment">
            Post Comment
          </button>
        </form>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BookClubDetails;
