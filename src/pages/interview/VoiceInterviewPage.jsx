import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewAPI } from '../../services/api';
import { Mic, MicOff, Volume2, VolumeX, Phone, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoiceInterviewPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNum, setQuestionNum] = useState(1);
  const [totalQ, setTotalQ] = useState(5);
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | listening | processing | speaking | done
  const [messages, setMessages] = useState([]);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) setTranscript(prev => prev + ' ' + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') toast.error(`Speech error: ${e.error}`);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  // const { data: session } = useQuery({
  //   queryKey: ['session', sessionId],
  //   queryFn: () => interviewAPI.getSession(sessionId).then(r => r.data.session),
  //   onSuccess: (s) => {
  //     setTotalQ(s.totalQuestions);
  //     setQuestionNum((s.currentQuestionIndex || 0) + 1);
  //     const q = s.questions?.[s.currentQuestionIndex || 0];
  //     setCurrentQuestion(q);
  //     setTimeLeft(s.timeLimit ? s.timeLimit * 60 : 3600);
  //     setStatus('ready');
  //     // Auto-speak first question
  //     setTimeout(() => speakText(`Welcome! I'm your AI interviewer. Let's begin. Question ${(s.currentQuestionIndex || 0) + 1}: ${q?.text}`), 500);
  //   },
  // });


  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => interviewAPI.getSession(sessionId).then(r => r.data.session),
  });
  
  useEffect(() => {
    if (!session) return;
    setTotalQ(session.totalQuestions);
    setQuestionNum((session.currentQuestionIndex || 0) + 1);
    const q = session.questions?.[session.currentQuestionIndex || 0];
    setCurrentQuestion(q);
    setTimeLeft(session.timeLimit ? session.timeLimit * 60 : 3600);
    setStatus('ready');
    setTimeout(() => speakText(`Welcome! I'm your AI interviewer. Let's begin. Question ${(session.currentQuestionIndex || 0) + 1}: ${q?.text}`), 500);
  }, [session?._id]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || status === 'loading' || status === 'done') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleEnd(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null, status]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const speakText = useCallback((text) => {
    if (!synthRef.current || !text) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1;
    // Try to use a natural voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')) || voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); setStatus('listening'); };
    synthRef.current.speak(utterance);
    setIsSpeaking(true);
    setStatus('speaking');
    setMessages(prev => [...prev, { role: 'interviewer', text }]);
  }, []);

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    setTranscript('');
    setInterimTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setStatus('listening');
    } catch (e) {
      toast.error('Could not start microphone');
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
    setIsListening(false);
  };

  const submitVoiceAnswer = async () => {
    const fullAnswer = transcript.trim();
    if (!fullAnswer) { toast.error('Please say something first!'); return; }

    stopListening();
    setSubmitting(true);
    setStatus('processing');
    setMessages(prev => [...prev, { role: 'user', text: fullAnswer }]);

    try {
      const res = await interviewAPI.submitAnswer(sessionId, {
        answerText: fullAnswer,
        timeTaken: session?.timeLimit ? (session.timeLimit * 60 - timeLeft) : 0,
      });

      setTranscript('');
      setInterimTranscript('');

      if (res.data.isCompleted) {
        setStatus('done');
        speakText('Great job! You have completed all questions. Your feedback is being generated. Well done!');
        setTimeout(() => navigate(`/interview/result/${sessionId}`), 4000);
      } else {
        setCurrentQuestion(res.data.nextQuestion);
        setQuestionNum(q => q + 1);
        const nextQ = res.data.nextQuestion;
        setTimeout(() => {
          speakText(`Thank you. Question ${questionNum + 1}: ${nextQ?.text}`);
        }, 1000);
      }
    } catch (err) {
      toast.error('Failed to submit answer');
      setStatus('listening');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async () => {
    stopListening();
    synthRef.current?.cancel();
    setStatus('done');
    await interviewAPI.abandonSession(sessionId).catch(() => {});
    navigate(`/interview/result/${sessionId}`);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!browserSupported) return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <AlertCircle className="w-12 h-12 text-yellow-400 mb-4" />
      <h2 className="text-white text-xl font-bold mb-2">Browser Not Supported</h2>
      <p className="text-indigo-300 text-sm mb-4">Voice interview requires Chrome or Edge browser with microphone access.</p>
      <button onClick={() => navigate('/interview')} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm">Back to Interview</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#080719]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0f0e2a] border-b border-indigo-900/40">
        <div>
          <p className="text-white font-semibold text-sm">Voice Interview — Q{questionNum}/{totalQ}</p>
          <div className="w-32 h-1.5 bg-indigo-900/60 rounded-full mt-1">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${((questionNum - 1) / totalQ) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold ${timeLeft < 120 ? 'bg-red-900/30 border-red-700/40 text-red-400' : 'bg-indigo-900/30 border-indigo-700/40 text-white'}`}>
              <Clock className="w-4 h-4" />{formatTime(timeLeft)}
            </div>
          )}
          <button onClick={handleEnd} className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 border border-red-700/40 rounded-xl hover:bg-red-900/20 transition-all">
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-[#0f0e2a] border border-indigo-800/40 text-indigo-100 rounded-bl-sm'
            }`}>
              {msg.role === 'interviewer' && <span className="text-indigo-400 text-xs font-medium block mb-1">🤖 AI Interviewer</span>}
              {msg.text}
            </div>
          </div>
        ))}
        {/* Live transcript */}
        {(isListening && (transcript || interimTranscript)) && (
          <div className="flex justify-end">
            <div className="max-w-xl px-4 py-3 rounded-2xl rounded-br-sm bg-indigo-700/50 border border-indigo-600/40 text-sm text-white">
              <span className="text-indigo-300 text-xs block mb-1">🎤 You (live)</span>
              {transcript} <span className="text-indigo-300">{interimTranscript}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="px-6 py-6 bg-[#0f0e2a] border-t border-indigo-900/40">
        <div className="max-w-lg mx-auto">
          {/* Status indicator */}
          <div className="text-center mb-4">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border ${
              status === 'listening' ? 'bg-red-900/30 border-red-700/40 text-red-300' :
              status === 'speaking' ? 'bg-indigo-900/30 border-indigo-700/40 text-indigo-300' :
              status === 'processing' ? 'bg-yellow-900/30 border-yellow-700/40 text-yellow-300' :
              'bg-indigo-900/30 border-indigo-700/40 text-indigo-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-red-400 animate-pulse' : status === 'speaking' ? 'bg-indigo-400 animate-pulse' : 'bg-gray-500'}`} />
              {status === 'loading' ? 'Loading...' :
               status === 'ready' ? 'Ready — Click mic to start' :
               status === 'listening' ? 'Listening... speak now' :
               status === 'speaking' ? 'AI Interviewer is speaking...' :
               status === 'processing' ? 'Processing your answer...' :
               status === 'done' ? 'Interview complete!' : ''}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            {/* Mic toggle */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={status === 'speaking' || status === 'processing' || status === 'loading'}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
                isListening
                  ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/40 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-900/40'
              }`}
            >
              {isListening ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
            </button>

            {/* Submit answer */}
            {(transcript.trim().length > 0) && (
              <button onClick={submitVoiceAnswer} disabled={submitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-medium text-sm transition-all">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                Submit Answer
              </button>
            )}

            {/* Mute AI voice */}
            <button onClick={() => synthRef.current?.cancel()} className="w-10 h-10 rounded-full bg-indigo-900/40 border border-indigo-700/40 flex items-center justify-center text-indigo-400 hover:text-white hover:bg-indigo-900/60 transition-all">
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-center text-indigo-500 text-xs mt-3">
            Click mic → speak → click mic again to stop → submit
          </p>
        </div>
      </div>
    </div>
  );
}
