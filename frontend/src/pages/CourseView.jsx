import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, Clock, BookOpen, Users, Star, CheckCircle, 
  PlayCircle, Award, TrendingUp, Lock 
} from 'lucide-react';

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
    if (user && user.role === 'student') {
      checkEnrollment();
    }
  }, [id, user]);

  const fetchCourseDetails = async () => {
    try {
      const response = await api.get(`/courses/${id}`);
      if (response.data.success) {
        setCourse(response.data.course);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await api.get('/enrollments/my-enrollments');
      if (response.data.success) {
        const enrolled = response.data.enrollments.some(
          e => e.course_id === parseInt(id)
        );
        setIsEnrolled(enrolled);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      alert('Only students can enroll in courses');
      return;
    }

    setEnrolling(true);
    try {
      const response = await api.post('/enrollments', { course_id: id });
      
      if (response.data.requiresPayment) {
        // Handle payment flow
        initiatePayment(response.data);
      } else if (response.data.success) {
        alert('Successfully enrolled!');
        setIsEnrolled(true);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error enrolling in course');
    } finally {
      setEnrolling(false);
    }
  };

  const initiatePayment = async (paymentData) => {
    try {
      // Create Razorpay order
      const orderResponse = await api.post('/payments/initiate', {
        course_id: id
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.order.amount,
        currency: 'INR',
        name: 'Upskillize',
        description: course.course_name,
        order_id: orderResponse.data.order.id,
        handler: async (response) => {
          // Verify payment
          try {
            await api.post('/payments/verify', {
              ...response,
              course_id: id
            });
            alert('Payment successful! You are now enrolled.');
            setIsEnrolled(true);
          } catch (error) {
            alert('Payment verification failed');
          }
        },
        prefill: {
          email: user.email,
          name: user.full_name
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error initiating payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h1>
          <Link to="/courses" className="text-accent hover:underline">
            Browse all courses
          </Link>
        </div>
      </div>
    );
  }

  const highlights = course.learning_outcomes ? course.learning_outcomes.split(', ') : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-secondary to-[#3d5278] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1 bg-accent rounded-full text-sm font-semibold">
                  {course.category}
                </span>
                <span className="px-4 py-1 bg-white text-gray-800 rounded-full text-sm font-semibold capitalize">
                  {course.difficulty_level}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {course.course_name}
              </h1>

              <p className="text-xl text-gray-200 mb-6">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center">
                  <Clock size={20} className="mr-2" />
                  <span>{course.duration_hours} hours</span>
                </div>
                <div className="flex items-center">
                  <BookOpen size={20} className="mr-2" />
                  <span>{course.CourseModules?.length || 5} modules</span>
                </div>
                <div className="flex items-center">
                  <Award size={20} className="mr-2" />
                  <span>Certificate</span>
                </div>
              </div>

              {course.Faculty && (
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-3 flex items-center justify-center">
                    <Users size={24} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Instructor</p>
                    <p className="font-semibold">{course.Faculty.User?.full_name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white text-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-accent mb-2">
                  ₹{course.price.toLocaleString()}
                </div>
                <p className="text-gray-600">One-time payment</p>
              </div>

              {isEnrolled ? (
                <Link
                  to={`/student/course/${course.id}`}
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-4 rounded-xl font-semibold transition"
                >
                  <PlayCircle size={20} className="inline mr-2" />
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-gradient-to-r from-accent to-blue-600 hover:from-blue-600 hover:to-accent text-white py-4 rounded-xl font-semibold transition disabled:opacity-50"
                >
                  {enrolling ? 'Processing...' : course.price > 0 ? 'Enroll Now' : 'Enroll Free'}
                </button>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="mr-2 text-green-500" />
                  <span>Full lifetime access</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="mr-2 text-green-500" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle size={16} className="mr-2 text-green-500" />
                  <span>Expert instructor support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                What You'll Learn
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start">
                    <CheckCircle size={20} className="mr-3 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Course Curriculum
              </h2>
              <div className="space-y-3">
                {course.CourseModules?.map((module, idx) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                      <div className="flex items-center">
                        <BookOpen size={20} className="mr-3 text-accent" />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Module {idx + 1}: {module.module_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {module.Lessons?.length || 0} lessons
                          </p>
                        </div>
                      </div>
                      {!isEnrolled && idx > 0 && (
                        <Lock size={18} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites */}
            {course.prerequisites && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Prerequisites
                </h2>
                <p className="text-gray-700">{course.prerequisites}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Features */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-gray-800 mb-4">This course includes:</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-700">
                  <PlayCircle size={18} className="mr-3 text-accent" />
                  <span>{course.duration_hours} hours of video content</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <BookOpen size={18} className="mr-3 text-accent" />
                  <span>Downloadable resources</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Award size={18} className="mr-3 text-accent" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <TrendingUp size={18} className="mr-3 text-accent" />
                  <span>Lifetime access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
