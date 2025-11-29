import React from 'react';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

export default function TransactionChart({ transactions, isDark }) {
  // Process transactions for chart
  const processData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      return {
        date,
        dateStr: format(date, 'MMM d'),
        deposits: 0,
        withdrawals: 0,
        total: 0
      };
    });

    transactions?.forEach(txn => {
      if (!txn.created_date) return;
      const txnDate = startOfDay(new Date(txn.created_date));
      const dayData = last7Days.find(d => d.date.getTime() === txnDate.getTime());
      if (dayData) {
        if (txn.type === 'deposit' || txn.type === 'redemption') {
          dayData.deposits += txn.amount || 0;
        } else {
          dayData.withdrawals += txn.amount || 0;
        }
        dayData.total += txn.amount || 0;
      }
    });

    return last7Days;
  };

  const data = processData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={cn(
          "px-4 py-3 rounded-xl shadow-lg border",
          isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200"
        )}>
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className={isDark ? "text-slate-300" : "text-slate-600"}>
                {entry.name}:
              </span>
              <span className="font-medium">
                ₹{entry.value?.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn(
      "rounded-2xl p-6 transition-all duration-300",
      isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
    )}>
      <h3 className={cn(
        "text-lg font-semibold mb-6",
        isDark ? "text-white" : "text-slate-900"
      )}>Transaction Volume (7 Days)</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="depositsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="withdrawalsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isDark ? '#334155' : '#e2e8f0'}
              vertical={false}
            />
            <XAxis 
              dataKey="dateStr" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="deposits"
              name="Deposits"
              stroke="#14b8a6"
              strokeWidth={2}
              fill="url(#depositsGradient)"
            />
            <Area
              type="monotone"
              dataKey="withdrawals"
              name="Withdrawals"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#withdrawalsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className={cn(
            "text-sm",
            isDark ? "text-slate-300" : "text-slate-600"
          )}>Deposits</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className={cn(
            "text-sm",
            isDark ? "text-slate-300" : "text-slate-600"
          )}>Withdrawals</span>
        </div>
      </div>
    </div>
  );
}