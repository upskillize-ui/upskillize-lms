import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const validatePassword = () => {
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      if (response.data.success) {
        setSuccess(true);
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to change password');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Current password is incorrect');
      } else {
        setError(err.response?.data?.message || 'Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Orange Top Bar */}
      <div className="bg-orange-500 text-white py-2 px-6 text-sm font-medium">
        +91 98192 69862 | +91 77108 71338
      </div>

      {/* Dark Blue Header */}
      <header className="bg-[#0d3b5c] text-white py-4 px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="/project.png" 
              alt="Upskillize Logo" 
              className="h-8 w-auto object-contain brightness-0 invert"
            />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold tracking-wider">UPSKILLIZE</div>
            <div className="text-xs opacity-90 mt-1">Excel Beyond</div>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-10">
            
            {/* Back Button */}
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back to Login</span>
            </Link>

            {!success ? (
              <>
                {/* Icon */}
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Lock className="text-blue-600" size={32} />
                </div>

                {/* Title */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">Change Password</h1>
                  <p className="text-gray-600">
                    {user ? `Update password for ${user.email}` : 'Create a strong password to secure your account'}
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.newPassword && (
                      <p className="mt-2 text-xs text-gray-500">
                        Password strength: {
                          formData.newPassword.length < 8 ? '❌ Too short' :
                          formData.newPassword.length < 12 ? '⚠️ Medium' :
                          '✅ Strong'
                        }
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <p className={`mt-2 text-xs ${
                        formData.newPassword === formData.confirmPassword 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formData.newPassword === formData.confirmPassword 
                          ? '✅ Passwords match' 
                          : '❌ Passwords do not match'
                        }
                      </p>
                    )}
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Password Requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                          {formData.newPassword.length >= 8 ? '✓' : '○'}
                        </span>
                        At least 8 characters
                      </li>
                      <li className="flex items-center gap-2">
                        <span className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                          {/[A-Z]/.test(formData.newPassword) ? '✓' : '○'}
                        </span>
                        One uppercase letter
                      </li>
                      <li className="flex items-center gap-2">
                        <span className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                          {/[a-z]/.test(formData.newPassword) ? '✓' : '○'}
                        </span>
                        One lowercase letter
                      </li>
                      <li className="flex items-center gap-2">
                        <span className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                          {/[0-9]/.test(formData.newPassword) ? '✓' : '○'}
                        </span>
                        One number
                      </li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0d3b5c] hover:bg-[#0a2d44] text-white py-4 rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Changing Password...
                      </span>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-green-600" size={40} />
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Password Changed!</h2>
                  <p className="text-gray-600 mb-8">
                    Your password has been successfully updated. You'll be redirected to login shortly.
                  </p>

                  <Link
                    to="/login"
                    className="inline-block w-full bg-[#0d3b5c] hover:bg-[#0a2d44] text-white py-3 rounded-lg font-semibold transition"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}