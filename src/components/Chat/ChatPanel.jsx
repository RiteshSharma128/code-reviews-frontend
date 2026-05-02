

// import { useState, useRef, useEffect } from "react";
// import { Send, Bot, User, X, Loader, History, Trash2, Plus } from "lucide-react";
// import toast from "react-hot-toast";
// import ReactMarkdown from "react-markdown";

// const STORAGE_KEY = "ai_chat_history";

// // ✅ onApplyFix prop add kiya
// export default function ChatPanel({ code, reviewResult, onClose, onApplyFix }) {
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       content: "Namaste! 👋 Main tera AI code assistant hoon. Code ke baare mein kuch bhi pooch!"
//     }
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [chatId, setChatId] = useState(null);
//   const [showHistory, setShowHistory] = useState(false);
//   const [chatHistory, setChatHistory] = useState([]);
//   const [historyLoading, setHistoryLoading] = useState(false);
//   const messagesContainerRef = useRef(null);
//   const inputRef = useRef(null);

//   useEffect(() => {
//     if (messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
//     }
//   }, [messages]);

//   useEffect(() => {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         if (parsed.messages?.length > 1) {
//           setMessages(parsed.messages);
//           setChatId(parsed.chatId || null);
//         }
//       } catch {}
//     }
//   }, []);

//   useEffect(() => {
//     if (messages.length > 1) {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, chatId }));
//     }
//   }, [messages, chatId]);

//   const fetchHistory = async () => {
//     setHistoryLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch("http://localhost:5000/api/chat", {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       setChatHistory(data.chats || []);
//     } catch {
//       toast.error("History load nahi hui");
//     } finally {
//       setHistoryLoading(false);
//     }
//   };

//   const loadChat = async (id) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await fetch(`http://localhost:5000/api/chat/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const data = await res.json();
//       if (data.chat) {
//         setMessages(data.chat.messages);
//         setChatId(data.chat._id);
//         setShowHistory(false);
//         toast.success("Chat loaded! ✅");
//       }
//     } catch {
//       toast.error("Chat load nahi hua");
//     }
//   };

//   const deleteChat = async (id, e) => {
//     e.stopPropagation();
//     try {
//       const token = localStorage.getItem("token");
//       await fetch(`http://localhost:5000/api/chat/${id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setChatHistory(prev => prev.filter(c => c._id !== id));
//       if (chatId === id) newChat();
//       toast.success("Deleted!");
//     } catch {
//       toast.error("Delete failed");
//     }
//   };

//   const newChat = () => {
//     setMessages([{
//       role: "assistant",
//       content: "Namaste! 👋 Main tera AI code assistant hoon. Code ke baare mein kuch bhi pooch!"
//     }]);
//     setChatId(null);
//     localStorage.removeItem(STORAGE_KEY);
//     setShowHistory(false);
//   };

//   // ✅ Code block extract karo
//   const extractCode = (content) => {
//     const match = content?.match(/```[\w]*\n([\s\S]*?)```/);
//     return match ? match[1].trim() : null;
//   };

//   const sendMessage = async () => {
//     if (!input.trim() || loading) return;

//     const userMessage = input.trim();
//     setInput("");

