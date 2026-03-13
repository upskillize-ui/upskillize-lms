import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root { min-height:100vh; display:flex; font-family:'Outfit',sans-serif; background:#060b18; }

        .left-panel { flex:1; position:relative; display:flex; flex-direction:column; overflow:hidden; }
        .left-panel img.bg-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; }
        .left-overlay { position:absolute; inset:0; background:linear-gradient(150deg,rgba(6,11,24,0.15) 0%,rgba(6,20,60,0.45) 50%,rgba(6,11,24,0.92) 100%); }

        .left-logo { position:relative; z-index:3; padding:32px 40px; display:flex; flex-direction:column; align-items:flex-start; gap:5px; }
        .left-logo img { height:50px; width:auto; object-fit:contain; filter:drop-shadow(0 2px 14px rgba(56,189,248,0.3)); }
        .excel-beyond-tag { font-size:10.5px; font-weight:500; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45); padding-left:2px; }

        .left-content { position:relative; z-index:2; padding:0 48px 52px; margin-top:auto; }
        .brand-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.08); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.15); border-radius:100px; padding:6px 16px 6px 8px; margin-bottom:28px; }
        .brand-badge span.dot { width:7px; height:7px; background:#34d399; border-radius:50%; display:inline-block; animation:pulse-dot 2s infinite; box-shadow:0 0 8px rgba(52,211,153,0.6); }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        .brand-badge span.text { color:rgba(255,255,255,0.85); font-size:12px; font-weight:400; letter-spacing:0.04em; }
        .left-heading { font-family:'Cormorant Garamond',serif; font-size:clamp(2.4rem,3.8vw,3.6rem); font-weight:700; color:#fff; line-height:1.12; margin-bottom:18px; }
        .left-heading em { font-style:italic; background:linear-gradient(90deg,#38bdf8,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .left-sub { color:rgba(255,255,255,0.55); font-size:14.5px; font-weight:300; line-height:1.65; max-width:360px; margin-bottom:40px; }
        .stats-row { display:flex; gap:16px; }
        .stat-chip { background:rgba(255,255,255,0.07); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.12); border-radius:16px; padding:14px 22px; text-align:center; transition:background 0.3s; }
        .stat-chip:hover { background:rgba(255,255,255,0.12); }
        .stat-chip .num { font-family:'Cormorant Garamond',serif; font-size:1.7rem; font-weight:700; color:#fff; line-height:1; }
        .stat-chip .lbl { font-size:10px; color:rgba(255,255,255,0.4); margin-top:5px; text-transform:uppercase; letter-spacing:0.1em; }

        .right-panel { width:500px; min-width:500px; background:#0b1120; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:52px 56px; position:relative; overflow:hidden; }
        .right-panel::before { content:''; position:absolute; top:-140px; right:-140px; width:380px; height:380px; background:radial-gradient(circle,rgba(56,189,248,0.09) 0%,transparent 70%); border-radius:50%; pointer-events:none; }
        .right-panel::after { content:''; position:absolute; bottom:-120px; left:-120px; width:340px; height:340px; background:radial-gradient(circle,rgba(129,140,248,0.09) 0%,transparent 70%); border-radius:50%; pointer-events:none; }
        .grid-tex { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; }
        .form-box { width:100%; position:relative; z-index:1; }

        .form-title { font-family:'Cormorant Garamond',serif; font-size:2.2rem; font-weight:700; color:#fff; margin-bottom:6px; }
        .form-sub { color:rgba(255,255,255,0.35); font-size:13.5px; font-weight:300; margin-bottom:32px; }
        .error-box { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.25); border-radius:10px; padding:11px 15px; color:#fca5a5; font-size:13px; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
        .error-box::before { content:'⚠'; font-size:14px; }

        .field { margin-bottom:18px; }
        .field label { display:block; font-size:11px; font-weight:600; color:rgba(255,255,255,0.4); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:8px; }
        .input-wrap { position:relative; }
        .input-wrap input { width:100%; background:rgba(255,255,255,0.04); border:1.5px solid rgba(255,255,255,0.08); border-radius:12px; padding:13px 16px; color:#fff; font-family:'Outfit',sans-serif; font-size:14px; font-weight:300; transition:border-color 0.25s,background 0.25s,box-shadow 0.25s; outline:none; }
        .input-wrap input::placeholder { color:rgba(255,255,255,0.2); }
        .input-wrap input:focus { border-color:rgba(56,189,248,0.5); background:rgba(56,189,248,0.04); box-shadow:0 0 0 3px rgba(56,189,248,0.07); }
        .eye-btn { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; color:rgba(255,255,255,0.25); cursor:pointer; padding:4px; transition:color 0.2s; display:flex; align-items:center; }
        .eye-btn:hover { color:rgba(255,255,255,0.6); }

        .submit-btn { width:100%; background:linear-gradient(135deg,#1d6fa4 0%,#4f46e5 100%); border:none; border-radius:12px; padding:15px; color:#fff; font-family:'Outfit',sans-serif; font-size:15px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; position:relative; overflow:hidden; transition:transform 0.2s,box-shadow 0.2s; margin-top:8px; box-shadow:0 4px 24px rgba(56,189,248,0.18); }
        .submit-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#38bdf8 0%,#818cf8 100%); opacity:0; transition:opacity 0.3s; }
        .submit-btn:hover { transform:translateY(-1px); box-shadow:0 8px 30px rgba(56,189,248,0.28); }
        .submit-btn:hover::before { opacity:1; }
        .submit-btn span,.submit-btn svg { position:relative; z-index:1; }
        .submit-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }

        .loading-dots { display:flex; gap:4px; align-items:center; }
        .loading-dots span { width:5px; height:5px; background:#fff; border-radius:50%; animation:bounce 1.2s infinite; }
        .loading-dots span:nth-child(2){animation-delay:0.2s} .loading-dots span:nth-child(3){animation-delay:0.4s}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}

        .links-row { display:flex; justify-content:center; gap:24px; margin-top:18px; }
        .links-row a { font-size:12.5px; color:rgba(255,255,255,0.3); text-decoration:none; transition:color 0.2s; }
        .links-row a:hover { color:#38bdf8; }

        .divider { display:flex; align-items:center; gap:12px; margin:22px 0; }
        .divider::before,.divider::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.06); }
        .divider span { font-size:11px; color:rgba(255,255,255,0.2); text-transform:uppercase; letter-spacing:0.12em; white-space:nowrap; }

        .google-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; background:rgba(255,255,255,0.04); border:1.5px solid rgba(255,255,255,0.1); border-radius:12px; padding:13px; color:rgba(255,255,255,0.85); font-family:'Outfit',sans-serif; font-size:14px; font-weight:400; cursor:pointer; transition:all 0.25s ease; }
        .google-btn:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.2); color:#fff; }

        .signup-row { text-align:center; font-size:13px; color:rgba(255,255,255,0.3); margin-top:20px; }
        .signup-row a { color:#38bdf8; font-weight:500; text-decoration:none; transition:color 0.2s; }
        .signup-row a:hover { color:#7dd3fc; }

        @media(max-width:960px){.left-panel{display:none;}.right-panel{width:100%;min-width:unset;padding:44px 28px;}}
      `}</style>

      <div className="login-root">
        <div className="left-panel">
          <img className="bg-img" src="/login.jpg" alt="background" />
          <div className="left-overlay" />
          <div className="left-logo">
            <img src="/project.png" alt="Upskillize" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="excel-beyond-tag">Excel Beyond</span>
          </div>
          <div className="left-content">
            <div className="brand-badge">
              <span className="dot" />
              <span className="text">Live Sessions Available Now</span>
            </div>
            <h2 className="left-heading">
              Master Banking,<br />
              <em>Finance &amp; Product</em>
            </h2>
            <p className="left-sub">
              Learn from India's top industry veterans. Real-world skills, industry-recognized certifications, and real careers.
            </p>
          </div>
        </div>

        <div className="right-panel">
          <div className="grid-tex" />
          <div className="form-box">
            <div className="form-title">Welcome back</div>
            <div className="form-sub">Sign in to continue your learning journey</div>
            {error && <div className="error-box">{error}</div>}
            <button type="button" className="google-btn" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <div className="divider"><span>or sign in with email</span></div>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email Address</label>
                <div className="input-wrap">
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="example@gmail.com" required />
                </div>
              </div>
              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <input type={showPassword ? 'text' : 'password'} name="password"
                    value={formData.password} onChange={handleChange}
                    onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                    placeholder="Enter your password" style={{ paddingRight: '44px' }} required />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <div className="loading-dots"><span /><span /><span /></div>
                  : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>
            <div className="links-row">
              <Link to="/forgot-password">Forgot Password?</Link>
              <Link to="/change-password">Change Password?</Link>
            </div>
            <div className="divider"><span>New here?</span></div>
            <div className="signup-row">
              Don't have an account?{' '}<Link to="/register">Create one free →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}