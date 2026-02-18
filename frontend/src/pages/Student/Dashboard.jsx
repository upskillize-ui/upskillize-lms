// COMPLETE TALENTLMS-STYLE STUDENT DASHBOARD
// Matches the admin and faculty dashboard design with student-specific features

import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import CoursePlayer from './CoursePlayer';
import BrowseCourses from '../../pages/BrowseCourses';
import { 
  BookOpen, TrendingUp, Award, PlayCircle, Clock, Users, Bell,
  MessageSquare, HelpCircle, CreditCard, BarChart3, Download,
  FileText, CheckCircle, XCircle, Settings, LogOut, Search,
  Calendar, Target, Lightbulb, ChevronRight, Star, User,
  Activity, TrendingDown, AlertCircle, Eye, Filter, Video,
  BookMarked, Zap, Shield, Code, Layout, PieChart, Mail,
  Phone, Edit2, Trash2, Plus, X, ArrowRight, MapPin, Lock,
  Globe, Palette, Save, Camera, EyeOff, Github, Linkedin,
  Twitter, Link as LinkIcon, Monitor, Smartphone,
  Menu, Home, ShoppingBag, UserPlus, Layers, ExternalLink, 
  LayoutGrid, Upload, ChevronDown, ThumbsUp, GraduationCap,
  SettingsIcon
} from 'lucide-react';

// ==================== CIRCULAR PROGRESS COMPONENT ====================
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: getColor() }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}

