import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, Plus, Copy, Check, LogIn,
  Crown, User, Trash2, BarChart2, Clock
} from "lucide-react";
import toast from "react-hot-toast";

export default function Teams() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
    try {
      const { data } = await API.get("/team/my-teams");
      setTeams(data.teams);
    } catch {
      toast.error("Teams load nahi hui");
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!teamName.trim()) { toast.error("Team name likho!"); return; }
    try {
      const { data } = await API.post("/team/create", { name: teamName, description: teamDesc });
      setTeams([...teams, data.team]);
      setShowCreate(false);
      setTeamName(""); setTeamDesc("");
      toast.success("Team create ho gayi! 🎉");
    } catch {
      toast.error("Create failed");
    }
  };

  const joinTeam = async () => {
    if (!inviteCode.trim()) { toast.error("Invite code likho!"); return; }
    try {
      const { data } = await API.post("/team/join", { inviteCode });
      setTeams([...teams, data.team]);
      setShowJoin(false);
      setInviteCode("");
      toast.success("Team join ho gayi! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.message || "Join failed");
    }
  };

  const copyInviteCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Invite code copied! 📋");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Teams</h1>
            <p className="text-gray-500 mt-1 text-sm">{teams.length} teams</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#1e1e2e] hover:border-indigo-500/50 text-gray-400 hover:text-white text-xs transition"
            >
              <LogIn size={13} /> Join Team
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
            >
              <Plus size={13} /> New Team
            </button>
          </div>
        </motion.div>

        {/* Teams List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-indigo-400 opacity-50" />
            </div>
            <p className="text-gray-500 mb-4">Koi team nahi hai</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition"
            >
              Team Banao
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl border border-[#1e1e2e] hover:border-indigo-500/30 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{team.name}</h3>
                    {team.description && (
                      <p className="text-gray-500 text-xs mt-0.5">{team.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/teams/${team._id}`)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-400 text-xs transition"
                    >
                      Open →
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {team.members?.length} members
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(team.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Members */}
                <div className="flex items-center gap-2 mt-3">
                  {team.members?.slice(0, 5).map((m, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center"
                      title={m.user?.name}
                    >
                      {m.role === "admin"
                        ? <Crown size={11} className="text-yellow-400" />
                        : <User size={11} className="text-indigo-400" />
                      }
                    </div>
                  ))}
                  {team.members?.length > 5 && (
                    <span className="text-xs text-gray-600">+{team.members.length - 5}</span>
                  )}
                </div>

                {/* Invite Code */}
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-600">Invite:</span>
                  <code className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {team.inviteCode}
                  </code>
                  <button
                    onClick={() => copyInviteCode(team.inviteCode, team._id)}
                    className="p-1 rounded hover:bg-white/5 text-gray-600 hover:text-gray-300 transition"
                  >
                    {copiedId === team._id
                      ? <Check size={12} className="text-green-400" />
                      : <Copy size={12} />
                    }
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-white font-semibold">New Team</h2>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name..."
              className="w-full px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
            />
            <textarea
              value={teamDesc}
              onChange={(e) => setTeamDesc(e.target.value)}
              placeholder="Description (optional)..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2 rounded-lg border border-[#1e1e2e] text-gray-400 text-sm transition hover:border-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={createTeam}
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition"
              >
                Create
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#111118] border border-[#1e1e2e] rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-white font-semibold">Join Team</h2>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Invite code likho..."
              className="w-full px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition font-mono tracking-widest"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowJoin(false)}
                className="flex-1 py-2 rounded-lg border border-[#1e1e2e] text-gray-400 text-sm transition hover:border-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={joinTeam}
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition"
              >
                Join
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}