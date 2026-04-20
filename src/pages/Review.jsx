// import { useState, useRef, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useReview } from "../hooks/useReview";
// import { useSearchParams } from "react-router-dom";
// import CodeEditor from "../components/Editor/CodeEditor";
// import ReviewPanel from "../components/ReviewPanel/ReviewPanel";
// import ChatPanel from "../components/Chat/ChatPanel";
// import { exportJSON, exportPDF } from "../services/exportService";
// import { runCode } from "../services/judgeService";
// import {
//   Zap, RotateCcw, Download, FileJson,
//   Mic, MicOff, MessageSquare, X, Sparkles, MessageCircle
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import toast from "react-hot-toast";

// const AI_ENGINES = [
//   { value: "groq", label: "⚡ Groq (Fast)" },
//   { value: "claude", label: "🧠 Claude (Smart)" },
// ];

// export default function Review() {
//   const { user } = useAuth();
//   const [code, setCode] = useState("// Paste your code here...\n");
//   const [language, setLanguage] = useState("auto");
//   const [aiEngine, setAiEngine] = useState(user?.preferredAI || "groq");
//   const [customPrompt, setCustomPrompt] = useState("");
//   const [showPrompt, setShowPrompt] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [runOutput, setRunOutput] = useState(null);
//   const [showChat, setShowChat] = useState(false);
//   const recognitionRef = useRef(null);
//   const [searchParams] = useSearchParams();

//   const {
//     loading, streamText, result, mode,
//     submitReview, submitPrompt, resetReview, loadFromHistory,
//   } = useReview();

//   useEffect(() => {
//     const id = searchParams.get("id");
//     if (id) loadFromHistory(id);
//   }, []);

//   const isBusy = loading || !!streamText;

//   const handleReview = () => submitReview({ code, language, aiEngine });

//   const handleRunPrompt = () => {
//     if (!customPrompt.trim()) { toast.error("Prompt likho!"); return; }
//     submitPrompt({ code, language, userPrompt: customPrompt });
//     setCustomPrompt("");
//     setShowPrompt(false);
//   };

//   const handleRunCode = (stdin = "") => {
//     if (code?.trim()) {
//       const lang = language === "auto" ? "javascript" : language;
//       runCode(code, lang, stdin)
//         .then((output) => setRunOutput(output))
//         .catch((err) => toast.error("Run failed: " + err.message));
//     }
//   };

//   const handleReset = () => {
//     setCode("// Paste your code here...\n");
//     setCustomPrompt("");
//     setShowPrompt(false);
//     setRunOutput(null);
//     setShowChat(false);
//     resetReview();
//   };

//   const toggleVoice = () => {
//     if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
//       toast.error("Browser voice support nahi hai!"); return;
//     }
//     if (isListening) {
//       recognitionRef.current?.stop();
//       setIsListening(false); return;
//     }
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     const recognition = new SpeechRecognition();
//     recognitionRef.current = recognition;
//     recognition.lang = "en-US";
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.onstart = () => setIsListening(true);
//     recognition.onresult = (event) => {
//       const transcript = event.results[0][0].transcript.toLowerCase();
//       handleVoiceCommand(transcript);
//     };
//     recognition.onend = () => setIsListening(false);
//     recognition.onerror = () => setIsListening(false);
//     recognition.start();
//   };

//   const handleVoiceCommand = (transcript) => {
//     if (transcript.includes("review") || transcript.includes("analyze")) {
//       handleReview(); toast.success(`🎤 Reviewing!`);
//     } else if (transcript.includes("reset") || transcript.includes("clear")) {
//       handleReset(); toast.success(`🎤 Reset!`);
//     } else if (transcript.includes("export") || transcript.includes("download")) {
//       if (result) exportJSON(result); toast.success(`🎤 Exported!`);
//     } else {
//       setCustomPrompt(transcript); setShowPrompt(true);
//       toast.success(`🎤 Prompt set: "${transcript}"`);
//     }
//   };

