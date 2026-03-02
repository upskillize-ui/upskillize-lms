import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');      // present when coming from reset-email link
  const resetEmail = searchParams.get('email'); // optionally passed in link

  const { user } = useAuth();
  const navigate = useNavigate();

  // If token present  → "Reset via link" mode (no current password needed)
  // If no token       → "Change password" mode (current password required)
  const isResetMode = Boolean(token);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(null); // null = checking, true/false

  // Password strength
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const strength = getStrength(formData.newPassword);

  // Validate token on mount (reset mode only)
  useEffect(() => {
    if (!isResetMode) { setTokenValid(true); return; }
    const validate = async () => {
      try {
        const res = await api.post('/auth/validate-reset-token', { token });
        setTokenValid(res.data.success);
      } catch {
        setTokenValid(false);
      }
    };
    validate();
  }, [token, isResetMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!isResetMode && !formData.currentPassword) {
      setError('Please enter your current password.'); return false;
    }
    if (formData.newPassword.length < 8) {
      setError('New password must be at least 8 characters.'); return false;
    }
    if (!/[A-Z]/.test(formData.newPassword)) {
      setError('Password must contain at least one uppercase letter.'); return false;
    }
    if (!/[0-9]/.test(formData.newPassword)) {
      setError('Password must contain at least one number.'); return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.'); return false;
    }
    if (!isResetMode && formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password.'); return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      let response;

      if (isResetMode) {
        // Called from forgot-password email link
        response = await api.post('/auth/reset-password', {
          token,
          email: resetEmail,
          newPassword: formData.newPassword,
        });
      } else {
        // Called from within the app (logged-in user)
        response = await api.post('/auth/change-password', {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
      }

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Token validation loading ──
  if (isResetMode && tokenValid === null) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d3b5c]" />
          <p className="mt-4 text-gray-500 text-sm">Validating your reset link...</p>
        </div>
      </PageShell>
    );
  }

  // ── Invalid / expired token ──
  if (isResetMode && tokenValid === false) {
    return (
      <PageShell>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
          <p className="text-gray-500 text-sm mb-6">
            This password reset link is invalid or has expired (links expire after 30 minutes).
          </p>
          <Link to="/forgot-password"
            className="inline-block bg-[#0d3b5c] hover:bg-[#0a2d44] text-white px-8 py-3 rounded-lg font-semibold transition shadow-lg">
            Request a New Link
          </Link>
          <div className="mt-4">
            <Link to="/login" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── Success State ──
  if (success) {
    return (
      <PageShell>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Changed!</h2>
          <p className="text-gray-500 text-sm mb-8">
            Your password has been updated successfully. You can now log in with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#0d3b5c] hover:bg-[#0a2d44] text-white py-4 rounded-lg font-semibold text-lg transition shadow-lg"
          >
            Go to Login
          </button>
          {!isResetMode && user && (
            <button
              onClick={() => navigate(-1)}
              className="w-full mt-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition text-sm"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </PageShell>
    );
  }

  // ── Main Form ──
  return (
    <PageShell>
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <ShieldCheck size={32} className="text-[#0d3b5c]" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isResetMode ? 'Set New Password' : 'Change Password'}
        </h1>
        <p className="text-gray-500 text-sm">
          {isResetMode
            ? 'Create a strong new password for your account.'
            : 'Enter your current password and choose a new one.'}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center gap-2">
          <AlertCircle size={18} className="flex-shrink-0" />
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Current Password — only in change mode */}
        {!isResetMode && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password:
            </label>
            <div className="relative">
              <input
                type={show.current ? 'text' : 'password'}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12 text-gray-900"
                placeholder="Enter current password"
                required
              />
              <button type="button" onClick={() => setShow({ ...show, current: !show.current })}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                {show.current ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-1 text-right">
              <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot current password?</Link>
            </div>
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            New Password:
          </label>
          <div className="relative">
            <input
              type={show.new ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12 text-gray-900"
              placeholder="Enter new password"
              required
            />
            <button type="button" onClick={() => setShow({ ...show, new: !show.new })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
              {show.new ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Strength bar */}
          {formData.newPassword && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor[strength] : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className={`text-xs font-medium ${['', 'text-red-600', 'text-yellow-600', 'text-blue-600', 'text-green-600'][strength]}`}>
                {strengthLabel[strength]} password
              </p>
            </div>
          )}

          {/* Requirements */}
          <ul className="mt-3 space-y-1">
            {[
              { label: 'At least 8 characters', met: formData.newPassword.length >= 8 },
              { label: 'At least one uppercase letter', met: /[A-Z]/.test(formData.newPassword) },
              { label: 'At least one number', met: /[0-9]/.test(formData.newPassword) },
            ].map(({ label, met }) => (
              <li key={label} className={`flex items-center gap-2 text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
                <CheckCircle size={13} className={met ? 'text-green-500' : 'text-gray-300'} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm New Password:
          </label>
          <div className="relative">
            <input
              type={show.confirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3.5 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12 text-gray-900 ${
                formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                  ? 'border-red-400'
                  : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                  ? 'border-green-400'
                  : 'border-gray-300'
              }`}
              placeholder="Re-enter new password"
              required
            />
            <button type="button" onClick={() => setShow({ ...show, confirm: !show.confirm })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
              {show.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
          {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
            <p className="mt-1 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} /> Passwords match</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0d3b5c] hover:bg-[#0a2d44] text-white py-4 rounded-lg font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-2"
        >
          {loading ? 'Updating...' : isResetMode ? 'Set New Password' : 'Change Password'}
        </button>
      </form>

      {/* Back link */}
      <div className="mt-6 text-center">
        <Link to="/login"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline">
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </PageShell>
  );
}

// Shared page wrapper — same header/background as Login
function PageShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
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
      <div className="flex-1 bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}