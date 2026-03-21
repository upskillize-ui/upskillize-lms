import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  ArrowLeft, Clock, BookOpen, CheckCircle,
  PlayCircle, Award, TrendingUp, Lock, Gift, Zap, Star,
  ChevronDown, ChevronUp, Video, FileText, HelpCircle, File
} from 'lucide-react';

// ─── Design Tokens ───────────────────────────────────────────────
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
  blueSoft:   '#eef2fb',
  redSoft:    '#fdf1f0',
  red:        '#c0392b',
};

// ─── Styles ──────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,700&display=swap');

    .cv-root *, .cv-root *::before, .cv-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .cv-root { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; line-height: 1.6; color: ${T.text}; background: ${T.bg}; min-height: 100vh; }

    /* Hero */
    .cv-hero { background: ${T.navy}; padding: 36px 0; }
    .cv-hero-inner { max-width: 1100px; margin: 0 auto; padding: 0 28px; display: grid; grid-template-columns: 1fr 340px; gap: 40px; align-items: start; }
    @media (max-width: 900px) { .cv-hero-inner { grid-template-columns: 1fr; } .cv-enroll-card { margin-top: 0 !important; } }

    /* Enroll Card */
    .cv-enroll-card { background: ${T.white}; border-radius: 16px; padding: 28px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); position: sticky; top: 20px; }

    /* Back bar */
    .cv-back-bar { background: ${T.white}; border-bottom: 1px solid ${T.border}; padding: 12px 28px; }
    .cv-back-btn { display: inline-flex; align-items: center; gap: 6px; color: ${T.muted}; font-size: 13px; font-weight: 500; background: none; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: color .15s; }
    .cv-back-btn:hover { color: ${T.navy}; }

    /* Body */
    .cv-body { max-width: 1100px; margin: 0 auto; padding: 32px 28px; display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start; }
    @media (max-width: 900px) { .cv-body { grid-template-columns: 1fr; } }

    /* Section card */
    .cv-card { background: ${T.white}; border: 1px solid ${T.border}; border-radius: 14px; padding: 24px; box-shadow: 0 1px 4px rgba(26,39,68,0.05); margin-bottom: 20px; }
    .cv-card-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: ${T.navy}; margin-bottom: 4px; }
    .cv-card-sub { font-size: 12px; color: ${T.subtle}; margin-bottom: 18px; }

    /* Module accordion */
    .cv-module { border: 1.5px solid ${T.border}; border-radius: 10px; overflow: hidden; margin-bottom: 10px; transition: border-color .2s; }
    .cv-module.open { border-color: ${T.navyLight}; }
    .cv-module-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: ${T.bg}; cursor: pointer; user-select: none; transition: background .15s; gap: 12px; }
    .cv-module-head:hover { background: ${T.blueSoft}; }
    .cv-module.open .cv-module-head { background: ${T.blueSoft}; }
    .cv-module-head-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
    .cv-module-num { width: 30px; height: 30px; border-radius: 8px; background: ${T.navy}; color: ${T.white}; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .cv-module.locked .cv-module-num { background: ${T.border}; color: ${T.subtle}; }
    .cv-module-name { font-size: 13px; font-weight: 600; color: ${T.navy}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cv-module.locked .cv-module-name { color: ${T.muted}; }
    .cv-module-desc { font-size: 11px; color: ${T.subtle}; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cv-module-meta { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .cv-module-count { font-size: 11px; color: ${T.muted}; white-space: nowrap; }

    /* Lessons list */
    .cv-lessons { border-top: 1px solid ${T.border}; }
    .cv-lesson { display: flex; align-items: center; gap: 12px; padding: 11px 16px; border-bottom: 1px solid ${T.border}; transition: background .15s; }
    .cv-lesson:last-child { border-bottom: none; }
    .cv-lesson:hover { background: ${T.bg}; }
    .cv-lesson-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .cv-lesson-icon.video { background: #eef2fb; color: ${T.navy}; }
    .cv-lesson-icon.pdf { background: #fdf1f0; color: ${T.red}; }
    .cv-lesson-icon.quiz { background: ${T.goldSoft}; color: ${T.gold}; }
    .cv-lesson-icon.text { background: #f0fdf0; color: #2d6a2d; }
    .cv-lesson-icon.locked { background: ${T.bg}; color: ${T.subtle}; }
    .cv-lesson-name { font-size: 12.5px; font-weight: 500; color: ${T.text}; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cv-lesson-name.locked { color: ${T.subtle}; }
    .cv-lesson-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .cv-lesson-dur { font-size: 11px; color: ${T.subtle}; }
    .cv-preview-badge { background: #eef2fb; color: ${T.navy}; border: 1px solid #c8d4ec; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
    .cv-premium-badge { background: ${T.goldSoft}; color: #7a5e00; border: 1px solid ${T.goldBorder}; padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }

    /* Badges */
    .cv-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }
    .cv-badge-navy { background: ${T.blueSoft}; color: ${T.navy}; border: 1px solid #c8d4ec; }
    .cv-badge-gold { background: ${T.goldSoft}; color: #7a5e00; border: 1px solid ${T.goldBorder}; }
    .cv-badge-free { background: ${T.blueSoft}; color: ${T.navy}; border: 1px solid #c8d4ec; }

    /* Stat row */
    .cv-stats { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
    .cv-stat { display: flex; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,0.75); }

    /* Buttons */
    .cv-btn-primary { background: ${T.navy}; color: ${T.white}; border: none; border-radius: 10px; padding: 13px 20px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none; transition: background .15s, transform .15s, box-shadow .15s; box-shadow: 0 2px 8px rgba(26,39,68,0.2); }
    .cv-btn-primary:hover { background: ${T.navyLight}; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(26,39,68,0.25); }
    .cv-btn-gold { background: ${T.gold}; color: ${T.navy}; border: none; border-radius: 10px; padding: 13px 20px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none; transition: all .15s; }
    .cv-btn-gold:hover { background: #d4ac10; transform: translateY(-1px); }
    .cv-btn-outline { background: transparent; color: ${T.navy}; border: 1.5px solid ${T.border}; border-radius: 10px; padding: 11px 20px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px; text-decoration: none; transition: all .15s; margin-top: 10px; }
    .cv-btn-outline:hover { border-color: ${T.navy}; background: ${T.blueSoft}; }

    /* Perk list */
    .cv-perk { display: flex; align-items: center; gap: 8px; font-size: 12px; color: ${T.muted}; padding: 5px 0; }
    .cv-perk svg { color: ${T.navy}; flex-shrink: 0; }

    /* Outcomes grid */
    .cv-outcomes { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    @media (max-width: 600px) { .cv-outcomes { grid-template-columns: 1fr; } }
    .cv-outcome-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: ${T.muted}; }
    .cv-outcome-item svg { color: ${T.navy}; flex-shrink: 0; margin-top: 2px; }

    /* Spinner */
    .cv-spin { display: flex; align-items: center; justify-content: center; height: 300px; }
    .cv-spinner { width: 32px; height: 32px; border: 3px solid ${T.border}; border-top-color: ${T.navy}; border-radius: 50%; animation: cv-spin .7s linear infinite; }
    @keyframes cv-spin { to { transform: rotate(360deg); } }

    /* Unlock CTA block */
    .cv-unlock-block { background: ${T.navy}; border-radius: 12px; padding: 18px; text-align: center; margin-top: 16px; }
  `}</style>
);

// ─── Free course detection (matches BrowseCourses) ───────────────
const FREE_COURSE_KEYWORDS = [
  'mba++', 'mba ++', 'corporate readiness',
  'bfsi', 'bfsi domain', 'banking foundation', 'bank-found',
  'payments & cards', 'payments and cards', 'pay-cards',
];
function isFreeCourse(name = '', code = '') {
  const n = name.toLowerCase(); const c = code.toLowerCase();
  return FREE_COURSE_KEYWORDS.some(kw => n.includes(kw) || c.includes(kw));
}

// ─── Lesson type icon ────────────────────────────────────────────
function LessonIcon({ type, locked }) {
  if (locked) return (
    <span className="cv-lesson-icon locked"><Lock size={13} /></span>
  );
  if (type === 'video') return <span className="cv-lesson-icon video"><Video size={13} /></span>;
  if (type === 'pdf')   return <span className="cv-lesson-icon pdf"><FileText size={13} /></span>;
  if (type === 'quiz')  return <span className="cv-lesson-icon quiz"><HelpCircle size={13} /></span>;
  return <span className="cv-lesson-icon text"><File size={13} /></span>;
}

// ─── Single Module Row (expandable) ─────────────────────────────
function ModuleRow({ module, index, hasFullAccess }) {
  const [open, setOpen] = useState(index === 0); // first module open by default
  const isLocked = !hasFullAccess && index > 0;
  const lessonCount = module.Lessons?.length || 0;
  const totalMins = module.Lessons?.reduce((s, l) => s + (l.duration_minutes || 0), 0) || 0;

  return (
    <div className={`cv-module ${open ? 'open' : ''} ${isLocked ? 'locked' : ''}`}>
      <div className="cv-module-head" onClick={() => !isLocked && setOpen(o => !o)}>
        <div className="cv-module-head-left">
          <div className="cv-module-num">{index + 1}</div>
          <div style={{ minWidth: 0 }}>
            <div className="cv-module-name">{module.module_name}</div>
            {module.description && (
              <div className="cv-module-desc">{module.description}</div>
            )}
          </div>
        </div>
        <div className="cv-module-meta">
          <span className="cv-module-count">
            {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
            {totalMins > 0 && ` · ${totalMins}m`}
          </span>
          {index === 0 && !hasFullAccess && (
            <span className="cv-preview-badge">FREE PREVIEW</span>
          )}
          {isLocked && (
            <span className="cv-premium-badge"><Lock size={9} /> PREMIUM</span>
          )}
          {!isLocked && (
            open
              ? <ChevronUp size={15} color={T.muted} />
              : <ChevronDown size={15} color={T.muted} />
          )}
          {isLocked && <Lock size={14} color={T.subtle} />}
        </div>
      </div>

      {/* Lessons */}
      {open && !isLocked && lessonCount > 0 && (
        <div className="cv-lessons">
          {module.Lessons
            .slice()
            .sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0))
            .map((lesson, li) => {
              const lessonLocked = !hasFullAccess && !lesson.is_preview && index === 0;
              return (
                <div key={lesson.id} className="cv-lesson">
                  <LessonIcon type={lesson.content_type} locked={lessonLocked} />
                  <span className={`cv-lesson-name ${lessonLocked ? 'locked' : ''}`}>
                    {lesson.lesson_name}
                  </span>
                  <div className="cv-lesson-right">
                    {lesson.duration_minutes > 0 && (
                      <span className="cv-lesson-dur">{lesson.duration_minutes}m</span>
                    )}
                    {lesson.is_preview && !hasFullAccess && (
                      <span className="cv-preview-badge">Preview</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Locked placeholder */}
      {isLocked && (
        <div style={{ padding: '12px 16px', background: T.bg, borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 12, color: T.subtle, textAlign: 'center' }}>
            🔒 Unlock to see {lessonCount} lesson{lessonCount !== 1 ? 's' : ''} in this module
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const isPurchased = user?.is_purchased || user?.role === 'admin' || user?.role === 'faculty';

  useEffect(() => {
    fetchCourseDetails();
    if (user?.role === 'student') checkEnrollment();
  }, [id, user]);

  const fetchCourseDetails = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      if (res.data.success) setCourse(res.data.course);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const checkEnrollment = async () => {
    try {
      const res = await api.get('/enrollments/my-enrollments');
      if (res.data.success) {
        setIsEnrolled(res.data.enrollments.some(e => e.course_id === parseInt(id)));
      }
    } catch { /* silent */ }
  };

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'student') { alert('Only students can enroll'); return; }
    const isFree = isFreeCourse(course?.course_name, course?.course_code);
    if (!isFree && !isPurchased) { navigate('/pricing'); return; }
    setEnrolling(true);
    try {
      const res = await api.post('/enrollments', { course_id: id });
      if (res.data.requiresPayment) {
        initiatePayment(res.data);
      } else if (res.data.success) {
        alert('Successfully enrolled!');
        setIsEnrolled(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error enrolling in course');
    } finally { setEnrolling(false); }
  };

  const initiatePayment = async () => {
    try {
      const orderRes = await api.post('/payments/initiate', { course_id: id });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderRes.data.order.amount,
        currency: 'INR',
        name: 'Upskillize',
        description: course.course_name,
        order_id: orderRes.data.order.id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', { ...response, course_id: id });
            alert('Payment successful! You are now enrolled.');
            setIsEnrolled(true);
          } catch { alert('Payment verification failed'); }
        },
        prefill: { email: user.email, name: user.full_name },
        theme: { color: T.navy }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch { alert('Error initiating payment'); }
  };

  // ── Loading / Not found ─────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen" style={{ background: T.bg }}>
      <Navbar />
      <div className="cv-spin"><div className="cv-spinner" /></div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen" style={{ background: T.bg }}>
      <Navbar />
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: T.navy, marginBottom: 8 }}>Course Not Found</h1>
        <Link to="/student/browse" style={{ color: T.navy, fontSize: 13 }}>← Back to Browse</Link>
      </div>
    </div>
  );

  const isFree = isFreeCourse(course.course_name, course.course_code);
  const hasFullAccess = isPurchased || isFree || isEnrolled;
  const modules = course.CourseModules || [];
  const totalLessons = modules.reduce((s, m) => s + (m.Lessons?.length || 0), 0);
  const outcomes = course.learning_outcomes
    ? course.learning_outcomes.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="cv-root">
      <Styles />
      <Navbar />

      {/* Back bar */}
      <div className="cv-back-bar">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <button className="cv-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Back to Courses
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="cv-hero">
        <div className="cv-hero-inner">
          {/* Left — course info */}
          <div>
            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {course.category && (
                <span className="cv-badge cv-badge-gold">{course.category}</span>
              )}
              <span className="cv-badge cv-badge-navy" style={{ textTransform: 'capitalize' }}>
                {course.difficulty_level || 'Beginner'}
              </span>
              {isFree && (
                <span className="cv-badge cv-badge-free">
                  <Gift size={11} /> FREE
                </span>
              )}
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32,
              fontWeight: 700,
              color: T.white,
              lineHeight: 1.25,
              marginBottom: 12
            }}>
              {course.course_name}
            </h1>

            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: 580, marginBottom: 20 }}>
              {course.description}
            </p>

            {/* Stats row */}
            <div className="cv-stats">
              <span className="cv-stat"><Clock size={14} /> {course.duration_hours}h total</span>
              <span className="cv-stat" style={{ margin: '0 2px', opacity: 0.3 }}>|</span>
              <span className="cv-stat"><BookOpen size={14} /> {modules.length} module{modules.length !== 1 ? 's' : ''}</span>
              <span className="cv-stat" style={{ margin: '0 2px', opacity: 0.3 }}>|</span>
              <span className="cv-stat"><PlayCircle size={14} /> {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}</span>
              <span className="cv-stat" style={{ margin: '0 2px', opacity: 0.3 }}>|</span>
              <span className="cv-stat"><Star size={14} style={{ color: T.gold }} /> 4.8 rating</span>
              <span className="cv-stat" style={{ margin: '0 2px', opacity: 0.3 }}>|</span>
              <span className="cv-stat"><Award size={14} /> Certificate</span>
            </div>
          </div>

          {/* Right — enroll card */}
          <div className="cv-enroll-card" style={{ marginTop: -8 }}>
            {/* Price */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              {isFree ? (
                <>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: T.navy }}>FREE</div>
                  <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>No payment required</p>
                </>
              ) : (
                <>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, color: T.navy }}>
                    ₹{Number(course.price).toLocaleString()}
                  </div>
                  <p style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>One-time payment</p>
                </>
              )}
            </div>

            {/* CTA */}
            {isEnrolled ? (
              <Link to={`/student/course/${course.id}`} className="cv-btn-primary">
                <PlayCircle size={15} /> Continue Learning
              </Link>
            ) : !user ? (
              <>
                <Link to="/login" className="cv-btn-primary">Login to Enroll</Link>
                <p style={{ textAlign: 'center', fontSize: 11, color: T.muted, marginTop: 10 }}>
                  No account? <Link to="/register" style={{ color: T.navy, fontWeight: 600 }}>Sign up free</Link>
                </p>
              </>
            ) : hasFullAccess ? (
              <button onClick={handleEnroll} disabled={enrolling} className="cv-btn-primary" style={{ opacity: enrolling ? 0.6 : 1 }}>
                {enrolling ? 'Processing...' : isFree ? <><Gift size={15} /> Enroll Free</> : <><Zap size={15} /> Enroll Now</>}
              </button>
            ) : (
              <>
                <Link to="/pricing" className="cv-btn-gold">
                  <Zap size={15} /> Unlock Full Access
                </Link>
                <button onClick={handleEnroll} className="cv-btn-outline">
                  👁 Watch Free Preview
                </button>
              </>
            )}

            {/* Perks */}
            <div style={{ marginTop: 20, borderTop: `1px solid ${T.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                'Full lifetime access',
                'Certificate of completion',
                `${modules.length} modules · ${totalLessons} lessons`,
                hasFullAccess ? 'All content unlocked' : 'First lesson free preview',
              ].map((p, i) => (
                <div key={i} className="cv-perk">
                  <CheckCircle size={13} />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="cv-body">
        <div>
          {/* What You'll Learn */}
          {outcomes.length > 0 && (
            <div className="cv-card">
              <div className="cv-card-title">What You'll Learn</div>
              <div className="cv-card-sub">Skills and knowledge from this course</div>
              <div className="cv-outcomes">
                {outcomes.map((o, i) => (
                  <div key={i} className="cv-outcome-item">
                    <CheckCircle size={14} />
                    <span>{o}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Curriculum */}
          <div className="cv-card">
            <div className="cv-card-title">Course Curriculum</div>
            <div className="cv-card-sub" style={{ marginBottom: 4 }}>
              {modules.length} module{modules.length !== 1 ? 's' : ''} · {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
              {hasFullAccess
                ? ' · All content unlocked'
                : ' · First module free preview'}
            </div>

            {/* Access notice */}
            {!hasFullAccess && (
              <div style={{
                background: T.blueSoft,
                border: `1px solid #c8d4ec`,
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 12,
                color: T.navy
              }}>
                🔓 <strong>Module 1 is unlocked</strong> as a free preview. Purchase a plan to access all modules.
              </div>
            )}

            {modules.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: T.subtle, fontSize: 13 }}>
                <BookOpen size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                Course content coming soon
              </div>
            ) : (
              modules
                .slice()
                .sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0))
                .map((module, idx) => (
                  <ModuleRow
                    key={module.id}
                    module={module}
                    index={idx}
                    hasFullAccess={hasFullAccess}
                  />
                ))
            )}

            {/* Unlock CTA inside curriculum for non-access users */}
            {!hasFullAccess && modules.length > 1 && (
              <div className="cv-unlock-block">
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: T.white, marginBottom: 6 }}>
                  Unlock all {modules.length} modules
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 14 }}>
                  Get instant access to {totalLessons} lessons and a completion certificate
                </p>
                <Link to="/pricing" style={{
                  display: 'inline-block',
                  background: T.gold,
                  color: T.navy,
                  padding: '9px 22px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none'
                }}>
                  View Pricing Plans →
                </Link>
              </div>
            )}
          </div>

          {/* Prerequisites */}
          {course.prerequisites && (
            <div className="cv-card">
              <div className="cv-card-title">Prerequisites</div>
              <p style={{ fontSize: 13, color: T.muted, marginTop: 10, lineHeight: 1.7 }}>{course.prerequisites}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="cv-card">
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 14 }}>
              This course includes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { icon: <PlayCircle size={15} />, text: `${course.duration_hours}h of video content` },
                { icon: <BookOpen size={15} />, text: `${modules.length} structured modules` },
                { icon: <CheckCircle size={15} />, text: `${totalLessons} lessons total` },
                { icon: <Award size={15} />, text: 'Certificate of completion' },
                { icon: <TrendingUp size={15} />, text: 'Lifetime access' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: T.muted, padding: '4px 0' }}>
                  <span style={{ color: T.navy }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Free preview / upgrade nudge for non-access users */}
          {!hasFullAccess && !isFree && (
            <div className="cv-card" style={{ background: T.goldSoft, border: `1px solid ${T.goldBorder}` }}>
              <div style={{ textAlign: 'center' }}>
                <Gift size={28} style={{ color: T.gold, marginBottom: 10 }} />
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 6 }}>
                  Free Preview Available
                </p>
                <p style={{ fontSize: 12, color: T.muted, marginBottom: 14 }}>
                  Watch the first lesson of Module 1 for free.
                </p>
                <button onClick={handleEnroll} className="cv-btn-primary" style={{ fontSize: 12, padding: '10px 16px' }}>
                  Watch Free Lesson
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}