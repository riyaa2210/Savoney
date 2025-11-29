import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Shield,
  Trash2,
  Check,
  Filter,
  X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

const typeConfig = {
  info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-200' },
  danger: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-200' },
  success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-200' }
};

const categoryIcons = {
  compliance: Shield,
  fraud: AlertTriangle,
  advisory: Info,
  system: Bell
};

// Generate sample alerts
const generateSampleAlerts = () => {
  return [
    {
      title: 'Portfolio Rebalancing Recommended',
      message: 'Based on market conditions and your risk profile, we recommend rebalancing your portfolio. Your equity allocation has increased to 55% due to market gains.',
      type: 'info',
      category: 'advisory'
    },
    {
      title: 'Large Transaction Detected',
      message: 'A withdrawal of ₹2,50,000 was flagged for review. This exceeds your typical transaction pattern.',
      type: 'warning',
      category: 'fraud'
    },
    {
      title: 'KYC Verification Complete',
      message: 'Your KYC documents have been verified successfully. You now have full access to all features.',
      type: 'success',
      category: 'compliance'
    },
    {
      title: 'New Tax-Saving Opportunity',
      message: 'You can save up to ₹46,800 in taxes by investing ₹1.5L in ELSS funds before March 31.',
      type: 'info',
      category: 'advisory'
    },
    {
      title: 'Suspicious Login Attempt',
      message: 'A login attempt from an unrecognized device was blocked. Please verify if this was you.',
      type: 'danger',
      category: 'fraud'
    },
    {
      title: 'Monthly Statement Available',
      message: 'Your account statement for this month is ready for download.',
      type: 'info',
      category: 'system'
    }
  ];
};

