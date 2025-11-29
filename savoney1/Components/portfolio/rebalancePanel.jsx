import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';

// Mock market conditions data
const MARKET_CONDITIONS = {
  equity: { trend: 'bullish', volatility: 'medium', recommendation: 'hold' },
  debt: { trend: 'stable', volatility: 'low', recommendation: 'increase' },
  gold: { trend: 'bullish', volatility: 'low', recommendation: 'hold' },
  international: { trend: 'bearish', volatility: 'high', recommendation: 'reduce' }
};

// AI-powered rebalancing logic
const generateRebalanceSuggestion = async (currentAllocation, riskTolerance, marketConditions) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing
  
  let suggested = { ...currentAllocation };
  const adjustments = [];

  // Base adjustments on risk tolerance
  const riskMultiplier = riskTolerance === 'aggressive' ? 1.2 : 
                         riskTolerance === 'conservative' ? 0.8 : 1;

  // Analyze each asset class
  if (marketConditions.equity.trend === 'bullish' && riskTolerance !== 'conservative') {
    const increase = Math.round(5 * riskMultiplier);
    suggested.equity = Math.min(80, currentAllocation.equity + increase);
    adjustments.push({
      asset: 'Equity',
      change: increase,
      reason: 'Market showing bullish trends with favorable conditions'
    });
  }

  if (marketConditions.international.trend === 'bearish') {
    const decrease = Math.round(3 * (2 - riskMultiplier));
    suggested.international = Math.max(0, currentAllocation.international - decrease);
    adjustments.push({
      asset: 'International',
      change: -decrease,
      reason: 'Global markets volatile, reducing exposure'
    });
  }

  if (marketConditions.debt.recommendation === 'increase' && riskTolerance !== 'aggressive') {
    const increase = Math.round(5 * (2 - riskMultiplier));
    suggested.debt = currentAllocation.debt + increase;
    adjustments.push({
      asset: 'Debt',
      change: increase,
      reason: 'Stable returns with low volatility, good for portfolio stability'
    });
  }

  // Gold as hedge
  if (marketConditions.gold.trend === 'bullish') {
    const increase = 2;
    suggested.gold = currentAllocation.gold + increase;
    adjustments.push({
      asset: 'Gold',
      change: increase,
      reason: 'Gold trending up, good inflation hedge'
    });
  }

  // Normalize to 100%
  const total = suggested.equity + suggested.debt + suggested.gold + suggested.international;
  if (total !== 100) {
    const diff = 100 - total;
    suggested.debt += diff; // Adjust debt to balance
  }

  return {
    currentAllocation,
    suggestedAllocation: suggested,
    adjustments: adjustments.filter(a => a.change !== 0),
    marketInsights: [
      { label: 'Market Sentiment', value: 'Moderately Bullish', trend: 'up' },
      { label: 'Volatility Index', value: 'Medium (22.5)', trend: 'stable' },
      { label: 'Risk-Adjusted Return', value: '+8.2% projected', trend: 'up' }
    ],
    timestamp: new Date().toISOString()
  };
};