//   return (
//     <div className="h-full bg-[#0a0a0f] flex flex-col overflow-hidden">

//       {/* TOP BAR */}
//       <div className="flex-shrink-0 px-4 py-3 border-b border-[#1e1e2e] flex flex-wrap items-center justify-between gap-3">
//         <div className="flex items-center gap-2">
//           {AI_ENGINES.map((e) => (
//             <button
//               key={e.value}
//               onClick={() => setAiEngine(e.value)}
//               className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
//                 aiEngine === e.value
//                   ? "bg-indigo-600 border-indigo-600 text-white"
//                   : "border-[#1e1e2e] text-gray-400 hover:border-indigo-500 hover:text-white"
//               }`}
//             >
//               {e.label}
//             </button>
//           ))}

//           <button
//             onClick={() => setShowPrompt(!showPrompt)}
//             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
//               showPrompt || customPrompt
//                 ? "bg-cyan-600/20 border-cyan-500/40 text-cyan-400"
//                 : "border-[#1e1e2e] text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
//             }`}
//           >
//             <MessageSquare size={12} />
//             {customPrompt ? "Prompt Set ✓" : "Add Prompt"}
//           </button>
//         </div>

//         <div className="flex items-center gap-2">
//           {result && (
//             <>
//               <button
//                 onClick={() => exportJSON(result)}
//                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] hover:border-indigo-500 text-gray-400 hover:text-white text-xs transition"
//               >
//                 <FileJson size={13} /> JSON
//               </button>
//               <button
//                 onClick={() => exportPDF("review-result", result.title)}
//                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] hover:border-indigo-500 text-gray-400 hover:text-white text-xs transition"
//               >
//                 <Download size={13} /> PDF
//               </button>
//             </>
//           )}

//           <button
//             onClick={() => setShowChat(!showChat)}
//             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
//               showChat
//                 ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400"
//                 : "border-[#1e1e2e] text-gray-400 hover:border-indigo-500 hover:text-indigo-400"
//             }`}
//           >
//             <MessageCircle size={13} /> AI Chat
//           </button>

//           <button
//             onClick={toggleVoice}
//             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
//               isListening
//                 ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
//                 : "border-[#1e1e2e] text-gray-400 hover:border-purple-500 hover:text-purple-400"
//             }`}
//           >
//             {isListening ? <MicOff size={13} /> : <Mic size={13} />}
//             {isListening ? "Listening..." : "Voice"}
//           </button>

//           <button
//             onClick={handleReset}
//             className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] hover:border-red-500/50 text-gray-400 hover:text-red-400 text-xs transition"
//           >
//             <RotateCcw size={13} /> Reset
//           </button>

//           {customPrompt && (
//             <button
//               onClick={handleRunPrompt}
//               disabled={isBusy}
//               className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium transition"
//             >
//               {isBusy
//                 ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                 : <Sparkles size={13} />
//               }
//               {isBusy ? "Running..." : "Run Prompt"}
//             </button>
//           )}

//           <button
//             onClick={handleReview}
//             disabled={isBusy || !!customPrompt}
//             className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg disabled:opacity-50 text-white text-xs font-medium transition ${
//               customPrompt ? "bg-gray-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"
//             }`}
//           >
//             {isBusy && !customPrompt
//               ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//               : <Zap size={13} />
//             }
//             {isBusy && !customPrompt ? "Reviewing..." : "Review Code"}
//           </button>
//         </div>
//       </div>

