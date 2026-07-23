"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { io, Socket } from 'socket.io-client';

type Message = {
  role: 'ai' | 'user' | 'agent';
  content: string;
  senderName?: string;
  timestamp?: number;
};

const renderMessageContent = (content: string, role: 'ai' | 'user' | 'agent') => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  if (!linkRegex.test(content)) {
    return content;
  }
  
  linkRegex.lastIndex = 0;
  
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    
    parts.push(
      <a 
        key={`link-${match.index}`} 
        href={match[2]} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`underline font-medium ${
          role === 'user' 
            ? 'text-white hover:text-gray-200' 
            : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
        }`}
      >
        {match[1]}
      </a>
    );
    
    lastIndex = linkRegex.lastIndex;
  }
  
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }
  
  return <>{parts}</>;
};

export default function AIChatWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isSubdomain, setIsSubdomain] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm the Qefas Hub AI Assistant. How can I help you today?", timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      let hasSub = false;
      
      const rootDomains = ["schoolhub.flexitistudio.com", "qefashub.com", "localhost", "127.0.0.1"];
      const isRoot = rootDomains.some(domain => 
          host === domain || host === `www.${domain}`
      );
      
      if (!isRoot) {
          if (host.includes("localhost") || host.includes("127.0.0.1")) {
              const parts = host.split(".");
              hasSub = parts.length > 1 && parts[0] !== "localhost" && parts[0] !== "www";
          } else {
              hasSub = true;
          }
      }
      setIsSubdomain(hasSub);
      
      // Load history from localStorage
      try {
        const stored = localStorage.getItem('qefas_chat_history');
        const storedTicketId = localStorage.getItem('qefas_ticket_id');
        const storedTime = localStorage.getItem('qefas_chat_time');
        
        // Clear if older than 24 hours
        if (storedTime && Date.now() - parseInt(storedTime) > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('qefas_chat_history');
          localStorage.removeItem('qefas_ticket_id');
          localStorage.removeItem('qefas_chat_time');
        } else if (stored) {
          setMessages(JSON.parse(stored));
          if (storedTicketId) setTicketId(storedTicketId);
        }
      } catch (e) {}
    }
  }, []);

  // Save to localStorage whenever messages change
  useEffect(() => {
    if (mounted && messages.length > 1) {
      localStorage.setItem('qefas_chat_history', JSON.stringify(messages));
      localStorage.setItem('qefas_chat_time', Date.now().toString());
    }
  }, [messages, mounted]);

  // Setup Socket.io if we have a ticketId
  useEffect(() => {
    if (!ticketId) {
      console.log("[AIChatWidget] No ticketId yet, not connecting socket.");
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") || "http://localhost:5000";
    console.log("[AIChatWidget] Connecting to socket at:", socketUrl, "for ticket:", ticketId);
    const socket = io(socketUrl, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[AIChatWidget] Socket connected! Joining room ticket:", ticketId);
      socket.emit("join:ticket", ticketId);
    });

    socket.on("new_message", (msg: any) => {
      console.log("[AIChatWidget] Received new_message:", msg);
      // If it's from the agent, append to UI
      if (msg.senderRole === "SUPPORT_AGENT") {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(p => p.timestamp === msg.createdAt)) return prev;
          return [...prev, { 
            role: 'agent', 
            content: msg.content, 
            senderName: msg.senderName, 
            timestamp: msg.createdAt 
          }];
        });
      }
    });

    socket.on("session_ended", () => {
      console.log("[AIChatWidget] Received session_ended, returning to AI");
      handleEndSession();
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleEndSession = () => {
    localStorage.removeItem('qefas_ticket_id');
    setTicketId(null);
    setMessages(prev => [...prev, { role: 'ai', content: "Your live support session has ended. I am the AI Assistant. How can I help you next?", timestamp: Date.now() }]);
  };

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    // Add user message to UI
    const newUserMsg: Message = { role: 'user', content: text, timestamp: Date.now() };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // If we already have a ticket, POST direct to guest API
      if (ticketId) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiUrl}/support/guest-tickets/${ticketId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text, name: "Guest" })
        });
        
        if (res.ok) {
           // We don't add the AI response because the Agent will reply
           setIsLoading(false);
           return;
        }
      }

      // Create history array for the API (up to last 10 messages)
      const chatHistory = newMessages.slice(-10);

      const chatApiUrl = process.env.NEXT_PUBLIC_CHAT_API_URL || 'https://tracker.qefashub.com/api/chat';
      const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          mode: 'hub',
          history: chatHistory
        })
      });

      const data = await response.json();
      const aiText = data.answer || "Sorry, I couldn't process that.";
      
      if (data.ticketId) {
         setTicketId(data.ticketId);
         localStorage.setItem('qefas_ticket_id', data.ticketId);
      }

      setMessages((prev) => [...prev, { role: 'ai', content: aiText, timestamp: Date.now() }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: "Connection error. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const isDashboard = pathname?.startsWith("/dashboard") || 
                      pathname?.startsWith("/console") || 
                      pathname?.startsWith("/platform");

  const isSetupFlow = pathname?.startsWith("/select-plan") || 
                      pathname?.startsWith("/checkout") || 
                      pathname?.startsWith("/onboarding");

  const shouldShow = !isDashboard && !isSetupFlow && !isSubdomain;

  if (!mounted || !shouldShow) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[350px] h-[500px] bg-white dark:bg-gray-900 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden mb-4 border border-gray-200 dark:border-gray-800 transition-all duration-300 transform origin-bottom-right">
          {/* Header */}
          <div className="bg-[#0f172a] text-white p-4 font-bold flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Qefas Hub Support</span>
              {ticketId && (
                <button 
                  onClick={handleEndSession}
                  className="ml-2 text-[10px] bg-red-500/20 text-red-100 px-2 py-0.5 rounded-full hover:bg-red-500/40 transition-colors border border-red-500/30"
                >
                  End Session
                </button>
              )}
            </div>
            <button
              onClick={toggleChat}
              className="bg-transparent border-none text-white cursor-pointer text-xl hover:text-gray-300 transition-colors"
            >
              &times;
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-gray-800 flex flex-col gap-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] flex flex-col gap-1 ${msg.role !== 'ai' && msg.role !== 'agent' ? 'self-end ml-auto' : 'self-start'}`}
              >
                {(msg.role === 'agent') && (
                  <span className="text-[10px] font-bold text-gray-500 uppercase px-1">
                    👨‍💻 {msg.senderName ? msg.senderName.split(' ').pop() : 'Representative'}
                  </span>
                )}
                <div
                  className={`p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                    msg.role === 'ai'
                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 rounded-tl-none'
                      : msg.role === 'agent'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800/50 rounded-tl-none'
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}
                >
                  {renderMessageContent(msg.content, msg.role)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="max-w-[85%] p-3 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 border border-gray-100 dark:border-gray-600 self-start rounded-tl-none shadow-sm flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2 bg-white dark:bg-gray-900">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all text-sm"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white border-none px-4 py-2.5 rounded-lg cursor-pointer font-bold transition-colors shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full bg-[#0f172a] text-white border-none cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${isOpen ? 'rotate-90 scale-90' : 'rotate-0'}`}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </div>
  );
}
