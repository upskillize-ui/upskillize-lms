// COMPLETE STUDENT DASHBOARD — Professional, Faculty-matching design
// Same color layout as FacultyDashboard with Overview + all sections

import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CoursePlayer from './CoursePlayer';
import BrowseCourses from '../../pages/BrowseCourses';
import {
  BookOpen, TrendingUp, Award, PlayCircle, Clock, Bell,
  MessageSquare, HelpCircle, CreditCard, BarChart3, Download,
  FileText, CheckCircle, XCircle, Settings, LogOut, Search,
  Calendar, Target, ChevronRight, Star, User,
  Activity, AlertCircle, Eye, Video,
  Shield, Mail, Edit2, Trash2, Plus, X,
  MapPin, Lock, Globe, Save, Camera, EyeOff,
  Github, Linkedin, Twitter, Link as LinkIcon, Menu,
  ShoppingBag, ThumbsUp, GraduationCap, ChevronDown,
  RefreshCw, Users, Zap, Home, TrendingDown, BookMarked,
  CheckSquare, PlaySquare, MonitorPlay, Layers, ClipboardList, Timer, Trophy, FilePen 
} from 'lucide-react';

// ==================== CIRCULAR PROGRESS ====================
function CircularProgress({ percentage, size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const getColor = () => {
    if (percentage >= 75) return '#10b981';
    if (percentage >= 50) return '#3b82f6';
    if (percentage >= 25) return '#f59e0b';
    return '#ef4444';
  };
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-gray-200" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={getColor()} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color: getColor() }}>{percentage}%</span>
      </div>
    </div>
  );
}

