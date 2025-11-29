import React from 'react';
import { cn } from '@/lib/utils';
import { Bell, AlertTriangle, Info, CheckCircle, Shield, X } from 'lucide-react';
import { format } from 'date-fns';

const typeConfig = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200' },
  danger: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-200' },
  success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-200' }
};

const categoryIcons = {
  compliance: Shield,
  fraud: AlertTriangle,
  advisory: Info,
  system: Bell
};

export default function AlertsPanel({ alerts, isDark, onMarkRead, limit = 4 }) {
  const recentAlerts = alerts?.slice(0, limit) || [];
  const unreadCount = alerts?.filter(a => !a.is_read).length || 0;

  return (
    <div className={cn(
      "rounded-2xl p-6 transition-all duration-300",
      isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className={cn(
            "text-lg font-semibold",
            isDark ? "text-white" : "text-slate-900"
          )}>Alerts</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <a 
          href="/Alerts"
          className="text-sm text-teal-500 hover:text-teal-600 font-medium"
        >
          View All
        </a>
      </div>
      
      {recentAlerts.length > 0 ? (
        <div className="space-y-3">
          {recentAlerts.map((alert) => {
            const config = typeConfig[alert.type] || typeConfig.info;
            const Icon = config.icon;
            const CategoryIcon = categoryIcons[alert.category] || Bell;
            
            return (
              <div 
                key={alert.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200",
                  !alert.is_read && "ring-2 ring-teal-200",
                  config.border,
                  isDark ? "bg-slate-700/30" : config.bg + "/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg flex-shrink-0", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={cn(
                        "font-medium text-sm",
                        isDark ? "text-white" : "text-slate-900"
                      )}>{alert.title}</p>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs capitalize",
                        isDark ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-600"
                      )}>
                        {alert.category}
                      </span>
                    </div>
                    <p className={cn(
                      "text-xs line-clamp-2",
                      isDark ? "text-slate-400" : "text-slate-500"
                    )}>{alert.message}</p>
                    <p className={cn(
                      "text-xs mt-2",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}>
                      {alert.created_date ? format(new Date(alert.created_date), 'MMM d, HH:mm') : 'Just now'}
                    </p>
                  </div>
                  
                  {!alert.is_read && onMarkRead && (
                    <button
                      onClick={() => onMarkRead(alert.id)}
                      className={cn(
                        "p-1 rounded-lg transition-colors",
                        isDark ? "hover:bg-slate-600" : "hover:bg-slate-200"
                      )}
                    >
                      <X className={cn(
                        "w-4 h-4",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Bell className={cn(
            "w-10 h-10 mx-auto mb-3",
            isDark ? "text-slate-600" : "text-slate-300"
          )} />
          <p className={cn(
            "text-sm",
            isDark ? "text-slate-400" : "text-slate-500"
          )}>No alerts</p>
        </div>
      )}
    </div>
  );
}