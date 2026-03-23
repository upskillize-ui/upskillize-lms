// ============================================================
// COMPLETE FACULTY DASHBOARD — Upskillize LMS
// File: src/pages/Faculty/Dashboard.jsx
// Plus Jakarta Sans · Navy #1a2744 · Gold #b8960b
// Features: Overview, My Courses, Students, Assignments,
//   Quizzes/Assessments, Live Classes, Jobs/Placements,
//   Discussion Forum, Doubts, Notifications, Profile, Settings
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Routes, Route, Link, useLocation, useNavigate, useParams,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  BarChart3, BookOpen, Users, FileText, ClipboardList,
  CalendarDays, Briefcase, MessageSquare, HelpCircle, Bell,
  Settings, LogOut, User, TrendingUp, Award, Plus, X,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Search, Menu, RefreshCw, Save, Camera, Eye, EyeOff,
  Upload, Download, Trash2, Edit, Check, AlertCircle,
  CheckCircle, XCircle, Clock, Calendar, Star, Send,
  Video, Link as LinkIcon, MapPin, Shield, Lock, Mail,
  Activity, Target, Zap, PlayCircle, FolderOpen, FileUp,
  Bot, Paperclip, GripVertical, Layers, Building2,
  AlignLeft, Folder, ArrowRight, ThumbsUp, Timer,
  Trophy, FilePen, BarChart2, Brain, Sparkles, Globe,
  FileQuestion, Loader, Copy, Image, PlusCircle, Trash,
  Users as UsersIcon, DollarSign, Laptop, FileVideo,
  ChevronRight as CR, MessageCircle, BookMarked,
} from "lucide-react";
const BASE_URL = (import.meta.env.VITE_API_URL || 'https://upskillize-lms-backend.onrender.com/api').replace('/api', '');
// ─── Toast Hook ────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  const ToastEl = (
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background: t.type === "error" ? "#fdf1f0" : t.type === "warning" ? "#fdf8ed" : "#edf7ed", border: `1.5px solid ${t.type === "error" ? "#f7c1c1" : t.type === "warning" ? "#e8d89a" : "#b8d9b8"}`, borderRadius: 10, padding: "12px 18px", fontSize: 13, fontWeight: 600, color: t.type === "error" ? "#c0392b" : t.type === "warning" ? "#7a5e00" : "#2d6a2d", boxShadow: "0 4px 14px rgba(0,0,0,.12)", display: "flex", alignItems: "center", gap: 8, minWidth: 280, animation: "fac-spin .0s" }}>
          {t.type === "error" ? <XCircle size={14} /> : t.type === "warning" ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
          {t.message}
        </div>
      ))}
    </div>
  );
  return { showToast, ToastEl };
}

// ─── Design Tokens ────────────────────────────────────────────────────────
const T = {
  navy:      "#1a2744", navyLight: "#2c3e6b",
  gold:      "#b8960b", goldSoft:  "#fdf8ed", goldBorder: "#e8d89a",
  white:     "#ffffff", bg:        "#f7f8fc",
  border:    "#e8e9f0", borderStrong: "#c8c4bc",
  text:      "#1a1a1a", muted:     "#72706b", subtle: "#a8a49f",
  redSoft:   "#fdf1f0", red:       "#c0392b",
  greenSoft: "#edf7ed", green:     "#2d6a2d",
  blueSoft:  "#eef2fb", blue:      "#1e3a6b",
};

