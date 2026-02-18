import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { BookOpen, Users, Award, TrendingUp, ArrowRight, CheckCircle, Star, PlayCircle, Zap, Target, Globe, X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// VIDEO SETUP:
//   Place  Upskillize__Excel_Beyond_Promo.mp4
//   into   /public/videos/excel-beyond-promo.mp4
//   (same public folder as the BFSI video)
// ─────────────────────────────────────────────────────────────

export default function Home() {
  const { user } = useAuth();
  const [showDemo, setShowDemo] = useState(false);
  const videoRef = useRef(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    if (showDemo) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden'; // prevent bg scroll
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [showDemo]);

  const openModal = () => setShowDemo(true);

  const closeModal = () => {
    setShowDemo(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      {/* ══════════════════════════════════════════
          WATCH DEMO MODAL
      ══════════════════════════════════════════ */}
      {showDemo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-black">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition hover:scale-110"
              aria-label="Close video"
            >
              <X size={20} />
            </button>

            {/* Video header label */}
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                🎬 Upskillize — Excel Beyond Your Potential
              </span>
            </div>

            {/* Video player */}
            <video
              ref={videoRef}
              className="w-full block"
              style={{ aspectRatio: '16/9', objectFit: 'cover' }}
              src="/videos/excel-beyond-promo.mp4"
              controls
              autoPlay
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />

            {/* Fallback if video file not placed yet */}
            <div
              className="w-full items-center justify-center flex-col gap-3 bg-gray-900 text-white py-20 px-6 text-center"
              style={{ display: 'none', aspectRatio: '16/9' }}
            >
              <div className="text-5xl mb-2">🎬</div>
              <p className="font-bold text-lg">Demo Video</p>
              <p className="text-gray-400 text-sm max-w-sm">
                Place{' '}
                <code className="bg-gray-800 px-2 py-0.5 rounded text-xs">
                  Upskillize__Excel_Beyond_Promo.mp4
                </code>{' '}
                into{' '}
                <code className="bg-gray-800 px-2 py-0.5 rounded text-xs">
                  /public/videos/excel-beyond-promo.mp4
                </code>
              </p>
            </div>
          </div>

          {/* Keyboard hint */}
          <p className="absolute bottom-6 text-gray-400 text-xs">
            Press <kbd className="bg-gray-700 text-white px-2 py-0.5 rounded text-xs">Esc</kbd> or click outside to close
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <div className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-8 border border-blue-200">
              <Zap size={16} className="text-blue-600" />
              <span className="text-sm font-semibold">Welcome to Upskillize</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Excel Beyond
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                Your Potential
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Unlock your future with expert-led courses, industry certifications, and personalized learning paths
            </p>

            {/* CTA Buttons */}
            {!user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <Link
                  to="/login"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
                </Link>

                {/* ── WATCH DEMO BUTTON ── */}
                <button
                  onClick={openModal}
                  className="group bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold transition border-2 border-gray-200 hover:border-blue-400 flex items-center justify-center gap-2 hover:shadow-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                    <PlayCircle size={18} className="text-white" />
                  </div>
                  Watch Demo
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Link
                  to={user.role === 'student' ? '/student' : '/faculty'}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-xl flex items-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
                </Link>

                {/* Logged-in users can also watch the demo */}
                <button
                  onClick={openModal}
                  className="group bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold transition border-2 border-gray-200 hover:border-blue-400 flex items-center justify-center gap-2 hover:shadow-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                    <PlayCircle size={18} className="text-white" />
                  </div>
                  Watch Demo
                </button>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                <span>10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                <span>4.9/5 Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-blue-500" />
                <span>100+ Certifications</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Upskillize?</h2>
          <p className="text-xl text-gray-600">Everything you need to succeed in your learning journey</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-blue-500/30">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Expert Courses</h3>
            <p className="text-gray-600 leading-relaxed">
              Access 100+ courses created by industry experts and experienced instructors
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-purple-500/30">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Live Sessions</h3>
            <p className="text-gray-600 leading-relaxed">
              Interactive live classes with Q&A, discussions, and real-time feedback
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-orange-500/30">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Certifications</h3>
            <p className="text-gray-600 leading-relaxed">
              Earn industry-recognized certificates upon course completion
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-green-500/30">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Track Progress</h3>
            <p className="text-gray-600 leading-relaxed">
              Monitor your learning journey with detailed analytics and insights
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATS SECTION
      ══════════════════════════════════════════ */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Active Students</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100+</div>
              <div className="text-blue-100">Expert Instructors</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Premium Courses</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Start learning in 3 simple steps</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Create Account</h3>
            <p className="text-gray-600">Sign up for free and set up your personalized profile</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Choose Course</h3>
            <p className="text-gray-600">Browse our catalog and enroll in courses that match your goals</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-green-600">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Start Learning</h3>
            <p className="text-gray-600">Access course content, complete assignments, and earn certificates</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          CTA SECTION
      ══════════════════════════════════════════ */}
      {!user && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Excel Beyond?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Join thousands of learners already transforming their careers
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition shadow-xl"
              >
                Start Learning Today
                <ArrowRight size={20} />
              </Link>
              <button
                onClick={openModal}
                className="inline-flex items-center gap-2 bg-white/20 border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/30 transition"
              >
                <PlayCircle size={20} />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold text-white">Upskillize</span>
              </div>
              <p className="text-sm">Excel Beyond Your Potential</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="hover:text-white transition">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2026 Upskillize. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}