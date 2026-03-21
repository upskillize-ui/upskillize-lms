import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BookOpen, Clock, Calendar, CheckCircle, X, PlayCircle,
  Gift, Lock, Star, ChevronRight, Zap, Trophy, AlertCircle
} from 'lucide-react';

// ─── Design Tokens (matching StudentDashboard) ───────────────────
const T = {
  navy:       '#1a2744',
  navyLight:  '#2c3e6b',
  gold:       '#b8960b',
  goldSoft:   '#fdf8ed',
  goldBorder: '#e8d89a',
  white:      '#ffffff',
  bg:         '#f7f8fc',
  border:     '#e8e9f0',
  text:       '#1a1a1a',
  muted:      '#72706b',
  subtle:     '#a8a49f',
  greenSoft:  '#eef2fb',   // was #edf7ed — now navy-tinted soft blue
  green:      '#1a2744',   // was #2d6a2d — now navy
  blueSoft:   '#eef2fb',
  blue:       '#1e3a6b',
  redSoft:    '#fdf1f0',
  red:        '#c0392b',
};

// ─── Shared styles injected once ────────────────────────────────
const BrowseStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,700&display=swap');

    .bc-root *, .bc-root *::before, .bc-root *::after { box-sizing: border-box; }
    .bc-root { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; line-height: 1.55; color: #1a1a1a; }

    /* Cards */
    .bc-card { background: #ffffff; border: 1px solid #e8e9f0; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(26,39,68,0.05), 0 3px 12px rgba(26,39,68,0.04); transition: box-shadow .26s ease, transform .26s ease, border-color .26s ease; }
    .bc-card:hover { box-shadow: 0 10px 28px rgba(26,39,68,0.13), 0 3px 10px rgba(26,39,68,0.08); transform: translateY(-4px) scale(1.018); border-color: #c8c4bc; }

    /* Tabs */
    .bc-tab-strip { background: #ffffff; border: 1px solid #e8e9f0; border-radius: 10px; padding: 4px; display: inline-flex; gap: 2px; box-shadow: 0 1px 4px rgba(26,39,68,0.05); }
    .bc-tab { padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; background: transparent; color: #72706b; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .18s; }
    .bc-tab:hover { background: #f7f8fc; color: #1a1a1a; }
    .bc-tab.active { background: #1a2744; color: #ffffff; font-weight: 600; box-shadow: 0 2px 8px rgba(26,39,68,0.20); }

    /* Filter tabs */
    .bc-filter-tab { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1.5px solid transparent; background: transparent; color: #72706b; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .18s; }
    .bc-filter-tab:hover { background: #ffffff; border-color: #e8e9f0; color: #1a1a1a; }
    .bc-filter-tab.active { background: #1a2744; color: #ffffff; border-color: #1a2744; box-shadow: 0 2px 8px rgba(26,39,68,0.20); }

    /* Buttons */
    .bc-btn-primary { background: #1a2744; color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background .15s, box-shadow .15s, transform .15s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; box-shadow: 0 1px 4px rgba(26,39,68,0.15); }
    .bc-btn-primary:hover { background: #2c3e6b; box-shadow: 0 4px 12px rgba(26,39,68,0.22); transform: translateY(-1px); }
    .bc-btn-free { background: #1a2744; color: #fff; border: none; border-radius: 8px; padding: 9px 16px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; }
    .bc-btn-free:hover { background: #2c3e6b; box-shadow: 0 4px 12px rgba(26,39,68,0.30); transform: translateY(-1px); }
    .bc-btn-ghost { background: transparent; color: #1a2744; border: 1.5px solid #e8e9f0; border-radius: 8px; padding: 8px 14px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: all .18s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
    .bc-btn-ghost:hover { border-color: #1a2744; background: #f7f8fc; transform: translateY(-1px); }
    .bc-btn-quiz { background: linear-gradient(135deg, #1a2744 0%, #2c3e6b 100%); color: #b8960b; border: none; border-radius: 8px; padding: 9px 16px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; width: 100%; justify-content: center; border: 1px solid rgba(184,150,11,0.3); }
    .bc-btn-quiz:hover { background: linear-gradient(135deg, #2c3e6b 0%, #3d5280 100%); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(26,39,68,0.22); }

    /* Badges */
    .bc-badge-free { background: #eef2fb; color: #1a2744; border: 1px solid #c8d4ec; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
    .bc-badge-premium { background: #fdf8ed; color: #7a5e00; border: 1px solid #e8d89a; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
    .bc-badge-navy { background: #eef2fb; color: #1a2744; border: 1px solid #c8d4ec; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }

    /* Progress bar */
    .bc-bar-track { height: 4px; background: #e8e9f0; border-radius: 2px; overflow: hidden; }
    .bc-bar-fill-navy { height: 100%; border-radius: 2px; background: #1a2744; transition: width .5s; }
    .bc-bar-fill-green { height: 100%; border-radius: 2px; background: #1a2744; transition: width .5s; }
    .bc-bar-fill-gold { height: 100%; border-radius: 2px; background: #b8960b; transition: width .5s; }

    /* Section title */
    .bc-section-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #1a2744; letter-spacing: -0.3px; margin-bottom: 4px; }
    .bc-section-sub { font-size: 12px; color: #a8a49f; font-weight: 400; }

    /* Empty state */
    .bc-empty { text-align: center; padding: 52px 20px; background: #ffffff; border: 1px solid #e8e9f0; border-radius: 14px; color: #a8a49f; }
    .bc-empty p { margin: 8px 0 0; font-size: 13px; }

    /* Upgrade banner */
    .bc-upgrade { background: #1a2744; border-radius: 14px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 4px 14px rgba(26,39,68,0.18); }
    .bc-upgrade-btn { background: #b8960b; color: #1a2744; padding: 9px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none; white-space: nowrap; transition: all .15s; display: inline-block; }
    .bc-upgrade-btn:hover { background: #d4ac10; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(184,150,11,0.35); }

    /* Quiz modal */
    .bc-modal-bg { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(26,39,68,0.55); backdrop-filter: blur(4px); }
    .bc-modal { background: #ffffff; border-radius: 16px; box-shadow: 0 24px 64px rgba(26,39,68,0.22); width: 100%; max-width: 520px; overflow: hidden; }
    .bc-modal-head { background: #1a2744; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; }

    /* Quiz option */
    .bc-quiz-option { width: 100%; text-align: left; padding: 11px 14px; border-radius: 8px; border: 1.5px solid #e8e9f0; background: #ffffff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; cursor: pointer; transition: all .18s; display: flex; align-items: center; gap: 10px; }
    .bc-quiz-option:hover { border-color: #1a2744; background: #f7f8fc; }
    .bc-quiz-option.selected { border-color: #1a2744; background: #eef2fb; color: #1a2744; }

    /* Lock overlay */
    .bc-lock-overlay { position: absolute; inset: 0; background: rgba(247,248,252,0.85); backdrop-filter: blur(2px); z-index: 10; display: flex; align-items: center; justify-content: center; border-radius: 14px; }

    /* Spinner */
    .bc-spin { display: flex; align-items: center; justify-content: center; height: 200px; }
    .bc-spinner { width: 28px; height: 28px; border: 2px solid #e8e9f0; border-top-color: #1a2744; border-radius: 50%; animation: bc-spin .7s linear infinite; }
    @keyframes bc-spin { to { transform: rotate(360deg); } }

    /* Meta row icons */
    .bc-meta { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #a8a49f; }
  `}</style>
);

// ─── Which courses are FREE ──────────────────────────────────────
const FREE_COURSE_KEYWORDS = [
  'mba++', 'mba ++',
  'corporate readiness',
  'bfsi', 'bfsi domain',
  'banking foundation', 'bank-found',
  'payments & cards', 'payments and cards', 'pay-cards',
];

// ─── YouTube thumbnails map ──────────────────────────────────────
const YOUTUBE_THUMBNAILS = {
  37: 'y3HKCaLPqtU',
  42: 'cG1kVkzS2pE',
};

const COURSE_VIDEOS = {
  37: 'https://www.youtube.com/embed/y3HKCaLPqtU?rel=0&modestbranding=1',
  42: 'https://www.youtube.com/embed/cG1kVkzS2pE?rel=0&modestbranding=1',
};

const isYouTubeUrl = (url) => url?.includes('youtube.com/embed');
const getYouTubeId = (url) => url?.split('/embed/')[1]?.split('?')[0];

function isFreeCourse(courseName = '', courseCode = '') {
  const name = courseName.toLowerCase().trim();
  const code = courseCode.toLowerCase().trim();
  return FREE_COURSE_KEYWORDS.some(kw => name.includes(kw) || code.includes(kw));
}

// ─── Quiz Data ───────────────────────────────────────────────────
const COURSE_QUIZZES = {
  37: {
    title: 'Banking Foundation Quiz',
    questions: [
      { q: 'What is the primary function of a central bank?', options: ['Provide retail loans', 'Regulate monetary policy & issue currency', 'Offer savings accounts', 'Finance businesses'], answer: 1 },
      { q: 'Which of the following is a liability for a commercial bank?', options: ['Loans given to customers', 'Investments in securities', 'Customer deposits', 'Bank premises'], answer: 2 },
      { q: 'What does KYC stand for in banking?', options: ['Know Your Currency', 'Keep Your Credit', 'Know Your Customer', 'Key Yield Calculation'], answer: 2 },
      { q: 'What is the CRR (Cash Reserve Ratio)?', options: ['Percentage of deposits banks must keep with the central bank', 'Rate at which banks lend to each other', 'Minimum capital banks must maintain', 'Interest rate on savings accounts'], answer: 0 },
      { q: 'Which document is NOT typically required to open a bank account?', options: ['Aadhaar Card', 'PAN Card', 'Passport', 'Vehicle Registration'], answer: 3 },
    ],
  },
  42: {
    title: 'Payments & Cards Quiz',
    questions: [
      { q: 'What does EMV stand for on a chip card?', options: ['Electronic Money Vault', 'Europay Mastercard Visa', 'Enhanced Mobile Verification', 'Encrypted Message Validation'], answer: 1 },
      { q: 'Which payment rail is used for real-time gross settlement in India?', options: ['NEFT', 'RTGS', 'IMPS', 'UPI'], answer: 1 },
      { q: 'What is a CVV number on a credit card used for?', options: ['Identifying the card network', 'Card verification for online transactions', 'Storing reward points', 'Setting spending limits'], answer: 1 },
      { q: 'UPI transactions in India are processed through which system?', options: ['SWIFT', 'NPCI', 'RBI Direct', 'SEBI'], answer: 1 },
      { q: 'What is the difference between a debit card and a credit card?', options: ['Debit cards are only for online use', 'Credit cards deduct money immediately from your account', 'Debit cards use your own funds; credit cards use borrowed money', 'There is no difference'], answer: 2 },
    ],
  },
};

// ─── Quiz Modal ──────────────────────────────────────────────────
function QuizModal({ quizData, onClose }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const question = quizData.questions[current];
  const total = quizData.questions.length;
  const score = answers.filter((a, i) => a === quizData.questions[i].answer).length;
  const pct = submitted ? Math.round((score / total) * 100) : 0;

  const grade =
    pct >= 80 ? { label: 'Excellent!', color: T.navy, bg: T.blueSoft }
    : pct >= 60 ? { label: 'Good Job!', color: T.navyLight, bg: T.blueSoft }
    : { label: 'Keep Practicing', color: '#7a5e00', bg: T.goldSoft };

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    if (current + 1 < total) { setAnswers(newAnswers); setCurrent(current + 1); setSelected(null); }
    else { setAnswers(newAnswers); setSubmitted(true); }
  };

  const handleRetry = () => { setCurrent(0); setSelected(null); setAnswers([]); setSubmitted(false); };

  return (
    <div className="bc-modal-bg">
      <div className="bc-modal">
        {/* Header */}
        <div className="bc-modal-head">
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.12em', color: T.gold, marginBottom: 2 }}>Assessment</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{quizData.title}</h3>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {!submitted ? (
            <>
              {/* Progress */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>Question {current + 1} of {total}</span>
                <span style={{ fontSize: 11, color: T.muted }}>{Math.round((current / total) * 100)}% done</span>
              </div>
              <div className="bc-bar-track" style={{ marginBottom: 20 }}>
                <div className="bc-bar-fill-navy" style={{ width: `${(current / total) * 100}%` }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: T.navy, marginBottom: 16, lineHeight: 1.5 }}>{question.q}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {question.options.map((opt, i) => (
                  <button key={i} onClick={() => setSelected(i)}
                    className={`bc-quiz-option ${selected === i ? 'selected' : ''}`}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: selected === i ? T.navy : '#e8e9f0', color: selected === i ? '#fff' : T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
              <button onClick={handleNext} disabled={selected === null} className="bc-btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: selected === null ? 0.4 : 1 }}>
                {current + 1 === total ? 'Submit Quiz' : 'Next Question →'}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: grade.bg, border: `2px solid ${grade.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: grade.color }}>{pct}%</span>
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: grade.color, marginBottom: 4 }}>{grade.label}</h4>
              <p style={{ fontSize: 12, color: T.muted, marginBottom: 20 }}>You scored <strong>{score}</strong> out of <strong>{total}</strong></p>

              {/* Review */}
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, maxHeight: 220, overflowY: 'auto' }}>
                {quizData.questions.map((qs, i) => {
                  const correct = answers[i] === qs.answer;
                  return (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: correct ? T.blueSoft : T.redSoft, border: `1px solid ${correct ? '#c8d4ec' : '#f7c1c1'}` }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 3 }}>{i + 1}. {qs.q}</p>
                      {!correct && <p style={{ fontSize: 11, color: T.red }}>Your answer: <em>{qs.options[answers[i]]}</em></p>}
                      <p style={{ fontSize: 11, fontWeight: 600, color: T.navy }}>✓ {qs.options[qs.answer]}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleRetry} className="bc-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Retry Quiz</button>
                <button onClick={onClose} className="bc-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Circular Progress ───────────────────────────────────────────
function CircularProgress({ percentage, size = 90, strokeWidth = 7 }) {
  const r = (size - strokeWidth) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage >= 75 ? T.navy : percentage >= 50 ? T.navyLight : percentage >= 25 ? T.gold : T.red;
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={T.border} strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .5s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{percentage}%</span>
      </div>
    </div>
  );
}

// ─── My Enrolled Courses Tab ─────────────────────────────────────
function MyCourses({ onSwitchToBrowse }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [withdrawing, setWithdrawing] = useState(null);
  const [openVideo, setOpenVideo] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => { fetchEnrollments(); }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/enrollments/my-enrollments');
      if (res.data?.success) setEnrollments(res.data.enrollments || []);
    } catch {}
    finally { setLoading(false); }
  };

  const handleWithdraw = async (enrollmentId, courseName) => {
    if (!window.confirm(`Withdraw from "${courseName}"? This cannot be undone.`)) return;
    setWithdrawing(enrollmentId);
    try {
      await api.delete(`/enrollments/${enrollmentId}`);
      setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
    } catch { alert('Error withdrawing from course'); }
    finally { setWithdrawing(null); }
  };

  const filtered = enrollments.filter(e => {
    if (filter === 'in-progress') return (e.progress_percentage || 0) < 100;
    if (filter === 'completed') return (e.progress_percentage || 0) === 100;
    return true;
  });

  if (loading) return <div className="bc-spin"><div className="bc-spinner" /></div>;

  return (
    <div style={{ marginTop: 6 }}>
      {activeQuiz && <QuizModal quizData={activeQuiz} onClose={() => setActiveQuiz(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="bc-section-title">My Courses</h2>
          <p className="bc-section-sub">{filtered.length} course{filtered.length !== 1 ? 's' : ''} enrolled</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'in-progress', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`bc-filter-tab ${filter === f ? 'active' : ''}`} style={{ textTransform: 'capitalize' }}>
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bc-empty">
          <BookOpen size={36} style={{ color: T.border, margin: '0 auto 10px' }} />
          <p>{filter === 'all' ? "You haven't enrolled in any courses yet" : `No ${filter.replace('-', ' ')} courses`}</p>
          {onSwitchToBrowse && (
            <button onClick={onSwitchToBrowse} className="bc-btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
              Browse Courses
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map((enrollment) => {
            const course = enrollment.Course || {};
            const progress = enrollment.progress_percentage || 0;
            const videoSrc = COURSE_VIDEOS[course.id];
            const isVideoOpen = openVideo === enrollment.id;

            return (
              <div key={enrollment.id} className="bc-card">
                {/* Top progress line */}
                <div className="bc-bar-track" style={{ borderRadius: 0 }}>
                  <div className="bc-bar-fill-navy" style={{ width: `${progress}%` }} />
                </div>

                {/* Video section */}
                {videoSrc && (
                  <div style={{ background: '#0b1623' }}>
                    {isVideoOpen ? (
                      <div style={{ position: 'relative' }}>
                        <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                          <iframe className="absolute inset-0 w-full h-full"
                            src={videoSrc + '&autoplay=1'} title={course.course_name}
                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen />
                        </div>
                        <button onClick={() => setOpenVideo(null)}
                          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setOpenVideo(enrollment.id)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background .15s' }}>
                        {YOUTUBE_THUMBNAILS[course.id] ? (
                          <div style={{ width: 60, height: 38, borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={`https://img.youtube.com/vi/${YOUTUBE_THUMBNAILS[course.id]}/mqdefault.jpg`}
                              alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <PlayCircle size={16} style={{ color: '#fff' }} />
                          </div>
                        )}
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: T.gold, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 1 }}>Course Video</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Watch overview</p>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>▶ Play</span>
                      </button>
                    )}
                  </div>
                )}

                <div style={{ padding: 18 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: T.navy, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{course.course_name}</h3>
                  <p style={{ fontSize: 12, color: T.muted, marginBottom: 16, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{course.description}</p>

                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                    <CircularProgress percentage={progress} size={80} strokeWidth={6} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                    <span className="bc-meta"><Clock size={11} /> {course.duration_hours}h</span>
                    <span className="bc-meta"><Calendar size={11} /> {new Date(enrollment.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    <span className="bc-meta"><Star size={11} style={{ color: T.gold }} /> 4.8</span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <Link to={`/student/course/${course.id}`} className="bc-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      <PlayCircle size={13} /> {progress === 100 ? 'Review' : 'Continue'}
                    </Link>
                    {progress < 100 && (
                      <button onClick={() => handleWithdraw(enrollment.id, course.course_name)}
                        disabled={withdrawing === enrollment.id}
                        style={{ background: T.redSoft, color: T.red, border: '1.5px solid #f7c1c1', borderRadius: 8, padding: '0 10px', cursor: 'pointer', transition: 'all .15s', fontSize: 12 }}>
                        {withdrawing === enrollment.id ? '...' : <X size={13} />}
                      </button>
                    )}
                  </div>

                  {COURSE_QUIZZES[course.id] && (
                    <button onClick={() => setActiveQuiz(COURSE_QUIZZES[course.id])} className="bc-btn-quiz" style={{ marginTop: 4 }}>
                      <Trophy size={13} /> Take Quiz
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Browse Courses Component ───────────────────────────────
export default function BrowseCourses() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const navigate = useNavigate();

  const isPurchased = user?.is_purchased || user?.role === 'admin' || user?.role === 'faculty';

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data?.success) setCourses(res.data.courses || []);
      else if (Array.isArray(res.data)) setCourses(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  const handleEnroll = async (courseId, courseName, courseCode, isFree) => {
    if (!isFree && !isPurchased) { navigate('/pricing'); return; }
    if (!isFree && isPurchased) { navigate(`/student/payment/${courseId}`); return; }
    if (!window.confirm(`Enroll in "${courseName}" for free?`)) return;
    setEnrolling(courseId);
    try {
      const res = await api.post('/enrollments', { course_id: courseId });
      if (res.data?.success) { alert(`✅ Enrolled in "${courseName}"!`); setActiveTab('my-courses'); }
    } catch (err) {
      if (err.response?.status === 400) { alert('You are already enrolled!'); setActiveTab('my-courses'); }
      else alert('Error enrolling. Please try again.');
    } finally { setEnrolling(null); }
  };

  return (
    <div className="bc-root">
      <BrowseStyles />

      {activeQuiz && <QuizModal quizData={activeQuiz} onClose={() => setActiveQuiz(null)} />}

      {/* Tab strip */}
      <div style={{ marginBottom: 24 }}>
        <div className="bc-tab-strip">
          <button onClick={() => setActiveTab('browse')} className={`bc-tab ${activeTab === 'browse' ? 'active' : ''}`}>
            Browse Courses
          </button>
          <button onClick={() => setActiveTab('my-courses')} className={`bc-tab ${activeTab === 'my-courses' ? 'active' : ''}`}>
            My Courses
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <h2 className="bc-section-title">Available Courses</h2>
              <p className="bc-section-sub">
                {isPurchased ? '✓ You have full access to all courses' : '3 free courses available · Upgrade to unlock all'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="bc-badge-free"><Gift size={12} /> Free</span>
              <span className="bc-badge-premium" style={{ background: T.goldSoft, color: '#7a5e00', border: `1px solid ${T.goldBorder}` }}>
                <Zap size={12} /> Premium
              </span>
            </div>
          </div>

          {/* Upgrade Banner */}
          {!isPurchased && (
            <div className="bc-upgrade" style={{ marginBottom: 24 }}>
              <div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                  Unlock All Courses
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                  Get access to all premium courses, certificates, exams & more
                </p>
              </div>
              <Link to="/pricing" className="bc-upgrade-btn">View Plans →</Link>
            </div>
          )}

          {/* Course Grid */}
          {loading ? (
            <div className="bc-spin"><div className="bc-spinner" /></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {courses.map((course) => {
                const courseName = course.course_name || course.name || '';
                const courseCode = course.course_code || '';
                const isFree = isFreeCourse(courseName, courseCode);
                const isLocked = !isFree && !isPurchased;
                const isEnrolling = enrolling === course.id;

                return (
                  <div key={course.id} className="bc-card" style={{ position: 'relative' }}>
                    {/* Top color accent line — navy for free, gold for premium */}
                    <div style={{ height: 3, background: isFree ? T.navy : T.gold }} />

                    {/* Lock overlay */}
                    {isLocked && (
                      <div className="bc-lock-overlay">
                        <div style={{ textAlign: 'center', padding: 20 }}>
                          <div style={{ width: 52, height: 52, background: T.goldSoft, border: `1.5px solid ${T.goldBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                            <Lock size={22} style={{ color: T.gold }} />
                          </div>
                          <p style={{ fontWeight: 700, fontSize: 13, color: T.navy, marginBottom: 4 }}>Premium Course</p>
                          <p style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>Purchase a plan to access</p>
                          <Link to="/pricing" className="bc-btn-primary" style={{ fontSize: 12, padding: '7px 14px' }}>Unlock Now</Link>
                        </div>
                      </div>
                    )}

                    <div style={{ padding: 18 }}>
                      {/* Badge row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        {isFree
                          ? <span className="bc-badge-free"><Gift size={11} /> FREE</span>
                          : <span className="bc-badge-premium"><Zap size={11} /> PREMIUM</span>}
                        <span className="bc-meta"><Star size={11} style={{ color: T.gold }} /> 4.8</span>
                      </div>

                      <h3 style={{ fontSize: 13, fontWeight: 600, color: T.navy, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8, lineHeight: 1.4 }}>{courseName}</h3>
                      <p style={{ fontSize: 12, color: T.muted, marginBottom: 14, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{course.description}</p>

                      <div style={{ display: 'flex', gap: 14, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span className="bc-meta"><Clock size={11} /> {course.duration_hours}h</span>
                        <span className="bc-meta" style={{ textTransform: 'capitalize' }}>
                          <CheckCircle size={11} style={{ color: T.navy }} /> {course.difficulty_level || 'Beginner'}
                        </span>
                        {course.CourseModules && course.CourseModules.length > 0 && (
                          <span className="bc-meta">
                            <BookOpen size={11} /> {course.CourseModules.length} module{course.CourseModules.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Module pills for free courses */}
                      {isFree && course.CourseModules && course.CourseModules.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                          {course.CourseModules
                            .slice()
                            .sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0))
                            .map((mod, mi) => (
                              <span key={mod.id} style={{
                                background: T.blueSoft,
                                border: '1px solid #c8d4ec',
                                color: T.navy,
                                borderRadius: 20,
                                padding: '2px 9px',
                                fontSize: 10.5,
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}>
                                <span style={{ opacity: 0.5 }}>{mi + 1}.</span>
                                {mod.module_name.replace(/^module\s*\d+[:\-\s]*/i, '')}
                                {mod.Lessons?.length > 0 && (
                                  <span style={{ opacity: 0.55 }}>· {mod.Lessons.length}</span>
                                )}
                              </span>
                            ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8, marginBottom: isFree ? 8 : 0 }}>
                        <Link to={`/course/${course.id}`} className="bc-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                          View Details
                        </Link>
                        <button
                          onClick={() => handleEnroll(course.id, courseName, courseCode, isFree)}
                          disabled={isEnrolling || isLocked}
                          className={isFree ? 'bc-btn-free' : 'bc-btn-primary'}
                          style={{ flex: 1, justifyContent: 'center', opacity: isLocked ? 0.5 : 1 }}>
                          {isEnrolling ? (
                            <><div className="bc-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Enrolling...</>
                          ) : isFree ? (
                            <><Gift size={13} /> Enroll Free</>
                          ) : (
                            <><Zap size={13} /> Enroll Now</>
                          )}
                        </button>
                      </div>

                      {isFree && (
                        <p style={{ fontSize: 11, textAlign: 'center', color: T.navy, fontWeight: 500, marginBottom: COURSE_QUIZZES[course.id] ? 8 : 0 }}>
                          ✓ Free access · No payment required
                        </p>
                      )}

                      {isFree && COURSE_QUIZZES[course.id] && (
                        <button onClick={() => setActiveQuiz(COURSE_QUIZZES[course.id])} className="bc-btn-quiz">
                          <Trophy size={13} /> Take Quiz
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <MyCourses onSwitchToBrowse={() => setActiveTab('browse')} />
      )}
    </div>
  );
}

// ─── Free Courses Widget (Student Dashboard) ─────────────────────
export function FreeCoursesWidget() {
  const { user } = useAuth();
  if (user?.is_purchased || user?.role === 'admin' || user?.role === 'faculty') return null;

  const freeCourses = [
    { name: 'MBA++', icon: '🎓', path: '/student/browse' },
    { name: 'Corporate Readiness', icon: '💼', path: '/student/browse' },
    { name: 'BFSI Domain Excellence', icon: '🏦', path: '/student/browse' },
    { name: 'Banking Foundation', icon: '🏛️', path: '/student/browse' },
    { name: 'Payments & Cards', icon: '💳', path: '/student/browse' },
  ];

  return (
    <div style={{ background: T.goldSoft, border: `1px solid ${T.goldBorder}`, borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: 8, background: T.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Gift size={18} style={{ color: T.gold }} />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: T.navy }}>Your Free Courses</h3>
          <p style={{ fontSize: 11, color: T.muted }}>Included at no cost</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginBottom: 16 }}>
        {freeCourses.map((course, idx) => (
          <a key={idx} href={course.path}
            style={{ background: T.white, borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${T.goldBorder}`, textDecoration: 'none', transition: 'all .18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.boxShadow = '0 3px 10px rgba(184,150,11,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.goldBorder; e.currentTarget.style.boxShadow = 'none'; }}>
            <span style={{ fontSize: 18 }}>{course.icon}</span>
            <span style={{ fontWeight: 600, color: T.navy, fontSize: 12 }}>{course.name}</span>
          </a>
        ))}
      </div>
      <a href="/pricing"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.navy, color: T.gold, padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'all .15s' }}
        onMouseEnter={e => e.currentTarget.style.background = T.navyLight}
        onMouseLeave={e => e.currentTarget.style.background = T.navy}>
        <Lock size={13} /> Unlock All Courses
      </a>
    </div>
  );
}