// ─── Global Styles ─────────────────────────────────────────────────────────
const FacultyStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    .fac-root*,.fac-root *::before,.fac-root *::after{box-sizing:border-box;margin:0;padding:0}
    .fac-root{font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#1a1a1a;background:#f7f8fc;-webkit-font-smoothing:antialiased}
    .fac-sidebar{width:230px;background:#1a2744;color:#fff;display:flex;flex-direction:column;flex-shrink:0;height:100vh;overflow-y:auto;box-shadow:2px 0 12px rgba(0,0,0,.12)}
    .fac-sidebar-brand{padding:22px 20px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
    .fac-brand-role{font-size:10px;letter-spacing:.14em;color:rgba(255,255,255,.4);text-transform:uppercase;font-weight:700;margin-bottom:3px}
    .fac-brand-name{font-size:17px;font-weight:800;color:#fff}
    .fac-brand-sub{font-size:11px;color:rgba(255,255,255,.35);margin-top:2px}
    .fac-nav-section{padding:12px 0 4px}
    .fac-nav-label{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.26);padding:0 18px 4px;font-weight:700}
    .fac-nav-item{display:flex;align-items:center;gap:9px;padding:9px 18px;cursor:pointer;color:rgba(255,255,255,.62);font-size:13px;font-weight:500;transition:all .17s;text-decoration:none}
    .fac-nav-item:hover{background:rgba(255,255,255,.07);color:#fff;padding-left:22px}
    .fac-nav-item.active{background:rgba(255,255,255,.10);color:#fff;border-right:2.5px solid #b8960b;font-weight:700}
    .fac-nav-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.2);flex-shrink:0}
    .fac-nav-dot.active{background:#b8960b}
    .fac-sidebar-footer{margin-top:auto;padding:14px 18px;border-top:1px solid rgba(255,255,255,.08)}
    .fac-topbar{background:#fff;border-bottom:1px solid #e8e9f0;padding:12px 26px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:30;box-shadow:0 1px 6px rgba(26,39,68,.06)}
    .fac-page-title{font-size:21px;font-weight:800;color:#1a2744;letter-spacing:-.4px}
    .fac-page-meta{font-size:12px;color:#a8a49f;margin-top:1px}
    .fac-card{background:#fff;border:1px solid #e8e9f0;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(26,39,68,.05),0 2px 10px rgba(26,39,68,.04);transition:box-shadow .22s}
    .fac-card:hover{box-shadow:0 6px 20px rgba(26,39,68,.09)}
    .fac-card-head{padding:13px 17px;border-bottom:1px solid #e8e9f0;display:flex;align-items:center;justify-content:space-between}
    .fac-card-title{font-size:13px;font-weight:700;color:#1a2744}
    .fac-metric{background:#fff;border:1px solid #e8e9f0;border-radius:12px;padding:17px 19px;position:relative;box-shadow:0 1px 4px rgba(26,39,68,.05);transition:box-shadow .22s,transform .22s;cursor:default}
    .fac-metric:hover{box-shadow:0 8px 22px rgba(26,39,68,.11);transform:translateY(-3px) scale(1.015)}
    .fac-metric::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:12px 12px 0 0}
    .fac-metric-navy::before{background:#1a2744}.fac-metric-gold::before{background:#b8960b}.fac-metric-green::before{background:#2d6a2d}.fac-metric-red::before{background:#c0392b}.fac-metric-blue::before{background:#1e3a6b}
    .fac-metric-label{font-size:13px;color:#72706b;margin-bottom:7px;font-weight:500}
    .fac-metric-value{font-size:30px;font-weight:800;color:#1a2744;line-height:1;letter-spacing:-1px}
    .fac-metric-sub{font-size:12px;color:#a8a49f;margin-top:7px}
    .fac-pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
    .fac-pill-pass{background:#edf7ed;color:#2d6a2d}.fac-pill-fail{background:#fdf1f0;color:#c0392b}.fac-pill-sub{background:#eef2fb;color:#1e3a6b}.fac-pill-warn{background:#fdf8ed;color:#7a5e00}.fac-pill-navy{background:#eef2fb;color:#1a2744}.fac-pill-gold{background:#fdf8ed;color:#7a5e00}.fac-pill-gray{background:#f4f4f6;color:#72706b}
    .fac-btn-primary{background:#1a2744;color:#fff;border:none;border-radius:8px;padding:9px 17px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px;text-decoration:none;box-shadow:0 1px 4px rgba(26,39,68,.15)}
    .fac-btn-primary:hover{background:#2c3e6b;box-shadow:0 4px 12px rgba(26,39,68,.22);transform:translateY(-1px)}
    .fac-btn-gold{background:#b8960b;color:#fff;border:none;border-radius:8px;padding:9px 17px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
    .fac-btn-gold:hover{background:#9a7d09;transform:translateY(-1px)}
    .fac-btn-outline{background:transparent;color:#1a2744;border:1.5px solid #e8e9f0;border-radius:8px;padding:8px 15px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .17s;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
    .fac-btn-outline:hover{border-color:#1a2744;background:#f7f8fc}
    .fac-btn-ghost{background:transparent;color:#72706b;border:1.5px solid #e8e9f0;border-radius:8px;padding:8px 13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .17s;display:inline-flex;align-items:center;gap:5px}
    .fac-btn-ghost:hover{color:#1a1a1a;border-color:#c8c4bc;background:#f7f8fc}
    .fac-btn-danger{background:#fdf1f0;color:#c0392b;border:1.5px solid #f7c1c1;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;transition:all .17s;font-family:'Plus Jakarta Sans',sans-serif}
    .fac-btn-danger:hover{background:#c0392b;color:#fff}
    .fac-input{width:100%;padding:9px 12px;border:1.5px solid #e8e9f0;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#1a1a1a;background:#fff;transition:border-color .17s;outline:none}
    .fac-input:focus{border-color:#1a2744;box-shadow:0 0 0 3px rgba(26,39,68,.07)}
    .fac-input:disabled{background:#f7f8fc;color:#72706b}
    .fac-label{display:block;font-size:12px;font-weight:700;letter-spacing:.04em;color:#72706b;margin-bottom:5px}
    .fac-select{width:100%;padding:9px 12px;border:1.5px solid #e8e9f0;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#1a1a1a;background:#fff;outline:none;cursor:pointer;transition:border-color .17s}
    .fac-select:focus{border-color:#1a2744;box-shadow:0 0 0 3px rgba(26,39,68,.07)}
    .fac-textarea{width:100%;padding:9px 12px;border:1.5px solid #e8e9f0;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#1a1a1a;background:#fff;resize:vertical;outline:none;transition:border-color .17s}
    .fac-textarea:focus{border-color:#1a2744;box-shadow:0 0 0 3px rgba(26,39,68,.07)}
    .fac-tabs{display:flex;gap:4px;flex-wrap:wrap}
    .fac-tab{padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid transparent;transition:all .17s;background:transparent;color:#72706b;font-family:'Plus Jakarta Sans',sans-serif}
    .fac-tab:hover{background:#fff;border-color:#e8e9f0;color:#1a1a1a}
    .fac-tab.active{background:#1a2744;color:#fff;border-color:#1a2744;box-shadow:0 2px 8px rgba(26,39,68,.18)}
    .fac-modal-bg{position:fixed;inset:0;background:rgba(26,39,68,.5);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px;backdrop-filter:blur(4px)}
    .fac-modal{background:#fff;border-radius:16px;padding:26px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(26,39,68,.2)}
    .fac-alert-success{background:#edf7ed;border:1.5px solid #b8d9b8;border-radius:8px;padding:10px 13px;color:#2d6a2d;font-size:13px;display:flex;align-items:center;gap:7px}
    .fac-alert-error{background:#fdf1f0;border:1.5px solid #f7c1c1;border-radius:8px;padding:10px 13px;color:#c0392b;font-size:13px;display:flex;align-items:center;gap:7px}
    .fac-alert-info{background:#fdf8ed;border:1.5px solid #e8d89a;border-radius:8px;padding:10px 13px;color:#5a4500;font-size:13px;display:flex;align-items:center;gap:7px}
    .fac-divider{border:none;border-top:1px solid #e8e9f0;margin:8px 0}
    .fac-section-title{font-size:21px;font-weight:800;color:#1a2744;margin-bottom:4px;letter-spacing:-.4px}
    .fac-section-sub{font-size:13px;color:#a8a49f;font-weight:500}
    .fac-empty{text-align:center;padding:48px 20px;color:#a8a49f}
    .fac-empty p{margin:8px 0 0;font-size:14px}
    .fac-spin{display:flex;align-items:center;justify-content:center;height:180px}
    .fac-spinner{width:26px;height:26px;border:2px solid #e8e9f0;border-top-color:#1a2744;border-radius:50%;animation:fac-spin .7s linear infinite}
    @keyframes fac-spin{to{transform:rotate(360deg)}}
    .fac-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}
    .fac-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:13px}
    .fac-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:15px}
    .fac-grid-courses{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}
    .fac-content{padding:22px 26px;max-width:1400px;margin:0 auto}
    .fac-table{width:100%;border-collapse:collapse}
    .fac-table th{font-size:12px;font-weight:700;color:#72706b;padding:10px 12px;text-align:left;border-bottom:1px solid #e8e9f0;letter-spacing:.02em;background:#f7f8fc}
    .fac-table td{padding:11px 12px;font-size:14px;border-bottom:1px solid #e8e9f0;color:#1a1a1a;vertical-align:middle}
    .fac-table tr:last-child td{border-bottom:none}
    .fac-table tbody tr:hover{background:#f7f8fc}
    .fac-toggle-track{position:relative;width:38px;height:22px;background:#e8e9f0;border-radius:11px;transition:background .2s;display:inline-block;cursor:pointer}
    .fac-toggle-track.on{background:#1a2744}
    .fac-toggle-thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.15)}
    .fac-toggle-track.on .fac-toggle-thumb{transform:translateX(16px)}
    .fac-icon-btn{width:34px;height:34px;border:1.5px solid #e8e9f0;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#fff;color:#72706b;transition:all .17s}
    .fac-icon-btn:hover{border-color:#c8c4bc;color:#1a1a1a;box-shadow:0 2px 8px rgba(26,39,68,.08)}
    .fac-dropdown{position:absolute;right:0;top:calc(100%+6px);background:#fff;border:1.5px solid #e8e9f0;border-radius:12px;box-shadow:0 10px 28px rgba(26,39,68,.12);z-index:50;overflow:hidden}
    .fac-user-menu-item{display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:13px;font-weight:500;color:#1a1a1a;cursor:pointer;transition:background .12s;text-decoration:none;background:transparent;width:100%;text-align:left;border:none;font-family:'Plus Jakarta Sans',sans-serif}
    .fac-user-menu-item:hover{background:#f7f8fc}
    .fac-user-menu-item.danger{color:#c0392b}
    .fac-search-bar{display:flex;align-items:center;gap:7px;background:#f7f8fc;border:1.5px solid #e8e9f0;border-radius:8px;padding:7px 13px;position:relative}
    .fac-search-bar:focus-within{border-color:#1a2744}
    .fac-course-card{background:#fff;border:1px solid #e8e9f0;border-radius:13px;overflow:hidden;box-shadow:0 1px 4px rgba(26,39,68,.05);transition:box-shadow .24s,transform .24s}
    .fac-course-card:hover{box-shadow:0 10px 28px rgba(26,39,68,.12);transform:translateY(-3px)}
    .fac-thread-row{background:#fff;border:1px solid #e8e9f0;border-radius:10px;padding:15px;transition:box-shadow .2s;margin-bottom:8px}
    .fac-thread-row:hover{box-shadow:0 5px 16px rgba(26,39,68,.09)}
    .fac-bar-track{height:5px;background:#e8e9f0;border-radius:3px;overflow:hidden}
    .fac-bar-fill{height:100%;border-radius:3px;transition:width .5s}
    .fac-profile-tabs{display:flex;border-bottom:1px solid #e8e9f0;background:#f7f8fc;overflow-x:auto}
    .fac-profile-tab{padding:11px 18px;font-size:13px;font-weight:600;cursor:pointer;border-bottom:2.5px solid transparent;color:#72706b;white-space:nowrap;background:transparent;border-top:none;border-left:none;border-right:none;transition:all .17s;font-family:'Plus Jakarta Sans',sans-serif}
    .fac-profile-tab:hover{color:#1a1a1a;background:rgba(26,39,68,.04)}
    .fac-profile-tab.active{border-bottom-color:#1a2744;color:#1a2744;background:#fff;font-weight:700}
    .fac-doubt-card{background:#fff;border:1px solid #e8e9f0;border-radius:10px;padding:15px;margin-bottom:9px;box-shadow:0 1px 4px rgba(26,39,68,.04);transition:box-shadow .18s}
    .fac-doubt-card:hover{box-shadow:0 4px 14px rgba(26,39,68,.09)}
    @media(max-width:1100px){.fac-grid-courses{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:900px){.fac-grid-4{grid-template-columns:repeat(2,1fr)}.fac-grid-2{grid-template-columns:1fr}.fac-grid-courses{grid-template-columns:1fr}}
  `}</style>
);

// ─── Shared Components ────────────────────────────────────────────────────
const Spinner = () => <div className="fac-spin"><div className="fac-spinner"/></div>;

function Msg({ type, text }) {
  if (!text) return null;
  return (
    <div className={`fac-alert-${type}`} style={{ marginBottom:14 }}>
      {type==="success" ? <CheckCircle size={13}/> : type==="error" ? <XCircle size={13}/> : <AlertCircle size={13}/>}
      {text}
    </div>
  );
}

function Avatar({ name, gender, photo, size=34 }) {
  if (photo) return <img src={photo} alt={name} style={{ width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>;
  const initials = (name||"F").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{ width:size,height:size,borderRadius:"50%",background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:size*0.38,flexShrink:0 }}>
      {initials}
    </div>
  );
}

// ─── OVERVIEW ──────────────────────────────────────────────────────────────
function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (silent=false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const r = await api.get("/faculty/dashboard/stats");
      if (r.data.success) { setStats(r.data.stats||{}); setActivity(r.data.activities||[]); }
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Spinner/>;

  const hour = new Date().getHours();
  const greeting = hour<12 ? "morning" : hour<17 ? "afternoon" : "evening";

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
        <div>
          <h2 className="fac-section-title">Faculty Dashboard</h2>
          <p className="fac-section-sub">Welcome back, {user?.full_name?.split(" ")[0]||"Faculty"} — good {greeting}!</p>
        </div>
        <button className="fac-btn-ghost" onClick={()=>fetchData(true)} disabled={refreshing}>
          <RefreshCw size={13} style={{ animation:refreshing?"fac-spin .7s linear infinite":"none" }}/>
          {refreshing?"Refreshing...":"Refresh"}
        </button>
      </div>

      {/* Welcome banner */}
      <div style={{ background:`linear-gradient(135deg,${T.navy} 0%,${T.navyLight} 100%)`,borderRadius:12,padding:"20px 24px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 4px 14px rgba(26,39,68,.2)" }}>
        <div>
          <h3 style={{ fontSize:18,fontWeight:800,color:"#fff",marginBottom:4 }}>Good {greeting}, {user?.full_name?.split(" ")[0]||"Faculty"}!</h3>
          <p style={{ fontSize:13,color:"rgba(255,255,255,.55)" }}>Manage your courses, students and content from one place.</p>
        </div>
        <div style={{ display:"flex",gap:0 }}>
          {[
            { num:stats?.totalCourses??"–", lbl:"Courses" },
            { num:stats?.totalStudents??"–", lbl:"Students" },
            { num:stats?.pendingAssignments??"–", lbl:"Pending" },
          ].map((s,i) => (
            <div key={i} style={{ borderLeft:"1px solid rgba(255,255,255,.15)",paddingLeft:20,textAlign:"right" }}>
              <div style={{ fontSize:24,fontWeight:800,color:"#fff" }}>{s.num}</div>
              <div style={{ fontSize:12,color:"rgba(255,255,255,.45)" }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="fac-grid-4" style={{ marginBottom:14 }}>
        {[
          { label:"My Courses",        value:stats?.totalCourses??"–",       sub:"Active courses",       accent:"fac-metric-navy"  },
          { label:"Total Students",    value:stats?.totalStudents??"–",      sub:"Enrolled in my courses",accent:"fac-metric-gold"  },
          { label:"Pending Grading",   value:stats?.pendingAssignments??"–", sub:"Assignments to review",accent:"fac-metric-red"   },
          { label:"Active Doubts",     value:stats?.openDoubts??"–",         sub:"Student doubts",       accent:"fac-metric-blue"  },
        ].map((m,i) => (
          <div key={i} className={`fac-metric ${m.accent}`}>
            <div className="fac-metric-label">{m.label}</div>
            <div className="fac-metric-value">{m.value}</div>
            <div className="fac-metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="fac-grid-4" style={{ marginBottom:20 }}>
        {[
          { label:"Quizzes / Assessments", value:stats?.totalQuizzes??"–",      sub:"Created by you",   accent:"fac-metric-green" },
          { label:"Discussion Threads",   value:stats?.forumThreads??"–",      sub:"Active forum posts", accent:"fac-metric-navy"  },
          { label:"Live Classes",         value:stats?.upcomingClasses??"–",   sub:"Scheduled",          accent:"fac-metric-gold"  },
          { label:"Avg. Score",           value:`${stats?.avgStudentScore??0}%`,sub:"Student performance",accent:"fac-metric-blue"  },
        ].map((m,i) => (
          <div key={i} className={`fac-metric ${m.accent}`}>
            <div className="fac-metric-label">{m.label}</div>
            <div className="fac-metric-value">{m.value}</div>
            <div className="fac-metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="fac-grid-2">
        <div className="fac-card">
          <div className="fac-card-head"><span className="fac-card-title">Recent Activity</span><Activity size={14} style={{ color:T.navy }}/></div>
          <div style={{ padding:18 }}>
            {activity.length===0
              ? <p style={{ fontSize:13,color:T.subtle }}>No recent activity.</p>
              : activity.map((a,i) => (
                <div key={i} style={{ display:"flex",gap:10,padding:"9px 0",borderBottom:i<activity.length-1?`1px solid ${T.border}`:"none" }}>
                  <div style={{ width:7,height:7,borderRadius:"50%",background:T.navy,flexShrink:0,marginTop:6 }}/>
                  <div><p style={{ fontSize:13,fontWeight:600 }}>{a.title}</p><p style={{ fontSize:12,color:T.subtle }}>{a.time}</p></div>
                </div>
              ))}
          </div>
        </div>

        <div className="fac-card">
          <div className="fac-card-head"><span className="fac-card-title">Quick Actions</span><Zap size={14} style={{ color:T.gold }}/></div>
          <div style={{ padding:18,display:"flex",flexDirection:"column",gap:8 }}>
            {[
              { icon:BookOpen,   label:"Create New Course",    path:"/faculty/courses/new",      color:T.navy },
              { icon:ClipboardList, label:"Add Assessment",    path:"/faculty/assessments/new",  color:T.green },
              { icon:CalendarDays, label:"Schedule Live Class",path:"/faculty/classes/new",      color:T.gold  },
              { icon:Briefcase, label:"Post a Job / Internship",path:"/faculty/jobs/new",        color:T.blue  },
              { icon:HelpCircle,label:"Answer Student Doubts", path:"/faculty/doubts",           color:T.red   },
            ].map(({ icon:Icon, label, path, color }) => (
              <Link key={path} to={path} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 13px",background:T.bg,borderRadius:9,textDecoration:"none",border:`1px solid ${T.border}`,transition:"all .17s" }}
                onMouseEnter={e=>{ e.currentTarget.style.background=T.blueSoft; e.currentTarget.style.borderColor="#c0d0f0"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=T.bg; e.currentTarget.style.borderColor=T.border; }}>
                <div style={{ width:32,height:32,borderRadius:8,background:`${color}18`,border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <Icon size={14} style={{ color }}/>
                </div>
                <span style={{ fontSize:13,fontWeight:600,color:T.navy }}>{label}</span>
                <ChevronRight size={13} style={{ color:T.subtle,marginLeft:"auto" }}/>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MY COURSES ────────────────────────────────────────────────────────────
function FacultyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });
  const [form, setForm] = useState({ course_name:"",description:"",category:"",duration_hours:"",price:"",is_free:true,thumbnail:null });

  useEffect(() => {
    api.get("/faculty/courses").then(r => { if(r.data.success) setCourses(r.data.courses||[]); }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => { if (v!==null) fd.append(k,v); });
      const r = await api.post("/faculty/courses", fd, { headers:{"Content-Type":"multipart/form-data"} });
      if (r.data.success || r.data.course) {
        setCourses(p => [r.data.course||r.data, ...p]);
        setShowCreate(false);
        setForm({ course_name:"",description:"",category:"",duration_hours:"",price:"",is_free:true,thumbnail:null });
        setMsg({ type:"success",text:"Course created successfully!" });
        setTimeout(()=>setMsg({type:"",text:""}),3000);
      }
    } catch(e) { setMsg({ type:"error",text:e.response?.data?.message||"Error creating course." }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id,name) => {
    if (!window.confirm(`Delete course "${name}"? This cannot be undone.`)) return;
    try { await api.delete(`/faculty/courses/${id}`); setCourses(p=>p.filter(c=>c.id!==id)); }
    catch { alert("Error deleting course"); }
  };

  if (loading) return <Spinner/>;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="fac-section-title">My Courses</h2><p className="fac-section-sub">{courses.length} course{courses.length!==1?"s":""} managed</p></div>
        <button className="fac-btn-primary" onClick={()=>setShowCreate(true)}><Plus size={13}/> Create Course</button>
      </div>

      <Msg type={msg.type} text={msg.text}/>

      {showCreate && (
        <div className="fac-modal-bg">
          <div className="fac-modal" style={{ maxWidth:600 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h3 style={{ fontSize:17,fontWeight:800,color:T.navy }}>Create New Course</h3>
              <button onClick={()=>setShowCreate(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <form onSubmit={handleCreate} style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div><label className="fac-label">Course Name *</label><input className="fac-input" value={form.course_name} onChange={e=>setForm(f=>({...f,course_name:e.target.value}))} required placeholder="e.g. MBA++ Business Administration"/></div>
              <div><label className="fac-label">Description *</label><textarea className="fac-textarea" rows={4} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required placeholder="Describe what students will learn..."/></div>
              <div className="fac-grid-2" style={{ gap:12 }}>
                <div>
                  <label className="fac-label">Category</label>
                  <select className="fac-select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    <option value="">Select category</option>
                    {["Business","Finance","Marketing","HR","Operations","Strategy","Technology","Other"].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="fac-label">Duration (Hours)</label><input className="fac-input" type="number" value={form.duration_hours} onChange={e=>setForm(f=>({...f,duration_hours:e.target.value}))} placeholder="e.g. 40"/></div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                <div className={`fac-toggle-track ${form.is_free?"on":""}`} onClick={()=>setForm(f=>({...f,is_free:!f.is_free}))}><div className="fac-toggle-thumb"/></div>
                <span style={{ fontSize:14,fontWeight:600,color:T.navy }}>{form.is_free?"Free Course":"Paid Course"}</span>
              </div>
              {!form.is_free && <div><label className="fac-label">Price (₹)</label><input className="fac-input" type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="e.g. 4999"/></div>}
              <div>
                <label className="fac-label">Thumbnail Image</label>
                <div style={{ border:`1.5px dashed ${T.border}`,borderRadius:8,padding:16,textAlign:"center",background:T.bg }}>
                  <Image size={22} style={{ color:T.subtle,margin:"0 auto 6px",display:"block" }}/>
                  <p style={{ fontSize:12,color:T.muted,marginBottom:8 }}>JPG, PNG — Max 5MB</p>
                  <input type="file" id="course-thumb" accept="image/*" onChange={e=>setForm(f=>({...f,thumbnail:e.target.files[0]}))} style={{ display:"none" }}/>
                  <label htmlFor="course-thumb" className="fac-btn-ghost" style={{ cursor:"pointer",fontSize:12 }}>Choose Image</label>
                  {form.thumbnail && <p style={{ fontSize:12,color:T.green,marginTop:6,fontWeight:600 }}>✓ {form.thumbnail.name}</p>}
                </div>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="fac-btn-primary" disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?"Creating...":"Create Course"}</button>
                <button type="button" className="fac-btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {courses.length===0 ? (
        <div className="fac-card fac-empty"><BookOpen size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No courses created yet</p><button className="fac-btn-primary" onClick={()=>setShowCreate(true)} style={{ marginTop:14 }}><Plus size={13}/> Create First Course</button></div>
      ) : (
        <div className="fac-grid-courses">
          {courses.map(course => (
            <div key={course.id} className="fac-course-card">
              {course.thumbnail_url && <img src={course.thumbnail_url} alt={course.course_name} style={{ width:"100%",height:140,objectFit:"cover" }}/>}
              {!course.thumbnail_url && <div style={{ height:90,background:`linear-gradient(135deg,${T.navy},${T.navyLight})`,display:"flex",alignItems:"center",justifyContent:"center" }}><BookOpen size={32} style={{ color:"rgba(255,255,255,.3)" }}/></div>}
              <div style={{ padding:17 }}>
                <div style={{ display:"flex",gap:5,marginBottom:8,flexWrap:"wrap" }}>
                  {course.category && <span className="fac-pill fac-pill-navy" style={{ fontSize:11 }}>{course.category}</span>}
                  <span className={`fac-pill ${course.is_free||course.price==0?"fac-pill-pass":"fac-pill-gold"}`} style={{ fontSize:11 }}>{course.is_free||course.price==0?"Free":"₹"+course.price}</span>
                  <span className={`fac-pill ${course.is_published?"fac-pill-pass":"fac-pill-warn"}`} style={{ fontSize:11 }}>{course.is_published?"Live":"Draft"}</span>
                </div>
                <h3 style={{ fontSize:14,fontWeight:700,color:T.navy,marginBottom:5 }}>{course.course_name}</h3>
                <p style={{ fontSize:13,color:T.muted,marginBottom:12,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{course.description}</p>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:T.subtle,marginBottom:12 }}>
                  <span style={{ display:"flex",alignItems:"center",gap:3 }}><Users size={11}/> {course.enrollment_count||0} students</span>
                  <span style={{ display:"flex",alignItems:"center",gap:3 }}><Clock size={11}/> {course.duration_hours||"–"}h</span>
                </div>
                <div style={{ display:"flex",gap:6 }}>
                  <Link to={`/faculty/courses/${course.id}`} className="fac-btn-primary" style={{ flex:1,justifyContent:"center",fontSize:12 }}><Edit size={12}/> Manage</Link>
                  <button onClick={()=>handleDelete(course.id,course.course_name)} className="fac-btn-danger" style={{ fontSize:12,padding:"7px 11px" }}><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── COURSE DETAIL / CONTENT MANAGER ─────────────────────────────────────
function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("materials");
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });
  const [matForm, setMatForm] = useState({ title:"",description:"",type:"video",module:"",topic:"",file:null });

  useEffect(() => {
    const load = async () => {
      try {
        const [cr,mr,sr] = await Promise.allSettled([
          api.get(`/courses/${courseId}`),
          api.get(`/faculty/course-content/${courseId}`),
          api.get(`/faculty/courses/${courseId}/students`),
        ]);
        if (cr.status==="fulfilled"&&cr.value.data.success) setCourse(cr.value.data.course);
        if (mr.status==="fulfilled"&&mr.value.data.success) setMaterials(mr.value.data.content||[]);
        if (sr.status==="fulfilled"&&sr.value.data.success) setStudents(sr.value.data.students||[]);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [courseId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!matForm.file && matForm.type!=="link") { setMsg({ type:"error",text:"Please select a file." }); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      Object.entries(matForm).forEach(([k,v]) => { if(v!==null) fd.append(k,v); });
      fd.append("course_id", courseId);
      const r = await api.post("/faculty/course-content", fd, { headers:{"Content-Type":"multipart/form-data"} });
      if (r.data.success||r.data.content) {
        setMaterials(p => [...p, r.data.content||r.data]);
        setShowAddMaterial(false);
        setMatForm({ title:"",description:"",type:"video",module:"",topic:"",file:null });
        setMsg({ type:"success",text:"Material uploaded!" });
        setTimeout(()=>setMsg({type:"",text:""}),3000);
      }
    } catch(e) { setMsg({ type:"error",text:e.response?.data?.message||"Upload failed." }); }
    finally { setUploading(false); }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try { await api.delete(`/faculty/course-content/${id}`); setMaterials(p=>p.filter(m=>m.id!==id)); }
    catch { alert("Error deleting"); }
  };

  if (loading) return <Spinner/>;
  if (!course) return <div className="fac-card fac-empty"><p>Course not found</p></div>;

  const TYPE_ICON = { video:"🎥", pdf:"📄", ppt:"📊", scorm:"🔗" };

  return (
    <div>
      <button className="fac-btn-ghost" onClick={()=>navigate("/faculty/courses")} style={{ marginBottom:16 }}><ChevronLeft size={13}/> My Courses</button>

      <div style={{ background:T.navy,borderRadius:12,padding:"18px 22px",marginBottom:20,boxShadow:"0 4px 14px rgba(26,39,68,.2)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <span className={`fac-pill ${course.is_published?"fac-pill-pass":"fac-pill-warn"}`} style={{ fontSize:11,marginBottom:8,display:"inline-block" }}>{course.is_published?"Live":"Draft"}</span>
            <h2 style={{ fontSize:19,fontWeight:800,color:"#fff",marginBottom:4 }}>{course.course_name}</h2>
            <p style={{ fontSize:13,color:"rgba(255,255,255,.5)" }}>{course.category} · {course.duration_hours}h · {course.enrollment_count||0} students enrolled</p>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button className="fac-btn-gold" onClick={()=>setShowAddMaterial(true)}><Plus size={13}/> Add Content</button>
          </div>
        </div>
      </div>

      <Msg type={msg.type} text={msg.text}/>

      <div className="fac-tabs" style={{ marginBottom:16 }}>
        {[["materials","📁 Materials"],["students","👥 Students"]].map(([v,l])=>(
          <button key={v} className={`fac-tab ${tab===v?"active":""}`} onClick={()=>setTab(v)}>{l} <span style={{ fontSize:11,opacity:.7 }}>({v==="materials"?materials.length:students.length})</span></button>
        ))}
      </div>

      {tab==="materials" && (
        materials.length===0
          ? <div className="fac-card fac-empty"><FolderOpen size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No materials yet — add your first content</p></div>
          : <div className="fac-card" style={{ overflow:"hidden" }}>
              {materials.map((m,i) => (
                <div key={m.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<materials.length-1?`1px solid ${T.border}`:"none" }}>
                  <div style={{ width:36,height:36,borderRadius:8,background:T.blueSoft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0 }}>{TYPE_ICON[m.type]||"📄"}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:14,fontWeight:600,color:T.navy }}>{m.title}</p>
                    <p style={{ fontSize:12,color:T.subtle }}>{m.module&&`${m.module} · `}{m.type?.toUpperCase()}</p>
                  </div>
                  <button onClick={()=>handleDeleteMaterial(m.id)} className="fac-btn-danger" style={{ fontSize:12,padding:"5px 9px" }}><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
      )}

      {tab==="students" && (
        students.length===0
          ? <div className="fac-card fac-empty"><Users size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No students enrolled yet</p></div>
          : <div className="fac-card" style={{ overflow:"hidden" }}>
              <table className="fac-table">
                <thead><tr><th>Student</th><th>Email</th><th>Progress</th><th>Enrolled</th></tr></thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td><div style={{ display:"flex",alignItems:"center",gap:9 }}><Avatar name={s.full_name} size={30}/><span style={{ fontWeight:600 }}>{s.full_name}</span></div></td>
                      <td style={{ color:T.muted }}>{s.email}</td>
                      <td>
                        <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                          <div className="fac-bar-track" style={{ width:80 }}><div className="fac-bar-fill" style={{ width:`${s.progress_percentage||0}%`,background:T.navy }}/></div>
                          <span style={{ fontSize:12,fontWeight:700 }}>{s.progress_percentage||0}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize:12,color:T.subtle }}>{s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}

      {/* Add Material Modal */}
      {showAddMaterial && (
        <div className="fac-modal-bg">
          <div className="fac-modal" style={{ maxWidth:520 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <h3 style={{ fontSize:17,fontWeight:800,color:T.navy }}>Add Course Material</h3>
              <button onClick={()=>setShowAddMaterial(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <form onSubmit={handleUpload} style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <div><label className="fac-label">Content Type</label>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7 }}>
                  {[["video","🎥 Video"],["pdf","📄 PDF"],["ppt","📊 Slides"],["scorm","🔗 SCORM"]].map(([v,l])=>(
                    <button key={v} type="button" onClick={()=>setMatForm(f=>({...f,type:v}))}
                      style={{ padding:"8px 6px",borderRadius:7,border:`1.5px solid ${matForm.type===v?T.navy:T.border}`,background:matForm.type===v?T.navy:"transparent",color:matForm.type===v?"#fff":T.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="fac-label">Title *</label><input className="fac-input" value={matForm.title} onChange={e=>setMatForm(f=>({...f,title:e.target.value}))} required placeholder="Content title"/></div>
              <div><label className="fac-label">Description</label><textarea className="fac-textarea" rows={2} value={matForm.description} onChange={e=>setMatForm(f=>({...f,description:e.target.value}))} placeholder="Brief description..."/></div>
              <div className="fac-grid-2" style={{ gap:12 }}>
                <div><label className="fac-label">Module Name</label><input className="fac-input" value={matForm.module} onChange={e=>setMatForm(f=>({...f,module:e.target.value}))} placeholder="e.g. Module 1 — Finance"/></div>
                <div><label className="fac-label">Topic Name</label><input className="fac-input" value={matForm.topic} onChange={e=>setMatForm(f=>({...f,topic:e.target.value}))} placeholder="e.g. Introduction to P&L"/></div>
              </div>
              <div>
                <label className="fac-label">Upload File *</label>
                <div style={{ border:`1.5px dashed ${T.border}`,borderRadius:8,padding:14,textAlign:"center",background:T.bg }}>
                  <Upload size={22} style={{ color:T.subtle,margin:"0 auto 6px",display:"block" }}/>
                  <p style={{ fontSize:12,color:T.muted,marginBottom:8 }}>Video, PDF, PPT, SCORM — Max 500MB</p>
                  <input type="file" id="mat-file" accept="video/*,.pdf,.ppt,.pptx,.zip" onChange={e=>setMatForm(f=>({...f,file:e.target.files[0]}))} style={{ display:"none" }}/>
                  <label htmlFor="mat-file" className="fac-btn-primary" style={{ cursor:"pointer",fontSize:12 }}>Choose File</label>
                  {matForm.file && <p style={{ fontSize:12,color:T.green,marginTop:6,fontWeight:600 }}>✓ {matForm.file.name}</p>}
                </div>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="fac-btn-primary" disabled={uploading} style={{ flex:1,justifyContent:"center" }}>{uploading?"Uploading...":"Upload Material"}</button>
                <button type="button" className="fac-btn-ghost" onClick={()=>setShowAddMaterial(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STUDENTS ──────────────────────────────────────────────────────────────
function FacultyStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/faculty/students").then(r=>{ if(r.data.success) setStudents(r.data.students||[]); }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner/>;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="fac-section-title">My Students</h2><p className="fac-section-sub">{students.length} total students</p></div>
        <div className="fac-search-bar">
          <Search size={14} style={{ color:T.muted,flexShrink:0 }}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students..." style={{ background:"none",border:"none",outline:"none",fontSize:13,width:180 }}/>
        </div>
      </div>

      {filtered.length===0 ? (
        <div className="fac-card fac-empty"><Users size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No students found</p></div>
      ) : (
        <div className="fac-card" style={{ overflow:"hidden" }}>
          <table className="fac-table">
            <thead><tr><th>Student</th><th>Email</th><th>Courses</th><th>Avg Progress</th><th>Joined</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><div style={{ display:"flex",alignItems:"center",gap:9 }}><Avatar name={s.full_name} size={32}/><div><p style={{ fontWeight:600,fontSize:14 }}>{s.full_name}</p><p style={{ fontSize:11,color:T.subtle }}>{s.gender||"–"}</p></div></div></td>
                  <td style={{ color:T.muted,fontSize:13 }}>{s.email}</td>
                  <td><span className="fac-pill fac-pill-navy">{s.course_count||0} courses</span></td>
                  <td>
                    <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                      <div className="fac-bar-track" style={{ width:70 }}><div className="fac-bar-fill" style={{ width:`${s.avg_progress||0}%`,background:T.green }}/></div>
                      <span style={{ fontSize:12,fontWeight:700 }}>{s.avg_progress||0}%</span>
                    </div>
                  </td>
                  <td style={{ fontSize:12,color:T.subtle }}>{s.created_at ? new Date(s.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "–"}</td>
                  <td><button className="fac-btn-ghost" onClick={()=>setSelected(s)} style={{ fontSize:12 }}><Eye size={12}/> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Detail Modal */}
      {selected && (
        <div className="fac-modal-bg">
          <div className="fac-modal" style={{ maxWidth:520 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:20 }}>
              <h3 style={{ fontSize:17,fontWeight:800,color:T.navy }}>Student Profile</h3>
              <button onClick={()=>setSelected(null)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <div style={{ display:"flex",gap:16,alignItems:"flex-start",marginBottom:16 }}>
              <Avatar name={selected.full_name} size={56}/>
              <div>
                <h4 style={{ fontSize:16,fontWeight:800,color:T.navy,marginBottom:3 }}>{selected.full_name}</h4>
                <p style={{ fontSize:13,color:T.muted }}>{selected.email}</p>
                <p style={{ fontSize:12,color:T.subtle,marginTop:2 }}>{selected.phone||"No phone"} · {selected.gender||"–"}</p>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
              {[["Courses Enrolled",selected.course_count||0],["Avg Progress",`${selected.avg_progress||0}%`],["Certificates",selected.certificate_count||0],["Joined",selected.created_at?new Date(selected.created_at).toLocaleDateString("en-IN"):"–"]].map(([l,v])=>(
                <div key={l} style={{ background:T.bg,padding:"10px 13px",borderRadius:8 }}><p style={{ fontSize:11,color:T.subtle,marginBottom:2 }}>{l}</p><p style={{ fontSize:14,fontWeight:700,color:T.navy }}>{v}</p></div>
              ))}
            </div>
            <button className="fac-btn-ghost" onClick={()=>setSelected(null)} style={{ width:"100%",justifyContent:"center" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ASSIGNMENTS ───────────────────────────────────────────────────────────
function FacultyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [showGrade, setShowGrade] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });
  const [form, setForm] = useState({ title:"",description:"",course_id:"",due_date:"",total_marks:100 });
  const [gradeForm, setGradeForm] = useState({ grade:"",feedback:"" });

  useEffect(() => {
    const load = async () => {
      try {
        const [ar,cr] = await Promise.allSettled([api.get("/faculty/assignments"),api.get("/faculty/courses")]);
        if (ar.status==="fulfilled"&&ar.value.data.success) setAssignments(ar.value.data.assignments||[]);
        if (cr.status==="fulfilled"&&cr.value.data.success) setCourses(cr.value.data.courses||[]);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await api.post("/faculty/assignments", form);
      if (r.data.success||r.data.assignment) {
        setAssignments(p=>[r.data.assignment||r.data,...p]);
        setShowCreate(false); setForm({ title:"",description:"",course_id:"",due_date:"",total_marks:100 });
        setMsg({ type:"success",text:"Assignment created!" }); setTimeout(()=>setMsg({type:"",text:""}),3000);
      }
    } catch(e) { setMsg({ type:"error",text:e.response?.data?.message||"Error creating." }); }
    finally { setSaving(false); }
  };

  const handleGrade = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post(`/faculty/assignments/${selectedSub.assignment_id}/submissions/${selectedSub.id}/grade`, gradeForm);
      setAssignments(p=>p.map(a=> a.id===selectedSub.assignment_id ? {...a,submissions:(a.submissions||[]).map(s=>s.id===selectedSub.id?{...s,grade:gradeForm.grade,feedback:gradeForm.feedback,status:"graded"}:s)} : a));
      setShowGrade(false); setMsg({ type:"success",text:"Assignment graded!" }); setTimeout(()=>setMsg({type:"",text:""}),3000);
    } catch(e) { setMsg({ type:"error",text:"Error grading." }); }
    finally { setSaving(false); }
  };

  const filtered = tab==="all" ? assignments : assignments.filter(a=>a.status===tab);
  const pendingCount = assignments.flatMap(a=>a.submissions||[]).filter(s=>s.status==="submitted").length;

  if (loading) return <Spinner/>;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="fac-section-title">Assignments</h2><p className="fac-section-sub">{pendingCount} submission{pendingCount!==1?"s":""} pending review</p></div>
        <button className="fac-btn-primary" onClick={()=>setShowCreate(true)}><Plus size={13}/> Create Assignment</button>
      </div>

      <Msg type={msg.type} text={msg.text}/>

      <div className="fac-tabs" style={{ marginBottom:16 }}>
        {[["all","All"],["active","Active"],["expired","Expired"]].map(([v,l])=>(
          <button key={v} className={`fac-tab ${tab===v?"active":""}`} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fac-modal-bg">
          <div className="fac-modal">
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:18 }}>
              <h3 style={{ fontSize:17,fontWeight:800,color:T.navy }}>Create Assignment</h3>
              <button onClick={()=>setShowCreate(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <form onSubmit={handleCreate} style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <div><label className="fac-label">Course *</label>
                <select className="fac-select" value={form.course_id} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))} required>
                  <option value="">Select course</option>
                  {courses.map(c=><option key={c.id} value={c.id}>{c.course_name}</option>)}
                </select>
              </div>
              <div><label className="fac-label">Assignment Title *</label><input className="fac-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required placeholder="e.g. Case Study — FMCG Analysis"/></div>
              <div><label className="fac-label">Description / Requirements *</label><textarea className="fac-textarea" rows={5} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required placeholder="Describe what students need to submit..."/></div>
              <div className="fac-grid-2" style={{ gap:12 }}>
                <div><label className="fac-label">Due Date *</label><input type="datetime-local" className="fac-input" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} required/></div>
                <div><label className="fac-label">Total Marks</label><input className="fac-input" type="number" value={form.total_marks} onChange={e=>setForm(f=>({...f,total_marks:e.target.value}))} min={1}/></div>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="fac-btn-primary" disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?"Creating...":"Create Assignment"}</button>
                <button type="button" className="fac-btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGrade && selectedSub && (
        <div className="fac-modal-bg">
          <div className="fac-modal">
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:18 }}>
              <h3 style={{ fontSize:17,fontWeight:800,color:T.navy }}>Grade Submission</h3>
              <button onClick={()=>setShowGrade(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <div style={{ background:T.bg,borderRadius:9,padding:"12px 15px",marginBottom:16 }}>
              <p style={{ fontSize:13,fontWeight:700,color:T.navy }}>{selectedSub.student_name}</p>
              <p style={{ fontSize:12,color:T.muted }}>{selectedSub.assignment_title}</p>
              {selectedSub.notes && <p style={{ fontSize:13,color:T.text,marginTop:8 }}>{selectedSub.notes}</p>}
              {selectedSub.file_url && <a href={selectedSub.file_url} target="_blank" rel="noopener noreferrer" className="fac-btn-ghost" style={{ marginTop:8,fontSize:12 }}><Download size={12}/> View Submission</a>}
            </div>
            <form onSubmit={handleGrade} style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <div><label className="fac-label">Grade (out of {selectedSub.total_marks||100}) *</label><input className="fac-input" type="number" min={0} max={selectedSub.total_marks||100} value={gradeForm.grade} onChange={e=>setGradeForm(f=>({...f,grade:e.target.value}))} required placeholder="e.g. 85"/></div>
              <div><label className="fac-label">Feedback</label><textarea className="fac-textarea" rows={4} value={gradeForm.feedback} onChange={e=>setGradeForm(f=>({...f,feedback:e.target.value}))} placeholder="Provide detailed feedback to the student..."/></div>
              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="fac-btn-primary" disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?"Grading...":"Submit Grade"}</button>
                <button type="button" className="fac-btn-ghost" onClick={()=>setShowGrade(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length===0 ? (
        <div className="fac-card fac-empty"><FilePen size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No assignments yet</p></div>
      ) : filtered.map(assignment => {
        const subs = assignment.submissions||[];
        const pending = subs.filter(s=>s.status==="submitted").length;
        return (
          <div key={assignment.id} className="fac-card" style={{ marginBottom:12,overflow:"visible" }}>
            <div style={{ padding:"14px 17px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
              <div>
                <div style={{ display:"flex",gap:6,marginBottom:6,flexWrap:"wrap" }}>
                  <span className="fac-pill fac-pill-navy" style={{ fontSize:11 }}>{assignment.course_name||"–"}</span>
                  {pending>0 && <span className="fac-pill fac-pill-warn" style={{ fontSize:11 }}>{pending} pending</span>}
                </div>
                <h3 style={{ fontSize:15,fontWeight:700,color:T.navy,marginBottom:3 }}>{assignment.title}</h3>
                <p style={{ fontSize:13,color:T.muted }}>{assignment.description?.slice(0,100)}{assignment.description?.length>100?"...":""}</p>
              </div>
              <div style={{ textAlign:"right",flexShrink:0,marginLeft:12 }}>
                <p style={{ fontSize:11,color:T.subtle }}>Due</p>
                <p style={{ fontSize:13,fontWeight:700,color:T.navy }}>{new Date(assignment.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                <p style={{ fontSize:12,color:T.muted }}>{assignment.total_marks} marks</p>
              </div>
            </div>
            {subs.length>0 && (
              <div style={{ padding:"11px 17px" }}>
                <p style={{ fontSize:12,fontWeight:700,color:T.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em" }}>Submissions ({subs.length})</p>
                <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                  {subs.map(sub => (
                    <div key={sub.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:T.bg,borderRadius:8,border:`1px solid ${T.border}` }}>
                      <Avatar name={sub.student_name} size={28}/>
                      <div style={{ flex:1 }}><p style={{ fontSize:13,fontWeight:600 }}>{sub.student_name}</p><p style={{ fontSize:11,color:T.subtle }}>{sub.submitted_at?new Date(sub.submitted_at).toLocaleDateString():"–"}</p></div>
                      <span className={`fac-pill ${sub.status==="graded"?"fac-pill-pass":sub.status==="submitted"?"fac-pill-warn":"fac-pill-gray"}`} style={{ fontSize:11 }}>{sub.status==="graded"?`${sub.grade}/${assignment.total_marks}`:sub.status}</span>
                      {sub.status==="submitted" && (
                        <button className="fac-btn-primary" style={{ fontSize:12,padding:"6px 11px" }}
                          onClick={()=>{ setSelectedSub({...sub,assignment_id:assignment.id,assignment_title:assignment.title,total_marks:assignment.total_marks}); setGradeForm({grade:"",feedback:""}); setShowGrade(true); }}>
                          <Edit size={11}/> Grade
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ASSESSMENTS (Quizzes) ─────────────────────────────────────────────────
function FacultyAssessments() {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });
  const [form, setForm] = useState({ title:"",description:"",course_id:"",time_limit_minutes:30,pass_percentage:60,questions:[] });
  const [newQ, setNewQ] = useState({ question_text:"",option_a:"",option_b:"",option_c:"",option_d:"",correct_answer:"a",marks:1 });

  useEffect(() => {
    const load = async () => {
      try {
        const [qr,cr] = await Promise.allSettled([api.get("/faculty/quizzes"),api.get("/faculty/courses")]);
        if (qr.status==="fulfilled"&&qr.value.data.success) setQuizzes(qr.value.data.quizzes||[]);
        if (cr.status==="fulfilled"&&cr.value.data.success) setCourses(cr.value.data.courses||[]);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const addQuestion = () => {
    if (!newQ.question_text.trim()) return;
    setForm(f=>({...f,questions:[...f.questions,{...newQ,id:Date.now()}]}));
    setNewQ({ question_text:"",option_a:"",option_b:"",option_c:"",option_d:"",correct_answer:"a",marks:1 });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.questions.length===0) { setMsg({ type:"error",text:"Add at least 1 question." }); return; }
    setSaving(true);
    try {
      const r = await api.post("/faculty/quizzes", form);
      if (r.data.success||r.data.quiz) {
        setQuizzes(p=>[r.data.quiz||r.data,...p]);
        setShowCreate(false); setForm({ title:"",description:"",course_id:"",time_limit_minutes:30,pass_percentage:60,questions:[] });
        setMsg({ type:"success",text:"Assessment created!" }); setTimeout(()=>setMsg({type:"",text:""}),3000);
      }
    } catch(e) { setMsg({ type:"error",text:e.response?.data?.message||"Error creating." }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assessment?")) return;
    try { await api.delete(`/faculty/quizzes/${id}`); setQuizzes(p=>p.filter(q=>q.id!==id)); }
    catch { alert("Error deleting"); }
  };

  if (loading) return <Spinner/>;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="fac-section-title">Assessments</h2><p className="fac-section-sub">{quizzes.length} assessment{quizzes.length!==1?"s":""} created</p></div>
        <button className="fac-btn-primary" onClick={()=>setShowCreate(true)}><Plus size={13}/> Create Assessment</button>
      </div>

      <Msg type={msg.type} text={msg.text}/>

      {/* Create Modal */}
      {showCreate && (
        <div className="fac-modal-bg">
          <div className="fac-modal" style={{ maxWidth:640,maxHeight:"85vh",overflowY:"auto" }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:18 }}>
              <h3 style={{ fontSize:17,fontWeight:800,color:T.navy }}>Create Assessment</h3>
              <button onClick={()=>setShowCreate(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <form onSubmit={handleCreate} style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <div><label className="fac-label">Course *</label>
                <select className="fac-select" value={form.course_id} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))} required>
                  <option value="">Select course</option>
                  {courses.map(c=><option key={c.id} value={c.id}>{c.course_name}</option>)}
                </select>
              </div>
              <div><label className="fac-label">Assessment Title *</label><input className="fac-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required placeholder="e.g. Mid-Term Assessment — Finance"/></div>
              <div><label className="fac-label">Description</label><textarea className="fac-textarea" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Optional description..."/></div>
              <div className="fac-grid-2" style={{ gap:12 }}>
                <div><label className="fac-label">Time Limit (minutes)</label><input className="fac-input" type="number" value={form.time_limit_minutes} onChange={e=>setForm(f=>({...f,time_limit_minutes:e.target.value}))} min={1}/></div>
                <div><label className="fac-label">Pass Percentage (%)</label><input className="fac-input" type="number" value={form.pass_percentage} onChange={e=>setForm(f=>({...f,pass_percentage:e.target.value}))} min={1} max={100}/></div>
              </div>

              {/* Add Question */}
              <div style={{ background:T.bg,borderRadius:10,padding:16,border:`1px solid ${T.border}` }}>
                <p style={{ fontSize:13,fontWeight:700,color:T.navy,marginBottom:12 }}>Add Questions ({form.questions.length} added)</p>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  <div><label className="fac-label">Question *</label><textarea className="fac-textarea" rows={2} value={newQ.question_text} onChange={e=>setNewQ(q=>({...q,question_text:e.target.value}))} placeholder="Enter your question here..."/></div>
                  <div className="fac-grid-2" style={{ gap:10 }}>
                    {["a","b","c","d"].map(opt=>(
                      <div key={opt}><label className="fac-label">Option {opt.toUpperCase()}</label><input className="fac-input" value={newQ[`option_${opt}`]} onChange={e=>setNewQ(q=>({...q,[`option_${opt}`]:e.target.value}))} placeholder={`Option ${opt.toUpperCase()}`}/></div>
                    ))}
                  </div>
                  <div className="fac-grid-2" style={{ gap:10 }}>
                    <div><label className="fac-label">Correct Answer</label>
                      <select className="fac-select" value={newQ.correct_answer} onChange={e=>setNewQ(q=>({...q,correct_answer:e.target.value}))}>
                        {["a","b","c","d"].map(o=><option key={o} value={o}>Option {o.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <div><label className="fac-label">Marks</label><input className="fac-input" type="number" value={newQ.marks} onChange={e=>setNewQ(q=>({...q,marks:e.target.value}))} min={1}/></div>
                  </div>
                  <button type="button" className="fac-btn-outline" onClick={addQuestion}><PlusCircle size={13}/> Add Question</button>
                </div>
                {form.questions.length>0 && (
                  <div style={{ marginTop:12,display:"flex",flexDirection:"column",gap:6 }}>
                    {form.questions.map((q,i)=>(
                      <div key={q.id} style={{ display:"flex",alignItems:"center",gap:9,padding:"8px 12px",background:"#fff",borderRadius:7,border:`1px solid ${T.border}` }}>
                        <span style={{ fontSize:12,fontWeight:700,color:T.navy,flexShrink:0 }}>Q{i+1}.</span>
                        <span style={{ fontSize:13,flex:1,color:T.text }}>{q.question_text.slice(0,60)}{q.question_text.length>60?"...":""}</span>
                        <span style={{ fontSize:11,color:T.green,flexShrink:0 }}>✓ {q.correct_answer.toUpperCase()}</span>
                        <button type="button" onClick={()=>setForm(f=>({...f,questions:f.questions.filter((_,idx)=>idx!==i)}))} style={{ background:"none",border:"none",cursor:"pointer",color:T.red,padding:2 }}><X size={13}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="fac-btn-primary" disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?"Creating...":"Create Assessment"}</button>
                <button type="button" className="fac-btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {quizzes.length===0 ? (
        <div className="fac-card fac-empty"><ClipboardList size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No assessments yet</p><button className="fac-btn-primary" onClick={()=>setShowCreate(true)} style={{ marginTop:14 }}><Plus size={13}/> Create First Assessment</button></div>
      ) : (
        <div className="fac-card" style={{ overflow:"hidden" }}>
          <table className="fac-table">
            <thead><tr><th>Title</th><th>Course</th><th>Questions</th><th>Time</th><th>Pass %</th><th>Attempts</th><th>Action</th></tr></thead>
            <tbody>
              {quizzes.map(q => (
                <tr key={q.id}>
                  <td style={{ fontWeight:600 }}>{q.title}</td>
                  <td style={{ color:T.muted,fontSize:13 }}>{q.course_name||"–"}</td>
                  <td><span className="fac-pill fac-pill-navy">{q.question_count||0} Qs</span></td>
                  <td style={{ fontSize:13,color:T.muted }}>{q.time_limit_minutes}m</td>
                  <td><span className="fac-pill fac-pill-pass">{q.pass_percentage}%</span></td>
                  <td style={{ fontSize:13 }}>{q.attempt_count||0}</td>
                  <td>
                    <div style={{ display:"flex",gap:6 }}>
                      <button className="fac-btn-ghost" style={{ fontSize:12 }} onClick={()=>setShowEdit(q)}><Edit size={11}/></button>
                      <button className="fac-btn-danger" style={{ fontSize:12,padding:"5px 9px" }} onClick={()=>handleDelete(q.id)}><Trash2 size={11}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// ============================================================
// FACULTY DASHBOARD — Part 2
// Continues from Part 1 — paste directly after FacultyAssessments
// ============================================================

// ─── LIVE CLASSES ──────────────────────────────────────────────────────────
function FacultyClasses() {
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });
  const [tab, setTab] = useState("upcoming");
  const [form, setForm] = useState({ title:"",course_id:"",date:"",time:"",duration:60,platform:"Zoom",link:"",description:"" });

  useEffect(() => {
    const load = async () => {
      try {
        const [cr,clr] = await Promise.allSettled([api.get("/faculty/courses"),api.get("/faculty/classes")]);
        if (cr.status==="fulfilled"&&cr.value.data.success) setCourses(cr.value.data.courses||[]);
        if (clr.status==="fulfilled"&&clr.value.data.success) setClasses(clr.value.data.classes||[]);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await api.post("/faculty/classes", form);
      if (r.data.success||r.data.class||r.data.liveClass) {
        setClasses(p=>[r.data.class||r.data.liveClass||r.data,...p]);
        setShowCreate(false); setForm({ title:"",course_id:"",date:"",time:"",duration:60,platform:"Zoom",link:"",description:"" });
        setMsg({ type:"success",text:"Class scheduled!" }); setTimeout(()=>setMsg({type:"",text:""}),3000);
      }
    } catch(e) { setMsg({ type:"error",text:e.response?.data?.message||"Error scheduling." }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this class?")) return;
    try { await api.delete(`/faculty/classes/${id}`); setClasses(p=>p.filter(c=>c.id!==id)); }
    catch { alert("Error cancelling class"); }
  };

  const filtered = { live:classes.filter(c=>c.status==="live"), upcoming:classes.filter(c=>c.status==="upcoming"), completed:classes.filter(c=>c.status==="completed") };
  const platformColor = { Zoom:{ bg:"#e8f0fe",color:"#1a73e8" },"Google Meet":{ bg:"#e8f5e9",color:"#188038" } };

  if (loading) return <Spinner/>;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="fac-section-title">Live Classes</h2><p className="fac-section-sub">Schedule and manage your live sessions</p></div>
        <button className="fac-btn-primary" onClick={()=>setShowCreate(true)}><Plus size={13}/> Schedule Class</button>
      </div>

      <Msg type={msg.type} text={msg.text}/>

      {filtered.live.length>0 && (
        <div style={{ background:`linear-gradient(135deg,${T.red} 0%,#a93226 100%)`,borderRadius:12,padding:"15px 20px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:10,height:10,borderRadius:"50%",background:"#fff",boxShadow:"0 0 0 3px rgba(255,255,255,.3)" }}/>
            <div><p style={{ fontSize:12,color:"rgba(255,255,255,.7)",fontWeight:700 }}>LIVE NOW</p><p style={{ fontSize:15,fontWeight:800,color:"#fff" }}>{filtered.live[0].title}</p></div>
          </div>
          <a href={filtered.live[0].link} target="_blank" rel="noopener noreferrer" className="fac-btn-gold"><Video size={13}/> Open Class</a>
        </div>
      )}

      <div className="fac-tabs" style={{ marginBottom:16 }}>
        {[["upcoming","Upcoming"],["live","Live Now"],["completed","Completed"]].map(([v,l])=>(
          <button key={v} className={`fac-tab ${tab===v?"active":""}`} onClick={()=>setTab(v)}>
            {l} {filtered[v]?.length>0&&<span style={{ fontSize:11,opacity:.7,marginLeft:3 }}>({filtered[v].length})</span>}
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="fac-modal-bg">
          <div className="fac-modal" style={{ maxWidth:560 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:18 }}>
              <h3 style={{ fontSize:17,fontWeight:800,color:T.navy }}>Schedule Live Class</h3>
              <button onClick={()=>setShowCreate(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <form onSubmit={handleCreate} style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <div><label className="fac-label">Course *</label>
                <select className="fac-select" value={form.course_id} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))} required>
                  <option value="">Select course</option>
                  {courses.map(c=><option key={c.id} value={c.id}>{c.course_name}</option>)}
                </select>
              </div>
              <div><label className="fac-label">Class Title *</label><input className="fac-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required placeholder="e.g. Live Session — Financial Modelling"/></div>
              <div className="fac-grid-2" style={{ gap:12 }}>
                <div><label className="fac-label">Date *</label><input type="date" className="fac-input" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} required/></div>
                <div><label className="fac-label">Time *</label><input type="time" className="fac-input" value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} required/></div>
                <div><label className="fac-label">Duration (minutes)</label><input className="fac-input" type="number" value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} min={15}/></div>
                <div><label className="fac-label">Platform</label>
                  <select className="fac-select" value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
                    {["Zoom","Google Meet","Microsoft Teams","YouTube Live","Other"].map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="fac-label">Meeting Link *</label><input type="url" className="fac-input" value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} required placeholder="https://zoom.us/j/..."/></div>
              <div><label className="fac-label">Description</label><textarea className="fac-textarea" rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What will be covered in this session..."/></div>
              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="fac-btn-primary" disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?"Scheduling...":"Schedule Class"}</button>
                <button type="button" className="fac-btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(filtered[tab]||[]).length===0 ? (
        <div className="fac-card fac-empty"><CalendarDays size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No {tab} classes</p></div>
      ) : (
        <div className="fac-card" style={{ overflow:"hidden" }}>
          {(filtered[tab]||[]).map((cls,i)=>{
            const pc = platformColor[cls.platform]||{ bg:T.bg,color:T.muted };
            return (
              <div key={cls.id} style={{ display:"flex",alignItems:"center",gap:13,padding:"15px 17px",borderBottom:i<(filtered[tab]||[]).length-1?`1px solid ${T.border}`:"none" }}>
                <div style={{ width:46,height:46,borderRadius:9,background:T.bg,border:`1.5px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <span style={{ fontSize:11,fontWeight:700,color:T.navy }}>{new Date(cls.date).toLocaleDateString("en-IN",{day:"2-digit"})}</span>
                  <span style={{ fontSize:10,color:T.subtle }}>{new Date(cls.date).toLocaleDateString("en-IN",{month:"short"})}</span>
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:14,fontWeight:700,color:T.navy }}>{cls.title}</p>
                  <p style={{ fontSize:12,color:T.muted }}>{cls.time} · {cls.duration}m · <span style={{ background:pc.bg,color:pc.color,padding:"1px 6px",borderRadius:4,fontSize:11,fontWeight:700 }}>{cls.platform}</span></p>
                </div>
                <div style={{ display:"flex",gap:7,flexShrink:0 }}>
                  {cls.status!=="completed" && cls.link && <a href={cls.link} target="_blank" rel="noopener noreferrer" className="fac-btn-primary" style={{ fontSize:12,padding:"7px 12px" }}><Video size={12}/> Open</a>}
                  {cls.status!=="completed" && <button className="fac-btn-danger" style={{ fontSize:12,padding:"7px 11px" }} onClick={()=>handleDelete(cls.id)}><Trash2 size={12}/></button>}
                  {cls.status==="completed" && <span className="fac-pill fac-pill-gray">Done</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── JOBS / PLACEMENTS ─────────────────────────────────────────────────────
function FacultyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showApplicants, setShowApplicants] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ title:"",company:"",location:"",type:"full-time",description:"",skills:"",salary:"",deadline:"",applicants:0 });

  useEffect(() => {
    api.get("/faculty/jobs").then(r=>{ if(r.data.success) setJobs(r.data.jobs||[]); }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean) };
      const r = await api.post("/faculty/jobs", payload);
      if (r.data.success||r.data.job) {
        setJobs(p=>[r.data.job||r.data,...p]);
        setShowCreate(false); setForm({ title:"",company:"",location:"",type:"full-time",description:"",skills:"",salary:"",deadline:"",applicants:0 });
        setMsg({ type:"success",text:"Job posted!" }); setTimeout(()=>setMsg({type:"",text:""}),3000);
      }
    } catch(e) { setMsg({ type:"error",text:e.response?.data?.message||"Error posting." }); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job posting?")) return;
    try { await api.delete(`/faculty/jobs/${id}`); setJobs(p=>p.filter(j=>j.id!==id)); }
    catch { alert("Error deleting"); }
  };

  const filtered = jobs.filter(j=>filter==="all"||j.type===filter);
  const typeColor = { "full-time":{ bg:T.blueSoft,color:T.blue },"internship":{ bg:T.goldSoft,color:T.gold },"part-time":{ bg:T.greenSoft,color:T.green } };

  if (loading) return <Spinner/>;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="fac-section-title">Placements & Internships</h2><p className="fac-section-sub">{jobs.length} active posting{jobs.length!==1?"s":""}</p></div>
        <button className="fac-btn-primary" onClick={()=>setShowCreate(true)}><Plus size={13}/> Post Opportunity</button>
      </div>

      <Msg type={msg.type} text={msg.text}/>

      <div className="fac-tabs" style={{ marginBottom:16 }}>
        {[["all","All"],["full-time","Full-time"],["internship","Internship"],["part-time","Part-time"]].map(([v,l])=>(
          <button key={v} className={`fac-tab ${filter===v?"active":""}`} onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>

      {showCreate && (
        <div className="fac-modal-bg">
          <div className="fac-modal" style={{ maxWidth:600 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:18 }}>
              <h3 style={{ fontSize:17,fontWeight:800,color:T.navy }}>Post Opportunity</h3>
              <button onClick={()=>setShowCreate(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <form onSubmit={handleCreate} style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <div className="fac-grid-2" style={{ gap:12 }}>
                <div><label className="fac-label">Job Title *</label><input className="fac-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required placeholder="e.g. Business Analyst"/></div>
                <div><label className="fac-label">Company *</label><input className="fac-input" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} required placeholder="Company name"/></div>
                <div><label className="fac-label">Location *</label><input className="fac-input" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} required placeholder="e.g. Mumbai / Remote"/></div>
                <div><label className="fac-label">Type</label>
                  <select className="fac-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                    {["full-time","internship","part-time"].map(t=><option key={t} value={t}>{t.replace("-"," ")}</option>)}
                  </select>
                </div>
                <div><label className="fac-label">Salary / Stipend</label><input className="fac-input" value={form.salary} onChange={e=>setForm(f=>({...f,salary:e.target.value}))} placeholder="e.g. ₹8-12 LPA"/></div>
                <div><label className="fac-label">Application Deadline *</label><input type="date" className="fac-input" value={form.deadline} onChange={e=>setForm(f=>({...f,deadline:e.target.value}))} required/></div>
              </div>
              <div><label className="fac-label">Description *</label><textarea className="fac-textarea" rows={4} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required placeholder="Job responsibilities, requirements..."/></div>
              <div><label className="fac-label">Required Skills <span style={{ fontWeight:400,color:T.subtle }}>(comma separated)</span></label><input className="fac-input" value={form.skills} onChange={e=>setForm(f=>({...f,skills:e.target.value}))} placeholder="Excel, Python, Finance, Communication..."/></div>
              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="fac-btn-primary" disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?"Posting...":"Post Job"}</button>
                <button type="button" className="fac-btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length===0 ? (
        <div className="fac-card fac-empty"><Briefcase size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No job postings yet</p></div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:13 }}>
          {filtered.map(job => {
            const tc = typeColor[job.type]||typeColor["full-time"];
            const daysLeft = Math.ceil((new Date(job.deadline)-new Date())/86400000);
            return (
              <div key={job.id} style={{ background:"#fff",border:`1px solid ${T.border}`,borderRadius:12,padding:17,boxShadow:"0 1px 4px rgba(26,39,68,.05)",transition:"box-shadow .2s" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:9 }}>
                  <div>
                    <div style={{ display:"flex",gap:5,marginBottom:6 }}>
                      <span className="fac-pill" style={{ background:tc.bg,color:tc.color,fontSize:11,textTransform:"capitalize" }}>{job.type?.replace("-"," ")}</span>
                      <span style={{ fontSize:12,color:T.subtle,display:"flex",alignItems:"center",gap:2 }}><MapPin size={10}/> {job.location}</span>
                    </div>
                    <h3 style={{ fontSize:14,fontWeight:800,color:T.navy,marginBottom:2 }}>{job.title}</h3>
                    <p style={{ fontSize:13,color:T.muted,display:"flex",alignItems:"center",gap:4 }}><Building2 size={12}/> {job.company}</p>
                  </div>
                  {job.salary && <div style={{ textAlign:"right" }}><p style={{ fontSize:11,color:T.subtle }}>Salary</p><p style={{ fontSize:13,fontWeight:700,color:T.green }}>{job.salary}</p></div>}
                </div>
                <p style={{ fontSize:13,color:T.muted,marginBottom:9,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{job.description}</p>
                <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginBottom:9 }}>
                  {(job.skills||[]).slice(0,4).map(s=><span key={s} className="fac-pill fac-pill-navy" style={{ fontSize:11 }}>{s}</span>)}
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:T.subtle,marginBottom:11 }}>
                  <span style={{ display:"flex",alignItems:"center",gap:3 }}><Users size={11}/> {job.applicants||0} applicants</span>
                  <span style={{ color:daysLeft<=5?T.red:daysLeft<=10?T.gold:T.muted,fontWeight:daysLeft<=10?700:400 }}>{daysLeft>0?`${daysLeft}d left`:"Expired"}</span>
                </div>
                <div style={{ display:"flex",gap:6 }}>
                  <button className="fac-btn-ghost" style={{ flex:1,justifyContent:"center",fontSize:12 }} onClick={()=>setShowApplicants(job)}><Eye size={12}/> Applicants ({job.applicants||0})</button>
                  <button className="fac-btn-danger" style={{ fontSize:12,padding:"7px 11px" }} onClick={()=>handleDelete(job.id)}><Trash2 size={12}/></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Applicants Modal */}
      {showApplicants && (
        <div className="fac-modal-bg">
          <div className="fac-modal" style={{ maxWidth:560 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:18 }}>
              <div><h3 style={{ fontSize:17,fontWeight:800,color:T.navy }}>{showApplicants.title}</h3><p style={{ fontSize:12,color:T.muted }}>{showApplicants.company}</p></div>
              <button onClick={()=>setShowApplicants(null)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            {(showApplicants.applications||[]).length===0 ? (
              <div style={{ textAlign:"center",padding:"32px 0",color:T.subtle }}>No applicants yet</div>
            ) : (showApplicants.applications||[]).map((a,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 13px",background:T.bg,borderRadius:8,marginBottom:7 }}>
                <Avatar name={a.student_name} size={34}/>
                <div style={{ flex:1 }}><p style={{ fontSize:13,fontWeight:600 }}>{a.student_name}</p><p style={{ fontSize:11,color:T.subtle }}>{a.applied_at?new Date(a.applied_at).toLocaleDateString():""}</p></div>
                {a.resume_url && <a href={a.resume_url} target="_blank" rel="noopener noreferrer" className="fac-btn-ghost" style={{ fontSize:12 }}><Download size={12}/> Resume</a>}
              </div>
            ))}
            <button className="fac-btn-ghost" onClick={()=>setShowApplicants(null)} style={{ width:"100%",justifyContent:"center",marginTop:10 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DISCUSSION FORUM ──────────────────────────────────────────────────────
function FacultyForum() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.get("/forum/threads?type=discussion").then(r=>{
      if(r.data.success) setThreads((r.data.threads||[]).filter(t=>!t.type||t.type==="discussion"));
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = filter==="all" ? threads : threads.filter(t=>filter==="answered"?(t.hasAnswer||t.has_answer):!(t.hasAnswer||t.has_answer));

  if (loading) return <Spinner/>;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="fac-section-title">Discussion Forum</h2><p className="fac-section-sub">Engage with student discussions</p></div>
        <div className="fac-tabs">
          {[["all","All"],["unanswered","Unanswered"],["answered","Answered"]].map(([v,l])=>(
            <button key={v} className={`fac-tab ${filter===v?"active":""}`} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      {filtered.length===0 ? (
        <div className="fac-card fac-empty"><MessageSquare size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No discussion threads</p></div>
      ) : filtered.map(thread=>(
        <div key={thread.id} className="fac-thread-row" onClick={()=>navigate(`/faculty/forum/thread/${thread.id}`)} style={{ cursor:"pointer" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap" }}>
                <span style={{ fontSize:15 }}>💬</span>
                <span style={{ fontSize:14,fontWeight:700,color:T.navy }}>{thread.title}</span>
                {thread.topic && <span className="fac-pill fac-pill-navy" style={{ fontSize:11 }}>{thread.topic}</span>}
                {(thread.hasAnswer||thread.has_answer) && <span className="fac-pill fac-pill-pass" style={{ fontSize:11,display:"inline-flex",alignItems:"center",gap:3 }}><CheckCircle size={10}/> Answered</span>}
              </div>
              <div style={{ display:"flex",gap:13,fontSize:12,color:T.subtle }}>
                <span style={{ display:"flex",alignItems:"center",gap:3 }}><User size={11}/> {thread.author}</span>
                <span style={{ display:"flex",alignItems:"center",gap:3 }}><BookOpen size={11}/> {thread.course}</span>
                <span style={{ display:"flex",alignItems:"center",gap:3 }}><Calendar size={11}/> {new Date(thread.created||thread.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div style={{ display:"flex",gap:7,fontSize:12,color:T.subtle,alignItems:"center" }}>
              <span style={{ display:"flex",alignItems:"center",gap:3 }}><MessageSquare size={11}/> {thread.replies||thread.replyCount||0}</span>
              <ChevronRight size={13}/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DOUBTS (Faculty View — Answer Student Doubts) ─────────────────────────
function FacultyDoubts() {
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [markBest, setMarkBest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });

  useEffect(() => {
    api.get("/faculty/doubts").then(r=>{
      if(r.data.success) setDoubts(r.data.doubts||[]);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const openDoubt = async (doubt) => {
    setSelected(doubt); setReplies([]); setReplyText(""); setMarkBest(false); setLoadingReplies(true);
    try {
      const r = await api.get(`/forum/threads/${doubt.id}`);
      if(r.data.success) setReplies(r.data.thread?.replies||r.data.replies||[]);
    } catch {}
    finally { setLoadingReplies(false); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/forum/threads/${selected.id}/replies`, { content:replyText, is_answer:markBest });
      if(r.data.success) {
        setReplies(p=>[...p,r.data.reply||{ content:replyText,author_name:"You (Faculty)",is_faculty:true,created_at:new Date().toISOString(),is_answer:markBest }]);
        if(markBest) {
          setDoubts(p=>p.map(d=>d.id===selected.id?{...d,hasAnswer:true,has_answer:true}:d));
          setSelected(s=>({...s,hasAnswer:true}));
        }
        setReplyText(""); setMarkBest(false);
        setMsg({ type:"success",text:"Reply posted!" }); setTimeout(()=>setMsg({type:"",text:""}),3000);
      }
    } catch { setMsg({ type:"error",text:"Failed to post reply." }); }
    finally { setSubmitting(false); }
  };

  const filtered = doubts.filter(d=>{
    if(filter==="pending") return !(d.hasAnswer||d.has_answer);
    if(filter==="answered") return d.hasAnswer||d.has_answer;
    return true;
  });

  const counts = { all:doubts.length, pending:doubts.filter(d=>!(d.hasAnswer||d.has_answer)).length, answered:doubts.filter(d=>d.hasAnswer||d.has_answer).length };

  if (loading) return <Spinner/>;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="fac-section-title">Student Doubts</h2><p className="fac-section-sub">{counts.pending} pending answer{counts.pending!==1?"s":""}</p></div>
      </div>

      <div className="fac-grid-3" style={{ marginBottom:16 }}>
        {[{ label:"Total Doubts",value:counts.all,accent:"fac-metric-navy" },{ label:"Pending",value:counts.pending,accent:"fac-metric-red" },{ label:"Answered",value:counts.answered,accent:"fac-metric-green" }].map(m=>(
          <div key={m.label} className={`fac-metric ${m.accent}`}><div className="fac-metric-label">{m.label}</div><div className="fac-metric-value">{m.value}</div></div>
        ))}
      </div>

      <div className="fac-tabs" style={{ marginBottom:16 }}>
        {[["pending","Pending"],["answered","Answered"],["all","All"]].map(([v,l])=>(
          <button key={v} className={`fac-tab ${filter===v?"active":""}`} onClick={()=>setFilter(v)}>{l} ({counts[v]})</button>
        ))}
      </div>

      <div className="fac-grid-2">
        {/* Doubts list */}
        <div>
          {filtered.length===0 ? (
            <div className="fac-card fac-empty"><FileQuestion size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No {filter} doubts</p></div>
          ) : filtered.map(doubt=>{
            const isAnswered = doubt.hasAnswer||doubt.has_answer;
            const isSelected = selected?.id===doubt.id;
            return (
              <div key={doubt.id} className="fac-doubt-card" style={{ borderLeft:`3px solid ${isSelected?T.navy:isAnswered?T.green:T.gold}`,cursor:"pointer",background:isSelected?T.blueSoft:"#fff" }}
                onClick={()=>openDoubt(doubt)}>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:6 }}>
                  <span className={`fac-pill ${isAnswered?"fac-pill-pass":"fac-pill-warn"}`} style={{ fontSize:11 }}>{isAnswered?"✓ Answered":"⏳ Pending"}</span>
                  {doubt.category && <span className="fac-pill fac-pill-navy" style={{ fontSize:11 }}>{doubt.category}</span>}
                  {doubt.course && <span className="fac-pill fac-pill-gold" style={{ fontSize:11 }}>{doubt.course}</span>}
                  {(doubt.document_url||doubt.attachment_url) && <span className="fac-pill" style={{ fontSize:11,background:"#f0f4ff",color:T.navy,display:"inline-flex",alignItems:"center",gap:3 }}><Paperclip size={9}/> Doc</span>}
                </div>
                <h3 style={{ fontSize:14,fontWeight:700,color:T.navy,marginBottom:3 }}>{doubt.title}</h3>
                <p style={{ fontSize:13,color:T.muted,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",marginBottom:6 }}>{doubt.content}</p>
                <div style={{ display:"flex",gap:10,fontSize:12,color:T.subtle }}>
                  <span style={{ display:"flex",alignItems:"center",gap:3 }}><User size={10}/> {doubt.author||doubt.author_name}</span>
                  <span style={{ display:"flex",alignItems:"center",gap:3 }}><MessageSquare size={10}/> {doubt.replies||doubt.replyCount||0}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply panel */}
        <div>
          {!selected ? (
            <div className="fac-card fac-empty" style={{ height:280 }}><MessageSquare size={28} style={{ color:T.border,margin:"0 auto 8px" }}/><p style={{ fontSize:13 }}>Select a doubt to answer</p></div>
          ) : (
            <div className="fac-card">
              {/* Doubt detail */}
              <div style={{ padding:"14px 17px",borderBottom:`1px solid ${T.border}`,background:T.bg }}>
                <div style={{ display:"flex",gap:6,marginBottom:7,flexWrap:"wrap" }}>
                  {selected.category && <span className="fac-pill fac-pill-navy" style={{ fontSize:11 }}>{selected.category}</span>}
                  {selected.course && <span className="fac-pill fac-pill-gold" style={{ fontSize:11 }}>{selected.course}</span>}
                </div>
                <h3 style={{ fontSize:15,fontWeight:700,color:T.navy,marginBottom:5 }}>{selected.title}</h3>
                <p style={{ fontSize:13,color:T.text,lineHeight:1.65 }}>{selected.content}</p>
                {(selected.document_url||selected.attachment_url) && (
                  <a href={selected.document_url||selected.attachment_url} target="_blank" rel="noopener noreferrer" className="fac-btn-ghost" style={{ marginTop:9,fontSize:12 }}><Paperclip size={12}/> View Attached Document</a>
                )}
              </div>

              {/* Replies */}
              <div style={{ padding:14,maxHeight:220,overflowY:"auto" }}>
                {loadingReplies ? <div style={{ textAlign:"center",padding:16 }}><div className="fac-spinner" style={{ margin:"0 auto" }}/></div>
                  : replies.length===0 ? <p style={{ fontSize:13,color:T.subtle,textAlign:"center",padding:14 }}>No replies yet — be the first to answer!</p>
                  : replies.map((r,i)=>{
                    const isFaculty = r.role==="faculty"||r.author_role==="faculty"||r.is_faculty;
                    return (
                      <div key={r.id||i} style={{ marginBottom:10,padding:"10px 12px",borderRadius:8,background:r.is_answer?T.greenSoft:isFaculty?T.goldSoft:T.bg,border:`1px solid ${r.is_answer?T.green:isFaculty?T.goldBorder:T.border}` }}>
                        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:5 }}>
                          <div style={{ width:24,height:24,borderRadius:"50%",background:isFaculty?T.gold:T.navy,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:800,flexShrink:0 }}>{(r.author_name||"?").charAt(0).toUpperCase()}</div>
                          <span style={{ fontSize:13,fontWeight:700,color:T.navy }}>{r.author_name||r.author}</span>
                          {isFaculty && <span className="fac-pill" style={{ fontSize:10,background:T.gold,color:"#fff" }}>FACULTY</span>}
                          {r.is_answer && <span className="fac-pill fac-pill-pass" style={{ fontSize:10,display:"inline-flex",alignItems:"center",gap:3 }}><CheckCircle size={9}/> Best Answer</span>}
                        </div>
                        <p style={{ fontSize:13,color:T.text,lineHeight:1.6 }}>{r.content}</p>
                      </div>
                    );
                  })}
              </div>

              {/* Reply form */}
              <div style={{ padding:"13px 17px",borderTop:`1px solid ${T.border}` }}>
                <Msg type={msg.type} text={msg.text}/>
                <form onSubmit={handleReply} style={{ display:"flex",flexDirection:"column",gap:9 }}>
                  <textarea className="fac-textarea" rows={3} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Type your answer for the student..." required/>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:5 }}>
                    <div className={`fac-toggle-track ${markBest?"on":""}`} onClick={()=>setMarkBest(v=>!v)}><div className="fac-toggle-thumb"/></div>
                    <span style={{ fontSize:13,fontWeight:600,color:T.navy }}>Mark as Best Answer</span>
                  </div>
                  <div style={{ display:"flex",gap:7 }}>
                    <button type="submit" className="fac-btn-primary" disabled={submitting||!replyText.trim()} style={{ flex:1,justifyContent:"center" }}><Send size={13}/> {submitting?"Posting...":"Post Answer"}</button>
                    <button type="button" className="fac-btn-ghost" onClick={()=>setReplyText("")}>Clear</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── THREAD DETAIL ─────────────────────────────────────────────────────────
function FacultyThreadDetail() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });

  const load = async () => {
    try { const r = await api.get(`/forum/threads/${threadId}`); if(r.data.success){ setThread(r.data.thread); setReplies(r.data.thread?.replies||r.data.replies||[]); } }
    catch { setMsg({ type:"error",text:"Could not load thread." }); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[threadId]);

  const handleReply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await api.post(`/forum/threads/${threadId}/replies`, { content:replyText });
      if(r.data.success){ setReplyText(""); await load(); }
    } catch { setMsg({ type:"error",text:"Failed to post." }); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Spinner/>;

  return (
    <div style={{ maxWidth:760 }}>
      <button className="fac-btn-ghost" style={{ marginBottom:16 }} onClick={()=>navigate("/faculty/forum")}><ChevronLeft size={13}/> Back to Forum</button>
      <Msg type={msg.type} text={msg.text}/>
      {!thread ? <div className="fac-card fac-empty"><p>Thread not found</p></div> : (
        <>
          <div className="fac-card" style={{ marginBottom:14,padding:20 }}>
            <div style={{ display:"flex",gap:7,marginBottom:9,flexWrap:"wrap" }}>
              {thread.topic && <span className="fac-pill fac-pill-navy" style={{ fontSize:11 }}>{thread.topic}</span>}
              {thread.course && <span className="fac-pill fac-pill-gold" style={{ fontSize:11 }}>{thread.course}</span>}
            </div>
            <h2 style={{ fontSize:19,fontWeight:800,color:T.navy,marginBottom:7 }}>{thread.title}</h2>
            <p style={{ fontSize:14,color:T.text,lineHeight:1.7,background:T.bg,padding:"11px 13px",borderRadius:8 }}>{thread.content}</p>
            <div style={{ display:"flex",gap:13,fontSize:12,color:T.subtle,marginTop:10 }}>
              <span><User size={11}/> {thread.author||thread.author_name}</span>
              <span><MessageSquare size={11}/> {replies.length} replies</span>
            </div>
          </div>
          {replies.map((r,i)=>{
            const isFaculty = r.role==="faculty"||r.is_faculty;
            return (
              <div key={r.id||i} style={{ border:`1px solid ${isFaculty?T.gold:T.border}`,borderLeft:`3px solid ${r.is_answer?T.green:isFaculty?T.gold:T.border}`,borderRadius:10,padding:16,marginBottom:9,background:r.is_answer?T.greenSoft:isFaculty?T.goldSoft:"#fff" }}>
                <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:7 }}>
                  <div style={{ width:32,height:32,borderRadius:"50%",background:isFaculty?T.gold:T.navy,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13,flexShrink:0 }}>{(r.author_name||"?").charAt(0).toUpperCase()}</div>
                  <div>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                      <span style={{ fontSize:14,fontWeight:700,color:T.navy }}>{r.author_name||r.author}</span>
                      {isFaculty && <span className="fac-pill" style={{ fontSize:10,background:T.gold,color:"#fff" }}>FACULTY</span>}
                      {r.is_answer && <span className="fac-pill fac-pill-pass" style={{ fontSize:10,display:"inline-flex",alignItems:"center",gap:3 }}><CheckCircle size={9}/> Best Answer</span>}
                    </div>
                    <span style={{ fontSize:11,color:T.subtle }}>{r.created_at?new Date(r.created_at).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):""}</span>
                  </div>
                </div>
                <p style={{ fontSize:13,color:T.text,lineHeight:1.65 }}>{r.content}</p>
              </div>
            );
          })}
          <div className="fac-card" style={{ padding:18,borderLeft:`3px solid ${T.navy}` }}>
            <h4 style={{ fontSize:14,fontWeight:700,color:T.navy,marginBottom:11 }}>Post a Reply</h4>
            <form onSubmit={handleReply} style={{ display:"flex",flexDirection:"column",gap:9 }}>
              <textarea className="fac-textarea" rows={4} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Write your reply..." required/>
              <div style={{ display:"flex",gap:7 }}>
                <button type="submit" className="fac-btn-primary" disabled={submitting||!replyText.trim()}><Send size={13}/> {submitting?"Posting...":"Post Reply"}</button>
                <button type="button" className="fac-btn-ghost" onClick={()=>setReplyText("")}>Clear</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
function FacultyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });
  const [form, setForm] = useState({ title:"",message:"",type:"announcement",course_id:"",send_to:"all" });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [nr,cr] = await Promise.allSettled([api.get("/notifications"),api.get("/faculty/courses")]);
        if(nr.status==="fulfilled"&&nr.value.data.success) setNotifications(nr.value.data.notifications||[]);
        if(cr.status==="fulfilled"&&cr.value.data.success) setCourses(cr.value.data.courses||[]);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await api.post("/faculty/notifications/send", form);
      if(r.data.success) {
        setShowCreate(false); setForm({ title:"",message:"",type:"announcement",course_id:"",send_to:"all" });
        setMsg({ type:"success",text:"Notification sent!" }); setTimeout(()=>setMsg({type:"",text:""}),3000);
      }
    } catch(e) { setMsg({ type:"error",text:e.response?.data?.message||"Error sending." }); }
    finally { setSaving(false); }
  };

  const typeAccent = { assignment:T.navy,exam:T.gold,announcement:T.green,info:T.blue };
  const filtered = filter==="all" ? notifications : notifications.filter(n=>n.type===filter);

  if (loading) return <Spinner/>;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="fac-section-title">Notifications</h2><p className="fac-section-sub">Send announcements to your students</p></div>
        <button className="fac-btn-primary" onClick={()=>setShowCreate(true)}><Send size={13}/> Send Notification</button>
      </div>

      <Msg type={msg.type} text={msg.text}/>

      <div className="fac-tabs" style={{ marginBottom:16 }}>
        {["all","announcement","assignment","exam"].map(f=>(
          <button key={f} className={`fac-tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)} style={{ textTransform:"capitalize" }}>{f}</button>
        ))}
      </div>

      {showCreate && (
        <div className="fac-modal-bg">
          <div className="fac-modal">
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:18 }}>
              <h3 style={{ fontSize:17,fontWeight:800,color:T.navy }}>Send Notification</h3>
              <button onClick={()=>setShowCreate(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <form onSubmit={handleSend} style={{ display:"flex",flexDirection:"column",gap:13 }}>
              <div className="fac-grid-2" style={{ gap:12 }}>
                <div><label className="fac-label">Type</label>
                  <select className="fac-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                    {["announcement","assignment","exam","info"].map(t=><option key={t} value={t} style={{ textTransform:"capitalize" }}>{t}</option>)}
                  </select>
                </div>
                <div><label className="fac-label">Send To</label>
                  <select className="fac-select" value={form.send_to} onChange={e=>setForm(f=>({...f,send_to:e.target.value}))}>
                    <option value="all">All My Students</option>
                    {courses.map(c=><option key={c.id} value={`course_${c.id}`}>{c.course_name}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="fac-label">Title *</label><input className="fac-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required placeholder="Notification title"/></div>
              <div><label className="fac-label">Message</label><textarea className="fac-textarea" rows={4} value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="Detailed message (optional)..."/></div>
              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="fac-btn-primary" disabled={saving} style={{ flex:1,justifyContent:"center" }}>{saving?"Sending...":"Send Notification"}</button>
                <button type="button" className="fac-btn-ghost" onClick={()=>setShowCreate(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length===0 ? (
        <div className="fac-card fac-empty"><Bell size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No notifications</p></div>
      ) : filtered.map(n=>{
        const accent = typeAccent[n.type]||T.subtle;
        const isRead = n.is_read??n.read??false;
        const msg2 = n.message||n.body||n.content||"";
        return (
          <div key={n.id} style={{ background:"#fff",border:`1px solid ${T.border}`,borderLeft:`3px solid ${isRead?T.border:accent}`,borderRadius:10,padding:"13px 17px",display:"flex",gap:13,marginBottom:8,opacity:isRead?.85:1 }}>
            <div style={{ width:36,height:36,borderRadius:"50%",background:`${accent}18`,border:`1.5px solid ${accent}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2 }}>
              <Bell size={15} style={{ color:accent }}/>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                <span style={{ fontSize:14,fontWeight:isRead?600:700,color:T.navy }}>{n.title}</span>
                {!isRead && <span style={{ width:7,height:7,borderRadius:"50%",background:accent,flexShrink:0,marginTop:6 }}/>}
              </div>
              {msg2&&<p style={{ fontSize:13,color:T.muted }}>{msg2}</p>}
              <span className="fac-pill" style={{ fontSize:11,background:`${accent}12`,color:accent,marginTop:5,display:"inline-block",textTransform:"capitalize" }}>{n.type||"info"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── PROFILE ───────────────────────────────────────────────────────────────
function FacultyProfile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });
  const [stats, setStats] = useState(null);

  // ── State per tab ──────────────────────────────────────────
  const [personalInfo, setPersonalInfo] = useState({
    full_name:"", email:"", phone_number:"", date_of_birth:"",
    gender:"", bio:"", profile_photo:null,
  });
  const [professionalInfo, setProfessionalInfo] = useState({
    designation:"", department:"", employee_id:"", joining_date:"",
    qualification:"", specialization:"", experience_years:"",
  });
  const [contactInfo, setContactInfo] = useState({
    address_line1:"", address_line2:"", city:"", state:"",
    country:"", postal_code:"",
    emergency_contact_name:"", emergency_contact_phone:"",
  });
  const [additionalInfo, setAdditionalInfo] = useState({
    // Education
    edu_degree:"", edu_institution:"", edu_year:"", edu_grade:"",
    // Certifications
    certifications:"",
    // Languages
    languages_known:"",
    // Skills
    skills:"",
    // Achievements / Awards
    achievements:"",
    // Research / Publications
    publications:"",
  });
  const [socialLinks, setSocialLinks] = useState({
    linkedin:"", github:"", twitter:"", website:"",
  });
  const [bankInfo, setBankInfo] = useState({
    account_holder_name:"", bank_name:"", account_number:"",
    confirm_account_number:"", ifsc_code:"", branch_name:"",
    account_type:"savings", pan_number:"", uan_number:"",
  });
  const [security, setSecurity] = useState({
    current_password:"", new_password:"", confirm_password:"",
  });
  const [showPwd, setShowPwd] = useState({ current:false, new:false, confirm:false });
  const [showAccNum, setShowAccNum] = useState(false);

  // ── Load profile ───────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get("/faculty/profile");
        if (r.data.success && r.data.profile) {
          const p = r.data.profile;
          setPersonalInfo({ full_name:p.full_name||user?.full_name||"", email:p.email||user?.email||"", phone_number:p.phone_number||p.phone||"", date_of_birth:p.date_of_birth||"", gender:p.gender||"", bio:p.bio||"", profile_photo:p.profile_photo||user?.profile_photo||null });
          setProfessionalInfo({ designation:p.designation||"", department:p.department||"", employee_id:p.employee_id||"", joining_date:p.joining_date||"", qualification:p.qualification||"", specialization:p.specialization||"", experience_years:p.experience_years||"" });
          setContactInfo({ address_line1:p.address_line1||"", address_line2:p.address_line2||"", city:p.city||"", state:p.state||"", country:p.country||"", postal_code:p.postal_code||"", emergency_contact_name:p.emergency_contact_name||"", emergency_contact_phone:p.emergency_contact_phone||"" });
          setAdditionalInfo({ edu_degree:p.edu_degree||"", edu_institution:p.edu_institution||"", edu_year:p.edu_year||"", edu_grade:p.edu_grade||"", certifications:p.certifications||"", languages_known:p.languages_known||"", skills:p.skills||"", achievements:p.achievements||"", publications:p.publications||"" });
          setSocialLinks({ linkedin:p.linkedin||"", github:p.github||"", twitter:p.twitter||"", website:p.website||"" });
          setBankInfo({ account_holder_name:p.account_holder_name||"", bank_name:p.bank_name||"", account_number:"", confirm_account_number:"", ifsc_code:p.ifsc_code||"", branch_name:p.branch_name||"", account_type:p.account_type||"savings", pan_number:p.pan_number||"", uan_number:p.uan_number||"" });
        } else {
          setPersonalInfo(p=>({...p, full_name:user?.full_name||"", email:user?.email||"", profile_photo:user?.profile_photo||null }));
        }
      } catch { setPersonalInfo(p=>({...p, full_name:user?.full_name||"", email:user?.email||"", profile_photo:user?.profile_photo||null })); }
    };
    load();
    api.get("/faculty/dashboard/stats").then(r=>{ if(r.data.success) setStats(r.data.stats||{}); }).catch(()=>{});
  }, []);

  const showMsg = (type,text) => { setMsg({type,text}); setTimeout(()=>setMsg({type:"",text:""}),4000); };

  // ── Photo upload ───────────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 5*1024*1024) { showMsg("error","Image must be under 5MB"); return; }
    if (!file.type.startsWith("image/")) { showMsg("error","Please upload a JPG, PNG or WebP image"); return; }
    // Instant preview (optimistic UI)
    const reader = new FileReader();
    reader.onloadend = () => setPersonalInfo(p=>({...p, profile_photo:reader.result}));
    reader.readAsDataURL(file);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("profile_photo", file); // must match multer field name on backend
      const r = await api.post("/faculty/profile/photo", fd, {
        headers:{"Content-Type":"multipart/form-data"},
        timeout: 30000,
      });
      if (r.data.success) {
        if (updateUser) updateUser({ profile_photo: r.data.photo_url });
        showMsg("success","Profile photo updated successfully!");
      } else {
        throw new Error(r.data.message || "Upload failed");
      }
    } catch (err) {
      // Revert preview on error
      setPersonalInfo(p=>({...p, profile_photo: user?.profile_photo||null }));
      const status  = err.response?.status;
      const message = err.response?.data?.message || err.message || "Upload failed";
      if      (status === 500) showMsg("error","Server error — check backend logs. Ensure multer is installed and /uploads folder exists.");
      else if (status === 413) showMsg("error","File too large — max 5MB allowed.");
      else if (status === 401 || status === 403) showMsg("error","Session expired — please log in again.");
      else if (status === 400) showMsg("error", message);
      else                     showMsg("error", message);
      console.error("Photo upload error:", status, message);
    } finally {
      setUploading(false);
      e.target.value = ""; // reset input so same file can retry
    }
  };

  // ── Save helpers ───────────────────────────────────────────
  const doSave = async (fn) => {
    setSaving(true);
    try { await fn(); }
    catch(e) { showMsg("error", e.response?.data?.message||e.message||"Error saving"); }
    finally { setSaving(false); }
  };

  const savePersonal = () => doSave(async () => {
    if (!personalInfo.full_name.trim()) throw new Error("Full name is required");
    const r = await api.put("/faculty/profile/personal", personalInfo);
    if (!r.data.success && !r.data.profile) throw new Error(r.data.message||"Update failed");
    if (updateUser) updateUser({ full_name:personalInfo.full_name, phone_number:personalInfo.phone_number });
    showMsg("success","Personal info saved!");
  });

  const saveProfessional = () => doSave(async () => {
    const r = await api.put("/faculty/profile/professional", professionalInfo);
    if (!r.data.success && !r.data.profile) throw new Error(r.data.message||"Update failed");
    if (updateUser) updateUser(professionalInfo);
    showMsg("success","Professional info saved!");
  });

  const saveContact = () => doSave(async () => {
    const r = await api.put("/faculty/profile/contact", contactInfo);
    if (!r.data.success && !r.data.profile) throw new Error(r.data.message||"Update failed");
    showMsg("success","Contact info saved!");
  });

  const saveAdditional = () => doSave(async () => {
    const r = await api.put("/faculty/profile/additional", additionalInfo);
    if (!r.data.success && !r.data.profile) throw new Error(r.data.message||"Update failed");
    showMsg("success","Additional info saved!");
  });

  const saveSocial = () => doSave(async () => {
    const r = await api.put("/faculty/profile/social", socialLinks);
    if (!r.data.success && !r.data.profile) throw new Error(r.data.message||"Update failed");
    showMsg("success","Social links saved!");
  });

  const saveBank = () => doSave(async () => {
    if (!bankInfo.account_holder_name.trim()) throw new Error("Account holder name is required");
    if (!bankInfo.account_number.trim()) throw new Error("Account number is required");
    if (bankInfo.account_number !== bankInfo.confirm_account_number) throw new Error("Account numbers do not match");
    if (!bankInfo.ifsc_code.trim()) throw new Error("IFSC code is required");
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankInfo.ifsc_code.toUpperCase())) throw new Error("Invalid IFSC code format (e.g. SBIN0001234)");
    const payload = { ...bankInfo }; delete payload.confirm_account_number;
    const r = await api.put("/faculty/profile/bank", payload);
    if (!r.data.success && !r.data.profile) throw new Error(r.data.message||"Update failed");
    showMsg("success","Bank details saved securely!");
  });

  const saveSecurity = () => doSave(async () => {
    if (!security.current_password || !security.new_password || !security.confirm_password) throw new Error("All password fields are required");
    if (security.new_password.length < 6) throw new Error("New password must be at least 6 characters");
    if (security.new_password !== security.confirm_password) throw new Error("New passwords do not match");
    if (security.current_password === security.new_password) throw new Error("New password must be different");
    if (!/[A-Z]/.test(security.new_password)||!/[a-z]/.test(security.new_password)||!/[0-9]/.test(security.new_password)) throw new Error("Password must include uppercase, lowercase and numbers");
    await api.post("/auth/change-password", { current_password:security.current_password, new_password:security.new_password });
    showMsg("success","Password changed!");
    setSecurity({ current_password:"", new_password:"", confirm_password:"" });
  });

  // ── Tabs ───────────────────────────────────────────────────
  const tabs = [
    { id:"personal",     label:"Personal",       icon:User      },
    { id:"professional", label:"Professional",   icon:Briefcase },
    { id:"contact",      label:"Contact",        icon:MapPin    },
    { id:"additional",   label:"Additional Info",icon:Star      },
    { id:"social",       label:"Social Links",   icon:Globe     },
    { id:"bank",         label:"Bank Details",   icon:DollarSign},
    { id:"security",     label:"Security",       icon:Shield    },
  ];

  const SectionHead = ({ title, sub }) => (
    <div style={{ marginBottom:18 }}>
      <h3 style={{ fontSize:15,fontWeight:800,color:T.navy,marginBottom:3 }}>{title}</h3>
      {sub && <p style={{ fontSize:13,color:T.subtle }}>{sub}</p>}
    </div>
  );

  const Field = ({ label, required, children }) => (
    <div>
      <label className="fac-label">{label}{required&&<span style={{ color:T.red }}> *</span>}</label>
      {children}
    </div>
  );

  const SaveBtn = ({ onClick, label="Save Changes" }) => (
    <button className="fac-btn-primary" onClick={onClick} disabled={saving} style={{ minWidth:160 }}>
      {saving ? <><Loader size={13} style={{ animation:"fac-spin .7s linear infinite" }}/> Saving...</> : <><Save size={13}/> {label}</>}
    </button>
  );

  return (
    <div>
      {/* ── Profile Banner ── */}
      <div style={{ background:`linear-gradient(135deg,${T.navy} 0%,${T.navyLight} 100%)`,borderRadius:14,padding:"22px 26px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,boxShadow:"0 4px 18px rgba(26,39,68,.2)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:18 }}>
          {/* Photo */}
          <div style={{ position:"relative",flexShrink:0 }}>
            <div style={{ width:80,height:80,borderRadius:"50%",border:"3px solid rgba(184,150,11,.55)",overflow:"hidden",background:T.navyLight,display:"flex",alignItems:"center",justifyContent:"center" }}>
              {personalInfo.profile_photo
  ? <img src={personalInfo.profile_photo} alt="Profile" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
  : <span style={{ fontSize:30,fontWeight:800,color:"#fff" }}>{(personalInfo.full_name||user?.full_name||"F").charAt(0).toUpperCase()}</span>}
              {uploading && <div style={{ position:"absolute",inset:0,background:"rgba(26,39,68,.6)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%" }}><Loader size={20} style={{ color:"#fff",animation:"fac-spin .7s linear infinite" }}/></div>}
            </div>
            <label htmlFor="fac-photo-upload" style={{ position:"absolute",bottom:2,right:2,width:26,height:26,background:"#fff",border:`2px solid ${T.border}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:uploading?"not-allowed":"pointer",boxShadow:"0 2px 6px rgba(0,0,0,.12)" }}>
              <Camera size={12} style={{ color:T.navy }}/>
            </label>
            <input id="fac-photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} style={{ display:"none" }}/>
          </div>
          <div>
            <h2 style={{ fontSize:20,fontWeight:800,color:"#fff",marginBottom:3 }}>{personalInfo.full_name||user?.full_name||"Faculty"}</h2>
            <p style={{ fontSize:13,color:"rgba(255,255,255,.5)",marginBottom:4 }}>{professionalInfo.designation||"Faculty"} · {professionalInfo.department||"Upskillize LMS"}</p>
            <p style={{ fontSize:12,color:"rgba(255,255,255,.35)" }}>{personalInfo.email||user?.email}</p>
          </div>
        </div>
        {/* Stats strip */}
        <div style={{ display:"flex",gap:24,flexShrink:0 }}>
          {[{ n:stats?.totalCourses??"–", l:"Courses" },{ n:stats?.totalStudents??"–", l:"Students" },{ n:professionalInfo.experience_years||"–", l:"Yrs Exp" }].map((s,i)=>(
            <div key={i} style={{ borderLeft:"1px solid rgba(255,255,255,.15)",paddingLeft:20,textAlign:"center" }}>
              <div style={{ fontSize:22,fontWeight:800,color:"#fff" }}>{s.n}</div>
              <div style={{ fontSize:11,color:"rgba(255,255,255,.4)" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <Msg type={msg.type} text={msg.text}/>

      <div className="fac-card">
        {/* Tabs */}
        <div className="fac-profile-tabs" style={{ overflowX:"auto" }}>
          {tabs.map(t=>{ const Icon=t.icon; return (
            <button key={t.id} className={`fac-profile-tab ${activeTab===t.id?"active":""}`} onClick={()=>setActiveTab(t.id)} style={{ display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap" }}>
              <Icon size={12}/>{t.label}
            </button>
          ); })}
        </div>

        <div style={{ padding:24,maxWidth:680 }}>

          {/* ── PERSONAL ── */}
          {activeTab==="personal" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <SectionHead title="Personal Information" sub="Your basic personal details visible in your profile"/>
              <div className="fac-grid-2" style={{ gap:13 }}>
                <Field label="Full Name" required><input className="fac-input" value={personalInfo.full_name} onChange={e=>setPersonalInfo(p=>({...p,full_name:e.target.value}))} placeholder="Your full name"/></Field>
                <Field label="Email"><input className="fac-input" value={personalInfo.email} disabled style={{ background:T.bg,color:T.muted }}/><p style={{ fontSize:11,color:T.subtle,marginTop:2 }}>Email cannot be changed</p></Field>
                <Field label="Phone Number" required><input className="fac-input" value={personalInfo.phone_number} onChange={e=>setPersonalInfo(p=>({...p,phone_number:e.target.value}))} placeholder="+91 98765 43210"/></Field>
                <Field label="Date of Birth"><input type="date" className="fac-input" value={personalInfo.date_of_birth} onChange={e=>setPersonalInfo(p=>({...p,date_of_birth:e.target.value}))}/></Field>
              </div>
              <Field label="Gender">
                <div style={{ display:"flex",gap:18,marginTop:5,flexWrap:"wrap" }}>
                  {["Male","Female","Other","Prefer not to say"].map(opt=>(
                    <label key={opt} style={{ display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:14,fontWeight:500 }}>
                      <input type="radio" name="fac-gender" value={opt} checked={personalInfo.gender===opt} onChange={e=>setPersonalInfo(p=>({...p,gender:e.target.value}))}/>{opt}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Bio">
                <textarea className="fac-textarea" rows={4} value={personalInfo.bio} onChange={e=>setPersonalInfo(p=>({...p,bio:e.target.value}))} maxLength={500} placeholder="Tell students about yourself — your background, teaching style, areas of expertise..."/>
                <p style={{ fontSize:11,color:T.subtle,marginTop:3 }}>{(personalInfo.bio||"").length}/500 characters</p>
              </Field>
              <SaveBtn onClick={savePersonal} label="Save Personal Info"/>
            </div>
          )}

          {/* ── PROFESSIONAL ── */}
          {activeTab==="professional" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <SectionHead title="Professional Details" sub="Your academic and professional background"/>
              <div className="fac-grid-2" style={{ gap:13 }}>
                <Field label="Designation">
                  <select className="fac-select" value={professionalInfo.designation} onChange={e=>setProfessionalInfo(p=>({...p,designation:e.target.value}))}>
                    <option value="">Select designation</option>
                    {["Professor","Associate Professor","Assistant Professor","Lecturer","Instructor","Senior Faculty","Guest Faculty","Industry Expert"].map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Department">
                  <select className="fac-select" value={professionalInfo.department} onChange={e=>setProfessionalInfo(p=>({...p,department:e.target.value}))}>
                    <option value="">Select department</option>
                    {["Business Administration","Finance","Marketing","Human Resources","Operations","Strategy","Technology","Data Science","Engineering","Other"].map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Employee ID"><input className="fac-input" value={professionalInfo.employee_id} onChange={e=>setProfessionalInfo(p=>({...p,employee_id:e.target.value}))} placeholder="FAC2024001"/></Field>
                <Field label="Joining Date"><input type="date" className="fac-input" value={professionalInfo.joining_date} onChange={e=>setProfessionalInfo(p=>({...p,joining_date:e.target.value}))}/></Field>
                <Field label="Highest Qualification">
                  <select className="fac-select" value={professionalInfo.qualification} onChange={e=>setProfessionalInfo(p=>({...p,qualification:e.target.value}))}>
                    <option value="">Select qualification</option>
                    {["PhD","Post Doctorate","MBA","Masters","Bachelors","Diploma","Other"].map(q=><option key={q} value={q}>{q}</option>)}
                  </select>
                </Field>
                <Field label="Years of Experience"><input type="number" min="0" max="50" className="fac-input" value={professionalInfo.experience_years} onChange={e=>setProfessionalInfo(p=>({...p,experience_years:e.target.value}))} placeholder="e.g. 8"/></Field>
              </div>
              <Field label="Specialization / Areas of Expertise"><input className="fac-input" value={professionalInfo.specialization} onChange={e=>setProfessionalInfo(p=>({...p,specialization:e.target.value}))} placeholder="Financial Modelling, Data Analytics, Strategy..."/></Field>
              <SaveBtn onClick={saveProfessional} label="Save Professional Info"/>
            </div>
          )}

          {/* ── CONTACT ── */}
          {activeTab==="contact" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <SectionHead title="Contact & Address" sub="Your residential address and emergency contact"/>
              <div className="fac-grid-2" style={{ gap:13 }}>
                <Field label="Address Line 1" required><input className="fac-input" value={contactInfo.address_line1} onChange={e=>setContactInfo(p=>({...p,address_line1:e.target.value}))} placeholder="Street, Building, Area"/></Field>
                <Field label="Address Line 2"><input className="fac-input" value={contactInfo.address_line2} onChange={e=>setContactInfo(p=>({...p,address_line2:e.target.value}))} placeholder="Flat No., Landmark"/></Field>
                <Field label="City"><input className="fac-input" value={contactInfo.city} onChange={e=>setContactInfo(p=>({...p,city:e.target.value}))} placeholder="Bengaluru"/></Field>
                <Field label="State"><input className="fac-input" value={contactInfo.state} onChange={e=>setContactInfo(p=>({...p,state:e.target.value}))} placeholder="Karnataka"/></Field>
                <Field label="Country">
                  <select className="fac-select" value={contactInfo.country} onChange={e=>setContactInfo(p=>({...p,country:e.target.value}))}>
                    <option value="">Select country</option>
                    {["India","United States","United Kingdom","Canada","Australia","Singapore","UAE","Other"].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Postal Code"><input className="fac-input" value={contactInfo.postal_code} onChange={e=>setContactInfo(p=>({...p,postal_code:e.target.value}))} placeholder="560001"/></Field>
              </div>
              <div style={{ borderTop:`1.5px solid ${T.border}`,paddingTop:16,marginTop:2 }}>
                <p style={{ fontSize:13,fontWeight:700,color:T.navy,marginBottom:12 }}>🆘 Emergency Contact</p>
                <div className="fac-grid-2" style={{ gap:13 }}>
                  <Field label="Contact Name"><input className="fac-input" value={contactInfo.emergency_contact_name} onChange={e=>setContactInfo(p=>({...p,emergency_contact_name:e.target.value}))} placeholder="Name"/></Field>
                  <Field label="Contact Phone"><input className="fac-input" value={contactInfo.emergency_contact_phone} onChange={e=>setContactInfo(p=>({...p,emergency_contact_phone:e.target.value}))} placeholder="+91 9876543210"/></Field>
                </div>
              </div>
              <SaveBtn onClick={saveContact} label="Save Contact Info"/>
            </div>
          )}

          {/* ── ADDITIONAL INFO ── */}
          {activeTab==="additional" && (
            <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
              <SectionHead title="Additional Information" sub="Education, certifications, skills, languages and achievements"/>

              {/* Education */}
              <div style={{ background:T.bg,borderRadius:10,padding:16,border:`1px solid ${T.border}` }}>
                <p style={{ fontSize:13,fontWeight:800,color:T.navy,marginBottom:12,display:"flex",alignItems:"center",gap:6 }}>🎓 Education</p>
                <div className="fac-grid-2" style={{ gap:12 }}>
                  <Field label="Degree / Course"><input className="fac-input" value={additionalInfo.edu_degree} onChange={e=>setAdditionalInfo(p=>({...p,edu_degree:e.target.value}))} placeholder="e.g. MBA Finance"/></Field>
                  <Field label="Institution / University"><input className="fac-input" value={additionalInfo.edu_institution} onChange={e=>setAdditionalInfo(p=>({...p,edu_institution:e.target.value}))} placeholder="e.g. IIM Bangalore"/></Field>
                  <Field label="Year of Passing"><input className="fac-input" type="number" min="1980" max="2030" value={additionalInfo.edu_year} onChange={e=>setAdditionalInfo(p=>({...p,edu_year:e.target.value}))} placeholder="e.g. 2018"/></Field>
                  <Field label="Grade / Percentage / CGPA"><input className="fac-input" value={additionalInfo.edu_grade} onChange={e=>setAdditionalInfo(p=>({...p,edu_grade:e.target.value}))} placeholder="e.g. 9.2 CGPA or 88%"/></Field>
                </div>
              </div>

              {/* Certifications */}
              <div style={{ background:T.bg,borderRadius:10,padding:16,border:`1px solid ${T.border}` }}>
                <p style={{ fontSize:13,fontWeight:800,color:T.navy,marginBottom:8,display:"flex",alignItems:"center",gap:6 }}>🏅 Certifications</p>
                <Field label="List your certifications (one per line)">
                  <textarea className="fac-textarea" rows={3} value={additionalInfo.certifications} onChange={e=>setAdditionalInfo(p=>({...p,certifications:e.target.value}))} placeholder={"CFA Level 3 — 2022\nPMP Certified — 2020\nGoogle Data Analytics — 2023"}/>
                </Field>
              </div>

              {/* Skills */}
              <div style={{ background:T.bg,borderRadius:10,padding:16,border:`1px solid ${T.border}` }}>
                <p style={{ fontSize:13,fontWeight:800,color:T.navy,marginBottom:8,display:"flex",alignItems:"center",gap:6 }}>⚡ Skills</p>
                <Field label="Skills (comma separated)">
                  <input className="fac-input" value={additionalInfo.skills} onChange={e=>setAdditionalInfo(p=>({...p,skills:e.target.value}))} placeholder="Financial Modelling, Python, Excel, Tableau, Power BI..."/>
                </Field>
                {additionalInfo.skills && (
                  <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginTop:9 }}>
                    {additionalInfo.skills.split(",").map(s=>s.trim()).filter(Boolean).map((s,i)=>(
                      <span key={i} className="fac-pill fac-pill-navy" style={{ fontSize:12 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Languages */}
              <div style={{ background:T.bg,borderRadius:10,padding:16,border:`1px solid ${T.border}` }}>
                <p style={{ fontSize:13,fontWeight:800,color:T.navy,marginBottom:8,display:"flex",alignItems:"center",gap:6 }}>🌐 Languages Known</p>
                <Field label="Languages (comma separated)">
                  <input className="fac-input" value={additionalInfo.languages_known} onChange={e=>setAdditionalInfo(p=>({...p,languages_known:e.target.value}))} placeholder="English, Hindi, Kannada, Tamil..."/>
                </Field>
              </div>

              {/* Achievements */}
              <div style={{ background:T.bg,borderRadius:10,padding:16,border:`1px solid ${T.border}` }}>
                <p style={{ fontSize:13,fontWeight:800,color:T.navy,marginBottom:8,display:"flex",alignItems:"center",gap:6 }}>🏆 Achievements & Awards</p>
                <Field label="List achievements (one per line)">
                  <textarea className="fac-textarea" rows={3} value={additionalInfo.achievements} onChange={e=>setAdditionalInfo(p=>({...p,achievements:e.target.value}))} placeholder={"Best Faculty Award 2023 — Upskillize\nTop Mentor Award — NSDC 2022"}/>
                </Field>
              </div>

              {/* Publications */}
              <div style={{ background:T.bg,borderRadius:10,padding:16,border:`1px solid ${T.border}` }}>
                <p style={{ fontSize:13,fontWeight:800,color:T.navy,marginBottom:8,display:"flex",alignItems:"center",gap:6 }}>📚 Research & Publications</p>
                <Field label="Publications / Papers (one per line)">
                  <textarea className="fac-textarea" rows={3} value={additionalInfo.publications} onChange={e=>setAdditionalInfo(p=>({...p,publications:e.target.value}))} placeholder={"Impact of ESG on SME Valuation — Journal of Finance 2023\nDigital Transformation in Indian Banking — 2022"}/>
                </Field>
              </div>

              <SaveBtn onClick={saveAdditional} label="Save Additional Info"/>
            </div>
          )}

          {/* ── SOCIAL LINKS ── */}
          {activeTab==="social" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <SectionHead title="Social Links" sub="Add your professional social profiles"/>
              {[
                { key:"linkedin", label:"LinkedIn",  icon:"🔵", placeholder:"https://linkedin.com/in/yourprofile" },
                { key:"github",   label:"GitHub",    icon:"⚫", placeholder:"https://github.com/yourusername"    },
                { key:"twitter",  label:"Twitter/X", icon:"🔷", placeholder:"https://twitter.com/yourusername"   },
                { key:"website",  label:"Website / Portfolio", icon:"🌐", placeholder:"https://yourwebsite.com"  },
              ].map(({ key,label,icon,placeholder })=>(
                <Field key={key} label={`${icon} ${label}`}>
                  <input type="url" className="fac-input" value={socialLinks[key]} onChange={e=>setSocialLinks(s=>({...s,[key]:e.target.value}))} placeholder={placeholder}/>
                </Field>
              ))}
              {Object.values(socialLinks).some(Boolean) && (
                <div style={{ background:T.bg,borderRadius:9,padding:14,border:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:12,fontWeight:700,color:T.muted,marginBottom:10 }}>PREVIEW</p>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {[{ key:"linkedin",bg:"#0077b5",label:"LinkedIn" },{ key:"github",bg:"#24292e",label:"GitHub" },{ key:"twitter",bg:"#1da1f2",label:"Twitter" },{ key:"website",bg:T.navy,label:"Website" }].map(({ key,bg,label })=>
                      socialLinks[key] ? (
                        <a key={key} href={socialLinks[key]} target="_blank" rel="noopener noreferrer"
                          style={{ background:bg,color:"#fff",padding:"7px 16px",borderRadius:8,fontSize:12,fontWeight:700,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:5 }}>
                          <Globe size={11}/>{label}
                        </a>
                      ) : null
                    )}
                  </div>
                </div>
              )}
              <SaveBtn onClick={saveSocial} label="Save Social Links"/>
            </div>
          )}

          {/* ── BANK DETAILS ── */}
          {activeTab==="bank" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <SectionHead title="Bank Account Details" sub="Used for salary and payment processing. All data is encrypted."/>
              <div className="fac-alert-info" style={{ marginBottom:4 }}>
                <Shield size={13}/> Your bank details are stored encrypted and are never shared with third parties.
              </div>

              <div className="fac-grid-2" style={{ gap:13 }}>
                <Field label="Account Holder Name" required>
                  <input className="fac-input" value={bankInfo.account_holder_name} onChange={e=>setBankInfo(p=>({...p,account_holder_name:e.target.value}))} placeholder="Exactly as in your passbook"/>
                </Field>
                <Field label="Bank Name" required>
                  <select className="fac-select" value={bankInfo.bank_name} onChange={e=>setBankInfo(p=>({...p,bank_name:e.target.value}))}>
                    <option value="">Select bank</option>
                    {["State Bank of India","HDFC Bank","ICICI Bank","Axis Bank","Kotak Mahindra Bank","Punjab National Bank","Bank of Baroda","Canara Bank","Union Bank of India","IDFC FIRST Bank","IndusInd Bank","Yes Bank","Federal Bank","South Indian Bank","Other"].map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="Account Number" required>
                  <div style={{ position:"relative" }}>
                    <input type={showAccNum?"text":"password"} className="fac-input" style={{ paddingRight:42 }} value={bankInfo.account_number} onChange={e=>setBankInfo(p=>({...p,account_number:e.target.value}))} placeholder="Enter account number"/>
                    <button type="button" onClick={()=>setShowAccNum(v=>!v)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.muted }}>{showAccNum?<EyeOff size={14}/>:<Eye size={14}/>}</button>
                  </div>
                </Field>
                <Field label="Confirm Account Number" required>
                  <input type="password" className="fac-input" value={bankInfo.confirm_account_number} onChange={e=>setBankInfo(p=>({...p,confirm_account_number:e.target.value}))} placeholder="Re-enter account number"/>
                  {bankInfo.confirm_account_number && bankInfo.account_number && (
                    <p style={{ fontSize:11,marginTop:3,color:bankInfo.account_number===bankInfo.confirm_account_number?T.green:T.red,fontWeight:600 }}>
                      {bankInfo.account_number===bankInfo.confirm_account_number?"✓ Account numbers match":"✗ Account numbers do not match"}
                    </p>
                  )}
                </Field>
                <Field label="IFSC Code" required>
                  <input className="fac-input" value={bankInfo.ifsc_code} onChange={e=>setBankInfo(p=>({...p,ifsc_code:e.target.value.toUpperCase()}))} placeholder="e.g. SBIN0001234" maxLength={11}/>
                  <p style={{ fontSize:11,color:T.subtle,marginTop:2 }}>11-character code — first 4 letters = bank, 5th = 0, last 6 = branch</p>
                </Field>
                <Field label="Branch Name">
                  <input className="fac-input" value={bankInfo.branch_name} onChange={e=>setBankInfo(p=>({...p,branch_name:e.target.value}))} placeholder="e.g. Koramangala, Bengaluru"/>
                </Field>
                <Field label="Account Type">
                  <select className="fac-select" value={bankInfo.account_type} onChange={e=>setBankInfo(p=>({...p,account_type:e.target.value}))}>
                    {["savings","current","salary"].map(t=><option key={t} value={t} style={{ textTransform:"capitalize" }}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="PAN Number">
                  <input className="fac-input" value={bankInfo.pan_number} onChange={e=>setBankInfo(p=>({...p,pan_number:e.target.value.toUpperCase()}))} placeholder="e.g. ABCDE1234F" maxLength={10}/>
                </Field>
                <Field label="UAN Number (Provident Fund)">
                  <input className="fac-input" value={bankInfo.uan_number} onChange={e=>setBankInfo(p=>({...p,uan_number:e.target.value}))} placeholder="12-digit UAN"/>
                </Field>
              </div>
              <SaveBtn onClick={saveBank} label="Save Bank Details"/>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab==="security" && (
            <div style={{ display:"flex",flexDirection:"column",gap:13,maxWidth:440 }}>
              <SectionHead title="Change Password" sub="Keep your account secure with a strong password"/>
              <div className="fac-alert-info"><AlertCircle size={13}/> Must be 6+ characters with uppercase, lowercase and numbers.</div>
              {[
                { key:"current_password", label:"Current Password",     placeholder:"Enter current password"  },
                { key:"new_password",     label:"New Password",         placeholder:"Enter new password"       },
                { key:"confirm_password", label:"Confirm New Password", placeholder:"Re-enter new password"   },
              ].map(({ key,label,placeholder })=>(
                <Field key={key} label={label}>
                  <div style={{ position:"relative" }}>
                    <input type={showPwd[key.split("_")[0]]?"text":"password"} className="fac-input" style={{ paddingRight:42 }} value={security[key]} onChange={e=>setSecurity(s=>({...s,[key]:e.target.value}))} placeholder={placeholder}/>
                    <button type="button" onClick={()=>setShowPwd(v=>({...v,[key.split("_")[0]]:!v[key.split("_")[0]]}))} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.muted }}>
                      {showPwd[key.split("_")[0]] ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </Field>
              ))}
              {security.new_password && security.confirm_password && (
                <p style={{ fontSize:12,fontWeight:600,color:security.new_password===security.confirm_password?T.green:T.red }}>
                  {security.new_password===security.confirm_password?"✓ Passwords match":"✗ Passwords do not match"}
                </p>
              )}
              <SaveBtn onClick={saveSecurity} label="Change Password"/>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────
function FacultySettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type:"",text:"" });
  const [notifs, setNotifs] = useState({ emailNotifications:true,studentSubmissions:true,newEnrollments:true,doubtAlerts:true,weeklyReport:true,promotionalEmails:false });

  const showMsg = (type,text) => { setMsg({type,text}); setTimeout(()=>setMsg({type:"",text:""}),3000); };

  const ToggleRow = ({label,desc,checked,onChange}) => (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${T.border}` }}>
      <div><p style={{ fontSize:14,fontWeight:600,color:T.text }}>{label}</p><p style={{ fontSize:12,color:T.subtle }}>{desc}</p></div>
      <div className={`fac-toggle-track ${checked?"on":""}`} onClick={onChange}><div className="fac-toggle-thumb"/></div>
    </div>
  );

  return (
    <div style={{ maxWidth:680 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="fac-section-title">Settings</h2><p className="fac-section-sub">Manage your account preferences</p></div>
        <Settings size={22} style={{ color:T.subtle }}/>
      </div>

      <Msg type={msg.type} text={msg.text}/>

      {/* Notification Settings */}
      <div className="fac-card" style={{ marginBottom:14,borderLeft:`3px solid ${T.gold}` }}>
        <div style={{ padding:"13px 17px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:9,background:T.bg }}>
          <Bell size={14} style={{ color:T.gold }}/><p style={{ fontSize:13,fontWeight:700,color:T.navy }}>Notification Preferences</p>
        </div>
        <div style={{ padding:"5px 17px 13px" }}>
          <ToggleRow label="Email Notifications" desc="Receive all alerts via email" checked={notifs.emailNotifications} onChange={()=>setNotifs(n=>({...n,emailNotifications:!n.emailNotifications}))}/>
          <ToggleRow label="Student Submissions" desc="When a student submits an assignment" checked={notifs.studentSubmissions} onChange={()=>setNotifs(n=>({...n,studentSubmissions:!n.studentSubmissions}))}/>
          <ToggleRow label="New Enrollments" desc="When a student enrolls in your course" checked={notifs.newEnrollments} onChange={()=>setNotifs(n=>({...n,newEnrollments:!n.newEnrollments}))}/>
          <ToggleRow label="Doubt Alerts" desc="When a student posts a new doubt" checked={notifs.doubtAlerts} onChange={()=>setNotifs(n=>({...n,doubtAlerts:!n.doubtAlerts}))}/>
          <ToggleRow label="Weekly Report" desc="Weekly summary of course activity" checked={notifs.weeklyReport} onChange={()=>setNotifs(n=>({...n,weeklyReport:!n.weeklyReport}))}/>
          <ToggleRow label="Promotional Emails" desc="Updates and offers from Upskillize" checked={notifs.promotionalEmails} onChange={()=>setNotifs(n=>({...n,promotionalEmails:!n.promotionalEmails}))}/>
        </div>
      </div>

      {/* Password link */}
      <div style={{ background:T.bg,border:`1px solid ${T.border}`,borderLeft:`3px solid ${T.navy}`,borderRadius:10,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}><Lock size={14} style={{ color:T.navy }}/><p style={{ fontSize:13,color:T.navy }}><strong>Change Password</strong> — Go to Profile → Security tab</p></div>
        <Link to="/faculty/profile" style={{ fontSize:12,color:T.navy,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:3 }}>Go to Profile <ChevronRight size={12}/></Link>
      </div>

      {/* Danger zone */}
      <div className="fac-card" style={{ borderLeft:`3px solid ${T.red}` }}>
        <div style={{ padding:"13px 17px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:9,background:T.bg }}>
          <AlertCircle size={14} style={{ color:T.red }}/><p style={{ fontSize:13,fontWeight:700,color:T.navy }}>Danger Zone</p>
        </div>
        <div style={{ padding:17 }}>
          <div className="fac-alert-error" style={{ marginBottom:14 }}><AlertCircle size={13}/> These actions are permanent and cannot be undone.</div>
          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16 }}>
            <div><h4 style={{ fontWeight:700,color:T.text,marginBottom:5,display:"flex",alignItems:"center",gap:6 }}><Trash2 size={14} style={{ color:T.red }}/> Delete Account</h4><p style={{ fontSize:13,color:T.muted,lineHeight:1.55 }}>Permanently remove your faculty account, all courses, and content.</p></div>
            <button className="fac-btn-danger" style={{ flexShrink:0 }} onClick={()=>{ if(window.confirm("Delete your account?")&&window.prompt('Type "DELETE" to confirm')==="DELETE"){ api.delete("/faculty/account").then(()=>{ logout(); navigate("/login"); }).catch(()=>alert("Error deleting")); } }}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS & REPORTS ───────────────────────────────────────────────────
function FacultyAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [ar, cr] = await Promise.allSettled([
          api.get("/faculty/analytics"),
          api.get("/faculty/courses"),
        ]);
        if (ar.status === "fulfilled" && ar.value.data.success) setAnalytics(ar.value.data.analytics || {});
        if (cr.status === "fulfilled" && cr.value.data.success) setCourses(cr.value.data.courses || []);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  const courseColors = [T.navy, T.gold, T.green, T.blue, T.red, T.muted];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 className="fac-section-title">Analytics & Reports</h2>
          <p className="fac-section-sub">Detailed insights across your courses and students</p>
        </div>
        <select className="fac-select" style={{ width: "auto", fontSize: 13, padding: "7px 12px" }}
          value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
        </select>
      </div>

      <div className="fac-tabs" style={{ marginBottom: 16 }}>
        {[["overview", "📊 Overview"], ["students", "👥 Students"], ["assessments", "📝 Assessments"], ["engagement", "🔥 Engagement"]].map(([v, l]) => (
          <button key={v} className={`fac-tab ${tab === v ? "active" : ""}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="fac-grid-4" style={{ marginBottom: 16 }}>
            {[
              { label: "Total Enrollments", value: analytics?.totalEnrollments ?? "–", sub: "Across all courses", accent: "fac-metric-navy" },
              { label: "Avg Completion Rate", value: `${analytics?.avgCompletionRate ?? 0}%`, sub: "Course completion", accent: "fac-metric-green" },
              { label: "Avg Student Score", value: `${analytics?.avgStudentScore ?? 0}%`, sub: "Assessment average", accent: "fac-metric-gold" },
              { label: "Certificates Issued", value: analytics?.certificatesIssued ?? "–", sub: "Total earned", accent: "fac-metric-blue" },
            ].map((m, i) => (
              <div key={i} className={`fac-metric ${m.accent}`}>
                <div className="fac-metric-label">{m.label}</div>
                <div className="fac-metric-value">{m.value}</div>
                <div className="fac-metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="fac-grid-2">
            {/* Enrollment by course */}
            <div className="fac-card">
              <div className="fac-card-head"><span className="fac-card-title">Enrollments by Course</span><TrendingUp size={14} style={{ color: T.green }} /></div>
              <div style={{ padding: 17 }}>
                {(analytics?.courseEnrollments || []).length === 0
                  ? <p style={{ fontSize: 13, color: T.subtle }}>No data yet.</p>
                  : (analytics?.courseEnrollments || []).map((item, idx) => (
                    <div key={idx} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{item.course_name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.navy, flexShrink: 0, marginLeft: 8 }}>{item.count}</span>
                      </div>
                      <div className="fac-bar-track">
                        <div className="fac-bar-fill" style={{ width: `${Math.min(100, (item.count / (analytics?.maxEnrollment || 1)) * 100)}%`, background: courseColors[idx % courseColors.length] }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Completion rates */}
            <div className="fac-card">
              <div className="fac-card-head"><span className="fac-card-title">Completion Rates</span><Award size={14} style={{ color: T.gold }} /></div>
              <div style={{ padding: 17 }}>
                {(analytics?.completionRates || []).length === 0
                  ? <p style={{ fontSize: 13, color: T.subtle }}>No data yet.</p>
                  : (analytics?.completionRates || []).map((item, idx) => (
                    <div key={idx} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{item.course_name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: item.rate >= 70 ? T.green : item.rate >= 40 ? T.gold : T.red, flexShrink: 0, marginLeft: 8 }}>{item.rate}%</span>
                      </div>
                      <div className="fac-bar-track">
                        <div className="fac-bar-fill" style={{ width: `${item.rate}%`, background: item.rate >= 70 ? T.green : item.rate >= 40 ? T.gold : T.red }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "students" && (
        <div>
          <div className="fac-grid-3" style={{ marginBottom: 16 }}>
            {[
              { label: "Active Learners", value: analytics?.activeStudents ?? "–", sub: "Learning this week", accent: "fac-metric-navy" },
              { label: "Avg Progress", value: `${analytics?.avgProgress ?? 0}%`, sub: "Overall progress", accent: "fac-metric-gold" },
              { label: "At Risk Students", value: analytics?.atRiskStudents ?? "–", sub: "Progress < 20%", accent: "fac-metric-red" },
            ].map((m, i) => (
              <div key={i} className={`fac-metric ${m.accent}`}>
                <div className="fac-metric-label">{m.label}</div>
                <div className="fac-metric-value">{m.value}</div>
                <div className="fac-metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="fac-card" style={{ overflow: "hidden" }}>
            <div className="fac-card-head"><span className="fac-card-title">Student Progress Breakdown</span></div>
            <table className="fac-table">
              <thead><tr><th>Progress Range</th><th>Students</th><th>% of Total</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  { range: "80–100%", count: analytics?.progress_80_100 ?? 0, status: "Excellent", color: T.green },
                  { range: "60–79%", count: analytics?.progress_60_79 ?? 0, status: "Good", color: T.navy },
                  { range: "40–59%", count: analytics?.progress_40_59 ?? 0, status: "Average", color: T.gold },
                  { range: "20–39%", count: analytics?.progress_20_39 ?? 0, status: "Below Average", color: T.muted },
                  { range: "0–19%", count: analytics?.progress_0_19 ?? 0, status: "At Risk", color: T.red },
                ].map((row, i) => {
                  const total = analytics?.totalEnrollments || 1;
                  const pct = Math.round((row.count / total) * 100);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{row.range}</td>
                      <td><span className="fac-pill fac-pill-navy">{row.count}</span></td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="fac-bar-track" style={{ width: 80 }}><div className="fac-bar-fill" style={{ width: `${pct}%`, background: row.color }} /></div>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{pct}%</span>
                        </div>
                      </td>
                      <td><span className="fac-pill" style={{ background: `${row.color}15`, color: row.color }}>{row.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "assessments" && (
        <div>
          <div className="fac-grid-4" style={{ marginBottom: 16 }}>
            {[
              { label: "Total Attempts", value: analytics?.totalAttempts ?? "–", sub: "All assessments", accent: "fac-metric-navy" },
              { label: "Pass Rate", value: `${analytics?.passRate ?? 0}%`, sub: "Students passing", accent: "fac-metric-green" },
              { label: "Avg Score", value: `${analytics?.avgAssessmentScore ?? 0}%`, sub: "Assessment average", accent: "fac-metric-gold" },
              { label: "Pending Grading", value: analytics?.pendingGrading ?? "–", sub: "Assignments to review", accent: "fac-metric-red" },
            ].map((m, i) => (
              <div key={i} className={`fac-metric ${m.accent}`}>
                <div className="fac-metric-label">{m.label}</div>
                <div className="fac-metric-value">{m.value}</div>
                <div className="fac-metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="fac-card" style={{ overflow: "hidden" }}>
            <div className="fac-card-head"><span className="fac-card-title">Assessment Performance by Quiz</span></div>
            <table className="fac-table">
              <thead><tr><th>Assessment</th><th>Course</th><th>Attempts</th><th>Pass Rate</th><th>Avg Score</th></tr></thead>
              <tbody>
                {(analytics?.assessmentStats || []).length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: T.subtle }}>No assessment data yet</td></tr>
                  : (analytics?.assessmentStats || []).map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{a.title}</td>
                      <td style={{ color: T.muted, fontSize: 13 }}>{a.course_name}</td>
                      <td>{a.attempts}</td>
                      <td>
                        <span className="fac-pill" style={{ background: a.pass_rate >= 70 ? T.greenSoft : T.redSoft, color: a.pass_rate >= 70 ? T.green : T.red }}>{a.pass_rate}%</span>
                      </td>
                      <td style={{ fontWeight: 700, color: T.navy }}>{a.avg_score}%</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "engagement" && (
        <div>
          <div className="fac-grid-3" style={{ marginBottom: 16 }}>
            {[
              { label: "Forum Posts", value: analytics?.forumPosts ?? "–", sub: "Student discussions", accent: "fac-metric-navy" },
              { label: "Open Doubts", value: analytics?.openDoubts ?? "–", sub: "Awaiting answer", accent: "fac-metric-red" },
              { label: "Materials Viewed", value: analytics?.materialsViewed ?? "–", sub: "Total material views", accent: "fac-metric-gold" },
            ].map((m, i) => (
              <div key={i} className={`fac-metric ${m.accent}`}>
                <div className="fac-metric-label">{m.label}</div>
                <div className="fac-metric-value">{m.value}</div>
                <div className="fac-metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>
          <div className="fac-card">
            <div className="fac-card-head"><span className="fac-card-title">Most Viewed Materials</span><Eye size={14} style={{ color: T.navy }} /></div>
            <div style={{ padding: 17 }}>
              {(analytics?.topMaterials || []).length === 0
                ? <p style={{ fontSize: 13, color: T.subtle }}>No data yet.</p>
                : (analytics?.topMaterials || []).map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < (analytics?.topMaterials?.length - 1) ? `1px solid ${T.border}` : "none" }}>
                    <span style={{ width: 24, height: 24, borderRadius: 6, background: T.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: T.navy, flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{m.title}</p>
                      <p style={{ fontSize: 12, color: T.subtle }}>{m.course_name}</p>
                    </div>
                    <span className="fac-pill fac-pill-navy" style={{ fontSize: 11 }}>{m.views} views</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STUDENT PERFORMANCE DEEP DIVE ─────────────────────────────────────────
function StudentPerformance() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [perf, setPerf] = useState(null);
  const [loadingPerf, setLoadingPerf] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("progress");

  useEffect(() => {
    api.get("/faculty/students").then(r => {
      if (r.data.success) setStudents(r.data.students || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadPerf = async (student) => {
    setSelected(student);
    setLoadingPerf(true);
    setPerf(null);
    try {
      const r = await api.get(`/faculty/students/${student.id}/performance`);
      if (r.data.success) setPerf(r.data.performance || {});
    } catch {}
    finally { setLoadingPerf(false); }
  };

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h2 className="fac-section-title">Student Performance</h2><p className="fac-section-sub">Deep dive into individual student progress</p></div>
        <div className="fac-search-bar">
          <Search size={13} style={{ color: T.muted, flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." style={{ background: "none", border: "none", outline: "none", fontSize: 13, width: 180 }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        {/* Student list */}
        <div className="fac-card" style={{ overflow: "hidden", maxHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "11px 15px", borderBottom: `1px solid ${T.border}`, background: T.bg }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>All Students ({filtered.length})</p>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map((s, i) => (
              <div key={s.id} onClick={() => loadPerf(s)}
                style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", cursor: "pointer", borderBottom: `1px solid ${T.border}`, background: selected?.id === s.id ? T.blueSoft : "#fff", transition: "background .12s" }}>
                <Avatar name={s.full_name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.full_name}</p>
                  <p style={{ fontSize: 11, color: T.subtle }}>{s.avg_progress || 0}% avg progress</p>
                </div>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: (s.avg_progress || 0) >= 70 ? T.green : (s.avg_progress || 0) >= 40 ? T.gold : T.red, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Performance detail */}
        <div>
          {!selected ? (
            <div className="fac-card fac-empty" style={{ height: 300 }}>
              <TrendingUp size={32} style={{ color: T.border, margin: "0 auto 10px" }} />
              <p>Select a student to view their performance</p>
            </div>
          ) : loadingPerf ? (
            <div className="fac-card" style={{ height: 300 }}><Spinner /></div>
          ) : (
            <div>
              {/* Student header */}
              <div style={{ background: T.navy, borderRadius: 12, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
                <Avatar name={selected.full_name} size={52} />
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{selected.full_name}</h3>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{selected.email}</p>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 0 }}>
                  {[
                    { num: perf?.totalCourses ?? "–", lbl: "Courses" },
                    { num: `${perf?.avgProgress ?? 0}%`, lbl: "Progress" },
                    { num: perf?.certificates ?? "–", lbl: "Certs" },
                  ].map((s, i) => (
                    <div key={i} style={{ borderLeft: "1px solid rgba(255,255,255,.15)", paddingLeft: 16, textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{s.num}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{s.lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="fac-tabs" style={{ marginBottom: 14 }}>
                {[["progress", "Progress"], ["assessments", "Assessments"], ["assignments", "Assignments"], ["psychometric", "Psychometric"]].map(([v, l]) => (
                  <button key={v} className={`fac-tab ${tab === v ? "active" : ""}`} onClick={() => setTab(v)}>{l}</button>
                ))}
              </div>

              {tab === "progress" && (
                <div className="fac-card">
                  <div className="fac-card-head"><span className="fac-card-title">Course Progress</span></div>
                  <div style={{ padding: 17 }}>
                    {(perf?.courseProgress || []).length === 0
                      ? <p style={{ fontSize: 13, color: T.subtle }}>No progress data yet.</p>
                      : (perf?.courseProgress || []).map((cp, i) => (
                        <div key={i} style={{ marginBottom: 13 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{cp.course_name}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: cp.progress >= 70 ? T.green : cp.progress >= 40 ? T.gold : T.red }}>{cp.progress}%</span>
                          </div>
                          <div className="fac-bar-track">
                            <div className="fac-bar-fill" style={{ width: `${cp.progress}%`, background: cp.progress >= 70 ? T.green : cp.progress >= 40 ? T.gold : T.red }} />
                          </div>
                          <p style={{ fontSize: 11, color: T.subtle, marginTop: 3 }}>Last active: {cp.last_active ? new Date(cp.last_active).toLocaleDateString("en-IN") : "–"}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {tab === "assessments" && (
                <div className="fac-card" style={{ overflow: "hidden" }}>
                  <div className="fac-card-head"><span className="fac-card-title">Assessment History</span></div>
                  <table className="fac-table">
                    <thead><tr><th>Assessment</th><th>Score</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {(perf?.assessments || []).length === 0
                        ? <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: T.subtle }}>No attempts yet</td></tr>
                        : (perf?.assessments || []).map((a, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{a.title}</td>
                            <td><span style={{ fontWeight: 700, color: a.passed ? T.green : T.red }}>{a.percentage}%</span></td>
                            <td><span className={`fac-pill ${a.passed ? "fac-pill-pass" : "fac-pill-fail"}`}>{a.passed ? "Passed" : "Failed"}</span></td>
                            <td style={{ fontSize: 12, color: T.subtle }}>{a.date ? new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "–"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === "assignments" && (
                <div className="fac-card" style={{ overflow: "hidden" }}>
                  <div className="fac-card-head"><span className="fac-card-title">Assignment Submissions</span></div>
                  <table className="fac-table">
                    <thead><tr><th>Assignment</th><th>Status</th><th>Grade</th><th>Submitted</th></tr></thead>
                    <tbody>
                      {(perf?.assignments || []).length === 0
                        ? <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: T.subtle }}>No submissions yet</td></tr>
                        : (perf?.assignments || []).map((a, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{a.title}</td>
                            <td><span className={`fac-pill ${a.status === "graded" ? "fac-pill-pass" : a.status === "submitted" ? "fac-pill-warn" : "fac-pill-gray"}`}>{a.status}</span></td>
                            <td style={{ fontWeight: 700 }}>{a.grade != null ? `${a.grade}/${a.total_marks}` : "–"}</td>
                            <td style={{ fontSize: 12, color: T.subtle }}>{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("en-IN") : "–"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {tab === "psychometric" && (
                <div className="fac-card" style={{ padding: 20 }}>
                  {!perf?.psychometric ? (
                    <div style={{ textAlign: "center", padding: "24px 0", color: T.subtle }}>
                      <Brain size={32} style={{ color: T.border, margin: "0 auto 10px", display: "block" }} />
                      <p>Student has not completed the psychometric test yet.</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ background: T.navy, borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 16 }}>
                        <div style={{ fontSize: 44, marginBottom: 8 }}>{perf.psychometric.icon}</div>
                        <h4 style={{ fontSize: 18, fontWeight: 800, color: T.gold, marginBottom: 6 }}>{perf.psychometric.type}</h4>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,.65)", lineHeight: 1.65 }}>{perf.psychometric.desc}</p>
                        {perf.psychometric.topDimensions?.length > 0 && (
                          <div style={{ marginTop: 12, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                            {perf.psychometric.topDimensions.map((d, i) => (
                              <span key={d} className="fac-pill" style={{ background: "rgba(184,150,11,.2)", color: T.gold, fontSize: 11 }}>#{i + 1} {d}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {perf.psychometric.scores && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 9 }}>
                          {Object.entries(perf.psychometric.scores).slice(0, 8).map(([k, v]) => (
                            <div key={k} style={{ background: T.bg, borderRadius: 8, padding: "10px 12px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>{k}</span>
                                <span style={{ fontSize: 11, color: T.muted }}>{v} pts</span>
                              </div>
                              <div className="fac-bar-track"><div className="fac-bar-fill" style={{ width: `${Math.min(100, (v / 48) * 100)}%`, background: T.navy }} /></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── AI REVIEW PANEL (Faculty side — review AI suggestions on assignments) ──
function FacultyAIReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [gradeForm, setGradeForm] = useState({ grade: "", feedback: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    api.get("/faculty/assignments/pending-submissions").then(r => {
      if (r.data.success) setSubmissions(r.data.submissions || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const generateAiReview = async (submission) => {
    setAiLoading(true);
    setAiReview(null);
    try {
      const prompt = `You are an expert MBA faculty reviewer. Review this student's assignment submission.

Assignment Title: ${submission.assignment_title}
Course: ${submission.course_name}
Assignment Description: ${submission.assignment_description || "Not provided"}
Student Name: ${submission.student_name}
Student Submission Notes: ${submission.notes || "(No notes provided)"}
Total Marks: ${submission.total_marks}

Provide a structured faculty review with:
1. **Overall Assessment** (2-3 sentences about the submission quality)
2. **Strengths** (2-3 specific bullet points)
3. **Areas Needing Improvement** (2-3 specific bullet points)
4. **Suggested Grade** (out of ${submission.total_marks}, with justification)
5. **Suggested Feedback Message** (what to tell the student — constructive, specific, encouraging)
6. **Learning Recommendations** (1-2 actionable suggestions for the student)

Be specific, fair, and constructive. Base your review on the assignment context.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("\n") || "Could not generate review.";
      setAiReview(text);

      // Auto-parse suggested grade
      const gradeMatch = text.match(/Suggested Grade[^:]*:\s*(\d+)/i);
      if (gradeMatch) setGradeForm(f => ({ ...f, grade: gradeMatch[1] }));

      // Auto-parse feedback
      const feedbackMatch = text.match(/Suggested Feedback Message[^:]*:([\s\S]*?)(?=\d+\.|$)/i);
      if (feedbackMatch) {
        const feedback = feedbackMatch[1].trim().replace(/\*\*/g, "").slice(0, 500);
        setGradeForm(f => ({ ...f, feedback }));
      }
    } catch {
      setAiReview("AI Review is temporarily unavailable. Please grade manually.");
    }
    setAiLoading(false);
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/faculty/assignments/${selected.assignment_id}/submissions/${selected.id}/grade`, gradeForm);
      setSubmissions(p => p.filter(s => s.id !== selected.id));
      setSelected(null); setAiReview(null);
      setMsg({ type: "success", text: "Assignment graded successfully!" });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    } catch {
      setMsg({ type: "error", text: "Error submitting grade." });
    }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 className="fac-section-title">AI-Assisted Review</h2>
          <p className="fac-section-sub">{submissions.length} submission{submissions.length !== 1 ? "s" : ""} pending — use AI to speed up grading</p>
        </div>
        <div className="fac-alert-info" style={{ marginBottom: 0 }}>
          <Bot size={13} /> AI reviews are suggestions only — final grade is yours
        </div>
      </div>

      {msg.text && <Msg type={msg.type} text={msg.text} />}

      {submissions.length === 0 ? (
        <div className="fac-card fac-empty">
          <CheckCircle size={36} style={{ color: T.green, margin: "0 auto 10px" }} />
          <p style={{ color: T.green, fontWeight: 600 }}>All caught up! No pending submissions.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
          {/* Submission list */}
          <div className="fac-card" style={{ overflow: "hidden", maxHeight: "calc(100vh - 200px)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "11px 15px", borderBottom: `1px solid ${T.border}`, background: T.bg }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>Pending Submissions ({submissions.length})</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {submissions.map(sub => (
                <div key={sub.id} onClick={() => { setSelected(sub); setAiReview(null); setGradeForm({ grade: "", feedback: "" }); }}
                  style={{ padding: "12px 14px", cursor: "pointer", borderBottom: `1px solid ${T.border}`, background: selected?.id === sub.id ? T.blueSoft : "#fff", transition: "background .12s" }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 3 }}>{sub.student_name}</p>
                  <p style={{ fontSize: 12, color: T.muted, marginBottom: 3 }}>{sub.assignment_title}</p>
                  <div style={{ display: "flex", gap: 5 }}>
                    <span className="fac-pill fac-pill-navy" style={{ fontSize: 11 }}>{sub.course_name}</span>
                    <span className="fac-pill fac-pill-warn" style={{ fontSize: 11 }}>Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review panel */}
          <div>
            {!selected ? (
              <div className="fac-card fac-empty" style={{ height: 300 }}>
                <Bot size={32} style={{ color: T.border, margin: "0 auto 10px" }} />
                <p>Select a submission to review with AI</p>
              </div>
            ) : (
              <div>
                {/* Submission detail */}
                <div className="fac-card" style={{ marginBottom: 14 }}>
                  <div style={{ padding: "14px 17px", borderBottom: `1px solid ${T.border}`, background: T.bg }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 3 }}>{selected.assignment_title}</h3>
                    <p style={{ fontSize: 13, color: T.muted }}>{selected.student_name} · {selected.course_name} · {selected.total_marks} marks</p>
                  </div>
                  <div style={{ padding: 17 }}>
                    {selected.notes && (
                      <div style={{ background: T.bg, borderRadius: 8, padding: "11px 13px", marginBottom: 12 }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>Student Notes</p>
                        <p style={{ fontSize: 13, color: T.text, lineHeight: 1.65 }}>{selected.notes}</p>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      {selected.file_url && (
                        <a href={selected.file_url} target="_blank" rel="noopener noreferrer" className="fac-btn-outline" style={{ fontSize: 12 }}><Download size={12} /> View Submission</a>
                      )}
                      <button className="fac-btn-gold" onClick={() => generateAiReview(selected)} disabled={aiLoading}>
                        <Bot size={13} /> {aiLoading ? "Generating AI Review..." : "Generate AI Review"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Review */}
                {aiLoading && (
                  <div className="fac-card" style={{ padding: 24, textAlign: "center", marginBottom: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${T.blueSoft},${T.goldSoft})`, border: `2px solid ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <Bot size={22} style={{ color: T.navy }} />
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Claude AI is analysing the submission…</p>
                    <p style={{ fontSize: 13, color: T.muted }}>Generating grade suggestion and feedback</p>
                  </div>
                )}

                {aiReview && (
                  <div className="fac-card" style={{ marginBottom: 14, borderLeft: `3px solid ${T.gold}` }}>
                    <div style={{ padding: "13px 17px", borderBottom: `1px solid ${T.border}`, background: T.goldSoft, display: "flex", alignItems: "center", gap: 9 }}>
                      <Bot size={16} style={{ color: T.navy }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>AI Review Complete</p>
                        <p style={{ fontSize: 11, color: T.muted }}>Powered by Claude · Review suggestion only</p>
                      </div>
                    </div>
                    <div style={{ padding: 17, maxHeight: 320, overflowY: "auto", fontSize: 13, color: T.text, lineHeight: 1.75 }}>
                      {aiReview.split("\n").map((line, i) => {
                        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} style={{ fontWeight: 800, color: T.navy, marginTop: 12, marginBottom: 4 }}>{line.replace(/\*\*/g, "")}</p>;
                        if (line.startsWith("- ") || line.startsWith("• ")) return <p key={i} style={{ paddingLeft: 14, marginBottom: 3, display: "flex", gap: 6 }}><span style={{ color: T.gold, fontWeight: 700, flexShrink: 0 }}>•</span>{line.slice(2)}</p>;
                        if (line.match(/^\d+\./)) return <p key={i} style={{ paddingLeft: 4, marginBottom: 3, fontWeight: 600 }}>{line}</p>;
                        return line ? <p key={i} style={{ marginBottom: 3 }}>{line}</p> : <br key={i} />;
                      })}
                    </div>
                  </div>
                )}

                {/* Grade form */}
                <div className="fac-card" style={{ padding: 18, borderLeft: `3px solid ${T.navy}` }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 14 }}>Submit Grade</h4>
                  <form onSubmit={handleGrade} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label className="fac-label">Grade (out of {selected.total_marks}) *</label>
                      <input className="fac-input" type="number" min={0} max={selected.total_marks} value={gradeForm.grade} onChange={e => setGradeForm(f => ({ ...f, grade: e.target.value }))} required placeholder={`e.g. ${Math.round(selected.total_marks * 0.8)}`} />
                      {gradeForm.grade && <p style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>= {Math.round((gradeForm.grade / selected.total_marks) * 100)}% · {gradeForm.grade >= selected.total_marks * 0.6 ? "✓ Pass" : "✗ Fail"}</p>}
                    </div>
                    <div>
                      <label className="fac-label">Feedback for Student</label>
                      <textarea className="fac-textarea" rows={4} value={gradeForm.feedback} onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))} placeholder="Detailed feedback to help the student improve..." />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="submit" className="fac-btn-primary" disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                        <CheckCircle size={13} /> {saving ? "Submitting..." : "Submit Grade"}
                      </button>
                      <button type="button" className="fac-btn-ghost" onClick={() => { setSelected(null); setAiReview(null); }}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TESTGEN (Faculty creates AI-powered question banks) ───────────────────
function FacultyTestGen() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    course_id: "", topic: "", difficulty: "medium",
    question_count: 10, question_type: "mcq",
    context: "", include_explanations: true,
  });

  useEffect(() => {
    api.get("/faculty/courses").then(r => {
      if (r.data.success) setCourses(r.data.courses || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.topic.trim()) { setMsg({ type: "error", text: "Please enter a topic." }); return; }
    setGenerating(true);
    setGenerated([]);
    const selectedCourse = courses.find(c => c.id == form.course_id);

    try {
      const prompt = `You are an expert MBA faculty member creating ${form.question_count} ${form.difficulty}-difficulty ${form.question_type === "mcq" ? "multiple choice questions" : "questions"} for the topic: "${form.topic}"${selectedCourse ? ` in the course "${selectedCourse.course_name}"` : ""}.${form.context ? `\n\nAdditional context: ${form.context}` : ""}

Generate exactly ${form.question_count} questions. Format STRICTLY as JSON array:
[
  {
    "question": "Question text here?",
    "option_a": "First option",
    "option_b": "Second option", 
    "option_c": "Third option",
    "option_d": "Fourth option",
    "correct_answer": "a",
    "explanation": "${form.include_explanations ? "Brief explanation of why this is correct" : ""}",
    "difficulty": "${form.difficulty}",
    "marks": 1
  }
]

Make questions MBA-level, practical, and relevant to real business scenarios. Correct answers should be distributed across a,b,c,d. Return ONLY the JSON array, nothing else.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const questions = JSON.parse(clean);
      setGenerated(questions);
      setMsg({ type: "success", text: `Generated ${questions.length} questions successfully!` });
      setTimeout(() => setMsg({ type: "", text: "" }), 3000);
    } catch {
      setMsg({ type: "error", text: "Generation failed. Please try again." });
    }
    setGenerating(false);
  };

  const saveAsQuiz = async () => {
    if (!form.course_id) { setMsg({ type: "error", text: "Please select a course first." }); return; }
    setSaving(true);
    try {
      const quizPayload = {
        title: `AI Generated — ${form.topic}`,
        description: `Auto-generated by TestGen AI for topic: ${form.topic}`,
        course_id: form.course_id,
        time_limit_minutes: generated.length * 2,
        pass_percentage: 60,
        questions: generated,
      };
      const r = await api.post("/faculty/quizzes", quizPayload);
      if (r.data.success || r.data.quiz) {
        setMsg({ type: "success", text: "Assessment saved! Find it under Assessments." });
        setGenerated([]);
        setTimeout(() => setMsg({ type: "", text: "" }), 4000);
      }
    } catch {
      setMsg({ type: "error", text: "Error saving assessment." });
    }
    finally { setSaving(false); }
  };

  const removeQuestion = (idx) => setGenerated(p => p.filter((_, i) => i !== idx));
  const updateQuestion = (idx, field, value) => setGenerated(p => p.map((q, i) => i === idx ? { ...q, [field]: value } : q));

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 className="fac-section-title">⚡ TestGen — AI Question Generator</h2>
          <p className="fac-section-sub">Generate MBA-quality assessment questions instantly using AI</p>
        </div>
        {generated.length > 0 && (
          <button className="fac-btn-gold" onClick={saveAsQuiz} disabled={saving}>
            <Save size={13} /> {saving ? "Saving..." : `Save as Assessment (${generated.length} Qs)`}
          </button>
        )}
      </div>

      <Msg type={msg.type} text={msg.text} />

      <div style={{ display: "grid", gridTemplateColumns: generated.length > 0 ? "380px 1fr" : "1fr", gap: 16 }}>
        {/* Generator form */}
        <div>
          <div className="fac-card" style={{ borderLeft: `3px solid ${T.gold}` }}>
            <div style={{ padding: "14px 17px", borderBottom: `1px solid ${T.border}`, background: T.goldSoft, display: "flex", alignItems: "center", gap: 9 }}>
              <Bot size={16} style={{ color: T.navy }} />
              <p style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Configure Question Generation</p>
            </div>
            <form onSubmit={handleGenerate} style={{ padding: 17, display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label className="fac-label">Course</label>
                <select className="fac-select" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}>
                  <option value="">Select course (optional)</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                </select>
              </div>
              <div>
                <label className="fac-label">Topic / Chapter *</label>
                <input className="fac-input" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} required placeholder="e.g. Porter's Five Forces, DCF Valuation, Supply Chain Management" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                <div>
                  <label className="fac-label">Difficulty</label>
                  <select className="fac-select" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                    {["easy", "medium", "hard", "mixed"].map(d => <option key={d} value={d} style={{ textTransform: "capitalize" }}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fac-label">No. of Questions</label>
                  <select className="fac-select" value={form.question_count} onChange={e => setForm(f => ({ ...f, question_count: parseInt(e.target.value) }))}>
                    {[5, 10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} questions</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="fac-label">Additional Context <span style={{ fontWeight: 400, color: T.subtle }}>(optional)</span></label>
                <textarea className="fac-textarea" rows={3} value={form.context} onChange={e => setForm(f => ({ ...f, context: e.target.value }))} placeholder="e.g. Focus on Indian FMCG industry, include recent case studies, align with MBA semester 2 syllabus..." />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className={`fac-toggle-track ${form.include_explanations ? "on" : ""}`} onClick={() => setForm(f => ({ ...f, include_explanations: !f.include_explanations }))}><div className="fac-toggle-thumb" /></div>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Include Answer Explanations</span>
              </div>
              <button type="submit" className="fac-btn-gold" disabled={generating} style={{ justifyContent: "center" }}>
                <Bot size={14} /> {generating ? `Generating ${form.question_count} questions…` : "Generate Questions with AI"}
              </button>
            </form>
          </div>

          {generating && (
            <div className="fac-card" style={{ padding: 22, textAlign: "center", marginTop: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg,${T.blueSoft},${T.goldSoft})`, border: `2px solid ${T.gold}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Bot size={24} style={{ color: T.navy }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Claude AI is generating questions…</p>
              <p style={{ fontSize: 13, color: T.muted }}>Creating {form.question_count} {form.difficulty} questions on "{form.topic}"</p>
            </div>
          )}
        </div>

        {/* Generated questions */}
        {generated.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{generated.length} Questions Generated</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="fac-btn-ghost" style={{ fontSize: 12 }} onClick={() => setGenerated([])}>Clear All</button>
                <button className="fac-btn-gold" onClick={saveAsQuiz} disabled={saving} style={{ fontSize: 12 }}>
                  <Save size={12} /> {saving ? "Saving..." : "Save as Assessment"}
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: "calc(100vh - 240px)", overflowY: "auto", paddingRight: 4 }}>
              {generated.map((q, idx) => (
                <div key={idx} className="fac-card" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: T.navy }}>Q{idx + 1}.</span>
                      <span className="fac-pill" style={{ fontSize: 10, background: `${T.gold}18`, color: T.gold, textTransform: "capitalize" }}>{q.difficulty}</span>
                      <span className="fac-pill fac-pill-pass" style={{ fontSize: 10 }}>✓ {q.correct_answer?.toUpperCase()}</span>
                      <span className="fac-pill fac-pill-navy" style={{ fontSize: 10 }}>{q.marks || 1} mark</span>
                    </div>
                    <button onClick={() => removeQuestion(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: T.red, padding: 2, flexShrink: 0 }}><X size={14} /></button>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: T.navy, marginBottom: 9 }}>{q.question}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: q.explanation ? 9 : 0 }}>
                    {["a", "b", "c", "d"].map(opt => (
                      <div key={opt} style={{ padding: "6px 10px", borderRadius: 6, background: q.correct_answer === opt ? T.greenSoft : T.bg, border: `1px solid ${q.correct_answer === opt ? T.green : T.border}`, fontSize: 12 }}>
                        <span style={{ fontWeight: 700, color: q.correct_answer === opt ? T.green : T.muted }}>{opt.toUpperCase()}.</span> {q[`option_${opt}`]}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div style={{ background: T.blueSoft, borderRadius: 6, padding: "7px 10px", fontSize: 12, color: T.navy }}>
                      <span style={{ fontWeight: 700 }}>Explanation: </span>{q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CORPORATE PORTAL (Faculty views student profiles for placement) ────────
function CorporatePortal() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  useEffect(() => {
    api.get("/faculty/corporate/profiles").then(r => {
      if (r.data.success) setStudents(r.data.profiles || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.skills?.toLowerCase().includes(q);
    const matchRole = !filterRole || s.preferred_role?.toLowerCase().includes(filterRole.toLowerCase());
    return matchSearch && matchRole;
  });

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 className="fac-section-title">Corporate Portal</h2>
          <p className="fac-section-sub">View student profiles visible to recruiters — {filtered.length} profiles</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="fac-search-bar">
            <Search size={13} style={{ color: T.muted, flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or skill..." style={{ background: "none", border: "none", outline: "none", fontSize: 13, width: 160 }} />
          </div>
          <input className="fac-input" style={{ width: 160 }} value={filterRole} onChange={e => setFilterRole(e.target.value)} placeholder="Filter by role..." />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="fac-card fac-empty"><Building2 size={36} style={{ color: T.border, margin: "0 auto 8px" }} /><p>No student profiles set to corporate-visible yet</p></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {filtered.map(student => (
            <div key={student.id} className="fac-card" style={{ padding: 17, cursor: "pointer" }} onClick={() => setSelected(student)}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Avatar name={student.full_name} photo={student.profile_photo} size={44} />
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 2 }}>{student.full_name}</h3>
                  <p style={{ fontSize: 12, color: T.muted }}>{student.current_designation || student.education_level || "Student"}</p>
                </div>
              </div>
              {student.bio && <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.55, marginBottom: 10, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{student.bio}</p>}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                {(student.skills || "").split(",").slice(0, 3).filter(Boolean).map(s => (
                  <span key={s} className="fac-pill fac-pill-navy" style={{ fontSize: 10 }}>{s.trim()}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {student.preferred_role && <span className="fac-pill fac-pill-gold" style={{ fontSize: 10 }}>🎯 {student.preferred_role}</span>}
                {student.work_mode && <span className="fac-pill fac-pill-gray" style={{ fontSize: 10 }}>{student.work_mode}</span>}
                {student.psycho_type && <span className="fac-pill" style={{ fontSize: 10, background: T.greenSoft, color: T.green }}>{student.psycho_type}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Full Profile Modal */}
      {selected && (
        <div className="fac-modal-bg">
          <div className="fac-modal" style={{ maxWidth: 680, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: T.navy }}>Student Profile</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={18} /></button>
            </div>

            {/* Header */}
            <div style={{ background: T.navy, borderRadius: 11, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name={selected.full_name} photo={selected.profile_photo} size={56} />
              <div>
                <h4 style={{ fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{selected.full_name}</h4>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>{selected.email} · {selected.phone}</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 2 }}>{selected.current_designation} {selected.current_employer ? `@ ${selected.current_employer}` : ""}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Bio */}
              {selected.bio && <div style={{ background: T.bg, borderRadius: 9, padding: "12px 14px" }}><p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 5 }}>About</p><p style={{ fontSize: 13, color: T.text, lineHeight: 1.65 }}>{selected.bio}</p></div>}

              {/* Grid info */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
                {[
                  ["Education", selected.education_level],
                  ["Institution", selected.institution],
                  ["Graduation", selected.graduation_year],
                  ["Experience", selected.work_experience_years],
                  ["Languages", selected.languages],
                  ["Notice Period", selected.notice_period],
                ].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} style={{ background: T.bg, padding: "9px 12px", borderRadius: 8 }}>
                    <p style={{ fontSize: 10, color: T.subtle, marginBottom: 2, textTransform: "uppercase", letterSpacing: ".05em" }}>{l}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {selected.skills && <div><p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 7 }}>Skills</p><div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{selected.skills.split(",").filter(Boolean).map(s => <span key={s} className="fac-pill fac-pill-navy">{s.trim()}</span>)}</div></div>}

              {/* Job Preferences */}
              {(selected.preferred_role || selected.preferred_location) && (
                <div style={{ background: T.goldSoft, border: `1px solid ${T.goldBorder}`, borderRadius: 9, padding: "12px 14px" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 9 }}>Job Preferences</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      ["Preferred Role", selected.preferred_role],
                      ["Preferred Location", selected.preferred_location],
                      ["Employment Type", selected.employment_type],
                      ["Work Mode", selected.work_mode],
                      ["Expected Salary", selected.preferred_salary_min && selected.preferred_salary_max ? `₹${selected.preferred_salary_min}–${selected.preferred_salary_max} LPA` : selected.preferred_salary_min ? `₹${selected.preferred_salary_min}+ LPA` : null],
                      ["Industries", selected.industries],
                    ].filter(([, v]) => v).map(([l, v]) => (
                      <div key={l}><p style={{ fontSize: 11, color: T.muted, marginBottom: 1 }}>{l}</p><p style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{v}</p></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Psychometric */}
              {selected.psycho_type && (
                <div style={{ background: T.navy, borderRadius: 9, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 28 }}>{selected.psycho_icon || "🧠"}</span>
                  <div><p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 2 }}>Psychometric Type</p><p style={{ fontSize: 14, fontWeight: 700, color: T.gold }}>{selected.psycho_type}</p><p style={{ fontSize: 12, color: "rgba(255,255,255,.55)" }}>{selected.psycho_desc}</p></div>
                </div>
              )}

              {/* Social links */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {selected.linkedin && <a href={selected.linkedin} target="_blank" rel="noopener noreferrer" className="fac-btn-outline" style={{ fontSize: 12 }}>LinkedIn →</a>}
                {selected.github && <a href={selected.github} target="_blank" rel="noopener noreferrer" className="fac-btn-outline" style={{ fontSize: 12 }}>GitHub →</a>}
                {selected.resume_url && <a href={selected.resume_url} target="_blank" rel="noopener noreferrer" className="fac-btn-primary" style={{ fontSize: 12 }}><Download size={12} /> Resume</a>}
              </div>
            </div>

            <button className="fac-btn-ghost" onClick={() => setSelected(null)} style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HELP & SUPPORT (Faculty) ───────────────────────────────────────────────
function FacultyHelp() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.post("/faculty/support", { query, category }); setSubmitted(true); setQuery(""); setTimeout(() => setSubmitted(false), 5000); }
    catch { alert("Error submitting query."); } finally { setSubmitting(false); }
  };

  const faqs = [
    { q: "How do I add course materials?", a: "Go to My Courses → Click Manage on your course → Add Content. You can upload videos, PDFs, PPTs or SCORM packages." },
    { q: "How do I grade student assignments?", a: "Go to Assignments → Find the assignment → Click 'Grade' next to a submitted assignment. You can also use AI Review to get grading suggestions." },
    { q: "How do I create an assessment with AI?", a: "Go to TestGen under the Teaching section. Enter your topic, difficulty level, and click Generate Questions with AI." },
    { q: "How do I schedule a live class?", a: "Go to Live Classes → Schedule Class. Enter the Zoom/Meet link, date, time and duration." },
    { q: "How do I answer student doubts?", a: "Go to Student Doubts. Select a doubt from the list on the left, type your answer in the right panel, and optionally mark it as the best answer." },
    { q: "How do I view student performance?", a: "Go to Student Performance under Analytics. Select a student to view their detailed progress, assessment scores and psychometric results." },
    { q: "How do I post a job opportunity?", a: "Go to Placements & Jobs → Post Opportunity. Fill in the job details and click Post Job." },
    { q: "How do I send a notification to students?", a: "Go to Notifications → Send Notification. Choose to send to all students or a specific course." },
  ];

  const CATEGORIES = [
    { value: "general", label: "General", icon: "💬" },
    { value: "technical", label: "Technical", icon: "🔧" },
    { value: "course", label: "Course", icon: "📚" },
    { value: "payment", label: "Payment", icon: "💳" },
  ];

  return (
    <div style={{ maxWidth: 780 }}>
      <div style={{ marginBottom: 22 }}><h2 className="fac-section-title">Help & Support</h2><p className="fac-section-sub">Faculty support — we respond within 24 hours</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.navy}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "13px 17px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 9, background: T.bg }}>
            <Send size={13} style={{ color: T.navy }} /><p style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Submit a Query</p>
          </div>
          <div style={{ padding: 17 }}>
            {submitted && <div className="fac-alert-success" style={{ marginBottom: 13 }}><CheckCircle size={13} /> Query submitted successfully!</div>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="fac-label">Category</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                      style={{ padding: "7px 9px", borderRadius: 7, border: `1.5px solid ${category === c.value ? T.navy : T.border}`, background: category === c.value ? T.navy : "transparent", color: category === c.value ? "#fff" : T.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="fac-label">Your Question</label><textarea className="fac-textarea" rows={5} value={query} onChange={e => setQuery(e.target.value)} required placeholder="Describe your question or issue..." /></div>
              <button type="submit" className="fac-btn-primary" disabled={submitting} style={{ justifyContent: "center" }}><Send size={13} /> {submitting ? "Submitting..." : "Submit Query"}</button>
            </form>
          </div>
        </div>
        <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.gold}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "13px 17px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 9, background: T.bg }}>
            <HelpCircle size={13} style={{ color: T.gold }} /><p style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Faculty FAQs</p>
          </div>
          <div style={{ padding: 13, display: "flex", flexDirection: "column", gap: 6, maxHeight: 420, overflowY: "auto" }}>
            {faqs.map((f, i) => (
              <details key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 7, overflow: "hidden" }}>
                <summary style={{ fontWeight: 600, fontSize: 13, cursor: "pointer", color: T.navy, padding: "10px 13px", background: T.bg, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", userSelect: "none" }}>{f.q}<ChevronRight size={12} style={{ color: T.subtle, flexShrink: 0 }} /></summary>
                <p style={{ padding: "9px 13px", fontSize: 13, color: T.muted, lineHeight: 1.6, background: "#fff", borderTop: `1px solid ${T.border}` }}>{f.a}</p>
              </details>
            ))}
          </div>
          <div style={{ padding: "10px 17px", borderTop: `1px solid ${T.border}`, background: T.bg }}>
            <p style={{ fontSize: 12, color: T.muted, textAlign: "center" }}>Email: <a href="mailto:faculty@upskillize.com" style={{ color: T.navy, fontWeight: 600, textDecoration: "none" }}>faculty@upskillize.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── SEARCH ────────────────────────────────────────────────────────────────
function FacultySearch({ allNavItems }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const navigate = useNavigate();
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSearch = (val) => {
    setQuery(val); setHighlighted(-1);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    const q = val.toLowerCase();
    const r = allNavItems.filter(i =>
      i.label.toLowerCase().includes(q) || (i.keywords||[]).some(k => k.includes(q)) || i.section.toLowerCase().includes(q)
    );
    setResults(r); setOpen(true);
  };

  const go = (path) => { setQuery(""); setResults([]); setOpen(false); setHighlighted(-1); navigate(path); };

  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h+1, results.length-1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h-1, 0)); }
    else if (e.key === "Enter" && highlighted >= 0) { go(results[highlighted].path); }
    else if (e.key === "Escape") { setOpen(false); setQuery(""); }
  };

  const hlText = (text, q) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return <>{text.slice(0,idx)}<mark style={{ background:T.goldSoft,color:T.navy,fontWeight:800,borderRadius:2,padding:"0 1px" }}>{text.slice(idx,idx+q.length)}</mark>{text.slice(idx+q.length)}</>;
  };

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <div className="fac-search-bar" style={{ width:240 }}>
        <Search size={13} style={{ color:T.muted,flexShrink:0 }}/>
        <input
          ref={inputRef}
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => query && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages…"
          style={{ background:"none",border:"none",outline:"none",fontSize:13,width:"100%",fontFamily:"'Plus Jakarta Sans',sans-serif" }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            style={{ background:"none",border:"none",cursor:"pointer",color:T.subtle,padding:0,display:"flex",alignItems:"center" }}>
            <X size={12}/>
          </button>
        )}
      </div>
      {open && (
        <>
          <div style={{ position:"absolute",top:"calc(100% + 6px)",left:0,background:"#fff",border:`1.5px solid ${T.border}`,borderRadius:12,boxShadow:"0 10px 28px rgba(26,39,68,.14)",zIndex:200,maxHeight:320,overflowY:"auto",minWidth:280 }}>
            {results.length === 0 ? (
              <div style={{ padding:"16px 14px",textAlign:"center",fontSize:13,color:T.subtle }}>
                No results for "<strong>{query}</strong>"
              </div>
            ) : (
              <>
                <div style={{ padding:"7px 13px 5px",fontSize:10,color:T.subtle,fontWeight:700,letterSpacing:".08em",borderBottom:`1px solid ${T.border}` }}>
                  {results.length} RESULT{results.length!==1?"S":""}  ·  ↑↓ to navigate · Enter to open
                </div>
                {results.map((item,i) => {
                  const Icon = item.icon;
                  const isH = i === highlighted;
                  return (
                    <div key={item.path} onClick={() => go(item.path)} onMouseEnter={() => setHighlighted(i)}
                      style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 13px",cursor:"pointer",background:isH?T.blueSoft:"transparent",transition:"background .1s",borderBottom:i<results.length-1?`1px solid ${T.border}`:"none" }}>
                      <div style={{ width:30,height:30,borderRadius:7,background:isH?T.navy:T.bg,border:`1px solid ${isH?T.navy:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s" }}>
                        <Icon size={13} style={{ color:isH?"#fff":T.navy }}/>
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <p style={{ fontSize:13,fontWeight:700,color:T.navy }}>{hlText(item.label, query)}</p>
                        <p style={{ fontSize:11,color:T.subtle }}>{item.section}</p>
                      </div>
                      <ChevronRight size={12} style={{ color:T.subtle,flexShrink:0 }}/>
                    </div>
                  );
                })}
              </>
            )}
          </div>
          <div style={{ position:"fixed",inset:0,zIndex:199 }} onClick={() => setOpen(false)}/>
        </>
      )}
    </div>
  );
}

// ─── MAIN FACULTY DASHBOARD ────────────────────────────────────────────────
export default function FacultyDashboard() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { ToastEl } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get("/notifications").then(r => {
      if (r.data.success) {
        setNotifications(r.data.notifications || []);
        setUnreadCount((r.data.notifications || []).filter(n => !(n.is_read ?? n.read ?? false)).length);
      }
    }).catch(() => {});
  }, []);

  // ── Nav Sections ──
  const navSections = [
    {
      label: "Teaching",
      items: [
        { path: "/faculty",              label: "Overview",          icon: BarChart3,    keywords: ["dashboard", "home", "stats", "summary"] },
        { path: "/faculty/courses",      label: "My Courses",        icon: BookOpen,     keywords: ["course", "content", "create", "materials"] },
        { path: "/faculty/students",     label: "Students",          icon: Users,        keywords: ["student", "enrolled", "progress", "learner"] },
        { path: "/faculty/assignments",  label: "Assignments",       icon: FilePen,      keywords: ["assignment", "grade", "submit", "homework"] },
        { path: "/faculty/assessments",  label: "Assessments",       icon: ClipboardList,keywords: ["quiz", "test", "mcq", "assessment", "exam"] },
        { path: "/faculty/classes",      label: "Live Classes",      icon: CalendarDays, keywords: ["live", "zoom", "schedule", "class", "session"] },
      ],
    },
    {
      label: "AI Tools",
      items: [
        { path: "/faculty/ai-review",    label: "AI Review",         icon: Bot,          keywords: ["ai", "grade", "review", "automatic", "claude"] },
        { path: "/faculty/testgen",      label: "TestGen",           icon: Zap,          keywords: ["testgen", "generate", "questions", "ai", "create"] },
      ],
    },
    {
      label: "Analytics",
      items: [
        { path: "/faculty/analytics",    label: "Analytics",         icon: BarChart2,    keywords: ["analytics", "report", "data", "stats", "insight"] },
        { path: "/faculty/performance",  label: "Student Performance",icon: TrendingUp,  keywords: ["performance", "progress", "scores", "track"] },
        { path: "/faculty/corporate",    label: "Corporate Portal",  icon: Building2,    keywords: ["corporate", "recruiter", "placement", "profile", "hire"] },
      ],
    },
    {
      label: "Career & Community",
      items: [
        { path: "/faculty/jobs",         label: "Placements & Jobs", icon: Briefcase,    keywords: ["job", "internship", "placement", "post", "opportunity"] },
        { path: "/faculty/forum",        label: "Discussion Forum",  icon: MessageSquare,keywords: ["forum", "discuss", "thread", "post", "community"] },
        { path: "/faculty/doubts",       label: "Student Doubts",    icon: HelpCircle,   keywords: ["doubt", "question", "answer", "resolve"] },
      ],
    },
    {
      label: "Account",
      items: [
        { path: "/faculty/notifications",label: "Notifications",     icon: Bell,         keywords: ["alert", "announcement", "send", "notify"] },
        { path: "/faculty/help",         label: "Help & Support",    icon: HelpCircle,   keywords: ["help", "support", "faq", "contact"] },
        { path: "/faculty/profile",      label: "Profile",           icon: User,         keywords: ["profile", "photo", "bio", "edit", "personal"] },
        { path: "/faculty/settings",     label: "Settings",          icon: Settings,     keywords: ["account", "password", "preferences", "security"] },
      ],
    },
  ];

  const allNavItems = navSections.flatMap(s => s.items.map(i => ({ ...i, section: s.label })));
  const closeAll = () => { setUserMenuOpen(false); setShowNotifDropdown(false); };

  const currentLabel = (() => {
    const exact = allNavItems.find(i => i.path === location.pathname);
    if (exact) return exact.label;
    if (location.pathname.includes("/courses/") && location.pathname !== "/faculty/courses") return "Course Manager";
    if (location.pathname.includes("/assessments/new")) return "Create Assessment";
    if (location.pathname.includes("/classes/new")) return "Schedule Class";
    if (location.pathname.includes("/jobs/new")) return "Post Opportunity";
    if (location.pathname.includes("/forum/thread")) return "Thread Detail";
    return "Faculty Dashboard";
  })();

  return (
    <div className="fac-root" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <FacultyStyles />
      {ToastEl}

      {/* ── Sidebar ── */}
      <aside className="fac-sidebar" style={{ width: sidebarOpen ? 230 : 0, overflow: sidebarOpen ? "auto" : "hidden", transition: "width .25s", flexShrink: 0 }}>
        <div className="fac-sidebar-brand">
          <div className="fac-brand-role">Upskillize</div>
          <div className="fac-brand-name">
            <img src="/project.png" alt="Logo" style={{ height: 26, width: "auto", display: "block" }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
            <span style={{ display: "none" }}>Faculty Portal</span>
          </div>
          <div className="fac-brand-sub">Faculty Dashboard</div>
        </div>

        <div style={{ padding: "9px 16px" }}>
          <div style={{ background: "rgba(184,150,11,.18)", color: T.gold, fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 6, textAlign: "center" }}>✦ Faculty Access</div>
        </div>

        <nav style={{ flex: 1 }}>
          {navSections.map(section => (
            <div key={section.label} className="fac-nav-section">
              <div className="fac-nav-label">{section.label}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className={`fac-nav-item ${isActive ? "active" : ""}`}>
                    <div className={`fac-nav-dot ${isActive ? "active" : ""}`} />
                    <Icon size={14} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 13 }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="fac-sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {user?.profile_photo
  ? <img
      src={user.profile_photo.startsWith('http')
  ? user.profile_photo
  : `${BASE_URL}${user.profile_photo}`}
      alt=""
      style={{ width:32,height:32,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}
      onError={(e)=>{ e.target.style.display='none'; }}
    />
              : <Avatar name={user?.full_name} size={32} />}
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", fontWeight: 600 }}>{user?.full_name?.split(" ")[0] || "Faculty"}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>Faculty</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Topbar ── */}
        <header className="fac-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 11, flex: 1, minWidth: 0 }}>
            <button onClick={() => setSidebarOpen(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 3 }}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <div className="fac-page-title">{currentLabel}</div>
              <div className="fac-page-meta">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <FacultySearch allNavItems={allNavItems} />

            {/* Notifications bell */}
            <div style={{ position: "relative" }}>
              <button className="fac-icon-btn" onClick={() => { closeAll(); setShowNotifDropdown(v => !v); }}>
                <Bell size={15} />
                {unreadCount > 0 && <span style={{ position: "absolute", top: 3, right: 3, width: 7, height: 7, borderRadius: "50%", background: T.red }} />}
              </button>
              {showNotifDropdown && (
                <>
                  <div className="fac-dropdown" style={{ width: 300 }}>
                    <div style={{ padding: "11px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                      <button onClick={() => setShowNotifDropdown(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted }}><X size={13} /></button>
                    </div>
                    <div style={{ maxHeight: 260, overflowY: "auto" }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 18, textAlign: "center", fontSize: 13, color: T.subtle }}>No notifications</div>
                      ) : notifications.slice(0, 5).map(n => {
                        const msg = n.message || n.body || n.content || "";
                        return (
                          <div key={n.id} style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}`, background: !(n.is_read ?? n.read) ? T.bg : "#fff" }}>
                            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 1 }}>{n.title}</p>
                            {msg && msg.toLowerCase() !== "na" && <p style={{ fontSize: 12, color: T.muted }}>{msg}</p>}
                          </div>
                        );
                      })}
                    </div>
                    <Link to="/faculty/notifications" onClick={closeAll} style={{ display: "block", padding: "9px 14px", textAlign: "center", fontSize: 12, color: T.navy, fontWeight: 700, textDecoration: "none", borderTop: `1px solid ${T.border}` }}>View All →</Link>
                  </div>
                  <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={() => setShowNotifDropdown(false)} />
                </>
              )}
            </div>

            {/* User menu */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { closeAll(); setUserMenuOpen(v => !v); }}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px 5px 5px", borderRadius: 9, border: `1.5px solid ${T.border}`, background: "#fff", cursor: "pointer", boxShadow: "0 1px 4px rgba(26,39,68,.06)" }}>
                {user?.profile_photo
                  ? <img src={user.profile_photo} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                  : <Avatar name={user?.full_name} size={32} />}
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>{user?.full_name?.split(" ")[0] || "Faculty"}</div>
                  <div style={{ fontSize: 11, color: T.subtle, lineHeight: 1.2 }}>Faculty</div>
                </div>
                <ChevronDown size={12} style={{ color: T.subtle, transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform .2s", marginLeft: 2 }} />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fac-dropdown" style={{ width: 200 }}>
                    <div style={{ padding: "12px 14px 8px", borderBottom: `1px solid ${T.border}` }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{user?.full_name || "Faculty"}</p>
                      <p style={{ fontSize: 12, color: T.subtle }}>{user?.email || ""}</p>
                    </div>
                    <div style={{ padding: 4 }}>
                      <Link to="/faculty/profile"       onClick={closeAll} className="fac-user-menu-item"><User size={13} /> Profile</Link>
                      <Link to="/faculty/analytics"     onClick={closeAll} className="fac-user-menu-item"><BarChart2 size={13} /> Analytics</Link>
                      <Link to="/faculty/testgen"       onClick={closeAll} className="fac-user-menu-item"><Zap size={13} /> TestGen</Link>
                      <Link to="/faculty/settings"      onClick={closeAll} className="fac-user-menu-item"><Settings size={13} /> Settings</Link>
                      <hr className="fac-divider" />
                      <button onClick={() => { logout(); navigate("/login"); }} className="fac-user-menu-item danger"><LogOut size={13} /> Logout</button>
                    </div>
                  </div>
                  <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={closeAll} />
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main style={{ flex: 1, overflowY: "auto", background: T.bg }}>
          <div className="fac-content">
            <Routes>
              {/* Teaching */}
              <Route path="/"                        element={<Overview />} />
              <Route path="/courses"                 element={<FacultyCourses />} />
              <Route path="/courses/new"             element={<FacultyCourses />} />
              <Route path="/courses/:courseId"       element={<CourseDetail />} />
              <Route path="/students"                element={<FacultyStudents />} />
              <Route path="/assignments"             element={<FacultyAssignments />} />
              <Route path="/assessments"             element={<FacultyAssessments />} />
              <Route path="/assessments/new"         element={<FacultyAssessments />} />
              <Route path="/classes"                 element={<FacultyClasses />} />
              <Route path="/classes/new"             element={<FacultyClasses />} />
              {/* AI Tools */}
              <Route path="/ai-review"               element={<FacultyAIReview />} />
              <Route path="/testgen"                 element={<FacultyTestGen />} />
              {/* Analytics */}
              <Route path="/analytics"               element={<FacultyAnalytics />} />
              <Route path="/performance"             element={<StudentPerformance />} />
              <Route path="/corporate"               element={<CorporatePortal />} />
              {/* Career & Community */}
              <Route path="/jobs"                    element={<FacultyJobs />} />
              <Route path="/jobs/new"                element={<FacultyJobs />} />
              <Route path="/forum"                   element={<FacultyForum />} />
              <Route path="/forum/thread/:threadId"  element={<FacultyThreadDetail />} />
              <Route path="/doubts"                  element={<FacultyDoubts />} />
              {/* Account */}
              <Route path="/notifications"           element={<FacultyNotifications />} />
              <Route path="/help"                    element={<FacultyHelp />} />
              <Route path="/settings"                element={<FacultySettings />} />
              <Route path="/profile" element={<FacultyProfile />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}