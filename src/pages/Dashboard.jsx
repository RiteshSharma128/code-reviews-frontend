import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Code2, Star, Zap, Trophy, Flame,
  AlertTriangle, Info, XCircle, TrendingUp
} from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e"];

export default function Dashboard() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get("/dashboard/stats");
      setStats(data.stats);
    } catch {
      toast.error("Stats load nahi hui");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  if (!stats) return null;

  const scoreData = stats.scoreOverTime.map((r) => ({
    name: r.title?.slice(0, 10) || "Review",
    score: r.score,
    date: new Date(r.createdAt).toLocaleDateString(),
  }));

  const issueData = stats.issueBreakdown.map((i) => ({
    name: i._id,
    value: i.count,
  }));

  const langData = stats.languageBreakdown.map((l) => ({
    name: l._id || "unknown",
    count: l.count,
  }));

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/30";
    if (score >= 60) return "bg-yellow-500/10 border-yellow-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Tera code review ka overview</p>
          </div>
          <button
            onClick={() => navigate("/review")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
          >
            <Zap size={14} /> New Review
          </button>
        </motion.div>

        {/* ============================
            STAT CARDS
        ============================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {/* Total Reviews */}
          <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118] space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Code2 size={14} className="text-indigo-400" />
              Total Reviews
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalReviews}</div>
          </div>

          {/* Average Score */}
          <div className={`p-4 rounded-xl border ${getScoreBg(stats.avgScore)} space-y-2`}>
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Star size={14} className="text-yellow-400" />
              Avg Score
            </div>
            <div className={`text-3xl font-bold ${getScoreColor(stats.avgScore)}`}>
              {stats.avgScore}
            </div>
          </div>

          {/* Best Score */}
          <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118] space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Trophy size={14} className="text-yellow-400" />
              Best Score
            </div>
            <div className="text-3xl font-bold text-green-400">
              {stats.bestReview?.score || 0}
            </div>
            <div className="text-xs text-gray-600 truncate">
              {stats.bestReview?.title || "—"}
            </div>
          </div>

          {/* Streak */}
          <div className="p-4 rounded-xl border border-[#1e1e2e] bg-[#111118] space-y-2">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Flame size={14} className="text-orange-400" />
              Streak
            </div>
            <div className="text-3xl font-bold text-orange-400">
              {stats.streak} 🔥
            </div>
            <div className="text-xs text-gray-600">days</div>
          </div>
        </motion.div>

        {/* ============================
            SCORE OVER TIME
        ============================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-xl border border-[#1e1e2e] bg-[#111118]"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">📈 Score Over Time</h2>
          </div>
          {scoreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8 }}
                  labelStyle={{ color: "#9ca3af" }}
                  itemStyle={{ color: "#6366f1" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-600 text-sm">
              Abhi tak koi review nahi kiya
            </div>
          )}
        </motion.div>

        {/* ============================
            LANGUAGE + ISSUES
        ============================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Language Breakdown */}
          <div className="p-5 rounded-xl border border-[#1e1e2e] bg-[#111118]">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={16} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">🗂️ Languages Used</h2>
            </div>
            {langData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={langData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <Tooltip
                    contentStyle={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 8 }}
                    itemStyle={{ color: "#22d3ee" }}
                  />
                  <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-gray-600 text-sm">
                No data yet
              </div>
            )}
          </div>

          {/* Issue Breakdown */}
          <div className="p-5 rounded-xl border border-[#1e1e2e] bg-[#111118]">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-yellow-400" />
              <h2 className="text-sm font-semibold text-white">🚨 Issue Breakdown</h2>
            </div>
            {issueData.length > 0 ? (
              <div className="space-y-3">
                {issueData.map((issue, i) => {
                  const total = issueData.reduce((a, b) => a + b.value, 0);
                  const pct = ((issue.value / total) * 100).toFixed(0);
                  const color =
                    issue.name === "critical" ? "bg-red-500" :
                    issue.name === "warning" ? "bg-yellow-500" : "bg-blue-500";
                  const icon =
                    issue.name === "critical" ? <XCircle size={12} className="text-red-400" /> :
                    issue.name === "warning" ? <AlertTriangle size={12} className="text-yellow-400" /> :
                    <Info size={12} className="text-blue-400" />;

                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-gray-400 capitalize">
                          {icon} {issue.name}
                        </span>
                        <span className="text-gray-500">{issue.value} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#1e1e2e]">
                        <div
                          className={`h-1.5 rounded-full ${color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-gray-600 text-sm">
                No issues found
              </div>
            )}
          </div>
        </motion.div>

        {/* ============================
            BEST REVIEWED CODE
        ============================ */}
        {stats.bestReview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 cursor-pointer hover:border-yellow-500/40 transition"
            onClick={() => navigate(`/review?id=${stats.bestReview._id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                <Trophy size={20} className="text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-yellow-400 font-medium mb-0.5">🏆 Best Reviewed Code</p>
                <p className="text-white font-semibold text-sm">{stats.bestReview.title}</p>
                <p className="text-xs text-gray-500">
                  Score: <span className="text-green-400 font-bold">{stats.bestReview.score}</span>
                  {" · "}{stats.bestReview.language}
                  {" · "}{new Date(stats.bestReview.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}