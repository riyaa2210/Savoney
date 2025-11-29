import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import RebalancePanel from '@/components/portfolio/RebalancePanel';

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#8b5cf6'];

const goalProjections = [
  { name: 'Year 1', conservative: 105, moderate: 112, aggressive: 120 },
  { name: 'Year 3', conservative: 115, moderate: 140, aggressive: 172 },
  { name: 'Year 5', conservative: 128, moderate: 176, aggressive: 248 },
  { name: 'Year 10', conservative: 163, moderate: 310, aggressive: 619 },
];

export default function Portfolio({ isDark }) {
  const queryClient = useQueryClient();
  const [localAllocation, setLocalAllocation] = useState(null);

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const profile = profiles?.[0];
  const allocation = localAllocation || profile?.portfolio_allocation;

  const handleRebalance = (newAllocation) => {
    setLocalAllocation(newAllocation);
    queryClient.invalidateQueries(['userProfile']);
  };

  const allocationData = [
    { name: 'Equity', value: allocation?.equity || 0, color: '#14b8a6' },
    { name: 'Debt', value: allocation?.debt || 0, color: '#3b82f6' },
    { name: 'Gold', value: allocation?.gold || 0, color: '#f59e0b' },
    { name: 'International', value: allocation?.international || 0, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const assetDetails = [
    {
      name: 'Equity',
      allocation: allocation?.equity || 0,
      expectedReturn: '12-15%',
      risk: 'High',
      description: 'Large cap, Mid cap, and Index funds'
    },
    {
      name: 'Debt',
      allocation: allocation?.debt || 0,
      expectedReturn: '7-9%',
      risk: 'Low',
      description: 'Government bonds, Corporate bonds, FDs'
    },
    {
      name: 'Gold',
      allocation: allocation?.gold || 0,
      expectedReturn: '8-10%',
      risk: 'Medium',
      description: 'Gold ETFs and Sovereign Gold Bonds'
    },
    {
      name: 'International',
      allocation: allocation?.international || 0,
      expectedReturn: '10-14%',
      risk: 'High',
      description: 'US Stocks, Global ETFs'
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={cn(
          "px-4 py-3 rounded-xl shadow-lg border",
          isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-200"
        )}>
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-teal-500 font-bold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  if (!profile?.onboarding_complete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center mb-6",
          isDark ? "bg-slate-800" : "bg-slate-100"
        )}>
          <Sparkles className={cn(
            "w-10 h-10",
            isDark ? "text-slate-600" : "text-slate-400"
          )} />
        </div>
        <h2 className={cn(
          "text-2xl font-bold mb-2",
          isDark ? "text-white" : "text-slate-900"
        )}>Complete Your Profile</h2>
        <p className={cn(
          "mb-6 max-w-md",
          isDark ? "text-slate-400" : "text-slate-500"
        )}>
          Get personalized portfolio recommendations based on your risk profile and goals.
        </p>
        <Link to={createPageUrl('Home')}>
          <Button className="bg-gradient-to-r from-teal-500 to-blue-600">
            Start Onboarding
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={cn(
          "text-2xl lg:text-3xl font-bold",
          isDark ? "text-white" : "text-slate-900"
        )}>Portfolio Recommendations</h1>
        <p className={cn(
          "mt-1",
          isDark ? "text-slate-400" : "text-slate-500"
        )}>AI-powered allocation based on your {profile?.risk_tolerance || 'moderate'} risk profile</p>
      </div>

      {/* AI Rebalancing Panel */}
      {profile && (
        <RebalancePanel 
          profile={profile} 
          isDark={isDark} 
          onRebalance={handleRebalance}
        />
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Chart */}
        <div className={cn(
          "rounded-2xl p-6",
          isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
        )}>
          <h2 className={cn(
            "text-lg font-semibold mb-6",
            isDark ? "text-white" : "text-slate-900"
          )}>Recommended Allocation</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {allocationData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
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

        {/* Growth Projection */}
        <div className={cn(
          "rounded-2xl p-6",
          isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
        )}>
          <h2 className={cn(
            "text-lg font-semibold mb-6",
            isDark ? "text-white" : "text-slate-900"
          )}>Growth Projection (₹1L Investment)</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalProjections}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDark ? '#334155' : '#e2e8f0'}
                  vertical={false}
                />
                <XAxis 
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                    borderRadius: '12px'
                  }}
                  formatter={(value) => [`₹${value}k`, '']}
                />
                <Bar dataKey="conservative" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="moderate" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="aggressive" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>Conservative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-teal-500" />
              <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>Aggressive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Class Details */}
      <div className={cn(
        "rounded-2xl p-6",
        isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
      )}>
        <h2 className={cn(
          "text-lg font-semibold mb-6",
          isDark ? "text-white" : "text-slate-900"
        )}>Asset Class Breakdown</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assetDetails.map((asset, index) => (
            <div 
              key={asset.name}
              className={cn(
                "p-4 rounded-xl border transition-all duration-200 hover:shadow-md",
                isDark ? "border-slate-600 hover:border-slate-500" : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${COLORS[index]}20` }}
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    isDark ? "text-white" : "text-slate-900"
                  )}>{asset.name}</p>
                  <p className="text-2xl font-bold" style={{ color: COLORS[index] }}>
                    {asset.allocation}%
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Expected Return</span>
                  <span className={cn("font-medium", isDark ? "text-slate-200" : "text-slate-700")}>
                    {asset.expectedReturn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Risk Level</span>
                  <span className={cn(
                    "font-medium",
                    asset.risk === 'High' ? "text-red-500" :
                    asset.risk === 'Medium' ? "text-amber-500" : "text-emerald-500"
                  )}>{asset.risk}</span>
                </div>
              </div>
              
              <p className={cn(
                "text-xs mt-3 pt-3 border-t",
                isDark ? "text-slate-400 border-slate-600" : "text-slate-500 border-slate-200"
              )}>{asset.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Goals */}
      {profile?.investment_goals?.length > 0 && (
        <div className={cn(
          "rounded-2xl p-6",
          isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
        )}>
          <h2 className={cn(
            "text-lg font-semibold mb-4",
            isDark ? "text-white" : "text-slate-900"
          )}>Your Investment Goals</h2>
          
          <div className="flex flex-wrap gap-2">
            {profile.investment_goals.map((goal) => (
              <div 
                key={goal}
                className={cn(
                  "px-4 py-2 rounded-xl flex items-center gap-2",
                  isDark ? "bg-slate-700 text-slate-200" : "bg-teal-50 text-teal-700"
                )}
              >
                <Target className="w-4 h-4" />
                <span className="font-medium">{goal}</span>
              </div>
            ))}
          </div>
          
          <div className={cn(
            "mt-4 p-4 rounded-xl flex items-start gap-3",
            isDark ? "bg-slate-700/50" : "bg-blue-50"
          )}>
            <Info className={cn(
              "w-5 h-5 flex-shrink-0 mt-0.5",
              isDark ? "text-blue-400" : "text-blue-500"
            )} />
            <div>
              <p className={cn(
                "font-medium",
                isDark ? "text-slate-200" : "text-slate-900"
              )}>Investment Horizon: {profile.investment_horizon?.replace('_', ' ')}</p>
              <p className={cn(
                "text-sm mt-1",
                isDark ? "text-slate-400" : "text-slate-600"
              )}>
                Your portfolio is optimized for {profile.investment_horizon === 'long_term' ? 'wealth building over 7+ years' :
                profile.investment_horizon === 'medium_term' ? 'balanced growth over 3-7 years' : 'stability over 1-3 years'}.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}