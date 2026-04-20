import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle, Trash2, Clock, Bot,
  Search, Plus, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

export default function ChatHistory() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => { fetchChats(); }, []);

  const fetchChats = async () => {
    try {
      const { data } = await API.get("/chat");
      setChats(data.chats || []);
    } catch {
      toast.error("Chats load nahi hui");
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/chat/${id}`);
      setChats(prev => prev.filter(c => c._id !== id));
      if (selectedChat?._id === id) setSelectedChat(null);
      toast.success("Chat deleted!");
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredChats = chats.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Chat History</h1>
            <p className="text-gray-500 mt-1 text-sm">{chats.length} conversations</p>
          </div>
          <button
            onClick={() => navigate("/review")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm transition"
          >
            <Plus size={14} /> New Chat
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Chat List */}
          <div className="lg:col-span-1 space-y-3">

            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#1e1e2e] bg-[#111118]">
              <Search size={13} className="text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Chat search karo..."
                className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-600 focus:outline-none"
              />
            </div>

            {/* Chat List */}
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-[#111118] animate-pulse" />
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle size={28} className="mx-auto mb-3 text-gray-600 opacity-30" />
                <p className="text-gray-600 text-sm">Koi chat nahi hai</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredChats.map((chat) => (
                  <motion.div
                    key={chat._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-3 rounded-xl border cursor-pointer transition group ${
                      selectedChat?._id === chat._id
                        ? "border-indigo-500/40 bg-indigo-500/10"
                        : "border-[#1e1e2e] hover:border-indigo-500/20 bg-[#111118]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                          <Bot size={12} className="text-cyan-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{chat.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                            <span>{chat.messages?.length || 0} messages</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock size={9} />
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => deleteChat(chat._id, e)}
                          className="p-1 rounded hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={11} />
                        </button>
                        <ChevronRight size={12} className="text-gray-600" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Chat Messages */}
          <div className="lg:col-span-2">
            {!selectedChat ? (
              <div className="h-[500px] flex items-center justify-center border border-dashed border-[#1e1e2e] rounded-2xl">
                <div className="text-center space-y-3">
                  <MessageCircle size={40} className="mx-auto text-gray-600 opacity-20" />
                  <p className="text-gray-500 text-sm">Koi chat select karo</p>
                </div>
              </div>
            ) : (
              <motion.div
                key={selectedChat._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-[#1e1e2e] rounded-2xl overflow-hidden"
              >
                {/* Chat Header */}
                <div className="px-5 py-4 border-b border-[#1e1e2e] bg-[#111118] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot size={16} className="text-cyan-400" />
                    <div>
                      <p className="text-sm font-semibold text-white">{selectedChat.title}</p>
                      <p className="text-xs text-gray-500">
                        {selectedChat.messages?.length || 0} messages ·{" "}
                        {new Date(selectedChat.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteChat(selectedChat._id, e)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Messages */}
                <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
                  {selectedChat.messages?.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                        msg.role === "user"
                          ? "bg-indigo-500/20 border border-indigo-500/30"
                          : "bg-cyan-500/20 border border-cyan-500/30"
                      }`}>
                        {msg.role === "user"
                          ? <span className="text-xs text-indigo-400">U</span>
                          : <Bot size={12} className="text-cyan-400" />
                        }
                      </div>
                      <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-indigo-600/20 border border-indigo-500/20 text-gray-200"
                          : "bg-[#111118] border border-[#1e1e2e] text-gray-300"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs text-gray-600 mt-1.5">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}