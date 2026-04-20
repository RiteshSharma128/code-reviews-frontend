import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import ScoreCard from "./ScoreCard";
import IssueCard from "./IssueCard";
import { useState, useEffect, useRef } from "react"; // ✅ Fixed import

// ✅ Terminal component — ReviewPanel ke BAHAR
const OutputSection = ({ runOutput, onRunCode, stdin, setStdin }) => {
  const [lines, setLines] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const terminalRef = useRef(null);

  const outputLines = runOutput?.output
    ? runOutput.output.split("\n").filter(l => l.trim())
    : [];

  const errorLines = runOutput?.error
    ? runOutput.error.split("\n").filter(l => l.trim())
    : [];

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newLines = [...lines, { type: "input", text: currentInput }];
      setLines(newLines);
      const newStdin = newLines
        .filter(l => l.type === "input")
        .map(l => l.text)
        .join("\n");
      setStdin(newStdin);
      setCurrentInput("");
    }
  };

  // ✅ Sirf ek Run button — stdin ke saath hi run karo
  const handleRun = () => {
    setHasRun(true);
    onRunCode?.(stdin);
  };

  const handleReset = () => {
    setLines([]);
    setCurrentInput("");
    setStdin("");
    setHasRun(false);
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines, runOutput]);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-white flex items-center gap-2">
        ▶️ Terminal
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          runOutput?.error ? "bg-red-500/20 text-red-400"
          : runOutput?.output ? "bg-green-500/20 text-green-400"
          : "bg-gray-500/20 text-gray-400"
        }`}>
          {runOutput?.status || "Ready"}
        </span>
        {runOutput?.time && <span className="text-xs text-gray-500">{runOutput.time}s</span>}
      </h3>

      {/* Terminal Box */}
      <div
        ref={terminalRef}
        className="w-full min-h-[200px] max-h-[350px] overflow-y-auto p-3 rounded-lg border border-green-500/20 bg-[#0d1117] font-mono text-xs cursor-text"
        onClick={() => document.getElementById("terminal-input")?.focus()}
      >
        {!hasRun && (
          <div className="text-gray-500 mb-2">
            $ Input likho → Enter → Run dabao!
          </div>
        )}

        {outputLines.map((line, i) => (
          <div key={`out-${i}`} className="text-green-300 leading-5">{line}</div>
        ))}

        {errorLines.map((line, i) => (
          <div key={`err-${i}`} className="text-red-400 leading-5">{line}</div>
        ))}

        {lines.map((line, i) => (
          <div key={`inp-${i}`} className="text-yellow-300 leading-5">
            &gt; {line.text}
          </div>
        ))}

        <div className="flex items-center gap-1 text-yellow-300 leading-5">
          <span>&gt;</span>
          <input
            id="terminal-input"
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-yellow-300 font-mono text-xs caret-yellow-300"
          />
          <span className="animate-pulse">█</span>
        </div>
      </div>

      {/* ✅ Sirf 2 buttons — Run aur Clear */}
      <div className="flex gap-2">
        <button
          onClick={handleRun}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-400 text-xs font-medium transition"
        >
          ▶️ Run
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 text-xs font-medium transition"
        >
          🔄 Clear
        </button>
      </div>

      <p className="text-xs text-gray-600">
        💡 Input likho → Enter → Run dabao ✅
      </p>
    </div>
  );
};
export default function ReviewPanel({ result, loading, streamText, mode, originalCode, onApplyFix, runOutput, onRunCode }) {

  const [stdin, setStdin] = useState("");

  if (streamText) return (
    <div className="h-full rounded-xl border border-[#1e1e2e] bg-[#111118] p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <span className="text-xs text-indigo-400 font-medium">
          {mode === "prompt" ? "✨ AI kaam kar raha hai..." : "🔍 Reviewing..."}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
          {streamText}
          <span className="inline-block w-2 h-3 bg-indigo-500 ml-0.5 animate-pulse" />
        </pre>
      </div>
    </div>
  );

  if (loading) return (
    <div className="h-[500px] rounded-xl border border-[#1e1e2e] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">
          {mode === "prompt" ? "AI kaam kar raha hai..." : "AI review kar raha hai..."}
        </p>
      </div>
    </div>
  );

  if (!result) return (
    <div className="space-y-4">
      {onRunCode && (
        <OutputSection
          runOutput={runOutput}
          onRunCode={onRunCode}
          stdin={stdin}
          setStdin={setStdin}
        />
      )}
      {!onRunCode && (
        <div className="h-[500px] rounded-xl border border-dashed border-[#1e1e2e] flex items-center justify-center text-gray-600">
          <div className="text-center space-y-3">
            <Zap size={40} className="mx-auto opacity-20" />
            <p className="text-sm">Code review karo ya prompt do</p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
              <span>🔍 Review Code — code review</span>
              <span>✨ Run Prompt — kuch bhi karo</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (result.parseError) return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
        <p className="text-sm text-red-400">❌ AI response parse nahi hua. Dobara try karo.</p>
      </div>
      {onRunCode && (
        <OutputSection
          runOutput={runOutput}
          onRunCode={onRunCode}
          stdin={stdin}
          setStdin={setStdin}
        />
      )}
    </div>
  );

  if (mode === "prompt" || result.transformedCode) return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-cyan-400" />
            <span className="text-cyan-400 text-sm font-semibold">AI Response</span>
          </div>
          <p className="text-sm text-gray-300">{result.summary}</p>
        </div>

        {result.transformedCode && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-white">📝 Output</h3>
            <div className="relative">
              <pre className="p-4 rounded-lg border border-cyan-500/30 bg-[#0d1117] text-xs text-cyan-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                {result.transformedCode}
              </pre>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => { navigator.clipboard.writeText(result.transformedCode); toast.success("Copied! 📋"); }}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-gray-400 transition"
                >
                  Copy
                </button>
                {onApplyFix && (
                  <button
                    onClick={() => { onApplyFix(result.transformedCode); toast.success("Editor mein apply ho gaya! ✅"); }}
                    className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-xs text-cyan-400 transition"
                  >
                    Apply to Editor
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {onRunCode && (
          <OutputSection
            runOutput={runOutput}
            onRunCode={onRunCode}
            stdin={stdin}
            setStdin={setStdin}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );

  return (
    <AnimatePresence>
      <motion.div
        id="review-result"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <ScoreCard result={result} />

        {onRunCode && (
          <OutputSection
            runOutput={runOutput}
            onRunCode={onRunCode}
            stdin={stdin}
            setStdin={setStdin}
          />
        )}

        {result.transformedCode && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-white">🔄 Fixed Code</h3>
            <div className="relative">
              <pre className="p-4 rounded-lg border border-cyan-500/30 bg-[#0d1117] text-xs text-cyan-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                {result.transformedCode}
              </pre>
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => { navigator.clipboard.writeText(result.transformedCode); toast.success("Copied! 📋"); }}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs text-gray-400 transition"
                >
                  Copy
                </button>
                {onApplyFix && (
                  <button
                    onClick={() => { onApplyFix(result.transformedCode); toast.success("Applied! ✅"); }}
                    className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/30 text-xs text-cyan-400 transition"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {result.issues?.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-white">
              Issues ({result.issues.length})
            </h3>
            {result.issues.map((issue, i) => (
              <IssueCard
                key={i}
                issue={issue}
                originalCode={originalCode}
                onApplyFix={onApplyFix}
                onRunCode={onRunCode}
              />
            ))}
          </div>
        )}

        {result.positives?.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-white">✅ What's Good</h3>
            {result.positives.map((p, i) => (
              <div key={i} className="p-3 rounded-lg border bg-green-500/10 border-green-500/30 text-sm text-green-400">
                {p}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}