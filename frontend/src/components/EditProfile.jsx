import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaSave, FaTimes } from 'react-icons/fa';
import '../styles/EditProfile.css';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.dispatchEvent(new Event('unauthorized'));
  }
  return Promise.reject(error);
});

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar_url: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUser = JSON.parse(localStorage.getItem('userData'));
      if (!currentUser) {
        navigate('/log-in');
        return;
      }

      try {
        const response = await api.get(`/users/${currentUser.id}`);
        setUser(response.data);
        setFormData({
          username: response.data.username || '',
          email: response.data.email || '',
          bio: response.data.bio || '',
          avatar_url: response.data.avatar_url || ''
        });
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load user profile');
        setIsLoading(false);
        console.error('Error fetching profile:', err);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const currentUser = JSON.parse(localStorage.getItem('userData'));
    if (!currentUser) {
      navigate('/log-in');
      return;
    }

    try {
      const response = await api.put(`/users/${currentUser.id}`, formData);
      
      setSuccess('Profile updated successfully');
      
      // Update local storage with new data
      const updatedUser = {
        ...currentUser,
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        avatar_url: formData.avatar_url
      };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      // Navigate to home page after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (!user) return <div className="error">User not found</div>;

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && (
        <div className="alert alert-success">
          {success} Redirecting to home page...
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength="3"
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            maxLength="500"
          />
        </div>
        
        <div className="form-group">
          <label>Avatar URL</label>
          <input
            type="url"
            name="avatar_url"
            value={formData.avatar_url}
            onChange={handleChange}
            placeholder="https://example.com/avatar.jpg"
          />
          {formData.avatar_url && (
            <div className="avatar-preview">
              <img src={formData.avatar_url} alt="Avatar Preview" />
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn-save">
            <FaSave /> Save Changes
          </button>
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate('/')}
          >
            <FaTimes /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;