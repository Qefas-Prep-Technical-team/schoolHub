"use client";

import React, { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'ai' | 'user';
  content: string;
};

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm the Qefas Hub AI Assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text) return;

    // Add user message to UI
    const newMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create history array for the API (up to last 10 messages)
      const chatHistory = newMessages.slice(-10);

      const response = await fetch('https://tracker.qefashub.com/api/chat', {
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

      setMessages((prev) => [...prev, { role: 'ai', content: aiText }]);
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
                className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === 'ai'
                    ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 self-start rounded-tl-none'
                    : 'bg-blue-600 text-white self-end ml-auto rounded-tr-none'
                }`}
              >
                {msg.content}
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
