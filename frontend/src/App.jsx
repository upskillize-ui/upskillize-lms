import AIProfile from "./pages/Student/AIProfile";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/Student/Dashboard";
import CaseStudyReview from "./pages/Student/CaseStudyReview";
import FacultyDashboard from "./pages/Faculty/Dashboard";
import AdminDashboard from "./pages/Admin/Dashboard";
import StudentAttendance from "./pages/Student/StudentAttendance";
import FacultyAttendance from "./pages/Faculty/FacultyAttendance";
import AdminAttendance from "./pages/Admin/AdminAttendance";


import BrowseCourses from "./pages/BrowseCourses";
import CourseView from "./pages/CourseView";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Private Route Component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
};

// App Routes Component (must be inside AuthProvider)
function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  return (
    <Routes>
      {/* ✅ ROOT ROUTE - Redirect to login if not authenticated */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role}`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Routes */}
      <Route path="/courses" element={<BrowseCourses />} />
      <Route path="/course/:id" element={<CourseView />} />

      {/* Auth Routes */}
      <Route
        path="/login"
        element={user ? <Navigate to={`/${user.role}`} replace /> : <Login />}
      />
      <Route
        path="/register"
        element={
          user ? <Navigate to={`/${user.role}`} replace /> : <Register />
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/reset-password" element={<ChangePassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes - Student */}
        <Route
        path="/student/ai-profile"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <AIProfile />
          </PrivateRoute>
        }
      />        

      <Route
        path="/student/case-study"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <CaseStudyReview />
          </PrivateRoute>
        }
      />

      <Route
        path="/student/*"
        element={
          <PrivateRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </PrivateRoute>
        }
      />

      {/* Protected Routes - Faculty */}
      <Route
        path="/faculty/*"
        element={
          <PrivateRoute allowedRoles={["faculty"]}>
            <FacultyDashboard />
          </PrivateRoute>
        }
      />

      {/* Protected Routes - Admin */}
      <Route
        path="/admin/*"
        element={
          <PrivateRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      {/* ✅ CATCH-ALL - Redirect unknown routes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}