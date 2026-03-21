// COMPLETE INSTITUTE DASHBOARD — matches PlacementDashboard style exactly
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Users, BookOpen, Award, Bell, LogOut,
  Plus, Search, Download, Eye, X,
  CheckCircle, Calendar, AlertCircle,
  IndianRupee, TrendingUp, BarChart3,
  Activity, RefreshCw, Menu, User, HelpCircle,
  MonitorPlay, MessageSquare, Settings,
  GraduationCap, Briefcase, Upload, UserPlus,
  Layers, DollarSign, ChevronDown,
} from 'lucide-react';

// ==================== OVERVIEW ====================
function Overview() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const fetchData = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const r = await api.get('/institute/dashboard/stats');
      if (r.data.success) { setStats(r.data.stats || {}); setActivities(r.data.activities || []); setLastUpdated(new Date()); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;
  if (!stats)  return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Unable to load dashboard.</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Institute Dashboard</h2>
          {lastUpdated && <p className="text-xs text-gray-400 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/institute/students" className="bg-accent hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md">
            <Users size={20} /> Manage Students
          </Link>
        </div>
      </div>

      {/* Gradient stat cards — 2.1 Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: Users,         label: 'Total Students',  value: stats.totalStudents, sub: 'Enrolled under institute',     color: 'from-blue-500 to-blue-600'    },
          { icon: BookOpen,      label: 'Active Courses',  value: stats.activeCourses, sub: 'Currently running',            color: 'from-indigo-500 to-indigo-600' },
          { icon: GraduationCap, label: 'Faculty Members', value: stats.facultyCount,  sub: 'Assigned to batches',          color: 'from-purple-500 to-purple-600' },
          { icon: IndianRupee,   label: 'Monthly Revenue', value: stats.monthlyRevenue != null ? `₹${stats.monthlyRevenue}` : '—', sub: 'Fee collected this month', color: 'from-green-500 to-green-600' },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg text-white`}>
            <Icon className="h-10 w-10 mb-3 opacity-80" />
            <h3 className="text-sm font-medium mb-1 opacity-90">{label}</h3>
            <p className="text-3xl font-bold">{value ?? '—'}</p>
            <p className="text-xs mt-2 opacity-75">{sub}</p>
          </div>
        ))}
      </div>

      {/* Border-left stat cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: Layers,       label: 'Active Batches',  value: stats.activeBatches  ?? '—',                                    border: 'border-blue-500',   text: 'text-blue-500'   },
          { icon: CheckCircle,  label: 'Students Placed', value: stats.studentsPlaced ?? '—',                                    border: 'border-green-500',  text: 'text-green-500'  },
          { icon: TrendingUp,   label: 'Placement Rate',  value: stats.placementRate  != null ? `${stats.placementRate}%` : '—', border: 'border-yellow-500', text: 'text-yellow-500' },
          { icon: DollarSign,   label: 'Pending Fees',    value: stats.pendingFees    != null ? `₹${stats.pendingFees}`    : '—', border: 'border-red-500',    text: 'text-red-500'    },
        ].map(({ icon: Icon, label, value, border, text }) => (
          <div key={label} className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${border}`}>
            <Icon className={`h-10 w-10 ${text} mb-3`} />
            <h3 className="text-sm font-semibold text-gray-600 mb-2">{label}</h3>
            <p className="text-2xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { to: '/institute/students',  icon: UserPlus,  label: 'Add Student',    sub: 'Enroll manually'      },
            { to: '/institute/batches',   icon: Layers,    label: 'Manage Batches', sub: 'Create & assign'      },
            { to: '/institute/courses',   icon: BookOpen,  label: 'Courses',        sub: 'Create & approve'     },
            { to: '/institute/placement', icon: Briefcase, label: 'Placement',      sub: 'Track student drives' },
            { to: '/institute/analytics', icon: BarChart3, label: 'Analytics',      sub: 'Reports & insights'   },
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

      {/* Bottom two-col */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <Activity className="text-accent" size={20} />
          </div>
          {activities.length === 0 ? <p className="text-gray-400 text-sm">No recent activity.</p>
            : <div className="space-y-3">{activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <div><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-gray-500">{a.time}</p></div>
                </div>
              ))}</div>
          }
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Fee Summary</h3>
            <IndianRupee className="text-accent" size={20} />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Collected This Month', value: stats.monthlyRevenue != null ? `₹${stats.monthlyRevenue}` : '—', color: 'text-green-600' },
              { label: 'Pending Fees',          value: stats.pendingFees   != null ? `₹${stats.pendingFees}`    : '—', color: 'text-red-600'   },
              { label: 'Fee Defaulters',        value: stats.feeDefaulters ?? '—',                                     color: 'text-orange-600' },
              { label: 'Total Students',        value: stats.totalStudents ?? '—',                                     color: 'text-blue-600'  },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== STUDENT MANAGEMENT — 2.2 ====================
function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [feeFilter, setFeeFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const emptyForm = { full_name: '', email: '', phone: '', batch_id: '', fee_status: 'pending' };
  const [addForm, setAddForm] = useState(emptyForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sRes, bRes] = await Promise.all([api.get('/institute/students'), api.get('/institute/batches')]);
      if (sRes.data.success) setStudents(sRes.data.students || []);
      if (bRes.data.success) setBatches(bRes.data.batches || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAdd = async () => {
    if (!addForm.full_name || !addForm.email) { setError('Name and email are required.'); return; }
    setSaving(true);
    try {
      const r = await api.post('/institute/students', addForm);
      if (r.data.success) { setStudents([r.data.student, ...students]); setShowAddModal(false); setAddForm(emptyForm); setError(''); }
    } catch (e) { setError(e.response?.data?.message || 'Failed to add student.'); }
    finally { setSaving(false); }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) { setError('Select a CSV file first.'); return; }
    setSaving(true);
    const fd = new FormData();
    fd.append('file', csvFile);
    try {
      const r = await api.post('/institute/students/bulk', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (r.data.success) { fetchData(); setShowBulkModal(false); setCsvFile(null); alert(`${r.data.created} students enrolled.`); }
    } catch (e) { setError(e.response?.data?.message || 'Bulk upload failed.'); }
    finally { setSaving(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/institute/student/${id}/status`, { status });
      setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    } catch (e) { alert('Failed to update.'); }
  };

  const filtered = students.filter(s => {
    const matchSearch = (s.full_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchBatch  = batchFilter === 'all' || String(s.batch_id) === String(batchFilter);
    const matchFee    = feeFilter   === 'all' || s.fee_status === feeFilter;
    return matchSearch && matchBatch && matchFee;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Student Management</h2>
        <div className="flex gap-3">
          <button onClick={() => window.open('/api/institute/students/export', '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded-lg hover:bg-blue-50 transition text-sm font-semibold">
            <Upload size={16} /> Bulk Upload
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
            <UserPlus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm" />
        </div>
        <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm">
          <option value="all">All Batches</option>
          {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={feeFilter} onChange={e => setFeeFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm">
          <option value="all">All Fee Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <span className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold self-center">{filtered.length} students</span>
      </div>

      {/* Table — columns per 2.2: Name, Batch, Courses, Progress%, Attendance%, Fee Status, Placement Status */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No students found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>{['Student', 'Batch', 'Courses', 'Progress', 'Attendance', 'Fee Status', 'Placement', 'Actions'].map(h => (
                <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(s.full_name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{s.full_name}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{s.batch_name || '—'}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">{s.enrolled_courses ?? 0}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${s.avg_progress ?? 0}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">{s.avg_progress ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${(s.attendance_avg ?? 0) >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {s.attendance_avg ?? 0}%
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      s.fee_status === 'paid'    ? 'bg-green-100 text-green-800'  :
                      s.fee_status === 'overdue' ? 'bg-red-100 text-red-800'      : 'bg-yellow-100 text-yellow-800'
                    }`}>{s.fee_status || 'pending'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      s.placement_status === 'selected'    ? 'bg-green-100 text-green-800'  :
                      s.placement_status === 'shortlisted' ? 'bg-blue-100 text-blue-800'    :
                      s.placement_status === 'applied'     ? 'bg-yellow-100 text-yellow-800': 'bg-gray-100 text-gray-600'
                    }`}>{s.placement_status || 'not applied'}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => { setSelectedStudent(s); setShowProfileModal(true); }}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition flex items-center gap-1">
                        <Eye size={11} /> View
                      </button>
                      {s.status === 'active'
                        ? <button onClick={() => handleStatus(s.id, 'blocked')} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition">Block</button>
                        : <button onClick={() => handleStatus(s.id, 'active')}  className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition">Activate</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Add Student</h3>
              <button onClick={() => { setShowAddModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4 text-sm"><AlertCircle size={18} />{error}</div>}
            <div className="space-y-4">
              {[
                { label: 'Full Name *', key: 'full_name', type: 'text',  placeholder: 'Student full name'  },
                { label: 'Email *',     key: 'email',     type: 'email', placeholder: 'student@email.com'  },
                { label: 'Phone',       key: 'phone',     type: 'text',  placeholder: '+91 9876543210'     },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <input type={type} value={addForm[key]} onChange={e => setAddForm({ ...addForm, [key]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to Batch</label>
                <select value={addForm.batch_id} onChange={e => setAddForm({ ...addForm, batch_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                  <option value="">Select batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fee Status</label>
                <select value={addForm.fee_status} onChange={e => setAddForm({ ...addForm, fee_status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAdd} disabled={saving} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Student'}
              </button>
              <button onClick={() => { setShowAddModal(false); setError(''); }} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Bulk CSV Upload</h3>
              <button onClick={() => { setShowBulkModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4 text-sm"><AlertCircle size={18} />{error}</div>}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
              <Upload className="mx-auto mb-3 text-gray-400" size={36} />
              <p className="text-sm text-gray-600 mb-1">CSV columns required:</p>
              <p className="font-mono text-xs bg-gray-100 px-3 py-2 rounded-lg inline-block">full_name, email, phone, batch_name</p>
              <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files[0])}
                className="block w-full text-sm text-gray-600 mt-4 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-blue-700 cursor-pointer" />
              {csvFile && <p className="text-xs text-green-600 mt-2 font-semibold">Selected: {csvFile.name}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={handleBulkUpload} disabled={saving || !csvFile} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Uploading...' : 'Upload & Enroll'}
              </button>
              <button onClick={() => { setShowBulkModal(false); setError(''); }} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal — 2.2 Student profile: attendance, grades, course progress */}
      {showProfileModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-xl" />
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                    {(selectedStudent.full_name || 'S').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</h3>
                    <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedStudent.batch_name || 'No batch assigned'}</p>
                  </div>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Enrolled Courses',  value: selectedStudent.enrolled_courses ?? '—'           },
                  { label: 'Avg Progress',       value: `${selectedStudent.avg_progress ?? 0}%`           },
                  { label: 'Attendance',         value: `${selectedStudent.attendance_avg ?? 0}%`         },
                  { label: 'Fee Status',         value: selectedStudent.fee_status || 'pending'           },
                  { label: 'Placement Status',   value: selectedStudent.placement_status || 'not applied' },
                  { label: 'Account Status',     value: selectedStudent.status || 'active'                },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-bold text-gray-900 capitalize">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-4 border-t">
                {selectedStudent.status === 'active'
                  ? <button onClick={() => { handleStatus(selectedStudent.id, 'blocked'); setShowProfileModal(false); }}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-semibold transition text-sm">Block Student</button>
                  : <button onClick={() => { handleStatus(selectedStudent.id, 'active'); setShowProfileModal(false); }}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg font-semibold transition text-sm">Activate Student</button>
                }
                <button onClick={() => setShowProfileModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold transition text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== BATCH & COURSE MANAGEMENT — 2.3 ====================
function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('batches');
  const emptyBatch  = { name: '', start_date: '', end_date: '', course_ids: [] };
  const emptyCourse = { title: '', description: '', category: '' };
  const [batchForm,  setBatchForm]  = useState(emptyBatch);
  const [courseForm, setCourseForm] = useState(emptyCourse);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bRes, fRes, cRes] = await Promise.all([
        api.get('/institute/batches'),
        api.get('/institute/faculty'),
        api.get('/institute/courses'),
      ]);
      if (bRes.data.success) setBatches(bRes.data.batches || []);
      if (fRes.data.success) setFaculty(fRes.data.faculty || []);
      if (cRes.data.success) setCourses(cRes.data.courses || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateBatch = async () => {
    if (!batchForm.name || !batchForm.start_date) { setError('Batch name and start date are required.'); return; }
    setSaving(true);
    try {
      const r = await api.post('/institute/batch', batchForm);
      if (r.data.success) { setBatches([r.data.batch, ...batches]); setShowBatchModal(false); setBatchForm(emptyBatch); setError(''); }
    } catch (e) { setError(e.response?.data?.message || 'Failed to create batch.'); }
    finally { setSaving(false); }
  };

  const handleCreateCourse = async () => {
    if (!courseForm.title) { setError('Course title is required.'); return; }
    setSaving(true);
    try {
      const r = await api.post('/institute/course', courseForm);
      if (r.data.success) { setCourses([r.data.course, ...courses]); setShowCourseModal(false); setCourseForm(emptyCourse); setError(''); }
    } catch (e) { setError(e.response?.data?.message || 'Failed to create course.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Batches & Courses</h2>
        <div className="flex gap-3">
          {activeTab === 'batches' && (
            <button onClick={() => { setError(''); setShowBatchModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
              <Plus size={16} /> New Batch
            </button>
          )}
          {activeTab === 'courses' && (
            <button onClick={() => { setError(''); setShowCourseModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
              <Plus size={16} /> New Course
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'batches', label: 'Batches',   icon: Layers        },
            { key: 'courses', label: 'Courses',    icon: BookOpen      },
            { key: 'faculty', label: 'Faculty',    icon: GraduationCap },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition border-b-2 ${activeTab === tab.key ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <tab.icon size={16} />{tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* BATCHES */}
          {activeTab === 'batches' && (
            batches.length === 0 ? (
              <div className="text-center py-16">
                <Layers className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No batches yet.</p>
                <button onClick={() => setShowBatchModal(true)} className="mt-4 px-6 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Create First Batch</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {batches.map(b => (
                  <div key={b.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <div className="p-5">
                      <h4 className="font-bold text-gray-900 mb-2">{b.name}</h4>
                      <div className="space-y-1 text-xs text-gray-500 mb-3">
                        {b.start_date && <p className="flex items-center gap-1"><Calendar size={11} />{new Date(b.start_date).toLocaleDateString('en-IN')} — {b.end_date ? new Date(b.end_date).toLocaleDateString('en-IN') : 'Ongoing'}</p>}
                        <p className="flex items-center gap-1"><Users size={11} />{b.student_count ?? 0} students</p>
                        <p className="flex items-center gap-1"><BookOpen size={11} />{b.course_count ?? 0} courses</p>
                        <p className="flex items-center gap-1"><GraduationCap size={11} />{b.faculty_count ?? 0} faculty</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{b.status || 'active'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* COURSES */}
          {activeTab === 'courses' && (
            courses.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No courses yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>{['Course', 'Category', 'Approval Status', 'Enrolled', 'Created'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {courses.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-sm text-gray-900">{c.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{c.category || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          c.status === 'approved' ? 'bg-green-100 text-green-800' :
                          c.status === 'pending'  ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'
                        }`}>{c.status || 'draft'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm">{c.enrolled_count ?? 0}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}

          {/* FACULTY */}
          {activeTab === 'faculty' && (
            faculty.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No faculty assigned yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>{['Faculty', 'Courses', 'Batches', 'Status'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {faculty.map(f => (
                    <tr key={f.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                            {(f.full_name || 'F').charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-900">{f.full_name}</p>
                            <p className="text-xs text-gray-500">{f.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{f.course_count ?? 0}</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg">{f.batch_count ?? 0}</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* Create Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Create Batch</h3>
              <button onClick={() => { setShowBatchModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4 text-sm"><AlertCircle size={18} />{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Name *</label>
                <input type="text" value={batchForm.name} onChange={e => setBatchForm({ ...batchForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. Batch 2025-A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                  <input type="date" value={batchForm.start_date} onChange={e => setBatchForm({ ...batchForm, start_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input type="date" value={batchForm.end_date} onChange={e => setBatchForm({ ...batchForm, end_date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Courses</label>
                <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {courses.length === 0
                    ? <p className="text-xs text-gray-400 p-2">No approved courses yet.</p>
                    : courses.map(c => (
                      <label key={c.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input type="checkbox" checked={batchForm.course_ids.includes(c.id)}
                          onChange={e => setBatchForm({ ...batchForm, course_ids: e.target.checked ? [...batchForm.course_ids, c.id] : batchForm.course_ids.filter(id => id !== c.id) })} />
                        <span className="text-sm text-gray-700">{c.title}</span>
                      </label>
                    ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreateBatch} disabled={saving} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Creating...' : 'Create Batch'}
              </button>
              <button onClick={() => { setShowBatchModal(false); setError(''); }} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal — submitted to admin for approval per 2.3 */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Create Course</h3>
              <button onClick={() => { setShowCourseModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4 text-sm"><AlertCircle size={18} />{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title *</label>
                <input type="text" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. Banking Fundamentals" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <input type="text" value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. Finance, Product Management" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="Brief course description..." />
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-700 font-medium">This course will be submitted to admin for approval before it goes live for students.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreateCourse} disabled={saving} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Submitting...' : 'Submit for Approval'}
              </button>
              <button onClick={() => { setShowCourseModal(false); setError(''); }} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== PLACEMENT TRACKER — 2.4 (read-only) ====================
function PlacementTracker() {
  const [tracker, setTracker] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('students');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [tRes, dRes] = await Promise.all([
        api.get('/institute/placement-tracker'),
        api.get('/institute/placement-drives'),
      ]);
      if (tRes.data.success) setTracker(tRes.data.students || []);
      if (dRes.data.success) setDrives(dRes.data.drives || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const statusConfig = {
    applied:     { label: 'Applied',     badge: 'bg-blue-100 text-blue-800'     },
    shortlisted: { label: 'Shortlisted', badge: 'bg-purple-100 text-purple-800' },
    r1:          { label: 'Round 1',     badge: 'bg-orange-100 text-orange-800' },
    r2:          { label: 'Round 2',     badge: 'bg-yellow-100 text-yellow-800' },
    hr:          { label: 'HR Round',    badge: 'bg-indigo-100 text-indigo-800' },
    selected:    { label: 'Selected',    badge: 'bg-green-100 text-green-800'   },
    rejected:    { label: 'Rejected',    badge: 'bg-red-100 text-red-800'       },
  };

  const filtered = tracker.filter(s => {
    const matchSearch = (s.full_name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || s.best_status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Placement Tracker</h2>
          <p className="text-sm text-gray-500 mt-1">Read-only view — institute cannot create or manage drives</p>
        </div>
        <button onClick={() => window.open('/api/institute/placement-tracker/export', '_blank')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition">
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Applied',     value: tracker.filter(s => s.best_status && s.best_status !== 'not_applied').length, color: 'from-blue-500 to-blue-600'    },
          { label: 'Shortlisted', value: tracker.filter(s => ['shortlisted','r1','r2','hr'].includes(s.best_status)).length,   color: 'from-purple-500 to-purple-600' },
          { label: 'Selected',    value: tracker.filter(s => s.best_status === 'selected').length,                             color: 'from-green-500 to-green-600'   },
          { label: 'Open Drives', value: drives.filter(d => d.status === 'open').length,                                      color: 'from-orange-500 to-orange-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} p-5 rounded-xl shadow-md text-white`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-1 opacity-80">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'students', label: 'Student Applications', icon: Users     },
            { key: 'drives',   label: 'Open Drives',          icon: Briefcase },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition border-b-2 ${activeTab === tab.key ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <tab.icon size={16} />{tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'students' && (
            <>
              <div className="flex gap-4 mb-5">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all','applied','shortlisted','selected','rejected'].map(s => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition ${statusFilter === s ? 'bg-accent text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      {s === 'all' ? 'All' : s}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.length === 0 ? (
                <div className="text-center py-12"><Users className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No applications found.</p></div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>{['Student', 'Batch', 'Applications', 'Best Status', 'Company', 'Package'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.map(s => {
                      const sc = statusConfig[s.best_status] || { label: 'Not Applied', badge: 'bg-gray-100 text-gray-600' };
                      return (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                {(s.full_name || 'S').charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-900">{s.full_name}</p>
                                <p className="text-xs text-gray-500">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{s.batch_name || '—'}</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{s.application_count ?? 0}</span></td>
                          <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${sc.badge}`}>{sc.label}</span></td>
                          <td className="px-6 py-4 text-sm text-gray-600">{s.selected_company || '—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{s.package_lpa ? `₹${s.package_lpa} LPA` : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}

          {activeTab === 'drives' && (
            drives.length === 0 ? (
              <div className="text-center py-12"><Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No open drives.</p></div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {drives.map(d => (
                  <div key={d.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{d.company_name}</h4>
                        <p className="text-xs text-gray-500">{d.role_type || 'full-time'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${d.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{d.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                      {[
                        { label: 'Applied',     value: d.applicant_count   ?? 0 },
                        { label: 'Shortlisted', value: d.shortlisted_count ?? 0 },
                        { label: 'Selected',    value: d.offer_count       ?? 0 },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-lg p-2">
                          <p className="font-bold text-gray-900">{value}</p>
                          <p className="text-gray-500">{label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      {d.package_lpa > 0 && <span>₹{d.package_lpa} LPA</span>}
                      {d.deadline && <span className="flex items-center gap-1"><Calendar size={11} />{new Date(d.deadline).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== ANALYTICS — 2.5 ====================
function InstituteAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const r = await api.get('/institute/analytics');
      if (r.data.success) setData(r.data.analytics || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;
  if (!data)   return <div className="text-center py-16 bg-white rounded-xl shadow-md"><p className="text-gray-600">Unable to load analytics.</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Analytics & Reports</h2>
        <button onClick={() => window.open('/api/institute/analytics/export', '_blank')}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition">
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* Top metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: TrendingUp,  color: 'text-green-500',  label: 'Placement Rate',  value: data.placementRate  != null ? `${data.placementRate}%`  : '—' },
          { icon: BookOpen,    color: 'text-blue-500',   label: 'Avg Completion',  value: data.avgCompletion  != null ? `${data.avgCompletion}%`  : '—' },
          { icon: Users,       color: 'text-purple-500', label: 'Active Students', value: data.activeStudents ?? '—'                                     },
          { icon: IndianRupee, color: 'text-yellow-500', label: 'Fee Collected',   value: data.feeCollected   != null ? `₹${data.feeCollected}`   : '—' },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="bg-white p-6 rounded-xl shadow-md">
            <Icon className={`${color} mb-2`} size={24} />
            <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Course completion rate — 2.5 */}
      {data.courseStats?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Course-wise Completion Rate</h3>
          <div className="space-y-4">
            {data.courseStats.map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span className="font-semibold">{c.title}</span>
                  <span className="text-xs text-gray-500">{c.enrolled} enrolled · <strong>{c.completion}%</strong> complete · <span className="text-red-500">{c.dropout}% dropout</span></span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${c.completion}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batch-wise placement — 2.5 */}
      {data.batchPlacement?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Batch-wise Placement Report</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>{['Batch', 'Students', 'Applied', 'Selected', 'Rate', 'Avg Package'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.batchPlacement.map((b, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-800">{b.batch}</td>
                    <td className="px-6 py-4">{b.students}</td>
                    <td className="px-6 py-4">{b.applied}</td>
                    <td className="px-6 py-4">{b.selected}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${b.rate}%` }} />
                        </div>
                        <span className="font-semibold">{b.rate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{b.avg_package ? `₹${b.avg_package} LPA` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fee collection report — 2.5 */}
      {data.feeStats && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Fee Collection Report</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: 'Total Collected', value: `₹${data.feeStats.collected ?? 0}`, color: 'bg-green-50 text-green-800 border-green-200'   },
              { label: 'Pending',          value: `₹${data.feeStats.pending   ?? 0}`, color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
              { label: 'Overdue',          value: `₹${data.feeStats.overdue   ?? 0}`, color: 'bg-red-50 text-red-800 border-red-200'          },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-5 rounded-xl border ${color}`}>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm font-semibold mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN INSTITUTE DASHBOARD ====================
export default function InstituteDashboard() {
  const location  = useLocation();
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [userMenuOpen,      setUserMenuOpen]       = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp,          setShowHelp]           = useState(false);
  const [notifications,     setNotifications]      = useState([]);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const r = await api.get('/notifications');
      if (r.data.success) setNotifications(r.data.notifications || []);
    } catch (e) {
      if (e?.response?.status !== 404) console.error(e);
      setNotifications([]);
    }
  };

  const unreadCount  = notifications.filter(n => !n.is_read).length;
  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { path: '/institute',           label: 'Overview',   icon: BarChart3      },
    { path: '/institute/students',  label: 'Students',   icon: Users          },
    { path: '/institute/batches',   label: 'Batches',    icon: Layers         },
    { path: '/institute/courses',   label: 'Courses',    icon: BookOpen       },
    { path: '/institute/placement', label: 'Placement',  icon: Briefcase      },
    { path: '/institute/analytics', label: 'Analytics',  icon: TrendingUp     },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gradient-to-b from-[#1e5a8e] to-[#164266] text-white transition-all duration-300 overflow-hidden flex-shrink-0 shadow-2xl`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-blue-700/50">
            <div className="flex items-center justify-center">
              <img src="/project.png" alt="Upskillize" className="h-10 w-auto" onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <p className="text-center text-xs text-blue-300 mt-2 font-semibold tracking-widest uppercase">Institute Portal</p>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map(item => {
              const Icon     = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}
                  className={`w-full flex items-center px-6 py-3.5 hover:bg-blue-800/50 transition-all group ${isActive ? 'bg-[#164266] border-l-4 border-orange-400' : ''}`}>
                  <Icon size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── TOPBAR ── */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search students, batches, courses..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false); }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition relative">
                  <Bell size={20} />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
                {showNotifications && (
                  <>
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {notifications.length === 0
                          ? <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                          : notifications.map(n => (
                            <div key={n.id} className="p-4 hover:bg-gray-50">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full mt-2 bg-blue-500 flex-shrink-0"></div>
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                                  <p className="text-xs text-gray-600">{n.message}</p>
                                  <span className="text-xs text-gray-400">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  </>
                )}
              </div>

              {/* Help */}
              <div className="relative">
                <button onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition">
                  <HelpCircle size={20} />
                </button>
                {showHelp && (
                  <>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Help</h3>
                        <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                      </div>
                      <div className="p-4 space-y-2">
                        {[
                          { icon: BookOpen,      label: 'Documentation',   color: 'text-blue-600'   },
                          { icon: MonitorPlay,   label: 'Video Tutorials', color: 'text-green-600'  },
                          { icon: MessageSquare, label: 'Contact Support', color: 'text-purple-600' },
                          { icon: HelpCircle,    label: 'FAQs',            color: 'text-orange-600' },
                        ].map(({ icon: Icon, label, color }) => (
                          <a key={label} href="#" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                            <Icon size={18} className={color} />
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowHelp(false)} />
                  </>
                )}
              </div>

              {/* User menu */}
              <div className="relative ml-2">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-300 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'I'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">{user?.full_name || 'Institute Admin'}</div>
                    <div className="text-xs text-gray-500">Institute</div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <button onClick={() => { setUserMenuOpen(false); navigate('/institute/profile'); }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                        <User size={16} /> Profile
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); navigate('/institute/settings'); }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                        <Settings size={16} /> Settings
                      </button>
                      <hr className="my-2" />
                      <button onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-red-600">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/"           element={<Overview />}          />
              <Route path="/students"   element={<StudentManagement />} />
              <Route path="/batches"    element={<BatchManagement />}   />
              <Route path="/courses"    element={<BatchManagement />}   />
              <Route path="/placement"  element={<PlacementTracker />}  />
              <Route path="/analytics"  element={<InstituteAnalytics />}/>
            </Routes>
          </div>
        </main>

      </div>
    </div>
  );
}