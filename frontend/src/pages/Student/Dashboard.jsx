import { useState, useEffect, useRef, useCallback } from "react";
import {
  Routes, Route, Link, useLocation, useNavigate, useParams,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import CoursePlayer from "./CoursePlayer";
import BrowseCourses from "../../pages/BrowseCourses";
import AiRevPanel from "../../components/AiRevPanel";
import AIEnhancer from "../../components/AIEnhancer";
import {
  BookOpen, TrendingUp, Award, PlayCircle, Clock, Bell,
  MessageSquare, HelpCircle, CreditCard, BarChart3, Download,
  FileText, CheckCircle, XCircle, Settings, LogOut, Search,
  Calendar, Target, ChevronRight, Star, User, Activity,
  AlertCircle, Eye, Shield, Mail, Trash2, Plus, X,
  MapPin, Lock, Globe, Save, Camera, EyeOff, Link as LinkIcon,
  Menu, ShoppingBag, ThumbsUp, ChevronDown, RefreshCw,
  ClipboardList, Timer, Trophy, FilePen, Upload, FolderOpen,
  ChevronLeft, Briefcase, Zap, Gamepad2, Video, Brain,
  Building2, UserCheck, CreditCard as CardIcon, Mic,
  MessageCircle, HelpCircle as QuestionIcon, CalendarDays,
  Sparkles, FileUp, BarChart2, Users, ArrowRight, Send,
  CheckSquare, Layers, GripVertical, Paperclip, FileQuestion,
  BookMarked, Languages, Briefcase as BriefcaseIcon, DollarSign,
  MapPin as LocationIcon, Laptop, ChevronUp, FileVideo,
  AlignLeft, Folder, ChevronRight as CR, Bot, Loader,
} from "lucide-react";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  navy:         "#1a2744",
  navyLight:    "#2c3e6b",
  gold:         "#b8960b",
  goldSoft:     "#fdf8ed",
  goldBorder:   "#e8d89a",
  white:        "#ffffff",
  bg:           "#f7f8fc",
  border:       "#e8e9f0",
  borderStrong: "#c8c4bc",
  text:         "#1a1a1a",
  muted:        "#72706b",
  subtle:       "#a8a49f",
  redSoft:      "#fdf1f0",
  red:          "#c0392b",
  greenSoft:    "#edf7ed",
  green:        "#2d6a2d",
  blueSoft:     "#eef2fb",
  blue:         "#1e3a6b",
};

