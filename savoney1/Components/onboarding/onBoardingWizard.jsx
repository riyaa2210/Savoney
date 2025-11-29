import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Target, 
  Shield, 
  Wallet,
  Check,
  Loader2
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'KYC Details', icon: Shield },
  { id: 3, title: 'Goals', icon: Target },
  { id: 4, title: 'Risk Profile', icon: Wallet },
];

const investmentGoals = [
  'Retirement Planning',
  'Wealth Building',
  'Tax Savings',
  'Child Education',
  'Emergency Fund',
  'Home Purchase',
  'Travel',
  'Other'
];

const occupations = [
  { value: 'salaried', label: 'Salaried Employee' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'business_owner', label: 'Business Owner' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
  { value: 'other', label: 'Other' }
];

const incomeRanges = [
  { value: 'below_5l', label: 'Below ₹5 Lakhs' },
  { value: '5l_10l', label: '₹5 - 10 Lakhs' },
  { value: '10l_25l', label: '₹10 - 25 Lakhs' },
  { value: '25l_50l', label: '₹25 - 50 Lakhs' },
  { value: 'above_50l', label: 'Above ₹50 Lakhs' }
];

const horizons = [
  { value: 'short_term', label: 'Short Term (1-3 years)' },
  { value: 'medium_term', label: 'Medium Term (3-7 years)' },
  { value: 'long_term', label: 'Long Term (7+ years)' }
];

const riskLevels = [
  { 
    value: 'conservative', 
    label: 'Conservative',
    description: 'Prefer stability over high returns. Low risk tolerance.'
  },
  { 
    value: 'moderate', 
    label: 'Moderate',
    description: 'Balanced approach. Accept some risk for better returns.'
  },
  { 
    value: 'aggressive', 
    label: 'Aggressive',
    description: 'Seek high returns. Comfortable with market volatility.'
  }
];

export default function OnboardingWizard({ onComplete, isDark, isLoading }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    pan_number: '',
    aadhaar_last_four: '',
    occupation: '',
    annual_income: '',
    investment_horizon: '',
    risk_tolerance: '',
    investment_goals: []
  });
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleGoal = (goal) => {
    setFormData(prev => ({
      ...prev,
      investment_goals: prev.investment_goals.includes(goal)
        ? prev.investment_goals.filter(g => g !== goal)
        : [...prev.investment_goals, goal]
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.full_name.trim()) newErrors.full_name = 'Name is required';
        break;
      case 2:
        if (!formData.pan_number.trim()) newErrors.pan_number = 'PAN is required';
        else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.toUpperCase())) {
          newErrors.pan_number = 'Invalid PAN format';
        }
        if (!formData.aadhaar_last_four.trim()) newErrors.aadhaar_last_four = 'Aadhaar digits required';
        else if (!/^\d{4}$/.test(formData.aadhaar_last_four)) {
          newErrors.aadhaar_last_four = 'Enter last 4 digits only';
        }
        if (!formData.occupation) newErrors.occupation = 'Select occupation';
        if (!formData.annual_income) newErrors.annual_income = 'Select income range';
        break;
      case 3:
        if (formData.investment_goals.length === 0) {
          newErrors.investment_goals = 'Select at least one goal';
        }
        if (!formData.investment_horizon) newErrors.investment_horizon = 'Select investment horizon';
        break;
      case 4:
        if (!formData.risk_tolerance) newErrors.risk_tolerance = 'Select risk tolerance';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      if (currentStep < 4) {
        setCurrentStep(prev => prev + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden transition-all duration-300",
      isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
    )}>
      {/* Progress Steps */}
      <div className={cn(
        "p-6 border-b",
        isDark ? "border-slate-700" : "border-slate-200"
      )}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isComplete = currentStep > step.id;
            
            return (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isComplete 
                      ? "bg-teal-500 text-white"
                      : isActive 
                        ? "bg-gradient-to-br from-teal-500 to-blue-600 text-white"
                        : isDark 
                          ? "bg-slate-700 text-slate-400"
                          : "bg-slate-100 text-slate-400"
                  )}>
                    {isComplete ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn(
                      "text-sm font-medium",
                      isActive 
                        ? "text-teal-500"
                        : isDark ? "text-slate-300" : "text-slate-600"
                    )}>{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-4",
                    isComplete 
                      ? "bg-teal-500"
                      : isDark ? "bg-slate-700" : "bg-slate-200"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className={cn(
                "text-xl font-semibold mb-2",
                isDark ? "text-white" : "text-slate-900"
              )}>Let's get to know you</h2>
              <p className={cn(
                "text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>We'll use this to personalize your investment recommendations.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className={isDark ? "text-slate-300" : ""}>Full Name</Label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  className={cn(
                    "mt-2",
                    isDark && "bg-slate-700 border-slate-600 text-white",
                    errors.full_name && "border-red-500"
                  )}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: KYC Details */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className={cn(
                "text-xl font-semibold mb-2",
                isDark ? "text-white" : "text-slate-900"
              )}>KYC Verification</h2>
              <p className={cn(
                "text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>Required for regulatory compliance. Your data is secure.</p>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className={isDark ? "text-slate-300" : ""}>PAN Number</Label>
                <Input
                  value={formData.pan_number}
                  onChange={(e) => updateField('pan_number', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className={cn(
                    "mt-2",
                    isDark && "bg-slate-700 border-slate-600 text-white",
                    errors.pan_number && "border-red-500"
                  )}
                />
                {errors.pan_number && (
                  <p className="text-red-500 text-sm mt-1">{errors.pan_number}</p>
                )}
              </div>
              
              <div>
                <Label className={isDark ? "text-slate-300" : ""}>Aadhaar (Last 4 Digits)</Label>
                <Input
                  value={formData.aadhaar_last_four}
                  onChange={(e) => updateField('aadhaar_last_four', e.target.value.replace(/\D/g, ''))}
                  placeholder="1234"
                  maxLength={4}
                  className={cn(
                    "mt-2",
                    isDark && "bg-slate-700 border-slate-600 text-white",
                    errors.aadhaar_last_four && "border-red-500"
                  )}
                />
                {errors.aadhaar_last_four && (
                  <p className="text-red-500 text-sm mt-1">{errors.aadhaar_last_four}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Occupation</Label>
              <RadioGroup 
                value={formData.occupation} 
                onValueChange={(v) => updateField('occupation', v)}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2"
              >
                {occupations.map(occ => (
                  <div key={occ.value} className={cn(
                    "flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transition-all",
                    formData.occupation === occ.value
                      ? "border-teal-500 bg-teal-50"
                      : isDark 
                        ? "border-slate-600 hover:border-slate-500"
                        : "border-slate-200 hover:border-slate-300"
                  )}>
                    <RadioGroupItem value={occ.value} id={occ.value} />
                    <Label htmlFor={occ.value} className={cn(
                      "cursor-pointer text-sm",
                      isDark && formData.occupation !== occ.value && "text-slate-300"
                    )}>{occ.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.occupation && (
                <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>
              )}
            </div>
            
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Annual Income</Label>
              <RadioGroup 
                value={formData.annual_income} 
                onValueChange={(v) => updateField('annual_income', v)}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2"
              >
                {incomeRanges.map(income => (
                  <div key={income.value} className={cn(
                    "flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transition-all",
                    formData.annual_income === income.value
                      ? "border-teal-500 bg-teal-50"
                      : isDark 
                        ? "border-slate-600 hover:border-slate-500"
                        : "border-slate-200 hover:border-slate-300"
                  )}>
                    <RadioGroupItem value={income.value} id={income.value} />
                    <Label htmlFor={income.value} className={cn(
                      "cursor-pointer text-sm",
                      isDark && formData.annual_income !== income.value && "text-slate-300"
                    )}>{income.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.annual_income && (
                <p className="text-red-500 text-sm mt-1">{errors.annual_income}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className={cn(
                "text-xl font-semibold mb-2",
                isDark ? "text-white" : "text-slate-900"
              )}>Investment Goals</h2>
              <p className={cn(
                "text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>What are you saving for? Select all that apply.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {investmentGoals.map(goal => (
                <div
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all text-center",
                    formData.investment_goals.includes(goal)
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : isDark 
                        ? "border-slate-600 hover:border-slate-500 text-slate-300"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <span className="text-sm font-medium">{goal}</span>
                </div>
              ))}
            </div>
            {errors.investment_goals && (
              <p className="text-red-500 text-sm">{errors.investment_goals}</p>
            )}
            
            <div>
              <Label className={isDark ? "text-slate-300" : ""}>Investment Horizon</Label>
              <RadioGroup 
                value={formData.investment_horizon} 
                onValueChange={(v) => updateField('investment_horizon', v)}
                className="grid sm:grid-cols-3 gap-3 mt-2"
              >
                {horizons.map(h => (
                  <div key={h.value} className={cn(
                    "flex items-center space-x-2 p-4 rounded-xl border cursor-pointer transition-all",
                    formData.investment_horizon === h.value
                      ? "border-teal-500 bg-teal-50"
                      : isDark 
                        ? "border-slate-600 hover:border-slate-500"
                        : "border-slate-200 hover:border-slate-300"
                  )}>
                    <RadioGroupItem value={h.value} id={h.value} />
                    <Label htmlFor={h.value} className={cn(
                      "cursor-pointer",
                      isDark && formData.investment_horizon !== h.value && "text-slate-300"
                    )}>{h.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.investment_horizon && (
                <p className="text-red-500 text-sm mt-1">{errors.investment_horizon}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Risk Profile */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className={cn(
                "text-xl font-semibold mb-2",
                isDark ? "text-white" : "text-slate-900"
              )}>Risk Tolerance</h2>
              <p className={cn(
                "text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}>How comfortable are you with market fluctuations?</p>
            </div>
            
            <RadioGroup 
              value={formData.risk_tolerance} 
              onValueChange={(v) => updateField('risk_tolerance', v)}
              className="space-y-3"
            >
              {riskLevels.map(level => (
                <div key={level.value} className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all",
                  formData.risk_tolerance === level.value
                    ? "border-teal-500 bg-teal-50"
                    : isDark 
                      ? "border-slate-600 hover:border-slate-500"
                      : "border-slate-200 hover:border-slate-300"
                )}>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value={level.value} id={level.value} className="mt-1" />
                    <div>
                      <Label htmlFor={level.value} className={cn(
                        "cursor-pointer font-medium",
                        isDark && formData.risk_tolerance !== level.value && "text-slate-300"
                      )}>{level.label}</Label>
                      <p className={cn(
                        "text-sm mt-1",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )}>{level.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </RadioGroup>
            {errors.risk_tolerance && (
              <p className="text-red-500 text-sm">{errors.risk_tolerance}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className={cn(
        "p-6 border-t flex justify-between",
        isDark ? "border-slate-700" : "border-slate-200"
      )}>
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={cn(
            isDark && "border-slate-600 text-slate-300 hover:bg-slate-700"
          )}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <Button
          onClick={nextStep}
          disabled={isLoading}
          className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : currentStep === 4 ? (
            <>
              Generate Plan
              <Check className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}