//       {/* PROMPT BAR */}
//       <AnimatePresence>
//         {showPrompt && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="flex-shrink-0 px-4 py-2.5 border-b border-[#1e1e2e] bg-cyan-500/5 flex items-center gap-3"
//           >
//             <MessageSquare size={14} className="text-cyan-400 flex-shrink-0" />
//             <input
//               type="text"
//               value={customPrompt}
//               onChange={(e) => setCustomPrompt(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   e.preventDefault();
//                   e.stopPropagation();
//                   if (customPrompt.trim()) handleRunPrompt();
//                 }
//               }}
//               placeholder="e.g. write story for lion, convert to python, generate rent calculator..."
//               className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none"
//               autoFocus
//             />
//             {customPrompt && (
//               <button onClick={() => setCustomPrompt("")} className="text-gray-600 hover:text-gray-400 transition">
//                 <X size={14} />
//               </button>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* VOICE BAR */}
//       <AnimatePresence>
//         {isListening && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="flex-shrink-0 px-4 py-2 border-b border-[#1e1e2e] bg-purple-500/5"
//           >
//             <div className="flex items-center gap-4 text-xs text-gray-500">
//               <span className="text-purple-400 font-medium flex items-center gap-1">
//                 <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
//                 Listening...
//               </span>
//               <span>
//                 Say: <span className="text-gray-300">"review"</span> ·{" "}
//                 <span className="text-gray-300">"reset"</span> ·{" "}
//                 <span className="text-gray-300">"export"</span> · or any prompt
//               </span>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* MAIN */}
//       <div className={`flex-1 grid overflow-hidden ${
//         showChat ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"
//       }`}>

//         {/* Left — Code Editor */}
//         <div className="flex flex-col overflow-hidden border-r border-[#1e1e2e]">
//           <div className="flex-shrink-0 px-4 py-2.5 border-b border-[#1e1e2e]">
//             <h2 className="text-sm font-semibold text-white">Code Editor</h2>
//           </div>
//           <div className="flex-1 overflow-hidden">
//             <CodeEditor
//               code={code}
//               onChange={setCode}
//               language={language}
//               onLanguageChange={setLanguage}
//               fillHeight={true}
//               onRunResult={(output) => setRunOutput(output)}
//             />
//           </div>
//         </div>

//         {/* Middle — Review Results */}
//         <div className="flex flex-col overflow-hidden border-r border-[#1e1e2e]">
//           <div className="flex-shrink-0 px-4 py-2.5 border-b border-[#1e1e2e]">
//             <h2 className="text-sm font-semibold text-white">
//               {mode === "prompt" ? "✨ AI Output" : "🔍 Review Results"}
//             </h2>
//           </div>
//           <div className="flex-1 overflow-y-auto p-4">
//             <ReviewPanel
//               result={result}
//               loading={loading}
//               streamText={streamText}
//               mode={mode}
//               originalCode={code}
//               runOutput={runOutput}
//               onRunCode={handleRunCode}
//               onApplyFix={(fixedCode) => {
//                 setCode(fixedCode);
//                 if (fixedCode.includes("def ") || fixedCode.includes("print(")) setLanguage("python");
//                 else if (fixedCode.includes("public class")) setLanguage("java");
//                 else if (fixedCode.includes("func ")) setLanguage("go");
//                 else if (fixedCode.includes("#include")) setLanguage("cpp");
//                 else setLanguage("javascript");
//               }}
//             />
//           </div>
//         </div>

//         {/* ✅ Right — AI Chat Panel */}
//         {showChat && (
//           <div className="flex flex-col overflow-hidden border-l border-[#1e1e2e]">
//             <ChatPanel
//               code={code}
//               reviewResult={result}
//               onClose={() => setShowChat(false)}
//             />
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }


