// COMPLETE TALENTLMS-STYLE FACULTY DASHBOARD
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Profile from './Profile';
import {
  Users, BookOpen, TrendingUp, GraduationCap, UserCheck,
  BarChart3, Settings, FileText, Award, Activity, LogOut,
  Search, Download, Plus, Edit2, Trash2, Eye, X, CheckCircle,
  XCircle, Calendar, Clock, Mail, Phone, Upload, Star, AlertCircle,
  ChevronRight, Bell, Shield, Zap, UserPlus,
  RefreshCw, Archive, FilePlus, Video,
  HelpCircle, User, Menu, ChevronDown, HardDrive, ClipboardList,
  MonitorPlay, Megaphone, MessageCircle, MessageSquare, Send,
  Layers,
} from 'lucide-react';

// ==================== OVERVIEW COMPONENT ====================
function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const handleFocus = () => fetchDashboardData(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchDashboardData(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const response = await api.get('/faculty/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.stats || {});
        setRecentActivities(response.data.activities || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;
  if (!stats) return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Unable to load dashboard data.</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Faculty Dashboard Overview</h2>
          {lastUpdated && <p className="text-xs text-gray-400 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchDashboardData(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/faculty/courses" className="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md">
            <BookOpen size={20} /> Manage Courses
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: BookOpen, label: 'My Courses', value: stats.totalCourses, sub: 'Active courses', color: 'from-blue-500 to-blue-600' },
          { icon: Users, label: 'Total Students', value: stats.totalStudents, sub: 'Across all courses', color: 'from-green-500 to-green-600' },
          { icon: ClipboardList, label: 'Pending Tasks', value: stats.pendingExams != null && stats.pendingAssignments != null ? stats.pendingExams + stats.pendingAssignments : null, sub: 'Exams & Assignments', color: 'from-yellow-500 to-yellow-600' },
          { icon: Video, label: 'Watch Time', value: stats.totalWatchTime != null ? `${stats.totalWatchTime}h` : null, sub: 'Total engagement', color: 'from-purple-500 to-purple-600' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg text-white`}>
            <Icon className="h-10 w-10 mb-3 opacity-80" />
            <h3 className="text-sm font-medium mb-1 opacity-90">{label}</h3>
            <p className="text-3xl font-bold">{value ?? '—'}</p>
            <p className="text-xs mt-2 opacity-75">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: GraduationCap, label: 'Average Grade', value: stats.averageGrade != null ? `${stats.averageGrade}%` : '—', border: 'border-blue-500', text: 'text-blue-500' },
          { icon: MonitorPlay, label: 'Live Classes', value: stats.liveClasses ?? '—', border: 'border-green-500', text: 'text-green-500' },
          { icon: Activity, label: 'Active Enrollments', value: stats.activeEnrollments ?? '—', border: 'border-yellow-500', text: 'text-yellow-500' },
          { icon: Award, label: 'Completed', value: stats.completedAssignments ?? '—', border: 'border-purple-500', text: 'text-purple-500' },
        ].map(({ icon: Icon, label, value, border, text }) => (
          <div key={label} className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${border}`}>
            <Icon className={`h-10 w-10 ${text} mb-3`} />
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{label}</h3>
            <p className="text-2xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { to: '/faculty/content-upload', icon: Upload, label: 'Upload Content', sub: 'Videos, PDFs' },
            { to: '/faculty/assignments', icon: ClipboardList, label: 'Assignments', sub: 'Create & grade' },
            { to: '/faculty/live-classes', icon: MonitorPlay, label: 'Live Classes', sub: 'Schedule' },
            { to: '/faculty/analytics', icon: BarChart3, label: 'Analytics', sub: 'View reports' },
            { to: '/faculty/attendance', icon: UserCheck, label: 'Attendance', sub: 'Track' },
          ].map(({ to, icon: Icon, label, sub }) => (
            <Link key={to} to={to} className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group">
              <Icon className="text-accent group-hover:scale-110 transition" size={32} />
              <div className="text-center mt-2">
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-gray-600">{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Performance Overview</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          {stats.performance ? (
            <div className="space-y-4">
              {Object.entries(stats.performance).map(([label, value]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{label}</span><span className="font-semibold">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm">No performance data available.</p>}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <Activity className="text-accent" size={20} />
          </div>
          {recentActivities.length === 0 ? (
            <p className="text-gray-400 text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MY COURSES COMPONENT ====================
function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({ course_name: '', code: '', description: '', status: 'active', duration_hours: '', schedule: '' });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/faculty/courses');
      if (response.data.success) setCourses(response.data.courses || []);
    } catch (error) { console.error('Error fetching courses:', error); }
    finally { setLoading(false); }
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setEditForm({ course_name: course.course_name || '', code: course.code || '', description: course.description || '', status: course.status || 'active', duration_hours: course.duration_hours || '', schedule: course.schedule || '' });
    setShowEditModal(true);
  };

  const handleEditCourse = async () => {
    if (!editForm.course_name.trim()) { alert('Course name is required'); return; }
    try {
      const response = await api.put(`/faculty/courses/${editingCourse.id}`, editForm);
      if (response.data.success) {
        setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...editForm } : c));
        setShowEditModal(false);
        setEditingCourse(null);
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert(error.response?.data?.message || 'Failed to update course.');
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.course_name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || c.status.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">My Courses</h2>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" /> Create Course
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="text" placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'draft'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg capitalize transition ${filter === f ? 'bg-accent text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No courses found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-accent to-blue-600"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{course.course_name}</h3>
                    <p className="text-sm text-gray-500">{course.code}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{course.status}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="space-y-2 mb-4">
                  {[
                    { icon: Users, label: 'Students', value: course.students ?? '—' },
                    { icon: Clock, label: 'Duration', value: course.duration_hours != null ? `${course.duration_hours}h` : '—' },
                    { icon: Calendar, label: 'Schedule', value: course.schedule || '—' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-gray-600"><Icon size={16} />{label}</span>
                      <span className="font-semibold text-gray-800 text-xs">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link to={`/faculty/course/${course.id}`} className="flex-1 bg-accent hover:bg-blue-600 text-white text-center py-2 rounded-lg font-semibold transition text-sm">Manage</Link>
                  <button onClick={() => openEditModal(course)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold transition text-sm">Edit</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Edit Course</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Name *</label>
                <input type="text" value={editForm.course_name} onChange={e => setEditForm({ ...editForm, course_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. Introduction to Python" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Course Code</label>
                  <input type="text" value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. CS101" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (hours)</label>
                  <input type="number" value={editForm.duration_hours} onChange={e => setEditForm({ ...editForm, duration_hours: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="40" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule</label>
                  <input type="text" value={editForm.schedule} onChange={e => setEditForm({ ...editForm, schedule: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. Mon-Wed 10AM" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="Course description..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleEditCourse} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Save Changes</button>
              <button onClick={() => setShowEditModal(false)} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== CONTENT UPLOAD COMPONENT ====================
function ContentUpload() {
  const [uploadType, setUploadType] = useState('video');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', file: null, duration: '', order: '' });
  const [uploadedContent, setUploadedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchContent, setSearchContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // View / Edit / Delete state
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchCourses(); fetchUploadedContent(); }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/faculty/courses');
      if (response.data.success) setCourses(response.data.courses || []);
    } catch (error) { console.error('Error fetching courses:', error); }
  };

  const fetchUploadedContent = async () => {
    try {
      const response = await api.get('/faculty/content');
      if (response.data.success) setUploadedContent(response.data.content || []);
    } catch (error) { console.error('Error fetching content:', error); }
    finally { setLoading(false); }
  };

  const handleFileSelect = (file) => { if (file) setUploadForm(f => ({ ...f, file })); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.file || !selectedCourse) {
      setErrorMsg('Please fill all required fields and select a file');
      return;
    }
    setErrorMsg('');
    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);
    formData.append('file', uploadForm.file);
    formData.append('type', uploadType);
    formData.append('course', selectedCourse);
    formData.append('duration', uploadForm.duration);
    formData.append('order', uploadForm.order);
    try {
      const response = await api.post('/faculty/content/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        }
      });
      if (response.data.success) {
        setUploadedContent(prev => [response.data.content, ...prev]);
        setUploadForm({ title: '', description: '', file: null, duration: '', order: '' });
        setSelectedCourse('');
        setUploadProgress(100);
        setUploadSuccess(true);
        setTimeout(() => { setUploadSuccess(false); setUploadProgress(0); }, 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMsg('Upload failed. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  // View handler
  const handleViewContent = (item) => { setViewItem(item); };

  // Edit handler
  const handleEditContent = (item) => {
    setEditItem(item);
    setEditForm({ title: item.title || '', description: item.description || '', duration: item.duration || '', order: item.display_order || item.order || '', course_id: item.course_id || '' });
  };

  const handleEditSave = async () => {
    if (!editForm.title) { alert('Title is required'); return; }
    setEditSaving(true);
    try {
      const res = await api.put(`/faculty/content/${editItem.id}`, editForm);
      if (res.data.success) {
        setUploadedContent(prev => prev.map(c => c.id === editItem.id ? { ...c, ...editForm } : c));
        setEditItem(null);
      } else {
        setErrorMsg('Failed to save changes');
      }
    } catch (e) {
      console.error('Edit error:', e);
      setErrorMsg('Failed to save changes');
    } finally {
      setEditSaving(false);
    }
  };

  // Delete handler
  const handleDeleteContent = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      await api.delete(`/faculty/content/${item.id}`);
      setUploadedContent(prev => prev.filter(c => c.id !== item.id));
    } catch (e) {
      console.error('Delete error:', e);
      setErrorMsg('Delete failed. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const resolveFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http')) return filePath;
    const base = (import.meta?.env?.VITE_API_URL || 'https://upskillize-lms-backend.onrender.com/api').replace(/\/api$/, '');
    return base + filePath;
  };

  const typeConfig = {
    video: { icon: Video, color: 'from-red-500 to-pink-600', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', badge: 'bg-red-100 text-red-700', accept: 'video/*', label: 'MP4, AVI, MOV' },
    pdf: { icon: FileText, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', accept: '.pdf', label: 'PDF files' },
    ppt: { icon: FilePlus, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', badge: 'bg-orange-100 text-orange-700', accept: '.ppt,.pptx', label: 'PPT, PPTX' },
    scorm: { icon: Archive, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', badge: 'bg-green-100 text-green-700', accept: '.zip', label: 'ZIP package' },
  };

  const activeType = typeConfig[uploadType];
  const ActiveIcon = activeType.icon;

  const filteredContent = uploadedContent.filter(c => {
    const matchType = filterType === 'all' || c.type === filterType;
    const matchSearch = (c.title || '').toLowerCase().includes(searchContent.toLowerCase());
    return matchType && matchSearch;
  });

  const statsMap = ['video', 'pdf', 'ppt', 'scorm'].map(t => ({
    type: t, count: uploadedContent.filter(c => c.type === t).length, ...typeConfig[t]
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Library</h2>
          <p className="text-sm text-gray-500 mt-1">Upload and manage your course materials</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2 shadow-sm">
          <HardDrive size={16} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">{uploadedContent.length} files uploaded</span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {statsMap.map(({ type, count, icon: Icon, color }) => (
          <div key={type} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{count}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{type}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* LEFT: Upload Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-r ${activeType.color} p-5`}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  <ActiveIcon size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Upload New Content</h3>
              </div>
              <p className="text-white/75 text-xs">Accepts: {activeType.label}</p>
            </div>

            <div className="p-5 space-y-4">
              {/* Type selector */}
              <div className="grid grid-cols-4 gap-1.5 bg-gray-50 p-1.5 rounded-xl">
                {Object.entries(typeConfig).map(([type, cfg]) => {
                  const TIcon = cfg.icon;
                  return (
                    <button key={type} onClick={() => setUploadType(type)}
                      className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-bold transition-all ${uploadType === type ? `bg-gradient-to-br ${cfg.color} text-white shadow-sm` : 'text-gray-500 hover:bg-white hover:text-gray-700'}`}>
                      <TIcon size={16} className="mb-0.5" />
                      {type.toUpperCase()}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Content Title *</label>
                <input type="text" value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition"
                  placeholder="e.g. Introduction to Arrays" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Course *</label>
                <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition bg-white">
                  <option value="">Choose a course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.course_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {uploadType === 'video' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Duration (min)</label>
                    <input type="number" value={uploadForm.duration} onChange={e => setUploadForm(f => ({ ...f, duration: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition" placeholder="45" />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Display Order</label>
                  <input type="number" value={uploadForm.order} onChange={e => setUploadForm(f => ({ ...f, order: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition" placeholder="1" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} rows="2"
                  className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition resize-none"
                  placeholder="Brief description..." />
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all ${isDragging ? `border-blue-400 ${activeType.bg} scale-[1.01]` : uploadForm.file ? `${activeType.border} ${activeType.bg}` : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
                <input type="file" id="cu-file" className="hidden" accept={activeType.accept} onChange={e => handleFileSelect(e.target.files[0])} />
                {uploadForm.file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activeType.color} flex items-center justify-center`}>
                        <ActiveIcon size={18} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-bold ${activeType.text} truncate max-w-[140px]`}>{uploadForm.file.name}</p>
                        <p className="text-xs text-gray-500">{(uploadForm.file.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => setUploadForm(f => ({ ...f, file: null }))}
                      className="w-7 h-7 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition text-gray-500">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="cu-file" className="cursor-pointer block">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeType.color} flex items-center justify-center mx-auto mb-2 opacity-80`}>
                      <Upload size={22} className="text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">Drop file here or <span className={`${activeType.text} underline underline-offset-2`}>browse</span></p>
                    <p className="text-xs text-gray-400 mt-1">{activeType.label} supported</p>
                  </label>
                )}
              </div>

              {(uploading || uploadProgress > 0) && (
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-gray-600">{uploading ? 'Uploading...' : uploadSuccess ? '✅ Upload complete!' : ''}</span>
                    <span className={activeType.text}>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full bg-gradient-to-r ${activeType.color} transition-all duration-300`} style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <button onClick={handleUpload} disabled={uploading}
                className={`w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all shadow-sm bg-gradient-to-r ${activeType.color} hover:opacity-90 disabled:opacity-50`}>
                {uploading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Uploading...</> : <><Upload size={18} /> Upload {uploadType.toUpperCase()}</>}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Content Library */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800">Uploaded Content</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-semibold">{filteredContent.length} items</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex-1 min-w-[160px] relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={searchContent} onChange={e => setSearchContent(e.target.value)} placeholder="Search content..."
                    className="w-full pl-8 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
                <div className="flex gap-1.5">
                  {['all', 'video', 'pdf', 'ppt', 'scorm'].map(f => (
                    <button key={f} onClick={() => setFilterType(f)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition capitalize ${filterType === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {f === 'all' ? 'All' : f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                </div>
              ) : filteredContent.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <HardDrive size={28} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 font-semibold">No content found</p>
                  <p className="text-gray-300 text-sm mt-1">Upload your first file using the form</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredContent.map((content) => {
                    const cfg = typeConfig[content.type] || typeConfig.pdf;
                    const CIcon = cfg.icon;
                    return (
                      <div key={content.id} className="group border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <CIcon size={20} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-800 text-sm truncate leading-tight">{content.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 truncate">{content.course || '—'}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${cfg.badge}`}>{content.type}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-3">
                            {content.size && <span className="flex items-center gap-1"><HardDrive size={11} />{content.size}</span>}
                            {content.uploadDate && <span className="flex items-center gap-1"><Calendar size={11} />{content.uploadDate}</span>}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleViewContent(content)} title="View"
                              className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition">
                              <Eye size={13} />
                            </button>
                            <button onClick={() => handleEditContent(content)} title="Edit"
                              className="w-7 h-7 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center transition">
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => handleDeleteContent(content)} disabled={deletingId === content.id} title="Delete"
                              className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition disabled:opacity-50">
                              {deletingId === content.id
                                ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-red-400 border-t-transparent" />
                                : <Trash2 size={13} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {viewItem && (() => {
        const cfg = typeConfig[viewItem.type] || typeConfig.pdf;
        const Icon = cfg.icon;
        const url = resolveFileUrl(viewItem.file_path);
        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setViewItem(null)}>
            <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className={`bg-gradient-to-r ${cfg.color} p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{viewItem.title}</h3>
                    <span className="text-white/70 text-xs uppercase">{viewItem.type}</span>
                  </div>
                </div>
                <button onClick={() => setViewItem(null)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition">
                  <X size={18} />
                </button>
              </div>
              <div className="bg-black" style={{ minHeight: '320px' }}>
                {viewItem.type === 'video' && url ? (
                  <video src={url} controls className="w-full max-h-[420px]" />
                ) : viewItem.type === 'pdf' && url ? (
                  <iframe src={url} className="w-full" style={{ height: '420px' }} title={viewItem.title} />
                ) : viewItem.type === 'ppt' && url ? (
                  <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`} className="w-full bg-white" style={{ height: '420px' }} title={viewItem.title} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Icon size={48} className="text-white/30 mb-4" />
                    {url
                      ? <a href={url} download target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${cfg.color} text-white font-bold`}><Download size={18} /> Download File</a>
                      : <p className="text-white/50">No file available</p>}
                  </div>
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {viewItem.description && <p>{viewItem.description}</p>}
                  {viewItem.duration && <p className="text-xs mt-1">Duration: {viewItem.duration} min</p>}
                </div>
                {url && (
                  <a href={url} download target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition">
                    <Download size={15} /> Download
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* EDIT MODAL */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditItem(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-4 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2"><Edit2 size={18} /> Edit Content</h3>
              <button onClick={() => setEditItem(null)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title *</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows="3"
                  className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Duration (min)</label>
                  <input type="number" value={editForm.duration} onChange={e => setEditForm(f => ({ ...f, duration: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Display Order</label>
                  <input type="number" value={editForm.order} onChange={e => setEditForm(f => ({ ...f, order: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditItem(null)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleEditSave} disabled={editSaving}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {editSaving ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Saving...</> : <><CheckCircle size={16} /> Save Changes</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== GRADE SUBMISSION CARD ====================
function GradeSubmissionCard({ submission, assignment, onGrade }) {
  const [rubricScores, setRubricScores] = useState(() => {
    const init = {};
    (assignment.rubric?.categories || []).forEach((cat, i) => { init[i] = ''; });
    return init;
  });
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const totalGrade = Object.values(rubricScores).reduce((s, v) => s + (parseInt(v) || 0), 0);
  const maxGrade = (assignment.rubric?.categories || []).reduce((s, c) => s + (parseInt(c.points) || 0), 0) || assignment.total_marks || assignment.totalMarks || 100;

  const handleSubmit = async () => {
    setSubmitting(true);
    try { await onGrade(submission, rubricScores, feedback); setDone(true); }
    finally { setSubmitting(false); }
  };

  const fileUrl = submission.file_url || submission.file_path || submission.fileUrl;

  if (done) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-5 flex items-center gap-3">
        <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
        <div>
          <p className="font-bold text-green-800">{submission.studentName || submission.student_name} — Graded</p>
          <p className="text-sm text-green-600">{totalGrade}/{maxGrade} marks · Feedback saved</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
            {(submission.studentName || submission.student_name || 'S').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800">{submission.studentName || submission.student_name}</p>
            <p className="text-xs text-gray-500">
              Submitted: {submission.submittedDate || submission.submitted_at
                ? new Date(submission.submittedDate || submission.submitted_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—'}
            </p>
          </div>
        </div>
        {fileUrl && (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-100 transition">
            <Eye size={14} /> View Submission File
          </a>
        )}
      </div>

      {submission.notes && (
        <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-300">
          <p className="text-xs font-semibold text-gray-500 mb-1">Student Notes:</p>
          <p className="text-sm text-gray-700">{submission.notes}</p>
        </div>
      )}

      {assignment.rubric?.categories?.length > 0 ? (
        <div>
          <h5 className="font-semibold text-gray-700 mb-3">Grade by Rubric:</h5>
          <div className="space-y-3">
            {assignment.rubric.categories.map((category, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 bg-gray-50 rounded-lg p-3">
                <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                <div className="flex items-center gap-2">
                  <input type="number" max={category.points} min="0" value={rubricScores[idx]}
                    onChange={e => { const val = Math.min(parseInt(e.target.value) || 0, parseInt(category.points)); setRubricScores(prev => ({ ...prev, [idx]: val })); }}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="0" />
                  <span className="text-sm text-gray-500 font-medium">/ {category.points} pts</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 bg-blue-50 rounded-lg p-3">
            <span className="text-sm font-semibold text-blue-700">Total Score:</span>
            <span className="text-xl font-bold text-blue-800">{totalGrade}</span>
            <span className="text-sm text-blue-500">/ {maxGrade} marks</span>
            <div className="flex-1 bg-blue-200 rounded-full h-2 ml-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${maxGrade > 0 ? (totalGrade / maxGrade) * 100 : 0}%` }} />
            </div>
            <span className="text-sm font-bold text-blue-700">{maxGrade > 0 ? Math.round((totalGrade / maxGrade) * 100) : 0}%</span>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Marks <span className="text-gray-400 font-normal">/ {maxGrade}</span></label>
          <input type="number" min="0" max={maxGrade} value={rubricScores[0] || ''}
            onChange={e => setRubricScores({ 0: Math.min(parseInt(e.target.value) || 0, maxGrade) })}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg text-center font-bold text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="0" />
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Feedback <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none" rows={3}
          placeholder="Write feedback for the student..." />
      </div>

      <button onClick={handleSubmit} disabled={submitting}
        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-bold transition flex items-center justify-center gap-2">
        {submitting ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Submitting...</> : <><CheckCircle size={18} /> Submit Grade ({totalGrade}/{maxGrade})</>}
      </button>
    </div>
  );
}

// ==================== ASSIGNMENT MANAGEMENT COMPONENT ====================
function AssignmentManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [showAllSubmissionsModal, setShowAllSubmissionsModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [assignmentForm, setAssignmentForm] = useState({
    title: '', course: '', dueDate: '', totalMarks: '', description: '',
    rubricCategories: [{ name: '', points: '' }]
  });

  useEffect(() => { fetchAssignments(); fetchCourses(); }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/faculty/assignments');
      if (response.data.success) {
        const normalized = (response.data.assignments || []).map(a => ({
          ...a,
          total_marks: a.total_marks ?? a.totalMarks ?? a.max_marks ?? a.maxMarks ?? 0,
          graded: a.graded ?? a.graded_count ?? a.gradedCount ?? 0,
          submissions: a.submissions ?? a.submission_count ?? a.submissionCount ?? 0,
          totalStudents: a.totalStudents ?? a.total_students ?? a.studentCount ?? 0,
        }));
        setAssignments(normalized);
      }
    } catch (error) {
      if (error?.response?.status !== 404) console.error('Error fetching assignments:', error);
    } finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get('/faculty/courses');
      if (response.data.success) setCourses(response.data.courses || []);
    } catch (error) { console.error('Error fetching courses:', error); }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await api.get(`/faculty/assignments/${assignmentId}/submissions`);
      if (response.data.success) setSubmissions(response.data.submissions || []);
    } catch (error) { console.error('Error fetching submissions:', error); }
  };

  const addRubricCategory = () => setAssignmentForm({ ...assignmentForm, rubricCategories: [...assignmentForm.rubricCategories, { name: '', points: '' }] });
  const removeRubricCategory = (index) => setAssignmentForm({ ...assignmentForm, rubricCategories: assignmentForm.rubricCategories.filter((_, i) => i !== index) });

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.course) return;
    try {
      const response = await api.post('/faculty/assignments', {
        ...assignmentForm,
        totalMarks: parseInt(assignmentForm.totalMarks),
        rubric: { categories: assignmentForm.rubricCategories.map(cat => ({ name: cat.name, points: parseInt(cat.points) })) }
      });
      if (response.data.success) {
        setAssignments([...assignments, response.data.assignment]);
        setShowCreateModal(false);
        setEditingId(null);
        setAssignmentForm({ title: '', course: '', dueDate: '', totalMarks: '', description: '', rubricCategories: [{ name: '', points: '' }] });
      }
    } catch (error) { console.error('Error creating assignment:', error); alert('Failed to create assignment.'); }
  };

  const openGradingModal = (assignment) => { setSelectedAssignment(assignment); fetchSubmissions(assignment.id); setShowGradingModal(true); };
  const openAllSubmissionsModal = (assignment) => { setSelectedAssignment(assignment); fetchSubmissions(assignment.id); setShowAllSubmissionsModal(true); };
  const openFileViewer = (url, name) => { setViewingFile({ url, name }); setShowFileModal(true); };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try { await api.delete(`/faculty/assignments/${assignmentId}`); setAssignments(assignments.filter(a => a.id !== assignmentId)); }
    catch (error) { console.error('Error deleting assignment:', error); alert('Failed to delete assignment.'); }
  };

  const handleGradeSubmission = async (submission, rubricScores, feedback) => {
    const totalGrade = Object.values(rubricScores).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
    if (totalGrade === 0 && !feedback.trim()) { alert('Please enter at least a grade or feedback before submitting.'); return; }
    try {
      await api.post(`/faculty/assignments/${selectedAssignment.id}/grade`, {
        submission_id: submission.id,
        student_id: submission.student_id || submission.studentId,
        studentId: submission.student_id || submission.studentId,
        grade: totalGrade,
        max_marks: (selectedAssignment.rubric?.categories || []).reduce((s, c) => s + (parseInt(c.points) || 0), 0) || selectedAssignment.total_marks || 100,
        feedback: feedback.trim(),
        rubric_scores: rubricScores,
      });
      const updatedSubmissions = submissions.map(s => s.id === submission.id ? { ...s, grade: totalGrade, feedback: feedback.trim(), status: 'graded' } : s);
      setSubmissions(updatedSubmissions);
      const newGradedCount = updatedSubmissions.filter(s => s.grade !== null && s.grade !== undefined).length;
      setAssignments(prev => prev.map(a => a.id === selectedAssignment.id ? { ...a, graded: newGradedCount } : a));
      setTimeout(() => fetchAssignments(), 1000);
    } catch (error) { console.error('Error grading submission:', error); alert(error.response?.data?.message || 'Failed to submit grade.'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-primary">Assignment Management</h2>
          <button onClick={() => { setShowCreateModal(true); setEditingId(null); setAssignmentForm({ title: '', course: '', dueDate: '', totalMarks: '', description: '', rubricCategories: [{ name: '', points: '' }] }); }}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" /> Create Assignment
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <ClipboardList className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No assignments found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{assignment.title}</h3>
                    <p className="text-sm text-gray-500">{assignment.course}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{assignment.status}</span>
                </div>
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center text-gray-600"><Calendar className="h-4 w-4 mr-2" /><span className="text-sm">Due: {assignment.dueDate}</span></div>
                  <div className="flex items-center text-gray-600"><Star className="h-4 w-4 mr-2" /><span className="text-sm">{assignment.total_marks ?? 0} marks</span></div>
                  <div className="flex items-center text-gray-600"><CheckCircle className="h-4 w-4 mr-2" /><span className="text-sm">{assignment.submissions}/{assignment.totalStudents} submitted</span></div>
                  <div className="flex items-center text-gray-600"><GraduationCap className="h-4 w-4 mr-2" /><span className="text-sm">{assignment.graded}/{assignment.submissions} graded</span></div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Submission Progress</span>
                    <span>{assignment.totalStudents > 0 ? Math.round((assignment.submissions / assignment.totalStudents) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: assignment.totalStudents > 0 ? `${(assignment.submissions / assignment.totalStudents) * 100}%` : '0%' }} />
                  </div>
                </div>
                {assignment.rubric && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Grading Rubric:</h4>
                    <div className="flex flex-wrap gap-2">
                      {assignment.rubric.categories.map((cat, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{cat.name}: {cat.points} pts</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => openGradingModal(assignment)} className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold flex items-center gap-2">
                    <GraduationCap size={16} /> Grade Submissions ({assignment.submissions - assignment.graded} pending)
                  </button>
                  <button onClick={() => openAllSubmissionsModal(assignment)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold flex items-center gap-2">
                    <Eye size={16} /> View All Submissions
                  </button>
                  <button onClick={() => {
                    setAssignmentForm({ title: assignment.title, course: assignment.course_id || assignment.course, dueDate: assignment.due_date || assignment.dueDate, totalMarks: assignment.total_marks || assignment.totalMarks, description: assignment.description || '', rubricCategories: assignment.rubric?.categories || [{ name: '', points: '' }] });
                    setEditingId(assignment.id);
                    setShowCreateModal(true);
                  }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-semibold">
                    <Edit2 className="h-4 w-4 inline mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDeleteAssignment(assignment.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-semibold flex items-center gap-1">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Assignment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-8 max-w-3xl w-full mx-4 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary">{editingId ? 'Edit Assignment' : 'Create New Assignment'}</h3>
                <button onClick={() => { setShowCreateModal(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assignment Title *</label>
                    <input type="text" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g., Project: Build a Web Application" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Course *</label>
                    <select value={assignmentForm.course} onChange={(e) => setAssignmentForm({ ...assignmentForm, course: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                      <option value="">Select Course</option>
                      {courses.map(course => <option key={course.id} value={course.id}>{course.code} - {course.course_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date *</label>
                    <input type="date" value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                    <textarea value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" rows="4" placeholder="Assignment description and requirements..." />
                  </div>
                </div>
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-bold text-gray-800">Grading Rubric</h4>
                    <button onClick={addRubricCategory} className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-1">
                      <Plus size={16} /> Add Category
                    </button>
                  </div>
                  <div className="space-y-3">
                    {assignmentForm.rubricCategories.map((category, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input type="text" value={category.name}
                          onChange={(e) => { const newCategories = [...assignmentForm.rubricCategories]; newCategories[index].name = e.target.value; setAssignmentForm({ ...assignmentForm, rubricCategories: newCategories }); }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="Category name (e.g., Code Quality)" />
                        <input type="number" value={category.points}
                          onChange={(e) => { const newCategories = [...assignmentForm.rubricCategories]; newCategories[index].points = e.target.value; setAssignmentForm({ ...assignmentForm, rubricCategories: newCategories }); }}
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="Points" />
                        {assignmentForm.rubricCategories.length > 1 && (
                          <button onClick={() => removeRubricCategory(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800"><strong>Total Points:</strong> {assignmentForm.rubricCategories.reduce((sum, cat) => sum + (parseInt(cat.points) || 0), 0)}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleCreateAssignment} className="flex-1 px-4 py-3 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                  {editingId ? 'Update Assignment' : 'Create Assignment'}
                </button>
                <button onClick={() => { setShowCreateModal(false); setEditingId(null); }} className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Grading Modal */}
        {showGradingModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary">Grade Submissions — {selectedAssignment.title}</h3>
                <button onClick={() => setShowGradingModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
              </div>
              {submissions.filter(s => s.grade === null || s.grade === undefined).length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-semibold">All submissions have been graded!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {submissions.filter(s => s.grade === null || s.grade === undefined).map((submission) => (
                    <GradeSubmissionCard key={submission.id} submission={submission} assignment={selectedAssignment} onGrade={handleGradeSubmission} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* All Submissions Modal */}
      {showAllSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setShowAllSubmissionsModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col" style={{ maxHeight: '92vh' }}>
            <div className="flex items-center justify-between px-7 py-5 border-b flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">All Submissions</h3>
                <p className="text-sm text-gray-500 mt-0.5">{selectedAssignment.title} · {selectedAssignment.course}</p>
              </div>
              <button onClick={() => setShowAllSubmissionsModal(false)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-3 gap-4 px-7 py-4 bg-gray-50 border-b flex-shrink-0">
              {[
                { count: submissions.length, label: 'Total Submitted', color: 'blue' },
                { count: submissions.filter(s => s.grade !== null && s.grade !== undefined).length, label: 'Graded', color: 'green' },
                { count: submissions.filter(s => s.grade === null || s.grade === undefined).length, label: 'Pending', color: 'yellow' },
              ].map(({ count, label, color }) => (
                <div key={label} className={`bg-${color}-50 rounded-xl p-4 text-center`}>
                  <p className={`text-2xl font-bold text-${color}-700`}>{count}</p>
                  <p className={`text-xs text-${color}-500 font-semibold mt-1`}>{label}</p>
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
              {submissions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-400 font-semibold text-lg">No submissions yet</p>
                </div>
              ) : submissions.map((sub, idx) => {
                const isGraded = sub.grade !== null && sub.grade !== undefined;
                const fileUrl = sub.file_url || sub.file_path || sub.fileUrl || sub.submission_file;
                const rawName = sub.file_name || sub.fileName || (fileUrl ? decodeURIComponent(fileUrl.split('/').pop().split('?')[0]) : '');
                const isPdf = /\.pdf$/i.test(rawName || fileUrl || '');
                const isDoc = /\.(doc|docx)$/i.test(rawName || fileUrl || '');
                const isImg = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(rawName || fileUrl || '');
                const fileIcon = isPdf ? '📄' : isDoc ? '📝' : isImg ? '🖼️' : '📎';

                return (
                  <div key={sub.id || idx} className={`border rounded-xl p-5 transition ${isGraded ? 'border-green-200 bg-green-50/30' : 'border-gray-200 bg-white hover:border-blue-300'}`}>
                    <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                          {(sub.studentName || sub.student_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{sub.studentName || sub.student_name || '—'}</p>
                          <p className="text-xs text-gray-500">{sub.studentEmail || sub.student_email || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${isGraded ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {isGraded ? `✅ ${sub.grade}/${selectedAssignment.totalMarks || selectedAssignment.total_marks} pts` : '⏳ Pending Grade'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {sub.submitted_at || sub.submittedDate ? new Date(sub.submitted_at || sub.submittedDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                      </div>
                    </div>
                    {sub.notes && (
                      <div className="bg-gray-50 border-l-4 border-gray-300 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Student Notes</p>
                        <p className="text-sm text-gray-700">{sub.notes}</p>
                      </div>
                    )}
                    {fileUrl ? (
                      <div className="mt-1">
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3">
                          <span className="text-2xl">{fileIcon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{rawName || 'Submitted File'}</p>
                            <p className="text-xs text-gray-400">{isPdf ? 'PDF Document' : isDoc ? 'Word Document' : isImg ? 'Image File' : 'Document'}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => openFileViewer(fileUrl, rawName || 'submission')}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1">
                              <Eye size={13} /> {isPdf ? 'View PDF' : isDoc ? 'View Doc' : isImg ? 'View Image' : 'Preview'}
                            </button>
                            <a href={fileUrl} download={rawName} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition flex items-center gap-1">
                              <Download size={13} /> Download
                            </a>
                          </div>
                        </div>
                        {isImg && (
                          <div className="rounded-xl overflow-hidden border border-gray-200 mb-3 cursor-pointer" onClick={() => openFileViewer(fileUrl, rawName || 'image')}>
                            <img src={fileUrl} alt={rawName} className="w-full max-h-48 object-contain bg-gray-50" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic mb-3">No file uploaded — notes only.</p>
                    )}
                    {isGraded && sub.feedback && (
                      <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-green-700 mb-1">Your Feedback</p>
                        <p className="text-sm text-gray-700">{sub.feedback}</p>
                      </div>
                    )}
                    {!isGraded && (
                      <button onClick={() => { setShowAllSubmissionsModal(false); openGradingModal(selectedAssignment); }}
                        className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                        <GraduationCap size={15} /> Grade This Submission
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-7 py-4 border-t flex-shrink-0">
              <button onClick={() => setShowAllSubmissionsModal(false)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {showFileModal && viewingFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={e => { if (e.target === e.currentTarget) setShowFileModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col" style={{ height: '92vh' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0">
                  {/\.pdf$/i.test(viewingFile.name) ? '📄' : /\.(doc|docx)$/i.test(viewingFile.name) ? '📝' : /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(viewingFile.name) ? '🖼️' : '📎'}
                </span>
                <p className="font-bold text-gray-800 truncate">{viewingFile.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <a href={viewingFile.url} download={viewingFile.name} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                  <Download size={14} /> Download
                </a>
                <button onClick={() => setShowFileModal(false)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"><X size={18} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden bg-gray-100 rounded-b-2xl">
              {/\.pdf$/i.test(viewingFile.name || viewingFile.url) ? (
                <iframe src={viewingFile.url} title="PDF" className="w-full h-full border-0" />
              ) : /\.(doc|docx)$/i.test(viewingFile.name || viewingFile.url) ? (
                <iframe src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingFile.url)}&embedded=true`} title="Document" className="w-full h-full border-0" />
              ) : /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(viewingFile.name || viewingFile.url) ? (
                <div className="flex items-center justify-center h-full p-6">
                  <img src={viewingFile.url} alt={viewingFile.name} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
                  <span className="text-7xl">📎</span>
                  <p className="text-gray-600 font-semibold text-lg">This file type can't be previewed in browser.</p>
                  <a href={viewingFile.url} download={viewingFile.name} target="_blank" rel="noopener noreferrer"
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition flex items-center gap-3 text-lg">
                    <Download size={22} /> Download to View
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ==================== QUIZ/EXAM MANAGEMENT COMPONENT ====================
function QuizExamManagement() {
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

  useEffect(() => { fetchQuizzes(); fetchCourses(); }, []);

  const fetchQuizzes = async () => {
    try { const res = await api.get('/faculty/quizzes'); if (res.data.success) setQuizzes(res.data.quizzes || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try { const res = await api.get('/faculty/courses'); if (res.data.success) setCourses(res.data.courses || []); }
    catch (e) { console.error(e); }
  };

  const fetchResults = async (quizId) => {
    setLoadingResults(true);
    try { const res = await api.get(`/quizzes/${quizId}/results`); if (res.data.success) setResults(res.data.attempts || []); }
    catch (e) { console.error(e); }
    finally { setLoadingResults(false); }
  };

  const handleCreateQuiz = async () => {
    if (!quizForm.course_id || !quizForm.title) { alert('Course and title are required'); return; }
    setSaving(true);
    try {
      const res = await api.post('/quizzes', quizForm);
      if (res.data.success) { setSelectedQuiz(res.data.quiz); setView('questions'); }
    } catch (e) { alert(e.response?.data?.message || 'Error creating quiz'); }
    finally { setSaving(false); }
  };

  const handleSaveQuestions = async () => {
    const invalid = questions.some(q => !q.question_text || !q.option_a || !q.option_b);
    if (invalid) { alert('Each question needs text, Option A and Option B'); return; }
    setSaving(true);
    try {
      await api.post(`/quizzes/${selectedQuiz.id}/questions`, { questions });
      await fetchQuizzes();
      setView('list');
      setQuizForm({ course_id: '', title: '', description: '', time_limit_minutes: 30, pass_percentage: 60 });
      setQuestions([{ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', marks: 1 }]);
      alert('✅ Quiz published! Students can now see it.');
    } catch (e) { alert(e.response?.data?.message || 'Error saving questions'); }
    finally { setSaving(false); }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    try { await api.delete(`/quizzes/${quizId}`); setQuizzes(quizzes.filter(q => q.id !== quizId)); }
    catch (e) { alert('Error deleting quiz'); }
  };

  const addQuestion = () => setQuestions([...questions, { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', marks: 1 }]);
  const removeQuestion = (idx) => { if (questions.length === 1) return; setQuestions(questions.filter((_, i) => i !== idx)); };
  const updateQuestion = (idx, field, value) => { const updated = [...questions]; updated[idx][field] = value; setQuestions(updated); };

  if (view === 'results' && selectedQuiz) {
    const passCount = results.filter(r => r.passed).length;
    const avgScore = results.length ? Math.round(results.reduce((s, r) => s + (r.score / r.total_marks * 100), 0) / results.length) : 0;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-800 flex items-center gap-1">
            <ChevronRight size={20} className="rotate-180" /> Back
          </button>
          <div>
            <h2 className="text-2xl font-bold text-primary">Quiz Results</h2>
            <p className="text-sm text-gray-500">{selectedQuiz.title}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Users, color: 'blue', value: results.length, label: 'Total Attempts' },
            { icon: CheckCircle, color: 'green', value: passCount, label: `Passed (${results.length > 0 ? Math.round(passCount / results.length * 100) : 0}%)` },
            { icon: TrendingUp, color: 'orange', value: `${avgScore}%`, label: 'Average Score' },
          ].map(({ icon: Icon, color, value, label }) => (
            <div key={label} className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4">
              <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                <Icon size={22} className={`text-${color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loadingResults ? (
            <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" /></div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><Users size={48} className="mx-auto mb-3 opacity-30" /><p>No attempts yet</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold">
                  <tr>
                    {['#', 'Student', 'Score', 'Percentage', 'Time', 'Status'].map(h => <th key={h} className="px-6 py-3 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((attempt, idx) => {
                    const pct = Math.round((attempt.score / attempt.total_marks) * 100);
                    const mins = Math.floor((attempt.time_taken_seconds || 0) / 60);
                    const secs = (attempt.time_taken_seconds || 0) % 60;
                    return (
                      <tr key={attempt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-400">{idx + 1}</td>
                        <td className="px-6 py-4"><p className="font-semibold text-gray-800">{attempt.Student?.User?.full_name || 'Unknown'}</p><p className="text-gray-400 text-xs">{attempt.Student?.User?.email}</p></td>
                        <td className="px-6 py-4 font-semibold">{attempt.score}/{attempt.total_marks}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-2 rounded-full ${pct >= 60 ? 'bg-green-500' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-semibold">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{mins}m {secs}s</td>
                        <td className="px-6 py-4">
                          {attempt.passed
                            ? <span className="text-green-600 font-semibold text-xs flex items-center gap-1"><CheckCircle size={14} /> Passed</span>
                            : <span className="text-red-500 font-semibold text-xs flex items-center gap-1"><XCircle size={14} /> Failed</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'questions') {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-800 flex items-center gap-1"><ChevronRight size={20} className="rotate-180" /> Back</button>
          <div><h2 className="text-2xl font-bold text-primary">Add Questions</h2><p className="text-sm text-gray-500">Quiz: {selectedQuiz?.title}</p></div>
          <span className="ml-auto text-sm text-gray-500">{questions.length} question(s)</span>
        </div>
        {questions.map((q, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">Question {idx + 1}</h3>
              <button onClick={() => removeQuestion(idx)} disabled={questions.length === 1} className="text-red-400 hover:text-red-600 disabled:opacity-30"><Trash2 size={18} /></button>
            </div>
            <textarea value={q.question_text} onChange={e => updateQuestion(idx, 'question_text', e.target.value)} placeholder="Enter your question here..." rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-4 focus:ring-2 focus:ring-accent" />
            <div className="grid md:grid-cols-2 gap-3 mb-4">
              {['a', 'b', 'c', 'd'].map(opt => (
                <div key={opt} className={`flex items-center gap-2 border-2 rounded-lg px-3 py-2 ${q.correct_option === opt ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                  <span onClick={() => updateQuestion(idx, 'correct_option', opt)}
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 cursor-pointer ${q.correct_option === opt ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {opt.toUpperCase()}
                  </span>
                  <input value={q[`option_${opt}`]} onChange={e => updateQuestion(idx, `option_${opt}`, e.target.value)}
                    placeholder={`Option ${opt.toUpperCase()}${opt === 'a' || opt === 'b' ? ' *' : ''}`}
                    className="flex-1 bg-transparent outline-none text-sm" />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-600">Correct Answer:</label>
                <select value={q.correct_option} onChange={e => updateQuestion(idx, 'correct_option', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-accent">
                  <option value="a">Option A</option><option value="b">Option B</option><option value="c">Option C</option><option value="d">Option D</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-600">Marks:</label>
                <input type="number" value={q.marks} min={1} max={10} onChange={e => updateQuestion(idx, 'marks', parseInt(e.target.value))}
                  className="w-16 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-accent" />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addQuestion} className="w-full border-2 border-dashed border-blue-300 text-accent py-3 rounded-xl font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2">
          <Plus size={18} /> Add Another Question
        </button>
        <button onClick={handleSaveQuestions} disabled={saving}
          className="w-full bg-accent hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
          {saving ? 'Publishing...' : '🚀 Publish Quiz to Students'}
        </button>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-800 flex items-center gap-1"><ChevronRight size={20} className="rotate-180" /> Back</button>
          <h2 className="text-2xl font-bold text-primary">Create New Quiz</h2>
        </div>
        <div className="bg-white rounded-xl p-8 shadow-md max-w-2xl">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Course *</label>
              <select value={quizForm.course_id} onChange={e => setQuizForm({ ...quizForm, course_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                <option value="">-- Select a course --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Quiz Title *</label>
              <input value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="e.g. Module 1 Assessment"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea value={quizForm.description} onChange={e => setQuizForm({ ...quizForm, description: e.target.value })} rows={3} placeholder="Brief description..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Limit (minutes)</label>
                <input type="number" value={quizForm.time_limit_minutes} min={1} max={180} onChange={e => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pass Percentage (%)</label>
                <input type="number" value={quizForm.pass_percentage} min={1} max={100} onChange={e => setQuizForm({ ...quizForm, pass_percentage: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
              </div>
            </div>
          </div>
          <button onClick={handleCreateQuiz} disabled={saving} className="mt-8 w-full bg-accent hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-lg transition disabled:opacity-50">
            {saving ? 'Creating...' : 'Next: Add Questions →'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Quiz & Exam Management</h2>
        <button onClick={() => setView('create')} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          <Plus size={16} /> Create Quiz
        </button>
      </div>
      {quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No quizzes yet.</p>
          <button onClick={() => setView('create')} className="bg-accent text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">Create Your First Quiz</button>
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{quiz.title}</h3>
                  <p className="text-sm text-gray-500">{quiz.Course?.course_name} • {quiz.time_limit_minutes} min • Pass: {quiz.pass_percentage}% • {quiz.question_count} questions</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${quiz.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {quiz.is_active ? '🟢 Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { setSelectedQuiz(quiz); setView('questions'); }} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold flex items-center gap-1">
                  <Plus size={15} /> Add Questions
                </button>
                <button onClick={() => { setSelectedQuiz(quiz); fetchResults(quiz.id); setView('results'); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-semibold flex items-center gap-1">
                  <BarChart3 size={15} /> View Results
                </button>
                <button onClick={() => handleDeleteQuiz(quiz.id)} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-semibold flex items-center gap-1">
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== ATTENDANCE TRACKING COMPONENT ====================
function AttendanceTracking() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { if (selectedCourse) fetchAttendance(); }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try { const r = await api.get('/faculty/courses'); if (r.data.success) setCourses(r.data.courses || []); }
    catch (e) { console.error(e); }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try { const r = await api.get(`/faculty/attendance?course=${selectedCourse}&date=${selectedDate}`); if (r.data.success) setStudents(r.data.students || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markAttendance = async (studentId, status) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, status } : s));
    try { await api.post('/faculty/attendance/mark', { studentId, status, course: selectedCourse, date: selectedDate }); }
    catch (e) { console.error(e); }
  };

  const markAllPresent = async () => {
    setStudents(students.map(s => ({ ...s, status: 'present' })));
    try { await api.post('/faculty/attendance/mark-all', { status: 'present', course: selectedCourse, date: selectedDate }); }
    catch (e) { console.error(e); }
  };

  const exportAttendance = () => {
    const csvContent = [['Roll No', 'Name', 'Status', 'Overall Attendance'], ...students.map(s => [s.rollNo, s.name, s.status, s.attendance])].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `attendance-${selectedDate}.csv`; a.click();
  };

  const AvatarSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="3.5" fill="white" />
      <circle cx="50" cy="37" r="17" fill="#111" />
      <ellipse cx="50" cy="80" rx="27" ry="17" fill="#111" />
    </svg>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Attendance Tracking</h2>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">Choose course</option>
              {courses.map(course => <option key={course.id} value={course.id}>{course.code} - {course.course_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div className="flex items-end">
            <button onClick={markAllPresent} disabled={!selectedCourse} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50">Mark All Present</button>
          </div>
          <div className="flex items-end">
            <button onClick={exportAttendance} disabled={students.length === 0} className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              <Download size={18} /> Export
            </button>
          </div>
        </div>
      </div>

      {!selectedCourse ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a course to view attendance.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md"><p className="text-gray-600">No students found for this course.</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                {['Roll No', 'Student Name', 'Overall', 'Status', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.rollNo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden"><AvatarSVG /></div>
                      <span className="ml-3 font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-sm font-semibold text-gray-700">{student.attendance}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.status === 'present' ? 'bg-green-100 text-green-800' : student.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => markAttendance(student.id, 'present')} className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">Present</button>
                      <button onClick={() => markAttendance(student.id, 'absent')} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm">Absent</button>
                      <button onClick={() => markAttendance(student.id, 'late')} className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm">Late</button>
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

// ==================== PERFORMANCE ANALYTICS COMPONENT ====================
function PerformanceAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try { const r = await api.get('/faculty/analytics'); if (r.data.success) setAnalyticsData(r.data.analytics || {}); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;
  if (!analyticsData) return <div className="text-center py-16 bg-white rounded-xl shadow-md"><p className="text-gray-600">Unable to load analytics data.</p></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Performance Analytics & Reports</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: TrendingUp, color: 'text-green-500', label: 'Avg Performance', value: analyticsData.avgPerformance != null ? `${analyticsData.avgPerformance}%` : '—' },
          { icon: Video, color: 'text-blue-500', label: 'Video Completion', value: analyticsData.videoCompletion != null ? `${analyticsData.videoCompletion}%` : '—' },
          { icon: Clock, color: 'text-purple-500', label: 'Watch Time', value: analyticsData.watchTime != null ? `${analyticsData.watchTime}h` : '—' },
          { icon: UserCheck, color: 'text-yellow-500', label: 'Engagement', value: analyticsData.engagement != null ? `${analyticsData.engagement}%` : '—' },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-white p-6 rounded-xl shadow-md">
            <Icon className={`${color} mb-2`} size={24} />
            <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {analyticsData.coursePerformance?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Course-wise Performance</h3>
          <div className="space-y-4">
            {analyticsData.coursePerformance.map((course, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">{course.course}</h4>
                  <span className="text-sm text-gray-600">{course.students} students</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Average Score', value: course.avgScore, color: 'bg-blue-500' },
                    { label: 'Completion Rate', value: course.completion, color: 'bg-green-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm text-gray-600 mb-1"><span>{label}</span><span className="font-semibold">{value}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analyticsData.videoAnalytics?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Video Analytics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>{['Video Title', 'Views', 'Completion %', 'Avg Watch Time', 'Drop-off Point'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analyticsData.videoAnalytics.map((video, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{video.title}</td>
                    <td className="px-6 py-4 text-gray-700">{video.views}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${video.completion}%` }}></div></div>
                        <span className="text-sm font-semibold">{video.completion}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{video.avgWatchTime}</td>
                    <td className="px-6 py-4"><span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">{video.dropOffPoint}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ANNOUNCEMENTS COMPONENT ====================
function AnnouncementManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', course: '', priority: 'Medium', scheduleDate: '' });

  useEffect(() => { fetchAnnouncements(); fetchCourses(); }, []);

  const fetchAnnouncements = async () => {
    try { const r = await api.get('/faculty/announcements'); if (r.data.success) setAnnouncements(r.data.announcements || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try { const r = await api.get('/faculty/courses'); if (r.data.success) setCourses(r.data.courses || []); }
    catch (e) { console.error(e); }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title || !announcementForm.message) return;
    try {
      const r = await api.post('/faculty/announcements', announcementForm);
      if (r.data.success) {
        setAnnouncements([r.data.announcement, ...announcements]);
        setShowCreateModal(false);
        setAnnouncementForm({ title: '', message: '', course: '', priority: 'Medium', scheduleDate: '' });
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try { await api.delete(`/faculty/announcements/${id}`); setAnnouncements(announcements.filter(a => a.id !== id)); }
    catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Announcements</h2>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          <Megaphone className="h-4 w-4" /> New Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md"><Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">No announcements yet.</p></div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Megaphone className="text-accent" size={24} />
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
                    <p className="text-sm text-gray-500">{announcement.course} • {announcement.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${announcement.priority === 'High' ? 'bg-red-100 text-red-800' : announcement.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {announcement.priority} Priority
                  </span>
                  {announcement.views != null && <span className="text-sm text-gray-600">{announcement.views} views</span>}
                </div>
              </div>
              <p className="text-gray-700 mb-4">{announcement.message}</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"><Edit2 size={16} className="inline mr-1" />Edit</button>
                <button onClick={() => handleDelete(announcement.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-semibold"><Trash2 size={16} className="inline mr-1" />Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">New Announcement</h3>
              <button onClick={() => setShowCreateModal(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input type="text" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course</label>
                <select value={announcementForm.course} onChange={(e) => setAnnouncementForm({ ...announcementForm, course: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                  <option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                <textarea value={announcementForm.message} onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })} rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreateAnnouncement} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Post Announcement</button>
              <button onClick={() => setShowCreateModal(false)} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== BATCH MANAGEMENT COMPONENT ====================
function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchStudents, setBatchStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newBatch, setNewBatch] = useState({ name: '', courses: '', schedule: '', startDate: '', endDate: '' });

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try { const r = await api.get('/faculty/batches'); if (r.data.success) setBatches(r.data.batches || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchBatchStudents = async (batchId) => {
    try { const r = await api.get(`/faculty/batches/${batchId}/students`); if (r.data.success) setBatchStudents(r.data.students || []); }
    catch (e) { console.error(e); }
  };

  const handleCreateBatch = async () => {
    if (!newBatch.name || !newBatch.courses || !newBatch.schedule) { alert('Please fill all required fields'); return; }
    try {
      const r = await api.post('/faculty/batches', { ...newBatch, courses: newBatch.courses.split(',').map(c => c.trim()) });
      if (r.data.success) { setBatches([...batches, r.data.batch]); setShowCreateModal(false); setNewBatch({ name: '', courses: '', schedule: '', startDate: '', endDate: '' }); }
    } catch (e) { console.error(e); alert('Failed to create batch.'); }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;
    try { await api.delete(`/faculty/batches/${batchId}`); setBatches(batches.filter(b => b.id !== batchId)); }
    catch (e) { console.error(e); alert('Failed to delete batch.'); }
  };

  const handleViewStudents = async (batch) => { setSelectedBatch(batch); await fetchBatchStudents(batch.id); setShowViewModal(true); };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase()) || (batch.courses || []).some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleExportBatches = () => {
    const csvContent = [['Batch Name', 'Status', 'Students', 'Courses', 'Schedule', 'Start Date', 'End Date'],
      ...filteredBatches.map(b => [b.name, b.status, b.students || 0, (b.courses || []).join(' | '), b.schedule || '', b.startDate || '', b.endDate || ''])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `batches-export-${new Date().toISOString().split('T')[0]}.csv`; a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => ({ active: 'bg-green-100 text-green-800', completed: 'bg-blue-100 text-blue-800', upcoming: 'bg-yellow-100 text-yellow-800' }[status] || 'bg-green-100 text-green-800');

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Batch Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage student batches, schedules, and enrollments</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition shadow-md">
          <Plus className="h-4 w-4" /> Create Batch
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: Users, border: 'border-blue-500', text: 'text-blue-500', label: 'Total Batches', value: batches.length },
          { icon: Calendar, border: 'border-green-500', text: 'text-green-500', label: 'Active Batches', value: batches.filter(b => b.status === 'active').length },
          { icon: UserPlus, border: 'border-purple-500', text: 'text-purple-500', label: 'Total Students', value: batches.reduce((sum, b) => sum + (b.students || 0), 0) },
          { icon: BookOpen, border: 'border-yellow-500', text: 'text-yellow-500', label: 'Courses Assigned', value: [...new Set(batches.flatMap(b => b.courses || []))].length },
        ].map(({ icon: Icon, border, text, label, value }) => (
          <div key={label} className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${border}`}>
            <Icon className={`h-10 w-10 ${text} mb-3`} />
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{label}</h3>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="text" placeholder="Search batches..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div className="flex gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option><option value="active">Active</option><option value="completed">Completed</option><option value="upcoming">Upcoming</option>
            </select>
            <button onClick={handleExportBatches} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {filteredBatches.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-xl shadow-md"><Users className="h-16 w-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">No batches found</p></div>
        ) : filteredBatches.map((batch) => (
          <div key={batch.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{batch.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(batch.status)}`}>{batch.status}</span>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-gray-700"><Users size={18} className="mr-2 text-blue-500" /><span className="font-semibold">{batch.students}</span><span className="ml-1">Students</span></div>
              <div className="flex items-center text-gray-700"><BookOpen size={18} className="mr-2 text-green-500" /><span>{(batch.courses || []).join(', ')}</span></div>
              <div className="flex items-center text-gray-700"><Clock size={18} className="mr-2 text-purple-500" /><span>{batch.schedule}</span></div>
              <div className="flex items-center text-gray-700"><Calendar size={18} className="mr-2 text-yellow-500" /><span>{batch.startDate} to {batch.endDate}</span></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleViewStudents(batch)} className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                <Eye size={16} />View Students
              </button>
              <button className="flex items-center justify-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"><Edit2 size={16} />Edit</button>
              <button onClick={() => handleDeleteBatch(batch.id)} className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Batch</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Batch Name', key: 'name', placeholder: 'e.g., Batch 2024-C', required: true },
                { label: 'Courses (comma-separated)', key: 'courses', placeholder: 'e.g., CS101, CS201', required: true },
                { label: 'Schedule', key: 'schedule', placeholder: 'e.g., Mon-Fri 10 AM', required: true },
              ].map(({ label, key, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label} {required && <span className="text-red-500">*</span>}</label>
                  <input type="text" value={newBatch[key]} onChange={(e) => setNewBatch({ ...newBatch, [key]: e.target.value })}
                    placeholder={placeholder} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input type="date" value={newBatch.startDate} onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input type="date" value={newBatch.endDate} onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreateBatch} className="flex-1 bg-blue-500 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">Create Batch</button>
              <button onClick={() => setShowCreateModal(false)} className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedBatch.name} - Students</h3>
                <p className="text-sm text-gray-600 mt-1">{batchStudents.length} students enrolled</p>
              </div>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            {batchStudents.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No students in this batch.</p>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>{['#', 'Name', 'Email', 'Phone', 'Enrolled On'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {batchStudents.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm mr-3">{student.name?.charAt(0)}</div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4"><div className="flex items-center text-sm text-gray-700"><Mail size={14} className="mr-2 text-gray-400" />{student.email}</div></td>
                        <td className="px-6 py-4"><div className="flex items-center text-sm text-gray-700"><Phone size={14} className="mr-2 text-gray-400" />{student.phone}</div></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"><Download size={18} />Export Student List</button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"><UserPlus size={18} />Add Student</button>
              <button onClick={() => setShowViewModal(false)} className="ml-auto px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== LIVE CLASS SCHEDULING COMPONENT ====================
function LiveClassScheduling() {
  const [liveClasses, setLiveClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ title: '', course: '', date: '', time: '', duration: '', platform: 'Zoom', link: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchLiveClasses(); fetchCourses(); }, []);

  const fetchLiveClasses = async () => {
    try { const r = await api.get('/faculty/live-classes'); if (r.data.success) setLiveClasses(r.data.liveClasses || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCourses = async () => {
    try { const r = await api.get('/faculty/courses'); if (r.data.success) setCourses(r.data.courses || []); }
    catch (e) { console.error(e); }
  };

  const handleScheduleClass = async () => {
    if (!scheduleForm.title || !scheduleForm.course || !scheduleForm.date || !scheduleForm.time) { alert('Please fill all required fields'); return; }
    setSaving(true);
    try {
      const r = await api.post('/faculty/live-classes', scheduleForm);
      if (r.data.success) { setLiveClasses([r.data.liveClass, ...liveClasses]); setShowScheduleModal(false); setScheduleForm({ title: '', course: '', date: '', time: '', duration: '', platform: 'Zoom', link: '' }); }
    } catch (e) { console.error(e); alert(e.response?.data?.message || 'Failed to schedule class.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Live Class Scheduling</h2>
        <button onClick={() => setShowScheduleModal(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          <MonitorPlay className="h-4 w-4" /> Schedule Live Class
        </button>
      </div>

      {liveClasses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md"><MonitorPlay className="h-16 w-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">No live classes scheduled.</p></div>
      ) : (
        <div className="space-y-4">
          {liveClasses.map((liveClass) => (
            <div key={liveClass.id} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div><h3 className="text-xl font-bold text-gray-800">{liveClass.title}</h3><p className="text-sm text-gray-500">{liveClass.course}</p></div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{liveClass.status}</span>
              </div>
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center text-gray-600"><Calendar size={16} className="mr-2" /><span className="text-sm">{liveClass.date}</span></div>
                <div className="flex items-center text-gray-600"><Clock size={16} className="mr-2" /><span className="text-sm">{liveClass.time} ({liveClass.duration} min)</span></div>
                <div className="flex items-center text-gray-600"><MonitorPlay size={16} className="mr-2" /><span className="text-sm">{liveClass.platform}</span></div>
                <div className="flex items-center"><a href={liveClass.link} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">Join Link</a></div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold">Start Class</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-semibold"><Edit2 className="h-4 w-4 inline mr-1" />Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Schedule Live Class</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Class Title *</label>
                <input type="text" value={scheduleForm.title} onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. Introduction to Arrays" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course *</label>
                <select value={scheduleForm.course} onChange={e => setScheduleForm({ ...scheduleForm, course: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.course_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                  <input type="date" value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
                  <input type="time" value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                  <input type="number" value={scheduleForm.duration} onChange={e => setScheduleForm({ ...scheduleForm, duration: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="60" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                  <select value={scheduleForm.platform} onChange={e => setScheduleForm({ ...scheduleForm, platform: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                    <option value="Zoom">Zoom</option><option value="Google Meet">Google Meet</option><option value="Microsoft Teams">Microsoft Teams</option><option value="Jitsi">Jitsi</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Link</label>
                <input type="url" value={scheduleForm.link} onChange={e => setScheduleForm({ ...scheduleForm, link: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="https://zoom.us/j/..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleScheduleClass} disabled={saving} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Scheduling...' : 'Schedule Class'}
              </button>
              <button onClick={() => setShowScheduleModal(false)} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== STUDENT MANAGEMENT COMPONENT ====================
function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try { const r = await api.get('/faculty/students'); if (r.data.success) setStudents(r.data.students || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const courses = [...new Set(students.map(s => s.course))];

  const AvatarSVG = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="3.5" fill="white" />
      <circle cx="50" cy="37" r="17" fill="#111" />
      <ellipse cx="50" cy="80" rx="27" ry="17" fill="#111" />
    </svg>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Student Management</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"><Download size={18} />Export Data</button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: Users, border: 'border-blue-500', text: 'text-blue-500', label: 'Total Students', value: students.length },
          { icon: CheckCircle, border: 'border-green-500', text: 'text-green-500', label: 'Active Students', value: students.filter(s => new Date(s.last_active) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length },
          { icon: TrendingUp, border: 'border-yellow-500', text: 'text-yellow-500', label: 'Avg Progress', value: `${students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.progress || 0), 0) / students.length) : 0}%` },
          { icon: Award, border: 'border-purple-500', text: 'text-purple-500', label: 'Avg Quiz Score', value: `${students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.quiz_average || 0), 0) / students.length) : 0}%` },
        ].map(({ icon: Icon, border, text, label, value }) => (
          <div key={label} className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${border}`}>
            <Icon className={`h-10 w-10 ${text} mb-3`} />
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{label}</h3>
            <p className="text-2xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent" />
          </div>
          <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
            <option value="all">All Courses</option>
            {courses.map(course => <option key={course} value={course}>{course}</option>)}
          </select>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md"><Users className="h-16 w-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">No students found.</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>{['Student', 'Course', 'Progress', 'Assignments', 'Quiz Avg', 'Last Active', 'Actions'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden"><AvatarSVG /></div>
                      <div className="ml-3"><p className="font-medium text-gray-900">{student.full_name}</p><p className="text-sm text-gray-600">{student.email}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{student.course}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-24"><div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${student.progress || 0}%` }}></div></div>
                      <span className="text-sm font-semibold">{student.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{student.assignments_completed}/{student.total_assignments}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.quiz_average >= 80 ? 'bg-green-100 text-green-800' : student.quiz_average >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {student.quiz_average}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(student.last_active).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => { setSelectedStudent(student); setShowDetailsModal(true); }} className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"><Eye size={16} />View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Student Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b">
                <div className="h-16 w-16 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden">
                  <AvatarSVG />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</h4>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                  <p className="text-gray-600">{selectedStudent.phone}</p>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-3">Course Information</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Course</p><p className="font-semibold">{selectedStudent.course}</p></div>
                  <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Enrolled On</p><p className="font-semibold">{new Date(selectedStudent.enrollment_date).toLocaleDateString()}</p></div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-800 mb-3">Performance</h5>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span>Overall Progress</span><span className="font-semibold">{selectedStudent.progress}%</span></div>
                    <div className="bg-gray-200 rounded-full h-3"><div className="bg-blue-600 h-3 rounded-full" style={{ width: `${selectedStudent.progress}%` }}></div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Assignments</p><p className="font-semibold text-lg">{selectedStudent.assignments_completed}/{selectedStudent.total_assignments}</p></div>
                    <div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-600">Quiz Average</p><p className="font-semibold text-lg">{selectedStudent.quiz_average}%</p></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">Send Message</button>
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold transition">View Full Report</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== DOUBT CLEARING COMPONENT ====================
function DoubtClearing() {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [reply, setReply] = useState('');

  useEffect(() => { fetchDoubts(); }, []);

  const fetchDoubts = async () => {
    try { const r = await api.get('/faculty/doubts'); if (r.data.success) setDoubts(r.data.doubts || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleReply = async () => {
    if (!reply.trim()) { alert('Please enter a reply'); return; }
    try {
      await api.post(`/faculty/doubts/${selectedDoubt.id}/reply`, { reply });
      setDoubts(doubts.map(d => d.id === selectedDoubt.id ? { ...d, status: 'resolved', reply, replied_at: new Date().toISOString() } : d));
      setShowReplyModal(false);
      setReply('');
    } catch (e) { console.error(e); alert('Error sending reply'); }
  };

  const filteredDoubts = doubts.filter(d => filter === 'all' || d.status === filter);

  const getPriorityColor = (priority) => ({ high: 'bg-red-100 text-red-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800' }[priority] || 'bg-gray-100 text-gray-800');

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Doubt Clearing</h2>
        <div className="flex gap-2">
          {['all', 'pending', 'resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg transition capitalize ${filter === f ? 'bg-accent text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: AlertCircle, border: 'border-yellow-500', text: 'text-yellow-500', label: 'Pending Doubts', value: doubts.filter(d => d.status === 'pending').length },
          { icon: CheckCircle, border: 'border-green-500', text: 'text-green-500', label: 'Resolved', value: doubts.filter(d => d.status === 'resolved').length },
          { icon: MessageSquare, border: 'border-blue-500', text: 'text-blue-500', label: 'Total Queries', value: doubts.length },
        ].map(({ icon: Icon, border, text, label, value }) => (
          <div key={label} className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${border}`}>
            <Icon className={`h-10 w-10 ${text} mb-3`} />
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{label}</h3>
            <p className="text-2xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {filteredDoubts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md"><MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">No {filter} doubts</p></div>
        ) : filteredDoubts.map((doubt) => (
          <div key={doubt.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{doubt.subject}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(doubt.priority)}`}>{doubt.priority}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${doubt.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{doubt.status}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1"><User size={14} />{doubt.student_name}</span>
                  <span className="flex items-center gap-1"><BookOpen size={14} />{doubt.course}</span>
                  <span className="flex items-center gap-1"><Clock size={14} />{new Date(doubt.created_at).toLocaleString()}</span>
                </div>
                <p className="text-gray-700 mb-3">{doubt.question}</p>
                {doubt.status === 'resolved' && doubt.reply && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mt-3">
                    <p className="text-sm font-semibold text-gray-800 mb-1">Your Reply:</p>
                    <p className="text-sm text-gray-700">{doubt.reply}</p>
                    <p className="text-xs text-gray-500 mt-2">Replied on {new Date(doubt.replied_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
            {doubt.status === 'pending' && (
              <button onClick={() => { setSelectedDoubt(doubt); setShowReplyModal(true); }} className="bg-accent hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2">
                <MessageSquare size={18} />Reply to Doubt
              </button>
            )}
          </div>
        ))}
      </div>

      {showReplyModal && selectedDoubt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Reply to Doubt</h3>
              <button onClick={() => setShowReplyModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">{selectedDoubt.subject}</h4>
              <p className="text-sm text-gray-600 mb-3">Asked by <span className="font-semibold">{selectedDoubt.student_name}</span> in <span className="font-semibold">{selectedDoubt.course}</span></p>
              <p className="text-gray-700">{selectedDoubt.question}</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Reply</label>
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows="8"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Type your detailed explanation here..." />
            </div>
            <div className="flex gap-3">
              <button onClick={handleReply} className="flex-1 bg-accent hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition">Send Reply</button>
              <button onClick={() => setShowReplyModal(false)} className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== DISCUSSION FORUM ====================
function DiscussionForum() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewThread, setShowNewThread] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [filterCourse, setFilterCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [newThread, setNewThread] = useState({ title: '', content: '', course: 'General' });
  const [posting, setPosting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [threadsRes, coursesRes] = await Promise.all([
        api.get('/forum/threads'),
        api.get('/faculty/courses').catch(() => ({ data: { courses: [] } }))
      ]);
      if (threadsRes.data.success) setThreads(threadsRes.data.threads || []);
      setCourses([{ id: 'general', course_name: 'General' }, ...(coursesRes.data.courses || [])]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    setPosting(true);
    try { const res = await api.post('/forum/threads', newThread); setThreads([res.data.thread, ...threads]); setShowNewThread(false); setNewThread({ title: '', content: '', course: 'General' }); }
    catch { alert('Error creating thread'); }
    finally { setPosting(false); }
  };

  const openThread = async (thread) => {
    try { const res = await api.get(`/forum/threads/${thread.id}`); setSelectedThread(res.data.thread); }
    catch { setSelectedThread(thread); }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    try {
      await api.post(`/forum/threads/${selectedThread.id}/replies`, { content: replyContent });
      setReplyContent('');
      const res = await api.get(`/forum/threads/${selectedThread.id}`);
      setSelectedThread(res.data.thread);
      setThreads(prev => prev.map(t => t.id === selectedThread.id ? { ...t, replyCount: (t.replyCount || 0) + 1 } : t));
    } catch { alert('Error posting reply'); }
    finally { setSubmittingReply(false); }
  };

  const handleMarkAnswer = async (replyId) => {
    try {
      await api.patch(`/forum/replies/${replyId}/mark-answer`);
      const res = await api.get(`/forum/threads/${selectedThread.id}`);
      setSelectedThread(res.data.thread);
      setThreads(prev => prev.map(t => t.id === selectedThread.id ? { ...t, hasAnswer: true } : t));
    } catch { alert('Error marking answer'); }
  };

  const filtered = threads.filter(t => !filterCourse || t.course === filterCourse);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;

  if (selectedThread) {
    const replies = selectedThread.replies || [];
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedThread(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold">← Back to Forum</button>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold mb-2 inline-block">{selectedThread.course}</span>
              <h2 className="text-2xl font-bold text-gray-800">{selectedThread.title}</h2>
              <p className="text-sm text-gray-500 mt-1">By {selectedThread.author_name || selectedThread.author} · {selectedThread.created_at ? new Date(selectedThread.created_at).toLocaleDateString() : ''}</p>
            </div>
            {selectedThread.has_answer && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1"><CheckCircle size={14} /> Answered</span>}
          </div>
          <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">{selectedThread.content}</p>
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">{replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}</h3>
          {replies.map((reply, i) => (
            <div key={i} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${reply.is_answer ? 'border-green-500' : 'border-gray-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-gray-800">{reply.author_name}</span>
                  <span className="text-xs text-gray-400 ml-2">{reply.created_at ? new Date(reply.created_at).toLocaleDateString() : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  {reply.is_answer && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">✓ Answer</span>}
                  {!reply.is_answer && <button onClick={() => handleMarkAnswer(reply.id)} className="text-xs text-gray-400 hover:text-green-600 border border-gray-200 hover:border-green-400 px-2 py-1 rounded-lg transition">Mark as Answer</button>}
                </div>
              </div>
              <p className="text-gray-700">{reply.content}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="font-bold text-gray-800 mb-3">Post a Reply</h4>
          <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={4} placeholder="Write your reply..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
          <button onClick={handleReply} disabled={submittingReply || !replyContent.trim()}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2">
            <Send size={16} /> {submittingReply ? 'Posting...' : 'Post Reply'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Discussion Forum</h2>
        <button onClick={() => setShowNewThread(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-semibold transition shadow">
          <Plus size={18} /> New Thread
        </button>
      </div>
      <div className="flex gap-3 flex-wrap">
        <button onClick={() => setFilterCourse('')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${!filterCourse ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>All</button>
        {courses.map(c => (
          <button key={c.id} onClick={() => setFilterCourse(c.course_name)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filterCourse === c.course_name ? 'bg-orange-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{c.course_name}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md"><MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" /><p className="text-gray-500 text-lg">No discussions yet</p></div>
      ) : (
        <div className="space-y-4">
          {filtered.map(thread => (
            <div key={thread.id} onClick={() => openThread(thread)} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5 cursor-pointer border border-transparent hover:border-orange-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{thread.course}</span>
                    {thread.hasAnswer && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><CheckCircle size={10} /> Answered</span>}
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg truncate">{thread.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{thread.content}</p>
                </div>
                <ChevronRight size={20} className="text-gray-400 flex-shrink-0 ml-4" />
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><User size={12} /> {thread.author_name || thread.author}</span>
                <span className="flex items-center gap-1"><MessageCircle size={12} /> {thread.replyCount || 0} replies</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showNewThread && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold">Create New Thread</h3>
              <button onClick={() => setShowNewThread(false)}><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                <select value={newThread.course} onChange={e => setNewThread({ ...newThread, course: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                  {courses.map(c => <option key={c.id} value={c.course_name}>{c.course_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input value={newThread.title} onChange={e => setNewThread({ ...newThread, title: e.target.value })} placeholder="Your question or topic..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                <textarea value={newThread.content} onChange={e => setNewThread({ ...newThread, content: e.target.value })} rows={5} placeholder="Describe in detail..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreateThread} disabled={posting || !newThread.title || !newThread.content}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50">
                  {posting ? 'Posting...' : 'Post Thread'}
                </button>
                <button onClick={() => setShowNewThread(false)} className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SYSTEM SETTINGS COMPONENT ====================
function SystemSettings() {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [generalSettings, setGeneralSettings] = useState({ institution_name: '', academic_year: '', semester: '', default_language: 'en', timezone: 'Asia/Kolkata', date_format: 'DD/MM/YYYY', time_format: '24h' });
  const [notificationSettings, setNotificationSettings] = useState({ email_notifications: false, student_query_alerts: false, assignment_submission_alerts: false, exam_reminders: false, course_updates: false, system_announcements: false, daily_digest: false, weekly_report: false });
  const [courseSettings, setCourseSettings] = useState({ auto_enroll: false, allow_late_submissions: false, late_penalty_percentage: 0, max_late_days: 0, default_passing_grade: 40, attendance_required: 75, enable_discussion_forum: false, enable_peer_review: false });
  const [securitySettings, setSecuritySettings] = useState({ two_factor_auth: false, session_timeout: 30, password_expiry_days: 90, force_password_change: false, allow_multiple_sessions: true, ip_whitelist_enabled: false, login_attempt_limit: 5 });
  const [integrationSettings, setIntegrationSettings] = useState({ google_classroom: false, microsoft_teams: false, zoom_enabled: false, zoom_api_key: '', email_service: 'smtp', smtp_host: '', smtp_port: '', smtp_username: '', storage_provider: 'local', max_upload_size: 100 });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const r = await api.get('/faculty/settings');
      if (r.data.success) {
        const s = r.data.settings;
        if (s.general) setGeneralSettings(s.general);
        if (s.notifications) setNotificationSettings(s.notifications);
        if (s.course) setCourseSettings(s.course);
        if (s.security) setSecuritySettings(s.security);
        if (s.integrations) setIntegrationSettings(s.integrations);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const showMessage = (type, text) => { setMessage({ type, text }); setTimeout(() => setMessage({ type: '', text: '' }), 3000); };

  const handleSave = async (endpoint, data) => {
    setSaving(true);
    try { await api.put(`/faculty/settings/${endpoint}`, data); showMessage('success', 'Settings updated successfully!'); }
    catch (e) { showMessage('error', 'Error updating settings'); }
    finally { setSaving(false); }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'course', label: 'Course Settings', icon: BookOpen },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Zap }
  ];

  const ToggleItem = ({ checked, onChange, label, desc }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
      <div>
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button onClick={onChange} className={`relative inline-flex items-center w-14 h-8 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}>
        <span className={`inline-block w-6 h-6 bg-white rounded-full shadow transform transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>

      {message.text && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}>
                <Icon size={18} />{tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-8 max-w-3xl">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 pb-3 border-b border-gray-200">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: 'Institution Name', key: 'institution_name', type: 'input' },
                  { label: 'Academic Year', key: 'academic_year', type: 'input' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                    <input type="text" value={generalSettings[key]} onChange={e => setGeneralSettings({ ...generalSettings, [key]: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
                  <select value={generalSettings.semester} onChange={e => setGeneralSettings({ ...generalSettings, semester: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition bg-white">
                    <option value="Spring 2025">Spring 2025</option><option value="Fall 2024">Fall 2024</option><option value="Summer 2025">Summer 2025</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                  <select value={generalSettings.default_language} onChange={e => setGeneralSettings({ ...generalSettings, default_language: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition bg-white">
                    <option value="en">English</option><option value="hi">Hindi</option><option value="es">Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                  <select value={generalSettings.timezone} onChange={e => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition bg-white">
                    <option value="Asia/Kolkata">IST (Asia/Kolkata)</option><option value="America/New_York">EST (America/New_York)</option><option value="Europe/London">GMT (Europe/London)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date Format</label>
                  <select value={generalSettings.date_format} onChange={e => setGeneralSettings({ ...generalSettings, date_format: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition bg-white">
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time Format</label>
                  <select value={generalSettings.time_format} onChange={e => setGeneralSettings({ ...generalSettings, time_format: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition bg-white">
                    <option value="24h">24 Hour</option><option value="12h">12 Hour (AM/PM)</option>
                  </select>
                </div>
              </div>
              <button onClick={() => handleSave('general', generalSettings)} disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save General Settings'}
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 pb-3 border-b border-gray-200">Notification Preferences</h3>
              <div className="space-y-3">
                {[
                  { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { key: 'student_query_alerts', label: 'Student Query Alerts', desc: 'Get notified when students ask questions' },
                  { key: 'assignment_submission_alerts', label: 'Assignment Submissions', desc: 'Alerts for new submissions' },
                  { key: 'exam_reminders', label: 'Exam Reminders', desc: 'Reminders for upcoming exams' },
                  { key: 'course_updates', label: 'Course Updates', desc: 'Notifications about course changes' },
                  { key: 'system_announcements', label: 'System Announcements', desc: 'Important system notifications' },
                  { key: 'daily_digest', label: 'Daily Digest', desc: 'Daily summary of activities' },
                  { key: 'weekly_report', label: 'Weekly Report', desc: 'Weekly performance reports' },
                ].map(pref => (
                  <ToggleItem key={pref.key} checked={notificationSettings[pref.key]} label={pref.label} desc={pref.desc}
                    onChange={() => setNotificationSettings({ ...notificationSettings, [pref.key]: !notificationSettings[pref.key] })} />
                ))}
              </div>
              <button onClick={() => handleSave('notifications', notificationSettings)} disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </div>
          )}

          {activeTab === 'course' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 pb-3 border-b border-gray-200">Course Management Settings</h3>
              <div className="space-y-3">
                {[
                  { key: 'auto_enroll', label: 'Auto Enrollment', desc: 'Automatically enroll students in courses' },
                  { key: 'allow_late_submissions', label: 'Allow Late Submissions', desc: 'Enable late assignment submissions' },
                  { key: 'enable_discussion_forum', label: 'Discussion Forum', desc: 'Enable course discussion boards' },
                  { key: 'enable_peer_review', label: 'Peer Review', desc: "Allow students to review each other's work" },
                ].map(pref => (
                  <ToggleItem key={pref.key} checked={courseSettings[pref.key]} label={pref.label} desc={pref.desc}
                    onChange={() => setCourseSettings({ ...courseSettings, [pref.key]: !courseSettings[pref.key] })} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  { label: 'Late Penalty (%)', key: 'late_penalty_percentage' },
                  { label: 'Max Late Days', key: 'max_late_days' },
                  { label: 'Default Passing Grade (%)', key: 'default_passing_grade' },
                  { label: 'Required Attendance (%)', key: 'attendance_required' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                    <input type="number" value={courseSettings[key]} onChange={e => setCourseSettings({ ...courseSettings, [key]: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition" />
                  </div>
                ))}
              </div>
              <button onClick={() => handleSave('course', courseSettings)} disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Course Settings'}
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 pb-3 border-b border-gray-200">Security Settings</h3>
              <div className="space-y-3">
                {[
                  { key: 'two_factor_auth', label: 'Two-Factor Authentication', desc: 'Require 2FA for all users' },
                  { key: 'force_password_change', label: 'Force Password Change', desc: 'Require password change on first login' },
                  { key: 'allow_multiple_sessions', label: 'Multiple Sessions', desc: 'Allow users to login from multiple devices' },
                  { key: 'ip_whitelist_enabled', label: 'IP Whitelisting', desc: 'Restrict access to specific IP addresses' },
                ].map(pref => (
                  <ToggleItem key={pref.key} checked={securitySettings[pref.key]} label={pref.label} desc={pref.desc}
                    onChange={() => setSecuritySettings({ ...securitySettings, [pref.key]: !securitySettings[pref.key] })} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  { label: 'Session Timeout (min)', key: 'session_timeout' },
                  { label: 'Password Expiry (days)', key: 'password_expiry_days' },
                  { label: 'Login Attempt Limit', key: 'login_attempt_limit' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                    <input type="number" value={securitySettings[key]} onChange={e => setSecuritySettings({ ...securitySettings, [key]: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition" />
                  </div>
                ))}
              </div>
              <button onClick={() => handleSave('security', securitySettings)} disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Security Settings'}
              </button>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 pb-3 border-b border-gray-200">Third-Party Integrations</h3>
              <div className="space-y-3">
                {[
                  { key: 'google_classroom', label: 'Google Classroom', desc: 'Sync with Google Classroom' },
                  { key: 'microsoft_teams', label: 'Microsoft Teams', desc: 'Enable Teams integration' },
                  { key: 'zoom_enabled', label: 'Zoom Meetings', desc: 'Enable Zoom for live classes' },
                ].map(pref => (
                  <ToggleItem key={pref.key} checked={integrationSettings[pref.key]} label={pref.label} desc={pref.desc}
                    onChange={() => setIntegrationSettings({ ...integrationSettings, [pref.key]: !integrationSettings[pref.key] })} />
                ))}
              </div>
              {integrationSettings.zoom_enabled && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Zoom API Key</label>
                  <input type="text" value={integrationSettings.zoom_api_key} onChange={e => setIntegrationSettings({ ...integrationSettings, zoom_api_key: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition" placeholder="Enter Zoom API Key" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Service</label>
                  <select value={integrationSettings.email_service} onChange={e => setIntegrationSettings({ ...integrationSettings, email_service: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition bg-white">
                    <option value="smtp">SMTP</option><option value="sendgrid">SendGrid</option><option value="mailgun">Mailgun</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Storage Provider</label>
                  <select value={integrationSettings.storage_provider} onChange={e => setIntegrationSettings({ ...integrationSettings, storage_provider: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition bg-white">
                    <option value="local">Local Storage</option><option value="aws_s3">AWS S3</option><option value="google_cloud">Google Cloud</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Upload Size (MB)</label>
                  <input type="number" value={integrationSettings.max_upload_size} onChange={e => setIntegrationSettings({ ...integrationSettings, max_upload_size: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition" />
                </div>
              </div>
              <button onClick={() => handleSave('integrations', integrationSettings)} disabled={saving} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Integration Settings'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ==================== MAIN FACULTY DASHBOARD COMPONENT ====================
export default function FacultyDashboard() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showMailbox, setShowMailbox] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchMessages();
    fetchNotifications();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/faculty/messages');
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
     } catch (error) {
      if (error?.response?.status !== 404) console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/faculty/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      if (error?.response?.status !== 404) console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const handleProfile = () => {
    setUserMenuOpen(false);
    navigate('/faculty/profile');
  };

  const handleSettings = () => {
    setUserMenuOpen(false);
    navigate('/faculty/settings');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadMessages = messages.filter(m => !m.read).length;

  const navItems = [
    { path: '/faculty', label: 'Overview', icon: BarChart3 },
    { path: '/faculty/courses', label: 'Courses', icon: BookOpen },
    { path: '/faculty/students', label: 'Students', icon: Users },
    { path: '/faculty/content-upload', label: 'Content', icon: Upload },
    { path: '/faculty/assignments', label: 'Assignments', icon: ClipboardList },
    { path: '/faculty/quizzes', label: 'Quizzes', icon: FileText },
    { path: '/faculty/attendance', label: 'Attendance', icon: UserCheck },
    { path: '/faculty/live-classes', label: 'Live Classes', icon: MonitorPlay },
    { path: '/faculty/announcements', label: 'Announcements', icon: Megaphone },
    { path: '/faculty/batches', label: 'Batches', icon: Layers },
    { path: '/faculty/doubts', label: 'Doubts', icon: MessageCircle },
    { path: '/faculty/discussion', label: 'Discussion', icon: MessageSquare },
    { path: '/faculty/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/faculty/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gradient-to-b from-[#1e5a8e] to-[#164266] text-white transition-all duration-300 overflow-hidden flex-shrink-0 shadow-2xl`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-blue-700/50">
            <div className="flex items-center justify-center">
              <img src="/upskillize-logo.png" alt="Upskillize" className="h-10 w-auto" />
            </div>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  className={`w-full flex items-center px-6 py-3.5 hover:bg-blue-800/50 transition-all group ${
                    isActive ? 'bg-[#164266] border-l-4 border-orange-400' : ''
                  }`}>
                  <Icon size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search courses, students, content..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mail Button */}
              <div className="relative">
                <button onClick={() => { setShowMailbox(!showMailbox); setShowNotifications(false); setShowHelp(false); }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition relative">
                  <Mail size={20} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </button>
                {showMailbox && (
                  <>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Messages</h3>
                        <button onClick={() => setShowMailbox(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {messages.length === 0 ? (
                          <p className="p-4 text-sm text-gray-500 text-center">No messages</p>
                        ) : messages.map((msg) => (
                          <div key={msg.id} className={`p-4 hover:bg-gray-50 cursor-pointer ${!msg.read ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-start justify-between mb-1">
                              <p className="font-semibold text-sm text-gray-900">{msg.from}</p>
                              <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">{msg.subject}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">{msg.preview}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-200">
                        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold">View All Messages</button>
                      </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMailbox(false)} />
                  </>
                )}
              </div>

              {/* Notifications Button */}
              <div className="relative">
                <button onClick={() => { setShowNotifications(!showNotifications); setShowMailbox(false); setShowHelp(false); }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition relative">
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                {showNotifications && (
                  <>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                        ) : notifications.map((notif) => (
                          <div key={notif.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notif.type === 'enrollment' ? 'bg-blue-500' :
                                notif.type === 'payment' ? 'bg-green-500' : 'bg-purple-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-gray-900 mb-1">{notif.title}</p>
                                <p className="text-xs text-gray-600 mb-1">{notif.message}</p>
                                <span className="text-xs text-gray-500">{notif.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-200">
                        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-semibold">View All Notifications</button>
                      </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  </>
                )}
              </div>

              {/* Help Button */}
              <div className="relative">
                <button onClick={() => { setShowHelp(!showHelp); setShowMailbox(false); setShowNotifications(false); }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition">
                  <HelpCircle size={20} />
                </button>
                {showHelp && (
                  <>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Help & Support</h3>
                        <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                      </div>
                      <div className="p-4 space-y-3">
                        <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                          <BookOpen size={18} className="text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">Documentation</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                          <Video size={18} className="text-green-600" />
                          <span className="text-sm font-medium text-gray-700">Video Tutorials</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                          <MessageSquare size={18} className="text-purple-600" />
                          <span className="text-sm font-medium text-gray-700">Contact Support</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                          <HelpCircle size={18} className="text-orange-600" />
                          <span className="text-sm font-medium text-gray-700">FAQs</span>
                        </a>
                      </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowHelp(false)} />
                  </>
                )}
              </div>

              {/* User Menu */}
              <div className="relative ml-2">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden shadow-lg">
                    {user?.profile_photo ? (
                      <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="3.5" fill="white"/>
                        <circle cx="50" cy="37" r="17" fill="#111"/>
                        <ellipse cx="50" cy="80" rx="27" ry="17" fill="#111"/>
                      </svg>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">{user?.full_name || 'Faculty'}</div>
                    <div className="text-xs text-gray-500">Instructor</div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <button onClick={handleProfile}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                        <User size={16} />Profile
                      </button>
                      <button onClick={handleSettings}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                        <Settings size={16} />Settings
                      </button>
                      <hr className="my-2" />
                      <button onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-red-600">
                        <LogOut size={16} />Logout
                      </button>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/courses" element={<MyCourses />} />
              <Route path="/students" element={<StudentManagement />} />
              <Route path="/content-upload" element={<ContentUpload />} />
              <Route path="/assignments" element={<AssignmentManagement />} />
              <Route path="/quizzes" element={<QuizExamManagement />} />
              <Route path="/attendance" element={<AttendanceTracking />} />
              <Route path="/live-classes" element={<LiveClassScheduling />} />
              <Route path="/announcements" element={<AnnouncementManagement />} />
              <Route path="/batches" element={<BatchManagement />} />
              <Route path="/doubts" element={<DoubtClearing />} />
              <Route path="/discussion" element={<DiscussionForum />} />
              <Route path="/analytics" element={<PerformanceAnalytics />} />
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}