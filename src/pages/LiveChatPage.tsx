// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';

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
  const [isSending, setIsSending] = useState(false);

  // Call-related States
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(20);
  const [visualizerTimer, setVisualizerTimer] = useState<any>(null);
  const [pendingOffer, setPendingOffer] = useState<any>(null);

  // WebRTC & Ring Tone Refs
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const processedSignalingMsgs = useRef<Set<number>>(new Set());
  const ringIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopRinging();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (visualizerTimer) {
        clearInterval(visualizerTimer);
      }
    };
  }, [visualizerTimer]);

  const startRinging = () => {
    if (ringIntervalRef.current) return;
    
    const playRing = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const t = ctx.currentTime;
        
        const playTone = (start: number, duration: number) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc1.frequency.setValueAtTime(400, start);
          osc2.frequency.setValueAtTime(450, start);
          
          gainNode.gain.setValueAtTime(0, start);
          gainNode.gain.linearRampToValueAtTime(0.2, start + 0.05);
          gainNode.gain.setValueAtTime(0.2, start + duration - 0.05);
          gainNode.gain.linearRampToValueAtTime(0, start + duration);
          
          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc1.start(start);
          osc2.start(start);
          osc1.stop(start + duration);
          osc2.stop(start + duration);
        };
        
        playTone(t, 0.4);
        playTone(t + 0.6, 0.4);
      } catch (e) {
        console.error("Audio ring synth error", e);
      }
    };
    
    playRing();
    ringIntervalRef.current = setInterval(playRing, 3000);
  };

  const stopRinging = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
  };

  const startVoiceVisualizer = (active: boolean) => {
    if (visualizerTimer) clearInterval(visualizerTimer);
    if (!active) {
      setVoiceVolume(20);
      return;
    }
    const timer = setInterval(() => {
      setVoiceVolume(Math.floor(Math.random() * 40) + 15);
    }, 120);
    setVisualizerTimer(timer);
  };

  const sendAdminSignaling = async (content: string) => {
    if (!selectedSession) return;
    try {
      await fetch(`${API_BASE}/livechat/sessions/${selectedSession}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content })
      });
    } catch (e) {
      console.error("Failed to send admin signaling:", e);
    }
  };

  const handleAdminIncomingSignaling = async (text: string) => {
    if (text.startsWith("[RTC_OFFER]:")) {
      try {
        const offerStr = text.replace("[RTC_OFFER]:", "");
        const offer = JSON.parse(offerStr);
        setPendingOffer(offer);
        setCallStatus('ringing');
        startRinging();
      } catch (e) {
        console.error("Failed to parse RTC offer:", e);
      }
    } else if (text.startsWith("[RTC_ICE]:") && pcRef.current) {
      try {
        const candStr = text.replace("[RTC_ICE]:", "");
        const candidate = JSON.parse(candStr);
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Failed to add remote candidate:", e);
      }
    } else if (text.startsWith("[RTC_HANGUP]")) {
      handleAdminHangUp(false);
    }
  };

  const handleAdminAnswer = async () => {
    stopRinging();
    if (!pendingOffer || !selectedSession) return;

    setIsCallActive(true);
    setCallStatus('connected');

    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      pcRef.current = pc;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate && selectedSession) {
          sendAdminSignaling(`[RTC_ICE]:${JSON.stringify(event.candidate)}`);
        }
      };

      pc.ontrack = (event) => {
        console.log("Admin received remote stream");
        const audio = new Audio();
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
      };

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await sendAdminSignaling(`[RTC_ANSWER]:${JSON.stringify(answer)}`);
      startVoiceVisualizer(true);

    } catch (err) {
      console.error("Admin WebRTC answer failed:", err);
      alert("تعذر الوصول للمايكروفون للرد على المكالمة.");
      handleAdminHangUp(true);
    }
  };

  const handleAdminHangUp = (shouldSignal: boolean = true) => {
    stopRinging();
    
    if (shouldSignal && selectedSession) {
      sendAdminSignaling("[RTC_HANGUP]");
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    setIsCallActive(false);
    setCallStatus('idle');
    setPendingOffer(null);
    startVoiceVisualizer(false);
  };

  const processAdminMessages = (rawMessages: any[]) => {
    const filtered: ChatMessage[] = [];

    for (const msg of rawMessages) {
      const msgText = msg.text || msg.content || "";
      const msgId = msg.id;

      if (typeof msgText === "string" && msgText.startsWith("[RTC_")) {
        if (!processedSignalingMsgs.current.has(msgId)) {
          processedSignalingMsgs.current.add(msgId);
          handleAdminIncomingSignaling(msgText);
        }
        continue;
      }

      filtered.push({
        id: msgId,
        sender: msg.sender,
        text: msgText,
        created_at: msg.created_at
      });
    }

    setMessages(filtered);
  };

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
        processAdminMessages(data);
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
    if (!inputMessage.trim() || !selectedSession || isSending) return;

    setIsSending(true);

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
    } finally {
      setIsSending(false);
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
            <div className="p-4 text-center text-gray-500 font-sans">لا يوجد عملاء يطلبون المساعدة حالياً.</div>
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
            {callStatus === 'ringing' && (
              <div className="bg-gradient-to-r from-[#05073C] to-[#EB662B] p-4 text-white flex justify-between items-center shadow-md animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-xl">📞</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">مكالمة صوتية واردة من العميل...</h4>
                    <p className="text-xs text-white/70">العميل يطلب اتصالاً صوتياً حياً ثنائي الاتجاه.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleAdminAnswer}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 font-bold rounded-lg text-xs shadow transition-all duration-300"
                  >
                    قبول المكالمة (Answer)
                  </button>
                  <button 
                    onClick={() => handleAdminHangUp(true)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 font-bold rounded-lg text-xs shadow transition-all duration-300"
                  >
                    رفض (Decline)
                  </button>
                </div>
              </div>
            )}

            {isCallActive && callStatus === 'connected' && (
              <div className="bg-gradient-to-r from-[#05073C] via-[#121661] to-[#02031F] p-4 text-white flex justify-between items-center shadow-md border-b border-[#D4AF37]/20">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 animate-ping"></div>
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-xs">🎙️</div>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#D4AF37] flex items-center gap-2">
                      مكالمة صوتية نشطة
                      <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">ON AIR</span>
                    </h4>
                    <p className="text-xs text-white/60">تحدث الآن مع العميل عبر الميكروفون المباشر.</p>
                  </div>
                  
                  <div className="flex items-center gap-0.5 h-4 ml-4">
                    {[1, 2, 3, 2, 1].map((val, idx) => (
                      <span 
                        key={idx}
                        className="w-0.5 bg-green-400 rounded-full transition-all duration-150"
                        style={{ height: `${val * (voiceVolume / 4)}px` }}
                      ></span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => {
                      const nextMuted = !isMuted;
                      setIsMuted(nextMuted);
                      if (localStreamRef.current) {
                        localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !nextMuted);
                      }
                    }}
                    className={`p-2 rounded-full text-xs font-bold transition ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`}
                  >
                    {isMuted ? '❌ كتم الميكروفون' : '🎙️ الميكروفون نشط'}
                  </button>
                  <button 
                    onClick={() => handleAdminHangUp(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 font-bold rounded-lg text-xs shadow-lg transition-all"
                  >
                    إنهاء المكالمة (Hang Up)
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm z-10">
              <h2 className="font-bold text-gray-800 text-lg">محادثة مع العميل</h2>
              <button 
                onClick={handleCloseSession}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm font-semibold animate-in fade-in"
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
                disabled={!inputMessage.trim() || isSending}
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
