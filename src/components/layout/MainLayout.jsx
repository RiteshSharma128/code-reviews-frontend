import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Mic, Code2, BookOpen, FileText,
  Briefcase, Users, User, Brain, Trophy, Settings,
  LogOut, Menu, X, ChevronRight, Flame, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/interview', icon: Mic, label: 'Mock Interview' },
  { to: '/dsa', icon: Code2, label: 'DSA Practice' },
  { to: '/practice', icon: BookOpen, label: 'Question Bank' },
  { to: '/coach', icon: Brain, label: 'AI Coach' },
  { to: '/resume', icon: FileText, label: 'Resume Tools' },
  { to: '/linkedin', icon: Briefcase, label: 'LinkedIn Tips' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/community', icon: Users, label: 'Community' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

export default function MainLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`flex flex-col h-full bg-gradient-to-b from-[#0f0e2a] to-[#1e1b4b] border-r border-indigo-900/40 ${mobile ? 'w-72' : 'w-64'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-900/40">
        <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">InterviewAI</p>
          <p className="text-indigo-400 text-xs">Platform</p>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-4 border-b border-indigo-900/40">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-900/30">
          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="avatar" className="w-full h-full rounded-full object-cover" />
              : (user?.name?.[0] || 'U').toUpperCase()
            }
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-indigo-400 text-xs truncate">{user?.target_role || 'Set target role'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
              ${isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                : 'text-indigo-300 hover:bg-indigo-900/40 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-indigo-400 group-hover:text-white'}`} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 text-indigo-300" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-indigo-900/40 space-y-1">
        <NavLink to="/profile" onClick={() => mobile && setSidebarOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:bg-indigo-900/40 hover:text-white'}`}>
          <User className="w-4 h-4 text-indigo-400" />
          Profile
        </NavLink>
        <NavLink to="/settings" onClick={() => mobile && setSidebarOpen(false)}
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:bg-indigo-900/40 hover:text-white'}`}>
          <Settings className="w-4 h-4 text-indigo-400" />
          Settings
        </NavLink>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#080719] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 z-20 text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0f0e2a] border-b border-indigo-900/40">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-indigo-300" />
          </button>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <span className="text-white font-bold text-sm">InterviewAI</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
            {(user?.name?.[0] || 'U').toUpperCase()}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
