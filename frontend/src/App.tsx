import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import PrivateRoute from "./components/common/PrivateRoute";

const TodaysCalls = lazy(() => import("./pages/agent/TodaysCalls"));
const LeadDetail = lazy(() => import("./pages/agent/LeadDetail"));
const CreateLead = lazy(() => import("./pages/agent/CreateLead"));
const AllLeads = lazy(() => import("./pages/agent/AllLeads"));
const Notifications = lazy(() => import("./pages/agent/Notifications"));
const CollegeDashboard = lazy(() => import("./pages/agent/CollegeDashboard"));
const AllColleges = lazy(() => import("./pages/agent/AllColleges"));
const CollegeDetail = lazy(() => import("./pages/agent/CollegeDetail"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLeadsList = lazy(() => import("./pages/admin/AdminLeadsList"));
const AdminNotifications = lazy(
  () => import("./pages/admin/AdminNotifications"),
);

const RouteLoader = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ backgroundColor: "#FAF9F6" }}
  >
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Agent Routes - Direct to College Dashboard */}
            <Route
              path="/agent"
              element={
                <PrivateRoute allowedRoles={["AGENT", "ADMIN"]}>
                  <CollegeDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/today"
              element={
                <PrivateRoute allowedRoles={["AGENT", "ADMIN"]}>
                  <TodaysCalls />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/lead/new"
              element={
                <PrivateRoute allowedRoles={["AGENT", "ADMIN"]}>
                  <CreateLead />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/lead/:id"
              element={
                <PrivateRoute allowedRoles={["AGENT", "ADMIN"]}>
                  <LeadDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/leads"
              element={
                <PrivateRoute allowedRoles={["AGENT", "ADMIN"]}>
                  <AllLeads />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/notifications"
              element={
                <PrivateRoute allowedRoles={["AGENT", "ADMIN"]}>
                  <Notifications />
                </PrivateRoute>
              }
            />

            {/* College Routes */}
            <Route
              path="/agent/college-dashboard"
              element={
                <PrivateRoute allowedRoles={["AGENT", "ADMIN"]}>
                  <CollegeDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/colleges"
              element={
                <PrivateRoute allowedRoles={["AGENT", "ADMIN"]}>
                  <AllColleges />
                </PrivateRoute>
              }
            />
            <Route
              path="/agent/colleges/:id"
              element={
                <PrivateRoute allowedRoles={["AGENT", "ADMIN"]}>
                  <CollegeDetail />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/leads"
              element={
                <PrivateRoute allowedRoles={["ADMIN"]}>
                  <AdminLeadsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <PrivateRoute allowedRoles={["ADMIN"]}>
                  <AdminNotifications />
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
