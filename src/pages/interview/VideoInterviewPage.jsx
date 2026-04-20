import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewAPI } from '../../services/api';
import { Video, VideoOff, Mic, MicOff, Clock, Phone, ChevronRight, Camera, AlertCircle } from 'lucide-react';
import FaceAnalysis, { useFaceAnalysisSession } from '../../components/interview/FaceAnalysis';
import toast from 'react-hot-toast';

export default function VideoInterviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { recordExpression, getSessionSummary } = useFaceAnalysisSession();
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [stream, setStream] = useState(null);
  const [answer, setAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNum, setQuestionNum] = useState(1);
  const [totalQ, setTotalQ] = useState(5);
  const [timeLeft, setTimeLeft] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState('setup'); // setup | interview | done

  const videoRef = useRef(null);
  const timerRef = useRef(null);

  // Camera setup
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setPhase('interview');
    } catch (err) {
      if (err.name === 'NotAllowedError') setPermissionError('Camera/microphone access denied. Please allow in browser settings.');
      else if (err.name === 'NotFoundError') setPermissionError('No camera found. Please connect a camera and try again.');
      else setPermissionError('Could not access camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
  };

  const toggleVideo = () => {
    stream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setVideoEnabled(v => !v);
  };

  const toggleMic = () => {
    stream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicEnabled(m => !m);
  };

  useEffect(() => () => stopCamera(), []);

  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => interviewAPI.getSession(sessionId).then(r => r.data.session),
    onSuccess: (s) => {
      setTotalQ(s.totalQuestions);
      setQuestionNum((s.currentQuestionIndex || 0) + 1);
      setCurrentQuestion(s.questions?.[s.currentQuestionIndex || 0]);
      setTimeLeft(s.timeLimit ? s.timeLimit * 60 : 3600);
    },
    // enabled: phase === 'interview',
    enabled: true,
  });

  useEffect(() => {
    if (timeLeft === null || phase !== 'interview') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleEnd(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null, phase]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSubmit = async () => {
    if (!answer.trim()) { toast.error('Please write your answer'); return; }
    setSubmitting(true);
    try {
      const res = await interviewAPI.submitAnswer(sessionId, {
        answerText: answer.trim(),
        timeTaken: session?.timeLimit ? (session.timeLimit * 60 - timeLeft) : 0,
      });
      setAnswer('');
      if (res.data.isCompleted) {
        clearInterval(timerRef.current);
        setPhase('done');
        stopCamera();
        toast.success('Interview complete!');
        setTimeout(() => navigate(`/interview/result/${sessionId}`), 2000);
      } else {
        setCurrentQuestion(res.data.nextQuestion);
        setQuestionNum(q => q + 1);
      }
    } catch { toast.error('Submission failed'); }
    finally { setSubmitting(false); }
  };

  const handleEnd = async () => {
    stopCamera();
    clearInterval(timerRef.current);
    await interviewAPI.abandonSession(sessionId).catch(() => {});
    navigate(`/interview/result/${sessionId}`);
  };

  // Setup Screen
  if (phase === 'setup') return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Video className="w-6 h-6 text-indigo-400" /> Video Interview</h1>
          <p className="text-indigo-300 text-sm mt-1">Check your camera and microphone before starting</p>
        </div>

        {permissionError ? (
          <div className="bg-red-900/20 border border-red-700/40 rounded-2xl p-5 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 text-sm font-medium">Permission Error</p>
              <p className="text-red-400 text-sm mt-1">{permissionError}</p>
            </div>
          </div>
        ) : (
          <div className="bg-[#0f0e2a] border border-indigo-900/40 rounded-2xl p-8 text-center">
            <Camera className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">Camera Preview</p>
            <p className="text-indigo-400 text-sm">Click below to enable camera and start interview</p>
          </div>
        )}

        <div className="space-y-3">
          {[
            { icon: '📷', label: 'Camera working', desc: 'Your face will be visible during the interview' },
            { icon: '🎙️', label: 'Microphone enabled', desc: 'Speak clearly for best experience' },
            { icon: '💡', label: 'Good lighting', desc: 'Ensure your face is well lit' },
            { icon: '🔇', label: 'Quiet environment', desc: 'Minimize background noise' },
          ].map((tip, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-indigo-900/20 border border-indigo-800/30 rounded-xl">
              <span className="text-lg">{tip.icon}</span>
              <div>
                <p className="text-white text-sm font-medium">{tip.label}</p>
                <p className="text-indigo-400 text-xs">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={startCamera} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 text-lg transition-all">
          <Video className="w-5 h-5" /> Start Video Interview
        </button>
        <button onClick={() => navigate('/interview')} className="w-full text-center text-indigo-400 hover:text-white text-sm py-2 transition-colors">
          Go back
        </button>
      </div>
    </div>
  );

  if (phase === 'done') return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-900/30 border border-green-700/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-white text-xl font-bold">Interview Complete!</p>
        <p className="text-indigo-300 text-sm mt-2">Redirecting to results...</p>
      </div>
    </div>
  );

  // Interview Screen
  return (
    <div className="flex h-full overflow-hidden bg-[#080719]">
      {/* Left - Video */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-black border-r border-indigo-900/40">
        {/* Self Video */}
        <div className="relative flex-1 bg-gray-900">
          <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`} />
          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-white text-2xl font-bold">
                {session?.userId?.[0]?.toUpperCase() || 'Y'}
              </div>
            </div>
          )}
          <div className="absolute bottom-3 left-3 text-white text-xs bg-black/50 px-2 py-1 rounded-lg">You</div>
        </div>

        {/* AI Interviewer placeholder */}
        <div className="h-32 bg-indigo-900/20 border-t border-indigo-900/40 flex items-center justify-center relative">
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">AI</div>
          <div className="absolute bottom-2 left-3 text-indigo-300 text-xs">AI Interviewer</div>
        </div>

        {/* Face Analysis Panel */}
        <div className="p-3 border-t border-indigo-900/40 overflow-y-auto" style={{ maxHeight: '200px' }}>
          <FaceAnalysis
            videoRef={videoRef}
            onAnalysisUpdate={recordExpression}
            isActive={phase === 'interview' && videoEnabled}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 p-4 bg-[#0f0e2a] border-t border-indigo-900/40">
          <button onClick={toggleVideo} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${videoEnabled ? 'bg-indigo-900/40 border border-indigo-700/40 text-indigo-300 hover:bg-indigo-900/60' : 'bg-red-600 text-white'}`}>
            {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
          <button onClick={toggleMic} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${micEnabled ? 'bg-indigo-900/40 border border-indigo-700/40 text-indigo-300 hover:bg-indigo-900/60' : 'bg-red-600 text-white'}`}>
            {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          <button onClick={handleEnd} className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-all">
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right - Interview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f0e2a] border-b border-indigo-900/40 flex-shrink-0">
          <div>
            <p className="text-white font-semibold text-sm">Question {questionNum} of {totalQ}</p>
            <div className="w-32 h-1.5 bg-indigo-900/60 rounded-full mt-1">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${((questionNum - 1) / totalQ) * 100}%` }} />
            </div>
          </div>
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold ${timeLeft < 120 ? 'bg-red-900/30 border-red-700/40 text-red-400' : 'bg-indigo-900/30 border-indigo-700/40 text-white'}`}>
              <Clock className="w-4 h-4" />{formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Question */}
          {currentQuestion && (
            <div className="bg-[#0f0e2a]/90 border border-indigo-700/40 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">{questionNum}</span>
                <span className="text-xs text-indigo-400 capitalize px-2 py-0.5 bg-indigo-900/40 rounded-lg border border-indigo-700/30">{currentQuestion.type?.replace('_', ' ')}</span>
              </div>
              <p className="text-white text-lg leading-relaxed">{currentQuestion.text}</p>
            </div>
          )}

          {/* Answer */}
          <div className="bg-[#0f0e2a]/80 border border-indigo-900/40 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-indigo-200 text-sm font-medium">Your Answer</label>
              <span className="text-indigo-500 text-xs">{answer.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={8} autoFocus
              placeholder="Type your answer here..."
              className="w-full bg-transparent text-white placeholder-indigo-400/50 focus:outline-none resize-none text-sm leading-relaxed"
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') handleSubmit(); }} />
            <div className="flex items-center justify-between pt-3 border-t border-indigo-900/40 mt-3">
              <p className="text-indigo-500 text-xs">Ctrl+Enter to submit</p>
              <button onClick={handleSubmit} disabled={submitting || !answer.trim()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                {questionNum === totalQ ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
