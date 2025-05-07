import { useState, useEffect } from 'react';
import '../../styles/MyBookClubs.css';
import { FiSearch, FiUsers, FiBook, FiCalendar } from 'react-icons/fi';

const MyBookClub = () => {
  const [myBookClubs, setMyBookClubs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUserBookClubs = async () => {
      try {
        const response = await fetch('http://localhost:5000/memberships/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch user book clubs');
        }
        const data = await response.json();
        setMyBookClubs(data);
      } catch (error) {
        console.error('Error fetching user book clubs:', error);
      }
    };

    fetchUserBookClubs();
  }, []);

  return (
    <div className="bg-light-bg min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="header-logo">
            <span className="text-primary-color">Book</span>
            <span className="text-secondary-color">Nook</span>
          </h1>
          <div className="flex items-center">
            <div className="relative mr-3">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-color"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              {/* Avatar placeholder */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-dark">My Book Clubs</h2>
            <p className="text-text-light">Manage your book clubs and memberships</p>
          </div>
        </div>

        {/* Club Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 club-grid">
          {myBookClubs.length > 0 ? (
            myBookClubs.map((club) => (
              <div key={club.id} className="club-card animate-slideDown">
                <div className={`club-banner ${club.color || 'banner-blue'}`}>
                  <div className="club-initials">
                    <span className="text-white">
                      {club.bookClubName
                        ? club.bookClubName
                            .split(' ')
                            .map((word) => word[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()
                        : 'XX'}
                    </span>
                  </div>
                </div>
                <div className="body relative p-4">
                  <div className="mt-6">
                    <h3 className="text-xl font-bold text-text-dark">{club.bookClubName}</h3>
                    <div className="text-text-light text-sm mt-1">
                      {club.genres ? club.genres.join(', ') : ''}
                    </div>
                    <div className="flex items-center mt-3 text-text-light">
                      <FiUsers className="mr-2" />
                      <span>{club.members ? club.members.length : 0} members</span>
                    </div>
                    <div className="flex items-center mt-2 text-text-light">
                      <FiBook className="mr-2" />
                      <span>
                        Currently reading:{' '}
                        {club.currentBook ? club.currentBook.title : 'Not set'}
                      </span>
                    </div>
                    <div className="flex items-center mt-2 text-text-light">
                      <FiCalendar className="mr-2" />
                      <span>Next meeting: Not scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-text-light text-center py-10">No clubs found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBookClub;
