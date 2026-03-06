import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  PlayCircle, CheckCircle, Clock, BookOpen, FileText, 
  Video, Download, ChevronLeft, ChevronRight, Menu, X,
  Award, BarChart, MessageSquare, Share2, Star, Youtube
} from 'lucide-react';
import api from '../../services/api';

// ============================================================
// BANKING FOUNDATION — 4 YouTube Videos Playlist
// Video 1: https://youtu.be/y3HKCaLPqtU
// Video 2: https://youtu.be/cPHKvABl9s4
// Video 3: https://youtu.be/BM9ShEKAgVY
// Video 4: https://youtu.be/Ap7Gk2Nj52c
// ============================================================

// Helper: convert youtu.be short URL → YouTube embed URL
function toEmbedUrl(youtubeId, autoplay = false) {
  return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
}

// ============================================================
// COURSE CONTENT — Banking Foundation (4 Sub-Courses / Videos)
// Replace IDs below if your DB uses different course IDs
// ============================================================
const BANKING_FOUNDATION_CONTENT = {
  courseName: 'Banking Foundation',
  isFree: true,
  modules: [
    {
      title: 'Module 1: Banking Foundations',
      duration: '~60 min',
      lessons: [
        {
          title: 'Banking Foundation – Part 1',
          duration: '~60 min',
          type: 'youtube',
          youtubeId: 'y3HKCaLPqtU',           // https://youtu.be/y3HKCaLPqtU
          videoUrl: toEmbedUrl('y3HKCaLPqtU'),
          description: 'Introduction to banking fundamentals, financial markets overview and the role of banks in the global economy.'
        }
      ]
    },
    {
      title: 'Module 2: Banking Products & Services',
      duration: '~60 min',
      lessons: [
        {
          title: 'Banking Foundation – Part 2',
          duration: '~60 min',
          type: 'youtube',
          youtubeId: 'cPHKvABl9s4',           // https://youtu.be/cPHKvABl9s4
          videoUrl: toEmbedUrl('cPHKvABl9s4'),
          description: 'Deep dive into retail banking, corporate banking, investment banking and Islamic banking products.'
        }
      ]
    },
    {
      title: 'Module 3: Lending & Payments',
      duration: '~60 min',
      lessons: [
        {
          title: 'Banking Foundation – Part 3',
          duration: '~60 min',
          type: 'youtube',
          youtubeId: 'BM9ShEKAgVY',           // https://youtu.be/BM9ShEKAgVY
          videoUrl: toEmbedUrl('BM9ShEKAgVY'),
          description: 'Lending products, retail lending process, payment systems and the cards ecosystem explained.'
        }
      ]
    },
    {
      title: 'Module 4: Compliance & Risk',
      duration: '~60 min',
      lessons: [
        {
          title: 'Banking Foundation – Part 4',
          duration: '~60 min',
          type: 'youtube',
          youtubeId: 'Ap7Gk2Nj52c',           // https://youtu.be/Ap7Gk2Nj52c
          videoUrl: toEmbedUrl('Ap7Gk2Nj52c'),
          description: 'Regulatory compliance, KYC/AML, risk management and banking regulations in the modern era.'
        }
      ]
    }
  ]
};

// Map course IDs from your DB to the Banking Foundation content
// Add all sub-course IDs that belong to Banking Foundation here
// PAYMENTS & CARDS — 3 YouTube Videos
const PAYMENTS_CARDS_CONTENT = {
  title: 'Payments & Cards',
  modules: [
    {
      id: 1,
      title: 'Module 1: Payment Systems',
      lessons: [
        {
          id: 1,
          title: 'Payment Systems - Full Video',
          type: 'youtube',
          youtubeId: 'cG1kVkzS2pE',
          duration: '~60 min',
        }
      ]
    },
    {
      id: 2,
      title: 'Module 2: Digital Payments',
      lessons: [
        {
          id: 2,
          title: 'Digital Payments - Full Video',
          type: 'youtube',
          youtubeId: 'hwwYU0R9gb8',
          duration: '~60 min',
        }
      ]
    },
    {
      id: 3,
      title: 'Module 3: Card Products',
      lessons: [
        {
          id: 3,
          title: 'Card Products - Full Video',
          type: 'youtube',
          youtubeId: 'ixl5eY5Y4PA',
          duration: '~60 min',
        }
      ]
    },
  ]
};

