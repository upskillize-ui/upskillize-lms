import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setSubmitted(true);
      } else {
        setError(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#1f4e79] text-white py-4 px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="w-20"></div>
          <div className="text-center">
            <div className="text-3xl font-bold tracking-wider">UPSKILLIZE</div>
            <div className="text-xs opacity-90 mt-1">Excel Beyond</div>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-10">

            {!submitted ? (
              <>
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail size={32} className="text-[#0d3b5c]" />
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                  <p className="text-gray-500 text-sm">
                    No worries! Enter your registered email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center gap-2">
                    <AlertCircle size={18} />
                    <p className="font-medium text-sm">{error}</p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address:
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                      placeholder="example@gmail.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0d3b5c] hover:bg-[#0a2d44] text-white py-4 rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>
              </>
            ) : (
              /* Success State */
              <>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={36} className="text-green-600" />
                  </div>
                </div>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h1>
                  <p className="text-gray-600 text-sm mb-2">
                    We've sent a password reset link to:
                  </p>
                  <p className="font-semibold text-[#0d3b5c] text-base">{email}</p>
                  <p className="text-gray-500 text-sm mt-4">
                    The link will expire in <strong>30 minutes</strong>. If you don't see it, check your spam folder.
                  </p>
                </div>
                <button
                  onClick={() => { setSubmitted(false); setEmail(''); }}
                  className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition text-sm"
                >
                  Resend Email
                </button>
              </>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}