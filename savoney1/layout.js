import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/ui/Sidebar';
import AIChatbot from '@/components/chat/AIChatbot';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Layout({ children, currentPageName }) {
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.theme_preference === 'dark') {
          setIsDark(true);
        }
      } catch (e) {
        // User not logged in or no preference
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await base44.auth.updateMe({ theme_preference: newTheme ? 'dark' : 'light' });
    } catch (e) {
      // Silently fail
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark ? "bg-slate-900" : "bg-slate-50"
    )}>
      {/* Mobile Header */}
      <div className={cn(
        "lg:hidden fixed top-0 left-0 right-0 h-16 border-b z-40 flex items-center justify-between px-4",
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <span className={cn(
            "font-bold text-lg",
            isDark ? "text-white" : "text-slate-900"
          )}>Savoney</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={isDark ? "text-white" : ""}
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "lg:block",
        sidebarOpen ? "block" : "hidden"
      )}>
        <Sidebar 
          currentPage={currentPageName}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content */}
      <main className={cn(
        "lg:ml-64 min-h-screen transition-all duration-300",
        "pt-16 lg:pt-0"
      )}>
        <div className="p-4 lg:p-8">
          {React.cloneElement(children, { isDark, toggleTheme })}
        </div>
      </main>

      {/* AI Chatbot */}
      <AIChatbot isDark={isDark} />
    </div>
  );
}