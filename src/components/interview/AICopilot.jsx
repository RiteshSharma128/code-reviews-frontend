import React, { useState, useEffect, useRef } from 'react';
import { Zap, X, ChevronDown, ChevronUp, Lightbulb, MessageSquare, BookOpen } from 'lucide-react';

const HINTS_DB = {
  behavioral: [
    'Use the STAR method: Situation → Task → Action → Result',
    'Be specific with numbers and outcomes (e.g., "reduced load time by 40%")',
    'Focus on YOUR role — use "I" not "we"',
    'Mention what you learned from the experience',
    'Keep your answer to 2-3 minutes',
  ],
  technical: [
    'Start by clarifying requirements before jumping to solution',
    'Mention time/space complexity of your approach',
    'Talk through edge cases (null, empty, large input)',
    'Discuss trade-offs between different approaches',
    'Draw a diagram or write pseudocode first',
  ],
  hr: [
    'Research the company values before answering culture-fit questions',
    'Align your answer with the job description keywords',
    'Show enthusiasm and genuine interest in the role',
    'Be honest about weaknesses but always include a mitigation',
    'End with a question back to show engagement',
  ],
  system_design: [
    'Start: Clarify scale requirements (users, requests/sec)',
    'Identify: Read-heavy vs write-heavy workload?',
    'Components: Load balancer → App servers → Cache → DB',
    'Always mention: CAP theorem trade-offs',
    'Scalability: Horizontal scaling, sharding, CDN',
  ],
  coding: [
    'Verbalize your thought process as you code',
    'Start with brute force, then optimize',
    'Test with the given examples first',
    'Check for off-by-one errors in loops',
    'Ask: Can I use extra space to improve time complexity?',
  ],
};

const FILLER_WORDS = ['um', 'uh', 'like', 'basically', 'you know', 'kind of'];

