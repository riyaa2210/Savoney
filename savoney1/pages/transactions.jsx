import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionChart from '@/components/transactions/TransactionChart';
import { 
  AlertTriangle, 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";

// Mock anomaly detection logic
const detectAnomalies = (transactions) => {
  if (!transactions || transactions.length === 0) return [];
  
  const amounts = transactions.map(t => t.amount || 0);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length
  );
  
  return transactions.map(txn => {
    const zscore = Math.abs((txn.amount - mean) / (stdDev || 1));
    let risk_flag = 'none';
    let anomaly_score = zscore;
    
    // High amount threshold
    if (txn.amount > 500000) {
      risk_flag = 'high';
      anomaly_score = Math.max(anomaly_score, 0.9);
    } else if (zscore > 2.5) {
      risk_flag = 'high';
    } else if (zscore > 1.5) {
      risk_flag = 'medium';
    } else if (zscore > 1) {
      risk_flag = 'low';
    }
    
    // Pattern detection (mock)
    if (txn.type === 'withdrawal' && txn.amount > 100000) {
      risk_flag = risk_flag === 'none' ? 'low' : risk_flag;
    }
    
    return {
      ...txn,
      risk_flag,
      anomaly_score: anomaly_score.toFixed(2)
    };
  });
};

// Generate sample transactions
const generateSampleTransactions = () => {
  const types = ['deposit', 'withdrawal', 'transfer', 'investment', 'redemption'];
  const counterparties = [
    'HDFC Bank', 'ICICI Securities', 'Zerodha', 'Groww', 'PayTM', 
    'Google Pay', 'PhonePe', 'Axis Bank', 'SBI', 'Kotak'
  ];
  const categories = ['Salary', 'Investment', 'Bills', 'Shopping', 'Transfer'];
  
  const transactions = [];
  const now = new Date();
  
  for (let i = 0; i < 25; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    let amount;
    if (Math.random() < 0.1) {
      // 10% chance of large transaction
      amount = Math.floor(Math.random() * 500000) + 200000;
    } else {
      amount = Math.floor(Math.random() * 50000) + 1000;
    }
    
    transactions.push({
      transaction_id: `TXN${Date.now()}${i}`,
      type,
      amount,
      currency: 'INR',
      status: Math.random() > 0.9 ? 'pending' : 'completed',
      counterparty: counterparties[Math.floor(Math.random() * counterparties.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      created_date: date.toISOString()
    });
  }
  
  return transactions;
};

export default function Transactions({ isDark }) {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 100),
  });

  const createTransactionsMutation = useMutation({
    mutationFn: (data) => base44.entities.Transaction.bulkCreate(data),
    onSuccess: () => queryClient.invalidateQueries(['transactions'])
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['transactions'])
  });

  // Apply anomaly detection
  const processedTransactions = detectAnomalies(transactions);

  // Update flagged transactions in DB
  useEffect(() => {
    if (processedTransactions?.length > 0) {
      processedTransactions.forEach(txn => {
        if (txn.risk_flag !== 'none' && txn.id) {
          // Only update if flag changed
          const original = transactions?.find(t => t.id === txn.id);
          if (original && original.risk_flag !== txn.risk_flag) {
            updateTransactionMutation.mutate({
              id: txn.id,
              data: { risk_flag: txn.risk_flag, anomaly_score: parseFloat(txn.anomaly_score) }
            });
          }
        }
      });
    }
  }, [transactions?.length]);

  const handleGenerateSample = async () => {
    const sampleData = generateSampleTransactions();
    await createTransactionsMutation.mutateAsync(sampleData);
  };

  // Calculate stats
  const totalDeposits = processedTransactions?.reduce((sum, t) => 
    t.type === 'deposit' ? sum + (t.amount || 0) : sum, 0) || 0;
  
  const totalWithdrawals = processedTransactions?.reduce((sum, t) => 
    t.type === 'withdrawal' ? sum + (t.amount || 0) : sum, 0) || 0;

  const flaggedCount = processedTransactions?.filter(t => 
    t.risk_flag && t.risk_flag !== 'none').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={cn(
            "text-2xl lg:text-3xl font-bold",
            isDark ? "text-white" : "text-slate-900"
          )}>Transaction Monitoring</h1>
          <p className={cn(
            "mt-1",
            isDark ? "text-slate-400" : "text-slate-500"
          )}>Real-time anomaly detection and AML compliance</p>
        </div>
        
        {(!transactions || transactions.length === 0) && (
          <Button
            onClick={handleGenerateSample}
            disabled={createTransactionsMutation.isPending}
            className="bg-gradient-to-r from-teal-500 to-blue-600"
          >
            <RefreshCw className={cn(
              "w-4 h-4 mr-2",
              createTransactionsMutation.isPending && "animate-spin"
            )} />
            Generate Sample Data
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cn(
          "rounded-2xl p-5 flex items-center gap-4",
          isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
        )}>
          <div className={cn(
            "p-3 rounded-xl",
            isDark ? "bg-emerald-500/20" : "bg-emerald-100"
          )}>
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Total Deposits</p>
            <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>
              ₹{totalDeposits.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "rounded-2xl p-5 flex items-center gap-4",
          isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
        )}>
          <div className={cn(
            "p-3 rounded-xl",
            isDark ? "bg-red-500/20" : "bg-red-100"
          )}>
            <ArrowUpRight className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Total Withdrawals</p>
            <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>
              ₹{totalWithdrawals.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "rounded-2xl p-5 flex items-center gap-4",
          isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
        )}>
          <div className={cn(
            "p-3 rounded-xl",
            isDark ? "bg-blue-500/20" : "bg-blue-100"
          )}>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Total Transactions</p>
            <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>
              {processedTransactions?.length || 0}
            </p>
          </div>
        </div>
        
        <div className={cn(
          "rounded-2xl p-5 flex items-center gap-4",
          flaggedCount > 0 
            ? "bg-red-50 border border-red-200" 
            : isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
        )}>
          <div className={cn(
            "p-3 rounded-xl",
            flaggedCount > 0 ? "bg-red-100" : isDark ? "bg-amber-500/20" : "bg-amber-100"
          )}>
            <AlertTriangle className={cn(
              "w-5 h-5",
              flaggedCount > 0 ? "text-red-500" : "text-amber-500"
            )} />
          </div>
          <div>
            <p className={cn(
              "text-sm",
              flaggedCount > 0 ? "text-red-600" : isDark ? "text-slate-400" : "text-slate-500"
            )}>Flagged Transactions</p>
            <p className={cn(
              "text-xl font-bold",
              flaggedCount > 0 ? "text-red-700" : isDark ? "text-white" : "text-slate-900"
            )}>
              {flaggedCount}
            </p>
          </div>
        </div>
      </div>

      {/* AML Warning Banner */}
      {flaggedCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-100">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="font-semibold text-red-700">Potential AML Risk Detected</p>
            <p className="text-sm text-red-600">
              {flaggedCount} transaction{flaggedCount > 1 ? 's' : ''} flagged for unusual patterns. Please review for compliance.
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <TransactionChart 
        transactions={processedTransactions}
        isDark={isDark}
      />

      {/* Table */}
      <TransactionTable 
        transactions={processedTransactions}
        isDark={isDark}
      />
    </div>
  );
}