export default function RebalancePanel({ profile, isDark, onRebalance }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setApplied(false);
    const result = await generateRebalanceSuggestion(
      profile.portfolio_allocation,
      profile.risk_tolerance,
      MARKET_CONDITIONS
    );
    setSuggestion(result);
    setIsAnalyzing(false);
  };

  const handleApplyRebalance = async () => {
    if (!suggestion) return;
    setIsApplying(true);
    
    await base44.entities.UserProfile.update(profile.id, {
      portfolio_allocation: suggestion.suggestedAllocation
    });
    
    setIsApplying(false);
    setApplied(true);
    onRebalance?.(suggestion.suggestedAllocation);
  };

  const assets = ['equity', 'debt', 'gold', 'international'];
  const assetColors = {
    equity: '#14b8a6',
    debt: '#3b82f6',
    gold: '#f59e0b',
    international: '#8b5cf6'
  };

  return (
    <div className={cn(
      "rounded-2xl p-6",
      isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
              AI Portfolio Rebalancing
            </h2>
            <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
              Optimize based on market conditions
            </p>
          </div>
        </div>
        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2", isAnalyzing && "animate-spin")} />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Portfolio'}
        </Button>
      </div>

      {/* Market Conditions */}
      <div className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 p-4 rounded-xl",
        isDark ? "bg-slate-700/50" : "bg-slate-50"
      )}>
        {Object.entries(MARKET_CONDITIONS).map(([asset, data]) => (
          <div key={asset} className="text-center">
            <p className={cn("text-xs uppercase font-medium mb-1", isDark ? "text-slate-400" : "text-slate-500")}>
              {asset}
            </p>
            <div className="flex items-center justify-center gap-1">
              {data.trend === 'bullish' ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : data.trend === 'bearish' ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <BarChart3 className="w-4 h-4 text-blue-500" />
              )}
              <span className={cn(
                "text-sm font-medium capitalize",
                data.trend === 'bullish' ? "text-emerald-500" :
                data.trend === 'bearish' ? "text-red-500" : "text-blue-500"
              )}>{data.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion Results */}
      {suggestion && (
        <div className="space-y-4">
          {/* Market Insights */}
          <div className="grid grid-cols-3 gap-3">
            {suggestion.marketInsights.map((insight, i) => (
              <div 
                key={i}
                className={cn(
                  "p-3 rounded-xl text-center",
                  isDark ? "bg-slate-700" : "bg-slate-100"
                )}
              >
                <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{insight.label}</p>
                <p className={cn(
                  "font-semibold",
                  insight.trend === 'up' ? "text-emerald-500" : 
                  insight.trend === 'down' ? "text-red-500" : 
                  isDark ? "text-white" : "text-slate-900"
                )}>{insight.value}</p>
              </div>
            ))}
          </div>

          {/* Allocation Comparison */}
          <div className={cn(
            "p-4 rounded-xl",
            isDark ? "bg-slate-700/50" : "bg-slate-50"
          )}>
            <p className={cn("font-medium mb-4", isDark ? "text-white" : "text-slate-900")}>
              Suggested Allocation Changes
            </p>
            <div className="space-y-3">
              {assets.map(asset => {
                const current = suggestion.currentAllocation[asset] || 0;
                const suggested = suggestion.suggestedAllocation[asset] || 0;
                const diff = suggested - current;
                
                return (
                  <div key={asset} className="flex items-center gap-4">
                    <div className="w-24">
                      <span 
                        className="text-sm font-medium capitalize"
                        style={{ color: assetColors[asset] }}
                      >{asset}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className={cn(
                        "w-16 text-right text-sm font-medium",
                        isDark ? "text-slate-300" : "text-slate-600"
                      )}>{current}%</div>
                      <ArrowRight className={cn("w-4 h-4", isDark ? "text-slate-500" : "text-slate-400")} />
                      <div className="w-16 text-sm font-bold" style={{ color: assetColors[asset] }}>
                        {suggested}%
                      </div>
                      {diff !== 0 && (
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          diff > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {diff > 0 ? '+' : ''}{diff}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adjustment Reasons */}
          {suggestion.adjustments.length > 0 && (
            <div className="space-y-2">
              {suggestion.adjustments.map((adj, i) => (
                <div 
                  key={i}
                  className={cn(
                    "p-3 rounded-xl flex items-start gap-3",
                    adj.change > 0 ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100"
                  )}
                >
                  {adj.change > 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-amber-600 mt-0.5" />
                  )}
                  <div>
                    <p className={cn(
                      "font-medium text-sm",
                      adj.change > 0 ? "text-emerald-700" : "text-amber-700"
                    )}>
                      {adj.asset}: {adj.change > 0 ? '+' : ''}{adj.change}%
                    </p>
                    <p className={cn(
                      "text-xs",
                      adj.change > 0 ? "text-emerald-600" : "text-amber-600"
                    )}>{adj.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Apply Button */}
          <div className="flex gap-3 pt-4">
            {applied ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Portfolio Rebalanced Successfully!</span>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleApplyRebalance}
                  disabled={isApplying}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {isApplying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Rebalance Now
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSuggestion(null)}
                  className={isDark ? "border-slate-600 text-slate-300" : ""}
                >
                  Dismiss
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!suggestion && !isAnalyzing && (
        <div className={cn(
          "text-center py-8 rounded-xl border-2 border-dashed",
          isDark ? "border-slate-600" : "border-slate-200"
        )}>
          <BarChart3 className={cn("w-10 h-10 mx-auto mb-3", isDark ? "text-slate-600" : "text-slate-300")} />
          <p className={cn("font-medium", isDark ? "text-slate-300" : "text-slate-600")}>
            Click "Analyze Portfolio" to get AI-powered suggestions
          </p>
          <p className={cn("text-sm mt-1", isDark ? "text-slate-500" : "text-slate-400")}>
            Based on current market conditions and your risk profile
          </p>
        </div>
      )}
    </div>
  );
}