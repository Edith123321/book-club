import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import md5 from 'md5';
import '../styles/FollowList.css';

const FollowList = ({ type }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser] = useState(JSON.parse(localStorage.getItem('userData')));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `http://localhost:5000/users/${userId}/${type}?minimal=true`
        );
        setUsers(response.data.followers || response.data.following || []);
      } catch (err) {
        console.error(`Error fetching ${type}:`, err);
        setError(err.response?.data?.message || `Failed to load ${type}`);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userId, type]);

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleFollowClick = async (e, userId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/users/${userId}/follow-status`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const isFollowing = response.data.is_following;
      
      if (isFollowing) {
        await axios.delete(`http://localhost:5000/api/users/${userId}/follow`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        await axios.post(`http://localhost:5000/api/users/${userId}/follow`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, is_following: !isFollowing } 
            : user
        )
      );
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) return <div className="loading">Loading {type}...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  <button 
  className="back-button"
  onClick={() => navigate(`/users/${userId}`)}
>
  ← Back to Profile
</button>

  return (
    <div className="follow-list">
      <h2>{type === 'followers' ? 'Followers' : 'Following'}</h2>
      <div className="user-grid">
        {users.length > 0 ? (
          users.map(user => {
            const isCurrentUserProfile = currentUser && currentUser.id === user.id;
            return (
              <div 
                key={user.id} 
                className="user-card"
                onClick={() => handleUserClick(user.id)}
              >
                <img 
                  src={user.avatar_url || `https://www.gravatar.com/avatar/${md5(user.email || '')}?d=identicon`}
                  alt={user.username}
                  className="user-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <h3 className="username-link">{user.username}</h3>
                {!isCurrentUserProfile && currentUser && (
                  <div className="user-actions">
                    <button 
                      className={`mini-follow-btn ${user.is_following ? 'following' : ''}`}
                      onClick={(e) => handleFollowClick(e, user.id)}
                    >
                      {user.is_following ? 'Following' : 'Follow'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="empty-message">No {type} found</div>
        )}
      </div>
    </div>
  );
};

export default FollowList;