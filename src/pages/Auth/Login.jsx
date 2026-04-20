// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import toast from "react-hot-toast";
// import { Code2 } from "lucide-react";

// export default function Login() {
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await login(form.email, form.password);
//       toast.success("Welcome back! 🎉");
//       navigate("/review");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-[90vh] flex items-center justify-center px-4">
//       <div className="w-full max-w-md p-8 rounded-2xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22]">
//         <div className="flex items-center gap-2 mb-8">
//           <Code2 className="text-blue-500" size={28} />
//           <h1 className="text-2xl font-bold">Welcome back</h1>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm mb-1.5 text-gray-600 dark:text-gray-400">Email</label>
//             <input
//               type="email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#0d1117] focus:outline-none focus:border-blue-500 transition"
//               placeholder="you@example.com"
//             />
//           </div>
//           <div>
//             <label className="block text-sm mb-1.5 text-gray-600 dark:text-gray-400">Password</label>
//             <input
//               type="password"
//               value={form.password}
//               onChange={(e) => setForm({ ...form, password: e.target.value })}
//               className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#30363d] bg-gray-50 dark:bg-[#0d1117] focus:outline-none focus:border-blue-500 transition"
//               placeholder="••••••••"
//             />
//           </div>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </div>

//         <p className="text-center mt-6 text-sm text-gray-500">
//           Account nahi hai?{" "}
//           <Link to="/register" className="text-blue-500 hover:underline">Sign up</Link>
//         </p>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Code2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back! 🎉");
      navigate("/review");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 bg-[#0a0a0f]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 border border-[#1e1e2e]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Code2 size={18} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Welcome back</h1>
              <p className="text-xs text-gray-500">Sign in to your account</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-400">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] text-white focus:outline-none focus:border-indigo-500 transition placeholder-gray-600"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-400">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] text-white focus:outline-none focus:border-indigo-500 transition placeholder-gray-600"
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <> Login <ArrowRight size={16} /> </>
              )}
            </motion.button>
          </div>

          <p className="text-center mt-6 text-sm text-gray-500">
            Account nahi hai?{" "}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}