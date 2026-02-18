// Updated BFSIExcellenceProgram.jsx
// Replace the BFSI_COURSE_ID value with your actual course ID from database

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BFSIExcellenceProgram() {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  // ────────────────────────────────────────────────────────────
  // ⚠️ IMPORTANT: Replace this with your actual course ID
  // After running the SQL INSERT, check what ID was created:
  // SELECT id FROM courses WHERE course_code = 'BFSI-001';
  // Then replace the number below with that ID
  // ────────────────────────────────────────────────────────────
  const BFSI_COURSE_ID = 36; // ← CHANGE THIS to your actual course ID

  const handleEnroll = async () => {
    if (!user) {
      alert('Please login to enroll');
      navigate('/login', { state: { from: '/bfsi' } });
      return;
    }

    setEnrolling(true);
    try {
      const response = await api.post('/enrollments', { 
        course_id: BFSI_COURSE_ID 
      });
      
      console.log('Enrollment response:', response.data);
      setEnrolled(true);
      alert('Successfully enrolled in BFSI Excellence Program!');
      
      setTimeout(() => {
        navigate('/student/courses');
      }, 1000);
    } catch (error) {
      console.error('Enrollment error:', error);
      
      const msg = error.response?.data?.message || '';
      
      if (msg.toLowerCase().includes('already')) {
        alert('You are already enrolled in this course');
        navigate('/student/courses');
      } else if (error.response?.status === 404) {
        alert('Course not found. Please contact support.');
      } else {
        alert('Could not enroll. Please try again or contact support.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.animate-card').forEach(card => {
      card.style.opacity = '0';
      observer.observe(card);
    });
    return () => observer.disconnect();
  }, []);

  const stats = [
    { number: '40', label: 'Hours Professional Training' },
    { number: '18', label: 'Comprehensive Modules' },
    { number: '25+', label: 'Live Case Studies' },
    { number: '₹8-45L', label: 'Starting Salary Range' },
    { number: '100%', label: 'Practical Learning' }
  ];

  const whyBFSI = [
    { icon: '📈', stat: '₹500 Trillion', label: 'Global BFSI Market Size', color: 'from-blue-500 to-blue-700' },
    { icon: '👩‍💼', stat: '10 Lakh+', label: 'New Jobs Created Annually in India', color: 'from-violet-500 to-violet-700' },
    { icon: '🤖', stat: '80%', label: 'BFSI Firms Adopting AI by 2026', color: 'from-indigo-500 to-indigo-700' },
    { icon: '🏦', stat: '1,500+', label: 'Banks & NBFCs Hiring Annually', color: 'from-cyan-500 to-cyan-700' },
  ];

  const programHighlights = [
    { icon: '🎓', title: 'Live Industry Mentors', desc: 'Learn from CXOs, VPs, and domain experts from HDFC, ICICI, Axis, and top fintech companies.' },
    { icon: '💻', title: 'Hands-On Banking Software', desc: 'Real practice with Finacle, T24/Temenos, Salesforce FSC, and cloud banking platforms.' },
    { icon: '🧪', title: '25+ Live Case Studies', desc: 'Solve actual banking challenges from designing neo-bank products to conducting AML audits.' },
    { icon: '🤖', title: 'GenAI for BFSI', desc: 'Build AI-powered credit scorecards, chatbot advisors, and fraud detection models.' },
    { icon: '📜', title: 'Dual Certification', desc: 'Upskillize BFSI Professional Certificate + AI in Finance specialisation badge.' },
    { icon: '🤝', title: 'Placement & Network', desc: 'Exclusive BFSI hiring drives with 75+ partner colleges and direct employer referrals.' },
  ];

  const whoShouldJoin = [
    { icon: '🎓', title: 'Final Year Students', desc: 'MBA, BBA, B.Com, and engineering graduates targeting banking & fintech careers.' },
    { icon: '👔', title: 'Early Professionals', desc: 'Working professionals with 0–3 years wanting to transition into BFSI.' },
    { icon: '🏫', title: 'College Faculty', desc: 'Educators looking to upskill and deliver industry-aligned BFSI curriculum.' },
    { icon: '💡', title: 'Fintech Entrepreneurs', desc: 'Startup founders building financial products who need deep domain knowledge.' },
  ];

  const overview = [
    { icon: '🎯', title: 'Industry-Ready Skills', desc: 'Master real banking software, AI tools, and technologies used by top financial institutions.' },
    { icon: '💼', title: 'Direct Career Path', desc: 'Immediate placement in banking, fintech, and financial consulting with salaries from ₹8-45 LPA.' },
    { icon: '🚀', title: 'Future-Proof Learning', desc: 'Master GenAI, Agentic AI, and emerging technologies transforming global financial services.' },
    { icon: '🏆', title: 'Industry Certification', desc: 'Earn recognized BFSI professional certification with capstone projects.' }
  ];

  const days = [
    {
      day: 1, title: 'Banking Foundations (8 Hours)',
      sessions: [
        { icon: '🌍', title: 'Module 1: Overview of Financial Markets', desc: 'Live NSE/BSE trading analysis, commodity markets, forex operations', tag: 'Real-time Market Analysis' },
        { icon: '🏛️', title: 'Module 2: Introduction to Banking', desc: 'Banking evolution, central banking role, modern banking value creation', tag: 'Banking Business Model Workshop' },
        { icon: '🌏', title: 'Module 3: Types of Banks - Global Scenario', desc: 'Compare PSU vs Private vs Foreign banks with global giants', tag: 'Global Banking Comparison Dashboard' }
      ]
    },
    {
      day: 2, title: 'Banking Products & Services (8 Hours)',
      sessions: [
        { icon: '🏪', title: 'Module 4: Retail Banking', desc: 'Savings, FDs, personal loans, wealth management', tag: 'Retail Product Design Challenge' },
        { icon: '🏢', title: 'Module 5: Corporate Banking', desc: 'Working capital, trade finance, cash management', tag: 'Corporate Deal Structuring' },
        { icon: '💼', title: 'Module 6: Investment Banking', desc: 'IPOs, M&A advisory, underwriting', tag: 'IPO Launch Simulation' },
        { icon: '🕌', title: 'Module 7: Islamic Banking', desc: 'Sharia-compliant banking, Murabaha, Ijara', tag: 'Islamic vs Conventional Banking' }
      ]
    },
    {
      day: 3, title: 'Lending & Payments (8 Hours)',
      sessions: [
        { icon: '💰', title: 'Module 8: Lending Products', desc: 'Home, personal, auto, education, business loans', tag: 'Loan Portfolio Optimization' },
        { icon: '📄', title: 'Module 9: Retail Lending Process', desc: 'End-to-end loan journey from application to collection', tag: 'Complete Loan Processing Simulation' },
        { icon: '💳', title: 'Module 10: Payment Systems', desc: 'UPI, NEFT, RTGS, SWIFT, blockchain payments', tag: 'Payment Gateway Development' },
        { icon: '💳', title: 'Module 11: Cards Ecosystem', desc: 'Credit, debit, prepaid cards - Visa, MasterCard, RuPay', tag: 'Card Product Launch Strategy' }
      ]
    },
    {
      day: 4, title: 'Risk & Compliance (8 Hours)',
      sessions: [
        { icon: '👥', title: 'Module 12: Customer Personas', desc: 'Segment customers by demographics, behavior, profitability', tag: 'Customer Segmentation Workshop' },
        { icon: '🚨', title: 'Module 13: Crime and Compliance', desc: 'Anti-money laundering (AML), KYC procedures, fraud detection', tag: 'Fraud Detection Algorithm' },
        { icon: '⚖️', title: 'Module 14: Risk Management', desc: 'Credit, market, operational, liquidity risk - VaR models', tag: 'Risk Management Simulation' },
        { icon: '📋', title: 'Module 15: Banking Regulation', desc: 'RBI guidelines, Basel III norms, capital adequacy', tag: 'Regulatory Compliance Audit' }
      ]
    },
    {
      day: 5, title: 'Future Banking & AI (8 Hours)',
      sessions: [
        { icon: '💻', title: 'Module 16: Banking Software', desc: 'Hands-on with Finacle, Temenos, T24, cloud banking platforms', tag: 'Banking Software Configuration' },
        { icon: '🤖', title: 'GenAI & Agentic AI in Finance', desc: 'ChatGPT banking applications, AI trading algorithms, robo-advisors', tag: 'Build AI Banking Assistant' },
        { icon: '🚀', title: 'Module 17: New Age Banking & Fintech', desc: 'Neo-banks, DeFi, cryptocurrency, blockchain, fintech disruption', tag: 'Fintech Startup Pitch' },
        { icon: '🛡️', title: 'Module 18: Insurance Domain', desc: 'Life, health, general insurance, bancassurance partnerships', tag: 'Insurance Product Development' }
      ]
    }
  ];

  const careers = [
    { icon: '📱', title: 'Product Manager', desc: 'Design and launch banking products, manage product lifecycle', salary: '₹12-25 LPA', level: 'Entry to Mid-level' },
    { icon: '💼', title: 'Sales Consultant', desc: 'Sell banking products, manage client relationships', salary: '₹8-18 LPA', level: 'Entry Level' },
    { icon: '📊', title: 'Investment Banking Advisor', desc: 'M&A advisory, capital raising, financial modeling', salary: '₹15-45 LPA', level: 'Mid to Senior Level' },
    { icon: '🤖', title: 'Fintech AI Specialist', desc: 'Develop AI solutions for banking, implement ML models', salary: '₹18-35 LPA', level: 'Mid-level' },
    { icon: '⚖️', title: 'Risk Analyst', desc: 'Assess credit risk, market risk, develop risk models', salary: '₹10-22 LPA', level: 'Entry to Mid-level' },
    { icon: '🏛️', title: 'Compliance Officer', desc: 'Ensure regulatory compliance, AML monitoring', salary: '₹9-20 LPA', level: 'Entry to Mid-level' }
  ];

  const successFactors = [
    { icon: '🧠', title: 'Analytical Mindset', desc: 'Master data analysis, financial modeling, and problem-solving.' },
    { icon: '💻', title: 'Technology Fluency', desc: 'Embrace AI, blockchain, and emerging technologies.' },
    { icon: '🎯', title: 'Customer-Centric Thinking', desc: 'Understand customer needs and design user experiences.' },
    { icon: '📚', title: 'Continuous Learning', desc: 'Stay updated with regulations, market trends, and innovations.' }
  ];

  const faqs = [
    { q: 'Who is this program designed for?', a: 'Any graduate or professional looking to enter or advance in Banking, Financial Services & Insurance. Ideal for MBA, BBA, B.Com students, and working professionals with 0–5 years of experience.' },
    { q: 'Is prior banking knowledge required?', a: 'No. The program starts from foundational concepts and progressively moves to advanced AI-driven banking. Complete beginners are welcome.' },
    { q: 'How is the program delivered?', a: 'The 40-hour curriculum is delivered via live online sessions, recorded modules, hands-on labs, and real case-study workshops — fully flexible to fit your schedule.' },
    { q: 'What certificate will I receive?', a: 'You receive an Upskillize BFSI Professional Certificate upon passing the final exam, plus an AI in Finance specialisation badge shareable on LinkedIn.' },
    { q: 'Are there placement opportunities?', a: 'Yes. Upskillize connects certified students with 75+ partner colleges and directly refers top performers to banking, fintech, and NBFC hiring drives.' },
    { q: 'What is the fee for this program?', a: 'This program is completely FREE! No hidden costs. Just enroll and start learning.' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.5); }
          50% { box-shadow: 0 0 0 14px rgba(255,255,255,0); }
        }
        * { font-family: 'Inter', sans-serif; }
        .faq-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease, padding 0.35s ease;
        }
        .faq-body.open { max-height: 200px; }
        .play-btn { animation: pulse-ring 2.2s infinite; }
      `}</style>

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white px-6 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-[shimmer_3s_infinite]"></div>
        </div>
        <div className="relative z-10">
          <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider shadow">
            🏆 India's Most Comprehensive BFSI Training
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">🏦 BFSI Domain Excellence Program</h1>
          <p className="text-lg md:text-xl mb-2 text-blue-100">40-Hour Professional Certification in Banking, Financial Services &amp; Insurance</p>
          <p className="text-sm text-blue-200 mb-8">Trusted by 75+ Colleges · Industry-Recognised Certificate · Placement Support</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 max-w-5xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-400 hover:scale-105 transition-transform">
                <div className="text-3xl font-black text-yellow-300">{stat.number}</div>
                <div className="text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO VIDEO */}
      <section className="bg-gradient-to-br from-blue-950 to-blue-900 px-6 py-14">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            🎬 Program Overview Video
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            See the BFSI Program in Action
          </h2>
          <p className="text-blue-200 mb-8 text-base md:text-lg">
            Watch how Upskillize transforms students into industry-ready BFSI professionals in just 40 hours.
          </p>

          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-600 bg-black group mx-auto"
            style={{ maxWidth: 800 }}
          >
            {!videoError ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full block"
                  style={{ aspectRatio: '16/9', objectFit: 'cover' }}
                  src="/videos/bfsi-promo.mp4"
                  preload="metadata"
                  controls
                  onPlay={() => setVideoPlaying(true)}
                  onPause={() => setVideoPlaying(false)}
                  onError={() => setVideoError(true)}
                >
                  Your browser does not support the video tag.
                </video>
                {!videoPlaying && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                    onClick={() => { videoRef.current?.play(); setVideoPlaying(true); }}
                  >
                    <span className="play-btn w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                      <span className="text-blue-700 text-3xl ml-1.5">▶</span>
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex flex-col items-center justify-center bg-blue-950 text-white"
                style={{ aspectRatio: '16/9' }}
              >
                <div className="text-6xl mb-4">🎬</div>
                <p className="font-bold text-xl mb-2">BFSI Promo Video</p>
                <p className="text-blue-300 text-sm text-center max-w-sm px-4 leading-relaxed">
                  Place video file at <code className="bg-blue-800 px-2 py-0.5 rounded text-xs font-mono">/public/videos/bfsi-promo.mp4</code>
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleEnroll}
              disabled={enrolling || enrolled}
              className="bg-yellow-400 text-yellow-900 px-8 py-3 rounded-full font-bold hover:scale-105 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
              {enrolled ? '✅ Enrolled! Redirecting...' : enrolling ? '⏳ Enrolling...' : '🚀 Enroll Now - FREE'}
            </button>
            <button
              onClick={() => document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/10 border-2 border-white/30 text-white px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-all">
              📚 View Full Curriculum
            </button>
          </div>
        </div>
      </section>

      {/* WHY BFSI */}
      <section className="bg-gray-50 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-blue-900 mb-2">Why Choose a BFSI Career?</h2>
          <p className="text-center text-gray-500 mb-10">The most stable, high-growth sector with AI-driven transformation</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {whyBFSI.map((item, i) => (
              <div key={i} className={`animate-card bg-gradient-to-br ${item.color} text-white rounded-2xl p-6 text-center shadow-lg hover:-translate-y-2 transition-all`}>
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-2xl font-black mb-1">{item.stat}</div>
                <div className="text-xs font-medium opacity-90">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAM HIGHLIGHTS */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-blue-900 mb-2">What Makes This Program Different</h2>
          <p className="text-center text-gray-500 mb-10">Not just theory — real skills, real mentors, real outcomes</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programHighlights.map((item, i) => (
              <div key={i} className="animate-card bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-300 hover:shadow-xl transition-all group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{item.icon}</div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO SHOULD JOIN */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-blue-900 mb-2">Who Should Join?</h2>
          <p className="text-center text-gray-500 mb-10">This program is built for ambitious learners at every stage</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whoShouldJoin.map((item, i) => (
              <div key={i} className="animate-card bg-white rounded-2xl p-6 text-center shadow-md border-t-4 border-blue-500 hover:-translate-y-2 hover:shadow-xl transition-all">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OVERVIEW CARDS */}
      <section className="px-6 py-12">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-blue-900 mb-10 relative">
          Program Overview
          <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {overview.map((card, i) => (
            <div key={i} className="animate-card bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-500 hover:-translate-y-1 hover:shadow-2xl transition-all text-center">
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">{card.title}</h3>
              <p className="text-gray-600 text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CURRICULUM */}
      <section id="curriculum" className="bg-gray-50 px-6 py-12">
        <h2 className="text-center text-4xl font-bold text-blue-900 mb-10 relative">
          Complete 40-Hour BFSI Curriculum
          <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded"></div>
        </h2>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center mb-8 max-w-5xl mx-auto">
          <h3 className="text-xl font-bold mb-2">🎓 Professional Certification Program</h3>
          <p>Comprehensive 40-hour training with industry-standard evaluation</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {days.map((day) => (
            <div key={day.day} className="animate-card bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl flex items-center justify-center text-xl font-bold mr-3">{day.day}</div>
                  <div className="text-lg font-semibold text-blue-900">{day.title}</div>
                </div>
                <div className="space-y-3">
                  {day.sessions.map((session, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                      <div className="font-semibold text-blue-900 text-sm mb-1 flex items-center gap-2">
                        <span>{session.icon}</span><span>{session.title}</span>
                      </div>
                      <div className="text-gray-600 text-xs mb-2">{session.desc}</div>
                      <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">{session.tag}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CAREERS */}
      <section className="px-6 py-12">
        <h2 className="text-center text-4xl font-bold text-blue-900 mb-10 relative">
          BFSI Career Prospects &amp; Salary Ranges
          <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded"></div>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {careers.map((career, i) => (
            <div key={i} className="animate-card bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-900 text-center hover:-translate-y-2 hover:shadow-2xl transition-all">
              <div className="text-4xl mb-3">{career.icon}</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">{career.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{career.desc}</p>
              <div className="text-2xl font-black text-yellow-500 mb-1">{career.salary}</div>
              <div className="text-sm text-blue-600 font-semibold">{career.level}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SUCCESS FACTORS */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white px-6 py-12">
        <h2 className="text-center text-4xl font-bold mb-10">What You Need to Succeed in Fintech</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {successFactors.map((factor, i) => (
            <div key={i} className="animate-card bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-center hover:bg-white/20 hover:-translate-y-2 transition-all">
              <div className="text-4xl mb-3">{factor.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{factor.title}</h3>
              <p className="text-sm opacity-90">{factor.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold text-blue-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-center text-gray-500 mb-10">Everything you need to know before enrolling</p>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border-2 border-gray-100 overflow-hidden hover:border-blue-200 transition-colors">
                <button
                  className="w-full text-left px-6 py-4 flex justify-between items-center font-semibold text-blue-900 text-sm md:text-base"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <span className={`ml-4 text-blue-500 text-2xl font-light transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <div className={`faq-body px-6 ${openFaq === i ? 'open pb-4' : ''}`}>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / ENROLL */}
      <section id="enroll" className="bg-gradient-to-br from-green-500 to-green-600 text-white px-6 py-12 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">🚀 Transform Into BFSI Professional - FREE</h2>
        <p className="text-lg mb-6 text-green-100">Join thousands of students already building industry-ready careers</p>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border-2 border-white/20">
          <div className="grid grid-cols-2 gap-3 text-sm text-left mb-4">
            <div className="flex items-center gap-2">✅ Industry-Recognised Certificate</div>
            <div className="flex items-center gap-2">✅ 100% Practical Learning</div>
            <div className="flex items-center gap-2">✅ Expert Industry Mentors</div>
            <div className="flex items-center gap-2">✅ Real Banking Software</div>
            <div className="flex items-center gap-2">✅ AI &amp; GenAI Focus</div>
            <div className="flex items-center gap-2">✅ Placement Support</div>
          </div>
          <div className="bg-yellow-400/20 p-3 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm">🎁 <strong>100% FREE</strong> No hidden costs. Start learning immediately!</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <button
            onClick={handleEnroll}
            disabled={enrolling || enrolled}
            className="bg-white text-green-600 px-8 py-3 rounded-full font-bold hover:scale-105 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {enrolled ? '✅ Enrolled! Redirecting...' : enrolling ? '⏳ Enrolling...' : '🚀 Enroll for Free Now'}
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-900 text-white px-6 py-8 text-center">
        <h3 className="text-yellow-400 font-bold text-lg mb-4">🏆 Program Highlights</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6 max-w-3xl mx-auto">
          <div>✅ Industry-Recognized Certification</div>
          <div>✅ 100% Practical Learning</div>
          <div>✅ Expert Industry Mentors</div>
          <div>✅ Real Banking Software Training</div>
          <div>✅ AI &amp; Future Tech Focus</div>
          <div>✅ Guaranteed Skill Development</div>
        </div>
      </footer>
    </div>
  );
}