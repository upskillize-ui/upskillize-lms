// ============================================================
//  CorporateDashboard.jsx
//  MERGED: Corporate + Placement features in one dashboard
//  All placement features are now part of the Corporate portal.
// ============================================================
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Building2, Users, BookOpen, Award, Bell, LogOut,
  Plus, Search, Download, Edit2, Trash2, Eye, X,
  CheckCircle, XCircle, Calendar, Clock, Mail,
  ChevronDown, ChevronRight, AlertCircle,
  MapPin, IndianRupee, TrendingUp, BarChart3,
  Activity, RefreshCw, Menu, User, HelpCircle,
  MonitorPlay, MessageSquare, Settings,
  GraduationCap, Star, UserCheck, Briefcase,
  Upload, Filter, FileText, UserPlus, Target,
  Layers, CreditCard, BarChart2, Video,
  PlayCircle, BookMarked, Clock3, ExternalLink,
} from 'lucide-react';

// ── Shared avatar SVG ────────────────────────────────────────
const AvatarSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="3.5" fill="white" />
    <circle cx="50" cy="37" r="17" fill="#111" />
    <ellipse cx="50" cy="80" rx="27" ry="17" fill="#111" />
  </svg>
);

// ============================================================
// OVERVIEW
// ============================================================
function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchData();
    const handleFocus = () => fetchData(true);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchData = async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const [corpRes, drivesRes] = await Promise.all([
        api.get('/corporate/dashboard/stats'),
        api.get('/corporate/drives').catch(() => ({ data: { success: false } })),
      ]);
      if (corpRes.data.success) {
        setStats(corpRes.data.stats || {});
        setRecentActivity(corpRes.data.activities || []);
        setLastUpdated(new Date());
      }
      if (drivesRes.data.success) setDrives(drivesRes.data.drives || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;
  if (!stats)  return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Unable to load dashboard data.</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Corporate Dashboard</h2>
          {lastUpdated && <p className="text-xs text-gray-400 mt-1">Last updated: {lastUpdated.toLocaleTimeString()}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchData(true)} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link to="/corporate/employees" className="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md">
            <Users size={20} /> Manage Team
          </Link>
        </div>
      </div>

      {/* Training gradient stat cards */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Training & L&D</p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Users,      label: 'Employees Enrolled', value: stats.employeesEnrolled,  sub: 'Active accounts',        color: 'from-blue-500 to-blue-600'    },
            { icon: BookOpen,   label: 'Active Courses',      value: stats.activeCourses,      sub: 'Assigned to employees',  color: 'from-green-500 to-green-600'  },
            { icon: TrendingUp, label: 'Avg Completion',      value: stats.avgCompletion != null ? `${stats.avgCompletion}%` : '—', sub: 'Across all employees', color: 'from-yellow-500 to-yellow-600' },
            { icon: Award,      label: 'Certificates Issued', value: stats.certificatesIssued, sub: 'This quarter',           color: 'from-purple-500 to-purple-600' },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg text-white`}>
              <Icon className="h-10 w-10 mb-3 opacity-80" />
              <h3 className="text-sm font-medium mb-1 opacity-90">{label}</h3>
              <p className="text-3xl font-bold">{value ?? '—'}</p>
              <p className="text-xs mt-2 opacity-75">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Placement gradient stat cards */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Placement & Hiring</p>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Briefcase,    label: 'Active Drives',       value: stats.activeDrives    ?? stats.jobPostings  ?? '—', color: 'from-indigo-500 to-indigo-600'  },
            { icon: UserCheck,    label: 'Total Applicants',    value: stats.totalApplicants ?? stats.applications ?? '—', color: 'from-pink-500 to-rose-600'      },
            { icon: GraduationCap,label: 'Students Shortlisted',value: stats.shortlisted     ?? '—',                       color: 'from-orange-500 to-orange-600'  },
            { icon: Award,        label: 'Offers / Selected',   value: stats.offersMade      ?? '—',                       color: 'from-teal-500 to-teal-600'      },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg text-white`}>
              <Icon className="h-10 w-10 mb-3 opacity-80" />
              <h3 className="text-sm font-medium mb-1 opacity-90">{label}</h3>
              <p className="text-3xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Border-left secondary cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { icon: TrendingUp, label: 'Placement Rate',    value: stats.placementRate != null ? `${stats.placementRate}%` : '—', border: 'border-blue-500',   text: 'text-blue-500'   },
          { icon: Activity,   label: 'Drives This Month', value: stats.drivesThisMonth ?? '—',                                  border: 'border-green-500',  text: 'text-green-500'  },
          { icon: IndianRupee,label: 'Avg Package (LPA)', value: stats.avgPackage != null ? `₹${stats.avgPackage}` : '—',       border: 'border-yellow-500', text: 'text-yellow-500' },
          { icon: CreditCard, label: 'Subscription',      value: stats.planName ?? 'Active',                                    border: 'border-purple-500', text: 'text-purple-500' },
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
        <div className="grid md:grid-cols-6 gap-4">
          {[
            { to: '/corporate/employees',  icon: UserPlus,      label: 'Add Employee',    sub: 'Invite team members'  },
            { to: '/corporate/training',   icon: BookOpen,      label: 'Assign Course',   sub: 'Assign to employees'  },
            { to: '/corporate/drives',     icon: Briefcase,     label: 'Create Drive',    sub: 'Post placement drive' },
            { to: '/corporate/applicants', icon: Users,         label: 'Applicants',      sub: 'Review & shortlist'   },
            { to: '/corporate/students',   icon: GraduationCap, label: 'Browse Students', sub: 'Find talent'          },
            { to: '/corporate/analytics',  icon: BarChart3,     label: 'Analytics',       sub: 'Reports'              },
          ].map(({ to, icon: Icon, label, sub }) => (
            <Link key={to} to={to} className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group">
              <Icon className="text-accent group-hover:scale-110 transition" size={28} />
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
        {/* Recent Drives */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Placement Drives</h3>
            <Briefcase className="text-accent" size={20} />
          </div>
          {drives.length === 0 ? <p className="text-gray-400 text-sm">No drives yet.</p> : (
            <div className="space-y-3">
              {drives.slice(0, 5).map((d, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{d.company_name}</p>
                    <p className="text-xs text-gray-500">{d.applicant_count ?? 0} applicants</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    d.status === 'open' ? 'bg-green-100 text-green-800' :
                    d.status === 'closed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <Activity className="text-accent" size={20} />
          </div>
          {recentActivity.length === 0
            ? <p className="text-gray-400 text-sm">No recent activity.</p>
            : <div className="space-y-3">{recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <div><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-gray-500">{a.time}</p></div>
                </div>
              ))}</div>
          }
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Subscription</h3>
          <CreditCard className="text-accent" size={20} />
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: 'Plan',       value: stats.planName    || 'Corporate Pro'                                             },
            { label: 'Seats Used', value: `${stats.seatsUsed ?? 0} / ${stats.totalSeats ?? 0}`                            },
            { label: 'Renews On',  value: stats.renewalDate ? new Date(stats.renewalDate).toLocaleDateString('en-IN') : '—' },
            { label: 'Status',     value: stats.subscriptionStatus || 'Active'                                             },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
        <Link to="/corporate/billing" className="block text-center mt-3 text-xs text-accent font-semibold hover:underline">View billing details →</Link>
      </div>
    </div>
  );
}

// ============================================================
// EMPLOYEE MANAGEMENT
// ============================================================
function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [inviteEmails, setInviteEmails] = useState('');
  const [assignForm, setAssignForm] = useState({ course_id: '', deadline: '', department: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [empRes, courseRes] = await Promise.all([
        api.get('/corporate/employees'),
        api.get('/courses').catch(() => ({ data: { success: false } })),
      ]);
      if (empRes.data.success)    setEmployees(empRes.data.employees || []);
      if (courseRes.data.success) setCourses(courseRes.data.courses || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleInvite = async () => {
    const emails = inviteEmails.split(/[\n,]/).map(e => e.trim()).filter(Boolean);
    if (!emails.length) { setError('Enter at least one email.'); return; }
    setSaving(true);
    try {
      const r = await api.post('/corporate/employees/invite', { emails });
      if (r.data.success) { setEmployees(prev => [...(r.data.employees || []), ...prev]); setShowInviteModal(false); setInviteEmails(''); setError(''); }
    } catch (e) { setError(e.response?.data?.message || 'Invite failed.'); }
    finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!assignForm.course_id) { setError('Select a course.'); return; }
    setSaving(true);
    try {
      const body = {
        course_id:    assignForm.course_id,
        deadline:     assignForm.deadline || null,
        employee_ids: selectedEmployee
          ? [selectedEmployee.id]
          : employees.filter(e => e.department === assignForm.department).map(e => e.id),
      };
      const r = await api.post('/corporate/assign', body);
      if (r.data.success) { setShowAssignModal(false); setAssignForm({ course_id: '', deadline: '', department: '' }); setSelectedEmployee(null); fetchData(); }
    } catch (e) { setError(e.response?.data?.message || 'Assignment failed.'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/corporate/employee/${id}/status`, { status });
      setEmployees(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    } catch (e) { alert('Failed to update status.'); }
  };

  const departments = ['all', ...new Set(employees.map(e => e.department).filter(Boolean))];
  const filtered = employees.filter(e => {
    const matchSearch = (e.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || (e.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept   = deptFilter === 'all' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Employee Management</h2>
        <div className="flex gap-3">
          <button onClick={() => { setSelectedEmployee(null); setShowAssignModal(true); }}
            className="flex items-center gap-2 px-4 py-2 border border-accent text-accent rounded-lg hover:bg-blue-50 transition">
            <BookOpen size={16} /> Assign Course
          </button>
          <button onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
            <UserPlus size={16} /> Invite Employees
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search employees..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm">
          {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
        </select>
        <span className="flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold self-center">{filtered.length} employees</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No employees found.</p>
          <button onClick={() => setShowInviteModal(true)} className="mt-4 px-6 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Invite First Employee</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>{['Employee', 'Department', 'Assigned Courses', 'Avg Progress', 'Last Active', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                        <AvatarSVG />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{emp.department || '—'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">{emp.assigned_courses?.length ?? 0} courses</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${emp.completion_avg ?? 0}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">{emp.completion_avg ?? 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {emp.last_active ? new Date(emp.last_active).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      emp.status === 'active'    ? 'bg-green-100 text-green-800' :
                      emp.status === 'suspended' ? 'bg-red-100 text-red-800'    : 'bg-gray-100 text-gray-700'
                    }`}>{emp.status || 'active'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => { setSelectedEmployee(emp); setShowAssignModal(true); }}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition flex items-center gap-1">
                        <BookOpen size={11} /> Assign
                      </button>
                      {emp.status === 'active'
                        ? <button onClick={() => handleStatusChange(emp.id, 'suspended')} className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition">Suspend</button>
                        : <button onClick={() => handleStatusChange(emp.id, 'active')}    className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition">Activate</button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Invite Employees</h3>
              <button onClick={() => { setShowInviteModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4"><AlertCircle size={18} /><span className="text-sm">{error}</span></div>}
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Addresses</label>
            <textarea value={inviteEmails} onChange={e => setInviteEmails(e.target.value)} rows="5"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm"
              placeholder={"john@company.com\njane@company.com"} />
            <p className="text-xs text-gray-500 mt-1">Each invited employee will receive a setup link via email.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={handleInvite} disabled={saving} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Sending...' : 'Send Invites'}
              </button>
              <button onClick={() => { setShowInviteModal(false); setError(''); }} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">
                {selectedEmployee ? `Assign to ${selectedEmployee.name}` : 'Assign to Department'}
              </h3>
              <button onClick={() => { setShowAssignModal(false); setError(''); setSelectedEmployee(null); }} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4"><AlertCircle size={18} /><span className="text-sm">{error}</span></div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Course *</label>
                <select value={assignForm.course_id} onChange={e => setAssignForm({ ...assignForm, course_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                  <option value="">Choose a course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Completion Deadline</label>
                <input type="date" value={assignForm.deadline} onChange={e => setAssignForm({ ...assignForm, deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
              </div>
              {!selectedEmployee && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Department (empty = all)</label>
                  <select value={assignForm.department} onChange={e => setAssignForm({ ...assignForm, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
                    <option value="">All Employees</option>
                    {departments.filter(d => d !== 'all').map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAssign} disabled={saving} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Assigning...' : 'Assign Course'}
              </button>
              <button onClick={() => { setShowAssignModal(false); setError(''); setSelectedEmployee(null); }} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TRAINING MANAGEMENT
// ============================================================
function TrainingManagement() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      const r = await api.get('/corporate/assignments');
      if (r.data.success) setAssignments(r.data.assignments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = assignments.filter(a => {
    const matchSearch = (a.employee_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.course_title ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Training Management</h2>
        <button onClick={() => { const a = document.createElement('a'); a.href = '/api/corporate/assignments/export'; a.download = 'training-report.csv'; a.click(); }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-semibold">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Total Assignments', value: assignments.length,                                        color: 'bg-blue-50 text-blue-800 border-blue-200'   },
          { label: 'Completed',          value: assignments.filter(a => a.status === 'completed').length, color: 'bg-green-50 text-green-800 border-green-200' },
          { label: 'Overdue',            value: assignments.filter(a => a.status === 'overdue').length,   color: 'bg-red-50 text-red-800 border-red-200'       },
        ].map(({ label, value, color }) => (
          <div key={label} className={`p-4 rounded-xl border ${color}`}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search by employee or course..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'assigned', 'in_progress', 'completed', 'overdue'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition ${statusFilter === s ? 'bg-accent text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No assignments found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>{['Employee', 'Course', 'Department', 'Progress', 'Deadline', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                        <AvatarSVG />
                      </div>
                      <span className="font-semibold text-sm text-gray-900">{a.employee_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{a.course_title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{a.department || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${a.progress_pct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${a.progress_pct || 0}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">{a.progress_pct || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{a.deadline ? new Date(a.deadline).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      a.status === 'completed'   ? 'bg-green-100 text-green-800'  :
                      a.status === 'overdue'     ? 'bg-red-100 text-red-800'      :
                      a.status === 'in_progress' ? 'bg-blue-100 text-blue-800'    : 'bg-gray-100 text-gray-700'
                    }`}>{a.status?.replace('_', ' ') || 'assigned'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {a.certificate_url && (
                      <a href={a.certificate_url} target="_blank" rel="noopener noreferrer">
                        <button className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-100 transition flex items-center gap-1">
                          <Download size={11} /> Certificate
                        </button>
                      </a>
                    )}
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
// PLACEMENT DRIVES (merged from PlacementDashboard)
// ============================================================
function PlacementDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const emptyForm = { company_name: '', jd: '', package_lpa: '', min_cgpa: '', required_skills: '', eligible_batches: '', deadline: '', location: '', role_type: 'full-time' };
  const [driveForm, setDriveForm] = useState(emptyForm);

  useEffect(() => { fetchDrives(); }, []);

  const fetchDrives = async () => {
    try { const r = await api.get('/corporate/drives'); if (r.data.success) setDrives(r.data.drives || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    setError('');
    if (!driveForm.company_name || !driveForm.jd || !driveForm.deadline) { setError('Company name, JD and deadline are required.'); return; }
    setSaving(true);
    try {
      const r = await api.post('/corporate/drive', {
        ...driveForm,
        required_skills: driveForm.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        eligible_batches: driveForm.eligible_batches.split(',').map(s => s.trim()).filter(Boolean),
        package_lpa: parseFloat(driveForm.package_lpa) || 0,
        min_cgpa: parseFloat(driveForm.min_cgpa) || 0,
      });
      if (r.data.success) { setDrives([r.data.drive, ...drives]); setShowCreateModal(false); setDriveForm(emptyForm); }
    } catch (e) { setError(e.response?.data?.message || 'Failed to create drive.'); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    setSaving(true);
    try {
      const r = await api.put(`/corporate/drive/${editingDrive.id}`, driveForm);
      if (r.data.success) { setDrives(drives.map(d => d.id === editingDrive.id ? { ...d, ...driveForm } : d)); setShowEditModal(false); setEditingDrive(null); }
    } catch (e) { setError(e.response?.data?.message || 'Failed to update.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this drive?')) return;
    try { await api.delete(`/corporate/drive/${id}`); setDrives(drives.filter(d => d.id !== id)); }
    catch (e) { alert('Failed to delete.'); }
  };

  const openEdit = (drive) => {
    setEditingDrive(drive);
    setDriveForm({ company_name: drive.company_name || '', jd: drive.jd_text || '', package_lpa: drive.package_lpa || '', min_cgpa: drive.min_cgpa || '', required_skills: (drive.required_skills || []).join(', '), eligible_batches: (drive.eligible_batches || []).join(', '), deadline: drive.deadline ? drive.deadline.split('T')[0] : '', location: drive.location || '', role_type: drive.role_type || 'full-time' });
    setShowEditModal(true);
  };

  const filteredDrives = drives.filter(d => {
    const matchSearch = (d.company_name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'all' || d.status === filter;
    return matchSearch && matchFilter;
  });

  const ModalForm = ({ onSubmit, onClose }) => (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle size={18} /><span className="text-sm">{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X size={16} /></button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name *</label>
          <input type="text" value={driveForm.company_name} onChange={e => setDriveForm({ ...driveForm, company_name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. Infosys, TCS" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description *</label>
          <textarea value={driveForm.jd} onChange={e => setDriveForm({ ...driveForm, jd: e.target.value })} rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="Role responsibilities and requirements..." />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Package (LPA)</label>
          <input type="number" step="0.1" value={driveForm.package_lpa} onChange={e => setDriveForm({ ...driveForm, package_lpa: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. 6.5" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum CGPA</label>
          <input type="number" step="0.1" min="0" max="10" value={driveForm.min_cgpa} onChange={e => setDriveForm({ ...driveForm, min_cgpa: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. 7.0" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
          <input type="text" value={driveForm.location} onChange={e => setDriveForm({ ...driveForm, location: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. Bangalore, Remote" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Role Type</label>
          <select value={driveForm.role_type} onChange={e => setDriveForm({ ...driveForm, role_type: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
            <option value="full-time">Full-time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Required Skills (comma separated)</label>
          <input type="text" value={driveForm.required_skills} onChange={e => setDriveForm({ ...driveForm, required_skills: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="React, Node.js, SQL" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Eligible Batches (comma separated)</label>
          <input type="text" value={driveForm.eligible_batches} onChange={e => setDriveForm({ ...driveForm, eligible_batches: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="2024, 2025" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Application Deadline *</label>
          <input type="date" value={driveForm.deadline} onChange={e => setDriveForm({ ...driveForm, deadline: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onSubmit} disabled={saving} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {saving ? 'Saving...' : editingDrive ? 'Update Drive' : 'Create Drive'}
        </button>
        <button onClick={onClose} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Placement Drives</h2>
        <button onClick={() => { setDriveForm(emptyForm); setEditingDrive(null); setError(''); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" /> Create Drive
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="text" placeholder="Search by company name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <div className="flex gap-2">
            {['all', 'open', 'closed', 'draft', 'archived'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg capitalize transition ${filter === f ? 'bg-accent text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {filteredDrives.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No drives found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map(drive => (
            <div key={drive.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-accent to-blue-600"></div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{drive.company_name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{drive.role_type || 'Full-time'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    drive.status === 'open'   ? 'bg-green-100 text-green-800' :
                    drive.status === 'closed' ? 'bg-red-100 text-red-800' :
                    drive.status === 'draft'  ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>
                    {drive.status}
                  </span>
                </div>
                <div className="space-y-1.5 mb-4">
                  {[
                    { icon: MapPin,      value: drive.location || '—' },
                    { icon: IndianRupee, value: drive.package_lpa ? `${drive.package_lpa} LPA` : '—' },
                    { icon: Calendar,    value: drive.deadline ? new Date(drive.deadline).toLocaleDateString('en-IN') : '—' },
                    { icon: Users,       value: `${drive.applicant_count ?? 0} applicants` },
                  ].map(({ icon: Icon, value }) => (
                    <div key={value} className="flex items-center gap-2 text-sm text-gray-600">
                      <Icon size={14} className="flex-shrink-0" /><span>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 mb-4">
                  {[
                    { num: drive.applicant_count   || 0, lbl: 'Applied'     },
                    { num: drive.shortlisted_count || 0, lbl: 'Shortlisted' },
                    { num: drive.offer_count       || 0, lbl: 'Selected'    },
                  ].map((f, i, arr) => (
                    <div key={f.lbl} className="flex items-center gap-1">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-800">{f.num}</p>
                        <p className="text-xs text-gray-500">{f.lbl}</p>
                      </div>
                      {i < arr.length - 1 && <ChevronRight size={14} className="text-gray-300 mx-1" />}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link to={`/corporate/applicants?drive=${drive.id}`}
                    className="flex-1 bg-accent hover:bg-blue-600 text-white text-center py-2 rounded-lg font-semibold transition text-sm">
                    View Applicants
                  </Link>
                  <button onClick={() => openEdit(drive)} className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(drive.id)} className="px-3 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg transition"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Create Placement Drive</h3>
              <button onClick={() => { setShowCreateModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <ModalForm onSubmit={handleCreate} onClose={() => { setShowCreateModal(false); setError(''); }} />
          </div>
        </div>
      )}

      {showEditModal && editingDrive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Edit Drive</h3>
              <button onClick={() => { setShowEditModal(false); setEditingDrive(null); setError(''); }} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <ModalForm onSubmit={handleEdit} onClose={() => { setShowEditModal(false); setEditingDrive(null); setError(''); }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// APPLICANT MANAGEMENT (from Placement, adapted to /corporate routes)
// ============================================================
function ApplicantManagement() {
  const [drives, setDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drivesLoading, setDrivesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchDrives(); }, []);
  useEffect(() => { if (selectedDrive) fetchApplicants(selectedDrive); }, [selectedDrive]);

  const fetchDrives = async () => {
    try { const r = await api.get('/corporate/drives'); if (r.data.success) setDrives(r.data.drives || []); }
    catch (e) { console.error(e); } finally { setDrivesLoading(false); }
  };

  const fetchApplicants = async (driveId) => {
    setLoading(true);
    try { const r = await api.get(`/corporate/drive/${driveId}/applicants`); if (r.data.success) setApplicants(r.data.applicants || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const updateStatus = async (appId, status) => {
    setUpdatingId(appId);
    try {
      await api.patch(`/corporate/applicant/${appId}/status`, { status });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    } catch (e) { alert('Failed to update status.'); }
    finally { setUpdatingId(null); }
  };

  const statusConfig = {
    applied:     { label: 'Applied',     badge: 'bg-blue-100 text-blue-800'    },
    shortlisted: { label: 'Shortlisted', badge: 'bg-purple-100 text-purple-800' },
    r1:          { label: 'Round 1',     badge: 'bg-orange-100 text-orange-800' },
    r2:          { label: 'Round 2',     badge: 'bg-yellow-100 text-yellow-800' },
    hr:          { label: 'HR Round',    badge: 'bg-indigo-100 text-indigo-800' },
    selected:    { label: 'Selected',    badge: 'bg-green-100 text-green-800'   },
    rejected:    { label: 'Rejected',    badge: 'bg-red-100 text-red-800'       },
  };

  const nextRound = { applied: 'shortlisted', shortlisted: 'r1', r1: 'r2', r2: 'hr', hr: 'selected' };

  const filtered = applicants.filter(a => {
    const matchSearch = (a.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Applicant Management</h2>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Drive</label>
            <select value={selectedDrive} onChange={e => setSelectedDrive(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent">
              <option value="">Choose a placement drive</option>
              {drives.map(d => <option key={d.id} value={d.id}>{d.company_name} — {d.role_type}</option>)}
            </select>
          </div>
          {selectedDrive && (
            <div className="flex gap-3 items-end flex-wrap">
              {Object.entries(statusConfig).map(([key, cfg]) => {
                const count = applicants.filter(a => a.status === key).length;
                if (count === 0) return null;
                return (
                  <div key={key} className={`text-center px-3 py-2 rounded-lg ${cfg.badge}`}>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-xs font-semibold">{cfg.label}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {selectedDrive && (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Search applicants..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', ...Object.keys(statusConfig)].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition ${statusFilter === s ? 'bg-accent text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {s === 'all' ? 'All' : statusConfig[s]?.label || s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!selectedDrive ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select a drive to view applicants.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No applicants found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>{['Student', 'Course', 'CGPA', 'Applied On', 'Status', 'Round', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(app => {
                const sc = statusConfig[app.status] || statusConfig.applied;
                return (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(app.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{app.name}</p>
                          <p className="text-xs text-gray-500">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{app.course || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">{app.cgpa ?? '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sc.badge}`}>{sc.label}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">Round {app.round_number || 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => { setSelectedApplicant(app); setShowProfileModal(true); }}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition flex items-center gap-1">
                          <Eye size={11} /> Profile
                        </button>
                        {nextRound[app.status] && (
                          <button onClick={() => updateStatus(app.id, nextRound[app.status])} disabled={updatingId === app.id}
                            className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-100 transition flex items-center gap-1 disabled:opacity-50">
                            <ChevronRight size={11} /> {statusConfig[nextRound[app.status]]?.label}
                          </button>
                        )}
                        {!['rejected', 'selected'].includes(app.status) && (
                          <button onClick={() => updateStatus(app.id, 'rejected')} disabled={updatingId === app.id}
                            className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition flex items-center gap-1 disabled:opacity-50">
                            <XCircle size={11} /> Reject
                          </button>
                        )}
                        {app.resume_url && (
                          <a href={app.resume_url} target="_blank" rel="noopener noreferrer">
                            <button className="px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-100 transition"><Download size={11} /></button>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showProfileModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Student Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {(selectedApplicant.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedApplicant.name}</h4>
                  <p className="text-gray-600">{selectedApplicant.email}</p>
                  <p className="text-sm text-gray-500">{selectedApplicant.course}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'CGPA',          value: selectedApplicant.cgpa ?? '—' },
                  { label: 'Status',         value: statusConfig[selectedApplicant.status]?.label || '—' },
                  { label: 'Applied On',     value: selectedApplicant.applied_at ? new Date(selectedApplicant.applied_at).toLocaleDateString('en-IN') : '—' },
                  { label: 'Current Round',  value: `Round ${selectedApplicant.round_number || 1}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              {selectedApplicant.skills?.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.skills.map(sk => <span key={sk} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{sk}</span>)}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t">
                {nextRound[selectedApplicant.status] && (
                  <button onClick={() => { updateStatus(selectedApplicant.id, nextRound[selectedApplicant.status]); setShowProfileModal(false); }}
                    className="flex-1 bg-accent hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">
                    Move to {statusConfig[nextRound[selectedApplicant.status]]?.label}
                  </button>
                )}
                {!['rejected', 'selected'].includes(selectedApplicant.status) && (
                  <button onClick={() => { updateStatus(selectedApplicant.id, 'rejected'); setShowProfileModal(false); }}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-semibold transition">Reject</button>
                )}
                {selectedApplicant.resume_url && (
                  <a href={selectedApplicant.resume_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition">
                    <Download size={16} /> Resume
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// HIRING & TALENT PIPELINE (corporate job postings + browse students)
// ============================================================
function HiringManagement() {
  const [jobs, setJobs] = useState([]);
  const [students, setStudents] = useState([]);
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [cgpaMin, setCgpaMin] = useState('');
  const [shortlisting, setShortlisting] = useState(null);
  const [selectedJob, setSelectedJob] = useState('');

  const emptyJob = { title: '', description: '', skills_required: '', min_cgpa: '', location: '', package_lpa: '', deadline: '' };
  const [jobForm, setJobForm] = useState(emptyJob);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [jobRes, studentRes, shortlistRes] = await Promise.all([
        api.get('/corporate/jobs'),
        api.get('/corporate/students').catch(() => ({ data: { success: false } })),
        api.get('/corporate/shortlist').catch(() => ({ data: { success: false } })),
      ]);
      if (jobRes.data.success)       setJobs(jobRes.data.jobs || []);
      if (studentRes.data.success)   setStudents(studentRes.data.students || []);
      if (shortlistRes.data.success) setShortlist(shortlistRes.data.shortlist || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateJob = async () => {
    if (!jobForm.title || !jobForm.description) { setError('Title and description are required.'); return; }
    setSaving(true);
    try {
      const r = await api.post('/corporate/job', {
        ...jobForm,
        skills_required: jobForm.skills_required.split(',').map(s => s.trim()).filter(Boolean),
        min_cgpa:    parseFloat(jobForm.min_cgpa)    || 0,
        package_lpa: parseFloat(jobForm.package_lpa) || 0,
      });
      if (r.data.success) { setJobs([r.data.job, ...jobs]); setShowCreateModal(false); setJobForm(emptyJob); setError(''); }
    } catch (e) { setError(e.response?.data?.message || 'Failed to create job.'); }
    finally { setSaving(false); }
  };

  const handleShortlist = async (studentId) => {
    if (!selectedJob) { alert('Select a job posting first.'); return; }
    setShortlisting(studentId);
    try {
      const r = await api.post('/corporate/shortlist', { student_id: studentId, job_id: selectedJob });
      if (r.data.success) { setShortlist(prev => [...prev, r.data.entry]); alert('Student shortlisted!'); }
    } catch (e) { alert(e.response?.data?.message || 'Failed to shortlist.'); }
    finally { setShortlisting(null); }
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = (s.full_name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCgpa   = !cgpaMin  || (s.cgpa ?? 0) >= parseFloat(cgpaMin);
    const matchSkill  = !skillFilter || (s.skills || []).some(sk => sk.toLowerCase().includes(skillFilter.toLowerCase()));
    return matchSearch && matchCgpa && matchSkill;
  });

  const shortlistedIds = new Set(shortlist.map(s => s.student_id));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Hiring & Talent Pipeline</h2>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          <Plus size={16} /> Post Job
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'jobs',      label: 'Job Postings',    icon: Briefcase     },
            { key: 'students',  label: 'Browse Students', icon: GraduationCap },
            { key: 'shortlist', label: 'My Shortlist',    icon: Star          },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition border-b-2 ${activeTab === tab.key ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <tab.icon size={16} />{tab.label}
              {tab.key === 'shortlist' && shortlist.length > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{shortlist.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'jobs' && (
            jobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No job postings yet.</p>
                <button onClick={() => setShowCreateModal(true)} className="mt-4 px-6 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Post First Job</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {jobs.map(job => (
                  <div key={job.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div><h4 className="font-bold text-gray-900">{job.title}</h4><p className="text-sm text-gray-500">{job.location || 'Remote'}</p></div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{job.status}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(job.skills_required || []).slice(0, 4).map(sk => (
                          <span key={sk} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{sk}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users size={12} />{job.application_count ?? 0} applicants</span>
                        {job.package_lpa > 0 && <span className="flex items-center gap-1"><IndianRupee size={12} />{job.package_lpa} LPA</span>}
                        {job.deadline && <span className="flex items-center gap-1"><Calendar size={12} />{new Date(job.deadline).toLocaleDateString('en-IN')}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" placeholder="Search students..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm" />
                </div>
                <input type="text" placeholder="Filter by skill..." value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm" />
                <input type="number" step="0.1" placeholder="Min CGPA" value={cgpaMin} onChange={e => setCgpaMin(e.target.value)}
                  className="w-28 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm" />
                <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm">
                  <option value="">Select job to shortlist for</option>
                  {jobs.filter(j => j.status === 'open').map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                </select>
              </div>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12"><GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No students found.</p></div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map(s => (
                    <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-11 w-11 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden flex-shrink-0"><AvatarSVG /></div>
                        <div><p className="font-bold text-gray-900 text-sm">{s.full_name}</p><p className="text-xs text-gray-500">{s.course || '—'}</p></div>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">CGPA {s.cgpa ?? '—'}</span>
                        {s.batch && <span className="text-xs text-gray-500">Batch {s.batch}</span>}
                      </div>
                      {(s.skills || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {s.skills.slice(0, 3).map(sk => <span key={sk} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{sk}</span>)}
                          {s.skills.length > 3 && <span className="text-xs text-gray-400">+{s.skills.length - 3}</span>}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedStudent(s); setShowStudentModal(true); }}
                          className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-1">
                          <Eye size={12} /> Profile
                        </button>
                        {shortlistedIds.has(s.id)
                          ? <span className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold"><CheckCircle size={12} /> Shortlisted</span>
                          : <button onClick={() => handleShortlist(s.id)} disabled={shortlisting === s.id}
                              className="flex-1 px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
                              {shortlisting === s.id ? '...' : <><Star size={12} /> Shortlist</>}
                            </button>
                        }
                        {s.resume_url && (
                          <a href={s.resume_url} target="_blank" rel="noopener noreferrer">
                            <button className="px-2 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition"><Download size={12} /></button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'shortlist' && (
            shortlist.length === 0 ? (
              <div className="text-center py-16"><Star className="h-16 w-16 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No students shortlisted yet.</p></div>
            ) : (
              <div className="space-y-3">
                {shortlist.map(entry => (
                  <div key={entry.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-sm transition">
                    <div className="h-10 w-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden flex-shrink-0"><AvatarSVG /></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{entry.student_name}</p>
                      <p className="text-xs text-gray-500">{entry.job_title} · Shortlisted {entry.shortlisted_at ? new Date(entry.shortlisted_at).toLocaleDateString('en-IN') : ''}</p>
                    </div>
                    {entry.resume_url && (
                      <a href={entry.resume_url} target="_blank" rel="noopener noreferrer">
                        <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"><Download size={12} /> Resume</button>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Post Job Opening</h3>
              <button onClick={() => { setShowCreateModal(false); setError(''); }} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            {error && <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4"><AlertCircle size={18} /><span className="text-sm">{error}</span></div>}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title *</label>
                <input type="text" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="e.g. Frontend Developer Intern" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description *</label>
                <textarea value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder="Describe the role..." />
              </div>
              {[
                { label: 'Skills Required', key: 'skills_required', placeholder: 'React, Node.js, SQL (comma-separated)', type: 'text' },
                { label: 'Min CGPA',        key: 'min_cgpa',        placeholder: 'e.g. 7.0',               type: 'number' },
                { label: 'Location',        key: 'location',        placeholder: 'e.g. Bangalore / Remote', type: 'text' },
                { label: 'Package (LPA)',   key: 'package_lpa',     placeholder: 'e.g. 5.0',               type: 'number' },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <input type={type} step="0.1" value={jobForm[key]} onChange={e => setJobForm({ ...jobForm, [key]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder={placeholder} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Application Deadline</label>
                <input type="date" value={jobForm.deadline} onChange={e => setJobForm({ ...jobForm, deadline: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreateJob} disabled={saving} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Posting...' : 'Post Job'}
              </button>
              <button onClick={() => { setShowCreateModal(false); setError(''); }} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Student Profile Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Student Profile</h3>
              <button onClick={() => setShowStudentModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
            </div>
            <div className="flex items-center gap-4 pb-5 border-b mb-5">
              <div className="h-16 w-16 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden"><AvatarSVG /></div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</h4>
                <p className="text-gray-500 text-sm">{selectedStudent.course} · Batch {selectedStudent.batch}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              {[
                { label: 'CGPA',         value: selectedStudent.cgpa ?? '—'                       },
                { label: 'Courses Done', value: selectedStudent.completed_courses ?? '—'          },
                { label: 'Certificates', value: (selectedStudent.certificate_urls || []).length   },
                { label: 'Attendance',   value: selectedStudent.attendance ? `${selectedStudent.attendance}%` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            {(selectedStudent.skills || []).length > 0 && (
              <div className="mb-5">
                <h5 className="font-semibold text-gray-800 mb-2">Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.skills.map(sk => <span key={sk} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{sk}</span>)}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t">
              {selectedStudent.resume_url && (
                <a href={selectedStudent.resume_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition">
                  <Download size={16} /> Resume
                </a>
              )}
              {!shortlistedIds.has(selectedStudent.id) && selectedJob && (
                <button onClick={() => { handleShortlist(selectedStudent.id); setShowStudentModal(false); }}
                  className="flex-1 bg-accent hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition text-sm">
                  <Star size={16} className="inline mr-1" /> Shortlist for Selected Job
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// STUDENT PROFILES (placement-style full view for corporate)
// ============================================================
function StudentProfiles() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [cgpaMin, setCgpaMin] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try { const r = await api.get('/corporate/students'); if (r.data.success) setStudents(r.data.students || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = students.filter(s => {
    const matchSearch = (s.full_name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.email ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCgpa = !cgpaMin || (s.cgpa ?? 0) >= parseFloat(cgpaMin);
    const matchSkill = !skillFilter || (s.skills || []).some(sk => sk.toLowerCase().includes(skillFilter.toLowerCase()));
    return matchSearch && matchCgpa && matchSkill;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Student Profiles</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold">{filtered.length} students</span>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          </div>
          <input type="text" placeholder="Filter by skill..." value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
          <input type="number" step="0.1" placeholder="Min CGPA" value={cgpaMin} onChange={e => setCgpaMin(e.target.value)}
            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No students found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>{['Student', 'Course', 'CGPA', 'Skills', 'Certificates', 'Actions'].map(h => (
                <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                        {(s.full_name || 'S').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{s.full_name}</p>
                        <p className="text-xs text-gray-500">Batch {s.batch || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{s.course || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${(s.cgpa ?? 0) >= 8 ? 'bg-green-100 text-green-800' : (s.cgpa ?? 0) >= 6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {s.cgpa ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(s.skills || []).slice(0, 3).map(sk => <span key={sk} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{sk}</span>)}
                      {(s.skills || []).length > 3 && <span className="text-xs text-gray-500">+{s.skills.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">{(s.certificate_urls || []).length} certs</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedStudent(s); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1">
                        <Eye size={16} /> View
                      </button>
                      {s.resume_url && (
                        <a href={s.resume_url} target="_blank" rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
                          <Download size={14} /> CV
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Student Profile</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-5">
              <div className="flex items-center gap-4 pb-5 border-b">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl">
                  {(selectedStudent.full_name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</h4>
                  <p className="text-sm text-gray-500">{selectedStudent.course} · Batch {selectedStudent.batch || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'CGPA',         value: selectedStudent.cgpa ?? '—'         },
                  { label: 'Courses Done', value: selectedStudent.completed_courses ?? '—' },
                  { label: 'Certificates', value: (selectedStudent.certificate_urls || []).length },
                  { label: 'Resume',       value: selectedStudent.resume_url ? 'Available' : 'Not uploaded' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="font-semibold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              {(selectedStudent.skills || []).length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-800 mb-2">Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills.map(sk => <span key={sk} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{sk}</span>)}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t">
                {selectedStudent.resume_url && (
                  <a href={selectedStudent.resume_url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">
                    <Download size={16} /> Download Resume
                  </a>
                )}
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold transition">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPANY PARTNERS (from Placement)
// ============================================================
function CompanyManagement() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', industry: '', website: '', contact_name: '', contact_email: '', location: '' });

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try { const r = await api.get('/corporate/companies'); if (r.data.success) setCompanies(r.data.companies || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name) { alert('Company name is required'); return; }
    setSaving(true);
    try {
      const r = await api.post('/corporate/company', form);
      if (r.data.success) { setCompanies([r.data.company, ...companies]); setShowModal(false); setForm({ name: '', industry: '', website: '', contact_name: '', contact_email: '', location: '' }); }
    } catch (e) { alert('Failed to add company.'); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Company Partners</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="h-4 w-4" /> Add Company
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No companies added yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(co => (
            <div key={co.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
              <div className="h-3 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                    {(co.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{co.name}</h3>
                    <p className="text-sm text-gray-500">{co.industry || '—'}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {co.location      && <div className="flex items-center gap-2"><MapPin size={14} />{co.location}</div>}
                  {co.contact_name  && <div className="flex items-center gap-2"><User size={14} />{co.contact_name}</div>}
                  {co.contact_email && <div className="flex items-center gap-2"><Mail size={14} />{co.contact_email}</div>}
                  {co.website       && <a href={co.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline"><FileText size={14} />{co.website}</a>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Add Company</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Company Name *', key: 'name',          placeholder: 'e.g. Infosys'     },
                { label: 'Industry',       key: 'industry',      placeholder: 'e.g. IT, Finance'  },
                { label: 'Location',       key: 'location',      placeholder: 'e.g. Bangalore'    },
                { label: 'Website',        key: 'website',       placeholder: 'https://...'       },
                { label: 'Contact Person', key: 'contact_name',  placeholder: 'HR Name'           },
                { label: 'Contact Email',  key: 'contact_email', placeholder: 'hr@company.com'    },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <input type="text" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent" placeholder={placeholder} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreate} disabled={saving} className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Company'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COURSES MANAGEMENT (from PlacementDashboard — fully ported)
// ============================================================
function CoursesManagement() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, enrollRes] = await Promise.all([
        api.get('/courses').catch(() => ({ data: { success: false } })),
        api.get('/corporate/enrolled-courses').catch(() => ({ data: { success: false } })),
      ]);
      if (coursesRes.data.success) setCourses(coursesRes.data.courses || []);
      if (enrollRes.data.success) setEnrollments(enrollRes.data.enrollments || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      const r = await api.post(`/courses/${courseId}/enroll`);
      if (r.data.success) {
        setEnrollments(prev => [...prev, { course_id: courseId, progress: 0, status: 'enrolled' }]);
        alert('Enrolled successfully!');
      }
    } catch (e) { alert(e.response?.data?.message || 'Enrollment failed.'); }
    finally { setEnrolling(null); }
  };

  const enrolledIds = new Set(enrollments.map(e => e.course_id));
  const categories = ['all', ...new Set(courses.map(c => c.category).filter(Boolean))];

  const filteredCourses = courses.filter(c => {
    const matchSearch = (c.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.instructor_name ?? '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || c.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const enrolledCourses = courses.filter(c => enrolledIds.has(c.id)).map(c => ({
    ...c, enrollment: enrollments.find(e => e.course_id === c.id),
  }));

  const recommendedCourses = courses.filter(c =>
    !enrolledIds.has(c.id) && (
      (c.tags || []).some(t => ['placement','interview','aptitude','communication','resume'].includes(t.toLowerCase())) ||
      (c.category || '').toLowerCase().includes('placement') ||
      (c.category || '').toLowerCase().includes('career')
    )
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary">Courses</h2>
          <p className="text-sm text-gray-500 mt-1">Browse, enroll, and track placement-relevant courses</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-semibold">{enrolledCourses.length} enrolled</span>
          <span className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full font-semibold">{courses.length} total</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: BookOpen,    label: 'Total Courses', value: courses.length,                                            color: 'from-blue-500 to-blue-600'    },
          { icon: BookOpen,    label: 'Enrolled',       value: enrolledCourses.length,                                    color: 'from-purple-500 to-purple-600' },
          { icon: CheckCircle, label: 'Completed',      value: enrollments.filter(e => e.status === 'completed').length, color: 'from-green-500 to-green-600'  },
          { icon: Star,        label: 'Recommended',    value: recommendedCourses.length,                                 color: 'from-orange-500 to-orange-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`bg-gradient-to-br ${color} p-5 rounded-xl shadow-md text-white`}>
            <Icon size={24} className="mb-2 opacity-80" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs mt-1 opacity-80">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'browse',      label: 'Browse All',  icon: BookOpen },
            { key: 'enrolled',    label: 'My Courses',  icon: BookOpen },
            { key: 'recommended', label: 'Recommended', icon: Star     },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition border-b-2 ${
                activeTab === tab.key ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <tab.icon size={16} />{tab.label}
              {tab.key === 'enrolled' && enrolledCourses.length > 0 && (
                <span className="ml-1 bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">{enrolledCourses.length}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'browse' && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search courses or instructors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm" />
              </div>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm">
                {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="p-6">
          {activeTab === 'browse' && (
            filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No courses found.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} isEnrolled={enrolledIds.has(course.id)}
                    enrollment={enrollments.find(e => e.course_id === course.id)}
                    onView={() => { setSelectedCourse(course); setShowModal(true); }}
                    onEnroll={() => handleEnroll(course.id)} enrolling={enrolling === course.id} />
                ))}
              </div>
            )
          )}

          {activeTab === 'enrolled' && (
            enrolledCourses.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">You have not enrolled in any courses yet.</p>
                <button onClick={() => setActiveTab('browse')} className="mt-4 px-6 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Browse Courses</button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrolledCourses.map(course => {
                  const progress = course.enrollment?.progress ?? 0;
                  const status = course.enrollment?.status ?? 'enrolled';
                  return (
                    <div key={course.id} className="flex items-center gap-5 p-5 border border-gray-200 rounded-xl hover:shadow-md transition">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {(course.title || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 truncate">{course.title}</h4>
                          {status === 'completed' && <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Completed</span>}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{course.instructor_name || 'Instructor'}</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                            <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-600">{progress}%</span>
                        </div>
                      </div>
                      <button onClick={() => { setSelectedCourse(course); setShowModal(true); }}
                        className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-100 transition flex items-center gap-1">
                        <Eye size={13} /> View
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {activeTab === 'recommended' && (
            recommendedCourses.length === 0 ? (
              <div className="text-center py-16">
                <Star className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No placement-specific courses found.</p>
                <p className="text-xs text-gray-400 mt-1">Courses tagged with placement, interview, aptitude, or career will appear here.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommendedCourses.map(course => (
                  <CourseCard key={course.id} course={course} isEnrolled={enrolledIds.has(course.id)}
                    enrollment={enrollments.find(e => e.course_id === course.id)}
                    onView={() => { setSelectedCourse(course); setShowModal(true); }}
                    onEnroll={() => handleEnroll(course.id)} enrolling={enrolling === course.id} recommended />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="h-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-t-xl" />
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
                    {(selectedCourse.title || 'C').charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCourse.title}</h3>
                    <p className="text-sm text-gray-500">{selectedCourse.instructor_name || 'Instructor'}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { icon: Clock, label: 'Duration', value: selectedCourse.duration || '—' },
                  { icon: Users, label: 'Enrolled',  value: selectedCourse.enrolled_count ?? '—' },
                  { icon: Star,  label: 'Rating',    value: selectedCourse.rating ? `${selectedCourse.rating}/5` : '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-4 text-center">
                    <Icon size={18} className="text-accent mx-auto mb-1" />
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-bold text-gray-800 text-sm">{value}</p>
                  </div>
                ))}
              </div>
              {selectedCourse.description && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-2">About this Course</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedCourse.description}</p>
                </div>
              )}
              {(selectedCourse.tags || []).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t">
                {enrolledIds.has(selectedCourse.id) ? (
                  <button className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 py-3 rounded-lg font-semibold">
                    <CheckCircle size={18} /> Already Enrolled
                  </button>
                ) : (
                  <button onClick={() => { handleEnroll(selectedCourse.id); setShowModal(false); }}
                    disabled={enrolling === selectedCourse.id}
                    className="flex-1 bg-accent hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50">
                    {enrolling === selectedCourse.id ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Course Card sub-component ────────────────────────────────
function CourseCard({ course, isEnrolled, enrollment, onView, onEnroll, enrolling, recommended }) {
  const progress = enrollment?.progress ?? 0;
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition group">
      <div className={`h-2 ${recommended ? 'bg-gradient-to-r from-orange-400 to-pink-500' : 'bg-gradient-to-r from-purple-500 to-indigo-600'}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {(course.title || 'C').charAt(0).toUpperCase()}
          </div>
          <div className="flex gap-1 ml-2 flex-wrap justify-end">
            {course.category && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{course.category}</span>}
            {recommended && <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs font-semibold rounded-full">Rec</span>}
          </div>
        </div>
        <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-accent transition">{course.title}</h4>
        <p className="text-xs text-gray-500 mb-3">{course.instructor_name || 'Instructor'}</p>
        {course.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{course.description}</p>}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          {course.duration && <span className="flex items-center gap-1"><Clock size={12} />{course.duration}</span>}
          {course.rating && <span className="flex items-center gap-1 text-yellow-600 font-semibold"><Star size={12} />{course.rating}</span>}
          {course.enrolled_count != null && <span className="flex items-center gap-1"><Users size={12} />{course.enrolled_count}</span>}
        </div>
        {isEnrolled && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span><span className="font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onView} className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-1">
            <Eye size={13} /> Details
          </button>
          {isEnrolled ? (
            <button onClick={onView} className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition flex items-center justify-center gap-1">
              Continue
            </button>
          ) : (
            <button onClick={onEnroll} disabled={enrolling} className="flex-1 px-3 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-1">
              {enrolling ? '...' : 'Enroll'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ANALYTICS (merged corporate training + placement analytics)
// ============================================================
function CorporateAnalytics() {
  const [trainingData, setTrainingData] = useState(null);
  const [placementData, setPlacementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('training');

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const [corpRes, placeRes] = await Promise.all([
        api.get('/corporate/analytics'),
        api.get('/corporate/placement-analytics').catch(() => ({ data: { success: false } })),
      ]);
      if (corpRes.data.success)  setTrainingData(corpRes.data.analytics || {});
      if (placeRes.data.success) setPlacementData(placeRes.data.analytics || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Analytics & Reports</h2>
        <button className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition">
          <Download size={18} /> Export Report
        </button>
      </div>

      {/* Tab switch */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'training',  label: 'Training Analytics',   icon: BookOpen    },
            { key: 'placement', label: 'Placement Analytics',  icon: Briefcase   },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition border-b-2 ${activeTab === tab.key ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <tab.icon size={16} />{tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* TRAINING TAB */}
          {activeTab === 'training' && trainingData && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { icon: TrendingUp, color: 'text-green-500',  label: 'Avg Completion',  value: trainingData.avgCompletion != null ? `${trainingData.avgCompletion}%` : '—' },
                  { icon: Award,      color: 'text-blue-500',   label: 'Certificates',     value: trainingData.certificatesIssued ?? '—'                                      },
                  { icon: Users,      color: 'text-purple-500', label: 'Active Employees', value: trainingData.activeEmployees    ?? '—'                                      },
                  { icon: BookOpen,   color: 'text-yellow-500', label: 'Courses Assigned', value: trainingData.coursesAssigned    ?? '—'                                      },
                ].map(({ icon: Icon, color, label, value }) => (
                  <div key={label} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <Icon className={`${color} mb-2`} size={24} />
                    <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                  </div>
                ))}
              </div>

              {trainingData.departmentStats?.length > 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Department-wise Completion</h3>
                  <div className="space-y-4">
                    {trainingData.departmentStats.map((dept, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                          <span className="font-semibold">{dept.department}</span>
                          <span className="text-xs text-gray-500">{dept.employees} employees · <span className="font-bold">{dept.completion}%</span></span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${dept.completion}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {trainingData.courseStats?.length > 0 && (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Course Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white border-b-2 border-gray-200">
                        <tr>{['Course', 'Assigned', 'Completed', 'In Progress', 'Completion Rate'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {trainingData.courseStats.map((course, idx) => {
                          const rate = course.assigned > 0 ? Math.round((course.completed / course.assigned) * 100) : 0;
                          return (
                            <tr key={idx} className="hover:bg-white">
                              <td className="px-6 py-4 font-semibold text-gray-800">{course.title}</td>
                              <td className="px-6 py-4">{course.assigned}</td>
                              <td className="px-6 py-4">{course.completed}</td>
                              <td className="px-6 py-4">{course.in_progress}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${rate}%` }} />
                                  </div>
                                  <span className="font-semibold">{rate}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PLACEMENT TAB */}
          {activeTab === 'placement' && (
            placementData ? (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    { icon: TrendingUp, color: 'text-green-500',  label: 'Placement Rate',    value: placementData.placementRate  != null ? `${placementData.placementRate}%`  : '—' },
                    { icon: Award,      color: 'text-blue-500',   label: 'Avg Package (LPA)', value: placementData.avgPackage     != null ? `₹${placementData.avgPackage}`     : '—' },
                    { icon: Building2,  color: 'text-purple-500', label: 'Companies',          value: placementData.companiesCount ?? '—' },
                    { icon: Users,      color: 'text-yellow-500', label: 'Total Placed',       value: placementData.totalPlaced    ?? '—' },
                  ].map(({ icon: Icon, color, label, value }) => (
                    <div key={label} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <Icon className={`${color} mb-2`} size={24} />
                      <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
                      <p className="text-3xl font-bold text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>

                {placementData.drivePerformance?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Drive-wise Performance</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-white border-b-2 border-gray-200">
                          <tr>{['Company', 'Applied', 'Shortlisted', 'Selected', 'Package', 'Conversion'].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                          ))}</tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {placementData.drivePerformance.map((drive, idx) => {
                            const conv = drive.applied > 0 ? Math.round((drive.selected / drive.applied) * 100) : 0;
                            return (
                              <tr key={idx} className="hover:bg-white">
                                <td className="px-6 py-4 font-semibold text-gray-800">{drive.company}</td>
                                <td className="px-6 py-4">{drive.applied}</td>
                                <td className="px-6 py-4">{drive.shortlisted}</td>
                                <td className="px-6 py-4">{drive.selected}</td>
                                <td className="px-6 py-4">₹{drive.package} LPA</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${conv}%` }} />
                                    </div>
                                    <span className="font-semibold">{conv}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {placementData.batchPlacement?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Batch-wise Placement Rate</h3>
                    <div className="space-y-4">
                      {placementData.batchPlacement.map((batch, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-sm text-gray-700 mb-1">
                            <span className="font-semibold">{batch.batch}</span>
                            <span className="font-bold">{batch.rate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${batch.rate}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No placement analytics available yet.</p>
                <p className="text-xs text-gray-400 mt-1">Create placement drives and track applicants to see analytics here.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN CORPORATE DASHBOARD SHELL
// ============================================================
export default function CorporateDashboard() {
  const location  = useLocation();
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [userMenuOpen,      setUserMenuOpen]       = useState(false);
  const [showMailbox,       setShowMailbox]        = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp,          setShowHelp]           = useState(false);
  const [messages,          setMessages]           = useState([]);
  const [notifications,     setNotifications]      = useState([]);

  useEffect(() => { fetchMessages(); fetchNotifications(); }, []);

  const fetchMessages = async () => {
    try {
      const r = await api.get('/corporate/messages').catch(() => ({ data: { success: false } }));
      if (r.data.success) setMessages(r.data.messages || []);
    } catch (e) { setMessages([]); }
  };

  const fetchNotifications = async () => {
    try {
      const r = await api.get('/notifications').catch(() => ({ data: { success: false } }));
      if (r.data.success) setNotifications(r.data.notifications || []);
    } catch (e) { setNotifications([]); }
  };

  const unreadMessages = messages.filter(m => !m.read).length;
  const unreadCount    = notifications.filter(n => !n.is_read).length;
  const handleLogout   = () => { logout(); navigate('/login'); };

  // ── ALL nav items: corporate + placement merged ──
  const navItems = [
    { path: '/corporate',            label: 'Overview',    icon: BarChart3,     section: null          },
    // ─ Training & L&D ─
    { path: '/corporate/employees',  label: 'Employees',   icon: Users,         section: 'Training'    },
    { path: '/corporate/training',   label: 'Training',    icon: BookOpen,      section: 'Training'    },
    { path: '/corporate/courses',    label: 'Courses',     icon: BookMarked,    section: 'Training'    },
    // ─ Placement ─
    { path: '/corporate/drives',     label: 'Drives',      icon: Briefcase,     section: 'Placement'   },
    { path: '/corporate/applicants', label: 'Applicants',  icon: UserCheck,     section: 'Placement'   },
    { path: '/corporate/hiring',     label: 'Hiring',      icon: Target,        section: 'Placement'   },
    { path: '/corporate/students',   label: 'Students',    icon: GraduationCap, section: 'Placement'   },
    { path: '/corporate/companies',  label: 'Companies',   icon: Building2,     section: 'Placement'   },
    // ─ Other ─
    { path: '/corporate/analytics',  label: 'Analytics',   icon: TrendingUp,    section: 'Other'       },
    { path: '/corporate/settings',   label: 'Settings',    icon: Settings,      section: 'Other'       },
  ];

  // Group nav by section
  const sections = [
    { label: null,         items: navItems.filter(n => n.section === null)        },
    { label: 'Training',   items: navItems.filter(n => n.section === 'Training')  },
    { label: 'Placement',  items: navItems.filter(n => n.section === 'Placement') },
    { label: 'Other',      items: navItems.filter(n => n.section === 'Other')     },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gradient-to-b from-[#1e5a8e] to-[#164266] text-white transition-all duration-300 overflow-hidden flex-shrink-0 shadow-2xl`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-blue-700/50">
            <div className="flex items-center justify-center">
              <img src="/project.png" alt="Logo" className="h-10 w-auto" onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <p className="text-center text-xs text-blue-300 mt-2 font-semibold tracking-widest uppercase">Corporate Portal</p>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {sections.map(({ label, items }) => (
              <div key={label || 'root'}>
                {label && (
                  <p className="px-6 pt-4 pb-1 text-xs font-bold text-blue-400 uppercase tracking-widest">{label}</p>
                )}
                {items.map(item => {
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
              </div>
            ))}
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
                <input type="text" placeholder="Search employees, drives, students..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition" />
              </div>
            </div>

            <div className="flex items-center gap-3">

              {/* Mail */}
              <div className="relative">
                <button onClick={() => { setShowMailbox(!showMailbox); setShowNotifications(false); setShowHelp(false); }}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition relative">
                  <Mail size={20} />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">{unreadMessages}</span>
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
                        {messages.length === 0
                          ? <p className="p-4 text-sm text-gray-500 text-center">No messages</p>
                          : messages.map(msg => (
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
                    </div>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMailbox(false)} />
                  </>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => { setShowNotifications(!showNotifications); setShowMailbox(false); setShowHelp(false); }}
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
                            <div key={n.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full mt-2 bg-blue-500 flex-shrink-0"></div>
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">{n.title}</p>
                                  <p className="text-xs text-gray-600">{n.message}</p>
                                  <span className="text-xs text-gray-500">{n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}</span>
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
                        {[
                          { icon: BookOpen,      label: 'Documentation',   color: 'text-blue-600'   },
                          { icon: Video,         label: 'Video Tutorials', color: 'text-green-600'  },
                          { icon: MessageSquare, label: 'Contact Support', color: 'text-purple-600' },
                          { icon: HelpCircle,    label: 'FAQs',            color: 'text-orange-600' },
                        ].map(({ icon: Icon, label, color }) => (
                          <a key={label} href="#" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
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

              {/* User Menu */}
              <div className="relative ml-2">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden shadow-lg">
                    {user?.profile_photo
                      ? <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                      : <AvatarSVG />
                    }
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">{user?.full_name || 'Corporate Admin'}</div>
                    <div className="text-xs text-gray-500">Corporate</div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <button onClick={() => { setUserMenuOpen(false); navigate('/corporate/profile'); }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                        <User size={16} /> Profile
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); navigate('/corporate/billing'); }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                        <CreditCard size={16} /> Billing
                      </button>
                      <button onClick={() => { setUserMenuOpen(false); navigate('/corporate/settings'); }}
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
              <Route path="/"            element={<Overview />}            />
              <Route path="/employees"   element={<EmployeeManagement />}  />
              <Route path="/training"    element={<TrainingManagement />}  />
              <Route path="/courses"     element={<CoursesManagement />}   />
              {/* Placement routes now under /corporate */}
              <Route path="/drives"      element={<PlacementDrives />}     />
              <Route path="/applicants"  element={<ApplicantManagement />} />
              <Route path="/hiring"      element={<HiringManagement />}    />
              <Route path="/students"    element={<StudentProfiles />}     />
              <Route path="/companies"   element={<CompanyManagement />}   />
              <Route path="/analytics"   element={<CorporateAnalytics />}  />
            </Routes>
          </div>
        </main>

      </div>
    </div>
  );
}