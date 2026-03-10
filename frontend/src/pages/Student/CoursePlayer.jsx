import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  PlayCircle, CheckCircle, Clock, BookOpen, FileText,
  Video, Download, ChevronLeft, ChevronRight, Menu, X,
  Award, BarChart, MessageSquare, Share2, Star, Youtube,
  FilePlus, Archive, HardDrive, User, List
} from 'lucide-react';
import api from '../../services/api';

// ============================================================
// HELPERS
// ============================================================

function toEmbedUrl(youtubeId, autoplay = false) {
  return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
}

function resolveFileUrl(filePath) {
  if (!filePath) return null;
  if (filePath.startsWith('http')) return filePath;
  const base = (
    (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL)
      ? import.meta.env.VITE_API_URL
      : 'https://upskillize-lms-backend.onrender.com/api'
  ).replace(/\/api$/, '');
  return base + filePath;
}

// ============================================================
// HARDCODED YOUTUBE COURSE CONTENT
// ============================================================

const BANKING_FOUNDATION_CONTENT = {
  courseName: 'Banking Foundation',
  isFree: true,
  modules: [
    {
      title: 'Module 1: Banking Foundations',
      duration: '~60 min',
      lessons: [{
        title: 'Banking Foundation – Part 1',
        duration: '~60 min',
        type: 'youtube',
        youtubeId: 'y3HKCaLPqtU',
        videoUrl: toEmbedUrl('y3HKCaLPqtU'),
        description: 'Introduction to banking fundamentals, financial markets overview and the role of banks in the global economy.'
      }]
    },
    {
      title: 'Module 2: Banking Products & Services',
      duration: '~60 min',
      lessons: [{
        title: 'Banking Foundation – Part 2',
        duration: '~60 min',
        type: 'youtube',
        youtubeId: 'cPHKvABl9s4',
        videoUrl: toEmbedUrl('cPHKvABl9s4'),
        description: 'Deep dive into retail banking, corporate banking, investment banking and Islamic banking products.'
      }]
    },
    {
      title: 'Module 3: Lending & Payments',
      duration: '~60 min',
      lessons: [{
        title: 'Banking Foundation – Part 3',
        duration: '~60 min',
        type: 'youtube',
        youtubeId: 'BM9ShEKAgVY',
        videoUrl: toEmbedUrl('BM9ShEKAgVY'),
        description: 'Lending products, retail lending process, payment systems and the cards ecosystem explained.'
      }]
    },
    {
      title: 'Module 4: Compliance & Risk',
      duration: '~60 min',
      lessons: [{
        title: 'Banking Foundation – Part 4',
        duration: '~60 min',
        type: 'youtube',
        youtubeId: 'Ap7Gk2Nj52c',
        videoUrl: toEmbedUrl('Ap7Gk2Nj52c'),
        description: 'Regulatory compliance, KYC/AML, risk management and banking regulations in the modern era.'
      }]
    }
  ]
};

const PAYMENTS_CARDS_CONTENT = {
  courseName: 'Payments & Cards',
  isFree: true,
  modules: [
    {
      title: 'Module 1: Payment Systems',
      duration: '~60 min',
      lessons: [{
        title: 'Payment Systems - Full Video',
        type: 'youtube',
        youtubeId: 'cG1kVkzS2pE',
        videoUrl: toEmbedUrl('cG1kVkzS2pE'),
        duration: '~60 min',
        description: 'Overview of payment systems, infrastructure and how money moves globally.'
      }]
    },
    {
      title: 'Module 2: Digital Payments',
      duration: '~60 min',
      lessons: [{
        title: 'Digital Payments - Full Video',
        type: 'youtube',
        youtubeId: 'hwwYU0R9gb8',
        videoUrl: toEmbedUrl('hwwYU0R9gb8'),
        duration: '~60 min',
        description: 'Digital payment methods, mobile wallets, UPI and the future of cashless transactions.'
      }]
    },
    {
      title: 'Module 3: Card Products',
      duration: '~60 min',
      lessons: [{
        title: 'Card Products - Full Video',
        type: 'youtube',
        youtubeId: 'ixl5eY5Y4PA',
        videoUrl: toEmbedUrl('ixl5eY5Y4PA'),
        duration: '~60 min',
        description: 'Credit cards, debit cards, prepaid cards and the card payment ecosystem explained.'
      }]
    }
  ]
};