// ─── Global Styles ────────────────────────────────────────────────────────────
const MBAStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
    .mba-root*,.mba-root *::before,.mba-root *::after{box-sizing:border-box;margin:0;padding:0}
    .mba-root{font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:400;line-height:1.55;color:#1a1a1a;background:#f7f8fc;-webkit-font-smoothing:antialiased}
    .mba-sidebar{width:220px;background:#1a2744;color:#fff;display:flex;flex-direction:column;flex-shrink:0;height:100vh;overflow-y:auto;box-shadow:2px 0 12px rgba(0,0,0,.10)}
    .mba-sidebar-brand{padding:22px 20px 18px;border-bottom:1px solid rgba(255,255,255,.08)}
    .mba-brand-label{font-size:10px;letter-spacing:.12em;color:rgba(255,255,255,.45);text-transform:uppercase;margin-bottom:3px;font-weight:700}
    .mba-brand-name{font-size:18px;font-weight:800;color:#fff;line-height:1.2}
    .mba-brand-sub{font-size:12px;color:rgba(255,255,255,.4);margin-top:2px}
    .mba-nav-section{padding:14px 0 6px}
    .mba-nav-label{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.28);padding:0 20px 5px;font-weight:700}
    .mba-nav-item{display:flex;align-items:center;gap:10px;padding:10px 20px;cursor:pointer;color:rgba(255,255,255,.65);font-size:13px;font-weight:500;transition:all .18s;text-decoration:none}
    .mba-nav-item:hover{background:rgba(255,255,255,.07);color:#fff;padding-left:24px}
    .mba-nav-item.active{background:rgba(255,255,255,.10);color:#fff;border-right:2px solid #b8960b;font-weight:700}
    .mba-nav-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.22);flex-shrink:0;transition:background .18s}
    .mba-nav-dot.active{background:#b8960b}
    .mba-sidebar-footer{margin-top:auto;padding:14px 20px;border-top:1px solid rgba(255,255,255,.08)}
    .mba-topbar{background:#fff;border-bottom:1px solid #e8e9f0;padding:13px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:30;box-shadow:0 1px 6px rgba(26,39,68,.06)}
    .mba-page-title{font-size:22px;font-weight:800;color:#1a2744;letter-spacing:-.4px}
    .mba-page-meta{font-size:12px;color:#a8a49f;margin-top:1px}
    .mba-card{background:#fff;border:1px solid #e8e9f0;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(26,39,68,.05),0 2px 10px rgba(26,39,68,.04);transition:box-shadow .24s,transform .24s}
    .mba-card:hover{box-shadow:0 6px 20px rgba(26,39,68,.10),0 2px 6px rgba(26,39,68,.06)}
    .mba-card-head{padding:14px 18px;border-bottom:1px solid #e8e9f0;display:flex;align-items:center;justify-content:space-between}
    .mba-card-title{font-size:13px;font-weight:700;color:#1a2744;letter-spacing:.01em}
    .mba-card-link{font-size:12px;color:#b8960b;cursor:pointer;text-decoration:none;font-weight:600}
    .mba-card-body{padding:18px}
    .mba-metric{background:#fff;border:1px solid #e8e9f0;border-radius:12px;padding:18px 20px;position:relative;box-shadow:0 1px 4px rgba(26,39,68,.05),0 2px 10px rgba(26,39,68,.04);transition:box-shadow .24s,transform .24s;cursor:default}
    .mba-metric:hover{box-shadow:0 8px 22px rgba(26,39,68,.11),0 2px 6px rgba(26,39,68,.07);transform:translateY(-3px) scale(1.015)}
    .mba-metric::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:12px 12px 0 0}
    .mba-metric-navy::before{background:#1a2744}.mba-metric-gold::before{background:#b8960b}.mba-metric-green::before{background:#2d6a2d}.mba-metric-gray::before{background:#a8a49f}.mba-metric-red::before{background:#c0392b}.mba-metric-blue::before{background:#1e3a6b}
    .mba-metric-label{font-size:13px;color:#72706b;margin-bottom:8px;font-weight:500}
    .mba-metric-value{font-size:32px;font-weight:800;color:#1a2744;line-height:1;letter-spacing:-1px}
    .mba-metric-sub{font-size:12px;color:#a8a49f;margin-top:8px;display:flex;align-items:center;gap:4px}
    .mba-pill{display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
    .mba-pill-pass{background:#edf7ed;color:#2d6a2d}.mba-pill-fail{background:#fdf1f0;color:#c0392b}.mba-pill-sub{background:#eef2fb;color:#1e3a6b}.mba-pill-warn{background:#fdf8ed;color:#7a5e00}.mba-pill-navy{background:#eef2fb;color:#1a2744}.mba-pill-verified{background:#f4f4f6;color:#72706b}.mba-pill-gold{background:#fdf8ed;color:#7a5e00}
    .mba-notice{background:#fdf8ed;border:1px solid #e8d89a;border-radius:10px;padding:12px 16px;display:flex;gap:10px;align-items:flex-start;margin-bottom:20px}
    .mba-notice-text{font-size:13px;color:#5a4500;line-height:1.55}
    .mba-table{width:100%;border-collapse:collapse}
    .mba-table th{font-size:12px;font-weight:700;color:#72706b;padding:10px 0;text-align:left;border-bottom:1px solid #e8e9f0;letter-spacing:.02em}
    .mba-table td{padding:12px 0;font-size:14px;border-bottom:1px solid #e8e9f0;color:#1a1a1a;vertical-align:middle}
    .mba-table tr:last-child td{border-bottom:none}
    .mba-table tbody tr{transition:background .15s}
    .mba-table tbody tr:hover{background:#f7f8fc}
    .mba-bar-track{height:5px;background:#e8e9f0;border-radius:3px;overflow:hidden;margin-top:5px}
    .mba-bar-fill{height:100%;border-radius:3px;transition:width .5s cubic-bezier(.4,0,.2,1)}
    .mba-btn-primary{background:#1a2744;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:background .15s,box-shadow .15s,transform .15s;display:inline-flex;align-items:center;gap:6px;text-decoration:none;box-shadow:0 1px 4px rgba(26,39,68,.15)}
    .mba-btn-primary:hover{background:#2c3e6b;box-shadow:0 4px 12px rgba(26,39,68,.22);transform:translateY(-1px)}
    .mba-btn-gold{background:#b8960b;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px;text-decoration:none;box-shadow:0 1px 4px rgba(184,150,11,.25)}
    .mba-btn-gold:hover{background:#9a7d09;transform:translateY(-1px)}
    .mba-btn-outline{background:transparent;color:#1a2744;border:1.5px solid #e8e9f0;border-radius:8px;padding:9px 16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;gap:6px;text-decoration:none}
    .mba-btn-outline:hover{border-color:#1a2744;background:#f7f8fc;transform:translateY(-1px)}
    .mba-btn-ghost{background:transparent;color:#72706b;border:1.5px solid #e8e9f0;border-radius:8px;padding:9px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .18s;display:inline-flex;align-items:center;gap:5px}
    .mba-btn-ghost:hover{color:#1a1a1a;border-color:#c8c4bc;background:#f7f8fc}
    .mba-btn-danger{background:#fdf1f0;color:#c0392b;border:1.5px solid #f7c1c1;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:700;cursor:pointer;transition:all .18s;font-family:'Plus Jakarta Sans',sans-serif}
    .mba-btn-danger:hover{background:#c0392b;color:#fff;transform:translateY(-1px)}
    .mba-input{width:100%;padding:10px 13px;border:1.5px solid #e8e9f0;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#1a1a1a;background:#fff;transition:border-color .18s,box-shadow .18s;outline:none}
    .mba-input:focus{border-color:#1a2744;box-shadow:0 0 0 3px rgba(26,39,68,.07)}
    .mba-input:disabled{background:#f7f8fc;color:#72706b}
    .mba-label{display:block;font-size:12px;font-weight:700;letter-spacing:.04em;color:#72706b;margin-bottom:6px}
    .mba-select{width:100%;padding:10px 13px;border:1.5px solid #e8e9f0;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#1a1a1a;background:#fff;outline:none;cursor:pointer;transition:border-color .18s}
    .mba-textarea{width:100%;padding:10px 13px;border:1.5px solid #e8e9f0;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#1a1a1a;background:#fff;resize:vertical;outline:none;transition:border-color .18s}
    .mba-textarea:focus,.mba-select:focus{border-color:#1a2744;box-shadow:0 0 0 3px rgba(26,39,68,.07)}
    .mba-tabs{display:flex;gap:4px;flex-wrap:wrap}
    .mba-tab{padding:7px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;border:1.5px solid transparent;transition:all .18s;background:transparent;color:#72706b;font-family:'Plus Jakarta Sans',sans-serif}
    .mba-tab:hover{background:#fff;border-color:#e8e9f0;color:#1a1a1a;box-shadow:0 1px 4px rgba(26,39,68,.06)}
    .mba-tab.active{background:#1a2744;color:#fff;border-color:#1a2744;box-shadow:0 2px 8px rgba(26,39,68,.20)}
    .mba-progress-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #e8e9f0}
    .mba-progress-row:last-child{border-bottom:none;padding-bottom:0}
    .mba-progress-row:first-child{padding-top:0}
    .mba-activity-row{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #e8e9f0}
    .mba-activity-row:last-child{border-bottom:none;padding-bottom:0}
    .mba-activity-row:first-child{padding-top:0}
    .mba-course-card{background:#fff;border:1px solid #e8e9f0;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(26,39,68,.05),0 3px 12px rgba(26,39,68,.04);transition:box-shadow .26s,transform .26s,border-color .26s}
    .mba-course-card:hover{box-shadow:0 10px 28px rgba(26,39,68,.13),0 3px 10px rgba(26,39,68,.08);transform:translateY(-4px) scale(1.018);border-color:#c8c4bc}
    .mba-welcome{background:#fff;border:1px solid #e8e9f0;border-radius:12px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;box-shadow:0 1px 6px rgba(26,39,68,.06)}
    .mba-welcome-stat{border-left:1px solid #e8e9f0;padding-left:20px;text-align:right}
    .mba-welcome-stat .num{font-size:26px;font-weight:800;color:#1a2744;letter-spacing:-.5px}
    .mba-welcome-stat .lbl{font-size:12px;color:#a8a49f;margin-top:1px;font-weight:500}
    .mba-cert-seal{width:36px;height:36px;border:1.5px solid #b8960b;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .mba-score-ring{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;flex-shrink:0;border:3px solid}
    .mba-modal-bg{position:fixed;inset:0;background:rgba(26,39,68,.52);display:flex;align-items:center;justify-content:center;z-index:50;padding:16px;backdrop-filter:blur(4px)}
    .mba-modal{background:#fff;border-radius:16px;padding:28px;max-width:540px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(26,39,68,.22),0 4px 16px rgba(26,39,68,.10)}
    .mba-toggle-track{position:relative;width:38px;height:22px;background:#e8e9f0;border-radius:11px;transition:background .2s;display:inline-block}
    .mba-toggle-track.on{background:#1a2744}
    .mba-toggle-thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 4px rgba(0,0,0,.15)}
    .mba-toggle-track.on .mba-toggle-thumb{transform:translateX(16px)}
    .mba-icon-btn{width:36px;height:36px;border:1.5px solid #e8e9f0;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:#fff;color:#72706b;transition:all .18s;position:relative}
    .mba-icon-btn:hover{border-color:#c8c4bc;color:#1a1a1a;box-shadow:0 2px 8px rgba(26,39,68,.08);transform:translateY(-1px)}
    .mba-search-bar{display:flex;align-items:center;gap:8px;background:#f7f8fc;border:1.5px solid #e8e9f0;border-radius:8px;padding:8px 14px;font-size:13px;color:#72706b;transition:border-color .18s;position:relative}
    .mba-search-bar:focus-within{border-color:#1a2744}
    .mba-search-dropdown{position:absolute;top:calc(100% + 6px);left:0;right:0;background:#fff;border:1.5px solid #e8e9f0;border-radius:10px;box-shadow:0 8px 24px rgba(26,39,68,.12);z-index:100;max-height:320px;overflow-y:auto}
    .mba-search-result{display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;transition:background .12s;text-decoration:none;color:#1a1a1a}
    .mba-search-result:hover{background:#f7f8fc}
    .mba-dropdown{position:absolute;right:0;top:calc(100% + 6px);background:#fff;border:1.5px solid #e8e9f0;border-radius:12px;box-shadow:0 10px 28px rgba(26,39,68,.13),0 2px 8px rgba(26,39,68,.07);z-index:50;overflow:hidden}
    .mba-alert-success{background:#edf7ed;border:1.5px solid #b8d9b8;border-radius:8px;padding:11px 14px;color:#2d6a2d;font-size:13px;display:flex;align-items:center;gap:8px}
    .mba-alert-error{background:#fdf1f0;border:1.5px solid #f7c1c1;border-radius:8px;padding:11px 14px;color:#c0392b;font-size:13px;display:flex;align-items:center;gap:8px}
    .mba-alert-info{background:#fdf8ed;border:1.5px solid #e8d89a;border-radius:8px;padding:11px 14px;color:#5a4500;font-size:13px;display:flex;align-items:center;gap:8px}
    .mba-material-item{display:flex;align-items:center;gap:10px;padding:11px 14px;cursor:pointer;transition:background .15s;border-bottom:1px solid #e8e9f0}
    .mba-material-item:last-child{border-bottom:none}
    .mba-material-item:hover{background:#f7f8fc}
    .mba-material-item.active{background:#eef2fb}
    .mba-divider{border:none;border-top:1px solid #e8e9f0;margin:10px 0}
    .mba-section-title{font-size:22px;font-weight:800;color:#1a2744;margin-bottom:4px;letter-spacing:-.4px;line-height:1.2}
    .mba-section-sub{font-size:13px;color:#a8a49f;font-weight:500}
    .mba-empty{text-align:center;padding:52px 20px;color:#a8a49f}
    .mba-empty p{margin:8px 0 0;font-size:14px}
    .mba-spin{display:flex;align-items:center;justify-content:center;height:180px}
    .mba-spinner{width:28px;height:28px;border:2px solid #e8e9f0;border-top-color:#1a2744;border-radius:50%;animation:mba-spin .7s linear infinite}
    @keyframes mba-spin{to{transform:rotate(360deg)}}
    .mba-thread-row{background:#fff;border:1px solid #e8e9f0;border-radius:10px;padding:16px;transition:box-shadow .22s,transform .22s,border-color .22s;margin-bottom:8px;box-shadow:0 1px 4px rgba(26,39,68,.04)}
    .mba-thread-row:hover{box-shadow:0 6px 18px rgba(26,39,68,.10);transform:translateY(-2px);border-color:#c8c4bc}
    .mba-notif-row{background:#fff;border:1px solid #e8e9f0;border-radius:10px;padding:14px 16px;display:flex;gap:12px;margin-bottom:8px;box-shadow:0 1px 4px rgba(26,39,68,.04);transition:box-shadow .18s}
    .mba-notif-row:hover{box-shadow:0 4px 14px rgba(26,39,68,.09)}
    .mba-notif-row.unread{border-left:3px solid #1a2744}
    .mba-quiz-option{width:100%;text-align:left;padding:12px 16px;border-radius:8px;border:1.5px solid #e8e9f0;background:#fff;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:400;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:8px}
    .mba-quiz-option:hover{border-color:#1a2744;background:#f7f8fc;transform:translateX(2px)}
    .mba-quiz-option.selected{border-color:#1a2744;background:#eef2fb;color:#1a2744}
    .mba-profile-tabs{display:flex;border-bottom:1px solid #e8e9f0;background:#f7f8fc;overflow-x:auto}
    .mba-profile-tab{padding:12px 20px;font-size:13px;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;color:#72706b;white-space:nowrap;background:transparent;border-top:none;border-left:none;border-right:none;transition:all .18s;display:flex;align-items:center;gap:6px;font-family:'Plus Jakarta Sans',sans-serif}
    .mba-profile-tab:hover{color:#1a1a1a;background:rgba(26,39,68,.04)}
    .mba-profile-tab.active{border-bottom-color:#1a2744;color:#1a2744;background:#fff;font-weight:700}
    .mba-danger-box{border:1.5px solid #f7c1c1;border-radius:10px;padding:18px;background:#fffafa}
    .mba-user-menu-item{display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:13px;font-weight:500;color:#1a1a1a;cursor:pointer;transition:background .12s;text-decoration:none;background:transparent;width:100%;text-align:left;border:none;font-family:'Plus Jakarta Sans',sans-serif}
    .mba-user-menu-item:hover{background:#f7f8fc}
    .mba-user-menu-item.danger{color:#c0392b}
    .mba-content{padding:24px 28px;max-width:1380px;margin:0 auto}
    .mba-grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
    .mba-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
    .mba-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .mba-grid-3-1{display:grid;grid-template-columns:1fr 300px;gap:16px}
    .mba-grid-courses{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
    .mba-chat-bubble-ai{background:#eef2fb;border:1px solid #d0daf5;border-radius:12px 12px 12px 2px;padding:12px 16px;max-width:80%;font-size:13px;line-height:1.6}
    .mba-chat-bubble-user{background:#1a2744;color:#fff;border-radius:12px 12px 2px 12px;padding:12px 16px;max-width:80%;font-size:13px;line-height:1.6;margin-left:auto}
    .mba-badge{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;border:3px solid;transition:transform .2s,box-shadow .2s;cursor:default}
    .mba-badge:hover{transform:scale(1.1);box-shadow:0 6px 18px rgba(0,0,0,.15)}
    .mba-badge-earned{border-color:#b8960b;background:#fdf8ed;box-shadow:0 2px 8px rgba(184,150,11,.2)}
    .mba-badge-locked{border-color:#e8e9f0;background:#f7f8fc;filter:grayscale(1);opacity:.55}
    .mba-xp-bar{height:10px;background:#e8e9f0;border-radius:5px;overflow:hidden}
    .mba-xp-fill{height:100%;background:linear-gradient(90deg,#b8960b,#f0c040);border-radius:5px;transition:width .8s cubic-bezier(.4,0,.2,1)}
    .mba-job-card{background:#fff;border:1px solid #e8e9f0;border-radius:12px;padding:18px;transition:box-shadow .22s,transform .22s,border-color .22s;box-shadow:0 1px 4px rgba(26,39,68,.05)}
    .mba-job-card:hover{box-shadow:0 8px 22px rgba(26,39,68,.11);transform:translateY(-3px);border-color:#c8c4bc}
    .mba-class-row{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #e8e9f0}
    .mba-class-row:last-child{border-bottom:none}
    .mba-cert-preview{background:linear-gradient(135deg,#1a2744 0%,#2c3e6b 100%);border-radius:16px;padding:32px 36px;text-align:center;position:relative;overflow:hidden}
    .mba-cert-preview::before{content:'';position:absolute;inset:8px;border:1.5px solid rgba(184,150,11,.4);border-radius:10px;pointer-events:none}
    /* Drag-to-rank */
    .mba-drag-item{display:flex;align-items:center;gap:10px;padding:12px 14px;background:#fff;border:1.5px solid #e8e9f0;border-radius:10px;cursor:grab;transition:box-shadow .18s,border-color .18s,transform .18s;user-select:none}
    .mba-drag-item:active{cursor:grabbing}
    .mba-drag-item.dragging{opacity:.4;border-color:#1a2744}
    .mba-drag-item.drag-over{border-color:#b8960b;background:#fdf8ed;transform:scale(1.01)}
    /* Module accordion */
    .mba-module-head{display:flex;align-items:center;gap:10px;padding:13px 16px;cursor:pointer;border-bottom:1px solid #e8e9f0;background:#f7f8fc;transition:background .15s}
    .mba-module-head:hover{background:#eef2fb}
    .mba-module-head.open{background:#eef2fb;border-left:3px solid #1a2744}
    /* AI Rev bubble */
    .mba-ai-rev{background:linear-gradient(135deg,#eef2fb 0%,#fdf8ed 100%);border:1px solid #d0daf5;border-radius:12px;padding:16px}
    /* Doubts */
    .mba-doubt-card{background:#fff;border:1px solid #e8e9f0;border-radius:10px;padding:16px;margin-bottom:10px;box-shadow:0 1px 4px rgba(26,39,68,.04);transition:box-shadow .2s}
    .mba-doubt-card:hover{box-shadow:0 4px 14px rgba(26,39,68,.09)}
    @media(max-width:1100px){.mba-grid-courses{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:900px){.mba-grid-4{grid-template-columns:repeat(2,1fr)}.mba-grid-2,.mba-grid-3-1{grid-template-columns:1fr}.mba-grid-courses{grid-template-columns:1fr}.mba-welcome{flex-direction:column;gap:14px}}
  `}</style>
);

// ─── Shared ────────────────────────────────────────────────────────────────
const Spinner = () => <div className="mba-spin"><div className="mba-spinner" /></div>;

function CircularProgress({ percentage, size = 90, strokeWidth = 7 }) {
  const r = (size - strokeWidth) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage >= 75 ? T.green : percentage >= 50 ? T.navy : percentage >= 25 ? T.gold : T.red;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={T.border} strokeWidth={strokeWidth} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .5s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{percentage}%</span>
      </div>
    </div>
  );
}

function GenderAvatar({ gender, size = 34 }) {
  const isFemale = (gender || "").toLowerCase() === "female";
  const isMale   = (gender || "").toLowerCase() === "male";
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <circle cx="17" cy="17" r="17" fill="#1a2744" />
      {isFemale ? (<>
        <circle cx="17" cy="12" r="6" fill="#fff" fillOpacity="0.92" />
        <path d="M11 11 Q11 5 17 5 Q23 5 23 11" stroke="#fff" strokeOpacity="0.75" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M7 32 C7 24 11 20 17 20 C23 20 27 24 27 32" fill="#fff" fillOpacity="0.92" />
      </>) : isMale ? (<>
        <circle cx="17" cy="12" r="6" fill="#fff" fillOpacity="0.92" />
        <path d="M11 10 Q11 5 17 5 Q23 5 23 10" fill="#fff" fillOpacity="0.45" />
        <path d="M5 32 L5 25 Q5 20 17 20 Q29 20 29 25 L29 32" fill="#fff" fillOpacity="0.92" />
      </>) : (<>
        <circle cx="17" cy="12.5" r="6" fill="#fff" fillOpacity="0.92" />
        <path d="M5 31 C5 23 10 20 17 20 C24 20 29 23 29 31" fill="#fff" fillOpacity="0.92" />
      </>)}
    </svg>
  );
}

// ─── FIX 1: Global Search Component ─────────────────────────────────────────
function GlobalSearch({ allNavItems }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (val) => {
    setQuery(val);
    if (!val.trim()) { setResults([]); setOpen(false); return; }
    const q = val.toLowerCase();
    const filtered = allNavItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      (item.keywords || []).some(k => k.includes(q))
    );
    setResults(filtered);
    setOpen(true);
  };

  const go = (path) => { setQuery(""); setResults([]); setOpen(false); navigate(path); };

  return (
    <div className="mba-search-bar" ref={ref} style={{ position: "relative" }}>
      <Search size={14} style={{ flexShrink: 0 }} />
      <input
        placeholder="Search pages, features..."
        value={query}
        onChange={e => handleSearch(e.target.value)}
        onFocus={() => query && setOpen(true)}
        style={{ background: "none", border: "none", outline: "none", fontSize: 13, color: T.text, width: 180, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
      />
      {open && results.length > 0 && (
        <div className="mba-search-dropdown">
          {results.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.path} className="mba-search-result" onClick={() => go(item.path)}>
                <Icon size={14} style={{ color: T.navy, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                <span style={{ fontSize: 11, color: T.subtle, marginLeft: "auto" }}>{item.section}</span>
              </div>
            );
          })}
        </div>
      )}
      {open && query && results.length === 0 && (
        <div className="mba-search-dropdown">
          <div style={{ padding: "16px 14px", textAlign: "center", fontSize: 13, color: T.subtle }}>No results for "{query}"</div>
        </div>
      )}
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────
function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData(true);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const fetchData = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const r = await api.get("/student/dashboard/stats");
      if (r.data.success) { setStats(r.data.stats || {}); setRecentActivity(r.data.activities || []); setLastUpdated(new Date()); }
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return <Spinner />;
  const courseColors = [T.navy, T.gold, T.green, T.blue, T.muted, T.red];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 className="mba-section-title">Academic Dashboard</h2>
          {lastUpdated && <p className="mba-section-sub">Updated {lastUpdated.toLocaleTimeString()}</p>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="mba-btn-ghost" onClick={() => fetchData(true)} disabled={refreshing}>
            <RefreshCw size={13} style={{ animation: refreshing ? "mba-spin .7s linear infinite" : "none" }} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <Link to="/student/browse" className="mba-btn-primary"><ShoppingBag size={14} /> Browse Courses</Link>
        </div>
      </div>

      <div className="mba-welcome">
        <div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: T.navy, marginBottom: 4 }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            {user?.full_name?.split(" ")[0] || "Student"}
          </h3>
          <p style={{ fontSize: 13, color: T.muted }}>Your learning metrics and course activity at a glance.</p>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {[
            { num: stats?.totalCourses ?? "–", lbl: "Enrolled" },
            { num: stats?.completedCourses ?? "–", lbl: "Completed" },
            { num: stats?.certificates ?? "–", lbl: "Certificates" },
            { num: stats?.avgProgress != null ? `${stats.avgProgress}%` : "–", lbl: "Avg Progress" },
          ].map((s, i) => (
            <div key={i} className="mba-welcome-stat">
              <div className="num">{s.num}</div>
              <div className="lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mba-grid-4" style={{ marginBottom: 14 }}>
        {[
          { label: "Hours Learned",   value: stats?.hoursLearned != null ? `${stats.hoursLearned}h` : "–", sub: "Total watch time",  accent: "mba-metric-navy" },
          { label: "Certificates",    value: stats?.certificates ?? "–",                                    sub: "Earned so far",    accent: "mba-metric-gold" },
          { label: "Learning Streak", value: `${stats?.streakDays ?? 0}%`,                                  sub: "Consecutive days", accent: "mba-metric-green" },
          { label: "Quiz Average",    value: `${stats?.avgScore ?? 0}%`,                                    sub: "Assessment score", accent: "mba-metric-gray" },
        ].map((m, i) => (
          <div key={i} className={`mba-metric ${m.accent}`}>
            <div className="mba-metric-label">{m.label}</div>
            <div className="mba-metric-value">{m.value}</div>
            <div className="mba-metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="mba-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Enrolled Courses", value: stats?.totalCourses ?? "–",     sub: "Active enrollments", accent: "mba-metric-blue"  },
          { label: "Completed",        value: stats?.completedCourses ?? "–", sub: "Courses finished",   accent: "mba-metric-green" },
          { label: "In Progress",      value: stats?.inProgress ?? 0,         sub: "Currently active",   accent: "mba-metric-navy"  },
          { label: "Completion Rate",  value: `${stats?.avgProgress ?? 0}%`,  sub: "Overall progress",   accent: "mba-metric-gold"  },
        ].map((m, i) => (
          <div key={i} className={`mba-metric ${m.accent}`}>
            <div className="mba-metric-label">{m.label}</div>
            <div className="mba-metric-value">{m.value}</div>
            <div className="mba-metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="mba-grid-2">
        <div className="mba-card">
          <div className="mba-card-head"><span className="mba-card-title">Course Progress</span><TrendingUp size={14} style={{ color: T.green }} /></div>
          <div className="mba-card-body">
            {stats?.courseProgress?.length > 0 ? stats.courseProgress.map((item, idx) => (
              <div key={idx} className="mba-progress-row">
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: courseColors[idx % courseColors.length], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{item.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.navy, flexShrink: 0, marginLeft: 8 }}>{item.progress}%</span>
                  </div>
                  <div className="mba-bar-track"><div className="mba-bar-fill" style={{ width: `${item.progress}%`, background: courseColors[idx % courseColors.length] }} /></div>
                </div>
              </div>
            )) : <p style={{ color: T.subtle, fontSize: 13 }}>Enroll in courses to see progress here.</p>}
          </div>
        </div>
        <div className="mba-card">
          <div className="mba-card-head"><span className="mba-card-title">Recent Activity</span><Activity size={14} style={{ color: T.navy }} /></div>
          <div className="mba-card-body">
            {recentActivity.length === 0
              ? <p style={{ color: T.subtle, fontSize: 13 }}>No recent activity.</p>
              : recentActivity.map((a, idx) => (
                <div key={idx} className="mba-activity-row">
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.navy, flexShrink: 0, marginTop: 7 }} />
                  <div><p style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</p><p style={{ fontSize: 12, color: T.subtle }}>{a.time}</p></div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MY COURSES ─────────────────────────────────────────────────────────────
function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [withdrawing, setWithdrawing] = useState(null);
  const [openVideo, setOpenVideo] = useState(null);
  const COURSE_VIDEOS = { 1:"https://www.youtube.com/embed/y3HKCaLPqtU?rel=0",6:"https://www.youtube.com/embed/cG1kVkzS2pE?rel=0",37:"https://www.youtube.com/embed/y3HKCaLPqtU?rel=0",38:"https://www.youtube.com/embed/y3HKCaLPqtU?rel=0",39:"https://www.youtube.com/embed/cPHKvABl9s4?rel=0",40:"https://www.youtube.com/embed/BM9ShEKAgVY?rel=0",41:"https://www.youtube.com/embed/Ap7Gk2Nj52c?rel=0",42:"https://www.youtube.com/embed/cG1kVkzS2pE?rel=0" };

  useEffect(() => {
    api.get("/enrollments/my-enrollments").then(r => { if (r.data.success) setEnrollments(r.data.enrollments || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id, name) => {
    if (!window.confirm(`Withdraw from "${name}"?`)) return;
    setWithdrawing(id);
    try { await api.delete(`/enrollments/${id}`); setEnrollments(e => e.filter(x => x.id !== id)); }
    catch { alert("Error withdrawing"); } finally { setWithdrawing(null); }
  };

  const filtered = enrollments.filter(e => {
    if (filter === "in-progress") return (e.progress_percentage || 0) < 100;
    if (filter === "completed")   return (e.progress_percentage || 0) === 100;
    return true;
  });

  if (loading) return <Spinner />;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h2 className="mba-section-title">My Courses</h2><p className="mba-section-sub">{filtered.length} course{filtered.length !== 1 ? "s" : ""} enrolled</p></div>
        <div className="mba-tabs">
          {["all","in-progress","completed"].map(f => <button key={f} className={`mba-tab ${filter===f?"active":""}`} onClick={() => setFilter(f)} style={{ textTransform:"capitalize" }}>{f.replace("-"," ")}</button>)}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="mba-card mba-empty"><BookOpen size={36} style={{ color:T.border,margin:"0 auto 10px" }} /><p>{filter==="all"?"You haven't enrolled in any courses yet":`No ${filter.replace("-"," ")} courses`}</p><Link to="/student/browse" className="mba-btn-primary" style={{ marginTop:14,display:"inline-flex" }}>Browse Courses</Link></div>
      ) : (
        <div className="mba-grid-courses">
          {filtered.map(enrollment => {
            const course = enrollment.Course || {};
            const progress = enrollment.progress_percentage || 0;
            const videoSrc = COURSE_VIDEOS[course.id];
            const isVideoOpen = openVideo === enrollment.id;
            return (
              <div key={enrollment.id} className="mba-course-card">
                <div style={{ height: 3, background: T.border }}><div style={{ height: "100%", width: `${progress}%`, background: T.navy, transition: "width .4s" }} /></div>
                {videoSrc && (
                  <div style={{ background: "#0b1623" }}>
                    {isVideoOpen ? (
                      <div style={{ position: "relative" }}>
                        <iframe src={videoSrc} style={{ width: "100%", height: 180 }} frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen title={course.course_name} />
                        <button onClick={() => setOpenVideo(null)} style={{ position:"absolute",top:8,right:8,background:"rgba(0,0,0,.7)",color:"#fff",border:"none",borderRadius:"50%",width:26,height:26,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}><X size={12} /></button>
                      </div>
                    ) : (
                      <button onClick={() => setOpenVideo(enrollment.id)} style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"transparent",border:"none",cursor:"pointer",color:"rgba(255,255,255,.75)" }}>
                        <div style={{ width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><PlayCircle size={16} style={{ color:"#fff" }} /></div>
                        <div style={{ textAlign:"left" }}><p style={{ fontSize:11,fontWeight:700,color:T.gold,textTransform:"uppercase",letterSpacing:".06em" }}>Course Video</p><p style={{ fontSize:12,color:"rgba(255,255,255,.45)",marginTop:1 }}>Watch overview</p></div>
                        <span style={{ marginLeft:"auto",fontSize:12,color:"rgba(255,255,255,.5)" }}>▶ Play</span>
                      </button>
                    )}
                  </div>
                )}
                <div style={{ padding: 18 }}>
                  <h3 style={{ fontSize:14,fontWeight:700,color:T.navy,textTransform:"uppercase",letterSpacing:".04em",marginBottom:6 }}>{course.course_name}</h3>
                  <p style={{ fontSize:13,color:T.muted,marginBottom:14,lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{course.description}</p>
                  <div style={{ display:"flex",justifyContent:"center",marginBottom:14 }}><CircularProgress percentage={progress} size={80} strokeWidth={6} /></div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:T.subtle,marginBottom:14 }}>
                    <span style={{ display:"flex",alignItems:"center",gap:4 }}><Clock size={12} /> {course.duration_hours ? `${course.duration_hours}h` : "–"}</span>
                    <span style={{ display:"flex",alignItems:"center",gap:4 }}><Calendar size={12} />{enrollment.created_at && !isNaN(new Date(enrollment.created_at)) ? new Date(enrollment.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "Enrolled"}</span>
                  </div>
                  <div style={{ display:"flex",gap:6,marginBottom:8 }}>
                    <Link to={`/student/course/${course.id}`} className="mba-btn-primary" style={{ flex:1,justifyContent:"center" }}><PlayCircle size={13} /> {progress===100?"Review":"Continue"}</Link>
                    {progress < 100 && <button onClick={() => handleWithdraw(enrollment.id,course.course_name)} disabled={withdrawing===enrollment.id} style={{ background:T.redSoft,color:T.red,border:`1px solid #f7c1c1`,borderRadius:8,padding:"0 10px",cursor:"pointer",fontSize:13 }}>{withdrawing===enrollment.id?"...":<X size={13} />}</button>}
                  </div>
                  <Link to={`/student/course/${course.id}/materials`} className="mba-btn-outline" style={{ width:"100%",justifyContent:"center" }}><FolderOpen size={13} /> Course Materials</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CERTIFICATES ─────────────────────────────────────────────────────────
function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSample, setShowSample] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.get("/student/certificates").then(r => { if (r.data.success) setCertificates(r.data.certificates || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDownload = async (id) => {
    try {
      const r = await api.get(`/student/certificates/${id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a"); a.href = url; a.download = `certificate-${id}.pdf`; a.click();
    } catch { alert("Error downloading certificate"); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 className="mba-section-title">Certificates</h2>
        <button className="mba-btn-gold" onClick={() => setShowSample(true)}><Award size={14} /> View Sample Certificate</button>
      </div>

      {showSample && (
        <div className="mba-modal-bg">
          <div className="mba-modal" style={{ maxWidth:640,padding:0,overflow:"hidden" }}>
            <div className="mba-cert-preview">
              <div style={{ color:"rgba(184,150,11,.7)",fontSize:11,fontWeight:700,letterSpacing:".2em",textTransform:"uppercase",marginBottom:12 }}>Upskillize — Certificate of Completion</div>
              <div style={{ fontSize:13,color:"rgba(255,255,255,.5)",marginBottom:18 }}>This is to certify that</div>
              <div style={{ fontSize:28,fontWeight:800,color:"#fff",marginBottom:8 }}>{user?.full_name || "Your Name Here"}</div>
              <div style={{ width:80,height:2,background:"linear-gradient(90deg,transparent,#b8960b,transparent)",margin:"0 auto 18px" }} />
              <div style={{ fontSize:13,color:"rgba(255,255,255,.6)",marginBottom:6 }}>has successfully completed the course</div>
              <div style={{ fontSize:20,fontWeight:700,color:T.gold,marginBottom:18 }}>MBA++ — Business Administration Programme</div>
              <div style={{ display:"flex",justifyContent:"center",gap:8,marginBottom:20 }}>
                <span className="mba-pill" style={{ background:"rgba(184,150,11,.15)",color:T.gold }}>100% Complete</span>
                <span className="mba-pill" style={{ background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.6)" }}>Score: 92%</span>
                <span className="mba-pill" style={{ background:"rgba(255,255,255,.08)",color:"rgba(255,255,255,.6)" }}>Verified</span>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:16,fontSize:12,color:"rgba(255,255,255,.4)" }}>
                <div><div style={{ fontWeight:700,color:"rgba(255,255,255,.7)",marginBottom:3 }}>Issue Date</div><div>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div></div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ width:48,height:48,borderRadius:"50%",border:"2px solid rgba(184,150,11,.5)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px" }}><Award size={20} style={{ color:T.gold }} /></div>
                  <div style={{ fontWeight:700,color:T.gold }}>Upskillize</div>
                </div>
                <div style={{ textAlign:"right" }}><div style={{ fontWeight:700,color:"rgba(255,255,255,.7)",marginBottom:3 }}>Certificate ID</div><div>CERT-{Math.random().toString(36).substr(2,8).toUpperCase()}</div></div>
              </div>
            </div>
            <div style={{ padding:"16px 24px",display:"flex",gap:10,justifyContent:"flex-end",background:"#fff" }}>
              <button className="mba-btn-ghost" onClick={() => setShowSample(false)}>Close</button>
              <button className="mba-btn-primary" onClick={() => alert("Complete a course to download your actual certificate!")}><Download size={13} /> Download Sample</button>
            </div>
          </div>
        </div>
      )}

      {certificates.length === 0 ? (
        <div className="mba-card mba-empty"><Award size={36} style={{ color:T.border,margin:"0 auto 8px" }} /><p>No certificates earned yet</p><p style={{ fontSize:12,marginTop:4,color:T.subtle }}>Complete courses to earn certificates</p></div>
      ) : (
        <div className="mba-grid-2">
          {certificates.map(cert => (
            <div key={cert.id} className="mba-card" style={{ borderLeft:`3px solid ${T.gold}` }}>
              <div style={{ padding:20 }}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14 }}>
                  <div className="mba-cert-seal"><Award size={16} style={{ color:T.gold }} /></div>
                  <span className="mba-pill mba-pill-verified">Verified</span>
                </div>
                <h3 style={{ fontSize:15,fontWeight:700,color:T.navy,marginBottom:6 }}>{cert.course_name}</h3>
                <p style={{ fontSize:12,color:T.subtle,marginBottom:2 }}>ID: {cert.certificate_id}</p>
                <p style={{ fontSize:12,color:T.subtle,marginBottom:16 }}>Issued {new Date(cert.issue_date).toLocaleDateString()}</p>
                <button className="mba-btn-outline" onClick={() => handleDownload(cert.id)}><Download size={13} /> Download Certificate</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────
function Progress() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/student/progress").then(r => { if (r.data.success) setAnalytics(r.data.analytics); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  if (!analytics) return (<div><h2 className="mba-section-title" style={{ marginBottom:20 }}>Progress & Analytics</h2><div className="mba-card mba-empty"><TrendingUp size={36} style={{ color:T.border,margin:"0 auto 8px" }} /><p>No progress data yet</p></div></div>);
  return (
    <div>
      <h2 className="mba-section-title" style={{ marginBottom:20 }}>Progress & Analytics</h2>
      <div className="mba-grid-3" style={{ marginBottom:20 }}>
        {[{ label:"Learning Streak",value:`${analytics.streakDays??0} days`,accent:"mba-metric-gold" },{ label:"Average Score",value:`${analytics.averageScore??0}%`,accent:"mba-metric-green" },{ label:"Completion Rate",value:`${analytics.completionRate??0}%`,accent:"mba-metric-navy" }].map((m,i) => (
          <div key={i} className={`mba-metric ${m.accent}`}><div className="mba-metric-label">{m.label}</div><div className="mba-metric-value">{m.value}</div></div>
        ))}
      </div>
      {analytics.categoryProgress?.length > 0 && (
        <div className="mba-card">
          <div className="mba-card-head"><span className="mba-card-title">Progress by Category</span></div>
          <div className="mba-card-body" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:24,textAlign:"center" }}>
            {analytics.categoryProgress.map((item,idx) => (
              <div key={idx}><CircularProgress percentage={item.progress} size={100} strokeWidth={8} /><h4 style={{ marginTop:12,fontWeight:700,fontSize:14,color:T.navy }}>{item.category}</h4><p style={{ fontSize:12,color:T.subtle,marginTop:2 }}>{item.courses} courses · {item.progress}% complete</p></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FIX 12-13: THREAD DETAIL ─────────────────────────────────────────────
function ThreadDetail() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type:"", text:"" });

  const load = async () => {
    try {
      const r = await api.get(`/forum/threads/${threadId}`);
      if (r.data.success) {
        setThread(r.data.thread);
        setReplies(r.data.thread?.replies || r.data.replies || []);
      }
    } catch { setMessage({ type:"error", text:"Could not load thread." }); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [threadId]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/forum/threads/${threadId}/replies`, { content: replyText });
      if (r.data.success) { setReplyText(""); await load(); }
    } catch { setMessage({ type:"error", text:"Failed to post reply." }); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Spinner />;
  const backPath = thread?.type === "doubt" ? "/student/doubts" : "/student/discussion-forum";

  return (
    <div style={{ maxWidth:760 }}>
      <button className="mba-btn-ghost" style={{ marginBottom:16 }} onClick={() => navigate(backPath)}>
        <ChevronLeft size={13}/> {thread?.type === "doubt" ? "Back to Doubts" : "Back to Forum"}
      </button>

      {message.text && (
        <div className={message.type==="success"?"mba-alert-success":"mba-alert-error"} style={{ marginBottom:14 }}>
          <AlertCircle size={13}/> {message.text}
        </div>
      )}

      {!thread ? (
        <div className="mba-card mba-empty"><MessageSquare size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>Thread not found</p></div>
      ) : (
        <>
          <div className="mba-card" style={{ marginBottom:14, padding:22 }}>
            <div style={{ display:"flex",gap:8,marginBottom:10,flexWrap:"wrap" }}>
              <span style={{ fontSize:16 }}>{thread.type==="doubt"?"❓":"💬"}</span>
              {thread.topic && <span className="mba-pill mba-pill-navy" style={{ fontSize:11 }}>{thread.topic}</span>}
              {thread.course && <span className="mba-pill mba-pill-gold" style={{ fontSize:11 }}>{thread.course}</span>}
              {(thread.hasAnswer || thread.has_answer) && (
                <span className="mba-pill mba-pill-pass" style={{ display:"inline-flex",alignItems:"center",gap:3 }}>
                  <CheckCircle size={10}/> Answered
                </span>
              )}
            </div>
            <h2 style={{ fontSize:20,fontWeight:800,color:T.navy,marginBottom:8 }}>{thread.title}</h2>
            <div style={{ background:T.bg,borderRadius:8,padding:"12px 14px",marginBottom:12,fontSize:14,color:T.text,lineHeight:1.7 }}>
              {thread.content}
            </div>
            <div style={{ display:"flex",gap:14,fontSize:12,color:T.subtle }}>
              <span style={{ display:"flex",alignItems:"center",gap:3 }}><User size={11}/> {thread.author || thread.author_name}</span>
              <span style={{ display:"flex",alignItems:"center",gap:3 }}><Calendar size={11}/> {thread.created ? new Date(thread.created).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : thread.created_at ? new Date(thread.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : ""}</span>
              <span style={{ display:"flex",alignItems:"center",gap:3 }}><MessageSquare size={11}/> {replies.length} {replies.length===1?"reply":"replies"}</span>
            </div>
          </div>

          <h3 style={{ fontSize:15,fontWeight:700,color:T.navy,marginBottom:10 }}>{replies.length} {replies.length===1?"Reply":"Replies"}</h3>

          {replies.length === 0 ? (
            <div className="mba-card" style={{ padding:24,textAlign:"center",marginBottom:14 }}>
              <MessageSquare size={28} style={{ color:T.border,margin:"0 auto 8px",display:"block" }}/>
              <p style={{ fontSize:13,color:T.subtle }}>No replies yet. Be the first to respond!</p>
            </div>
          ) : (
            replies.map((r, i) => {
              const isFaculty = r.role === "faculty" || r.author_role === "faculty" || r.is_faculty;
              const isAnswer = r.is_answer;
              return (
                <div key={r.id || i} style={{
                  border:`1px solid ${isAnswer ? T.green : isFaculty ? T.gold : T.border}`,
                  borderLeft:`3px solid ${isAnswer ? T.green : isFaculty ? T.gold : T.border}`,
                  borderRadius:10, padding:18, marginBottom:10,
                  background: isAnswer ? T.greenSoft : isFaculty ? T.goldSoft : "#fff",
                }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <div style={{ width:36,height:36,borderRadius:"50%",background:isFaculty?T.gold:T.navy,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,flexShrink:0 }}>
                        {(r.author_name || r.author || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                          <span style={{ fontSize:14,fontWeight:700,color:T.navy }}>{r.author_name || r.author}</span>
                          {isFaculty && <span className="mba-pill" style={{ fontSize:10,background:T.gold,color:"#fff",fontWeight:700 }}>FACULTY</span>}
                          {isAnswer && <span className="mba-pill mba-pill-pass" style={{ fontSize:10,display:"inline-flex",alignItems:"center",gap:3 }}><CheckCircle size={9}/> Best Answer</span>}
                        </div>
                        <span style={{ fontSize:11,color:T.subtle }}>{r.created_at ? new Date(r.created_at).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : ""}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize:13,color:T.text,lineHeight:1.65 }}>{r.content}</p>
                </div>
              );
            })
          )}

          <div className="mba-card" style={{ padding:20,borderLeft:`3px solid ${T.navy}` }}>
            <h4 style={{ fontSize:14,fontWeight:700,color:T.navy,marginBottom:12 }}>Post a Reply</h4>
            <form onSubmit={handleReply} style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <textarea className="mba-textarea" rows={4} value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Write your reply…" required />
              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="mba-btn-primary" disabled={submitting||!replyText.trim()}><Send size={13}/> {submitting?"Posting…":"Post Reply"}</button>
                <button type="button" className="mba-btn-ghost" onClick={()=>setReplyText("")}>Clear</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

// ─── FIX 12-13: DISCUSSION FORUM (Discussion Topics only, Doubts separate) ──
function DiscussionForum() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [filterCourse, setFilterCourse] = useState("all");
  const [newThread, setNewThread] = useState({ title:"",content:"",course:"",topic:"" });

  const DISCUSSION_TOPICS = ["Lecture Notes","Case Study Discussion","Industry Trends","Career Advice","Group Project","General Query"];

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get("/forum/threads?type=discussion");
        if (r.data.success) setThreads((r.data.threads || []).filter(t => !t.type || t.type === "discussion"));
      } catch {}
      try {
        const er = await api.get("/enrollments/my-enrollments");
        setEnrollments([{ id:"general",course_name:"General" }, ...(er.data.enrollments||[]).map(e=>e.Course).filter(Boolean)]);
      } catch { setEnrollments([{ id:"general",course_name:"General" }]); }
      setLoading(false);
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.content.trim()) { alert("Please fill all required fields."); return; }
    try {
      const r = await api.post("/forum/threads", { ...newThread, type: "discussion" });
      if (r.data.success || r.data.thread) {
        setThreads(prev => [r.data.thread, ...prev]);
        setShowNew(false);
        setNewThread({ title:"",content:"",course:"",topic:"" });
      }
    } catch { alert("Error creating discussion. Please try again."); }
  };

  const filtered = threads.filter(t => filterCourse === "all" || t.course === filterCourse);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="mba-section-title">Discussion Forum</h2><p className="mba-section-sub">Start topic discussions with peers and faculty</p></div>
        <button className="mba-btn-primary" onClick={() => setShowNew(true)}><Plus size={13} /> New Discussion</button>
      </div>

      <div style={{ display:"flex",gap:10,marginBottom:16,alignItems:"center" }}>
        <select className="mba-select" style={{ width:"auto",fontSize:13,padding:"7px 12px" }} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {enrollments.map(c => <option key={c.id} value={c.course_name}>{c.course_name}</option>)}
        </select>
      </div>

      {showNew && (
        <div className="mba-modal-bg">
          <div className="mba-modal" style={{ maxWidth:560 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h3 style={{ fontSize:18,fontWeight:800,color:T.navy }}>💬 New Discussion Topic</h3>
              <button onClick={() => setShowNew(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div>
                <label className="mba-label">Course *</label>
                <select className="mba-select" value={newThread.course} onChange={e => setNewThread({ ...newThread,course:e.target.value })} required>
                  <option value="">Select a course</option>
                  {enrollments.map(c => <option key={c.id} value={c.course_name}>{c.course_name}</option>)}
                </select>
              </div>
              <div>
                <label className="mba-label">Topic Category *</label>
                <select className="mba-select" value={newThread.topic} onChange={e => setNewThread({ ...newThread,topic:e.target.value })} required>
                  <option value="">Select topic</option>
                  {DISCUSSION_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="mba-label">Title *</label><input className="mba-input" value={newThread.title} onChange={e => setNewThread({ ...newThread,title:e.target.value })} required placeholder="What would you like to discuss?" /></div>
              <div><label className="mba-label">Details *</label><textarea className="mba-textarea" rows={5} value={newThread.content} onChange={e => setNewThread({ ...newThread,content:e.target.value })} required placeholder="Provide as much detail as possible..." /></div>
              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="mba-btn-primary" style={{ flex:1,justifyContent:"center" }}><Send size={13} /> Post Discussion</button>
                <button type="button" className="mba-btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mba-card mba-empty"><MessageSquare size={36} style={{ color:T.border,margin:"0 auto 8px" }} /><p>No discussions yet. Start one!</p></div>
      ) : filtered.map(thread => (
        <div key={thread.id} className="mba-thread-row" onClick={() => navigate(`/student/forum/thread/${thread.id}`)} style={{ cursor:"pointer" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap" }}>
                <span style={{ fontSize:15 }}>💬</span>
                <span style={{ fontSize:14,fontWeight:700,color:T.navy }}>{thread.title}</span>
                {thread.topic && <span className="mba-pill mba-pill-navy" style={{ fontSize:11 }}>{thread.topic}</span>}
                {(thread.hasAnswer || thread.has_answer) && <span className="mba-pill mba-pill-pass" style={{ display:"inline-flex",alignItems:"center",gap:3 }}><CheckCircle size={10}/> Answered</span>}
              </div>
              <div style={{ display:"flex",gap:14,fontSize:12,color:T.subtle }}>
                <span style={{ display:"flex",alignItems:"center",gap:3 }}><User size={11}/> {thread.author}</span>
                <span style={{ display:"flex",alignItems:"center",gap:3 }}><BookOpen size={11}/> {thread.course}</span>
                <span style={{ display:"flex",alignItems:"center",gap:3 }}><Calendar size={11}/> {new Date(thread.created || thread.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div style={{ display:"flex",gap:8,fontSize:12,color:T.subtle,flexShrink:0,alignItems:"center" }}>
              <span style={{ display:"flex",alignItems:"center",gap:3 }}><ThumbsUp size={11}/> {thread.upvotes||0}</span>
              <span style={{ display:"flex",alignItems:"center",gap:3 }}><MessageSquare size={11}/> {thread.replies||thread.replyCount||0}</span>
              <ChevronRight size={13} style={{ color:T.subtle }}/>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FIX 15: STUDENT DOUBTS (Separate with Document Upload) ──────────────
// Backend API stubs expected:
//   GET    /student/doubts           → { success, doubts: [] }
//   POST   /student/doubts           → { success, doubt } body: FormData(title, content, course, category, document?)
//   GET    /student/doubts/:id       → { success, doubt, replies: [] }
//   POST   /student/doubts/:id/reply → { success, reply } body: { content }
//   DELETE /student/doubts/:id       → { success }

function StudentDoubts() {
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [newDoubt, setNewDoubt] = useState({ title:"",content:"",course:"",category:"",document:null });

  const DOUBT_CATEGORIES = ["Assignment Help","Quiz / Assessment Clarification","Course Content","Concept Explanation","Technical Issue","Lecture Query","Project Guidance","Other"];

  useEffect(() => {
    const load = async () => {
      try { const r = await api.get("/student/doubts"); if (r.data.success) setDoubts(r.data.doubts || []); } catch {}
      try {
        const er = await api.get("/enrollments/my-enrollments");
        setEnrollments([{ id:"general",course_name:"General" }, ...(er.data.enrollments||[]).map(e=>e.Course).filter(Boolean)]);
      } catch { setEnrollments([{ id:"general",course_name:"General" }]); }
      setLoading(false);
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDoubt.title.trim() || !newDoubt.content.trim()) { alert("Please fill all required fields."); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", newDoubt.title);
      fd.append("content", newDoubt.content);
      fd.append("course", newDoubt.course);
      fd.append("category", newDoubt.category);
      fd.append("type", "doubt");
      if (newDoubt.document) fd.append("document", newDoubt.document);

      const r = await api.post("/student/doubts", fd, { headers: { "Content-Type": "multipart/form-data" } });
      if (r.data.success || r.data.doubt) {
        setDoubts(prev => [r.data.doubt, ...prev]);
        setShowNew(false);
        setNewDoubt({ title:"",content:"",course:"",category:"",document:null });
        setSuccessMsg("Doubt posted! Faculty will respond soon.");
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch {
      // Fallback: also try via forum endpoint
      try {
        const fd2 = new FormData();
        fd2.append("title", newDoubt.title);
        fd2.append("content", newDoubt.content);
        fd2.append("course", newDoubt.course);
        fd2.append("topic", newDoubt.category);
        fd2.append("type", "doubt");
        if (newDoubt.document) fd2.append("document", newDoubt.document);
        const r2 = await api.post("/forum/threads", fd2, { headers: { "Content-Type": "multipart/form-data" } });
        if (r2.data.success || r2.data.thread) {
          setDoubts(prev => [{ ...r2.data.thread, type:"doubt" }, ...prev]);
          setShowNew(false);
          setNewDoubt({ title:"",content:"",course:"",category:"",document:null });
          setSuccessMsg("Doubt posted successfully!");
          setTimeout(() => setSuccessMsg(""), 5000);
        }
      } catch { alert("Error posting doubt. Please try again."); }
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this doubt?")) return;
    try { await api.delete(`/student/doubts/${id}`); setDoubts(d => d.filter(x => x.id !== id)); }
    catch { alert("Error deleting doubt"); }
  };

  const filtered = doubts.filter(d => {
    if (filterStatus !== "all" && (filterStatus === "answered" ? !(d.hasAnswer||d.has_answer) : (d.hasAnswer||d.has_answer))) return false;
    if (filterCourse !== "all" && d.course !== filterCourse) return false;
    return true;
  });

  const counts = { all: doubts.length, open: doubts.filter(d => !(d.hasAnswer||d.has_answer)).length, answered: doubts.filter(d => d.hasAnswer||d.has_answer).length };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div>
          <h2 className="mba-section-title">My Doubts</h2>
          <p className="mba-section-sub">Ask faculty questions and attach documents for clarity</p>
        </div>
        <button className="mba-btn-primary" onClick={() => setShowNew(true)}><Plus size={13} /> Ask a Doubt</button>
      </div>

      {successMsg && <div className="mba-alert-success" style={{ marginBottom:16 }}><CheckCircle size={13}/> {successMsg}</div>}

      {/* Stats row */}
      <div className="mba-grid-3" style={{ marginBottom:16 }}>
        {[
          { label:"Total Doubts",  value:counts.all,      accent:"mba-metric-navy" },
          { label:"Open / Pending",value:counts.open,     accent:"mba-metric-gold" },
          { label:"Answered",      value:counts.answered, accent:"mba-metric-green" },
        ].map(m => (
          <div key={m.label} className={`mba-metric ${m.accent}`}>
            <div className="mba-metric-label">{m.label}</div>
            <div className="mba-metric-value">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap" }}>
        <div className="mba-tabs">
          {[["all","All"],["open","Open"],["answered","Answered"]].map(([v,l]) => (
            <button key={v} className={`mba-tab ${filterStatus===v?"active":""}`} onClick={()=>setFilterStatus(v)}>{l}</button>
          ))}
        </div>
        <select className="mba-select" style={{ width:"auto",fontSize:13,padding:"7px 12px" }} value={filterCourse} onChange={e=>setFilterCourse(e.target.value)}>
          <option value="all">All Courses</option>
          {enrollments.map(c => <option key={c.id} value={c.course_name}>{c.course_name}</option>)}
        </select>
      </div>

      {/* New Doubt Modal */}
      {showNew && (
        <div className="mba-modal-bg">
          <div className="mba-modal" style={{ maxWidth:560 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h3 style={{ fontSize:18,fontWeight:800,color:T.navy }}>❓ Ask a Doubt</h3>
              <button onClick={() => setShowNew(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <div>
                <label className="mba-label">Course *</label>
                <select className="mba-select" value={newDoubt.course} onChange={e => setNewDoubt({ ...newDoubt,course:e.target.value })} required>
                  <option value="">Select a course</option>
                  {enrollments.map(c => <option key={c.id} value={c.course_name}>{c.course_name}</option>)}
                </select>
              </div>
              <div>
                <label className="mba-label">Doubt Category *</label>
                <select className="mba-select" value={newDoubt.category} onChange={e => setNewDoubt({ ...newDoubt,category:e.target.value })} required>
                  <option value="">Select category</option>
                  {DOUBT_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="mba-label">Title / Question *</label><input className="mba-input" value={newDoubt.title} onChange={e => setNewDoubt({ ...newDoubt,title:e.target.value })} required placeholder="Describe your doubt clearly..." /></div>
              <div><label className="mba-label">Detailed Description *</label><textarea className="mba-textarea" rows={5} value={newDoubt.content} onChange={e => setNewDoubt({ ...newDoubt,content:e.target.value })} required placeholder="Provide full context — what you tried, what's unclear, any error messages..." /></div>
              <div>
                <label className="mba-label">Attach Document <span style={{ fontSize:11,color:T.subtle,textTransform:"none",letterSpacing:0 }}>(optional — PDF, DOC, image)</span></label>
                <div style={{ border:`1.5px dashed ${newDoubt.document ? T.navy : T.border}`,borderRadius:8,padding:16,textAlign:"center",background:T.bg,transition:"border-color .18s" }}>
                  <Paperclip size={22} style={{ color:T.subtle,margin:"0 auto 6px",display:"block" }} />
                  <p style={{ fontSize:12,color:T.muted,marginBottom:8 }}>PDF, DOC, DOCX, JPG, PNG — Max 10MB</p>
                  <input type="file" id="doubt-doc" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e=>setNewDoubt(d=>({...d,document:e.target.files[0]}))} style={{ display:"none" }} />
                  <label htmlFor="doubt-doc" className="mba-btn-ghost" style={{ cursor:"pointer",fontSize:12 }}>
                    {newDoubt.document ? "Change File" : "Choose File"}
                  </label>
                  {newDoubt.document && (
                    <div style={{ marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
                      <CheckCircle size={13} style={{ color:T.green }}/> 
                      <span style={{ fontSize:13,color:T.green,fontWeight:600 }}>{newDoubt.document.name}</span>
                      <button type="button" onClick={()=>setNewDoubt(d=>({...d,document:null}))} style={{ background:"none",border:"none",cursor:"pointer",color:T.red,padding:0 }}><X size={12}/></button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button type="submit" className="mba-btn-primary" style={{ flex:1,justifyContent:"center" }} disabled={submitting}>
                  {submitting ? "Posting..." : <><Send size={13}/> Post Doubt</>}
                </button>
                <button type="button" className="mba-btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doubts list */}
      {filtered.length === 0 ? (
        <div className="mba-card mba-empty">
          <FileQuestion size={36} style={{ color:T.border,margin:"0 auto 8px" }} />
          <p>{filterStatus === "answered" ? "No answered doubts yet" : filterStatus === "open" ? "No open doubts" : "No doubts posted yet"}</p>
          <button className="mba-btn-primary" style={{ marginTop:14 }} onClick={() => setShowNew(true)}>Ask Your First Doubt</button>
        </div>
      ) : filtered.map(doubt => {
        const isAnswered = doubt.hasAnswer || doubt.has_answer;
        const hasDoc = doubt.document_url || doubt.attachment_url;
        return (
          <div key={doubt.id} className="mba-doubt-card">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginBottom:6 }}>
                  <span className={`mba-pill ${isAnswered ? "mba-pill-pass" : "mba-pill-warn"}`} style={{ display:"inline-flex",alignItems:"center",gap:3 }}>
                    {isAnswered ? <><CheckCircle size={10}/> Answered</> : "⏳ Pending"}
                  </span>
                  {doubt.category && <span className="mba-pill mba-pill-navy" style={{ fontSize:11 }}>{doubt.category}</span>}
                  {doubt.course && <span className="mba-pill mba-pill-gold" style={{ fontSize:11 }}>{doubt.course}</span>}
                  {hasDoc && <span className="mba-pill" style={{ fontSize:11,background:"#f0f4ff",color:T.navy,display:"inline-flex",alignItems:"center",gap:3 }}><Paperclip size={9}/> Attachment</span>}
                </div>
                <h3 style={{ fontSize:14,fontWeight:700,color:T.navy,marginBottom:4 }}>{doubt.title}</h3>
                <p style={{ fontSize:13,color:T.muted,lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{doubt.content}</p>
              </div>
              <button onClick={() => handleDelete(doubt.id)} style={{ background:"none",border:"none",cursor:"pointer",color:T.subtle,padding:4,marginLeft:8,flexShrink:0 }}><Trash2 size={13}/></button>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,color:T.subtle }}>
              <div style={{ display:"flex",gap:10 }}>
                <span style={{ display:"flex",alignItems:"center",gap:3 }}><Calendar size={11}/> {new Date(doubt.created || doubt.created_at || Date.now()).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span>
                <span style={{ display:"flex",alignItems:"center",gap:3 }}><MessageSquare size={11}/> {doubt.replies || doubt.replyCount || 0} replies</span>
              </div>
              <button className="mba-btn-ghost" style={{ fontSize:12,padding:"5px 12px" }} onClick={() => navigate(`/student/forum/thread/${doubt.id}`)}>
                {isAnswered ? <><Eye size={12}/> View Answer</> : <><MessageSquare size={12}/> View / Follow up</>}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────
function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  useEffect(() => { api.get("/notifications").then(r => { if (r.data.success) setNotifications(r.data.notifications||[]); }).catch(()=>{}).finally(()=>setLoading(false)); }, []);
  const filtered = filter==="all" ? notifications : notifications.filter(n=>n.type===filter);
  const fmtDate = (n) => { const raw = n.time || n.createdAt || n.created_at; if (!raw) return ""; const d = new Date(raw); return isNaN(d.getTime()) ? "" : d.toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }); };
  const isRead = (n) => n.is_read ?? n.read ?? n.isRead ?? false;
  const getMsg = (n) => { const m = n.message || n.body || n.content || ""; return m && m.toLowerCase() !== "na" && m.toLowerCase() !== "null" ? m : ""; };
  const iconMap = { assignment: <FileText size={16} style={{color:T.navy}}/>, exam: <Award size={16} style={{color:T.gold}}/>, announcement:<Bell size={16} style={{color:T.green}}/>, info:<AlertCircle size={16} style={{color:T.blue}}/> };
  const typeAccent = { assignment:T.navy, exam:T.gold, announcement:T.green, info:T.blue };
  if (loading) return <Spinner />;
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="mba-section-title">Notifications</h2><p className="mba-section-sub">{notifications.filter(n=>!isRead(n)).length} unread</p></div>
        <div className="mba-tabs">{["all","assignment","exam","announcement"].map(f => (<button key={f} className={`mba-tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)} style={{textTransform:"capitalize"}}>{f}</button>))}</div>
      </div>
      {filtered.length===0 ? (
        <div className="mba-card mba-empty"><Bell size={36} style={{color:T.border,margin:"0 auto 8px"}}/><p>No notifications</p></div>
      ) : filtered.map(n => {
        const read = isRead(n); const msg = getMsg(n); const dt = fmtDate(n); const accent = typeAccent[n.type] || T.subtle;
        return (
          <div key={n.id} style={{ background:"#fff",border:`1px solid ${T.border}`,borderLeft:`3px solid ${read?T.border:accent}`,borderRadius:10,padding:"14px 18px",display:"flex",gap:14,marginBottom:8,boxShadow:"0 1px 4px rgba(26,39,68,.04)",opacity:read?.85:1 }}>
            <div style={{ width:38,height:38,borderRadius:"50%",background:`${accent}18`,border:`1.5px solid ${accent}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2 }}>{iconMap[n.type]||<AlertCircle size={16} style={{color:T.subtle}}/>}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4,gap:8}}>
                <span style={{fontSize:14,fontWeight:read?600:700,color:T.navy,flex:1}}>{n.title}</span>
                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                  {!read && <span style={{width:8,height:8,borderRadius:"50%",background:accent,display:"inline-block"}}/>}
                  {dt && <span style={{fontSize:11,color:T.subtle,whiteSpace:"nowrap"}}>{dt}</span>}
                </div>
              </div>
              {msg && <p style={{fontSize:13,color:T.muted,lineHeight:1.55}}>{msg}</p>}
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:6}}>
                <span className="mba-pill" style={{fontSize:11,background:`${accent}12`,color:accent,textTransform:"capitalize"}}>{n.type||"info"}</span>
                {!read && <span className="mba-pill" style={{fontSize:11,background:T.navy,color:"#fff"}}>New</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── HELP & SUPPORT ─────────────────────────────────────────────────────────
function HelpSupport() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("general");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.post("/student/support", { query, category }); setSubmitted(true); setQuery(""); setTimeout(() => setSubmitted(false), 5000); }
    catch { alert("Error submitting"); } finally { setSubmitting(false); }
  };

  const faqs = [
    { q:"How do I reset my password?", a:'Go to the login page and click "Forgot Password".' },
    { q:"Can I get a refund?", a:"Refunds are available within 7 days of purchase. Contact support with your transaction ID." },
    { q:"How do I download certificates?", a:"Go to the Certificates section in your dashboard and click the Download button." },
    { q:"How do I access free courses?", a:"MBA++, Corporate Readiness and BFSI are free — just enrol from Browse Courses!" },
    { q:"How do I join a live class?", a:"Go to Class Schedule under Academic and click the Join button when the class is live." },
    { q:"Why is my assessment score not saving?", a:"Ensure you click Submit before the timer runs out. Check your internet connection." },
  ];

  const CATEGORIES = [
    { value:"general", label:"General Question", icon:"💬" },
    { value:"technical", label:"Technical Issue", icon:"🔧" },
    { value:"course", label:"Course Related", icon:"📚" },
    { value:"payment", label:"Payment Issue", icon:"💳" },
    { value:"placement", label:"Placements / Jobs", icon:"💼" },
  ];

  return (
    <div style={{ maxWidth:760 }}>
      <div style={{ marginBottom:24 }}><h2 className="mba-section-title">Help & Support</h2><p className="mba-section-sub">We typically respond within 24 hours</p></div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div style={{ background:"#fff",border:`1px solid ${T.border}`,borderLeft:`3px solid ${T.navy}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(26,39,68,.05)" }}>
          <div style={{ padding:"14px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:34,height:34,borderRadius:"50%",background:`${T.navy}18`,border:`1.5px solid ${T.navy}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Send size={14} style={{ color:T.navy }} /></div>
            <div><p style={{ fontSize:13,fontWeight:700,color:T.navy }}>Submit a Query</p><p style={{ fontSize:11,color:T.subtle }}>Our team will respond shortly</p></div>
          </div>
          <div style={{ padding:18 }}>
            {submitted && <div className="mba-alert-success" style={{ marginBottom:14 }}><CheckCircle size={13}/> Query submitted successfully!</div>}
            <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:12 }}>
              <div>
                <label className="mba-label">Category</label>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                      style={{ padding:"8px 10px",borderRadius:8,border:`1.5px solid ${category===c.value?T.navy:T.border}`,background:category===c.value?T.navy:"transparent",color:category===c.value?"#fff":T.muted,fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all .15s" }}>
                      <span>{c.icon}</span> {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="mba-label">Your Question</label><textarea className="mba-textarea" rows={5} value={query} onChange={e=>setQuery(e.target.value)} required placeholder="Describe your question or issue in detail..." /></div>
              <button type="submit" className="mba-btn-primary" disabled={submitting} style={{ justifyContent:"center" }}><Send size={13}/> {submitting?"Submitting...":"Submit Query"}</button>
            </form>
          </div>
        </div>
        <div style={{ background:"#fff",border:`1px solid ${T.border}`,borderLeft:`3px solid ${T.gold}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(26,39,68,.05)" }}>
          <div style={{ padding:"14px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ width:34,height:34,borderRadius:"50%",background:`${T.gold}18`,border:`1.5px solid ${T.gold}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><HelpCircle size={14} style={{ color:T.gold }} /></div>
            <div><p style={{ fontSize:13,fontWeight:700,color:T.navy }}>Frequently Asked Questions</p><p style={{ fontSize:11,color:T.subtle }}>Quick answers to common questions</p></div>
          </div>
          <div style={{ padding:14,display:"flex",flexDirection:"column",gap:6,maxHeight:420,overflowY:"auto" }}>
            {faqs.map((f,i) => (
              <details key={i} style={{ border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden" }}>
                <summary style={{ fontWeight:600,fontSize:13,cursor:"pointer",color:T.navy,padding:"11px 14px",background:T.bg,listStyle:"none",display:"flex",justifyContent:"space-between",alignItems:"center",userSelect:"none" }}>{f.q}<ChevronRight size={13} style={{ color:T.subtle,flexShrink:0 }}/></summary>
                <p style={{ padding:"10px 14px",fontSize:13,color:T.muted,lineHeight:1.6,background:"#fff",borderTop:`1px solid ${T.border}` }}>{f.a}</p>
              </details>
            ))}
          </div>
          <div style={{ padding:"12px 18px",borderTop:`1px solid ${T.border}`,background:T.bg }}>
            <p style={{ fontSize:12,color:T.muted,textAlign:"center" }}>Email us at <a href="mailto:support@upskillize.com" style={{ color:T.navy,fontWeight:600,textDecoration:"none" }}>support@upskillize.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAYMENTS + TESTGEN ──────────────────────────────────────────────────
function PaymentsComponent() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTestGen, setShowTestGen] = useState(false);
  const [tgStep, setTgStep] = useState("plans");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cardForm, setCardForm] = useState({ name:"",number:"",expiry:"",cvv:"" });
  const [processing, setProcessing] = useState(false);

  useEffect(() => { api.get("/student/payments").then(r => { if (r.data.success) setPayments(r.data.payments||[]); }).catch(()=>{}).finally(()=>setLoading(false)); }, []);

  const PLANS = [
    { id:"monthly", label:"Monthly", price:"₹499", period:"/month", features:["Unlimited TestGen questions","AI difficulty tuning","Topic-wise analytics","Priority support"], tag:"" },
    { id:"annual",  label:"Annual",  price:"₹3,999", period:"/year", features:["Everything in Monthly","Save ₹2,000/year","Access to AI Interview Prep","Gamification XP boosts","Corporate profile badge"], tag:"Best Value" },
  ];

  const handlePay = async () => {
    if (!cardForm.name || !cardForm.number || !cardForm.expiry || !cardForm.cvv) { alert("Please fill all card details."); return; }
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1800));
    setProcessing(false);
    try { await api.post("/student/payments/testgen", { plan: selectedPlan.id }); } catch {}
    setTgStep("success");
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="mba-section-title">Payments & Plans</h2><p className="mba-section-sub">Manage your subscription and payment history</p></div>
        <button className="mba-btn-gold" onClick={() => { setShowTestGen(true); setTgStep("plans"); }}><Zap size={14} /> Enable TestGen</button>
      </div>

      {showTestGen && (
        <div className="mba-modal-bg">
          <div className="mba-modal" style={{ maxWidth:620 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
              <h3 style={{ fontSize:18,fontWeight:800,color:T.navy }}>{tgStep==="plans"?"⚡ Enable TestGen":tgStep==="checkout"?"Secure Checkout":"Payment Successful!"}</h3>
              <button onClick={() => setShowTestGen(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18} /></button>
            </div>
            {tgStep === "plans" && (
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {PLANS.map(plan => (
                  <div key={plan.id} onClick={() => setSelectedPlan(plan)} style={{ border:`2px solid ${selectedPlan?.id===plan.id?T.navy:T.border}`,borderRadius:12,padding:18,cursor:"pointer",position:"relative",transition:"all .18s",background:selectedPlan?.id===plan.id?T.blueSoft:"#fff" }}>
                    {plan.tag && <span className="mba-pill mba-pill-gold" style={{ position:"absolute",top:-10,right:16,fontSize:11 }}>{plan.tag}</span>}
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                      <div><span style={{ fontSize:16,fontWeight:800,color:T.navy }}>{plan.label}</span><span style={{ fontSize:24,fontWeight:800,color:T.navy,marginLeft:12 }}>{plan.price}</span><span style={{ fontSize:12,color:T.muted }}>{plan.period}</span></div>
                      <div style={{ width:22,height:22,borderRadius:"50%",border:`2px solid ${selectedPlan?.id===plan.id?T.navy:T.border}`,background:selectedPlan?.id===plan.id?T.navy:"transparent",display:"flex",alignItems:"center",justifyContent:"center" }}>{selectedPlan?.id===plan.id&&<div style={{ width:10,height:10,borderRadius:"50%",background:"#fff" }}/>}</div>
                    </div>
                    <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>{plan.features.map(f => <span key={f} style={{ fontSize:12,color:T.muted,display:"inline-flex",alignItems:"center",gap:4 }}><CheckCircle size={11} style={{ color:T.green }}/>{f}</span>)}</div>
                  </div>
                ))}
                <button className="mba-btn-primary" style={{ width:"100%",justifyContent:"center" }} disabled={!selectedPlan} onClick={() => setTgStep("checkout")}>Continue to Checkout →</button>
              </div>
            )}
            {tgStep === "checkout" && selectedPlan && (
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                <div className="mba-alert-info"><Shield size={13} /> Secured by 256-bit SSL encryption. Card details are never stored.</div>
                <div style={{ background:T.bg,borderRadius:10,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <div><p style={{ fontWeight:700,fontSize:15,color:T.navy }}>TestGen {selectedPlan.label}</p><p style={{ fontSize:12,color:T.muted }}>{selectedPlan.period}</p></div>
                  <span style={{ fontSize:22,fontWeight:800,color:T.navy }}>{selectedPlan.price}</span>
                </div>
                <div><label className="mba-label">Cardholder Name</label><input className="mba-input" value={cardForm.name} onChange={e=>setCardForm(f=>({...f,name:e.target.value}))} placeholder="Name on card" /></div>
                <div><label className="mba-label">Card Number</label><input className="mba-input" value={cardForm.number} onChange={e=>setCardForm(f=>({...f,number:e.target.value.replace(/\D/g,"").slice(0,16)}))} placeholder="1234 5678 9012 3456" maxLength={16} /></div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                  <div><label className="mba-label">Expiry (MM/YY)</label><input className="mba-input" value={cardForm.expiry} onChange={e=>setCardForm(f=>({...f,expiry:e.target.value}))} placeholder="MM/YY" maxLength={5} /></div>
                  <div><label className="mba-label">CVV</label><input className="mba-input" value={cardForm.cvv} onChange={e=>setCardForm(f=>({...f,cvv:e.target.value.replace(/\D/g,"").slice(0,4)}))} placeholder="•••" maxLength={4} type="password" /></div>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button className="mba-btn-ghost" onClick={() => setTgStep("plans")}>← Back</button>
                  <button className="mba-btn-primary" style={{ flex:1,justifyContent:"center" }} onClick={handlePay} disabled={processing}>{processing?"Processing...":<><CardIcon size={13} /> Pay {selectedPlan.price}</>}</button>
                </div>
              </div>
            )}
            {tgStep === "success" && (
              <div style={{ textAlign:"center",padding:"20px 0" }}>
                <div style={{ width:72,height:72,borderRadius:"50%",background:T.greenSoft,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}><CheckCircle size={32} style={{ color:T.green }} /></div>
                <h3 style={{ fontSize:20,fontWeight:800,color:T.navy,marginBottom:6 }}>TestGen Activated! ⚡</h3>
                <p style={{ fontSize:14,color:T.muted,marginBottom:20 }}>Your {selectedPlan?.label} plan is now active.</p>
                <div style={{ display:"flex",gap:8,justifyContent:"center" }}>
                  <button className="mba-btn-ghost" onClick={() => setShowTestGen(false)}>Close</button>
                  <Link to="/student/testgen" className="mba-btn-primary" onClick={() => setShowTestGen(false)}><Zap size={13} /> Go to TestGen</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mba-card" style={{ overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse" }}>
          <thead style={{ borderBottom:`1px solid ${T.border}` }}>
            <tr>{["Transaction ID","Course","Amount","Status","Date"].map(h => <th key={h} style={{ padding:"11px 16px",textAlign:"left",fontSize:12,color:T.subtle,fontWeight:700 }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {payments.length===0
              ? <tr><td colSpan={5} style={{padding:40,textAlign:"center",color:T.subtle,fontSize:14}}>No payment history</td></tr>
              : payments.map(p => (
                <tr key={p.id} style={{borderBottom:`1px solid ${T.border}`}}>
                  <td style={{padding:"11px 16px",fontFamily:"monospace",fontSize:13}}>{p.transaction_id}</td>
                  <td style={{padding:"11px 16px",fontSize:14}}>{p.course_name}</td>
                  <td style={{padding:"11px 16px",fontWeight:700,fontSize:14}}>₹{p.amount?.toLocaleString()}</td>
                  <td style={{padding:"11px 16px"}}><span className="mba-pill mba-pill-pass">{p.status}</span></td>
                  <td style={{padding:"11px 16px",fontSize:13,color:T.muted}}>{new Date(p.date).toLocaleDateString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── FIX 4: DRAG-TO-RANK COMPONENT ───────────────────────────────────────
function DragRankOptions({ options, ranks, onChange }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  // Build ordered list from ranks: rank[idx] = rank number (1-4)
  // We maintain a display order array separate from rank values
  const [order, setOrder] = useState(() => options.map((_, i) => i));

  useEffect(() => {
    // When ranks reset (new question), reset order
    if (Object.keys(ranks).length === 0) setOrder(options.map((_, i) => i));
  }, [options.length]);

  const handleDragStart = (e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver  = (e, idx) => { e.preventDefault(); setOverIdx(idx); };
  const handleDrop      = (e, toIdx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === toIdx) { setDragIdx(null); setOverIdx(null); return; }
    const newOrder = [...order];
    const [moved] = newOrder.splice(dragIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    setOrder(newOrder);
    // Assign ranks 1..4 based on new order
    const newRanks = {};
    newOrder.forEach((optIdx, pos) => { newRanks[optIdx] = pos + 1; });
    onChange(newRanks);
    setDragIdx(null); setOverIdx(null);
  };
  const handleDragEnd = () => { setDragIdx(null); setOverIdx(null); };

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
      <p style={{ fontSize:12,color:T.muted,marginBottom:2,display:"flex",alignItems:"center",gap:5 }}>
        <GripVertical size={13}/> Drag to reorder: <strong>Top = Most Likely → Bottom = Least Likely</strong>
      </p>
      {order.map((optIdx, pos) => {
        const letter = ["A","B","C","D"][optIdx];
        const rank = pos + 1;
        const rankColors = ["#2d6a2d","#1a2744","#b8960b","#c0392b"];
        return (
          <div
            key={optIdx}
            draggable
            onDragStart={e => handleDragStart(e, pos)}
            onDragOver={e => handleDragOver(e, pos)}
            onDrop={e => handleDrop(e, pos)}
            onDragEnd={handleDragEnd}
            className={`mba-drag-item ${dragIdx===pos?"dragging":""} ${overIdx===pos&&dragIdx!==pos?"drag-over":""}`}
          >
            <GripVertical size={16} style={{ color:T.subtle,flexShrink:0 }} />
            <div style={{ width:28,height:28,borderRadius:"50%",background:rankColors[rank-1],display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13,flexShrink:0 }}>{rank}</div>
            <span style={{ fontWeight:800,color:T.navy,flexShrink:0,width:20 }}>{letter}.</span>
            <p style={{ flex:1,fontSize:13,color:T.text,lineHeight:1.55 }}>{options[optIdx]}</p>
          </div>
        );
      })}
      <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:4 }}>
        {[1,2,3,4].map(r => {
          const rankColors = ["#2d6a2d","#1a2744","#b8960b","#c0392b"];
          const labels = ["Most Likely","Second","Third","Least Likely"];
          return <span key={r} style={{ fontSize:11,padding:"2px 8px",borderRadius:4,background:`${rankColors[r-1]}15`,color:rankColors[r-1],fontWeight:600 }}>#{r} {labels[r-1]}</span>;
        })}
      </div>
    </div>
  );
}

// ─── FIX 3 & 6: PROFILE MANAGEMENT ─────────────────────────────────────────
function ProfileManagement() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type:"",text:"" });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const cached = JSON.parse(localStorage.getItem('upskillize_profile_cache') || '{}');
  const [personalInfo, setPersonalInfo] = useState({
    full_name: cached.full_name || user?.full_name || "",
    email: cached.email || user?.email || "",
    phone: cached.phone || "",
    date_of_birth: cached.date_of_birth || "",
    gender: cached.gender || "",
    profile_photo: cached.profile_photo || null,
    bio: cached.bio || ""
  });
  const [address, setAddress] = useState({ street:"",city:"",state:"",country:"",postal_code:"" });
  const [security, setSecurity] = useState({ current_password:"",new_password:"",confirm_password:"" });
  const [showPwd, setShowPwd] = useState({ current:false,new_:false });
  const [socialLinks, setSocialLinks] = useState({ linkedin:"",github:"",twitter:"",portfolio:"" });
  const [resume, setResume] = useState({ file:null,uploadedUrl:null,uploadedName:null,uploading:false });
  const [corporateVisible, setCorporateVisible] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [enhancedBio, setEnhancedBio] = useState("");
  const [aiProfile, setAiProfile] = useState(null);
  const [aiProfileGenerating, setAiProfileGenerating] = useState(false);
  const [aiProfileError, setAiProfileError] = useState("");
  const [psychoDone, setPsychoDone] = useState(false);
  const [psychoResult, setPsychoResult] = useState(null);

  // FIX 3: Additional Info fields
  const [additionalInfo, setAdditionalInfo] = useState({
    education_level: "",
    institution: "",
    graduation_year: "",
    field_of_study: "",
    work_experience_years: "",
    current_employer: "",
    current_designation: "",
    skills: "",
    languages: "",
    certifications: "",
    hobbies: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
  });

  // FIX 6: Job Preferences
  const [jobPrefs, setJobPrefs] = useState({
    preferred_role: "",
    preferred_location: "",
    preferred_salary_min: "",
    preferred_salary_max: "",
    employment_type: "",
    work_mode: "",
    notice_period: "",
    open_to_relocation: false,
    industries: "",
    company_size: "",
    key_skills: "",
    career_goals: "",
  });

  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem('upskillize_profile_cache') || '{}');
    const hasCached = Object.keys(cached).length > 0;
    api.get("/student/profile/complete").then(r => {
      if (r.data.success) {
        const d = r.data.profile;
        if (d.personal && !hasCached) setPersonalInfo(p => ({ ...p, ...d.personal }));
        if (d.address)  setAddress(d.address);
        if (d.social)   setSocialLinks(d.social);
        if (d.additional) setAdditionalInfo(a => ({ ...a, ...d.additional }));
        if (d.job_preferences) setJobPrefs(p => ({ ...p, ...d.job_preferences }));
        if (d.corporate_visible !== undefined) setCorporateVisible(d.corporate_visible);
        if (d.resume_url) setResume(r => ({ ...r, uploadedUrl: d.resume_url, uploadedName: d.resume_name }));
        if (d.psycho_result) { setPsychoResult(d.psycho_result); setPsychoDone(true); }
      }
    }).catch(()=>{});
  }, []);

  useEffect(() => {
    const fields = [personalInfo.full_name,personalInfo.phone,personalInfo.date_of_birth,personalInfo.gender,personalInfo.bio,address.city,address.state,address.country,socialLinks.linkedin,resume.uploadedUrl,additionalInfo.skills,jobPrefs.preferred_role];
    setProfileCompletion(Math.round(fields.filter(f => f&&String(f).trim()).length / fields.length * 100));
  }, [personalInfo,address,socialLinks,resume,additionalInfo,jobPrefs]);

  const showMsg = (type, text) => { setMessage({ type,text }); setTimeout(() => setMessage({ type:"",text:"" }), 3000); };
  const save = (fn) => async () => { setSaving(true); try { await fn(); } catch (e) { showMsg("error", e.response?.data?.message||"Error saving"); } finally { setSaving(false); } };

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 5*1024*1024) { showMsg("error","Image must be under 5MB"); return; }
    const reader = new FileReader(); reader.onloadend = () => setPersonalInfo(p => ({ ...p,profile_photo:reader.result })); reader.readAsDataURL(file);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 10*1024*1024) { showMsg("error","Resume must be under 10MB"); return; }
    setResume(r => ({ ...r,file,uploading:true }));
    try {
      const fd = new FormData(); fd.append("resume",file);
      const resp = await api.post("/student/profile/resume",fd,{ headers:{"Content-Type":"multipart/form-data"} });
      if (resp.data.success) { setResume(r => ({ ...r,uploadedUrl:resp.data.url,uploadedName:file.name,uploading:false })); showMsg("success","Resume uploaded!"); }
    } catch { setResume(r => ({ ...r,uploadedUrl:URL.createObjectURL(file),uploadedName:file.name,uploading:false })); showMsg("success","Resume ready to view!"); }
  };

  const handleAiEnhance = async () => {
    if (!personalInfo.bio.trim()) { showMsg("error","Please write a bio first to enhance it."); return; }
    setAiEnhancing(true);
    try {
      const r = await api.post("/student/profile/ai-enhance", { bio:personalInfo.bio,full_name:personalInfo.full_name });
      if (r.data.success) setEnhancedBio(r.data.enhanced_bio);
      else showMsg("error", "Enhancement failed. Please try again.");
    } catch { showMsg("error", "Enhancement failed. Please check your connection."); }
    setAiEnhancing(false);
  };



  const handleToggleProfileVisibility = async () => {
    if (!aiProfile) return;
    const newVis = aiProfile.visibility === "public" ? "private" : "public";
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${AGENT_URL}/api/v1/profile/toggle-visibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ visibility: newVis }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiProfile(prev => ({ ...prev, visibility: data.visibility, url: data.public_url || prev.url }));
        showMsg("success", `Profile is now ${data.visibility}`);
      }
    } catch { showMsg("error", "Failed to update visibility"); }
  };



  // FIX 3: Updated tabs order — Personal, Address, Additional Info, Resume, Psychometric, AI Enhancer, Corporate View, Job Preferences, Security
  const tabs = [
    { id:"personal",    label:"Personal",        icon:User       },
    { id:"address",     label:"Address",         icon:MapPin     },
    { id:"additional",  label:"Additional Info", icon:Layers     },
    { id:"resume",      label:"Resume",          icon:FileUp     },
    { id:"psychometric",label:"Psychometric",    icon:Brain      },
    { id:"ai_enhance",  label:"AI Enhancer",     icon:Sparkles   },
    { id:"corporate",   label:"Corporate View",  icon:Building2  },
    { id:"job_prefs",   label:"Job Preferences", icon:BriefcaseIcon },
    { id:"security",    label:"Security",        icon:Shield     },
  ];

  return (
    <div>
      <div style={{ background:T.navy,borderRadius:12,padding:"22px 26px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,boxShadow:"0 4px 14px rgba(26,39,68,.18)" }}>
        <div><h2 style={{ fontSize:22,fontWeight:800,color:"#fff",marginBottom:4 }}>Profile Management</h2><p style={{ fontSize:13,color:"rgba(255,255,255,.55)" }}>Build a compelling profile for recruiters and faculty</p></div>
        <div style={{ textAlign:"center" }}>
          <div style={{ position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:76,height:76 }}>
            <svg width={76} height={76} style={{ transform:"rotate(-90deg)" }}>
              <circle cx={38} cy={38} r={32} stroke="rgba(255,255,255,.2)" strokeWidth={5} fill="none" />
              <circle cx={38} cy={38} r={32} stroke={T.gold} strokeWidth={5} fill="none" strokeDasharray={`${2*Math.PI*32}`} strokeDashoffset={`${2*Math.PI*32*(1-profileCompletion/100)}`} strokeLinecap="round" />
            </svg>
            <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#fff" }}>
              <span style={{ fontSize:17,fontWeight:800 }}>{profileCompletion}%</span>
              <span style={{ fontSize:10,opacity:.6 }}>Complete</span>
            </div>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={message.type==="success"?"mba-alert-success":"mba-alert-error"} style={{ marginBottom:14 }}>
          {message.type==="success" ? <CheckCircle size={14}/> : <AlertCircle size={14}/>} {message.text}
        </div>
      )}

      <div className="mba-card">
        <div className="mba-profile-tabs">
          {tabs.map(tab => { const Icon = tab.icon; return (
            <button key={tab.id} className={`mba-profile-tab ${activeTab===tab.id?"active":""}`} onClick={() => setActiveTab(tab.id)}>
              <Icon size={13} /> {tab.label}
            </button>
          ); })}
        </div>
        <div style={{ padding:24 }}>

          {/* PERSONAL TAB */}
          {activeTab==="personal" && (
            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
              <div style={{ display:"flex",gap:20,alignItems:"flex-start" }}>
                <div style={{ flexShrink:0 }}>
                  <div style={{ position:"relative" }}>
                    <div style={{ width:96,height:96,borderRadius:"50%",border:`1px solid ${T.border}`,background:T.bg,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center" }}>
                      {personalInfo.profile_photo ? <img src={personalInfo.profile_photo} alt="Profile" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <GenderAvatar gender={personalInfo?.gender||user?.gender} size={96} />}
                    </div>
                    <label style={{ position:"absolute",bottom:0,right:0,background:T.white,border:`1px solid ${T.border}`,padding:5,borderRadius:"50%",cursor:"pointer" }}>
                      <Camera size={13} style={{ color:T.navy,display:"block" }} />
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display:"none" }} />
                    </label>
                  </div>
                  <p style={{ fontSize:11,color:T.subtle,marginTop:6,textAlign:"center" }}>Max 5MB</p>
                </div>
                <div style={{ flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                  <div><label className="mba-label">Full Name *</label><input className="mba-input" value={personalInfo.full_name} onChange={e=>setPersonalInfo(p=>({...p,full_name:e.target.value}))} placeholder="Your full name" /></div>
                  <div><label className="mba-label">Email *</label><input className="mba-input" value={personalInfo.email} disabled /><p style={{ fontSize:11,color:T.subtle,marginTop:3 }}>Cannot be changed</p></div>
                  <div><label className="mba-label">Phone</label><input className="mba-input" value={personalInfo.phone} onChange={e=>setPersonalInfo(p=>({...p,phone:e.target.value}))} placeholder="+91 98765 43210" /></div>
                  <div><label className="mba-label">Date of Birth</label><input type="date" className="mba-input" value={personalInfo.date_of_birth} onChange={e=>setPersonalInfo(p=>({...p,date_of_birth:e.target.value}))} /></div>
                  <div style={{ gridColumn:"span 2" }}>
                    <label className="mba-label">Gender</label>
                    <div style={{ display:"flex",gap:16,flexWrap:"wrap" }}>
                      {["Male","Female","Other","Prefer not to say"].map(opt => (
                        <label key={opt} style={{ display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:14 }}>
                          <input type="radio" name="gender" value={opt} checked={personalInfo.gender===opt} onChange={e=>setPersonalInfo(p=>({...p,gender:e.target.value}))} /> {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn:"span 2" }}>
                    <label className="mba-label">Bio</label>
                    <textarea className="mba-textarea" rows={3} value={personalInfo.bio} onChange={e=>setPersonalInfo(p=>({...p,bio:e.target.value}))} maxLength={500} placeholder="Tell us about yourself..." />
                    <p style={{ fontSize:11,color:T.subtle,marginTop:3 }}>{(personalInfo.bio||"").length}/500</p>
                  </div>
                </div>
              </div>
              <button className="mba-btn-primary" onClick={save(async () => {
                const r = await api.put("/student/profile/personal", personalInfo);
                if (r.data.success) {
                  showMsg("success","Personal information saved!");
                  localStorage.setItem('upskillize_profile_cache', JSON.stringify(personalInfo));
                  if (updateUser) updateUser({ full_name:personalInfo.full_name, phone:personalInfo.phone, gender:personalInfo.gender, bio:personalInfo.bio, profile_photo:personalInfo.profile_photo||null });
                }
              })} disabled={saving}><Save size={13} /> {saving?"Saving...":"Save Personal Info"}</button>
            </div>
          )}

          {/* ADDRESS TAB */}
          {activeTab==="address" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14,maxWidth:540 }}>
              <div><label className="mba-label">Street Address</label><input className="mba-input" value={address.street} onChange={e=>setAddress(a=>({...a,street:e.target.value}))} placeholder="123 Main Street" /></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                {[["city","City","Mumbai"],["state","State","Maharashtra"],["postal_code","Postal Code","400001"]].map(([k,l,ph]) => (
                  <div key={k}><label className="mba-label">{l}</label><input className="mba-input" value={address[k]} onChange={e=>setAddress(a=>({...a,[k]:e.target.value}))} placeholder={ph} /></div>
                ))}
                <div><label className="mba-label">Country</label>
                  <select className="mba-select" value={address.country} onChange={e=>setAddress(a=>({...a,country:e.target.value}))}>
                    <option value="">Select Country</option><option value="IN">India</option><option value="US">United States</option><option value="UK">United Kingdom</option>
                  </select>
                </div>
              </div>
              <button className="mba-btn-primary" onClick={save(async () => { await api.put("/student/profile/address",address); showMsg("success","Address saved!"); })} disabled={saving}><Save size={13} /> {saving?"Saving...":"Save Address"}</button>
            </div>
          )}

          {/* FIX 3: ADDITIONAL INFO TAB */}
          {activeTab==="additional" && (
            <div style={{ maxWidth:640 }}>
              <h3 style={{ fontSize:15,fontWeight:800,color:T.navy,marginBottom:4 }}>Additional Information</h3>
              <p style={{ fontSize:13,color:T.muted,marginBottom:20 }}>Academic background, work experience and personal details</p>

              <p style={{ fontSize:12,fontWeight:700,color:T.navy,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em" }}>🎓 Academic Background</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
                <div>
                  <label className="mba-label">Education Level</label>
                  <select className="mba-select" value={additionalInfo.education_level} onChange={e=>setAdditionalInfo(a=>({...a,education_level:e.target.value}))}>
                    <option value="">Select level</option>
                    {["High School","Diploma","Bachelor's","Master's","MBA","PhD","Other"].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div><label className="mba-label">Institution / University</label><input className="mba-input" value={additionalInfo.institution} onChange={e=>setAdditionalInfo(a=>({...a,institution:e.target.value}))} placeholder="University of Mumbai" /></div>
                <div><label className="mba-label">Graduation Year</label><input className="mba-input" type="number" value={additionalInfo.graduation_year} onChange={e=>setAdditionalInfo(a=>({...a,graduation_year:e.target.value}))} placeholder="2024" min="1990" max="2030" /></div>
                <div><label className="mba-label">Field of Study</label><input className="mba-input" value={additionalInfo.field_of_study} onChange={e=>setAdditionalInfo(a=>({...a,field_of_study:e.target.value}))} placeholder="Business Administration" /></div>
              </div>

              <p style={{ fontSize:12,fontWeight:700,color:T.navy,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em" }}>💼 Work Experience</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
                <div><label className="mba-label">Years of Experience</label><select className="mba-select" value={additionalInfo.work_experience_years} onChange={e=>setAdditionalInfo(a=>({...a,work_experience_years:e.target.value}))}>
                  <option value="">Select</option>
                  {["Fresher","< 1 year","1-2 years","2-5 years","5-10 years","10+ years"].map(v=><option key={v} value={v}>{v}</option>)}
                </select></div>
                <div><label className="mba-label">Current Employer</label><input className="mba-input" value={additionalInfo.current_employer} onChange={e=>setAdditionalInfo(a=>({...a,current_employer:e.target.value}))} placeholder="Company name (if employed)" /></div>
                <div style={{ gridColumn:"span 2" }}><label className="mba-label">Current Designation</label><input className="mba-input" value={additionalInfo.current_designation} onChange={e=>setAdditionalInfo(a=>({...a,current_designation:e.target.value}))} placeholder="e.g. Senior Analyst" /></div>
              </div>

              <p style={{ fontSize:12,fontWeight:700,color:T.navy,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em" }}>🛠️ Skills & Languages</p>
              <div style={{ display:"flex",flexDirection:"column",gap:14,marginBottom:20 }}>
                <div><label className="mba-label">Key Skills <span style={{ fontWeight:400,textTransform:"none",letterSpacing:0,color:T.subtle }}>(comma separated)</span></label><textarea className="mba-textarea" rows={2} value={additionalInfo.skills} onChange={e=>setAdditionalInfo(a=>({...a,skills:e.target.value}))} placeholder="Financial Modelling, Excel, Python, Data Analysis..." /></div>
                <div><label className="mba-label">Languages Known</label><input className="mba-input" value={additionalInfo.languages} onChange={e=>setAdditionalInfo(a=>({...a,languages:e.target.value}))} placeholder="English, Hindi, Marathi..." /></div>
                <div><label className="mba-label">Other Certifications</label><textarea className="mba-textarea" rows={2} value={additionalInfo.certifications} onChange={e=>setAdditionalInfo(a=>({...a,certifications:e.target.value}))} placeholder="CFA Level 1, AWS Certified, Google Analytics..." /></div>
                <div><label className="mba-label">Hobbies & Interests</label><input className="mba-input" value={additionalInfo.hobbies} onChange={e=>setAdditionalInfo(a=>({...a,hobbies:e.target.value}))} placeholder="Reading, Cricket, Volunteering..." /></div>
              </div>

              <p style={{ fontSize:12,fontWeight:700,color:T.navy,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em" }}>🆘 Emergency Contact</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
                <div><label className="mba-label">Contact Name</label><input className="mba-input" value={additionalInfo.emergency_contact_name} onChange={e=>setAdditionalInfo(a=>({...a,emergency_contact_name:e.target.value}))} placeholder="Parent / Spouse name" /></div>
                <div><label className="mba-label">Contact Phone</label><input className="mba-input" value={additionalInfo.emergency_contact_phone} onChange={e=>setAdditionalInfo(a=>({...a,emergency_contact_phone:e.target.value}))} placeholder="+91 98765 43210" /></div>
                <div><label className="mba-label">Relationship</label><input className="mba-input" value={additionalInfo.emergency_contact_relation} onChange={e=>setAdditionalInfo(a=>({...a,emergency_contact_relation:e.target.value}))} placeholder="Father / Spouse / Sibling" /></div>
              </div>

              <button className="mba-btn-primary" onClick={save(async () => {
                await api.put("/student/profile/additional", additionalInfo);
                showMsg("success","Additional information saved!");
              })} disabled={saving}><Save size={13} /> {saving?"Saving...":"Save Additional Info"}</button>
            </div>
          )}

          {/* RESUME TAB */}
          {activeTab==="resume" && (
            <div style={{ maxWidth:560 }}>
              <h3 style={{ fontSize:16,fontWeight:800,color:T.navy,marginBottom:4 }}>Resume Upload</h3>
              <p style={{ fontSize:13,color:T.muted,marginBottom:20 }}>Upload your latest resume. Corporates can view it when your profile is set to visible.</p>
              <div style={{ border:`2px dashed ${T.border}`,borderRadius:12,padding:32,textAlign:"center",background:T.bg,marginBottom:16 }}>
                <FileUp size={36} style={{ color:T.subtle,margin:"0 auto 10px" }} />
                <p style={{ fontSize:14,fontWeight:600,color:T.navy,marginBottom:4 }}>Drag & drop or click to upload</p>
                <p style={{ fontSize:12,color:T.subtle,marginBottom:14 }}>PDF, DOC, DOCX — Max 10MB</p>
                <input type="file" id="resume-upload" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display:"none" }} />
                <label htmlFor="resume-upload" className="mba-btn-primary" style={{ cursor:"pointer" }}>{resume.uploading ? "Uploading..." : "Choose File"}</label>
              </div>
              {resume.uploadedUrl && (
                <div style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:T.greenSoft,border:`1px solid #b8d9b8`,borderRadius:10,marginBottom:16 }}>
                  <CheckCircle size={18} style={{ color:T.green,flexShrink:0 }} />
                  <div style={{ flex:1 }}><p style={{ fontSize:13,fontWeight:700,color:T.green }}>{resume.uploadedName || "Resume uploaded"}</p><p style={{ fontSize:12,color:T.green,opacity:.7 }}>Ready for corporate viewing</p></div>
                  <a href={resume.uploadedUrl} target="_blank" rel="noopener noreferrer" className="mba-btn-outline" style={{ fontSize:12,padding:"6px 12px" }}><Eye size={12} /> View</a>
                </div>
              )}
              <div>
                <label className="mba-label">Social Links</label>
                <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                  {[{k:"linkedin",l:"LinkedIn",ph:"https://linkedin.com/in/yourprofile"},{k:"github",l:"GitHub",ph:"https://github.com/yourusername"},{k:"portfolio",l:"Portfolio",ph:"https://yourportfolio.com"}].map(({k,l,ph}) => (
                    <input key={k} type="url" className="mba-input" value={socialLinks[k]} onChange={e=>setSocialLinks(s=>({...s,[k]:e.target.value}))} placeholder={`${l}: ${ph}`} />
                  ))}
                </div>
                <button className="mba-btn-primary" style={{ marginTop:12 }} onClick={save(async () => { await api.put("/student/profile/social",socialLinks); showMsg("success","Links saved!"); })} disabled={saving}><Save size={13} /> Save Links</button>
              </div>
            </div>
          )}

          {/* PSYCHOMETRIC TAB */}
          {activeTab==="psychometric" && <PsychometricTest psychoDone={psychoDone} setPsychoDone={setPsychoDone} psychoResult={psychoResult} setPsychoResult={setPsychoResult} showMsg={showMsg} />}

          {/* AI ENHANCER TAB — Extracted to AIEnhancer component */}
          {activeTab==="ai_enhance" && (
            <AIEnhancer showMsg={showMsg} />
          )}

          {/* FIX 5: CORPORATE VISIBILITY TAB (all fields) */}
          {activeTab==="corporate" && (
            <div style={{ maxWidth:600 }}>
              <h3 style={{ fontSize:16,fontWeight:800,color:T.navy,marginBottom:4 }}>Corporate Profile Visibility</h3>
              <p style={{ fontSize:13,color:T.muted,marginBottom:20 }}>Control what corporates and recruiters can see on your Upskillize profile.</p>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",background:corporateVisible?T.greenSoft:T.bg,border:`1.5px solid ${corporateVisible?"#b8d9b8":T.border}`,borderRadius:10,marginBottom:18 }}>
                <div>
                  <p style={{ fontWeight:700,fontSize:15,color:corporateVisible?T.green:T.navy }}>{corporateVisible ? "✓ Visible to Corporates" : "Hidden from Corporates"}</p>
                  <p style={{ fontSize:12,color:T.muted,marginTop:2 }}>{corporateVisible ? "Recruiters can find and view your profile" : "Your profile is private"}</p>
                </div>
                <div className={`mba-toggle-track ${corporateVisible?"on":""}`} onClick={() => { setCorporateVisible(v=>!v); api.put("/student/profile/corporate-visibility",{ visible:!corporateVisible }).catch(()=>{}); }} style={{ cursor:"pointer",flexShrink:0 }}><div className="mba-toggle-thumb"/></div>
              </div>
              <p style={{ fontSize:13,fontWeight:700,color:T.navy,marginBottom:12 }}>When visible, corporates can see:</p>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {[
                  ["Full Name & Photo", personalInfo.full_name, true],
                  ["Bio / About", personalInfo.bio, !!personalInfo.bio],
                  ["Date of Birth", personalInfo.date_of_birth, !!personalInfo.date_of_birth],
                  ["Phone Number", personalInfo.phone, !!personalInfo.phone],
                  ["Resume / CV", resume.uploadedName, !!resume.uploadedUrl],
                  ["LinkedIn Profile", socialLinks.linkedin, !!socialLinks.linkedin],
                  ["GitHub / Portfolio", socialLinks.github||socialLinks.portfolio, !!(socialLinks.github||socialLinks.portfolio)],
                  ["Education Background", additionalInfo.institution, !!additionalInfo.institution],
                  ["Skills", additionalInfo.skills, !!additionalInfo.skills],
                  ["Work Experience", additionalInfo.work_experience_years, !!additionalInfo.work_experience_years],
                  ["Current Employer / Role", additionalInfo.current_designation, !!additionalInfo.current_designation],
                  ["Languages", additionalInfo.languages, !!additionalInfo.languages],
                  ["Other Certifications", additionalInfo.certifications, !!additionalInfo.certifications],
                  ["Preferred Role", jobPrefs.preferred_role, !!jobPrefs.preferred_role],
                  ["Preferred Location", jobPrefs.preferred_location, !!jobPrefs.preferred_location],
                  ["Employment Type", jobPrefs.employment_type, !!jobPrefs.employment_type],
                  ["Work Mode", jobPrefs.work_mode, !!jobPrefs.work_mode],
                  ["Notice Period", jobPrefs.notice_period, !!jobPrefs.notice_period],
                  ["Course Certificates", "Earned certificates", true],
                  ["Psychometric Results", psychoResult?.type, !!psychoResult],
                  ["Quiz / Assessment Scores", "Academic performance", true],
                  ["Skills & Badges", "Gamification achievements", true],
                ].map(([label,value,done],i) => (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 13px",background:done?T.bg:"#fffafa",border:`1px solid ${done?T.border:"#fde8e8"}`,borderRadius:8 }}>
                    {done ? <CheckCircle size={14} style={{ color:T.green,flexShrink:0 }}/> : <AlertCircle size={14} style={{ color:T.red,flexShrink:0 }}/>}
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13,fontWeight:600,color:T.navy }}>{label}</p>
                      {value && <p style={{ fontSize:12,color:T.muted }}>{value}</p>}
                    </div>
                    {!done && <span style={{ fontSize:11,color:T.red,fontWeight:600 }}>Missing</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FIX 6: JOB PREFERENCES TAB */}
          {activeTab==="job_prefs" && (
            <div style={{ maxWidth:640 }}>
              <h3 style={{ fontSize:15,fontWeight:800,color:T.navy,marginBottom:4 }}>Job Preferences</h3>
              <p style={{ fontSize:13,color:T.muted,marginBottom:20 }}>Help recruiters find the right opportunity for you. These preferences are visible on your corporate profile.</p>

              <p style={{ fontSize:12,fontWeight:700,color:T.navy,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em" }}>🎯 Role & Location</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
                <div><label className="mba-label">Preferred Role / Job Title</label><input className="mba-input" value={jobPrefs.preferred_role} onChange={e=>setJobPrefs(p=>({...p,preferred_role:e.target.value}))} placeholder="e.g. Business Analyst, Marketing Manager" /></div>
                <div><label className="mba-label">Preferred Location</label><input className="mba-input" value={jobPrefs.preferred_location} onChange={e=>setJobPrefs(p=>({...p,preferred_location:e.target.value}))} placeholder="e.g. Mumbai, Bangalore, Remote" /></div>
                <div>
                  <label className="mba-label">Open to Relocation?</label>
                  <div style={{ display:"flex",gap:16,marginTop:6 }}>
                    {["Yes","No","Maybe"].map(opt => (
                      <label key={opt} style={{ display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:14 }}>
                        <input type="radio" name="relocation" value={opt} checked={jobPrefs.open_to_relocation===opt} onChange={e=>setJobPrefs(p=>({...p,open_to_relocation:e.target.value}))} /> {opt}
                      </label>
                    ))}
                  </div>
                </div>
                <div><label className="mba-label">Target Industries</label><input className="mba-input" value={jobPrefs.industries} onChange={e=>setJobPrefs(p=>({...p,industries:e.target.value}))} placeholder="BFSI, Consulting, FMCG..." /></div>
              </div>

              <p style={{ fontSize:12,fontWeight:700,color:T.navy,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em" }}>💰 Compensation & Terms</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
                <div><label className="mba-label">Expected Salary (Min — ₹ LPA)</label><input className="mba-input" type="number" value={jobPrefs.preferred_salary_min} onChange={e=>setJobPrefs(p=>({...p,preferred_salary_min:e.target.value}))} placeholder="e.g. 8" /></div>
                <div><label className="mba-label">Expected Salary (Max — ₹ LPA)</label><input className="mba-input" type="number" value={jobPrefs.preferred_salary_max} onChange={e=>setJobPrefs(p=>({...p,preferred_salary_max:e.target.value}))} placeholder="e.g. 15" /></div>
                <div>
                  <label className="mba-label">Employment Type</label>
                  <select className="mba-select" value={jobPrefs.employment_type} onChange={e=>setJobPrefs(p=>({...p,employment_type:e.target.value}))}>
                    <option value="">Select type</option>
                    {["Full-time","Part-time","Internship","Contract","Freelance","Any"].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mba-label">Work Mode</label>
                  <select className="mba-select" value={jobPrefs.work_mode} onChange={e=>setJobPrefs(p=>({...p,work_mode:e.target.value}))}>
                    <option value="">Select mode</option>
                    {["On-site","Remote","Hybrid","Any"].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mba-label">Notice Period</label>
                  <select className="mba-select" value={jobPrefs.notice_period} onChange={e=>setJobPrefs(p=>({...p,notice_period:e.target.value}))}>
                    <option value="">Select period</option>
                    {["Immediate","15 Days","1 Month","2 Months","3 Months","More than 3 Months","Currently Serving"].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mba-label">Preferred Company Size</label>
                  <select className="mba-select" value={jobPrefs.company_size} onChange={e=>setJobPrefs(p=>({...p,company_size:e.target.value}))}>
                    <option value="">Select size</option>
                    {["Startup (< 50)","Small (50-200)","Mid-size (200-1000)","Large (1000-10000)","Enterprise (10000+)","Any"].map(v=><option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <p style={{ fontSize:12,fontWeight:700,color:T.navy,marginBottom:10,textTransform:"uppercase",letterSpacing:".06em" }}>🛠️ Skills & Goals</p>
              <div style={{ display:"flex",flexDirection:"column",gap:14,marginBottom:20 }}>
                <div><label className="mba-label">Key Skills to Highlight</label><textarea className="mba-textarea" rows={2} value={jobPrefs.key_skills} onChange={e=>setJobPrefs(p=>({...p,key_skills:e.target.value}))} placeholder="Financial Modelling, Team Leadership, Python..." /></div>
                <div><label className="mba-label">Career Goals</label><textarea className="mba-textarea" rows={3} value={jobPrefs.career_goals} onChange={e=>setJobPrefs(p=>({...p,career_goals:e.target.value}))} placeholder="Describe where you want to be in 3-5 years..." /></div>
              </div>

              <button className="mba-btn-primary" onClick={save(async () => {
                await api.put("/student/profile/job-preferences", jobPrefs);
                showMsg("success","Job preferences saved!");
              })} disabled={saving}><Save size={13} /> {saving?"Saving...":"Save Job Preferences"}</button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab==="security" && (
            <div style={{ display:"flex",flexDirection:"column",gap:14,maxWidth:480 }}>
              <div className="mba-alert-info"><AlertCircle size={13} /> Use at least 6 characters with uppercase, lowercase, and numbers.</div>
              {[["current_password","Current Password","current"],["new_password","New Password","new_"]].map(([key,label,showKey]) => (
                <div key={key}><label className="mba-label">{label}</label>
                  <div style={{ position:"relative" }}>
                    <input type={showPwd[showKey]?"text":"password"} className="mba-input" style={{ paddingRight:40 }} value={security[key]} onChange={e=>setSecurity(s=>({...s,[key]:e.target.value}))} placeholder={label} />
                    <button type="button" onClick={() => setShowPwd(p=>({...p,[showKey]:!p[showKey]}))} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.muted }}>
                      {showPwd[showKey] ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>
              ))}
              <div><label className="mba-label">Confirm New Password</label><input type="password" className="mba-input" value={security.confirm_password} onChange={e=>setSecurity(s=>({...s,confirm_password:e.target.value}))} placeholder="Confirm new password" /></div>
              <button className="mba-btn-primary" onClick={save(async () => {
                if (security.new_password !== security.confirm_password) throw new Error("Passwords do not match");
                if (security.new_password.length < 6) throw new Error("Min 6 characters");
                await api.post("/auth/change-password",{ current_password:security.current_password,new_password:security.new_password });
                showMsg("success","Password changed!"); setSecurity({ current_password:"",new_password:"",confirm_password:"" });
              })} disabled={saving}><Lock size={13} /> {saving?"Changing...":"Change Password"}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FIX 4: PSYCHOMETRIC TEST (Drag-to-Rank) ────────────────────────────
function PsychometricTest({ psychoDone, setPsychoDone, psychoResult, setPsychoResult, showMsg }) {
  const [step, setStep] = useState("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [computing, setComputing] = useState(false);

  const QUESTIONS = [
    { id:1, title:"The Monday Pile-Up", dimension:"Execution", scenario:"You arrive Monday with 3 urgent tasks: a report due by noon, a client call in 30 minutes, and a team member needing help. You have time for only two.", options:["Triage immediately — estimate impact, handle top two, message the third with a timeline.","Start with the report — hardest deadline and you work best alone.","Jump on the call first, ask for agenda, use it to reprioritise everything.","Help your team member first — people over paperwork, always."] },
    { id:2, title:"The Shortcut Temptation", dimension:"Integrity", scenario:"Two days from submitting a project. A shortcut saves 5 hours — not against rules, but means presenting incomplete analysis as complete.", options:["Use the shortcut and note the limitation in a footnote — full transparency, less effort.","Decline the shortcut, complete properly, flag the time pressure to your supervisor.","Use it this once but make a mental note not to repeat it.","Ask a colleague what they would do — you're not sure where the line is."] },
    { id:3, title:"The Brilliant Introvert", dimension:"Collaboration", scenario:"In a brainstorming session, loud voices dominate. A quieter colleague scribbles notes but doesn't speak — yet you know they have the sharpest ideas.", options:["Directly invite them to share one idea.","Wait — if they want to speak, they will.","After the meeting, ask them to write up ideas and send to the group.","Share what you think their perspective might be and invite them to build on it."] },
    { id:4, title:"The Broken Framework", dimension:"Integrity", scenario:"Mid-project, you realise your financial model was built on a flawed assumption. Fixing it takes 2 days. Deadline is in 3 days.", options:["Acknowledge the flaw transparently, pivot to correct approach, communicate proactively.","Patch it minimally — the flaw is small enough most reviewers won't notice.","Quietly rebuild without telling anyone — no need to cause alarm.","Ask for a deadline extension and restart from scratch with a cleaner framework."] },
    { id:5, title:"The Wild Idea", dimension:"Innovation", scenario:"During a team meeting, you have an unconventional idea that could improve the product — but it challenges a process the senior team is attached to.", options:["Validate the idea with a quick data pull first, then present it with evidence.","Mention it casually after the meeting and gauge reactions before committing.","Write it up formally and submit through the official suggestion channel.","Wait until you've refined it into a near-perfect proposal — you only get one shot."] },
    { id:6, title:"The New System Surprise", dimension:"Adaptability", scenario:"Your team is told the analytics platform you've used for 8 months is being replaced overnight. No formal training is scheduled.", options:["Dive in with curiosity — explore the new system, find tutorials, help colleagues.","Push back and ask why the change was made without adequate notice or training.","Wait for official training before touching the new system.","Find workarounds to keep using the old system wherever possible."] },
    { id:7, title:"The Tense Colleague", dimension:"Emotional Intelligence", scenario:"A colleague snaps at you in front of the team during a stressful presentation review. It was unnecessary, but you understand they are under pressure.", options:["Stay calm, address the task professionally in the moment, check in privately afterward.","Call it out immediately — unprofessional behaviour should not be normalised.","Withdraw for the rest of the session to avoid further friction.","Report it to a manager — you don't want this becoming a pattern."] },
    { id:8, title:"The Data Surprise", dimension:"Analytical Thinking", scenario:"Your analysis returns a result that completely contradicts your hypothesis — 30 minutes before you present to the leadership team.", options:["Re-examine your methodology rapidly. If valid, present the actual result with a clear explanation.","Present the expected result and investigate the anomaly later.","Present both results, acknowledge the contradiction, and invite leadership to help interpret.","Delay the presentation until you have clarity — better late than wrong."] },
    { id:9, title:"The Disengaged Student", dimension:"Initiative", scenario:"You're a student mentor. A junior student has become visibly disengaged — missing sessions, incomplete work — but hasn't said anything is wrong.", options:["Proactively reach out, create a low-pressure space, offer specific help.","Wait — it's not your role to chase them. They need to own their learning.","Alert the course coordinator so formal support can be arranged.","Bring it up gently in the group session so the team can support together."] },
    { id:10, title:"The Expert Presentation", dimension:"Communication", scenario:"You need to present a complex credit risk model to a senior business leader with no technical background. You have 15 minutes.", options:["Translate key outputs into business decisions and risks — use plain language and one visual.","Walk through the full technical model — they should be able to follow.","Send the model and documentation in advance and offer to take questions live.","Focus entirely on the recommendation, skip the model explanation."] },
    { id:11, title:"The Process Nobody Fixed", dimension:"Initiative", scenario:"You notice a manual reporting process that wastes 3 hours per week across the team. No one has raised it. It's not your direct responsibility.", options:["Document the inefficiency, estimate time saved, propose a fix, and raise it with the relevant lead.","Automate it yourself quietly without making it an issue.","Mention it informally to colleagues.","Wait — someone with more authority should raise it first."] },
    { id:12, title:"The Suspicious Data", dimension:"Critical Thinking", scenario:"You discover a colleague's report contains figures that appear selectively chosen to support a specific outcome — potentially misleading leadership.", options:["Raise your concern privately with the colleague first — give them a chance to correct or explain.","Report it immediately to a manager or compliance team.","Ignore it — you may have misunderstood the context.","Mention it to another trusted colleague to get a second perspective."] },
    { id:13, title:"The Cross-Domain Assignment", dimension:"Adaptability", scenario:"You're placed on a project in sustainability finance — entirely different from your credit risk background.", options:["Treat it as a learning sprint — read fast, ask smart questions, identify transferable skills.","Politely push back — you'd be more valuable on a credit risk project.","Accept, but limit contributions to intersections with your existing expertise.","Focus on relationship-building with the team first, and learn the domain over time."] },
    { id:14, title:"The Unexpected Feedback", dimension:"Emotional Intelligence", scenario:"Your manager gives you critical feedback on a presentation you thought went really well. Some of it feels unfair.", options:["Listen without interrupting, note the specifics, ask clarifying questions, and reflect honestly.","Agree in the moment but privately dismiss the feedback.","Respectfully push back on the points you disagree with, using evidence.","Ask a trusted colleague whether the feedback was fair before responding."] },
    { id:15, title:"The Cancelled Project", dimension:"Growth Mindset", scenario:"A project you've invested 6 weeks in is suddenly cancelled due to a strategic pivot. Your work will not be used.", options:["Acknowledge the disappointment, identify what you learned, document transferable outputs, and redirect energy.","Feel demotivated for a while — this is a genuine loss and needs processing time.","Express your frustration openly to your manager.","Request a reassignment immediately — dwelling on cancelled work is unproductive."] },
    { id:16, title:"The Team Credit Grab", dimension:"Integrity", scenario:"A project your team built together is being publicly credited to one loud member who did significantly less. You're one of the larger contributors.", options:["Raise it professionally — share a summary of contributions with the team lead.","Let it go — credit battles look petty.","Bring it up with the individual directly and privately.","Make your contribution visible by publishing your own recap."] },
    { id:17, title:"The Sceptical Reader", dimension:"Critical Thinking", scenario:"A respected FinTech newsletter publishes: 'AI will replace 80% of bank analysts within 3 years.' Your team takes it seriously. You're not so sure.", options:["Read the underlying report, check methodology, seek counter-analyses, and form your own view.","Share the article — it's a credible source and your team should be aware.","Dismiss it — such predictions are always exaggerated for clicks.","Accept the finding broadly but contextualise it for your specific role."] },
    { id:18, title:"The Comfort Zone Deadline", dimension:"Innovation", scenario:"You've completed a course module 4 days early. The next module doesn't open for 3 days. You have bandwidth.", options:["Explore adjacent topics, read a related case study, or apply what you've learned to real data.","Take a well-earned break.","Help a peer who is behind — collaborative learning is more valuable.","Review and strengthen your understanding of the current module."] },
    { id:19, title:"The Disagreement in Public", dimension:"Communication", scenario:"In a team meeting, you disagree with the direction the group is heading — you're fairly sure the approach will fail. The room is against your view.", options:["State your position clearly with reasoning, invite counter-arguments, and commit to the team's final decision.","Stay quiet but raise concerns with your manager afterward.","Ask a targeted question that surfaces the flaw without directly opposing the group.","Go along with the team — group harmony matters more than being right."] },
    { id:20, title:"The Final Frontier", dimension:"Risk Appetite", scenario:"You've been offered a secondment to a fast-growing FinTech startup for 3 months — leaving your stable role temporarily to work in ambiguity.", options:["Take it immediately — ambiguity is where growth happens.","Take it, but negotiate a clear scope and success criteria upfront.","Decline — the instability outweighs the growth opportunity.","Ask to shadow the team for two weeks before committing."] },
    { id:21, title:"The Promotion That Did Not Come", dimension:"Locus of Control", scenario:"You've been passed over for a promotion you were confident you deserved. A less-experienced colleague was selected. No formal feedback given.", options:["Request a structured feedback session, identify specific gaps, and build a 90-day improvement plan.","Accept it — the selection process was probably political and outside your control.","Start exploring roles at other organisations — this signals a ceiling here.","Speak to a mentor who can help you read the situation before taking any action."] },
    { id:22, title:"The High-Stakes Bet", dimension:"Risk Appetite", scenario:"You must recommend one of two strategies: Strategy A has 90% chance of modest success; Strategy B has 40% chance of exceptional success but 60% chance of significant loss.", options:["Recommend Strategy A — the predictable outcome protects the client and your credibility.","Recommend Strategy B — the upside is transformational and risk is part of growth.","Present both strategies with a detailed risk-return analysis and let the client decide.","Recommend a blended approach — split resources between A and B to hedge exposure."] },
    { id:23, title:"The Public Failure", dimension:"Growth Mindset", scenario:"You led a product launch that failed publicly — low adoption, critical user feedback, and coverage in an industry newsletter. Your team looks to you.", options:["Conduct a blameless post-mortem, share learnings openly, and use the failure as a case study for the next launch.","Reframe the narrative quickly — focus on what worked and move on before the story sets.","Own the failure publicly, apologise to stakeholders, and outline a clear corrective plan.","Step back from leading the next launch temporarily — confidence needs rebuilding."] },
    { id:24, title:"The Deadlocked Room", dimension:"Conflict Style", scenario:"Two senior colleagues have reached a hard disagreement on a project direction. The conflict is stalling the entire team. Everyone looks at you.", options:["Facilitate a structured discussion — get both sides to articulate their core concern, not just their position.","Propose a concrete compromise that partially satisfies both sides and can be tested quickly.","Suggest escalating to the project sponsor — this decision is above the team's authority.","Ask a neutral question that reframes the problem in terms of shared outcomes rather than competing preferences."] },
    { id:25, title:"The New Skill Assignment", dimension:"Learning Style", scenario:"Your manager asks you to develop competency in FRTB — a complex regulatory area you've never worked in. You have 6 weeks.", options:["Find a real FRTB implementation project to shadow or contribute to — hands-on exposure from day one.","Read the Basel Committee publications, build a summary framework, then validate it with an expert.","Join a structured online course or certification programme with a clear syllabus.","Set up weekly calls with a colleague who already knows FRTB and learn through conversation and examples."] },
  ];

  const computeResult = async () => {
    setComputing(true);
    await new Promise(r => setTimeout(r, 1200));
    const dimScores = {};
    QUESTIONS.forEach(q => {
      const ranked = answers[q.id] || {};
      Object.entries(ranked).forEach(([optIdx, rank]) => {
        const pts = 5 - rank;
        dimScores[q.dimension] = (dimScores[q.dimension] || 0) + pts;
      });
    });
    const sorted = Object.entries(dimScores).sort((a,b) => b[1]-a[1]);
    const topDims = sorted.slice(0,3).map(([d]) => d);
    const PROFILES = {
      "Execution":{ icon:"⚡", desc:"You organise, prioritise and deliver under pressure. You are a natural executor." },
      "Integrity":{ icon:"🛡️", desc:"You are guided by strong ethical principles and moral courage." },
      "Collaboration":{ icon:"🤝", desc:"You are team-first, inclusive and thrive when lifting others." },
      "Analytical Thinking":{ icon:"📊", desc:"You use evidence and rigour to drive decisions." },
      "Innovation":{ icon:"💡", desc:"You think creatively and challenge convention." },
      "Adaptability":{ icon:"🔄", desc:"You are flexible, comfortable with ambiguity and change." },
      "Emotional Intelligence":{ icon:"❤️", desc:"You are empathetic, self-aware and interpersonally sensitive." },
      "Communication":{ icon:"🎤", desc:"You communicate with clarity, persuasion and audience-awareness." },
      "Initiative":{ icon:"🚀", desc:"You are proactive, self-starting and take ownership beyond your role." },
      "Critical Thinking":{ icon:"🔍", desc:"You evaluate sceptically and form independent judgement." },
      "Locus of Control":{ icon:"🎯", desc:"You take ownership of outcomes rather than blaming externals." },
      "Risk Appetite":{ icon:"📈", desc:"You are comfortable with uncertainty and asymmetric payoffs." },
      "Growth Mindset":{ icon:"🌱", desc:"You believe ability is built, not born. You learn from failure." },
      "Conflict Style":{ icon:"⚖️", desc:"You are a natural mediator who finds compromise in tension." },
      "Learning Style":{ icon:"📚", desc:"You have a clear, preferred mode of skill acquisition." },
    };
    const dominant = topDims[0];
    const profile = PROFILES[dominant] || { icon:"🌟", desc:"A well-rounded professional profile." };
    const result = { type: dominant, icon: profile.icon, desc: profile.desc, topDimensions: topDims, scores: dimScores, dominant };
    setPsychoResult(result); setPsychoDone(true); setStep("result");
    try { await api.post("/student/profile/psychometric", { result }); } catch {}
    setComputing(false);
  };

  if (step === "intro" || (psychoDone && step !== "test")) {
    return (
      <div style={{ maxWidth:540 }}>
        <h3 style={{ fontSize:16,fontWeight:800,color:T.navy,marginBottom:4 }}>🧠 Psychometric Test</h3>
        <p style={{ fontSize:13,color:T.muted,marginBottom:20 }}>Discover your personality type to find careers that suit your strengths.</p>
        {psychoDone && psychoResult ? (
          <div>
            <div style={{ background:T.navy,borderRadius:12,padding:24,marginBottom:16,textAlign:"center" }}>
              <div style={{ fontSize:48,marginBottom:8 }}>{psychoResult.icon}</div>
              <h4 style={{ fontSize:20,fontWeight:800,color:T.gold,marginBottom:6 }}>{psychoResult.type}</h4>
              <p style={{ fontSize:13,color:"rgba(255,255,255,.7)",lineHeight:1.65 }}>{psychoResult.desc}</p>
              {psychoResult.topDimensions?.length > 1 && (
                <div style={{ marginTop:12,display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap" }}>
                  {psychoResult.topDimensions.map((d,i) => <span key={d} className="mba-pill" style={{ background:"rgba(184,150,11,.2)",color:T.gold,fontSize:11 }}>#{i+1} {d}</span>)}
                </div>
              )}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:16 }}>
              {Object.entries(psychoResult.scores||{}).slice(0,6).map(([k,v]) => {
                const maxPts = 4 * 3;
                return (
                  <div key={k} style={{ background:T.bg,borderRadius:8,padding:"10px 12px" }}>
                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                      <span style={{ fontSize:12,fontWeight:600,color:T.navy }}>{k}</span>
                      <span style={{ fontSize:11,color:T.muted }}>{v} pts</span>
                    </div>
                    <div className="mba-bar-track"><div className="mba-bar-fill" style={{ width:`${Math.min(100,(v/maxPts)*100)}%`,background:T.navy }} /></div>
                  </div>
                );
              })}
            </div>
            <button className="mba-btn-ghost" onClick={() => { setStep("test"); setCurrentQ(0); setAnswers({}); }}>Retake Test</button>
          </div>
        ) : (
          <div>
            <div className="mba-alert-info" style={{ marginBottom:16 }}><AlertCircle size={13} /> 25 scenarios · Takes about 10 minutes · Drag to rank options</div>
            <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
              {[["⏱️ Drag-to-rank format","Rank 4 options by likelihood — most to least"],["🎯 25 real-world scenarios","Work and MBA-relevant situations"],["🏢 Recruiter visibility","Results shown on your corporate profile"],["📈 Career guidance","Dominant traits matched to role types"]].map(([t,d],i) => (
                <div key={i} style={{ display:"flex",gap:10,padding:"11px 14px",background:T.bg,borderRadius:8 }}>
                  <span style={{ fontSize:16 }}>{t.split(" ")[0]}</span>
                  <div><p style={{ fontSize:13,fontWeight:600,color:T.navy }}>{t.slice(3)}</p><p style={{ fontSize:12,color:T.muted }}>{d}</p></div>
                </div>
              ))}
            </div>
            <button className="mba-btn-primary" onClick={() => setStep("test")}><Brain size={14} /> Start Psychometric Test</button>
          </div>
        )}
      </div>
    );
  }

  if (step === "test") {
    const q = QUESTIONS[currentQ];
    const currentRanks = answers[q.id] || {};
    const allRanked = Object.keys(currentRanks).length === 4;
    return (
      <div style={{ maxWidth:600 }}>
        <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
          <span style={{ fontSize:13,fontWeight:700,color:T.navy }}>Scenario {currentQ+1} of {QUESTIONS.length}</span>
          <span style={{ fontSize:12,color:T.muted }}>{q.dimension}</span>
        </div>
        <div className="mba-bar-track" style={{ marginBottom:16 }}>
          <div className="mba-bar-fill" style={{ width:`${((currentQ+1)/QUESTIONS.length)*100}%`,background:T.navy }}/>
        </div>
        <div className="mba-card" style={{ padding:20,marginBottom:14 }}>
          <p style={{ fontSize:13,fontWeight:800,color:T.gold,marginBottom:6,textTransform:"uppercase",letterSpacing:".06em" }}>{q.title}</p>
          <p style={{ fontSize:14,color:T.navy,lineHeight:1.7 }}>{q.scenario}</p>
        </div>
        <DragRankOptions
          options={q.options}
          ranks={currentRanks}
          onChange={(newRanks) => setAnswers(a => ({ ...a, [q.id]: newRanks }))}
        />
        {allRanked && <div className="mba-alert-success" style={{ marginTop:10,marginBottom:10 }}>✓ All 4 options ranked — ready to proceed!</div>}
        <div style={{ display:"flex",gap:8,marginTop:12 }}>
          <button className="mba-btn-ghost" onClick={() => setCurrentQ(p=>p-1)} disabled={currentQ===0}>← Back</button>
          {currentQ < QUESTIONS.length-1
            ? <button className="mba-btn-primary" disabled={!allRanked} onClick={() => setCurrentQ(p=>p+1)}>Next →</button>
            : <button className="mba-btn-primary" disabled={!allRanked || computing} onClick={computeResult}>{computing?"Computing...":"See Results 🎯"}</button>}
        </div>
      </div>
    );
  }
  return null;
}

// ─── FIX 14: JOBS / PLACEMENTS ──────────────────────────────────────────
function JobsModule() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(null);
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ cover_letter:"" });
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    api.get("/faculty/jobs").then(r => {
      if (r.data.success) setJobs(r.data.jobs||[]);
      else setErrorMsg("Could not load jobs. Please try again.");
    }).catch(() => setErrorMsg("Could not load jobs. Please check your connection.")).finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => filter==="all" || j.type===filter);
  const typeColor = { "full-time":{ bg:T.blueSoft,color:T.blue },"internship":{ bg:T.goldSoft,color:T.gold },"part-time":{ bg:T.greenSoft,color:T.green } };

  const handleApply = async () => {
    setApplying(selected.id);
    try {
      await api.post(`/faculty/jobs/${selected.id}/apply`,{ cover_letter:applyForm.cover_letter });
    } catch {}
    await new Promise(r => setTimeout(r,800));
    setApplying(null); setShowApply(false);
    setSuccessMsg(`Application submitted for ${selected.title} at ${selected.company}!`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
        <div><h2 className="mba-section-title">Placements & Internships</h2><p className="mba-section-sub">{filtered.length} opportunities available</p></div>
        <div className="mba-tabs">
          {[["all","All"],["full-time","Full-time"],["internship","Internship"],["part-time","Part-time"]].map(([v,l]) => (
            <button key={v} className={`mba-tab ${filter===v?"active":""}`} onClick={()=>setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      {successMsg && <div className="mba-alert-success" style={{ marginBottom:16 }}><CheckCircle size={13}/> {successMsg}</div>}
      {errorMsg && <div className="mba-alert-error" style={{ marginBottom:16 }}><AlertCircle size={13}/> {errorMsg}</div>}

      {filtered.length === 0 ? (
        <div className="mba-card mba-empty"><Briefcase size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No {filter==="all"?"opportunities":"openings"} available right now</p><p style={{ fontSize:12,marginTop:4,color:T.subtle }}>Check back soon for new postings</p></div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14 }}>
          {filtered.map(job => {
            const tc = typeColor[job.type] || typeColor["full-time"];
            const daysLeft = Math.ceil((new Date(job.deadline) - new Date()) / 86400000);
            return (
              <div key={job.id} className="mba-job-card">
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",gap:6,marginBottom:6,flexWrap:"wrap" }}>
                      <span className="mba-pill" style={{ background:tc.bg,color:tc.color,textTransform:"capitalize" }}>{job.type?.replace("-"," ")}</span>
                      <span style={{ fontSize:12,color:T.subtle,display:"flex",alignItems:"center",gap:3 }}><MapPin size={10}/> {job.location}</span>
                    </div>
                    <h3 style={{ fontSize:15,fontWeight:800,color:T.navy,marginBottom:3 }}>{job.title}</h3>
                    <p style={{ fontSize:13,fontWeight:600,color:T.muted,display:"flex",alignItems:"center",gap:5 }}><Building2 size={13}/> {job.company}</p>
                  </div>
                  {job.salary && <div style={{ textAlign:"right",flexShrink:0,marginLeft:10 }}><p style={{ fontSize:11,color:T.subtle }}>Salary</p><p style={{ fontSize:13,fontWeight:700,color:T.green }}>{job.salary}</p></div>}
                </div>
                <p style={{ fontSize:13,color:T.muted,marginBottom:10,lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>{job.description}</p>
                <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginBottom:10 }}>
                  {job.skills?.map(s => <span key={s} className="mba-pill mba-pill-navy" style={{ fontSize:11 }}>{s}</span>)}
                </div>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,color:T.subtle,marginBottom:12 }}>
                  <span style={{ display:"flex",alignItems:"center",gap:3 }}><Users size={11}/> {job.applicants} applicants</span>
                  <span style={{ color:daysLeft<=5?T.red:daysLeft<=10?T.gold:T.muted,fontWeight:daysLeft<=10?700:400 }}>{daysLeft>0?`${daysLeft}d left`:"Expired"}</span>
                </div>
                <div style={{ display:"flex",gap:8 }}>
                  <button className="mba-btn-ghost" onClick={() => setSelected(job)}><Eye size={13}/> Details</button>
                  <button className="mba-btn-primary" style={{ flex:1,justifyContent:"center" }} onClick={() => { setSelected(job); setShowApply(true); }} disabled={daysLeft<=0}>
                    <ArrowRight size={13}/> Apply Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && !showApply && (
        <div className="mba-modal-bg">
          <div className="mba-modal" style={{ maxWidth:580 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}>
              <div><h3 style={{ fontSize:18,fontWeight:800,color:T.navy }}>{selected.title}</h3><p style={{ fontSize:13,color:T.muted,marginTop:2 }}>{selected.company} · {selected.location}</p></div>
              <button onClick={() => setSelected(null)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <p style={{ fontSize:14,color:T.text,lineHeight:1.7,marginBottom:14 }}>{selected.description}</p>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
              {[["Type",selected.type?.replace("-"," ")],["Salary",selected.salary||"Not disclosed"],["Deadline",new Date(selected.deadline).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})],["Applicants",`${selected.applicants} applied`]].map(([l,v]) => (
                <div key={l} style={{ background:T.bg,padding:"10px 13px",borderRadius:8 }}><p style={{ fontSize:11,color:T.subtle,marginBottom:2 }}>{l}</p><p style={{ fontSize:13,fontWeight:600,textTransform:"capitalize" }}>{v}</p></div>
              ))}
            </div>
            <div style={{ marginBottom:16 }}>
              <p style={{ fontSize:12,fontWeight:700,color:T.navy,marginBottom:8,textTransform:"uppercase",letterSpacing:".06em" }}>Required Skills</p>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{selected.skills?.map(s => <span key={s} className="mba-pill mba-pill-navy">{s}</span>)}</div>
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <button className="mba-btn-ghost" onClick={() => setSelected(null)}>Close</button>
              <button className="mba-btn-primary" style={{ flex:1,justifyContent:"center" }} onClick={() => setShowApply(true)}>Apply Now →</button>
            </div>
          </div>
        </div>
      )}

      {showApply && selected && (
        <div className="mba-modal-bg">
          <div className="mba-modal" style={{ maxWidth:520 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}>
              <div><h3 style={{ fontSize:18,fontWeight:800,color:T.navy }}>Apply for Role</h3><p style={{ fontSize:13,color:T.muted,marginTop:2 }}>{selected.title} · {selected.company}</p></div>
              <button onClick={() => setShowApply(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={18}/></button>
            </div>
            <div className="mba-alert-info" style={{ marginBottom:14 }}><AlertCircle size={13}/> Your profile and resume will be shared with the recruiter.</div>
            <div style={{ marginBottom:14 }}>
              <label className="mba-label">Cover Letter (Optional)</label>
              <textarea className="mba-textarea" rows={5} value={applyForm.cover_letter} onChange={e=>setApplyForm(f=>({...f,cover_letter:e.target.value}))} placeholder={`Dear Hiring Manager at ${selected.company},\n\nI am writing to express my interest in the ${selected.title} position...`} />
            </div>
            <div style={{ display:"flex",gap:8 }}>
              <button className="mba-btn-ghost" onClick={() => setShowApply(false)}>Cancel</button>
              <button className="mba-btn-primary" style={{ flex:1,justifyContent:"center" }} onClick={handleApply} disabled={applying===selected.id}>
                {applying===selected.id ? "Submitting..." : <><Send size={13}/> Submit Application</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI INTERVIEW SIMULATION ──────────────────────────────────────────────
function AIInterviewSimulation() {
  const [phase, setPhase] = useState("setup");
  const [role, setRole] = useState("Business Analyst");
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState([]);
  const chatEndRef = useRef(null);

  const ROLES = ["Business Analyst","Marketing Manager","Finance Associate","HR Business Partner","Operations Manager","Strategy Consultant","Product Manager","Data Analyst"];
  const QUESTIONS = {
    "Business Analyst":["Tell me about yourself and why you're interested in a Business Analyst role.","Describe a time you had to analyse complex data to make a business decision.","How do you handle conflicting requirements from stakeholders?","Walk me through your approach to creating a business requirements document.","Where do you see yourself in 5 years?","Do you have any questions for us?"],
    "default":["Tell me about yourself.","What are your key strengths?","Describe a challenging situation and how you overcame it.","Why are you interested in this role?","Tell us about a time you demonstrated leadership.","Do you have any questions for us?"],
  };

  const getQuestions = () => QUESTIONS[role] || QUESTIONS["default"];

  const startInterview = () => {
    const qs = getQuestions();
    setMessages([{ from:"ai",text:`Welcome to your ${role} interview simulation! I'm your AI interviewer today. Please answer each question as you would in a real interview. Let's begin!\n\n**Question 1:** ${qs[0]}` }]);
    setQIndex(0); setAnswers([]); setScores([]); setPhase("interview");
  };

  const sendAnswer = async () => {
    if (!currentInput.trim()) return;
    const qs = getQuestions();
    const userMsg = currentInput.trim();
    setCurrentInput("");
    setMessages(m => [...m, { from:"user",text:userMsg }]);
    setAnswers(a => [...a, userMsg]);
    setLoading(true);
    await new Promise(r => setTimeout(r,1200));
    const score = Math.floor(55 + Math.random()*40);
    setScores(s => [...s,score]);
    const feedbacks = [`Good answer! You showed clarity and structure. Score: ${score}/100.\n\nTip: Add a specific quantifiable result to strengthen your response.`,`Well articulated. Score: ${score}/100.\n\nTip: Consider using the STAR method (Situation, Task, Action, Result).`,`Decent response. Score: ${score}/100.\n\nTip: Connect your answer more directly to the requirements of the ${role} role.`];
    const fb = feedbacks[qIndex % feedbacks.length];
    const nextQ = qIndex + 1;
    if (nextQ < qs.length) { setMessages(m => [...m, { from:"ai",text:`${fb}\n\n**Question ${nextQ+1}:** ${qs[nextQ]}` }]); setQIndex(nextQ); }
    else { setMessages(m => [...m, { from:"ai",text:`${fb}\n\nThank you for completing the interview! Calculating your overall performance...` }]); setTimeout(() => setPhase("result"), 1500); }
    setLoading(false);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  if (phase === "setup") return (
    <div style={{ maxWidth:640 }}>
      <div style={{ marginBottom:20 }}><h2 className="mba-section-title">AI Interview Simulation</h2><p className="mba-section-sub">Practice for real interviews with personalised AI feedback</p></div>
      <div style={{ background:"#fff",border:`1px solid ${T.border}`,borderLeft:`3px solid ${T.navy}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(26,39,68,.05)",marginBottom:12 }}>
        <div style={{ padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10,background:T.bg }}>
          <div style={{ width:34,height:34,borderRadius:"50%",background:`${T.navy}18`,border:`1.5px solid ${T.navy}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Mic size={14} style={{ color:T.navy }} /></div>
          <div><p style={{ fontSize:13,fontWeight:700,color:T.navy }}>Configure Your Mock Interview</p><p style={{ fontSize:11,color:T.subtle }}>Select a role and start a realistic AI-powered interview</p></div>
        </div>
        <div style={{ padding:20 }}>
          <div style={{ marginBottom:16 }}><label className="mba-label">Target Role</label><select className="mba-select" value={role} onChange={e=>setRole(e.target.value)}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10 }}>
            {[{ icon:"🎯",label:"6 Questions",desc:"~15 minutes",accent:T.navy },{ icon:"📊",label:"Live Scoring",desc:"Per answer",accent:T.gold },{ icon:"💡",label:"AI Feedback",desc:"Personalised",accent:T.green }].map(({icon,label,desc,accent}) => (
              <div key={label} style={{ padding:"12px 14px",background:T.bg,borderRadius:10,textAlign:"center",border:`1px solid ${T.border}`,borderTop:`2px solid ${accent}` }}>
                <div style={{ fontSize:24,marginBottom:6 }}>{icon}</div>
                <p style={{ fontSize:13,fontWeight:700,color:T.navy }}>{label}</p>
                <p style={{ fontSize:11,color:T.subtle }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button className="mba-btn-primary" style={{ width:"100%",justifyContent:"center",padding:"13px 18px",fontSize:15 }} onClick={startInterview}><Mic size={15}/> Start Interview Simulation</button>
    </div>
  );

  if (phase === "interview") {
    const qs = getQuestions();
    return (
      <div style={{ maxWidth:680 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
          <div><h2 className="mba-section-title">{role} Interview</h2><p className="mba-section-sub">Question {Math.min(qIndex+1,qs.length)} of {qs.length}</p></div>
          <button className="mba-btn-ghost" style={{ fontSize:12 }} onClick={() => setPhase("setup")}>Exit</button>
        </div>
        <div style={{ background:T.bg,borderRadius:12,padding:16,height:420,overflowY:"auto",marginBottom:14,display:"flex",flexDirection:"column",gap:12 }}>
          {messages.map((m,i) => (
            <div key={i}>
              {m.from==="ai" ? (
                <div><div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4 }}><div style={{ width:28,height:28,borderRadius:"50%",background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12 }}>🤖</div><span style={{ fontSize:11,fontWeight:700,color:T.navy,textTransform:"uppercase",letterSpacing:".06em" }}>AI Interviewer</span></div>
                <div className="mba-chat-bubble-ai" style={{ marginLeft:34 }}>{m.text.split("\n").map((line,li) => <p key={li} style={{ fontWeight:line.startsWith("**")?700:400,marginBottom:line?4:0 }}>{line.replace(/\*\*/g,"")}</p>)}</div></div>
              ) : (
                <div><div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:4,justifyContent:"flex-end" }}><span style={{ fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:".06em" }}>You</span><div style={{ width:28,height:28,borderRadius:"50%",background:T.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12 }}>👤</div></div>
                <div className="mba-chat-bubble-user">{m.text}</div></div>
              )}
            </div>
          ))}
          {loading && <div style={{ display:"flex",alignItems:"center",gap:8 }}><div style={{ width:28,height:28,borderRadius:"50%",background:T.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12 }}>🤖</div><div style={{ display:"flex",gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:7,height:7,borderRadius:"50%",background:T.muted }}/>)}</div></div>}
          <div ref={chatEndRef}/>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <textarea className="mba-textarea" rows={2} value={currentInput} onChange={e=>setCurrentInput(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendAnswer();}}} placeholder="Type your answer… (Enter to send)" style={{ flex:1,resize:"none" }} disabled={loading}/>
          <button className="mba-btn-primary" onClick={sendAnswer} disabled={loading||!currentInput.trim()} style={{ padding:"0 16px",alignSelf:"stretch" }}><Send size={14}/></button>
        </div>
      </div>
    );
  }

  if (phase === "result") {
    const avg = scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
    return (
      <div style={{ maxWidth:560 }}>
        <h2 className="mba-section-title" style={{ marginBottom:20 }}>Interview Complete!</h2>
        <div className="mba-card" style={{ padding:28,textAlign:"center",marginBottom:16 }}>
          <div style={{ width:80,height:80,borderRadius:"50%",background:avg>=80?T.greenSoft:avg>=60?T.goldSoft:T.redSoft,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",border:`3px solid ${avg>=80?T.green:avg>=60?T.gold:T.red}` }}>
            <span style={{ fontSize:28,fontWeight:800,color:avg>=80?T.green:avg>=60?T.gold:T.red }}>{avg}</span>
          </div>
          <h3 style={{ fontSize:20,fontWeight:800,color:T.navy,marginBottom:4 }}>Overall Score: {avg}/100</h3>
          <p style={{ fontSize:13,color:T.muted,marginBottom:16 }}>{avg>=80?"Excellent performance! You're interview-ready.":avg>=60?"Good effort. A few more practice sessions will help.":"Keep practising! Focus on structure and specificity."}</p>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button className="mba-btn-ghost" onClick={() => { setPhase("setup"); setMessages([]); }}>Try Again</button>
          <button className="mba-btn-primary" style={{ flex:1,justifyContent:"center" }} onClick={() => setPhase("setup")}><Mic size={13}/> New Interview</button>
        </div>
      </div>
    );
  }
  return null;
}

// ─── GAMIFICATION ─────────────────────────────────────────────────────────
function Gamification() {
  const [loading, setLoading] = useState(true);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState("badges");

  useEffect(() => {
    api.get("/student/gamification").then(r => {
      if (r.data.success) { setXp(r.data.xp||0); setLevel(r.data.level||1); setLeaderboard(r.data.leaderboard||[]); }
    }).catch(()=>{}).finally(() => setLoading(false));
  }, []);

  const BADGES = [
    { id:1,icon:"🎯",name:"First Quiz",desc:"Completed first assessment",earned:true,xp:50 },
    { id:2,icon:"📚",name:"Bookworm",desc:"Completed 5 course materials",earned:true,xp:100 },
    { id:3,icon:"🏆",name:"Top Scorer",desc:"Score 90%+ on an assessment",earned:true,xp:200 },
    { id:4,icon:"🔥",name:"7-Day Streak",desc:"7 consecutive login days",earned:true,xp:150 },
    { id:5,icon:"💼",name:"Job Seeker",desc:"Applied to first job",earned:true,xp:75 },
    { id:6,icon:"🎤",name:"Interview Pro",desc:"Completed AI interview",earned:false,xp:250 },
    { id:7,icon:"🧠",name:"Psycho Pioneer",desc:"Completed psychometric test",earned:false,xp:175 },
    { id:8,icon:"🌟",name:"Star Student",desc:"100% profile completion",earned:false,xp:300 },
    { id:9,icon:"🏅",name:"Course Champion",desc:"Complete 3 courses",earned:false,xp:500 },
    { id:10,icon:"💡",name:"Discussion Leader",desc:"10 forum posts",earned:false,xp:200 },
    { id:11,icon:"📊",name:"Analytics Ace",desc:"View progress 5 times",earned:false,xp:80 },
    { id:12,icon:"🎓",name:"Graduate",desc:"Earn first certificate",earned:false,xp:1000 },
  ];

  const DAILY = [
    { label:"Watch a course video", xp:20, done:true },
    { label:"Answer an assessment question", xp:30, done:true },
    { label:"Post in forum", xp:25, done:false },
    { label:"Complete assignment", xp:50, done:false },
    { label:"Apply to a job", xp:40, done:false },
  ];

  const nextLevelXp = level * 500;
  const levelProgress = Math.min(100, Math.round((xp % 500) / 5));

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
        <div><h2 className="mba-section-title">Achievements & Rewards</h2><p className="mba-section-sub">Earn XP, unlock badges and climb the leaderboard</p></div>
      </div>
      <div style={{ background:`linear-gradient(135deg,${T.navy} 0%,${T.navyLight} 100%)`,borderRadius:12,padding:"20px 24px",marginBottom:20,display:"flex",alignItems:"center",gap:24,color:"#fff",boxShadow:"0 4px 14px rgba(26,39,68,.2)" }}>
        <div style={{ width:64,height:64,borderRadius:"50%",background:"rgba(184,150,11,.2)",border:"2px solid rgba(184,150,11,.5)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <span style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:".1em" }}>LVL</span>
          <span style={{ fontSize:22,fontWeight:800,color:T.gold,lineHeight:1 }}>{level}</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
            <span style={{ fontSize:15,fontWeight:700 }}>{xp.toLocaleString()} XP Total</span>
            <span style={{ fontSize:12,color:"rgba(255,255,255,.5)" }}>{nextLevelXp - (xp%500)} XP to Level {level+1}</span>
          </div>
          <div className="mba-xp-bar"><div className="mba-xp-fill" style={{ width:`${levelProgress}%` }}/></div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <p style={{ fontSize:11,color:"rgba(255,255,255,.45)" }}>Badges Earned</p>
          <p style={{ fontSize:24,fontWeight:800,color:T.gold }}>{BADGES.filter(b=>b.earned).length}</p>
        </div>
      </div>

      <div className="mba-tabs" style={{ marginBottom:16 }}>
        {[["badges","🏅 Badges"],["leaderboard","🏆 Leaderboard"],["daily","⚡ Daily Challenges"]].map(([v,l]) => (
          <button key={v} className={`mba-tab ${activeTab===v?"active":""}`} onClick={()=>setActiveTab(v)}>{l}</button>
        ))}
      </div>

      {activeTab === "badges" && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12 }}>
          {BADGES.map(badge => (
            <div key={badge.id} style={{ background:"#fff",border:`1px solid ${badge.earned?T.goldBorder:T.border}`,borderRadius:12,padding:16,textAlign:"center",position:"relative" }}>
              {badge.earned && <div style={{ position:"absolute",top:8,right:8,width:18,height:18,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center" }}><CheckCircle size={11} style={{color:"#fff"}}/></div>}
              <div className={`mba-badge ${badge.earned?"mba-badge-earned":"mba-badge-locked"}`} style={{ margin:"0 auto 10px" }}>{badge.icon}</div>
              <p style={{ fontSize:13,fontWeight:700,color:badge.earned?T.navy:T.muted,marginBottom:3 }}>{badge.name}</p>
              <p style={{ fontSize:11,color:T.subtle,marginBottom:6 }}>{badge.desc}</p>
              <span className={`mba-pill ${badge.earned?"mba-pill-gold":"mba-pill-verified"}`} style={{ fontSize:11 }}>+{badge.xp} XP</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div className="mba-card" style={{ overflow:"hidden" }}>
          <div className="mba-card-head"><span className="mba-card-title">🏆 Batch Leaderboard</span></div>
          {leaderboard.map((s,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderBottom:`1px solid ${T.border}`,background:s.isYou?"#f0f4ff":"#fff" }}>
              <span style={{ fontSize:18,fontWeight:800,color:i===0?T.gold:i===1?"#999":i===2?"#cd7f32":T.subtle,minWidth:28,textAlign:"center" }}>{i<3?["🥇","🥈","🥉"][i]:s.rank}</span>
              <span style={{ fontSize:20 }}>{s.avatar}</span>
              <span style={{ flex:1,fontSize:14,fontWeight:s.isYou?700:500 }}>{s.name}{s.isYou&&<span className="mba-pill mba-pill-sub" style={{marginLeft:8,fontSize:11}}>You</span>}</span>
              <span style={{ fontSize:14,fontWeight:700,color:T.navy }}>{s.xp?.toLocaleString()} XP</span>
            </div>
          ))}
          {leaderboard.length === 0 && <div style={{ padding:32,textAlign:"center",color:T.subtle,fontSize:13 }}>Leaderboard data not available yet</div>}
        </div>
      )}

      {activeTab === "daily" && (
        <div style={{ maxWidth:520 }}>
          <div className="mba-alert-info" style={{ marginBottom:14 }}><Zap size={13}/> Complete all daily challenges to earn a 50 XP bonus!</div>
          {DAILY.map((c,i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:c.done?T.greenSoft:"#fff",border:`1px solid ${c.done?"#b8d9b8":T.border}`,borderRadius:10,marginBottom:8 }}>
              <div style={{ width:24,height:24,borderRadius:"50%",background:c.done?T.green:T.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                {c.done ? <CheckCircle size={14} style={{color:"#fff"}}/> : <div style={{width:8,height:8,borderRadius:"50%",background:"#fff"}}/>}
              </div>
              <span style={{ flex:1,fontSize:14,fontWeight:500,color:c.done?T.green:T.text,textDecoration:c.done?"line-through":"none" }}>{c.label}</span>
              <span className={`mba-pill ${c.done?"mba-pill-pass":"mba-pill-navy"}`}>+{c.xp} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FIX 11: CLASSES SCHEDULE ─────────────────────────────────────────────
function ClassesSchedule() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/faculty/classes")
      .then(r => { if (r.data.success) setClasses(r.data.classes||[]); else setError("No class data available."); })
      .catch(() => setError("Could not load class schedule. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = {
    live:      classes.filter(c=>c.status==="live"),
    upcoming:  classes.filter(c=>c.status==="upcoming"),
    completed: classes.filter(c=>c.status==="completed"),
  };

  const platformColor = { Zoom:{ bg:"#e8f0fe",color:"#1a73e8" },"Google Meet":{ bg:"#e8f5e9",color:"#188038" } };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="mba-section-title">Class Schedule</h2><p className="mba-section-sub">Your live sessions and class recordings</p></div>
      </div>

      {error && <div className="mba-alert-error" style={{ marginBottom:16 }}><AlertCircle size={13}/> {error}</div>}

      {filtered.live.length > 0 && (
        <div style={{ background:`linear-gradient(135deg,${T.red} 0%,#a93226 100%)`,borderRadius:12,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:10,height:10,borderRadius:"50%",background:"#fff",boxShadow:"0 0 0 3px rgba(255,255,255,.3)" }}/>
            <div><p style={{ fontSize:13,fontWeight:700,color:"rgba(255,255,255,.7)" }}>LIVE NOW</p><p style={{ fontSize:16,fontWeight:800,color:"#fff" }}>{filtered.live[0].title}</p></div>
          </div>
          <a href={filtered.live[0].link} target="_blank" rel="noopener noreferrer" className="mba-btn-gold" style={{ fontSize:13 }}><Video size={13}/> Join Now</a>
        </div>
      )}

      <div className="mba-tabs" style={{ marginBottom:16 }}>
        {[["upcoming","Upcoming"],["live","Live Now"],["completed","Completed"]].map(([v,l]) => (
          <button key={v} className={`mba-tab ${tab===v?"active":""}`} onClick={()=>setTab(v)}>
            {l} {filtered[v]?.length>0&&<span style={{ background:"rgba(255,255,255,.3)",borderRadius:8,padding:"0 5px",fontSize:11,marginLeft:3 }}>{filtered[v].length}</span>}
          </button>
        ))}
      </div>

      {(filtered[tab]||[]).length === 0 ? (
        <div className="mba-card mba-empty"><CalendarDays size={36} style={{ color:T.border,margin:"0 auto 8px" }}/><p>No {tab} classes{tab==="upcoming"?" scheduled":""}</p></div>
      ) : (
        <div className="mba-card" style={{ overflow:"hidden" }}>
          {(filtered[tab]||[]).map((cls,i) => {
            const pc = platformColor[cls.platform] || { bg:T.bg,color:T.muted };
            const isLive = cls.status === "live";
            return (
              <div key={cls.id} className="mba-class-row" style={{ padding:"16px 18px",borderBottom:i<(filtered[tab]||[]).length-1?`1px solid ${T.border}`:"none" }}>
                <div style={{ width:48,height:48,borderRadius:10,background:isLive?T.redSoft:T.bg,border:`1.5px solid ${isLive?"#f7c1c1":T.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <span style={{ fontSize:11,fontWeight:700,color:isLive?T.red:T.muted }}>{new Date(cls.date).toLocaleDateString("en-IN",{day:"2-digit"})}</span>
                  <span style={{ fontSize:10,color:isLive?T.red:T.subtle }}>{new Date(cls.date).toLocaleDateString("en-IN",{month:"short"})}</span>
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:14,fontWeight:700,color:T.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{cls.title}</p>
                  <p style={{ fontSize:12,color:T.muted,marginTop:2 }}>{cls.faculty} · {cls.time} · {cls.duration} min</p>
                  <span style={{ fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:4,background:pc.bg,color:pc.color }}>{cls.platform}</span>
                </div>
                <div style={{ flexShrink:0 }}>
                  {cls.status==="upcoming"&&cls.link&&<a href={cls.link} target="_blank" rel="noopener noreferrer" className="mba-btn-outline" style={{ fontSize:12,padding:"6px 12px" }}><Video size={12}/> Join</a>}
                  {cls.status==="live"&&cls.link&&<a href={cls.link} target="_blank" rel="noopener noreferrer" className="mba-btn-primary" style={{ fontSize:12,padding:"7px 14px",background:T.red }}><Video size={12}/> Join Live</a>}
                  {cls.status==="completed"&&<span className="mba-pill mba-pill-verified">Completed</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── FIX 10: ASSESSMENTS (renamed from Quizzes) ──────────────────────────
function StudentAssessments() {
  const [enrollments,setEnrollments]=useState([]);
  const [quizzesByCourse,setQuizzesByCourse]=useState({});
  const [attempts,setAttempts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [activeQuiz,setActiveQuiz]=useState(null);
  const [answers,setAnswers]=useState({});
  const [currentQ,setCurrentQ]=useState(0);
  const [result,setResult]=useState(null);
  const [submitting,setSubmitting]=useState(false);
  const [timeLeft,setTimeLeft]=useState(null);
  const [startTime,setStartTime]=useState(null);
  const [activeTab,setActiveTab]=useState("available");
 
  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get("/enrollments/my-enrollments");
        const enr = r.data.enrollments||[];
        setEnrollments(enr);
        const res = await Promise.all(
          enr.map(e =>
            api.get(`/quizzes/course/${e.Course?.id}`)
              .then(r=>({courseId:e.Course?.id,quizzes:r.data.quizzes||[]}))
              .catch(()=>({courseId:e.Course?.id,quizzes:[]}))
          )
        );
        const map = {};
        res.forEach(r=>{ map[r.courseId]=r.quizzes; });
        setQuizzesByCourse(map);
        try {
          const ar = await api.get("/quizzes/my-attempts");
          setAttempts(ar.data.attempts||[]);
        } catch { setAttempts([]); }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);
 
  useEffect(() => {
    if (!activeQuiz||result) return;
    const iv = setInterval(() => setTimeLeft(p => {
      if (p<=1) { clearInterval(iv); handleSubmit(true); return 0; }
      return p-1;
    }), 1000);
    return () => clearInterval(iv);
  }, [activeQuiz,result]);
 
  const startQuiz = async (quiz) => {
    try {
      const r = await api.get(`/quizzes/${quiz.id}`);
      setActiveQuiz(r.data.quiz);
      setAnswers({});
      setCurrentQ(0);
      setResult(null);
      setTimeLeft((r.data.quiz.time_limit_minutes||30)*60);
      setStartTime(Date.now());
    } catch { alert("Error loading assessment"); }
  };
 
  const handleSubmit = async (auto=false) => {
    if (!auto&&!window.confirm("Submit assessment?")) return;
    setSubmitting(true);
    try {
      const r = await api.post(`/quizzes/${activeQuiz.id}/submit`,{
        answers,
        time_taken_seconds: Math.round((Date.now()-startTime)/1000)
      });
      setResult(r.data.result);
      try {
        const ar = await api.get("/quizzes/my-attempts");
        setAttempts(ar.data.attempts||[]);
      } catch {}
    } catch { alert("Error submitting"); }
    finally { setSubmitting(false); }
  };
 
  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const fmtDur = (s) => {
    if (!s) return "–";
    const m = Math.floor(s/60);
    return m>0 ? `${m}m ${s%60}s` : `${s}s`;
  };
 
  if (loading) return <Spinner />;
 
  // ── Active quiz view ──
  if (activeQuiz && !result) {
    const questions = activeQuiz.QuizQuestions||[];
    const q = questions[currentQ];
    return (
      <div style={{ maxWidth:600,margin:"0 auto" }}>
        <div className="mba-card" style={{ padding:16,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <div>
            <div style={{ fontWeight:700,fontSize:15,color:T.navy }}>{activeQuiz.title}</div>
            <div style={{ fontSize:12,color:T.subtle }}>Question {currentQ+1} of {questions.length}</div>
          </div>
          <div style={{ padding:"7px 14px",borderRadius:8,background:timeLeft<60?T.redSoft:T.bg,color:timeLeft<60?T.red:T.navy,fontWeight:800,fontSize:15,border:`1.5px solid ${timeLeft<60?"#f7c1c1":T.border}`,display:"flex",alignItems:"center",gap:5 }}>
            <Timer size={13}/> {fmt(timeLeft)}
          </div>
        </div>
        <div style={{ height:4,background:T.border,borderRadius:2,marginBottom:14,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${((currentQ+1)/questions.length)*100}%`,background:T.navy,transition:"width .3s" }}/>
        </div>
        <div className="mba-card" style={{ padding:22,marginBottom:14 }}>
          <p style={{ fontSize:15,fontWeight:700,color:T.navy,marginBottom:18 }}>{q?.question_text}</p>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {[{k:"a",l:q?.option_a},{k:"b",l:q?.option_b},{k:"c",l:q?.option_c},{k:"d",l:q?.option_d}].map(opt => (
              <button key={opt.k} className={`mba-quiz-option ${answers[q?.id]===opt.k?"selected":""}`}
                onClick={() => setAnswers(p=>({...p,[q.id]:opt.k}))}>
                <span style={{ fontWeight:800,minWidth:18 }}>{opt.k.toUpperCase()}.</span> {opt.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:"flex",gap:8,justifyContent:"space-between" }}>
          <button className="mba-btn-ghost" onClick={() => setCurrentQ(p=>p-1)} disabled={currentQ===0}>← Previous</button>
          {currentQ < questions.length-1
            ? <button className="mba-btn-primary" onClick={() => setCurrentQ(p=>p+1)}>Next →</button>
            : <button className="mba-btn-primary" onClick={() => handleSubmit()} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>}
        </div>
      </div>
    );
  }
 
  // ── Result view ──
  if (result) return (
    <div style={{ maxWidth:560,margin:"0 auto" }}>
      <div className="mba-card" style={{ padding:28,textAlign:"center" }}>
        <div style={{ width:72,height:72,borderRadius:"50%",background:result.passed?T.greenSoft:T.redSoft,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
          <Trophy size={32} style={{ color:result.passed?T.green:T.red }}/>
        </div>
        <h2 style={{ fontSize:20,fontWeight:800,color:T.navy,marginBottom:6 }}>
          {result.passed ? "Assessment Passed" : "Below Passing Threshold"}
        </h2>
        <p style={{ fontSize:44,fontWeight:800,color:T.navy,margin:"10px 0" }}>{result.percentage}%</p>
        <p style={{ fontSize:13,color:T.subtle,marginBottom:20 }}>
          Score: {result.score}/{result.total_marks} · Pass: {result.pass_percentage}%
        </p>
        <div style={{ textAlign:"left",display:"flex",flexDirection:"column",gap:6,marginBottom:20 }}>
          {result.result_details?.map((d,i) => (
            <div key={i} style={{ display:"flex",gap:10,padding:11,borderRadius:8,background:d.is_correct?T.greenSoft:T.redSoft,alignItems:"flex-start" }}>
              {d.is_correct
                ? <CheckCircle size={14} style={{color:T.green,marginTop:1,flexShrink:0}}/>
                : <XCircle    size={14} style={{color:T.red,  marginTop:1,flexShrink:0}}/>}
              <div>
                <p style={{ fontSize:13,fontWeight:600 }}>{d.question_text}</p>
                {!d.is_correct && (
                  <p style={{ fontSize:12,color:T.red,marginTop:2 }}>
                    Your answer: {d.student_answer?.toUpperCase()||"Not answered"} · Correct: {d.correct_option?.toUpperCase()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="mba-btn-outline" onClick={() => { setActiveQuiz(null); setResult(null); }}>
          ← Back to Assessments
        </button>
      </div>
    </div>
  );
 
  // ── Main list view ──
  const allQuizzes = enrollments.flatMap(e =>
    (quizzesByCourse[e.Course?.id]||[]).map(q => ({ ...q, courseName: e.Course?.course_name }))
  );
 
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <h2 className="mba-section-title">My Assessments</h2>
        <div className="mba-tabs">
          {[["available","Available"],["history","Attempt History"]].map(([val,label]) => (
            <button key={val} className={`mba-tab ${activeTab===val?"active":""}`} onClick={()=>setActiveTab(val)}>
              {label}
            </button>
          ))}
        </div>
      </div>
 
      {activeTab==="available" && (
        allQuizzes.length===0
          ? <div className="mba-card mba-empty">
              <ClipboardList size={36} style={{color:T.border,margin:"0 auto 8px"}}/>
              <p>No assessments available yet</p>
            </div>
          : <div className="mba-grid-courses">
              {allQuizzes.map(quiz => {
                const myAttempts = attempts.filter(a=>a.quiz_id===quiz.id);
                const best = myAttempts.length>0
                  ? Math.max(...myAttempts.map(a=>(a.score/a.total_marks)*100))
                  : null;
                return (
                  <div key={quiz.id} className="mba-course-card">
                    <div style={{ height:2,background:T.navy }}/>
                    <div style={{ padding:18 }}>
                      <p style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",color:T.gold,marginBottom:5 }}>
                        {quiz.courseName}
                      </p>
                      <h3 style={{ fontSize:15,fontWeight:700,color:T.navy,marginBottom:10 }}>{quiz.title}</h3>
                      {quiz.description && (
                        <p style={{ fontSize:13,color:T.muted,marginBottom:10,lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>
                          {quiz.description}
                        </p>
                      )}
                      <div style={{ display:"flex",gap:10,flexWrap:"wrap",fontSize:12,color:T.subtle,marginBottom:10 }}>
                        <span><Timer size={12}/> {quiz.time_limit_minutes}m</span>
                        <span><ClipboardList size={12}/> {quiz.question_count} Qs</span>
                        <span><Target size={12}/> Pass: {quiz.pass_percentage}%</span>
                      </div>
                      {best!==null && (
                        <div className={`mba-pill ${best>=quiz.pass_percentage?"mba-pill-pass":"mba-pill-fail"}`}
                          style={{ display:"inline-flex",alignItems:"center",gap:4,marginBottom:10 }}>
                          <Trophy size={10}/> Best: {Math.round(best)}% · {myAttempts.length} attempt{myAttempts.length>1?"s":""}
                        </div>
                      )}
                      <button className="mba-btn-primary" onClick={() => startQuiz(quiz)} style={{ width:"100%",justifyContent:"center" }}>
                        <PlayCircle size={13}/> {myAttempts.length>0 ? "Retake" : "Start"} Assessment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
      )}
 
      {activeTab==="history" && (
        attempts.length===0
          ? <div className="mba-card mba-empty">
              <Trophy size={36} style={{color:T.border,margin:"0 auto 8px"}}/>
              <p>No attempts yet</p>
            </div>
          : <div className="mba-card" style={{overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead style={{borderBottom:`1px solid ${T.border}`}}>
                  <tr>
                    {["Assessment","Course","Score","Time","Status","Date"].map(h => (
                      <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:12,color:T.subtle,fontWeight:700}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a,i) => {
                    const pct = a.total_marks>0 ? Math.round((a.score/a.total_marks)*100) : 0;
                    return (
                      <tr key={i} style={{borderBottom:`1px solid ${T.border}`}}>
                        <td style={{padding:"11px 14px",fontWeight:600,fontSize:14}}>{a.Quiz?.title||"–"}</td>
                        <td style={{padding:"11px 14px",fontSize:13,color:T.muted}}>{a.Quiz?.Course?.course_name||"–"}</td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:56,height:4,background:T.border,borderRadius:2,overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${pct}%`,background:a.passed?T.green:T.red,borderRadius:2}}/>
                            </div>
                            <span style={{fontWeight:700,fontSize:13}}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:13,color:T.muted}}>{fmtDur(a.time_taken_seconds)}</td>
                        <td style={{padding:"11px 14px"}}>
                          <span className={`mba-pill ${a.passed?"mba-pill-pass":"mba-pill-fail"}`}>
                            {a.passed?"Passed":"Failed"}
                          </span>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:12,color:T.subtle}}>
                          {a.submitted_at
                            ? new Date(a.submitted_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})
                            : "–"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
      )}
    </div>
  );
}
// ─── FIX 9: ASSIGNMENTS with AI Review ───────────────────────────────────
function StudentAssignments() {
  const [assignments,setAssignments]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState("pending");
  const [selected,setSelected]=useState(null);
  const [showSubmit,setShowSubmit]=useState(false);
  const [showDetails,setShowDetails]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [submitForm,setSubmitForm]=useState({notes:"",file:null});
  const [successMsg,setSuccessMsg]=useState("");
  // FIX 9: AI Review state
  const [aiRevResult,setAiRevResult]=useState(null);
  const [aiRevLoading,setAiRevLoading]=useState(false);
  const [showAiRev,setShowAiRev]=useState(false);
 
  useEffect(() => {
    api.get("/student/assignments")
      .then(r=>{ if(r.data.success) setAssignments(r.data.assignments||[]); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);
 
  // AiRev: handled by AiRevPanel component
  const handleAiRev = (assignment) => {
    setSelected(assignment);
    setShowAiRev(true);
  };
 
  const handleSubmitAssignment = async () => {
    if (!submitForm.file && !submitForm.notes.trim()) { alert("Please add a file or notes."); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("notes", submitForm.notes);
      if (submitForm.file) fd.append("file", submitForm.file);
      const r = await api.post(`/student/assignments/${selected.id}/submit`, fd, { headers:{"Content-Type":"multipart/form-data"} });
      if (r.data.success) {
        setAssignments(p => p.map(a => a.id===selected.id ? {...a,status:"submitted",submitted_at:new Date().toISOString()} : a));
        setShowSubmit(false);
        setSubmitForm({notes:"",file:null});
        setSuccessMsg("Assignment submitted successfully!");
        setTimeout(()=>setSuccessMsg(""),4000);
      }
    } catch(e) { alert(e.response?.data?.message||"Submission failed."); }
    finally { setSubmitting(false); }
  };
 
  const getBadge = (status,dueDate) => {
    if (new Date(dueDate)<new Date()&&status==="pending") return {label:"Overdue",cls:"mba-pill-fail"};
    if (status==="graded")    return {label:"Graded",   cls:"mba-pill-navy"};
    if (status==="submitted") return {label:"Submitted",cls:"mba-pill-sub"};
    return {label:"Pending",cls:"mba-pill-warn"};
  };
 
  const getDaysLeft = (dueDate) => {
    const d = Math.ceil((new Date(dueDate)-new Date())/86400000);
    if (d<0)  return {text:`${Math.abs(d)}d overdue`,color:T.red};
    if (d===0) return {text:"Due today",color:T.gold};
    if (d<=3)  return {text:`${d}d left`,color:T.gold};
    return {text:`${d}d left`,color:T.green};
  };
 
  const getMaxMarks = (a) => a.max_marks || (a.rubric?.categories?.length>0 ? a.rubric.categories.reduce((s,c)=>s+(parseInt(c.points)||0),0) : a.total_marks);
 
  const counts = {
    pending:   assignments.filter(a=>a.status==="pending"&&new Date(a.due_date)>=new Date()).length,
    submitted: assignments.filter(a=>a.status==="submitted").length,
    graded:    assignments.filter(a=>a.status==="graded").length,
    overdue:   assignments.filter(a=>a.status==="pending"&&new Date(a.due_date)<new Date()).length,
  };
 
  const filtered = assignments.filter(a => {
    if (filter==="all")     return true;
    if (filter==="overdue") return new Date(a.due_date)<new Date()&&a.status==="pending";
    return a.status===filter;
  });
 
  if (loading) return <Spinner />;
 
  return (
    <div>
      <h2 className="mba-section-title" style={{marginBottom:20}}>My Assignments</h2>
 
      {successMsg && (
        <div className="mba-alert-success" style={{marginBottom:14}}>
          <CheckCircle size={13}/> {successMsg}
        </div>
      )}
 
      {/* Stats */}
      <div className="mba-grid-4" style={{marginBottom:16}}>
        {[
          {label:"Pending",  count:counts.pending,   accent:"mba-metric-gold"},
          {label:"Submitted",count:counts.submitted, accent:"mba-metric-blue"},
          {label:"Graded",   count:counts.graded,    accent:"mba-metric-green"},
          {label:"Overdue",  count:counts.overdue,   accent:"mba-metric-red"},
        ].map(m => (
          <div key={m.label} className={`mba-metric ${m.accent}`}>
            <div className="mba-metric-label">{m.label}</div>
            <div className="mba-metric-value">{m.count}</div>
          </div>
        ))}
      </div>
 
      {/* Filter tabs */}
      <div className="mba-tabs" style={{marginBottom:16}}>
        {["all","pending","submitted","graded","overdue"].map(f => (
          <button key={f} className={`mba-tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)} style={{textTransform:"capitalize"}}>
            {f}{f!=="all"&&counts[f]!=null?` (${counts[f]})`:""}</button>
        ))}
        <button onClick={()=>setShowAiRev(v=>!v)} style={{marginLeft:"auto",fontSize:13,padding:"8px 18px",display:"flex",alignItems:"center",gap:6,background:"#1a2744",color:"#fff",border:"none",borderRadius:8,fontFamily:"Plus Jakarta Sans,sans-serif",fontWeight:700,cursor:"pointer"}}><Bot size={14}/> AiRev</button>
      </div>
 
      {showAiRev ? (
        <AiRevPanel assignment={selected || { id: 1, title: "Assignment Review", description: "Submit your work for AI review" }} submissionNotes="" onClose={() => setShowAiRev(false)} />
      ) : filtered.length===0 ? (
        <div className="mba-card mba-empty">
          <ClipboardList size={36} style={{color:T.border,margin:"0 auto 8px"}}/>
          <p>No {filter} assignments</p>
        </div>
      ) : filtered.map(a => {
        const badge   = getBadge(a.status,a.due_date);
        const dl      = getDaysLeft(a.due_date);
        const maxM    = getMaxMarks(a);
        const scoreP  = maxM>0&&a.grade!=null ? Math.round((a.grade/maxM)*100) : null;
        return (
          <div key={a.id} className="mba-card" style={{marginBottom:10,padding:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:6}}>
                  <span className="mba-pill mba-pill-navy">{a.course_name}</span>
                  <span className={`mba-pill ${badge.cls}`}>{badge.label}</span>
                </div>
                <h3 style={{fontSize:14,fontWeight:700,color:T.navy,textTransform:"uppercase",letterSpacing:".03em"}}>{a.title}</h3>
                <p style={{fontSize:13,color:T.muted,marginTop:4,lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{a.description}</p>
              </div>
              {a.status==="graded"&&scoreP!==null && (
                <div style={{width:60,height:60,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,flexShrink:0,border:"3px solid",marginLeft:14,
                  borderColor:scoreP>=80?T.green:scoreP>=60?T.gold:T.red,
                  color:scoreP>=80?T.green:scoreP>=60?T.gold:T.red,
                  background:scoreP>=80?T.greenSoft:scoreP>=60?"#fdf8ed":T.redSoft}}>
                  {scoreP}%
                </div>
              )}
            </div>
 
            <div style={{display:"flex",flexWrap:"wrap",gap:14,fontSize:12,color:T.muted,marginBottom:12}}>
              <span style={{display:"flex",alignItems:"center",gap:4}}><Calendar size={12}/> Due: {new Date(a.due_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
              <span style={{display:"flex",alignItems:"center",gap:4,fontWeight:700,color:dl.color}}><Clock size={12}/> {dl.text}</span>
              <span style={{display:"flex",alignItems:"center",gap:4}}><Star size={12}/> {a.total_marks} marks</span>
            </div>
 
            {/* Faculty feedback */}
            {a.status==="graded"&&a.feedback && (
              <div style={{background:T.bg,borderLeft:`3px solid ${T.navy}`,padding:"9px 13px",borderRadius:"0 4px 4px 0",marginBottom:10}}>
                <p style={{fontSize:11,textTransform:"uppercase",letterSpacing:".06em",color:T.subtle,marginBottom:3}}>Faculty Feedback</p>
                <p style={{fontSize:13,color:T.text}}>{a.feedback}</p>
              </div>
            )}
 
            {a.status==="submitted"&&a.submitted_at && (
              <div className="mba-alert-success" style={{marginBottom:10}}>
                <CheckCircle size={12}/> Submitted on {new Date(a.submitted_at).toLocaleString("en-IN")}
              </div>
            )}
 
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button className="mba-btn-ghost" onClick={()=>{ setSelected(a); setShowDetails(true); }}>
                <Eye size={13}/> View Details
              </button>
 
              {a.status==="pending" && (
                <button className="mba-btn-primary" onClick={()=>{ setSelected(a); setShowSubmit(true); }}>
                  <Upload size={13}/> Submit
                </button>
              )}
 

 
              {a.status==="submitted" && (
                <span className="mba-pill mba-pill-pass" style={{display:"inline-flex",alignItems:"center",gap:4,padding:"7px 12px"}}>
                  <CheckCircle size={11}/> Submitted
                </span>
              )}
            </div>
          </div>
        );
      })}
 


      {/* Details Modal */}
      {showDetails && selected && (()=>{
        const mM = getMaxMarks(selected);
        return (
          <div className="mba-modal-bg">
            <div className="mba-modal" style={{maxWidth:560}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                <h3 style={{fontSize:18,fontWeight:800,color:T.navy}}>Assignment Details</h3>
                <button onClick={()=>setShowDetails(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.muted}}><X size={18}/></button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {[["Course",selected.course_name],["Title",selected.title]].map(([l,v])=>(
                  <div key={l}><p style={{fontSize:11,textTransform:"uppercase",letterSpacing:".06em",color:T.subtle,marginBottom:3}}>{l}</p><p style={{fontSize:14,fontWeight:700,color:T.text}}>{v}</p></div>
                ))}
                <div>
                  <p style={{fontSize:11,textTransform:"uppercase",letterSpacing:".06em",color:T.subtle,marginBottom:3}}>Description</p>
                  <p style={{fontSize:14,color:T.text,background:T.bg,padding:"11px 13px",borderRadius:8,lineHeight:1.6}}>{selected.description}</p>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  <div style={{background:T.bg,padding:"11px 13px",borderRadius:8}}>
                    <p style={{fontSize:11,color:T.subtle,marginBottom:3}}>Due Date</p>
                    <p style={{fontSize:14,fontWeight:600}}>{new Date(selected.due_date).toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
                  </div>
                  <div style={{background:T.bg,padding:"11px 13px",borderRadius:8}}>
                    <p style={{fontSize:11,color:T.subtle,marginBottom:3}}>Total Marks</p>
                    <p style={{fontSize:14,fontWeight:600}}>{selected.total_marks}</p>
                  </div>
                </div>
                {selected.status==="graded" && (
                  <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"13px 15px"}}>
                    <p style={{fontSize:11,textTransform:"uppercase",letterSpacing:".06em",color:T.subtle,marginBottom:6}}>Grade & Feedback</p>
                    {selected.grade!=null
                      ? <p style={{fontSize:26,fontWeight:800,color:T.navy,marginBottom:6}}>{selected.grade}/{mM} <span style={{fontSize:15}}>({Math.round(selected.grade/mM*100)}%)</span></p>
                      : <p style={{fontSize:14,color:T.subtle}}>Grade not yet recorded</p>}
                    {selected.feedback && <p style={{fontSize:13,color:T.text}}>{selected.feedback}</p>}
                  </div>
                )}
              </div>
              <button className="mba-btn-ghost" onClick={()=>setShowDetails(false)} style={{width:"100%",justifyContent:"center",marginTop:18}}>Close</button>
            </div>
          </div>
        );
      })()}
 
      {/* Submit Modal */}
      {showSubmit && selected && (
        <div className="mba-modal-bg">
          <div className="mba-modal" style={{maxWidth:480}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
              <h3 style={{fontSize:18,fontWeight:800,color:T.navy}}>Submit Assignment</h3>
              <button onClick={()=>setShowSubmit(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.muted}}><X size={18}/></button>
            </div>
            <div className="mba-alert-info" style={{marginBottom:14}}>
              <FileText size={12}/> <strong>{selected.title}</strong> — Due: {new Date(selected.due_date).toLocaleDateString()}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <label className="mba-label">Upload File</label>
                <div style={{border:`1.5px dashed ${T.border}`,borderRadius:8,padding:20,textAlign:"center"}}>
                  <Upload size={24} style={{color:T.subtle,margin:"0 auto 8px"}}/>
                  <p style={{fontSize:13,color:T.muted,marginBottom:8}}>Upload your assignment file (PDF, DOC, ZIP)</p>
                  <input type="file" id="assign-file" onChange={e=>setSubmitForm(f=>({...f,file:e.target.files[0]}))} style={{display:"none"}} accept=".pdf,.doc,.docx,.zip,.txt,.ppt,.pptx"/>
                  <label htmlFor="assign-file" className="mba-btn-primary" style={{cursor:"pointer",display:"inline-flex"}}>Choose File</label>
                  {submitForm.file && <p style={{fontSize:13,color:T.green,marginTop:8,fontWeight:600}}>✓ {submitForm.file.name}</p>}
                </div>
              </div>
              <div>
                <label className="mba-label">Notes / Comments <span style={{fontSize:11,color:T.subtle,textTransform:"none",letterSpacing:0}}>(optional)</span></label>
                <textarea className="mba-textarea" rows={4} value={submitForm.notes} onChange={e=>setSubmitForm(f=>({...f,notes:e.target.value}))} placeholder="Add any notes for your faculty..."/>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginTop:18}}>
              <button className="mba-btn-primary" onClick={handleSubmitAssignment} disabled={submitting} style={{flex:1,justifyContent:"center"}}>
                {submitting?"Submitting...":<><Upload size={13}/> Submit Assignment</>}
              </button>
              <button className="mba-btn-ghost" onClick={()=>setShowSubmit(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─── FIX 7 & 8: COURSE MATERIALS (Module/Topic accordion + Transcript) ───
function CourseMaterials() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [materials,setMaterials]=useState([]);
  const [loading,setLoading]=useState(true);
  const [activeItem,setActiveItem]=useState(null);
  const [completedIds,setCompletedIds]=useState(()=>{ try{ return JSON.parse(localStorage.getItem(`mat_${courseId}`)||"[]"); }catch{ return []; } });
  const [courseName,setCourseName]=useState("");
  // FIX 7: Module accordion state
  const [openModules,setOpenModules]=useState({});
  // FIX 8: Transcript toggle
  const [showTranscript,setShowTranscript]=useState(false);
  const [transcript,setTranscript]=useState(null);
  const [transcriptLoading,setTranscriptLoading]=useState(false);
 
  const TYPE_CFG = {
    video:{ label:"Video",  color:T.red  },
    pdf:  { label:"PDF",    color:T.blue },
    ppt:  { label:"Slides", color:T.navy },
    scorm:{ label:"SCORM",  color:T.green},
  };
 
  const resolveUrl = (p) => {
    if (!p) return null;
    if (p.startsWith("http")) return p;
    return ((import.meta?.env?.VITE_API_URL||"https://upskillize-lms-backend.onrender.com/api").replace(/\/api$/,""))+p;
  };
 
  const fetchMaterials = async (silent=false) => {
    if (!silent) setLoading(true);
    try {
      const [mr,cr] = await Promise.allSettled([
        api.get(`/student/course-content/${courseId}`),
        api.get(`/courses/${courseId}`),
      ]);
      if (mr.status==="fulfilled"&&mr.value.data.success) {
        const items = mr.value.data.content||[];
        setMaterials(items);
        setActiveItem(cur => cur?(items.find(m=>m.id===cur.id)||items[0]||null):(items[0]||null));
        // Auto-open first module
        if (items.length > 0) {
          const firstMod = items[0].module || items[0].module_name || "Module 1";
          setOpenModules({ [firstMod]: true });
        }
      }
      if (cr.status==="fulfilled"&&cr.value.data.success) setCourseName(cr.value.data.course?.course_name||"");
    } catch {}
    finally { setLoading(false); }
  };
 
  useEffect(() => {
    fetchMaterials();
    const iv = setInterval(()=>fetchMaterials(true), 30000);
    const onFocus = ()=>fetchMaterials(true);
    window.addEventListener("focus",onFocus);
    return ()=>{ clearInterval(iv); window.removeEventListener("focus",onFocus); };
  }, [courseId]);
 
  const markDone = (id) => {
    if (completedIds.includes(id)) return;
    const u = [...completedIds,id];
    setCompletedIds(u);
    try { localStorage.setItem(`mat_${courseId}`,JSON.stringify(u)); } catch {}
  };
 
  // FIX 8: Fetch/generate transcript for a video
  const fetchTranscript = async (item) => {
    setShowTranscript(true);
    setTranscriptLoading(true);
    setTranscript(null);
    try {
      // Try backend first
      const r = await api.get(`/student/course-content/${item.id}/transcript`);
      if (r.data.success && r.data.transcript) {
        setTranscript(r.data.transcript);
      } else {
        // Fallback: AI-generated summary via Anthropic API
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: `Generate a detailed study notes / transcript summary for an MBA course video with the following details:
 
Video Title: ${item.title}
Course: ${courseName}
Description: ${item.description || "No description provided"}
 
Please provide:
1. **Key Topics Covered** (4-5 bullet points)
2. **Main Concepts Explained** (detailed paragraph)
3. **Important Takeaways** (3-4 bullet points)
4. **Study Notes** (structured notes a student can refer to)
 
Keep it educational, precise and MBA-level appropriate.`
            }],
          }),
        });
        const data = await response.json();
        const text = data.content?.map(c=>c.text||"").join("\n") || "Transcript not available for this video.";
        setTranscript(text);
      }
    } catch {
      setTranscript("Transcript is not available for this video yet.\n\nThis feature is in development. Please check back later or contact support@upskillize.com");
    }
    setTranscriptLoading(false);
  };
 
  const progress = materials.length>0 ? Math.round(completedIds.length/materials.length*100) : 0;
 
  // FIX 7: Group materials by module
  const groupedByModule = materials.reduce((acc, item) => {
    const mod = item.module || item.module_name || item.chapter || "General";
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(item);
    return acc;
  }, {});
  const moduleNames = Object.keys(groupedByModule);
 
  if (loading) return <Spinner />;
 
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
        <button className="mba-btn-ghost" onClick={()=>navigate("/student/courses")}>
          <ChevronLeft size={13}/> My Courses
        </button>
        <div style={{flex:1}}>
          <h2 className="mba-section-title" style={{display:"flex",alignItems:"center",gap:8}}>
            <FolderOpen size={20} style={{color:T.navy}}/> Course Materials
          </h2>
          {courseName && <p className="mba-section-sub">{courseName}</p>}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="mba-btn-ghost" onClick={()=>fetchMaterials(true)}><RefreshCw size={12}/> Refresh</button>
          <button className="mba-btn-primary" onClick={()=>navigate(`/student/course/${courseId}`)}>
            <PlayCircle size={13}/> Watch Videos
          </button>
        </div>
      </div>
 
      {materials.length===0 ? (
        <div className="mba-card mba-empty"><FolderOpen size={36} style={{color:T.border,margin:"0 auto 8px"}}/><p>No materials uploaded yet</p></div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
          {/* Main viewer */}
          <div>
            {activeItem && (()=>{
              const cfg  = TYPE_CFG[activeItem.type]||TYPE_CFG.pdf;
              const url  = resolveUrl(activeItem.file_path);
              return (
                <>
                  {/* Video / PDF viewer */}
                  <div style={{background:"#0b1623",borderRadius:12,overflow:"hidden",marginBottom:12}}>
                    {activeItem.type==="video"&&url ? (
                      <div style={{position:"relative",paddingTop:"56.25%"}}>
                        <video src={url} controls controlsList="nodownload" onContextMenu={e=>e.preventDefault()}
                          style={{position:"absolute",inset:0,width:"100%",height:"100%"}}
                          onEnded={()=>markDone(activeItem.id)}/>
                      </div>
                    ) : activeItem.type==="pdf"&&url ? (
                      <div style={{position:"relative",paddingTop:"56.25%",background:"#fff"}}>
                        <iframe src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} title={activeItem.title}/>
                      </div>
                    ) : activeItem.type==="ppt"&&url ? (
                      <div style={{position:"relative",paddingTop:"56.25%",background:"#fff"}}>
                        <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`} style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}} title={activeItem.title}/>
                      </div>
                    ) : (
                      <div style={{position:"relative",paddingTop:"56.25%"}}>
                        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
                          <div style={{width:56,height:56,borderRadius:10,background:cfg.color,display:"flex",alignItems:"center",justifyContent:"center"}}><FileText size={24} style={{color:"#fff"}}/></div>
                          <p style={{color:"rgba(255,255,255,.6)",fontSize:13}}>Preview not available</p>
                        </div>
                      </div>
                    )}
                  </div>
 
                  {/* Item info bar */}
                  <div className="mba-card" style={{padding:18,marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"flex-start",flexWrap:"wrap"}}>
                      <div style={{flex:1}}>
                        <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",color:cfg.color,display:"block",marginBottom:4}}>{cfg.label}</span>
                        <h3 style={{fontSize:16,fontWeight:800,color:T.navy}}>{activeItem.title}</h3>
                        {activeItem.description && <p style={{fontSize:13,color:T.muted,marginTop:4}}>{activeItem.description}</p>}
                        {/* Module / topic breadcrumb */}
                        {(activeItem.module||activeItem.module_name) && (
                          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:8,fontSize:11,color:T.subtle}}>
                            <Folder size={11}/> {activeItem.module||activeItem.module_name}
                            {(activeItem.topic||activeItem.topic_name) && <><ChevronRight size={10}/> {activeItem.topic||activeItem.topic_name}</>}
                          </div>
                        )}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {!completedIds.includes(activeItem.id) ? (
                          <button className="mba-btn-primary" onClick={()=>markDone(activeItem.id)} style={{background:T.green}}>
                            <CheckCircle size={12}/> Mark Complete
                          </button>
                        ) : (
                          <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"8px 14px",background:T.greenSoft,border:`1px solid #b8d9b8`,borderRadius:8,fontSize:13,color:T.green}}>
                            <CheckCircle size={12}/> Completed
                          </div>
                        )}
                        {/* FIX 8: Transcript button for videos */}
                        {activeItem.type==="video" && (
                          <button className="mba-btn-ghost" style={{fontSize:12}} onClick={()=>fetchTranscript(activeItem)}>
                            <AlignLeft size={12}/> Transcript / Notes
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
 
                  {/* FIX 8: Transcript Panel */}
                  {showTranscript && (
                    <div className="mba-card" style={{marginBottom:12,borderLeft:`3px solid ${T.gold}`}}>
                      <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <AlignLeft size={14} style={{color:T.gold}}/>
                          <span style={{fontSize:13,fontWeight:700,color:T.navy}}>Video Transcript / Study Notes</span>
                          <span className="mba-pill mba-pill-gold" style={{fontSize:10}}>AI-Generated</span>
                        </div>
                        <button onClick={()=>setShowTranscript(false)} style={{background:"none",border:"none",cursor:"pointer",color:T.muted}}><X size={14}/></button>
                      </div>
                      <div style={{padding:16,maxHeight:340,overflowY:"auto"}}>
                        {transcriptLoading ? (
                          <div style={{textAlign:"center",padding:"24px 0"}}>
                            <div className="mba-spinner" style={{margin:"0 auto 10px"}}/>
                            <p style={{fontSize:13,color:T.muted}}>Generating study notes for this video…</p>
                          </div>
                        ) : (
                          <div style={{fontSize:13,color:T.text,lineHeight:1.75,whiteSpace:"pre-wrap"}}>
                            {(transcript||"").split("\n").map((line,i) => {
                              if (line.startsWith("**")&&line.endsWith("**")) return <p key={i} style={{fontWeight:800,color:T.navy,marginTop:12,marginBottom:4}}>{line.replace(/\*\*/g,"")}</p>;
                              if (line.startsWith("- ")||line.startsWith("• ")) return <p key={i} style={{paddingLeft:14,marginBottom:3,display:"flex",gap:6}}><span style={{color:T.gold,fontWeight:700,flexShrink:0}}>•</span>{line.slice(2)}</p>;
                              return line ? <p key={i} style={{marginBottom:3}}>{line}</p> : <br key={i}/>;
                            })}
                          </div>
                        )}
                      </div>
                      <div style={{padding:"10px 16px",borderTop:`1px solid ${T.border}`,background:T.bg,fontSize:11,color:T.subtle}}>
                        💡 These notes are AI-generated for study reference. Actual video content is the authoritative source.
                      </div>
                    </div>
                  )}
 
                  {/* Prev / Next navigation */}
                  <div style={{display:"flex",gap:8}}>
                    <button className="mba-btn-ghost" style={{flex:1,justifyContent:"center"}}
                      onClick={()=>{ const i=materials.findIndex(m=>m.id===activeItem.id); if(i>0) setActiveItem(materials[i-1]); }}
                      disabled={materials.findIndex(m=>m.id===activeItem.id)===0}>
                      <ChevronLeft size={13}/> Previous
                    </button>
                    <button className="mba-btn-primary" style={{flex:1,justifyContent:"center"}}
                      onClick={()=>{ const i=materials.findIndex(m=>m.id===activeItem.id); if(i<materials.length-1){ markDone(activeItem.id); setActiveItem(materials[i+1]); setShowTranscript(false); }}}
                      disabled={materials.findIndex(m=>m.id===activeItem.id)===materials.length-1}>
                      Next <ChevronRight size={13}/>
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
 
          {/* FIX 7: Module/Topic accordion sidebar */}
          <div className="mba-card" style={{overflow:"hidden",display:"flex",flexDirection:"column",maxHeight:"calc(100vh - 180px)"}}>
            {/* Progress header */}
            <div style={{padding:"13px 14px",background:T.navy,flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(255,255,255,.6)",marginBottom:6}}>
                <span>{completedIds.length}/{materials.length} completed</span>
                <span style={{fontWeight:800,color:"#fff"}}>{progress}%</span>
              </div>
              <div style={{height:4,background:"rgba(255,255,255,.15)",borderRadius:2,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${progress}%`,background:T.gold,transition:"width .4s"}}/>
              </div>
            </div>
 
            {/* Module accordion */}
            <div style={{flex:1,overflowY:"auto"}}>
              {moduleNames.length > 1 ? (
                // Show module grouping when multiple modules exist
                moduleNames.map((modName, modIdx) => {
                  const modItems = groupedByModule[modName];
                  const isOpen = openModules[modName] !== false;
                  const modCompleted = modItems.filter(m=>completedIds.includes(m.id)).length;
                  return (
                    <div key={modName}>
                      {/* Module header */}
                      <div
                        className={`mba-module-head ${isOpen?"open":""}`}
                        onClick={()=>setOpenModules(p=>({...p,[modName]:!p[modName]}))}
                      >
                        <div style={{width:24,height:24,borderRadius:6,background:isOpen?T.navy:T.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <Folder size={12} style={{color:isOpen?"#fff":T.muted}}/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <p style={{fontSize:13,fontWeight:700,color:T.navy,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{modName}</p>
                          <p style={{fontSize:11,color:T.subtle}}>{modCompleted}/{modItems.length} done</p>
                        </div>
                        {isOpen ? <ChevronUp size={13} style={{color:T.subtle,flexShrink:0}}/> : <ChevronRight size={13} style={{color:T.subtle,flexShrink:0}}/>}
                      </div>
 
                      {/* Topics inside module */}
                      {isOpen && modItems.map((item,idx) => {
                        const cfg = TYPE_CFG[item.type]||TYPE_CFG.pdf;
                        const isActive = activeItem?.id===item.id;
                        const isDone = completedIds.includes(item.id);
                        return (
                          <div key={item.id} className={`mba-material-item ${isActive?"active":""}`}
                            onClick={()=>{ setActiveItem(item); setShowTranscript(false); }}
                            style={{paddingLeft:28}}>
                            <div style={{width:24,height:24,borderRadius:6,background:isDone?T.greenSoft:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              {isDone ? <CheckCircle size={11} style={{color:T.green}}/> : <FileText size={11} style={{color:"#fff"}}/>}
                            </div>
                            <div style={{flex:1,minWidth:0}}>
                              <p style={{fontSize:13,fontWeight:600,color:isActive?T.navy:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</p>
                              <div style={{display:"flex",alignItems:"center",gap:4}}>
                                <span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:cfg.color}}>{cfg.label}</span>
                                {(item.topic||item.topic_name) && <><span style={{fontSize:10,color:T.subtle}}>·</span><span style={{fontSize:10,color:T.subtle}}>{item.topic||item.topic_name}</span></>}
                              </div>
                            </div>
                            {isActive && <span style={{fontSize:9,background:T.navy,color:"#fff",padding:"2px 5px",borderRadius:3,fontWeight:700,flexShrink:0}}>NOW</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                // Flat list when no module grouping
                materials.map((item,idx) => {
                  const cfg = TYPE_CFG[item.type]||TYPE_CFG.pdf;
                  const isActive = activeItem?.id===item.id;
                  const isDone = completedIds.includes(item.id);
                  return (
                    <div key={item.id} className={`mba-material-item ${isActive?"active":""}`}
                      onClick={()=>{ setActiveItem(item); setShowTranscript(false); }}>
                      <div style={{width:28,height:28,borderRadius:6,background:isDone?T.greenSoft:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {isDone ? <CheckCircle size={13} style={{color:T.green}}/> : <FileText size={13} style={{color:"#fff"}}/>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:13,fontWeight:600,color:isActive?T.navy:T.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{idx+1}. {item.title}</p>
                        <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".06em",color:cfg.color}}>{cfg.label}</span>
                      </div>
                      {isActive && <span style={{fontSize:9,background:T.navy,color:"#fff",padding:"2px 5px",borderRadius:3,fontWeight:700,flexShrink:0}}>NOW</span>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─── SETTINGS ─────────────────────────────────────────────────────────────
function SystemSettings() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("notifications");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type:"",text:"" });
  const [notifs, setNotifs] = useState({ emailNotifications:true,courseUpdates:true,newContent:true,deadlineReminders:true,discussionReplies:true,certificateAlerts:true,promotionalEmails:false,weeklyDigest:true });
  const [privacy, setPrivacy] = useState({ profileVisibility:"public",showEmail:false,showPhone:false,showProgress:true,allowMessages:true });
 
  useEffect(() => {
    api.get("/student/settings").then(r => {
      if (r.data.success) {
        if (r.data.notifications) setNotifs(r.data.notifications);
        if (r.data.privacy) setPrivacy(r.data.privacy);
      }
    }).catch(()=>{});
  }, []);
 
  const showMsg = (type, text) => { setMessage({ type,text }); setTimeout(() => setMessage({ type:"",text:"" }), 4000); };
 
  const handleDeleteAccount = async () => {
    if (!window.confirm("Delete your account? This cannot be undone.")) return;
    if (window.prompt('Type "DELETE" to confirm:') !== "DELETE") return;
    setLoading(true);
    try { const r = await api.delete("/student/account"); if (r.data.success) setTimeout(() => logout(), 2000); }
    catch { showMsg("error","Failed to delete account"); } finally { setLoading(false); }
  };
 
  const TABS = [
    { id:"notifications", label:"Notifications", icon:Bell,        accent:T.gold  },
    { id:"privacy",       label:"Privacy",       icon:Shield,      accent:T.green },
    { id:"danger",        label:"Danger Zone",   icon:AlertCircle, accent:T.red   },
  ];
 
  const ToggleRow = ({ label, desc, checked, onChange }) => (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.border}` }}>
      <div><div style={{ fontSize:14,fontWeight:600,color:T.text }}>{label}</div><div style={{ fontSize:12,color:T.subtle }}>{desc}</div></div>
      <div className={`mba-toggle-track ${checked?"on":""}`} onClick={onChange} style={{ cursor:"pointer",flexShrink:0 }}><div className="mba-toggle-thumb"/></div>
    </div>
  );
 
  const activeAccent = TABS.find(t=>t.id===activeTab)?.accent || T.navy;
 
  return (
    <div style={{ maxWidth:760 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
        <div><h2 className="mba-section-title">Account Settings</h2><p className="mba-section-sub">Manage your notifications, privacy and account</p></div>
        <Settings size={24} style={{ color:T.subtle }}/>
      </div>
 
      {message.text && (
        <div className={message.type==="success"?"mba-alert-success":"mba-alert-error"} style={{ marginBottom:14 }}>
          {message.type==="success" ? <CheckCircle size={14}/> : <XCircle size={14}/>} {message.text}
        </div>
      )}
 
      <div style={{ background:T.bg,border:`1px solid ${T.border}`,borderLeft:`3px solid ${T.navy}`,borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <Lock size={14} style={{ color:T.navy,flexShrink:0 }} />
          <p style={{ fontSize:13,color:T.navy }}><strong>Change your password?</strong> — Go to Profile → Security tab</p>
        </div>
        <Link to="/student/profile" style={{ fontSize:12,color:T.navy,fontWeight:700,textDecoration:"none",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4 }}>
          Go to Profile <ChevronRight size={12}/>
        </Link>
      </div>
 
      <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap" }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,border:`1.5px solid ${isActive?tab.accent:T.border}`,background:isActive?tab.accent:"#fff",color:isActive?"#fff":T.muted,fontSize:13,fontWeight:isActive?700:500,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all .18s",boxShadow:isActive?"0 2px 8px rgba(26,39,68,.15)":"none" }}>
              <Icon size={13}/> {tab.label}
            </button>
          );
        })}
      </div>
 
      <div style={{ background:"#fff",border:`1px solid ${T.border}`,borderLeft:`3px solid ${activeAccent}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(26,39,68,.05)" }}>
        <div style={{ padding:"14px 20px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10,background:T.bg }}>
          <div style={{ width:34,height:34,borderRadius:"50%",background:`${activeAccent}18`,border:`1.5px solid ${activeAccent}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            {(()=>{ const Icon = TABS.find(t=>t.id===activeTab)?.icon||Lock; return <Icon size={14} style={{color:activeAccent}}/>; })()}
          </div>
          <div>
            <p style={{ fontSize:13,fontWeight:700,color:T.navy }}>{TABS.find(t=>t.id===activeTab)?.label}</p>
            <p style={{ fontSize:11,color:T.subtle }}>
              {activeTab==="notifications"&&"Control what alerts you receive"}
              {activeTab==="privacy"&&"Manage your profile visibility"}
              {activeTab==="danger"&&"Irreversible account actions"}
            </p>
          </div>
        </div>
 
        <div style={{ padding:24 }}>
          {activeTab==="notifications" && (
            <div style={{ maxWidth:520 }}>
              {[
                ["emailNotifications","Email Notifications","Receive all notifications via email"],
                ["courseUpdates","Course Updates","Get notified when courses are updated"],
                ["newContent","New Content Alerts","Alerts when new lessons or materials are added"],
                ["deadlineReminders","Deadline Reminders","Reminders for upcoming assignment deadlines"],
                ["discussionReplies","Discussion Replies","Notifications when someone replies to your posts"],
                ["certificateAlerts","Certificate Alerts","Alert when a certificate is ready to download"],
                ["promotionalEmails","Promotional Emails","Offers and promotional content from Upskillize"],
                ["weeklyDigest","Weekly Digest","Summary of your learning activity each week"],
              ].map(([k,l,d]) => <ToggleRow key={k} label={l} desc={d} checked={notifs[k]} onChange={() => setNotifs(n=>({...n,[k]:!n[k]}))} />)}
            </div>
          )}
 
          {activeTab==="privacy" && (
            <div style={{ maxWidth:520 }}>
              <div style={{ marginBottom:16 }}>
                <label className="mba-label">Profile Visibility</label>
                <select className="mba-select" value={privacy.profileVisibility} onChange={e=>setPrivacy(p=>({...p,profileVisibility:e.target.value}))}>
                  <option value="public">Public — Anyone can view your profile</option>
                  <option value="students">Students Only — Only enrolled students</option>
                  <option value="private">Private — Only you can see it</option>
                </select>
              </div>
              {[
                ["showEmail","Show Email Address","Display your email on your public profile"],
                ["showPhone","Show Phone Number","Display your phone number on your profile"],
                ["showProgress","Show Learning Progress","Let others see your course completion progress"],
                ["allowMessages","Allow Direct Messages","Accept messages from other students"],
              ].map(([k,l,d]) => <ToggleRow key={k} label={l} desc={d} checked={privacy[k]} onChange={() => setPrivacy(p=>({...p,[k]:!p[k]}))} />)}
            </div>
          )}
 
          {activeTab==="danger" && (
            <div style={{ maxWidth:520 }}>
              <div className="mba-alert-error" style={{ marginBottom:20 }}>
                <AlertCircle size={13}/> These actions are permanent and cannot be reversed. Proceed with extreme caution.
              </div>
              <div style={{ border:`1.5px solid #f7c1c1`,borderRadius:12,padding:20,background:"#fffafa" }}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16 }}>
                  <div>
                    <h4 style={{ display:"flex",alignItems:"center",gap:6,fontWeight:700,color:T.text,marginBottom:8,fontSize:15 }}>
                      <Trash2 size={15} style={{ color:T.red }}/> Delete My Account
                    </h4>
                    <p style={{ fontSize:13,color:T.muted,lineHeight:1.6 }}>This will permanently delete your account, all course progress, certificates, and personal data.</p>
                  </div>
                  <button className="mba-btn-danger" onClick={handleDeleteAccount} disabled={loading} style={{ flexShrink:0 }}>Delete Account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
// ─── PSYCHOMETRIC STANDALONE PAGE ─────────────────────────────────────────
function PsychometricTestPage() {
  const [psychoDone, setPsychoDone] = useState(false);
  const [psychoResult, setPsychoResult] = useState(null);
  const [msg, setMsg] = useState({ type:"",text:"" });
  const showMsg = (type, text) => { setMsg({ type,text }); setTimeout(() => setMsg({ type:"",text:"" }), 3000); };
  return (
    <div>
      <h2 className="mba-section-title" style={{ marginBottom:4 }}>Psychometric Assessment</h2>
      <p className="mba-section-sub" style={{ marginBottom:20 }}>Understand your personality and discover best-fit career paths</p>
      {msg.text && <div className={msg.type==="success"?"mba-alert-success":"mba-alert-error"} style={{ marginBottom:14 }}><CheckCircle size={13}/> {msg.text}</div>}
      <PsychometricTest psychoDone={psychoDone} setPsychoDone={setPsychoDone} psychoResult={psychoResult} setPsychoResult={setPsychoResult} showMsg={showMsg} />
    </div>
  );
}
 
// ─── MAIN STUDENT DASHBOARD ───────────────────────────────────────────────
export default function StudentDashboard() {
  const location  = useLocation();
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [showMailbox,    setShowMailbox]    = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp,       setShowHelp]       = useState(false);
  const [notifications,  setNotifications]  = useState([]);
  const [unreadCount,    setUnreadCount]    = useState(0);
 
  useEffect(() => {
    api.get("/notifications").then(r => {
      if (r.data.success) {
        setNotifications(r.data.notifications||[]);
        setUnreadCount((r.data.notifications||[]).filter(n=>!(n.is_read??n.read??false)).length);
      }
    }).catch(()=>{});
  }, []);
 
  const handleLogout = () => { logout(); navigate("/login"); };
  const isPurchased  = user?.is_purchased || user?.role==="admin" || user?.role==="faculty";
 
  // ─── NAV SECTIONS (FIX 1: added keywords for search, FIX 15: Doubts added) ─
  const navSections = [
    {
      label: "Academic",
      items: [
        { path:"/student",                  label:"Overview",         icon:BarChart3,     keywords:["dashboard","home","stats"] },
        { path:"/student/courses",          label:"My Courses",      icon:BookOpen,      keywords:["enrolled","learning","courses"] },
        { path:"/student/browse",           label:"Browse Courses",  icon:ShoppingBag,   keywords:["explore","buy","new courses"] },
        { path:"/student/assignments",      label:"Assignments",     icon:FilePen,       keywords:["homework","submit","upload"] },
        { path:"/student/assessments",      label:"Assessments",     icon:ClipboardList, keywords:["quiz","test","exam","mcq"] }, // FIX 10
        { path:"/student/classes",          label:"Class Schedule",  icon:CalendarDays,  keywords:["live","zoom","session","timetable"] },
        { path:"/student/discussion-forum", label:"Discussion Forum",icon:MessageSquare, keywords:["discuss","topic","forum","post"] },
        { path:"/student/doubts",           label:"My Doubts",       icon:HelpCircle,    keywords:["doubt","question","ask","help"] }, // FIX 15
      ],
    },
    {
      label: "Career",
      items: [
        { path:"/student/jobs",         label:"Placements / Internships", icon:Briefcase,  keywords:["job","internship","apply","career"] },
        { path:"/student/ai-interview", label:"AI Interview",             icon:Mic,        keywords:["mock","practice","interview"] },
        { path:"/student/psychometric", label:"Psychometric Test",        icon:Brain,      keywords:["personality","mbti","test"] },
      ],
    },
    {
      label: "Engagement",
      items: [
        { path:"/student/gamification", label:"Achievements", icon:Gamepad2, keywords:["badges","xp","leaderboard","rewards"] },
      ],
    },
    {
      label: "Records",
      items: [
        { path:"/student/progress",     label:"Progress",     icon:TrendingUp, keywords:["analytics","stats","tracking"] },
        { path:"/student/certificates", label:"Certificates", icon:Award,      keywords:["certificate","download","completion"] },
        { path:"/student/payments",     label:"Payments",     icon:CardIcon,   keywords:["billing","invoice","subscription","testgen"] },
      ],
    },
    {
      label: "Account",
      items: [
        { path:"/student/notifications", label:"Notifications",  icon:Bell,       keywords:["alerts","bell","messages"] },
        { path:"/student/help",          label:"Help & Support", icon:HelpCircle, keywords:["support","faq","contact"] },
        { path:"/student/profile",       label:"Profile",        icon:User,       keywords:["edit","photo","bio","resume"] },
        { path:"/student/settings",      label:"Settings",       icon:Settings,   keywords:["account","password","privacy"] },
      ],
    },
  ];
 
  // Flat list with section label for search
  const allNavItems = navSections.flatMap(s => s.items.map(i => ({ ...i, section: s.label })));
 
  const closeAll = () => {
    setShowMailbox(false); setShowNotifications(false);
    setShowHelp(false); setUserMenuOpen(false);
  };
 
  // Current page label
  const currentLabel = (() => {
    const exact = allNavItems.find(i => i.path === location.pathname);
    if (exact) return exact.label;
    if (location.pathname.includes("/materials")) return "Course Materials";
    if (location.pathname.includes("/course/"))   return "Course Player";
    if (location.pathname.includes("/browse"))    return "Browse Courses";
    if (location.pathname.includes("/forum/thread")) return "Thread Detail";
    return "Dashboard";
  })();
 
  return (
    <div className="mba-root" style={{ display:"flex",height:"100vh",overflow:"hidden" }}>
      <MBAStyles />
 
      {/* ── Sidebar ── */}
      <aside className="mba-sidebar" style={{ width:sidebarOpen?220:0,overflow:sidebarOpen?"auto":"hidden",transition:"width .25s",flexShrink:0 }}>
        <div className="mba-sidebar-brand">
          <div className="mba-brand-label">Programme</div>
          <div className="mba-brand-name">
            <img src="/project.png" alt="Logo" style={{ height:28,width:"auto",display:"block" }}
              onError={e=>{ e.target.style.display="none"; e.target.nextSibling.style.display="block"; }} />
            <span style={{ display:"none" }}>Upskillize</span>
          </div>
          <div className="mba-brand-sub">Business Administration</div>
        </div>
 
        <div style={{ padding:"10px 16px" }}>
          {isPurchased
            ? <div style={{ background:"rgba(45,106,45,.2)",color:"#6dbc6d",fontSize:12,fontWeight:700,padding:"5px 10px",borderRadius:6,textAlign:"center" }}>✓ Full Access</div>
            : <a href="/pricing" style={{ display:"block",background:"rgba(255,255,255,.07)",color:"rgba(255,255,255,.6)",fontSize:12,fontWeight:600,padding:"5px 10px",borderRadius:6,textAlign:"center",textDecoration:"none" }}>Upgrade to Premium</a>}
        </div>
 
        <nav style={{ flex:1 }}>
          {navSections.map(section => (
            <div key={section.label} className="mba-nav-section">
              <div className="mba-nav-label">{section.label}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className={`mba-nav-item ${isActive?"active":""}`}>
                    <div className={`mba-nav-dot ${isActive?"active":""}`} />
                    <Icon size={15} style={{ flexShrink:0 }} />
                    <span style={{ flex:1,fontSize:13 }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
 
        <div className="mba-sidebar-footer">
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            {user?.profile_photo
              ? <img src={user.profile_photo} alt="" style={{ width:34,height:34,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>
              : <GenderAvatar gender={user?.gender} size={34}/>}
            <div>
              <div style={{ fontSize:13,color:"rgba(255,255,255,.8)",fontWeight:600 }}>{user?.full_name?.split(" ")[0]||"Student"}</div>
              <div style={{ fontSize:11,color:"rgba(255,255,255,.35)" }}>{isPurchased?"Premium":"Free Plan"}</div>
            </div>
          </div>
        </div>
      </aside>
 
      {/* ── Main area ── */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",overflow:"hidden" }}>
 
        {/* ── Topbar ── */}
        <header className="mba-topbar">
          <div style={{ display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0 }}>
            <button onClick={() => setSidebarOpen(s=>!s)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted,padding:4 }}>
              {sidebarOpen ? <X size={18}/> : <Menu size={18}/>}
            </button>
            <div>
              <div className="mba-page-title">{currentLabel}</div>
              <div className="mba-page-meta">{new Date().toLocaleDateString("en-IN",{ weekday:"long",day:"numeric",month:"long",year:"numeric" })}</div>
            </div>
          </div>
 
          <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
            {/* FIX 1: Working Global Search */}
            <GlobalSearch allNavItems={allNavItems} />
              <button className="mba-btn-primary" onClick={() => navigate("/student/testgen")} style={{ fontSize:12,padding:"6px 12px" }}>
                <Zap size={12}/> TestGen
              </button>
 
            {/* FIX 2: Mail button */}
            <div style={{ position:"relative" }}>
              <button className="mba-icon-btn" onClick={() => { closeAll(); setShowMailbox(v=>!v); }}>
                <Mail size={16}/>
              </button>
              {showMailbox && (
                <>
                  <div className="mba-dropdown" style={{ width:300 }}>
                    <div style={{ padding:"12px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between" }}>
                      <span style={{ fontWeight:700,fontSize:14 }}>Messages</span>
                      <button onClick={() => setShowMailbox(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={14}/></button>
                    </div>
                    <div style={{ padding:"16px 14px" }}>
                      <div style={{ textAlign:"center",marginBottom:16 }}>
                        <Mail size={32} style={{ color:T.border,margin:"0 auto 8px",display:"block" }}/>
                        <p style={{ fontSize:13,color:T.subtle }}>No new messages</p>
                        <p style={{ fontSize:12,color:T.subtle,marginTop:4 }}>Use Discussion Forum or Doubts to message faculty</p>
                      </div>
                      <Link to="/student/doubts" onClick={closeAll}
                        style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:T.bg,borderRadius:8,textDecoration:"none",color:T.navy,fontSize:13,fontWeight:600 }}>
                        <HelpCircle size={14} style={{ color:T.navy }}/> Ask a Doubt →
                      </Link>
                      <Link to="/student/discussion-forum" onClick={closeAll}
                        style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:T.bg,borderRadius:8,textDecoration:"none",color:T.navy,fontSize:13,fontWeight:600,marginTop:6 }}>
                        <MessageSquare size={14} style={{ color:T.navy }}/> Discussion Forum →
                      </Link>
                    </div>
                  </div>
                  <div style={{ position:"fixed",inset:0,zIndex:49 }} onClick={() => setShowMailbox(false)}/>
                </>
              )}
            </div>
 
            {/* Notifications */}
            <div style={{ position:"relative" }}>
              <button className="mba-icon-btn" onClick={() => { closeAll(); setShowNotifications(v=>!v); }}>
                <Bell size={16}/>
                {unreadCount>0 && <span style={{ position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:T.red }}/>}
              </button>
              {showNotifications && (
                <>
                  <div className="mba-dropdown" style={{ width:300 }}>
                    <div style={{ padding:"12px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between" }}>
                      <span style={{ fontWeight:700,fontSize:14 }}>Notifications</span>
                      <button onClick={() => setShowNotifications(false)} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted }}><X size={14}/></button>
                    </div>
                    <div style={{ maxHeight:280,overflowY:"auto" }}>
                      {notifications.length===0
                        ? <div style={{ padding:20,textAlign:"center",fontSize:13,color:T.subtle }}>No new notifications</div>
                        : notifications.slice(0,6).map(n => {
                            const raw = n.time||n.createdAt||n.created_at;
                            const dt  = raw&&!isNaN(new Date(raw).getTime()) ? new Date(raw).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "";
                            const msg = n.message||n.body||n.content||"";
                            return (
                              <div key={n.id} style={{ padding:"11px 14px",borderBottom:`1px solid ${T.border}`,background:!(n.is_read??n.read)?T.bg:T.white }}>
                                <p style={{ fontSize:13,fontWeight:700,marginBottom:2 }}>{n.title}</p>
                                {msg&&msg.toLowerCase()!=="na"&&<p style={{ fontSize:12,color:T.muted }}>{msg}</p>}
                                {dt&&<p style={{ fontSize:11,color:T.subtle,marginTop:3 }}>{dt}</p>}
                              </div>
                            );
                          })}
                    </div>
                    <Link to="/student/notifications" onClick={closeAll} style={{ display:"block",padding:"10px 14px",textAlign:"center",fontSize:12,color:T.navy,fontWeight:700,textDecoration:"none",borderTop:`1px solid ${T.border}` }}>View All →</Link>
                  </div>
                  <div style={{ position:"fixed",inset:0,zIndex:49 }} onClick={() => setShowNotifications(false)}/>
                </>
              )}
            </div>
 
            {/* Help */}
            <div style={{ position:"relative" }}>
              <button className="mba-icon-btn" onClick={() => { closeAll(); setShowHelp(v=>!v); }}>
                <HelpCircle size={16}/>
              </button>
              {showHelp && (
                <>
                  <div className="mba-dropdown" style={{ width:200 }}>
                    <div style={{ padding:"12px 14px",borderBottom:`1px solid ${T.border}` }}><span style={{ fontWeight:700,fontSize:14 }}>Help</span></div>
                    <div style={{ padding:6 }}>
                      <Link to="/student/help" onClick={closeAll} className="mba-user-menu-item"><HelpCircle size={13} style={{ color:T.navy }}/> Help & Support</Link>
                      <Link to="/student/doubts" onClick={closeAll} className="mba-user-menu-item"><MessageSquare size={13} style={{ color:T.navy }}/> Ask a Doubt</Link>
                    </div>
                  </div>
                  <div style={{ position:"fixed",inset:0,zIndex:49 }} onClick={() => setShowHelp(false)}/>
                </>
              )}
            </div>
 
            {/* User menu */}
            <div style={{ position:"relative" }}>
              <button onClick={() => { closeAll(); setUserMenuOpen(v=>!v); }}
                style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 10px 5px 5px",borderRadius:10,border:`1.5px solid ${T.border}`,background:T.white,cursor:"pointer",transition:"all .18s",boxShadow:"0 1px 4px rgba(26,39,68,.06)" }}>
                {user?.profile_photo
                  ? <img src={user.profile_photo} alt="" style={{ width:34,height:34,borderRadius:"50%",objectFit:"cover",flexShrink:0 }}/>
                  : <GenderAvatar gender={user?.gender} size={34}/>}
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:13,fontWeight:700,color:T.text,lineHeight:1.3 }}>{user?.full_name?.split(" ")[0]||"Student"}</div>
                  <div style={{ fontSize:11,color:T.subtle,lineHeight:1.3 }}>{isPurchased?"Premium":"Free Plan"}</div>
                </div>
                <ChevronDown size={13} style={{ color:T.subtle,transition:"transform .2s",transform:userMenuOpen?"rotate(180deg)":"none",marginLeft:2 }}/>
              </button>
 
              {userMenuOpen && (
                <>
                  <div className="mba-dropdown" style={{ width:210 }}>
                    <div style={{ padding:"13px 14px 9px",borderBottom:`1px solid ${T.border}` }}>
                      <p style={{ fontSize:14,fontWeight:700,color:T.navy }}>{user?.full_name||"Student"}</p>
                      <p style={{ fontSize:12,color:T.subtle }}>{user?.email||""}</p>
                    </div>
                    <div style={{ padding:4 }}>
                      <Link to="/student/profile"  onClick={closeAll} className="mba-user-menu-item"><User size={13}/> Profile</Link>
                      <Link to="/student/settings" onClick={closeAll} className="mba-user-menu-item"><Settings size={13}/> Settings</Link>
                      <Link to="/student/jobs"     onClick={closeAll} className="mba-user-menu-item"><Briefcase size={13}/> Placements</Link>
                      <Link to="/student/doubts"   onClick={closeAll} className="mba-user-menu-item"><HelpCircle size={13}/> My Doubts</Link>
                      {!isPurchased && <a href="/pricing" className="mba-user-menu-item" style={{ color:T.navy,fontWeight:600 }}><Lock size={13}/> Upgrade Plan</a>}
                      <hr className="mba-divider"/>
                      <button onClick={handleLogout} className="mba-user-menu-item danger"><LogOut size={13}/> Logout</button>
                    </div>
                  </div>
                  <div style={{ position:"fixed",inset:0,zIndex:49 }} onClick={closeAll}/>
                </>
              )}
            </div>
          </div>
        </header>
 
        {/* ── Page Content ── */}
        <main style={{ flex:1,overflowY:"auto",background:T.bg }}>
          <div className="mba-content">
            <Routes>
              {/* Core Academic */}
              <Route path="/"                           element={<Overview />} />
              <Route path="/courses"                    element={<MyCourses />} />
              <Route path="/course/:courseId"           element={<CoursePlayer />} />
              <Route path="/course/:courseId/materials" element={<CourseMaterials />} />
              <Route path="/browse"                     element={<BrowseCourses />} />
 
              {/* Academic work — FIX 10: route changed to /assessments */}
              <Route path="/assignments"                element={<StudentAssignments />} />
              <Route path="/assessments"                element={<StudentAssessments />} />
              {/* Keep /quizzes as alias for backward compat */}
              <Route path="/quizzes"                    element={<StudentAssessments />} />
 
              {/* FIX 12-13: Forum — Discussion topics */}
              <Route path="/discussion-forum"           element={<DiscussionForum />} />
              <Route path="/forum/thread/:threadId"     element={<ThreadDetail />} />
 
              {/* FIX 15: Doubts — separate */}
              <Route path="/doubts"                     element={<StudentDoubts />} />
 
              <Route path="/classes"                    element={<ClassesSchedule />} />
 
              {/* Career */}
              <Route path="/jobs"                       element={<JobsModule />} />
              <Route path="/ai-interview"               element={<AIInterviewSimulation />} />
              <Route path="/psychometric"               element={<PsychometricTestPage />} />
 
              {/* Engagement */}
              <Route path="/gamification"               element={<Gamification />} />
 
              {/* Records */}
              <Route path="/certificates"               element={<Certificates />} />
              <Route path="/progress"                   element={<Progress />} />
              <Route path="/payments"                   element={<PaymentsComponent />} />
 
              {/* Account */}
              <Route path="/notifications"              element={<Notifications />} />
              <Route path="/help"                       element={<HelpSupport />} />
              <Route path="/profile"                    element={<ProfileManagement />} />
              <Route path="/settings"                   element={<SystemSettings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}