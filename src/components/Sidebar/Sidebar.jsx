import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Code2, History, Home, Sun, Moon,
  LogOut, ChevronLeft, ChevronRight, Zap, User
} from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import { Files } from "lucide-react";
import { Users } from "lucide-react";
import { MessageCircle } from "lucide-react";

const NAV_ITEMS = [
  { path: "/", icon: <Home size={18} />, label: "Home" },
  { path: "/review", icon: <Zap size={18} />, label: "New Review" },
  { path: "/history", icon: <History size={18} />, label: "History" },
  { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { path: "/multi-review", label: "Multi Review", icon: <Files size={16} /> },
  { path: "/teams", label: "Teams", icon: <Users size={16} /> },
  { path: "/chat-history", label: "Chat History", icon: <MessageCircle size={16} /> }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-[#30363d]">
        {!collapsed && (
          <div className="flex items-center gap-2 font-bold">
            <Code2 size={20} className="text-blue-500" />
            <span className="text-sm">AI CodeReview</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#30363d] transition ml-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              location.pathname === item.path
                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                : "hover:bg-gray-100 dark:hover:bg-[#30363d] text-gray-600 dark:text-gray-400"
            }`}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 space-y-1 border-t border-gray-200 dark:border-[#30363d]">
        {/* User */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
            <User size={16} />
            <span className="truncate">{user.name}</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#30363d] text-sm transition text-gray-600 dark:text-gray-400"
        >
          {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
          {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-red-400 text-sm transition"
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}