import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/auth/ProfilePage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import UserManagementPage from './pages/auth/UserManagementPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';

// Dashboard & Placeholder Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import JobListPage from './pages/jobs/JobListPage';
import JobDetailsPage from './pages/jobs/JobDetailsPage';
import CandidateListPage from './pages/candidates/CandidateListPage';
import CandidateDetailsPage from './pages/candidates/CandidateDetailsPage';
import ModulePlaceholder from './pages/common/ModulePlaceholder';
import { FileCheck2, Sparkles, HelpCircle, BarChart3, Settings } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/settings" element={<ProfilePage />} />

            {/* Admin-only Routes */}
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <UserManagementPage />
                </AdminRoute>
              }
            />

            {/* Job Management Routes */}
            <Route path="/jobs" element={<JobListPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            {/* Candidate Management Routes */}
            <Route path="/candidates" element={<CandidateListPage />} />
            <Route path="/candidates/:id" element={<CandidateDetailsPage />} />
            <Route
              path="/applications"
              element={
                <ModulePlaceholder
                  title="Application Pipeline"
                  description="Multi-stage candidate application tracking with status history and notes."
                  phase="Phase 6"
                  icon={FileCheck2}
                />
              }
            />
            <Route
              path="/analysis"
              element={
                <ModulePlaceholder
                  title="AI Resume Analysis"
                  description="Screen resumes against job requirements using local LLM inference with structured evidence validation."
                  phase="Phase 7 & 8"
                  icon={Sparkles}
                />
              }
            />
            <Route
              path="/interviews"
              element={
                <ModulePlaceholder
                  title="Interview Assistant"
                  description="Generate and manage tailored technical interview questions with evaluation criteria."
                  phase="Phase 9"
                  icon={HelpCircle}
                />
              }
            />
            <Route
              path="/reports"
              element={
                <ModulePlaceholder
                  title="Reports & Analytics"
                  description="Recruitment metrics, candidate conversion pipelines, and audit activity logs."
                  phase="Phase 10"
                  icon={BarChart3}
                />
              }
            />

            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
