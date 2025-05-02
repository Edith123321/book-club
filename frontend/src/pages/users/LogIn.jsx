import React, { useState } from 'react';
import '../../styles/login.css';

import { FaGoogle, FaFacebook, FaApple, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import { BsPeople, BsBook, BsCalendarEvent, BsChatSquareText } from 'react-icons/bs';

const Login = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign In form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Create Account form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset errors when switching tabs
    setErrors({});
  };
  
  const validateSignInForm = () => {
    const newErrors = {};
    
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    
    return newErrors;
  };
  
  const validateCreateAccountForm = () => {
    const newErrors = {};
    
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!newEmail.trim()) newErrors.newEmail = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(newEmail)) newErrors.newEmail = "Email is invalid";
    
    if (!newPassword) newErrors.newPassword = "Password is required";
    else if (newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters";
    
    if (!confirmPassword) newErrors.confirmPassword = "Confirm your password";
    else if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords don't match";
    
    if (!agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    
    return newErrors;
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateSignInForm();
    
    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        console.log('Login submitted with:', { email, password, rememberMe });
        setIsLoading(false);
        // Redirect would happen here in a real app
      }, 1500);
    } else {
      setErrors(formErrors);
    }
  };
  
  const handleCreateAccountSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateCreateAccountForm();
    
    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        console.log('Create account submitted with:', { 
          firstName, 
          lastName, 
          email: newEmail, 
          password: newPassword,
          agreeToTerms
        });
        setIsLoading(false);
        // Redirect would happen here in a real app
      }, 1500);
    } else {
      setErrors(formErrors);
    }
  };
  
  // Social login handlers
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    console.log('Initiating Google Sign In');
    
    // This would normally redirect to Google OAuth
    // For demonstration, we'll simulate the process
    setTimeout(() => {
      console.log('Google authentication completed');
      setIsLoading(false);
      // Redirect would happen here in a real app
    }, 1500);
  };
  
  const handleFacebookSignIn = () => {
    setIsLoading(true);
    console.log('Initiating Facebook Sign In');
    
    // This would normally redirect to Facebook OAuth
    setTimeout(() => {
      console.log('Facebook authentication completed');
      setIsLoading(false);
      // Redirect would happen here in a real app
    }, 1500);
  };
  
  const handleAppleSignIn = () => {
    setIsLoading(true);
    console.log('Initiating Apple Sign In');
    
    // This would normally redirect to Apple OAuth
    setTimeout(() => {
      console.log('Apple authentication completed');
      setIsLoading(false);
      // Redirect would happen here in a real app
    }, 1500);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome to BookClub</h2>
        </div>
        <div className="login-tabs">
          <button 
            className={`tab-button ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => handleTabChange('signin')}
          >
            Sign In
          </button>
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => handleTabChange('create')}
          >
            Create Account
          </button>
        </div>
        
        {activeTab === 'signin' ? (
          <form onSubmit={handleSignInSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-container">
                <input
                  type="email"
                  id="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'error' : ''}
                />
                <FaEnvelope className="input-icon" />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            <div className="form-group">
              <div className="password-label-container">
                <label htmlFor="password">Password</label>
                <a href="#" className="forgot-password">Forgot password?</a>
              </div>
              <div className="input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? 'error' : ''}
                />
                <FaLock className="input-icon" />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="or-divider">
              <span>Or continue with</span>
            </div>
            <div className="social-login">
              <button 
                type="button" 
                className="social-button google"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FaGoogle />
              </button>
              <button 
                type="button" 
                className="social-button facebook"
                onClick={handleFacebookSignIn}
                disabled={isLoading}
              >
                <FaFacebook />
              </button>
              <button 
                type="button" 
                className="social-button apple"
                onClick={handleAppleSignIn}
                disabled={isLoading}
              >
                <FaApple />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateAccountSubmit}>
            <div className="name-row">
              <div className="form-group half">
                <label htmlFor="firstName">First Name</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={errors.firstName ? 'error' : ''}
                  />
                  <FaUser className="input-icon" />
                </div>
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>
              <div className="form-group half">
                <label htmlFor="lastName">Last Name</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={errors.lastName ? 'error' : ''}
                  />
                  <FaUser className="input-icon" />
                </div>
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="newEmail">Email Address</label>
              <div className="input-container">
                <input
                  type="email"
                  id="newEmail"
                  placeholder="your@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className={errors.newEmail ? 'error' : ''}
                />
                <FaEnvelope className="input-icon" />
              </div>
              {errors.newEmail && <div className="error-message">{errors.newEmail}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Password</label>
              <div className="input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={errors.newPassword ? 'error' : ''}
                />
                <FaLock className="input-icon" />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
              <div className="password-strength">
                <div className={`strength-meter ${newPassword.length > 0 ? (newPassword.length >= 8 ? 'strong' : 'weak') : ''}`}></div>
                <span className="strength-text">{newPassword.length > 0 ? (newPassword.length >= 8 ? 'Strong password' : 'Password is too weak') : ''}</span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <FaLock className="input-icon" />
                <button 
                  type="button" 
                  className="toggle-password" 
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={() => setAgreeToTerms(!agreeToTerms)}
              />
              <label htmlFor="agreeToTerms">
                I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
              </label>
            </div>
            {errors.agreeToTerms && <div className="error-message terms-error">{errors.agreeToTerms}</div>}
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
            <div className="or-divider">
              <span>Or continue with</span>
            </div>
            <div className="social-login">
              <button 
                type="button" 
                className="social-button google"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FaGoogle />
              </button>
              <button 
                type="button" 
                className="social-button facebook"
                onClick={handleFacebookSignIn}
                disabled={isLoading}
              >
                <FaFacebook />
              </button>
              <button 
                type="button" 
                className="social-button apple"
                onClick={handleAppleSignIn}
                disabled={isLoading}
              >
                <FaApple />
              </button>
            </div>
          </form>
        )}
      </div>
      
      <div className="features-card">
        <div className="features-content">
          <div className="book-icon">
            <BsBook />
          </div>
          <h2>Join Our Reading Community</h2>
          <p>Connect with fellow book lovers, discover new titles, and engage in meaningful discussions.</p>
          
          <div className="features-list">
            <div className="feature-item">
              <BsPeople className="feature-icon" />
              <span>Create and join book clubs</span>
            </div>
            <div className="feature-item">
              <BsBook className="feature-icon" />
              <span>Track your reading progress</span>
            </div>
            <div className="feature-item">
              <BsCalendarEvent className="feature-icon" />
              <span>Schedule and attend meetings</span>
            </div>
            <div className="feature-item">
              <BsChatSquareText className="feature-icon" />
              <span>Discuss books with like-minded readers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;