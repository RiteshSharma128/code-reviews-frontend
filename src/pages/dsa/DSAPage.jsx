import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dsaAPI } from '../../services/api';
import { Code2, Search, Filter, CheckCircle, Lock } from 'lucide-react';

const CATEGORIES = ['all', 'arrays', 'strings', 'linked_list', 'trees', 'graphs', 'dynamic_programming', 'sorting', 'searching', 'hashing', 'stack_queue', 'recursion', 'greedy'];
const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];

const diffColor = { easy: 'text-green-400 bg-green-900/30 border-green-700/30', medium: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/30', hard: 'text-red-400 bg-red-900/30 border-red-700/30' };

export default function DSAPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['dsa-problems', page, difficulty, category, search],
    queryFn: () => dsaAPI.getProblems({
      page, limit: 20,
      ...(difficulty !== 'all' && { difficulty }),
      ...(category !== 'all' && { category }),
      ...(search && { search }),
    }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: stats } = useQuery({
    queryKey: ['dsa-stats'],
    queryFn: () => dsaAPI.getUserStats().then(r => r.data.stats),
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Code2 className="w-6 h-6 text-indigo-400" /> DSA Practice</h1>
          <p className="text-indigo-300 text-sm mt-1">Solve coding problems and improve your skills</p>
        </div>
        {stats && (
          <div className="flex gap-3">
            {[{ label: 'Solved', val: stats.totalSolved, color: 'text-white' }, { label: 'Easy', val: stats.easySolved, color: 'text-green-400' }, { label: 'Medium', val: stats.mediumSolved, color: 'text-yellow-400' }, { label: 'Hard', val: stats.hardSolved, color: 'text-red-400' }].map(s => (
              <div key={s.label} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-xl px-4 py-2 text-center">
                <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-indigo-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search problems..."
            className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }}
          className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize">
          {DIFFICULTIES.map(d => <option key={d} value={d} className="bg-[#1e1b4b]">{d === 'all' ? 'All Difficulties' : d}</option>)}
        </select>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
          className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1e1b4b]">{c === 'all' ? 'All Topics' : c.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Problem List */}
      <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-indigo-900/40 text-xs text-indigo-400 font-medium uppercase tracking-wide">
          <div className="col-span-1">#</div>
          <div className="col-span-6">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Status</div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>
        ) : (
          data?.problems?.map((p, i) => (
            <button key={p._id} onClick={() => navigate(`/dsa/${p.slug}`)}
              className="w-full grid grid-cols-12 px-5 py-4 border-b border-indigo-900/30 hover:bg-indigo-900/20 transition-all text-left group">
              <div className="col-span-1 text-indigo-500 text-sm">{(page - 1) * 20 + i + 1}</div>
              <div className="col-span-6">
                <p className="text-white text-sm font-medium group-hover:text-indigo-300 transition-colors">{p.title}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {p.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs text-indigo-500 bg-indigo-900/30 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                  {p.companies?.slice(0, 2).map(c => (
                    <span key={c} className="text-xs text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded capitalize">{c}</span>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex items-center">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-lg border capitalize ${diffColor[p.difficulty]}`}>{p.difficulty}</span>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="text-xs text-indigo-400 capitalize">{p.category?.replace(/_/g, ' ')}</span>
              </div>
              <div className="col-span-1 flex items-center">
                {p.isSolved ? <CheckCircle className="w-4 h-4 text-green-400" /> : <div className="w-4 h-4 rounded-full border border-indigo-700/50" />}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 rounded-xl text-sm disabled:opacity-50 hover:bg-indigo-900/50 transition-all">Prev</button>
          <span className="text-indigo-400 text-sm">Page {page} of {data.pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages}
            className="px-4 py-2 bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 rounded-xl text-sm disabled:opacity-50 hover:bg-indigo-900/50 transition-all">Next</button>
        </div>
      )}
    </div>
  );
}
