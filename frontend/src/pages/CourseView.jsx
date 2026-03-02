import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  ArrowLeft, Clock, BookOpen, Users, CheckCircle,
  PlayCircle, Award, TrendingUp, Lock, Gift, Zap, Star
} from 'lucide-react';

// ─── Which courses are FREE ──────────────────────────────────────
const FREE_COURSE_KEYWORDS = ['mba++', 'mba ++', 'corporate readiness', 'bfsi'];

function isFreeCourse(name = '', code = '') {
  const n = name.toLowerCase();
  const c = code.toLowerCase();
  return FREE_COURSE_KEYWORDS.some(k => n.includes(k) || c.includes(k));
}

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Can this user access full content?
  const isPurchased = user?.is_purchased || user?.role === 'admin' || user?.role === 'faculty';

  useEffect(() => {
    fetchCourseDetails();
    if (user?.role === 'student') checkEnrollment();
  }, [id, user]);

  const fetchCourseDetails = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      if (res.data.success) setCourse(res.data.course);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const res = await api.get('/enrollments/my-enrollments');
      if (res.data.success) {
        setIsEnrolled(res.data.enrollments.some(e => e.course_id === parseInt(id)));
      }
    } catch {
      // silent
    }
  };

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'student') { alert('Only students can enroll'); return; }

    const isFree = isFreeCourse(course?.course_name, course?.course_code);

    // Paid course + not purchased → go to pricing
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
    } finally {
      setEnrolling(false);
    }
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
          } catch {
            alert('Payment verification failed');
          }
        },
        prefill: { email: user.email, name: user.full_name },
        theme: { color: '#f97316' }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch {
      alert('Error initiating payment');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500" />
      </div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h1>
        <Link to="/courses" className="text-orange-500 hover:underline">Browse all courses</Link>
      </div>
    </div>
  );

  const isFree = isFreeCourse(course.course_name, course.course_code);
  const hasFullAccess = isPurchased || isFree || isEnrolled;
  const highlights = course.learning_outcomes ? course.learning_outcomes.split(', ') : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-800">
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1a3a5c] via-[#1e4976] to-[#1a3a5c] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              {/* Badges */}
              <div className="flex items-center gap-3 mb-5">
                <span className="px-4 py-1.5 bg-orange-500 rounded-full text-sm font-bold">
                  {course.category}
                </span>
                <span className="px-4 py-1.5 bg-white/20 rounded-full text-sm font-semibold capitalize">
                  {course.difficulty_level || 'Beginner'}
                </span>
                {isFree && (
                  <span className="px-4 py-1.5 bg-green-500 rounded-full text-sm font-bold flex items-center gap-1">
                    <Gift size={14} /> FREE
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {course.course_name}
              </h1>
              <p className="text-xl text-blue-100 mb-6">{course.description}</p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6 text-sm">
                <span className="flex items-center gap-2"><Clock size={18} />{course.duration_hours} hours</span>
                <span className="flex items-center gap-2"><BookOpen size={18} />{course.CourseModules?.length || 5} modules</span>
                <span className="flex items-center gap-2"><Star size={18} className="text-yellow-400" />4.8 rating</span>
                <span className="flex items-center gap-2"><Award size={18} />Certificate</span>
              </div>

              {/* Demo notice for non-purchased users on paid courses */}
              {!hasFullAccess && !isFree && (
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-4">
                  <p className="font-semibold text-yellow-300 mb-1">🎬 Free Demo Available</p>
                  <p className="text-sm text-blue-100">
                    First lesson is unlocked for free preview. Purchase to access all content.
                  </p>
                </div>
              )}
            </div>

            {/* Enrollment Card */}
            <div className="bg-white text-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                {isFree ? (
                  <>
                    <div className="text-4xl font-bold text-green-600 mb-1">FREE</div>
                    <p className="text-gray-500">No payment required</p>
                  </>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-orange-500 mb-1">
                      ₹{course.price?.toLocaleString()}
                    </div>
                    <p className="text-gray-500">One-time payment</p>
                  </>
                )}
              </div>

              {/* CTA Button */}
              {isEnrolled ? (
                <Link to={`/student/course/${course.id}`}
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-4 rounded-xl font-bold transition text-lg">
                  <PlayCircle size={20} className="inline mr-2" />
                  Continue Learning
                </Link>
              ) : !user ? (
                <div className="space-y-3">
                  <Link to="/login"
                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-4 rounded-xl font-bold transition text-lg">
                    Login to Enroll
                  </Link>
                  <p className="text-center text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-orange-500 hover:underline font-semibold">Sign up free</Link>
                  </p>
                </div>
              ) : hasFullAccess ? (
                <button onClick={handleEnroll} disabled={enrolling}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold transition disabled:opacity-50 text-lg">
                  {enrolling ? 'Processing...' : isFree ? '🎁 Enroll Free' : 'Enroll Now'}
                </button>
              ) : (
                <div className="space-y-3">
                  <Link to="/pricing"
                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-4 rounded-xl font-bold transition text-lg">
                    <Zap size={20} className="inline mr-2" />
                    Unlock Full Access
                  </Link>
                  <button onClick={handleEnroll}
                    className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 py-3 rounded-xl font-semibold transition">
                    👁 Watch Free Demo Lesson
                  </button>
                </div>
              )}

              {/* Perks */}
              <div className="mt-6 space-y-2.5">
                {[
                  'Full lifetime access',
                  'Certificate of completion',
                  'Expert instructor support',
                  hasFullAccess ? 'All modules unlocked' : 'First lesson free preview'
                ].map((perk, i) => (
                  <div key={i} className="flex items-center text-sm text-gray-600">
                    <CheckCircle size={16} className="mr-2 text-green-500 flex-shrink-0" />
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* What You'll Learn */}
            {highlights.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">What You'll Learn</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start">
                      <CheckCircle size={18} className="mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Curriculum</h2>
              <p className="text-sm text-gray-500 mb-5">
                {hasFullAccess
                  ? '✅ All modules unlocked'
                  : '🔓 First lesson is free — rest unlocked after purchase'}
              </p>
              <div className="space-y-3">
                {course.CourseModules?.map((module, idx) => {
                  const isModuleLocked = !hasFullAccess && idx > 0;
                  return (
                    <div key={module.id}
                      className={`border rounded-xl overflow-hidden ${isModuleLocked ? 'border-gray-200 opacity-70' : 'border-orange-100'}`}>
                      <div className={`flex items-center justify-between p-4 ${isModuleLocked ? 'bg-gray-50' : 'bg-orange-50'}`}>
                        <div className="flex items-center gap-3">
                          {isModuleLocked
                            ? <Lock size={18} className="text-gray-400" />
                            : <PlayCircle size={18} className="text-orange-500" />
                          }
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              Module {idx + 1}: {module.module_name}
                            </p>
                            <p className="text-xs text-gray-500">{module.Lessons?.length || 0} lessons</p>
                          </div>
                        </div>
                        {idx === 0 && !hasFullAccess && (
                          <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            FREE PREVIEW
                          </span>
                        )}
                        {isModuleLocked && (
                          <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            PREMIUM
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Unlock CTA inside curriculum */}
              {!hasFullAccess && (
                <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 text-center">
                  <p className="font-semibold text-gray-800 mb-2">Want to unlock all {course.CourseModules?.length} modules?</p>
                  <Link to="/pricing"
                    className="inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition text-sm">
                    View Pricing Plans →
                  </Link>
                </div>
              )}
            </div>

            {/* Prerequisites */}
            {course.prerequisites && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Prerequisites</h2>
                <p className="text-gray-600">{course.prerequisites}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-gray-800 mb-4">This course includes:</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-700">
                  <PlayCircle size={17} className="mr-3 text-orange-500" />
                  {course.duration_hours} hours of video content
                </div>
                <div className="flex items-center text-gray-700">
                  <BookOpen size={17} className="mr-3 text-orange-500" />
                  Downloadable resources
                </div>
                <div className="flex items-center text-gray-700">
                  <Award size={17} className="mr-3 text-orange-500" />
                  Certificate of completion
                </div>
                <div className="flex items-center text-gray-700">
                  <TrendingUp size={17} className="mr-3 text-orange-500" />
                  Lifetime access
                </div>
              </div>
            </div>

            {/* Free access notice */}
            {!hasFullAccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <Gift size={32} className="text-green-500 mx-auto mb-3" />
                <p className="font-bold text-gray-800 mb-1">Free Demo Available</p>
                <p className="text-sm text-gray-600 mb-3">
                  Preview the first lesson of this course absolutely free.
                </p>
                <button onClick={handleEnroll}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-semibold transition text-sm">
                  Watch Free Lesson
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}