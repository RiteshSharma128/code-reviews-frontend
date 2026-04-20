import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { questionAPI } from '../../services/api';
import { BookOpen, Search, Shuffle, ChevronDown, ChevronUp, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_COLORS = { behavioral:'bg-blue-900/30 text-blue-400 border-blue-700/30', technical:'bg-purple-900/30 text-purple-400 border-purple-700/30', hr:'bg-green-900/30 text-green-400 border-green-700/30', system_design:'bg-orange-900/30 text-orange-400 border-orange-700/30' };

function QuestionCard({ q }) {
  const [expanded, setExpanded] = useState(false);
  const handleUpvote = async () => { try { await questionAPI.upvote(q._id); toast.success('Upvoted!'); } catch {} };
  return (
    <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5 hover:border-indigo-700/50 transition-all">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-lg border capitalize ${TYPE_COLORS[q.type]||TYPE_COLORS.hr}`}>{q.type?.replace('_',' ')}</span>
            <span className="text-xs text-indigo-500">{q.category?.replace(/_/g,' ')}</span>
          </div>
          <p className="text-white font-medium">{q.text}</p>
          {q.keyPoints?.length > 0 && expanded && (
            <div className="mt-3 pt-3 border-t border-indigo-900/40">
              <p className="text-indigo-400 text-xs font-medium mb-2">Key points to cover:</p>
              {q.keyPoints.map((kp,i) => <p key={i} className="text-indigo-300 text-sm mb-1">• {kp}</p>)}
            </div>
          )}
          {q.expectedAnswer && expanded && (
            <div className="mt-3 pt-3 border-t border-indigo-900/40">
              <p className="text-indigo-400 text-xs font-medium mb-2">Sample Answer Framework:</p>
              <p className="text-indigo-200 text-sm leading-relaxed">{q.expectedAnswer}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleUpvote} className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs">
            <ThumbsUp className="w-3.5 h-3.5"/>{q.upvotes||0}
          </button>
          {(q.keyPoints?.length > 0 || q.expectedAnswer) && (
            <button onClick={() => setExpanded(!expanded)} className="text-indigo-400 hover:text-white transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PracticePage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['questions', page, type, interviewType, search],
    queryFn: () => questionAPI.getQuestions({ page, limit:15, ...(type&&{type}), ...(interviewType&&{interviewType}), ...(search&&{search}) }).then(r=>r.data),
    keepPreviousData: true,
  });

  const handleRandom = async () => {
    try {
      const res = await questionAPI.getRandom({ interviewType: interviewType||undefined });
      toast.success(`Random: ${res.data.question?.text?.substring(0,60)}...`);
    } catch { toast.error('Failed to get random question'); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen className="w-6 h-6 text-indigo-400"/>Question Bank</h1>
          <p className="text-indigo-300 text-sm mt-1">{data?.pagination?.total||0} questions across all categories</p>
        </div>
        <button onClick={handleRandom} className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/40 text-indigo-200 px-4 py-2 rounded-xl text-sm hover:bg-indigo-900/60 transition-all">
          <Shuffle className="w-4 h-4"/>Random Question
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search questions..."
            className="w-full bg-indigo-900/20 border border-indigo-700/40 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"/>
        </div>
        <select value={type} onChange={e=>{setType(e.target.value);setPage(1);}} className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
          <option value="">All Types</option>
          {['behavioral','technical','hr','coding','system_design'].map(t=><option key={t} value={t} className="bg-[#1e1b4b] capitalize">{t.replace('_',' ')}</option>)}
        </select>
        <select value={interviewType} onChange={e=>{setInterviewType(e.target.value);setPage(1);}} className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
          <option value="">All Roles</option>
          {['sde','hr','product_manager','data_analyst','general'].map(t=><option key={t} value={t} className="bg-[#1e1b4b] capitalize">{t.replace('_',' ')}</option>)}
        </select>
      </div>
      {isLoading ? <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"/></div>
        : <div className="space-y-3">{data?.questions?.map(q=><QuestionCard key={q._id} q={q}/>)}</div>}
      {data?.pagination?.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-4 py-2 bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 rounded-xl text-sm disabled:opacity-50">Prev</button>
          <span className="text-indigo-400 text-sm">Page {page} of {data.pagination.pages}</span>
          <button onClick={()=>setPage(p=>Math.min(data.pagination.pages,p+1))} disabled={page===data.pagination.pages} className="px-4 py-2 bg-indigo-900/30 border border-indigo-700/40 text-indigo-300 rounded-xl text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
