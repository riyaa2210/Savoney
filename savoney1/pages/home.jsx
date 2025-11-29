import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { 
  Wallet, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import StatsCard from '@/components/dashboard/StatsCard';
import PortfolioChart from '@/components/dashboard/PortfolioChart';
import RiskScoreGauge from '@/components/dashboard/RiskScoreGauge';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import ComplianceStatus from '@/components/dashboard/ComplianceStatus';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

// Mock AI function to generate portfolio recommendations
const generatePortfolioRecommendation = async (profileData) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock AI logic based on risk tolerance and income
  let allocation = { equity: 0, debt: 0, gold: 0, international: 0 };
  let riskScore = 50;
  
  switch (profileData.risk_tolerance) {
    case 'conservative':
      allocation = { equity: 20, debt: 60, gold: 15, international: 5 };
      riskScore = 25 + Math.random() * 15;
      break;
    case 'moderate':
      allocation = { equity: 45, debt: 35, gold: 10, international: 10 };
      riskScore = 45 + Math.random() * 20;
      break;
    case 'aggressive':
      allocation = { equity: 70, debt: 15, gold: 5, international: 10 };
      riskScore = 70 + Math.random() * 25;
      break;
  }
  
  // Adjust based on income
  if (profileData.annual_income === 'above_50l' || profileData.annual_income === '25l_50l') {
    allocation.international += 5;
    allocation.debt -= 5;
  }
  
  return {
    risk_score: Math.round(riskScore),
    portfolio_allocation: allocation,
    kyc_status: 'verified',
    onboarding_complete: true
  };
};

export default function Home({ isDark }) {
  const queryClient = useQueryClient();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user profile
  const { data: profiles, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const profile = profiles?.[0];

  // Fetch transactions
  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 50),
  });

  // Fetch alerts
  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 10),
  });

  const createProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.create(data),
    onSuccess: () => queryClient.invalidateQueries(['userProfile'])
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['userProfile'])
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['alerts'])
  });

  const handleOnboardingComplete = async (formData) => {
    setIsGenerating(true);
    
    // Generate AI recommendations
    const recommendations = await generatePortfolioRecommendation(formData);
    
    const fullData = {
      ...formData,
      ...recommendations
    };

    if (profile) {
      await updateProfileMutation.mutateAsync({ id: profile.id, data: fullData });
    } else {
      await createProfileMutation.mutateAsync(fullData);
    }
    
    setIsGenerating(false);
    setShowOnboarding(false);
  };

  const handleMarkAlertRead = async (alertId) => {
    await updateAlertMutation.mutateAsync({ id: alertId, data: { is_read: true } });
  };

  // Calculate stats
  const totalInvested = transactions?.reduce((sum, t) => 
    t.type === 'investment' ? sum + (t.amount || 0) : sum, 0) || 0;
  
  const totalDeposits = transactions?.reduce((sum, t) => 
    t.type === 'deposit' ? sum + (t.amount || 0) : sum, 0) || 0;

  const flaggedTransactions = transactions?.filter(t => 
    t.risk_flag && t.risk_flag !== 'none').length || 0;

  const needsOnboarding = !profile?.onboarding_complete;

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (showOnboarding || needsOnboarding) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className={cn(
            "text-3xl font-bold mb-2",
            isDark ? "text-white" : "text-slate-900"
          )}>Welcome to Savoney</h1>
          <p className={cn(
            isDark ? "text-slate-400" : "text-slate-600"
          )}>Let's build your personalized investment plan</p>
        </div>
        
        <OnboardingWizard 
          onComplete={handleOnboardingComplete}
          isDark={isDark}
          isLoading={isGenerating}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={cn(
            "text-2xl lg:text-3xl font-bold",
            isDark ? "text-white" : "text-slate-900"
          )}>Welcome back, {profile?.full_name?.split(' ')[0] || 'Investor'}</h1>
          <p className={cn(
            "mt-1",
            isDark ? "text-slate-400" : "text-slate-500"
          )}>Here's your wealth overview</p>
        </div>
        <Button
          onClick={() => setShowOnboarding(true)}
          className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Update Profile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Invested"
          value={`₹${totalInvested.toLocaleString('en-IN')}`}
          icon={Wallet}
          trend="up"
          trendValue="+12.5%"
          gradient="bg-teal-500"
          isDark={isDark}
        />
        <StatsCard
          title="Total Deposits"
          value={`₹${totalDeposits.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          trend="up"
          trendValue="+8.2%"
          gradient="bg-blue-500"
          isDark={isDark}
        />
        <StatsCard
          title="Risk Score"
          value={`${profile?.risk_score || 0}/100`}
          subtitle={profile?.risk_tolerance || 'Not assessed'}
          icon={Shield}
          gradient="bg-purple-500"
          isDark={isDark}
        />
        <StatsCard
          title="Flagged Transactions"
          value={flaggedTransactions}
          subtitle={flaggedTransactions > 0 ? 'Requires review' : 'All clear'}
          icon={AlertTriangle}
          gradient={flaggedTransactions > 0 ? "bg-red-500" : "bg-emerald-500"}
          isDark={isDark}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <PortfolioChart 
            allocation={profile?.portfolio_allocation}
            isDark={isDark}
          />
          <RecentTransactions 
            transactions={transactions}
            isDark={isDark}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <RiskScoreGauge 
            score={profile?.risk_score || 0}
            isDark={isDark}
          />
          <ComplianceStatus 
            kycStatus={profile?.kyc_status || 'pending'}
            flaggedCount={flaggedTransactions}
            isDark={isDark}
          />
          <AlertsPanel 
            alerts={alerts}
            isDark={isDark}
            onMarkRead={handleMarkAlertRead}
          />
        </div>
      </div>
    </div>
  );
}