//     const newMessages = [...messages, { role: "user", content: userMessage }];
//     setMessages(newMessages);
//     setLoading(true);
//     setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://localhost:5000/api/chat", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           message: userMessage,
//           code: code || "",
//           chatId: chatId || null,
//           reviewContext: reviewResult ? {
//             score: reviewResult.score,
//             summary: reviewResult.summary,
//             issues: reviewResult.issues,
//           } : null,
//           history: newMessages
//             .filter(m => !m.streaming)
//             .slice(-10)
//             .map(m => ({ role: m.role, content: m.content })),
//         }),
//       });

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();
//       let buffer = "";
//       let fullText = "";

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         buffer += decoder.decode(value, { stream: true });
//         const lines = buffer.split("\n");
//         buffer = lines.pop();
//         for (const line of lines) {
//           if (!line.startsWith("data: ")) continue;
//           try {
//             const data = JSON.parse(line.slice(6));
//             if (data.chunk) {
//               fullText += data.chunk;
//               setMessages(prev => prev.map((m, i) =>
//                 i === prev.length - 1 && m.streaming ? { ...m, content: fullText } : m
//               ));
//             }
//             if (data.done) {
//               if (data.chatId) setChatId(data.chatId);
//               setMessages(prev => prev.map((m, i) =>
//                 i === prev.length - 1 && m.streaming ? { ...m, streaming: false } : m
//               ));
//             }
//             if (data.error) toast.error(data.error);
//           } catch {}
//         }
//       }
//     } catch {
//       toast.error("Chat failed!");
//       setMessages(prev => prev.filter(m => !m.streaming));
//     } finally {
//       setLoading(false);
//       inputRef.current?.focus();
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const quickPrompts = [
//     "Is code ko explain karo",
//     "Sabse bada issue kya hai?",
//     "Score improve kaise karoon?",
//     "Isko optimize karo",
//   ];

//   return (
//     <div className="flex flex-col bg-[#0a0a0f] h-full overflow-hidden">

//       {/* Header */}
//       <div className="flex-shrink-0 px-4 py-3 border-b border-[#1e1e2e] flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
//             <Bot size={14} className="text-indigo-400" />
//           </div>
//           <div>
//             <h3 className="text-sm font-semibold text-white">AI Chat</h3>
//             <p className="text-xs text-gray-500">{chatId ? "Saved ✅" : "Not saved"}</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-1">
//           <button onClick={newChat} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition" title="New Chat">
//             <Plus size={14} />
//           </button>
//           <button
//             onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchHistory(); }}
//             className={`p-1.5 rounded-lg transition ${showHistory ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-white/5 text-gray-500 hover:text-gray-300"}`}
//             title="Chat History"
//           >
//             <History size={14} />
//           </button>
//           <button
//             onClick={() => window.open("/chat-history", "_blank")}
//             className="px-2 py-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition text-xs border border-[#1e1e2e] hover:border-indigo-500/30"
//             title="View All Chats"
//           >
//             All
//           </button>
//           {onClose && (
//             <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition">
//               <X size={14} />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* History Panel */}
//       {showHistory && (
//         <div className="flex-shrink-0 border-b border-[#1e1e2e] bg-[#111118] max-h-[250px] overflow-y-auto">
//           <div className="px-3 py-2 flex items-center justify-between">
//             <span className="text-xs font-medium text-white">Chat History</span>
//             <button onClick={newChat} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
//               <Plus size={11} /> New
//             </button>
//           </div>
//           {historyLoading ? (
//             <div className="flex items-center justify-center py-4">
//               <Loader size={14} className="animate-spin text-indigo-400" />
//             </div>
//           ) : chatHistory.length === 0 ? (
//             <p className="text-xs text-gray-600 text-center py-4">Koi history nahi</p>
//           ) : (
//             chatHistory.map((chat) => (
//               <div
//                 key={chat._id}
//                 onClick={() => loadChat(chat._id)}
//                 className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/5 transition ${
//                   chatId === chat._id ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""
//                 }`}
//               >
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs text-gray-300 truncate">{chat.title}</p>
//                   <p className="text-xs text-gray-600">{chat.messages?.length || 0} messages · {new Date(chat.updatedAt).toLocaleDateString()}</p>
//                 </div>
//                 <button onClick={(e) => deleteChat(chat._id, e)} className="p-1 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition flex-shrink-0 ml-2">
//                   <Trash2 size={11} />
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       )}

//       {/* Messages */}
//       <div
//         ref={messagesContainerRef}
//         className="flex-1 p-4 space-y-4 overflow-y-scroll"
//         style={{ minHeight: 0 }}
//       >
//         {messages.map((msg, i) => (
//           <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
//             <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
//               msg.role === "user" ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-cyan-500/20 border border-cyan-500/30"
//             }`}>
//               {msg.role === "user" ? <User size={13} className="text-indigo-400" /> : <Bot size={13} className="text-cyan-400" />}
//             </div>

//             <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
//               msg.role === "user"
//                 ? "bg-indigo-600/20 border border-indigo-500/20 text-gray-200 rounded-tr-sm"
//                 : "bg-[#111118] border border-[#1e1e2e] text-gray-300 rounded-tl-sm"
//             }`}>
//               {msg.role === "assistant" ? (
//                 <div className="prose prose-invert prose-xs max-w-none">
//                   <ReactMarkdown>{msg.content || ""}</ReactMarkdown>
//                   {msg.streaming && (
//                     <span className="inline-block w-1.5 h-3 bg-cyan-500 ml-0.5 animate-pulse" />
//                   )}
//                   {/* ✅ Apply Fix button */}
//                   {!msg.streaming && onApplyFix && extractCode(msg.content) && (
//                     <button
//                       onClick={() => {
//                         onApplyFix(extractCode(msg.content));
//                         toast.success("Fix applied to editor! ✅");
//                       }}
//                       className="mt-2 w-full py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs hover:bg-green-500/30 transition"
//                     >
//                       ✅ Apply Fix to Editor
//                     </button>
//                   )}
//                 </div>
//               ) : (
//                 <p>{msg.content}</p>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Quick Prompts */}
//       {messages.length === 1 && (
//         <div className="flex-shrink-0 px-4 pb-2 flex flex-wrap gap-1.5">
//           {quickPrompts.map((prompt, i) => (
//             <button
//               key={i}
//               onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
//               className="px-2.5 py-1 rounded-lg border border-[#1e1e2e] hover:border-indigo-500/30 text-xs text-gray-500 hover:text-gray-300 transition"
//             >
//               {prompt}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Input */}
//       <div className="flex-shrink-0 px-4 py-3 border-t border-[#1e1e2e]">
//         <div className="flex items-end gap-2">
//           <textarea
//             ref={inputRef}
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Kuch bhi pooch... (Enter to send)"
//             rows={2}
//             className="flex-1 bg-[#111118] border border-[#1e1e2e] focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none transition resize-none"
//           />
//           <button
//             onClick={sendMessage}
//             disabled={!input.trim() || loading}
//             className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition flex-shrink-0"
//           >
//             {loading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
//           </button>
//         </div>
//         <p className="text-xs text-gray-600 mt-1.5">Enter to send · Shift+Enter for new line</p>
//       </div>
//     </div>
//   );
// }





