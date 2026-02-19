import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  BookOpen, Users, Award, TrendingUp, ArrowRight, CheckCircle, Star, 
  PlayCircle, Zap, Target, Globe, X, Briefcase, GraduationCap, 
  Building2, Linkedin, Mail, MapPin, Phone, Twitter
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// VIDEO SETUP:
//   Place  Upskillize__Excel_Beyond_Promo.mp4
//   into   /public/videos/excel-beyond-promo.mp4
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
      document.body.style.overflow = 'hidden';
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
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 z-10 w-10 h-10 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition hover:scale-110"
              aria-label="Close video"
            >
              <X size={20} />
            </button>

            <div className="absolute top-3 left-3 z-10">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                🎬 Upskillize — Excel Beyond Your Potential
              </span>
            </div>

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
              <span className="text-sm font-semibold">Business Consulting | IT Products | Academic & Corporate Courses</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Excel Beyond
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                Your Potential
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Transform your career with Banking, Product Leadership & Financial Management expertise from industry veterans
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
                <span>10,000+ Learners</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={18} className="text-yellow-500 fill-yellow-500" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-blue-500" />
                <span>50-200 Employees</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-orange-500" />
                <span>Bengaluru, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          SPECIALIZATIONS SECTION
      ══════════════════════════════════════════ */}
      <div className="bg-gradient-to-b from-white to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Specializations</h2>
            <p className="text-xl text-gray-600">Industry-focused programs designed for real-world impact</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Banking & Finance */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-blue-500/30">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Banking & Finance</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Master banking operations, credit analysis, risk management, and financial instruments from BFSI experts
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Core Banking & Trade Finance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Credit Risk & Portfolio Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Retail & Corporate Banking</span>
                </li>
              </ul>
            </div>

            {/* Product Leadership */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-500">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-purple-500/30">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Product Leadership</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Learn product strategy, roadmaps, and go-to-market execution from seasoned product leaders
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Product Lifecycle & Strategy</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Agile & Scrum Frameworks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Stakeholder Management & GTM</span>
                </li>
              </ul>
            </div>

            {/* Financial Management */}
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-500">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-orange-500/30">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Financial Management</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Build expertise in financial modeling, valuation, budgeting, and investment analysis
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Financial Modeling & Valuation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Budgeting & Forecasting</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <span>Investment & Portfolio Analysis</span>
                </li>
              </ul>
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
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">MBA-Level Content</h3>
            <p className="text-gray-600 leading-relaxed">
              Curriculum benchmarked against IIM, ISB, and CFA standards for professional excellence
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-purple-500/30">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Industry Experts</h3>
            <p className="text-gray-600 leading-relaxed">
              Learn from banking, finance, and product professionals with 10+ years experience
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-orange-500/30">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Capstone Projects</h3>
            <p className="text-gray-600 leading-relaxed">
              Real-world case studies and projects with industry-recognized certifications
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-lg shadow-green-500/30">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Flexible Learning</h3>
            <p className="text-gray-600 leading-relaxed">
              Hybrid model with live sessions, recorded content, and personalized mentorship
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
              <div className="text-blue-100">Active Learners</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100+</div>
              <div className="text-blue-100">Expert Faculty</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Corporate Clients</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Completion Rate</div>
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
            <p className="text-gray-600">Browse Banking, Product, or Finance programs that match your goals</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-green-600">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Start Learning</h3>
            <p className="text-gray-600">Access course content, complete capstone projects, and earn certificates</p>
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
              Join thousands of learners already transforming their careers in Banking, Product & Finance
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
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <span className="text-xl font-bold text-white">Upskillize</span>
              </div>
              <p className="text-sm mb-4">Excel Beyond Your Potential</p>
              <p className="text-xs text-gray-500 mb-2">Business Consulting | IT Products</p>
              <p className="text-xs text-gray-500">Academic & Corporate Courses</p>
              <div className="flex items-center gap-2 mt-4">
                <Building2 size={14} className="text-gray-500" />
                <span className="text-xs">50-200 employees</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li>
                  <a 
                    href="https://www.linkedin.com/in/upskillize-excel-beyond" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition inline-flex items-center gap-2"
                  >
                    <Linkedin size={16} />
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a 
                    href="https://x.com/upskillize36330" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition inline-flex items-center gap-2"
                  >
                    <Twitter size={16} />
                      Twitter
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="text-blue-400 flex-shrink-0 mt-1" />
                  <span>Bengaluru, Karnataka, India</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-400 flex-shrink-0" />
                  <a href="mailto:amit@upskillize.com" className="hover:text-white transition">
                    amit@upskillize.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-blue-400 flex-shrink-0" />
                  <span>+91 98203 97297</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left text-sm">
                © {new Date().getFullYear()} Upskillize - Excel Beyond. All rights reserved.
              </div>
              <div className="flex gap-6 text-sm">
                <Link to="/terms" className="hover:text-white transition">Terms</Link>
                <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
                <Link to="/cookies" className="hover:text-white transition">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}