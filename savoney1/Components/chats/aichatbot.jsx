import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles,
  Loader2,
  Bot,
  User
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function AIChatbot({ isDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Savoney AI, your personal wealth advisor. I can help you with:\n\n• Portfolio recommendations\n• Investment strategies\n• Risk assessment\n• Tax planning tips\n• Market insights\n\nHow can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Savoney AI, an expert wealth advisor and financial assistant. Be helpful, concise, and professional. 
        
User question: ${userMessage}

Provide clear, actionable advice related to personal finance, investments, portfolio management, tax planning, or wealth building. If the question is unrelated to finance, politely redirect to financial topics. Keep responses under 150 words.`,
        add_context_from_internet: true
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-gradient-to-r from-teal-500 to-blue-600 text-white",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] rounded-2xl shadow-2xl overflow-hidden flex flex-col",
          "h-[550px] max-h-[calc(100vh-100px)]",
          isDark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"
        )}>
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Savoney AI</h3>
                <p className="text-xs text-white/80">Your Wealth Advisor</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className={cn(
            "flex-1 overflow-y-auto p-4 space-y-4",
            isDark ? "bg-slate-800" : "bg-slate-50"
          )}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === 'user' 
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-br-md"
                    : isDark 
                      ? "bg-slate-700 text-slate-200 rounded-bl-md" 
                      : "bg-white text-slate-700 shadow-sm rounded-bl-md"
                )}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    isDark ? "bg-slate-600" : "bg-slate-200"
                  )}>
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className={cn(
                  "rounded-2xl rounded-bl-md px-4 py-3",
                  isDark ? "bg-slate-700" : "bg-white shadow-sm"
                )}>
                  <Loader2 className={cn("w-5 h-5 animate-spin", isDark ? "text-slate-400" : "text-slate-500")} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={cn(
            "p-4 border-t",
            isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
          )}>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about investments..."
                className={cn(
                  "flex-1",
                  isDark && "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                )}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}