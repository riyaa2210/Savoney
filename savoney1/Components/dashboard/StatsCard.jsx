import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  gradient,
  isDark 
}) {
  const isPositive = trend === 'up';
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-lg",
      isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
    )}>
      {/* Gradient Accent */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20",
        gradient || "bg-teal-500"
      )} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-3 rounded-xl",
            isDark ? "bg-slate-700" : "bg-slate-100"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              gradient?.includes('teal') ? "text-teal-500" : 
              gradient?.includes('blue') ? "text-blue-500" :
              gradient?.includes('purple') ? "text-purple-500" :
              gradient?.includes('amber') ? "text-amber-500" : "text-teal-500"
            )} />
          </div>
          
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              isPositive 
                ? "bg-emerald-100 text-emerald-700" 
                : "bg-red-100 text-red-700"
            )}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
        
        <p className={cn(
          "text-sm mb-1",
          isDark ? "text-slate-400" : "text-slate-500"
        )}>{title}</p>
        
        <p className={cn(
          "text-2xl font-bold mb-1",
          isDark ? "text-white" : "text-slate-900"
        )}>{value}</p>
        
        {subtitle && (
          <p className={cn(
            "text-xs",
            isDark ? "text-slate-500" : "text-slate-400"
          )}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}