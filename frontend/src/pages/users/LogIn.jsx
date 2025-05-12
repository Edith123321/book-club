import React, { useState, useEffect } from 'react';
import '../../styles/login.css';
import { FaGoogle, FaFacebook, FaApple, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUser } from 'react-icons/fa';
import { BsPeople, BsBook, BsCalendarEvent, BsChatSquareText } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const navigate = useNavigate();
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


  const [errors, setErrors] = useState({});


  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData'));
   
    if (token && userData) {
      // Redirect based on user role
      navigate(userData.isAdmin ? '/admin/dashboard' : '/');
    }
  }, [navigate]);


  // Helper functions
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
  };


  // Form validation
  const validateSignInForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    return newErrors;
  };
 
  // Form validation function
const validateCreateAccountForm = () => {
  const errors = {};


  if (!firstName.trim()) {
    errors.firstName = "First name is required";
  }


  if (!lastName.trim()) {
    errors.lastName = "Last name is required";
  }


  if (!newEmail.trim()) {
    errors.newEmail = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
    errors.newEmail = "Email is invalid";
  }


  if (!newPassword) {
    errors.newPassword = "Password is required";
  } else if (newPassword.length < 8) {
    errors.newPassword = "Password must be at least 8 characters";
  }


  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your password";
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords don't match";
  }


  if (!agreeToTerms) {
    errors.agreeToTerms = "You must agree to the terms";
  }


  return errors;
};


// Generic API call function
const makeApiCall = async (url, method = 'GET', body = null) => {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };


    // Only include body for methods that allow it
    if (body && method !== 'GET' && method !== 'HEAD') {
      options.body = JSON.stringify(body);
    }


    const response = await fetch(url, options);


    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Request failed');
    }


    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};




  // Sign In handler
 const handleSignInSubmit = async (e) => {
  e.preventDefault();
  const formErrors = validateSignInForm();
 
  if (Object.keys(formErrors).length > 0) {
    setErrors(formErrors);
    return;
  }


  setIsLoading(true);


  try {
    // 1. Authenticate the user
    const authData = await makeApiCall('http://localhost:5000/auth/login', 'POST', {
      email,
      password
    });


    // Store the auth token
    localStorage.setItem('authToken', authData.access_token);


    // 2. Fetch user details, including admin status
    const userDataResponse = await makeApiCall(`http://localhost:5000/users/`, 'GET', null, true);


    // Debugging: Log the full user data to see what is returned from API
    console.log('Auth Data from API:', authData);
    console.log('User Data Response from API:', userDataResponse);


    // 3. Extract the actual user from the response (it’s inside the users array)
    const userData = userDataResponse.users.find(user => user.email === email);


    // Debugging: Log the extracted user data
    console.log('Extracted User Data:', userData);


    if (!userData) {
      throw new Error('User not found');
    }


    // 4. Prepare complete user data
    const completeUserData = {
      id: authData.user_id,
      username: userData.username || 'DefaultUsername', // Fallback to a default username if missing
      email: email,
      firstName: userData.first_name || '',
      lastName: userData.last_name || '',
      is_admin: userData.is_admin || false // Ensure it's a boolean
    };


    // Debugging: Log the complete user data
    console.log('Complete User Data:', completeUserData);


    // Store complete user data
    localStorage.setItem('userData', JSON.stringify(completeUserData));


    if (rememberMe) localStorage.setItem('rememberMe', 'true');


    // Trigger auth change event
    window.dispatchEvent(new Event('authChange'));


    // Debugging: Check the value of is_admin
    console.log('Is Admin:', completeUserData.is_admin);


    // Redirect based on admin status
    if (completeUserData.is_admin) {
      console.log('Redirecting to /admin/dashboard');
      navigate('/admin/dashboard'); // Redirects to admin dashboard for admins
    } else {
      console.log('Redirecting to homepage');
      navigate('/'); // Redirects to homepage for regular users
    }


  } catch (error) {
    // Handle errors
    setErrors({ ...errors, apiError: error.message });
  } finally {
    setIsLoading(false);
  }
};
  // Registration handler
  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateCreateAccountForm();
   
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }


    setIsLoading(true);
   
    try {
      // Register the user
      const registrationData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: newEmail.trim(),
        password: newPassword
      };


      const data = await makeApiCall('http://localhost:5000/auth/register', 'POST', registrationData);
     
      // Auto-login after registration
      const loginData = await makeApiCall('http://localhost:5000/auth/login', 'POST', {
        email: newEmail.trim(),
        password: newPassword
      });


      localStorage.setItem('authToken', loginData.access_token);
     
      // Store user data (new users are not admins by default)
      const userData = {
        id: loginData.user_id,
        username: loginData.username,
        email: newEmail.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        is_admin: false
      };
     
      localStorage.setItem('userData', JSON.stringify(userData));
     
      // Trigger auth change event
      window.dispatchEvent(new Event('authChange'));
     
      // Redirect regular users to home page
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ ...errors, apiError: error.message });
    } finally {
      setIsLoading(false);
    }
  };


  // Social login handlers
  const handleSocialSignIn = (provider) => {
    setIsLoading(true);
    console.log(`Initiating ${provider} Sign In`);
    setTimeout(() => {
      console.log(`${provider} authentication completed`);
      setIsLoading(false);
    }, 1500);
  };


  // Render methods
  const renderSignInForm = () => (
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
      {errors.apiError && <div className="error-message api-error">{errors.apiError}</div>}
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
          onClick={() => handleSocialSignIn('Google')}
          disabled={isLoading}
        >
          <FaGoogle />
        </button>
        <button
          type="button"
          className="social-button facebook"
          onClick={() => handleSocialSignIn('Facebook')}
          disabled={isLoading}
        >
          <FaFacebook />
        </button>
        <button
          type="button"
          className="social-button apple"
          onClick={() => handleSocialSignIn('Apple')}
          disabled={isLoading}
        >
          <FaApple />
        </button>
      </div>
    </form>
  );


  const renderCreateAccountForm = () => (
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
          <span className="strength-text">
            {newPassword.length > 0 ? (newPassword.length >= 8 ? 'Strong password' : 'Password is too weak') : ''}
          </span>
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
      {errors.apiError && <div className="error-message api-error">{errors.apiError}</div>}
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
          onClick={() => handleSocialSignIn('Google')}
          disabled={isLoading}
        >
          <FaGoogle />
        </button>
        <button
          type="button"
          className="social-button facebook"
          onClick={() => handleSocialSignIn('Facebook')}
          disabled={isLoading}
        >
          <FaFacebook />
        </button>
        <button
          type="button"
          className="social-button apple"
          onClick={() => handleSocialSignIn('Apple')}
          disabled={isLoading}
        >
          <FaApple />
        </button>
      </div>
    </form>
  );


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
       
        {activeTab === 'signin' ? renderSignInForm() : renderCreateAccountForm()}
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

