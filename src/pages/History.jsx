// import { useState } from "react";
// import { useHistory } from "../hooks/useHistory";
// import { useNavigate } from "react-router-dom";
// import { Trash2, Code2, Clock, Zap, Brain, FolderOpen, Files } from "lucide-react";
// import { motion } from "framer-motion";
// import Skeleton from "../components/Skeleton";

// export default function History() {
//   // ✅ multiReviews seedha hook se
//   const { reviews, multiReviews, loading, deleteReview } = useHistory();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("single");

//   const getScoreColor = (score) => {
//     if (score >= 80) return "text-green-400";
//     if (score >= 60) return "text-yellow-400";
//     return "text-red-400";
//   };

//   const getScoreBg = (score) => {
//     if (score >= 80) return "bg-green-500/10 border-green-500/20";
//     if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
//     return "bg-red-500/10 border-red-500/20";
//   };

//   if (loading) return (
//     <div className="max-w-4xl mx-auto px-4 py-8 space-y-3">
//       <Skeleton className="h-8 w-48 mb-6" />
//       {[1, 2, 3, 4].map((i) => (
//         <Skeleton key={i} className="h-20 w-full skeleton" />
//       ))}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#0a0a0f] px-4 py-8">
//       <div className="max-w-4xl mx-auto">

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
//           <h1 className="text-2xl md:text-3xl font-bold text-white">Review History</h1>
//           <p className="text-gray-500 mt-1 text-sm">
//             {activeTab === "single" ? reviews.length : multiReviews.length} reviews
//           </p>
//         </motion.div>

//         {/* Tabs */}
//         <div className="flex items-center gap-1 border-b border-[#1e1e2e] mb-6">
//           <button
//             onClick={() => setActiveTab("single")}
//             className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
//               activeTab === "single" ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"
//             }`}
//           >
//             <Code2 size={14} /> Single Reviews
//             <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500">{reviews.length}</span>
//           </button>
//           <button
//             onClick={() => setActiveTab("multi")}
//             className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
//               activeTab === "multi" ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"
//             }`}
//           >
//             <Files size={14} /> Multi Reviews
//             <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500">{multiReviews.length}</span>
//           </button>
//         </div>

//         {/* Single Reviews */}
//         {activeTab === "single" && (
//           <>
//             {reviews.length === 0 ? (
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
//                 <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
//                   <Code2 size={28} className="text-indigo-400 opacity-50" />
//                 </div>
//                 <p className="text-gray-500">Abhi tak koi review nahi kiya</p>
//               </motion.div>
//             ) : (
//               <motion.div
//                 initial="hidden" animate="show"
//                 variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
//                 className="space-y-3"
//               >
//                 {reviews.map((review) => (
//                   <motion.div
//                     key={review._id}
//                     variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
//                     whileHover={{ scale: 1.01 }}
//                     className="glass p-4 rounded-2xl border border-[#1e1e2e] hover:border-indigo-500/30 flex items-center justify-between cursor-pointer transition-all"
//                     onClick={() => navigate(`/review?id=${review._id}`)}
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className={`w-14 h-14 rounded-xl border flex items-center justify-center font-bold text-xl flex-shrink-0 ${getScoreBg(review.score)} ${getScoreColor(review.score)}`}>
//                         {review.score}
//                       </div>
//                       <div>
//                         <div className="font-semibold text-sm text-white mb-1">{review.title}</div>
//                         <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
//                           <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{review.language}</span>
//                           <span className="flex items-center gap-1">
//                             {review.aiEngine === "groq" ? <Zap size={10} className="text-cyan-400" /> : <Brain size={10} className="text-purple-400" />}
//                             {review.aiEngine}
//                           </span>
//                           <span className="flex items-center gap-1"><Clock size={10} />{new Date(review.createdAt).toLocaleDateString()}</span>
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={(e) => { e.stopPropagation(); deleteReview(review._id); }}
//                       className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition flex-shrink-0 ml-2"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </>
//         )}

//         {/* Multi Reviews */}
//         {activeTab === "multi" && (
//           <>
//             {multiReviews.length === 0 ? (
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
//                 <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
//                   <FolderOpen size={28} className="text-indigo-400 opacity-50" />
//                 </div>
//                 <p className="text-gray-500">Abhi tak koi multi file review nahi kiya</p>
//               </motion.div>
//             ) : (
//               <motion.div
//                 initial="hidden" animate="show"
//                 variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
//                 className="space-y-3"
//               >
//                 {multiReviews.map((review) => (
//                   <motion.div
//                     key={review._id}
//                     variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
//                     whileHover={{ scale: 1.01 }}
//                     className="glass p-4 rounded-2xl border border-[#1e1e2e] hover:border-indigo-500/30 flex items-center justify-between cursor-pointer transition-all"
//                     onClick={() => navigate("/multi-review")}
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className={`w-14 h-14 rounded-xl border flex items-center justify-center font-bold text-xl flex-shrink-0 ${getScoreBg(review.score)} ${getScoreColor(review.score)}`}>
//                         {review.score}
//                       </div>
//                       <div>
//                         <div className="font-semibold text-sm text-white mb-1 flex items-center gap-2">
//                           <FolderOpen size={13} className="text-indigo-400" />
//                           {review.title}
//                         </div>
//                         <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
//                           <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{review.language}</span>
//                           <span className="flex items-center gap-1"><Clock size={10} />{new Date(review.createdAt).toLocaleDateString()}</span>
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={(e) => { e.stopPropagation(); deleteReview(review._id); }}
//                       className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition flex-shrink-0 ml-2"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }




