import React, { useState, useEffect } from 'react';

interface ChatSession {
  id: number;
  session_token: string;
  is_human_mode: boolean;
  is_closed: boolean;
  updated_at: string;
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'bot' | 'admin';
  text: string;
  created_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const AdminLiveChatPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/livechat/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    }
  };

  const fetchMessages = async (sessionToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/livechat/sessions/${sessionToken}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000); // refresh sessions list
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedSession) return;
    
    fetchMessages(selectedSession);
    const interval = setInterval(() => {
      fetchMessages(selectedSession);
    }, 2000); // refresh current chat every 2s
    
    return () => clearInterval(interval);
  }, [selectedSession]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedSession) return;

    try {
      await fetch(`${API_BASE}/livechat/sessions/${selectedSession}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage })
      });
      setInputMessage("");
      fetchMessages(selectedSession);
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedSession) return;
    try {
      await fetch(`${API_BASE}/livechat/sessions/${selectedSession}/close`, {
        method: "POST"
      });
      setSelectedSession(null);
      fetchSessions();
    } catch (e) {
      console.error("Failed to close session", e);
    }
  };

  return (
    <div className="flex h-[80vh] bg-white rounded-2xl shadow-xl border overflow-hidden">
      {/* Sidebar: Session List */}
      <div className="w-1/3 bg-slate-50 border-r flex flex-col">
        <div className="p-4 bg-slate-900 text-white font-bold text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          Active Live Chats
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">لا يوجد عملاء يطلبون المساعدة حالياً.</div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id}
                onClick={() => setSelectedSession(session.session_token)}
                className={`p-4 border-b cursor-pointer transition ${selectedSession === session.session_token ? 'bg-orange-50 border-l-4 border-l-[#EB662B]' : 'hover:bg-gray-50'}`}
              >
                <div className="font-bold text-gray-800">عميل #{session.id}</div>
                <div className="text-xs text-gray-500 mt-1">Token: {session.session_token.substring(0,8)}...</div>
                <div className="text-xs text-red-500 mt-1 font-semibold animate-pulse">في انتظار ردك!</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Area: Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedSession ? (
          <>
            <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm z-10">
              <h2 className="font-bold text-gray-800 text-lg">محادثة مع العميل</h2>
              <button 
                onClick={handleCloseSession}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-semibold"
              >
                إنهاء المحادثة (Close)
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] p-3 rounded-xl ${
                    msg.sender === 'admin' 
                      ? 'bg-[#05073C] text-white rounded-tr-none' 
                      : (msg.sender === 'bot' ? 'bg-gray-300 text-gray-800 rounded-tl-none' : 'bg-[#EB662B] text-white rounded-tl-none')
                  }`}>
                    <div className="text-[10px] opacity-70 mb-1">
                      {msg.sender === 'admin' ? 'You (Admin)' : (msg.sender === 'bot' ? 'Kemet AI' : 'Customer')}
                    </div>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="اكتب ردك للعميل هنا..."
                className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#05073C]"
              />
              <button 
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-6 py-3 bg-[#05073C] text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50"
              >
                إرسال
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
            <svg className="w-20 h-20 mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path></svg>
            <p className="text-xl">اختر محادثة للبدء في الرد على العملاء</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLiveChatPage;
