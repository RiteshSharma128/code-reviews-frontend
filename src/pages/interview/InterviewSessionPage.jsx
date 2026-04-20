import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewAPI } from '../../services/api';
import { Clock, Send, ChevronRight, AlertTriangle, Zap } from 'lucide-react';
import AICopilot from '../../components/interview/AICopilot';
import toast from 'react-hot-toast';

export default function InterviewSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionNum, setQuestionNum] = useState(1);
  const [totalQ, setTotalQ] = useState(5);
  const [currentQ, setCurrentQ] = useState(null);
  const [showAbandon, setShowAbandon] = useState(false);
  const [showCopilot, setShowCopilot] = useState(true);
  const textareaRef = useRef(null);
  const timerRef = useRef(null);

  // const { data: session, isLoading } = useQuery({
  //   queryKey: ['session', sessionId],
  //   queryFn: () => interviewAPI.getSession(sessionId).then(r => r.data.session),
  //   onSuccess: (s) => {
  //     setTotalQ(s.totalQuestions);
  //     setQuestionNum((s.currentQuestionIndex || 0) + 1);
  //     setCurrentQ(s.questions?.[s.currentQuestionIndex || 0]);
  //     if (s.timeLimit) setTimeLeft(s.timeLimit * 60);
  //   },
  // });


  const { data: session, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => interviewAPI.getSession(sessionId).then(r => r.data.session),
  });
  
  useEffect(() => {
    if (!session) return;
    setTotalQ(session.totalQuestions || 5);
    setQuestionNum((session.currentQuestionIndex || 0) + 1);
    setCurrentQ(session.questions?.[session.currentQuestionIndex || 0]);
    if (session.timeLimit) setTimeLeft(session.timeLimit * 60);
  }, [session?._id]);

  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); toast.error("Time's up!"); navigate(`/interview/result/${sessionId}`); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null]);

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const handleSubmit = async () => {
    if (!answer.trim()) { toast.error('Please write an answer'); return; }
    setSubmitting(true);
    try {
      const res = await interviewAPI.submitAnswer(sessionId, {
        answerText: answer.trim(),
        timeTaken: session?.timeLimit ? (session.timeLimit * 60 - (timeLeft || 0)) : 0,
      });
      setAnswer('');
      if (res.data.isCompleted) {
        clearInterval(timerRef.current);
        toast.success('Interview completed! Generating feedback...');
        navigate(`/interview/result/${sessionId}`);
      } else {
        setCurrentQ(res.data.nextQuestion);
        setQuestionNum(q => q + 1);
        textareaRef.current?.focus();
      }
    } catch { toast.error('Failed to submit answer'); }
    finally { setSubmitting(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" /></div>;

  const progress = ((questionNum - 1) / totalQ) * 100;

  return (
    <div className="flex flex-col h-full bg-[#080719]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0f0e2a] border-b border-indigo-900/40">
        <div>
          <p className="text-white font-semibold text-sm">Question {questionNum} of {totalQ}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-32 h-1.5 bg-indigo-900/60 rounded-full">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-indigo-400 text-xs">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCopilot(c => !c)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${showCopilot ? 'bg-yellow-900/30 border-yellow-700/40 text-yellow-400' : 'bg-indigo-900/30 border-indigo-700/40 text-indigo-400 hover:text-white'}`}>
            <Zap className="w-3.5 h-3.5" />AI Copilot
          </button>
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold ${timeLeft < 120 ? 'bg-red-900/30 border-red-700/40 text-red-400' : 'bg-indigo-900/30 border-indigo-700/40 text-white'}`}>
              <Clock className="w-4 h-4" />{fmt(timeLeft)}
            </div>
          )}
          <button onClick={() => setShowAbandon(true)} className="text-indigo-400 hover:text-red-400 text-sm">End</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {currentQ && (
            <div className="bg-[#0f0e2a]/90 border border-indigo-700/40 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">{questionNum}</span>
                <span className="text-xs text-indigo-400 capitalize px-2 py-0.5 bg-indigo-900/40 rounded-lg border border-indigo-700/30">{currentQ.type?.replace('_',' ')}</span>
                <span className="text-xs text-indigo-400 capitalize px-2 py-0.5 bg-indigo-900/40 rounded-lg border border-indigo-700/30">{currentQ.difficulty}</span>
              </div>
              <p className="text-white text-lg leading-relaxed">{currentQ.text}</p>
              {currentQ.followUps?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-indigo-900/40">
                  <p className="text-indigo-400 text-xs font-medium mb-2">💡 Think about:</p>
                  {currentQ.followUps.map((f,i) => <p key={i} className="text-indigo-300 text-sm">• {f}</p>)}
                </div>
              )}
            </div>
          )}

          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-indigo-200 text-sm font-medium">Your Answer</label>
              <span className="text-indigo-500 text-xs">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea ref={textareaRef} value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here... Be specific and use examples." rows={10} autoFocus
              className="w-full bg-transparent text-white placeholder-indigo-400/50 focus:outline-none resize-none text-sm leading-relaxed"
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleSubmit(); }} />
            <div className="flex items-center justify-between pt-3 border-t border-indigo-900/40 mt-3">
              <p className="text-indigo-500 text-xs">Ctrl+Enter to submit</p>
              <button onClick={handleSubmit} disabled={submitting || !answer.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                {questionNum === totalQ ? 'Finish Interview' : 'Next Question'}
                {!submitting && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCopilot && <AICopilot questionType={currentQ?.type || 'behavioral'} answer={answer} isVisible={showCopilot} onClose={() => setShowCopilot(false)} />}

      {showAbandon && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0e2a] border border-indigo-700/50 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4"><AlertTriangle className="w-6 h-6 text-yellow-400" /><h3 className="text-white font-semibold">End Interview?</h3></div>
            <p className="text-indigo-300 text-sm mb-6">You have answered {questionNum - 1} of {totalQ} questions.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowAbandon(false)} className="flex-1 py-2.5 border border-indigo-700/50 text-indigo-300 rounded-xl text-sm hover:bg-indigo-900/30">Continue</button>
              <button onClick={async () => { await interviewAPI.abandonSession(sessionId).catch(()=>{}); navigate('/interview'); }} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm">End</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
