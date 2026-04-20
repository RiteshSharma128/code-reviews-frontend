import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI, gamificationAPI, interviewAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import {
  Mic, Code2, Trophy, Flame, Star, TrendingUp,
  Target, BookOpen, ArrowRight, Zap, Award
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, sub, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-900/30 border-indigo-700/30 text-indigo-400',
    green: 'bg-green-900/30 border-green-700/30 text-green-400',
    yellow: 'bg-yellow-900/30 border-yellow-700/30 text-yellow-400',
    purple: 'bg-purple-900/30 border-purple-700/30 text-purple-400',
  };
  return (
    <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-indigo-300 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-indigo-500 text-xs mt-1">{sub}</p>}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e1b4b] border border-indigo-700/50 rounded-xl p-3 text-xs">
      <p className="text-indigo-300 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsAPI.getDashboard().then(r => r.data),
    staleTime: 2 * 60 * 1000,
  });

  const { data: gamData } = useQuery({
    queryKey: ['gamification'],
    queryFn: () => gamificationAPI.getMyStats().then(r => r.data),
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['recent-sessions'],
    queryFn: () => interviewAPI.getSessions({ limit: 5 }).then(r => r.data),
  });

  const chartData = dashboard?.last30Days?.slice(-14).map(d => ({
    date: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    Score: Math.round(d.avg_score || 0),
    Interviews: d.interviews_done || 0,
    Problems: d.problems_solved || 0,
  })) || [];

  const quickActions = [
    { label: 'Start Mock Interview', icon: Mic, to: '/interview', color: 'bg-indigo-600 hover:bg-indigo-500', desc: 'AI-powered practice' },
    { label: 'Solve DSA Problem', icon: Code2, to: '/dsa', color: 'bg-purple-600 hover:bg-purple-500', desc: 'Coding challenges' },
    { label: 'Practice Questions', icon: BookOpen, to: '/practice', color: 'bg-blue-600 hover:bg-blue-500', desc: 'HR & Technical' },
    { label: 'AI Coach', icon: Target, to: '/coach', color: 'bg-green-600 hover:bg-green-500', desc: 'Personalized plan' },
  ];

  const hourNow = new Date().getHours();
  const greeting = hourNow < 12 ? 'morning' : hourNow < 17 ? 'afternoon' : 'evening';

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-indigo-300 text-sm mt-1">Track your progress and keep practicing</p>
        </div>
        {gamData?.gamification && (
          <div className="hidden sm:flex items-center gap-3 bg-indigo-900/30 border border-indigo-700/30 rounded-xl px-4 py-2.5">
            <Flame className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-white font-bold text-sm">{gamData.gamification.current_streak || 0} day streak</p>
              <p className="text-indigo-400 text-xs">Keep it up!</p>
            </div>
          </div>
        )}
      </div>

      {/* Level Banner */}
      {gamData?.gamification && (
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/30 border border-indigo-700/40 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-2xl">
            {['🌱', '📚', '💼', '⚡', '🚀', '🏆', '👑'][Math.min((gamData.gamification.level || 1) - 1, 6)]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white font-bold">{gamData.gamification.level_name || 'Beginner'}</p>
              <span className="text-xs text-indigo-400">Level {gamData.gamification.level || 1}</span>
            </div>
            <div className="w-full bg-indigo-900/50 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((gamData.gamification.xp_points || 0) % 500) / 5)}%` }} />
            </div>
            <p className="text-indigo-400 text-xs mt-1">{gamData.gamification.xp_points || 0} XP total</p>
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-xl">{gamData.badges?.length || 0}</p>
            <p className="text-indigo-400 text-xs">Badges</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Mic} label="Interviews Done" value={dashboard?.overview?.total_interviews || 0} sub={`Avg score: ${dashboard?.overview?.avg_score || 0}%`} color="indigo" />
        <StatCard icon={Code2} label="Problems Solved" value={dashboard?.overview?.total_problems || 0} color="purple" />
        <StatCard icon={Trophy} label="XP Points" value={gamData?.gamification?.xp_points || 0} color="yellow" />
        <StatCard icon={Flame} label="Current Streak" value={`${gamData?.gamification?.current_streak || 0}d`} sub={`Best: ${gamData?.gamification?.longest_streak || 0} days`} color="green" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(({ label, icon: Icon, to, color, desc }) => (
            <button key={to} onClick={() => navigate(to)}
              className={`${color} rounded-2xl p-4 text-left text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg`}>
              <Icon className="w-6 h-6 mb-3 opacity-90" />
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-white/70 text-xs mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Performance Trend
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: '#818cf8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#818cf8', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Score" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Weekly Activity
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData.slice(-7)}>
                <XAxis dataKey="date" tick={{ fill: '#818cf8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#818cf8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Interviews" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Problems" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Interview History */}
      {recentSessions?.sessions?.length > 0 && (
        <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-400" /> Recent Interviews
            </h3>
            <button onClick={() => navigate('/interview')} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {recentSessions.sessions.map(s => (
              <button key={s._id}
                onClick={() => navigate(s.status === 'completed' ? `/interview/result/${s._id}` : `/interview/session/${s._id}`)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-900/20 border border-indigo-800/30 rounded-xl hover:border-indigo-700/50 transition-all text-left">
                <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-700/30 rounded-lg flex items-center justify-center text-sm flex-shrink-0">🎯</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{s.title}</p>
                  <p className="text-indigo-400 text-xs">{new Date(s.createdAt).toLocaleDateString()} · {s.difficulty}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.overallScore != null && <p className="text-white font-bold text-sm">{s.overallScore}%</p>}
                  <span className={`text-xs px-2 py-0.5 rounded-lg ${s.status === 'completed' ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                    {s.status.replace('_', ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {gamData?.badges?.length > 0 && (
        <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" /> Recent Badges
            </h3>
            <button onClick={() => navigate('/leaderboard')} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {gamData.badges.slice(0, 6).map(b => (
              <div key={b.name} className="flex items-center gap-2 bg-indigo-900/30 border border-indigo-700/30 rounded-xl px-3 py-2">
                <span className="text-lg">{b.icon}</span>
                <div>
                  <p className="text-white text-xs font-medium">{b.name}</p>
                  <p className="text-indigo-400 text-xs">+{b.xp_reward} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
