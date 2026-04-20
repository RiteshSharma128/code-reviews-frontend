import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { feedbackAPI } from '../../services/api';
import { Trophy, TrendingUp, AlertCircle, CheckCircle, ArrowRight, RotateCcw, Target } from 'lucide-react';

export default function InterviewResultPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['feedback-session', sessionId],
    queryFn: () => feedbackAPI.getBySession(sessionId).then(r => r.data.feedback),
    retry: 5,
    retryDelay: 2000,
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-indigo-300">Generating your feedback...</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <AlertCircle className="w-12 h-12 text-yellow-400" />
      <p className="text-white font-semibold">Feedback is being generated</p>
      <p className="text-indigo-400 text-sm text-center">Please wait a moment and refresh</p>
      <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm">Refresh</button>
    </div>
  );

  const scoreColor = data.overallScore >= 80 ? 'text-green-400' : data.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreGrade = data.overallScore >= 80 ? 'Excellent' : data.overallScore >= 60 ? 'Good' : data.overallScore >= 40 ? 'Average' : 'Needs Work';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Interview Results</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/interview')} className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/40 text-indigo-200 px-4 py-2 rounded-xl text-sm hover:bg-indigo-900/60 transition-all">
            <RotateCcw className="w-4 h-4" /> New Interview
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/20 border border-indigo-700/40 rounded-2xl p-8 text-center">
        <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-4" />
        <p className={`text-7xl font-bold ${scoreColor} mb-2`}>{data.overallScore}</p>
        <p className="text-white text-xl font-semibold">{scoreGrade}</p>
        <p className="text-indigo-400 text-sm mt-1">{data.answeredQuestions} of {data.totalQuestions} questions answered</p>
      </div>

      {/* Score Breakdown */}
      <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-400" /> Score Breakdown</h2>
        <div className="space-y-4">
          {Object.entries(data.scores || {}).map(([key, val]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-indigo-300 capitalize">{key.replace(/([A-Z])/g,' $1').trim()}</span>
                <span className="text-white font-medium">{val}%</span>
              </div>
              <div className="h-2 bg-indigo-900/50 rounded-full">
                <div className={`h-full rounded-full transition-all ${val >= 80 ? 'bg-green-500' : val >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-[#0f0e2a]/80 border border-green-900/40 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Strengths</h2>
          {data.strengths?.length ? data.strengths.map((s, i) => (
            <p key={i} className="text-green-300 text-sm mb-1.5 flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>{s}</p>
          )) : <p className="text-indigo-400 text-sm">Keep practicing to build strengths!</p>}
        </div>
        <div className="bg-[#0f0e2a]/80 border border-yellow-900/40 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-yellow-400" /> Improve On</h2>
          {data.improvementSuggestions?.length ? data.improvementSuggestions.slice(0,4).map((s, i) => (
            <p key={i} className="text-yellow-300 text-sm mb-1.5 flex items-start gap-2"><span className="text-yellow-500 mt-0.5">→</span>{s}</p>
          )) : <p className="text-indigo-400 text-sm">Great job! Keep it up.</p>}
        </div>
      </div>

      {/* Per-Answer Feedback */}
      <div className="space-y-4">
        <h2 className="text-white font-semibold">Answer-by-Answer Feedback</h2>
        {data.answerFeedbacks?.map((af, i) => (
          <div key={i} className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-4">
                <p className="text-xs text-indigo-400 mb-1">Q{i+1}</p>
                <p className="text-white text-sm font-medium">{af.questionText}</p>
              </div>
              <div className={`text-2xl font-bold ${af.scores?.overall >= 80 ? 'text-green-400' : af.scores?.overall >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{af.scores?.overall}</div>
            </div>
            {af.userAnswer && <p className="text-indigo-300 text-xs bg-indigo-900/20 rounded-xl p-3 mb-3 line-clamp-3">{af.userAnswer}</p>}
            {af.improvements?.length > 0 && af.improvements.map((imp, j) => (
              <p key={j} className="text-yellow-300 text-xs mb-1">→ {imp}</p>
            ))}
            {af.fillerWordCount > 0 && <p className="text-red-400 text-xs mt-2">⚠ {af.fillerWordCount} filler words detected</p>}
          </div>
        ))}
      </div>

      <button onClick={() => navigate('/interview')} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all">
        Practice Again <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
