<<<<<<< HEAD
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./pages/Home";
import Review from "./pages/Review";
import History from "./pages/History";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import MultiReview from "./pages/MultiReview";
import GitHubCallback from "./pages/GitHubCallback";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import ChatHistory from "./pages/ChatHistory";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen text-blue-400">
      <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  const { user } = useAuth();

  return (
    <div className="h-screen bg-[#0a0a0f] text-[#e2e8f0] flex overflow-hidden">
      
      {/* Sidebar */}
      {user && <Sidebar />}

      {/* Right side — Navbar + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        {/* Content area — fills remaining height */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/multi-review" element={<MultiReview />} />
            <Route path="/chat-history" element={<ChatHistory />} />
            <Route path="/auth/github/callback" element={<GitHubCallback />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/review" element={<PrivateRoute><Review /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>

    </div>
  );
}
=======
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import LeaderboardPage from './pages/dashboard/LeaderboardPage';

import InterviewPage from './pages/interview/InterviewPage';
import InterviewResultPage from './pages/interview/InterviewResultPage';
import VoiceInterviewPage from './pages/interview/VoiceInterviewPage';
import VideoInterviewPage from './pages/interview/VideoInterviewPage';
import WhiteboardPage from './pages/interview/WhiteboardPage';

import DSAPage from './pages/dsa/DSAPage';
import DSAProblemPage from './pages/dsa/DSAProblemPage';
import PracticePage from './pages/practice/PracticePage';
import ResumePage from './pages/resume/ResumePage';
import JobsPage from './pages/jobs/JobsPage';
import CommunityPage from './pages/community/CommunityPage';
import CommunityPostPage from './pages/community/CommunityPostPage';
import ProfilePage from './pages/profile/ProfilePage';
import CoachPage from './pages/coach/CoachPage';
import SettingsPage from './pages/profile/SettingsPage';
import LinkedInPage from './pages/profile/LinkedInPage';
import PeerInterviewPage from './pages/interview/PeerInterviewPage';

import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy import for InterviewSessionPage (updated with copilot)
const InterviewSessionPage = React.lazy(() => import('./pages/interview/InterviewSessionPage'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
});

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner fullScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  const { checkAuth } = useAuthStore();
  useEffect(() => { checkAuth(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <React.Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/auth/callback" element={<OAuthCallbackPage />} />
            </Route>

            {/* Interview modes — outside main layout (fullscreen) */}
            <Route path="/interview/session/:sessionId" element={<ProtectedRoute><InterviewSessionPage /></ProtectedRoute>} />
            <Route path="/interview/voice/:sessionId" element={<ProtectedRoute><VoiceInterviewPage /></ProtectedRoute>} />
            <Route path="/interview/video/:sessionId" element={<ProtectedRoute><VideoInterviewPage /></ProtectedRoute>} />
            <Route path="/interview/whiteboard/:sessionId" element={<ProtectedRoute><WhiteboardPage /></ProtectedRoute>} />
            <Route path="/interview/peer/:roomId" element={<ProtectedRoute><PeerInterviewPage /></ProtectedRoute>} />

            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/interview/result/:sessionId" element={<InterviewResultPage />} />
              <Route path="/dsa" element={<DSAPage />} />
              <Route path="/dsa/:slug" element={<DSAProblemPage />} />
              <Route path="/practice" element={<PracticePage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community/:postId" element={<CommunityPostPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/coach" element={<CoachPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/linkedin" element={<LinkedInPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: '#1e1b4b', color: '#fff', border: '1px solid #4f46e5' },
      }} />
    </QueryClientProvider>
  );
}

export default App;
>>>>>>> c5f39bc49f5aa08623f622dd9ffd24139d9c9f2b
