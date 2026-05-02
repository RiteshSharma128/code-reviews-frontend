import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, X, Loader, History, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "ai_chat_history";

// ✅ FIXED: BASE URL (TOP PE)
const BASE_URL = import.meta.env.VITE_API_URL;

export default function ChatPanel({ code, reviewResult, onClose, onApplyFix }) {

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Namaste! 👋 Main tera AI code assistant hoon. Code ke baare mein kuch bhi pooch!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.messages?.length > 1) {
          setMessages(parsed.messages);
          setChatId(parsed.chatId || null);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, chatId }));
    }
  }, [messages, chatId]);

  // ✅ FIXED
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/chat`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setChatHistory(data.chats || []);
    } catch {
      toast.error("History load nahi hui");
    } finally {
      setHistoryLoading(false);
    }
  };

  // ✅ FIXED
  const loadChat = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.chat) {
        setMessages(data.chat.messages);
        setChatId(data.chat._id);
        setShowHistory(false);
        toast.success("Chat loaded! ✅");
      }
    } catch {
      toast.error("Chat load nahi hua");
    }
  };

  // ✅ FIXED
  const deleteChat = async (id, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BASE_URL}/chat/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatHistory(prev => prev.filter(c => c._id !== id));
      if (chatId === id) newChat();
      toast.success("Deleted!");
    } catch {
      toast.error("Delete failed");
    }
  };

  const newChat = () => {
    setMessages([{
      role: "assistant",
      content: "Namaste! 👋 Main tera AI code assistant hoon. Code ke baare mein kuch bhi pooch!"
    }]);
    setChatId(null);
    localStorage.removeItem(STORAGE_KEY);
    setShowHistory(false);
  };

  const extractCode = (content) => {
    const match = content?.match(/```[\w]*\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  // ✅ FIXED
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

      const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          code: code || "",
          chatId: chatId || null,
          reviewContext: reviewResult ? {
            score: reviewResult.score,
            summary: reviewResult.summary,
            issues: reviewResult.issues,
          } : null,
          history: newMessages
            .filter(m => !m.streaming)
            .slice(-10)
            .map(m => ({ role: m.role, content: m.content })),
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
              setMessages(prev =>
                prev.map((m, i) =>
                  i === prev.length - 1 && m.streaming
                    ? { ...m, content: fullText }
                    : m
                )
              );
            }

            if (data.done) {
              if (data.chatId) setChatId(data.chatId);
              setMessages(prev =>
                prev.map((m, i) =>
                  i === prev.length - 1 && m.streaming
                    ? { ...m, streaming: false }
                    : m
                )
              );
            }

            if (data.error) toast.error(data.error);
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

  return <div> {/* UI same rakha hai */} </div>;
}
