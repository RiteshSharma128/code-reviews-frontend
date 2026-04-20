// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// import { dsaAPI } from '../../services/api';
// import Editor from '@monaco-editor/react';
// import {Code2, Play, Send, Lightbulb, ChevronLeft, CheckCircle, XCircle, Clock, Timer } from 'lucide-react';
// import toast from 'react-hot-toast';

// const LANGUAGES = [
//   { id: 'javascript', label: 'JavaScript' },
//   { id: 'python', label: 'Python' },
//   { id: 'java', label: 'Java' },
//   { id: 'cpp', label: 'C++' },
// ];

// const diffColor = { easy: 'text-green-400 bg-green-900/30 border-green-700/30', medium: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/30', hard: 'text-red-400 bg-red-900/30 border-red-700/30' };

// export default function DSAProblemPage() {
//   const { slug } = useParams();
//   const navigate = useNavigate();
//   const [language, setLanguage] = useState('javascript');
//   const [code, setCode] = useState('');
//   const [customInput, setCustomInput] = useState('');
//   const [output, setOutput] = useState(null);
//   const [running, setRunning] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [hintIdx, setHintIdx] = useState(-1);
//   const [hints, setHints] = useState([]);
//   const [activeTab, setActiveTab] = useState('description');
//   const [submitResult, setSubmitResult] = useState(null);

//   const { data: problem, isLoading } = useQuery({
//     queryKey: ['problem', slug],
//     queryFn: () => dsaAPI.getProblem(slug).then(r => r.data.problem),
//     onSuccess: (p) => {
//       const starter = p.starterCode?.[language] || `// Write your ${language} solution here\n`;
//       setCode(starter);
//       if (p.testCases?.[0]?.input) setCustomInput(p.testCases[0].input);
//     },
//   });

//   useEffect(() => {
//     if (problem) {
//       setCode(problem.starterCode?.[language] || `// Write your ${language} solution here\n`);
//     }
//   }, [language, problem]);

//   const handleRun = async () => {
//     if (!code.trim()) return;
//     setRunning(true);
//     setOutput(null);
//     try {
//       const res = await dsaAPI.runCode({ code, language, input: customInput, problemSlug: slug });
//       setOutput({ type: 'run', ...res.data });
//     } catch (err) {
//       setOutput({ type: 'error', output: err.response?.data?.message || 'Execution failed' });
//     } finally {
//       setRunning(false);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!code.trim()) return;
//     setSubmitting(true);
//     setSubmitResult(null);
//     try {
//       const res = await dsaAPI.submitCode(slug, { code, language });
//       setSubmitResult(res.data);
//       if (res.data.status === 'accepted') {
//         toast.success('🎉 Accepted! Great solution!');
//       } else {
//         toast.error(`❌ ${res.data.status.replace(/_/g, ' ')}`);
//       }
//       setActiveTab('result');
//     } catch (err) {
//       toast.error('Submission failed');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleHint = async () => {
//     const nextIdx = hintIdx + 1;
//     if (nextIdx >= (problem?.hints?.length || 0)) {
//       toast('No more hints available');
//       return;
//     }
//     try {
//       const res = await dsaAPI.getHint(slug, nextIdx);
//       if (res.data.hint) {
//         setHints(h => [...h, res.data.hint]);
//         setHintIdx(nextIdx);
//       }
//     } catch (err) {
//       toast.error('Failed to get hint');
//     }
//   };

//   if (isLoading) return (
//     <div className="flex items-center justify-center h-full">
//       <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
//     </div>
//   );

//   if (!problem) return <div className="p-6 text-center text-indigo-400">Problem not found</div>;