const COURSE_CONTENT_MAP = {
  // Banking Foundation — DB id 37
  37: BANKING_FOUNDATION_CONTENT,
  // Old local IDs (fallback)
  10: BANKING_FOUNDATION_CONTENT,
  11: { ...BANKING_FOUNDATION_CONTENT, modules: [BANKING_FOUNDATION_CONTENT.modules[0]] },
  12: { ...BANKING_FOUNDATION_CONTENT, modules: [BANKING_FOUNDATION_CONTENT.modules[1]] },
  13: { ...BANKING_FOUNDATION_CONTENT, modules: [BANKING_FOUNDATION_CONTENT.modules[2]] },
  14: { ...BANKING_FOUNDATION_CONTENT, modules: [BANKING_FOUNDATION_CONTENT.modules[3]] },
  // Payments & Cards — DB id 42
  42: PAYMENTS_CARDS_CONTENT,
};

// ============================================================
// YOUTUBE PLAYER COMPONENT
// Replaces the old <video> tag — renders an iframe for YouTube
// ============================================================
function YouTubePlayer({ videoUrl, title }) {
  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' /* 16:9 */ }}>
      <iframe
        className="absolute inset-0 w-full h-full rounded-t-xl"
        src={videoUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

// ============================================================
// MAIN COURSE PLAYER
// ============================================================
export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse]           = useState(null);
  const [enrollment, setEnrollment]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  // Pick content based on courseId — fallback to full Banking Foundation
  const courseContent =
    COURSE_CONTENT_MAP[parseInt(courseId)] || BANKING_FOUNDATION_CONTENT;

  const currentLessonData =
    courseContent.modules[currentModule]?.lessons[currentLesson];

  // ── Fetch course + enrollment from API ──────────────────
  useEffect(() => { fetchCourseData(); }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, enrollRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get('/enrollments/my-enrollments')
      ]);

      if (courseRes.data.success) setCourse(courseRes.data.course);

      if (enrollRes.data.success) {
        const found = enrollRes.data.enrollments.find(
          e => (e.Course?.id || e.course?.id) === parseInt(courseId)
        );
        setEnrollment(found);

        // ── Restore completed lessons from saved progress_percentage ──
        if (found?.progress_percentage > 0) {
          const content = COURSE_CONTENT_MAP[parseInt(courseId)] || BANKING_FOUNDATION_CONTENT;
          const total = content.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
          const completedCount = Math.round((found.progress_percentage / 100) * total);
          const restored = new Set();
          let count = 0;
          outer: for (let m = 0; m < content.modules.length; m++) {
            for (let l = 0; l < content.modules[m].lessons.length; l++) {
              if (count >= completedCount) break outer;
              restored.add(`${m}-${l}`);
              count++;
            }
          }
          setCompletedLessons(restored);
          // Resume on first incomplete lesson
          let resumed = false;
          for (let m = 0; m < content.modules.length; m++) {
            for (let l = 0; l < content.modules[m].lessons.length; l++) {
              if (!restored.has(`${m}-${l}`)) {
                setCurrentModule(m);
                setCurrentLesson(l);
                resumed = true;
                break;
              }
            }
            if (resumed) break;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Progress helpers ─────────────────────────────────────
  const isLessonCompleted = (modIdx, lesIdx) =>
    completedLessons.has(`${modIdx}-${lesIdx}`);

  const calculateProgress = () => {
    const total = courseContent.modules.reduce(
      (acc, mod) => acc + mod.lessons.length, 0
    );
    return total ? Math.round((completedLessons.size / total) * 100) : 0;
  };

  // ── Save progress to DB ─────────────────────────────────
  const saveProgressToDb = async (updatedSet) => {
    if (!enrollment?.id) return;
    try {
      const total = courseContent.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
      await api.patch(`/enrollments/${enrollment.id}/progress`, {
        completed_lessons: updatedSet.size,
        total_lessons: total,
      });
    } catch (err) {
      console.error('Progress update error:', err);
    }
  };

  const handleLessonComplete = async () => {
    const key = `${currentModule}-${currentLesson}`;
    const updated = new Set([...completedLessons, key]);
    setCompletedLessons(updated);
    await saveProgressToDb(updated);
    handleNextLesson();
  };

  const handleNextLesson = async () => {
    // Auto-mark current lesson as complete when clicking Next
    const key = `${currentModule}-${currentLesson}`;
    let updated = completedLessons;
    if (!completedLessons.has(key)) {
      updated = new Set([...completedLessons, key]);
      setCompletedLessons(updated);
      await saveProgressToDb(updated);
    }
    const modLessons = courseContent.modules[currentModule].lessons;
    if (currentLesson < modLessons.length - 1) {
      setCurrentLesson(l => l + 1);
    } else if (currentModule < courseContent.modules.length - 1) {
      setCurrentModule(m => m + 1);
      setCurrentLesson(0);
    }
  };

  const handleSelectLesson = async (modIdx, lesIdx) => {
    // Auto-mark current lesson complete when jumping to another lesson
    const key = `${currentModule}-${currentLesson}`;
    if (!completedLessons.has(key)) {
      const updated = new Set([...completedLessons, key]);
      setCompletedLessons(updated);
      await saveProgressToDb(updated);
    }
    setCurrentModule(modIdx);
    setCurrentLesson(lesIdx);
  };

  const handlePreviousLesson = () => {
    if (currentLesson > 0) {
      setCurrentLesson(l => l - 1);
    } else if (currentModule > 0) {
      setCurrentModule(m => m - 1);
      setCurrentLesson(courseContent.modules[currentModule - 1].lessons.length - 1);
    }
  };

  const isLastLesson =
    currentModule === courseContent.modules.length - 1 &&
    currentLesson === courseContent.modules[currentModule].lessons.length - 1;

  const isFirstLesson = currentModule === 0 && currentLesson === 0;

  // ── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  // ── Not enrolled ─────────────────────────────────────────
  if (!course && !enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">You may not be enrolled in this course</p>
          <Link to="/student/courses"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30
        w-80 bg-white border-r border-gray-200 overflow-y-auto
        transition-transform duration-300 ease-in-out flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#1e5a8e] to-[#164266]">
          <div className="flex items-center gap-2 mb-1">
            <Youtube size={18} className="text-red-400" />
            <span className="text-xs font-bold text-red-300 uppercase tracking-widest">YouTube Playlist</span>
          </div>
          <h2 className="font-bold text-white text-base leading-tight">
            {courseContent.courseName}
          </h2>
          {courseContent.isFree && (
            <span className="inline-block mt-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
              FREE COURSE
            </span>
          )}

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-blue-200 mb-1">
              <span>Your Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-blue-900 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <div className="p-4 flex-1">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            {courseContent.modules.length} Modules · {courseContent.modules.reduce((a, m) => a + m.lessons.length, 0)} Videos
          </h3>

          {courseContent.modules.map((module, modIdx) => (
            <div key={modIdx} className="mb-4">
              {/* Module Title */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                <h4 className="font-semibold text-sm text-gray-900">{module.title}</h4>

                <p className="text-xs text-gray-500 mt-0.5">{module.duration}</p>
              </div>

              {/* Lessons */}
              <div className="space-y-1 ml-2">
                {module.lessons.map((lesson, lesIdx) => {
                  const isActive    = modIdx === currentModule && lesIdx === currentLesson;
                  const isCompleted = isLessonCompleted(modIdx, lesIdx);

                  return (
                    <button
                      key={lesIdx}
                      onClick={() => handleSelectLesson(modIdx, lesIdx)}
                      className={`
                        w-full text-left p-3 rounded-lg transition flex items-start gap-3
                        ${isActive
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'hover:bg-gray-50 border-2 border-transparent'}
                      `}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {isCompleted
                          ? <CheckCircle size={20} className="text-green-500" />
                          : <Youtube size={20} className={isActive ? 'text-red-500' : 'text-gray-400'} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{lesson.duration}</p>
                      </div>
                      {isActive && (
                        <span className="flex-shrink-0 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">
                          NOW
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm transition"
          >
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {courseContent.courseName}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Youtube size={14} className="text-red-500" />
            <span>YouTube</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto p-4 md:p-6">

          {/* ── YOUTUBE VIDEO PLAYER ── */}
          <div className="bg-black rounded-xl overflow-hidden mb-6 shadow-2xl">
            {currentLessonData?.type === 'youtube' ? (
              <YouTubePlayer
                videoUrl={currentLessonData.videoUrl}
                title={currentLessonData.title}
              />
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center bg-gray-900 text-white">
                <Video size={64} className="text-gray-600 mb-4" />
                <p className="text-lg font-semibold">Video Not Available</p>
              </div>
            )}
          </div>

          {/* ── LESSON INFO ── */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                {/* Module badge */}
                <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full mb-2">
                  {courseContent.modules[currentModule]?.title}
                </span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentLessonData?.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock size={16} /> {currentLessonData?.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={16} />
                    Video {currentLesson + 1} of {courseContent.modules[currentModule]?.lessons.length}
                  </span>
                  <span className="flex items-center gap-1 text-red-500">
                    <Youtube size={16} /> YouTube
                  </span>
                </div>
              </div>

              {/* Mark Complete Button */}
              {!isLessonCompleted(currentModule, currentLesson) ? (
                <button
                  onClick={handleLessonComplete}
                  className="flex-shrink-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 shadow"
                >
                  <CheckCircle size={20} /> Mark Complete
                </button>
              ) : (
                <div className="flex-shrink-0 flex items-center gap-2 text-green-600 font-semibold text-sm bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <CheckCircle size={20} /> Completed!
                </div>
              )}
            </div>

            {/* Description */}
            {currentLessonData?.description && (
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">About this lesson</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentLessonData.description}
                </p>
              </div>
            )}

            {/* YouTube Watch Link */}
            {currentLessonData?.youtubeId && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                <Youtube size={18} className="text-red-500 flex-shrink-0" />
                <a
                  href={`https://youtu.be/${currentLessonData.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Watch on YouTube ↗
                </a>
                <span className="text-xs text-gray-400">(opens in new tab)</span>
              </div>
            )}
          </div>

          {/* ── NAVIGATION BUTTONS ── */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handlePreviousLesson}
              disabled={isFirstLesson}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ChevronLeft size={20} /> Previous
            </button>
            <button
              onClick={handleNextLesson}
              disabled={isLastLesson}
              className="flex-1 bg-[#1e5a8e] hover:bg-[#164266] text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Next Video <ChevronRight size={20} />
            </button>
          </div>

          {/* ── PLAYLIST OVERVIEW ── */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Youtube size={20} className="text-red-500" />
              <h3 className="text-lg font-bold">Banking Foundation Playlist</h3>
              <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full ml-auto">
                FREE
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courseContent.modules.map((mod, modIdx) =>
                mod.lessons.map((lesson, lesIdx) => {
                  const isActive    = modIdx === currentModule && lesIdx === currentLesson;
                  const isCompleted = isLessonCompleted(modIdx, lesIdx);
                  return (
                    <button
                      key={`${modIdx}-${lesIdx}`}
                      onClick={() => handleSelectLesson(modIdx, lesIdx)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition
                        ${isActive    ? 'border-blue-500 bg-blue-50'   :
                          isCompleted ? 'border-green-300 bg-green-50' :
                                        'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden bg-gray-200 relative">
                        <img
                          src={`https://img.youtube.com/vi/${lesson.youtubeId}/mqdefault.jpg`}
                          alt={lesson.title}
                          className="w-full h-full object-cover"
                        />
                        {isActive && (
                          <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                            <PlayCircle size={20} className="text-white" />
                          </div>
                        )}
                        {isCompleted && !isActive && (
                          <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                            <CheckCircle size={18} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                          Part {modIdx + 1}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{mod.title}</p>
                        <p className="text-xs text-gray-400">{lesson.duration}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
