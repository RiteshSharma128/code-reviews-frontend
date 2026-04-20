import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { gamificationAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { Trophy, Flame, Medal } from 'lucide-react';

const RANK_BADGES = { 1: '🥇', 2: '🥈', 3: '🥉' };
const LEVEL_ICONS = ['🌱','📚','💼','⚡','🚀','🏆','👑'];

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState('all_time');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => gamificationAPI.getLeaderboard(period).then(r => r.data),
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-400"/>Leaderboard</h1>
        <p className="text-indigo-300 text-sm mt-1">Top performers in the community</p>
      </div>

      <div className="flex gap-1 bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-1 w-fit">
        {[{id:'weekly',label:'This Week'},{id:'monthly',label:'This Month'},{id:'all_time',label:'All Time'}].map(p=>(
          <button key={p.id} onClick={()=>setPeriod(p.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period===p.id?'bg-indigo-600 text-white':'text-indigo-300 hover:text-white'}`}>{p.label}</button>
        ))}
      </div>

      {isLoading ? <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div> : (
        <div className="space-y-2">
          {data?.leaderboard?.map((entry, i) => {
            const isMe = entry.id === user?.id;
            const rank = i + 1;
            return (
              <div key={entry.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isMe ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-[#0f0e2a]/80 border-indigo-900/40 hover:border-indigo-800/60'}`}>
                <div className="w-8 text-center flex-shrink-0">
                  {RANK_BADGES[rank] ? <span className="text-xl">{RANK_BADGES[rank]}</span> : <span className="text-indigo-400 font-bold text-sm">#{rank}</span>}
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-700/30 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {entry.avatar_url ? <img src={entry.avatar_url} alt="" className="w-full h-full rounded-xl object-cover"/> : (entry.name?.[0]||'U').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${isMe ? 'text-indigo-300' : 'text-white'}`}>{entry.name} {isMe && '(You)'}</p>
                    <span className="text-sm">{LEVEL_ICONS[Math.min((entry.level||1)-1,6)]}</span>
                  </div>
                  <p className="text-indigo-400 text-xs">{entry.level_name} · {entry.current_streak || 0} day streak <Flame className="w-3 h-3 text-orange-400 inline"/></p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold">{entry.xp?.toLocaleString()}</p>
                  <p className="text-indigo-400 text-xs">XP</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
