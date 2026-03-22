import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowRight, RefreshCw } from 'lucide-react';

// ── Alphanumeric CAPTCHA (mixed case letters + digits) ────────────────────────
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function generateCaptcha() {
  const len = 6;
  let code = '';
  for (let i = 0; i < len; i++) {
    code += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return code;
}

// Render the CAPTCHA string with per-character styling for a distorted look
function CaptchaDisplay({ code }) {
  const colors = ['#38bdf8', '#818cf8', '#34d399', '#f59e0b', '#f472b6', '#a78bfa'];
  return (
    <div style={{
      flex: 1,
      background: 'rgba(15,23,42,0.7)',
      border: '1.5px solid rgba(56,189,248,0.25)',
      borderRadius: 12,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      userSelect: 'none',
      letterSpacing: 2,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Noise lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18 }} xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="18" x2="100%" y2="26" stroke="#38bdf8" strokeWidth="1"/>
        <line x1="0" y1="32" x2="100%" y2="22" stroke="#818cf8" strokeWidth="0.7"/>
        <line x1="10%" y1="0" x2="20%" y2="100%" stroke="#34d399" strokeWidth="0.6"/>
        <line x1="75%" y1="0" x2="65%" y2="100%" stroke="#f59e0b" strokeWidth="0.5"/>
      </svg>
      {code.split('').map((ch, i) => {
        const rotate = (Math.sin(i * 2.7 + 1) * 14).toFixed(1);
        const ty = (Math.cos(i * 1.9) * 4).toFixed(1);
        const color = colors[i % colors.length];
        const isUpper = ch >= 'A' && ch <= 'Z';
        return (
          <span key={i} style={{
            display: 'inline-block',
            fontFamily: "'Courier New', monospace",
            fontSize: isUpper ? 22 : 20,
            fontWeight: isUpper ? 700 : 600,
            color,
            transform: `rotate(${rotate}deg) translateY(${ty}px)`,
            textShadow: `0 0 8px ${color}55`,
            position: 'relative',
            zIndex: 1,
          }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
}

export default function Login() {
  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Captcha state
  const [captchaCode, setCaptchaCode]   = useState(() => generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [captchaShake, setCaptchaShake] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');

    if (captchaInput.trim() !== captchaCode) {
      setCaptchaError('Code doesn\'t match — try the new one below.');
      setCaptchaShake(true);
      setTimeout(() => setCaptchaShake(false), 600);
      refreshCaptcha();
      return;
    }

    setLoading(true);
    const result = await login(formData.email, formData.password);

    if (result.success) {
      const role = result.user?.role;
      if (role === 'admin')          navigate('/admin');
      else if (role === 'faculty')   navigate('/faculty');
      else if (role === 'placement') navigate('/placement');
      else if (role === 'corporate') navigate('/corporate');
      else if (role === 'institute') navigate('/institute');
      else                           navigate('/student');
    } else {
      const msg = result.message || '';
      if (
        msg.toLowerCase().includes('pending') ||
        msg.toLowerCase().includes('approv') ||
        msg.toLowerCase().includes('not approved') ||
        msg.toLowerCase().includes('inactive') ||
        msg.toLowerCase().includes('not active')
      ) {
        setError('__PENDING__');
      } else {
        setError(msg);
        refreshCaptcha();
      }
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

        /* ── Root layout ── */
        .lr { min-height:100vh; display:flex; font-family:'Outfit',sans-serif; background:#060b18; }

        /* ── Left panel ── */
        .lp { flex:1; position:relative; display:flex; flex-direction:column; overflow:hidden; }
        .lp-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center; }
        .lp-ov { position:absolute; inset:0; background:linear-gradient(150deg,rgba(6,11,24,0.1) 0%,rgba(6,20,60,0.4) 50%,rgba(6,11,24,0.94) 100%); }
        .lp-logo { position:relative; z-index:3; padding:32px 40px; display:flex; flex-direction:column; gap:5px; }
        .lp-logo img { height:48px; width:auto; object-fit:contain; filter:drop-shadow(0 2px 14px rgba(56,189,248,0.3)); }
        .lp-tag { font-size:10px; font-weight:500; letter-spacing:0.22em; text-transform:uppercase; color:rgba(255,255,255,0.4); padding-left:2px; }
        .lp-body { position:relative; z-index:2; padding:0 48px 52px; margin-top:auto; }
        .lp-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,0.07); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.14); border-radius:100px; padding:6px 16px 6px 8px; margin-bottom:28px; }
        .lp-badge .dot { width:7px; height:7px; background:#34d399; border-radius:50%; animation:pdot 2s infinite; box-shadow:0 0 8px rgba(52,211,153,0.6); }
        @keyframes pdot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.4)}}
        .lp-badge .txt { color:rgba(255,255,255,0.8); font-size:12px; font-weight:400; letter-spacing:0.04em; }
        .lp-h { font-family:'Cormorant Garamond',serif; font-size:clamp(2.4rem,3.8vw,3.6rem); font-weight:700; color:#fff; line-height:1.12; margin-bottom:18px; }
        .lp-h em { font-style:italic; background:linear-gradient(90deg,#38bdf8,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .lp-sub { color:rgba(255,255,255,0.5); font-size:14.5px; font-weight:300; line-height:1.65; max-width:360px; margin-bottom:40px; }
        .stats { display:flex; gap:14px; }
        .stat { background:rgba(255,255,255,0.07); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.11); border-radius:16px; padding:14px 22px; text-align:center; transition:background 0.3s; }
        .stat:hover { background:rgba(255,255,255,0.12); }
        .stat .num { font-family:'Cormorant Garamond',serif; font-size:1.7rem; font-weight:700; color:#fff; line-height:1; }
        .stat .lbl { font-size:10px; color:rgba(255,255,255,0.38); margin-top:5px; text-transform:uppercase; letter-spacing:0.1em; }

        /* ── Right panel ── */
        .rp { width:520px; min-width:520px; background:#080f1e; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:52px 60px; position:relative; overflow:hidden; }
        .rp::before { content:''; position:absolute; top:-160px; right:-160px; width:400px; height:400px; background:radial-gradient(circle,rgba(56,189,248,0.07) 0%,transparent 70%); border-radius:50%; pointer-events:none; }
        .rp::after { content:''; position:absolute; bottom:-130px; left:-130px; width:360px; height:360px; background:radial-gradient(circle,rgba(129,140,248,0.07) 0%,transparent 70%); border-radius:50%; pointer-events:none; }
        .rp-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; }
        .fb { width:100%; position:relative; z-index:1; }

        /* ── Typography ── */
        .ft { font-family:'Cormorant Garamond',serif; font-size:2.3rem; font-weight:700; color:#fff; margin-bottom:5px; }
        .fs { color:rgba(255,255,255,0.32); font-size:13.5px; font-weight:300; margin-bottom:28px; }

        /* ── Alerts ── */
        .err-box { background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.22); border-radius:10px; padding:11px 15px; color:#fca5a5; font-size:13px; margin-bottom:18px; display:flex; align-items:center; gap:8px; }
        .err-box::before { content:'⚠'; font-size:14px; }

        .pend-box { background:rgba(251,191,36,0.06); border:1px solid rgba(251,191,36,0.28); border-radius:14px; padding:22px 18px; margin-bottom:18px; text-align:center; }
        .pend-icon { font-size:36px; margin-bottom:10px; }
        .pend-title { font-size:15px; font-weight:600; color:#fbbf24; margin-bottom:6px; }
        .pend-desc { font-size:13px; color:rgba(255,255,255,0.45); line-height:1.65; }
        .pend-steps { margin-top:14px; display:flex; flex-direction:column; gap:6px; text-align:left; }
        .pend-step { display:flex; align-items:center; gap:10px; font-size:12px; color:rgba(255,255,255,0.45); background:rgba(255,255,255,0.04); border-radius:8px; padding:8px 12px; }
        .pend-num { width:20px; height:20px; border-radius:50%; background:rgba(251,191,36,0.2); color:#fbbf24; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        /* ── Fields ── */
        .field { margin-bottom:16px; }
        .field label { display:block; font-size:10.5px; font-weight:600; color:rgba(255,255,255,0.38); letter-spacing:0.11em; text-transform:uppercase; margin-bottom:7px; }
        .iw { position:relative; }
        .iw input { width:100%; background:rgba(255,255,255,0.035); border:1.5px solid rgba(255,255,255,0.07); border-radius:12px; padding:13px 16px; color:#fff; font-family:'Outfit',sans-serif; font-size:14px; font-weight:300; transition:border-color 0.25s,background 0.25s,box-shadow 0.25s; outline:none; }
        .iw input::placeholder { color:rgba(255,255,255,0.18); }
        .iw input:focus { border-color:rgba(56,189,248,0.45); background:rgba(56,189,248,0.035); box-shadow:0 0 0 3px rgba(56,189,248,0.07); }
        .eye { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; color:rgba(255,255,255,0.22); cursor:pointer; padding:4px; transition:color 0.2s; display:flex; align-items:center; }
        .eye:hover { color:rgba(255,255,255,0.55); }

        /* ── CAPTCHA ── */
        .cap-wrap { margin-bottom:18px; }
        .cap-label { display:block; font-size:10.5px; font-weight:600; color:rgba(255,255,255,0.38); letter-spacing:0.11em; text-transform:uppercase; margin-bottom:8px; }
        .cap-row { display:flex; gap:10px; align-items:stretch; }
        .cap-input { flex:1; background:rgba(255,255,255,0.035); border:1.5px solid rgba(255,255,255,0.07); border-radius:12px; padding:13px 16px; color:#fff; font-family:'Courier New',monospace; font-size:15px; font-weight:500; outline:none; transition:all 0.25s; letter-spacing:0.15em; text-align:center; min-width:0; }
        .cap-input:focus { border-color:rgba(56,189,248,0.45); background:rgba(56,189,248,0.035); box-shadow:0 0 0 3px rgba(56,189,248,0.07); }
        .cap-input::placeholder { color:rgba(255,255,255,0.18); font-size:12px; letter-spacing:normal; }
        .cap-refresh { width:44px; min-width:44px; height:auto; border:1.5px solid rgba(255,255,255,0.09); border-radius:12px; background:rgba(255,255,255,0.03); color:rgba(255,255,255,0.38); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; flex-shrink:0; }
        .cap-refresh:hover { background:rgba(255,255,255,0.08); color:#fff; border-color:rgba(255,255,255,0.18); }
        .cap-err { font-size:12px; color:#f87171; margin-top:6px; display:flex; align-items:center; gap:5px; }
        .cap-hint { font-size:11px; color:rgba(255,255,255,0.25); margin-top:5px; }
        @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
        .cap-shake { animation:shake 0.5s ease; }

        /* ── Submit button ── */
        .sub-btn { width:100%; background:linear-gradient(135deg,#1d6fa4 0%,#4f46e5 100%); border:none; border-radius:12px; padding:15px; color:#fff; font-family:'Outfit',sans-serif; font-size:15px; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; position:relative; overflow:hidden; transition:transform 0.2s,box-shadow 0.2s; margin-top:10px; box-shadow:0 4px 24px rgba(56,189,248,0.16); }
        .sub-btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,#38bdf8 0%,#818cf8 100%); opacity:0; transition:opacity 0.3s; }
        .sub-btn:hover { transform:translateY(-1px); box-shadow:0 8px 30px rgba(56,189,248,0.26); }
        .sub-btn:hover::before { opacity:1; }
        .sub-btn span,.sub-btn svg { position:relative; z-index:1; }
        .sub-btn:disabled { opacity:0.45; cursor:not-allowed; transform:none; }

        .dots { display:flex; gap:4px; align-items:center; }
        .dots span { width:5px; height:5px; background:#fff; border-radius:50%; animation:bounce 1.2s infinite; }
        .dots span:nth-child(2){animation-delay:0.2s}.dots span:nth-child(3){animation-delay:0.4s}
        @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}

        /* ── Divider / links ── */
        .div { display:flex; align-items:center; gap:12px; margin:20px 0; }
        .div::before,.div::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.06); }
        .div span { font-size:11px; color:rgba(255,255,255,0.2); text-transform:uppercase; letter-spacing:0.12em; white-space:nowrap; }

        .g-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:10px; background:rgba(255,255,255,0.04); border:1.5px solid rgba(255,255,255,0.09); border-radius:12px; padding:13px; color:rgba(255,255,255,0.8); font-family:'Outfit',sans-serif; font-size:14px; font-weight:400; cursor:pointer; transition:all 0.25s ease; }
        .g-btn:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.18); color:#fff; }

        .links-row { display:flex; justify-content:center; gap:24px; margin-top:16px; }
        .links-row a { font-size:12px; color:rgba(255,255,255,0.28); text-decoration:none; transition:color 0.2s; }
        .links-row a:hover { color:#38bdf8; }

        .sig-row { text-align:center; font-size:13px; color:rgba(255,255,255,0.3); margin-top:18px; }
        .sig-row a { color:#38bdf8; font-weight:500; text-decoration:none; transition:color 0.2s; }
        .sig-row a:hover { color:#7dd3fc; }

        @media(max-width:960px){ .lp{display:none;} .rp{width:100%;min-width:unset;padding:44px 28px;} }
      `}</style>

      <div className="lr">

        {/* ── LEFT PANEL ── */}
        <div className="lp">
          <img className="lp-bg" src="/login.jpg" alt="" />
          <div className="lp-ov" />
          <div className="lp-logo">
            <img src="/project.png" alt="Upskillize" onError={e => { e.target.style.display = 'none'; }} />
            <span className="lp-tag">Excel Beyond</span>
          </div>
          <div className="lp-body">
            <div className="lp-badge">
              <span className="dot" />
              <span className="txt">Live Sessions Available Now</span>
            </div>
            <h2 className="lp-h">
              Master Banking,<br />
              <em>Finance &amp; Product</em>
            </h2>
            <p className="lp-sub">
              Learn from India's top industry veterans. Real-world skills, industry-recognised certifications, and real careers.
            </p>
            <div className="stats">
              <div className="stat"><div className="num">12K+</div><div className="lbl">Learners</div></div>
              <div className="stat"><div className="num">95%</div><div className="lbl">Placement</div></div>
              <div className="stat"><div className="num">200+</div><div className="lbl">Mentors</div></div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="rp">
          <div className="rp-grid" />
          <div className="fb">
            <div className="ft">Welcome back</div>
            <div className="fs">Sign in to continue your learning journey</div>

            {error === '__PENDING__' ? (
              <>
                <div className="pend-box">
                  <div className="pend-icon">⏳</div>
                  <div className="pend-title">Account Pending Approval</div>
                  <div className="pend-desc">
                    Your account has been registered successfully but is awaiting admin approval before you can log in.
                  </div>
                  <div className="pend-steps">
                    <div className="pend-step"><div className="pend-num">✓</div>Account registered successfully</div>
                    <div className="pend-step"><div className="pend-num">2</div>Admin reviews and approves your account</div>
                    <div className="pend-step"><div className="pend-num">3</div>You receive approval — then you can log in</div>
                  </div>
                </div>
                <button
                  type="button"
                  style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:12, padding:'12px', color:'rgba(255,255,255,0.55)', fontFamily:"'Outfit',sans-serif", fontSize:13, cursor:'pointer' }}
                  onClick={() => { setError(''); refreshCaptcha(); }}
                >
                  ← Try a different account
                </button>
              </>
            ) : (
              <>
                {error && <div className="err-box">{error}</div>}

                {/* Google */}
                <button type="button" className="g-btn" onClick={handleGoogleLogin}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="div"><span>or sign in with email</span></div>

                <form onSubmit={handleSubmit}>
                  {/* Email */}
                  <div className="field">
                    <label>Email Address</label>
                    <div className="iw">
                      <input
                        type="email" name="email" value={formData.email}
                        onChange={handleChange} placeholder="example@gmail.com" required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="field">
                    <label>Password</label>
                    <div className="iw">
                      <input
                        type={showPassword ? 'text' : 'password'} name="password"
                        value={formData.password} onChange={handleChange}
                        placeholder="Enter your password" style={{ paddingRight: '44px' }} required
                      />
                      <button type="button" className="eye" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* ── CAPTCHA ── */}
                  <div className="cap-wrap">
                    <label className="cap-label">Security Verification</label>
                    <div className={`cap-row ${captchaShake ? 'cap-shake' : ''}`}>
                      {/* Distorted visual CAPTCHA */}
                      <CaptchaDisplay code={captchaCode} />
                      {/* Text input */}
                      <input
                        className="cap-input"
                        type="text"
                        value={captchaInput}
                        onChange={e => setCaptchaInput(e.target.value)}
                        placeholder="Type code"
                        maxLength={6}
                        autoComplete="off"
                        spellCheck={false}
                        required
                      />
                      {/* Refresh */}
                      <button type="button" className="cap-refresh" onClick={refreshCaptcha} title="New code">
                        <RefreshCw size={15} />
                      </button>
                    </div>
                    <div className="cap-hint">Type the 6-character code above — case sensitive</div>
                    {captchaError && <div className="cap-err">✗ {captchaError}</div>}
                  </div>

                  <button type="submit" className="sub-btn" disabled={loading}>
                    {loading
                      ? <div className="dots"><span /><span /><span /></div>
                      : <><span>Sign In</span><ArrowRight size={16} /></>
                    }
                  </button>
                </form>

                <div className="links-row">
                  <Link to="/forgot-password">Forgot Password?</Link>
                  <Link to="/change-password">Change Password</Link>
                </div>

                <div className="div"><span>New here?</span></div>
                <div className="sig-row">
                  Don't have an account?{' '}<Link to="/register">Create one free →</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}