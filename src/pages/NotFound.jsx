// import { Link } from "react-router-dom";
// import { Code2, Home } from "lucide-react";

// export default function NotFound() {
//   return (
//     <div className="min-h-[80vh] flex items-center justify-center text-center px-4">
//       <div>
//         <div className="text-8xl font-bold text-blue-500/20 mb-4">404</div>
//         <Code2 size={48} className="mx-auto mb-4 text-blue-500 opacity-50" />
//         <h1 className="text-2xl font-bold mb-2">Page nahi mili!</h1>
//         <p className="text-gray-500 mb-6">Yeh page exist nahi karta.</p>
//         <Link
//           to="/"
//           className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition"
//         >
//           <Home size={16} />
//           Home Jao
//         </Link>
//       </div>
//     </div>
//   );
// }




import { Link } from "react-router-dom";
import { Code2, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center text-center px-4 bg-[#0a0a0f]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-[120px] font-bold text-white/5 leading-none mb-4 select-none">
          404
        </div>
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
          <Code2 size={28} className="text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Page nahi mili!</h1>
        <p className="text-gray-500 mb-8">Yeh page exist nahi karta.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition hover:scale-105"
        >
          <ArrowLeft size={16} />
          Home Jao
        </Link>
      </motion.div>
    </div>
  );
}