const COURSE_CONTENT_MAP = {
  37: BANKING_FOUNDATION_CONTENT,
  10: BANKING_FOUNDATION_CONTENT,
  11: { ...BANKING_FOUNDATION_CONTENT, modules: [BANKING_FOUNDATION_CONTENT.modules[0]] },
  12: { ...BANKING_FOUNDATION_CONTENT, modules: [BANKING_FOUNDATION_CONTENT.modules[1]] },
  13: { ...BANKING_FOUNDATION_CONTENT, modules: [BANKING_FOUNDATION_CONTENT.modules[2]] },
  14: { ...BANKING_FOUNDATION_CONTENT, modules: [BANKING_FOUNDATION_CONTENT.modules[3]] },
  42: PAYMENTS_CARDS_CONTENT,
   6: PAYMENTS_CARDS_CONTENT,
};

// ============================================================
// UPLOADED CONTENT — type config
// ============================================================

const UPLOAD_TYPE_CONFIG = {
  video: {
    icon: Video,
    color: 'from-red-500 to-rose-600',
    badge: 'bg-red-100 text-red-700',
    label: 'Video'
  },
  pdf: {
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    label: 'PDF'
  },
  ppt: {
    icon: FilePlus,
    color: 'from-orange-500 to-amber-500',
    badge: 'bg-orange-100 text-orange-700',
    label: 'Slides'
  },
  scorm: {
    icon: Archive,
    color: 'from-green-500 to-emerald-600',
    badge: 'bg-green-100 text-green-700',
    label: 'SCORM'
  },
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

function YouTubePlayer({ videoUrl, title }) {
  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
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

function UploadedVideoPlayer({ url, onComplete }) {
  const videoRef = useRef(null);
  const [marked, setMarked] = useState(false);

  const handleTimeUpdate = () => {
    if (!marked && videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      if (duration > 0 && currentTime / duration > 0.8) {
        setMarked(true);
        onComplete && onComplete();
      }
    }
  };

  return (
    <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
      <video
        ref={videoRef}
        src={url}
        controls
        className="absolute inset-0 w-full h-full"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setMarked(true); onComplete && onComplete(); }}
      >
        Your browser does not support video playback.
      </video>
    </div>
  );
}

