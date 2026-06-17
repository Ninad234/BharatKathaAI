import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, MessageSquare, Settings, Search, Send, Trash2,Edit2,
  Menu, X, Sparkles, Compass, User, RefreshCw, ChevronRight, Download
} from 'lucide-react';

export default function App() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState('');
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const chatEndRef = useRef(null);
  const [editingChatId, setEditingChatId] = useState('')
  const [editTitleInput, setEditTitleInput] = useState('')

  // 1. Fetch conversations on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sessions`);
        const data = await res.json();
        if (data.length > 0) {
          setChats(data);
          setActiveChatId(data[0].id);
        } else {
          createNewChat();
        }
      } catch (err) {
        console.error("Failed to load sessions from server:", err);
        createNewChat(); // fallback local session
      }
    };
    fetchSessions();
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, activeChatId]);

  const activeChat = chats.find(c => c.id === activeChatId) || { id: '', title: '', messages: [] };
  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNewChat = () => {
    const newId = Date.now().toString();
    const newChat = {
      id: newId,
      title: 'New Heritage Inquiry',
      messages: []
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
  };

  const deleteChat = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/api/session/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        console.error('Failed to delete session on server', await res.text());
        return;
      }
    } catch (err) {
      console.error(err);
      return;
    }
    const remaining = chats.filter(c => c.id !== id);
    setChats(remaining);
    if (activeChatId === id && remaining.length > 0) {
      setActiveChatId(remaining[0].id);
    }
  };

  const startRename = (chat, e) =>{
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitleInput(chat.title);
  }

  const saveRename = async (id)=>{
    if (!editTitleInput.trim()) {
      setEditingChatId('')
      return;      
    }
  

  setChats(prev=> prev.map(c=> c.id === id ? {...c, title: editTitleInput} : c));
  setEditingChatId('');

   try {
      const res = await fetch(`${API_URL}/api/session/${id}`,{
        method:'PUT',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({title:editTitleInput})
      });
      if (!res.ok) {
        console.error('Failed to update session title on server', await res.text());
      }

    } catch (err) {
      console.error(err);
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userPrompt = inputText;
    setInputText('');
    setIsLoading(true);

    // Sync session creation if empty
    if (activeChat.messages.length === 0) {
      try {
        await fetch(`${API_URL}/api/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: activeChatId, title: userPrompt.substring(0, 20) })
        });
      } catch (err) {
        console.error(err);
      }
    }

    // Add user message locally
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          title: c.messages.length === 0 ? (userPrompt.substring(0, 25) + '...') : c.title,
          messages: [...c.messages, { role: 'user', content: userPrompt }]
        };
      }
      return c;
    }));

    // Add empty assistant response to stream into
    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, { role: 'assistant', content: '' }]
        };
      }
      return c;
    }));

    try {
      const response = await fetch(`${API_URL}/api/session/${activeChatId}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userPrompt })
      });

      if (!response.body) throw new Error("Stream not supported");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5).trim());
              if (data.chunk) {
                accumulated += data.chunk;
                setChats(prev => prev.map(c => {
                  if (c.id === activeChatId) {
                    const messages = [...c.messages];
                    messages[messages.length - 1] = { role: 'assistant', content: accumulated };
                    return { ...c, messages };
                  }
                  return c;
                }));
              }
            } catch (err) {
              // Partial stream lines parse bypass
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToMarkdown = () => {
    if (!activeChat.messages.length) return;
    let md = `# BharatKatha AI Session: ${activeChat.title}\n\n`;
    activeChat.messages.forEach(m => {
      md += `### ${m.role === 'user' ? 'User' : 'BharatKatha AI'}\n${m.content}\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChat.title.replace(/\s+/g, '_')}.md`;
    a.click();
  };

  return (
    <div className="flex w-screen h-screen bg-brand-charcoal text-neutral-100 overflow-hidden font-sans overflow-y-hidden fixed inset-0">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] right-[-5%] h-[45vw] rounded-full bg-amber-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] h-[45vw] rounded-full bg-orange-600/5 blur-[140px] pointer-events-none" />

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-80 h-full bg-[#050508]/80 backdrop-blur-md border-r border-white/10 flex flex-col z-30 shrink-0"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h1 className="text-md font-bold tracking-wider bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    BHARATKATHA AI
                  </h1>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-white/5">
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={createNewChat}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-500" />
                New Chat Session
              </motion.button>
            </div>

            <div className="px-4 mb-4">
              <div className="relative flex items-center bg-white/5 border border-white/5 rounded-xl px-3 py-1.5">
                <Search className="w-4 h-4 text-neutral-500 mr-2" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm w-full outline-none text-neutral-300 placeholder-neutral-500"
                />
              </div>
            </div>

            {/* <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {filteredChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className="relative p-3 rounded-xl cursor-pointer group flex items-center justify-between transition-colors overflow-hidden"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavHighlight"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                      />
                    )}

                    <div className="flex items-center gap-3 z-10 w-[80%]">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                      <span className={`text-sm truncate font-medium ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                        {chat.title}
                      </span>
                    </div>

                    <button
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-neutral-500 hover:text-red-400 z-10 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div> */}
                        <div className="flex-1 overflow-y-auto px-2 space-y-1">
              {filteredChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                const isEditing = chat.id === editingChatId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => !isEditing && setActiveChatId(chat.id)}
                    className="relative p-3 rounded-xl cursor-pointer group flex items-center justify-between transition-colors overflow-hidden"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavHighlight"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl"
                      />
                    )}

                    <div className="flex items-center gap-3 z-10 w-[75%]">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitleInput}
                          onChange={(e) => setEditTitleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(chat.id);
                            if (e.key === 'Escape') setEditingChatId('');
                          }}
                          onBlur={() => saveRename(chat.id)}
                          className="bg-transparent text-sm w-full outline-none text-white border-b border-amber-500/50 py-0.5"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className={`text-sm truncate font-medium ${isActive ? 'text-white' : 'text-neutral-400'}`}>
                          {chat.title}
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startRename(chat, e)}
                          className="p-1 rounded hover:bg-white/10 text-neutral-500 hover:text-amber-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => deleteChat(chat.id, e)}
                          className="p-1 rounded hover:bg-white/10 text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>


            <div className="p-4 border-t border-white/5 bg-[#050508]/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-300">Culture Explorer</p>
                </div>
              </div>
              <Settings className="w-4 h-4 text-neutral-400 cursor-pointer hover:text-white" />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <main className="flex-1 h-full max-h-screen flex flex-col relative overflow-hidden bg-brand-charcoal">
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-brand-charcoal/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5">
                <Menu className="w-5 h-5 text-neutral-300" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">{activeChat.title || 'Welcome'}</h2>
            </div>
          </div>
          
          <button 
            onClick={exportToMarkdown}
            disabled={!activeChat.messages?.length}
            className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export MD
          </button>
        </header>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6 w-full">
          {!activeChat.messages?.length ? (
            <div className="h-full flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                <Compass className="w-6 h-6 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-2">BharatKatha Cultural Engine</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Discuss Vedic philosophy, classical architecture, ancient scriptures, arts, or traditional clothing.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-[95%] xl:max-w-[90%] w-full mx-auto space-y-6">
              {activeChat.messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={idx}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border text-xs font-semibold ${
                        isUser ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-white/5 border-white/10 text-neutral-300'
                      }`}>
                        {isUser ? 'U' : 'B'}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                        isUser ? 'bg-amber-500/5 border-amber-500/10 text-neutral-200' : 'bg-white/5 border-white/10 text-neutral-200'
                      }`}>
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {isLoading && activeChat.messages[activeChat.messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-neutral-400 text-sm">
                    Compiling cultural references...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 border-t border-white/5 bg-brand-charcoal">
          <form onSubmit={handleSendMessage} className="max-w-[95%] xl:max-w-[90%] w-full mx-auto relative">
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl focus-within:ring-1 focus-within:ring-amber-500/40 p-2 shadow-2xl">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about Indian culture (e.g. Origin of Yoga...)"
                disabled={isLoading}
                className="flex-1 bg-transparent px-4 py-3 text-sm text-neutral-200 placeholder-neutral-500 outline-none disabled:opacity-50"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="w-4 h-4 text-black font-bold" />
              </motion.button>
            </div>
            <p className="text-center text-[10px] text-neutral-500 mt-2">
              BharatKatha AI queries Llama3 models restricted exclusively to Indian culture, customs, history, and heritage.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