import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useReview } from "../hooks/useReview";
import { useSearchParams } from "react-router-dom";
import CodeEditor from "../components/Editor/CodeEditor";
import ReviewPanel from "../components/ReviewPanel/ReviewPanel";
import ChatPanel from "../components/Chat/ChatPanel";
import { exportJSON, exportPDF } from "../services/exportService";
import { runCode } from "../services/judgeService";
import {
  Zap, RotateCcw, Download, FileJson,
  Mic, MicOff, MessageSquare, X, Sparkles, MessageCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const AI_ENGINES = [
  { value: "groq", label: "⚡ Groq (Fast)" },
  { value: "claude", label: "🧠 Claude (Smart)" },
];

export default function Review() {
  const { user } = useAuth();
  const [code, setCode] = useState("// Paste your code here...\n");
  const [language, setLanguage] = useState("auto");
  const [aiEngine, setAiEngine] = useState(user?.preferredAI || "groq");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [runOutput, setRunOutput] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const recognitionRef = useRef(null);
  const [searchParams] = useSearchParams();

  const {
    loading, streamText, result, mode,
    submitReview, submitPrompt, resetReview, loadFromHistory,
  } = useReview();

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) loadFromHistory(id);
  }, []);

  const isBusy = loading || !!streamText;

  const handleReview = () => submitReview({ code, language, aiEngine });

  const handleRunPrompt = () => {
    if (!customPrompt.trim()) { toast.error("Prompt likho!"); return; }
    submitPrompt({ code, language, userPrompt: customPrompt });
    setCustomPrompt("");
    setShowPrompt(false);
  };

  const handleRunCode = (stdin = "") => {
    if (code?.trim()) {
      const lang = language === "auto" ? "javascript" : language;
      runCode(code, lang, stdin)
        .then((output) => setRunOutput(output))
        .catch((err) => toast.error("Run failed: " + err.message));
    }
  };

  const handleReset = () => {
    setCode("// Paste your code here...\n");
    setCustomPrompt("");
    setShowPrompt(false);
    setRunOutput(null);
    setShowChat(false);
    resetReview();
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast.error("Browser voice support nahi hai!"); return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false); return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      handleVoiceCommand(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const handleVoiceCommand = (transcript) => {
    if (transcript.includes("review") || transcript.includes("analyze")) {
      handleReview(); toast.success(`🎤 Reviewing!`);
    } else if (transcript.includes("reset") || transcript.includes("clear")) {
      handleReset(); toast.success(`🎤 Reset!`);
    } else if (transcript.includes("export") || transcript.includes("download")) {
      if (result) exportJSON(result); toast.success(`🎤 Exported!`);
    } else {
      setCustomPrompt(transcript); setShowPrompt(true);
      toast.success(`🎤 Prompt set: "${transcript}"`);
    }
  };

  return (
    <div className="h-full bg-[#0a0a0f] flex flex-col overflow-hidden">

      {/* TOP BAR */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#1e1e2e] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {AI_ENGINES.map((e) => (
            <button
              key={e.value}
              onClick={() => setAiEngine(e.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                aiEngine === e.value
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "border-[#1e1e2e] text-gray-400 hover:border-indigo-500 hover:text-white"
              }`}
            >
              {e.label}
            </button>
          ))}
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
              showPrompt || customPrompt
                ? "bg-cyan-600/20 border-cyan-500/40 text-cyan-400"
                : "border-[#1e1e2e] text-gray-400 hover:border-cyan-500 hover:text-cyan-400"
            }`}
          >
            <MessageSquare size={12} />
            {customPrompt ? "Prompt Set ✓" : "Add Prompt"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <>
              <button onClick={() => exportJSON(result)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] hover:border-indigo-500 text-gray-400 hover:text-white text-xs transition">
                <FileJson size={13} /> JSON
              </button>
              <button onClick={() => exportPDF("review-result", result.title)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] hover:border-indigo-500 text-gray-400 hover:text-white text-xs transition">
                <Download size={13} /> PDF
              </button>
            </>
          )}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              showChat ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400" : "border-[#1e1e2e] text-gray-400 hover:border-indigo-500 hover:text-indigo-400"
            }`}
          >
            <MessageCircle size={13} /> AI Chat
          </button>
          <button
            onClick={toggleVoice}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              isListening ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse" : "border-[#1e1e2e] text-gray-400 hover:border-purple-500 hover:text-purple-400"
            }`}
          >
            {isListening ? <MicOff size={13} /> : <Mic size={13} />}
            {isListening ? "Listening..." : "Voice"}
          </button>
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] hover:border-red-500/50 text-gray-400 hover:text-red-400 text-xs transition">
            <RotateCcw size={13} /> Reset
          </button>
          {customPrompt && (
            <button onClick={handleRunPrompt} disabled={isBusy} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium transition">
              {isBusy ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={13} />}
              {isBusy ? "Running..." : "Run Prompt"}
            </button>
          )}
          <button
            onClick={handleReview}
            disabled={isBusy || !!customPrompt}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg disabled:opacity-50 text-white text-xs font-medium transition ${
              customPrompt ? "bg-gray-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            {isBusy && !customPrompt ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={13} />}
            {isBusy && !customPrompt ? "Reviewing..." : "Review Code"}
          </button>
        </div>
      </div>

      {/* PROMPT BAR */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-shrink-0 px-4 py-2.5 border-b border-[#1e1e2e] bg-cyan-500/5 flex items-center gap-3"
          >
            <MessageSquare size={14} className="text-cyan-400 flex-shrink-0" />
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); if (customPrompt.trim()) handleRunPrompt(); } }}
              placeholder="e.g. write story for lion, convert to python, generate rent calculator..."
              className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none"
              autoFocus
            />
            {customPrompt && (
              <button onClick={() => setCustomPrompt("")} className="text-gray-600 hover:text-gray-400 transition">
                <X size={14} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* VOICE BAR */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex-shrink-0 px-4 py-2 border-b border-[#1e1e2e] bg-purple-500/5"
          >
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="text-purple-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Listening...
              </span>
              <span>Say: <span className="text-gray-300">"review"</span> · <span className="text-gray-300">"reset"</span> · <span className="text-gray-300">"export"</span> · or any prompt</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div className={`flex-1 grid overflow-hidden ${showChat ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`}>

        {/* Left — Code Editor */}
        <div className="flex flex-col overflow-hidden border-r border-[#1e1e2e]">
          <div className="flex-shrink-0 px-4 py-2.5 border-b border-[#1e1e2e]">
            <h2 className="text-sm font-semibold text-white">Code Editor</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
              onLanguageChange={setLanguage}
              fillHeight={true}
              onRunResult={(output) => setRunOutput(output)}
            />
          </div>
        </div>

        {/* Middle — Review Results */}
        <div className="flex flex-col overflow-hidden border-r border-[#1e1e2e]">
          <div className="flex-shrink-0 px-4 py-2.5 border-b border-[#1e1e2e]">
            <h2 className="text-sm font-semibold text-white">
              {mode === "prompt" ? "✨ AI Output" : "🔍 Review Results"}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ReviewPanel
              result={result}
              loading={loading}
              streamText={streamText}
              mode={mode}
              originalCode={code}
              runOutput={runOutput}
              onRunCode={handleRunCode}
              onApplyFix={(fixedCode) => {
                setCode(fixedCode);
                if (fixedCode.includes("def ") || fixedCode.includes("print(")) setLanguage("python");
                else if (fixedCode.includes("public class")) setLanguage("java");
                else if (fixedCode.includes("func ")) setLanguage("go");
                else if (fixedCode.includes("#include")) setLanguage("cpp");
                else setLanguage("javascript");
              }}
            />
          </div>
        </div>

        {/* ✅ Right — AI Chat Panel */}
        {showChat && (
          <div className="flex flex-col overflow-hidden border-l border-[#1e1e2e]">
            <ChatPanel
              code={code}
              reviewResult={result}
              onClose={() => setShowChat(false)}
              onApplyFix={(fixedCode) => {
                // ✅ AI Chat se fix apply karo
                setCode(fixedCode);
                if (fixedCode.includes("def ") || fixedCode.includes("print(")) setLanguage("python");
                else if (fixedCode.includes("public class")) setLanguage("java");
                else if (fixedCode.includes("func ")) setLanguage("go");
                else if (fixedCode.includes("#include")) setLanguage("cpp");
                else setLanguage("javascript");
                toast.success("Fix applied to editor! ✅");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}