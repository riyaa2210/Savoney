import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';

const statusConfig = {
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
    description: 'Your KYC is complete and verified'
  },
  pending: {
    icon: Clock,
    label: 'Pending',
    color: 'text-amber-500',
    bg: 'bg-amber-100',
    description: 'KYC verification is pending'
  },
  in_progress: {
    icon: Clock,
    label: 'In Progress',
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    description: 'Your documents are being reviewed'
  },
  rejected: {
    icon: XCircle,
    label: 'Rejected',
    color: 'text-red-500',
    bg: 'bg-red-100',
    description: 'Please resubmit your documents'
  }
};

export default function ComplianceStatus({ kycStatus, flaggedCount, isDark }) {
  const status = statusConfig[kycStatus] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className={cn(
      "rounded-2xl p-6 transition-all duration-300",
      isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
    )}>
      <div className="flex items-center gap-3 mb-6">
        <div className={cn(
          "p-3 rounded-xl",
          isDark ? "bg-slate-700" : "bg-slate-100"
        )}>
          <Shield className="w-5 h-5 text-teal-500" />
        </div>
        <h3 className={cn(
          "text-lg font-semibold",
          isDark ? "text-white" : "text-slate-900"
        )}>Compliance Status</h3>
      </div>
      
      {/* KYC Status */}
      <div className={cn(
        "p-4 rounded-xl mb-4",
        isDark ? "bg-slate-700/50" : "bg-slate-50"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", status.bg)}>
            <StatusIcon className={cn("w-5 h-5", status.color)} />
          </div>
          <div>
            <p className={cn(
              "font-medium",
              isDark ? "text-white" : "text-slate-900"
            )}>KYC Status: {status.label}</p>
            <p className={cn(
              "text-sm",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>{status.description}</p>
          </div>
        </div>
      </div>
      
      {/* Flagged Transactions */}
      <div className={cn(
        "p-4 rounded-xl",
        flaggedCount > 0 
          ? "bg-red-50 border border-red-200" 
          : isDark ? "bg-slate-700/50" : "bg-slate-50"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            flaggedCount > 0 ? "bg-red-100" : "bg-emerald-100"
          )}>
            {flaggedCount > 0 
              ? <AlertTriangle className="w-5 h-5 text-red-500" />
              : <CheckCircle className="w-5 h-5 text-emerald-500" />
            }
          </div>
          <div>
            <p className={cn(
              "font-medium",
              flaggedCount > 0 ? "text-red-700" : isDark ? "text-white" : "text-slate-900"
            )}>
              {flaggedCount > 0 
                ? `${flaggedCount} Flagged Transaction${flaggedCount > 1 ? 's' : ''}`
                : 'No Suspicious Activity'
              }
            </p>
            <p className={cn(
              "text-sm",
              flaggedCount > 0 ? "text-red-600" : isDark ? "text-slate-400" : "text-slate-500"
            )}>
              {flaggedCount > 0 
                ? 'Review required for AML compliance'
                : 'All transactions are clear'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}