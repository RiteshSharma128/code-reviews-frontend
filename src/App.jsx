
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


