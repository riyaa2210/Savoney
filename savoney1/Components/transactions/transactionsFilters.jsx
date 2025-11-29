import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, Filter, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from 'date-fns';

export default function TransactionFilters({ 
  filters, 
  onFilterChange, 
  isDark, 
  isAdmin = false 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      type: 'all',
      riskFlag: 'all',
      status: 'all',
      minAmount: '',
      maxAmount: '',
      dateFrom: null,
      dateTo: null
    });
  };

  const hasActiveFilters = filters.search || 
    filters.type !== 'all' || 
    filters.riskFlag !== 'all' ||
    filters.status !== 'all' ||
    filters.minAmount || 
    filters.maxAmount ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className={cn(
      "rounded-xl p-4 space-y-4",
      isDark ? "bg-slate-700/50" : "bg-slate-50"
    )}>
      {/* Primary Filters Row */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
            isDark ? "text-slate-400" : "text-slate-400"
          )} />
          <Input
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search by counterparty or ID..."
            className={cn(
              "pl-10",
              isDark && "bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
            )}
          />
        </div>

        {/* Type Filter */}
        <Select value={filters.type} onValueChange={(v) => handleChange('type', v)}>
          <SelectTrigger className={cn(
            "w-full lg:w-40",
            isDark && "bg-slate-600 border-slate-500 text-white"
          )}>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="withdrawal">Withdrawal</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
            <SelectItem value="redemption">Redemption</SelectItem>
          </SelectContent>
        </Select>

        {/* Risk Filter */}
        <Select value={filters.riskFlag} onValueChange={(v) => handleChange('riskFlag', v)}>
          <SelectTrigger className={cn(
            "w-full lg:w-40",
            isDark && "bg-slate-600 border-slate-500 text-white"
          )}>
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="none">No Risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter (Admin only) */}
        {isAdmin && (
          <Select value={filters.status} onValueChange={(v) => handleChange('status', v)}>
            <SelectTrigger className={cn(
              "w-full lg:w-40",
              isDark && "bg-slate-600 border-slate-500 text-white"
            )}>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Advanced Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "gap-2",
            isDark && "border-slate-500 text-slate-300 hover:bg-slate-600"
          )}
        >
          <Filter className="w-4 h-4" />
          Advanced
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className={cn(
          "pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
          isDark ? "border-slate-600" : "border-slate-200"
        )}>
          {/* Amount Range */}
          <div className="space-y-1">
            <label className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
              Min Amount (₹)
            </label>
            <Input
              type="number"
              value={filters.minAmount}
              onChange={(e) => handleChange('minAmount', e.target.value)}
              placeholder="0"
              className={isDark ? "bg-slate-600 border-slate-500 text-white" : ""}
            />
          </div>
          <div className="space-y-1">
            <label className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
              Max Amount (₹)
            </label>
            <Input
              type="number"
              value={filters.maxAmount}
              onChange={(e) => handleChange('maxAmount', e.target.value)}
              placeholder="No limit"
              className={isDark ? "bg-slate-600 border-slate-500 text-white" : ""}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-1">
            <label className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
              From Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateFrom && "text-muted-foreground",
                    isDark && "bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? format(filters.dateFrom, 'MMM d, yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => handleChange('dateFrom', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <label className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
              To Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateTo && "text-muted-foreground",
                    isDark && "bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateTo ? format(filters.dateTo, 'MMM d, yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => handleChange('dateTo', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className={cn(
              "text-xs gap-1",
              isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <X className="w-3 h-3" />
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}