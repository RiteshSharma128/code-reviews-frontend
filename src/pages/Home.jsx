// import { Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { Zap, Shield, GitBranch, Brain } from "lucide-react";
// import { motion } from "framer-motion";

// const features = [
//   { icon: <Brain size={22} />, title: "Multi-AI Engine", desc: "Groq & Claude powered reviews" },
//   { icon: <Zap size={22} />, title: "Instant Review", desc: "Get results in seconds" },
//   { icon: <Shield size={22} />, title: "Security Check", desc: "Detect vulnerabilities" },
//   { icon: <GitBranch size={22} />, title: "20+ Languages", desc: "All major languages supported" },
// ];

// export default function Home() {
//   const { user } = useAuth();

//   return (
//     <div className="max-w-5xl mx-auto px-4 py-20 text-center">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm mb-6">
//           <Zap size={14} /> AI-Powered Code Reviews
//         </div>

//         <h1 className="text-5xl font-bold mb-6 leading-tight">
//           Review Code Like a{" "}
//           <span className="text-blue-500">Senior Engineer</span>
//         </h1>

//         <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
//           Paste your code and get instant AI-powered reviews with bug detection,
//           best practices, security checks, and quality scores.
//         </p>

//         <Link
//           to={user ? "/review" : "/register"}
//           className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg transition"
//         >
//           <Zap size={20} />
//           {user ? "Start Reviewing" : "Get Started Free"}
//         </Link>
//       </motion.div>

//       {/* Features */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
//         {features.map((f, i) => (
//           <motion.div
//             key={i}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: i * 0.1 + 0.3 }}
//             className="p-5 rounded-xl border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] text-left"
//           >
//             <div className="text-blue-500 mb-3">{f.icon}</div>
//             <div className="font-semibold text-sm mb-1">{f.title}</div>
//             <div className="text-xs text-gray-500">{f.desc}</div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }





import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Zap, Shield, GitBranch, Brain, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: <Brain size={20} />, title: "Multi-AI Engine", desc: "Groq & Claude powered reviews", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  { icon: <Zap size={20} />, title: "Instant Review", desc: "Get results in seconds", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { icon: <Shield size={20} />, title: "Security Check", desc: "Detect vulnerabilities", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { icon: <GitBranch size={20} />, title: "20+ Languages", desc: "All major languages", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
};

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-32 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-sm mb-8"
        >
          <Sparkles size={14} />
          AI-Powered Code Reviews
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white"
        >
          Review Code Like a{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Senior Engineer
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Paste your code and get instant AI-powered reviews with bug detection,
          best practices, security checks, and quality scores.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to={user ? "/review" : "/register"}
            className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            <Zap size={20} />
            {user ? "Start Reviewing" : "Get Started Free"}
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          {!user && (
            <Link
              to="/login"
              className="px-8 py-4 rounded-xl border border-[#1e1e2e] hover:border-indigo-500/50 text-gray-400 hover:text-white font-medium text-lg transition-all"
            >
              Sign In
            </Link>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={stagger.item}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`p-5 rounded-2xl border glass text-left cursor-default transition-all ${f.bg}`}
            >
              <div className={`mb-3 ${f.color}`}>{f.icon}</div>
              <div className="font-semibold text-sm text-white mb-1">{f.title}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-8 mt-20 text-center"
        >
          {[["20+", "Languages"], ["2", "AI Engines"], ["100%", "Free to start"]].map(([num, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold text-white">{num}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}