import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function RiskScoreGauge({ score, isDark }) {
  const normalizedScore = Math.min(100, Math.max(0, score || 0));
  const rotation = (normalizedScore / 100) * 180 - 90;
  
  const getRiskLevel = () => {
    if (normalizedScore <= 33) return { label: 'Conservative', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (normalizedScore <= 66) return { label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500' };
    return { label: 'Aggressive', color: 'text-red-500', bg: 'bg-red-500' };
  };
  
  const riskLevel = getRiskLevel();

  return (
    <div className={cn(
      "rounded-2xl p-6 transition-all duration-300",
      isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={cn(
          "text-lg font-semibold",
          isDark ? "text-white" : "text-slate-900"
        )}>Risk Score</h3>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-medium",
          riskLevel.color,
          isDark ? "bg-slate-700" : "bg-slate-100"
        )}>
          {riskLevel.label}
        </div>
      </div>
      
      {/* Gauge */}
      <div className="relative w-48 h-24 mx-auto mb-4">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={isDark ? '#334155' : '#e2e8f0'}
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Gradient arc */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(normalizedScore / 100) * 251.2} 251.2`}
          />
          {/* Needle */}
          <g transform={`rotate(${rotation}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke={isDark ? '#fff' : '#1e293b'}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill={isDark ? '#fff' : '#1e293b'} />
          </g>
        </svg>
        
        {/* Score Display */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <span className={cn(
            "text-3xl font-bold",
            isDark ? "text-white" : "text-slate-900"
          )}>{normalizedScore}</span>
          <span className={cn(
            "text-sm ml-1",
            isDark ? "text-slate-400" : "text-slate-500"
          )}>/100</span>
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between px-4">
        <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Conservative</span>
        <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Moderate</span>
        <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Aggressive</span>
      </div>
    </div>
  );
}