export default function AICopilot({ questionType = 'behavioral', answer = '', isVisible = true, onClose }) {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('hints');
  const [currentHint, setCurrentHint] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  const hints = HINTS_DB[questionType] || HINTS_DB.behavioral;

  useEffect(() => {
    if (!answer) return;
    const words = answer.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);

    const lower = answer.toLowerCase();
    const fillers = FILLER_WORDS.filter(fw => {
      const re = new RegExp(`\\b${fw}\\b`, 'gi');
      return re.test(lower);
    });
    setFillerCount(fillers.length);

    // Smart suggestions based on answer content
    const newSuggestions = [];
    if (words.length < 30) newSuggestions.push('Your answer is too brief. Add more detail and examples.');
    if (words.length > 300) newSuggestions.push('Answer is getting long. Try to be more concise.');
    if (fillers.length > 3) newSuggestions.push(`Detected ${fillers.length} filler words. Try pausing silently instead.`);
    if (!lower.includes('result') && !lower.includes('outcome') && !lower.includes('impact') && questionType === 'behavioral') {
      newSuggestions.push('Mention the outcome or result of your actions.');
    }
    if (!lower.includes('i ') && !lower.includes("i've") && questionType === 'behavioral') {
      newSuggestions.push('Use "I" statements to show your personal contribution.');
    }
    setSuggestions(newSuggestions);
  }, [answer, questionType]);

  if (!isVisible) return null;

  const scoreColor = fillerCount === 0 && wordCount >= 50 && wordCount <= 250
    ? 'text-green-400' : fillerCount > 3 || wordCount < 20 ? 'text-red-400' : 'text-yellow-400';

  return (
    <div className="fixed bottom-4 right-4 w-72 z-50">
      <div className="bg-[#0f0e2a] border border-indigo-700/50 rounded-2xl shadow-2xl shadow-indigo-900/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-indigo-600/20 border-b border-indigo-700/40">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-semibold">AI Copilot</span>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setExpanded(e => !e)} className="text-indigo-400 hover:text-white p-1">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            {onClose && (
              <button onClick={onClose} className="text-indigo-400 hover:text-red-400 p-1">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {expanded && (
          <>
            {/* Live Stats */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-indigo-900/40">
              <div className="flex-1">
                <p className="text-indigo-400 text-xs">Words</p>
                <p className={`text-sm font-bold ${wordCount < 30 ? 'text-red-400' : wordCount > 250 ? 'text-yellow-400' : 'text-green-400'}`}>{wordCount}</p>
              </div>
              <div className="flex-1">
                <p className="text-indigo-400 text-xs">Filler words</p>
                <p className={`text-sm font-bold ${fillerCount === 0 ? 'text-green-400' : fillerCount > 3 ? 'text-red-400' : 'text-yellow-400'}`}>{fillerCount}</p>
              </div>
              <div className="flex-1">
                <p className="text-indigo-400 text-xs">Quality</p>
                <p className={`text-sm font-bold ${scoreColor}`}>
                  {fillerCount === 0 && wordCount >= 50 && wordCount <= 250 ? 'Good' : fillerCount > 3 || wordCount < 20 ? 'Low' : 'Fair'}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-indigo-900/40">
              {[
                { id: 'hints', icon: Lightbulb, label: 'Hints' },
                { id: 'live', icon: MessageSquare, label: 'Live' },
                { id: 'structure', icon: BookOpen, label: 'Structure' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium border-b-2 transition-all ${activeTab === tab.id ? 'border-indigo-500 text-white' : 'border-transparent text-indigo-400 hover:text-white'}`}>
                  <tab.icon className="w-3 h-3" />{tab.label}
                </button>
              ))}
            </div>

            <div className="p-3 max-h-48 overflow-y-auto">
              {activeTab === 'hints' && (
                <div className="space-y-2">
                  {hints.map((hint, i) => (
                    <div key={i} onClick={() => setCurrentHint(i)}
                      className={`px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${currentHint === i ? 'bg-indigo-600/30 border border-indigo-600/50 text-indigo-100' : 'bg-indigo-900/20 border border-indigo-800/30 text-indigo-300 hover:border-indigo-700/50'}`}>
                      <span className="text-indigo-500 mr-1">{i + 1}.</span>{hint}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'live' && (
                <div className="space-y-2">
                  {suggestions.length === 0 ? (
                    <div className="text-center py-3">
                      <p className="text-green-400 text-xs">✓ Answer looks good so far!</p>
                    </div>
                  ) : suggestions.map((s, i) => (
                    <div key={i} className="px-3 py-2 bg-yellow-900/20 border border-yellow-700/30 rounded-xl text-xs text-yellow-300">
                      ⚠ {s}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'structure' && (
                <div className="space-y-1.5">
                  <p className="text-indigo-400 text-xs font-medium mb-2">STAR Method Checklist</p>
                  {[
                    { label: 'Situation', check: answer.toLowerCase().includes('when') || answer.toLowerCase().includes('situation') || answer.toLowerCase().includes('context') },
                    { label: 'Task', check: answer.toLowerCase().includes('task') || answer.toLowerCase().includes('responsible') || answer.toLowerCase().includes('needed to') || answer.toLowerCase().includes('my role') },
                    { label: 'Action', check: answer.toLowerCase().includes(' i ') || answer.toLowerCase().includes('i did') || answer.toLowerCase().includes('i took') || answer.toLowerCase().includes('i implemented') },
                    { label: 'Result', check: answer.toLowerCase().includes('result') || answer.toLowerCase().includes('outcome') || answer.toLowerCase().includes('achieved') || answer.toLowerCase().includes('impact') },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${item.check ? 'bg-green-900/20 border border-green-700/30 text-green-300' : 'bg-indigo-900/20 border border-indigo-800/30 text-indigo-400'}`}>
                      <span>{item.check ? '✓' : '○'}</span>
                      <span className="font-medium">{item.label}</span>
                      {!item.check && <span className="text-indigo-500 ml-auto">missing</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
