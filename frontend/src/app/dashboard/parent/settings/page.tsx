'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Palette, 
  Smartphone, 
  Mail, 
  Lock, 
  Save, 
  UserCircle,
  CheckCircle2,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
  Info,
  AlertCircle,
  Check,
  X,
  Activity,
  Megaphone
} from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useUpdateParentProfile } from '@/lib/api/hooks/useParent';
import { useNotifications, useMarkAsRead } from '@/lib/api/hooks/useNotifications';
import { Notification } from '@/lib/api/services/notificationService';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/hooks/useToast';
import DeviceSessions from '@/components/DeviceSessions';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import DeactivateAccountSection from '@/components/auth/DeactivateAccountSection';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { useParentStore } from '@/lib/api/hooks/useParentStore';
import { HeaderTooltip } from '@/app/dashboard/parent/components/dashboard/HeaderTooltip';

export default function ParentSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateParentProfile();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  
  const { data: children = [] } = useParentChildren();
  const { selectedChildId, setSelectedChildId } = useParentStore();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const { data: notifications = [] } = useNotifications({ 
    limit: ITEMS_PER_PAGE, 
    offset: (page - 1) * ITEMS_PER_PAGE 
  });
  
  const markAsReadMutation = useMarkAsRead();

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LINK_REQUEST': return <Info className="h-4 w-4 text-blue-500" />;
      case 'SYSTEM': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'LINK_ACCEPTED': return <Check className="h-4 w-4 text-green-500" />;
      case 'LINK_REJECTED': return <X className="h-4 w-4 text-red-500" />;
      case 'LINK_RESPONSE': return <Activity className="h-4 w-4 text-orange-600" />;
      case 'MESSAGE': return <Mail className="h-4 w-4 text-orange-600" />;
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4 text-purple-500" />;
      case 'ACADEMIC': return <Activity className="h-4 w-4 text-green-500" />;
      default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="size-10 sm:size-11 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500 shrink-0 mt-0.5">
            <Settings size={22} className="sm:size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Account Settings
              </h1>
              <HeaderTooltip
                content="Central management hub for your parent account. Update your contact phone and email, choose your primary student focus for dashboard analytics, toggle between Light and Dark interface modes, manage passwords, 2FA security, and active device logins."
                size={16}
                side="bottom"
              />
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Manage your personal information, security preferences, and visual appearance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => window.open('/onboarding?revisit=true', '_blank')}
            className="flex-1 sm:flex-initial h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            Revisit Onboarding
          </Button>
          <Button
            onClick={handleProfileSubmit}
            disabled={isUpdating}
            className="flex-1 sm:flex-initial h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            {!isUpdating && <Save size={15} className="mr-1.5" />}
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-6">
        <div className="overflow-x-auto no-scrollbar pb-1">
          <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl inline-flex min-w-full sm:min-w-0 sm:w-auto gap-1 h-auto">
            <TabsTrigger value="profile" className="rounded-lg h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial">
              <User size={14} /> <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial">
              <Palette size={14} /> <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial">
              <Lock size={14} /> <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-initial">
              <Bell size={14} /> <span>Notifications</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <Card className="rounded-2xl sm:rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full">
                <CardHeader className="p-4 sm:p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2.5 sm:p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl shrink-0">
                      <User className="text-orange-600 dark:text-orange-500 size-5 sm:size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg sm:text-xl font-bold">Personal Information</CardTitle>
                        <HeaderTooltip
                          content="Keep your official contact records current. Your email and phone are used by school authorities for emergency broadcasts, report card releases, and direct messaging from class teachers."
                          size={14}
                        />
                      </div>
                      <CardDescription className="text-xs sm:text-sm text-slate-500 mt-0.5">Update your contact details and basic info</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <form onSubmit={handleProfileSubmit} className="space-y-5 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 sm:size-4.5" />
                          <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="h-11 pl-10 sm:pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-orange-500 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 sm:size-4.5" />
                          <Input 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            type="email"
                            className="h-11 pl-10 sm:pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-orange-500 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</Label>
                        <div className="relative">
                          <Smartphone className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 sm:size-4.5" />
                          <Input 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="h-11 pl-10 sm:pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-orange-500 text-sm"
                          />
                        </div>
                      </div>

                      {/* Default Child Selection */}
                      <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-2 sm:mt-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">Default Student Focus</Label>
                          <HeaderTooltip
                            content="Select which enrolled child displays by default when opening your Parent Portal dashboard, academic performance graphs, and attendance records. You can switch between children at any time using the student switcher pills."
                            size={13}
                          />
                        </div>
                        <Select 
                          value={selectedChildId || ""} 
                          onValueChange={(val) => {
                            setSelectedChildId(val);
                            toast.success.show("Default child updated");
                          }}
                        >
                          <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-orange-500 text-sm">
                            <SelectValue placeholder="Select Default Child" />
                          </SelectTrigger>
                          <SelectContent>
                            {children.map(child => (
                              <SelectItem value={child.id} key={child.id}>{child.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">This child will be automatically selected across your dashboard.</p>
                      </div>
                    </div>
                    <div className="pt-2 sm:pt-4">
                      <Button 
                        disabled={isUpdating}
                        className="w-full sm:w-auto h-11 px-6 sm:px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all text-sm"
                      >
                        {isUpdating ? (
                          <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                        ) : (
                          <span className="flex items-center justify-center gap-2"><Save size={18} /> Save Changes</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              <Card className="rounded-2xl border border-green-200 dark:border-green-900/50 shadow-sm bg-green-50 dark:bg-green-900/10 p-5 sm:p-6 relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="text-green-600 dark:text-green-500 size-6 sm:size-7" />
                      <h4 className="text-base sm:text-lg font-bold text-green-800 dark:text-green-400">Account Verified</h4>
                    </div>
                    <HeaderTooltip
                      content="Your identity and guardianship relationships have been confirmed by institutional administrators, granting full access to grades, attendance logs, and school notifications."
                      size={13}
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-green-700 dark:text-green-500/80 leading-relaxed">
                    Your account has been successfully verified by the school administration.
                  </p>
                </div>
              </Card>
              
              <div 
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:border-orange-200 dark:hover:border-orange-900/50 transition-all shadow-sm group" 
                onClick={() => window.location.href = '/dashboard/parent/profile'}
              >
                <div className="size-11 sm:size-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500 group-hover:scale-110 transition-transform shrink-0">
                  <UserCircle size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Public Profile</h4>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">View how others see you</p>
                </div>
                <ChevronRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-500">Subscription Tier</h4>
                    <HeaderTooltip
                      content="Active membership plan covering parent portal features, continuous assessment analytics, exam results, and family communication allowances."
                      size={13}
                    />
                  </div>
                  <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-0.5 rounded-full">Active</span>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{user.plan || 'Free Plan'}</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Expires: {user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString() : 'Active Ongoing'}
                  </p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="w-full max-w-6xl mx-auto">
            <Card className="rounded-2xl sm:rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="p-4 sm:p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl shrink-0">
                    <Palette className="text-orange-600 dark:text-orange-500 size-5 sm:size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg sm:text-xl font-bold">Display & Appearance</CardTitle>
                      <HeaderTooltip
                        content="Choose between high-contrast Light mode for daylight reading or eye-friendly Dark mode for low-light environments. System Default dynamically follows your operating system's theme schedule."
                        size={14}
                      />
                    </div>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 mt-0.5">Customize how the app looks on your device</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div 
                    onClick={() => setTheme('light')}
                    className={cn(
                      "p-4 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer relative",
                      theme === 'light' ? "border-orange-600 bg-orange-50 dark:bg-orange-900/10 shadow-md" : "border-slate-200 dark:border-slate-800 hover:border-orange-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="size-10 sm:size-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <Sun size={22} className="sm:size-6" />
                      </div>
                      {theme === 'light' && <CheckCircle2 className="text-orange-600 size-5 sm:size-6" />}
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Light Mode</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Bright and clear for daytime use</p>
                  </div>

                  <div 
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "p-4 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer relative",
                      theme === 'dark' ? "border-orange-600 bg-slate-800 shadow-md" : "border-slate-200 dark:border-slate-800 hover:border-orange-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="size-10 sm:size-12 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200">
                        <Moon size={22} className="sm:size-6" />
                      </div>
                      {theme === 'dark' && <CheckCircle2 className="text-orange-600 size-5 sm:size-6" />}
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Dark Mode</h4>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Easy on the eyes in low light</p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div className="flex items-center gap-3 sm:gap-4">
                      <div className="size-10 sm:size-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shrink-0">
                        <Monitor size={22} className="sm:size-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">System Default</h4>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Automatically match your device's theme</p>
                      </div>
                   </div>
                   <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                     <span className="text-xs font-medium text-slate-500 sm:hidden">Sync with device</span>
                     <Switch 
                       checked={theme === 'system'} 
                       onCheckedChange={(checked) => setTheme(checked ? 'system' : 'light')}
                     />
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <Card className="rounded-2xl sm:rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="p-4 sm:p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl shrink-0">
                    <Lock className="text-orange-600 dark:text-orange-500 size-5 sm:size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg sm:text-xl font-bold">Security Protocols</CardTitle>
                      <HeaderTooltip
                        content="Safeguard your family's portal access. Regularly update your master password, enforce Two-Factor Authentication (2FA) with authenticator apps or email OTP, and audit logged-in device sessions to terminate unauthorized access."
                        size={14}
                      />
                    </div>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 mt-0.5">Manage your password, two-factor auth, and sessions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Account Password</h4>
                    <p className="text-xs sm:text-sm text-slate-500">Update your password to keep your account secure.</p>
                  </div>
                  <ChangePasswordModal>
                    <Button className="w-full sm:w-auto h-10 px-5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-semibold rounded-xl">
                      Change Password
                    </Button>
                  </ChangePasswordModal>
                </div>

                <div>
                  <TwoFactorSetup 
                    isTwoFactorEnabled={user?.isTwoFactorEnabled ?? user?.require2FA ?? false} 
                    onUpdate={(enabled) => updateUser({ require2FA: enabled, isTwoFactorEnabled: enabled })} 
                  />
                </div>
              </CardContent>
            </Card>
            
            <DeviceSessions />

            {/* Account Deactivation / Danger Zone */}
            <DeactivateAccountSection userRole="parent" />
          </div>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="w-full max-w-6xl mx-auto">
            <Card className="rounded-2xl sm:rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="p-4 sm:p-6 md:p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2.5 sm:p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl shrink-0">
                    <Bell className="text-orange-600 dark:text-orange-500 size-5 sm:size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg sm:text-xl font-bold">Notification Center</CardTitle>
                      <HeaderTooltip
                        content="Review all past alerts and institutional communications. Unread items are highlighted with an amber tint. Click any notification to mark it as read. Filter categories include Academic updates, Link Requests, and System Announcements."
                        size={14}
                      />
                    </div>
                    <CardDescription className="text-xs sm:text-sm text-slate-500 mt-0.5">Stay updated with messages, grades, and announcements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center min-h-[260px] sm:min-h-[300px]">
                    <div className="size-16 sm:size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                      <Bell size={28} className="sm:size-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                      No Notifications Yet
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                      When you receive new alerts, they will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="max-h-[600px] overflow-y-auto no-scrollbar">
                      {notifications.map((n: Notification) => (
                        <div 
                          key={n.id} 
                          className={cn(
                            "p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors flex items-start gap-3 sm:gap-4 cursor-pointer",
                            !n.isRead && "bg-orange-50/50 dark:bg-orange-900/10"
                          )}
                          onClick={() => {
                            if (!n.isRead) handleMarkAsRead(n.id);
                          }}
                        >
                          <div className="mt-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-2 shrink-0 h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center shadow-sm">
                            {getTypeIcon(n.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <p className={cn("text-sm sm:text-[15px] leading-tight text-slate-900 dark:text-white", !n.isRead ? "font-bold" : "font-semibold")}>
                                {n.title}
                              </p>
                              <span className="text-[11px] sm:text-xs text-slate-400 whitespace-nowrap font-medium">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="rounded-lg border-slate-200 dark:border-slate-700 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                      >
                        Previous
                      </Button>
                      <span className="text-xs sm:text-sm font-medium text-slate-500">Page {page}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={notifications.length < ITEMS_PER_PAGE}
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-lg border-slate-200 dark:border-slate-700 text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
