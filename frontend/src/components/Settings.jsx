import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaKey, FaSave, FaTimes } from 'react-icons/fa';
import '../styles/Settings.css';

const SettingsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(`/api/users/${userId}/change-password`, {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccess('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  return (
    <div className="settings-container">
      <h2>Account Settings</h2>
      
      <div className="settings-section">
        <h3>Change Password</h3>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              name="current_password"
              value={passwordData.current_password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="new_password"
              value={passwordData.new_password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirm_password"
              value={passwordData.confirm_password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-save">
              <FaKey /> Change Password
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate(`/profile/${userId}`)}
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;