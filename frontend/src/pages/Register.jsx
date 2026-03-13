import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Phone, Mail, Lock, User, Shield, GraduationCap, Users, Eye, EyeOff, ArrowRight, CheckCircle, Building2, Briefcase, Award } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    country_code: '+91',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Creating account...');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverStatus, setServerStatus] = useState('waking');
  const navigate = useNavigate();

  useEffect(() => {
    const wakeServer = async () => {
      try {
        const res = await fetch(
          'https://upskillize-lms-backend.onrender.com/api/health',
          { signal: AbortSignal.timeout(60000) }
        );
        if (res.ok) {
          setServerStatus('ready');
          setTimeout(() => setServerStatus('hidden'), 3000);
        } else {
          setServerStatus('hidden');
        }
      } catch (err) {
        setServerStatus('hidden');
      }
    };
    wakeServer();
  }, []);

  const countryCodes = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' }
  ];

  const roles = [
    { value: 'student',    label: 'Student',    desc: 'Enroll & learn new skills',         color: '#38bdf8', bg: 'rgba(56,189,248,0.2)',   activeBorder: '#38bdf8', activeBg: 'rgba(56,189,248,0.08)'   },
    { value: 'faculty',    label: 'Faculty',    desc: 'Create & manage courses',            color: '#a78bfa', bg: 'rgba(167,139,250,0.2)', activeBorder: '#a78bfa', activeBg: 'rgba(167,139,250,0.08)' },
    { value: 'institute',  label: 'Institute',  desc: 'Manage your institution',            color: '#fb923c', bg: 'rgba(251,146,60,0.2)',  activeBorder: '#fb923c', activeBg: 'rgba(251,146,60,0.08)'  },
    { value: 'corporate',  label: 'Corporate',  desc: 'Train your workforce',               color: '#34d399', bg: 'rgba(52,211,153,0.2)',  activeBorder: '#34d399', activeBg: 'rgba(52,211,153,0.08)'  },
    { value: 'placement',  label: 'Placement',  desc: 'Connect talent with opportunities',  color: '#f472b6', bg: 'rgba(244,114,182,0.2)', activeBorder: '#f472b6', activeBg: 'rgba(244,114,182,0.08)' },
  ];

  const roleIcons = {
    student:   <GraduationCap size={22} />,
    faculty:   <Users size={22} />,
    institute: <Building2 size={22} />,
    corporate: <Briefcase size={22} />,
    placement: <Award size={22} />,
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setFormData({ ...formData, phone: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters long'); return; }
    if (!formData.phone || formData.phone.length < 10) { setError('Please enter a valid phone number (minimum 10 digits)'); return; }

    setLoading(true);
    setLoadingMsg('Creating account...');
    const t1 = setTimeout(() => setLoadingMsg('Almost there...'), 5000);
    const t2 = setTimeout(() => setLoadingMsg('Server is warming up, please wait...'), 12000);
    const t3 = setTimeout(() => setLoadingMsg("Still working, don't close this page..."), 25000);

    try {
      const fullPhoneNumber = `${formData.country_code}${formData.phone}`;
      const response = await api.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: fullPhoneNumber
      }, { timeout: 60000 });
      if (response.data.success) navigate('/login');
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Server took too long to respond. Please try submitting again.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #0a0f1e;
        }

        /* ── LEFT PANEL ── */
        .reg-left {
          flex: 1;
          background: linear-gradient(160deg, #0d1a3a 0%, #0f2952 50%, #0a0f1e 100%);
          display: flex;
          flex-direction: column;
          padding: 0;
          position: relative;
          overflow: hidden;
          justify-content: flex-start;
        }

        .reg-left::before {
          content: '';
          position: absolute;
          top: -100px; left: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }

        .reg-left::after {
          content: '';
          position: absolute;
          bottom: -80px; right: -80px;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }

        /* TOP-LEFT LOGO */
        .logo-area {
          position: relative;
          z-index: 2;
          padding: 24px 36px 0 36px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .logo-area img {
          height: 44px;
          width: auto;
          object-fit: contain;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }

        .logo-name {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .logo-tagline {
          font-size: 9.5px;
          font-weight: 400;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        /* LEFT INNER CONTENT */
        .left-inner {
          position: relative;
          z-index: 1;
          max-width: 420px;
          width: 100%;
          padding: 28px 48px 52px 48px;
          margin: 0;
        }

        .reg-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 2vw, 2.6rem);
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 16px;
        }

        .reg-heading em {
          font-style: normal;
          background: linear-gradient(90deg, #38bdf8, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .reg-sub {
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          font-weight: 300;
          line-height: 1.7;
          margin-bottom: 40px;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 44px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 18px;
        }

        .feature-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
        }

        .feature-item .feat-title {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
        }

        .feature-item .feat-desc {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-top: 2px;
        }

        .already-row {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
        }

        .already-row a {
          color: #38bdf8;
          font-weight: 600;
          text-decoration: none;
        }

        .already-row a:hover { color: #7dd3fc; }

        /* ── RIGHT PANEL ── */
        .reg-right {
          width: 560px;
          min-width: 560px;
          background: #0d1525;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          padding: 40px 48px;
          overflow-y: auto;
          position: relative;
        }

        .reg-right::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }

        .status-banner {
          width: 100%;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .status-waking {
          background: rgba(251,191,36,0.1);
          border: 1px solid rgba(251,191,36,0.25);
          color: #fbbf24;
        }

        .status-ready {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #4ade80;
        }

        .form-box {
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }

        .form-sub {
          color: rgba(255,255,255,0.4);
          font-size: 13px;
          margin-bottom: 28px;
        }

        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 13px;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 20px;
        }

        .google-btn:hover {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.2);
        }

        .or-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .or-divider::before, .or-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .or-divider span {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .error-box {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 12px 16px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .field-full { grid-column: 1 / -1; }

        .field {
          display: flex;
          flex-direction: column;
        }

        .field label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 7px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .field input, .field select {
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          outline: none;
          transition: all 0.25s;
          width: 100%;
        }

        .field input::placeholder { color: rgba(255,255,255,0.18); }

        .field input:focus, .field select:focus {
          border-color: #38bdf8;
          background: rgba(56,189,248,0.06);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.08);
        }

        .field select option { background: #1a2540; color: #fff; }

        .phone-row { display: flex; gap: 8px; }

        .phone-row select {
          width: 110px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.05);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          outline: none;
          transition: all 0.25s;
        }

        .phone-hint {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          margin-top: 5px;
        }

        .pw-wrap { position: relative; }

        .eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          display: flex;
          transition: color 0.2s;
          padding: 0;
        }

        .eye-btn:hover { color: rgba(255,255,255,0.7); }

        /* ── ROLE SECTION ── */
        .role-section-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        /* All 5 role cards in ONE single line */
        .role-cards-grid {
          display: flex;
          flex-direction: row;
          gap: 8px;
          margin-bottom: 20px;
        }

        .role-card-wrap {
          flex: 1;
          min-width: 0;
        }

        .role-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 14px 6px;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: center;
        }

        .role-card input[type="radio"] { display: none; }

        .role-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-2px);
        }

        .role-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .role-card-info {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .role-name {
          font-size: 11.5px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
        }

        /* Hide description — icon + name only */
        .role-desc { display: none; }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #1d6fa4 0%, #6d4dba 100%);
          border: none;
          border-radius: 12px;
          padding: 14px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin-top: 4px;
          margin-bottom: 16px;
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
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .loading-dots { display: flex; gap: 4px; align-items: center; }

        .loading-dots span {
          width: 5px; height: 5px;
          background: #fff; border-radius: 50%;
          animation: bounce-d 1.2s infinite;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce-d {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }

        .signin-row {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .signin-row a {
          color: #38bdf8;
          font-weight: 600;
          text-decoration: none;
        }

        .signin-row a:hover { color: #7dd3fc; }

        .terms-note {
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          text-align: center;
          margin-top: 12px;
        }

        .terms-note a { color: rgba(56,189,248,0.7); text-decoration: none; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @media (max-width: 1000px) {
          .reg-left { display: none; }
          .reg-right { width: 100%; min-width: unset; padding: 36px 24px; }
          .fields-grid { grid-template-columns: 1fr; }
          .field-full { grid-column: 1; }
          .role-cards-grid { grid-template-columns: 1fr 1fr; }
          .role-card-wrap:nth-child(4), .role-card-wrap:nth-child(5) { grid-column: auto; }
        }
      `}</style>

      <div className="reg-root">

        {/* ── LEFT PANEL ── */}
        <div className="reg-left">

          {/* LOGO — top-left corner */}
          <div className="logo-area">
            <img
              src="/project.png"
              alt="Upskillize"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* CONTENT below logo */}
          <div className="left-inner">
            <h2 className="reg-heading">
              Start your journey<br />
              <em>Excel Beyond</em>
            </h2>
            <p className="reg-sub">
              Join learners mastering Banking, Product Leadership & Financial Management with India's top experts.
            </p>

            <div className="feature-list">
              {[
                { icon: '🎓', bg: 'rgba(56,189,248,0.15)', title: 'MBA-Level Content', desc: 'Benchmarked against IIM & CFA standards' },
                { icon: '👨‍💼', bg: 'rgba(167,139,250,0.15)', title: 'Industry Experts', desc: 'Learn from 10+ year veterans' },
                { icon: '📜', bg: 'rgba(251,146,60,0.15)', title: 'Certifications', desc: 'Industry-recognized certificates' },
                { icon: '🔄', bg: 'rgba(52,211,153,0.15)', title: 'Flexible Learning', desc: 'Live sessions + recorded content' },
              ].map(({ icon, bg, title, desc }) => (
                <div className="feature-item" key={title}>
                  <div className="feature-icon" style={{ background: bg }}>{icon}</div>
                  <div>
                    <div className="feat-title">{title}</div>
                    <div className="feat-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="already-row">
              Already have an account?{' '}
              <Link to="/login">Sign in →</Link>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="reg-right">
          <div className="form-box">

            {serverStatus === 'waking' && (
              <div className="status-banner status-waking">
                <svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Connecting to server, please wait...
              </div>
            )}
            {serverStatus === 'ready' && (
              <div className="status-banner status-ready">
                <CheckCircle size={14} />
                Server is ready — you can register now!
              </div>
            )}

            <div className="form-title">Create account</div>
            <div className="form-sub">Join Upskillize and start learning today</div>

            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="or-divider"><span>or register with email</span></div>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="fields-grid">

                <div className="field field-full">
                  <label><User size={11} /> Full Name *</label>
                  <input type="text" name="full_name" required value={formData.full_name}
                    onChange={handleChange} placeholder="Enter your full name" />
                </div>

                <div className="field field-full">
                  <label><Mail size={11} /> Email Address *</label>
                  <input type="email" name="email" required value={formData.email}
                    onChange={handleChange} placeholder="your.email@example.com" />
                </div>

                <div className="field field-full">
                  <label><Phone size={11} /> Phone Number *</label>
                  <div className="phone-row">
                    <select name="country_code" value={formData.country_code} onChange={handleChange} required>
                      {countryCodes.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                    <input type="tel" name="phone" required value={formData.phone}
                      onChange={handlePhoneChange} placeholder="9876543210" maxLength="15"
                      style={{ flex: 1 }} />
                  </div>
                  <div className="phone-hint">Full: {formData.country_code} {formData.phone || '(Enter number)'}</div>
                </div>

                <div className="field">
                  <label><Lock size={11} /> Password *</label>
                  <div className="pw-wrap">
                    <input type={showPassword ? 'text' : 'password'} name="password" required
                      value={formData.password} onChange={handleChange}
                      placeholder="Min. 6 characters" minLength="6" style={{ paddingRight: '40px' }} />
                    <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="field">
                  <label><Lock size={11} /> Confirm Password *</label>
                  <div className="pw-wrap">
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" required
                      value={formData.confirmPassword} onChange={handleChange}
                      placeholder="Re-enter password" style={{ paddingRight: '40px' }} />
                    <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

              </div>

              {/* ── ROLE SELECTION ── */}
              <div style={{ marginBottom: '20px' }}>
                <div className="role-section-label">
                  <Shield size={11} /> Register as *
                </div>
                <div className="role-cards-grid">
                  {roles.map((role) => {
                    const isActive = formData.role === role.value;
                    return (
                      <div className="role-card-wrap" key={role.value}>
                        <label
                          className="role-card"
                          style={isActive ? {
                            borderColor: role.activeBorder,
                            background: role.activeBg,
                          } : {}}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={isActive}
                            onChange={handleChange}
                          />
                          <div
                            className="role-icon"
                            style={{
                              background: isActive ? role.bg : 'rgba(255,255,255,0.05)',
                              color: isActive ? role.color : 'rgba(255,255,255,0.4)',
                            }}
                          >
                            {roleIcons[role.value]}
                          </div>
                          <div className="role-card-info">
                            <div className="role-name" style={isActive ? { color: role.color } : {}}>
                              {role.label}
                            </div>
                            <div className="role-desc">{role.desc}</div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="submit-btn"
                disabled={loading || serverStatus === 'waking'}>
                {serverStatus === 'waking' ? (
                  <><svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25"/>
                    <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg><span>Waiting for server...</span></>
                ) : loading ? (
                  <><div className="loading-dots"><span /><span /><span /></div><span style={{ marginLeft: 8 }}>{loadingMsg}</span></>
                ) : (
                  <><span>Create Account</span><ArrowRight size={16} /></>
                )}
              </button>

              <div className="signin-row">
                Already have an account? <Link to="/login">Sign in →</Link>
              </div>

              <div className="terms-note" style={{ marginTop: 14 }}>
                By registering, you agree to our{' '}
                <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
              </div>
            </form>
          </div>
        </div>

      </div>
    </>
  );
}