//   return (
//     <div className="flex h-full overflow-hidden">
//       {/* Left Panel - Problem */}
//       <div className="w-full lg:w-2/5 flex flex-col border-r border-indigo-900/40 overflow-hidden">
//         {/* Problem Header */}
//         <div className="px-5 py-4 border-b border-indigo-900/40 flex-shrink-0">
//           <button onClick={() => navigate('/dsa')} className="flex items-center gap-1 text-indigo-400 hover:text-white text-xs mb-3 transition-colors">
//             <ChevronLeft className="w-4 h-4" /> Back to problems
//           </button>
//           <h1 className="text-white font-bold text-lg">{problem.title}</h1>
//           <div className="flex items-center gap-2 mt-2 flex-wrap">
//             <span className={`text-xs px-2 py-0.5 rounded-lg border capitalize font-medium ${diffColor[problem.difficulty]}`}>{problem.difficulty}</span>
//             <span className="text-xs text-indigo-400 capitalize bg-indigo-900/30 px-2 py-0.5 rounded-lg border border-indigo-700/30">{problem.category?.replace(/_/g, ' ')}</span>
//             {problem.timeComplexity && <span className="text-xs text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded-lg border border-purple-700/30">O: {problem.timeComplexity}</span>}
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="flex border-b border-indigo-900/40 flex-shrink-0">
//           {['description', 'hints', 'submissions'].map(t => (
//             <button key={t} onClick={() => setActiveTab(t)}
//               className={`px-4 py-2.5 text-xs font-medium capitalize transition-all border-b-2 ${activeTab === t ? 'border-indigo-500 text-white' : 'border-transparent text-indigo-400 hover:text-white'}`}>
//               {t}
//             </button>
//           ))}
//           {submitResult && (
//             <button onClick={() => setActiveTab('result')}
//               className={`px-4 py-2.5 text-xs font-medium capitalize transition-all border-b-2 ${activeTab === 'result' ? 'border-indigo-500 text-white' : 'border-transparent text-indigo-400 hover:text-white'}`}>
//               Result
//             </button>
//           )}
//         </div>

