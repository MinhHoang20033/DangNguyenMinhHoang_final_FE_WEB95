import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyOtp from "@/pages/auth/VerifyOtp";
import ResetPassword from "@/pages/auth/ResetPassword";
import Dashboard from "@/pages/dashboard/Dashboard";
import Projects from "@/pages/project/Projects";
import Employees from "@/pages/employee/Employees";
import ProjectDetail from "@/pages/project/ProjectDetail";
import EmployeeDetail from "@/pages/employee/EmployeeDetail";
import AddEmployee from "@/pages/employee/AddEmployee";
import Partners from "@/pages/partner/Partners";

import SidebarLayout from "@/components/layout/SidebarLayout";

import AuthProvider from "@/context/AuthContext";
import { AuthContext } from "@/context/AuthContextValue";

const getHomePath = (user) => {
  if (user?.role === "admin") {
    return "/dashboard";
  }

  return "/projects";
};

function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (user?.role !== "admin") {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { token, user } = useContext(AuthContext);

  if (token) {
    return <Navigate to={getHomePath(user)} replace />;
  }

  return children;
}

function HomeRedirect() {
  const { token, user } = useContext(AuthContext);

  return <Navigate to={token ? getHomePath(user) : "/login"} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <PublicRoute>
                <VerifyOtp />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />

          <Route
            element={
              <PrivateRoute>
                <SidebarLayout />
              </PrivateRoute>
            }
          >
            <Route
              path="/dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <Projects />
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProjectDetail />
              }
            />

            <Route
              path="/employees"
              element={
                <AdminRoute>
                  <Employees />
                </AdminRoute>
              }
            />
            <Route
              path="/employees/add"
              element={
                <AdminRoute>
                  <AddEmployee />
                </AdminRoute>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <AdminRoute>
                  <EmployeeDetail />
                </AdminRoute>
              }
            />
            <Route
              path="/partners"
              element={
                <AdminRoute>
                  <Partners />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
