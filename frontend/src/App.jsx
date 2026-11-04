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
import ApplicationPipelinePage from './pages/applications/ApplicationPipelinePage';
import ApplicationDetailsPage from './pages/applications/ApplicationDetailsPage';
import AnalysisListPage from './pages/analysis/AnalysisListPage';
import AnalysisDetailsPage from './pages/analysis/AnalysisDetailsPage';
import InterviewAssistantPage from './pages/interviews/InterviewAssistantPage';
import QuestionSetDetailsPage from './pages/interviews/QuestionSetDetailsPage';
import ModulePlaceholder from './pages/common/ModulePlaceholder';
import { BarChart3, Settings } from 'lucide-react';

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
            {/* Application Pipeline Routes */}
            <Route path="/applications" element={<ApplicationPipelinePage />} />
            <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
            {/* AI Resume Analysis Routes */}
            <Route path="/analysis" element={<AnalysisListPage />} />
            <Route path="/analysis/:id" element={<AnalysisDetailsPage />} />
            {/* Interview Assistant Routes */}
            <Route path="/interviews" element={<InterviewAssistantPage />} />
            <Route path="/interviews/:id" element={<QuestionSetDetailsPage />} />
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
