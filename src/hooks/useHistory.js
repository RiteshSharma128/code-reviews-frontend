// import { useState, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import toast from "react-hot-toast";

// const codeExtensions = [
//   ".js", ".jsx", ".ts", ".tsx", ".py", ".java",
//   ".cpp", ".c", ".cs", ".go", ".rs", ".php",
//   ".rb", ".kt", ".swift", ".sh", ".html", ".css"
// ];

// const isMultiReview = (title) => {
//   if (!title) return false;
//   const t = title.toLowerCase();
//   return codeExtensions.some(ext => t.includes(ext));
// };

// export const useHistory = () => {
//   const { API } = useAuth();
//   const [reviews, setReviews] = useState([]);
//   const [multiReviews, setMultiReviews] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   const fetchHistory = async () => {
//     try {
//       const { data } = await API.get("/history?limit=100");
//       const all = data.reviews || [];
      
//       // DEBUG
//       console.log("All titles:", all.map(r => r.title));
      
//       setReviews(all.filter(r => !isMultiReview(r.title)));
//       setMultiReviews(all.filter(r => isMultiReview(r.title)));
//     } catch {
//       toast.error("History load nahi hui");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteReview = async (id) => {
//     try {
//       await API.delete(`/history/${id}`);
//       setReviews(prev => prev.filter(r => r._id !== id));
//       setMultiReviews(prev => prev.filter(r => r._id !== id));
//       toast.success("Deleted!");
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   return { reviews, multiReviews, loading, deleteReview };
// };


import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ✅ [MULTI] prefix se check karo
const isMultiReview = (title) => {
  if (!title) return false;
  return title.startsWith("[MULTI]");
};

export const useHistory = () => {
  const { API } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [multiReviews, setMultiReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await API.get("/history?limit=100");
      const all = data.reviews || [];
      setReviews(all.filter(r => !isMultiReview(r.title)));
      setMultiReviews(all.filter(r => isMultiReview(r.title)));
    } catch {
      toast.error("History load nahi hui");
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id) => {
    try {
      await API.delete(`/history/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
      setMultiReviews(prev => prev.filter(r => r._id !== id));
      toast.success("Deleted!");
    } catch {
      toast.error("Delete failed");
    }
  };

  return { reviews, multiReviews, loading, deleteReview };
};