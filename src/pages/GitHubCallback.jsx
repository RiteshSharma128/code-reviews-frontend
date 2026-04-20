import { useEffect } from "react";

export default function GitHubCallback() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      if (window.opener) {
        window.opener.postMessage({ type: "github-callback", code }, "*");
        setTimeout(() => window.close(), 500);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-gray-400 text-sm">✅ GitHub se connect ho raha hai... Window band ho rahi hai!</p>
    </div>
  );
}