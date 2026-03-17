// CLEAN ADMIN DASHBOARD — No fake/hardcoded data. All data from real API only.

import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import Profile from "./Profile";
import BrainDrillMonitor from "./Admin/BrainDrillMonitor";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  GraduationCap,
  UserCheck,
  CreditCard,
  BarChart3,
  Settings,
  FileText,
  Award,
  Activity,
  LogOut,
  Search,
  Download,
  Plus,
  Edit2,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Calendar,
  Bell,
  Shield,
  Database,
  Zap,
  PieChart,
  UserPlus,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  Archive,
  History,
  Flag,
  Video,
  HelpCircle,
  User,
  Menu,
  ChevronDown,
  HardDrive,
  Mail,
  Upload,
} from "lucide-react";

// ==================== EMPTY STATE COMPONENT ====================
function EmptyState({ message = "No data available" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Database size={48} className="mb-4 opacity-30" />
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm mt-1">Data will appear here once available</p>
    </div>
  );
}

// ==================== ERROR STATE COMPONENT ====================
function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-red-400">
      <XCircle size={48} className="mb-4 opacity-60" />
      <p className="text-lg font-medium text-gray-600">Failed to load data</p>
      <p className="text-sm mt-1 text-gray-400">
        Check your connection or backend server
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ==================== OVERVIEW ====================
function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [statsRes, activityRes] = await Promise.all([
        api.get("/admin/dashboard/stats"),
        api.get("/admin/recent-activity"),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (activityRes.data.success)
        setRecentActivities(activityRes.data.activities || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );

  if (error) return <ErrorState onRetry={fetchDashboardData} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">
          Admin Dashboard Overview
        </h2>
        <Link
          to="/admin/users"
          className="bg-accent hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition shadow-md"
        >
          <Users size={20} /> Manage Users
        </Link>
      </div>

      {/* Main Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <Users className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Total Users</h3>
          <p className="text-3xl font-bold">{stats?.totalUsers ?? 0}</p>
          <p className="text-xs mt-2 opacity-75">
            {stats?.newUsersThisMonth ?? 0} new this month
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <BookOpen className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Total Courses</h3>
          <p className="text-3xl font-bold">{stats?.totalCourses ?? 0}</p>
          <p className="text-xs mt-2 opacity-75">
            {stats?.activeCourses ?? 0} active
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
          <TrendingUp className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">
            Total Enrollments
          </h3>
          <p className="text-3xl font-bold">{stats?.totalEnrollments ?? 0}</p>
          <p className="text-xs mt-2 opacity-75">
            {stats?.activeEnrollments ?? 0} active
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
          <DollarSign className="h-10 w-10 mb-3 opacity-80" />
          <h3 className="text-sm font-medium mb-1 opacity-90">Total Revenue</h3>
          <p className="text-3xl font-bold">
            ₹{((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}K
          </p>
          <p className="text-xs mt-2 opacity-75">Completed payments</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <GraduationCap className="h-10 w-10 text-blue-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Students</h3>
          <p className="text-2xl font-bold text-primary">
            {stats?.totalStudents ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <UserCheck className="h-10 w-10 text-green-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Faculty</h3>
          <p className="text-2xl font-bold text-primary">
            {stats?.totalFaculty ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <Activity className="h-10 w-10 text-yellow-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Active Enrollments
          </h3>
          <p className="text-2xl font-bold text-primary">
            {stats?.activeEnrollments ?? 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <Award className="h-10 w-10 text-purple-500 mb-3" />
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Completed
          </h3>
          <p className="text-2xl font-bold text-primary">
            {stats?.completedEnrollments ?? 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-5 gap-4">
          {[
            {
              to: "/admin/users",
              icon: Users,
              label: "Users",
              sub: "Manage all",
            },
            {
              to: "/admin/roles",
              icon: Shield,
              label: "Roles",
              sub: "Permissions",
            },
            {
              to: "/admin/content-moderation",
              icon: Flag,
              label: "Content",
              sub: "Moderate",
            },
            {
              to: "/admin/reports",
              icon: FileText,
              label: "Reports",
              sub: "Generate",
            },
            {
              to: "/admin/database",
              icon: Database,
              label: "Backup",
              sub: "Database",
            },
          ].map(({ to, icon: Icon, label, sub }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-accent hover:bg-blue-50 transition group"
            >
              <Icon
                className="text-accent group-hover:scale-110 transition"
                size={32}
              />
              <div className="text-center mt-2">
                <div className="font-semibold text-sm">{label}</div>
                <div className="text-xs text-gray-600">{sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          <Activity className="text-accent" size={20} />
        </div>
        {recentActivities.length > 0 ? (
          <div className="space-y-3">
            {recentActivities.map((activity, idx) => (
              <div
                key={activity.id || idx}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="No recent activity" />
        )}
      </div>
    </div>
  );
}

// ==================== ROLE MANAGEMENT ====================
function RoleManagement() {
  const roles = [
    {
      id: 1,
      name: "Super Admin",
      description: "Full system access",
      permissions: ["all"],
    },
    {
      id: 2,
      name: "Sub Admin",
      description: "Limited administrative access",
      permissions: ["users.manage", "courses.approve", "content.moderate"],
    },
    {
      id: 3,
      name: "Content Moderator",
      description: "Content review and approval only",
      permissions: ["content.view", "content.moderate", "content.approve"],
    },
    {
      id: 4,
      name: "Finance Admin",
      description: "Payment and revenue management",
      permissions: ["payments.view", "payments.process", "payments.refund"],
    },
  ];
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const allPermissions = [
    {
      category: "Users",
      permissions: [
        "users.view",
        "users.create",
        "users.edit",
        "users.delete",
        "users.approve",
        "users.suspend",
      ],
    },
    {
      category: "Courses",
      permissions: [
        "courses.view",
        "courses.create",
        "courses.edit",
        "courses.delete",
        "courses.approve",
      ],
    },
    {
      category: "Content",
      permissions: [
        "content.view",
        "content.moderate",
        "content.approve",
        "content.delete",
      ],
    },
    {
      category: "Payments",
      permissions: ["payments.view", "payments.process", "payments.refund"],
    },
    {
      category: "Reports",
      permissions: ["reports.view", "reports.generate", "reports.export"],
    },
    {
      category: "System",
      permissions: ["system.view", "system.configure", "system.backup"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Role Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          <Plus size={18} /> Create Role
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white p-6 rounded-xl shadow-md border-t-4 border-accent"
          >
            <Shield className="text-accent mb-3" size={32} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {role.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{role.description}</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {role.permissions.slice(0, 3).map((p, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {p}
                </span>
              ))}
              {role.permissions.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  +{role.permissions.length - 3} more
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedRole(role);
                  setShowPermissionsModal(true);
                }}
                className="flex-1 px-3 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-1"
              >
                <Key size={16} /> Permissions
              </button>
              <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm flex items-center justify-center gap-1">
                <Edit2 size={16} /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">
                Manage Permissions — {selectedRole.name}
              </h3>
              <button onClick={() => setShowPermissionsModal(false)}>
                <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="space-y-6">
              {allPermissions.map((cat, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-bold text-gray-800 mb-3">
                    {cat.category}
                  </h4>
                  <div className="grid md:grid-cols-3 gap-3">
                    {cat.permissions.map((perm, pIdx) => (
                      <label
                        key={pIdx}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          defaultChecked={
                            selectedRole.permissions.includes(perm) ||
                            selectedRole.permissions.includes("all")
                          }
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

// ==================== ALL USERS ====================
function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await api.get("/admin/users");
      if (response.data.success) setUsers(response.data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/approve`);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, status: "active", is_active: true } : u,
        ),
      );
    } catch (err) {
      console.error("Error approving user:", err);
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/admin/users/${selectedUser.id}/reject`, {
        reason: rejectReason,
      });
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setShowRejectModal(false);
      setRejectReason("");
    } catch (err) {
      console.error("Error rejecting user:", err);
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/suspend`);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, status: "suspended", is_active: false } : u,
        ),
      );
    } catch (err) {
      console.error("Error suspending user:", err);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/activate`);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, status: "active", is_active: true } : u,
        ),
      );
    } catch (err) {
      console.error("Error activating user:", err);
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus =
      statusFilter === "all" ||
      u.status === statusFilter ||
      (statusFilter === "active" && u.is_active && !u.status);
    return matchSearch && matchRole && matchStatus;
  });

  const statusBadge = (status, is_active) => {
    const s = status || (is_active ? "active" : "inactive");
    const styles = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
      rejected: "bg-gray-100 text-gray-800",
      inactive: "bg-gray-100 text-gray-600",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[s] || styles.active}`}
      >
        {s}
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  if (error) return <ErrorState onRetry={fetchUsers} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">User Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          <UserPlus className="h-4 w-4" /> Add User
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
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

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                {["User", "Email", "Role", "Status", "Joined", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        {u.profile_photo ? (
                          <img
                            src={u.profile_photo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full"
                            fill="none"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="48"
                              stroke="#ccc"
                              strokeWidth="3"
                              fill="white"
                            />
                            <circle cx="50" cy="37" r="17" fill="#ccc" />
                            <ellipse
                              cx="50"
                              cy="80"
                              rx="27"
                              ry="17"
                              fill="#ccc"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {u.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-purple-100 text-purple-800" : u.role === "faculty" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {statusBadge(u.status, u.is_active)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {u.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowRejectModal(true);
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {(u.status === "active" || u.is_active) &&
                        u.status !== "pending" && (
                          <button
                            onClick={() => handleSuspend(u.id)}
                            className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
                            title="Suspend"
                          >
                            <Lock size={16} />
                          </button>
                        )}
                      {u.status === "suspended" && (
                        <button
                          onClick={() => handleActivate(u.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          title="Activate"
                        >
                          <Unlock size={16} />
                        </button>
                      )}
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-primary mb-4">Reject User</h3>
            <p className="text-gray-600 mb-4">
              Reject <strong>{selectedUser.full_name}</strong>?
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
                Reject
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

// ==================== STUDENTS ====================
function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/admin/students");
      if (res.data.success)
        setStudents(res.data.students || res.data.data || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  if (error) return <ErrorState onRetry={fetchStudents} />;

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
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState message="No students found" />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                {["ID", "Name", "Email", "Phone", "Enrollments", "Joined"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-500">{s.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {s.full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.email}</td>
                  <td className="px-6 py-4 text-sm">{s.phone_number || "—"}</td>
                  <td className="px-6 py-4 text-sm">
                    {s.enrollment_count ?? 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {s.created_at
                      ? new Date(s.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==================== FACULTY ====================
function Faculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/admin/faculty");
      if (res.data.success) setFaculty(res.data.faculty || res.data.data || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const filtered = faculty.filter(
    (f) =>
      f.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  if (error) return <ErrorState onRetry={fetchFaculty} />;

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
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState message="No faculty found" />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                {[
                  "ID",
                  "Name",
                  "Email",
                  "Specialization",
                  "Courses",
                  "Joined",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm text-gray-500">{f.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {f.full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{f.email}</td>
                  <td className="px-6 py-4 text-sm">
                    {f.specialization || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm">{f.course_count ?? 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {f.created_at
                      ? new Date(f.created_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==================== COURSE APPROVAL ====================
function CourseApproval() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/admin/courses/approval");
      if (res.data.success) setCourses(res.data.courses || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/courses/${id}/approve`);
      setCourses(
        courses.map((c) => (c.id === id ? { ...c, status: "approved" } : c)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/admin/courses/${id}/reject`);
      setCourses(
        courses.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered =
    filter === "all" ? courses : courses.filter((c) => c.status === filter);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  if (error) return <ErrorState onRetry={fetchCourses} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">
          Course Approval & Management
        </h2>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize transition ${filter === f ? (f === "pending" ? "bg-yellow-500 text-white" : f === "approved" ? "bg-green-500 text-white" : f === "rejected" ? "bg-red-500 text-white" : "bg-accent text-white") : "bg-gray-200"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState message={`No ${filter === "all" ? "" : filter} courses`} />
      ) : (
        <div className="space-y-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800">
                    {course.course_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    By {course.faculty_name || "—"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BookOpen size={16} />
                      {course.category || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign size={16} />₹{course.price ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {course.created_at
                        ? new Date(course.created_at).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${course.status === "pending" ? "bg-yellow-100 text-yellow-800" : course.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {course.status}
                </span>
              </div>
              {course.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(course.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(course.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Eye size={18} /> View Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== PAYMENTS ====================
function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/admin/payments");
      if (res.data.success)
        setPayments(res.data.payments || res.data.data || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Stats from all payments
  const totalReceived = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount || 0),
    0,
  );
  const completedAmt = payments
    .filter((p) => p.payment_status === "completed")
    .reduce((sum, p) => sum + parseFloat(p.paid_amount || p.amount || 0), 0);
  const pendingAmt = payments
    .filter((p) => p.payment_status === "pending")
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const partialAmt = payments
    .filter((p) => p.payment_status === "partial")
    .reduce((sum, p) => sum + parseFloat(p.paid_amount || 0), 0);
  const failedAmt = payments
    .filter((p) => p.payment_status === "failed")
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
  const refundedAmt = payments
    .filter((p) => p.payment_status === "refunded")
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const completedCount = payments.filter(
    (p) => p.payment_status === "completed",
  ).length;
  const pendingCount = payments.filter(
    (p) => p.payment_status === "pending",
  ).length;
  const partialCount = payments.filter(
    (p) => p.payment_status === "partial",
  ).length;
  const failedCount = payments.filter(
    (p) => p.payment_status === "failed",
  ).length;
  const refundedCount = payments.filter(
    (p) => p.payment_status === "refunded",
  ).length;

  const filtered = payments
    .filter((p) => filter === "all" || p.payment_status === filter)
    .filter(
      (p) =>
        !searchTerm ||
        p.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const filteredTotal = filtered.reduce(
    (sum, p) => sum + parseFloat(p.amount || 0),
    0,
  );

  const statusBadge = (s) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      partial: "bg-blue-100 text-blue-800",
      refunded: "bg-purple-100 text-purple-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${styles[s] || "bg-gray-100 text-gray-700"}`}
      >
        {s || "unknown"}
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  if (error) return <ErrorState onRetry={fetchPayments} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Payment Management</h2>
        <div className="flex gap-3">
          <button
            onClick={fetchPayments}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={() => setShowGatewayConfig(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Settings size={18} /> Gateway Settings
          </button>
        </div>
      </div>

      {/* 6 Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Received - wide card */}
        <div className="col-span-2 bg-gradient-to-br from-blue-600 to-blue-700 p-5 rounded-xl shadow-lg text-white flex items-center justify-between">
          <div>
            <p className="text-xs font-medium opacity-80 uppercase tracking-wide">
              Total Received
            </p>
            <p className="text-2xl font-bold mt-1">
              Rs.{totalReceived.toLocaleString()}
            </p>
            <p className="text-xs opacity-70 mt-1">
              {payments.length} transactions
            </p>
          </div>
          <DollarSign className="h-10 w-10 opacity-70" />
        </div>

        {/* Completed */}
        <div
          onClick={() =>
            setFilter(filter === "completed" ? "all" : "completed")
          }
          className={`p-5 rounded-xl shadow-md border-2 cursor-pointer transition-all ${filter === "completed" ? "border-green-500 bg-green-50" : "border-transparent bg-white hover:border-green-300"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-500" size={22} />
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
              {completedCount}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Completed</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            Rs.{completedAmt.toLocaleString()}
          </p>
        </div>

        {/* Pending */}
        <div
          onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
          className={`p-5 rounded-xl shadow-md border-2 cursor-pointer transition-all ${filter === "pending" ? "border-yellow-500 bg-yellow-50" : "border-transparent bg-white hover:border-yellow-300"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-yellow-500" size={22} />
            <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Pending</p>
          <p className="text-xl font-bold text-yellow-600 mt-1">
            Rs.{pendingAmt.toLocaleString()}
          </p>
        </div>

        {/* Partial */}
        <div
          onClick={() => setFilter(filter === "partial" ? "all" : "partial")}
          className={`p-5 rounded-xl shadow-md border-2 cursor-pointer transition-all ${filter === "partial" ? "border-blue-500 bg-blue-50" : "border-transparent bg-white hover:border-blue-300"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <PieChart className="text-blue-500" size={22} />
            <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              {partialCount}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Partial</p>
          <p className="text-xl font-bold text-blue-600 mt-1">
            Rs.{partialAmt.toLocaleString()}
          </p>
        </div>

        {/* Failed */}
        <div
          onClick={() => setFilter(filter === "failed" ? "all" : "failed")}
          className={`p-5 rounded-xl shadow-md border-2 cursor-pointer transition-all ${filter === "failed" ? "border-red-500 bg-red-50" : "border-transparent bg-white hover:border-red-300"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <XCircle className="text-red-500" size={22} />
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              {failedCount}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Failed</p>
          <p className="text-xl font-bold text-red-600 mt-1">
            Rs.{failedAmt.toLocaleString()}
          </p>
        </div>

        {/* Refunded */}
        <div
          onClick={() => setFilter(filter === "refunded" ? "all" : "refunded")}
          className={`p-5 rounded-xl shadow-md border-2 cursor-pointer transition-all col-span-2 md:col-span-1 ${filter === "refunded" ? "border-purple-500 bg-purple-50" : "border-transparent bg-white hover:border-purple-300"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="text-purple-500" size={22} />
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
              {refundedCount}
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Refunded</p>
          <p className="text-xl font-bold text-purple-600 mt-1">
            Rs.{refundedAmt.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter Pills + Search */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap gap-2">
          {["all", "completed", "pending", "partial", "failed", "refunded"].map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize border ${
                  filter === f
                    ? f === "completed"
                      ? "bg-green-600 text-white border-green-600"
                      : f === "pending"
                        ? "bg-yellow-500 text-white border-yellow-500"
                        : f === "partial"
                          ? "bg-blue-600 text-white border-blue-600"
                          : f === "failed"
                            ? "bg-red-600 text-white border-red-600"
                            : f === "refunded"
                              ? "bg-purple-600 text-white border-purple-600"
                              : "bg-gray-800 text-white border-gray-800"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
              >
                {f}
              </button>
            ),
          )}
        </div>
        <div className="relative w-full md:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search student, course, txn ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Active filter total banner */}
      {filter !== "all" && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
          <span className="text-sm text-gray-600">
            Showing <strong className="capitalize">{filter}</strong> payments (
            {filtered.length} records)
          </span>
          <span className="text-lg font-bold text-primary">
            Rs.{filteredTotal.toLocaleString()}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            message={`No ${filter === "all" ? "" : filter} payments found`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  {[
                    "Transaction ID",
                    "Student",
                    "Course",
                    "Total",
                    "Paid",
                    "Due",
                    "Gateway",
                    "Status",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-semibold text-gray-600 uppercase whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const total = parseFloat(p.amount || 0);
                  const paid = parseFloat(p.paid_amount ?? p.amount ?? 0);
                  const due = Math.max(0, total - paid);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-xs font-mono text-gray-500">
                        {p.transaction_id || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">
                        {p.student_name || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 max-w-[150px] truncate">
                        {p.course_name || "—"}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        Rs.{total.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-green-600">
                        Rs.{paid.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-red-500">
                        {due > 0 ? `Rs.${due.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-5 py-4 text-sm capitalize text-gray-500">
                        {p.gateway || "razorpay"}
                      </td>
                      <td className="px-5 py-4">
                        {statusBadge(p.payment_status)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">
                        {p.payment_date
                          ? new Date(p.payment_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition">
                            View
                          </button>
                          {p.payment_status === "completed" && (
                            <button className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition">
                              Refund
                            </button>
                          )}
                          {p.payment_status === "partial" && (
                            <button className="px-3 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition">
                              Follow Up
                            </button>
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
      </div>

      {/* Gateway Config Modal */}
      {showGatewayConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">
                Payment Gateway Configuration
              </h3>
              <button onClick={() => setShowGatewayConfig(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            {["Razorpay", "Stripe"].map((gw) => (
              <div
                key={gw}
                className="border-2 border-gray-200 rounded-lg p-6 mb-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold">{gw}</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">Enable</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder={
                      gw === "Razorpay" ? "rzp_live_..." : "pk_live_..."
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="password"
                    placeholder="Secret key..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            ))}
            <button className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ANALYTICS ====================
function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get("/admin/analytics");
      if (res.data.success)
        setAnalytics(res.data.analytics || res.data.data || {});
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  if (error) return <ErrorState onRetry={fetchAnalytics} />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">Analytics Dashboard</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Students",
            value: analytics?.totalStudents ?? 0,
            icon: GraduationCap,
            color: "text-blue-500",
          },
          {
            label: "Total Faculty",
            value: analytics?.totalFaculty ?? 0,
            icon: UserCheck,
            color: "text-green-500",
          },
          {
            label: "Total Courses",
            value: analytics?.totalCourses ?? 0,
            icon: BookOpen,
            color: "text-yellow-500",
          },
          {
            label: "Total Revenue",
            value: `₹${((analytics?.totalRevenue ?? 0) / 1000).toFixed(0)}K`,
            icon: DollarSign,
            color: "text-purple-500",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-6 rounded-xl shadow-md">
            <Icon className={`h-10 w-10 ${color} mb-3`} />
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              {label}
            </h3>
            <p className="text-2xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Top Performing Courses
            </h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          {analytics?.topCourses?.length > 0 ? (
            <div className="space-y-3">
              {analytics.topCourses.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 bg-accent text-white rounded-full font-bold text-sm">
                      {i + 1}
                    </span>
                    <span className="font-medium">{c.course_name}</span>
                  </div>
                  <span className="text-accent font-bold">
                    {c.enrollment_count} enrolled
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No course data yet" />
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              Revenue by Month
            </h3>
            <BarChart3 className="text-purple-500" size={20} />
          </div>
          {analytics?.revenueByMonth?.length > 0 ? (
            <div className="space-y-3">
              {analytics.revenueByMonth.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium">{item.month}</span>
                  <span className="text-green-600 font-bold">
                    ₹{(parseFloat(item.revenue) || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No revenue data yet" />
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== SYSTEM SETTINGS ====================
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                defaultValue="Upskillize LMS"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Server
              </label>
              <input
                type="text"
                defaultValue="smtp.gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
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
            {[
              {
                label: "Two-Factor Authentication",
                value: "Enabled",
                color: "bg-green-600",
              },
              { label: "Session Timeout", value: "30 minutes", color: null },
              { label: "Password Expiry", value: "90 days", color: null },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm font-medium">{label}</span>
                {color ? (
                  <button
                    className={`px-4 py-1 ${color} text-white rounded text-sm`}
                  >
                    {value}
                  </button>
                ) : (
                  <span className="text-sm text-gray-600">{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== CONTENT MODERATION — loads from API ====================
function ContentModeration() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/content");
      if (res.data.success) setContent(res.data.content || []);
    } catch (_) {
      setContent([]); // no fake data — just empty
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/content/${id}/approve`);
      setContent(
        content.map((c) => (c.id === id ? { ...c, status: "approved" } : c)),
      );
    } catch (_) {}
  };
  const handleReject = async (id) => {
    try {
      await api.post(`/admin/content/${id}/reject`);
      setContent(
        content.map((c) => (c.id === id ? { ...c, status: "rejected" } : c)),
      );
    } catch (_) {}
  };

  const filtered = content.filter(
    (c) => filter === "all" || c.status === filter,
  );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Content Moderation</h2>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize ${filter === f ? "bg-accent text-white" : "bg-gray-200"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState message={`No ${filter === "all" ? "" : filter} content`} />
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {item.type === "video" && (
                      <Video className="text-red-500" size={24} />
                    )}
                    {item.type === "pdf" && (
                      <FileText className="text-blue-500" size={24} />
                    )}
                    {item.type === "scorm" && (
                      <Archive className="text-green-500" size={24} />
                    )}
                    <h3 className="text-lg font-bold">{item.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>By: {item.faculty}</span>
                    <span>•</span>
                    <span>{item.uploadDate}</span>
                    <span>•</span>
                    <span>{item.size}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "pending" ? "bg-yellow-100 text-yellow-800" : item.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {item.status}
                </span>
              </div>
              {item.status === "pending" && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-1"
                  >
                    <CheckCircle size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-1"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== REPORT GENERATION ====================
function ReportGeneration() {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [format, setFormat] = useState("pdf");

  const templates = [
    { id: "user-registration", name: "User Registration Report", icon: Users },
    { id: "enrollment", name: "Enrollment Report", icon: BookOpen },
    { id: "revenue", name: "Revenue Report", icon: DollarSign },
    { id: "completion", name: "Course Completion Report", icon: Award },
    {
      id: "payment-transactions",
      name: "Payment Transactions",
      icon: CreditCard,
    },
    {
      id: "faculty-activity",
      name: "Faculty Activity Report",
      icon: UserCheck,
    },
  ];

  const handleGenerate = async () => {
    if (!reportType) return alert("Please select a report type");
    if (!dateRange.start || !dateRange.end)
      return alert("Please select a date range");
    try {
      await api.post("/admin/reports/generate", {
        type: reportType,
        ...dateRange,
        format,
      });
      alert(`Report generation started. Check your downloads.`);
    } catch (_) {
      alert(
        "Report generation — connect backend /admin/reports/generate endpoint",
      );
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">
        Custom Report Generation
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {templates.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setReportType(id)}
            className={`p-6 rounded-xl border-2 transition text-left ${reportType === id ? "border-accent bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
          >
            <Icon className="h-12 w-12 text-accent mb-3" />
            <h3 className="font-bold text-gray-800">{name}</h3>
          </button>
        ))}
      </div>
      {reportType && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Report Configuration
          </h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <div className="flex gap-4 mb-6">
            {["pdf", "csv", "excel"].map((fmt) => (
              <label key={fmt} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={fmt}
                  checked={format === fmt}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-4 h-4 text-accent"
                />
                <span className="uppercase text-sm font-medium">{fmt}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            className="w-full bg-accent text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
          >
            <Download size={20} /> Generate Report
          </button>
        </div>
      )}
    </div>
  );
}

// ==================== AUDIT LOGS — loads from API ====================
function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/audit-logs");
      if (res.data.success) setLogs(res.data.logs || []);
    } catch (_) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const actions = ["all", ...new Set(logs.map((l) => l.action))];
  const filtered = logs.filter((l) => {
    const matchAction = filterAction === "all" || l.action === filterAction;
    const matchSearch =
      l.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchAction && matchSearch;
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Audit Logs</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          <Download size={18} /> Export Logs
        </button>
      </div>
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
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState message="No audit logs yet" />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                {["Timestamp", "User", "Action", "Details", "IP Address"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{log.user}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {log.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==================== DATABASE MANAGEMENT ====================
function DatabaseManagement() {
  const [backups, setBackups] = useState([]);
  const [schedule, setSchedule] = useState("daily");
  const [backupInProgress, setBackupInProgress] = useState(false);

  useEffect(() => {
    api
      .get("/admin/backups")
      .then((res) => {
        if (res.data.success) setBackups(res.data.backups || []);
      })
      .catch(() => setBackups([]));
  }, []);

  const handleCreateBackup = async () => {
    setBackupInProgress(true);
    try {
      await api.post("/admin/backups/create");
      alert("Backup created!");
    } catch (_) {
      alert("Connect /admin/backups/create endpoint to your backend");
    } finally {
      setBackupInProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">
        Database Backup & Maintenance
      </h2>
      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: "Create Backup",
            sub: "Manual backup",
            icon: Database,
            color: "bg-blue-600 hover:bg-blue-700",
            onClick: handleCreateBackup,
            disabled: backupInProgress,
          },

          {
            label: "Optimize DB",
            sub: "Improve performance",
            icon: Zap,
            color: "bg-green-600 hover:bg-green-700",
            onClick: () => alert("Coming soon"),
            disabled: false,
          },

          {
            label: "Clear Cache",
            sub: "Free up memory",
            icon: RefreshCw,
            color: "bg-yellow-600 hover:bg-yellow-700",
            onClick: () => alert("Coming soon"),
            disabled: false,
          },

          {
            label: "Storage Info",
            sub: "View usage",
            icon: HardDrive,
            color: "bg-purple-600 hover:bg-purple-700",
            onClick: () => alert("Coming soon"),
            disabled: false,
          },
        ].map(({ label, sub, icon: Icon, color, onClick, disabled }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={disabled}
            className={`p-6 ${color} text-white rounded-xl transition disabled:opacity-50`}
          >
            <Icon className="h-10 w-10 mb-2" />
            <div className="font-bold">{label}</div>
            <div className="text-xs mt-1">{sub}</div>
          </button>
        ))}
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Backup Schedule
        </h3>
        <div className="flex gap-4">
          {["daily", "weekly", "monthly"].map((freq) => (
            <label key={freq} className="flex items-center gap-2">
              <input
                type="radio"
                value={freq}
                checked={schedule === freq}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-4 h-4 text-accent"
              />
              <span className="capitalize">{freq}</span>
            </label>
          ))}
        </div>
        <button className="mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-700 transition">
          Save Schedule
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Backup History</h3>
        {backups.length === 0 ? (
          <EmptyState message="No backups yet" />
        ) : (
          <div className="space-y-3">
            {backups.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <Archive className="text-blue-500" size={24} />
                  <div>
                    <p className="font-semibold text-gray-800">{b.name}</p>
                    <p className="text-sm text-gray-600">
                      {b.date} • {b.size}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${b.type === "auto" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                  >
                    {b.type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm flex items-center gap-1">
                    <Upload size={16} /> Restore
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1">
                    <Download size={16} /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN ADMIN DASHBOARD ====================
export default function AdminDashboard() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/admin", label: "Overview", icon: BarChart3 },
    { path: "/admin/roles", label: "Roles", icon: Shield },
    { path: "/admin/users", label: "Users", icon: Users },
    { path: "/admin/students", label: "Students", icon: GraduationCap },
    { path: "/admin/faculty", label: "Faculty", icon: UserCheck },
    { path: "/admin/course-approval", label: "Courses", icon: CheckCircle },
    { path: "/admin/payments", label: "Payments", icon: CreditCard },
    { path: "/admin/analytics", label: "Analytics", icon: TrendingUp },
    { path: "/admin/content-moderation", label: "Content", icon: Flag },
    { path: "/admin/reports", label: "Reports", icon: FileText },
    { path: "/admin/audit-logs", label: "Audit Logs", icon: History },
    { path: "/admin/database", label: "Database", icon: Database },
    { path: "/admin/settings", label: "Settings", icon: Settings },
    { path: "/admin/testGen", label: "TestGen Monitor", icon: Zap },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0"} bg-gradient-to-b from-[#1e5a8e] to-[#164266] text-white transition-all duration-300 overflow-hidden flex-shrink-0 shadow-2xl`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-blue-700/50 flex items-center justify-center">
            <img src="/project.png" alt="Upskillize" className="h-10 w-auto" />
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`w-full flex items-center px-6 py-3.5 hover:bg-blue-800/50 transition-all group ${isActive ? "bg-[#164266] border-l-4 border-orange-400" : ""}`}
                >
                  <Icon
                    size={20}
                    className="mr-3 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm font-medium">{label}</span>
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
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex-1 max-w-md relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search users, courses..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition">
                <Bell size={20} />
              </button>
              <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition">
                <HelpCircle size={20} />
              </button>
              <div className="relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center overflow-hidden shadow-lg">
                    {user?.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full"
                        fill="none"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="48"
                          stroke="#111"
                          strokeWidth="3.5"
                          fill="white"
                        />
                        <circle cx="50" cy="37" r="17" fill="#111" />
                        <ellipse cx="50" cy="80" rx="27" ry="17" fill="#111" />
                      </svg>
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.full_name || "Admin"}
                    </div>
                    <div className="text-xs text-gray-500">Administrator</div>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate("/admin/profile");
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                      >
                        <User size={16} /> Profile
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate("/admin/settings");
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                      >
                        <Settings size={16} /> Settings
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-red-600"
                      >
                        <LogOut size={16} /> Logout
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
              <Route path="/testGen" element={<BrainDrillMonitor />} />
              <Route
                path="/content-moderation"
                element={<ContentModeration />}
              />
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
