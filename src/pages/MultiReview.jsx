


import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Upload, FileCode, Play,
  ChevronDown, ChevronUp, Zap, FolderOpen,
  AlertTriangle, CheckCircle, Info, XCircle,
  Github, MessageCircle, Send, Bot, User,
  Loader, Terminal, RotateCcw
} from "lucide-react";
import CodeEditor from "../components/Editor/CodeEditor";
import { runCode } from "../services/judgeService";
import toast from "react-hot-toast";
import GitHubPanel from "../components/GitHub/GitHubPanel";
import ReactMarkdown from "react-markdown";
import { useSearchParams } from "react-router-dom";

const LANGUAGES = [
  "auto", "javascript", "typescript", "python", "java", "c", "cpp",
  "csharp", "go", "rust", "php", "ruby", "swift", "kotlin", "bash"
];

const DEFAULT_FILE = { name: "file1.js", code: "// Paste your code here...\n", language: "auto" };

const detectLanguage = (code) => {
  if (!code || !code.trim()) return "javascript";
  if (code.includes("public class") || code.includes("System.out") || code.includes("import java.")) return "java";
  if (code.includes("#include") && (code.includes("cout") || code.includes("cin"))) return "cpp";
  if (code.includes("#include") && code.includes("printf")) return "c";
  if (code.includes("def ") || (code.includes("print(") && !code.includes("{"))) return "python";
  if (code.includes("func ") && code.includes("fmt.")) return "go";
  if (code.includes("fn main()") || code.includes("println!")) return "rust";
  return "javascript";
};

