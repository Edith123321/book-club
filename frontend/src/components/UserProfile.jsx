import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import md5 from 'md5';
import '../styles/UserProfile.css';

const UserProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                
                // Corrected endpoints to match your Flask routes exactly
                const [
                    profileResponse,
                    followersResponse,
                    followingResponse
                ] = await Promise.all([
                    // Using profile.get_user_profile route
                    axios.get(`http://localhost:5000/api/users/${userId}`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                    }),
                    // Using following.get_user_followers route
                    axios.get(`http://localhost:5000/follow/${userId}/followers`),
                    // Using following.get_user_following route
                    axios.get(`http://localhost:5000/follow/${userId}/following`)
                ]);

                setProfileUser(profileResponse.data);
                setFollowers(followersResponse.data.followers || followersResponse.data);
                setFollowing(followingResponse.data.following || followingResponse.data);
                
                // Get counts from the lists since we don't have separate count endpoints
                setFollowersCount(followersResponse.data.followers?.length || followersResponse.data.length || 0);
                setFollowingCount(followingResponse.data.following?.length || followingResponse.data.length || 0);

                if (currentUser && currentUser.id !== parseInt(userId) && token) {
                    // Using following.check_following route
                    const followStatusResponse = await axios.get(
                        `http://localhost:5000/follow/${userId}`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    setIsFollowing(followStatusResponse.data.is_following);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfileData();
        }
    }, [userId, currentUser]);

    const handleFollow = async () => {
        try {
            if (!currentUser) return;

            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            if (isFollowing) {
                // Using following.unfollow_user route
                await axios.delete(
                    `http://localhost:5000/follow/${userId}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setIsFollowing(false);
                setFollowersCount(prev => prev - 1);
            } else {
                // Using following.follow_user route
                await axios.post(
                    `http://localhost:5000/follow/${userId}`,
                    {},
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/users/${userId}`);
    };

    if (loading) return <div className="profile-loading">Loading profile...</div>;
    if (!profileUser) return <div className="profile-error">User not found</div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar-container">
                    <img 
                        src={profileUser.avatar_url || `https://www.gravatar.com/avatar/${md5(profileUser.email || '')}?d=identicon`} 
                        alt={`${profileUser.username}'s avatar`} 
                        className="profile-avatar"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png';
                        }}
                    />
                </div>
                <div className="profile-info">
                    <h1 className="profile-username">{profileUser.username}</h1>
                    <p className="profile-bio">{profileUser.bio || 'No bio yet.'}</p>

                    <div className="profile-stats">
                        <div 
                            className="stat-item" 
                            onClick={() => setActiveTab('followers')}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="stat-count">{followersCount}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div 
                            className="stat-item" 
                            onClick={() => setActiveTab('following')}
                            style={{ cursor: 'pointer' }}
                        >
                            <span className="stat-count">{followingCount}</span>
                            <span className="stat-label">Following</span>
                        </div>
                    </div>

                    {currentUser && currentUser.id !== parseInt(userId) && (
                        <div className="profile-actions">
                            <button 
                                onClick={handleFollow}
                                className={`follow-btn ${isFollowing ? 'following' : ''}`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                            <button className="message-btn">Message</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Posts
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('followers')}
                >
                    Followers
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
                    onClick={() => setActiveTab('following')}
                >
                    Following
                </button>
            </div>

            <div className="profile-content">
                {activeTab === 'posts' && (
                    <div className="posts-container">
                        {profileUser.posts && profileUser.posts.length > 0 ? (
                            profileUser.posts.map(post => (
                                <div key={post.id} className="post-item">
                                    {/* Post content */}
                                </div>
                            ))
                        ) : (
                            <p className="no-posts">No posts yet.</p>
                        )}
                    </div>
                )}

                {activeTab === 'followers' && (
                    <div className="followers-container">
                        {followers.length > 0 ? (
                            followers.map(user => (
                                <div 
                                    key={user.id} 
                                    className="follower-item"
                                    onClick={() => handleUserClick(user.id)}
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

export default UserProfile;