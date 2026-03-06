import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BookOpen, Clock, Calendar, CheckCircle, X, PlayCircle,
  Gift, Lock, Star, ChevronRight, Zap
} from 'lucide-react';

// ─── Which courses are FREE ──────────────────────────────────────
const FREE_COURSE_KEYWORDS = [
  'mba++', 'mba ++',
  'corporate readiness',
  'bfsi', 'bfsi domain',
  'banking foundation', 'bank-found',
  'payments & cards', 'payments and cards', 'pay-cards',
];

// ─── YouTube thumbnails map (course DB id → YouTube video id) ────
const YOUTUBE_THUMBNAILS = {
  37: 'y3HKCaLPqtU',  // Banking Foundation
  42: 'cG1kVkzS2pE',  // Payments & Cards
};

// ─── YouTube video embed URLs (course DB id → embed URL) ─────────
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

// ─── Circular Progress ───────────────────────────────────────────
function CircularProgress({ percentage, size = 100, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 75 ? '#10b981' : percentage >= 50 ? '#3b82f6' : percentage >= 25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-700">{percentage}%</span>
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

  // uses COURSE_VIDEOS, YOUTUBE_THUMBNAILS, isYouTubeUrl defined at top of file

  useEffect(() => { fetchEnrollments(); }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await api.get('/enrollments/my-enrollments');
      if (res.data?.success) setEnrollments(res.data.enrollments || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (enrollmentId, courseName) => {
    if (!window.confirm(`Withdraw from "${courseName}"? This cannot be undone.`)) return;
    setWithdrawing(enrollmentId);
    try {
      await api.delete(`/enrollments/${enrollmentId}`);
      setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
    } catch {
      alert('Error withdrawing from course');
    } finally {
      setWithdrawing(null);
    }
  };

  const filtered = enrollments.filter(e => {
    if (filter === 'in-progress') return (e.progress_percentage || 0) < 100;
    if (filter === 'completed') return (e.progress_percentage || 0) === 100;
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <div className="flex gap-2">
          {['all', 'in-progress', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition capitalize text-sm font-medium ${
                filter === f ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}>
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4 text-lg">
            {filter === 'all' ? "You haven't enrolled in any courses yet" : `No ${filter.replace('-', ' ')} courses`}
          </p>
          {onSwitchToBrowse && (
            <button onClick={onSwitchToBrowse}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition font-semibold">
              Browse Courses
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((enrollment) => {
            const course = enrollment.Course || {};
            const progress = enrollment.progress_percentage || 0;
            const videoSrc = COURSE_VIDEOS[course.id];
            const isVideoOpen = openVideo === enrollment.id;

            return (
              <div key={enrollment.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
                    style={{ width: `${progress}%` }} />
                </div>

                {videoSrc && (
                  <div className="bg-gray-900">
                    {isVideoOpen ? (
                      <div className="relative">
                        {isYouTubeUrl(videoSrc) ? (
                          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                            <iframe
                              className="absolute inset-0 w-full h-full"
                              src={videoSrc + '&autoplay=1'}
                              title={course.course_name}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <video className="w-full" style={{ maxHeight: '200px', objectFit: 'cover' }}
                            src={videoSrc} controls autoPlay />
                        )}
                        <button onClick={() => setOpenVideo(null)}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center z-10">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => setOpenVideo(enrollment.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:from-blue-800 hover:to-blue-600 transition group">
                        {YOUTUBE_THUMBNAILS[course.id] ? (
                          <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0 border border-white/20">
                            <img
                              src={`https://img.youtube.com/vi/${YOUTUBE_THUMBNAILS[course.id]}/mqdefault.jpg`}
                              alt="preview" className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <PlayCircle size={22} className="text-white" />
                          </div>
                        )}
                        <div className="text-left flex-1">
                          <p className="text-xs font-bold text-yellow-300 uppercase">▶ YouTube Video</p>
                          <p className="text-xs text-blue-200">Click to watch</p>
                        </div>
                        <span className="ml-auto text-blue-300 text-sm font-semibold">▶ Play</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{course.course_name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>

                  <div className="flex items-center justify-center mb-4">
                    <CircularProgress percentage={progress} size={90} strokeWidth={7} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Clock size={13} /> {course.duration_hours}h</span>
                    <span className="flex items-center gap-1"><Calendar size={13} />
                      {new Date(enrollment.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/student/course/${course.id}`}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-center py-2.5 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2">
                      <PlayCircle size={16} />
                      {progress === 100 ? 'Review' : 'Continue'}
                    </Link>
                    {progress < 100 && (
                      <button onClick={() => handleWithdraw(enrollment.id, course.course_name)}
                        disabled={withdrawing === enrollment.id}
                        className="px-3 bg-red-100 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition disabled:opacity-50 text-sm">
                        {withdrawing === enrollment.id ? '...' : <X size={16} />}
                      </button>
                    )}
                  </div>
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
  const navigate = useNavigate();

  const isPurchased = user?.is_purchased || user?.role === 'admin' || user?.role === 'faculty';

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data?.success) setCourses(res.data.courses || []);
      else if (Array.isArray(res.data)) setCourses(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId, courseName, courseCode, isFree) => {
    if (!isFree && !isPurchased) {
      navigate('/pricing');
      return;
    }
    if (!isFree && isPurchased) {
      navigate(`/student/payment/${courseId}`);
      return;
    }
    if (!window.confirm(`Enroll in "${courseName}" for free?`)) return;
    setEnrolling(courseId);
    try {
      const res = await api.post('/enrollments', { course_id: courseId });
      if (res.data?.success) {
        alert(`✅ Enrolled in "${courseName}"!`);
        setActiveTab('my-courses');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        alert('You are already enrolled!');
        setActiveTab('my-courses');
      } else {
        alert('Error enrolling. Please try again.');
      }
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-1 inline-flex gap-1 border border-gray-100">
        <button onClick={() => setActiveTab('browse')}
          className={`px-6 py-2.5 rounded-lg font-semibold transition text-sm ${
            activeTab === 'browse' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
          }`}>
          Browse Courses
        </button>
        <button onClick={() => setActiveTab('my-courses')}
          className={`px-6 py-2.5 rounded-lg font-semibold transition text-sm ${
            activeTab === 'my-courses' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
          }`}>
          My Courses
        </button>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-6">

          {/* Header */}
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isPurchased
                  ? '🎉 You have full access to all courses'
                  : '3 free courses available • Upgrade to unlock all'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
                <Gift size={14} /> Free
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full font-medium">
                <Lock size={14} /> Premium
              </span>
            </div>
          </div>

          {/* Upgrade Banner */}
          {!isPurchased && (
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 flex items-center justify-between text-white shadow-lg">
              <div>
                <p className="font-bold text-lg">🔓 Unlock All Courses</p>
                <p className="text-orange-100 text-sm mt-1">Get access to all premium courses, certificates, exams & more</p>
              </div>
              <Link to="/pricing"
                className="bg-white text-orange-600 px-5 py-2.5 rounded-lg font-bold hover:bg-orange-50 transition whitespace-nowrap shadow">
                View Plans →
              </Link>
            </div>
          )}

          {/* Course Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const courseName = course.course_name || course.name || '';
                const courseCode = course.course_code || '';
                const isFree = isFreeCourse(courseName, courseCode);
                const isLocked = !isFree && !isPurchased;
                const isEnrolling = enrolling === course.id;

                return (
                  <div key={course.id}
                    className={`bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden relative ${
                      isLocked ? 'opacity-90' : ''
                    }`}>

                    {/* Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      {isFree ? (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                          <Gift size={12} /> FREE
                        </span>
                      ) : (
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                          <Zap size={12} /> PREMIUM
                        </span>
                      )}
                    </div>

                    {/* Top color bar */}
                    <div className={`h-1.5 ${isFree ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`} />

                    {/* Locked overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center rounded-xl">
                        <div className="text-center p-4">
                          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Lock size={28} className="text-orange-500" />
                          </div>
                          <p className="font-bold text-gray-800 text-sm mb-1">Premium Course</p>
                          <p className="text-gray-500 text-xs mb-3">Purchase a plan to access</p>
                          <Link to="/pricing"
                            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 transition">
                            Unlock Now
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 pr-16">{courseName}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-3">{course.description}</p>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-5">
                        <span className="flex items-center gap-1"><Clock size={13} /> {course.duration_hours}h</span>
                        <span className="flex items-center gap-1"><Star size={13} className="text-yellow-400" /> 4.8</span>
                        <span className="capitalize px-2 py-0.5 bg-gray-100 rounded-full">{course.difficulty_level || 'Beginner'}</span>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/course/${course.id}`}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2.5 rounded-lg font-semibold transition text-sm">
                          View Details
                        </Link>

                        <button
                          onClick={() => handleEnroll(course.id, courseName, courseCode, isFree)}
                          disabled={isEnrolling || isLocked}
                          className={`flex-1 text-white text-center py-2.5 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-1.5 ${
                            isFree
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-orange-500 hover:bg-orange-600'
                          } disabled:opacity-50`}>
                          {isEnrolling ? (
                            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Enrolling...</>
                          ) : isFree ? (
                            <><Gift size={15} /> Enroll Free</>
                          ) : (
                            <><Zap size={15} /> Enroll Now</>
                          )}
                        </button>
                      </div>

                      {isFree && (
                        <p className="mt-3 text-xs text-center text-green-600 font-medium">
                          ✅ Free access • No payment required
                        </p>
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

// ─── Free Courses Widget (used in Student Dashboard) ─────────────
export function FreeCoursesWidget() {
  const { user } = useAuth();

  // Hide widget if user already has full access
  if (user?.is_purchased || user?.role === 'admin' || user?.role === 'faculty') {
    return null;
  }

  const freeCourses = [
    { name: 'MBA++', icon: '🎓', path: '/student/browse' },
    { name: 'Corporate Readiness', icon: '💼', path: '/student/browse' },
    { name: 'BFSI Domain Excellence', icon: '🏦', path: '/student/browse' },
    { name: 'Banking Foundation', icon: '🏛️', path: '/student/browse' },
    { name: 'Payments & Cards', icon: '💳', path: '/student/browse' },
  ];

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎁</span>
        <div>
          <h3 className="text-lg font-bold text-green-800">Your Free Courses</h3>
          <p className="text-sm text-green-600">These courses are included at no cost</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {freeCourses.map((course, idx) => (
          <a key={idx} href={course.path}
            className="bg-white rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition border border-green-100">
            <span className="text-2xl">{course.icon}</span>
            <span className="font-semibold text-gray-800 text-sm">{course.name}</span>
          </a>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-green-200">
        <a href="/pricing"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition">
          🔓 Unlock All Courses
        </a>
      </div>
    </div>
  );
}