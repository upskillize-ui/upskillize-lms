import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  PlayCircle, CheckCircle, Clock, BookOpen, FileText, 
  Video, Download, ChevronLeft, ChevronRight, Menu, X,
  Award, BarChart, MessageSquare, Share2, Star
} from 'lucide-react';
import api from '../../services/api';

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const courseResponse = await api.get(`/courses/${courseId}`);
      const enrollmentResponse = await api.get(`/enrollments/my-enrollments`);
      
      if (courseResponse.data.success) {
        setCourse(courseResponse.data.course);
      }

      if (enrollmentResponse.data.success) {
        const userEnrollment = enrollmentResponse.data.enrollments.find(
          e => (e.Course?.id || e.course?.id) === parseInt(courseId)
        );
        setEnrollment(userEnrollment);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  // BFSI Course Content Structure
  const courseContent = {
    modules: [
      {
        title: 'Day 1: Banking Foundations',
        duration: '8 hours',
        lessons: [
          { title: 'Module 1: Overview of Financial Markets', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 2: Introduction to Banking', duration: '3h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 3: Types of Banks - Global Scenario', duration: '3h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' }
        ]
      },
      {
        title: 'Day 2: Banking Products & Services',
        duration: '8 hours',
        lessons: [
          { title: 'Module 4: Retail Banking', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 5: Corporate Banking', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 6: Investment Banking', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 7: Islamic Banking', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' }
        ]
      },
      {
        title: 'Day 3: Lending & Payments',
        duration: '8 hours',
        lessons: [
          { title: 'Module 8: Lending Products', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 9: Retail Lending Process', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 10: Payment Systems', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 11: Cards Ecosystem', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' }
        ]
      },
      {
        title: 'Day 4: Risk & Compliance',
        duration: '8 hours',
        lessons: [
          { title: 'Module 12: Customer Personas', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 13: Crime and Compliance', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 14: Risk Management', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 15: Banking Regulation', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' }
        ]
      },
      {
        title: 'Day 5: Future Banking & AI',
        duration: '8 hours',
        lessons: [
          { title: 'Module 16: Banking Software', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 17: GenAI & Agentic AI in Finance', duration: '3h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 18: New Age Banking & Fintech', duration: '2h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' },
          { title: 'Module 19: Insurance Domain', duration: '1h', type: 'video', videoUrl: '/videos/bfsi-promo.mp4' }
        ]
      }
    ]
  };

  const currentLessonData = courseContent.modules[currentModule]?.lessons[currentLesson];

  const handleLessonComplete = async () => {
    const lessonKey = `${currentModule}-${currentLesson}`;
    setCompletedLessons(prev => new Set([...prev, lessonKey]));

    // Update progress in backend
    try {
      const totalLessons = courseContent.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
      const completedCount = completedLessons.size + 1;
      const progressPercentage = Math.round((completedCount / totalLessons) * 100);

      await api.put(`/enrollments/${enrollment?.id}/progress`, {
        progress_percentage: progressPercentage
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    // Move to next lesson
    handleNextLesson();
  };

  const handleNextLesson = () => {
    const currentModuleLessons = courseContent.modules[currentModule].lessons;
    
    if (currentLesson < currentModuleLessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else if (currentModule < courseContent.modules.length - 1) {
      setCurrentModule(currentModule + 1);
      setCurrentLesson(0);
    }
  };

  const handlePreviousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(currentLesson - 1);
    } else if (currentModule > 0) {
      setCurrentModule(currentModule - 1);
      setCurrentLesson(courseContent.modules[currentModule - 1].lessons.length - 1);
    }
  };

  const isLessonCompleted = (moduleIdx, lessonIdx) => {
    return completedLessons.has(`${moduleIdx}-${lessonIdx}`);
  };

  const calculateProgress = () => {
    const totalLessons = courseContent.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
    return Math.round((completedLessons.size / totalLessons) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course && !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">You may not be enrolled in this course</p>
          <Link
            to="/student/courses"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition"
          >
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link
              to="/student/courses"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">Back to Courses</span>
            </Link>
          </div>

          <div className="flex-1 mx-4 max-w-2xl">
            <h1 className="font-bold text-gray-900 truncate">
              {course?.course_name || course?.name || 'BFSI Excellence Program'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center gap-1">
                <BarChart size={16} />
                {calculateProgress()}% Complete
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {currentLessonData?.duration || '2h'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div 
            className="h-full bg-blue-500 transition-all duration-500"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Course Content */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30
          w-80 bg-white border-r border-gray-200 overflow-y-auto
          transition-transform duration-300 ease-in-out
        `}>
          <div className="p-4">
            <h2 className="font-bold text-lg mb-4">Course Content</h2>
            
            {courseContent.modules.map((module, moduleIdx) => (
              <div key={moduleIdx} className="mb-4">
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <h3 className="font-semibold text-sm text-gray-900">{module.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{module.duration}</p>
                </div>
                
                <div className="space-y-1 ml-2">
                  {module.lessons.map((lesson, lessonIdx) => {
                    const isActive = moduleIdx === currentModule && lessonIdx === currentLesson;
                    const isCompleted = isLessonCompleted(moduleIdx, lessonIdx);
                    
                    return (
                      <button
                        key={lessonIdx}
                        onClick={() => {
                          setCurrentModule(moduleIdx);
                          setCurrentLesson(lessonIdx);
                        }}
                        className={`
                          w-full text-left p-3 rounded-lg transition flex items-start gap-3
                          ${isActive ? 'bg-blue-50 border-2 border-blue-500' : 'hover:bg-gray-50 border-2 border-transparent'}
                        `}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle size={20} className="text-green-500" />
                          ) : lesson.type === 'video' ? (
                            <PlayCircle size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                          ) : (
                            <FileText size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-6">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden mb-6 shadow-2xl">
              {!videoError ? (
                <video
                  ref={videoRef}
                  className="w-full aspect-video"
                  src={currentLessonData?.videoUrl}
                  controls
                  autoPlay
                  onError={() => setVideoError(true)}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center bg-gray-900 text-white">
                  <Video size={64} className="text-gray-600 mb-4" />
                  <p className="text-lg font-semibold mb-2">Video Not Available</p>
                  <p className="text-sm text-gray-400">This lesson video is being prepared</p>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentLessonData?.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {currentLessonData?.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={16} />
                      Lesson {currentLesson + 1} of {courseContent.modules[currentModule].lessons.length}
                    </span>
                  </div>
                </div>
                
                {!isLessonCompleted(currentModule, currentLesson) && (
                  <button
                    onClick={handleLessonComplete}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Mark Complete
                  </button>
                )}
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-3">About this lesson</h3>
                <p className="text-gray-600">
                  This comprehensive module covers essential concepts in banking and financial services. 
                  You'll learn practical skills and industry best practices that are immediately applicable 
                  in real-world scenarios.
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePreviousLesson}
                disabled={currentModule === 0 && currentLesson === 0}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} />
                Previous Lesson
              </button>
              <button
                onClick={handleNextLesson}
                disabled={
                  currentModule === courseContent.modules.length - 1 && 
                  currentLesson === courseContent.modules[currentModule].lessons.length - 1
                }
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Next Lesson
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Additional Resources */}
            <div className="mt-6 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4">Resources & Downloads</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
                  <Download size={20} className="text-blue-600" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Lesson Slides (PDF)</p>
                    <p className="text-xs text-gray-500">2.5 MB</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
                  <FileText size={20} className="text-blue-600" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">Practice Exercise</p>
                    <p className="text-xs text-gray-500">Coming Soon</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}