import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const riskConfig = {
  low: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
    border: 'border-emerald-200',
    label: 'Low Risk'
  },
  medium: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-200',
    label: 'Medium Risk'
  },
  high: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200',
    label: 'High Risk'
  }
};

export default function RiskBadge({ level = 'low', showLabel = true, size = 'md' }) {
  const config = riskConfig[level] || riskConfig.low;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium border",
      config.bg,
      config.border,
      config.color,
      sizeClasses[size]
    )}>
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}