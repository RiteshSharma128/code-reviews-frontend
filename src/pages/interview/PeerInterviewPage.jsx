import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Users, Mic, MicOff, Send, Copy, CheckCircle, ArrowLeft, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:4003';

export default function PeerInterviewPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [roomStatus, setRoomStatus] = useState('waiting'); // waiting | connected | ended
  const [partner, setPartner] = useState(null);
  const [role, setRole] = useState(null); // interviewer | candidate
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [copied, setCopied] = useState(false);
  const [timer, setTimer] = useState(0);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  const roomLink = `${window.location.origin}/interview/peer/${roomId}`;

  useEffect(() => {
    const token = document.cookie.split('access_token=')[1]?.split(';')[0];
    const sock = io(WS_URL, { auth: { token }, transports: ['websocket'] });

    sock.on('connect', () => {
      sock.emit('peer_join_room', { roomId, userName: user?.name });
    });

    sock.on('peer_room_joined', (data) => {
      setPartner(data.partner);
      setRole(data.role);
      setRoomStatus('connected');
      setMessages(prev => [...prev, {
        type: 'system',
        text: `${data.partner.name} joined! You are the ${data.role}.`,
      }]);
      if (data.role === 'interviewer') {
        timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
      }
    });

    sock.on('peer_message', (data) => {
      setMessages(prev => [...prev, { type: 'peer', ...data }]);
    });

    sock.on('peer_question_set', (data) => {
      setCurrentQuestion(data.question);
      setMessages(prev => [...prev, { type: 'system', text: `New question: "${data.question}"` }]);
    });

    sock.on('peer_partner_left', () => {
      setRoomStatus('ended');
      setMessages(prev => [...prev, { type: 'system', text: 'Partner has left the session.' }]);
      clearInterval(timerRef.current);
    });

    sock.on('disconnect', () => setRoomStatus('waiting'));

    setSocket(sock);
    return () => { sock.disconnect(); clearInterval(timerRef.current); };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('peer_message', { roomId, text: input.trim(), userName: user?.name });
    setMessages(prev => [...prev, { type: 'me', text: input.trim(), userName: user?.name }]);
    setInput('');
  };

  const setQuestion = (q) => {
    if (!socket || role !== 'interviewer') return;
    socket.emit('peer_set_question', { roomId, question: q });
    setCurrentQuestion(q);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    toast.success('Room link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  const SAMPLE_QUESTIONS = [
    'Tell me about yourself.',
    'What is your greatest strength?',
    'Describe a challenging project you worked on.',
    'How do you handle conflict with teammates?',
    'Where do you see yourself in 5 years?',
  ];

  return (
    <div className="flex h-full overflow-hidden bg-[#080719]">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-indigo-900/40 bg-[#0f0e2a]">
        <div className="p-4 border-b border-indigo-900/40">
          <button onClick={() => navigate('/interview')} className="flex items-center gap-2 text-indigo-400 hover:text-white text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-white font-bold flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" /> Peer Interview</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${roomStatus === 'connected' ? 'bg-green-400' : roomStatus === 'waiting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-indigo-300 text-xs capitalize">{roomStatus === 'connected' ? `Connected with ${partner?.name}` : roomStatus === 'waiting' ? 'Waiting for partner...' : 'Session ended'}</span>
          </div>
          {role && <p className="text-indigo-400 text-xs mt-1">Your role: <span className="text-white font-medium capitalize">{role}</span></p>}
          {timer > 0 && <p className="text-indigo-400 text-xs mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{fmt(timer)}</p>}
        </div>

        {/* Room Link */}
        <div className="p-4 border-b border-indigo-900/40">
          <p className="text-indigo-400 text-xs font-medium mb-2">Share room link:</p>
          <div className="flex items-center gap-2 bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-3 py-2">
            <p className="text-indigo-300 text-xs flex-1 truncate">{roomId}</p>
            <button onClick={copyLink} className="text-indigo-400 hover:text-white transition-colors">
              {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Question Bank (Interviewer only) */}
        {role === 'interviewer' && (
          <div className="p-4 flex-1 overflow-y-auto">
            <p className="text-indigo-400 text-xs font-medium mb-3">Quick Questions:</p>
            <div className="space-y-2">
              {SAMPLE_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => setQuestion(q)}
                  className="w-full text-left px-3 py-2 bg-indigo-900/20 border border-indigo-800/40 rounded-xl text-xs text-indigo-300 hover:border-indigo-600/50 hover:text-white transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {role === 'candidate' && (
          <div className="p-4 flex-1">
            <p className="text-indigo-400 text-xs font-medium mb-2">Current Question:</p>
            <div className="bg-indigo-900/20 border border-indigo-700/40 rounded-xl p-3">
              <p className="text-white text-sm">{currentQuestion || 'Waiting for interviewer...'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Current Question Banner */}
        {currentQuestion && (
          <div className="px-6 py-3 bg-indigo-600/10 border-b border-indigo-700/40">
            <p className="text-indigo-300 text-xs font-medium">Current Question:</p>
            <p className="text-white text-sm">{currentQuestion}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {roomStatus === 'waiting' && messages.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <p className="text-white font-semibold">Waiting for your practice partner</p>
              <p className="text-indigo-400 text-sm mt-2">Share the room link to invite them</p>
              <button onClick={copyLink} className="mt-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm mx-auto transition-all">
                <Copy className="w-4 h-4" /> Copy Room Link
              </button>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'me' ? 'justify-end' : msg.type === 'system' ? 'justify-center' : 'justify-start'}`}>
              {msg.type === 'system' ? (
                <span className="text-xs text-indigo-500 bg-indigo-900/20 px-3 py-1 rounded-full border border-indigo-800/40">{msg.text}</span>
              ) : (
                <div className={`max-w-md px-4 py-3 rounded-2xl text-sm ${msg.type === 'me' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-[#0f0e2a] border border-indigo-800/40 text-indigo-100 rounded-bl-sm'}`}>
                  {msg.type !== 'me' && <p className="text-indigo-400 text-xs font-medium mb-1">{msg.userName}</p>}
                  {msg.text}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-[#0f0e2a] border-t border-indigo-900/40">
          <div className="flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={roomStatus === 'connected' ? 'Type your answer or message...' : 'Waiting for partner to join...'}
              disabled={roomStatus !== 'connected'}
              className="flex-1 bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-4 py-2.5 text-white placeholder-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-50" />
            <button onClick={sendMessage} disabled={!input.trim() || roomStatus !== 'connected'}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