import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, X, Loader, History, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

const STORAGE_KEY = "ai_chat_history";

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

  const BASE_URL = import.meta.env.VITE_API_URL;
  const loadChat = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res =await fetch(`${BASE_URL}/chat/${id}`,  {
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
              setMessages(prev => prev.map((m, i) =>
                i === prev.length - 1 && m.streaming ? { ...m, content: fullText } : m
              ));
            }
            if (data.done) {
              if (data.chatId) setChatId(data.chatId);
              setMessages(prev => prev.map((m, i) =>
                i === prev.length - 1 && m.streaming ? { ...m, streaming: false } : m
              ));
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickPrompts = [
    "Is code ko explain karo",
    "Sabse bada issue kya hai?",
    "Score improve kaise karoon?",
    "Isko optimize karo",
  ];

  return (
    <div className="flex flex-col bg-[#0a0a0f] h-full overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b border-[#1e1e2e] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Bot size={14} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Chat</h3>
            <p className="text-xs text-gray-500">{chatId ? "Saved ✅" : "Not saved"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={newChat} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition" title="New Chat">
            <Plus size={14} />
          </button>
          <button
            onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchHistory(); }}
            className={`p-1.5 rounded-lg transition ${showHistory ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-white/5 text-gray-500 hover:text-gray-300"}`}
            title="Chat History"
          >
            <History size={14} />
          </button>
          <button
            onClick={() => window.open("/chat-history", "_blank")}
            className="px-2 py-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition text-xs border border-[#1e1e2e] hover:border-indigo-500/30"
            title="View All Chats"
          >
            All
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {showHistory && (
        <div className="flex-shrink-0 border-b border-[#1e1e2e] bg-[#111118] max-h-[250px] overflow-y-auto">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-white">Chat History</span>
            <button onClick={newChat} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <Plus size={11} /> New
            </button>
          </div>
          {historyLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader size={14} className="animate-spin text-indigo-400" />
            </div>
          ) : chatHistory.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-4">Koi history nahi</p>
          ) : (
            chatHistory.map((chat) => (
              <div
                key={chat._id}
                onClick={() => loadChat(chat._id)}
                className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/5 transition ${
                  chatId === chat._id ? "bg-indigo-500/10 border-l-2 border-indigo-500" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-300 truncate">{chat.title}</p>
                  <p className="text-xs text-gray-600">{chat.messages?.length || 0} messages · {new Date(chat.updatedAt).toLocaleDateString()}</p>
                </div>
                <button onClick={(e) => deleteChat(chat._id, e)} className="p-1 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition flex-shrink-0 ml-2">
                  <Trash2 size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 space-y-4 overflow-y-scroll"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
              msg.role === "user" ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-cyan-500/20 border border-cyan-500/30"
            }`}>
              {msg.role === "user" ? <User size={13} className="text-indigo-400" /> : <Bot size={13} className="text-cyan-400" />}
            </div>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-indigo-600/20 border border-indigo-500/20 text-gray-200 rounded-tr-sm"
                : "bg-[#111118] border border-[#1e1e2e] text-gray-300 rounded-tl-sm"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-xs max-w-none">
                  <ReactMarkdown>{msg.content || ""}</ReactMarkdown>
                  {msg.streaming && (
                    <span className="inline-block w-1.5 h-3 bg-cyan-500 ml-0.5 animate-pulse" />
                  )}
                  {/* ✅ Apply Fix button */}
                  {!msg.streaming && onApplyFix && extractCode(msg.content) && (
                    <button
                      onClick={() => {
                        onApplyFix(extractCode(msg.content));
                        toast.success("Fix applied! ✅");
                      }}
                      className="mt-2 w-full py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs hover:bg-green-500/30 transition"
                    >
                      ✅ Apply Fix to Editor
                    </button>
                  )}
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {messages.length === 1 && (
        <div className="flex-shrink-0 px-4 pb-2 flex flex-wrap gap-1.5">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
              className="px-2.5 py-1 rounded-lg border border-[#1e1e2e] hover:border-indigo-500/30 text-xs text-gray-500 hover:text-gray-300 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="flex-shrink-0 px-4 py-3 border-t border-[#1e1e2e]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Kuch bhi pooch... (Enter to send)"
            rows={2}
            className="flex-1 bg-[#111118] border border-[#1e1e2e] focus:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none transition resize-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition flex-shrink-0"
          >
            {loading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