// import { useState } from "react";
// import { useHistory } from "../hooks/useHistory";
// import { useNavigate } from "react-router-dom";
// import { Trash2, Code2, Clock, Zap, Brain, FolderOpen, Files } from "lucide-react";
// import { motion } from "framer-motion";
// import Skeleton from "../components/Skeleton";

// export default function History() {
//   const { reviews = [], multiReviews = [], loading, deleteReview } = useHistory();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("single");

//   const getScoreColor = (score) => {
//     if (score >= 80) return "text-green-400";
//     if (score >= 60) return "text-yellow-400";
//     return "text-red-400";
//   };

//   const getScoreBg = (score) => {
//     if (score >= 80) return "bg-green-500/10 border-green-500/20";
//     if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
//     return "bg-red-500/10 border-red-500/20";
//   };

//   if (loading) return (
//     <div className="max-w-4xl mx-auto px-4 py-8 space-y-3">
//       <Skeleton className="h-8 w-48 mb-6" />
//       {[1, 2, 3, 4].map((i) => (
//         <Skeleton key={i} className="h-20 w-full skeleton" />
//       ))}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-[#0a0a0f] px-4 py-8">
//       <div className="max-w-4xl mx-auto">

//         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
//           <h1 className="text-2xl md:text-3xl font-bold text-white">Review History</h1>
//           <p className="text-gray-500 mt-1 text-sm">
//             {activeTab === "single" ? reviews.length : multiReviews.length} reviews
//           </p>
//         </motion.div>

//         {/* Tabs */}
//         <div className="flex items-center gap-1 border-b border-[#1e1e2e] mb-6">
//           <button
//             onClick={() => setActiveTab("single")}
//             className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
//               activeTab === "single" ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"
//             }`}
//           >
//             <Code2 size={14} /> Single Reviews
//             <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500">{reviews.length}</span>
//           </button>
//           <button
//             onClick={() => setActiveTab("multi")}
//             className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
//               activeTab === "multi" ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"
//             }`}
//           >
//             <Files size={14} /> Multi Reviews
//             <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500">{multiReviews.length}</span>
//           </button>
//         </div>

//         {/* Single Reviews */}
//         {activeTab === "single" && (
//           <>
//             {reviews.length === 0 ? (
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
//                 <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
//                   <Code2 size={28} className="text-indigo-400 opacity-50" />
//                 </div>
//                 <p className="text-gray-500">Abhi tak koi review nahi kiya</p>
//               </motion.div>
//             ) : (
//               <motion.div
//                 initial="hidden" animate="show"
//                 variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
//                 className="space-y-3"
//               >
//                 {reviews.map((review) => (
//                   <motion.div
//                     key={review._id}
//                     variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
//                     whileHover={{ scale: 1.01 }}
//                     className="glass p-4 rounded-2xl border border-[#1e1e2e] hover:border-indigo-500/30 flex items-center justify-between cursor-pointer transition-all"
//                     onClick={() => navigate(`/review?id=${review._id}`)}
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className={`w-14 h-14 rounded-xl border flex items-center justify-center font-bold text-xl flex-shrink-0 ${getScoreBg(review.score)} ${getScoreColor(review.score)}`}>
//                         {review.score}
//                       </div>
//                       <div>
//                         <div className="font-semibold text-sm text-white mb-1">{review.title}</div>
//                         <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
//                           <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{review.language}</span>
//                           <span className="flex items-center gap-1">
//                             {review.aiEngine === "groq" ? <Zap size={10} className="text-cyan-400" /> : <Brain size={10} className="text-purple-400" />}
//                             {review.aiEngine}
//                           </span>
//                           <span className="flex items-center gap-1"><Clock size={10} />{new Date(review.createdAt).toLocaleDateString()}</span>
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={(e) => { e.stopPropagation(); deleteReview(review._id); }}
//                       className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition flex-shrink-0 ml-2"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </>
//         )}

