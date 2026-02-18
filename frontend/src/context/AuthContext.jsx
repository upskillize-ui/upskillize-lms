import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

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
  const [token, setToken] = useState(localStorage.getItem('token'));

  // API base URL - use hardcoded value for development
  const API_URL = 'http://localhost:5000/api';

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login...');
      console.log('API URL:', `${API_URL}/auth/login`);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      console.log('✅ Login response:', response.data);

      if (response.data && response.data.success) {
        const { token: newToken, user: userData } = response.data;

        // Save to state
        setToken(newToken);
        setUser(userData);

        // Save to localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        console.log('✅ Login successful!');
        console.log('User role:', userData.role);

        return {
          success: true,
          user: userData,
          message: 'Login successful'
        };
      } else {
        console.error('❌ Login failed - No success in response');
        return {
          success: false,
          message: response.data?.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.response) {
        // Server responded with error
        console.error('Response error:', error.response.data);
        return {
          success: false,
          message: error.response.data?.message || 'Invalid credentials'
        };
      } else if (error.request) {
        // Request made but no response
        console.error('No response from server');
        return {
          success: false,
          message: 'Cannot connect to server. Please check if the backend is running on http://localhost:5000'
        };
      } else {
        // Error in request setup
        console.error('Request error:', error.message);
        return {
          success: false,
          message: 'An error occurred during login'
        };
      }
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration...');
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);

      console.log('✅ Registration response:', response.data);

      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Registration successful',
          user: response.data.user
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Registration failed'
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Cannot connect to server. Please check if the backend is running.'
        };
      } else {
        return {
          success: false,
          message: 'An error occurred during registration'
        };
      }
    }
  };

  // Google login function (placeholder)
  const googleLogin = async () => {
    try {
      console.log('🔐 Google login not yet implemented');
      return {
        success: false,
        message: 'Google login is not yet implemented'
      };
      
      // TODO: Implement Google OAuth
      // const response = await axios.get(`${API_URL}/auth/google`);
      // Handle Google OAuth flow
    } catch (error) {
      console.error('❌ Google login error:', error);
      return {
        success: false,
        message: 'Google login failed'
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      
      // Call backend logout endpoint (optional)
      if (token) {
        await axios.post(`${API_URL}/auth/logout`).catch(err => {
          console.error('Logout API error:', err);
        });
      }

      // Clear state
      setUser(null);
      setToken(null);

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Remove axios default header
      delete axios.defaults.headers.common['Authorization'];

      console.log('✅ Logged out successfully');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Still clear local data even if API call fails
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      
      return { success: true };
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return {
        success: true,
        message: response.data.message || 'Password reset email sent'
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email'
      };
    }
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword
      });
      return {
        success: true,
        message: response.data.message || 'Password reset successful'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    googleLogin,
    logout,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFaculty: user?.role === 'faculty',
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;