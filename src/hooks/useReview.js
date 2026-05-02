




import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export const useReview = () => {
  const { API } = useAuth();
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState(null);

  const submitReview = async ({ code, language }) => {
    const trimmed = code?.trim();
    if (!trimmed || trimmed === "// Paste your code here...") {
      toast.error("Pehle code paste karo!");
      return;
    }
    setMode("review");
    setLoading(true);
    setResult(null);
    setStreamText("");
    await streamReview({ code, language });
  };

  const streamReview = async ({ code, language }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/review/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, language }),
      });
      await processStream(response);
    } catch (err) {
      toast.error("Review failed!");
    } finally {
      setLoading(false);
    }
  };

  const submitPrompt = async ({ code, language, userPrompt }) => {
    if (!userPrompt?.trim()) {
      toast.error("Prompt likho!");
      return;
    }
    setMode("prompt");
    setLoading(true);
    setResult(null);
    setStreamText("");
    await streamPrompt({ code: code || "", language, userPrompt });
  };

  const streamPrompt = async ({ code, language, userPrompt }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/review/custom-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, language, userPrompt }),
      });
      await processStream(response);
    } catch (err) {
      toast.error("Prompt failed!");
    } finally {
      setLoading(false);
    }
  };

  const processStream = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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
            await delay(30);
            setStreamText((prev) => prev + data.chunk);
          }
          if (data.done && data.review) {
            setResult(data.review);
            setStreamText("");
            toast.success("Done! 🎉");
          }
          if (data.error) toast.error(data.error);
        } catch {}
      }
    }
  };

  // ✅ History se load karo
  const loadFromHistory = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.review) {
        setResult(data.review);
        setMode(data.review.transformedCode ? "prompt" : "review");
        toast.success("History load ho gayi! ✅");
      }
    } catch (err) {
      toast.error("History load nahi hui!");
    }
  };

  const resetReview = () => {
    setResult(null);
    setStreamText("");
    setMode(null);
  };

  return {
    loading,
    streamText,
    result,
    mode,
    submitReview,
    submitPrompt,
    resetReview,
    loadFromHistory, // ✅
  };
};
