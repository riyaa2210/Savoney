import React from 'react';
import { cn } from '@/lib/utils';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

const typeIcons = {
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  transfer: RefreshCw,
  investment: TrendingUp,
  redemption: ArrowUpRight
};

const typeColors = {
  deposit: 'text-emerald-500 bg-emerald-100',
  withdrawal: 'text-red-500 bg-red-100',
  transfer: 'text-blue-500 bg-blue-100',
  investment: 'text-purple-500 bg-purple-100',
  redemption: 'text-amber-500 bg-amber-100'
};

export default function RecentTransactions({ transactions, isDark, limit = 5 }) {
  const recentTxns = transactions?.slice(0, limit) || [];

  return (
    <div className={cn(
      "rounded-2xl p-6 transition-all duration-300",
      isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={cn(
          "text-lg font-semibold",
          isDark ? "text-white" : "text-slate-900"
        )}>Recent Transactions</h3>
        <a 
          href="/Transactions"
          className="text-sm text-teal-500 hover:text-teal-600 font-medium"
        >
          View All
        </a>
      </div>
      
      {recentTxns.length > 0 ? (
        <div className="space-y-4">
          {recentTxns.map((txn) => {
            const Icon = typeIcons[txn.type] || RefreshCw;
            const colorClass = typeColors[txn.type] || 'text-slate-500 bg-slate-100';
            const isFlagged = txn.risk_flag && txn.risk_flag !== 'none';
            
            return (
              <div 
                key={txn.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl transition-all duration-200",
                  isFlagged && "ring-2 ring-red-200",
                  isDark ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-xl",
                  colorClass.split(' ')[1],
                  isDark && "bg-opacity-20"
                )}>
                  <Icon className={cn("w-4 h-4", colorClass.split(' ')[0])} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "font-medium truncate",
                      isDark ? "text-white" : "text-slate-900"
                    )}>
                      {txn.counterparty || txn.category || txn.type}
                    </p>
                    {isFlagged && (
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className={cn(
                    "text-xs",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}>
                    {txn.created_date ? format(new Date(txn.created_date), 'MMM d, yyyy • HH:mm') : 'Recent'}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className={cn(
                    "font-semibold",
                    txn.type === 'deposit' || txn.type === 'redemption' 
                      ? "text-emerald-500" 
                      : isDark ? "text-white" : "text-slate-900"
                  )}>
                    {txn.type === 'deposit' || txn.type === 'redemption' ? '+' : '-'}
                    ₹{txn.amount?.toLocaleString('en-IN') || 0}
                  </p>
                  <p className={cn(
                    "text-xs capitalize",
                    txn.status === 'completed' ? "text-emerald-500" :
                    txn.status === 'flagged' ? "text-red-500" :
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}>
                    {txn.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <RefreshCw className={cn(
            "w-10 h-10 mx-auto mb-3",
            isDark ? "text-slate-600" : "text-slate-300"
          )} />
          <p className={cn(
            "text-sm",
            isDark ? "text-slate-400" : "text-slate-500"
          )}>No transactions yet</p>
        </div>
      )}
    </div>
  );
}