import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, Users, Award, TrendingUp, ArrowRight, CheckCircle, Star, 
  PlayCircle, Zap, Target, Globe, X, Briefcase, GraduationCap, 
  Building2, Linkedin, Mail, MapPin, Phone, Twitter 
} from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeModal(); };
    if (showDemo) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [showDemo]);

  const openModal = () => setShowDemo(true);
  const closeModal = () => {
    setShowDemo(false);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .home-root {
          min-height: 100vh;
          background: #0a0f1e;
          font-family: 'DM Sans', sans-serif;
        }

        .home-root::before {
          content: '';
          position: fixed; top: -200px; right: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none; z-index: 0;
        }
        .home-root::after {
          content: '';
          position: fixed; bottom: -200px; left: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%);
          border-radius: 50%; pointer-events: none; z-index: 0;
        }

        /* NAVBAR */
        .home-nav {
          background: #ffffff;
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          position: sticky; top: 0; z-index: 40;
        }
        .home-nav-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 24px;
          display: flex; justify-content: space-between; align-items: center; height: 64px;
        }
        /* Navbar logo */
        .nav-logo img {
          height: 44px; width: auto; object-fit: contain;
        }
        .nav-links { display: flex; align-items: center; gap: 16px; }
        .nav-login { color: rgba(0,0,0,0.6); text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-login:hover { color: #1d6fa4; }
        .nav-signup {
          background: linear-gradient(135deg, #1d6fa4, #6d4dba);
          color: #fff; text-decoration: none; font-size: 14px; font-weight: 600;
          padding: 9px 20px; border-radius: 10px; transition: opacity 0.2s;
          position: relative; overflow: hidden;
        }
        .nav-signup::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, #38bdf8, #a78bfa);
          opacity: 0; transition: opacity 0.3s;
        }
        .nav-signup:hover::before { opacity: 1; }
        .nav-signup span { position: relative; z-index: 1; }
        .nav-dashboard {
          background: linear-gradient(135deg, #f97316, #ef4444);
          color: #fff; text-decoration: none; font-size: 14px; font-weight: 600;
          padding: 9px 20px; border-radius: 10px; transition: opacity 0.2s;
        }
        .nav-dashboard:hover { opacity: 0.85; }

        /* HERO */
        .hero { position: relative; overflow: hidden; padding: 100px 24px; text-align: center; z-index: 1; }
        .hero-blob1 { position: absolute; top: -60px; right: -60px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
        .hero-blob2 { position: absolute; top: -60px; left: -60px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
        .hero-blob3 { position: absolute; bottom: -80px; left: 50%; transform: translateX(-50%); width: 400px; height: 400px; background: radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%); border-radius: 50%; pointer-events: none; }
        .hero-inner { max-width: 900px; margin: 0 auto; position: relative; z-index: 1; }

        /* ✨ HERO LOGO — beautiful floating logo with glow ring */
        .hero-logo-wrap {
          position: relative;
          display: inline-block;
          margin: 0 auto 40px;
        }
        .hero-logo-wrap::before {
          content: '';
          position: absolute;
          inset: -12px;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(56,189,248,0.18), rgba(167,139,250,0.18), rgba(251,146,60,0.12));
          filter: blur(16px);
          z-index: -1;
          animation: logo-pulse 3s ease-in-out infinite;
        }
        @keyframes logo-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        .hero-logo-wrap::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(56,189,248,0.3), rgba(167,139,250,0.3), rgba(251,146,60,0.2));
          z-index: -1;
        }
        .hero-logo-img {
          height: 90px;
          width: auto;
          object-fit: contain;
          display: block;
          border-radius: 18px;
          /* KEY FIX: mix-blend-mode removes white background */
          mix-blend-mode: screen;
          filter: brightness(1.15) contrast(1.05) saturate(1.1);
          padding: 8px 16px;
          background: rgba(255,255,255,0.03);
        }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.2);
          color: #38bdf8; padding: 8px 18px; border-radius: 100px;
          font-size: 13px; font-weight: 500; margin-bottom: 32px;
        }
        .hero-h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 6vw, 5rem); font-weight: 900;
          color: #fff; line-height: 1.1; margin-bottom: 24px;
        }
        .hero-h1 span {
          background: linear-gradient(90deg, #38bdf8, #a78bfa, #fb923c);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub { font-size: clamp(1rem, 2vw, 1.2rem); color: rgba(255,255,255,0.5); font-weight: 300; max-width: 620px; margin: 0 auto 40px; line-height: 1.7; }
        .hero-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin-bottom: 48px; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #1d6fa4, #6d4dba);
          color: #fff; padding: 16px 32px; border-radius: 14px;
          font-size: 16px; font-weight: 600; text-decoration: none;
          border: none; cursor: pointer; transition: all 0.3s;
          position: relative; overflow: hidden;
        }
        .btn-primary::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, #38bdf8, #a78bfa); opacity: 0; transition: opacity 0.3s; }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary span, .btn-primary svg { position: relative; z-index: 1; }

        .btn-secondary {
          display: inline-flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.12);
          color: #fff; padding: 16px 32px; border-radius: 14px;
          font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(56,189,248,0.4); }

        .play-icon { width: 34px; height: 34px; background: linear-gradient(135deg, #38bdf8, #a78bfa); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        .trust-row { display: flex; flex-wrap: wrap; justify-content: center; gap: 28px; }
        .trust-item { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.45); font-size: 14px; }

        /* SECTIONS */
        .section { padding: 80px 24px; position: relative; z-index: 1; }
        .section-inner { max-width: 1280px; margin: 0 auto; }
        .section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #fff; margin-bottom: 10px; }
        .section-sub { color: rgba(255,255,255,0.4); font-size: 15px; font-weight: 300; margin-bottom: 52px; }

        /* CARDS */
        .cards-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .cards-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 24px; }
        .dark-card { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; transition: all 0.3s; }
        .dark-card:hover { background: rgba(255,255,255,0.07); border-color: rgba(56,189,248,0.25); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        .card-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .card-title { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .card-desc { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.7; margin-bottom: 16px; }
        .card-list { list-style: none; padding: 0; margin: 0; }
        .card-list li { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.45); font-size: 13px; margin-bottom: 8px; }

        /* STATS */
        .stats-bar { background: linear-gradient(135deg, #0f2952 0%, #1a1040 100%); border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 60px 24px; position: relative; z-index: 1; }
        .stats-grid { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 32px; text-align: center; }
        .stat-num { font-family: 'Playfair Display', serif; font-size: 3rem; font-weight: 900; background: linear-gradient(90deg, #38bdf8, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; margin-bottom: 8px; }
        .stat-lbl { color: rgba(255,255,255,0.4); font-size: 14px; }

        /* HOW IT WORKS */
        .steps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 40px; }
        .step-circle { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 900; }
        .step-title { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .step-desc { color: rgba(255,255,255,0.4); font-size: 14px; line-height: 1.6; }

        /* CTA */
        .cta-section { background: linear-gradient(135deg, #f97316, #ef4444); padding: 80px 24px; text-align: center; position: relative; z-index: 1; }
        .cta-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 900; color: #fff; margin-bottom: 16px; }
        .cta-sub { color: rgba(255,255,255,0.8); font-size: 16px; margin-bottom: 36px; }
        .cta-btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }
        .cta-btn-white { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #ea580c; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 15px; text-decoration: none; transition: background 0.2s; }
        .cta-btn-white:hover { background: #f1f5f9; }
        .cta-btn-outline { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.5); color: #fff; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; transition: background 0.2s; }
        .cta-btn-outline:hover { background: rgba(255,255,255,0.25); }

        /* FOOTER */
        .home-footer { background: #060b15; border-top: 1px solid rgba(255,255,255,0.06); padding: 60px 24px 32px; position: relative; z-index: 1; }
        .footer-grid { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); gap: 40px; margin-bottom: 40px; }
        .footer-logo { height: 44px; width: auto; object-fit: contain; margin-bottom: 16px; display: block; mix-blend-mode: screen; filter: brightness(1.1); }
        .footer-tagline { color: rgba(255,255,255,0.35); font-size: 12px; margin-bottom: 4px; }
        .footer-heading { color: #fff; font-weight: 600; font-size: 14px; margin-bottom: 16px; }
        .footer-links { list-style: none; padding: 0; margin: 0; }
        .footer-links li { margin-bottom: 10px; }
        .footer-links a { color: rgba(255,255,255,0.4); font-size: 13px; text-decoration: none; transition: color 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .footer-links a:hover { color: #38bdf8; }
        .footer-contact-item { display: flex; align-items: flex-start; gap: 8px; color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 10px; }
        .footer-contact-item a { color: rgba(255,255,255,0.4); text-decoration: none; }
        .footer-contact-item a:hover { color: #38bdf8; }
        .footer-bottom { max-width: 1280px; margin: 0 auto; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .footer-copy { color: rgba(255,255,255,0.25); font-size: 12px; }
        .footer-legal { display: flex; gap: 20px; }
        .footer-legal a { color: rgba(255,255,255,0.25); font-size: 12px; text-decoration: none; transition: color 0.2s; }
        .footer-legal a:hover { color: #38bdf8; }

        @media (max-width: 900px) {
          .cards-3, .cards-4, .steps-grid, .stats-grid, .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="home-root">

        {/* NAVBAR */}
        <nav className="home-nav">
          <div className="home-nav-inner">
            <Link to="/" className="nav-logo">
              <img src="/project.png" alt="Upskillize" onError={(e) => { e.target.style.display = 'none'; }} />
            </Link>
            <div className="nav-links">
              {user ? (
                <Link to={user.role === 'student' ? '/student' : '/faculty'} className="nav-dashboard">Dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="nav-login">Login</Link>
                  <Link to="/register" className="nav-signup"><span>Sign Up Free</span></Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* DEMO MODAL */}
        {showDemo && (
          <div style={{ position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.85)',backdropFilter:'blur(6px)',padding:16 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
            <div style={{ position:'relative',width:'100%',maxWidth:900,borderRadius:20,overflow:'hidden',background:'#000' }}>
              <button onClick={closeModal} style={{ position:'absolute',top:12,right:12,zIndex:10,width:40,height:40,borderRadius:'50%',background:'rgba(0,0,0,0.6)',border:'none',color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <X size={20} />
              </button>
              <div style={{ position:'absolute',top:12,left:12,zIndex:10 }}>
                <span style={{ background:'linear-gradient(90deg,#38bdf8,#a78bfa)',color:'#fff',fontSize:12,fontWeight:700,padding:'6px 14px',borderRadius:100 }}>
                  🎬 Upskillize — Excel Beyond Your Potential
                </span>
              </div>
              <video ref={videoRef} style={{ width:'100%',display:'block',aspectRatio:'16/9',objectFit:'cover' }}
                src="/videos/excel-beyond-promo.mp4" controls autoPlay
                onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
              <div style={{ display:'none',aspectRatio:'16/9',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,background:'#111',color:'#fff',padding:40,textAlign:'center' }}>
                <div style={{ fontSize:48 }}>🎬</div>
                <p style={{ fontWeight:700 }}>Demo Video</p>
                <p style={{ color:'rgba(255,255,255,0.4)',fontSize:13 }}>Place the promo video into /public/videos/excel-beyond-promo.mp4</p>
              </div>
            </div>
            <p style={{ position:'absolute',bottom:24,color:'rgba(255,255,255,0.3)',fontSize:12 }}>
              Press <kbd style={{ background:'rgba(255,255,255,0.1)',padding:'2px 8px',borderRadius:4 }}>Esc</kbd> or click outside to close
            </p>
          </div>
        )}

        {/* HERO */}
        <div className="hero">
          <div className="hero-blob1" /><div className="hero-blob2" /><div className="hero-blob3" />
          <div className="hero-inner">

            <div className="hero-badge"><Zap size={14} />Academic & Corporate Courses | Business Consulting| IT Training & Products</div>
            <h1 className="hero-h1">Excel Beyond<br /><span>Your Potential</span></h1>
            <p className="hero-sub">Transform your career with Banking, Product Leadership & Financial Management expertise from industry veterans</p>
            <div className="hero-btns">
              {!user ? (
                <>
                  <Link to="/login" className="btn-primary"><span>Get Started Free</span><ArrowRight size={18} /></Link>
                  <button onClick={openModal} className="btn-secondary"><div className="play-icon"><PlayCircle size={16} color="#fff" /></div>Watch Demo</button>
                </>
              ) : (
                <>
                  <Link to={user.role === 'student' ? '/student' : '/faculty'} className="btn-primary"><span>Go to Dashboard</span><ArrowRight size={18} /></Link>
                  <button onClick={openModal} className="btn-secondary"><div className="play-icon"><PlayCircle size={16} color="#fff" /></div>Watch Demo</button>
                </>
              )}
            </div>
            <div className="trust-row">
              <div className="trust-item"><CheckCircle size={16} color="#4ade80" /><span>10,000+ Learners</span></div>
              <div className="trust-item"><Star size={16} color="#fbbf24" /><span>4.9/5 Rating</span></div>
              <div className="trust-item"><Building2 size={16} color="#38bdf8" /><span>50-200 Employees</span></div>
              <div className="trust-item"><MapPin size={16} color="#fb923c" /><span>Bengaluru, India</span></div>
            </div>
          </div>
        </div>

        {/* SPECIALIZATIONS */}
        <div className="section">
          <div className="section-inner">
            <div style={{ textAlign:'center' }}>
              <h2 className="section-title">Our Specializations</h2>
              <p className="section-sub">Industry-focused programs designed for real-world impact</p>
            </div>
            <div className="cards-3">
              {[
                { icon:<Briefcase size={28} color="#38bdf8" />, bg:'rgba(56,189,248,0.15)', title:'Banking & Finance', desc:'Master banking operations, credit analysis, risk management, and financial instruments from BFSI experts', items:['Core Banking & Trade Finance','Credit Risk & Portfolio Management','Retail & Corporate Banking'] },
                { icon:<Target size={28} color="#a78bfa" />, bg:'rgba(167,139,250,0.15)', title:'Product Leadership', desc:'Learn product strategy, roadmaps, and go-to-market execution from seasoned product leaders', items:['Product Lifecycle & Strategy','Agile & Scrum Frameworks','Stakeholder Management & GTM'] },
                { icon:<TrendingUp size={28} color="#fb923c" />, bg:'rgba(251,146,60,0.15)', title:'Financial Management', desc:'Build expertise in financial modeling, valuation, budgeting, and investment analysis', items:['Financial Modeling & Valuation','Budgeting & Forecasting','Investment & Portfolio Analysis'] },
              ].map(({ icon, bg, title, desc, items }) => (
                <div className="dark-card" key={title}>
                  <div className="card-icon" style={{ background:bg }}>{icon}</div>
                  <div className="card-title">{title}</div>
                  <div className="card-desc">{desc}</div>
                  <ul className="card-list">{items.map(i => <li key={i}><CheckCircle size={13} color="#4ade80" style={{ flexShrink:0 }} />{i}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className="section" style={{ paddingTop:0 }}>
          <div className="section-inner">
            <div style={{ textAlign:'center' }}>
              <h2 className="section-title">Why Choose Upskillize?</h2>
              <p className="section-sub">Everything you need to succeed in your learning journey</p>
            </div>
            <div className="cards-4">
              {[
                { icon:<GraduationCap size={26} color="#38bdf8" />, bg:'rgba(56,189,248,0.15)', title:'MBA-Level Content', desc:'Curriculum benchmarked against IIM, ISB, and CFA standards for professional excellence' },
                { icon:<Users size={26} color="#a78bfa" />, bg:'rgba(167,139,250,0.15)', title:'Industry Experts', desc:'Learn from banking, finance, and product professionals with 10+ years experience' },
                { icon:<Award size={26} color="#fb923c" />, bg:'rgba(251,146,60,0.15)', title:'Capstone Projects', desc:'Real-world case studies and projects with industry-recognized certifications' },
                { icon:<Globe size={26} color="#4ade80" />, bg:'rgba(74,222,128,0.15)', title:'Flexible Learning', desc:'Hybrid model with live sessions, recorded content, and personalized mentorship' },
              ].map(({ icon, bg, title, desc }) => (
                <div className="dark-card" key={title}>
                  <div className="card-icon" style={{ background:bg }}>{icon}</div>
                  <div className="card-title">{title}</div>
                  <div className="card-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-bar">
          <div className="stats-grid">
            {[['10K+','Active Learners'],['100+','Expert Faculty'],['50+','Corporate Clients'],['98%','Completion Rate']].map(([num,lbl]) => (
              <div key={lbl}><div className="stat-num">{num}</div><div className="stat-lbl">{lbl}</div></div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="section">
          <div className="section-inner">
            <div style={{ textAlign:'center' }}>
              <h2 className="section-title">How It Works</h2>
              <p className="section-sub">Start learning in 3 simple steps</p>
            </div>
            <div className="steps-grid">
              {[
                { n:'1', bg:'rgba(56,189,248,0.12)', color:'#38bdf8', title:'Create Account', desc:'Sign up for free and set up your personalized learning profile' },
                { n:'2', bg:'rgba(167,139,250,0.12)', color:'#a78bfa', title:'Choose Course', desc:'Browse Banking, Product, or Finance programs that match your goals' },
                { n:'3', bg:'rgba(74,222,128,0.12)', color:'#4ade80', title:'Start Learning', desc:'Access course content, complete capstone projects, and earn certificates' },
              ].map(({ n, bg, color, title, desc }) => (
                <div key={n} style={{ textAlign:'center' }}>
                  <div className="step-circle" style={{ background:bg, color }}>{n}</div>
                  <div className="step-title">{title}</div>
                  <div className="step-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        {!user && (
          <div className="cta-section">
            <div style={{ maxWidth:700, margin:'0 auto' }}>
              <h2 className="cta-title">Ready to Excel Beyond?</h2>
              <p className="cta-sub">Join thousands of learners already transforming their careers in Banking, Product & Finance</p>
              <div className="cta-btns">
                <Link to="/register" className="cta-btn-white">Start Learning Today <ArrowRight size={18} /></Link>
                <button onClick={openModal} className="cta-btn-outline"><PlayCircle size={18} />Watch Demo</button>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="home-footer">
          <div className="footer-grid">
            <div>
              <img src="/project.png" alt="Upskillize" className="footer-logo" onError={(e) => { e.target.style.display='none'; }} />
              <p className="footer-tagline">Excel Beyond Your Potential</p>
              <p className="footer-tagline">Business Consulting | IT Products</p>
              <p className="footer-tagline">Academic & Corporate Courses</p>
              <div style={{ display:'flex',alignItems:'center',gap:6,marginTop:12 }}>
                <Building2 size={13} color="rgba(255,255,255,0.3)" />
                <span style={{ color:'rgba(255,255,255,0.3)',fontSize:12 }}>50-200 employees</span>
              </div>
            </div>
            <div>
              <div className="footer-heading">Company</div>
              <ul className="footer-links">
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><a href="https://www.linkedin.com/in/upskillize-excel-beyond" target="_blank" rel="noopener noreferrer"><Linkedin size={13} />LinkedIn</a></li>
                <li><a href="https://x.com/upskillize36330" target="_blank" rel="noopener noreferrer"><Twitter size={13} />Twitter</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-heading">Support</div>
              <ul className="footer-links">
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-heading">Contact</div>
              <div className="footer-contact-item"><MapPin size={14} color="#38bdf8" style={{ flexShrink:0,marginTop:2 }} /><span>Bengaluru, Karnataka, India</span></div>
              <div className="footer-contact-item"><Mail size={14} color="#38bdf8" style={{ flexShrink:0 }} /><a href="mailto:amit@upskillize.com">amit@upskillize.com</a></div>
              <div className="footer-contact-item"><Phone size={14} color="#38bdf8" style={{ flexShrink:0 }} /><span>+91 98203 97297</span></div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© {new Date().getFullYear()} Upskillize - Excel Beyond. All rights reserved.</div>
            <div className="footer-legal">
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/cookies">Cookies</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}