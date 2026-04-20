import { useState } from "react";
import { XCircle, AlertTriangle, Info, CheckCircle, Wand2, Copy, Check, ChevronDown, ChevronUp, Play } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const SEVERITY_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", icon: <XCircle size={14} /> },
  warning: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: <AlertTriangle size={14} /> },
  info: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", icon: <Info size={14} /> },
  good: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", icon: <CheckCircle size={14} /> },
};

export default function IssueCard({ issue, originalCode, onApplyFix, onRunCode }) {
  const { API } = useAuth();
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animatedCode, setAnimatedCode] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);

  const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.info;

  const handleFix = async () => {
    setFixing(true);
    setFixResult(null);
    setAnimatedCode("");
    setIsAnimating(false);

    try {
      const { data } = await API.post("/review/fix", { code: originalCode, issue });

      setIsAnimating(true);
      const chars = data.fixedCode.split("");
      let current = "";

      for (let i = 0; i < chars.length; i++) {
        await new Promise((res) => setTimeout(res, 8));
        current += chars[i];
        setAnimatedCode(current);
      }

      setIsAnimating(false);
      setFixResult(data);
      setShowDiff(true);
      toast.success("Fix ready! 🔧");
    } catch (err) {
      toast.error("Fix failed — try again");
    } finally {
      setFixing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fixResult.fixedCode);
    setCopied(true);
    toast.success("Copied! 📋");
    setTimeout(() => setCopied(false), 2000);
  };

  const getDiff = () => {
    if (!fixResult) return [];
    const originalLines = originalCode.split("\n");
    const fixedLines = fixResult.fixedCode.split("\n");
    const maxLen = Math.max(originalLines.length, fixedLines.length);
    const diff = [];

    for (let i = 0; i < maxLen; i++) {
      const orig = originalLines[i];
      const fixed = fixedLines[i];
      if (orig === fixed) {
        diff.push({ type: "same", line: orig, num: i + 1 });
      } else if (orig !== undefined && fixed !== undefined) {
        diff.push({ type: "removed", line: orig, num: i + 1 });
        diff.push({ type: "added", line: fixed, num: i + 1 });
      } else if (orig === undefined) {
        diff.push({ type: "added", line: fixed, num: i + 1 });
      } else {
        diff.push({ type: "removed", line: orig, num: i + 1 });
      }
    }

    const changedIndices = new Set();
    diff.forEach((d, i) => {
      if (d.type !== "same") {
        for (let j = Math.max(0, i - 2); j <= Math.min(diff.length - 1, i + 2); j++) {
          changedIndices.add(j);
        }
      }
    });

    return diff.map((d, i) => ({ ...d, visible: changedIndices.has(i) }));
  };

  return (
    <div className={`rounded-lg border ${cfg.bg} overflow-hidden`}>
      {/* Issue Header */}
      <div className="p-3">
        <div className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color} mb-1`}>
          {cfg.icon}
          {issue.severity?.toUpperCase()}
          {issue.line && <span className="ml-auto text-gray-500">Line {issue.line}</span>}
        </div>
        <p className="text-sm text-gray-200">{issue.message}</p>
        {issue.suggestion && (
          <p className="text-xs text-gray-500 mt-1">💡 {issue.suggestion}</p>
        )}

        {issue.severity !== "good" && (
          <button
            onClick={handleFix}
            disabled={fixing}
            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-400 text-xs font-medium transition disabled:opacity-50"
          >
            {fixing ? (
              <>
                <div className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
                Fixing...
              </>
            ) : (
              <><Wand2 size={12} /> Fix with AI</>
            )}
          </button>
        )}
      </div>

      {/* Fix Animation */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-[#0d1117]"
          >
            <div className="px-3 py-2 flex items-center gap-2 border-b border-white/5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs text-indigo-400">AI fixing code...</span>
            </div>
            <div className="p-3 max-h-48 overflow-y-auto">
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                {animatedCode}
                <span className="inline-block w-1.5 h-3 bg-indigo-500 ml-0.5 animate-pulse" />
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fix Result */}
      <AnimatePresence>
        {fixResult && !isAnimating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="border-t border-white/10"
          >
            {/* Explanation */}
            <div className="px-3 py-2 bg-indigo-500/5">
              <p className="text-xs text-indigo-300">✨ {fixResult.explanation}</p>
            </div>

            {/* Action Buttons */}
            <div className="px-3 py-2 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowDiff(!showDiff)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs transition"
              >
                {showDiff ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showDiff ? "Hide" : "Show"} Diff
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs transition"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy Fix"}
              </button>

              {/* ✅ Apply Fix */}
              {onApplyFix && (
                <button
                  onClick={() => {
                    onApplyFix(fixResult.fixedCode);
                    toast.success("Fix applied! ✅");
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 text-xs transition ml-auto"
                >
                  <Check size={12} /> Apply Fix
                </button>
              )}

              {/* ✅ Apply & Run */}
              {onApplyFix && onRunCode && (
                <button
                  onClick={() => {
                    onApplyFix(fixResult.fixedCode);
                    setTimeout(() => onRunCode(), 500);
                    toast.success("Fix applied aur run ho raha hai! ▶️");
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 text-xs transition"
                >
                  <Play size={12} /> Apply & Run
                </button>
              )}
            </div>

            {/* Diff View */}
            <AnimatePresence>
              {showDiff && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10"
                >
                  <div className="p-2 max-h-48 overflow-y-auto">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 px-1">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-red-500/50" /> Removed
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-green-500/50" /> Added
                      </span>
                    </div>
                    {getDiff().filter((d) => d.visible).map((d, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 px-2 py-0.5 rounded text-xs font-mono ${
                          d.type === "added" ? "bg-green-500/10 text-green-300"
                          : d.type === "removed" ? "bg-red-500/10 text-red-300 line-through opacity-60"
                          : "text-gray-500"
                        }`}
                      >
                        <span className="w-6 text-right flex-shrink-0 opacity-40">{d.num}</span>
                        <span className="flex-shrink-0 opacity-60">
                          {d.type === "added" ? "+" : d.type === "removed" ? "-" : " "}
                        </span>
                        <span className="truncate">{d.line}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}