export default function Alerts({ isDark }) {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date'),
  });

  const createAlertsMutation = useMutation({
    mutationFn: (data) => base44.entities.Alert.bulkCreate(data),
    onSuccess: () => queryClient.invalidateQueries(['alerts'])
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Alert.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['alerts'])
  });

  const deleteAlertMutation = useMutation({
    mutationFn: (id) => base44.entities.Alert.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['alerts'])
  });

  const handleGenerateSample = async () => {
    const sampleData = generateSampleAlerts();
    await createAlertsMutation.mutateAsync(sampleData);
  };

  const handleMarkRead = async (id) => {
    await updateAlertMutation.mutateAsync({ id, data: { is_read: true } });
  };

  const handleMarkAllRead = async () => {
    const unreadAlerts = alerts?.filter(a => !a.is_read) || [];
    for (const alert of unreadAlerts) {
      await updateAlertMutation.mutateAsync({ id: alert.id, data: { is_read: true } });
    }
  };

  const handleDelete = async (id) => {
    await deleteAlertMutation.mutateAsync(id);
    setSelectedAlert(null);
  };

  const filteredAlerts = alerts?.filter(alert => {
    const matchCategory = categoryFilter === 'all' || alert.category === categoryFilter;
    const matchType = typeFilter === 'all' || alert.type === typeFilter;
    return matchCategory && matchType;
  }) || [];

  const unreadCount = alerts?.filter(a => !a.is_read).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={cn(
              "text-2xl lg:text-3xl font-bold",
              isDark ? "text-white" : "text-slate-900"
            )}>Alerts & Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-500 text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className={cn(
            "mt-1",
            isDark ? "text-slate-400" : "text-slate-500"
          )}>Stay updated with advisory and compliance alerts</p>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              className={isDark ? "border-slate-600 text-slate-300" : ""}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {(!alerts || alerts.length === 0) && (
            <Button
              onClick={handleGenerateSample}
              disabled={createAlertsMutation.isPending}
              className="bg-gradient-to-r from-teal-500 to-blue-600"
            >
              Generate Samples
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className={cn(
        "rounded-2xl p-4 flex flex-col sm:flex-row gap-4",
        isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
      )}>
        <div className="flex items-center gap-2 flex-1">
          <Filter className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-slate-500")} />
          <span className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-600")}>
            Filters:
          </span>
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className={cn(
            "w-full sm:w-40",
            isDark && "bg-slate-700 border-slate-600 text-white"
          )}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="advisory">Advisory</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="fraud">Fraud</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className={cn(
            "w-full sm:w-40",
            isDark && "bg-slate-700 border-slate-600 text-white"
          )}>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="danger">Danger</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const config = typeConfig[alert.type] || typeConfig.info;
          const Icon = config.icon;
          const CategoryIcon = categoryIcons[alert.category] || Bell;
          
          return (
            <div 
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className={cn(
                "p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-md",
                !alert.is_read && "ring-2 ring-teal-200",
                isDark 
                  ? "bg-slate-800/50 border-slate-700 hover:border-slate-600" 
                  : `bg-white ${config.border} hover:border-slate-300`
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-xl flex-shrink-0", config.bg)}>
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <p className={cn(
                      "font-semibold",
                      isDark ? "text-white" : "text-slate-900"
                    )}>{alert.title}</p>
                    {!alert.is_read && (
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                    )}
                  </div>
                  
                  <p className={cn(
                    "text-sm line-clamp-2",
                    isDark ? "text-slate-400" : "text-slate-600"
                  )}>{alert.message}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium capitalize flex items-center gap-1",
                      isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
                    )}>
                      <CategoryIcon className="w-3 h-3" />
                      {alert.category}
                    </span>
                    <span className={cn(
                      "text-xs",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}>
                      {alert.created_date ? format(new Date(alert.created_date), 'MMM d, yyyy • HH:mm') : 'Just now'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!alert.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(alert.id);
                      }}
                      className={isDark ? "text-slate-400 hover:text-white" : ""}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(alert.id);
                    }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredAlerts.length === 0 && (
          <div className={cn(
            "text-center py-16 rounded-2xl",
            isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
          )}>
            <Bell className={cn(
              "w-12 h-12 mx-auto mb-4",
              isDark ? "text-slate-600" : "text-slate-300"
            )} />
            <p className={cn(
              "font-medium",
              isDark ? "text-white" : "text-slate-900"
            )}>No alerts found</p>
            <p className={cn(
              "text-sm mt-1",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>
              {alerts?.length === 0 
                ? "Generate sample alerts to get started"
                : "Try adjusting your filters"
              }
            </p>
          </div>
        )}
      </div>

      {/* Alert Detail Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className={cn(
          "max-w-lg",
          isDark ? "bg-slate-800 border-slate-700 text-white" : ""
        )}>
          {selectedAlert && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    typeConfig[selectedAlert.type]?.bg || "bg-blue-100"
                  )}>
                    {React.createElement(typeConfig[selectedAlert.type]?.icon || Info, {
                      className: cn("w-5 h-5", typeConfig[selectedAlert.type]?.color || "text-blue-500")
                    })}
                  </div>
                  <DialogTitle>{selectedAlert.title}</DialogTitle>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                  {selectedAlert.message}
                </p>
                
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-sm font-medium capitalize",
                    isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"
                  )}>
                    {selectedAlert.category}
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-sm font-medium capitalize",
                    typeConfig[selectedAlert.type]?.bg,
                    typeConfig[selectedAlert.type]?.color
                  )}>
                    {selectedAlert.type}
                  </span>
                </div>
                
                <p className={cn(
                  "text-sm",
                  isDark ? "text-slate-500" : "text-slate-400"
                )}>
                  {selectedAlert.created_date 
                    ? format(new Date(selectedAlert.created_date), 'MMMM d, yyyy • HH:mm:ss')
                    : 'Just now'
                  }
                </p>
                
                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  {!selectedAlert.is_read && (
                    <Button
                      onClick={() => {
                        handleMarkRead(selectedAlert.id);
                        setSelectedAlert(null);
                      }}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selectedAlert.id)}
                    className="text-red-500 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
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