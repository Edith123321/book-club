// import React, { useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { CiArrowLeft } from 'react-icons/ci';
// import { FaRegCalendarAlt, FaUsers, FaBook } from 'react-icons/fa';
// import bookClubsData from '../../components/bookClubsData';
// import '../../styles/BookClubDetails.css';
// import Footer from '../../components/Footer';

// const BookClubDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [joined, setJoined] = useState(false);
  
//   const bookClub = bookClubsData.find(club => club.id === parseInt(id));

//   if (!bookClub) {
//     return (
//       <div className="book-club-details">
//         <div className="back-button" onClick={() => navigate(-1)}>
//           <CiArrowLeft /> Back to Clubs
//         </div>
//         <h2>Book Club not found</h2>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="book-club-details">
//       <div className="back-button" onClick={() => navigate(-1)}>
//         <CiArrowLeft /> Back to Clubs
//       </div>

//       <div className="club-header">
//         <img src={bookClub.clubCover} alt={bookClub.bookClubName} className="club-cover" />
//         <div className="header-content">
//           <h1>{bookClub.bookClubName}</h1>
//           <button 
//             className={`join-button ${joined ? 'joined' : ''}`}
//             onClick={() => setJoined(!joined)}
//           >
//             {joined ? '✓ Joined' : '+ Join Club'}
//           </button>
//         </div>
//       </div>

//       <div className="club-content">
//         <div className="main-content">
//           <div className="about-section">
//             <h2>About This Club</h2>
//             <p>{bookClub.description}</p>
//           </div>

//           <div className="details-grid">
//             <div className="detail-card">
//               <div className="detail-icon">
//                 <FaRegCalendarAlt />
//               </div>
//               <div>
//                 <h3>Meeting Frequency</h3>
//                 <p>{bookClub.meetingFrequency}</p>
//               </div>
//             </div>

//             <div className="detail-card">
//               <div className="detail-icon">
//                 <FaUsers />
//               </div>
//               <div>
//                 <h3>Format</h3>
//                 <p>{bookClub.meetingFormat}</p>
//               </div>
//             </div>

//             <div className="detail-card">
//               <div className="detail-icon">
//                 <FaBook />
//               </div>
//               <div>
//                 <h3>Genres</h3>
//                 <div className="genres">
//                   {bookClub.genres.map((genre, index) => (
//                     <span key={index}>{genre}</span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="current-book-section">
//             <h2>Currently Reading</h2>
//             <div className="book-card">
//               <img src={bookClub.currentBook.cover} alt={bookClub.currentBook.title} />
//               <div className="book-info">
//                 <h3>{bookClub.currentBook.title}</h3>
//                 <p className="author">by {bookClub.currentBook.author}</p>
//                 <p className="description">{bookClub.currentBook.description}</p>
//                 {bookClub.currentBook.progress && (
//                   <div className="progress">
//                     <h4>Reading Progress</h4>
//                     <p>{bookClub.currentBook.progress}</p>
//                     <p>{bookClub.currentBook.pagesRead}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {bookClub.nextMeeting && (
//             <div className="next-meeting">
//               <h2>Next Meeting</h2>
//               <div className="meeting-details">
//                 <p><strong>Date:</strong> {bookClub.nextMeeting.date}</p>
//                 <p><strong>Time:</strong> {bookClub.nextMeeting.time}</p>
//                 <p><strong>Location:</strong> {bookClub.nextMeeting.location}</p>
//                 <p><strong>Agenda:</strong> {bookClub.nextMeeting.agenda}</p>
//               </div>
//             </div>
//           )}
//         </div>

//         <div className="sidebar">
//           <div className="members-section">
//             <h2>Members ({bookClub.members.length})</h2>
//             <div className="members-list">
//               {bookClub.members.map((member, index) => (
//                 <div key={index} className="member">
//                   <img src={member.avatar} alt={member.name} />
//                   <p>{member.name}</p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {bookClub.discussions && bookClub.discussions.length > 0 && (
//             <div className="discussions-section">
//               <h2>Recent Discussions</h2>
//               <div className="discussions-list">
//                 {bookClub.discussions.slice(0, 3).map((discussion, index) => (
//                   <div key={index} className="discussion">
//                     <div className="discussion-header">
//                       <img 
//                         src={bookClub.members.find(m => m.name === discussion.user)?.avatar} 
//                         alt={discussion.user} 
//                       />
//                       <div>
//                         <h4>{discussion.user}</h4>
//                         <span>{discussion.timestamp}</span>
//                       </div>
//                       {discussion.likes && (
//                         <span className="likes">❤️ {discussion.likes}</span>
//                       )}
//                     </div>
//                     <p>{discussion.comment}</p>
//                   </div>
//                 ))}
//               </div>
//               <button className="view-all">View All Discussions</button>
//             </div>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default BookClubDetails;