import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import md5 from 'md5';
import '../styles/UserProfile.css';

const UserProfile = () => {
    const { userId } = useParams();
    const [currentUser, setCurrentUser] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts'); // Default to showing posts

    useEffect(() => {
        // Get current user from localStorage
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
                
                // Fetch basic profile data
                const profileResponse = await axios.get(`http://localhost:5000/api/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setProfileUser(profileResponse.data);

                // Fetch follow status and counts (only if viewing another user's profile)
                if (currentUser && currentUser.id !== parseInt(userId)) {
                    const followStatusResponse = await axios.get(
                        `http://localhost:5000/api/users/${userId}/follow-status`,
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    setIsFollowing(followStatusResponse.data.isFollowing);
                }

                // Fetch followers count
                const followersCountResponse = await axios.get(
                    `http://localhost:5000/api/users/${userId}/followers/count`
                );
                setFollowersCount(followersCountResponse.data.count);

                // Fetch following count
                const followingCountResponse = await axios.get(
                    `http://localhost:5000/api/users/${userId}/following/count`
                );
                setFollowingCount(followingCountResponse.data.count);

                // Fetch followers list
                const followersResponse = await axios.get(
                    `http://localhost:5000/api/users/${userId}/followers`
                );
                setFollowers(followersResponse.data);

                // Fetch following list
                const followingResponse = await axios.get(
                    `http://localhost:5000/api/users/${userId}/following`
                );
                setFollowing(followingResponse.data);

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
            if (isFollowing) {
                await axios.delete(
                    `http://localhost:5000/api/users/${userId}/follow`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );
                setIsFollowing(false);
                setFollowersCount(prev => prev - 1);
            } else {
                await axios.post(
                    `http://localhost:5000/api/users/${userId}/follow`,
                    {},
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        }
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
                        {/* Render user posts here */}
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
                                <div key={user.id} className="follower-item">
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
                                <div key={user.id} className="following-item">
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