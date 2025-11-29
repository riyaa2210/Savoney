import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function PortfolioChart({ allocation, isDark }) {
  const data = [
    { name: 'Equity', value: allocation?.equity || 0 },
    { name: 'Debt', value: allocation?.debt || 0 },
    { name: 'Gold', value: allocation?.gold || 0 },
    { name: 'International', value: allocation?.international || 0 },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={cn(
          "px-3 py-2 rounded-lg shadow-lg",
          isDark ? "bg-slate-800 text-white" : "bg-white text-slate-900"
        )}>
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-teal-500 font-bold">{payload[0].value}%</p>
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
        "text-lg font-semibold mb-4",
        isDark ? "text-white" : "text-slate-900"
      )}>Portfolio Allocation</h3>
      
      {data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className={cn(
            "text-sm",
            isDark ? "text-slate-400" : "text-slate-500"
          )}>Complete onboarding to see your allocation</p>
        </div>
      )}
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index] }}
            />
            <span className={cn(
              "text-sm",
              isDark ? "text-slate-300" : "text-slate-600"
            )}>{item.name}</span>
            <span className={cn(
              "ml-auto text-sm font-medium",
              isDark ? "text-white" : "text-slate-900"
            )}>{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}