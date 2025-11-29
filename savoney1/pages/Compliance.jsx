import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle,
  FileText,
  User,
  Building,
  CreditCard,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';

const kycSteps = [
  { id: 'personal', label: 'Personal Details', icon: User },
  { id: 'pan', label: 'PAN Verification', icon: CreditCard },
  { id: 'aadhaar', label: 'Aadhaar Verification', icon: FileText },
  { id: 'bank', label: 'Bank Account', icon: Building },
];

export default function Compliance({ isDark }) {
  const queryClient = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 100),
  });

  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date'),
  });

  const createAlertMutation = useMutation({
    mutationFn: (data) => base44.entities.Alert.create(data),
    onSuccess: () => queryClient.invalidateQueries(['alerts'])
  });

  const profile = profiles?.[0];
  const flaggedTransactions = transactions?.filter(t => t.risk_flag && t.risk_flag !== 'none') || [];
  const complianceAlerts = alerts?.filter(a => a.category === 'compliance' || a.category === 'fraud') || [];

  const getKycProgress = () => {
    if (!profile) return 0;
    let progress = 0;
    if (profile.full_name) progress += 25;
    if (profile.pan_number) progress += 25;
    if (profile.aadhaar_last_four) progress += 25;
    if (profile.kyc_status === 'verified') progress += 25;
    return progress;
  };

  const handleGenerateComplianceReport = async () => {
    // Create a compliance alert as a mock report
    await createAlertMutation.mutateAsync({
      title: 'Compliance Report Generated',
      message: `Monthly compliance report generated on ${format(new Date(), 'MMM d, yyyy')}. ${flaggedTransactions.length} transactions flagged for review.`,
      type: flaggedTransactions.length > 0 ? 'warning' : 'success',
      category: 'compliance'
    });
  };

  const kycProgress = getKycProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={cn(
            "text-2xl lg:text-3xl font-bold",
            isDark ? "text-white" : "text-slate-900"
          )}>Compliance Center</h1>
          <p className={cn(
            "mt-1",
            isDark ? "text-slate-400" : "text-slate-500"
          )}>KYC status, regulatory compliance, and fraud monitoring</p>
        </div>
        <Button
          onClick={handleGenerateComplianceReport}
          disabled={createAlertMutation.isPending}
          variant="outline"
          className={isDark ? "border-slate-600 text-slate-300" : ""}
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* KYC Progress */}
      <div className={cn(
        "rounded-2xl p-6",
        isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
      )}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={cn(
              "text-lg font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}>KYC Verification</h2>
            <p className={cn(
              "text-sm mt-1",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>Complete all steps to unlock full features</p>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-xl flex items-center gap-2",
            profile?.kyc_status === 'verified' 
              ? "bg-emerald-100 text-emerald-700"
              : profile?.kyc_status === 'rejected'
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
          )}>
            {profile?.kyc_status === 'verified' 
              ? <CheckCircle className="w-4 h-4" />
              : profile?.kyc_status === 'rejected'
                ? <XCircle className="w-4 h-4" />
                : <Clock className="w-4 h-4" />
            }
            <span className="font-medium capitalize">
              {profile?.kyc_status || 'Pending'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>Progress</span>
            <span className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
              {kycProgress}%
            </span>
          </div>
          <div className={cn(
            "h-2 rounded-full overflow-hidden",
            isDark ? "bg-slate-700" : "bg-slate-200"
          )}>
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-blue-600 transition-all duration-500"
              style={{ width: `${kycProgress}%` }}
            />
          </div>
        </div>

        {/* KYC Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kycSteps.map((step, index) => {
            const isComplete = index < Math.floor(kycProgress / 25);
            const isCurrent = index === Math.floor(kycProgress / 25);
            const Icon = step.icon;
            
            return (
              <div 
                key={step.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200",
                  isComplete 
                    ? "border-emerald-200 bg-emerald-50"
                    : isCurrent
                      ? isDark 
                        ? "border-teal-500 bg-teal-500/10"
                        : "border-teal-200 bg-teal-50"
                      : isDark
                        ? "border-slate-600"
                        : "border-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    isComplete 
                      ? "bg-emerald-100"
                      : isCurrent
                        ? "bg-teal-100"
                        : isDark ? "bg-slate-700" : "bg-slate-100"
                  )}>
                    {isComplete 
                      ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                      : <Icon className={cn(
                          "w-5 h-5",
                          isCurrent ? "text-teal-600" : isDark ? "text-slate-400" : "text-slate-400"
                        )} />
                    }
                  </div>
                  <div>
                    <p className={cn(
                      "font-medium text-sm",
                      isComplete 
                        ? "text-emerald-700"
                        : isCurrent
                          ? "text-teal-700"
                          : isDark ? "text-slate-300" : "text-slate-600"
                    )}>{step.label}</p>
                    <p className={cn(
                      "text-xs",
                      isComplete ? "text-emerald-600" : isDark ? "text-slate-500" : "text-slate-400"
                    )}>
                      {isComplete ? 'Verified' : isCurrent ? 'In Progress' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flagged Transactions */}
      <div className={cn(
        "rounded-2xl p-6",
        isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
      )}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl",
              flaggedTransactions.length > 0 ? "bg-red-100" : "bg-emerald-100"
            )}>
              {flaggedTransactions.length > 0 
                ? <AlertTriangle className="w-5 h-5 text-red-500" />
                : <CheckCircle className="w-5 h-5 text-emerald-500" />
              }
            </div>
            <div>
              <h2 className={cn(
                "text-lg font-semibold",
                isDark ? "text-white" : "text-slate-900"
              )}>AML Monitoring</h2>
              <p className={cn(
                "text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>
                {flaggedTransactions.length > 0 
                  ? `${flaggedTransactions.length} transactions require review`
                  : 'No suspicious activity detected'
                }
              </p>
            </div>
          </div>
        </div>

        {flaggedTransactions.length > 0 ? (
          <div className="space-y-3">
            {flaggedTransactions.slice(0, 5).map((txn) => (
              <div 
                key={txn.id}
                className={cn(
                  "p-4 rounded-xl border flex items-center justify-between",
                  txn.risk_flag === 'high' ? "border-red-200 bg-red-50" :
                  txn.risk_flag === 'medium' ? "border-orange-200 bg-orange-50" :
                  "border-yellow-200 bg-yellow-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    txn.risk_flag === 'high' ? "bg-red-100" :
                    txn.risk_flag === 'medium' ? "bg-orange-100" : "bg-yellow-100"
                  )}>
                    <AlertTriangle className={cn(
                      "w-4 h-4",
                      txn.risk_flag === 'high' ? "text-red-500" :
                      txn.risk_flag === 'medium' ? "text-orange-500" : "text-yellow-500"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {txn.counterparty || txn.type} - ₹{txn.amount?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-sm text-slate-500">
                      {txn.transaction_id} • {txn.created_date ? format(new Date(txn.created_date), 'MMM d, yyyy') : 'Recent'}
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium capitalize",
                  txn.risk_flag === 'high' ? "bg-red-200 text-red-700" :
                  txn.risk_flag === 'medium' ? "bg-orange-200 text-orange-700" :
                  "bg-yellow-200 text-yellow-700"
                )}>
                  {txn.risk_flag} Risk
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(
            "text-center py-8 rounded-xl",
            isDark ? "bg-slate-700/30" : "bg-slate-50"
          )}>
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
            <p className={cn(
              "font-medium",
              isDark ? "text-white" : "text-slate-900"
            )}>All Clear</p>
            <p className={cn(
              "text-sm mt-1",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>No suspicious transactions detected</p>
          </div>
        )}
      </div>

      {/* Compliance History */}
      <div className={cn(
        "rounded-2xl p-6",
        isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
      )}>
        <h2 className={cn(
          "text-lg font-semibold mb-4",
          isDark ? "text-white" : "text-slate-900"
        )}>Compliance Activity</h2>
        
        {complianceAlerts.length > 0 ? (
          <div className="space-y-3">
            {complianceAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={cn(
                  "p-4 rounded-xl border flex items-start gap-4",
                  isDark ? "border-slate-600" : "border-slate-200"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  alert.type === 'success' ? "bg-emerald-100" :
                  alert.type === 'warning' ? "bg-amber-100" :
                  alert.type === 'danger' ? "bg-red-100" : "bg-blue-100"
                )}>
                  {alert.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                   alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                   alert.type === 'danger' ? <XCircle className="w-4 h-4 text-red-500" /> :
                   <Shield className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "font-medium",
                    isDark ? "text-white" : "text-slate-900"
                  )}>{alert.title}</p>
                  <p className={cn(
                    "text-sm mt-1",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}>{alert.message}</p>
                  <p className={cn(
                    "text-xs mt-2",
                    isDark ? "text-slate-500" : "text-slate-400"
                  )}>
                    {alert.created_date ? format(new Date(alert.created_date), 'MMM d, yyyy • HH:mm') : 'Recent'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(
            "text-center py-8 rounded-xl",
            isDark ? "bg-slate-700/30" : "bg-slate-50"
          )}>
            <FileText className={cn(
              "w-10 h-10 mx-auto mb-3",
              isDark ? "text-slate-600" : "text-slate-300"
            )} />
            <p className={cn(
              "text-sm",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>No compliance activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
}