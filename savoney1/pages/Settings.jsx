import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { 
  User, 
  Shield, 
  Bell, 
  Moon, 
  Sun,
  Save,
  ChevronRight,
  LogOut,
  Trash2,
  Key,
  Smartphone
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Settings({ isDark, toggleTheme }) {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('profile');

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  const profile = profiles?.[0];

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    pan_number: profile?.pan_number || '',
    occupation: profile?.occupation || '',
    annual_income: profile?.annual_income || ''
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      toast.success('Settings saved successfully');
    }
  });

  const handleSave = () => {
    if (profile?.id) {
      updateProfileMutation.mutate({ id: profile.id, data: formData });
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: isDark ? Moon : Sun },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={cn(
          "text-2xl lg:text-3xl font-bold",
          isDark ? "text-white" : "text-slate-900"
        )}>Settings</h1>
        <p className={cn(
          "mt-1",
          isDark ? "text-slate-400" : "text-slate-500"
        )}>Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className={cn(
          "rounded-2xl p-4",
          isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
        )}>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-teal-500/10 to-blue-500/10 text-teal-600"
                      : isDark
                        ? "text-slate-400 hover:text-white hover:bg-slate-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "text-teal-500")} />
                  <span className="font-medium">{section.label}</span>
                  <ChevronRight className={cn(
                    "w-4 h-4 ml-auto transition-transform",
                    isActive && "rotate-90"
                  )} />
                </button>
              );
            })}
          </nav>
          
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "text-red-500 hover:bg-red-50"
              )}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className={cn(
              "rounded-2xl p-6",
              isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
            )}>
              <h2 className={cn(
                "text-lg font-semibold mb-6",
                isDark ? "text-white" : "text-slate-900"
              )}>Profile Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className={isDark ? "text-slate-300" : ""}>Full Name</Label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className={cn(
                        "mt-2",
                        isDark && "bg-slate-700 border-slate-600 text-white"
                      )}
                    />
                  </div>
                  <div>
                    <Label className={isDark ? "text-slate-300" : ""}>PAN Number</Label>
                    <Input
                      value={formData.pan_number}
                      onChange={(e) => setFormData({ ...formData, pan_number: e.target.value.toUpperCase() })}
                      className={cn(
                        "mt-2",
                        isDark && "bg-slate-700 border-slate-600 text-white"
                      )}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className={isDark ? "text-slate-300" : ""}>Occupation</Label>
                    <Select 
                      value={formData.occupation} 
                      onValueChange={(v) => setFormData({ ...formData, occupation: v })}
                    >
                      <SelectTrigger className={cn(
                        "mt-2",
                        isDark && "bg-slate-700 border-slate-600 text-white"
                      )}>
                        <SelectValue placeholder="Select occupation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salaried">Salaried Employee</SelectItem>
                        <SelectItem value="self_employed">Self Employed</SelectItem>
                        <SelectItem value="business_owner">Business Owner</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={isDark ? "text-slate-300" : ""}>Annual Income</Label>
                    <Select 
                      value={formData.annual_income} 
                      onValueChange={(v) => setFormData({ ...formData, annual_income: v })}
                    >
                      <SelectTrigger className={cn(
                        "mt-2",
                        isDark && "bg-slate-700 border-slate-600 text-white"
                      )}>
                        <SelectValue placeholder="Select income range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="below_5l">Below ₹5 Lakhs</SelectItem>
                        <SelectItem value="5l_10l">₹5 - 10 Lakhs</SelectItem>
                        <SelectItem value="10l_25l">₹10 - 25 Lakhs</SelectItem>
                        <SelectItem value="25l_50l">₹25 - 50 Lakhs</SelectItem>
                        <SelectItem value="above_50l">Above ₹50 Lakhs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="bg-gradient-to-r from-teal-500 to-blue-600"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className={cn(
              "rounded-2xl p-6",
              isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
            )}>
              <h2 className={cn(
                "text-lg font-semibold mb-6",
                isDark ? "text-white" : "text-slate-900"
              )}>Security Settings</h2>
              
              <div className="space-y-6">
                <div className={cn(
                  "p-4 rounded-xl border flex items-center justify-between",
                  isDark ? "border-slate-600" : "border-slate-200"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      isDark ? "bg-slate-700" : "bg-slate-100"
                    )}>
                      <Key className={cn("w-5 h-5", isDark ? "text-slate-300" : "text-slate-600")} />
                    </div>
                    <div>
                      <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                        Change Password
                      </p>
                      <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className={isDark ? "border-slate-600" : ""}>
                    Update
                  </Button>
                </div>
                
                <div className={cn(
                  "p-4 rounded-xl border flex items-center justify-between",
                  isDark ? "border-slate-600" : "border-slate-200"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      isDark ? "bg-slate-700" : "bg-slate-100"
                    )}>
                      <Smartphone className={cn("w-5 h-5", isDark ? "text-slate-300" : "text-slate-600")} />
                    </div>
                    <div>
                      <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                        Two-Factor Authentication
                      </p>
                      <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className={cn(
                  "p-4 rounded-xl border border-red-200 bg-red-50",
                )}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-100">
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-red-700">Delete Account</p>
                      <p className="text-sm text-red-600">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-100">
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className={cn(
              "rounded-2xl p-6",
              isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
            )}>
              <h2 className={cn(
                "text-lg font-semibold mb-6",
                isDark ? "text-white" : "text-slate-900"
              )}>Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { label: 'Portfolio Updates', description: 'Receive alerts about your portfolio performance' },
                  { label: 'Transaction Alerts', description: 'Get notified about every transaction' },
                  { label: 'Compliance Alerts', description: 'Stay informed about KYC and regulatory updates' },
                  { label: 'Marketing Communications', description: 'Receive tips, offers, and news' },
                  { label: 'Email Notifications', description: 'Receive notifications via email' },
                  { label: 'SMS Notifications', description: 'Receive notifications via SMS' },
                ].map((item, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-4 rounded-xl border flex items-center justify-between",
                      isDark ? "border-slate-600" : "border-slate-200"
                    )}
                  >
                    <div>
                      <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                        {item.label}
                      </p>
                      <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                        {item.description}
                      </p>
                    </div>
                    <Switch defaultChecked={index < 4} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className={cn(
              "rounded-2xl p-6",
              isDark ? "bg-slate-800/50 border border-slate-700" : "bg-white border border-slate-200"
            )}>
              <h2 className={cn(
                "text-lg font-semibold mb-6",
                isDark ? "text-white" : "text-slate-900"
              )}>Appearance Settings</h2>
              
              <div className="space-y-6">
                <div className={cn(
                  "p-4 rounded-xl border flex items-center justify-between",
                  isDark ? "border-slate-600" : "border-slate-200"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      isDark ? "bg-slate-700" : "bg-slate-100"
                    )}>
                      {isDark 
                        ? <Moon className="w-5 h-5 text-slate-300" />
                        : <Sun className="w-5 h-5 text-amber-500" />
                      }
                    </div>
                    <div>
                      <p className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                        Dark Mode
                      </p>
                      <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                        Toggle between light and dark themes
                      </p>
                    </div>
                  </div>
                  <Switch checked={isDark} onCheckedChange={toggleTheme} />
                </div>
                
                <div>
                  <Label className={cn("mb-3 block", isDark ? "text-slate-300" : "")}>
                    Theme Preview
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => isDark && toggleTheme()}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        !isDark ? "border-teal-500" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="h-2 w-12 bg-slate-900 rounded mb-2" />
                        <div className="h-2 w-16 bg-slate-300 rounded" />
                      </div>
                      <p className={cn(
                        "text-sm font-medium mt-2",
                        isDark ? "text-slate-300" : "text-slate-900"
                      )}>Light</p>
                    </button>
                    
                    <button
                      onClick={() => !isDark && toggleTheme()}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all",
                        isDark ? "border-teal-500" : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className="bg-slate-800 rounded-lg p-3 shadow-sm">
                        <div className="h-2 w-12 bg-white rounded mb-2" />
                        <div className="h-2 w-16 bg-slate-600 rounded" />
                      </div>
                      <p className={cn(
                        "text-sm font-medium mt-2",
                        isDark ? "text-slate-300" : "text-slate-900"
                      )}>Dark</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}