// ==================== RECENT QUIZ ATTEMPTS (Overview widget) ====================
function RecentQuizAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes/my-attempts')
      .then(r => setAttempts((r.data.attempts || []).slice(0, 5)))
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (attempts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">Recent Quiz Attempts</h3>
        <Link to="/student/quizzes" className="text-sm text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1">
          View All <ChevronRight size={14} />
        </Link>
      </div>
      <div className="space-y-3">
        {attempts.map((a, i) => {
          const pct = a.total_marks > 0 ? Math.round(a.score / a.total_marks * 100) : 0;
          const timeTaken = a.time_taken_seconds;
          const mins = Math.floor(timeTaken / 60), secs = timeTaken % 60;
          const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
          return (
            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${a.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                <Trophy size={18} className={a.passed ? 'text-green-600' : 'text-red-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">{a.Quiz?.title || 'Quiz'}</p>
                <p className="text-xs text-gray-400">{a.Quiz?.Course?.course_name || ''}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-sm ${a.passed ? 'text-green-600' : 'text-red-500'}`}>{pct}%</p>
                <p className="text-xs text-gray-400">{timeStr}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {a.passed ? 'Passed' : 'Failed'}
              </span>
              <p className="text-xs text-gray-400 flex-shrink-0 hidden md:block">
                {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== OVERVIEW ====================
function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const handleFocus = () => fetchDashboardData(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchDashboardData(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await api.get('/student/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.stats || {});
        setRecentActivity(response.data.activities || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Student Dashboard</h2>
          {lastUpdated && <p className="text-xs text-gray-400 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchDashboardData(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/student/browse"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md">
            <ShoppingBag size={20} /> Browse Courses
          </Link>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1e5a8e] to-[#164266] text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-1">Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}! 👋</h3>
            <p className="text-blue-100">Keep up the great work on your learning journey.</p>
          </div>
          <div className="hidden md:flex items-center gap-6 text-center">
            <div>
              <p className="text-3xl font-bold">{stats?.totalCourses ?? '—'}</p>
              <p className="text-blue-200 text-sm">Enrolled</p>
            </div>
            <div className="w-px h-12 bg-blue-600"></div>
            <div>
              <p className="text-3xl font-bold">{stats?.completedCourses ?? '—'}</p>
              <p className="text-blue-200 text-sm">Completed</p>
            </div>
            <div className="w-px h-12 bg-blue-600"></div>
            <div>
              <p className="text-3xl font-bold">{stats?.certificates ?? '—'}</p>
              <p className="text-blue-200 text-sm">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <BookOpen className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Enrolled Courses</h3>
          <p className="text-3xl font-bold">{stats?.totalCourses ?? '—'}</p>
          <p className="text-xs mt-2 opacity-75">Active enrollments</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <CheckCircle className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Completed</h3>
          <p className="text-3xl font-bold">{stats?.completedCourses ?? '—'}</p>
          <p className="text-xs mt-2 opacity-75">Courses finished</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
          <Clock className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Hours Learned</h3>
          <p className="text-3xl font-bold">{stats?.hoursLearned != null ? `${stats.hoursLearned}h` : '—'}</p>
          <p className="text-xs mt-2 opacity-75">Total watch time</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <Award className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Certificates</h3>
          <p className="text-3xl font-bold">{stats?.certificates ?? '—'}</p>
          <p className="text-xs mt-2 opacity-75">Earned so far</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <TrendingUp className="h-10 w-10 text-blue-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Learning Streak</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.streakDays ?? 0} days</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <BarChart3 className="h-10 w-10 text-green-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Avg Progress</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.avgProgress ?? 0}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <Star className="h-10 w-10 text-yellow-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Quiz Avg Score</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.avgScore ?? 0}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <Activity className="h-10 w-10 text-purple-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">In Progress</h3>
          <p className="text-2xl font-bold text-gray-900">{stats?.inProgress ?? 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { to: '/student/courses', icon: BookOpen, label: 'My Courses', sub: 'Continue learning' },
            { to: '/student/browse', icon: ShoppingBag, label: 'Browse', sub: 'Find new courses' },
            { to: '/student/certificates', icon: Award, label: 'Certificates', sub: 'Download yours' },
            { to: '/student/progress', icon: TrendingUp, label: 'Progress', sub: 'View analytics' },
            { to: '/student/discussion-forum', icon: MessageSquare, label: 'Forum', sub: 'Join discussions' },
          ].map(({ to, icon: Icon, label, sub }) => (
            <Link key={to} to={to}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition group">
              <Icon className="text-orange-500 group-hover:scale-110 transition" size={32} />
              <div className="text-center mt-2">
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-gray-600">{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & In-Progress Courses */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Learning Progress</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          {stats?.courseProgress?.length > 0 ? (
            <div className="space-y-4">
              {stats.courseProgress.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="font-medium truncate max-w-[180px]">{item.name}</span>
                    <span className="font-semibold">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Enroll in courses to see progress here.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <Activity className="text-orange-500" size={20} />
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Quiz Attempts */}
      <RecentQuizAttempts />
    </div>
  );
}

// ==================== MY COURSES ====================
function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [withdrawing, setWithdrawing] = useState(null);
  const [openVideo, setOpenVideo] = useState(null);

  const COURSE_VIDEOS = {
    // ── PRODUCTION IDs ──
    1: 'https://www.youtube.com/embed/y3HKCaLPqtU?rel=0&modestbranding=1',  // Banking Foundation
    6: 'https://www.youtube.com/embed/cG1kVkzS2pE?rel=0&modestbranding=1',  // Payments & Cards
    // ── LOCAL IDs ──
    37: 'https://www.youtube.com/embed/y3HKCaLPqtU?rel=0&modestbranding=1',
    38: 'https://www.youtube.com/embed/y3HKCaLPqtU?rel=0&modestbranding=1',
    39: 'https://www.youtube.com/embed/cPHKvABl9s4?rel=0&modestbranding=1',
    40: 'https://www.youtube.com/embed/BM9ShEKAgVY?rel=0&modestbranding=1',
    41: 'https://www.youtube.com/embed/Ap7Gk2Nj52c?rel=0&modestbranding=1',
    42: 'https://www.youtube.com/embed/cG1kVkzS2pE?rel=0&modestbranding=1',
  };

  const isYouTube = (url) => url?.includes('youtube.com/embed');
  const getYouTubeId = (url) => url?.split('/embed/')[1]?.split('?')[0];

  useEffect(() => { fetchEnrollments(); }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments/my-enrollments');
      if (response.data.success) setEnrollments(response.data.enrollments || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
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

      {/* ── Header + Filter Tabs ── */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <div className="flex gap-2">
          {['all', 'in-progress', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition capitalize text-sm font-medium ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty State ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4 text-lg">
            {filter === 'all'
              ? "You haven't enrolled in any courses yet"
              : `No ${filter.replace('-', ' ')} courses`}
          </p>
          <Link
            to="/student/browse"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            Browse Courses
          </Link>
        </div>

      ) : (

        /* ── Course Cards Grid ── */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((enrollment) => {
            const course      = enrollment.Course || {};
            const progress    = enrollment.progress_percentage || 0;
            const videoSrc    = COURSE_VIDEOS[course.id];
            const isVideoOpen = openVideo === enrollment.id;

            return (
              <div
                key={enrollment.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
              >

                {/* ── Top Progress Bar ── */}
                <div className="h-1.5 bg-gray-100">
                  <div
                    className="h-1.5 bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* ── Video Section ── */}
                {videoSrc && (
                  <div className="bg-gray-900">
                    {isVideoOpen ? (
                      <div className="relative">
                        <iframe
                          src={videoSrc}
                          className="w-full"
                          style={{ height: '200px' }}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={course.course_name}
                        />
                        <button
                          onClick={() => setOpenVideo(null)}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOpenVideo(enrollment.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:from-blue-800 hover:to-blue-600 transition"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <PlayCircle size={22} className="text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-yellow-300 uppercase">🎬 Course Video</p>
                          <p className="text-xs text-blue-200">Watch overview</p>
                        </div>
                        <span className="ml-auto text-blue-300 text-sm font-semibold">▶ Play</span>
                      </button>
                    )}
                  </div>
                )}

                {/* ── Card Body ── */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{course.course_name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>

                  {/* Circular Progress */}
                  <div className="flex items-center justify-center mb-4">
                    <CircularProgress percentage={progress} size={90} strokeWidth={7} />
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {course.duration_hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {new Date(enrollment.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/student/course/${course.id}`}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-center py-2.5 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={16} />
                      {progress === 100 ? 'Review' : 'Continue'}
                    </Link>

                    {progress < 100 && (
                      <button
                        onClick={() => handleWithdraw(enrollment.id, course.course_name)}
                        disabled={withdrawing === enrollment.id}
                        className="px-3 bg-red-100 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition disabled:opacity-50 text-sm"
                      >
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
// ==================== CERTIFICATES ====================
function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/certificates');
        if (res.data.success) setCertificates(res.data.certificates || []);
      } catch { } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDownload = async (certificateId) => {
    try {
      const response = await api.get(`/student/certificates/${certificateId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch { alert('Error downloading certificate'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No certificates earned yet</p>
          <p className="text-sm text-gray-400">Complete courses to earn certificates</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-start justify-between mb-4">
                <Award className="text-yellow-500" size={40} />
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">Verified</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{cert.course_name}</h3>
              <p className="text-sm text-gray-500 mb-1">Certificate ID: {cert.certificate_id}</p>
              <p className="text-sm text-gray-500 mb-4">Issued on {new Date(cert.issue_date).toLocaleDateString()}</p>
              <button onClick={() => handleDownload(cert.id)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition">
                <Download size={18} /> Download Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== PROGRESS ====================
function Progress() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/progress');
        if (res.data.success) setAnalytics(res.data.analytics);
      } catch { } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;

  if (!analytics) return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Progress & Analytics</h2>
      <div className="text-center py-16 bg-white rounded-xl shadow-md">
        <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No progress data yet</p>
        <p className="text-sm text-gray-400 mt-1">Enroll in courses to start tracking your progress</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Progress & Analytics</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Learning Streak</h3>
            <Star className="text-yellow-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.streakDays ?? 0} days</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Average Score</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.averageScore ?? 0}%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Completion Rate</h3>
            <BarChart3 className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{analytics.completionRate ?? 0}%</p>
        </div>
      </div>
      {analytics.categoryProgress?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Progress by Category</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {analytics.categoryProgress.map((item, idx) => (
              <div key={idx} className="text-center">
                <CircularProgress percentage={item.progress} size={120} strokeWidth={10} />
                <h4 className="mt-4 font-semibold text-gray-800">{item.category}</h4>
                <p className="text-sm text-gray-500">{item.courses} courses • {item.progress}% complete</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== DISCUSSION FORUM ====================
function DiscussionForum() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', course: '' });

  useEffect(() => {
    const fetch = async () => {
      // Fetch threads and enrollments independently so one failure doesn't block the other
      try {
        const res = await api.get('/forum/threads');
        if (res.data.success) setThreads(res.data.threads || []);
      } catch { }

      try {
        const enrollRes = await api.get('/enrollments/my-enrollments');
        const enrolled = (enrollRes.data.enrollments || []).map(e => e.Course).filter(Boolean);
        setEnrollments([{ id: 'general', course_name: 'General' }, ...enrolled]);
      } catch (e) {
        console.error('Enrollments fetch failed:', e);
        setEnrollments([{ id: 'general', course_name: 'General' }]);
      }

      setLoading(false);
    };
    fetch();
  }, []);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/forum/threads', newThread);
      setThreads([response.data.thread, ...threads]);
      setShowNewThread(false);
      setNewThread({ title: '', content: '', course: '' });
    } catch { alert('Error creating thread'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Discussion Forum</h2>
        <button onClick={() => setShowNewThread(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition shadow">
          <Plus size={20} /> New Thread
        </button>
      </div>

      {showNewThread && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Thread</h3>
              <button onClick={() => setShowNewThread(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                <select
                  value={newThread.course}
                  onChange={(e) => setNewThread({...newThread, course: e.target.value})}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  <option value="">-- Select a course --</option>
                  {enrollments.map(c => (
                    <option key={c.id} value={c.course_name}>{c.course_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input type="text" value={newThread.title} onChange={(e) => setNewThread({...newThread, title: e.target.value})} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Your question or topic..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                <textarea value={newThread.content} onChange={(e) => setNewThread({...newThread, content: e.target.value})} required rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Describe in detail..."></textarea>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition">Post Thread</button>
                <button type="button" onClick={() => setShowNewThread(false)} className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {threads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No discussions yet</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <div key={thread.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Link to={`/student/forum/thread/${thread.id}`} className="text-lg font-bold text-gray-800 hover:text-orange-500 transition">{thread.title}</Link>
                    {thread.hasAnswer && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold flex items-center gap-1"><CheckCircle size={12} /> Answered</span>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><User size={14} /> {thread.author}</span>
                    <span className="flex items-center gap-1"><BookOpen size={14} /> {thread.course}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(thread.created).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1"><ThumbsUp size={16} /> {thread.upvotes}</div>
                  <div className="flex items-center gap-1"><MessageSquare size={16} /> {thread.replies}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== NOTIFICATIONS ====================
function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/notifications');
        if (res.data.success) setNotifications(res.data.notifications || []);
      } catch { } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);

  const getIcon = (type) => {
    switch(type) {
      case 'assignment': return <FileText className="text-blue-500" size={20} />;
      case 'exam': return <Award className="text-purple-500" size={20} />;
      case 'announcement': return <Bell className="text-green-500" size={20} />;
      default: return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <div className="flex gap-2">
          {['all', 'assignment', 'exam', 'announcement'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm transition capitalize ${filter === f ? 'bg-orange-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div key={notif.id} className={`bg-white rounded-lg shadow p-4 flex items-start gap-4 ${!notif.read ? 'border-l-4 border-orange-500' : ''}`}>
              <div className="mt-1">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                  <span className="text-xs text-gray-500">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                {!notif.read && <span className="inline-block mt-2 text-xs bg-orange-500 text-white px-2 py-1 rounded">New</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== HELP & SUPPORT ====================
function HelpSupport() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('general');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/student/support', { query, category });
      alert('Query submitted successfully!');
      setQuery('');
    } catch { alert('Error submitting query'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Submit a Query</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400">
              <option value="general">General Question</option>
              <option value="technical">Technical Issue</option>
              <option value="course">Course Related</option>
              <option value="payment">Payment Issue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Question</label>
            <textarea value={query} onChange={(e) => setQuery(e.target.value)} rows="5" required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="Describe your question or issue..."></textarea>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Query'}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: 'How do I reset my password?', a: 'Go to login page and click "Forgot Password"' },
            { q: 'Can I get a refund?', a: 'Refunds are available within 7 days of purchase' },
            { q: 'How do I download certificates?', a: 'Go to Certificates section and click Download' },
            { q: 'How do I access free courses?', a: 'MBA++, Corporate Readiness and BFSI are free — just enroll!' }
          ].map((faq, idx) => (
            <details key={idx} className="p-4 border border-gray-200 rounded-lg">
              <summary className="font-semibold cursor-pointer">{faq.q}</summary>
              <p className="mt-2 text-sm text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== PAYMENTS ====================
function PaymentsComponent() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/payments');
        if (res.data.success) setPayments(res.data.payments || []);
      } catch { } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No payment history</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-sm">{payment.transaction_id}</td>
                  <td className="px-6 py-4">{payment.course_name}</td>
                  <td className="px-6 py-4 font-semibold">₹{payment.amount?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">{payment.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== PROFILE ====================
function ProfileManagement() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileCompletion, setProfileCompletion] = useState(0);

  const [personalInfo, setPersonalInfo] = useState({
    full_name: user?.full_name || '', email: user?.email || '',
    phone: '', date_of_birth: '', gender: '', profile_photo: null, bio: ''
  });
  const [address, setAddress] = useState({ street: '', city: '', state: '', country: '', postal_code: '' });
  const [security, setSecurity] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [preferences, setPreferences] = useState({ language: 'en', timezone: 'Asia/Kolkata', email_notifications: true, sms_notifications: false });
  const [socialLinks, setSocialLinks] = useState({ linkedin: '', github: '', twitter: '', portfolio: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => { fetchProfileData(); }, []);

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/student/profile/complete');
      if (response.data.success) {
        const data = response.data.profile;
        if (data.personal) setPersonalInfo(prev => ({ ...prev, ...data.personal }));
        if (data.address) setAddress(data.address);
        if (data.preferences) setPreferences(data.preferences);
        if (data.social) setSocialLinks(data.social);
      }
    } catch { }
  };

  useEffect(() => {
    const fields = [personalInfo.full_name, personalInfo.phone, personalInfo.date_of_birth, personalInfo.gender, personalInfo.bio,
      address.street, address.city, address.state, address.country, address.postal_code,
      socialLinks.linkedin, socialLinks.github, preferences.language, preferences.timezone];
    const completed = fields.filter(f => f && f.toString().trim() !== '').length;
    setProfileCompletion(Math.round((completed / fields.length) * 100));
  }, [personalInfo, address, socialLinks, preferences]);

  const showMessage = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showMessage('error', 'Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setPersonalInfo({ ...personalInfo, profile_photo: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSavePersonalInfo = async () => {
    setSaving(true);
    try {
      const res = await api.put('/student/profile/personal', personalInfo);
      if (res.data.success) { showMessage('success', 'Personal information saved!'); if (updateUser) updateUser({ full_name: personalInfo.full_name }); }
    } catch { showMessage('error', 'Error saving'); } finally { setSaving(false); }
  };

  const handleSaveAddress = async () => {
    setSaving(true);
    try { await api.put('/student/profile/address', address); showMessage('success', 'Address saved!'); }
    catch { showMessage('error', 'Error saving'); } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (security.new_password !== security.confirm_password) { showMessage('error', 'Passwords do not match!'); return; }
    if (security.new_password.length < 6) { showMessage('error', 'Password must be at least 6 characters!'); return; }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { current_password: security.current_password, new_password: security.new_password });
      showMessage('success', 'Password changed!');
      setSecurity({ current_password: '', new_password: '', confirm_password: '' });
    } catch (e) { showMessage('error', e.response?.data?.message || 'Error changing password'); } finally { setSaving(false); }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try { await api.put('/student/profile/preferences', preferences); showMessage('success', 'Preferences saved!'); }
    catch { showMessage('error', 'Error saving'); } finally { setSaving(false); }
  };

  const handleSaveSocialLinks = async () => {
    setSaving(true);
    try { await api.put('/student/profile/social', socialLinks); showMessage('success', 'Social links saved!'); }
    catch { showMessage('error', 'Error saving'); } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'social', label: 'Social Links', icon: LinkIcon }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#1e5a8e] to-[#164266] text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Profile Management</h2>
            <p className="text-blue-100">Manage your personal information and settings</p>
          </div>
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
                <circle cx="48" cy="48" r="40" stroke="white" strokeWidth="6" fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - profileCompletion / 100)}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{profileCompletion}%</span>
                <span className="text-xs">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id ? 'border-orange-500 text-orange-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}>
                <Icon size={18} />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-8">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden">
                      {personalInfo.profile_photo ? (
                        <img src={personalInfo.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                          <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="4" fill="white"/>
                          <circle cx="50" cy="38" r="18" fill="#111"/>
                          <ellipse cx="50" cy="82" rx="28" ry="18" fill="#111"/>
                        </svg>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition">
                      <Camera size={20} className="text-orange-500" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Max 5MB</p>
                </div>
                <div className="flex-1 grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input type="text" value={personalInfo.full_name} onChange={(e) => setPersonalInfo({...personalInfo, full_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input type="email" value={personalInfo.email} disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" value={personalInfo.phone} onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                    <input type="date" value={personalInfo.date_of_birth} onChange={(e) => setPersonalInfo({...personalInfo, date_of_birth: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <div className="flex gap-4 flex-wrap">
                      {['Male', 'Female', 'Other', 'Prefer not to say'].map(option => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="gender" value={option} checked={personalInfo.gender === option}
                            onChange={(e) => setPersonalInfo({...personalInfo, gender: e.target.value})} className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea value={personalInfo.bio} onChange={(e) => setPersonalInfo({...personalInfo, bio: e.target.value})}
                      rows="4" maxLength="500"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="Tell us about yourself..."></textarea>
                    <p className="text-xs text-gray-500 mt-1">{personalInfo.bio?.length || 0}/500</p>
                  </div>
                </div>
              </div>
              <button onClick={handleSavePersonalInfo} disabled={saving}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={20} />{saving ? 'Saving...' : 'Save Personal Info'}
              </button>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                  <input type="text" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="123 Main Street" />
                </div>
                {[['city', 'City', 'Mumbai'], ['state', 'State', 'Maharashtra'], ['postal_code', 'Postal Code', '400001']].map(([key, label, ph]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                    <input type="text" value={address[key]} onChange={(e) => setAddress({...address, [key]: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder={ph} />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                  <select value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="">Select Country</option>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSaveAddress} disabled={saving}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={20} />{saving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800"><strong>Security Tip:</strong> Use at least 6 characters with uppercase, lowercase, and numbers.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input type={showCurrentPassword ? 'text' : 'password'} value={security.current_password}
                    onChange={(e) => setSecurity({...security, current_password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Current password" />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input type={showNewPassword ? 'text' : 'password'} value={security.new_password}
                    onChange={(e) => setSecurity({...security, new_password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="New password (min 6 chars)" />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input type="password" value={security.confirm_password}
                  onChange={(e) => setSecurity({...security, confirm_password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Confirm new password" />
              </div>
              <button onClick={handleChangePassword} disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2">
                <Lock size={20} />{saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6 max-w-2xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                  <select value={preferences.language} onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                  <select value={preferences.timezone} onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                    <option value="America/New_York">EST (America/New_York)</option>
                    <option value="Europe/London">GMT (Europe/London)</option>
                    <option value="Asia/Tokyo">JST (Asia/Tokyo)</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSavePreferences} disabled={saving}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={20} />{saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6 max-w-2xl">
              {[
                { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/yourprofile' },
                { key: 'github', label: 'GitHub', placeholder: 'https://github.com/yourusername' },
                { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/yourusername' },
                { key: 'portfolio', label: 'Portfolio URL', placeholder: 'https://yourportfolio.com' }
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <input type="url" value={socialLinks[key]} onChange={(e) => setSocialLinks({...socialLinks, [key]: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder={placeholder} />
                </div>
              ))}
              <button onClick={handleSaveSocialLinks} disabled={saving}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={20} />{saving ? 'Saving...' : 'Save Social Links'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== SETTINGS ====================
function SystemSettings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('password');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true, courseUpdates: true, newContent: true,
    deadlineReminders: true, discussionReplies: true, certificateAlerts: true,
    promotionalEmails: false, weeklyDigest: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public', showEmail: false, showPhone: false, showProgress: true, allowMessages: true
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/student/settings');
        if (res.data.success) {
          if (res.data.notifications) setNotificationSettings(res.data.notifications);
          if (res.data.privacy) setPrivacySettings(res.data.privacy);
        }
      } catch { }
    };
    load();
  }, []);

  const showMessage = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage({ type: '', text: '' }), 5000); };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { showMessage('error', 'Passwords do not match'); return; }
    if (passwordData.newPassword.length < 8) { showMessage('error', 'Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/change-password', { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      if (res.data.success) { showMessage('success', 'Password changed successfully!'); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    } catch (e) { showMessage('error', e.response?.data?.message || 'Failed to change password'); } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    const confirmation = window.prompt('Type "DELETE" to confirm:');
    if (confirmation !== 'DELETE') return;
    setLoading(true);
    try {
      const res = await api.delete('/student/account');
      if (res.data.success) { setTimeout(() => logout(), 2000); }
    } catch { showMessage('error', 'Failed to delete account'); } finally { setLoading(false); }
  };

  const tabs = [
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'danger', label: 'Danger Zone', icon: AlertCircle }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Account Settings</h2>
          <p className="text-gray-600 mt-1">Manage your security, notifications, and preferences</p>
        </div>
        <Settings className="text-gray-400" size={40} />
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 flex overflow-x-auto bg-gray-50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id ? 'border-orange-500 text-orange-600 bg-white' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}>
                <Icon size={20} />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800"><strong>Security Tip:</strong> Use at least 8 characters with uppercase, lowercase, and numbers.</p>
              </div>
              {[
                { key: 'currentPassword', label: 'Current Password', show: 'current' },
                { key: 'newPassword', label: 'New Password', show: 'new' },
                { key: 'confirmPassword', label: 'Confirm New Password', show: 'confirm' }
              ].map(({ key, label, show }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <div className="relative">
                    <input type={showPasswords[show] ? 'text' : 'password'} value={passwordData[key]}
                      onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" required />
                    <button type="button" onClick={() => setShowPasswords({ ...showPasswords, [show]: !showPasswords[show] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPasswords[show] ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50">
                <Lock size={20} />{loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-2xl">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'courseUpdates', label: 'Course Updates', desc: 'Get notified when courses are updated' },
                { key: 'newContent', label: 'New Content', desc: 'Alerts for new lessons and materials' },
                { key: 'deadlineReminders', label: 'Deadline Reminders', desc: 'Reminders for upcoming deadlines' },
                { key: 'discussionReplies', label: 'Discussion Replies', desc: 'Notifications for forum replies' },
                { key: 'certificateAlerts', label: 'Certificate Alerts', desc: 'Alerts when certificates are ready' },
                { key: 'promotionalEmails', label: 'Promotional Emails', desc: 'Receive promotional offers' },
                { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your weekly activity' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.label}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificationSettings[item.key]}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Profile Visibility</h4>
                <select value={privacySettings.profileVisibility} onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="public">Public - Anyone can see</option>
                  <option value="students">Students Only</option>
                  <option value="private">Private - Only me</option>
                </select>
              </div>
              {[
                { key: 'showEmail', label: 'Show Email', desc: 'Display email on public profile' },
                { key: 'showPhone', label: 'Show Phone', desc: 'Display phone number on profile' },
                { key: 'showProgress', label: 'Show Progress', desc: 'Let others see your course progress' },
                { key: 'allowMessages', label: 'Allow Messages', desc: 'Accept messages from other students' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.label}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={privacySettings[item.key]}
                      onChange={(e) => setPrivacySettings({ ...privacySettings, [item.key]: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-bold text-red-800 mb-1">⚠️ Danger Zone</h3>
                <p className="text-sm text-red-700">These actions are irreversible. Please be certain before proceeding.</p>
              </div>
              <div className="border-2 border-red-300 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Trash2 size={20} className="text-red-600" />Delete Account</h4>
                    <p className="text-sm text-gray-600 mb-3">Permanently delete your account and all associated data. This cannot be undone.</p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>All course progress will be lost</li>
                      <li>Certificates will be revoked</li>
                      <li>All personal data will be deleted</li>
                    </ul>
                  </div>
                  <button onClick={handleDeleteAccount} disabled={loading}
                    className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 whitespace-nowrap">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN STUDENT DASHBOARD ====================
// ==================== STUDENT QUIZZES ====================
function StudentQuizzes() {
  const [enrollments, setEnrollments] = useState([]);
  const [quizzesByCourse, setQuizzesByCourse] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [activeTab, setActiveTab] = useState('available');

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!activeQuiz || result) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeQuiz, result]);

  const fetchData = async () => {
    try {
      const res = await api.get('/enrollments/my-enrollments');
      const enr = res.data.enrollments || [];
      setEnrollments(enr);
      const results = await Promise.all(
        enr.map(e => api.get(`/quizzes/course/${e.Course?.id}`).then(r => ({ courseId: e.Course?.id, quizzes: r.data.quizzes || [] })).catch(() => ({ courseId: e.Course?.id, quizzes: [] })))
      );
      const map = {};
      results.forEach(r => { map[r.courseId] = r.quizzes; });
      setQuizzesByCourse(map);
      // fetch student's own attempts
      try {
        const attRes = await api.get('/quizzes/my-attempts');
        setAttempts(attRes.data.attempts || []);
      } catch { setAttempts([]); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const startQuiz = async (quiz) => {
    try {
      const res = await api.get(`/quizzes/${quiz.id}`);
      setActiveQuiz(res.data.quiz);
      setAnswers({});
      setCurrentQ(0);
      setResult(null);
      setTimeLeft((res.data.quiz.time_limit_minutes || 30) * 60);
      setStartTime(Date.now());
    } catch { alert('Error loading quiz'); }
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !window.confirm('Submit quiz?')) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const res = await api.post(`/quizzes/${activeQuiz.id}/submit`, { answers, time_taken_seconds: timeTaken });
      setResult(res.data.result);
      // refresh attempts list
      try { const attRes = await api.get('/quizzes/my-attempts'); setAttempts(attRes.data.attempts || []); } catch {}
    } catch { alert('Error submitting quiz'); }
    finally { setSubmitting(false); }
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;

  // ── Active Quiz View ──
  if (activeQuiz && !result) {
    const questions = activeQuiz.QuizQuestions || [];
    const q = questions[currentQ];
    const options = [
      { key: 'a', label: q?.option_a },
      { key: 'b', label: q?.option_b },
      { key: 'c', label: q?.option_c },
      { key: 'd', label: q?.option_d },
    ];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">{activeQuiz.title}</h2>
            <p className="text-sm text-gray-500">Question {currentQ + 1} of {questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 font-bold text-lg px-4 py-2 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
            <Timer size={18} /> {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-orange-500 rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-lg font-semibold text-gray-800 mb-6">{q?.question_text}</p>
          <div className="space-y-3">
            {options.map(opt => (
              <button
                key={opt.key}
                onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.key }))}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition font-medium ${
                  answers[q.id] === opt.key
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                <span className="font-bold mr-3">{opt.key.toUpperCase()}.</span>{opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-3">
          <button onClick={() => setCurrentQ(p => p - 1)} disabled={currentQ === 0} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold disabled:opacity-40">← Prev</button>
          {currentQ < questions.length - 1
            ? <button onClick={() => setCurrentQ(p => p + 1)} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold">Next →</button>
            : <button onClick={() => handleSubmit()} disabled={submitting} className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50">{submitting ? 'Submitting...' : '✓ Submit Quiz'}</button>
          }
        </div>
      </div>
    );
  }

  // ── Result View ──
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className={`bg-white rounded-xl shadow-md p-8 text-center`}>
          <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 ${result.passed ? 'bg-green-100' : 'bg-red-100'}`}>
            <Trophy size={40} className={result.passed ? 'text-green-600' : 'text-red-500'} />
          </div>
          <h2 className="text-2xl font-bold mb-1">{result.passed ? '🎉 You Passed!' : 'Keep Practicing!'}</h2>
          <p className="text-5xl font-bold my-4 text-orange-500">{result.percentage}%</p>
          <p className="text-gray-500 mb-6">Score: {result.score}/{result.total_marks} · Pass: {result.pass_percentage}%</p>
          <div className="space-y-3 text-left mb-6">
            {result.result_details?.map((d, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${d.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                {d.is_correct ? <CheckCircle size={18} className="text-green-500 mt-0.5" /> : <XCircle size={18} className="text-red-500 mt-0.5" />}
                <div>
                  <p className="text-sm font-medium">{d.question_text}</p>
                  {!d.is_correct && <p className="text-xs text-red-500">Your answer: {d.student_answer?.toUpperCase() || 'Not answered'} · Correct: {d.correct_option?.toUpperCase()}</p>}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => { setActiveQuiz(null); setResult(null); }} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold">← Back to Quizzes</button>
        </div>
      </div>
    );
  }

  // ── Quiz List View ──
  const allQuizzes = enrollments.flatMap(e => (quizzesByCourse[e.Course?.id] || []).map(q => ({ ...q, courseName: e.Course?.course_name })));

  const formatDuration = (s) => {
    if (!s) return '—';
    const m = Math.floor(s / 60), sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Quizzes</h2>
        <div className="flex gap-2">
          {[['available', 'Available'], ['history', 'Attempt History']].map(([val, label]) => (
            <button key={val} onClick={() => setActiveTab(val)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === val ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              {label} {val === 'history' && attempts.length > 0 && <span className="ml-1 bg-white/30 text-xs px-1.5 py-0.5 rounded-full">{attempts.length}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Available Quizzes Tab ── */}
      {activeTab === 'available' && (
        allQuizzes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No quizzes available yet</p>
            <p className="text-gray-400 text-sm mt-1">Your instructor hasn't assigned any quizzes</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allQuizzes.map(quiz => {
              const myAttempts = attempts.filter(a => a.quiz_id === quiz.id);
              const best = myAttempts.length > 0 ? Math.max(...myAttempts.map(a => a.score / a.total_marks * 100)) : null;
              return (
                <div key={quiz.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-purple-400 to-purple-600" />
                  <div className="p-6">
                    <p className="text-xs text-purple-600 font-semibold uppercase mb-1">{quiz.courseName}</p>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{quiz.title}</h3>
                    {quiz.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{quiz.description}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Timer size={13} /> {quiz.time_limit_minutes} min</span>
                      <span className="flex items-center gap-1"><ClipboardList size={13} /> {quiz.question_count} Qs</span>
                      <span className="flex items-center gap-1"><Target size={13} /> Pass: {quiz.pass_percentage}%</span>
                    </div>
                    {best !== null && (
                      <div className={`text-xs font-semibold px-2 py-1 rounded-full inline-flex items-center gap-1 mb-3 ${best >= quiz.pass_percentage ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        <Trophy size={11} /> Best: {Math.round(best)}% · {myAttempts.length} attempt{myAttempts.length > 1 ? 's' : ''}
                      </div>
                    )}
                    <button onClick={() => startQuiz(quiz)}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                      <PlayCircle size={16} /> {myAttempts.length > 0 ? 'Retake Quiz' : 'Start Quiz'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── Attempt History Tab ── */}
      {activeTab === 'history' && (
        attempts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No attempts yet</p>
            <p className="text-gray-400 text-sm mt-1">Take a quiz to see your history here</p>
            <button onClick={() => setActiveTab('available')} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold text-sm">View Available Quizzes</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Quiz', 'Course', 'Score', 'Time Taken', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attempts.map((a, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{a.Quiz?.title || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{a.Quiz?.Course?.course_name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${a.passed ? 'bg-green-500' : 'bg-red-400'}`} style={{ width: `${a.total_marks > 0 ? Math.round(a.score / a.total_marks * 100) : 0}%` }} />
                        </div>
                        <span className="font-semibold">{a.total_marks > 0 ? Math.round(a.score / a.total_marks * 100) : 0}%</span>
                        <span className="text-gray-400 text-xs">({a.score}/{a.total_marks})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDuration(a.time_taken_seconds)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {a.passed ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

// ==================== STUDENT ASSIGNMENTS COMPONENT ====================
// Paste this function BEFORE the main StudentDashboard export function
// Then add to navItems: { path: '/student/assignments', label: 'Assignments', icon: ClipboardList }
// Then add to Routes: <Route path="/assignments" element={<StudentAssignments />} />

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitForm, setSubmitForm] = useState({ notes: '', file: null });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/student/assignments');
      if (res.data.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (e) {
      console.error('Error fetching assignments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSubmitForm({ ...submitForm, file });
  };

  const handleSubmit = async () => {
    if (!submitForm.file && !submitForm.notes.trim()) {
      alert('Please add a file or notes before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('notes', submitForm.notes);
      if (submitForm.file) formData.append('file', submitForm.file);

      const res = await api.post(
        `/student/assignments/${selectedAssignment.id}/submit`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data.success) {
        setAssignments(prev =>
          prev.map(a =>
            a.id === selectedAssignment.id
              ? { ...a, status: 'submitted', submitted_at: new Date().toISOString() }
              : a
          )
        );
        setShowSubmitModal(false);
        setSubmitForm({ notes: '', file: null });
        setSuccessMsg('Assignment submitted successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status, dueDate) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'pending';
    if (isOverdue) return { label: 'Overdue', cls: 'bg-red-100 text-red-800' };
    switch (status) {
      case 'graded':   return { label: 'Graded',     cls: 'bg-purple-100 text-purple-800' };
      case 'submitted':return { label: 'Submitted',  cls: 'bg-blue-100 text-blue-800' };
      default:         return { label: 'Pending',    cls: 'bg-yellow-100 text-yellow-800' };
    }
  };

  const getDaysLeft = (dueDate) => {
    const diff = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0)  return { text: `${Math.abs(diff)}d overdue`, cls: 'text-red-600' };
    if (diff === 0) return { text: 'Due today',  cls: 'text-orange-600' };
    if (diff <= 3)  return { text: `${diff}d left`, cls: 'text-orange-500' };
    return { text: `${diff}d left`, cls: 'text-green-600' };
  };

  const filtered = assignments.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return new Date(a.due_date) < new Date() && a.status === 'pending';
    return a.status === filter;
  });

  const counts = {
    pending:   assignments.filter(a => a.status === 'pending' && new Date(a.due_date) >= new Date()).length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded:    assignments.filter(a => a.status === 'graded').length,
    overdue:   assignments.filter(a => a.status === 'pending' && new Date(a.due_date) < new Date()).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">My Assignments</h2>

      {/* Success message */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-3 rounded-xl font-semibold">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending',   count: counts.pending,   color: 'yellow', icon: Clock },
          { label: 'Submitted', count: counts.submitted, color: 'blue',   icon: CheckCircle },
          { label: 'Graded',    count: counts.graded,    color: 'purple', icon: Star },
          { label: 'Overdue',   count: counts.overdue,   color: 'red',    icon: AlertCircle },
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} className={`bg-white p-5 rounded-xl shadow-md border-l-4 border-${color}-500`}>
            <Icon className={`h-8 w-8 text-${color}-500 mb-2`} />
            <p className="text-2xl font-bold text-gray-800">{count}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'submitted', 'graded', 'overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition
              ${filter === f ? 'bg-accent text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
            {f} {f !== 'all' && `(${counts[f] ?? filtered.length})`}
          </button>
        ))}
      </div>

      {/* Assignment cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No {filter} assignments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(assignment => {
            const badge = getStatusBadge(assignment.status, assignment.due_date);
            const daysLeft = getDaysLeft(assignment.due_date);
            const scorePercent = assignment.total_marks > 0
              ? Math.round((assignment.grade / assignment.total_marks) * 100)
              : null;

            return (
              <div key={assignment.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        {assignment.course_name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{assignment.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{assignment.description}</p>
                  </div>

                  {/* Score badge for graded */}
                  {assignment.status === 'graded' && scorePercent !== null && (
                    <div className={`ml-4 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-4
                      ${scorePercent >= 80 ? 'border-green-500 text-green-700 bg-green-50'
                      : scorePercent >= 60 ? 'border-yellow-500 text-yellow-700 bg-yellow-50'
                      : 'border-red-400 text-red-700 bg-red-50'}`}>
                      {scorePercent}%
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Due: {new Date(assignment.due_date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${daysLeft.cls}`}>
                    <Clock size={14} /> {daysLeft.text}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={14} /> {assignment.total_marks} marks
                  </span>
                  {assignment.status === 'graded' && (
                    <span className="flex items-center gap-1 font-semibold text-purple-700">
                      <Award size={14} /> Score: {assignment.grade}/{assignment.total_marks}
                    </span>
                  )}
                </div>

                {/* Rubric (if any) */}
                {assignment.rubric?.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {assignment.rubric.categories.map((cat, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {cat.name}: {cat.points}pts
                      </span>
                    ))}
                  </div>
                )}

                {/* Faculty feedback */}
                {assignment.status === 'graded' && assignment.feedback && (
                  <div className="bg-purple-50 border-l-4 border-purple-400 p-3 rounded-lg mb-4">
                    <p className="text-xs font-semibold text-purple-800 mb-1">Faculty Feedback</p>
                    <p className="text-sm text-gray-700">{assignment.feedback}</p>
                  </div>
                )}

                {/* Submission info */}
                {assignment.status === 'submitted' && assignment.submitted_at && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg mb-4">
                    <p className="text-xs font-semibold text-blue-800">
                      ✅ Submitted on {new Date(assignment.submitted_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { setSelectedAssignment(assignment); setShowDetailsModal(true); }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold flex items-center gap-1 transition">
                    <Eye size={15} /> View Details
                  </button>

                  {assignment.status === 'pending' && (
                    <button onClick={() => { setSelectedAssignment(assignment); setShowSubmitModal(true); }}
                      className="px-4 py-2 bg-accent hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition">
                      <Upload size={15} /> Submit Assignment
                    </button>
                  )}

                  {assignment.status === 'submitted' && (
                    <button onClick={() => { setSelectedAssignment(assignment); setShowSubmitModal(true); }}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1 transition">
                      <RefreshCw size={15} /> Resubmit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DETAILS MODAL ── */}
      {showDetailsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-primary">Assignment Details</h3>
              <button onClick={() => setShowDetailsModal(false)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Course</p>
                <p className="font-semibold text-gray-800">{selectedAssignment.course_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Title</p>
                <p className="font-bold text-lg text-gray-900">{selectedAssignment.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Description</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedAssignment.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Due Date</p>
                  <p className="font-semibold">{new Date(selectedAssignment.due_date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Total Marks</p>
                  <p className="font-semibold">{selectedAssignment.total_marks}</p>
                </div>
              </div>
              {selectedAssignment.rubric?.categories?.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Grading Rubric</p>
                  <div className="space-y-2">
                    {selectedAssignment.rubric.categories.map((cat, i) => (
                      <div key={i} className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                        <span className="text-sm font-bold text-blue-700">{cat.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedAssignment.status === 'graded' && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Grade & Feedback</p>
                  <p className="text-2xl font-bold text-purple-700 mb-2">
                    {selectedAssignment.grade}/{selectedAssignment.total_marks}
                    <span className="text-base ml-2 text-purple-500">
                      ({Math.round((selectedAssignment.grade / selectedAssignment.total_marks) * 100)}%)
                    </span>
                  </p>
                  {selectedAssignment.feedback && (
                    <p className="text-sm text-gray-700">{selectedAssignment.feedback}</p>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => setShowDetailsModal(false)}
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── SUBMIT MODAL ── */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-primary">Submit Assignment</h3>
              <button onClick={() => setShowSubmitModal(false)}><X size={24} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg">
              <strong>{selectedAssignment.title}</strong> — Due: {new Date(selectedAssignment.due_date).toLocaleDateString()}
            </p>
            <div className="space-y-4">
              {/* File upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Upload your assignment file (PDF, DOC, ZIP)</p>
                  <input type="file" id="assign-upload" onChange={handleFileChange} className="hidden"
                    accept=".pdf,.doc,.docx,.zip,.txt,.ppt,.pptx" />
                  <label htmlFor="assign-upload"
                    className="inline-block px-4 py-2 bg-accent text-white rounded-lg cursor-pointer hover:bg-blue-700 text-sm font-semibold transition">
                    Choose File
                  </label>
                  {submitForm.file && (
                    <p className="text-sm text-green-600 mt-2 font-semibold">
                      ✅ {submitForm.file.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes / Comments <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea value={submitForm.notes}
                  onChange={e => setSubmitForm({ ...submitForm, notes: e.target.value })}
                  rows={4} placeholder="Add any notes for your faculty..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-accent hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Submitting...</> : <><Send size={16} /> Submit Assignment</>}
              </button>
              <button onClick={() => setShowSubmitModal(false)}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showMailbox, setShowMailbox] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isPurchased = user?.is_purchased || user?.role === 'admin' || user?.role === 'faculty';

  const navItems = [
    { path: '/student',              label: 'Overview',       icon: BarChart3,     free: true },
    { path: '/student/courses',      label: 'My Courses',     icon: BookOpen,      free: true },
    { path: '/student/browse',       label: 'Browse Courses', icon: ShoppingBag,   free: true },
    { path: '/student/certificates', label: 'Certificates',   icon: Award,         free: true },
    { path: '/student/progress',     label: 'Progress',       icon: TrendingUp,    free: true },
    { path: '/student/assignments',  label: 'Assignments',    icon: FilePen ,      free: true },
    { path: '/student/quizzes',          label: 'Quizzes',    icon: ClipboardList, free: true },
    { path: '/student/discussion-forum', label: 'Discussion', icon: MessageSquare, free: true },
    { path: '/student/notifications',label: 'Notifications',  icon: Bell,          free: true },
    { path: '/student/help',         label: 'Help & Support', icon: HelpCircle,    free: true },
    { path: '/student/payments',     label: 'Payments',       icon: CreditCard,    free: true },
    { path: '/student/profile',      label: 'Profile',        icon: User,          free: true },
    { path: '/student/settings',     label: 'Settings',       icon: Settings,      free: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gradient-to-b from-[#1e5a8e] to-[#164266] text-white transition-all duration-300 overflow-hidden flex-shrink-0 shadow-2xl`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-blue-700/50 flex items-center justify-center">
            <img src="/upskillize-logo.png" alt="Upskillize" className="h-10 w-auto" />
          </div>

          {/* Free/Paid badge */}
          <div className="px-4 py-3 border-b border-blue-700/30">
            {isPurchased ? (
              <div className="bg-green-500/20 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full text-center">
                ✅ Full Access
              </div>
            ) : (
              <a href="/pricing" className="block bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-semibold px-3 py-1.5 rounded-full text-center transition">
                🔓 Upgrade to Premium
              </a>
            )}
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isLocked = !isPurchased && !item.free;

              return isLocked ? (
                <a key={item.path} href="/pricing"
                  className="w-full flex items-center px-6 py-3.5 hover:bg-blue-800/30 transition-all opacity-60 cursor-pointer">
                  <Icon size={20} className="mr-3" />
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                  <Lock size={14} className="text-orange-300" />
                </a>
              ) : (
                <Link key={item.path} to={item.path}
                  className={`w-full flex items-center px-6 py-3.5 hover:bg-blue-800/50 transition-all group ${
                    isActive ? 'bg-[#164266] border-l-4 border-orange-400' : ''
                  }`}>
                  <Icon size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search courses, certificates..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mail */}
              <div className="relative">
                <button onClick={() => { setShowMailbox(!showMailbox); setShowNotifications(false); setShowHelp(false); }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition">
                  <Mail size={20} />
                </button>
                {showMailbox && (
                  <>
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Messages</h3>
                        <button onClick={() => setShowMailbox(false)}><X size={18} /></button>
                      </div>
                      <div className="p-6 text-center text-gray-500 text-sm">No new messages</div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMailbox(false)} />
                  </>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => { setShowNotifications(!showNotifications); setShowMailbox(false); setShowHelp(false); }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition">
                  <Bell size={20} />
                </button>
                {showNotifications && (
                  <>
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)}><X size={18} /></button>
                      </div>
                      <div className="p-6 text-center text-gray-500 text-sm">No new notifications</div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  </>
                )}
              </div>

              {/* Help */}
              <div className="relative">
                <button onClick={() => { setShowHelp(!showHelp); setShowMailbox(false); setShowNotifications(false); }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition">
                  <HelpCircle size={20} />
                </button>
                {showHelp && (
                  <>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Help</h3>
                        <button onClick={() => setShowHelp(false)}><X size={18} /></button>
                      </div>
                      <div className="p-4 space-y-2">
                        <Link to="/student/help" onClick={() => setShowHelp(false)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition text-sm font-medium text-gray-700">
                          <HelpCircle size={18} className="text-orange-500" /> Help & Support
                        </Link>
                      </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowHelp(false)} />
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="relative ml-2">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden shadow">
                    {user?.profile_photo ? (
                      <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                        <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="3.5" fill="white"/>
                        <circle cx="50" cy="37" r="17" fill="#111"/>
                        <ellipse cx="50" cy="80" rx="27" ry="17" fill="#111"/>
                      </svg>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">{user?.full_name || 'Student'}</div>
                    <div className="text-xs text-gray-500">{isPurchased ? '⭐ Premium' : 'Free Plan'}</div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <Link to="/student/profile" onClick={() => setUserMenuOpen(false)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/student/settings" onClick={() => setUserMenuOpen(false)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                        <Settings size={16} /> Settings
                      </Link>
                      {!isPurchased && (
                        <a href="/pricing" className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center gap-3 text-sm text-orange-600 font-semibold">
                          🔓 Upgrade Plan
                        </a>
                      )}
                      <hr className="my-2" />
                      <button onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-red-600">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/courses" element={<MyCourses />} />
              <Route path="/course/:courseId" element={<CoursePlayer />} />
              <Route path="/browse" element={<BrowseCourses />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/quizzes" element={<StudentQuizzes />} />
              <Route path="/assignments" element={<StudentAssignments />} />
              <Route path="/discussion-forum" element={<DiscussionForum />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/payments" element={<PaymentsComponent />} />
              <Route path="/profile" element={<ProfileManagement />} />
              <Route path="/settings" element={<SystemSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}