import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { interviewAPI } from '../../services/api';
import { Pen, Eraser, Square, Circle, Minus, Trash2, Download, ChevronRight, Clock, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const TOOLS = [
  { id: 'pen', icon: Pen, label: 'Draw' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
];

const COLORS = ['#818cf8', '#34d399', '#f87171', '#fbbf24', '#a78bfa', '#38bdf8', '#ffffff', '#94a3b8'];
const SIZES = [2, 4, 8, 12];

export default function WhiteboardPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#818cf8');
  const [size, setSize] = useState(4);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [answer, setAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionNum, setQuestionNum] = useState(1);
  const [totalQ, setTotalQ] = useState(3);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const ctxRef = useRef(null);
  const snapshotRef = useRef(null);

  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => interviewAPI.getSession(sessionId).then(r => r.data.session),
    onSuccess: (s) => {
      setTotalQ(s.totalQuestions);
      setQuestionNum((s.currentQuestionIndex || 0) + 1);
      setCurrentQuestion(s.questions?.[s.currentQuestionIndex || 0]);
      setTimeLeft(s.timeLimit ? s.timeLimit * 60 : 3600);
    },
  });

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d0c23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (!ctxRef.current) return;
    ctxRef.current.strokeStyle = tool === 'eraser' ? '#0d0c23' : color;
    ctxRef.current.lineWidth = tool === 'eraser' ? size * 4 : size;
  }, [color, size, tool]);

  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const saveSnapshot = () => {
    snapshotRef.current = ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const restoreSnapshot = () => {
    if (snapshotRef.current) ctxRef.current.putImageData(snapshotRef.current, 0, 0);
  };

  const onMouseDown = (e) => {
    const pos = getPos(e);
    setStartPos(pos);
    setIsDrawing(true);
    saveSnapshot();
    if (tool === 'pen' || tool === 'eraser') {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(pos.x, pos.y);
    }
  };

  const onMouseMove = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const ctx = ctxRef.current;
    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      restoreSnapshot();
      ctx.beginPath();
      if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
      } else if (tool === 'circle') {
        const rx = Math.abs(pos.x - startPos.x) / 2;
        const ry = Math.abs(pos.y - startPos.y) / 2;
        const cx = Math.min(startPos.x, pos.x) + rx;
        const cy = Math.min(startPos.y, pos.y) + ry;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const onMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setHistory(h => [...h, ctxRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);
    const ctx = ctxRef.current;
    if (newHistory.length > 0) {
      ctx.putImageData(newHistory[newHistory.length - 1], 0, 0);
    } else {
      ctx.fillStyle = '#0d0c23';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    ctx.fillStyle = '#0d0c23';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory([]);
  };

  const downloadCanvas = () => {
    const link = document.createElement('a');
    link.download = `whiteboard-q${questionNum}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const handleSubmit = async () => {
    if (!answer.trim()) { toast.error('Please add a text explanation'); return; }
    setSubmitting(true);
    const canvasData = canvasRef.current.toDataURL();
    const fullAnswer = `[Whiteboard Diagram Included]\n\nExplanation:\n${answer}`;
    try {
      const res = await interviewAPI.submitAnswer(sessionId, { answerText: fullAnswer, timeTaken: 0 });
      setAnswer('');
      clearCanvas();
      if (res.data.isCompleted) {
        toast.success('System design round complete!');
        navigate(`/interview/result/${sessionId}`);
      } else {
        setCurrentQuestion(res.data.nextQuestion);
        setQuestionNum(q => q + 1);
      }
    } catch { toast.error('Submission failed'); }
    finally { setSubmitting(false); }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex h-full overflow-hidden bg-[#080719]">
      {/* Left - Whiteboard */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#0f0e2a] border-b border-indigo-900/40 flex-wrap">
          <div className="flex gap-1">
            {TOOLS.map(t => (
              <button key={t.id} onClick={() => setTool(t.id)} title={t.label}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${tool === t.id ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:bg-indigo-900/40 hover:text-white'}`}>
                <t.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-indigo-900/60" />

          <div className="flex gap-1.5">
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0f0e2a] scale-110' : 'hover:scale-110'}`}
                style={{ background: c }} />
            ))}
          </div>

          <div className="w-px h-6 bg-indigo-900/60" />

          <div className="flex gap-1">
            {SIZES.map(s => (
              <button key={s} onClick={() => setSize(s)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${size === s ? 'bg-indigo-600' : 'hover:bg-indigo-900/40'}`}>
                <div className="rounded-full bg-white" style={{ width: Math.min(s, 10), height: Math.min(s, 10) }} />
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-indigo-900/60" />

          <button onClick={undo} className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-400 hover:bg-indigo-900/40 hover:text-white transition-all" title="Undo">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button onClick={clearCanvas} className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-400 hover:bg-red-900/30 hover:text-red-400 transition-all" title="Clear">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={downloadCanvas} className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-400 hover:bg-indigo-900/40 hover:text-white transition-all" title="Download">
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative" style={{ cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}>
          <canvas ref={canvasRef} className="w-full h-full block"
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onTouchStart={e => { e.preventDefault(); onMouseDown(e); }}
            onTouchMove={e => { e.preventDefault(); onMouseMove(e); }}
            onTouchEnd={onMouseUp} />
        </div>
      </div>

      {/* Right - Question + Answer */}
      <div className="w-80 flex-shrink-0 flex flex-col border-l border-indigo-900/40">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f0e2a] border-b border-indigo-900/40">
          <p className="text-white font-semibold text-sm">Q{questionNum}/{totalQ}</p>
          <div className="flex items-center gap-2">
            {timeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold ${timeLeft < 120 ? 'bg-red-900/30 border-red-700/40 text-red-400' : 'bg-indigo-900/30 border-indigo-700/40 text-white'}`}>
                <Clock className="w-3 h-3" />{formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {/* Question */}
        <div className="p-4 border-b border-indigo-900/40 bg-[#0a091e]">
          {currentQuestion ? (
            <>
              <p className="text-xs text-indigo-400 mb-2 capitalize">{currentQuestion.type?.replace('_', ' ')} · {currentQuestion.difficulty}</p>
              <p className="text-white text-sm leading-relaxed">{currentQuestion.text}</p>
            </>
          ) : <p className="text-indigo-400 text-sm">Loading question...</p>}
        </div>

        {/* Tips */}
        <div className="p-4 border-b border-indigo-900/40">
          <p className="text-indigo-400 text-xs font-medium mb-2">💡 Design Tips</p>
          {[
            'Draw high-level components first',
            'Show data flow with arrows',
            'Label your boxes clearly',
            'Mention scalability concerns',
          ].map((tip, i) => (
            <p key={i} className="text-indigo-300 text-xs mb-1">• {tip}</p>
          ))}
        </div>

        {/* Text explanation */}
        <div className="flex-1 flex flex-col p-4 gap-3">
          <label className="text-indigo-200 text-sm font-medium">Written Explanation</label>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={8}
            placeholder="Explain your design choices, trade-offs, scalability approach..."
            className="flex-1 bg-indigo-900/20 border border-indigo-700/40 rounded-xl px-3 py-2.5 text-white placeholder-indigo-400/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          <button onClick={handleSubmit} disabled={submitting || !answer.trim()}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
            {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight className="w-4 h-4" />}
            {questionNum === totalQ ? 'Finish Round' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  );
}
