import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import md5 from 'md5';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('followers');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userData');
        const currentUser = storedUser ? JSON.parse(storedUser) : null;

        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const [
          profileRes,
          followersCountRes,
          followingCountRes,
          followersListRes,
          followingListRes
        ] = await Promise.all([
          axios.get(`http://localhost:5000/api/users/${userId}`, { headers }),
          axios.get(`http://localhost:5000/api/users/${userId}/followers/count`),
          axios.get(`http://localhost:5000/api/users/${userId}/following/count`),
          axios.get(`http://localhost:5000/api/users/${userId}/followers`),
          axios.get(`http://localhost:5000/api/users/${userId}/following`)
        ]);

        setProfile(profileRes.data);
        setFollowersCount(followersCountRes.data.count || 0);
        setFollowingCount(followingCountRes.data.count || 0);
        setFollowers(followersListRes.data);
        setFollowing(followingListRes.data);

        if (currentUser) {
          setIsCurrentUser(currentUser.id === parseInt(userId));
          if (currentUser.id !== parseInt(userId) && token) {
            const followStatus = await axios.get(
              `http://localhost:5000/api/users/${userId}/follow-status`,
              { headers }
            );
            setIsFollowing(followStatus.data.isFollowing);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      if (isFollowing) {
        await axios.delete(`http://localhost:5000/api/users/${userId}/follow`, {
          headers,
          data: {}
        });
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await axios.post(`http://localhost:5000/api/users/${userId}/follow`, {}, { headers });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  const handleBackToMyProfile = () => {
    const storedUser = localStorage.getItem('userData');
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    if (currentUser) {
      navigate(`/users/${currentUser.id}`);
    }
  };

  const handleFollowersClick = () => setActiveTab('followers');
  const handleFollowingClick = () => setActiveTab('following');
  const handleUserClick = (userId) => navigate(`/users/${userId}`);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!profile) return <div className="profile-error">User not found</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img 
            src={profile.avatar_url || `https://www.gravatar.com/avatar/${md5(profile.email || '')}?d=identicon`} 
            alt={`${profile.username}'s avatar`} 
            className="profile-avatar"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
        </div>
        <div className="profile-info">
          <h1 className="profile-username">{profile.username}</h1>
          <p className="profile-bio">{profile.bio || 'No bio available'}</p>

          <div className="profile-stats">
            <div className="stat-item" onClick={handleFollowersClick} style={{ cursor: 'pointer' }}>
              <span className="stat-count">{followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item" onClick={handleFollowingClick} style={{ cursor: 'pointer' }}>
              <span className="stat-count">{followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>

          {!isCurrentUser && (
            <div className="profile-actions">
              <button 
                onClick={handleFollow}
                className={`follow-btn ${isFollowing ? 'following' : ''}`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button className="back-btn" onClick={handleBackToMyProfile}>
                Back to My Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={handleFollowersClick}
        >
          Followers
        </button>
        <button 
          className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
          onClick={handleFollowingClick}
        >
          Following
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'followers' && (
          <div className="followers-container">
            {followers.length > 0 ? (
              followers.map(user => (
                <div 
                  key={user.id} 
                  className="follower-item"
                  onClick={() => handleUserClick(user.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={user.avatar_url || `https://www.gravatar.com/avatar/${md5(user.email || '')}?d=identicon`}
                    alt={`${user.username}'s avatar`}
                    className="follower-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <span className="follower-username">{user.username}</span>
                </div>
              ))
            ) : (
              <p className="no-followers">No followers yet.</p>
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="following-container">
            {following.length > 0 ? (
              following.map(user => (
                <div 
                  key={user.id} 
                  className="following-item"
                  onClick={() => handleUserClick(user.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={user.avatar_url || `https://www.gravatar.com/avatar/${md5(user.email || '')}?d=identicon`}
                    alt={`${user.username}'s avatar`}
                    className="following-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <span className="following-username">{user.username}</span>
                </div>
              ))
            ) : (
              <p className="no-following">Not following anyone yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
