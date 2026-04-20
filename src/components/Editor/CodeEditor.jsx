import Editor from "@monaco-editor/react";
import { useTheme } from "../../context/ThemeContext";
import { Code2, Play, Loader } from "lucide-react";
import { useState } from "react";
import { runCode } from "../../services/judgeService";
import toast from "react-hot-toast";

const LANGUAGES = [
  "javascript", "typescript", "python", "java", "c", "cpp",
  "csharp", "go", "rust", "php", "ruby", "swift", "kotlin",
  "html", "css", "sql", "bash", "json", "yaml", "markdown"
];

// ✅ Improved detectLanguage
const detectLanguage = (code) => {
  if (!code || !code.trim()) return "javascript";

  // C++
  if (code.includes("#include") && (
    code.includes("cout") || code.includes("cin") ||
    code.includes("int main") || code.includes("std::") ||
    code.includes("namespace std")
  )) return "cpp";

  // C
  if (code.includes("#include") && (
    code.includes("printf") || code.includes("scanf") ||
    (code.includes("int main") && !code.includes("cout"))
  )) return "c";

  // Java
  if (
    code.includes("public class") || code.includes("System.out") ||
    code.includes("public static void main") || code.includes("import java.")
  ) return "java";

  // Python
  if (
    code.includes("def ") ||
    (code.includes("import ") && !code.includes("{")) ||
    code.includes("print(") ||
    code.includes("elif ") ||
    (code.includes("class ") && code.includes(":") && !code.includes("{"))
  ) return "python";

  // Go
  if (
    code.includes("package main") || code.includes("func main()") ||
    code.includes("fmt.") || code.includes(":=")
  ) return "go";

  // Rust
  if (
    code.includes("fn main()") || code.includes("println!") ||
    code.includes("let mut ") || code.includes("use std::")
  ) return "rust";

  // C#
  if (
    code.includes("using System") || code.includes("Console.Write") ||
    (code.includes("namespace ") && code.includes("{"))
  ) return "csharp";

  // TypeScript
  if (
    code.includes(": string") || code.includes(": number") ||
    code.includes(": boolean") || code.includes("interface ") ||
    code.includes(": void") || code.includes("<T>")
  ) return "typescript";

  // PHP
  if (code.includes("<?php") || code.includes("echo ")) return "php";

  // Ruby
  if (
    (code.includes("def ") && code.includes("end")) ||
    code.includes("puts ") || code.includes("require ")
  ) return "ruby";

  // Kotlin
  if (
    code.includes("fun main") ||
    (code.includes("println(") && code.includes("val ")) ||
    (code.includes("var ") && code.includes("fun "))
  ) return "kotlin";

  // Swift
  if (
    code.includes("import Swift") ||
    (code.includes("var ") && code.includes("let ") && code.includes("func "))
  ) return "swift";

  // Bash
  if (
    code.includes("#!/bin/bash") ||
    (code.includes("echo ") && code.includes("$"))
  ) return "bash";

  return "javascript";
};

export default function CodeEditor({ code, onChange, language, onLanguageChange, fillHeight, onRunResult }) {
  const { isDark } = useTheme();
  const [running, setRunning] = useState(false);

  const handleRun = async () => {
    if (!code?.trim()) {
      toast.error("Pehle code likho!");
      return;
    }
    setRunning(true);
    try {
      const lang = language === "auto" ? detectLanguage(code) : language;
      const result = await runCode(code, lang);
      onRunResult?.(result);
      toast.success("Code run ho gaya! ▶️");
    } catch (err) {
      toast.error("Code run nahi hua: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e1e2e]">
        <Code2 size={13} className="text-indigo-400" />
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="text-xs px-2 py-1 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-gray-400 focus:outline-none focus:border-indigo-500 transition"
        >
          <option value="auto">Auto Detect</option>
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
        <span className="text-xs text-gray-600 font-mono">
          {code?.split("\n").length || 0} lines
        </span>
        <button
          onClick={handleRun}
          disabled={running}
          className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 text-green-400 text-xs font-medium transition disabled:opacity-50"
        >
          {running ? <Loader size={12} className="animate-spin" /> : <Play size={12} />}
          {running ? "Running..." : "Run Code"}
        </button>
      </div>
      <div className="flex-1">
        <Editor
          height={fillHeight ? "100%" : "500px"}
          language={language === "auto" ? detectLanguage(code || "") : language}
          value={code}
          onChange={(val) => onChange(val || "")}
          theme={isDark ? "vs-dark" : "light"}
          options={{
            fontSize: 14,
            fontFamily: "JetBrains Mono, monospace",
            minimap: { enabled: false },
            padding: { top: 12 },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "all",
            wordWrap: "on",
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}