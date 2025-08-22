import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [authChecked, setAuthChecked] = useState(false);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = sessionStorage.getItem('token');
      
      if (storedToken) {
        try {
          // Set the token in axios headers first
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Try to get user profile instead of check-session endpoint
          const response = await axios.get('/api/auth/profile');
          if (response.data.user) {
            setUser(response.data.user);
            setToken(storedToken);
          } else {
            // No user data, clear token
            sessionStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          console.error('Session check failed:', error);
          // If it's a 401/403 error, clear the token
          if (error.response?.status === 401 || error.response?.status === 403) {
            sessionStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
          } else {
            // For other errors (network issues, etc.), keep the token but set user to null
            // This prevents redirects on temporary network issues
            setUser(null);
          }
        }
      }
      setLoading(false);
      setAuthChecked(true);
    };

    // Add timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setAuthChecked(true);
    }, 5000); // 5 second timeout

    checkAuth();

    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      // Store token in sessionStorage for persistence across refreshes
      sessionStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/signup', { name, email, password });
      const { token: newToken, user: userData } = response.data;
      
      // Store token in sessionStorage for persistence across refreshes
      sessionStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      // Call server to invalidate session
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout server call failed:', error);
    }
    
    // Clear local state and sessionStorage
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updateData) => {
    try {
      const response = await axios.put('/api/auth/profile', updateData);
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    authChecked,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