// ==================== OVERVIEW COMPONENT ====================
function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 5,
    completedCourses: 2,
    inProgressCourses: 3,
    certificates: 2,
    totalWatchTime: 1840,
    averageGrade: 78.5,
    completionRate: 13.9,
    streakDays: 7
  });

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([
    { id: 1, type: 'complete', user: user?.full_name || 'You', detail: 'Completed React Advanced Course', time: '2 hours ago' },
    { id: 2, type: 'signin', user: user?.full_name || 'You', detail: 'started learning Python Basics', time: '5 hours ago' },
    { id: 3, type: 'update', user: user?.full_name || 'You', detail: 'earned a new certificate', time: '1 day ago' },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/student/dashboard');
      if (response.data.success) {
        setStats(response.data.stats || stats);
        setActivities(response.data.activities || activities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Student Dashboard Overview</h2>
        <Link
          to="/student/courses"
          className="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md"
        >
          <BookOpen size={20} />
          My Courses
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <BookOpen className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Enrolled Courses</h3>
          <p className="text-3xl font-bold">{stats.enrolledCourses}</p>
          <p className="text-xs mt-2 opacity-75">{stats.inProgressCourses} in progress</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <CheckCircle className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Completed</h3>
          <p className="text-3xl font-bold">{stats.completedCourses}</p>
          <p className="text-xs mt-2 opacity-75">
            {stats.enrolledCourses > 0 
              ? Math.round((stats.completedCourses / stats.enrolledCourses) * 100)
              : 0}% completion
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
          <Clock className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Learning Time</h3>
          <p className="text-3xl font-bold">{stats.totalWatchTime}h</p>
          <p className="text-xs mt-2 opacity-75">Total hours</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <Award className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Certificates</h3>
          <p className="text-3xl font-bold">{stats.certificates}</p>
          <p className="text-xs mt-2 opacity-75">Ready to download</p>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <GraduationCap className="h-10 w-10 text-blue-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Average Grade</h3>
          <p className="text-2xl font-bold text-primary">{stats.averageGrade}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <Target className="h-10 w-10 text-green-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Completion Rate</h3>
          <p className="text-2xl font-bold text-primary">{stats.completionRate}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <Star className="h-10 w-10 text-yellow-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Learning Streak</h3>
          <p className="text-2xl font-bold text-primary">{stats.streakDays} days</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <TrendingUp className="h-10 w-10 text-purple-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Progress</h3>
          <p className="text-2xl font-bold text-primary">Excellent</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-5 gap-4">
          <Link
            to="/student/courses"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
            <BookOpen className="text-accent group-hover:scale-110 transition" size={32} />
            <div className="text-center mt-2">
              <div className="font-semibold text-sm">My Courses</div>
              <div className="text-xs text-gray-600">View all</div>
            </div>
          </Link>

          <Link
            to="/student/certificates"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
            <Award className="text-accent group-hover:scale-110 transition" size={32} />
            <div className="text-center mt-2">
              <div className="font-semibold text-sm">Certificates</div>
              <div className="text-xs text-gray-600">Download</div>
            </div>
          </Link>

          <Link
            to="/student/learning-path"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
            <Target className="text-accent group-hover:scale-110 transition" size={32} />
            <div className="text-center mt-2">
              <div className="font-semibold text-sm">Learning Path</div>
              <div className="text-xs text-gray-600">Track goals</div>
            </div>
          </Link>

          <Link
            to="/student/progress"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
            <TrendingUp className="text-accent group-hover:scale-110 transition" size={32} />
            <div className="text-center mt-2">
              <div className="font-semibold text-sm">Progress</div>
              <div className="text-xs text-gray-600">Analytics</div>
            </div>
          </Link>

          <Link
            to="/student/discussion-forum"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
            <MessageSquare className="text-accent group-hover:scale-110 transition" size={32} />
            <div className="text-center mt-2">
              <div className="font-semibold text-sm">Discussion</div>
              <div className="text-xs text-gray-600">Ask & Share</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Performance & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Learning Progress</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Overall Completion</span>
                <span className="font-semibold">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all" style={{ width: `${stats.completionRate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Assignment Completion</span>
                <span className="font-semibold">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: '92%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Video Watch Rate</span>
                <span className="font-semibold">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Quiz Performance</span>
                <span className="font-semibold">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <Activity className="text-accent" size={20} />
          </div>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'complete' ? 'bg-green-500' : 
                  activity.type === 'signin' ? 'bg-blue-500' : 
                  'bg-orange-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium">
                    <span className="font-semibold">{activity.user}</span> {activity.detail}
                  </p>
                  <p className="text-xs text-gray-600">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

 function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [withdrawing, setWithdrawing] = useState(null);
  const [openVideo, setOpenVideo] = useState(null);

  // ────────────────────────────────────────────────────────────
  // ⚠️ IMPORTANT: Replace the course ID with your actual ID
  // After running the SQL INSERT, check what ID was created:
  // SELECT id FROM courses WHERE course_code = 'BFSI-001';
  // Then replace the number below with that ID
  // ────────────────────────────────────────────────────────────
 const COURSE_VIDEOS = {
   36: '/videos/bfsi-promo.mp4',  // ← Your actual BFSI course ID
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments/my-enrollments');
      console.log('Enrollments response:', response.data);
      
      if (response.data.success) {
        setEnrollments(response.data.enrollments);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      
      // Mock data for demonstration
      setEnrollments([
        {
          id: 1,
          Course: {
            id: 1,
            course_name: 'Introduction to BFSI Industry',
            description: 'Get a solid foundation in Banking, Financial Services & Insurance.',
            duration_hours: 40
          },
          progress_percentage: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          Course: {
            id: 2,
            course_name: 'React Advanced',
            description: 'Master React with hooks, context, and advanced patterns',
            duration_hours: 40
          },
          progress_percentage: 65,
          created_at: '2024-01-15'
        },
      ]);
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
      alert('Successfully withdrawn from course');
    } catch (error) {
      console.error('Error withdrawing:', error);
      alert('Error withdrawing from course');
    } finally {
      setWithdrawing(null);
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'in-progress') return e.progress_percentage < 100;
    if (filter === 'completed') return e.progress_percentage === 100;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <div className="flex gap-2">
          {['all', 'in-progress', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition capitalize ${
                filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4 text-lg">
            {filter === 'all'
              ? "You haven't enrolled in any courses yet"
              : `No ${filter.replace('-', ' ')} courses`}
          </p>
          <Link
            to="/student/browse"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
          <ShoppingBag className="text-accent group-hover:scale-110 transition" size={32} />
          <div className="text-center mt-2">
            <div className="font-semibold text-sm">Browse Courses</div>
              <div className="text-xs text-gray-600">Find new courses</div>
            </div>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => {
            const courseId = enrollment.Course.id;
            const videoSrc = COURSE_VIDEOS[courseId];
            const isVideoOpen = openVideo === enrollment.id;

            return (
              <div
                key={enrollment.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden"
              >
                {/* Progress bar top strip */}
                <div
                  className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{ width: `${enrollment.progress_percentage || 0}%` }}
                />

                {/* Inline Video Player (only for courses that have a promo video) */}
                {videoSrc && (
                  <div className="relative bg-gray-900">
                    {isVideoOpen ? (
                      <div className="relative">
                        <video
                          className="w-full"
                          style={{ maxHeight: '200px', objectFit: 'cover' }}
                          src={videoSrc}
                          controls
                          autoPlay
                          onError={(e) => {
                            const parent = e.target.closest('.relative');
                            if (parent) {
                              parent.innerHTML = '<div class="flex items-center justify-center h-32 text-gray-400 text-sm">Video not found — place file in /public/videos/</div>';
                            }
                          }}
                        />
                        {/* Close button */}
                        <button
                          onClick={() => setOpenVideo(null)}
                          className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      /* Video thumbnail / play prompt */
                      <button
                        onClick={() => setOpenVideo(enrollment.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:from-blue-800 hover:to-blue-600 transition group"
                      >
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition">
                          <PlayCircle size={20} className="text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-yellow-300 uppercase tracking-wide">🎬 Program Video</p>
                          <p className="text-xs text-blue-200">Watch the BFSI promo overview</p>
                        </div>
                        <span className="ml-auto text-blue-300 text-xs">▶ Play</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Course card body */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {enrollment.Course.course_name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {enrollment.Course.description}
                      </p>
                    </div>
                    {enrollment.progress_percentage === 100 && (
                      <CheckCircle className="text-green-500 flex-shrink-0 ml-2" size={24} />
                    )}
                  </div>

                  {/* Circular progress */}
                  <div className="flex items-center justify-center mb-4">
                    <CircularProgress
                      percentage={enrollment.progress_percentage || 0}
                      size={100}
                      strokeWidth={8}
                    />
                  </div>

                  {/* Duration + Enroll date */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{enrollment.Course.duration_hours}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(enrollment.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/student/course/${enrollment.Course.id}`}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-2 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={18} />
                      {enrollment.progress_percentage === 100 ? 'Review' : 'Continue'}
                    </Link>
                    {enrollment.progress_percentage < 100 && (
                      <button
                        onClick={() => handleWithdraw(enrollment.id, enrollment.Course.course_name)}
                        disabled={withdrawing === enrollment.id}
                        className="px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition disabled:opacity-50 text-sm"
                        title="Withdraw"
                      >
                        {withdrawing === enrollment.id ? '...' : <X size={18} />}
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

// ==================== LEARNING PATH COMPONENT ====================
function LearningPath() {
  const [activeGoal, setActiveGoal] = useState(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  
  const [goals, setGoals] = useState([
    { 
      id: 1, 
      goal: 'Master FinTech Fundamentals', 
      progress: 60, 
      deadline: '2026-03-01',
      priority: 'High',
      category: 'FinTech',
      completedMilestones: 2,
      milestones: ['Complete Module 1', 'Pass Quiz 1', 'Submit Assignment 1', 'Complete Module 2']
    },
    { 
      id: 2, 
      goal: 'Complete Product Management Course', 
      progress: 30, 
      deadline: '2026-04-15',
      priority: 'Medium',
      category: 'Product Management',
      completedMilestones: 1,
      milestones: ['Watch Introduction', 'Complete Case Study', 'Submit Final Project']
    },
    { 
      id: 3, 
      goal: 'Earn 3 Certificates', 
      progress: 33, 
      deadline: '2026-06-30',
      priority: 'Low',
      category: 'General',
      completedMilestones: 1,
      milestones: ['Complete Course 1', 'Complete Course 2', 'Complete Course 3']
    }
  ]);

  const [recommendations, setRecommendations] = useState([
    { id: 1, title: 'Advanced Data Analytics', category: 'Data Science', match: '95%' },
    { id: 2, title: 'AI Product Strategy', category: 'Product Management', match: '88%' },
    { id: 3, title: 'Blockchain Fundamentals', category: 'FinTech', match: '82%' }
  ]);

  // Helper function to get priority color - ADD THIS
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'from-red-500 to-pink-500';
      case 'Medium': return 'from-yellow-500 to-orange-500';
      case 'Low': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">My Learning Path</h2>

      {/* Learning Goals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Learning Goals</h2>
              <p className="text-sm text-gray-600">Track your progress and stay motivated</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddGoal(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </button>
        </div>

        <div className="grid gap-4">
          {goals.map((goal, index) => (
            <div
              key={goal.id}
              className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Priority Indicator */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getPriorityColor(goal.priority)}`}></div>
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {goal.goal}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getPriorityColor(goal.priority)} text-white`}>
                      {goal.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {goal.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 w-4" />
                      {goal.completedMilestones}/{goal.milestones.length} milestones
                    </span>
                  </div>
                </div>

                {/* Circular Progress */}
                <div className="relative">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke={`url(#gradient-${goal.id})`}
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - goal.progress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    <defs>
                      <linearGradient id={`gradient-${goal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" className="text-blue-500" style={{ stopColor: 'currentColor' }} />
                        <stop offset="100%" className="text-cyan-500" style={{ stopColor: 'currentColor' }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-800">{goal.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getPriorityColor(goal.priority)} rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${goal.progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>

              {/* Milestones */}
              <button
                onClick={() => setActiveGoal(activeGoal === goal.id ? null : goal.id)}
                className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span className="font-medium">View Milestones</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeGoal === goal.id ? 'rotate-90' : ''}`} />
              </button>

              {activeGoal === goal.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {goal.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        idx < goal.completedMilestones
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {idx < goal.completedMilestones && <CheckCircle className="w-4 h-4" />}
                      </div>
                      <span className={idx < goal.completedMilestones ? 'text-gray-800 font-medium' : 'text-gray-500'}>
                        {milestone}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Recommended for You</h3>
          <Lightbulb className="text-yellow-500" size={24} />
        </div>
        <p className="text-sm text-gray-600 mb-4">Based on your learning history and goals</p>
        <div className="grid md:grid-cols-2 gap-4">
          {recommendations.map((course) => (
            <div key={course.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-accent transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{course.title}</h4>
                  <p className="text-sm text-gray-600">{course.category}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded">
                  {course.match} match
                </span>
              </div>
              <Link
                to="/courses"
                className="text-accent hover:underline text-sm font-semibold flex items-center gap-1 mt-2"
              >
                View Course <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Add placeholder components for remaining routes

// ==================== CERTIFICATES COMPONENT ====================
function Certificates() {
  const [certificates, setCertificates] = useState([]);

  const handleDownload = async (certificateId) => {
    try {
      const response = await api.get(`/student/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error downloading certificate');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">My Certificates</h2>

      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No certificates earned yet</p>
          <p className="text-sm text-gray-500">Complete courses to earn certificates</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-start justify-between mb-4">
                <Award className="text-yellow-500" size={40} />
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{cert.course_name}</h3>
              <p className="text-sm text-gray-600 mb-1">Certificate ID: {cert.certificate_id}</p>
              <p className="text-sm text-gray-600 mb-4">
                Issued on {new Date(cert.issue_date).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleDownload(cert.id)}
                className="w-full bg-accent hover:bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Download size={18} />
                Download Certificate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== PROGRESS COMPONENT ====================
function Progress() {
  const [analytics, setAnalytics] = useState({
    streakDays: 7,
    averageScore: 87,
    completionRate: 72,
    categoryProgress: [
      { category: 'Programming', progress: 75, courses: 3 },
      { category: 'Data Science', progress: 60, courses: 2 },
      { category: 'Web Development', progress: 85, courses: 1 }
    ]
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Progress & Analytics</h2>
      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Learning Streak</h3>
            <Star className="text-yellow-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-primary">{analytics.streakDays} days</p>
          <p className="text-xs text-gray-600 mt-1">Keep it up!</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Average Score</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-primary">{analytics.averageScore}%</p>
          <p className="text-xs text-green-600 mt-1">+5% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Completion Rate</h3>
            <BarChart3 className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-primary">{analytics.completionRate}%</p>
          <p className="text-xs text-gray-600 mt-1">Of enrolled courses</p>
        </div>
      </div>

      {/* Progress by Category */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Progress by Category</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {analytics.categoryProgress.map((item, idx) => (
            <div key={idx} className="text-center">
              <CircularProgress 
                percentage={item.progress} 
                size={120} 
                strokeWidth={10}
              />
              <h4 className="mt-4 font-semibold text-gray-800">{item.category}</h4>
              <p className="text-sm text-gray-600">{item.courses} courses • {item.progress}% complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== DISCUSSION FORUM ====================
function DiscussionForum() {
  const [threads, setThreads] = useState([
    { id: 1, title: 'How to implement Redux in React?', author: 'John Doe', course: 'React Advanced', replies: 12, upvotes: 24, created: '2026-02-08', hasAnswer: true },
    { id: 2, title: 'Best practices for async/await', author: 'Jane Smith', course: 'JavaScript Mastery', replies: 8, upvotes: 15, created: '2026-02-09', hasAnswer: false },
    { id: 3, title: 'Difficulty understanding Binary Trees', author: 'Mike Johnson', course: 'Data Structures', replies: 20, upvotes: 42, created: '2026-02-07', hasAnswer: true }
  ]);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', course: '' });

  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/forum/threads', newThread);
      setThreads([response.data.thread, ...threads]);
      setShowNewThread(false);
      setNewThread({ title: '', content: '', course: '' });
      alert('Thread created successfully!');
    } catch (error) {
      alert('Error creating thread');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Discussion Forum</h2>
        <button onClick={() => setShowNewThread(true)}
          className="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg">
          <Plus size={20} /> New Thread
        </button>
      </div>

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Create New Thread</h3>
              <button onClick={() => setShowNewThread(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                <select value={newThread.course} onChange={(e) => setNewThread({...newThread, course: e.target.value})} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                  <option value="">Select Course</option>
                  <option value="React Advanced">React Advanced</option>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Python Mastery">Python Mastery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input type="text" value={newThread.title} onChange={(e) => setNewThread({...newThread, title: e.target.value})} required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Ask your question or start a discussion..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                <textarea value={newThread.content} onChange={(e) => setNewThread({...newThread, content: e.target.value})} required rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Provide details about your question..."></textarea>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-accent hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition">Post Thread</button>
                <button type="button" onClick={() => setShowNewThread(false)} className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Thread List */}
      <div className="space-y-4">
        {threads.map((thread) => (
          <div key={thread.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Link to={`/student/forum/thread/${thread.id}`} className="text-lg font-bold text-gray-800 hover:text-accent transition">{thread.title}</Link>
                  {thread.hasAnswer && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold flex items-center gap-1"><CheckCircle size={12} /> Answered</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1"><User size={14} /> {thread.author}</span>
                  <span className="flex items-center gap-1"><BookOpen size={14} /> {thread.course}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(thread.created).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600"><ThumbsUp size={16} /> {thread.upvotes}</div>
                <div className="flex items-center gap-1 text-gray-600"><MessageSquare size={16} /> {thread.replies}</div>
              </div>
            </div>
            <Link to={`/student/forum/thread/${thread.id}`} className="inline-block text-accent hover:text-blue-600 font-semibold text-sm flex items-center gap-1">
              View Discussion <ChevronRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== NOTIFICATIONS COMPONENT ====================
function Notifications() {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'assignment', title: 'New Assignment Posted', message: 'FinTech Case Study due in 3 days', time: '2 hours ago', read: false },
    { id: 2, type: 'exam', title: 'Upcoming Exam', message: 'Product Management Exam scheduled for Feb 20', time: '5 hours ago', read: false },
    { id: 3, type: 'announcement', title: 'Course Update', message: 'New module added to Data Analytics course', time: '1 day ago', read: true },
    { id: 4, type: 'assignment', title: 'Assignment Graded', message: 'Your submission scored 85/100', time: '2 days ago', read: true }
  ]);

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'assignment': return <FileText className="text-blue-500" size={20} />;
      case 'exam': return <Award className="text-purple-500" size={20} />;
      case 'announcement': return <Bell className="text-green-500" size={20} />;
      default: return <AlertCircle className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Notifications</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'all' ? 'bg-accent text-white' : 'bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('assignment')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'assignment' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setFilter('exam')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filter === 'exam' ? 'bg-purple-500 text-white' : 'bg-gray-200'
            }`}
          >
            Exams
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`bg-white rounded-lg shadow p-4 flex items-start gap-4 ${
              !notif.read ? 'border-l-4 border-accent' : ''
            }`}
          >
            <div className="mt-1">{getNotificationIcon(notif.type)}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                <span className="text-xs text-gray-500">{notif.time}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
              {!notif.read && (
                <span className="inline-block mt-2 text-xs bg-accent text-white px-2 py-1 rounded">New</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== HELP & SUPPORT COMPONENT ====================
function HelpSupport() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('general');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/student/support', { query, category });
      alert('Query submitted successfully!');
      setQuery('');
    } catch (error) {
      alert('Error submitting query');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h2 className="text-2xl font-bold text-primary">Help & Support</h2>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Submit a Query</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="general">General Question</option>
              <option value="technical">Technical Issue</option>
              <option value="course">Course Related</option>
              <option value="payment">Payment Issue</option>
            </select>
          </div>
          <div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Your Question</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows="5"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Describe your question or issue..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-accent hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition"
          >
            Submit Query
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: 'How do I reset my password?', a: 'Go to login page and click "Forgot Password"' },
            { q: 'Can I get a refund?', a: 'Refunds are available within 7 days of purchase' },
            { q: 'How do I download certificates?', a: 'Go to Certificates section and click Download' }
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

// ==================== PAYMENTS COMPONENT ====================
function PaymentsComponent() {
  const [payments, setPayments] = useState([]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Payment History</h2>
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
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No payment history
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono text-sm">{payment.transaction_id}</td>
                  <td className="px-6 py-4">{payment.course_name}</td>
                  <td className="px-6 py-4 font-semibold">₹{payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(payment.date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== MY COURSES WITH WITHDRAWAL ====================
function WithdrawalCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [withdrawing, setWithdrawing] = useState(null);

  useEffect(() => { fetchEnrollments(); }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments/my-enrollments');
      if (response.data.success) setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (enrollmentId, courseName) => {
    if (!confirm(`Withdraw from "${courseName}"? This cannot be undone.`)) return;
    setWithdrawing(enrollmentId);
    try {
      await api.delete(`/enrollments/${enrollmentId}`);
      setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
      alert('Successfully withdrawn from course');
    } catch (error) {
      alert('Error withdrawing from course');
    } finally {
      setWithdrawing(null);
    }
  };

  const filteredEnrollments = enrollments.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'in-progress') return e.progress_percentage < 100;
    if (filter === 'completed') return e.progress_percentage === 100;
    return true;
  });

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">My Courses</h2>
        <div className="flex gap-2">
          {['all', 'in-progress', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition capitalize ${filter === f ? 'bg-accent text-white' : 'bg-gray-200'}`}>
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4 text-lg">{filter === 'all' ? "No courses enrolled" : `No ${filter.replace('-', ' ')} courses`}</p>
          <Link to="/courses" className="inline-block bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition">Browse Courses</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-accent to-blue-600" style={{width: `${enrollment.progress_percentage || 0}%`}}></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-primary mb-2">{enrollment.Course.course_name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{enrollment.Course.description}</p>
                  </div>
                  {enrollment.progress_percentage === 100 && <CheckCircle className="text-green-500 flex-shrink-0 ml-2" size={24} />}
                </div>
                <div className="flex items-center justify-center mb-4">
                  <CircularProgress percentage={enrollment.progress_percentage || 0} size={100} strokeWidth={8} />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1"><Clock size={16} /><span>{enrollment.Course.duration_hours}h</span></div>
                  <div className="flex items-center gap-1"><Calendar size={16} /><span>Enrolled {new Date(enrollment.created_at).toLocaleDateString()}</span></div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/student/course/${enrollment.Course.id}`}
                    className="flex-1 bg-accent hover:bg-blue-600 text-white text-center py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                    <PlayCircle size={18} /> {enrollment.progress_percentage === 100 ? 'Review' : 'Continue'}
                  </Link>
                  {enrollment.progress_percentage < 100 && (
                    <button onClick={() => handleWithdraw(enrollment.id, enrollment.Course.course_name)} disabled={withdrawing === enrollment.id}
                      className="px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition disabled:opacity-50" title="Withdraw">
                      {withdrawing === enrollment.id ? '...' : <X size={18} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileManagement() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [personalInfo, setPersonalInfo] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    date_of_birth: '',
    gender: '',
    profile_photo: null,
    bio: ''
  });

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    postal_code: ''
  });

  const [security, setSecurity] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
    two_factor_enabled: false
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'Asia/Kolkata',
    email_notifications: true,
    sms_notifications: false,
    theme: 'light'
  });

  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    twitter: '',
    portfolio: ''
  });

  const [loginHistory, setLoginHistory] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'Mumbai, India', ip: '192.168.1.1', time: '2026-02-09 10:30 AM', status: 'success' },
    { id: 2, device: 'Safari on iPhone', location: 'Mumbai, India', ip: '192.168.1.2', time: '2026-02-08 08:15 PM', status: 'success' },
    { id: 3, device: 'Chrome on Windows', location: 'Mumbai, India', ip: '192.168.1.1', time: '2026-02-07 02:45 PM', status: 'success' }
  ])

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    fetchProfileData();
    calculateProfileCompletion();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/student/profile/complete');
      if (response.data.success) {
        const data = response.data.profile;
        setPersonalInfo(data.personal || personalInfo);
        setAddress(data.address || address);
        setPreferences(data.preferences || preferences);
        setSocialLinks(data.social || socialLinks);
        setSecurity({ ...security, two_factor_enabled: data.two_factor_enabled || false });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const calculateProfileCompletion = () => {
    const fields = [
      personalInfo.full_name, personalInfo.phone, personalInfo.date_of_birth,
      personalInfo.gender, personalInfo.bio,
      address.street, address.city, address.state, address.country, address.postal_code,
      socialLinks.linkedin, socialLinks.github,
      preferences.language, preferences.timezone
    ];
    
    const completed = fields.filter(field => field && field.toString().trim() !== '').length;
    const percentage = Math.round((completed / fields.length) * 100);
    setProfileCompletion(percentage);
  };

  useEffect(() => {
    calculateProfileCompletion();
  }, [personalInfo, address, socialLinks, preferences]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showMessage('error', 'Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo({ ...personalInfo, profile_photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePersonalInfo = async () => {
    setSaving(true);
    try {
      const response = await api.put('/student/profile/personal', personalInfo);
      if (response.data.success) {
        showMessage('success', 'Personal information updated successfully!');
        if (updateUser) updateUser({ full_name: personalInfo.full_name });
      }
    } catch (error) {
      showMessage('error', 'Error updating personal information');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAddress = async () => {
    setSaving(true);
    try {
      await api.put('/student/profile/address', address);
      showMessage('success', 'Address updated successfully!');
    } catch (error) {
      showMessage('error', 'Error updating address');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (security.new_password !== security.confirm_password) {
      showMessage('error', 'Passwords do not match!');
      return;
    }
    
    if (security.new_password.length < 6) {
      showMessage('error', 'Password must be at least 6 characters!');
      return;
    }

    setSaving(true);
    try {
      await api.post('/auth/change-password', {
        current_password: security.current_password,
        new_password: security.new_password
      });
      showMessage('success', 'Password changed successfully!');
      setSecurity({ ...security, current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error changing password');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = async () => {
    setSaving(true);
    try {
      const newStatus = !security.two_factor_enabled;
      await api.post('/student/profile/2fa', { enabled: newStatus });
      setSecurity({ ...security, two_factor_enabled: newStatus });
      showMessage('success', `Two-factor authentication ${newStatus ? 'enabled' : 'disabled'}!`);
    } catch (error) {
      showMessage('error', 'Error updating 2FA settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await api.put('/student/profile/preferences', preferences);
      showMessage('success', 'Preferences updated successfully!');
    } catch (error) {
      showMessage('error', 'Error updating preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocialLinks = async () => {
    setSaving(true);
    try {
      await api.put('/student/profile/social', socialLinks);
      showMessage('success', 'Social links updated successfully!');
    } catch (error) {
      showMessage('error', 'Error updating social links');
    } finally {
      setSaving(false);
    }
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
      <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Profile Management</h2>
            <p className="text-blue-100">Manage your personal information and settings</p>
          </div>
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
                <circle 
                  cx="48" cy="48" r="40" 
                  stroke="white" 
                  strokeWidth="6" 
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - profileCompletion / 100)}`}
                  strokeLinecap="round"
                />
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
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-accent text-white border-b-2 border-accent'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
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
                      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="4" fill="white"/>
                        <circle cx="50" cy="38" r="18" fill="#111"/>
                        <ellipse cx="50" cy="82" rx="28" ry="18" fill="#111"/>
                      </svg>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition">
                      <Camera size={20} className="text-accent" />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Max 5MB</p>
                </div>

                <div className="flex-1 grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User size={16} className="inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={personalInfo.full_name}
                      onChange={(e) => setPersonalInfo({...personalInfo, full_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-2" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-2" />
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={personalInfo.date_of_birth}
                      onChange={(e) => setPersonalInfo({...personalInfo, date_of_birth: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <div className="flex gap-4">
                      {['Male', 'Female', 'Other', 'Prefer not to say'].map(option => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={option}
                            checked={personalInfo.gender === option}
                            onChange={(e) => setPersonalInfo({...personalInfo, gender: e.target.value})}
                            className="w-4 h-4 text-accent focus:ring-accent"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={personalInfo.bio}
                      onChange={(e) => setPersonalInfo({...personalInfo, bio: e.target.value})}
                      rows="4"
                      maxLength="500"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Tell us about yourself..."
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">{personalInfo.bio?.length || 0}/500 characters</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSavePersonalInfo}
                disabled={saving}
                className="w-full bg-accent hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Personal Info'}
              </button>
            </div>
          )}

          {activeTab === 'address' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="123 Main Street, Apartment 4B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">State/Province</label>
                  <input
                    type="text"
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                  <select
                    value={address.country}
                    onChange={(e) => setAddress({...address, country: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select Country</option>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={address.postal_code}
                    onChange={(e) => setAddress({...address, postal_code: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="400001"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAddress}
                disabled={saving}
                className="w-full bg-accent hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Lock size={24} className="text-accent" />
                  Change Password
                </h3>
                <div className="space-y-4 max-w-2xl">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={security.current_password}
                        onChange={(e) => setSecurity({...security, current_password: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={security.new_password}
                        onChange={(e) => setSecurity({...security, new_password: e.target.value})}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter new password (min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={security.confirm_password}
                      onChange={(e) => setSecurity({...security, confirm_password: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Shield size={24} className="text-accent" />
                  Two-Factor Authentication
                </h3>
                <div className="flex items-center justify-between max-w-2xl bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">Enable 2FA</p>
                    <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={handleToggle2FA}
                    disabled={saving}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
                      security.two_factor_enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                        security.two_factor_enabled ? 'translate-x-9' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Clock size={24} className="text-accent" />
                  Login History
                </h3>
                <div className="space-y-3">
                  {loginHistory.map(login => (
                    <div key={login.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {login.device.includes('iPhone') ? <Smartphone className="text-blue-600" size={20} /> : <Monitor className="text-blue-600" size={20} />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{login.device}</p>
                          <p className="text-sm text-gray-600">{login.location} • IP: {login.ip}</p>
                          <p className="text-xs text-gray-500">{login.time}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        {login.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Language
                  </label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock size={16} className="inline mr-2" />
                    Timezone
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                    <option value="America/New_York">EST (America/New_York)</option>
                    <option value="Europe/London">GMT (Europe/London)</option>
                    <option value="Asia/Tokyo">JST (Asia/Tokyo)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    <Bell size={16} className="inline mr-2" />
                    Notifications
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <button
                        onClick={() => setPreferences({...preferences, email_notifications: !preferences.email_notifications})}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
                          preferences.email_notifications ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                            preferences.email_notifications ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">SMS Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates via SMS</p>
                      </div>
                      <button
                        onClick={() => setPreferences({...preferences, sms_notifications: !preferences.sms_notifications})}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
                          preferences.sms_notifications ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                            preferences.sms_notifications ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    <Palette size={16} className="inline mr-2" />
                    Theme
                  </label>
                  <div className="flex gap-4">
                    {['light', 'dark', 'auto'].map(theme => (
                      <button
                        key={theme}
                        onClick={() => setPreferences({...preferences, theme})}
                        className={`flex-1 p-4 border-2 rounded-lg transition capitalize ${
                          preferences.theme === theme
                            ? 'border-accent bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="w-full bg-accent hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Linkedin size={16} className="inline mr-2 text-blue-600" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Github size={16} className="inline mr-2" />
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={socialLinks.github}
                    onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Twitter size={16} className="inline mr-2 text-blue-400" />
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <LinkIcon size={16} className="inline mr-2 text-purple-600" />
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={socialLinks.portfolio}
                    onChange={(e) => setSocialLinks({...socialLinks, portfolio: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              {(socialLinks.linkedin || socialLinks.github || socialLinks.twitter || socialLinks.portfolio) && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-4">Preview</h4>
                  <div className="flex gap-3">
                    {socialLinks.linkedin && (
                      <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition">
                        <Linkedin size={24} />
                      </a>
                    )}
                    {socialLinks.github && (
                      <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-900 transition">
                        <Github size={24} />
                      </a>
                    )}
                    {socialLinks.twitter && (
                      <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition">
                        <Twitter size={24} />
                      </a>
                    )}
                    {socialLinks.portfolio && (
                      <a href={socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition">
                        <LinkIcon size={24} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveSocialLinks}
                disabled={saving}
                className="w-full bg-accent hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {saving ? 'Saving...' : 'Save Social Links'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Student Setting
function SystemSettings() {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('password');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    courseUpdates: true,
    newContent: true,
    deadlineReminders: true,
    discussionReplies: true,
    certificateAlerts: true,
    promotionalEmails: false,
    weeklyDigest: true
  });

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showProgress: true,
    allowMessages: true
  });

  // Appearance Settings State
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Kolkata'
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const response = await api.get('/student/settings');
      if (response.data.success) {
        if (response.data.notifications) setNotificationSettings(response.data.notifications);
        if (response.data.privacy) setPrivacySettings(response.data.privacy);
        if (response.data.appearance) setAppearanceSettings(response.data.appearance);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        showMessage('success', 'Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Handle Notification Settings Update
  const handleNotificationUpdate = async () => {
    setLoading(true);

    try {
      const response = await api.put('/student/settings/notifications', notificationSettings);
      if (response.data.success) {
        showMessage('success', 'Notification settings updated!');
      }
    } catch (error) {
      showMessage('error', 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle Privacy Settings Update
  const handlePrivacyUpdate = async () => {
    setLoading(true);

    try {
      const response = await api.put('/student/settings/privacy', privacySettings);
      if (response.data.success) {
        showMessage('success', 'Privacy settings updated!');
      }
    } catch (error) {
      showMessage('error', 'Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle Appearance Settings Update
  const handleAppearanceUpdate = async () => {
    setLoading(true);

    try {
      const response = await api.put('/student/settings/appearance', appearanceSettings);
      if (response.data.success) {
        showMessage('success', 'Appearance settings updated!');
      }
    } catch (error) {
      showMessage('error', 'Failed to update appearance settings');
    } finally {
      setLoading(false);
    }
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    const confirmation = window.prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      showMessage('error', 'Account deletion cancelled');
      return;
    }

    setLoading(true);

    try {
      const response = await api.delete('/student/account');
      if (response.data.success) {
        showMessage('success', 'Account deleted successfully. Redirecting...');
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } catch (error) {
      showMessage('error', 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Danger Zone', icon: AlertCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Account Settings</h2>
          <p className="text-gray-600 mt-1">Manage your security, notifications, and preferences</p>
        </div>
        <Settings className="text-gray-400" size={40} />
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' && <CheckCircle size={20} />}
          {message.type === 'error' && <XCircle size={20} />}
          {message.type === 'info' && <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Security Tip:</strong> Use a strong password with at least 8 characters, including uppercase, lowercase, and numbers.
                </p>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordData.newPassword && (
                  <p className="text-xs mt-2 text-gray-600">
                    Strength: {
                      passwordData.newPassword.length < 8 ? '❌ Too short' :
                      passwordData.newPassword.length < 12 ? '⚠️ Medium' :
                      '✅ Strong'
                    }
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordData.confirmPassword && (
                  <p className={`text-xs mt-2 ${
                    passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {passwordData.newPassword === passwordData.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Lock size={20} />
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-2xl">
              <p className="text-gray-600">Manage how you receive notifications</p>

              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'courseUpdates', label: 'Course Updates', desc: 'Get notified when courses are updated' },
                  { key: 'newContent', label: 'New Content', desc: 'Alerts for new lessons and materials' },
                  { key: 'deadlineReminders', label: 'Deadline Reminders', desc: 'Reminders for upcoming deadlines' },
                  { key: 'discussionReplies', label: 'Discussion Replies', desc: 'Notifications for forum replies' },
                  { key: 'certificateAlerts', label: 'Certificate Alerts', desc: 'Alerts when certificates are ready' },
                  { key: 'promotionalEmails', label: 'Promotional Emails', desc: 'Receive promotional offers' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Summary of your weekly activity' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.label}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[item.key]}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNotificationUpdate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 max-w-2xl">
              <p className="text-gray-600">Control your privacy and data sharing</p>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Profile Visibility</h4>
                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public - Anyone can see</option>
                  <option value="students">Students Only</option>
                  <option value="private">Private - Only me</option>
                </select>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'showEmail', label: 'Show Email', desc: 'Display email on public profile' },
                  { key: 'showPhone', label: 'Show Phone', desc: 'Display phone number on profile' },
                  { key: 'showProgress', label: 'Show Progress', desc: 'Let others see your course progress' },
                  { key: 'allowMessages', label: 'Allow Messages', desc: 'Accept messages from other students' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.label}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings[item.key]}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, [item.key]: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePrivacyUpdate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Shield size={20} />
                {loading ? 'Saving...' : 'Save Privacy Settings'}
              </button>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 max-w-2xl">
              <p className="text-gray-600">Customize your learning experience</p>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Theme</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'light', label: 'Light', icon: '☀️' },
                    { value: 'dark', label: 'Dark', icon: '🌙' },
                    { value: 'auto', label: 'Auto', icon: '🔄' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: theme.value })}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition ${
                        appearanceSettings.theme === theme.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-3xl">{theme.icon}</span>
                      <span className="font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Language</h4>
                <select
                  value={appearanceSettings.language}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Timezone</h4>
                <select
                  value={appearanceSettings.timezone}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, timezone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="America/New_York">New York (EST)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Australia/Sydney">Sydney (AEDT)</option>
                </select>
              </div>

              <button
                onClick={handleAppearanceUpdate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Palette size={20} />
                {loading ? 'Saving...' : 'Save Appearance'}
              </button>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-bold text-red-800 mb-2">⚠️ Danger Zone</h3>
                <p className="text-sm text-red-700">
                  These actions are irreversible. Please be certain before proceeding.
                </p>
              </div>

              <div className="border-2 border-red-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Monitor size={20} />
                      Logout from All Devices
                    </h4>
                    <p className="text-sm text-gray-600">
                      This will log you out from all devices where you're currently signed in.
                    </p>
                  </div>
                  <button className="ml-4 px-4 py-2 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 font-semibold transition whitespace-nowrap">
                    Logout All
                  </button>
                </div>
              </div>

              <div className="border-2 border-red-300 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Trash2 size={20} className="text-red-600" />
                      Delete Account
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>All your course progress will be lost</li>
                      <li>Your certificates will be revoked</li>
                      <li>All personal data will be deleted</li>
                      <li>You won't be able to recover this account</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition whitespace-nowrap disabled:opacity-50"
                  >
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
// ==================== MAIN STUDENT DASHBOARD COMPONENT ====================

export default function StudentDashboard() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showMailbox, setShowMailbox] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data
  const [unreadMessages] = useState(2);
  const [messages] = useState([
    {
      id: 1,
      from: 'Course Instructor',
      subject: 'New Assignment Posted',
      preview: 'A new assignment has been posted in Web Development 101...',
      time: '10 min ago',
      read: false
    },
    {
      id: 2,
      from: 'Admin Team',
      subject: 'Certificate Available',
      preview: 'Your certificate for Python Basics is now ready to download...',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      from: 'Support Team',
      subject: 'Payment Confirmation',
      preview: 'Your payment for Advanced JavaScript has been confirmed...',
      time: '3 hours ago',
      read: true
    }
  ]);

  const [notifications] = useState([
    {
      id: 1,
      type: 'enrollment',
      title: 'Course Started',
      message: 'You have successfully enrolled in React Masterclass',
      time: '30 min ago'
    },
    {
      id: 2,
      type: 'assignment',
      title: 'Assignment Due Soon',
      message: 'Web Development assignment due in 2 days',
      time: '2 hours ago'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Successful',
      message: 'Payment of $99 processed successfully',
      time: '5 hours ago'
    }
  ]);

  const navItems = [
    { path: '/student', label: 'Overview', icon: BarChart3 },
    { path: '/student/courses', label: 'My Courses', icon: BookOpen },
    { path: '/student/browse', label: 'Browse Courses', icon: ShoppingBag },
    { path: '/student/learning-path', label: 'Learning Path', icon: Target },
    { path: '/student/certificates', label: 'Certificates', icon: Award },
    { path: '/student/progress', label: 'Progress', icon: TrendingUp },
    { path: '/student/discussion-forum', label: 'Discussion', icon: MessageSquare },
    { path: '/student/notifications', label: 'Notifications', icon: Bell },
    { path: '/student/help', label: 'Help & Support', icon: HelpCircle },
    { path: '/student/payments', label: 'Payments', icon: CreditCard },
    { path: '/student/withdrawal-courses', label: 'Withdrawal Courses', icon: XCircle },
    { path: '/student/profile', label: 'Profile', icon: User },
    { path: '/student/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gradient-to-b from-[#1e5a8e] to-[#164266] text-white transition-all duration-300 overflow-hidden flex-shrink-0 shadow-2xl`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-blue-700/50">
            <div className="flex items-center justify-center">
              <img 
                src="/upskillize-logo.png" 
                alt="Upskillize" 
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full flex items-center px-6 py-3.5 hover:bg-blue-800/50 transition-all group ${
                    isActive ? 'bg-[#164266] border-l-4 border-orange-400' : ''
                  }`}
                >
                  <Icon size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Search Bar */}
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search courses, certificates..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Mail Button */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowMailbox(!showMailbox);
                    setShowNotifications(false);
                    setShowHelp(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition relative"
                >
                  <Mail size={20} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </button>

                {/* Mail Dropdown */}
                {showMailbox && (
                  <>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Messages</h3>
                        <button onClick={() => setShowMailbox(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`p-4 hover:bg-gray-50 cursor-pointer ${!msg.read ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-start justify-between mb-1">
                              <p className="font-semibold text-sm text-gray-900">{msg.from}</p>
                              <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">{msg.subject}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{msg.preview}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-200">
                        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold">
                          View All Messages
                        </button>
                      </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMailbox(false)} />
                  </>
                )}
              </div>

              {/* Notifications Button */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowMailbox(false);
                    setShowHelp(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition relative"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notif.type === 'enrollment' ? 'bg-blue-500' :
                                notif.type === 'payment' ? 'bg-green-500' :
                                'bg-purple-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900 mb-1">{notif.title}</p>
                                <p className="text-xs text-gray-600 mb-1">{notif.message}</p>
                                <span className="text-xs text-gray-500">{notif.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-200">
                        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold">
                          View All Notifications
                        </button>
                      </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  </>
                )}
              </div>

              {/* Help Button */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowHelp(!showHelp);
                    setShowMailbox(false);
                    setShowNotifications(false);
                  }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition"
                >
                  <HelpCircle size={20} />
                </button>

                {/* Help Dropdown */}
                {showHelp && (
                  <>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Help & Support</h3>
                        <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="p-4 space-y-3">
                        <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                          <BookOpen size={18} className="text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Documentation</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                          <Video size={18} className="text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Video Tutorials</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                          <MessageSquare size={18} className="text-purple-600" />
                          <span className="text-sm font-medium text-gray-700">Contact Support</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                          <HelpCircle size={18} className="text-orange-600" />
                          <span className="text-sm font-medium text-gray-700">FAQs</span>
                        </a>
                      </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowHelp(false)} />
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="relative ml-2">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden shadow-lg">
                    {user?.profile_photo ? (
                      <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="3.5" fill="white"/>
                        <circle cx="50" cy="37" r="17" fill="#111"/>
                        <ellipse cx="50" cy="80" rx="27" ry="17" fill="#111"/>
                      </svg>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">{user?.full_name || 'Student'}</div>
                    <div className="text-xs text-gray-500">Learner</div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <Link to="/student/profile" className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                        <User size={16} />
                        Profile
                      </Link>
                      <Link to="/student/settings" className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                        <Settings size={16} />
                        Settings
                      </Link>
                      <hr className="my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-red-600"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserMenuOpen(false)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/courses" element={<MyCourses />} />
              <Route path="/course/:courseId" element={<CoursePlayer />} />
              <Route path="/browse" element={<BrowseCourses />} />
              <Route path="/learning-path" element={<LearningPath />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/discussion-forum" element={<DiscussionForum />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/payments" element={<PaymentsComponent />} />
              <Route path="/withdrawal-courses" element={<WithdrawalCourses />} />
              <Route path="/profile" element={<ProfileManagement />} />
              <Route path="/settings" element={<SystemSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}