function UploadedContentViewer({ item, onComplete }) {
  const fileUrl = resolveFileUrl(item.file_path);
  const cfg = UPLOAD_TYPE_CONFIG[item.type] || UPLOAD_TYPE_CONFIG.pdf;
  const Icon = cfg.icon;

  if (item.type === 'video' && fileUrl) {
    return <UploadedVideoPlayer url={fileUrl} onComplete={onComplete} />;
  }

  if (item.type === 'pdf' && fileUrl) {
    return (
      <div className="relative w-full bg-white" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={fileUrl}
          className="absolute inset-0 w-full h-full border-0"
          title={item.title}
        />
      </div>
    );
  }

  if (item.type === 'ppt' && fileUrl) {
    return (
      <div className="relative w-full bg-white" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
          className="absolute inset-0 w-full h-full border-0"
          title={item.title}
        />
      </div>
    );
  }

  // SCORM / no-preview fallback
  return (
    <div className="relative w-full bg-gray-900" style={{ paddingTop: '56.25%' }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center mb-4 shadow-xl`}>
          <Icon size={36} className="text-white" />
        </div>
        <h3 className="text-white text-xl font-bold mb-2">{item.title}</h3>
        {fileUrl ? (
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={onComplete}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${cfg.color} text-white font-bold shadow-lg hover:opacity-90 transition mt-2`}
          >
            <Download size={18} /> Download &amp; View
          </a>
        ) : (
          <p className="text-gray-400 text-sm">No file attached.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COURSE PLAYER
// ============================================================

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // ── Core state ───────────────────────────────────────────
  const [course, setCourse]         = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── YouTube tab state ────────────────────────────────────
  const [currentModule, setCurrentModule] = useState(0);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  // ── Uploaded content tab state ───────────────────────────
  const [uploadedContent, setUploadedContent]     = useState([]);
  const [activeUploaded, setActiveUploaded]       = useState(null);
  const [completedUploaded, setCompletedUploaded] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`cu_${courseId}`) || '[]'); }
    catch { return []; }
  });

  // ── Active tab: 'youtube' | 'uploaded' ──────────────────
  const [activeTab, setActiveTab] = useState('youtube');

  // ── Derived ──────────────────────────────────────────────
  const courseContent   = COURSE_CONTENT_MAP[parseInt(courseId)] || null;
  const currentLessonData = courseContent?.modules[currentModule]?.lessons[currentLesson];
  const hasYouTube      = !!courseContent;
  const hasUploaded     = uploadedContent.length > 0;

  // ── On mount ─────────────────────────────────────────────
  useEffect(() => {
    fetchCourseData();
    fetchUploadedContent();
  }, [courseId]);

  // Switch to uploaded tab automatically when no YouTube content
  useEffect(() => {
    if (!hasYouTube && hasUploaded) setActiveTab('uploaded');
  }, [hasYouTube, hasUploaded]);

  // ── API calls ────────────────────────────────────────────
  const fetchCourseData = async () => {
    try {
      const [courseRes, enrollRes] = await Promise.allSettled([
        api.get(`/courses/${courseId}`),
        api.get('/enrollments/my-enrollments')
      ]);

      if (courseRes.status === 'fulfilled' && courseRes.value.data?.success) {
        setCourse(courseRes.value.data.course);
      }

      if (enrollRes.status === 'fulfilled' && enrollRes.value.data?.success) {
        const found = enrollRes.value.data.enrollments.find(
          e => (e.Course?.id || e.course?.id) === parseInt(courseId)
        );
        setEnrollment(found);

        // Restore progress
        if (found?.progress_percentage > 0 && courseContent) {
          const total = courseContent.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
          const completedCount = Math.round((found.progress_percentage / 100) * total);
          const restored = new Set();
          let count = 0;
          outer: for (let m = 0; m < courseContent.modules.length; m++) {
            for (let l = 0; l < courseContent.modules[m].lessons.length; l++) {
              if (count >= completedCount) break outer;
              restored.add(`${m}-${l}`);
              count++;
            }
          }
          setCompletedLessons(restored);

          // Resume on first incomplete lesson
          let resumed = false;
          for (let m = 0; m < courseContent.modules.length; m++) {
            for (let l = 0; l < courseContent.modules[m].lessons.length; l++) {
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

  const fetchUploadedContent = async () => {
    try {
      const res = await api.get(`/faculty/course-content/${courseId}`);
      if (res.data.success) {
        const items = res.data.content || [];
        setUploadedContent(items);
        if (items.length > 0) setActiveUploaded(items[0]);
      }
    } catch (e) {
      console.error('Error fetching uploaded content:', e);
    }
  };

  // ── YouTube progress helpers ──────────────────────────────
  const isLessonCompleted = (modIdx, lesIdx) =>
    completedLessons.has(`${modIdx}-${lesIdx}`);

  const calculateYTProgress = () => {
    if (!courseContent) return 0;
    const total = courseContent.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
    return total ? Math.round((completedLessons.size / total) * 100) : 0;
  };

  const saveProgressToDb = async (updatedSet) => {
    if (!enrollment?.id || !courseContent) return;
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
    handleNextLesson(updated);
  };

  const handleNextLesson = async (alreadyUpdated) => {
    const key = `${currentModule}-${currentLesson}`;
    let updated = alreadyUpdated || completedLessons;
    if (!updated.has(key)) {
      updated = new Set([...updated, key]);
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

  // ── Uploaded content helpers ──────────────────────────────
  const markUploadedComplete = (itemId) => {
    if (completedUploaded.includes(itemId)) return;
    const updated = [...completedUploaded, itemId];
    setCompletedUploaded(updated);
    try { localStorage.setItem(`cu_${courseId}`, JSON.stringify(updated)); } catch {}
  };

  const uploadedProgress = uploadedContent.length > 0
    ? Math.round((completedUploaded.length / uploadedContent.length) * 100)
    : 0;

  const isLastLesson = courseContent &&
    currentModule === courseContent.modules.length - 1 &&
    currentLesson === courseContent.modules[currentModule].lessons.length - 1;

  const isFirstLesson = currentModule === 0 && currentLesson === 0;

  const ytProgress = calculateYTProgress();

  // ── Loading ───────────────────────────────────────────────
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

  // ── Not enrolled / not found ──────────────────────────────
  if (!course && !enrollment && !hasYouTube && !hasUploaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">You may not be enrolled in this course</p>
          <Link to="/student/courses"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition">
            Back to My Courses
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* ══════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════ */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30
        w-80 bg-white border-r border-gray-200
        transition-transform duration-300 ease-in-out flex flex-col
        overflow-hidden
      `}>

        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#1e5a8e] to-[#164266] flex-shrink-0">
          <button onClick={() => navigate('/student/courses')}
            className="flex items-center gap-1 text-blue-200 hover:text-white text-xs mb-3 transition">
            <ChevronLeft size={14} /> Back to My Courses
          </button>
          {hasYouTube && (
            <div className="flex items-center gap-2 mb-1">
              <Youtube size={16} className="text-red-400" />
              <span className="text-xs font-bold text-red-300 uppercase tracking-widest">YouTube Playlist</span>
            </div>
          )}
          <h2 className="font-bold text-white text-base leading-tight">
            {courseContent?.courseName || course?.course_name || 'Course Content'}
          </h2>
          {courseContent?.isFree && (
            <span className="inline-block mt-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">
              FREE COURSE
            </span>
          )}
        </div>

        {/* Tab switcher — only shown when both types exist */}
        {hasYouTube && hasUploaded && (
          <div className="flex border-b border-gray-200 flex-shrink-0">
            <button onClick={() => setActiveTab('youtube')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1 transition ${
                activeTab === 'youtube'
                  ? 'bg-red-50 text-red-600 border-b-2 border-red-500'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}>
              <Youtube size={13} /> YouTube
            </button>
            <button onClick={() => setActiveTab('uploaded')}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1 transition ${
                activeTab === 'uploaded'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}>
              <HardDrive size={13} /> Materials ({uploadedContent.length})
            </button>
          </div>
        )}

        {/* ── YouTube sidebar list ── */}
        {activeTab === 'youtube' && hasYouTube && (
          <div className="flex-1 overflow-y-auto">
            {/* Progress */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Your Progress</span>
                <span className="font-bold text-blue-600">{ytProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${ytProgress}%` }} />
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                {courseContent.modules.length} Modules · {courseContent.modules.reduce((a, m) => a + m.lessons.length, 0)} Videos
              </h3>

              {courseContent.modules.map((module, modIdx) => (
                <div key={modIdx} className="mb-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                    <h4 className="font-semibold text-sm text-gray-900">{module.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{module.duration}</p>
                  </div>
                  <div className="space-y-1 ml-2">
                    {module.lessons.map((lesson, lesIdx) => {
                      const isActive    = modIdx === currentModule && lesIdx === currentLesson;
                      const isCompleted = isLessonCompleted(modIdx, lesIdx);
                      return (
                        <button key={lesIdx}
                          onClick={() => handleSelectLesson(modIdx, lesIdx)}
                          className={`w-full text-left p-3 rounded-lg transition flex items-start gap-3
                            ${isActive
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'hover:bg-gray-50 border-2 border-transparent'}`}>
                          <div className="flex-shrink-0 mt-0.5">
                            {isCompleted
                              ? <CheckCircle size={20} className="text-green-500" />
                              : <Youtube size={20} className={isActive ? 'text-red-500' : 'text-gray-400'} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{lesson.duration}</p>
                          </div>
                          {isActive && (
                            <span className="flex-shrink-0 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold">NOW</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Uploaded content sidebar list ── */}
        {(activeTab === 'uploaded' || (!hasYouTube && hasUploaded)) && (
          <div className="flex-1 overflow-y-auto">
            {/* Progress */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{completedUploaded.length}/{uploadedContent.length} completed</span>
                <span className="font-bold text-orange-500">{uploadedProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${uploadedProgress}%` }} />
              </div>
            </div>

            <div className="p-3 space-y-1">
              {uploadedContent.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No materials uploaded yet.</p>
                </div>
              ) : uploadedContent.map((item, idx) => {
                const cfg    = UPLOAD_TYPE_CONFIG[item.type] || UPLOAD_TYPE_CONFIG.pdf;
                const Icon   = cfg.icon;
                const isActive = activeUploaded?.id === item.id;
                const isDone   = completedUploaded.includes(item.id);
                return (
                  <button key={item.id}
                    onClick={() => { setActiveUploaded(item); markUploadedComplete(item.id); }}
                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition
                      ${isActive ? 'bg-blue-50 border-2 border-blue-400' : 'hover:bg-gray-50 border-2 border-transparent'}`}>
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {isDone ? <CheckCircle size={14} className="text-white" /> : <Icon size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium line-clamp-2 leading-tight ${isActive ? 'text-blue-900' : 'text-gray-800'}`}>
                        {idx + 1}. {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        {item.duration && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <Clock size={9} /> {item.duration}m
                          </span>
                        )}
                      </div>
                    </div>
                    {isDone && !isActive && <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </aside>

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition lg:hidden">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <button onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-800 flex items-center gap-1 text-sm transition">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {courseContent?.courseName || course?.course_name || 'Course'}
            </p>
          </div>
          {/* Tab toggle in top bar (when both exist) */}
          {hasYouTube && hasUploaded && (
            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
              <button onClick={() => setActiveTab('youtube')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  activeTab === 'youtube' ? 'bg-white shadow text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <Youtube size={13} /> YouTube
              </button>
              <button onClick={() => setActiveTab('uploaded')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                  activeTab === 'uploaded' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                <HardDrive size={13} /> Materials
              </button>
            </div>
          )}
          {/* YouTube badge when no uploaded content */}
          {hasYouTube && !hasUploaded && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Youtube size={14} className="text-red-500" />
              <span>YouTube</span>
            </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto p-4 md:p-6">

          {/* ════════════════════════════════════════════════
              YOUTUBE TAB
          ════════════════════════════════════════════════ */}
          {activeTab === 'youtube' && hasYouTube && (
            <>
              {/* Video player */}
              <div className="bg-black rounded-xl overflow-hidden mb-6 shadow-2xl">
                {currentLessonData?.type === 'youtube' ? (
                  <YouTubePlayer videoUrl={currentLessonData.videoUrl} title={currentLessonData.title} />
                ) : (
                  <div className="aspect-video flex flex-col items-center justify-center bg-gray-900 text-white">
                    <Video size={64} className="text-gray-600 mb-4" />
                    <p className="text-lg font-semibold">Video Not Available</p>
                  </div>
                )}
              </div>

              {/* Lesson info */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full mb-2">
                      {courseContent.modules[currentModule]?.title}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentLessonData?.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      <span className="flex items-center gap-1"><Clock size={16} /> {currentLessonData?.duration}</span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={16} /> Video {currentLesson + 1} of {courseContent.modules[currentModule]?.lessons.length}
                      </span>
                      <span className="flex items-center gap-1 text-red-500"><Youtube size={16} /> YouTube</span>
                    </div>
                  </div>
                  {!isLessonCompleted(currentModule, currentLesson) ? (
                    <button onClick={handleLessonComplete}
                      className="flex-shrink-0 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 shadow">
                      <CheckCircle size={20} /> Mark Complete
                    </button>
                  ) : (
                    <div className="flex-shrink-0 flex items-center gap-2 text-green-600 font-semibold text-sm bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                      <CheckCircle size={20} /> Completed!
                    </div>
                  )}
                </div>

                {currentLessonData?.description && (
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">About this lesson</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{currentLessonData.description}</p>
                  </div>
                )}

                {currentLessonData?.youtubeId && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                    <Youtube size={18} className="text-red-500 flex-shrink-0" />
                    <a href={`https://youtu.be/${currentLessonData.youtubeId}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline font-medium">
                      Watch on YouTube ↗
                    </a>
                    <span className="text-xs text-gray-400">(opens in new tab)</span>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-4 mb-6">
                <button onClick={handlePreviousLesson} disabled={isFirstLesson}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  <ChevronLeft size={20} /> Previous
                </button>
                <button onClick={() => handleNextLesson()} disabled={isLastLesson}
                  className="flex-1 bg-[#1e5a8e] hover:bg-[#164266] text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Next Video <ChevronRight size={20} />
                </button>
              </div>

              {/* Playlist overview grid */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Youtube size={20} className="text-red-500" />
                  <h3 className="text-lg font-bold">{courseContent.courseName} Playlist</h3>
                  {courseContent.isFree && (
                    <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full ml-auto">FREE</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {courseContent.modules.map((mod, modIdx) =>
                    mod.lessons.map((lesson, lesIdx) => {
                      const isActive    = modIdx === currentModule && lesIdx === currentLesson;
                      const isCompleted = isLessonCompleted(modIdx, lesIdx);
                      return (
                        <button key={`${modIdx}-${lesIdx}`}
                          onClick={() => handleSelectLesson(modIdx, lesIdx)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition
                            ${isActive    ? 'border-blue-500 bg-blue-50'   :
                              isCompleted ? 'border-green-300 bg-green-50' :
                                            'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
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
            </>
          )}

          {/* ════════════════════════════════════════════════
              UPLOADED MATERIALS TAB
          ════════════════════════════════════════════════ */}
          {(activeTab === 'uploaded' || !hasYouTube) && (
            <>
              {hasUploaded && activeUploaded ? (
                <>
                  {/* Viewer */}
                  <div className="bg-black rounded-xl overflow-hidden mb-6 shadow-2xl">
                    <UploadedContentViewer
                      item={activeUploaded}
                      onComplete={() => markUploadedComplete(activeUploaded.id)}
                    />
                  </div>

                  {/* Info card */}
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                      <div className="flex-1">
                        {(() => {
                          const cfg = UPLOAD_TYPE_CONFIG[activeUploaded.type] || UPLOAD_TYPE_CONFIG.pdf;
                          return (
                            <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full mb-2 ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                          );
                        })()}
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeUploaded.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          {activeUploaded.duration && (
                            <span className="flex items-center gap-1"><Clock size={16} /> {activeUploaded.duration} min</span>
                          )}
                          {activeUploaded.file_size && (
                            <span className="flex items-center gap-1"><HardDrive size={16} /> {activeUploaded.file_size}</span>
                          )}
                          {activeUploaded.instructor_name && (
                            <span className="flex items-center gap-1"><User size={16} /> {activeUploaded.instructor_name}</span>
                          )}
                        </div>
                        {activeUploaded.description && (
                          <p className="text-gray-600 text-sm mt-3 leading-relaxed">{activeUploaded.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {resolveFileUrl(activeUploaded.file_path) && (
                          <a href={resolveFileUrl(activeUploaded.file_path)} download
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition">
                            <Download size={16} /> Download
                          </a>
                        )}
                        {!completedUploaded.includes(activeUploaded.id) ? (
                          <button onClick={() => markUploadedComplete(activeUploaded.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition">
                            <CheckCircle size={16} /> Mark Complete
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-semibold border border-green-200">
                            <CheckCircle size={16} /> Completed!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Prev / Next for uploaded */}
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={() => {
                        const idx = uploadedContent.findIndex(c => c.id === activeUploaded.id);
                        if (idx > 0) setActiveUploaded(uploadedContent[idx - 1]);
                      }}
                      disabled={uploadedContent.findIndex(c => c.id === activeUploaded.id) === 0}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <ChevronLeft size={20} /> Previous
                    </button>
                    <button
                      onClick={() => {
                        const idx = uploadedContent.findIndex(c => c.id === activeUploaded.id);
                        if (idx < uploadedContent.length - 1) {
                          markUploadedComplete(activeUploaded.id);
                          setActiveUploaded(uploadedContent[idx + 1]);
                        }
                      }}
                      disabled={uploadedContent.findIndex(c => c.id === activeUploaded.id) === uploadedContent.length - 1}
                      className="flex-1 bg-[#1e5a8e] hover:bg-[#164266] text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      Next <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* All materials grid */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <HardDrive size={18} className="text-blue-500" />
                      All Course Materials ({uploadedContent.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {uploadedContent.map((item, idx) => {
                        const cfg    = UPLOAD_TYPE_CONFIG[item.type] || UPLOAD_TYPE_CONFIG.pdf;
                        const Icon   = cfg.icon;
                        const isActive = activeUploaded?.id === item.id;
                        const isDone   = completedUploaded.includes(item.id);
                        return (
                          <button key={item.id}
                            onClick={() => { setActiveUploaded(item); markUploadedComplete(item.id); }}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition
                              ${isActive ? 'border-blue-500 bg-blue-50' :
                                isDone   ? 'border-green-300 bg-green-50' :
                                           'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0`}>
                              {isDone ? <CheckCircle size={20} className="text-white" /> : <Icon size={20} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                                {idx + 1}. {item.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                                  {cfg.label}
                                </span>
                                {item.duration && (
                                  <span className="text-xs text-gray-400">{item.duration} min</span>
                                )}
                              </div>
                            </div>
                            {isActive && (
                              <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold flex-shrink-0">NOW</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                /* No uploaded content */
                <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md">
                  <HardDrive size={48} className="text-gray-200 mb-3" />
                  <p className="text-gray-500 font-semibold text-lg">No materials uploaded yet</p>
                  <p className="text-gray-400 text-sm mt-1">The instructor hasn't uploaded content for this course.</p>
                </div>
              )}
            </>
          )}

          {/* No content at all */}
          {!hasYouTube && !hasUploaded && (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-md">
              <BookOpen size={48} className="text-gray-200 mb-3" />
              <p className="text-gray-500 font-semibold text-lg">No content available</p>
              <p className="text-gray-400 text-sm mt-1">Content will appear here once the instructor uploads it.</p>
            </div>
          )}

        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}