import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setSuccess(true);
        // Optionally redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } else {
        setError(response.data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
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
                  <Mail className="text-blue-600" size={32} />
                </div>

                {/* Title */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">Forgot Password?</h1>
                  <p className="text-gray-600">
                    No worries! Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="your.email@example.com"
                      required
                    />
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
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
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

                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Check Your Email!</h2>
                  <p className="text-gray-600 mb-6">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-500 mb-8">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button 
                      onClick={() => setSuccess(false)}
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      try again
                    </button>
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