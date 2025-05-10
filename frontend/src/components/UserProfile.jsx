import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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
    const [activeTab, setActiveTab] = useState('followers');

    useEffect(() => {
        // Get current user from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const profileRes = await axios.get(`/api/users/${userId}`);
                setProfileUser(profileRes.data);

                if (currentUser && currentUser.id !== parseInt(userId)) {
                    const followRes = await axios.get(`/api/following/${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    setIsFollowing(followRes.data.is_following);
                    setFollowersCount(followRes.data.followers_count);
                    setFollowingCount(followRes.data.following_count);
                }

                const followersRes = await axios.get(`/api/following/followers?user_id=${userId}`);
                setFollowers(followersRes.data.followers);

                const followingRes = await axios.get(`/api/following/following?user_id=${userId}`);
                setFollowing(followingRes.data.following);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId, currentUser]);

    const handleFollow = async () => {
        try {
            if (!currentUser) return;

            const token = localStorage.getItem('token');
            if (isFollowing) {
                await axios.delete(`/api/following/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setIsFollowing(false);
                setFollowersCount(prev => prev - 1);
            } else {
                await axios.post(`/api/following/${userId}`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
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
                        src={profileUser.avatar_url || '/default-avatar.png'} 
                        alt={`${profileUser.username}'s avatar`} 
                        className="profile-avatar"
                    />
                </div>
                <div className="profile-info">
                    <h1 className="profile-username">{profileUser.username}</h1>
                    <p className="profile-bio">{profileUser.bio || 'No bio yet.'}</p>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-count">{followersCount}</span>
                            <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat-item">
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

            <div className="profile-follow-section">
                <div className="follow-tabs">
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

                <div className="follow-list">
                    {activeTab === 'followers' ? (
                        followers.length > 0 ? (
                            followers.map(user => (
                                <div key={user.id} className="follow-item">
                                    <img 
                                        src={user.avatar || '/default-avatar.png'} 
                                        alt={`${user.username}'s avatar`} 
                                        className="follow-avatar"
                                    />
                                    <span className="follow-username">{user.username}</span>
                                </div>
                            ))
                        ) : (
                            <p className="no-followers">No followers yet.</p>
                        )
                    ) : (
                        following.length > 0 ? (
                            following.map(user => (
                                <div key={user.id} className="follow-item">
                                    <img 
                                        src={user.avatar || '/default-avatar.png'} 
                                        alt={`${user.username}'s avatar`} 
                                        className="follow-avatar"
                                    />
                                    <span className="follow-username">{user.username}</span>
                                </div>
                            ))
                        ) : (
                            <p className="no-following">Not following anyone yet.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