//         {/* Tab Content */}
//         <div className="flex-1 overflow-y-auto p-5 text-sm">
//           {activeTab === 'description' && (
//             <div className="space-y-5">
//               <div className="text-indigo-200 leading-relaxed whitespace-pre-wrap">{problem.description}</div>
//               {problem.testCases?.filter(tc => !tc.isHidden).length > 0 && (
//                 <div>
//                   <h3 className="text-white font-semibold mb-3">Examples</h3>
//                   {problem.testCases.filter(tc => !tc.isHidden).map((tc, i) => (
//                     <div key={i} className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-4 mb-3">
//                       <p className="text-indigo-300 text-xs mb-1 font-medium">Example {i + 1}</p>
//                       <p className="text-indigo-200 text-xs font-mono"><span className="text-indigo-400">Input:</span> {tc.input}</p>
//                       <p className="text-indigo-200 text-xs font-mono mt-1"><span className="text-indigo-400">Output:</span> {tc.expectedOutput}</p>
//                       {tc.explanation && <p className="text-indigo-400 text-xs mt-2">{tc.explanation}</p>}
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {problem.companies?.length > 0 && (
//                 <div>
//                   <h3 className="text-white font-semibold mb-2">Companies</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {problem.companies.map(c => (
//                       <span key={c} className="text-xs text-purple-300 bg-purple-900/20 border border-purple-700/30 px-2.5 py-1 rounded-lg capitalize">{c}</span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'hints' && (
//             <div className="space-y-4">
//               <p className="text-indigo-400 text-xs">Hints reveal progressively. Try solving on your own first!</p>
//               {hints.map((hint, i) => (
//                 <div key={i} className="bg-yellow-900/10 border border-yellow-700/30 rounded-xl p-4">
//                   <p className="text-yellow-400 text-xs font-medium mb-1">Hint {i + 1}</p>
//                   <p className="text-yellow-100 text-sm">{hint}</p>
//                 </div>
//               ))}
//               {hintIdx < (problem?.hints?.length || 0) - 1 && (
//                 <button onClick={handleHint}
//                   className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-700/40 text-yellow-400 px-4 py-2.5 rounded-xl text-sm hover:bg-yellow-900/30 transition-all">
//                   <Lightbulb className="w-4 h-4" /> {hints.length === 0 ? 'Get first hint' : 'Get next hint'}
//                 </button>
//               )}
//               {hints.length === problem?.hints?.length && hints.length > 0 && (
//                 <p className="text-indigo-400 text-xs text-center">All hints revealed</p>
//               )}
//             </div>
//           )}

//           {activeTab === 'result' && submitResult && (
//             <div className="space-y-4">
//               <div className={`flex items-center gap-3 p-4 rounded-xl border ${submitResult.status === 'accepted' ? 'bg-green-900/20 border-green-700/40' : 'bg-red-900/20 border-red-700/40'}`}>
//                 {submitResult.status === 'accepted' ? <CheckCircle className="w-6 h-6 text-green-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
//                 <div>
//                   <p className={`font-bold capitalize ${submitResult.status === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>{submitResult.status.replace(/_/g, ' ')}</p>
//                   <p className="text-xs text-indigo-400">{submitResult.testsPassed}/{submitResult.testsTotal} tests passed</p>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-3 text-center">
//                   <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
//                   <p className="text-white font-bold text-sm">{submitResult.runtime}</p>
//                   <p className="text-indigo-400 text-xs">Runtime</p>
//                 </div>
//                 <div className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-3 text-center">
//                   <p className="text-white font-bold text-sm">{submitResult.memory}</p>
//                   <p className="text-indigo-400 text-xs">Memory</p>
//                 </div>
//               </div>
//               {submitResult.errorMessage && (
//                 <div className="bg-red-900/10 border border-red-700/30 rounded-xl p-3">
//                   <p className="text-red-300 text-xs font-mono">{submitResult.errorMessage}</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Right Panel - Editor */}
//       <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
//         {/* Editor Header */}
//         <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-900/40 bg-[#0f0e2a]/60 flex-shrink-0">
//           <select value={language} onChange={e => setLanguage(e.target.value)}
//             className="bg-indigo-900/30 border border-indigo-700/40 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none">
//             {LANGUAGES.map(l => <option key={l.id} value={l.id} className="bg-[#1e1b4b]">{l.label}</option>)}
//           </select>
//           <div className="flex gap-2">
//             <button onClick={handleRun} disabled={running || submitting}
//               className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/40 text-indigo-200 px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-900/60 disabled:opacity-50 transition-all">
//               {running ? <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5 text-green-400" />}
//               Run
//             </button>
//             <button onClick={handleSubmit} disabled={running || submitting}
//               className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 transition-all">
//               {submitting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
//               Submit
//             </button>
//           </div>
//         </div>

//         {/* Monaco Editor */}
//         <div className="flex-1 overflow-hidden">
//           <Editor
//             height="100%"
//             language={language === 'cpp' ? 'cpp' : language}
//             value={code}
//             onChange={val => setCode(val || '')}
//             theme="vs-dark"
//             options={{
//               fontSize: 14,
//               fontFamily: 'Fira Code, monospace',
//               minimap: { enabled: false },
//               scrollBeyondLastLine: false,
//               lineNumbers: 'on',
//               padding: { top: 16, bottom: 16 },
//               suggestOnTriggerCharacters: true,
//               tabSize: 2,
//             }}
//           />
//         </div>

//         {/* Input / Output */}
//         <div className="h-48 border-t border-indigo-900/40 flex flex-shrink-0">
//           <div className="flex-1 flex flex-col border-r border-indigo-900/40">
//             <p className="text-indigo-400 text-xs px-4 py-2 border-b border-indigo-900/40 font-medium">Custom Input</p>
//             <textarea value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="Enter test input..."
//               className="flex-1 bg-transparent text-white text-xs font-mono p-4 focus:outline-none resize-none placeholder-indigo-600" />
//           </div>
//           <div className="flex-1 flex flex-col">
//             <p className="text-indigo-400 text-xs px-4 py-2 border-b border-indigo-900/40 font-medium">Output</p>
//             <div className="flex-1 overflow-y-auto p-4">
//               {output ? (
//                 <pre className={`text-xs font-mono whitespace-pre-wrap ${output.type === 'error' ? 'text-red-300' : 'text-green-300'}`}>
//                   {output.output || 'No output'}
//                   {output.runtime && <span className="text-indigo-400 block mt-2">⏱ {output.runtime}ms</span>}
//                   {output.isPlaceholder && <span className="text-yellow-400 block mt-2">⚠ Configure JUDGE0_URL for real execution</span>}
//                 </pre>
//               ) : (
//                 <p className="text-indigo-600 text-xs">Run your code to see output</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile message */}
//       <div className="lg:hidden flex-1 flex items-center justify-center p-6">
//         <div className="text-center">
//           <Code2 className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
//           <p className="text-white font-semibold">Code Editor</p>
//           <p className="text-indigo-400 text-sm mt-2">Open on desktop for the full coding experience</p>
//         </div>
//       </div>
//     </div>

//   );
// }








import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dsaAPI } from '../../services/api';
import Editor from '@monaco-editor/react';
import { Code2, Play, Send, Lightbulb, ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
];

const diffColor = {
  easy: 'text-green-400 bg-green-900/30 border-green-700/30',
  medium: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/30',
  hard: 'text-red-400 bg-red-900/30 border-red-700/30',
};

function SubmissionsTab({ slug }) {
  const { data, isLoading } = useQuery({
    queryKey: ['submissions', slug],
    queryFn: () => dsaAPI.getSubmissions(slug).then(r => r.data.submissions),
  });

  if (isLoading) return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  if (!data?.length) return (
    <p className="text-indigo-400 text-sm text-center py-8">No submissions yet</p>
  );

  return (
    <div className="space-y-3">
      {data.map((s, i) => (
        <div key={i} className={`p-3 rounded-xl border ${s.status === 'accepted' ? 'bg-green-900/10 border-green-700/30' : 'bg-red-900/10 border-red-700/30'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium capitalize ${s.status === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>
              {s.status === 'accepted' ? '✅' : '❌'} {s.status.replace(/_/g, ' ')}
            </span>
            <span className="text-indigo-400 text-xs">{s.language}</span>
          </div>
          <div className="flex gap-4 mt-1">
            <span className="text-indigo-400 text-xs">⏱ {s.runtime}ms</span>
            <span className="text-indigo-400 text-xs">{s.testsPassed}/{s.testsTotal} tests</span>
            <span className="text-indigo-500 text-xs">{new Date(s.submittedAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DSAProblemPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hintIdx, setHintIdx] = useState(-1);
  const [hints, setHints] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  const [submitResult, setSubmitResult] = useState(null);

  const { data: problem, isLoading } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => dsaAPI.getProblem(slug).then(r => r.data.problem),
  });

  useEffect(() => {
    if (!problem) return;
    const starter = problem.starterCode?.[language] || `// Write your ${language} solution here\n`;
    setCode(starter);
    if (problem.testCases?.[0]?.input) setCustomInput(problem.testCases[0].input);
  }, [problem?.slug]);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode?.[language] || `// Write your ${language} solution here\n`);
    }
  }, [language]);

  const handleRun = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setOutput(null);
    try {
      const res = await dsaAPI.runCode({ code, language, input: customInput, problemSlug: slug });
      setOutput({ type: 'run', ...res.data });
    } catch (err) {
      setOutput({ type: 'error', output: err.response?.data?.message || 'Execution failed' });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await dsaAPI.submitCode(slug, { code, language });
      setSubmitResult(res.data);
      if (res.data.status === 'accepted') {
        toast.success('🎉 Accepted! Great solution!');
      } else {
        toast.error(`❌ ${res.data.status.replace(/_/g, ' ')}`);
      }
      setActiveTab('result');
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHint = async () => {
    const nextIdx = hintIdx + 1;
    if (nextIdx >= (problem?.hints?.length || 0)) {
      toast('No more hints available');
      return;
    }
    try {
      const res = await dsaAPI.getHint(slug, nextIdx);
      if (res.data.hint) {
        setHints(h => [...h, res.data.hint]);
        setHintIdx(nextIdx);
      }
    } catch (err) {
      toast.error('Failed to get hint');
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  if (!problem) return <div className="p-6 text-center text-indigo-400">Problem not found</div>;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-full lg:w-2/5 flex flex-col border-r border-indigo-900/40 overflow-hidden">
        <div className="px-5 py-4 border-b border-indigo-900/40 flex-shrink-0">
          <button onClick={() => navigate('/dsa')} className="flex items-center gap-1 text-indigo-400 hover:text-white text-xs mb-3 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to problems
          </button>
          <h1 className="text-white font-bold text-lg">{problem.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-lg border capitalize font-medium ${diffColor[problem.difficulty]}`}>{problem.difficulty}</span>
            <span className="text-xs text-indigo-400 capitalize bg-indigo-900/30 px-2 py-0.5 rounded-lg border border-indigo-700/30">{problem.category?.replace(/_/g, ' ')}</span>
            {problem.timeComplexity && <span className="text-xs text-purple-400 bg-purple-900/20 px-2 py-0.5 rounded-lg border border-purple-700/30">O: {problem.timeComplexity}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-indigo-900/40 flex-shrink-0">
          {['description', 'hints', 'submissions'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2.5 text-xs font-medium capitalize transition-all border-b-2 ${activeTab === t ? 'border-indigo-500 text-white' : 'border-transparent text-indigo-400 hover:text-white'}`}>
              {t}
            </button>
          ))}
          {submitResult && (
            <button onClick={() => setActiveTab('result')}
              className={`px-4 py-2.5 text-xs font-medium capitalize transition-all border-b-2 ${activeTab === 'result' ? 'border-indigo-500 text-white' : 'border-transparent text-indigo-400 hover:text-white'}`}>
              Result
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 text-sm">

          {activeTab === 'description' && (
            <div className="space-y-5">
              <div className="text-indigo-200 leading-relaxed whitespace-pre-wrap">{problem.description}</div>
              {problem.testCases?.filter(tc => !tc.isHidden).length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Examples</h3>
                  {problem.testCases.filter(tc => !tc.isHidden).map((tc, i) => (
                    <div key={i} className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-4 mb-3">
                      <p className="text-indigo-300 text-xs mb-1 font-medium">Example {i + 1}</p>
                      <p className="text-indigo-200 text-xs font-mono"><span className="text-indigo-400">Input:</span> {tc.input}</p>
                      <p className="text-indigo-200 text-xs font-mono mt-1"><span className="text-indigo-400">Output:</span> {tc.expectedOutput}</p>
                      {tc.explanation && <p className="text-indigo-400 text-xs mt-2">{tc.explanation}</p>}
                    </div>
                  ))}
                </div>
              )}
              {problem.companies?.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-2">Companies</h3>
                  <div className="flex flex-wrap gap-2">
                    {problem.companies.map(c => (
                      <span key={c} className="text-xs text-purple-300 bg-purple-900/20 border border-purple-700/30 px-2.5 py-1 rounded-lg capitalize">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && <SubmissionsTab slug={slug} />}

          {activeTab === 'hints' && (
            <div className="space-y-4">
              <p className="text-indigo-400 text-xs">Hints reveal progressively. Try solving on your own first!</p>
              {hints.map((hint, i) => (
                <div key={i} className="bg-yellow-900/10 border border-yellow-700/30 rounded-xl p-4">
                  <p className="text-yellow-400 text-xs font-medium mb-1">Hint {i + 1}</p>
                  <p className="text-yellow-100 text-sm">{hint}</p>
                </div>
              ))}
              {hintIdx < (problem?.hints?.length || 0) - 1 && (
                <button onClick={handleHint}
                  className="flex items-center gap-2 bg-yellow-900/20 border border-yellow-700/40 text-yellow-400 px-4 py-2.5 rounded-xl text-sm hover:bg-yellow-900/30 transition-all">
                  <Lightbulb className="w-4 h-4" /> {hints.length === 0 ? 'Get first hint' : 'Get next hint'}
                </button>
              )}
              {hints.length === problem?.hints?.length && hints.length > 0 && (
                <p className="text-indigo-400 text-xs text-center">All hints revealed</p>
              )}
            </div>
          )}

          {activeTab === 'result' && submitResult && (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${submitResult.status === 'accepted' ? 'bg-green-900/20 border-green-700/40' : 'bg-red-900/20 border-red-700/40'}`}>
                {submitResult.status === 'accepted' ? <CheckCircle className="w-6 h-6 text-green-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
                <div>
                  <p className={`font-bold capitalize ${submitResult.status === 'accepted' ? 'text-green-400' : 'text-red-400'}`}>{submitResult.status.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-indigo-400">{submitResult.testsPassed}/{submitResult.testsTotal} tests passed</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-3 text-center">
                  <Clock className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-sm">{submitResult.runtime}</p>
                  <p className="text-indigo-400 text-xs">Runtime</p>
                </div>
                <div className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-3 text-center">
                  <p className="text-white font-bold text-sm">{submitResult.memory || 'N/A'}</p>
                  <p className="text-indigo-400 text-xs">Memory</p>
                </div>
              </div>
              {submitResult.errorMessage && (
                <div className="bg-red-900/10 border border-red-700/30 rounded-xl p-3">
                  <p className="text-red-300 text-xs font-mono">{submitResult.errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Editor */}
      <div className="hidden lg:flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-900/40 bg-[#0f0e2a]/60 flex-shrink-0">
          <select value={language} onChange={e => setLanguage(e.target.value)}
            className="bg-indigo-900/30 border border-indigo-700/40 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none">
            {LANGUAGES.map(l => <option key={l.id} value={l.id} className="bg-[#1e1b4b]">{l.label}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={handleRun} disabled={running || submitting}
              className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-700/40 text-indigo-200 px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-900/60 disabled:opacity-50 transition-all">
              {running ? <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" /> : <Play className="w-3.5 h-3.5 text-green-400" />}
              Run
            </button>
            <button onClick={handleSubmit} disabled={running || submitting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 transition-all">
              {submitting ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            value={code}
            onChange={val => setCode(val || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: 'Fira Code, monospace',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              padding: { top: 16, bottom: 16 },
              suggestOnTriggerCharacters: true,
              tabSize: 2,
            }}
          />
        </div>

        <div className="h-48 border-t border-indigo-900/40 flex flex-shrink-0">
          <div className="flex-1 flex flex-col border-r border-indigo-900/40">
            <p className="text-indigo-400 text-xs px-4 py-2 border-b border-indigo-900/40 font-medium">Custom Input</p>
            <textarea value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="Enter test input..."
              className="flex-1 bg-transparent text-white text-xs font-mono p-4 focus:outline-none resize-none placeholder-indigo-600" />
          </div>
          <div className="flex-1 flex flex-col">
            <p className="text-indigo-400 text-xs px-4 py-2 border-b border-indigo-900/40 font-medium">Output</p>
            <div className="flex-1 overflow-y-auto p-4">
              {output ? (
                <pre className={`text-xs font-mono whitespace-pre-wrap ${output.type === 'error' ? 'text-red-300' : 'text-green-300'}`}>
                  {output.output || 'No output'}
                  {output.runtime && <span className="text-indigo-400 block mt-2">⏱ {output.runtime}ms</span>}
                </pre>
              ) : (
                <p className="text-indigo-600 text-xs">Run your code to see output</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Code2 className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
          <p className="text-white font-semibold">Code Editor</p>
          <p className="text-indigo-400 text-sm mt-2">Open on desktop for the full coding experience</p>
        </div>
      </div>
    </div>
  );
}