const BASE_URL = import.meta.env.VITE_API_URL;
// ============================
// AI CHAT COMPONENT
// ============================
function AIChatPanel({ code, fileName, onClose, onApplyFix }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Namaste! 👋 Main **${fileName}** ke baare mein help karunga. Code fix, explain, optimize — kuch bhi pooch!` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null); // ✅ chatId add kiya
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const token = localStorage.getItem("token");
      const response =  await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          code: code || "",
          chatId: chatId || null, // ✅ chatId pass karo
          history: newMessages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.chunk) {
              fullText += data.chunk;
              setMessages(prev => prev.map((m, i) =>
                i === prev.length - 1 && m.streaming ? { ...m, content: fullText } : m
              ));
              scrollToBottom();
            }
            if (data.done) {
              if (data.chatId) setChatId(data.chatId); // ✅ chatId save karo
              setMessages(prev => prev.map((m, i) =>
                i === prev.length - 1 && m.streaming ? { ...m, streaming: false } : m
              ));
            }
          } catch {}
        }
      }
    } catch {
      toast.error("Chat failed!");
      setMessages(prev => prev.filter(m => !m.streaming));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const extractCode = (content) => {
    const match = content.match(/```[\w]*\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  return (
    <div className="flex flex-col bg-[#0a0a0f] border-l border-[#1e1e2e]" style={{ height: "100%", minHeight: 0 }}>
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#1e1e2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-indigo-400" />
          <div>
            <p className="text-xs font-semibold text-white">AI Chat</p>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{fileName}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300">
          <X size={14} />
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 p-3 space-y-3 overflow-y-scroll"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center ${
              msg.role === "user"
                ? "bg-indigo-500/20 border border-indigo-500/30"
                : "bg-cyan-500/20 border border-cyan-500/30"
            }`}>
              {msg.role === "user"
                ? <User size={11} className="text-indigo-400" />
                : <Bot size={11} className="text-cyan-400" />
              }
            </div>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
              msg.role === "user"
                ? "bg-indigo-600/20 border border-indigo-500/20 text-gray-200"
                : "bg-[#111118] border border-[#1e1e2e] text-gray-300"
            }`}>
              <div className="prose prose-invert prose-xs max-w-none">
                <ReactMarkdown>{msg.content || ""}</ReactMarkdown>
              </div>
              {msg.streaming && (
                <span className="inline-block w-1.5 h-3 bg-cyan-500 ml-0.5 animate-pulse" />
              )}
              {msg.role === "assistant" && !msg.streaming && extractCode(msg.content) && (
                <button
                  onClick={() => { onApplyFix(extractCode(msg.content)); toast.success("Fix applied! ✅"); }}
                  className="mt-2 w-full py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs hover:bg-green-500/30 transition"
                >
                  ✅ Apply Fix to Editor
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {messages.length === 1 && (
        <div className="flex-shrink-0 px-3 pb-2 flex flex-wrap gap-1">
          {["Fix issues", "Explain code", "Optimize karo", "Add comments"].map((p, i) => (
            <button
              key={i}
              onClick={() => { setInput(p); inputRef.current?.focus(); }}
              className="px-2 py-1 rounded-lg border border-[#1e1e2e] text-xs text-gray-500 hover:text-gray-300 transition"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="flex-shrink-0 px-3 py-3 border-t border-[#1e1e2e]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder="Pooch kuch bhi..."
            rows={2}
            className="flex-1 bg-[#111118] border border-[#1e1e2e] focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none transition resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition"
          >
            {loading ? <Loader size={13} className="animate-spin" /> : <Send size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================
// TERMINAL COMPONENT
// ============================
function TerminalPanel({ code, language, onClose }) {
  const [output, setOutput] = useState(null);
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState([]);
  const [currentInput, setCurrentInput] = useState("");

  const handleRun = async () => {
    if (!code?.trim()) { toast.error("Pehle code likho!"); return; }
    setRunning(true);
    const lang = language === "auto" ? detectLanguage(code) : language;
    const finalStdin = stdin + (currentInput ? currentInput + "\n" : "");
    try {
      const result = await runCode(code, lang, finalStdin);
      if (result.error) {
        setLines(prev => [...prev, { type: "error", text: result.error }]);
      } else {
        setLines(prev => [...prev, { type: "output", text: result.output || "No output" }]);
      }
      setOutput(result);
    } catch (err) {
      toast.error("Run failed: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter") {
      setLines(prev => [...prev, { type: "input", text: currentInput }]);
      setStdin(prev => prev + currentInput + "\n");
      setCurrentInput("");
    }
  };

  const handleClear = () => {
    setLines([]);
    setStdin("");
    setOutput(null);
    setCurrentInput("");
  };

  return (
    <div className="flex flex-col bg-[#0a0a0f] border-t border-[#1e1e2e] flex-shrink-0" style={{ height: "220px" }}>
      <div className="flex-shrink-0 px-4 py-2 border-b border-[#1e1e2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-green-400" />
          <span className="text-xs font-medium text-white">Terminal</span>
          {output && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              output.error ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
            }`}>
              {output.error ? "Error" : "Success"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRun} disabled={running} className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-400 text-xs transition disabled:opacity-50">
            {running ? <Loader size={11} className="animate-spin" /> : <Play size={11} />}
            {running ? "Running..." : "Run"}
          </button>
          <button onClick={handleClear} className="p-1 rounded hover:bg-white/5 text-gray-600 hover:text-gray-400">
            <RotateCcw size={12} />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5 text-gray-600 hover:text-gray-400">
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1" style={{ minHeight: 0 }}>
        {lines.length === 0 && !running && (
          <p className="text-gray-600">Run dabao ya input likho → Enter → Run ✅</p>
        )}
        {running && (
          <div className="flex items-center gap-2 text-indigo-400">
            <Loader size={11} className="animate-spin" />
            <span>Running...</span>
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} className={
            line.type === "input" ? "text-yellow-400" :
            line.type === "error" ? "text-red-400" :
            "text-green-400"
          }>
            {line.type === "input" ? `> ${line.text}` : line.text}
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 px-3 py-2 border-t border-[#1e1e2e] flex items-center gap-2">
        <span className="text-green-400 text-xs font-mono">$</span>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleInputSubmit}
          placeholder="Input likho → Enter"
          className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none font-mono"
        />
        <button onClick={handleRun} disabled={running} className="flex items-center gap-1 px-2 py-1 rounded bg-green-600/20 border border-green-500/30 text-green-400 text-xs disabled:opacity-50">
          <Play size={10} /> Run
        </button>
      </div>
    </div>
  );
}

// ============================
// MAIN COMPONENT
// ============================
export default function MultiReview() {
  const [files, setFiles] = useState([{ ...DEFAULT_FILE }]);
  const [activeTab, setActiveTab] = useState(0);
  const [results, setResults] = useState({});
  const [fileStreams, setFileStreams] = useState({});
  const [currentFile, setCurrentFile] = useState(null);
  const [avgScore, setAvgScore] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [expandedResults, setExpandedResults] = useState({});
  const [showGitHub, setShowGitHub] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const dropRef = useRef(null);
  const [searchParams] = useSearchParams(); // ✅

  // ✅ History se load karo
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) loadFromHistory(id);
  }, []);

  // ✅ loadFromHistory
  const loadFromHistory = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.review) {
        const fileName = data.review.title.replace("[MULTI] ", "");
        setFiles([{
          name: fileName,
          code: data.review.code || "",
          language: data.review.language || "auto"
        }]);
        setResults({ [fileName]: data.review });
        setExpandedResults({ [fileName]: true });
        toast.success("Review loaded! ✅");
      }
    } catch {
      toast.error("History load nahi hui");
    }
  };

  const addFile = () => {
    const newFile = { name: `file${files.length + 1}.js`, code: "// Paste your code here...\n", language: "auto" };
    setFiles([...files, newFile]);
    setActiveTab(files.length);
  };

  const removeFile = (index) => {
    if (files.length === 1) { toast.error("Kam se kam ek file chahiye!"); return; }
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setActiveTab(Math.min(activeTab, newFiles.length - 1));
  };

  const updateFile = (index, key, value) => {
    const newFiles = [...files];
    newFiles[index] = { ...newFiles[index], [key]: value };
    setFiles(newFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const ext = file.name.split(".").pop();
        const langMap = {
          js: "javascript", ts: "typescript", py: "python",
          java: "java", cpp: "cpp", c: "c", cs: "csharp",
          go: "go", rs: "rust", php: "php", rb: "ruby",
          kt: "kotlin", swift: "swift", sh: "bash"
        };
        setFiles(prev => [...prev, { name: file.name, code: ev.target.result, language: langMap[ext] || "auto" }]);
        setActiveTab(files.length);
        toast.success(`${file.name} added! ✅`);
      };
      reader.readAsText(file);
    });
  };

  const startReview = async () => {
    const validFiles = files.filter(f => f.code.trim() && f.code.trim() !== "// Paste your code here...");
    if (validFiles.length === 0) { toast.error("Pehle code paste karo!"); return; }

    setReviewing(true);
    setResults({});
    setFileStreams({});
    setAvgScore(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/multi-review/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ files: validFiles }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.fileStart) { setCurrentFile(data.fileName); toast(`📝 Reviewing ${data.fileName}... (${data.index + 1}/${data.total})`); }
            if (data.chunk) { setFileStreams(prev => ({ ...prev, [data.fileIndex]: (prev[data.fileIndex] || "") + data.chunk })); }
            if (data.fileDone) { setResults(prev => ({ ...prev, [data.fileName]: data.review })); setExpandedResults(prev => ({ ...prev, [data.fileName]: true })); }
            if (data.allDone) { setAvgScore(data.avgScore); setCurrentFile(null); toast.success(`All files reviewed! Avg Score: ${data.avgScore} 🎉`); }
            if (data.error) toast.error(data.error);
          } catch {}
        }
      }
    } catch { toast.error("Review failed!"); }
    finally { setReviewing(false); setCurrentFile(null); }
  };

  const getScoreColor = (score) => score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
  const getScoreBg = (score) => score >= 80 ? "bg-green-500/10 border-green-500/20" : score >= 60 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20";
  const severityIcon = (s) => s === "critical" ? <XCircle size={12} className="text-red-400" /> : s === "warning" ? <AlertTriangle size={12} className="text-yellow-400" /> : <Info size={12} className="text-blue-400" />;

  const activeFile = files[activeTab];

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#1e1e2e] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderOpen size={16} className="text-indigo-400" />
          <h1 className="text-sm font-semibold text-white">Multi File Review</h1>
          <span className="text-xs text-gray-500 px-2 py-0.5 rounded-full bg-white/5">{files.length} files</span>
        </div>
        <div className="flex items-center gap-2">
          {avgScore !== null && (
            <div className={`px-3 py-1 rounded-lg border text-xs font-bold ${getScoreBg(avgScore)} ${getScoreColor(avgScore)}`}>
              Avg: {avgScore}
            </div>
          )}
          <button onClick={() => setShowTerminal(!showTerminal)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${showTerminal ? "bg-green-500/20 border-green-500/40 text-green-400" : "border-[#1e1e2e] text-gray-400 hover:border-green-500/50 hover:text-green-400"}`}>
            <Terminal size={13} /> Terminal
          </button>
          <button onClick={() => setShowChat(!showChat)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${showChat ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400" : "border-[#1e1e2e] text-gray-400 hover:border-indigo-500/50 hover:text-indigo-400"}`}>
            <MessageCircle size={13} /> AI Chat
          </button>
          <button onClick={() => setShowGitHub(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] hover:border-gray-500 text-gray-400 hover:text-white text-xs transition">
            <Github size={13} /> GitHub
          </button>
          <button onClick={addFile} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e1e2e] hover:border-indigo-500/50 text-gray-400 hover:text-indigo-400 text-xs transition">
            <Plus size={13} /> Add File
          </button>
          <button onClick={startReview} disabled={reviewing} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition">
            {reviewing ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={13} />}
            {reviewing ? `Reviewing ${currentFile || "..."}` : "Review All"}
          </button>
        </div>
      </div>

      <div className={`flex-1 grid overflow-hidden ${showChat ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"}`} style={{ minHeight: 0 }}>

        {/* LEFT — Editor */}
        <div className="flex flex-col overflow-hidden border-r border-[#1e1e2e]" style={{ minHeight: 0 }}>
          <div className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 border-b border-[#1e1e2e] overflow-x-auto">
            {files.map((file, i) => (
              <div key={i} onClick={() => setActiveTab(i)} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs cursor-pointer flex-shrink-0 transition group ${activeTab === i ? "bg-indigo-600/20 border border-indigo-500/40 text-indigo-300" : "border border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"}`}>
                <FileCode size={11} />
                <input type="text" value={file.name} onChange={(e) => updateFile(i, "name", e.target.value)} onClick={(e) => e.stopPropagation()} className="bg-transparent outline-none w-20 text-xs" />
                {results[file.name] && (
                  <span className={`text-xs font-bold ${getScoreColor(results[file.name].score)}`}>{results[file.name].score}</span>
                )}
                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition">
                  <X size={10} />
                </button>
              </div>
            ))}
            <button onClick={addFile} className="flex-shrink-0 p-1 rounded-lg hover:bg-white/5 text-gray-600 hover:text-gray-400 transition">
              <Plus size={13} />
            </button>
          </div>

          <div className="flex-shrink-0 px-4 py-2 border-b border-[#1e1e2e] flex items-center gap-2">
            <FileCode size={13} className="text-indigo-400" />
            <select value={activeFile?.language || "auto"} onChange={(e) => updateFile(activeTab, "language", e.target.value)} className="text-xs px-2 py-1 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-gray-400 focus:outline-none focus:border-indigo-500 transition">
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang === "auto" ? "Auto Detect" : lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
              ))}
            </select>
            <span className="text-xs text-gray-600 font-mono ml-auto">{activeFile?.code?.split("\n").length || 0} lines</span>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
            <div ref={dropRef} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="flex-1 overflow-auto" style={{ minHeight: 0 }}>
              <CodeEditor
                code={activeFile?.code || ""}
                onChange={(val) => updateFile(activeTab, "code", val)}
                language={activeFile?.language || "auto"}
                onLanguageChange={(lang) => updateFile(activeTab, "language", lang)}
                fillHeight={true}
              />
            </div>
            {showTerminal && (
              <TerminalPanel code={activeFile?.code || ""} language={activeFile?.language || "auto"} onClose={() => setShowTerminal(false)} />
            )}
          </div>

          <div className="flex-shrink-0 px-4 py-2 border-t border-[#1e1e2e] flex items-center gap-2">
            <Upload size={12} className="text-gray-600" />
            <span className="text-xs text-gray-600">Files drag & drop karo ya tabs se add karo</span>
          </div>
        </div>

        {/* MIDDLE — Results */}
        <div className="flex flex-col overflow-hidden border-r border-[#1e1e2e]" style={{ minHeight: 0 }}>
          <div className="flex-shrink-0 px-4 py-2.5 border-b border-[#1e1e2e]">
            <h2 className="text-sm font-semibold text-white">📊 Review Results</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
            {Object.keys(results).length === 0 && !reviewing && (
              <div className="h-[400px] flex items-center justify-center text-gray-600">
                <div className="text-center space-y-3">
                  <FolderOpen size={40} className="mx-auto opacity-20" />
                  <p className="text-sm">Files add karo aur Review All click karo</p>
                </div>
              </div>
            )}

            {reviewing && Object.entries(fileStreams).map(([idx, text]) => {
              const fileName = files[parseInt(idx)]?.name;
              if (results[fileName]) return null;
              return (
                <div key={idx} className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs text-indigo-400 font-medium">Reviewing {fileName}...</span>
                  </div>
                  <pre className="text-xs text-gray-500 font-mono whitespace-pre-wrap max-h-20 overflow-hidden">{text.slice(-200)}</pre>
                </div>
              );
            })}

            {Object.entries(results).map(([fileName, review]) => (
              <motion.div key={fileName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-[#1e1e2e] overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/2 transition" onClick={() => setExpandedResults(prev => ({ ...prev, [fileName]: !prev[fileName] }))}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-sm flex-shrink-0 ${getScoreBg(review.score)} ${getScoreColor(review.score)}`}>
                      {review.score}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{fileName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{review.summary?.slice(0, 60)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">{review.issues?.length || 0} issues</span>
                    {expandedResults[fileName] ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedResults[fileName] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-[#1e1e2e]">
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-gray-400">{review.summary}</p>
                        {review.issues?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-white">Issues ({review.issues.length})</p>
                            {review.issues.map((issue, i) => (
                              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/3 border border-[#1e1e2e]">
                                {severityIcon(issue.severity)}
                                <div>
                                  <p className="text-xs text-gray-300">{issue.message}</p>
                                  {issue.suggestion && <p className="text-xs text-gray-500 mt-0.5">💡 {issue.suggestion}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {review.positives?.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-white">✅ What's Good</p>
                            {review.positives.map((p, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-green-400">
                                <CheckCircle size={10} /> {p}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT — AI Chat */}
        {showChat && (
          <AIChatPanel
            code={activeFile?.code || ""}
            fileName={activeFile?.name || "file"}
            onClose={() => setShowChat(false)}
            onApplyFix={(fixedCode) => updateFile(activeTab, "code", fixedCode)}
          />
        )}
      </div>

      <AnimatePresence>
        {showGitHub && (
          <GitHubPanel
            onFileSelect={(newFiles) => {
              setFiles(prev => [...prev, ...newFiles]);
              setActiveTab(files.length);
            }}
            onClose={() => setShowGitHub(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
