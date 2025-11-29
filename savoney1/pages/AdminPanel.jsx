import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Users,
  CreditCard,
  Bell,
  Eye,
  Check,
  X,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import RiskBadge from '@/components/compliance/RiskBadge';
import { analyzeTransaction, calculateUserRiskLevel } from '@/components/compliance/ComplianceEngine';
import TransactionFilters from '@/components/transactions/TransactionFilters';

export default function AdminPanel({ isDark }) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailType, setDetailType] = useState(null);
  const [txnFilters, setTxnFilters] = useState({
    search: '',
    type: 'all',
    riskFlag: 'all',
    status: 'all',
    minAmount: '',
    maxAmount: '',
    dateFrom: null,
    dateTo: null
  });

  // Fetch all data
  const { data: transactions } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 100),
  });

  const { data: alerts } = useQuery({
    queryKey: ['allAlerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 100),
  });

  const { data: profiles } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  // Mutations
  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Transaction.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allTransactions']);
      setSelectedItem(null);
    }
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['allAlerts'])
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['allProfiles']);
      setSelectedItem(null);
    }
  });

  // Process data with compliance engine
  const flaggedTransactions = transactions?.filter(t => 
    t.risk_flag && t.risk_flag !== 'none'
  ) || [];

  // Apply admin filters to all transactions
  const filteredAdminTransactions = transactions?.filter(txn => {
    const matchSearch = !txnFilters.search || 
      txn.counterparty?.toLowerCase().includes(txnFilters.search.toLowerCase()) ||
      txn.transaction_id?.toLowerCase().includes(txnFilters.search.toLowerCase());
    const matchType = txnFilters.type === 'all' || txn.type === txnFilters.type;
    const matchRisk = txnFilters.riskFlag === 'all' || txn.risk_flag === txnFilters.riskFlag;
    const matchStatus = txnFilters.status === 'all' || txn.status === txnFilters.status;
    const amount = txn.amount || 0;
    const matchMinAmount = !txnFilters.minAmount || amount >= parseFloat(txnFilters.minAmount);
    const matchMaxAmount = !txnFilters.maxAmount || amount <= parseFloat(txnFilters.maxAmount);
    const txnDate = txn.created_date ? new Date(txn.created_date) : null;
    const matchDateFrom = !txnFilters.dateFrom || (txnDate && txnDate >= txnFilters.dateFrom);
    const matchDateTo = !txnFilters.dateTo || (txnDate && txnDate <= txnFilters.dateTo);
    return matchSearch && matchType && matchRisk && matchStatus && 
           matchMinAmount && matchMaxAmount && matchDateFrom && matchDateTo;
  }) || [];

  const pendingAlerts = alerts?.filter(a => !a.is_read) || [];

  const usersWithRisk = profiles?.map(profile => {
    const userTxns = transactions?.filter(t => t.created_by === profile.created_by) || [];
    const riskData = calculateUserRiskLevel(userTxns, profile);
    return { ...profile, ...riskData };
  }) || [];

  // Stats
  const stats = {
    totalTransactions: transactions?.length || 0,
    flaggedTransactions: flaggedTransactions.length,
    pendingAlerts: pendingAlerts.length,
    pendingKYC: profiles?.filter(p => p.kyc_status !== 'verified').length || 0,
    highRiskUsers: usersWithRisk.filter(u => u.level === 'high').length
  };

  const handleApproveTransaction = (txn) => {
    updateTransactionMutation.mutate({
      id: txn.id,
      data: { status: 'completed', risk_flag: 'none' }
    });
  };

  const handleDeclineTransaction = (txn) => {
    updateTransactionMutation.mutate({
      id: txn.id,
      data: { status: 'failed', risk_flag: txn.risk_flag }
    });
  };

  const handleApproveKYC = (profile) => {
    updateProfileMutation.mutate({
      id: profile.id,
      data: { kyc_status: 'verified' }
    });
  };

  const handleRejectKYC = (profile) => {
    updateProfileMutation.mutate({
      id: profile.id,
      data: { kyc_status: 'rejected' }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={cn(
                "text-2xl lg:text-3xl font-bold",
                isDark ? "text-white" : "text-slate-900"
              )}>Admin Compliance Panel</h1>
              <p className={cn(
                "text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>Real-time transaction monitoring & KYC management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Transactions', value: stats.totalTransactions, icon: CreditCard, color: 'text-blue-500' },
          { label: 'Flagged', value: stats.flaggedTransactions, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Pending Alerts', value: stats.pendingAlerts, icon: Bell, color: 'text-amber-500' },
          { label: 'Pending KYC', value: stats.pendingKYC, icon: FileText, color: 'text-purple-500' },
          { label: 'High Risk Users', value: stats.highRiskUsers, icon: Users, color: 'text-red-500' },
        ].map((stat) => (
          <div 
            key={stat.label}
            className={cn(
              "rounded-xl p-4",
              isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
            )}
          >
            <div className="flex items-center gap-3">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              <div>
                <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{stat.label}</p>
                <p className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className={cn(isDark && "bg-slate-800")}>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Flagged Transactions
            {stats.flaggedTransactions > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
                {stats.flaggedTransactions}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            User Risk Levels
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            KYC Review
          </TabsTrigger>
        </TabsList>

        {/* Flagged Transactions Tab */}
        <TabsContent value="transactions">
          <div className={cn(
            "rounded-2xl overflow-hidden",
            isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
          )}>
            {/* Admin Filters */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <TransactionFilters 
                filters={txnFilters}
                onFilterChange={setTxnFilters}
                isDark={isDark}
                isAdmin={true}
              />
              <p className={cn("text-sm mt-2", isDark ? "text-slate-400" : "text-slate-500")}>
                Showing {filteredAdminTransactions.length} of {transactions?.length || 0} transactions
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? "bg-slate-700/50" : "bg-slate-50"}>
                  <tr>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>Transaction</th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>Amount</th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>Risk Level</th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>Status</th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAdminTransactions.map((txn) => {
                    const analysis = analyzeTransaction(txn);
                    return (
                      <tr key={txn.id} className={isDark ? "hover:bg-slate-700/30" : "hover:bg-slate-50"}>
                        <td className="px-4 py-4">
                          <div>
                            <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                              {txn.counterparty || txn.type}
                            </p>
                            <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                              {txn.transaction_id}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>
                            ₹{txn.amount?.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <RiskBadge level={txn.risk_flag} size="sm" />
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium capitalize",
                            txn.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                            txn.status === 'flagged' ? "bg-red-100 text-red-700" :
                            txn.status === 'pending' ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-600"
                          )}>{txn.status}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setSelectedItem(txn); setDetailType('transaction'); }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => handleApproveTransaction(txn)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeclineTransaction(txn)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAdminTransactions.length === 0 && (
                <div className="py-12 text-center">
                  <CheckCircle className={cn("w-12 h-12 mx-auto mb-3", isDark ? "text-emerald-400" : "text-emerald-500")} />
                  <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>No Results</p>
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>No transactions match your filters</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <div className={cn(
            "rounded-2xl p-6 space-y-3",
            isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
          )}>
            {alerts?.map((alert) => (
              <div 
                key={alert.id}
                className={cn(
                  "p-4 rounded-xl border flex items-center justify-between",
                  !alert.is_read && "ring-2 ring-teal-300",
                  isDark ? "border-slate-600" : "border-slate-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    alert.type === 'danger' ? "bg-red-100" :
                    alert.type === 'warning' ? "bg-amber-100" :
                    alert.type === 'success' ? "bg-emerald-100" : "bg-blue-100"
                  )}>
                    {alert.type === 'danger' ? <AlertTriangle className="w-4 h-4 text-red-500" /> :
                     alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                     alert.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                     <Bell className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div>
                    <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>{alert.title}</p>
                    <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{alert.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>
                    {alert.created_date ? format(new Date(alert.created_date), 'MMM d, HH:mm') : 'Recent'}
                  </span>
                  {!alert.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateAlertMutation.mutate({ id: alert.id, data: { is_read: true } })}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {(!alerts || alerts.length === 0) && (
              <div className="py-12 text-center">
                <Bell className={cn("w-12 h-12 mx-auto mb-3", isDark ? "text-slate-600" : "text-slate-300")} />
                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>No alerts</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* User Risk Levels Tab */}
        <TabsContent value="users">
          <div className={cn(
            "rounded-2xl overflow-hidden",
            isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
          )}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? "bg-slate-700/50" : "bg-slate-50"}>
                  <tr>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>User</th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>Risk Level</th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>Risk Score</th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>High-Risk Txns</th>
                    <th className={cn("px-4 py-3 text-left text-xs font-medium uppercase", isDark ? "text-slate-400" : "text-slate-500")}>KYC Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {usersWithRisk.map((user) => (
                    <tr key={user.id} className={isDark ? "hover:bg-slate-700/30" : "hover:bg-slate-50"}>
                      <td className="px-4 py-4">
                        <div>
                          <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>{user.full_name}</p>
                          <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{user.created_by}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <RiskBadge level={user.level} size="sm" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-16 h-2 rounded-full overflow-hidden", isDark ? "bg-slate-700" : "bg-slate-200")}>
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                user.score >= 60 ? "bg-red-500" : user.score >= 30 ? "bg-amber-500" : "bg-emerald-500"
                              )}
                              style={{ width: `${user.score}%` }}
                            />
                          </div>
                          <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>{user.score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                          {user.highRiskCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium capitalize",
                          user.kyc_status === 'verified' ? "bg-emerald-100 text-emerald-700" :
                          user.kyc_status === 'rejected' ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                        )}>{user.kyc_status || 'pending'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usersWithRisk.length === 0 && (
                <div className="py-12 text-center">
                  <Users className={cn("w-12 h-12 mx-auto mb-3", isDark ? "text-slate-600" : "text-slate-300")} />
                  <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>No users found</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* KYC Review Tab */}
        <TabsContent value="kyc">
          <div className={cn(
            "rounded-2xl p-6 space-y-4",
            isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
          )}>
            {profiles?.filter(p => p.kyc_status !== 'verified').map((profile) => (
              <div 
                key={profile.id}
                className={cn(
                  "p-5 rounded-xl border",
                  isDark ? "border-slate-600" : "border-slate-200"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <p className={cn("font-semibold text-lg", isDark ? "text-white" : "text-slate-900")}>
                        {profile.full_name}
                      </p>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                        profile.kyc_status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                        profile.kyc_status === 'rejected' ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      )}>{profile.kyc_status || 'pending'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>PAN: </span>
                        <span className={isDark ? "text-slate-200" : "text-slate-700"}>{profile.pan_number || 'Not provided'}</span>
                      </div>
                      <div>
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>Aadhaar: </span>
                        <span className={isDark ? "text-slate-200" : "text-slate-700"}>XXXX-{profile.aadhaar_last_four || 'N/A'}</span>
                      </div>
                      <div>
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>Occupation: </span>
                        <span className={cn("capitalize", isDark ? "text-slate-200" : "text-slate-700")}>{profile.occupation || 'N/A'}</span>
                      </div>
                      <div>
                        <span className={isDark ? "text-slate-400" : "text-slate-500"}>Income: </span>
                        <span className={isDark ? "text-slate-200" : "text-slate-700"}>{profile.annual_income?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveKYC(profile)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectKYC(profile)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {profiles?.filter(p => p.kyc_status !== 'verified').length === 0 && (
              <div className="py-12 text-center">
                <CheckCircle className={cn("w-12 h-12 mx-auto mb-3", isDark ? "text-emerald-400" : "text-emerald-500")} />
                <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>All KYC Verified</p>
                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>No pending KYC reviews</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Dialog */}
      <Dialog open={!!selectedItem && detailType === 'transaction'} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className={cn("max-w-lg", isDark ? "bg-slate-800 border-slate-700 text-white" : "")}>
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>Transaction Compliance Review</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Transaction ID</p>
                    <p className="font-medium">{selectedItem.transaction_id}</p>
                  </div>
                  <div>
                    <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Amount</p>
                    <p className="font-medium">₹{selectedItem.amount?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Counterparty</p>
                    <p className="font-medium">{selectedItem.counterparty}</p>
                  </div>
                  <div>
                    <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Risk Level</p>
                    <RiskBadge level={selectedItem.risk_flag} size="sm" />
                  </div>
                </div>
                
                {/* Compliance Analysis */}
                <div className={cn("p-4 rounded-xl", isDark ? "bg-slate-700" : "bg-slate-50")}>
                  <p className={cn("font-medium mb-2", isDark ? "text-white" : "text-slate-900")}>Compliance Findings</p>
                  {analyzeTransaction(selectedItem).findings.map((finding, i) => (
                    <div key={i} className={cn(
                      "p-2 rounded-lg mb-2 text-sm",
                      finding.severity === 'high' ? "bg-red-100 text-red-700" :
                      finding.severity === 'medium' ? "bg-amber-100 text-amber-700" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      <span className="font-medium">[{finding.rule}]</span> {finding.message}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApproveTransaction(selectedItem)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => handleDeclineTransaction(selectedItem)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}