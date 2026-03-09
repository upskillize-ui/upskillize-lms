import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      const role = result.user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'faculty') navigate('/faculty');
      else navigate('/student');
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #0a0f1e;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          overflow: hidden;
        }

        .left-panel img.bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(10, 15, 30, 0.3) 0%,
            rgba(10, 30, 80, 0.5) 40%,
            rgba(10, 15, 30, 0.85) 100%
          );
        }

        .left-content {
          position: relative;
          z-index: 2;
          padding: 48px;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px;
          padding: 6px 16px 6px 8px;
          margin-bottom: 28px;
        }

        .brand-badge span.dot {
          width: 8px; height: 8px;
          background: #38bdf8;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-dot 2s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }

        .brand-badge span.text {
          color: rgba(255,255,255,0.9);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .left-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.2rem, 3.5vw, 3.2rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 16px;
        }

        .left-heading em {
          font-style: normal;
          background: linear-gradient(90deg, #38bdf8, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-sub {
          color: rgba(255,255,255,0.65);
          font-size: 15px;
          font-weight: 300;
          line-height: 1.6;
          max-width: 360px;
          margin-bottom: 36px;
        }

        .stats-row {
          display: flex;
          gap: 24px;
        }

        .stat-chip {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 14px;
          padding: 14px 20px;
          text-align: center;
        }

        .stat-chip .num {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #fff;
          line-height: 1;
        }

        .stat-chip .lbl {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        /* ── RIGHT PANEL ── */
        .right-panel {
          width: 480px;
          min-width: 480px;
          background: #0d1525;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 52px;
          position: relative;
          overflow: hidden;
        }

        .right-panel::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .right-panel::after {
          content: '';
          position: absolute;
          bottom: -100px; left: -100px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .form-box {
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .logo-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 36px;
        }

        .logo-wrap img {
          height: 52px;
          width: auto;
          object-fit: contain;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 6px;
        }

        .form-sub {
          color: rgba(255,255,255,0.4);
          font-size: 13.5px;
          font-weight: 300;
          margin-bottom: 36px;
        }

        .error-box {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 12px 16px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 24px;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .input-wrap {
          position: relative;
        }

        .field input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 18px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all 0.25s ease;
        }

        .field input::placeholder { color: rgba(255,255,255,0.2); }

        .field input:focus {
          border-color: #38bdf8;
          background: rgba(56,189,248,0.06);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
        }

        .field input.focused-purple:focus {
          border-color: #a78bfa;
          background: rgba(167,139,250,0.06);
          box-shadow: 0 0 0 3px rgba(167,139,250,0.1);
        }

        .eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .eye-btn:hover { color: rgba(255,255,255,0.7); }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #1d6fa4 0%, #6d4dba 100%);
          border: none;
          border-radius: 12px;
          padding: 15px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.02em;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #38bdf8 0%, #a78bfa 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .submit-btn:hover::before { opacity: 1; }
        .submit-btn span, .submit-btn svg { position: relative; z-index: 1; }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-dots {
          display: flex;
          gap: 4px;
          align-items: center;
        }

        .loading-dots span {
          width: 5px; height: 5px;
          background: #fff;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }

        .links-row {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-top: 20px;
        }

        .links-row a {
          font-size: 12.5px;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          transition: color 0.2s;
        }

        .links-row a:hover { color: #38bdf8; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .divider span {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-bottom: 4px;
        }
        .google-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.25);
        }

        .signup-row {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
        }

        .signup-row a {
          color: #38bdf8;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .signup-row a:hover { color: #7dd3fc; }

        /* Mobile */
        @media (max-width: 900px) {
          .left-panel { display: none; }
          .right-panel {
            width: 100%;
            min-width: unset;
            padding: 40px 28px;
          }
        }
      `}</style>

      <div className="login-root">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <img className="bg-img" src="/login.jpg" alt="background" />
          <div className="left-overlay" />
          <div className="left-content">
            <div className="brand-badge">
              <span className="dot" />
              <span className="text">Live Sessions Available Now</span>
            </div>
            <h2 className="left-heading">
              Excel Beyond<br />
              <em>Your Potential</em>
            </h2>
            <p className="left-sub">
              Master Banking, Product Leadership & Financial Management with India's top industry veterans. Real skills. Real careers.
            </p>
            <div className="stats-row">
              <div className="stat-chip">
                <div className="num">10K+</div>
                <div className="lbl">Learners</div>
              </div>
              <div className="stat-chip">
                <div className="num">4.9★</div>
                <div className="lbl">Rating</div>
              </div>
              <div className="stat-chip">
                <div className="num">98%</div>
                <div className="lbl">Completion</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="form-box">

            <div className="logo-wrap">
              <img
                src="/project.png"
                alt="Upskillize"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            <div className="form-title">Welcome back</div>
            <div className="form-sub">Sign in to continue your learning journey</div>

            {error && <div className="error-box">{error}</div>}

            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div className="divider"><span>or sign in with email</span></div>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email Address</label>
                <div className="input-wrap">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    placeholder="example@gmail.com"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    className="focused-purple"
                    placeholder="Enter your password"
                    style={{ paddingRight: '44px' }}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <div className="loading-dots">
                    <span /><span /><span />
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="links-row">
              <Link to="/forgot-password">Forgot Password?</Link>
              <Link to="/change-password">Change Password?</Link>
            </div>

            <div className="divider"><span>New here?</span></div>

            <div className="signup-row">
              Don't have an account?{' '}
              <Link to="/register">Create one free →</Link>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}