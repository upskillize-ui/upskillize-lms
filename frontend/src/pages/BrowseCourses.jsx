import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { BookOpen, Clock, Calendar, CheckCircle, X, PlayCircle, DollarSign, Gift, ShoppingBag, Lock } from 'lucide-react';

// Circular Progress Component
function CircularProgress({ percentage, size = 100, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#3b82f6" strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-700">{percentage}%</span>
      </div>
    </div>
  );
}

// Helper function to check if a course is FREE
// MBA++, Corporate Readiness, and BFSI are FREE
// All other courses require payment
function isFreeCourse(courseName, courseCode) {
  if (!courseName && !courseCode) return false;
  
  const freeCourses = [
    'mba++',
    'mba ++',
    'corporate readiness',
    'corporate readiness program',
    'bfsi',
    'bfsi domain',
    'bfsi domain excellence'
  ];
  
  const nameCheck = (courseName || '').toLowerCase().trim();
  const codeCheck = (courseCode || '').toLowerCase().trim();
  
  return freeCourses.some(freeCourse => 
    nameCheck.includes(freeCourse) || codeCheck.includes(freeCourse)
  );
}

// ==================== MY COURSES COMPONENT ====================
function MyCourses({ onSwitchToBrowse }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [withdrawing, setWithdrawing] = useState(null);
  const [openVideo, setOpenVideo] = useState(null);

  // Course video mappings - Update with your actual course IDs
  const COURSE_VIDEOS = {
    36: '/videos/bfsi-promo.mp4',  // BFSI course video
    // Add more course videos here as needed:
    // 37: '/videos/mba-promo.mp4',
    // 38: '/videos/corporate-readiness-promo.mp4',
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const response = await api.get('/enrollments/my-enrollments');
      if (response.data && response.data.success) {
        setEnrollments(response.data.enrollments || []);
      }
    } catch (error) {
      console.error('❌ Error fetching enrollments:', error);
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
    if (filter === 'in-progress') return (e.progress_percentage || 0) < 100;
    if (filter === 'completed') return (e.progress_percentage || 0) === 100;
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
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition capitalize ${
                filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}>
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filteredEnrollments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4 text-lg">
            {filter === 'all' ? "You haven't enrolled in any courses yet" : `No ${filter.replace('-', ' ')} courses`}
          </p>
          {onSwitchToBrowse && (
            <button onClick={onSwitchToBrowse}
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition">
              Browse Courses
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => {
            const course = enrollment.Course || enrollment.course || {};
            const courseId = course.id;
            const courseName = course.course_name || course.name || 'Unknown Course';
            const courseDesc = course.description || 'No description available';
            const courseDuration = course.duration_hours || 0;
            const progress = enrollment.progress_percentage || 0;
            const enrollDate = enrollment.created_at || enrollment.createdAt || new Date().toISOString();
            const videoSrc = COURSE_VIDEOS[courseId];
            const isVideoOpen = openVideo === enrollment.id;

            return (
              <div key={enrollment.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${progress}%` }} />

                {/* Video Section - Only shows if video is configured for this course */}
                {videoSrc && (
                  <div className="relative bg-gray-900">
                    {isVideoOpen ? (
                      <div className="relative">
                        <video className="w-full" style={{ maxHeight: '200px', objectFit: 'cover' }}
                          src={videoSrc} controls autoPlay onError={(e) => {
                            console.error('❌ Video failed to load:', videoSrc);
                            const parent = e.target.closest('.relative');
                            if (parent) parent.innerHTML = '<div class="flex items-center justify-center h-32 text-gray-400 text-sm">Video not found</div>';
                          }}
                        />
                        <button onClick={() => setOpenVideo(null)}
                          className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center hover:bg-black/90 transition">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setOpenVideo(enrollment.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:from-blue-800 hover:to-blue-600 transition group">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition">
                          <PlayCircle size={22} className="text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-xs font-bold text-yellow-300 uppercase tracking-wide">🎬 Course Video</p>
                          <p className="text-xs text-blue-200">Watch overview</p>
                        </div>
                        <span className="ml-auto text-blue-300 text-sm font-semibold">▶ Play</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{courseName}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{courseDesc}</p>
                    </div>
                    {progress === 100 && <CheckCircle className="text-green-500 flex-shrink-0 ml-2" size={24} />}
                  </div>

                  <div className="flex items-center justify-center mb-4">
                    <CircularProgress percentage={progress} size={100} strokeWidth={8} />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{courseDuration}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{new Date(enrollDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/student/course/${courseId}`}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-2.5 rounded-lg font-semibold transition text-sm flex items-center justify-center gap-2">
                      <PlayCircle size={18} />
                      {progress === 100 ? 'Review' : 'Continue'}
                    </Link>
                    {progress < 100 && (
                      <button onClick={() => handleWithdraw(enrollment.id, courseName)}
                        disabled={withdrawing === enrollment.id}
                        className="px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition disabled:opacity-50 text-sm">
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

// ==================== BROWSE COURSES COMPONENT ====================
export default function BrowseCourses() {
  const [activeTab, setActiveTab] = useState('browse');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      if (response.data && response.data.success) {
        setCourses(response.data.courses || []);
      } else if (Array.isArray(response.data)) {
        setCourses(response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId, courseName, courseCode, isFree) => {
    // PAID COURSES - Redirect to payment page
    if (!isFree) {
      navigate(`/student/payment/${courseId}`);
      return;
    }

    // FREE COURSES - Direct enrollment
    if (!window.confirm(`Enroll in "${courseName}"?`)) return;

    setEnrolling(courseId);
    try {
      const response = await api.post('/enrollments', { course_id: courseId });
      if (response.data && response.data.success) {
        alert(`✅ Successfully enrolled in "${courseName}"!`);
        setActiveTab('my-courses');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        alert('You are already enrolled in this course');
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
      <div className="bg-white rounded-lg shadow-md p-1 inline-flex gap-1">
        <button onClick={() => setActiveTab('browse')}
          className={`px-6 py-2 rounded-md font-semibold transition ${
            activeTab === 'browse' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}>
          Browse Courses
        </button>
        <button onClick={() => setActiveTab('my-courses')}
          className={`px-6 py-2 rounded-md font-semibold transition ${
            activeTab === 'my-courses' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
          }`}>
          My Courses
        </button>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Gift className="text-green-600" size={18} />
                <span className="text-gray-600">Free Course</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="text-orange-600" size={18} />
                <span className="text-gray-600">Paid Course</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const courseName = course.course_name || course.name;
                const courseCode = course.course_code;
                const isFree = isFreeCourse(courseName, courseCode);
                const isEnrolling = enrolling === course.id;

                return (
                  <div key={course.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden relative">
                    {/* Free/Paid Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      {isFree ? (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <Gift size={14} />
                          FREE
                        </div>
                      ) : (
                        <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <DollarSign size={14} />
                          PAID
                        </div>
                      )}
                    </div>

                    <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600" />

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-2 pr-16">
                        {courseName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {course.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Clock size={16} className="mr-1" />
                        <span>{course.duration_hours} hours</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {/* View Details Button - Goes to Course Page */}
                        <Link to={`/student/course/${course.id}`}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2.5 rounded-lg font-semibold transition border border-gray-300">
                          View Details
                        </Link>

                        {/* Enroll Button */}
                        <button onClick={() => handleEnroll(course.id, courseName, courseCode, isFree)}
                          disabled={isEnrolling}
                          className={`flex-1 text-white text-center py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                            isFree ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
                          } disabled:opacity-50`}>
                          {isEnrolling ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Enrolling...
                            </>
                          ) : (
                            <>
                              {isFree ? (
                                <>
                                  <Gift size={18} />
                                  Enroll Free
                                </>
                              ) : (
                                <>
                                  <Lock size={18} />
                                  Buy Now
                                </>
                              )}
                            </>
                          )}
                        </button>
                      </div>

                      {/* Payment Info for Paid Courses */}
                      {!isFree && (
                        <p className="mt-3 text-xs text-center text-orange-600 font-medium">
                          💳 Payment required • Proceed to checkout
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