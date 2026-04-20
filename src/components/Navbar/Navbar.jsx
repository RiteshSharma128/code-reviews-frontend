// import { Link, useNavigate } from "react-router-dom";
// import { Sun, Moon, Code2, LogOut, History, Zap } from "lucide-react";
// import { useTheme } from "../../context/ThemeContext";
// import { useAuth } from "../../context/AuthContext";

// export default function Navbar() {
//   const { isDark, toggleTheme } = useTheme();
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/");
//   };

//   return (
//     <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-[#30363d] bg-white/80 dark:bg-[#161b22]/80 backdrop-blur-md">
//       <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
//         {/* Logo */}
//         <Link to="/" className="flex items-center gap-2 font-bold text-xl">
//           <Code2 className="text-blue-500" size={24} />
//           <span className="text-blue-500">AI</span>
//           <span>CodeReview</span>
//         </Link>

//         {/* Actions */}
//         <div className="flex items-center gap-3">
//           {user && (
//             <>
//               <Link
//                 to="/review"
//                 className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition"
//               >
//                 <Zap size={15} />
//                 New Review
//               </Link>
//               <Link
//                 to="/history"
//                 className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#30363d] text-sm transition"
//               >
//                 <History size={15} />
//                 History
//               </Link>
//               <button
//                 onClick={handleLogout}
//                 className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#30363d] text-sm transition"
//               >
//                 <LogOut size={15} />
//               </button>
//             </>
//           )}

//           {!user && (
//             <>
//               <Link to="/login" className="px-4 py-2 text-sm hover:text-blue-500 transition">Login</Link>
//               <Link to="/register" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition">
//                 Sign Up
//               </Link>
//             </>
//           )}

//           {/* Theme Toggle */}
//           <button
//             onClick={toggleTheme}
//             className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#30363d] transition"
//           >
//             {isDark ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
//           </button>
//         </div>
//       </div>
//     </nav>
//   );
// }







import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sun, Moon, Code2, LogOut, History, Zap, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); };

  const navLinks = user ? [
    { to: "/review", label: "New Review", icon: <Zap size={14} /> },
    { to: "/history", label: "History", icon: <History size={14} /> },
  ] : [];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg group">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/30 transition">
              <Code2 size={16} className="text-indigo-400" />
            </div>
            <span className="text-white">AI<span className="text-indigo-400">Review</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.icon}{link.label}
              </Link>
            ))}

            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">Login</Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/5 transition text-gray-400"
            >
              {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-[#1e1e2e] p-4 space-y-2"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 transition"
              >
                {link.icon}{link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition"
              >
                <LogOut size={14} /> Logout
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 transition">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-lg bg-indigo-600 text-white text-center transition">Sign Up</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}