//         {/* Multi Reviews */}
//         {activeTab === "multi" && (
//           <>
//             {multiReviews.length === 0 ? (
//               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
//                 <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
//                   <FolderOpen size={28} className="text-indigo-400 opacity-50" />
//                 </div>
//                 <p className="text-gray-500">Abhi tak koi multi file review nahi kiya</p>
//               </motion.div>
//             ) : (
//               <motion.div
//                 initial="hidden" animate="show"
//                 variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
//                 className="space-y-3"
//               >
//                 {multiReviews.map((review) => (
//                   <motion.div
//                     key={review._id}
//                     variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
//                     whileHover={{ scale: 1.01 }}
//                     className="glass p-4 rounded-2xl border border-[#1e1e2e] hover:border-indigo-500/30 flex items-center justify-between cursor-pointer transition-all"
//                     onClick={() => navigate("/multi-review")}
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className={`w-14 h-14 rounded-xl border flex items-center justify-center font-bold text-xl flex-shrink-0 ${getScoreBg(review.score)} ${getScoreColor(review.score)}`}>
//                         {review.score}
//                       </div>
//                       <div>
//                         <div className="font-semibold text-sm text-white mb-1 flex items-center gap-2">
//                           <FolderOpen size={13} className="text-indigo-400" />
//                           {review.title}
//                         </div>
//                         <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
//                           <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{review.language}</span>
//                           <span className="flex items-center gap-1"><Clock size={10} />{new Date(review.createdAt).toLocaleDateString()}</span>
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={(e) => { e.stopPropagation(); deleteReview(review._id); }}
//                       className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition flex-shrink-0 ml-2"
//                     >
//                       <Trash2 size={15} />
//                     </button>
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { useNavigate } from "react-router-dom";
import { Trash2, Code2, Clock, Zap, Brain, FolderOpen, Files } from "lucide-react";
import { motion } from "framer-motion";
import Skeleton from "../components/Skeleton";

export default function History() {
  const { reviews = [], multiReviews = [], loading, deleteReview } = useHistory();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("single");

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-3">
      <Skeleton className="h-8 w-48 mb-6" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-20 w-full skeleton" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8">
      <div className="max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Review History</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {activeTab === "single" ? reviews.length : multiReviews.length} reviews
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-[#1e1e2e] mb-6">
          <button
            onClick={() => setActiveTab("single")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === "single" ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <Code2 size={14} /> Single Reviews
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500">{reviews.length}</span>
          </button>
          <button
            onClick={() => setActiveTab("multi")}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === "multi" ? "border-indigo-500 text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <Files size={14} /> Multi Reviews
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500">{multiReviews.length}</span>
          </button>
        </div>

        {/* Single Reviews */}
        {activeTab === "single" && (
          <>
            {reviews.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <Code2 size={28} className="text-indigo-400 opacity-50" />
                </div>
                <p className="text-gray-500">Abhi tak koi review nahi kiya</p>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden" animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
                className="space-y-3"
              >
                {reviews.map((review) => (
                  <motion.div
                    key={review._id}
                    variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                    whileHover={{ scale: 1.01 }}
                    className="glass p-4 rounded-2xl border border-[#1e1e2e] hover:border-indigo-500/30 flex items-center justify-between cursor-pointer transition-all"
                    onClick={() => navigate(`/review?id=${review._id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl border flex items-center justify-center font-bold text-xl flex-shrink-0 ${getScoreBg(review.score)} ${getScoreColor(review.score)}`}>
                        {review.score}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white mb-1">{review.title}</div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{review.language}</span>
                          <span className="flex items-center gap-1">
                            {review.aiEngine === "groq" ? <Zap size={10} className="text-cyan-400" /> : <Brain size={10} className="text-purple-400" />}
                            {review.aiEngine}
                          </span>
                          <span className="flex items-center gap-1"><Clock size={10} />{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteReview(review._id); }}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition flex-shrink-0 ml-2"
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        {/* Multi Reviews */}
        {activeTab === "multi" && (
          <>
            {multiReviews.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <FolderOpen size={28} className="text-indigo-400 opacity-50" />
                </div>
                <p className="text-gray-500">Abhi tak koi multi file review nahi kiya</p>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden" animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
                className="space-y-3"
              >
                {multiReviews.map((review) => (
                  <motion.div
                    key={review._id}
                    variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
                    whileHover={{ scale: 1.01 }}
                    className="glass p-4 rounded-2xl border border-[#1e1e2e] hover:border-indigo-500/30 flex items-center justify-between cursor-pointer transition-all"
                    // ✅ id pass karo
                    onClick={() => navigate(`/multi-review?id=${review._id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl border flex items-center justify-center font-bold text-xl flex-shrink-0 ${getScoreBg(review.score)} ${getScoreColor(review.score)}`}>
                        {review.score}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-white mb-1 flex items-center gap-2">
                          <FolderOpen size={13} className="text-indigo-400" />
                          {/* ✅ [MULTI] prefix hide karo */}
                          {review.title.replace("[MULTI] ", "")}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-400">{review.language}</span>
                          <span className="flex items-center gap-1"><Clock size={10} />{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteReview(review._id); }}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition flex-shrink-0 ml-2"
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}