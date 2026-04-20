import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewAPI } from '../../services/api';
import { Mic, Clock, Target, Building2, ChevronRight, Play, MessageSquare, Video, PenTool, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const INTERVIEW_TYPES = [
  { id: 'sde', label: 'Software Engineer', icon: '👨‍💻', desc: 'DSA, System Design, CS Fundamentals' },
  { id: 'hr', label: 'HR Interview', icon: '🤝', desc: 'Behavioral, Situational, Culture Fit' },
  { id: 'product_manager', label: 'Product Manager', icon: '📱', desc: 'Product Sense, Metrics, Strategy' },
  { id: 'data_analyst', label: 'Data Analyst', icon: '📊', desc: 'SQL, Statistics, Data Interpretation' },
  { id: 'full_stack', label: 'Full Stack Dev', icon: '🌐', desc: 'Frontend + Backend + System Design' },
  { id: 'system_design', label: 'System Design', icon: '🏗️', desc: 'Architecture, Scalability, Trade-offs' },
];

const MODES = [
  { id: 'text', label: 'Text', icon: MessageSquare, desc: 'Type your answers', color: 'bg-indigo-600' },
  { id: 'voice', label: 'Voice', icon: Mic, desc: 'Speak your answers', color: 'bg-purple-600' },
  { id: 'video', label: 'Video', icon: Video, desc: 'Webcam + answers', color: 'bg-blue-600' },
  { id: 'whiteboard', label: 'Whiteboard', icon: PenTool, desc: 'Draw + explain', color: 'bg-green-600' },
  { id: 'peer', label: 'Peer Practice', icon: Users, desc: 'Practice with a friend', color: 'bg-orange-600' },
];

const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Flipkart', 'Razorpay', 'Swiggy', 'Zomato', 'Paytm', 'Atlassian', 'Adobe'];

export default function InterviewPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    interviewType: 'sde',
    mode: 'text',
    difficulty: 'medium',
    targetCompany: '',
    totalQuestions: 5,
    timeLimit: 60,
  });
  const [starting, setStarting] = useState(false);
  const [tab, setTab] = useState('new');

  const { data: sessionsData } = useQuery({
    queryKey: ['interview-sessions'],
    queryFn: () => interviewAPI.getSessions({ limit: 10 }).then(r => r.data),
    enabled: tab === 'history',
  });

  const handleStart = async () => {
    // Peer mode — no session needed, just create room
    if (config.mode === 'peer') {
      const roomId = uuidv4().slice(0, 8);
      navigate(`/interview/peer/${roomId}`);
      return;
    }

    setStarting(true);
    try {
      const res = await interviewAPI.createSession(config);
      const sessionId = res.data.session.id;
      await interviewAPI.startSession(sessionId);

      const routes = {
        text: `/interview/session/${sessionId}`,
        voice: `/interview/voice/${sessionId}`,
        video: `/interview/video/${sessionId}`,
        whiteboard: `/interview/whiteboard/${sessionId}`,
      };
      navigate(routes[config.mode] || routes.text);
    } catch (err) {
      toast.error('Failed to start interview session');
      setStarting(false);
    }
  };

  const set = (key, val) => setConfig(p => ({ ...p, [key]: val }));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Mic className="w-6 h-6 text-indigo-400" /> Mock Interview</h1>
        <p className="text-indigo-300 text-sm mt-1">AI-powered interview practice with real-time feedback</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-1 w-fit">
        {[{ id: 'new', label: '+ New Interview' }, { id: 'history', label: '📋 History' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'new' ? (
        <div className="space-y-6">
          {/* Interview Mode */}
          <div>
            <h2 className="text-white font-semibold mb-3">Interview Mode</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {MODES.map(m => (
                <button key={m.id} onClick={() => set('mode', m.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${config.mode === m.id ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-900/30' : 'bg-[#0f0e2a]/60 border-indigo-900/40 hover:border-indigo-700/60'}`}>
                  <div className={`w-8 h-8 ${m.color} rounded-xl flex items-center justify-center mb-2`}>
                    <m.icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-white text-sm font-medium">{m.label}</p>
                  <p className="text-indigo-400 text-xs mt-0.5">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Peer mode info */}
          {config.mode === 'peer' && (
            <div className="bg-orange-900/10 border border-orange-700/30 rounded-2xl p-4">
              <p className="text-orange-300 text-sm font-medium mb-1">👥 Peer Practice Mode</p>
              <p className="text-orange-200/70 text-sm">A unique room will be created. Share the link with a friend to practice together. One person is the interviewer, one is the candidate.</p>
            </div>
          )}

          {config.mode !== 'peer' && (
            <>
              {/* Interview Type */}
              <div>
                <h2 className="text-white font-semibold mb-3">Interview Type</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INTERVIEW_TYPES.map(type => (
                    <button key={type.id} onClick={() => set('interviewType', type.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${config.interviewType === type.id ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-900/30' : 'bg-[#0f0e2a]/60 border-indigo-900/40 hover:border-indigo-700/60'}`}>
                      <span className="text-2xl mb-2 block">{type.icon}</span>
                      <p className="text-white text-sm font-medium">{type.label}</p>
                      <p className="text-indigo-400 text-xs mt-0.5">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Difficulty */}
                <div>
                  <h2 className="text-white font-semibold mb-3">Difficulty</h2>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map(d => (
                      <button key={d} onClick={() => set('difficulty', d)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border capitalize transition-all ${config.difficulty === d
                          ? { easy: 'bg-green-600 border-green-500 text-white', medium: 'bg-yellow-600 border-yellow-500 text-white', hard: 'bg-red-600 border-red-500 text-white' }[d]
                          : 'bg-indigo-900/20 border-indigo-700/40 text-indigo-300 hover:border-indigo-600'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div>
                  <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-indigo-400" /> Questions: {config.totalQuestions}</h2>
                  <input type="range" min="3" max="10" value={config.totalQuestions} onChange={e => set('totalQuestions', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-indigo-500 text-xs mt-1"><span>3</span><span>10</span></div>
                </div>

                {/* Time */}
                <div>
                  <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-400" /> Time: {config.timeLimit} min</h2>
                  <input type="range" min="15" max="120" step="15" value={config.timeLimit} onChange={e => set('timeLimit', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                  <div className="flex justify-between text-indigo-500 text-xs mt-1"><span>15m</span><span>120m</span></div>
                </div>

                {/* Company */}
                <div>
                  <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-400" /> Target Company</h2>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => set('targetCompany', '')}
                      className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${!config.targetCompany ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-900/20 border-indigo-700/40 text-indigo-300 hover:border-indigo-600'}`}>
                      Any
                    </button>
                    {COMPANIES.map(c => (
                      <button key={c} onClick={() => set('targetCompany', c)}
                        className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${config.targetCompany === c ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-indigo-900/20 border-indigo-700/40 text-indigo-300 hover:border-indigo-600'}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <button onClick={handleStart} disabled={starting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all text-lg">
            {starting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-5 h-5" />}
            {starting ? 'Starting...' : config.mode === 'peer' ? 'Create Peer Room' : 'Start Interview'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessionsData?.sessions?.length === 0 && (
            <div className="text-center py-12 text-indigo-400">No interviews yet. Start your first one!</div>
          )}
          {sessionsData?.sessions?.map(s => (
            <button key={s._id}
              onClick={() => s.status === 'completed' ? navigate(`/interview/result/${s._id}`) : navigate(`/interview/session/${s._id}`)}
              className="w-full bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-600/50 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-900/40 flex items-center justify-center text-xl flex-shrink-0">
                {INTERVIEW_TYPES.find(t => t.id === s.interviewType)?.icon || '🎯'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{s.title}</p>
                <p className="text-indigo-400 text-xs">{new Date(s.createdAt).toLocaleDateString()} · {s.difficulty} · {s.totalQuestions}Q</p>
              </div>
              <div className="text-right flex-shrink-0">
                {s.overallScore != null && <p className="text-white font-bold">{s.overallScore}%</p>}
                <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${s.status === 'completed' ? 'bg-green-900/40 text-green-400' : s.status === 'in_progress' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-indigo-900/40 text-indigo-400'}`}>
                  {s.status.replace('_', ' ')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
