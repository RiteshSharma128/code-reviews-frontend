import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import {
  Users, Crown, User, Trash2, Code2,
  Clock, Star, BarChart2, Copy, Check,
  ArrowLeft, Zap
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import toast from "react-hot-toast";

export default function TeamDetail() {
  const { API, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchAll();
    setupSocket();
    return () => socketRef.current?.disconnect();
  }, [id]);

  const setupSocket = () => {
    socketRef.current = io("http://localhost:5000");
    socketRef.current.emit("join-team", id);

    socketRef.current.on("review-completed", ({ review, userId }) => {
      toast(`🔔 New review by team member!`);
      setReviews(prev => [review, ...prev]);
    });
  };

  const fetchAll = async () => {
    try {
      const [teamRes, reviewsRes, statsRes] = await Promise.all([
        API.get(`/team/${id}`),
        API.get(`/team/${id}/reviews`),
        API.get(`/team/${id}/stats`),
      ]);
      setTeam(teamRes.data.team);
      setReviews(reviewsRes.data.reviews);
      setStats(statsRes.data.stats);
    } catch {
      toast.error("Team data load nahi hui");
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (userId) => {
    try {
      await API.delete(`/team/${id}/member/${userId}`);
      setTeam(prev => ({
        ...prev,
        members: prev.members.filter(m => m.user._id !== userId)
      }));
      toast.success("Member removed!");
    } catch {
      toast.error("Remove failed");
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(team.inviteCode);
    setCopied(true);
    toast.success("Copied! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  if (!team) return null;

  const isOwner = team.owner._id === user?._id;

  const scoreData = reviews.slice(0, 10).reverse().map((r, i) => ({
    name: i + 1,
    score: r.score,
  }));

  const langData = stats?.topLanguages?.map(l => ({
    name: l._id || "unknown",
    count: l.count,
  })) || [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/teams")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-4 transition"
          >
            <ArrowLeft size={13} /> Back to Teams
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{team.name}</h1>
              {team.description && (
                <p className="text-gray-500 text-sm mt-1">{team.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Users size={11} /> {team.members.length} members
                </span>
                <span className="text-xs text-gray-600">·</span>
                <span className="text-xs text-gray-500">
                  Invite: <code className="text-indigo-400">{team.inviteCode}</code>
                </span>
                <button
                  onClick={copyInviteCode}
                  className="p-1 rounded hover:bg-white/5 text-gray-600 hover:text-gray-300 transition"
                >
                  {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate("/review")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
            >
              <Zap size={13} /> New Review
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-[#1e1e2e]">
          {["overview", "reviews", "members"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium capitalize transition border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Code2 size={11} /> Total Reviews</p>
                <p className="text-2xl font-bold text-white">{stats.totalReviews}</p>
              </div>
              <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Star size={11} /> Avg Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}</p>
              </div>
              <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users size={11} /> Members</p>
                <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
              </div>
              <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><BarChart2 size={11} /> Languages</p>
                <p className="text-2xl font-bold text-white">{langData.length}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
                <h3 className="text-xs font-medium text-white mb-3">📈 Score Trend</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118]">
                <h3 className="text-xs font-medium text-white mb-3">🗂️ Languages</h3>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={langData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <Code2 size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Koi reviews nahi hain</p>
              </div>
            ) : (
              reviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl border border-[#1e1e2e] flex items-center justify-between cursor-pointer hover:border-indigo-500/30 transition"
                  onClick={() => navigate(`/review?id=${review._id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      review.score >= 80 ? "bg-green-500/10 border-green-500/20 text-green-400" :
                      review.score >= 60 ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                      "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      {review.score}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{review.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{review.userId?.name}</span>
                        <span>·</span>
                        <span>{review.language}</span>
                        <span>·</span>
                        <Clock size={10} />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-3">
            {team.members.map((member) => (
              <div
                key={member.user._id}
                className="p-4 rounded-xl border border-[#1e1e2e] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    {member.role === "admin"
                      ? <Crown size={14} className="text-yellow-400" />
                      : <User size={14} className="text-indigo-400" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{member.user.name}</p>
                    <p className="text-xs text-gray-500">{member.user.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    member.role === "admin"
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                  }`}>
                    {member.role}
                  </span>
                </div>

                {isOwner && member.user._id !== user?._id && (
                  <button
                    onClick={() => removeMember(member.user._id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}