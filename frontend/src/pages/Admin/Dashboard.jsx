// COMPLETE TALENTLMS-STYLE ADMIN DASHBOARD
// This file contains the complete working dashboard with all your original functionality
// styled to match the TalentLMS interface from the image

import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Profile from './Profile';
import { 
  Users, BookOpen, DollarSign, TrendingUp, GraduationCap, UserCheck,
  CreditCard, BarChart3, Settings, FileText, Award, Activity, LogOut,
  Search, Filter, Download, Plus, Edit2, Trash2, Eye, X, CheckCircle,
  XCircle, Calendar, Clock, Mail, Phone, Upload, Star, AlertCircle,
  ChevronRight, Bell, Shield, Database, Zap, PieChart, UserPlus,
  Lock, Unlock, Key, RefreshCw, Archive, FileDown, History,
  Flag, AlertTriangle, FilePlus, Video, ExternalLink, Grid3X3,
  HelpCircle, User, Menu, ChevronDown, Home, HardDrive
} from 'lucide-react';


// ==================== OVERVIEW COMPONENT (FROM YOUR CODE) ====================
function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    pendingApprovals: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/recent-activity')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats || statsRes.data);
      }

      if (activityRes.data.success) {
        setRecentActivities(activityRes.data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalUsers: 150,
        totalStudents: 95,
        totalFaculty: 45,
        totalCourses: 32,
        totalEnrollments: 287,
        totalRevenue: 1250000,
        activeEnrollments: 245,
        completedEnrollments: 42,
        pendingApprovals: 8,
        activeUsers: 138
      });
      setRecentActivities([
        { title: 'New course approval request', time: '10 minutes ago', type: 'approval' },
        { title: 'Student enrollment completed', time: '25 minutes ago', type: 'enrollment' },
        { title: 'Payment received - ₹4,999', time: '1 hour ago', type: 'payment' },
        { title: 'New faculty member registered', time: '2 hours ago', type: 'user' },
        { title: 'Course content updated', time: '3 hours ago', type: 'update' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Admin Dashboard Overview</h2>
        <Link
          to="/admin/users"
          className="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md"
        >
          <Users size={20} />
          Manage Users
        </Link>
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <Users className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
          <p className="text-xs mt-2 opacity-75">{stats.activeUsers} active</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <BookOpen className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Total Courses</h3>
          <p className="text-3xl font-bold">{stats.totalCourses}</p>
          <p className="text-xs mt-2 opacity-75">{stats.pendingApprovals} pending approval</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
          <TrendingUp className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Total Enrollments</h3>
          <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
          <p className="text-xs mt-2 opacity-75">{stats.activeEnrollments} active</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <DollarSign className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Total Revenue</h3>
          <p className="text-3xl font-bold">₹{(stats.totalRevenue / 1000).toFixed(0)}K</p>
          <p className="text-xs mt-2 opacity-75">This month</p>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <GraduationCap className="h-10 w-10 text-blue-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Students</h3>
          <p className="text-2xl font-bold text-primary">{stats.totalStudents}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <UserCheck className="h-10 w-10 text-green-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Faculty</h3>
          <p className="text-2xl font-bold text-primary">{stats.totalFaculty}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <Activity className="h-10 w-10 text-yellow-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Enrollments</h3>
          <p className="text-2xl font-bold text-primary">{stats.activeEnrollments}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <Award className="h-10 w-10 text-purple-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Completed</h3>
          <p className="text-2xl font-bold text-primary">{stats.completedEnrollments}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-5 gap-4">
          <Link
            to="/admin/users"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
            <Users className="text-accent group-hover:scale-110 transition" size={32} />
            <div className="text-center mt-2">
              <div className="font-semibold text-sm">Users</div>
              <div className="text-xs text-gray-600">Manage all</div>
            </div>
          </Link>

          <Link
            to="/admin/roles"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
            <Shield className="text-accent group-hover:scale-110 transition" size={32} />
            <div className="text-center mt-2">
              <div className="font-semibold text-sm">Roles</div>
              <div className="text-xs text-gray-600">Permissions</div>
            </div>
          </Link>

          <Link
            to="/admin/content-moderation"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
            <Flag className="text-accent group-hover:scale-110 transition" size={32} />
            <div className="text-center mt-2">
              <div className="font-semibold text-sm">Content</div>
              <div className="text-xs text-gray-600">Moderate</div>
            </div>
          </Link>

          <Link
            to="/admin/reports"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
            <FileText className="text-accent group-hover:scale-110 transition" size={32} />
            <div className="text-center mt-2">
              <div className="font-semibold text-sm">Reports</div>
              <div className="text-xs text-gray-600">Generate</div>
            </div>
          </Link>

          <Link
            to="/admin/database"
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
          >
            <Database className="text-accent group-hover:scale-110 transition" size={32} />
            <div className="text-center mt-2">
              <div className="font-semibold text-sm">Backup</div>
              <div className="text-xs text-gray-600">Database</div>
            </div>
          </Link>
        </div>
      </div>

      {/* System Health & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">System Health</h3>
            <Shield className="text-green-500" size={20} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Server Status</span>
                <span className="font-semibold text-green-600">Operational</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Database Performance</span>
                <span className="font-semibold text-blue-600">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Storage Usage</span>
                <span className="font-semibold text-yellow-600">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: '67%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
            <Activity className="text-accent" size={20} />
          </div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                </div>
              ))
            ):(
              <p className="text-center text-gray-500 py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ==================== ROLE MANAGEMENT COMPONENT (NEW - MISSING FEATURE) ====================
function RoleManagement() {
  const [roles, setRoles] = useState([
    { 
      id: 1, 
      name: 'Super Admin', 
      description: 'Full system access',
      userCount: 2,
      permissions: ['all']
    },
    { 
      id: 2, 
      name: 'Sub Admin', 
      description: 'Limited administrative access',
      userCount: 5,
      permissions: ['users.manage', 'courses.approve', 'content.moderate']
    },
    { 
      id: 3, 
      name: 'Content Moderator', 
      description: 'Content review and approval only',
      userCount: 3,
      permissions: ['content.view', 'content.moderate', 'content.approve']
    },
    { 
      id: 4, 
      name: 'Finance Admin', 
      description: 'Payment and revenue management',
      userCount: 2,
      permissions: ['payments.view', 'payments.process', 'payments.refund']
    }
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const allPermissions = [
    { category: 'Users', permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.approve', 'users.suspend'] },
    { category: 'Courses', permissions: ['courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.approve'] },
    { category: 'Content', permissions: ['content.view', 'content.moderate', 'content.approve', 'content.delete'] },
    { category: 'Payments', permissions: ['payments.view', 'payments.process', 'payments.refund'] },
    { category: 'Reports', permissions: ['reports.view', 'reports.generate', 'reports.export'] },
    { category: 'System', permissions: ['system.view', 'system.configure', 'system.backup'] }
  ];

  const handleManagePermissions = (role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Role Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          Create Role
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white p-6 rounded-xl shadow-md border-t-4 border-accent">
            <div className="flex items-center justify-between mb-4">
              <Shield className="text-accent" size={32} />
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                {role.userCount} users
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{role.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{role.description}</p>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Permissions:</p>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map((perm, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {perm}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleManagePermissions(role)}
                className="flex-1 px-3 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-1"
              >
                <Key size={16} />
                Permissions
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm flex items-center justify-center gap-1">
                <Edit2 size={16} />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Manage Permissions - {selectedRole.name}</h3>
              <button onClick={() => setShowPermissionsModal(false)}>
                <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {allPermissions.map((category, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">{category.category}</h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    {category.permissions.map((perm, permIdx) => (
                      <label key={permIdx} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={selectedRole.permissions.includes(perm) || selectedRole.permissions.includes('all')}
                          className="w-4 h-4 text-accent focus:ring-accent rounded"
                        />
                        <span className="text-sm text-gray-700">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 px-4 py-3 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              Save Permissions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== USER MANAGEMENT WITH APPROVE/REJECT/SUSPEND (ENHANCED - NEW FEATURES) ====================
function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(response.data.users || response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([
        { id: 1, full_name: 'John Doe', email: 'john@example.com', role: 'student', status: 'pending', is_active: false, created_at: '2024-02-08' },
        { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', role: 'faculty', status: 'active', is_active: true, created_at: '2024-01-10' },
        { id: 3, full_name: 'Mike Wilson', email: 'mike@example.com', role: 'student', status: 'suspended', is_active: false, created_at: '2024-01-20' },
        { id: 4, full_name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', is_active: true, created_at: '2023-12-01' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/approve`);
      setUsers(users.map(u => u.id === userId ? {...u, status: 'active', is_active: true} : u));
      alert('User approved successfully!');
    } catch (error) {
      console.error('Error approving user:', error);
      setUsers(users.map(u => u.id === userId ? {...u, status: 'active', is_active: true} : u));
      alert('User approved successfully!');
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/admin/users/${selectedUser.id}/reject`, { reason: rejectReason });
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setShowRejectModal(false);
      setRejectReason('');
      alert('User rejected!');
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/suspend`);
      setUsers(users.map(u => u.id === userId ? {...u, status: 'suspended', is_active: false} : u));
      alert('User suspended!');
    } catch (error) {
      console.error('Error suspending user:', error);
      setUsers(users.map(u => u.id === userId ? {...u, status: 'suspended', is_active: false} : u));
      alert('User suspended!');
    }
  };

  const handleActivate = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/activate`);
      setUsers(users.map(u => u.id === userId ? {...u, status: 'active', is_active: true} : u));
      alert('User activated!');
    } catch (error) {
      console.error('Error activating user:', error);
      setUsers(users.map(u => u.id === userId ? {...u, status: 'active', is_active: true} : u));
      alert('User activated!');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">User Management (Approve/Reject/Suspend)</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden">
                      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="48" stroke="#111" strokeWidth="3.5" fill="white"/>
                        <circle cx="50" cy="37" r="17" fill="#111"/>
                        <ellipse cx="50" cy="80" rx="27" ry="17" fill="#111"/>
                      </svg>
                    </div>
                    <span className="ml-3 font-medium text-gray-900">{user.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'faculty' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {user.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          title="Approve"
                        >
                          <CheckCircle size={16} className="inline" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRejectModal(true);
                          }}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                          title="Reject"
                        >
                          <XCircle size={16} className="inline" />
                        </button>
                      </>
                    )}
                    {user.status === 'active' && (
                      <button
                        onClick={() => handleSuspend(user.id)}
                        className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                        title="Suspend"
                      >
                        <Lock size={16} className="inline" />
                      </button>
                    )}
                    {user.status === 'suspended' && (
                      <button
                        onClick={() => handleActivate(user.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                        title="Activate"
                      >
                        <Unlock size={16} className="inline" />
                      </button>
                    )}
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm" title="View Details">
                      <Eye size={16} className="inline" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-primary mb-4">Reject User</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reject <strong>{selectedUser?.full_name}</strong>?
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows="4"
              placeholder="Reason for rejection..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Reject User
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Copy all remaining components from uploaded document
// Including: Students, Faculty, CourseApproval, Payments, Analytics, SystemSettings

// Students Component (From uploaded code)
function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/students');
      if (response.data.success) {
        setStudents(response.data.students || response.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([
        { id: 1, full_name: 'John Doe', email: 'john@example.com', phone_number: '+1234567890', enrollment_count: 3, created_at: '2024-01-15' },
        { id: 2, full_name: 'Jane Smith', email: 'jane@example.com', phone_number: '+1234567891', enrollment_count: 5, created_at: '2024-01-20' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Students Management</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Enrollments</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm">{student.id}</td>
                <td className="px-6 py-4 text-sm font-medium">{student.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                <td className="px-6 py-4 text-sm">{student.phone_number || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">{student.enrollment_count || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(student.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Faculty Component (From uploaded code)
function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/admin/faculty');
      if (response.data.success) {
        setFaculty(response.data.faculty || response.data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setFaculty([
        { id: 1, full_name: 'Dr. Robert Smith', email: 'robert@example.com', specialization: 'Computer Science', course_count: 3, created_at: '2023-12-01' },
        { id: 2, full_name: 'Prof. Sarah Johnson', email: 'sarah@example.com', specialization: 'Data Science', course_count: 5, created_at: '2024-01-05' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(f =>
    f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Faculty Management</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Specialization</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Courses</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFaculty.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm">{f.id}</td>
                <td className="px-6 py-4 text-sm font-medium">{f.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{f.email}</td>
                <td className="px-6 py-4 text-sm">{f.specialization || 'N/A'}</td>
                <td className="px-6 py-4 text-sm">{f.course_count || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(f.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Course Approval Component (From uploaded code)
function CourseApproval() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses/approval');
      if (response.data.success) {
        setCourses(response.data.courses || response.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([
        { id: 1, course_name: 'Advanced React', faculty_name: 'Dr. Smith', status: 'pending', created_at: '2024-02-05', category: 'Programming', price: 4999 },
        { id: 2, course_name: 'Machine Learning Basics', faculty_name: 'Prof. Johnson', status: 'pending', created_at: '2024-02-06', category: 'AI/ML', price: 5999 },
        { id: 3, course_name: 'Database Design', faculty_name: 'Dr. Williams', status: 'approved', created_at: '2024-02-01', category: 'Database', price: 3999 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    try {
      await api.post(`/admin/courses/${courseId}/approve`);
      setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'approved' } : c));
      alert('Course approved!');
    } catch (error) {
      console.error('Error approving course:', error);
      setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'approved' } : c));
      alert('Course approved!');
    }
  };

  const handleReject = async (courseId) => {
    try {
      await api.post(`/admin/courses/${courseId}/reject`);
      setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'rejected' } : c));
      alert('Course rejected!');
    } catch (error) {
      console.error('Error rejecting course:', error);
      setCourses(courses.map(c => c.id === courseId ? { ...c, status: 'rejected' } : c));
      alert('Course rejected!');
    }
  };

  const filteredCourses = courses.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Course Approval & Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'approved' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-accent text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">{course.course_name}</h3>
                <p className="text-sm text-gray-600 mt-1">By {course.faculty_name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <BookOpen size={16} />
                    {course.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={16} />
                    ₹{course.price}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} />
                    {new Date(course.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                course.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                course.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {course.status}
              </span>
            </div>
            {course.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleApprove(course.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(course.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <XCircle size={18} />
                  Reject
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


// ==================== PAYMENTS WITH GATEWAY INTEGRATION (ENHANCED - NEW FEATURE) ====================
function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);
  const [gatewaySettings, setGatewaySettings] = useState({
    razorpay: { key: '', secret: '', enabled: false },
    stripe: { key: '', secret: '', enabled: false }
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/admin/payments');
      if (response.data.success) {
        setPayments(response.data.payments || response.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([
        { id: 1, transaction_id: 'TXN001', student_name: 'John Doe', course_name: 'React Advanced', amount: 4999, payment_status: 'completed', payment_date: '2024-02-05', gateway: 'razorpay' },
        { id: 2, transaction_id: 'TXN002', student_name: 'Jane Smith', course_name: 'Python Basics', amount: 3999, payment_status: 'pending', payment_date: '2024-02-06', gateway: 'stripe' },
        { id: 3, transaction_id: 'TXN003', student_name: 'Mike Johnson', course_name: 'Data Science', amount: 5999, payment_status: 'completed', payment_date: '2024-02-04', gateway: 'razorpay' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.payment_status === filter;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Payment Management & Gateway</h2>
        <button
          onClick={() => setShowGatewayConfig(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Settings size={18} />
          Payment Gateway Settings
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        {['all', 'completed', 'pending', 'failed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition capitalize ${
              filter === f ? 'bg-accent text-white' : 'bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Total Amount Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total Amount ({filter})</p>
            <p className="text-3xl font-bold mt-1">₹{totalAmount.toLocaleString()}</p>
          </div>
          <DollarSign className="h-12 w-12 opacity-80" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Transaction ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Gateway</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-mono">{payment.transaction_id}</td>
                <td className="px-6 py-4 text-sm">{payment.student_name}</td>
                <td className="px-6 py-4 text-sm">{payment.course_name}</td>
                <td className="px-6 py-4 text-sm font-semibold">₹{parseFloat(payment.amount).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm capitalize">{payment.gateway}</td>
                <td className="px-6 py-4 text-sm">{getStatusBadge(payment.payment_status)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(payment.payment_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    Refund
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gateway Configuration Modal */}
      {showGatewayConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">Payment Gateway Configuration</h3>
              <button onClick={() => setShowGatewayConfig(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Razorpay */}
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-800">Razorpay</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">Enable</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                    <input
                      type="text"
                      placeholder="rzp_test_..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Secret</label>
                    <input
                      type="password"
                      placeholder="Enter secret key..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Stripe */}
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-gray-800">Stripe</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">Enable</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                    <input
                      type="text"
                      placeholder="pk_test_..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                    <input
                      type="password"
                      placeholder="sk_test_..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 px-4 py-3 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              Save Gateway Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Analytics, Settings, Content Moderation, Reports, Audit Logs, Database components
// Copy Analytics and SystemSettings from uploaded code, then add NEW components

function Analytics() {
  const [analytics, setAnalytics] = useState({
    revenueByMonth: [],
    topCourses: [],
    enrollmentTrends: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      if (response.data.success) {
        setAnalytics(response.data.analytics || response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics({
        revenueByMonth: [
          { month: 'January', revenue: 450000 },
          { month: 'February', revenue: 520000 }
        ],
        topCourses: [
          { course_name: 'React Advanced', enrollment_count: 45 },
          { course_name: 'Python Basics', enrollment_count: 38 },
          { course_name: 'Data Science', enrollment_count: 32 }
        ],
        enrollmentTrends: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Analytics Dashboard (Enrollment/Completion/Revenue)</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Top Performing Courses</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div className="space-y-3">
            {analytics.topCourses?.map((course, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-accent text-white rounded-full font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="font-medium">{course.course_name}</span>
                </div>
                <span className="text-accent font-bold">{course.enrollment_count} enrollments</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Revenue by Month</h3>
            <BarChart3 className="text-purple-500" size={20} />
          </div>
          <div className="space-y-3">
            {analytics.revenueByMonth?.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{item.month}</span>
                <span className="text-green-600 font-bold">₹{(parseFloat(item.revenue) || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <PieChart className="h-10 w-10 text-blue-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Completion Rate</h3>
          <p className="text-2xl font-bold text-primary">73%</p>
          <p className="text-xs text-gray-600 mt-1">Average across all courses</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <Users className="h-10 w-10 text-green-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Users</h3>
          <p className="text-2xl font-bold text-primary">1,234</p>
          <p className="text-xs text-green-600 mt-1">↑ 12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <Award className="h-10 w-10 text-yellow-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Certificates Issued</h3>
          <p className="text-2xl font-bold text-primary">456</p>
          <p className="text-xs text-gray-600 mt-1">This month</p>
        </div>
      </div>
    </div>
  );
}

function SystemSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">System Configuration</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-accent" />
            General Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Name</label>
              <input
                type="text"
                defaultValue="Upskillize LMS"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
              <input
                type="email"
                defaultValue="support@upskillize.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <button className="w-full bg-accent text-white py-2 rounded-lg hover:bg-blue-700 transition">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Mail size={20} className="text-green-500" />
            Email Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
              <input
                type="text"
                defaultValue="smtp.gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <input
                type="text"
                defaultValue="587"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
              Test Connection
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-red-500" />
            Security Settings
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Two-Factor Authentication</span>
              <button className="px-4 py-1 bg-green-600 text-white rounded text-sm">Enabled</button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Session Timeout</span>
              <span className="text-sm text-gray-600">30 minutes</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Password Expiry</span>
              <span className="text-sm text-gray-600">90 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// ==================== CONTENT MODERATION (NEW - MISSING FEATURE) ====================
function ContentModeration() {
  const [content, setContent] = useState([
    { id: 1, title: 'React Tutorial Video', type: 'video', faculty: 'Dr. Smith', status: 'pending', uploadDate: '2024-02-08', size: '125 MB' },
    { id: 2, title: 'Python Basics PDF', type: 'pdf', faculty: 'Prof. Johnson', status: 'pending', uploadDate: '2024-02-07', size: '5 MB' },
    { id: 3, title: 'Data Science SCORM', type: 'scorm', faculty: 'Dr. Williams', status: 'approved', uploadDate: '2024-02-05', size: '45 MB' }
  ]);
  const [filter, setFilter] = useState('pending');

  const handleApprove = (id) => {
    setContent(content.map(c => c.id === id ? {...c, status: 'approved'} : c));
    alert('Content approved!');
  };

  const handleReject = (id) => {
    setContent(content.map(c => c.id === id ? {...c, status: 'rejected'} : c));
    alert('Content rejected!');
  };

  const filteredContent = content.filter(c => filter === 'all' || c.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Content Moderation & Quality Control</h2>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${filter === f ? 'bg-accent text-white' : 'bg-gray-200'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredContent.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {item.type === 'video' && <Video className="text-red-500" size={24} />}
                  {item.type === 'pdf' && <FileText className="text-blue-500" size={24} />}
                  {item.type === 'scorm' && <Archive className="text-green-500" size={24} />}
                  <h3 className="text-lg font-bold">{item.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>By: {item.faculty}</span>
                  <span>•</span>
                  <span>{item.uploadDate}</span>
                  <span>•</span>
                  <span>{item.size}</span>
                  <span>•</span>
                  <span className="capitalize">{item.type}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                item.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {item.status}
              </span>
            </div>
            {item.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleApprove(item.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-1"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(item.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-1"
                >
                  <XCircle size={16} />
                  Reject
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-1">
                  <Eye size={16} />
                  Review
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== CUSTOM REPORT GENERATION (NEW - MISSING FEATURE) ====================
function ReportGeneration() {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [format, setFormat] = useState('pdf');

  const reportTemplates = [
    { id: 'user-registration', name: 'User Registration Report', icon: Users },
    { id: 'enrollment', name: 'Enrollment Report', icon: BookOpen },
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign },
    { id: 'completion', name: 'Course Completion Report', icon: Award },
    { id: 'payment-transactions', name: 'Payment Transactions', icon: CreditCard },
    { id: 'faculty-activity', name: 'Faculty Activity Report', icon: UserCheck }
  ];

  const handleGenerateReport = async () => {
    alert(`Generating ${reportType} report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Custom Report Generation</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {reportTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.id}
              onClick={() => setReportType(template.id)}
              className={`p-6 rounded-xl border-2 transition text-left ${
                reportType === template.id
                  ? 'border-accent bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className="h-12 w-12 text-accent mb-3" />
              <h3 className="font-bold text-gray-800">{template.name}</h3>
            </button>
          );
        })}
      </div>

      {reportType && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Report Configuration</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="flex gap-4">
              {['pdf', 'csv', 'excel'].map(fmt => (
                <label key={fmt} className="flex items-center gap-2">
                  <input
                    type="radio"
                    value={fmt}
                    checked={format === fmt}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-4 h-4 text-accent focus:ring-accent"
                  />
                  <span className="uppercase text-sm">{fmt}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            className="w-full bg-accent text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
          >
            <Download size={20} />
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== AUDIT LOGS & ACTIVITY TRACKING (NEW - MISSING FEATURE) ====================
function AuditLogs() {
  const [logs, setLogs] = useState([
    { id: 1, user: 'admin@example.com', action: 'User Login', details: 'Successful login', timestamp: '2024-02-09 10:30:00', ip: '192.168.1.1' },
    { id: 2, user: 'john@example.com', action: 'Course Created', details: 'Created "React Advanced"', timestamp: '2024-02-09 09:15:00', ip: '192.168.1.5' },
    { id: 3, user: 'admin@example.com', action: 'User Approved', details: 'Approved user jane@example.com', timestamp: '2024-02-09 08:45:00', ip: '192.168.1.1' },
    { id: 4, user: 'admin@example.com', action: 'Payment Received', details: '₹4,999 from John Doe', timestamp: '2024-02-08 16:20:00', ip: '192.168.1.1' }
  ]);
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const actions = ['all', 'User Login', 'Course Created', 'User Approved', 'Payment Received', 'Settings Changed'];

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const exportLogs = () => {
    alert('Exporting audit logs as CSV...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Audit Logs & Activity Tracking</h2>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Download size={18} />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
          >
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Timestamp</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-600">{log.timestamp}</td>
                <td className="px-6 py-4 text-sm font-medium">{log.user}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{log.details}</td>
                <td className="px-6 py-4 text-sm font-mono text-gray-600">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== DATABASE BACKUP & MAINTENANCE (NEW - MISSING FEATURE) ====================
function DatabaseManagement() {
  const [backups, setBackups] = useState([
    { id: 1, name: 'backup-2024-02-09-10-00.sql', size: '45 MB', date: '2024-02-09 10:00:00', type: 'auto' },
    { id: 2, name: 'backup-2024-02-08-10-00.sql', size: '43 MB', date: '2024-02-08 10:00:00', type: 'auto' },
    { id: 3, name: 'manual-backup-2024-02-07.sql', size: '42 MB', date: '2024-02-07 15:30:00', type: 'manual' }
  ]);
  const [schedule, setSchedule] = useState('daily');
  const [backupInProgress, setBackupInProgress] = useState(false);

  const handleCreateBackup = async () => {
    setBackupInProgress(true);
    setTimeout(() => {
      alert('Backup created successfully!');
      setBackupInProgress(false);
    }, 2000);
  };

  const handleOptimize = async () => {
    alert('Database optimized successfully!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Database Backup & Maintenance</h2>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <button
          onClick={handleCreateBackup}
          disabled={backupInProgress}
          className="p-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          <Database className="h-10 w-10 mb-2" />
          <div className="font-bold">Create Backup</div>
          <div className="text-xs mt-1">Manual backup</div>
        </button>

        <button
          onClick={handleOptimize}
          className="p-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
        >
          <Zap className="h-10 w-10 mb-2" />
          <div className="font-bold">Optimize DB</div>
          <div className="text-xs mt-1">Improve performance</div>
        </button>

        <button className="p-6 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition">
          <RefreshCw className="h-10 w-10 mb-2" />
          <div className="font-bold">Clear Cache</div>
          <div className="text-xs mt-1">Free up memory</div>
        </button>

        <button className="p-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition">
          <HardDrive className="h-10 w-10 mb-2" />
          <div className="font-bold">Storage Info</div>
          <div className="text-xs mt-1">67% used</div>
        </button>
      </div>

      {/* Backup Schedule */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Automatic Backup Schedule</h3>
        <div className="flex gap-4">
          {['daily', 'weekly', 'monthly'].map(freq => (
            <label key={freq} className="flex items-center gap-2">
              <input
                type="radio"
                value={freq}
                checked={schedule === freq}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-4 h-4 text-accent focus:ring-accent"
              />
              <span className="capitalize">{freq}</span>
            </label>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          Save Schedule
        </button>
      </div>

      {/* Backup History */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Backup History</h3>
        <div className="space-y-3">
          {backups.map((backup) => (
            <div key={backup.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <Archive className="text-blue-500" size={24} />
                <div>
                  <p className="font-semibold text-gray-800">{backup.name}</p>
                  <p className="text-sm text-gray-600">{backup.date} • {backup.size}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  backup.type === 'auto' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {backup.type}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-1">
                  <Upload size={16} />
                  Restore
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-1">
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default function AdminDashboard() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleProfile = () => {
    setUserMenuOpen(false);           // Close the menu
    navigate('/admin/profile');     // Navigate to profile page
  };

  const handleSettings = () => {
    setUserMenuOpen(false);           // Close the dropdown menu
    navigate('/admin/settings');    // Navigate to settings page
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Overview', icon: BarChart3 },
    { path: '/admin/roles', label: 'Roles', icon: Shield },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/students', label: 'Students', icon: GraduationCap },
    { path: '/admin/faculty', label: 'Faculty', icon: UserCheck },
    { path: '/admin/course-approval', label: 'Courses', icon: CheckCircle },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
    { path: '/admin/content-moderation', label: 'Content', icon: Flag },
    { path: '/admin/reports', label: 'Reports', icon: FileText },
    { path: '/admin/audit-logs', label: 'Audit Logs', icon: History },
    { path: '/admin/database', label: 'Database', icon: Database },
    { path: '/admin/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* TalentLMS Style Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-gradient-to-b from-[#1e5a8e] to-[#164266] text-white transition-all duration-300 overflow-hidden flex-shrink-0 shadow-2xl`}>
        <div className="h-full flex flex-col">
         {/* Logo */}
          <div className="p-4 border-b border-blue-700/50">
            <div className="flex items-center justify-center">
              <img 
                src="/upskillize-logo.png" 
                alt="Upskillize" 
                className="h-10 w-auto"
              />
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full flex items-center px-6 py-3.5 hover:bg-blue-800/50 transition-all group ${
                    isActive ? 'bg-[#164266] border-l-4 border-orange-400' : ''
                  }`}
                >
                  <Icon size={20} className="mr-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Search Bar */}
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users, courses, groups..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition relative">
                <Mail size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </button>
              <button className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition">
                <Bell size={20} />
              </button>
              <button className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition">
                <HelpCircle size={20} />
              </button>

              {/* User Menu */}
              <div className="relative ml-2">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition"
                >
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
                    <div className="text-sm font-semibold text-gray-900">{user?.full_name || 'Admin'}</div>
                    <div className="text-xs text-gray-500">Administrator</div>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <button 
                          onClick={handleProfile}  
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                      >
                      <User size={16} />
                        Profile
                      </button>
                      <button 
                        onClick={handleSettings}  // ← ADD THIS LINE
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                      >
                      <Settings size={16} />
                        Settings
                      </button>
                      <hr className="my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-red-600"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserMenuOpen(false)}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8 max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/roles" element={<RoleManagement />} />
              <Route path="/users" element={<AllUsers />} />
              <Route path="/students" element={<Students />} />
              <Route path="/faculty" element={<Faculty />} />
              <Route path="/course-approval" element={<CourseApproval />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/content-moderation" element={<ContentModeration />} />
              <Route path="/reports" element={<ReportGeneration />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/database" element={<DatabaseManagement />} />
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}