import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github, Star, Lock, Globe, ChevronRight,
  File, Loader, X, Check, Search
} from "lucide-react";
import toast from "react-hot-toast";

export default function GitHubPanel({ onFileSelect, onClose }) {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("github_token") || ""
  );
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(accessToken ? "repos" : "auth");
  const [search, setSearch] = useState("");

  // ============================
  // AUTH
  // ============================
  const handleGitHubLogin = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/github/auth-url", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // ✅ Popup open karo
      const popup = window.open(data.url, "github-auth", "width=600,height=700");

      // ✅ postMessage sun — GitHubCallback.jsx se aayega
      const messageHandler = async (event) => {
        if (event.data?.type === "github-callback") {
          window.removeEventListener("message", messageHandler);
          clearInterval(timer);
          popup?.close();
          await exchangeCode(event.data.code);
        }
      };

      window.addEventListener("message", messageHandler);

      // ✅ Popup band check karo
      const timer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(timer);
          window.removeEventListener("message", messageHandler);
        }
      }, 1000);

    } catch {
      toast.error("GitHub login failed!");
    }
  };

  const exchangeCode = async (code) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/github/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem("github_token", data.accessToken);
        setAccessToken(data.accessToken);
        setStep("repos");
        fetchRepos(data.accessToken);
        toast.success("GitHub connected! ✅");
      } else {
        toast.error("Token exchange failed!");
      }
    } catch {
      toast.error("Token exchange failed!");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // REPOS
  // ============================
  const fetchRepos = async (token = accessToken) => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/github/repos?accessToken=${token}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const data = await res.json();
      setRepos(data.repos || []);
      setStep("repos");
    } catch {
      toast.error("Repos fetch failed!");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // FILES
  // ============================
  const fetchFiles = async (repo) => {
    setLoading(true);
    setSelectedRepo(repo);
    try {
      const authToken = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/github/tree?accessToken=${accessToken}&repo=${repo.name}&branch=${repo.defaultBranch}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      const data = await res.json();
      setFiles(data.files || []);
      setStep("files");
    } catch {
      toast.error("Files fetch failed!");
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelect = (file) => {
    setSelectedFiles(prev =>
      prev.find(f => f.path === file.path)
        ? prev.filter(f => f.path !== file.path)
        : [...prev, file]
    );
  };

  const loadSelectedFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Pehle files select karo!");
      return;
    }
    setLoading(true);
    try {
      const authToken = localStorage.getItem("token");
      const loadedFiles = [];

      for (const file of selectedFiles) {
        const res = await fetch(
          `http://localhost:5000/api/github/file?accessToken=${accessToken}&repo=${selectedRepo.name}&path=${file.path}`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        const data = await res.json();
        if (data.content) {
          const ext = file.path.split(".").pop();
          const langMap = {
            js: "javascript", jsx: "javascript", ts: "typescript",
            tsx: "typescript", py: "python", java: "java",
            cpp: "cpp", c: "c", cs: "csharp", go: "go",
            rs: "rust", php: "php", rb: "ruby", kt: "kotlin",
            swift: "swift", sh: "bash"
          };
          loadedFiles.push({
            name: file.path.split("/").pop(),
            code: data.content,
            language: langMap[ext] || "auto",
          });
        }
      }

      onFileSelect(loadedFiles);
      toast.success(`${loadedFiles.length} files loaded! ✅`);
      onClose?.();
    } catch {
      toast.error("Files load failed!");
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFiles = files.filter(f =>
    f.path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg bg-[#111118] border border-[#1e1e2e] rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1e1e2e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github size={16} className="text-white" />
            <h2 className="text-sm font-semibold text-white">
              {step === "auth" && "Connect GitHub"}
              {step === "repos" && "Select Repository"}
              {step === "files" && `${selectedRepo?.name} — Select Files`}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {step === "files" && (
              <button
                onClick={() => { setStep("repos"); setSearch(""); }}
                className="text-xs text-gray-500 hover:text-gray-300 transition"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[500px] overflow-y-auto">

          {/* STEP 1 — Auth */}
          {step === "auth" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-[#1e1e2e] flex items-center justify-center mx-auto">
                <Github size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">GitHub se connect karo</h3>
                <p className="text-gray-500 text-xs">Apne repos se directly code pull karo</p>
              </div>
              <button
                onClick={handleGitHubLogin}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-gray-100 transition mx-auto disabled:opacity-50"
              >
                {loading ? <Loader size={14} className="animate-spin" /> : <Github size={14} />}
                Login with GitHub
              </button>
            </div>
          )}

          {/* STEP 2 — Repos */}
          {step === "repos" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f]">
                <Search size={13} className="text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Repo search karo..."
                  className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none"
                />
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader size={20} className="animate-spin text-indigo-400" />
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => fetchFiles(repo)}
                    className="p-3 rounded-xl border border-[#1e1e2e] hover:border-indigo-500/30 cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {repo.private
                          ? <Lock size={12} className="text-yellow-400" />
                          : <Globe size={12} className="text-green-400" />
                        }
                        <span className="text-sm text-white font-medium">{repo.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {repo.language && (
                          <span className="text-xs text-gray-500">{repo.language}</span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star size={10} /> {repo.stars}
                        </div>
                        <ChevronRight size={14} className="text-gray-600 group-hover:text-indigo-400 transition" />
                      </div>
                    </div>
                    {repo.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{repo.description}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* STEP 3 — Files */}
          {step === "files" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f]">
                <Search size={13} className="text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="File search karo..."
                  className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none"
                />
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader size={20} className="animate-spin text-indigo-400" />
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500">{filteredFiles.length} files found</p>
                  {filteredFiles.map((file) => {
                    const isSelected = selectedFiles.find(f => f.path === file.path);
                    return (
                      <div
                        key={file.path}
                        onClick={() => toggleFileSelect(file)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                          isSelected
                            ? "border-indigo-500/40 bg-indigo-500/10"
                            : "border-[#1e1e2e] hover:border-indigo-500/20"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "bg-indigo-600 border-indigo-600" : "border-[#1e1e2e]"
                        }`}>
                          {isSelected && <Check size={11} className="text-white" />}
                        </div>
                        <File size={13} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-300 truncate">{file.path}</span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === "files" && (
          <div className="px-5 py-4 border-t border-[#1e1e2e] flex items-center justify-between">
            <span className="text-xs text-gray-500">{selectedFiles.length} files selected</span>
            <button
              onClick={loadSelectedFiles}
              disabled={loading || selectedFiles.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition"
            >
              {loading ? <Loader size={12} className="animate-spin" /> : <Github size={12} />}
              Load Files
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
