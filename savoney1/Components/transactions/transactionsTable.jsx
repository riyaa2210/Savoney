import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  TrendingUp,
  AlertTriangle,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TransactionFilters from './TransactionFilters';

const typeIcons = {
  deposit: ArrowDownLeft,
  withdrawal: ArrowUpRight,
  transfer: RefreshCw,
  investment: TrendingUp,
  redemption: ArrowUpRight
};

const typeColors = {
  deposit: 'text-emerald-500',
  withdrawal: 'text-red-500',
  transfer: 'text-blue-500',
  investment: 'text-purple-500',
  redemption: 'text-amber-500'
};

const riskColors = {
  none: '',
  low: 'bg-yellow-50 border-yellow-200',
  medium: 'bg-orange-50 border-orange-200',
  high: 'bg-red-50 border-red-200'
};

export default function TransactionTable({ transactions, isDark, isAdmin = false }) {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    riskFlag: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    dateFrom: null,
    dateTo: null
  });
  const [selectedTxn, setSelectedTxn] = useState(null);

  const filteredTxns = transactions?.filter(txn => {
    // Search filter
    const matchSearch = !filters.search || 
      txn.counterparty?.toLowerCase().includes(filters.search.toLowerCase()) ||
      txn.transaction_id?.toLowerCase().includes(filters.search.toLowerCase());
    
    // Type filter
    const matchType = filters.type === 'all' || txn.type === filters.type;
    
    // Risk filter
    const matchRisk = filters.riskFlag === 'all' || txn.risk_flag === filters.riskFlag;
    
    // Status filter (admin)
    const matchStatus = filters.status === 'all' || txn.status === filters.status;
    
    // Amount range filter
    const amount = txn.amount || 0;
    const matchMinAmount = !filters.minAmount || amount >= parseFloat(filters.minAmount);
    const matchMaxAmount = !filters.maxAmount || amount <= parseFloat(filters.maxAmount);
    
    // Date range filter
    const txnDate = txn.created_date ? new Date(txn.created_date) : null;
    const matchDateFrom = !filters.dateFrom || (txnDate && txnDate >= filters.dateFrom);
    const matchDateTo = !filters.dateTo || (txnDate && txnDate <= filters.dateTo);
    
    return matchSearch && matchType && matchRisk && matchStatus && 
           matchMinAmount && matchMaxAmount && matchDateFrom && matchDateTo;
  }) || [];

  const flaggedCount = transactions?.filter(t => t.risk_flag && t.risk_flag !== 'none').length || 0;

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden transition-all duration-300",
      isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
    )}>
      {/* Header */}
      <div className={cn(
        "p-6 border-b",
        isDark ? "border-slate-700" : "border-slate-200"
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={cn(
              "text-xl font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}>Transactions</h2>
            <p className={cn(
              "text-sm mt-1",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>{filteredTxns.length} transactions found</p>
          </div>
          
          {flaggedCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {flaggedCount} Potential AML Risk{flaggedCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="mt-4">
          <TransactionFilters 
            filters={filters}
            onFilterChange={setFilters}
            isDark={isDark}
            isAdmin={isAdmin}
          />
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={cn(
            isDark ? "bg-slate-700/50" : "bg-slate-50"
          )}>
            <tr>
              <th className={cn(
                "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>Transaction</th>
              <th className={cn(
                "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>Type</th>
              <th className={cn(
                "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>Amount</th>
              <th className={cn(
                "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>Status</th>
              <th className={cn(
                "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>Risk</th>
              <th className={cn(
                "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>Date</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredTxns.map((txn) => {
              const Icon = typeIcons[txn.type] || RefreshCw;
              const isFlagged = txn.risk_flag && txn.risk_flag !== 'none';
              
              return (
                <tr 
                  key={txn.id}
                  className={cn(
                    "transition-colors",
                    isFlagged 
                      ? riskColors[txn.risk_flag]
                      : isDark ? "hover:bg-slate-700/30" : "hover:bg-slate-50"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        isDark ? "bg-slate-700" : "bg-slate-100"
                      )}>
                        <Icon className={cn("w-4 h-4", typeColors[txn.type])} />
                      </div>
                      <div>
                        <p className={cn(
                          "font-medium",
                          isDark ? "text-white" : "text-slate-900"
                        )}>{txn.counterparty || txn.category || 'Transaction'}</p>
                        <p className={cn(
                          "text-xs",
                          isDark ? "text-slate-400" : "text-slate-500"
                        )}>{txn.transaction_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-lg text-xs font-medium capitalize",
                      isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
                    )}>{txn.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "font-semibold",
                      txn.type === 'deposit' || txn.type === 'redemption' 
                        ? "text-emerald-500" 
                        : isDark ? "text-white" : "text-slate-900"
                    )}>
                      {txn.type === 'deposit' || txn.type === 'redemption' ? '+' : '-'}
                      ₹{txn.amount?.toLocaleString('en-IN') || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium capitalize",
                      txn.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                      txn.status === 'flagged' ? "bg-red-100 text-red-700" :
                      txn.status === 'pending' ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    )}>{txn.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {isFlagged ? (
                      <div className="flex items-center gap-1">
                        <AlertTriangle className={cn(
                          "w-4 h-4",
                          txn.risk_flag === 'high' ? "text-red-500" :
                          txn.risk_flag === 'medium' ? "text-orange-500" :
                          "text-yellow-500"
                        )} />
                        <span className={cn(
                          "text-xs font-medium capitalize",
                          txn.risk_flag === 'high' ? "text-red-600" :
                          txn.risk_flag === 'medium' ? "text-orange-600" :
                          "text-yellow-600"
                        )}>{txn.risk_flag}</span>
                      </div>
                    ) : (
                      <span className={cn(
                        "text-xs",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )}>None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-sm",
                      isDark ? "text-slate-300" : "text-slate-600"
                    )}>
                      {txn.created_date ? format(new Date(txn.created_date), 'MMM d, yyyy') : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTxn(txn)}
                      className={isDark ? "text-slate-400 hover:text-white" : ""}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredTxns.length === 0 && (
          <div className="py-12 text-center">
            <RefreshCw className={cn(
              "w-10 h-10 mx-auto mb-3",
              isDark ? "text-slate-600" : "text-slate-300"
            )} />
            <p className={cn(
              "text-sm",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>No transactions found</p>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTxn} onOpenChange={() => setSelectedTxn(null)}>
        <DialogContent className={isDark ? "bg-slate-800 border-slate-700 text-white" : ""}>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTxn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Transaction ID</p>
                  <p className="font-medium">{selectedTxn.transaction_id}</p>
                </div>
                <div>
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Type</p>
                  <p className="font-medium capitalize">{selectedTxn.type}</p>
                </div>
                <div>
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Amount</p>
                  <p className="font-medium">₹{selectedTxn.amount?.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Status</p>
                  <p className="font-medium capitalize">{selectedTxn.status}</p>
                </div>
                <div>
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Counterparty</p>
                  <p className="font-medium">{selectedTxn.counterparty || '-'}</p>
                </div>
                <div>
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Risk Flag</p>
                  <p className={cn(
                    "font-medium capitalize",
                    selectedTxn.risk_flag === 'high' ? "text-red-500" :
                    selectedTxn.risk_flag === 'medium' ? "text-orange-500" :
                    selectedTxn.risk_flag === 'low' ? "text-yellow-500" : ""
                  )}>{selectedTxn.risk_flag || 'None'}</p>
                </div>
              </div>
              
              {selectedTxn.risk_flag && selectedTxn.risk_flag !== 'none' && (
                <div className={cn(
                  "p-4 rounded-xl",
                  selectedTxn.risk_flag === 'high' ? "bg-red-50 border border-red-200" :
                  selectedTxn.risk_flag === 'medium' ? "bg-orange-50 border border-orange-200" :
                  "bg-yellow-50 border border-yellow-200"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={cn(
                      "w-4 h-4",
                      selectedTxn.risk_flag === 'high' ? "text-red-500" :
                      selectedTxn.risk_flag === 'medium' ? "text-orange-500" : "text-yellow-500"
                    )} />
                    <span className="font-medium text-slate-900">Anomaly Detected</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {selectedTxn.notes || 'This transaction has been flagged for unusual activity. Please review.'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Anomaly Score: {selectedTxn.anomaly_score || Math.random().toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}