import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const verifyToken = useCallback(async (token) => {
    try {
      const response = await fetch('http://localhost:5000/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (err) {
      console.error("Token verification failed:", err);
      return false;
    }
  }, []);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    setUser(null);
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData') || sessionStorage.getItem('userData');

      if (token && storedUser) {
        const isValid = await verifyToken(token);
        if (isValid) {
          setUser(JSON.parse(storedUser));
        } else {
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  }, [verifyToken, clearAuthData]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback((userData, token, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userData', JSON.stringify(userData));
    }
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearAuthData();
    navigate('/log-in');  // match your route
  }, [navigate, clearAuthData]);

  const updateUser = useCallback((updatedData) => {
    const mergedUser = { ...user, ...updatedData };
    const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
    storage.setItem('userData', JSON.stringify(mergedUser));
    setUser(mergedUser);
  }, [user]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
