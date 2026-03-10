import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api'; // ✅ uses your configured api instance

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

  // Update api headers when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
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
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
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

  // ✅ Login
  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login...');

      const response = await api.post('/auth/login', { email, password });

      console.log('✅ Login response:', response.data);

      if (response.data && response.data.success) {
        const { token: newToken, user: userData } = response.data;

        setToken(newToken);
        setUser(userData);

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        console.log('✅ Login successful! Role:', userData.role);

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
        console.error('Response error:', error.response.data);
        return {
          success: false,
          message: error.response.data?.message || 'Invalid credentials'
        };
      } else if (error.request) {
        return {
          success: false,
          message: 'Cannot connect to server. Please check if the backend is running.'
        };
      } else {
        return {
          success: false,
          message: 'An error occurred during login'
        };
      }
    }
  };

  // ✅ Register
  const register = async (userData) => {
    try {
      console.log('📝 Attempting registration...');

      const response = await api.post('/auth/register', userData);

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

  // ✅ Google Login (placeholder)
  const googleLogin = async () => {
    try {
      console.log('🔐 Google login not yet implemented');
      return {
        success: false,
        message: 'Google login is not yet implemented'
      };
    } catch (error) {
      console.error('❌ Google login error:', error);
      return {
        success: false,
        message: 'Google login failed'
      };
    }
  };

  // ✅ Logout
  const logout = async () => {
    try {
      console.log('👋 Logging out...');

      if (token) {
        await api.post('/auth/logout').catch(err => {
          console.error('Logout API error (non-critical):', err);
        });
      }

      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      console.log('✅ Logged out successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Logout error:', error);

      // Still clear local data even if API call fails
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      return { success: true };
    }
  };

  // ✅ Forgot Password
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
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

  // ✅ Reset Password
  const resetPassword = async (resetToken, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token: resetToken,
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

  // ✅ Update User — merges partial updates into current user state + localStorage
  // Used by Profile.jsx after saving personal/professional/contact/social info
  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
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
    updateUser, // ✅ added — required by Profile.jsx to refresh UI after profile save
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