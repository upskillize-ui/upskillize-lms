// COMPLETE FACULTY DASHBOARD – Plus Jakarta Sans (matches Student Dashboard)
// Navy + Gold design system · All fonts unified to Plus Jakarta Sans

import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

import {
  Users, BookOpen, TrendingUp, GraduationCap, UserCheck,
  BarChart3, Settings, FileText, Award, Activity, LogOut,
  Search, Download, Plus, Edit2, Trash2, Eye, X, CheckCircle,
  XCircle, Calendar, Clock, Mail, Phone, Upload, Star, AlertCircle,
  ChevronRight, Bell, Shield, Zap, UserPlus,
  RefreshCw, Archive, FilePlus, Video,
  HelpCircle, User, Menu, ChevronDown, HardDrive, ClipboardList,
  MonitorPlay, Megaphone, MessageCircle, MessageSquare, Send,
  Layers, Lock, Briefcase, CreditCard, Camera, Building, MapPin,
  Link as LinkIcon, Globe, BookMarked, BellRing, Info, CheckSquare,
} from 'lucide-react';

// ─── Design Tokens ──────────────────────────────────────────────────────────
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

// ─── Global Styles ─────────────────────────────────────────────────────────
const MBAStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

    .fmba *, .fmba *::before, .fmba *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .fmba {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.55;
      color: #1a1a1a;
      background: #f7f8fc;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Sidebar ── */
    .fmba-sidebar { width: 220px; background: #1a2744; color: #fff; display: flex; flex-direction: column; flex-shrink: 0; height: 100vh; overflow-y: auto; box-shadow: 2px 0 12px rgba(0,0,0,0.10); }
    .fmba-brand { padding: 22px 20px 18px; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .fmba-brand-label { font-size: 10px; letter-spacing: .12em; color: rgba(255,255,255,0.45); text-transform: uppercase; margin-bottom: 3px; font-weight: 700; }
    .fmba-brand-name  { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px; font-weight: 800; color: #fff; line-height: 1.2; }
    .fmba-brand-sub   { font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 2px; font-weight: 400; }

    .fmba-nav-section { padding: 14px 0 6px; }
    .fmba-nav-label   { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,0.28); padding: 0 20px 5px; font-weight: 700; }
    .fmba-nav-item    { display: flex; align-items: center; gap: 10px; padding: 10px 20px; cursor: pointer; color: rgba(255,255,255,0.65); font-size: 14px; font-weight: 500; transition: all .18s; text-decoration: none; }
    .fmba-nav-item:hover  { background: rgba(255,255,255,0.07); color: #fff; padding-left: 24px; }
    .fmba-nav-item.active { background: rgba(255,255,255,0.10); color: #fff; border-right: 2px solid #b8960b; font-weight: 700; }
    .fmba-nav-dot         { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.22); flex-shrink: 0; transition: background .18s; }
    .fmba-nav-dot.active  { background: #b8960b; }
    .fmba-sidebar-footer  { margin-top: auto; padding: 14px 20px; border-top: 1px solid rgba(255,255,255,0.08); }
    .fmba-avatar { width: 34px; height: 34px; border-radius: 50%; background: #b8960b; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #1a2744; flex-shrink: 0; overflow: hidden; }

    /* ── Topbar ── */
    .fmba-topbar      { background: #ffffff; border-bottom: 1px solid #e8e9f0; padding: 13px 28px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 30; box-shadow: 0 1px 6px rgba(26,39,68,0.06); }
    .fmba-page-title  { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; color: #1a2744; letter-spacing: -0.4px; }
    .fmba-page-meta   { font-size: 12px; color: #a8a49f; margin-top: 1px; font-weight: 400; }

    /* ── Cards ── */
    .fmba-card { background: #ffffff; border: 1px solid #e8e9f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(26,39,68,0.05), 0 2px 10px rgba(26,39,68,0.04); transition: box-shadow .24s ease, transform .24s ease; }
    .fmba-card:hover  { box-shadow: 0 6px 20px rgba(26,39,68,0.10), 0 2px 6px rgba(26,39,68,0.06); }
    .fmba-card-head   { padding: 14px 18px; border-bottom: 1px solid #e8e9f0; display: flex; align-items: center; justify-content: space-between; }
    .fmba-card-title  { font-size: 13px; font-weight: 700; color: #1a2744; letter-spacing: .01em; }
    .fmba-card-link   { font-size: 12px; color: #b8960b; cursor: pointer; text-decoration: none; font-weight: 600; }
    .fmba-card-body   { padding: 18px; }

    /* ── Metric cards ── */
    .fmba-metric { background: #ffffff; border: 1px solid #e8e9f0; border-radius: 12px; padding: 18px 20px; position: relative; box-shadow: 0 1px 4px rgba(26,39,68,0.05), 0 2px 10px rgba(26,39,68,0.04); transition: box-shadow .24s ease, transform .24s ease; cursor: default; }
    .fmba-metric:hover { box-shadow: 0 8px 22px rgba(26,39,68,0.11), 0 2px 6px rgba(26,39,68,0.07); transform: translateY(-3px) scale(1.015); }
    .fmba-metric::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 12px 12px 0 0; }
    .fmba-metric-navy::before  { background: #1a2744; }
    .fmba-metric-gold::before  { background: #b8960b; }
    .fmba-metric-green::before { background: #2d6a2d; }
    .fmba-metric-gray::before  { background: #a8a49f; }
    .fmba-metric-red::before   { background: #c0392b; }
    .fmba-metric-blue::before  { background: #1e3a6b; }
    .fmba-metric-label { font-size: 13px; color: #72706b; margin-bottom: 8px; font-weight: 500; }
    .fmba-metric-value { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 32px; font-weight: 800; color: #1a2744; line-height: 1; letter-spacing: -1px; }
    .fmba-metric-sub   { font-size: 12px; color: #a8a49f; margin-top: 8px; font-weight: 400; }

    /* ── Pills ── */
    .fmba-pill          { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .fmba-pill-pass     { background: #edf7ed; color: #2d6a2d; }
    .fmba-pill-fail     { background: #fdf1f0; color: #c0392b; }
    .fmba-pill-navy     { background: #eef2fb; color: #1a2744; }
    .fmba-pill-gold     { background: #fdf8ed; color: #7a5e00; }
    .fmba-pill-gray     { background: #f4f4f6; color: #72706b; }
    .fmba-pill-red      { background: #fdf1f0; color: #c0392b; }

    /* ── Notice ── */
    .fmba-notice { background: #fdf8ed; border: 1px solid #e8d89a; border-radius: 10px; padding: 12px 16px; display: flex; gap: 10px; align-items: flex-start; margin-bottom: 20px; }

    /* ── Tables ── */
    .fmba-table    { width: 100%; border-collapse: collapse; }
    .fmba-table th { font-size: 12px; font-weight: 700; color: #72706b; padding: 10px 14px; text-align: left; border-bottom: 1px solid #e8e9f0; letter-spacing: .02em; }
    .fmba-table td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid #e8e9f0; color: #1a1a1a; vertical-align: middle; }
    .fmba-table tr:last-child td { border-bottom: none; }
    .fmba-table tbody tr { transition: background .15s; }
    .fmba-table tbody tr:hover { background: #f7f8fc; }

    /* ── Progress bar ── */
    .fmba-bar-track { height: 5px; background: #e8e9f0; border-radius: 3px; overflow: hidden; margin-top: 5px; }
    .fmba-bar-fill  { height: 100%; border-radius: 3px; transition: width .5s cubic-bezier(.4,0,.2,1); }

    /* ── Buttons ── */
    .fmba-btn-primary { background: #1a2744; color: #fff; border: none; border-radius: 8px; padding: 10px 18px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: background .15s, box-shadow .15s, transform .15s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; box-shadow: 0 1px 4px rgba(26,39,68,0.15); }
    .fmba-btn-primary:hover { background: #2c3e6b; box-shadow: 0 4px 12px rgba(26,39,68,0.22); transform: translateY(-1px); }
    .fmba-btn-outline { background: transparent; color: #1a2744; border: 1.5px solid #e8e9f0; border-radius: 8px; padding: 9px 16px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .18s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
    .fmba-btn-outline:hover { border-color: #1a2744; background: #f7f8fc; transform: translateY(-1px); }
    .fmba-btn-ghost  { background: transparent; color: #72706b; border: 1.5px solid #e8e9f0; border-radius: 8px; padding: 9px 14px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .18s; display: inline-flex; align-items: center; gap: 5px; }
    .fmba-btn-ghost:hover { color: #1a1a1a; border-color: #c8c4bc; background: #f7f8fc; }
    .fmba-btn-green  { background: #2d6a2d; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .18s; display: inline-flex; align-items: center; gap: 6px; }
    .fmba-btn-green:hover  { opacity: .88; transform: translateY(-1px); }
    .fmba-btn-danger { background: #fdf1f0; color: #c0392b; border: 1.5px solid #f7c1c1; border-radius: 8px; padding: 10px 16px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .18s; font-family: 'Plus Jakarta Sans', sans-serif; display: inline-flex; align-items: center; gap: 5px; }
    .fmba-btn-danger:hover { background: #c0392b; color: #fff; transform: translateY(-1px); }
    .fmba-btn-gold   { background: #b8960b; color: #fff; border: none; border-radius: 8px; padding: 10px 14px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .18s; display: inline-flex; align-items: center; gap: 6px; }
    .fmba-btn-gold:hover { opacity: .88; transform: translateY(-1px); }

    /* ── Inputs ── */
    .fmba-input    { width: 100%; padding: 10px 13px; border: 1.5px solid #e8e9f0; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #1a1a1a; background: #ffffff; transition: border-color .18s, box-shadow .18s; outline: none; }
    .fmba-input:focus    { border-color: #1a2744; box-shadow: 0 0 0 3px rgba(26,39,68,0.07); }
    .fmba-input:disabled { background: #f7f8fc; color: #72706b; }
    .fmba-label    { display: block; font-size: 12px; font-weight: 700; letter-spacing: .04em; color: #72706b; margin-bottom: 6px; }
    .fmba-select   { width: 100%; padding: 10px 13px; border: 1.5px solid #e8e9f0; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #1a1a1a; background: #ffffff; outline: none; cursor: pointer; transition: border-color .18s; }
    .fmba-select:focus { border-color: #1a2744; box-shadow: 0 0 0 3px rgba(26,39,68,0.07); }
    .fmba-textarea { width: 100%; padding: 10px 13px; border: 1.5px solid #e8e9f0; border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #1a1a1a; background: #ffffff; resize: vertical; outline: none; transition: border-color .18s; }
    .fmba-textarea:focus { border-color: #1a2744; box-shadow: 0 0 0 3px rgba(26,39,68,0.07); }

    /* ── Tabs ── */
    .fmba-tabs { display: flex; gap: 4px; }
    .fmba-tab  { padding: 7px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; transition: all .18s; background: transparent; color: #72706b; font-family: 'Plus Jakarta Sans', sans-serif; }
    .fmba-tab:hover  { background: #ffffff; border-color: #e8e9f0; color: #1a1a1a; box-shadow: 0 1px 4px rgba(26,39,68,0.06); }
    .fmba-tab.active { background: #1a2744; color: #fff; border-color: #1a2744; box-shadow: 0 2px 8px rgba(26,39,68,0.20); }

    /* ── Modal ── */
    .fmba-modal-bg { position: fixed; inset: 0; background: rgba(26,39,68,0.52); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; backdrop-filter: blur(4px); }
    .fmba-modal    { background: #ffffff; border-radius: 16px; padding: 28px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(26,39,68,0.22), 0 4px 16px rgba(26,39,68,0.10); }
    .fmba-modal-lg { max-width: 800px; }

    /* ── Alerts ── */
    .fmba-alert-success { background: #edf7ed; border: 1.5px solid #b8d9b8; border-radius: 8px; padding: 11px 14px; color: #2d6a2d; font-size: 13px; display: flex; align-items: center; gap: 8px; }
    .fmba-alert-error   { background: #fdf1f0; border: 1.5px solid #f7c1c1; border-radius: 8px; padding: 11px 14px; color: #c0392b; font-size: 13px; display: flex; align-items: center; gap: 8px; }
    .fmba-alert-info    { background: #fdf8ed; border: 1.5px solid #e8d89a; border-radius: 8px; padding: 11px 14px; color: #5a4500; font-size: 13px; display: flex; align-items: center; gap: 8px; }

    /* ── Profile tabs ── */
    .fmba-profile-tabs { display: flex; border-bottom: 1px solid #e8e9f0; background: #f7f8fc; overflow-x: auto; }
    .fmba-profile-tab  { padding: 12px 20px; font-size: 13px; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; color: #72706b; white-space: nowrap; background: transparent; border-top: none; border-left: none; border-right: none; transition: all .18s; display: flex; align-items: center; gap: 6px; font-family: 'Plus Jakarta Sans', sans-serif; }
    .fmba-profile-tab:hover  { color: #1a1a1a; background: rgba(26,39,68,0.04); }
    .fmba-profile-tab.active { border-bottom-color: #1a2744; color: #1a2744; background: #ffffff; font-weight: 700; }

    /* ── Toggle ── */
    .fmba-toggle-track { position: relative; width: 38px; height: 22px; background: #e8e9f0; border-radius: 11px; transition: background .2s; display: inline-block; cursor: pointer; }
    .fmba-toggle-track.on { background: #1a2744; }
    .fmba-toggle-thumb { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform .2s; box-shadow: 0 1px 4px rgba(0,0,0,0.15); }
    .fmba-toggle-track.on .fmba-toggle-thumb { transform: translateX(16px); }

    /* ── Icon button ── */
    .fmba-icon-btn { width: 36px; height: 36px; border: 1.5px solid #e8e9f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #ffffff; color: #72706b; transition: all .18s; position: relative; }
    .fmba-icon-btn:hover { border-color: #c8c4bc; color: #1a1a1a; box-shadow: 0 2px 8px rgba(26,39,68,0.08); transform: translateY(-1px); }

    /* ── Search ── */
    .fmba-search { display: flex; align-items: center; gap: 8px; background: #f7f8fc; border: 1.5px solid #e8e9f0; border-radius: 8px; padding: 8px 14px; font-size: 13px; color: #72706b; transition: border-color .18s; }
    .fmba-search:focus-within { border-color: #1a2744; }

    /* ── Dropdown ── */
    .fmba-dropdown { position: absolute; right: 0; top: calc(100% + 6px); background: #ffffff; border: 1.5px solid #e8e9f0; border-radius: 12px; box-shadow: 0 10px 28px rgba(26,39,68,0.13), 0 2px 8px rgba(26,39,68,0.07); z-index: 50; overflow: hidden; }

    /* ── User menu items ── */
    .fmba-user-menu-item { display: flex; align-items: center; gap: 8px; padding: 9px 14px; font-size: 13px; font-weight: 500; color: #1a1a1a; cursor: pointer; transition: background .12s; text-decoration: none; background: transparent; width: 100%; text-align: left; border: none; font-family: 'Plus Jakarta Sans', sans-serif; }
    .fmba-user-menu-item:hover  { background: #f7f8fc; }
    .fmba-user-menu-item.danger { color: #c0392b; }

    /* ── Misc ── */
    .fmba-divider { border: none; border-top: 1px solid #e8e9f0; margin: 10px 0; }
    .fmba-section-title { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 22px; font-weight: 800; color: #1a2744; margin-bottom: 4px; letter-spacing: -0.4px; line-height: 1.2; }
    .fmba-section-sub   { font-size: 13px; color: #a8a49f; font-weight: 500; }
    .fmba-empty   { text-align: center; padding: 52px 20px; color: #a8a49f; }
    .fmba-empty p { margin: 8px 0 0; font-size: 14px; }
    .fmba-spin    { display: flex; align-items: center; justify-content: center; height: 180px; }
    .fmba-spinner { width: 28px; height: 28px; border: 2px solid #e8e9f0; border-top-color: #1a2744; border-radius: 50%; animation: fmba-spin .7s linear infinite; }
    @keyframes fmba-spin { to { transform: rotate(360deg); } }

    /* ── Welcome strip ── */
    .fmba-welcome { background: #ffffff; border: 1px solid #e8e9f0; border-radius: 12px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; box-shadow: 0 1px 6px rgba(26,39,68,0.06); }
    .fmba-welcome-stat     { border-left: 1px solid #e8e9f0; padding-left: 20px; text-align: right; }
    .fmba-welcome-stat .num { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 26px; font-weight: 800; color: #1a2744; letter-spacing: -0.5px; }
    .fmba-welcome-stat .lbl { font-size: 12px; color: #a8a49f; margin-top: 1px; font-weight: 500; }

    /* ── Quick actions ── */
    .fmba-quick-action { display: flex; flex-direction: column; align-items: center; padding: 16px; border: 1.5px solid #e8e9f0; border-radius: 10px; cursor: pointer; text-decoration: none; background: #ffffff; transition: all .18s; gap: 8px; }
    .fmba-quick-action:hover { border-color: #1a2744; background: #eef2fb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(26,39,68,0.10); }
    .fmba-quick-action-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }

    /* ── Course card ── */
    .fmba-course-card { background: #ffffff; border: 1px solid #e8e9f0; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(26,39,68,0.05), 0 3px 12px rgba(26,39,68,0.04); transition: box-shadow .26s ease, transform .26s ease, border-color .26s ease; }
    .fmba-course-card:hover { box-shadow: 0 10px 28px rgba(26,39,68,0.13), 0 3px 10px rgba(26,39,68,0.08); transform: translateY(-4px) scale(1.018); border-color: #c8c4bc; }

    /* ── Thread rows ── */
    .fmba-thread-row { background: #ffffff; border: 1px solid #e8e9f0; border-radius: 10px; padding: 16px; transition: box-shadow .22s ease, transform .22s ease, border-color .22s ease; margin-bottom: 8px; box-shadow: 0 1px 4px rgba(26,39,68,0.04); cursor: pointer; }
    .fmba-thread-row:hover { box-shadow: 0 6px 18px rgba(26,39,68,0.10); transform: translateY(-2px); border-color: #1a2744; }

    /* ── Rubric / sub cards ── */
    .fmba-rubric-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #f7f8fc; border-radius: 6px; margin-bottom: 6px; }
    .fmba-sub-card { border: 1px solid #e8e9f0; border-radius: 10px; padding: 18px; margin-bottom: 10px; transition: border-color .18s; }
    .fmba-sub-card:hover { border-color: #c8c4bc; }

    /* ── Upload zone ── */
    .fmba-upload-zone { border: 1.5px dashed #e8e9f0; border-radius: 8px; padding: 20px; text-align: center; transition: border-color .18s; cursor: pointer; }
    .fmba-upload-zone:hover, .fmba-upload-zone.drag { border-color: #1a2744; background: #f7f8fc; }
    .fmba-upload-zone.has-file { border-color: #2d6a2d; background: #edf7ed; }

    /* ── Content card ── */
    .fmba-content-card { border: 1px solid #e8e9f0; border-radius: 8px; padding: 14px; transition: all .18s; }
    .fmba-content-card:hover { border-color: #c8c4bc; box-shadow: 0 2px 8px rgba(26,39,68,0.06); }

    /* ── Quiz option ── */
    .fmba-quiz-opt { width: 100%; text-align: left; padding: 10px 14px; border-radius: 8px; border: 1.5px solid #e8e9f0; background: #ffffff; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; cursor: pointer; transition: all .18s; display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .fmba-quiz-opt.correct { border-color: #2d6a2d; background: #edf7ed; }

    /* ── Progress / activity rows ── */
    .fmba-progress-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #e8e9f0; }
    .fmba-progress-row:last-child  { border-bottom: none; padding-bottom: 0; }
    .fmba-progress-row:first-child { padding-top: 0; }
    .fmba-activity-row { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px solid #e8e9f0; }
    .fmba-activity-row:last-child  { border-bottom: none; }
    .fmba-activity-row:first-child { padding-top: 0; }

    /* ── Danger zone ── */
    .fmba-danger-box { border: 1.5px solid #f7c1c1; border-radius: 10px; padding: 18px; background: #fffafa; }

    /* ── Notif rows ── */
    .fmba-notif-row { background: #ffffff; border: 1px solid #e8e9f0; border-radius: 10px; padding: 14px 16px; display: flex; gap: 12px; margin-bottom: 8px; box-shadow: 0 1px 4px rgba(26,39,68,0.04); transition: box-shadow .18s; }
    .fmba-notif-row:hover  { box-shadow: 0 4px 14px rgba(26,39,68,0.09); }
    .fmba-notif-row.unread { border-left: 3px solid #1a2744; }

    /* ── Layout ── */
    .fmba-content      { padding: 24px 28px; max-width: 1380px; margin: 0 auto; }
    .fmba-grid-4       { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .fmba-grid-2       { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .fmba-grid-3       { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .fmba-grid-cards   { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .fmba-grid-5-2     { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }
    @media (max-width: 1100px) { .fmba-grid-cards { grid-template-columns: repeat(2,1fr); } }
    @media (max-width: 900px)  {
      .fmba-grid-4 { grid-template-columns: repeat(2,1fr); }
      .fmba-grid-2, .fmba-grid-3, .fmba-grid-5-2 { grid-template-columns: 1fr; }
      .fmba-grid-cards { grid-template-columns: 1fr; }
      .fmba-welcome { flex-direction: column; gap: 14px; }
    }
  `}</style>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const Spinner = () => <div className="fmba-spin"><div className="fmba-spinner" /></div>;
const FLabel = ({ children }) => <label className="fmba-label">{children}</label>;

// Shared toast hook — replaces alert() throughout
function useToast() {
  const [toast, setToast] = useState({ type: '', text: '' });
  const showToast = (type, text) => { setToast({ type, text }); setTimeout(() => setToast({ type: '', text: '' }), 3500); };
  const ToastEl = toast.text ? (
    <div className={toast.type === 'success' ? 'fmba-alert-success' : toast.type === 'info' ? 'fmba-alert-info' : 'fmba-alert-error'}
      style={{ marginBottom: 14, position: 'relative' }}>
      {toast.type === 'success' ? <CheckCircle size={14} /> : toast.type === 'info' ? <AlertCircle size={14} /> : <XCircle size={14} />}
      {toast.text}
    </div>
  ) : null;
  return { showToast, ToastEl };
}

// Inline confirm dialog — replaces window.confirm()
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,39,68,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(3px)' }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 380, width: '100%', margin: 16, boxShadow: '0 16px 48px rgba(26,39,68,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fdf1f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertCircle size={18} style={{ color: T.red }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Confirm Action</p>
            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>{message}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="fmba-btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="fmba-btn-danger" onClick={onConfirm}><Trash2 size={13} /> Delete</button>
        </div>
      </div>
    </div>
  );
}


// ─── OVERVIEW ────────────────────────────────────────────────────────────────
function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    const onVis = () => { if (document.visibilityState === 'visible') fetchData(true); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const fetchData = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const r = await api.get('/faculty/dashboard/stats');
      if (r.data.success) {
        setStats(r.data.stats || {});
        setRecentActivities(r.data.activities || []);
        setLastUpdated(new Date());
        setApiError(false);
      } else {
        setApiError(true);
      }
    } catch {
      setApiError(true);
    }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return <Spinner />;
  if (!stats && apiError) return (
    <div>
      <div style={{ background: '#fdf1f0', border: '1px solid #f7c1c1', borderRadius: 10, padding: '20px 24px', textAlign: 'center' }}>
        <AlertCircle size={32} style={{ color: T.red, margin: '0 auto 12px', display: 'block' }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: T.red, marginBottom: 6 }}>Unable to load dashboard</h3>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 16 }}>The backend returned an error on <code>GET /faculty/dashboard/stats</code>. Please check the server logs.</p>
        <button onClick={() => fetchData()} className="fmba-btn-primary" style={{ margin: '0 auto', display: 'inline-flex' }}>
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    </div>
  );
  if (!stats) return <Spinner />;

  const quickActions = [
    { to: '/faculty/content-upload', icon: Upload,      label: 'Upload Content', sub: 'Videos, PDFs',    color: T.navy  },
    { to: '/faculty/assignments',    icon: ClipboardList,label: 'Assignments',    sub: 'Create & grade',  color: T.gold  },
    { to: '/faculty/live-classes',   icon: MonitorPlay,  label: 'Live Classes',   sub: 'Schedule',        color: T.green },
    { to: '/faculty/analytics',      icon: BarChart3,    label: 'Analytics',      sub: 'Reports',         color: T.blue  },
    { to: '/faculty/attendance',     icon: UserCheck,    label: 'Attendance',     sub: 'Track',           color: T.red   },
  ];

  return (
    <div>
      {apiError && (
        <div style={{ background: '#fdf8ed', border: '1px solid #e8d89a', borderRadius: 10, padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={15} style={{ color: '#b8960b', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: '#5a4500' }}>
              <strong>Dashboard stats unavailable</strong> — the backend returned an error (<code style={{ fontSize: 12, background: 'rgba(0,0,0,.06)', padding: '1px 5px', borderRadius: 3 }}>GET /faculty/dashboard/stats 500</code>). The UI is shown with placeholder values. Please check the server logs.
            </p>
          </div>
          <button onClick={() => fetchData(true)} style={{ background: '#b8960b', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <RefreshCw size={11} style={{ marginRight: 5, verticalAlign: 'middle' }} />Retry
          </button>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Faculty Dashboard</h2>
          {lastUpdated && <p className="fmba-section-sub">Updated {lastUpdated.toLocaleTimeString()}</p>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="fmba-btn-ghost" onClick={() => fetchData(true)} disabled={refreshing}>
            <RefreshCw size={13} style={{ animation: refreshing ? 'fmba-spin .7s linear infinite' : 'none' }} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link to="/faculty/courses" className="fmba-btn-primary"><BookOpen size={14} /> Manage Courses</Link>
        </div>
      </div>

      <div className="fmba-welcome">
        <div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: T.navy, marginBottom: 4 }}>
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.full_name?.split(' ')[0] || 'Faculty'}
          </h3>
          <p style={{ fontSize: 13, color: T.muted, fontWeight: 400 }}>Your teaching metrics and course activity at a glance.</p>
        </div>
        <div style={{ display: 'flex', gap: 0 }}>
          {[
            { num: stats.totalCourses ?? '–',    lbl: 'Courses'       },
            { num: stats.totalStudents ?? '–',   lbl: 'Students'      },
            { num: (stats.pendingExams ?? 0) + (stats.pendingAssignments ?? 0) || '–', lbl: 'Pending Tasks' },
            { num: stats.totalWatchTime != null ? `${stats.totalWatchTime}h` : '–', lbl: 'Watch Time' },
          ].map((s, i) => (
            <div key={i} className="fmba-welcome-stat">
              <div className="num">{s.num}</div>
              <div className="lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fmba-grid-4" style={{ marginBottom: 14 }}>
        {[
          { label: 'My Courses',     value: stats.totalCourses ?? '–',                                      sub: 'Active courses',      accent: 'fmba-metric-navy'  },
          { label: 'Total Students', value: stats.totalStudents ?? '–',                                     sub: 'Across all courses',  accent: 'fmba-metric-gold'  },
          { label: 'Average Grade',  value: stats.averageGrade != null ? `${stats.averageGrade}%` : '–',    sub: 'Class performance',   accent: 'fmba-metric-green' },
          { label: 'Watch Time',     value: stats.totalWatchTime != null ? `${stats.totalWatchTime}h` : '–',sub: 'Total engagement',    accent: 'fmba-metric-gray'  },
        ].map((m, i) => (
          <div key={i} className={`fmba-metric ${m.accent}`}>
            <div className="fmba-metric-label">{m.label}</div>
            <div className="fmba-metric-value">{m.value}</div>
            <div className="fmba-metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="fmba-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Live Classes',       value: stats.liveClasses ?? '–',           sub: 'Scheduled',          accent: 'fmba-metric-blue'  },
          { label: 'Active Enrollments', value: stats.activeEnrollments ?? '–',     sub: 'Current term',       accent: 'fmba-metric-green' },
          { label: 'Pending Tasks',      value: (stats.pendingExams ?? 0) + (stats.pendingAssignments ?? 0) || '–', sub: 'Exams & assignments', accent: 'fmba-metric-gold'  },
          { label: 'Completed',          value: stats.completedAssignments ?? '–',  sub: 'Assignments graded', accent: 'fmba-metric-navy'  },
        ].map((m, i) => (
          <div key={i} className={`fmba-metric ${m.accent}`}>
            <div className="fmba-metric-label">{m.label}</div>
            <div className="fmba-metric-value">{m.value}</div>
            <div className="fmba-metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="fmba-card" style={{ marginBottom: 20 }}>
        <div className="fmba-card-head"><span className="fmba-card-title">Quick Actions</span></div>
        <div className="fmba-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {quickActions.map(({ to, icon: Icon, label, sub, color }) => (
            <Link key={to} to={to} className="fmba-quick-action">
              <div className="fmba-quick-action-icon" style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{label}</div>
                <div style={{ fontSize: 11, color: T.subtle }}>{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="fmba-grid-2">
        <div className="fmba-card">
          <div className="fmba-card-head">
            <span className="fmba-card-title">Performance Overview</span>
            <TrendingUp size={14} style={{ color: T.green }} />
          </div>
          <div className="fmba-card-body">
            {stats.performance ? Object.entries(stats.performance).map(([label, value]) => (
              <div key={label} className="fmba-progress-row">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{value}%</span>
                  </div>
                  <div className="fmba-bar-track">
                    <div className="fmba-bar-fill" style={{ width: `${value}%`, background: T.navy }} />
                  </div>
                </div>
              </div>
            )) : <p style={{ color: T.subtle, fontSize: 13 }}>No performance data available.</p>}
          </div>
        </div>

        <div className="fmba-card">
          <div className="fmba-card-head">
            <span className="fmba-card-title">Recent Activity</span>
            <Activity size={14} style={{ color: T.navy }} />
          </div>
          <div className="fmba-card-body">
            {recentActivities.length === 0
              ? <p style={{ color: T.subtle, fontSize: 13 }}>No recent activity.</p>
              : recentActivities.map((a, i) => (
                <div key={i} className="fmba-activity-row">
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.navy, flexShrink: 0, marginTop: 7 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</p>
                    <p style={{ fontSize: 12, color: T.subtle }}>{a.time}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MY COURSES ───────────────────────────────────────────────────────────────
function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ course_name: '', code: '', description: '', status: 'active', duration_hours: '', schedule: '' });
  const { showToast, ToastEl } = useToast();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/faculty/courses').then(r => { if (r.data.success) setCourses(r.data.courses || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openEdit = (c) => {
    setEditing(c);
    setEditForm({ course_name: c.course_name || '', code: c.code || '', description: c.description || '', status: c.status || 'active', duration_hours: c.duration_hours || '', schedule: c.schedule || '' });
    setShowEdit(true);
  };

  const handleEdit = async () => {
    if (!editForm.course_name.trim()) { showToast('error', 'Course name is required'); return; }
    try {
      const r = await api.put(`/faculty/courses/${editing.id}`, editForm);
      if (r.data.success) { setCourses(courses.map(c => c.id === editing.id ? { ...c, ...editForm } : c)); setShowEdit(false); }
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed to update'); }
  };

  const filtered = courses.filter(c => {
    const ms = (c.course_name ?? '').toLowerCase().includes(search.toLowerCase()) || (c.code ?? '').toLowerCase().includes(search.toLowerCase());
    const mf = filter === 'all' || (c.status ?? '').toLowerCase() === filter;
    return ms && mf;
  });

  if (loading) return <Spinner />;

  return (
    <div>
      {ToastEl}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">My Courses</h2>
          <p className="fmba-section-sub">{filtered.length} course{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/faculty/courses/new" className="fmba-btn-primary"><Plus size={13} /> Create Course</Link>
      </div>

      <div className="fmba-card" style={{ marginBottom: 16, padding: 14 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
            <input className="fmba-input" style={{ paddingLeft: 30 }} placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="fmba-tabs">
            {['all', 'active', 'draft'].map(f => (
              <button key={f} className={`fmba-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0
        ? <div className="fmba-card fmba-empty"><BookOpen size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No courses found.</p></div>
        : <div className="fmba-grid-cards">
          {filtered.map(course => (
            <div key={course.id} className="fmba-course-card">
              <div style={{ height: 3, background: T.navy }} />
              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '.04em' }}>{course.course_name}</h3>
                    <p style={{ fontSize: 12, color: T.subtle, marginTop: 2 }}>{course.code}</p>
                  </div>
                  <span className={`fmba-pill ${course.status === 'active' ? 'fmba-pill-pass' : 'fmba-pill-gray'}`}>{course.status}</span>
                </div>
                <p style={{ fontSize: 13, color: T.muted, marginBottom: 14, lineHeight: 1.55, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{course.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  {[
                    { icon: Users,    label: 'Students', value: course.students ?? '–'                                  },
                    { icon: Clock,    label: 'Duration',  value: course.duration_hours != null ? `${course.duration_hours}h` : '–' },
                    { icon: Calendar, label: 'Schedule',  value: course.schedule || '–'                                  },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.muted }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon size={11} />{label}</span>
                      <span style={{ fontWeight: 600, color: T.text }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link to={`/faculty/course/${course.id}`} className="fmba-btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>Manage</Link>
                  <button className="fmba-btn-ghost" onClick={() => openEdit(course)} style={{ fontSize: 13 }}><Edit2 size={13} /> Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>}

      {showEdit && editing && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>Edit Course</h3>
              <button onClick={() => setShowEdit(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><FLabel>Course Name *</FLabel><input className="fmba-input" value={editForm.course_name} onChange={e => setEditForm(f => ({ ...f, course_name: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><FLabel>Code</FLabel><input className="fmba-input" value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))} /></div>
                <div><FLabel>Status</FLabel>
                  <select className="fmba-select" value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
                  </select>
                </div>
                <div><FLabel>Duration (hours)</FLabel><input type="number" className="fmba-input" value={editForm.duration_hours} onChange={e => setEditForm(f => ({ ...f, duration_hours: e.target.value }))} /></div>
                <div><FLabel>Schedule</FLabel><input className="fmba-input" value={editForm.schedule} onChange={e => setEditForm(f => ({ ...f, schedule: e.target.value }))} placeholder="Mon-Wed 10AM" /></div>
              </div>
              <div><FLabel>Description</FLabel><textarea className="fmba-textarea" rows={3} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="fmba-btn-primary" onClick={handleEdit} style={{ flex: 1, justifyContent: 'center' }}>Save Changes</button>
              <button className="fmba-btn-ghost" onClick={() => setShowEdit(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CONTENT UPLOAD ───────────────────────────────────────────────────────────
function ContentUpload() {
  const [uploadType, setUploadType] = useState('video');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', file: null, duration: '', order: '' });
  const [uploadedContent, setUploadedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchContent, setSearchContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const typeCfg = {
    video: { label: 'Video', color: T.red,   accept: 'video/*',      fileLabel: 'MP4, AVI, MOV' },
    pdf:   { label: 'PDF',   color: T.blue,  accept: '.pdf',          fileLabel: 'PDF files'     },
    ppt:   { label: 'PPT',   color: T.gold,  accept: '.ppt,.pptx',    fileLabel: 'PPT, PPTX'    },
    scorm: { label: 'SCORM', color: T.green, accept: '.zip',          fileLabel: 'ZIP package'   },
  };

  const resolveUrl = (p) => {
    if (!p) return null; if (p.startsWith('http')) return p;
    return ((import.meta?.env?.VITE_API_URL || 'https://upskillize-lms-backend.onrender.com/api').replace(/\/api$/, '')) + p;
  };

  useEffect(() => {
    api.get('/faculty/courses').then(r => { if (r.data.success) setCourses(r.data.courses || []); }).catch(() => {});
    api.get('/faculty/content').then(r => { if (r.data.success) setUploadedContent(r.data.content || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.file || !selectedCourse) { setErrorMsg('Please fill all required fields and select a file'); return; }
    setErrorMsg(''); setUploading(true); setUploadProgress(0);
    const fd = new FormData();
    fd.append('title', uploadForm.title); fd.append('description', uploadForm.description);
    fd.append('file', uploadForm.file); fd.append('type', uploadType);
    fd.append('course', selectedCourse); fd.append('duration', uploadForm.duration); fd.append('order', uploadForm.order);
    try {
      const r = await api.post('/faculty/content/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }, onUploadProgress: e => setUploadProgress(Math.round(e.loaded * 100 / e.total)) });
      if (r.data.success) { setUploadedContent(p => [r.data.content, ...p]); setUploadForm({ title: '', description: '', file: null, duration: '', order: '' }); setSelectedCourse(''); }
    } catch { setErrorMsg('Upload failed. Please try again.'); setUploadProgress(0); }
    finally { setUploading(false); }
  };

  const handleEditSave = async () => {
    if (!editForm.title) { setErrorMsg('Title is required'); return; }
    setEditSaving(true);
    try {
      const r = await api.put(`/faculty/content/${editItem.id}`, editForm);
      if (r.data.success) { setUploadedContent(p => p.map(c => c.id === editItem.id ? { ...c, ...editForm } : c)); setEditItem(null); }
    } catch { setErrorMsg('Failed to save'); } finally { setEditSaving(false); }
  };

  const handleDelete = async (item) => {
    setDeletingId(item.id);
    try { await api.delete(`/faculty/content/${item.id}`); setUploadedContent(p => p.filter(c => c.id !== item.id)); }
    catch { setErrorMsg('Delete failed'); } finally { setDeletingId(null); }
  };

  const filtered = uploadedContent.filter(c => (filterType === 'all' || c.type === filterType) && (c.title || '').toLowerCase().includes(searchContent.toLowerCase()));
  const cfg = typeCfg[uploadType];

  return (
    <div>
      {confirmDelete && <ConfirmDialog message={`Delete "${confirmDelete.title}"? This cannot be undone.`} onConfirm={doDelete} onCancel={() => setConfirmDelete(null)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Content Library</h2>
          <p className="fmba-section-sub">{uploadedContent.length} files uploaded</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 14px' }}>
          <HardDrive size={14} style={{ color: T.subtle }} />
          <span style={{ fontSize: 13, color: T.muted, fontWeight: 500 }}>{uploadedContent.length} files</span>
        </div>
      </div>

      {errorMsg && (
        <div className="fmba-alert-error" style={{ marginBottom: 14 }}>
          <AlertCircle size={13} />{errorMsg}
          <button onClick={() => setErrorMsg('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T.red }}><X size={14} /></button>
        </div>
      )}

      <div className="fmba-grid-4" style={{ marginBottom: 20 }}>
        {Object.entries(typeCfg).map(([type, c]) => (
          <div key={type} className="fmba-metric" style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="fmba-metric-label">{c.label}</div>
            <div className="fmba-metric-value">{uploadedContent.filter(x => x.type === type).length}</div>
            <div className="fmba-metric-sub">files uploaded</div>
          </div>
        ))}
      </div>

      <div className="fmba-grid-5-2">
        {/* Upload form */}
        <div className="fmba-card">
          <div className="fmba-card-head" style={{ background: cfg.color }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '.08em' }}>Upload {cfg.label}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.65)' }}>{cfg.fileLabel}</span>
          </div>
          <div className="fmba-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, background: T.bg, padding: 4, borderRadius: 8 }}>
              {Object.entries(typeCfg).map(([type, c]) => (
                <button key={type} onClick={() => setUploadType(type)} style={{ padding: '7px 4px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', transition: 'all .18s', background: uploadType === type ? c.color : 'transparent', color: uploadType === type ? '#fff' : T.muted, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.label}</button>
              ))}
            </div>
            <div><FLabel>Content Title *</FLabel><input className="fmba-input" value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to Arrays" /></div>
            <div><FLabel>Course *</FLabel>
              <select className="fmba-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                <option value="">Choose a course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code || c.course_code} – {c.course_name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {uploadType === 'video' && <div><FLabel>Duration (min)</FLabel><input type="number" className="fmba-input" value={uploadForm.duration} onChange={e => setUploadForm(f => ({ ...f, duration: e.target.value }))} placeholder="45" /></div>}
              <div><FLabel>Display Order</FLabel><input type="number" className="fmba-input" value={uploadForm.order} onChange={e => setUploadForm(f => ({ ...f, order: e.target.value }))} placeholder="1" /></div>
            </div>
            <div><FLabel>Description</FLabel><textarea className="fmba-textarea" rows={2} value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" /></div>

            <div className={`fmba-upload-zone ${isDragging ? 'drag' : ''} ${uploadForm.file ? 'has-file' : ''}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) setUploadForm(u => ({ ...u, file: f })); }}>
              <input type="file" id="cu-file" style={{ display: 'none' }} accept={cfg.accept} onChange={e => { const f = e.target.files[0]; if (f) setUploadForm(u => ({ ...u, file: f })); }} />
              {uploadForm.file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={15} style={{ color: '#fff' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: T.text, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadForm.file.name}</p>
                      <p style={{ fontSize: 12, color: T.subtle }}>{(uploadForm.file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => setUploadForm(f => ({ ...f, file: null }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={14} /></button>
                </div>
              ) : (
                <label htmlFor="cu-file" style={{ cursor: 'pointer', display: 'block' }}>
                  <Upload size={22} style={{ color: T.subtle, display: 'block', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, color: T.muted }}>Drop file or <span style={{ color: cfg.color, fontWeight: 600 }}>browse</span></p>
                  <p style={{ fontSize: 12, color: T.subtle, marginTop: 3 }}>{cfg.fileLabel}</p>
                </label>
              )}
            </div>

            {uploading && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: T.muted }}>Uploading…</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{uploadProgress}%</span>
                </div>
                <div className="fmba-bar-track"><div className="fmba-bar-fill" style={{ width: `${uploadProgress}%`, background: cfg.color }} /></div>
              </div>
            )}

            <button className="fmba-btn-primary" onClick={handleUpload} disabled={uploading} style={{ justifyContent: 'center', background: cfg.color }}>
              {uploading ? 'Uploading…' : <><Upload size={13} /> Upload {cfg.label}</>}
            </button>
          </div>
        </div>

        {/* Library */}
        <div className="fmba-card">
          <div className="fmba-card-head">
            <span className="fmba-card-title">Uploaded Content</span>
            <span style={{ fontSize: 12, color: T.subtle, background: T.bg, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{filtered.length} items</span>
          </div>
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 150, position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                <input className="fmba-input" style={{ paddingLeft: 30 }} value={searchContent} onChange={e => setSearchContent(e.target.value)} placeholder="Search content…" />
              </div>
              <div className="fmba-tabs">
                {['all', 'video', 'pdf', 'ppt', 'scorm'].map(f => (
                  <button key={f} className={`fmba-tab ${filterType === f ? 'active' : ''}`} onClick={() => setFilterType(f)} style={{ textTransform: 'uppercase', fontSize: 11 }}>{f === 'all' ? 'All' : f}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="fmba-card-body">
            {loading ? <Spinner /> : filtered.length === 0
              ? <div className="fmba-empty"><HardDrive size={28} style={{ color: T.border, margin: '0 auto 8px' }} /><p>No content found</p></div>
              : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {filtered.map(content => {
                  const cc = typeCfg[content.type] || typeCfg.pdf;
                  return (
                    <div key={content.id} className="fmba-content-card">
                      <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 6, background: cc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={15} style={{ color: '#fff' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{content.title}</h4>
                          <p style={{ fontSize: 12, color: T.subtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{content.course || '–'}</p>
                        </div>
                        <span className="fmba-pill" style={{ background: `${cc.color}18`, color: cc.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', flexShrink: 0 }}>{content.type}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                        <button onClick={() => setViewItem(content)} style={{ width: 28, height: 28, borderRadius: 6, background: T.blueSoft, color: T.blue, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={13} /></button>
                        <button onClick={() => { setEditItem(content); setEditForm({ title: content.title || '', description: content.description || '', duration: content.duration || '', order: content.display_order || content.order || '' }); }} style={{ width: 28, height: 28, borderRadius: 6, background: T.bg, color: T.muted, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(content)} disabled={deletingId === content.id} style={{ width: 28, height: 28, borderRadius: 6, background: T.redSoft, color: T.red, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {deletingId === content.id ? <div className="fmba-spinner" style={{ width: 10, height: 10, border: '2px solid #f7c1c1', borderTopColor: T.red }} /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>}
          </div>
        </div>
      </div>

      {/* View modal */}
      {viewItem && (() => {
        const vc = typeCfg[viewItem.type] || typeCfg.pdf;
        const url = resolveUrl(viewItem.file_path);
        return (
          <div className="fmba-modal-bg" onClick={() => setViewItem(null)}>
            <div style={{ background: T.white, borderRadius: 14, width: '100%', maxWidth: 720, overflow: 'hidden', boxShadow: '0 24px 64px rgba(26,39,68,0.22)' }} onClick={e => e.stopPropagation()}>
              <div style={{ background: vc.color, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{viewItem.title}</h3>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{viewItem.type}</span>
                </div>
                <button onClick={() => setViewItem(null)} style={{ background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
              </div>
              <div style={{ background: '#0b1623', minHeight: 280 }}>
                {viewItem.type === 'video' && url ? <video src={url} controls style={{ width: '100%', maxHeight: 380 }} />
                  : viewItem.type === 'pdf' && url ? <iframe src={url} style={{ width: '100%', height: 380, border: 'none' }} title={viewItem.title} />
                  : viewItem.type === 'ppt' && url ? <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`} style={{ width: '100%', height: 380, border: 'none', background: T.white }} title={viewItem.title} />
                  : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 12 }}>
                    <FileText size={40} style={{ color: 'rgba(255,255,255,.25)' }} />
                    {url && <a href={url} download target="_blank" rel="noopener noreferrer" className="fmba-btn-primary" style={{ background: vc.color }}><Download size={13} /> Download File</a>}
                  </div>}
              </div>
              <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 13, color: T.muted }}>{viewItem.description || ''}</p>
                {url && <a href={url} download target="_blank" rel="noopener noreferrer" className="fmba-btn-ghost"><Download size={13} /> Download</a>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit modal */}
      {editItem && (
        <div className="fmba-modal-bg" onClick={() => setEditItem(null)}>
          <div className="fmba-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>Edit Content</h3>
              <button onClick={() => setEditItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><FLabel>Title *</FLabel><input className="fmba-input" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><FLabel>Description</FLabel><textarea className="fmba-textarea" rows={3} value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><FLabel>Duration (min)</FLabel><input type="number" className="fmba-input" value={editForm.duration} onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))} /></div>
                <div><FLabel>Display Order</FLabel><input type="number" className="fmba-input" value={editForm.order} onChange={e => setEditForm(f => ({ ...f, order: e.target.value }))} /></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="fmba-btn-ghost" onClick={() => setEditItem(null)}>Cancel</button>
              <button className="fmba-btn-primary" onClick={handleEditSave} disabled={editSaving} style={{ flex: 1, justifyContent: 'center' }}>{editSaving ? 'Saving…' : <><CheckCircle size={13} /> Save Changes</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GRADE SUBMISSION CARD ────────────────────────────────────────────────────
function GradeSubmissionCard({ submission, assignment, onGrade }) {
  const [rubricScores, setRubricScores] = useState(() => {
    const init = {};
    (assignment.rubric?.categories || []).forEach((_, i) => { init[i] = ''; });
    return init;
  });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const totalGrade = Object.values(rubricScores).reduce((s, v) => s + (parseInt(v) || 0), 0);
  const maxGrade = (assignment.rubric?.categories || []).reduce((s, c) => s + (parseInt(c.points) || 0), 0) || assignment.total_marks || 100;
  const fileUrl = submission.file_url || submission.file_path || submission.fileUrl;

  const handleSubmit = async () => {
    setSubmitting(true);
    try { await onGrade(submission, rubricScores, feedback); setDone(true); }
    finally { setSubmitting(false); }
  };

  if (done) return (
    <div style={{ border: `1px solid #b8d9b8`, background: T.greenSoft, borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
      <CheckCircle size={18} style={{ color: T.green, flexShrink: 0 }} />
      <div>
        <p style={{ fontWeight: 700, fontSize: 14, color: T.green }}>{submission.studentName || submission.student_name} — Graded</p>
        <p style={{ fontSize: 12, color: T.green }}>{totalGrade}/{maxGrade} marks</p>
      </div>
    </div>
  );

  return (
    <div className="fmba-sub-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: T.navy, fontSize: 14 }}>
            {(submission.studentName || submission.student_name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14 }}>{submission.studentName || submission.student_name}</p>
            <p style={{ fontSize: 12, color: T.subtle }}>Submitted: {submission.submittedDate || submission.submitted_at ? new Date(submission.submittedDate || submission.submitted_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–'}</p>
          </div>
        </div>
        {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="fmba-btn-outline" style={{ fontSize: 12 }}><Eye size={13} /> View Submission</a>}
      </div>

      {submission.notes && (
        <div style={{ background: T.bg, borderLeft: `3px solid ${T.border}`, padding: '8px 12px', borderRadius: '0 4px 4px 0', marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: T.subtle, marginBottom: 2 }}>Student Notes</p>
          <p style={{ fontSize: 13 }}>{submission.notes}</p>
        </div>
      )}

      {assignment.rubric?.categories?.length > 0 ? (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Grade by Rubric</p>
          {assignment.rubric.categories.map((cat, idx) => (
            <div key={idx} className="fmba-rubric-row">
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{cat.name}</span>
              <input type="number" max={cat.points} min="0" value={rubricScores[idx]} onChange={e => { const v = Math.min(parseInt(e.target.value) || 0, parseInt(cat.points)); setRubricScores(p => ({ ...p, [idx]: v })); }} style={{ width: 60, padding: '5px 8px', border: `1.5px solid ${T.border}`, borderRadius: 6, textAlign: 'center', fontWeight: 700, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14 }} />
              <span style={{ fontSize: 12, color: T.subtle }}>/ {cat.points}</span>
            </div>
          ))}
          <div style={{ background: T.blueSoft, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>Total:</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: T.navy }}>{totalGrade}</span>
            <span style={{ fontSize: 13, color: T.muted }}>/ {maxGrade}</span>
            <div style={{ flex: 1, height: 5, background: T.border, borderRadius: 3, overflow: 'hidden', marginLeft: 8 }}>
              <div style={{ height: '100%', width: `${maxGrade > 0 ? (totalGrade / maxGrade) * 100 : 0}%`, background: T.navy, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{maxGrade > 0 ? Math.round((totalGrade / maxGrade) * 100) : 0}%</span>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <FLabel>Marks / {maxGrade}</FLabel>
          <input type="number" min="0" max={maxGrade} value={rubricScores[0] || ''} onChange={e => setRubricScores({ 0: Math.min(parseInt(e.target.value) || 0, maxGrade) })} style={{ width: 100, padding: '9px 12px', border: `1.5px solid ${T.border}`, borderRadius: 8, textAlign: 'center', fontWeight: 800, fontSize: 18, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <FLabel>Feedback (optional)</FLabel>
        <textarea className="fmba-textarea" rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Write feedback for the student…" />
      </div>

      <button className="fmba-btn-green" onClick={handleSubmit} disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
        {submitting ? 'Submitting…' : <><CheckCircle size={13} /> Submit Grade ({totalGrade}/{maxGrade})</>}
      </button>
    </div>
  );
}

// ─── ASSIGNMENT MANAGEMENT ────────────────────────────────────────────────────
function AssignmentManagement() {
  const { showToast, ToastEl } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [showGrading, setShowGrading] = useState(false);
  const [showAllSubs, setShowAllSubs] = useState(false);
  const [selected, setSelected] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', course: '', dueDate: '', totalMarks: '', description: '', rubricCategories: [{ name: '', points: '' }] });

  useEffect(() => {
    api.get('/faculty/assignments').then(r => {
      if (r.data.success) setAssignments((r.data.assignments || []).map(a => ({ ...a, total_marks: a.total_marks ?? a.totalMarks ?? 0, graded: a.graded ?? 0, submissions: a.submissions ?? 0, totalStudents: a.totalStudents ?? 0 })));
    }).catch(() => {}).finally(() => setLoading(false));
    api.get('/faculty/courses').then(r => { if (r.data.success) setCourses(r.data.courses || []); }).catch(() => {});
  }, []);

  const fetchSubs = async (id) => {
    try { const r = await api.get(`/faculty/assignments/${id}/submissions`); if (r.data.success) setSubmissions(r.data.submissions || []); } catch {}
  };

  const handleCreate = async () => {
    if (!form.title || !form.course) return;
    try {
      const r = await api.post('/faculty/assignments', { ...form, totalMarks: parseInt(form.totalMarks), rubric: { categories: form.rubricCategories.map(c => ({ name: c.name, points: parseInt(c.points) })) } });
      if (r.data.success) { setAssignments([...assignments, r.data.assignment]); setShowCreate(false); setEditingId(null); resetForm(); }
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed to create assignment'); }
  };

  const resetForm = () => setForm({ title: '', course: '', dueDate: '', totalMarks: '', description: '', rubricCategories: [{ name: '', points: '' }] });

  const handleDelete = async (id) => {
    try { await api.delete(`/faculty/assignments/${id}`); setAssignments(assignments.filter(a => a.id !== id)); }
    catch { showToast('error', 'Failed to delete assignment'); }
  };

  const handleGrade = async (submission, rubricScores, feedback) => {
    const totalGrade = Object.values(rubricScores).reduce((s, v) => s + (parseInt(v) || 0), 0);
    try {
      await api.post(`/faculty/assignments/${selected.id}/grade`, { submission_id: submission.id, student_id: submission.student_id || submission.studentId, grade: totalGrade, max_marks: (selected.rubric?.categories || []).reduce((s, c) => s + (parseInt(c.points) || 0), 0) || selected.total_marks || 100, feedback: feedback.trim(), rubric_scores: rubricScores });
      const updated = submissions.map(s => s.id === submission.id ? { ...s, grade: totalGrade, feedback, status: 'graded' } : s);
      setSubmissions(updated);
      setAssignments(p => p.map(a => a.id === selected.id ? { ...a, graded: updated.filter(s => s.grade != null).length } : a));
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed to grade submission'); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {ToastEl}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Assignment Management</h2>
          <p className="fmba-section-sub">{assignments.length} assignments total</p>
        </div>
        <button className="fmba-btn-primary" onClick={() => { setShowCreate(true); setEditingId(null); resetForm(); }}><Plus size={13} /> Create Assignment</button>
      </div>

      {assignments.length === 0
        ? <div className="fmba-card fmba-empty"><ClipboardList size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No assignments found.</p></div>
        : assignments.map(a => (
          <div key={a.id} className="fmba-card" style={{ marginBottom: 10, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                  <span className="fmba-pill fmba-pill-navy">{a.course}</span>
                  <span className={`fmba-pill ${a.status === 'active' ? 'fmba-pill-pass' : 'fmba-pill-gray'}`}>{a.status}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '.03em' }}>{a.title}</h3>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
              {[
                { icon: Calendar,     text: `Due: ${a.dueDate}`                       },
                { icon: Star,         text: `${a.total_marks} marks`                  },
                { icon: CheckCircle,  text: `${a.submissions}/${a.totalStudents} submitted` },
                { icon: GraduationCap,text: `${a.graded}/${a.submissions} graded`     },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.muted }}>
                  <Icon size={12} /><span>{text}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.subtle, marginBottom: 4 }}>
                <span>Submission Progress</span>
                <span style={{ fontWeight: 700 }}>{a.totalStudents > 0 ? Math.round((a.submissions / a.totalStudents) * 100) : 0}%</span>
              </div>
              <div className="fmba-bar-track">
                <div className="fmba-bar-fill" style={{ width: a.totalStudents > 0 ? `${(a.submissions / a.totalStudents) * 100}%` : '0%', background: T.green }} />
              </div>
            </div>
            {a.rubric?.categories?.length > 0 && (
              <div style={{ background: T.bg, borderRadius: 8, padding: '8px 12px', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {a.rubric.categories.map((cat, i) => <span key={i} className="fmba-pill fmba-pill-navy">{cat.name}: {cat.points}pts</span>)}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="fmba-btn-primary" onClick={() => { setSelected(a); fetchSubs(a.id); setShowGrading(true); }} style={{ fontSize: 13 }}><GraduationCap size={13} /> Grade ({a.submissions - a.graded} pending)</button>
              <button className="fmba-btn-green" onClick={() => { setSelected(a); fetchSubs(a.id); setShowAllSubs(true); }} style={{ fontSize: 13 }}><Eye size={13} /> All Submissions</button>
              <button className="fmba-btn-ghost" onClick={() => { setForm({ title: a.title, course: a.course_id || a.course, dueDate: a.due_date || a.dueDate, totalMarks: a.total_marks, description: a.description || '', rubricCategories: a.rubric?.categories || [{ name: '', points: '' }] }); setEditingId(a.id); setShowCreate(true); }} style={{ fontSize: 13 }}><Edit2 size={13} /> Edit</button>
              <button className="fmba-btn-danger" onClick={() => handleDelete(a.id)} style={{ fontSize: 13 }}><Trash2 size={13} /> Delete</button>
            </div>
          </div>
        ))}

      {showCreate && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal fmba-modal-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>{editingId ? 'Edit Assignment' : 'Create Assignment'}</h3>
              <button onClick={() => { setShowCreate(false); setEditingId(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><FLabel>Title *</FLabel><input className="fmba-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Project: Build a Web App" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><FLabel>Course *</FLabel>
                  <select className="fmba-select" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.course_name}</option>)}
                  </select>
                </div>
                <div><FLabel>Due Date *</FLabel><input type="date" className="fmba-input" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
              </div>
              <div><FLabel>Description *</FLabel><textarea className="fmba-textarea" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Assignment requirements…" /></div>
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Grading Rubric</p>
                  <button className="fmba-btn-green" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => setForm(f => ({ ...f, rubricCategories: [...f.rubricCategories, { name: '', points: '' }] }))}><Plus size={12} /> Add Category</button>
                </div>
                {form.rubricCategories.map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <input className="fmba-input" style={{ flex: 1 }} value={cat.name} onChange={e => { const c = [...form.rubricCategories]; c[idx].name = e.target.value; setForm(f => ({ ...f, rubricCategories: c })); }} placeholder="Category name (e.g. Code Quality)" />
                    <input type="number" className="fmba-input" style={{ width: 80 }} value={cat.points} onChange={e => { const c = [...form.rubricCategories]; c[idx].points = e.target.value; setForm(f => ({ ...f, rubricCategories: c })); }} placeholder="Pts" />
                    {form.rubricCategories.length > 1 && <button className="fmba-btn-danger" style={{ padding: '9px 10px' }} onClick={() => setForm(f => ({ ...f, rubricCategories: f.rubricCategories.filter((_, i) => i !== idx) }))}><Trash2 size={13} /></button>}
                  </div>
                ))}
                <div style={{ background: T.blueSoft, borderRadius: 8, padding: '9px 14px', marginTop: 6 }}>
                  <span style={{ fontSize: 13, color: T.navy }}><strong>Total:</strong> {form.rubricCategories.reduce((s, c) => s + (parseInt(c.points) || 0), 0)} pts</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="fmba-btn-primary" onClick={handleCreate} style={{ flex: 1, justifyContent: 'center' }}>{editingId ? 'Update Assignment' : 'Create Assignment'}</button>
              <button className="fmba-btn-ghost" onClick={() => { setShowCreate(false); setEditingId(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showGrading && selected && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal fmba-modal-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>Grade Submissions — {selected.title}</h3>
              <button onClick={() => setShowGrading(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            {submissions.filter(s => s.grade == null).length === 0
              ? <div className="fmba-empty"><CheckCircle size={36} style={{ color: T.green, margin: '0 auto 10px' }} /><p style={{ color: T.green }}>All submissions graded!</p></div>
              : submissions.filter(s => s.grade == null).map(sub => <GradeSubmissionCard key={sub.id} submission={sub} assignment={selected} onGrade={handleGrade} />)}
          </div>
        </div>
      )}

      {showAllSubs && selected && (
        <div className="fmba-modal-bg" onClick={e => { if (e.target === e.currentTarget) setShowAllSubs(false); }}>
          <div style={{ background: T.white, borderRadius: 14, width: '100%', maxWidth: 760, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(26,39,68,0.22)' }}>
            <div style={{ padding: '18px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>All Submissions</h3>
                <p style={{ fontSize: 13, color: T.subtle }}>{selected.title} · {selected.course}</p>
              </div>
              <button onClick={() => setShowAllSubs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, padding: '12px 24px', borderBottom: `1px solid ${T.border}`, background: T.bg }}>
              {[
                { count: submissions.length,                               label: 'Total',   color: T.blue  },
                { count: submissions.filter(s => s.grade != null).length,  label: 'Graded',  color: T.green },
                { count: submissions.filter(s => s.grade == null).length,  label: 'Pending', color: T.gold  },
              ].map(({ count, label, color }) => (
                <div key={label} style={{ textAlign: 'center', background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 0' }}>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color }}>{count}</p>
                  <p style={{ fontSize: 12, color: T.subtle, fontWeight: 600 }}>{label}</p>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
              {submissions.length === 0
                ? <div className="fmba-empty"><p>No submissions yet.</p></div>
                : submissions.map((sub, i) => {
                  const isGraded = sub.grade != null;
                  const fileUrl = sub.file_url || sub.file_path || sub.fileUrl;
                  return (
                    <div key={sub.id || i} className="fmba-sub-card" style={{ borderColor: isGraded ? '#b8d9b8' : T.border }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: T.navy, fontSize: 14 }}>
                            {(sub.studentName || sub.student_name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: 14 }}>{sub.studentName || sub.student_name || '–'}</p>
                            <p style={{ fontSize: 12, color: T.subtle }}>{sub.studentEmail || sub.student_email || ''}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`fmba-pill ${isGraded ? 'fmba-pill-pass' : 'fmba-pill-gold'}`}>
                            {isGraded ? `✓ ${sub.grade}/${selected.total_marks} pts` : '⏳ Pending'}
                          </span>
                          <span style={{ fontSize: 12, color: T.subtle }}>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–'}</span>
                        </div>
                      </div>
                      {sub.notes && <div style={{ background: T.bg, borderLeft: `3px solid ${T.border}`, padding: '7px 11px', borderRadius: '0 4px 4px 0', marginBottom: 8, fontSize: 13, color: T.muted }}>{sub.notes}</div>}
                      {fileUrl && (
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="fmba-btn-outline" style={{ fontSize: 12 }}><Eye size={12} /> Preview</a>
                          <a href={fileUrl} download target="_blank" rel="noopener noreferrer" className="fmba-btn-ghost" style={{ fontSize: 12 }}><Download size={12} /> Download</a>
                        </div>
                      )}
                      {isGraded && sub.feedback && <div style={{ background: T.greenSoft, borderLeft: `3px solid ${T.green}`, padding: '7px 11px', borderRadius: '0 4px 4px 0', fontSize: 13, color: T.text }}>{sub.feedback}</div>}
                    </div>
                  );
                })}
            </div>
            <div style={{ padding: '12px 24px', borderTop: `1px solid ${T.border}` }}>
              <button className="fmba-btn-ghost" onClick={() => setShowAllSubs(false)} style={{ width: '100%', justifyContent: 'center' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QUIZ / EXAM MANAGEMENT ───────────────────────────────────────────────────
function QuizExamManagement() {
  const { showToast, ToastEl } = useToast();
  const [view, setView] = useState('list');
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [quizForm, setQuizForm] = useState({ course_id: '', title: '', description: '', time_limit_minutes: 30, pass_percentage: 60 });
  const [questions, setQuestions] = useState([{ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', marks: 1 }]);

  useEffect(() => {
    api.get('/faculty/quizzes').then(r => { if (r.data.success) setQuizzes(r.data.quizzes || []); }).catch(() => {}).finally(() => setLoading(false));
    api.get('/faculty/courses').then(r => { if (r.data.success) setCourses(r.data.courses || []); }).catch(() => {});
  }, []);

  const fetchResults = async (id) => {
    setLoadingResults(true);
    try { const r = await api.get(`/quizzes/${id}/results`); if (r.data.success) setResults(r.data.attempts || []); }
    catch {} finally { setLoadingResults(false); }
  };

  const handleCreate = async () => {
    if (!quizForm.course_id || !quizForm.title) { showToast('error', 'Course and title are required'); return; }
    setSaving(true);
    try { const r = await api.post('/quizzes', quizForm); if (r.data.success) { setSelectedQuiz(r.data.quiz); setView('questions'); } }
    catch (e) { showToast('error', e.response?.data?.message || 'Error creating quiz'); } finally { setSaving(false); }
  };

  const handleSaveQuestions = async () => {
    if (questions.some(q => !q.question_text || !q.option_a || !q.option_b)) { showToast('error', 'Each question needs text, Option A and Option B'); return; }
    setSaving(true);
    try {
      await api.post(`/quizzes/${selectedQuiz.id}/questions`, { questions });
      await api.get('/faculty/quizzes').then(r => { if (r.data.success) setQuizzes(r.data.quizzes || []); }).catch(() => {});
      setView('list');
      setQuizForm({ course_id: '', title: '', description: '', time_limit_minutes: 30, pass_percentage: 60 });
      setQuestions([{ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', marks: 1 }]);
    } catch (e) { showToast('error', e.response?.data?.message || 'Error saving questions'); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/quizzes/${id}`); setQuizzes(quizzes.filter(q => q.id !== id)); }
    catch { showToast('error', 'Error deleting quiz'); }
  };

  const addQ = () => setQuestions(p => [...p, { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', marks: 1 }]);
  const removeQ = (idx) => { if (questions.length > 1) setQuestions(p => p.filter((_, i) => i !== idx)); };
  const updateQ = (idx, field, value) => { const u = [...questions]; u[idx][field] = value; setQuestions(u); };

  if (view === 'results' && selectedQuiz) {
    const passCount = results.filter(r => r.passed).length;
    const avg = results.length ? Math.round(results.reduce((s, r) => s + r.score / r.total_marks * 100, 0) / results.length) : 0;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button className="fmba-btn-ghost" onClick={() => setView('list')}><ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back</button>
          <div><h2 className="fmba-section-title">Quiz Results</h2><p className="fmba-section-sub">{selectedQuiz.title}</p></div>
        </div>
        <div className="fmba-grid-3" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total Attempts', value: results.length, accent: 'fmba-metric-navy' },
            { label: 'Passed',         value: `${passCount} (${results.length > 0 ? Math.round(passCount / results.length * 100) : 0}%)`, accent: 'fmba-metric-green' },
            { label: 'Average Score',  value: `${avg}%`,     accent: 'fmba-metric-gold' },
          ].map((m, i) => (
            <div key={i} className={`fmba-metric ${m.accent}`}>
              <div className="fmba-metric-label">{m.label}</div>
              <div className="fmba-metric-value">{m.value}</div>
            </div>
          ))}
        </div>
        <div className="fmba-card" style={{ overflow: 'hidden' }}>
          {loadingResults ? <Spinner /> : results.length === 0
            ? <div className="fmba-empty"><Users size={28} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No attempts yet</p></div>
            : <table className="fmba-table">
              <thead><tr>{['#', 'Student', 'Score', 'Percentage', 'Time', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {results.map((a, i) => {
                  const pct = Math.round(a.score / a.total_marks * 100);
                  const mins = Math.floor((a.time_taken_seconds || 0) / 60);
                  return (
                    <tr key={a.id}>
                      <td style={{ color: T.subtle }}>{i + 1}</td>
                      <td><p style={{ fontWeight: 600 }}>{a.Student?.User?.full_name || 'Unknown'}</p><p style={{ fontSize: 12, color: T.subtle }}>{a.Student?.User?.email}</p></td>
                      <td style={{ fontWeight: 700 }}>{a.score}/{a.total_marks}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 48, height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: pct >= 60 ? T.green : T.red, borderRadius: 2 }} /></div>
                          <span style={{ fontWeight: 700 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ color: T.muted }}>{mins}m {(a.time_taken_seconds || 0) % 60}s</td>
                      <td><span className={`fmba-pill ${a.passed ? 'fmba-pill-pass' : 'fmba-pill-fail'}`}>{a.passed ? 'Passed' : 'Failed'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>}
        </div>
      </div>
    );
  }

  if (view === 'questions') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="fmba-btn-ghost" onClick={() => setView('list')}><ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back</button>
        <div><h2 className="fmba-section-title">Add Questions</h2><p className="fmba-section-sub">Quiz: {selectedQuiz?.title}</p></div>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: T.subtle, fontWeight: 500 }}>{questions.length} question(s)</span>
      </div>
      {questions.map((q, idx) => (
        <div key={idx} className="fmba-card" style={{ marginBottom: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Question {idx + 1}</span>
            <button onClick={() => removeQ(idx)} disabled={questions.length === 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.red, opacity: questions.length === 1 ? .3 : 1 }}><Trash2 size={14} /></button>
          </div>
          <textarea className="fmba-textarea" rows={2} value={q.question_text} onChange={e => updateQ(idx, 'question_text', e.target.value)} placeholder="Enter your question here…" style={{ marginBottom: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {['a', 'b', 'c', 'd'].map(opt => (
              <div key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1.5px solid ${q.correct_option === opt ? T.green : T.border}`, borderRadius: 8, padding: '8px 12px', background: q.correct_option === opt ? T.greenSoft : T.white, transition: 'all .18s' }}>
                <span onClick={() => updateQ(idx, 'correct_option', opt)} style={{ width: 26, height: 26, borderRadius: '50%', background: q.correct_option === opt ? T.green : T.bg, color: q.correct_option === opt ? '#fff' : T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>{opt.toUpperCase()}</span>
                <input value={q[`option_${opt}`]} onChange={e => updateQ(idx, `option_${opt}`, e.target.value)} placeholder={`Option ${opt.toUpperCase()}${opt === 'a' || opt === 'b' ? ' *' : ''}`} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FLabel>Correct Answer</FLabel>
              <select value={q.correct_option} onChange={e => updateQ(idx, 'correct_option', e.target.value)} className="fmba-select" style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}>
                {['a', 'b', 'c', 'd'].map(o => <option key={o} value={o}>Option {o.toUpperCase()}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FLabel>Marks</FLabel>
              <input type="number" value={q.marks} min={1} max={10} onChange={e => updateQ(idx, 'marks', parseInt(e.target.value))} style={{ width: 64, padding: '6px 10px', border: `1.5px solid ${T.border}`, borderRadius: 8, textAlign: 'center', fontSize: 14, outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }} />
            </div>
          </div>
        </div>
      ))}
      <button onClick={addQ} style={{ width: '100%', border: `1.5px dashed ${T.border}`, background: 'transparent', color: T.navy, borderRadius: 8, padding: '12px 0', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all .18s' }}><Plus size={15} /> Add Another Question</button>
      <button className="fmba-btn-primary" onClick={handleSaveQuestions} disabled={saving} style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
        {saving ? 'Publishing…' : '🚀 Publish Quiz to Students'}
      </button>
    </div>
  );

  if (view === 'create') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button className="fmba-btn-ghost" onClick={() => setView('list')}><ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back</button>
        <h2 className="fmba-section-title">Create New Quiz</h2>
      </div>
      <div className="fmba-card" style={{ maxWidth: 540, padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><FLabel>Select Course *</FLabel>
            <select className="fmba-select" value={quizForm.course_id} onChange={e => setQuizForm(f => ({ ...f, course_id: e.target.value }))}>
              <option value="">-- Select a course --</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
            </select>
          </div>
          <div><FLabel>Quiz Title *</FLabel><input className="fmba-input" value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Module 1 Assessment" /></div>
          <div><FLabel>Description</FLabel><textarea className="fmba-textarea" rows={3} value={quizForm.description} onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><FLabel>Time Limit (minutes)</FLabel><input type="number" className="fmba-input" value={quizForm.time_limit_minutes} onChange={e => setQuizForm(f => ({ ...f, time_limit_minutes: e.target.value }))} /></div>
            <div><FLabel>Pass Percentage (%)</FLabel><input type="number" className="fmba-input" value={quizForm.pass_percentage} onChange={e => setQuizForm(f => ({ ...f, pass_percentage: e.target.value }))} /></div>
          </div>
        </div>
        <button className="fmba-btn-primary" onClick={handleCreate} disabled={saving} style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}>{saving ? 'Creating…' : 'Next: Add Questions →'}</button>
      </div>
    </div>
  );

  if (loading) return <Spinner />;

  return (
    <div>
      {ToastEl}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Quiz & Exam Management</h2>
          <p className="fmba-section-sub">{quizzes.length} quizzes</p>
        </div>
        <button className="fmba-btn-primary" onClick={() => setView('create')}><Plus size={13} /> Create Quiz</button>
      </div>
      {quizzes.length === 0
        ? <div className="fmba-card fmba-empty"><FileText size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No quizzes yet.</p><button className="fmba-btn-primary" style={{ marginTop: 14, display: 'inline-flex' }} onClick={() => setView('create')}>Create Your First Quiz</button></div>
        : quizzes.map(quiz => (
          <div key={quiz.id} className="fmba-card" style={{ marginBottom: 10, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{quiz.title}</h3>
                <p style={{ fontSize: 13, color: T.subtle, marginTop: 2 }}>{quiz.Course?.course_name} · {quiz.time_limit_minutes}min · Pass: {quiz.pass_percentage}% · {quiz.question_count} questions</p>
              </div>
              <span className={`fmba-pill ${quiz.is_active ? 'fmba-pill-pass' : 'fmba-pill-gray'}`}>{quiz.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="fmba-btn-green" style={{ fontSize: 13 }} onClick={() => { setSelectedQuiz(quiz); setView('questions'); }}><Plus size={13} /> Add Questions</button>
              <button className="fmba-btn-gold" style={{ fontSize: 13 }} onClick={() => { setSelectedQuiz(quiz); fetchResults(quiz.id); setView('results'); }}><BarChart3 size={13} /> View Results</button>
              <button className="fmba-btn-danger" style={{ fontSize: 13 }} onClick={() => handleDelete(quiz.id)}><Trash2 size={13} /> Delete</button>
            </div>
          </div>
        ))}
    </div>
  );
}

// ─── ATTENDANCE TRACKING ──────────────────────────────────────────────────────
function AttendanceTracking() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/faculty/courses').then(r => { if (r.data.success) setCourses(r.data.courses || []); }).catch(() => {}); }, []);
  useEffect(() => {
    if (!selectedCourse) return;
    setLoading(true);
    api.get(`/faculty/attendance?course=${selectedCourse}&date=${selectedDate}`).then(r => { if (r.data.success) setStudents(r.data.students || []); }).catch(() => {}).finally(() => setLoading(false));
  }, [selectedCourse, selectedDate]);

  const mark = async (id, status) => {
    setStudents(p => p.map(s => s.id === id ? { ...s, status } : s));
    try { await api.post('/faculty/attendance/mark', { studentId: id, status, course: selectedCourse, date: selectedDate }); } catch {}
  };

  const markAll = async () => {
    setStudents(p => p.map(s => ({ ...s, status: 'present' })));
    try { await api.post('/faculty/attendance/mark-all', { status: 'present', course: selectedCourse, date: selectedDate }); } catch {}
  };

  const exportCSV = () => {
    const csv = [['Roll No', 'Name', 'Status', 'Overall'], ...students.map(s => [s.rollNo, s.name, s.status, s.attendance])].map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `attendance-${selectedDate}.csv`; a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 className="fmba-section-title">Attendance Tracking</h2>
        <button className="fmba-btn-ghost" onClick={exportCSV} disabled={students.length === 0}><Download size={13} /> Export CSV</button>
      </div>
      <div className="fmba-card" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px auto', gap: 12, alignItems: 'end' }}>
          <div><FLabel>Select Course</FLabel>
            <select className="fmba-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
              <option value="">Choose course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.course_name}</option>)}
            </select>
          </div>
          <div><FLabel>Date</FLabel><input type="date" className="fmba-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} /></div>
          <button className="fmba-btn-green" onClick={markAll} disabled={!selectedCourse}><CheckCircle size={13} /> Mark All Present</button>
        </div>
      </div>

      {!selectedCourse
        ? <div className="fmba-card fmba-empty"><UserCheck size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>Select a course to view attendance.</p></div>
        : loading ? <Spinner />
        : students.length === 0 ? <div className="fmba-card fmba-empty"><p>No students found.</p></div>
        : <div className="fmba-card" style={{ overflow: 'hidden' }}>
          <table className="fmba-table">
            <thead><tr>{['Roll No', 'Student', 'Overall', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td style={{ color: T.subtle }}>{s.rollNo}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ color: T.muted }}>{s.attendance}</td>
                  <td><span className={`fmba-pill ${s.status === 'present' ? 'fmba-pill-pass' : s.status === 'absent' ? 'fmba-pill-fail' : 'fmba-pill-gold'}`}>{s.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="fmba-btn-green" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => mark(s.id, 'present')}>Present</button>
                      <button className="fmba-btn-danger" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => mark(s.id, 'absent')}>Absent</button>
                      <button className="fmba-btn-gold" style={{ fontSize: 12, padding: '5px 10px' }} onClick={() => mark(s.id, 'late')}>Late</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
    </div>
  );
}

// ─── PERFORMANCE ANALYTICS ────────────────────────────────────────────────────
function PerformanceAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/faculty/analytics').then(r => { if (r.data.success) setData(r.data.analytics || {}); }).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  if (!data) return <div className="fmba-card fmba-empty"><p>Unable to load analytics.</p></div>;

  return (
    <div>
      <h2 className="fmba-section-title" style={{ marginBottom: 20 }}>Performance Analytics</h2>
      <div className="fmba-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Avg Performance',  value: data.avgPerformance != null ? `${data.avgPerformance}%` : '–', accent: 'fmba-metric-green' },
          { label: 'Video Completion', value: data.videoCompletion != null ? `${data.videoCompletion}%` : '–', accent: 'fmba-metric-navy' },
          { label: 'Watch Time',       value: data.watchTime != null ? `${data.watchTime}h` : '–',           accent: 'fmba-metric-gold' },
          { label: 'Engagement',       value: data.engagement != null ? `${data.engagement}%` : '–',         accent: 'fmba-metric-gray' },
        ].map((m, i) => (
          <div key={i} className={`fmba-metric ${m.accent}`}>
            <div className="fmba-metric-label">{m.label}</div>
            <div className="fmba-metric-value">{m.value}</div>
          </div>
        ))}
      </div>
      {data.coursePerformance?.length > 0 && (
        <div className="fmba-card" style={{ marginBottom: 14 }}>
          <div className="fmba-card-head"><span className="fmba-card-title">Course-wise Performance</span></div>
          <div className="fmba-card-body">
            {data.coursePerformance.map((c, i) => (
              <div key={i} style={{ border: `1px solid ${T.border}`, borderRadius: 10, padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{c.course}</span>
                  <span style={{ fontSize: 13, color: T.subtle, fontWeight: 500 }}>{c.students} students</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[{ label: 'Average Score', value: c.avgScore, color: T.navy }, { label: 'Completion Rate', value: c.completion, color: T.green }].map(({ label, value, color }) => (
                    <div key={label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: T.muted, fontWeight: 500 }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}%</span>
                      </div>
                      <div className="fmba-bar-track"><div className="fmba-bar-fill" style={{ width: `${value}%`, background: color }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.videoAnalytics?.length > 0 && (
        <div className="fmba-card" style={{ overflow: 'hidden' }}>
          <div className="fmba-card-head"><span className="fmba-card-title">Video Analytics</span></div>
          <table className="fmba-table">
            <thead><tr>{['Video Title', 'Views', 'Completion', 'Avg Watch Time', 'Drop-off'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {data.videoAnalytics.map((v, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{v.title}</td>
                  <td style={{ color: T.muted }}>{v.views}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 56, height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}><div style={{ height: '100%', width: `${v.completion}%`, background: T.green, borderRadius: 2 }} /></div>
                      <span style={{ fontWeight: 700 }}>{v.completion}%</span>
                    </div>
                  </td>
                  <td style={{ color: T.muted }}>{v.avgWatchTime}</td>
                  <td><span className="fmba-pill fmba-pill-red">{v.dropOffPoint}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
function AnnouncementManagement() {
  const [showCreate, setShowCreate] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', message: '', course: '', priority: 'Medium', scheduleDate: '' });

  useEffect(() => {
    api.get('/faculty/announcements').then(r => { if (r.data.success) setAnnouncements(r.data.announcements || []); }).catch(() => {}).finally(() => setLoading(false));
    api.get('/faculty/courses').then(r => { if (r.data.success) setCourses(r.data.courses || []); }).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.message) return;
    try {
      const r = await api.post('/faculty/announcements', form);
      if (r.data.success) { setAnnouncements([r.data.announcement, ...announcements]); setShowCreate(false); setForm({ title: '', message: '', course: '', priority: 'Medium', scheduleDate: '' }); }
    } catch {}
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/faculty/announcements/${id}`); setAnnouncements(p => p.filter(a => a.id !== id)); } catch {}
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Announcements</h2>
          <p className="fmba-section-sub">{announcements.length} announcements</p>
        </div>
        <button className="fmba-btn-primary" onClick={() => setShowCreate(true)}><Megaphone size={13} /> New Announcement</button>
      </div>

      {announcements.length === 0
        ? <div className="fmba-card fmba-empty"><Megaphone size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No announcements yet.</p></div>
        : announcements.map(a => (
          <div key={a.id} className="fmba-card" style={{ marginBottom: 10, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: T.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Megaphone size={18} style={{ color: T.gold }} /></div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{a.title}</h3>
                  <p style={{ fontSize: 12, color: T.subtle, marginTop: 2 }}>{a.course} · {a.date}</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`fmba-pill ${a.priority === 'High' ? 'fmba-pill-fail' : a.priority === 'Medium' ? 'fmba-pill-gold' : 'fmba-pill-pass'}`}>{a.priority} Priority</span>
                {a.views != null && <span style={{ fontSize: 12, color: T.subtle }}>{a.views} views</span>}
              </div>
            </div>
            <p style={{ fontSize: 13, color: T.muted, marginBottom: 12, lineHeight: 1.6 }}>{a.message}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="fmba-btn-ghost" style={{ fontSize: 13 }}><Edit2 size={13} /> Edit</button>
              <button className="fmba-btn-danger" style={{ fontSize: 13 }} onClick={() => handleDelete(a.id)}><Trash2 size={13} /> Delete</button>
            </div>
          </div>
        ))}

      {showCreate && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>New Announcement</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><FLabel>Title *</FLabel><input className="fmba-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><FLabel>Course</FLabel>
                  <select className="fmba-select" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}>
                    <option value="">All Courses</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                  </select>
                </div>
                <div><FLabel>Priority</FLabel>
                  <select className="fmba-select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
              </div>
              <div><FLabel>Message *</FLabel><textarea className="fmba-textarea" rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="fmba-btn-primary" onClick={handleCreate} style={{ flex: 1, justifyContent: 'center' }}>Post Announcement</button>
              <button className="fmba-btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BATCH MANAGEMENT ─────────────────────────────────────────────────────────
function BatchManagement() {
  const { showToast, ToastEl } = useToast();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selBatch, setSelBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newBatch, setNewBatch] = useState({ name: '', courses: '', schedule: '', startDate: '', endDate: '' });

  useEffect(() => { api.get('/faculty/batches').then(r => { if (r.data.success) setBatches(r.data.batches || []); }).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleCreate = async () => {
    if (!newBatch.name || !newBatch.courses || !newBatch.schedule) { showToast('error', 'Please fill all required fields'); return; }
    try {
      const r = await api.post('/faculty/batches', { ...newBatch, courses: newBatch.courses.split(',').map(c => c.trim()) });
      if (r.data.success) { setBatches([...batches, r.data.batch]); setShowCreate(false); setNewBatch({ name: '', courses: '', schedule: '', startDate: '', endDate: '' }); }
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed to create batch'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/faculty/batches/${id}`); setBatches(p => p.filter(b => b.id !== id)); } catch { showToast('error', 'Delete failed'); }
  };

  const openView = async (b) => {
    setSelBatch(b);
    try { const r = await api.get(`/faculty/batches/${b.id}/students`); if (r.data.success) setBatchStudents(r.data.students || []); } catch { setBatchStudents([]); }
    setShowView(true);
  };

  const filtered = batches.filter(b => {
    const ms = b.name.toLowerCase().includes(search.toLowerCase()) || (b.courses || []).some(c => c.toLowerCase().includes(search.toLowerCase()));
    const mf = filterStatus === 'all' || b.status === filterStatus;
    return ms && mf;
  });

  if (loading) return <Spinner />;

  return (
    <div>
      {ToastEl}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div><h2 className="fmba-section-title">Batch Management</h2><p className="fmba-section-sub">Manage student batches and schedules</p></div>
        <button className="fmba-btn-primary" onClick={() => setShowCreate(true)}><Plus size={13} /> Create Batch</button>
      </div>

      <div className="fmba-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Batches',    value: batches.length,                                                    accent: 'fmba-metric-navy'  },
          { label: 'Active Batches',   value: batches.filter(b => b.status === 'active').length,                 accent: 'fmba-metric-green' },
          { label: 'Total Students',   value: batches.reduce((s, b) => s + (b.students || 0), 0),               accent: 'fmba-metric-gold'  },
          { label: 'Courses Assigned', value: [...new Set(batches.flatMap(b => b.courses || []))].length,        accent: 'fmba-metric-gray'  },
        ].map((m, i) => (
          <div key={i} className={`fmba-metric ${m.accent}`}>
            <div className="fmba-metric-label">{m.label}</div>
            <div className="fmba-metric-value">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="fmba-card" style={{ marginBottom: 16, padding: 14 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
            <input className="fmba-input" style={{ paddingLeft: 30 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search batches…" />
          </div>
          <select className="fmba-select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option><option value="active">Active</option><option value="completed">Completed</option><option value="upcoming">Upcoming</option>
          </select>
          <button className="fmba-btn-ghost" onClick={() => {
            const csv = [['Batch', 'Status', 'Students', 'Courses', 'Schedule'], ...filtered.map(b => [b.name, b.status, b.students || 0, (b.courses || []).join(' | '), b.schedule || ''])].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `batches-${new Date().toISOString().split('T')[0]}.csv`; a.click();
          }}><Download size={13} /> Export</button>
        </div>
      </div>

      <div className="fmba-grid-2">
        {filtered.length === 0
          ? <div className="fmba-card fmba-empty" style={{ gridColumn: 'span 2' }}><Users size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No batches found</p></div>
          : filtered.map(b => (
            <div key={b.id} className="fmba-course-card">
              <div style={{ height: 3, background: b.status === 'active' ? T.green : b.status === 'completed' ? T.blue : T.gold }} />
              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{b.name}</h3>
                  <span className={`fmba-pill ${b.status === 'active' ? 'fmba-pill-pass' : b.status === 'completed' ? 'fmba-pill-navy' : 'fmba-pill-gold'}`}>{b.status}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  {[
                    { icon: Users,    text: `${b.students} Students`               },
                    { icon: BookOpen, text: (b.courses || []).join(', ')            },
                    { icon: Clock,    text: b.schedule                              },
                    { icon: Calendar, text: `${b.startDate} – ${b.endDate}`        },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: T.muted }}>
                      <Icon size={13} /><span>{text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="fmba-btn-primary" onClick={() => openView(b)} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}><Eye size={13} /> View Students</button>
                  <button className="fmba-btn-ghost" style={{ fontSize: 13 }}><Edit2 size={13} /></button>
                  <button className="fmba-btn-danger" style={{ padding: '9px 10px' }} onClick={() => handleDelete(b.id)}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showCreate && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>Create New Batch</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><FLabel>Batch Name *</FLabel><input className="fmba-input" value={newBatch.name} onChange={e => setNewBatch(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Batch 2024-C" /></div>
              <div><FLabel>Courses (comma-separated) *</FLabel><input className="fmba-input" value={newBatch.courses} onChange={e => setNewBatch(f => ({ ...f, courses: e.target.value }))} placeholder="CS101, CS201" /></div>
              <div><FLabel>Schedule *</FLabel><input className="fmba-input" value={newBatch.schedule} onChange={e => setNewBatch(f => ({ ...f, schedule: e.target.value }))} placeholder="Mon-Fri 10 AM" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><FLabel>Start Date</FLabel><input type="date" className="fmba-input" value={newBatch.startDate} onChange={e => setNewBatch(f => ({ ...f, startDate: e.target.value }))} /></div>
                <div><FLabel>End Date</FLabel><input type="date" className="fmba-input" value={newBatch.endDate} onChange={e => setNewBatch(f => ({ ...f, endDate: e.target.value }))} /></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="fmba-btn-primary" onClick={handleCreate} style={{ flex: 1, justifyContent: 'center' }}>Create Batch</button>
              <button className="fmba-btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showView && selBatch && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal fmba-modal-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>{selBatch.name} — Students</h3>
                <p style={{ fontSize: 13, color: T.subtle, marginTop: 2 }}>{batchStudents.length} enrolled</p>
              </div>
              <button onClick={() => setShowView(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            {batchStudents.length === 0
              ? <div className="fmba-empty"><p>No students in this batch.</p></div>
              : <table className="fmba-table">
                <thead><tr>{['#', 'Name', 'Email', 'Phone', 'Enrolled On'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {batchStudents.map((s, i) => (
                    <tr key={s.id}>
                      <td style={{ color: T.subtle }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td style={{ color: T.muted }}>{s.email}</td>
                      <td style={{ color: T.muted }}>{s.phone}</td>
                      <td style={{ color: T.subtle }}>{s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>}
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <button className="fmba-btn-green" style={{ fontSize: 13 }}><Download size={13} /> Export List</button>
              <button className="fmba-btn-primary" style={{ fontSize: 13 }}><UserPlus size={13} /> Add Student</button>
              <button className="fmba-btn-ghost" onClick={() => setShowView(false)} style={{ marginLeft: 'auto' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LIVE CLASS SCHEDULING ────────────────────────────────────────────────────
function LiveClassScheduling() {
  const { showToast, ToastEl } = useToast();
  const [liveClasses, setLiveClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', course: '', date: '', time: '', duration: '', platform: 'Zoom', link: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/faculty/live-classes').then(r => { if (r.data.success) setLiveClasses(r.data.liveClasses || []); }).catch(() => {}).finally(() => setLoading(false));
    api.get('/faculty/courses').then(r => { if (r.data.success) setCourses(r.data.courses || []); }).catch(() => {});
  }, []);

  const handleSchedule = async () => {
    if (!form.title || !form.course || !form.date || !form.time) { showToast('error', 'Please fill all required fields'); return; }
    setSaving(true);
    try {
      const r = await api.post('/faculty/live-classes', form);
      if (r.data.success) { setLiveClasses([r.data.liveClass, ...liveClasses]); setShowModal(false); setForm({ title: '', course: '', date: '', time: '', duration: '', platform: 'Zoom', link: '' }); }
    } catch (e) { showToast('error', e.response?.data?.message || 'Failed to schedule class'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      {ToastEl}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Live Class Scheduling</h2>
          <p className="fmba-section-sub">{liveClasses.length} classes scheduled</p>
        </div>
        <button className="fmba-btn-primary" onClick={() => setShowModal(true)}><MonitorPlay size={13} /> Schedule Live Class</button>
      </div>

      {liveClasses.length === 0
        ? <div className="fmba-card fmba-empty"><MonitorPlay size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No live classes scheduled.</p></div>
        : liveClasses.map(lc => (
          <div key={lc.id} className="fmba-card" style={{ marginBottom: 10, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{lc.title}</h3>
                <p style={{ fontSize: 13, color: T.subtle, marginTop: 2 }}>{lc.course}</p>
              </div>
              <span className="fmba-pill fmba-pill-navy">{lc.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 }}>
              {[
                { icon: Calendar,    text: lc.date                                              },
                { icon: Clock,       text: `${lc.time} (${lc.duration} min)`                   },
                { icon: MonitorPlay, text: lc.platform                                          },
                { icon: ChevronRight,text: 'Join Link', href: lc.link                           },
              ].map(({ icon: Icon, text, href }, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: T.muted }}>
                  <Icon size={13} />
                  {href ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: T.gold, fontWeight: 600, textDecoration: 'none' }}>{text}</a> : <span>{text}</span>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="fmba-btn-green" style={{ fontSize: 13 }}>Start Class</button>
              <button className="fmba-btn-ghost" style={{ fontSize: 13 }}><Edit2 size={13} /> Edit</button>
            </div>
          </div>
        ))}

      {showModal && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>Schedule Live Class</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><FLabel>Class Title *</FLabel><input className="fmba-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><FLabel>Course *</FLabel>
                <select className="fmba-select" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))}>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.course_name}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><FLabel>Date *</FLabel><input type="date" className="fmba-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div><FLabel>Time *</FLabel><input type="time" className="fmba-input" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></div>
                <div><FLabel>Duration (minutes)</FLabel><input type="number" className="fmba-input" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="60" /></div>
                <div><FLabel>Platform</FLabel>
                  <select className="fmba-select" value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                    <option>Zoom</option><option>Google Meet</option><option>Microsoft Teams</option><option>Jitsi</option>
                  </select>
                </div>
              </div>
              <div><FLabel>Meeting Link</FLabel><input type="url" className="fmba-input" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://zoom.us/j/…" /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="fmba-btn-primary" onClick={handleSchedule} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Scheduling…' : 'Schedule Class'}</button>
              <button className="fmba-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STUDENT MANAGEMENT ───────────────────────────────────────────────────────
function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selected, setSelected] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => { api.get('/faculty/students').then(r => { if (r.data.success) setStudents(r.data.students || []); }).catch(() => {}).finally(() => setLoading(false)); }, []);

  const filtered = students.filter(s => {
    const ms = (s.full_name ?? '').toLowerCase().includes(search.toLowerCase()) || (s.email ?? '').toLowerCase().includes(search.toLowerCase());
    const mc = filterCourse === 'all' || (s.course ?? '') === filterCourse;
    return ms && mc;
  });

  const courses = [...new Set(students.map(s => s.course).filter(Boolean))];
  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Student Management</h2>
          <p className="fmba-section-sub">{filtered.length} students</p>
        </div>
        <button className="fmba-btn-green"><Download size={13} /> Export Data</button>
      </div>

      <div className="fmba-grid-4" style={{ marginBottom: 16 }}>
        {[
          { label: 'Total Students', value: students.length, accent: 'fmba-metric-navy' },
          { label: 'Active (7d)',     value: students.filter(s => new Date(s.last_active) > new Date(Date.now() - 7 * 86400000)).length, accent: 'fmba-metric-green' },
          { label: 'Avg Progress',   value: `${students.length > 0 ? Math.round(students.reduce((a, s) => a + (s.progress || 0), 0) / students.length) : 0}%`, accent: 'fmba-metric-gold' },
          { label: 'Avg Quiz Score', value: `${students.length > 0 ? Math.round(students.reduce((a, s) => a + (s.quiz_average || 0), 0) / students.length) : 0}%`, accent: 'fmba-metric-gray' },
        ].map((m, i) => (
          <div key={i} className={`fmba-metric ${m.accent}`}>
            <div className="fmba-metric-label">{m.label}</div>
            <div className="fmba-metric-value">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="fmba-card" style={{ marginBottom: 16, padding: 14 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
            <input className="fmba-input" style={{ paddingLeft: 30 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…" />
          </div>
          <select className="fmba-select" style={{ width: 200 }} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
            <option value="all">All Courses</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0
        ? <div className="fmba-card fmba-empty"><Users size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No students found.</p></div>
        : <div className="fmba-card" style={{ overflow: 'hidden' }}>
          <table className="fmba-table">
            <thead><tr>{['Student', 'Course', 'Progress', 'Assignments', 'Quiz Avg', 'Last Active', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: T.navy, fontSize: 13, flexShrink: 0 }}>{(s.full_name || 'S').charAt(0)}</div>
                      <div>
                        <p style={{ fontWeight: 600 }}>{s.full_name}</p>
                        <p style={{ fontSize: 12, color: T.subtle }}>{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: T.muted }}>{s.course}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 56, height: 4, background: T.border, borderRadius: 2, overflow: 'hidden' }}><div style={{ height: '100%', width: `${s.progress || 0}%`, background: T.navy, borderRadius: 2 }} /></div>
                      <span style={{ fontWeight: 700 }}>{s.progress || 0}%</span>
                    </div>
                  </td>
                  <td style={{ color: T.muted }}>{s.assignments_completed}/{s.total_assignments}</td>
                  <td><span className={`fmba-pill ${s.quiz_average >= 80 ? 'fmba-pill-pass' : s.quiz_average >= 60 ? 'fmba-pill-gold' : 'fmba-pill-fail'}`}>{s.quiz_average}%</span></td>
                  <td style={{ color: T.subtle }}>{new Date(s.last_active).toLocaleDateString()}</td>
                  <td><button className="fmba-btn-ghost" style={{ fontSize: 13 }} onClick={() => { setSelected(s); setShowDetails(true); }}><Eye size={13} /> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}

      {showDetails && selected && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>Student Details</h3>
              <button onClick={() => setShowDetails(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: `1px solid ${T.border}`, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: T.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: T.navy, fontSize: 20 }}>{(selected.full_name || 'S').charAt(0)}</div>
              <div>
                <h4 style={{ fontSize: 17, fontWeight: 800, color: T.navy }}>{selected.full_name}</h4>
                <p style={{ fontSize: 13, color: T.muted }}>{selected.email}</p>
                <p style={{ fontSize: 13, color: T.muted }}>{selected.phone}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: T.bg, padding: '11px 14px', borderRadius: 8 }}><p style={{ fontSize: 11, color: T.subtle, marginBottom: 2 }}>Course</p><p style={{ fontSize: 14, fontWeight: 600 }}>{selected.course}</p></div>
              <div style={{ background: T.bg, padding: '11px 14px', borderRadius: 8 }}><p style={{ fontSize: 11, color: T.subtle, marginBottom: 2 }}>Enrolled</p><p style={{ fontSize: 14, fontWeight: 600 }}>{new Date(selected.enrollment_date).toLocaleDateString()}</p></div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 13, color: T.muted, fontWeight: 500 }}>Overall Progress</span><span style={{ fontSize: 13, fontWeight: 700 }}>{selected.progress}%</span></div>
              <div className="fmba-bar-track" style={{ height: 6 }}><div className="fmba-bar-fill" style={{ width: `${selected.progress}%`, background: T.navy }} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div style={{ background: T.bg, padding: '11px 14px', borderRadius: 8 }}><p style={{ fontSize: 11, color: T.subtle, marginBottom: 2 }}>Assignments</p><p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: T.navy }}>{selected.assignments_completed}/{selected.total_assignments}</p></div>
              <div style={{ background: T.bg, padding: '11px 14px', borderRadius: 8 }}><p style={{ fontSize: 11, color: T.subtle, marginBottom: 2 }}>Quiz Average</p><p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: T.navy }}>{selected.quiz_average}%</p></div>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
              <button className="fmba-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Send Message</button>
              <button className="fmba-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Full Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DOUBT CLEARING ───────────────────────────────────────────────────────────
function DoubtClearing() {
  const { showToast, ToastEl } = useToast();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selDoubt, setSelDoubt] = useState(null);
  const [showReply, setShowReply] = useState(false);
  const [reply, setReply] = useState('');

  useEffect(() => { api.get('/faculty/doubts').then(r => { if (r.data.success) setDoubts(r.data.doubts || []); }).catch(() => {}).finally(() => setLoading(false)); }, []);

  const handleReply = async () => {
    if (!reply.trim()) { showToast('error', 'Please write a reply first'); return; }
    try {
      await api.post(`/faculty/doubts/${selDoubt.id}/reply`, { reply });
      setDoubts(p => p.map(d => d.id === selDoubt.id ? { ...d, status: 'resolved', reply, replied_at: new Date().toISOString() } : d));
      setShowReply(false); setReply('');
    } catch { showToast('error', 'Error sending reply'); }
  };

  const filtered = doubts.filter(d => filter === 'all' || d.status === filter);
  if (loading) return <Spinner />;

  return (
    <div>
      {ToastEl}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Doubt Clearing</h2>
          <p className="fmba-section-sub">{doubts.filter(d => d.status === 'pending').length} pending queries</p>
        </div>
        <div className="fmba-tabs">
          {['all', 'pending', 'resolved'].map(f => (
            <button key={f} className={`fmba-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="fmba-grid-3" style={{ marginBottom: 20 }}>
        {[
          { label: 'Pending',       value: doubts.filter(d => d.status === 'pending').length,  accent: 'fmba-metric-gold'  },
          { label: 'Resolved',      value: doubts.filter(d => d.status === 'resolved').length, accent: 'fmba-metric-green' },
          { label: 'Total Queries', value: doubts.length,                                       accent: 'fmba-metric-navy'  },
        ].map((m, i) => (
          <div key={i} className={`fmba-metric ${m.accent}`}>
            <div className="fmba-metric-label">{m.label}</div>
            <div className="fmba-metric-value">{m.value}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0
        ? <div className="fmba-card fmba-empty"><MessageSquare size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No {filter} doubts</p></div>
        : filtered.map(d => (
          <div key={d.id} className="fmba-card" style={{ marginBottom: 10, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{d.subject}</h3>
                  <span className={`fmba-pill ${d.priority === 'high' ? 'fmba-pill-red' : d.priority === 'medium' ? 'fmba-pill-gold' : 'fmba-pill-pass'}`}>{d.priority}</span>
                  <span className={`fmba-pill ${d.status === 'resolved' ? 'fmba-pill-pass' : 'fmba-pill-gold'}`}>{d.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: T.subtle, marginBottom: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><User size={12} />{d.student_name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><BookOpen size={12} />{d.course}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={12} />{new Date(d.created_at).toLocaleString()}</span>
                </div>
                <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{d.question}</p>
                {d.status === 'resolved' && d.reply && (
                  <div style={{ background: T.greenSoft, borderLeft: `3px solid ${T.green}`, padding: '9px 13px', borderRadius: '0 4px 4px 0', marginTop: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: T.green, marginBottom: 3 }}>Your Reply</p>
                    <p style={{ fontSize: 13 }}>{d.reply}</p>
                  </div>
                )}
              </div>
            </div>
            {d.status === 'pending' && (
              <button className="fmba-btn-primary" style={{ fontSize: 13 }} onClick={() => { setSelDoubt(d); setShowReply(true); }}><MessageSquare size={13} /> Reply to Doubt</button>
            )}
          </div>
        ))}

      {showReply && selDoubt && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal fmba-modal-lg">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>Reply to Doubt</h3>
              <button onClick={() => setShowReply(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <div style={{ background: T.bg, borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>{selDoubt.subject}</h4>
              <p style={{ fontSize: 12, color: T.subtle, marginBottom: 6 }}>By {selDoubt.student_name} · {selDoubt.course}</p>
              <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{selDoubt.question}</p>
            </div>
            <FLabel>Your Reply</FLabel>
            <textarea className="fmba-textarea" rows={6} value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your detailed explanation here…" style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="fmba-btn-primary" onClick={handleReply} style={{ flex: 1, justifyContent: 'center' }}><Send size={13} /> Send Reply</button>
              <button className="fmba-btn-ghost" onClick={() => setShowReply(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DISCUSSION FORUM ─────────────────────────────────────────────────────────
function DiscussionForum() {
  const { user } = useAuth();
  const { showToast, ToastEl } = useToast();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [selThread, setSelThread] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [courses, setCourses] = useState([]);
  const [newThread, setNewThread] = useState({ title: '', content: '', course: 'General' });
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadThreads = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try { const r = await api.get('/forum/threads'); if (r.data.success) setThreads(r.data.threads || []); } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    const load = async () => {
      await loadThreads();
      try { const r = await api.get('/faculty/courses'); setCourses([{ id: 'general', course_name: 'General' }, ...(r.data.courses || [])]); }
      catch { setCourses([{ id: 'general', course_name: 'General' }]); }
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setPosting(true);
    try {
      const r = await api.post('/forum/threads', newThread);
      if (r.data.success) { setThreads([r.data.thread, ...threads]); setShowNew(false); setNewThread({ title: '', content: '', course: 'General' }); }
    } catch { showToast('error', 'Error creating thread'); } finally { setPosting(false); }
  };

  const openThread = async (t) => {
    try { const r = await api.get(`/forum/threads/${t.id}`); setSelThread(r.data.thread || r.data); } catch { setSelThread(t); }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      await api.post(`/forum/threads/${selThread.id}/replies`, { content: replyContent });
      setReplyContent('');
      const r = await api.get(`/forum/threads/${selThread.id}`);
      setSelThread(r.data.thread || r.data);
      setThreads(prev => prev.map(t => t.id === selThread.id ? { ...t, replyCount: (t.replyCount || 0) + 1 } : t));
    } catch { showToast('error', 'Error posting reply'); } finally { setSubmittingReply(false); }
  };

  const handleMark = async (replyId) => {
    try {
      await api.patch(`/forum/replies/${replyId}/mark-answer`);
      const r = await api.get(`/forum/threads/${selThread.id}`);
      setSelThread(r.data.thread || r.data);
      setThreads(prev => prev.map(t => t.id === selThread.id ? { ...t, hasAnswer: true, has_answer: true } : t));
    } catch { showToast('error', 'Error marking answer'); }
  };

  if (loading) return <Spinner />;

  if (selThread) {
    const replies = selThread.replies || [];
    const isAnswered = selThread.has_answer || selThread.hasAnswer;
    const postedDate = selThread.created_at || selThread.created;
    return (
      <div style={{ maxWidth: 760 }}>
        {ToastEl}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button className="fmba-btn-ghost" onClick={() => setSelThread(null)}>
            <ChevronRight size={13} style={{ transform: 'rotate(180deg)' }} /> Back to Forum
          </button>
          <button className="fmba-btn-ghost" onClick={async () => { const r = await api.get(`/forum/threads/${selThread.id}`); setSelThread(r.data.thread || r.data); }} style={{ fontSize: 12 }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        <div className="fmba-card" style={{ marginBottom: 14, padding: 22 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>{selThread.type === 'doubt' ? '❓' : '💬'}</span>
            {selThread.course && <span className="fmba-pill fmba-pill-navy">{selThread.course}</span>}
            {selThread.topic && <span className="fmba-pill fmba-pill-gold" style={{ fontSize: 11 }}>{selThread.topic}</span>}
            <span className="fmba-pill" style={{ fontSize: 11, background: selThread.type === 'doubt' ? '#fdf1f0' : T.blueSoft, color: selThread.type === 'doubt' ? T.red : T.navy }}>{selThread.type === 'doubt' ? 'Doubt / Question' : 'Discussion'}</span>
            {isAnswered && <span className="fmba-pill fmba-pill-pass" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><CheckCircle size={10} /> Answered</span>}
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: T.navy, marginBottom: 10 }}>{selThread.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '10px 14px', background: T.bg, borderRadius: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
              {(selThread.author_name || selThread.author || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{selThread.author_name || selThread.author}</span>
                <span className="fmba-pill" style={{ fontSize: 10, background: T.blueSoft, color: T.navy }}>STUDENT</span>
              </div>
              <span style={{ fontSize: 11, color: T.subtle }}>{postedDate ? new Date(postedDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${T.border}`, borderRadius: 8, padding: '14px 16px', fontSize: 14, color: T.text, lineHeight: 1.75 }}>{selThread.content}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h3>
          {!isAnswered && selThread.type === 'doubt' && <span style={{ fontSize: 12, color: T.gold, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> Waiting for answer</span>}
        </div>
        {replies.length === 0
          ? <div className="fmba-card" style={{ padding: 20, textAlign: 'center', marginBottom: 14 }}><MessageSquare size={28} style={{ color: T.border, display: 'block', margin: '0 auto 8px' }} /><p style={{ fontSize: 13, color: T.subtle }}>No replies yet</p></div>
          : replies.map((r, i) => {
            const isFaculty = r.role === 'faculty' || r.author_role === 'faculty' || r.is_faculty;
            const isAnswer = r.is_answer;
            const replyDate = r.created_at || r.created;
            return (
              <div key={r.id || i} style={{ border: `1px solid ${isAnswer ? T.green : isFaculty ? T.gold : T.border}`, borderLeft: `3px solid ${isAnswer ? T.green : isFaculty ? T.gold : T.border}`, borderRadius: 10, padding: 18, marginBottom: 10, background: isAnswer ? T.greenSoft : isFaculty ? '#fffdf4' : '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: isFaculty ? T.gold : T.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                      {(r.author_name || r.author || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{r.author_name || r.author}</span>
                        <span className="fmba-pill" style={{ fontSize: 10, background: isFaculty ? T.gold : T.blueSoft, color: isFaculty ? '#fff' : T.navy }}>{isFaculty ? 'FACULTY' : 'STUDENT'}</span>
                        {isAnswer && <span className="fmba-pill fmba-pill-pass" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 3 }}><CheckCircle size={9} /> Best Answer</span>}
                      </div>
                      <span style={{ fontSize: 11, color: T.subtle }}>{replyDate ? new Date(replyDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  </div>
                  {!isAnswer && <button className="fmba-btn-ghost" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => handleMark(r.id)}><CheckCircle size={11} /> Mark Best Answer</button>}
                </div>
                <p style={{ fontSize: 13, color: T.text, lineHeight: 1.65 }}>{r.content}</p>
              </div>
            );
          })}
        <div className="fmba-card" style={{ marginTop: 14, padding: 20, borderLeft: `3px solid ${T.gold}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>{(user?.full_name || 'F').charAt(0)}</div>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Reply as Faculty <span className="fmba-pill" style={{ fontSize: 10, background: T.gold, color: '#fff', marginLeft: 6 }}>FACULTY</span></p>
          </div>
          <textarea className="fmba-textarea" rows={4} value={replyContent} onChange={e => setReplyContent(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); handleReply(); } }} placeholder="Write your reply… (Ctrl+Enter to submit)" style={{ marginBottom: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: T.subtle }}>{replyContent.length} characters</span>
            <button className="fmba-btn-primary" onClick={handleReply} disabled={submittingReply || !replyContent.trim()}><Send size={13} /> {submittingReply ? 'Posting…' : 'Post Reply'}</button>
          </div>
        </div>
      </div>
    );
  }

  const pendingDoubts = threads.filter(t => t.type === 'doubt' && !t.hasAnswer && !t.has_answer).length;
  const filtered = threads.filter(t => (filterType === 'all' || t.type === filterType) && (!filterCourse || t.course === filterCourse));

  return (
    <div>
      {ToastEl}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div><h2 className="fmba-section-title">Discussion Forum</h2><p className="fmba-section-sub">{threads.length} posts total</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="fmba-btn-ghost" onClick={() => loadThreads(true)} disabled={refreshing} style={{ fontSize: 12 }}>
            <RefreshCw size={12} style={{ animation: refreshing ? 'fmba-spin .7s linear infinite' : 'none' }} /> {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button className="fmba-btn-primary" onClick={() => setShowNew(true)}><Plus size={13} /> New Post</button>
        </div>
      </div>
      {pendingDoubts > 0 && (
        <div style={{ background: '#fdf8ed', border: '1px solid #e8d89a', borderLeft: `3px solid ${T.gold}`, borderRadius: 10, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <AlertCircle size={15} style={{ color: T.gold, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: '#5a4500' }}><strong>{pendingDoubts} student doubt{pendingDoubts > 1 ? 's' : ''}</strong> waiting for your reply</p>
          <button onClick={() => setFilterType('doubt')} style={{ marginLeft: 'auto', background: T.gold, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>View Doubts</button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="fmba-tabs">
          {[['all', 'All Posts'], ['discussion', '💬 Discussions'], ['doubt', '❓ Doubts']].map(([v, l]) => (
            <button key={v} className={`fmba-tab ${filterType === v ? 'active' : ''}`} onClick={() => setFilterType(v)}>{l}</button>
          ))}
        </div>
        <select className="fmba-select" style={{ width: 'auto', fontSize: 13, padding: '7px 12px' }} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map(c => <option key={c.id} value={c.course_name}>{c.course_name}</option>)}
        </select>
      </div>
      {filtered.length === 0
        ? <div className="fmba-card fmba-empty"><MessageSquare size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No {filterType !== 'all' ? filterType + 's' : 'posts'} yet</p></div>
        : filtered.map(t => {
          const isUnansweredDoubt = t.type === 'doubt' && !t.hasAnswer && !t.has_answer;
          const replyCount = t.replyCount || t.replies || 0;
          const postedDate = t.created_at || t.created;
          return (
            <div key={t.id} className="fmba-thread-row" onClick={() => openThread(t)} style={{ borderLeft: isUnansweredDoubt ? `3px solid ${T.gold}` : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 15 }}>{t.type === 'doubt' ? '❓' : '💬'}</span>
                    {t.course && <span className="fmba-pill fmba-pill-navy" style={{ fontSize: 11 }}>{t.course}</span>}
                    {(t.hasAnswer || t.has_answer) && <span className="fmba-pill fmba-pill-pass" style={{ fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 2 }}><CheckCircle size={9} /> Answered</span>}
                    {isUnansweredDoubt && <span className="fmba-pill" style={{ fontSize: 10, background: '#fdf8ed', color: T.gold }}>⏳ Awaiting Reply</span>}
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>{t.title}</h3>
                  <p style={{ fontSize: 12, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{t.content}</p>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: T.subtle }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><User size={11} /><strong style={{ color: T.navy }}>{t.author_name || t.author}</strong><span className="fmba-pill" style={{ fontSize: 9, background: T.blueSoft, color: T.navy, padding: '1px 5px' }}>STUDENT</span></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageCircle size={11} /> {replyCount} repl{replyCount === 1 ? 'y' : 'ies'}</span>
                    {postedDate && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {new Date(postedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: T.subtle, flexShrink: 0, marginLeft: 10, marginTop: 4 }} />
              </div>
            </div>
          );
        })}
      {showNew && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>Create New Post</h3>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><FLabel>Course</FLabel>
                <select className="fmba-select" value={newThread.course} onChange={e => setNewThread(f => ({ ...f, course: e.target.value }))}>
                  {courses.map(c => <option key={c.id} value={c.course_name}>{c.course_name}</option>)}
                </select>
              </div>
              <div><FLabel>Title *</FLabel><input className="fmba-input" value={newThread.title} onChange={e => setNewThread(f => ({ ...f, title: e.target.value }))} placeholder="Topic or announcement…" required /></div>
              <div><FLabel>Content *</FLabel><textarea className="fmba-textarea" rows={5} value={newThread.content} onChange={e => setNewThread(f => ({ ...f, content: e.target.value }))} placeholder="Write your post here…" required /></div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="fmba-btn-primary" disabled={posting || !newThread.title || !newThread.content} style={{ flex: 1, justifyContent: 'center' }}>{posting ? 'Posting…' : <><Send size={13} /> Post</>}</button>
                <button type="button" className="fmba-btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SYSTEM SETTINGS ──────────────────────────────────────────────────────────
function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [generalSettings, setGeneralSettings] = useState({ institution_name: '', academic_year: '', semester: '', default_language: 'en', timezone: 'Asia/Kolkata', date_format: 'DD/MM/YYYY', time_format: '24h' });
  const [notifSettings, setNotifSettings] = useState({ email_notifications: false, student_query_alerts: false, assignment_submission_alerts: false, exam_reminders: false, course_updates: false, system_announcements: false, daily_digest: false, weekly_report: false });
  const [courseSettings, setCourseSettings] = useState({ auto_enroll: false, allow_late_submissions: false, late_penalty_percentage: 0, max_late_days: 0, default_passing_grade: 40, attendance_required: 75, enable_discussion_forum: false, enable_peer_review: false });
  const [securitySettings, setSecuritySettings] = useState({ two_factor_auth: false, session_timeout: 30, password_expiry_days: 90, force_password_change: false, allow_multiple_sessions: true, login_attempt_limit: 5 });
  const [integrations, setIntegrations] = useState({ google_classroom: false, microsoft_teams: false, zoom_enabled: false, zoom_api_key: '', email_service: 'smtp', storage_provider: 'local', max_upload_size: 100 });

  useEffect(() => {
    api.get('/faculty/settings').then(r => {
      if (r.data.success) { const s = r.data.settings; if (s.general) setGeneralSettings(s.general); if (s.notifications) setNotifSettings(s.notifications); if (s.course) setCourseSettings(s.course); if (s.security) setSecuritySettings(s.security); if (s.integrations) setIntegrations(s.integrations); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const showMsg = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); };
  const handleSave = async (endpoint, data) => {
    setSaving(true);
    try { await api.put(`/faculty/settings/${endpoint}`, data); showMsg('success', 'Settings updated!'); }
    catch { showMsg('error', 'Error updating settings'); } finally { setSaving(false); }
  };

  const ToggleRow = ({ checked, onChange, label, desc }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid ${T.border}` }}>
      <div><div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{label}</div><div style={{ fontSize: 12, color: T.subtle }}>{desc}</div></div>
      <div className={`fmba-toggle-track ${checked ? 'on' : ''}`} onClick={onChange}><div className="fmba-toggle-thumb" /></div>
    </div>
  );

  const tabs = [
    { id: 'general',       label: 'General',       icon: Settings  },
    { id: 'notifications', label: 'Notifications', icon: Bell      },
    { id: 'course',        label: 'Course',         icon: BookOpen  },
    { id: 'security',      label: 'Security',       icon: Shield    },
    { id: 'integrations',  label: 'Integrations',   icon: Zap       },
  ];

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">System Settings</h2>
          <p className="fmba-section-sub">Manage security, notifications, and preferences</p>
        </div>
        <Settings size={28} style={{ color: T.subtle }} />
      </div>

      {message.text && (
        <div className={message.type === 'success' ? 'fmba-alert-success' : 'fmba-alert-error'} style={{ marginBottom: 14 }}>
          {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {message.text}
        </div>
      )}

      <div className="fmba-card">
        <div className="fmba-profile-tabs">
          {tabs.map(t => { const Icon = t.icon; return <button key={t.id} className={`fmba-profile-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}><Icon size={13} />{t.label}</button>; })}
        </div>
        <div style={{ padding: 24, maxWidth: 560 }}>
          {activeTab === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><FLabel>Institution Name</FLabel><input className="fmba-input" value={generalSettings.institution_name} onChange={e => setGeneralSettings(g => ({ ...g, institution_name: e.target.value }))} /></div>
                <div><FLabel>Academic Year</FLabel><input className="fmba-input" value={generalSettings.academic_year} onChange={e => setGeneralSettings(g => ({ ...g, academic_year: e.target.value }))} /></div>
                <div><FLabel>Semester</FLabel>
                  <select className="fmba-select" value={generalSettings.semester} onChange={e => setGeneralSettings(g => ({ ...g, semester: e.target.value }))}>
                    <option>Spring 2025</option><option>Fall 2024</option><option>Summer 2025</option>
                  </select>
                </div>
                <div><FLabel>Language</FLabel>
                  <select className="fmba-select" value={generalSettings.default_language} onChange={e => setGeneralSettings(g => ({ ...g, default_language: e.target.value }))}>
                    <option value="en">English</option><option value="hi">Hindi</option><option value="es">Spanish</option>
                  </select>
                </div>
                <div><FLabel>Timezone</FLabel>
                  <select className="fmba-select" value={generalSettings.timezone} onChange={e => setGeneralSettings(g => ({ ...g, timezone: e.target.value }))}>
                    <option value="Asia/Kolkata">IST (Asia/Kolkata)</option><option value="America/New_York">EST</option><option value="Europe/London">GMT</option>
                  </select>
                </div>
                <div><FLabel>Date Format</FLabel>
                  <select className="fmba-select" value={generalSettings.date_format} onChange={e => setGeneralSettings(g => ({ ...g, date_format: e.target.value }))}>
                    <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              <button className="fmba-btn-primary" onClick={() => handleSave('general', generalSettings)} disabled={saving}>{saving ? 'Saving…' : 'Save General Settings'}</button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              {[
                ['email_notifications',             'Email Notifications',     'Receive updates via email'              ],
                ['student_query_alerts',            'Student Query Alerts',    'Get notified when students ask questions'],
                ['assignment_submission_alerts',    'Assignment Submissions',  'Alerts for new submissions'             ],
                ['exam_reminders',                  'Exam Reminders',          'Reminders for upcoming exams'           ],
                ['course_updates',                  'Course Updates',          'Notifications about course changes'     ],
                ['system_announcements',            'System Announcements',    'Important system notifications'         ],
                ['daily_digest',                    'Daily Digest',            'Daily summary of activities'            ],
                ['weekly_report',                   'Weekly Report',           'Weekly performance reports'             ],
              ].map(([k, l, d]) => (
                <ToggleRow key={k} checked={notifSettings[k]} label={l} desc={d} onChange={() => setNotifSettings(n => ({ ...n, [k]: !n[k] }))} />
              ))}
              <button className="fmba-btn-primary" style={{ marginTop: 16 }} onClick={() => handleSave('notifications', notifSettings)} disabled={saving}>{saving ? 'Saving…' : 'Save Notification Settings'}</button>
            </div>
          )}

          {activeTab === 'course' && (
            <div>
              {[
                ['auto_enroll',             'Auto Enrollment',   'Automatically enroll students'              ],
                ['allow_late_submissions',  'Late Submissions',  'Enable late assignment submissions'         ],
                ['enable_discussion_forum', 'Discussion Forum',  'Enable course discussion boards'            ],
                ['enable_peer_review',      'Peer Review',       "Allow students to review each other's work" ],
              ].map(([k, l, d]) => (
                <ToggleRow key={k} checked={courseSettings[k]} label={l} desc={d} onChange={() => setCourseSettings(c => ({ ...c, [k]: !c[k] }))} />
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                {[
                  ['Late Penalty (%)',       'late_penalty_percentage'],
                  ['Max Late Days',          'max_late_days'          ],
                  ['Default Passing (%)',    'default_passing_grade'  ],
                  ['Required Attendance (%)', 'attendance_required'   ],
                ].map(([l, k]) => (
                  <div key={k}><FLabel>{l}</FLabel><input type="number" className="fmba-input" value={courseSettings[k]} onChange={e => setCourseSettings(c => ({ ...c, [k]: e.target.value }))} /></div>
                ))}
              </div>
              <button className="fmba-btn-primary" style={{ marginTop: 16 }} onClick={() => handleSave('course', courseSettings)} disabled={saving}>{saving ? 'Saving…' : 'Save Course Settings'}</button>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              {[
                ['two_factor_auth',        'Two-Factor Authentication', 'Require 2FA for all users'              ],
                ['force_password_change',  'Force Password Change',     'Require change on first login'          ],
                ['allow_multiple_sessions','Multiple Sessions',          'Allow login from multiple devices'      ],
              ].map(([k, l, d]) => (
                <ToggleRow key={k} checked={securitySettings[k]} label={l} desc={d} onChange={() => setSecuritySettings(s => ({ ...s, [k]: !s[k] }))} />
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                {[
                  ['Session Timeout (min)',   'session_timeout'      ],
                  ['Password Expiry (days)',  'password_expiry_days' ],
                  ['Login Attempt Limit',     'login_attempt_limit'  ],
                ].map(([l, k]) => (
                  <div key={k}><FLabel>{l}</FLabel><input type="number" className="fmba-input" value={securitySettings[k]} onChange={e => setSecuritySettings(s => ({ ...s, [k]: e.target.value }))} /></div>
                ))}
              </div>
              <button className="fmba-btn-primary" style={{ marginTop: 16 }} onClick={() => handleSave('security', securitySettings)} disabled={saving}>{saving ? 'Saving…' : 'Save Security Settings'}</button>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              {[
                ['google_classroom', 'Google Classroom', 'Sync with Google Classroom'],
                ['microsoft_teams',  'Microsoft Teams',  'Enable Teams integration'  ],
                ['zoom_enabled',     'Zoom Meetings',    'Enable Zoom for live classes'],
              ].map(([k, l, d]) => (
                <ToggleRow key={k} checked={integrations[k]} label={l} desc={d} onChange={() => setIntegrations(i => ({ ...i, [k]: !i[k] }))} />
              ))}
              {integrations.zoom_enabled && (
                <div style={{ marginTop: 14 }}><FLabel>Zoom API Key</FLabel><input className="fmba-input" value={integrations.zoom_api_key} onChange={e => setIntegrations(i => ({ ...i, zoom_api_key: e.target.value }))} placeholder="Enter Zoom API Key" /></div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                <div><FLabel>Email Service</FLabel>
                  <select className="fmba-select" value={integrations.email_service} onChange={e => setIntegrations(i => ({ ...i, email_service: e.target.value }))}>
                    <option value="smtp">SMTP</option><option value="sendgrid">SendGrid</option><option value="mailgun">Mailgun</option>
                  </select>
                </div>
                <div><FLabel>Storage Provider</FLabel>
                  <select className="fmba-select" value={integrations.storage_provider} onChange={e => setIntegrations(i => ({ ...i, storage_provider: e.target.value }))}>
                    <option value="local">Local Storage</option><option value="aws_s3">AWS S3</option><option value="google_cloud">Google Cloud</option>
                  </select>
                </div>
                <div><FLabel>Max Upload Size (MB)</FLabel><input type="number" className="fmba-input" value={integrations.max_upload_size} onChange={e => setIntegrations(i => ({ ...i, max_upload_size: e.target.value }))} /></div>
              </div>
              <button className="fmba-btn-primary" style={{ marginTop: 16 }} onClick={() => handleSave('integrations', integrations)} disabled={saving}>{saving ? 'Saving…' : 'Save Integration Settings'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── FACULTY PROFILE (EXTENDED) ───────────────────────────────────────────────
function FacultyProfile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo || null);
  // Keep preview in sync if profile_photo changes in context (e.g. from another tab)
  useEffect(() => { if (user?.profile_photo) setPhotoPreview(user.profile_photo); }, [user?.profile_photo]);

  const [personal, setPersonal] = useState({
    full_name: user?.full_name || '', email: user?.email || '', phone: user?.phone || '',
    dob: user?.dob || '', gender: user?.gender || '', nationality: user?.nationality || '',
    address: user?.address || '', city: user?.city || '', state: user?.state || '',
    pincode: user?.pincode || '', linkedin: user?.linkedin || '', website: user?.website || '',
  });
  const [professional, setProfessional] = useState({
    designation: user?.designation || '', department: user?.department || '',
    qualification: user?.qualification || '', specialization: user?.specialization || '',
    experience_years: user?.experience_years || '', joining_date: user?.joining_date || '',
    employee_id: user?.employee_id || '', bio: user?.bio || '',
    certifications: user?.certifications || '', research_areas: user?.research_areas || '',
  });
  const [bank, setBank] = useState({
    account_holder: user?.bank?.account_holder || '',
    account_number: user?.bank?.account_number || '',
    confirm_account: '',
    bank_name: user?.bank?.bank_name || '',
    ifsc_code: user?.bank?.ifsc_code || '',
    branch: user?.bank?.branch || '',
    account_type: user?.bank?.account_type || 'savings',
    pan_number: user?.bank?.pan_number || '',
    upi_id: user?.bank?.upi_id || '',
  });
  const [passwords, setPasswords] = useState({ current: '', new_pass: '', confirm: '' });

  const showMsg = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 3000); };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showMsg('error', 'Photo must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    setPhotoUploading(true);
    try {
      const fd = new FormData(); fd.append('photo', file);
      const r = await api.post('/faculty/profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (r.data.success) {
        showMsg('success', 'Photo updated!');
        if (updateUser) updateUser({ profile_photo: r.data.photo_url });
        // Broadcast to the whole dashboard (sidebar + topbar update instantly)
        window.dispatchEvent(new CustomEvent('facultyPhotoUpdated', { detail: { url: r.data.photo_url } }));
      }
    } catch { showMsg('error', 'Photo upload failed'); } finally { setPhotoUploading(false); }
  };

  const savePersonal = async () => {
    setSaving(true);
    try { const r = await api.put('/faculty/profile/personal', personal); if (r.data.success) showMsg('success', 'Personal details saved!'); }
    catch { showMsg('error', 'Save failed'); } finally { setSaving(false); }
  };

  const saveProfessional = async () => {
    setSaving(true);
    try { const r = await api.put('/faculty/profile/professional', professional); if (r.data.success) showMsg('success', 'Professional details saved!'); }
    catch { showMsg('error', 'Save failed'); } finally { setSaving(false); }
  };

  const saveBank = async () => {
    if (bank.account_number !== bank.confirm_account) { showMsg('error', 'Account numbers do not match'); return; }
    if (!bank.account_holder || !bank.account_number || !bank.ifsc_code || !bank.bank_name) { showMsg('error', 'Please fill all required bank fields'); return; }
    setSaving(true);
    try { const r = await api.put('/faculty/profile/bank', bank); if (r.data.success) showMsg('success', 'Bank details saved securely!'); }
    catch { showMsg('error', 'Save failed'); } finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (!passwords.current || !passwords.new_pass || !passwords.confirm) { showMsg('error', 'All fields required'); return; }
    if (passwords.new_pass !== passwords.confirm) { showMsg('error', 'New passwords do not match'); return; }
    if (passwords.new_pass.length < 8) { showMsg('error', 'Password must be at least 8 characters'); return; }
    setSaving(true);
    try { const r = await api.put('/faculty/profile/password', { current_password: passwords.current, new_password: passwords.new_pass }); if (r.data.success) { showMsg('success', 'Password changed!'); setPasswords({ current: '', new_pass: '', confirm: '' }); } }
    catch (e) { showMsg('error', e.response?.data?.message || 'Change failed'); } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'personal',      label: 'Personal',      icon: User       },
    { id: 'professional',  label: 'Professional',   icon: Briefcase  },
    { id: 'bank',          label: 'Bank Details',   icon: CreditCard },
    { id: 'security',      label: 'Security',       icon: Shield     },
  ];

  return (
    <div>
      <h2 className="fmba-section-title" style={{ marginBottom: 20 }}>My Profile</h2>

      {msg.text && <div className={msg.type === 'success' ? 'fmba-alert-success' : 'fmba-alert-error'} style={{ marginBottom: 14 }}>
        {msg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {msg.text}
      </div>}

      {/* Photo + quick info */}
      <div className="fmba-card" style={{ marginBottom: 16, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: T.blueSoft, border: `3px solid ${T.border}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {photoPreview
                ? <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 26, fontWeight: 800, color: T.navy }}>{(user?.full_name || 'F').charAt(0)}</span>}
            </div>
            <label htmlFor="photo-upload" style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: T.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `2px solid ${T.white}` }}>
              {photoUploading ? <div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'fmba-spin .7s linear infinite' }} /> : <Camera size={12} style={{ color: '#fff' }} />}
            </label>
            <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: T.navy }}>{user?.full_name || 'Faculty Name'}</h3>
            <p style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{user?.designation || 'Instructor'} · {user?.department || 'Department'}</p>
            <p style={{ fontSize: 12, color: T.subtle, marginTop: 3 }}>{user?.email} · ID: {user?.employee_id || 'N/A'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span className="fmba-pill fmba-pill-pass">Active</span>
            <span style={{ fontSize: 11, color: T.subtle, textAlign: 'center' }}>Since {user?.joining_date ? new Date(user.joining_date).getFullYear() : '–'}</span>
          </div>
        </div>
      </div>

      <div className="fmba-card">
        <div className="fmba-profile-tabs">
          {tabs.map(t => { const Icon = t.icon; return <button key={t.id} className={`fmba-profile-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}><Icon size={13} />{t.label}</button>; })}
        </div>
        <div style={{ padding: 24, maxWidth: 680 }}>
          {/* ── PERSONAL ── */}
          {activeTab === 'personal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>Basic Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><FLabel>Full Name *</FLabel><input className="fmba-input" value={personal.full_name} onChange={e => setPersonal(p => ({ ...p, full_name: e.target.value }))} /></div>
                <div><FLabel>Email *</FLabel><input type="email" className="fmba-input" value={personal.email} onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} /></div>
                <div><FLabel>Phone</FLabel><input className="fmba-input" value={personal.phone} onChange={e => setPersonal(p => ({ ...p, phone: e.target.value }))} placeholder="+91 99999 00000" /></div>
                <div><FLabel>Date of Birth</FLabel><input type="date" className="fmba-input" value={personal.dob} onChange={e => setPersonal(p => ({ ...p, dob: e.target.value }))} /></div>
                <div><FLabel>Gender</FLabel>
                  <select className="fmba-select" value={personal.gender} onChange={e => setPersonal(p => ({ ...p, gender: e.target.value }))}>
                    <option value="">Select</option><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                  </select>
                </div>
                <div><FLabel>Nationality</FLabel><input className="fmba-input" value={personal.nationality} onChange={e => setPersonal(p => ({ ...p, nationality: e.target.value }))} placeholder="Indian" /></div>
              </div>
              <hr style={{ border: 'none', borderTop: `1px solid ${T.border}` }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>Address</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: 'span 2' }}><FLabel>Street Address</FLabel><input className="fmba-input" value={personal.address} onChange={e => setPersonal(p => ({ ...p, address: e.target.value }))} /></div>
                <div><FLabel>City</FLabel><input className="fmba-input" value={personal.city} onChange={e => setPersonal(p => ({ ...p, city: e.target.value }))} /></div>
                <div><FLabel>State</FLabel><input className="fmba-input" value={personal.state} onChange={e => setPersonal(p => ({ ...p, state: e.target.value }))} /></div>
                <div><FLabel>Pincode</FLabel><input className="fmba-input" value={personal.pincode} onChange={e => setPersonal(p => ({ ...p, pincode: e.target.value }))} /></div>
              </div>
              <hr style={{ border: 'none', borderTop: `1px solid ${T.border}` }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>Online Presence</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><FLabel>LinkedIn URL</FLabel><input className="fmba-input" value={personal.linkedin} onChange={e => setPersonal(p => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/…" /></div>
                <div><FLabel>Personal Website</FLabel><input className="fmba-input" value={personal.website} onChange={e => setPersonal(p => ({ ...p, website: e.target.value }))} placeholder="https://yoursite.com" /></div>
              </div>
              <button className="fmba-btn-primary" onClick={savePersonal} disabled={saving} style={{ alignSelf: 'flex-start' }}>{saving ? 'Saving…' : <><CheckCircle size={13} /> Save Personal Details</>}</button>
            </div>
          )}

          {/* ── PROFESSIONAL ── */}
          {activeTab === 'professional' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>Role & Department</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><FLabel>Designation</FLabel><input className="fmba-input" value={professional.designation} onChange={e => setProfessional(p => ({ ...p, designation: e.target.value }))} placeholder="Assistant Professor" /></div>
                <div><FLabel>Department</FLabel><input className="fmba-input" value={professional.department} onChange={e => setProfessional(p => ({ ...p, department: e.target.value }))} /></div>
                <div><FLabel>Employee ID</FLabel><input className="fmba-input" value={professional.employee_id} onChange={e => setProfessional(p => ({ ...p, employee_id: e.target.value }))} /></div>
                <div><FLabel>Joining Date</FLabel><input type="date" className="fmba-input" value={professional.joining_date} onChange={e => setProfessional(p => ({ ...p, joining_date: e.target.value }))} /></div>
                <div><FLabel>Years of Experience</FLabel><input type="number" className="fmba-input" value={professional.experience_years} onChange={e => setProfessional(p => ({ ...p, experience_years: e.target.value }))} /></div>
              </div>
              <hr style={{ border: 'none', borderTop: `1px solid ${T.border}` }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>Academic Credentials</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><FLabel>Highest Qualification</FLabel><input className="fmba-input" value={professional.qualification} onChange={e => setProfessional(p => ({ ...p, qualification: e.target.value }))} placeholder="PhD / MBA / M.Tech" /></div>
                <div><FLabel>Specialization</FLabel><input className="fmba-input" value={professional.specialization} onChange={e => setProfessional(p => ({ ...p, specialization: e.target.value }))} /></div>
                <div style={{ gridColumn: 'span 2' }}><FLabel>Certifications</FLabel><textarea className="fmba-textarea" rows={2} value={professional.certifications} onChange={e => setProfessional(p => ({ ...p, certifications: e.target.value }))} placeholder="PMP, AWS Solutions Architect, etc." /></div>
                <div style={{ gridColumn: 'span 2' }}><FLabel>Research / Interest Areas</FLabel><textarea className="fmba-textarea" rows={2} value={professional.research_areas} onChange={e => setProfessional(p => ({ ...p, research_areas: e.target.value }))} placeholder="Machine Learning, Data Science…" /></div>
                <div style={{ gridColumn: 'span 2' }}><FLabel>Bio / About</FLabel><textarea className="fmba-textarea" rows={4} value={professional.bio} onChange={e => setProfessional(p => ({ ...p, bio: e.target.value }))} placeholder="Brief description shown to students…" /></div>
              </div>
              <button className="fmba-btn-primary" onClick={saveProfessional} disabled={saving} style={{ alignSelf: 'flex-start' }}>{saving ? 'Saving…' : <><CheckCircle size={13} /> Save Professional Details</>}</button>
            </div>
          )}

          {/* ── BANK ── */}
          {activeTab === 'bank' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="fmba-notice">
                <Shield size={16} style={{ color: T.gold, flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: '#5a4500' }}>Bank details are encrypted and stored securely. They are used only for salary and reimbursement processing by HR/Admin.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: 'span 2' }}><FLabel>Account Holder Name *</FLabel><input className="fmba-input" value={bank.account_holder} onChange={e => setBank(b => ({ ...b, account_holder: e.target.value }))} placeholder="As per bank records" /></div>
                <div><FLabel>Bank Name *</FLabel><input className="fmba-input" value={bank.bank_name} onChange={e => setBank(b => ({ ...b, bank_name: e.target.value }))} placeholder="State Bank of India" /></div>
                <div><FLabel>Account Type *</FLabel>
                  <select className="fmba-select" value={bank.account_type} onChange={e => setBank(b => ({ ...b, account_type: e.target.value }))}>
                    <option value="savings">Savings Account</option><option value="current">Current Account</option>
                  </select>
                </div>
                <div><FLabel>Account Number *</FLabel><input type="password" className="fmba-input" value={bank.account_number} onChange={e => setBank(b => ({ ...b, account_number: e.target.value }))} placeholder="Enter account number" /></div>
                <div><FLabel>Confirm Account Number *</FLabel><input className="fmba-input" value={bank.confirm_account} onChange={e => setBank(b => ({ ...b, confirm_account: e.target.value }))} placeholder="Re-enter account number" /></div>
                <div><FLabel>IFSC Code *</FLabel><input className="fmba-input" value={bank.ifsc_code} onChange={e => setBank(b => ({ ...b, ifsc_code: e.target.value.toUpperCase() }))} placeholder="SBIN0001234" /></div>
                <div><FLabel>Branch Name</FLabel><input className="fmba-input" value={bank.branch} onChange={e => setBank(b => ({ ...b, branch: e.target.value }))} /></div>
                <div><FLabel>PAN Number</FLabel><input className="fmba-input" value={bank.pan_number} onChange={e => setBank(b => ({ ...b, pan_number: e.target.value.toUpperCase() }))} placeholder="ABCDE1234F" /></div>
                <div><FLabel>UPI ID (Optional)</FLabel><input className="fmba-input" value={bank.upi_id} onChange={e => setBank(b => ({ ...b, upi_id: e.target.value }))} placeholder="name@upi" /></div>
              </div>
              <button className="fmba-btn-primary" onClick={saveBank} disabled={saving} style={{ alignSelf: 'flex-start' }}><Shield size={13} /> {saving ? 'Saving…' : 'Save Bank Details Securely'}</button>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>Change Password</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
                <div><FLabel>Current Password *</FLabel><input type="password" className="fmba-input" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} /></div>
                <div><FLabel>New Password *</FLabel><input type="password" className="fmba-input" value={passwords.new_pass} onChange={e => setPasswords(p => ({ ...p, new_pass: e.target.value }))} /></div>
                <div><FLabel>Confirm New Password *</FLabel><input type="password" className="fmba-input" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} /></div>
                <ul style={{ listStyle: 'none', fontSize: 12, color: T.muted }}>
                  {['At least 8 characters', 'Mix of uppercase & lowercase', 'Include numbers or symbols'].map((r, i) => <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}><CheckSquare size={11} style={{ color: passwords.new_pass.length >= 8 ? T.green : T.border }} />{r}</li>)}
                </ul>
                <button className="fmba-btn-primary" onClick={savePassword} disabled={saving} style={{ alignSelf: 'flex-start' }}>{saving ? 'Changing…' : <><Lock size={13} /> Change Password</>}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COURSE ASSIGNMENT (ADMIN-ASSIGNED COURSES VIEW) ──────────────────────────
function CourseAssignment() {
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showRequest, setShowRequest] = useState(false);
  const [requestForm, setRequestForm] = useState({ course_id: '', message: '', preferred_schedule: '' });
  const [requesting, setRequesting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/faculty/assigned-courses').then(r => { if (r.data.success) setCourses(r.data.courses || []); }).catch(() => {}).finally(() => setLoading(false));
    api.get('/courses').then(r => { if (r.data.success) setAllCourses(r.data.courses || []); }).catch(() => {});
  }, []);

  const handleRequest = async () => {
    if (!requestForm.course_id) { setMsg({ type: 'error', text: 'Please select a course' }); return; }
    setRequesting(true);
    try {
      const r = await api.post('/faculty/course-requests', requestForm);
      if (r.data.success) { setMsg({ type: 'success', text: 'Course request submitted to Admin!' }); setShowRequest(false); setRequestForm({ course_id: '', message: '', preferred_schedule: '' }); }
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Request failed' }); }
    finally { setRequesting(false); setTimeout(() => setMsg({ type: '', text: '' }), 3000); }
  };

  const filtered = courses.filter(c => {
    const ms = (c.course_name || '').toLowerCase().includes(search.toLowerCase()) || (c.code || '').toLowerCase().includes(search.toLowerCase());
    const mf = filter === 'all' || (c.assignment_status || '').toLowerCase() === filter;
    return ms && mf;
  });

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Course Assignments</h2>
          <p className="fmba-section-sub">Courses assigned to you by Admin · {filtered.length} total</p>
        </div>
        <button className="fmba-btn-primary" onClick={() => setShowRequest(true)}><Plus size={13} /> Request a Course</button>
      </div>

      {msg.text && <div className={msg.type === 'success' ? 'fmba-alert-success' : 'fmba-alert-error'} style={{ marginBottom: 14 }}>
        {msg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {msg.text}
      </div>}

      <div className="fmba-grid-4" style={{ marginBottom: 16 }}>
        {[
          { label: 'Total Assigned', value: courses.length, accent: 'fmba-metric-navy' },
          { label: 'Active',         value: courses.filter(c => c.status === 'active').length, accent: 'fmba-metric-green' },
          { label: 'Upcoming',       value: courses.filter(c => c.status === 'upcoming').length, accent: 'fmba-metric-gold' },
          { label: 'Completed',      value: courses.filter(c => c.status === 'completed').length, accent: 'fmba-metric-gray' },
        ].map((m, i) => (
          <div key={i} className={`fmba-metric ${m.accent}`}>
            <div className="fmba-metric-label">{m.label}</div>
            <div className="fmba-metric-value">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="fmba-card" style={{ marginBottom: 16, padding: 14 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
            <input className="fmba-input" style={{ paddingLeft: 30 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assigned courses…" />
          </div>
          <div className="fmba-tabs">
            {['all', 'active', 'upcoming', 'completed'].map(f => <button key={f} className={`fmba-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>)}
          </div>
        </div>
      </div>

      {filtered.length === 0
        ? <div className="fmba-card fmba-empty"><BookMarked size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No courses assigned yet. Request one from Admin.</p></div>
        : <div className="fmba-grid-cards">
          {filtered.map(c => (
            <div key={c.id} className="fmba-course-card">
              <div style={{ height: 3, background: c.status === 'active' ? T.green : c.status === 'upcoming' ? T.gold : T.subtle }} />
              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <span className="fmba-pill fmba-pill-navy" style={{ fontSize: 11, marginBottom: 5, display: 'inline-block' }}>{c.code}</span>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '.03em' }}>{c.course_name}</h3>
                  </div>
                  <span className={`fmba-pill ${c.status === 'active' ? 'fmba-pill-pass' : c.status === 'upcoming' ? 'fmba-pill-gold' : 'fmba-pill-gray'}`} style={{ height: 'fit-content' }}>{c.status}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                  {[
                    { icon: Users,    text: `${c.students || 0} students enrolled` },
                    { icon: Calendar, text: `${c.start_date || '–'} – ${c.end_date || '–'}` },
                    { icon: Clock,    text: c.schedule || '–'                       },
                    { icon: Building, text: `Assigned by: ${c.assigned_by || 'Admin'}` },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.muted }}><Icon size={12} /><span>{text}</span></div>
                  ))}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.subtle, marginBottom: 3 }}><span>Syllabus Coverage</span><span style={{ fontWeight: 700 }}>{c.coverage || 0}%</span></div>
                  <div className="fmba-bar-track"><div className="fmba-bar-fill" style={{ width: `${c.coverage || 0}%`, background: T.navy }} /></div>
                </div>
                <Link to={`/faculty/courses`} className="fmba-btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>Manage Course</Link>
              </div>
            </div>
          ))}
        </div>}

      {showRequest && (
        <div className="fmba-modal-bg">
          <div className="fmba-modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: T.navy }}>Request Course Assignment</h3>
              <button onClick={() => setShowRequest(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={18} /></button>
            </div>
            <div className="fmba-notice"><Info size={15} style={{ color: T.gold, flexShrink: 0 }} /><p style={{ fontSize: 13, color: '#5a4500' }}>Your request will be reviewed and approved by Admin. You'll be notified once assigned.</p></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><FLabel>Select Course *</FLabel>
                <select className="fmba-select" value={requestForm.course_id} onChange={e => setRequestForm(f => ({ ...f, course_id: e.target.value }))}>
                  <option value="">Choose a course</option>
                  {allCourses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.course_name}</option>)}
                </select>
              </div>
              <div><FLabel>Preferred Schedule</FLabel><input className="fmba-input" value={requestForm.preferred_schedule} onChange={e => setRequestForm(f => ({ ...f, preferred_schedule: e.target.value }))} placeholder="e.g. Mon-Wed 10 AM" /></div>
              <div><FLabel>Reason / Message to Admin</FLabel><textarea className="fmba-textarea" rows={3} value={requestForm.message} onChange={e => setRequestForm(f => ({ ...f, message: e.target.value }))} placeholder="Why are you requesting this course?" /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="fmba-btn-primary" onClick={handleRequest} disabled={requesting} style={{ flex: 1, justifyContent: 'center' }}>{requesting ? 'Submitting…' : 'Submit Request'}</button>
              <button className="fmba-btn-ghost" onClick={() => setShowRequest(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── JOBS MODULE (STUDENT VIEW FOR FACULTY) ───────────────────────────────────
function JobsModule() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selJob, setSelJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    api.get('/faculty/jobs').then(r => { if (r.data.success) setJobs(r.data.jobs || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openJob = async (job) => {
    setSelJob(job); setLoadingApplicants(true);
    try { const r = await api.get(`/faculty/jobs/${job.id}/applicants`); if (r.data.success) setApplicants(r.data.applicants || []); }
    catch { setApplicants([]); } finally { setLoadingApplicants(false); }
  };

  const filtered = jobs.filter(j => {
    const ms = (j.title || '').toLowerCase().includes(search.toLowerCase()) || (j.company || '').toLowerCase().includes(search.toLowerCase());
    const mf = filterType === 'all' || j.type === filterType;
    return ms && mf;
  });

  if (loading) return <Spinner />;

  if (selJob) return (
    <div>
      <button className="fmba-btn-ghost" style={{ marginBottom: 16 }} onClick={() => setSelJob(null)}><ChevronRight size={13} style={{ transform: 'rotate(180deg)' }} /> Back to Jobs</button>
      <div className="fmba-card" style={{ marginBottom: 14, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: T.navy }}>{selJob.title}</h2>
            <p style={{ fontSize: 14, color: T.muted, marginTop: 3 }}>{selJob.company} · {selJob.location}</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <span className="fmba-pill fmba-pill-navy">{selJob.type}</span>
              <span className="fmba-pill fmba-pill-gold">{selJob.salary_range || 'CTC Not Disclosed'}</span>
              <span className={`fmba-pill ${selJob.status === 'open' ? 'fmba-pill-pass' : 'fmba-pill-gray'}`}>{selJob.status}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: T.subtle }}>Deadline</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: T.red }}>{selJob.deadline ? new Date(selJob.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '–'}</p>
          </div>
        </div>
        <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, marginBottom: 14 }}>{selJob.description}</div>
        {selJob.requirements && <div style={{ background: T.bg, borderRadius: 8, padding: '12px 16px' }}><p style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 6 }}>Requirements</p><p style={{ fontSize: 13, color: T.muted }}>{selJob.requirements}</p></div>}
      </div>
      <div className="fmba-card">
        <div className="fmba-card-head">
          <span className="fmba-card-title">Student Applicants ({applicants.length})</span>
          {applicants.length > 0 && <button className="fmba-btn-ghost" style={{ fontSize: 12 }}><Download size={12} /> Export</button>}
        </div>
        <div className="fmba-card-body">
          {loadingApplicants ? <Spinner /> : applicants.length === 0
            ? <div className="fmba-empty"><Briefcase size={28} style={{ color: T.border, margin: '0 auto 8px' }} /><p>No student applications yet</p></div>
            : <table className="fmba-table">
              <thead><tr>{['Student', 'Applied On', 'Status', 'Resume'].map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {applicants.map((a, i) => (
                  <tr key={i}>
                    <td><p style={{ fontWeight: 600 }}>{a.student_name}</p><p style={{ fontSize: 12, color: T.subtle }}>{a.student_email}</p></td>
                    <td style={{ color: T.muted }}>{a.applied_at ? new Date(a.applied_at).toLocaleDateString('en-IN') : '–'}</td>
                    <td><span className={`fmba-pill ${a.status === 'selected' ? 'fmba-pill-pass' : a.status === 'rejected' ? 'fmba-pill-fail' : 'fmba-pill-gold'}`}>{a.status || 'Applied'}</span></td>
                    <td>{a.resume_url ? <a href={a.resume_url} target="_blank" rel="noopener noreferrer" className="fmba-btn-ghost" style={{ fontSize: 12, padding: '5px 10px' }}><Eye size={11} /> View</a> : <span style={{ color: T.subtle, fontSize: 12 }}>N/A</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Jobs & Placements</h2>
          <p className="fmba-section-sub">Track job listings and student applications</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ background: T.greenSoft, color: T.green, border: `1px solid #b8d9b8`, borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle size={13} />{jobs.filter(j => j.status === 'open').length} Open Positions</span>
        </div>
      </div>

      <div className="fmba-grid-4" style={{ marginBottom: 16 }}>
        {[
          { label: 'Total Listings',   value: jobs.length,                                    accent: 'fmba-metric-navy'  },
          { label: 'Open Positions',   value: jobs.filter(j => j.status === 'open').length,   accent: 'fmba-metric-green' },
          { label: 'Total Applicants', value: jobs.reduce((s, j) => s + (j.applicant_count || 0), 0), accent: 'fmba-metric-gold' },
          { label: 'Placed Students',  value: jobs.reduce((s, j) => s + (j.placed_count || 0), 0),    accent: 'fmba-metric-gray' },
        ].map((m, i) => (
          <div key={i} className={`fmba-metric ${m.accent}`}>
            <div className="fmba-metric-label">{m.label}</div>
            <div className="fmba-metric-value">{m.value}</div>
          </div>
        ))}
      </div>

      <div className="fmba-card" style={{ marginBottom: 16, padding: 14 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
            <input className="fmba-input" style={{ paddingLeft: 30 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs or companies…" />
          </div>
          <div className="fmba-tabs">
            {['all', 'full-time', 'internship', 'part-time'].map(f => <button key={f} className={`fmba-tab ${filterType === f ? 'active' : ''}`} onClick={() => setFilterType(f)} style={{ textTransform: 'capitalize' }}>{f === 'all' ? 'All' : f}</button>)}
          </div>
        </div>
      </div>

      {filtered.length === 0
        ? <div className="fmba-card fmba-empty"><Briefcase size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No job listings found</p></div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(job => (
            <div key={job.id} className="fmba-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                    <span className="fmba-pill fmba-pill-navy">{job.type}</span>
                    <span className={`fmba-pill ${job.status === 'open' ? 'fmba-pill-pass' : 'fmba-pill-gray'}`}>{job.status}</span>
                    {job.deadline && new Date(job.deadline) < new Date() && <span className="fmba-pill fmba-pill-red">Expired</span>}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>{job.title}</h3>
                  <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.muted }}><Building size={12} />{job.company}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.muted }}><MapPin size={12} />{job.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.gold, fontWeight: 600 }}><Star size={12} />{job.salary_range || 'CTC TBD'}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.muted }}><Users size={12} />{job.applicant_count || 0} applicants</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: T.muted }}><Calendar size={12} />Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN') : '–'}</span>
                  </div>
                </div>
                <button className="fmba-btn-primary" style={{ fontSize: 13 }} onClick={() => openJob(job)}><Eye size={13} /> View Applicants</button>
              </div>
            </div>
          ))}
        </div>}
    </div>
  );
}

// ─── GLOBAL SEARCH (TOPBAR FEATURE) ──────────────────────────────────────────
function GlobalSearch({ onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ students: [], courses: [], assignments: [], doubts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults({ students: [], courses: [], assignments: [], doubts: [] }); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const r = await api.get(`/faculty/search?q=${encodeURIComponent(query)}`); if (r.data.success) setResults(r.data.results || {}); }
      catch { setResults({ students: [], courses: [], assignments: [], doubts: [] }); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const total = Object.values(results).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
  const go = (path) => { navigate(path); onClose(); };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(26,39,68,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px' }} onClick={onClose}>
      <div style={{ background: T.white, borderRadius: 14, width: '100%', maxWidth: 600, boxShadow: '0 24px 60px rgba(26,39,68,0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
          <Search size={18} style={{ color: T.navy, flexShrink: 0 }} />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search students, courses, assignments, doubts…" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: T.text }} />
          {loading && <div className="fmba-spinner" style={{ width: 16, height: 16, flexShrink: 0 }} />}
          <button onClick={onClose} style={{ background: T.bg, border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, flexShrink: 0 }}><X size={14} /></button>
        </div>
        <div style={{ maxHeight: 420, overflowY: 'auto' }}>
          {query.length < 2 && (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <Search size={28} style={{ color: T.border, display: 'block', margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: T.subtle }}>Type at least 2 characters to search</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 14 }}>
                {['Students', 'Courses', 'Assignments', 'Doubts'].map(s => <span key={s} style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, color: T.muted, cursor: 'pointer' }} onClick={() => setQuery(s.toLowerCase())}>{s}</span>)}
              </div>
            </div>
          )}
          {query.length >= 2 && total === 0 && !loading && <div style={{ padding: 28, textAlign: 'center', color: T.subtle, fontSize: 13 }}>No results for "<strong>{query}</strong>"</div>}
          {results.students?.length > 0 && (
            <div>
              <div style={{ padding: '8px 18px 4px', fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: 'uppercase', letterSpacing: '.08em' }}>Students</div>
              {results.students.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', cursor: 'pointer', transition: 'background .12s' }} onClick={() => go('/faculty/students')} onMouseEnter={e => e.currentTarget.style.background = T.bg} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.blueSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: T.navy, fontSize: 12, flexShrink: 0 }}>{(s.full_name || 'S').charAt(0)}</div>
                  <div><p style={{ fontSize: 13, fontWeight: 600 }}>{s.full_name}</p><p style={{ fontSize: 12, color: T.subtle }}>{s.email} · {s.course}</p></div>
                  <ChevronRight size={13} style={{ color: T.subtle, marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          )}
          {results.courses?.length > 0 && (
            <div>
              <div style={{ padding: '8px 18px 4px', fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: 'uppercase', letterSpacing: '.08em' }}>Courses</div>
              {results.courses.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', cursor: 'pointer', transition: 'background .12s' }} onClick={() => go('/faculty/courses')} onMouseEnter={e => e.currentTarget.style.background = T.bg} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: T.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BookOpen size={14} style={{ color: T.gold }} /></div>
                  <div><p style={{ fontSize: 13, fontWeight: 600 }}>{c.course_name}</p><p style={{ fontSize: 12, color: T.subtle }}>{c.code} · {c.students} students</p></div>
                  <ChevronRight size={13} style={{ color: T.subtle, marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          )}
          {results.assignments?.length > 0 && (
            <div>
              <div style={{ padding: '8px 18px 4px', fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: 'uppercase', letterSpacing: '.08em' }}>Assignments</div>
              {results.assignments.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', cursor: 'pointer', transition: 'background .12s' }} onClick={() => go('/faculty/assignments')} onMouseEnter={e => e.currentTarget.style.background = T.bg} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: T.greenSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ClipboardList size={14} style={{ color: T.green }} /></div>
                  <div><p style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</p><p style={{ fontSize: 12, color: T.subtle }}>{a.course} · Due: {a.due_date}</p></div>
                  <ChevronRight size={13} style={{ color: T.subtle, marginLeft: 'auto' }} />
                </div>
              ))}
            </div>
          )}
          {results.doubts?.length > 0 && (
            <div>
              <div style={{ padding: '8px 18px 4px', fontSize: 11, fontWeight: 700, color: T.subtle, textTransform: 'uppercase', letterSpacing: '.08em' }}>Doubts</div>
              {results.doubts.map(d => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', cursor: 'pointer', transition: 'background .12s' }} onClick={() => go('/faculty/doubts')} onMouseEnter={e => e.currentTarget.style.background = T.bg} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: T.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MessageCircle size={14} style={{ color: T.red }} /></div>
                  <div><p style={{ fontSize: 13, fontWeight: 600 }}>{d.subject}</p><p style={{ fontSize: 12, color: T.subtle }}>{d.student_name} · {d.status}</p></div>
                  <span className={`fmba-pill ${d.status === 'resolved' ? 'fmba-pill-pass' : 'fmba-pill-gold'}`} style={{ marginLeft: 'auto', fontSize: 11 }}>{d.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '10px 18px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: T.subtle }}>Press <kbd style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 4, padding: '1px 5px', fontSize: 11, fontFamily: 'monospace' }}>Esc</kbd> to close</span>
          {total > 0 && <span style={{ fontSize: 12, color: T.subtle, marginLeft: 'auto' }}>{total} results found</span>}
        </div>
      </div>
    </div>
  );
}

// ─── BATCH NOTIFICATIONS ──────────────────────────────────────────────────────
function BatchNotifications() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ batch_ids: [], title: '', message: '', type: 'info', send_email: false, send_push: true, scheduled_at: '' });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('compose');

  useEffect(() => {
    api.get('/faculty/batches').then(r => { if (r.data.success) setBatches(r.data.batches || []); }).catch(() => {});
    api.get('/faculty/batch-notifications/history').then(r => { if (r.data.success) setHistory(r.data.notifications || []); }).catch(() => setHistory([])).finally(() => setLoading(false));
  }, []);

  const toggleBatch = (id) => setForm(f => ({ ...f, batch_ids: f.batch_ids.includes(id) ? f.batch_ids.filter(b => b !== id) : [...f.batch_ids, id] }));

  const handleSend = async () => {
    if (!form.title || !form.message) { setMsg({ type: 'error', text: 'Title and message are required' }); return; }
    if (form.batch_ids.length === 0) { setMsg({ type: 'error', text: 'Select at least one batch' }); return; }
    setSending(true);
    try {
      const r = await api.post('/faculty/batch-notifications', form);
      if (r.data.success) {
        setMsg({ type: 'success', text: `Notification sent to ${form.batch_ids.length} batch(es)!` });
        setHistory([r.data.notification, ...history]);
        setForm({ batch_ids: [], title: '', message: '', type: 'info', send_email: false, send_push: true, scheduled_at: '' });
        setActiveTab('history');
      }
    } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Send failed' }); }
    finally { setSending(false); setTimeout(() => setMsg({ type: '', text: '' }), 3000); }
  };

  const totalStudents = form.batch_ids.reduce((s, id) => { const b = batches.find(b => b.id === id); return s + (b?.students || 0); }, 0);
  const typeColors = { info: T.blue, warning: '#c57700', success: T.green, urgent: T.red };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 className="fmba-section-title">Batch Notifications</h2>
          <p className="fmba-section-sub">Send targeted announcements to student batches</p>
        </div>
        <div className="fmba-tabs">
          <button className={`fmba-tab ${activeTab === 'compose' ? 'active' : ''}`} onClick={() => setActiveTab('compose')}><Send size={13} /> Compose</button>
          <button className={`fmba-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}><Clock size={13} /> History ({history.length})</button>
        </div>
      </div>

      {msg.text && <div className={msg.type === 'success' ? 'fmba-alert-success' : 'fmba-alert-error'} style={{ marginBottom: 14 }}>
        {msg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {msg.text}
      </div>}

      {activeTab === 'compose' && (
        <div className="fmba-grid-5-2">
          {/* Batch selector */}
          <div>
            <div className="fmba-card">
              <div className="fmba-card-head"><span className="fmba-card-title">Select Batches</span>
                <button className="fmba-card-link" onClick={() => setForm(f => ({ ...f, batch_ids: batches.map(b => b.id) }))}>Select All</button>
              </div>
              <div className="fmba-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {batches.length === 0
                  ? <p style={{ fontSize: 13, color: T.subtle }}>No batches found</p>
                  : batches.map(b => (
                    <div key={b.id} onClick={() => toggleBatch(b.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1.5px solid ${form.batch_ids.includes(b.id) ? T.navy : T.border}`, borderRadius: 8, cursor: 'pointer', background: form.batch_ids.includes(b.id) ? T.blueSoft : T.white, transition: 'all .18s' }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${form.batch_ids.includes(b.id) ? T.navy : T.border}`, background: form.batch_ids.includes(b.id) ? T.navy : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {form.batch_ids.includes(b.id) && <CheckCircle size={11} style={{ color: '#fff' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{b.name}</p>
                        <p style={{ fontSize: 11, color: T.subtle }}>{b.students || 0} students</p>
                      </div>
                      <span className={`fmba-pill ${b.status === 'active' ? 'fmba-pill-pass' : 'fmba-pill-gray'}`} style={{ fontSize: 10 }}>{b.status}</span>
                    </div>
                  ))}
                {form.batch_ids.length > 0 && (
                  <div style={{ background: T.blueSoft, borderRadius: 8, padding: '10px 12px', textAlign: 'center', marginTop: 4 }}>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: T.navy }}>{totalStudents}</p>
                    <p style={{ fontSize: 12, color: T.muted }}>students will be notified</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compose */}
          <div className="fmba-card">
            <div className="fmba-card-head"><span className="fmba-card-title">Compose Notification</span></div>
            <div className="fmba-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><FLabel>Notification Title *</FLabel><input className="fmba-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Assignment Deadline Reminder" /></div>
              <div><FLabel>Type</FLabel>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Object.entries(typeColors).map(([type, color]) => (
                    <button key={type} onClick={() => setForm(f => ({ ...f, type }))} style={{ flex: 1, padding: '7px 4px', border: `2px solid ${form.type === type ? color : T.border}`, borderRadius: 8, background: form.type === type ? `${color}18` : T.white, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: form.type === type ? color : T.muted, textTransform: 'capitalize', transition: 'all .18s', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{type}</button>
                  ))}
                </div>
              </div>
              <div><FLabel>Message *</FLabel><textarea className="fmba-textarea" rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Write your notification message here…" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: `1.5px solid ${form.send_push ? T.navy : T.border}`, borderRadius: 8, cursor: 'pointer', background: form.send_push ? T.blueSoft : T.white }} onClick={() => setForm(f => ({ ...f, send_push: !f.send_push }))}>
                  <div className={`fmba-toggle-track ${form.send_push ? 'on' : ''}`} style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()} ><div className="fmba-toggle-thumb" /></div>
                  <div><p style={{ fontSize: 13, fontWeight: 600 }}>Push Notification</p><p style={{ fontSize: 11, color: T.subtle }}>In-app alert</p></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: `1.5px solid ${form.send_email ? T.navy : T.border}`, borderRadius: 8, cursor: 'pointer', background: form.send_email ? T.blueSoft : T.white }} onClick={() => setForm(f => ({ ...f, send_email: !f.send_email }))}>
                  <div className={`fmba-toggle-track ${form.send_email ? 'on' : ''}`} style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}><div className="fmba-toggle-thumb" /></div>
                  <div><p style={{ fontSize: 13, fontWeight: 600 }}>Email</p><p style={{ fontSize: 11, color: T.subtle }}>Send to inbox</p></div>
                </div>
              </div>
              <div><FLabel>Schedule (optional)</FLabel><input type="datetime-local" className="fmba-input" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} /></div>

              {/* Preview */}
              {(form.title || form.message) && (
                <div style={{ border: `1.5px solid ${typeColors[form.type] || T.border}`, borderRadius: 10, padding: 14, background: `${typeColors[form.type] || T.navy}0d` }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: typeColors[form.type], marginBottom: 6 }}>Preview</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{form.title || 'Notification Title'}</p>
                  <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>{form.message || 'Your message will appear here…'}</p>
                </div>
              )}

              <button className="fmba-btn-primary" onClick={handleSend} disabled={sending || form.batch_ids.length === 0} style={{ justifyContent: 'center' }}>
                {sending ? 'Sending…' : <><BellRing size={13} /> {form.scheduled_at ? 'Schedule Notification' : `Send to ${form.batch_ids.length} batch(es) · ${totalStudents} students`}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          {history.length === 0
            ? <div className="fmba-card fmba-empty"><BellRing size={36} style={{ color: T.border, margin: '0 auto 10px' }} /><p>No notifications sent yet</p></div>
            : history.map((n, i) => (
              <div key={n.id || i} className="fmba-notif-row" style={{ borderLeft: `3px solid ${typeColors[n.type] || T.navy}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${typeColors[n.type] || T.navy}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BellRing size={16} style={{ color: typeColors[n.type] || T.navy }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{n.title}</h4>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className="fmba-pill" style={{ background: `${typeColors[n.type] || T.navy}18`, color: typeColors[n.type] || T.navy, fontSize: 10, textTransform: 'capitalize' }}>{n.type}</span>
                      <span style={{ fontSize: 12, color: T.subtle }}>{n.sent_at ? new Date(n.sent_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '–'}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: T.muted, marginBottom: 6, lineHeight: 1.5 }}>{n.message}</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: T.subtle, display: 'flex', alignItems: 'center', gap: 3 }}><Users size={11} />{n.recipient_count || 0} recipients</span>
                    {n.send_email && <span style={{ fontSize: 12, color: T.subtle, display: 'flex', alignItems: 'center', gap: 3 }}><Mail size={11} />Email sent</span>}
                    {n.batch_names?.length > 0 && <span style={{ fontSize: 12, color: T.subtle }}>{n.batch_names.join(', ')}</span>}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── MAIN FACULTY DASHBOARD ───────────────────────────────────────────────────
export default function FacultyDashboard() {
  const location  = useLocation();
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [userMenuOpen,      setUserMenuOpen]       = useState(false);
  const [showMailbox,       setShowMailbox]        = useState(false);
  const [showNotifications, setShowNotifications]  = useState(false);
  const [showHelp,          setShowHelp]           = useState(false);
  const [showGlobalSearch,  setShowGlobalSearch]   = useState(false);
  const [messages,          setMessages]           = useState([]);
  const [notifications,     setNotifications]      = useState([]);
  // Live profile photo — updates instantly when user uploads a new photo
  const [livePhoto, setLivePhoto] = useState(user?.profile_photo || null);

  // Keep livePhoto in sync whenever user context updates (e.g. after photo upload)
  useEffect(() => { if (user?.profile_photo) setLivePhoto(user.profile_photo); }, [user?.profile_photo]);

  useEffect(() => {
    api.get('/faculty/messages').then(r => { if (r.data.success) setMessages(r.data.messages || []); }).catch(() => setMessages([]));
    api.get('/faculty/notifications').then(r => { if (r.data.success) setNotifications(r.data.notifications || []); }).catch(() => setNotifications([]));
  }, []);

  // Global search keyboard shortcut
  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowGlobalSearch(v => !v); } if (e.key === 'Escape') setShowGlobalSearch(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Listen for photo upload events from FacultyProfile — updates sidebar + topbar instantly
  useEffect(() => {
    const onPhoto = (e) => { if (e.detail?.url) setLivePhoto(e.detail.url); };
    window.addEventListener('facultyPhotoUpdated', onPhoto);
    return () => window.removeEventListener('facultyPhotoUpdated', onPhoto);
  }, []);

  const closeAll = () => { setShowMailbox(false); setShowNotifications(false); setShowHelp(false); setUserMenuOpen(false); };
  const handleLogout = () => { logout(); navigate('/login'); };
  const unread = messages.filter(m => !m.read).length;
  const initials = (user?.full_name || 'F').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const navSections = [
    { label: 'Teaching', items: [
      { path: '/faculty',                   label: 'Overview',         icon: BarChart3     },
      { path: '/faculty/courses',           label: 'Courses',          icon: BookOpen      },
      { path: '/faculty/course-assignment', label: 'Course Assignment',icon: BookMarked    },
      { path: '/faculty/students',          label: 'Students',         icon: Users         },
      { path: '/faculty/content-upload',   label: 'Content',          icon: Upload        },
    ]},
    { label: 'Assessment', items: [
      { path: '/faculty/assignments',       label: 'Assignments',      icon: ClipboardList },
      { path: '/faculty/quizzes',           label: 'Quizzes',          icon: FileText      },
      { path: '/faculty/attendance',        label: 'Attendance',       icon: UserCheck     },
      { path: '/faculty/live-classes',      label: 'Live Classes',     icon: MonitorPlay   },
    ]},
    { label: 'Engagement', items: [
      { path: '/faculty/announcements',     label: 'Announcements',    icon: Megaphone     },
      { path: '/faculty/batches',           label: 'Batches',          icon: Layers        },
      { path: '/faculty/batch-notify',      label: 'Batch Notify',     icon: BellRing      },
      { path: '/faculty/doubts',            label: 'Doubts',           icon: MessageCircle },
      { path: '/faculty/discussion',        label: 'Discussion',       icon: MessageSquare },
    ]},
    { label: 'Reports & More', items: [
      { path: '/faculty/analytics',         label: 'Analytics',        icon: TrendingUp    },
      { path: '/faculty/jobs',              label: 'Jobs & Placements', icon: Briefcase    },
      { path: '/faculty/settings',          label: 'Settings',         icon: Settings      },
    ]},
  ];

  return (
    <div className="fmba" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <MBAStyles />
      {showGlobalSearch && <GlobalSearch onClose={() => setShowGlobalSearch(false)} />}

      {/* ── Sidebar ── */}
      <aside className="fmba-sidebar" style={{ width: sidebarOpen ? 220 : 0, overflow: sidebarOpen ? 'auto' : 'hidden', transition: 'width .25s', flexShrink: 0 }}>
        <div className="fmba-brand">
          <div className="fmba-brand-label">Faculty Portal</div>
          <div className="fmba-brand-name">
            <img src="/project.png" alt="Logo" style={{ height: 28, width: 'auto', display: 'block' }}
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
            <span style={{ display: 'none' }}>Upskillize</span>
          </div>
          <div className="fmba-brand-sub">Instructor Dashboard</div>
        </div>
        <nav style={{ flex: 1 }}>
          {navSections.map(section => (
            <div key={section.label} className="fmba-nav-section">
              <div className="fmba-nav-label">{section.label}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className={`fmba-nav-item ${isActive ? 'active' : ''}`}>
                    <div className={`fmba-nav-dot ${isActive ? 'active' : ''}`} />
                    <Icon size={16} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="fmba-sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="fmba-avatar" style={{ cursor: 'pointer', border: livePhoto ? '2px solid rgba(184,150,11,0.6)' : 'none' }} onClick={() => navigate('/faculty/profile')}>
              {livePhoto
                ? <img src={livePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <span style={{ fontSize: 13, fontWeight: 800, color: '#1a2744' }}>{initials}</span>}
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>{user?.full_name?.split(' ')[0] || 'Faculty'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', fontWeight: 400 }}>Instructor</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Topbar ── */}
        <header className="fmba-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <button onClick={() => setSidebarOpen(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 4 }}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <div className="fmba-page-title">
                {navSections.flatMap(s => s.items).find(i => i.path === location.pathname)?.label || 'Dashboard'}
              </div>
              <div className="fmba-page-meta">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div className="fmba-search" style={{ cursor: 'pointer' }} onClick={() => setShowGlobalSearch(true)}>
              <Search size={14} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: T.subtle, width: 160, userSelect: 'none' }}>Search… <kbd style={{ fontSize: 10, background: T.border, borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace', color: T.muted }}>⌘K</kbd></span>
            </div>

            {/* Mail */}
            <div style={{ position: 'relative' }}>
              <button className="fmba-icon-btn" onClick={() => { closeAll(); setShowMailbox(v => !v); }}>
                <Mail size={16} />
                {unread > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: T.red }} />}
              </button>
              {showMailbox && (
                <>
                  <div className="fmba-dropdown" style={{ width: 280 }}>
                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Messages</span>
                      <button onClick={() => setShowMailbox(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={14} /></button>
                    </div>
                    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                      {messages.length === 0
                        ? <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: T.subtle }}>No messages</div>
                        : messages.map(m => (
                          <div key={m.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}`, background: !m.read ? T.bg : T.white }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                              <span style={{ fontSize: 13, fontWeight: 700 }}>{m.from}</span>
                              <span style={{ fontSize: 11, color: T.subtle }}>{m.time}</span>
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{m.subject}</p>
                            <p style={{ fontSize: 12, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.preview}</p>
                          </div>
                        ))}
                    </div>
                    <div style={{ padding: '8px 14px', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
                      <button style={{ fontSize: 12, color: T.gold, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>View All Messages</button>
                    </div>
                  </div>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowMailbox(false)} />
                </>
              )}
            </div>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button className="fmba-icon-btn" onClick={() => { closeAll(); setShowNotifications(v => !v); }}>
                <Bell size={16} />
                {notifications.length > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: T.red }} />}
              </button>
              {showNotifications && (
                <>
                  <div className="fmba-dropdown" style={{ width: 300 }}>
                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                      <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted }}><X size={14} /></button>
                    </div>
                    <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                      {notifications.length === 0
                        ? <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: T.subtle }}>No notifications</div>
                        : notifications.slice(0, 6).map(n => (
                          <div key={n.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
                            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{n.title}</p>
                            <p style={{ fontSize: 12, color: T.muted }}>{n.message}</p>
                            <p style={{ fontSize: 11, color: T.subtle, marginTop: 3 }}>{n.time}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowNotifications(false)} />
                </>
              )}
            </div>

            {/* Help */}
            <div style={{ position: 'relative' }}>
              <button className="fmba-icon-btn" onClick={() => { closeAll(); setShowHelp(v => !v); }}><HelpCircle size={16} /></button>
              {showHelp && (
                <>
                  <div className="fmba-dropdown" style={{ width: 200 }}>
                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${T.border}` }}><span style={{ fontWeight: 700, fontSize: 14 }}>Help</span></div>
                    <div style={{ padding: 6 }}>
                      {[
                        { icon: BookOpen,     label: 'Documentation'   },
                        { icon: Video,        label: 'Video Tutorials' },
                        { icon: MessageSquare,label: 'Contact Support' },
                        { icon: HelpCircle,   label: 'FAQs'            },
                      ].map(({ icon: Icon, label }) => (
                        <a key={label} href="#" className="fmba-user-menu-item"><Icon size={14} style={{ color: T.navy }} />{label}</a>
                      ))}
                    </div>
                  </div>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setShowHelp(false)} />
                </>
              )}
            </div>

            {/* User menu */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => { closeAll(); setUserMenuOpen(v => !v); }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.white, cursor: 'pointer', transition: 'all .18s', boxShadow: '0 1px 4px rgba(26,39,68,0.06)' }}>
                <div className="fmba-avatar" style={{ border: livePhoto ? `2px solid ${T.gold}` : `2px solid ${T.border}` }}>
                  {livePhoto
                    ? <img src={livePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : <span style={{ fontSize: 13, fontWeight: 800, color: '#1a2744' }}>{initials}</span>}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, lineHeight: 1.3 }}>{user?.full_name?.split(' ')[0] || 'Faculty'}</div>
                  <div style={{ fontSize: 11, color: T.subtle, lineHeight: 1.3 }}>Instructor</div>
                </div>
                <ChevronDown size={13} style={{ color: T.subtle, transition: 'transform .2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none', marginLeft: 2 }} />
              </button>
              {userMenuOpen && (
                <>
                  <div className="fmba-dropdown" style={{ width: 210 }}>
                    <div style={{ padding: '13px 14px 9px', borderBottom: `1px solid ${T.border}` }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{user?.full_name || 'Faculty'}</p>
                      <p style={{ fontSize: 12, color: T.subtle }}>{user?.email || ''}</p>
                    </div>
                    <div style={{ padding: 4 }}>
                      <button className="fmba-user-menu-item" onClick={() => { closeAll(); navigate('/faculty/profile'); }}><User size={14} /> Profile</button>
                      <button className="fmba-user-menu-item" onClick={() => { closeAll(); navigate('/faculty/settings'); }}><Settings size={14} /> Settings</button>
                      <hr className="fmba-divider" />
                      <button className="fmba-user-menu-item danger" onClick={handleLogout}><LogOut size={14} /> Logout</button>
                    </div>
                  </div>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={closeAll} />
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main style={{ flex: 1, overflowY: 'auto', background: T.bg }}>
          <div className="fmba-content">
            <Routes>
              <Route path="/"                    element={<Overview />}               />
              <Route path="/courses"             element={<MyCourses />}              />
              <Route path="/course-assignment"   element={<CourseAssignment />}       />
              <Route path="/students"            element={<StudentManagement />}      />
              <Route path="/content-upload"      element={<ContentUpload />}          />
              <Route path="/assignments"         element={<AssignmentManagement />}   />
              <Route path="/quizzes"             element={<QuizExamManagement />}     />
              <Route path="/attendance"          element={<AttendanceTracking />}     />
              <Route path="/live-classes"        element={<LiveClassScheduling />}    />
              <Route path="/announcements"       element={<AnnouncementManagement />} />
              <Route path="/batches"             element={<BatchManagement />}        />
              <Route path="/batch-notify"        element={<BatchNotifications />}     />
              <Route path="/doubts"              element={<DoubtClearing />}          />
              <Route path="/discussion"          element={<DiscussionForum />}        />
              <Route path="/analytics"           element={<PerformanceAnalytics />}   />
              <Route path="/jobs"                element={<JobsModule />}             />
              <Route path="/settings"            element={<SystemSettings />}         />
              <Route path="/profile"             element={<FacultyProfile />}         />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}