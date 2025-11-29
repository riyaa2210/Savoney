import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  Wallet, 
  Shield, 
  Bell, 
  Settings,
  TrendingUp,
  Moon,
  Sun,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Home' },
  { name: 'Portfolio', icon: Wallet, page: 'Portfolio' },
  { name: 'Transactions', icon: TrendingUp, page: 'Transactions' },
  { name: 'Compliance', icon: Shield, page: 'Compliance' },
  { name: 'Alerts', icon: Bell, page: 'Alerts' },
  { name: 'Admin Panel', icon: Shield, page: 'AdminPanel', admin: true },
  { name: 'Settings', icon: Settings, page: 'Settings' },
];

export default function Sidebar({ currentPage, isDark, onToggleTheme, onLogout }) {
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full w-64 border-r transition-colors duration-300 z-50",
      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className={cn(
              "font-bold text-xl tracking-tight",
              isDark ? "text-white" : "text-slate-900"
            )}>Savoney</h1>
            <p className={cn(
              "text-xs",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>Wealth Advisor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentPage === item.page;
          return (
            <Link
              key={item.name}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-gradient-to-r from-teal-500/10 to-blue-500/10 text-teal-600" 
                  : isDark 
                    ? "text-slate-400 hover:text-white hover:bg-slate-800" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive && "text-teal-500"
              )} />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-inherit">
        <button
          onClick={onToggleTheme}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
            isDark 
              ? "text-slate-400 hover:text-white hover:bg-slate-800" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200",
            "text-red-500 hover:bg-red-50"
          )}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}