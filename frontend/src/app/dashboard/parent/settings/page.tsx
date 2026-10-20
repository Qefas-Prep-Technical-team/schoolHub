'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
  Megaphone,
  ShieldCheck,
  Compass,
  Sparkles,
  ExternalLink
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
      case 'LINK_ACCEPTED': return <Check className="h-4 w-4 text-emerald-500" />;
      case 'LINK_REJECTED': return <X className="h-4 w-4 text-red-500" />;
      case 'LINK_RESPONSE': return <Activity className="h-4 w-4 text-orange-600" />;
      case 'MESSAGE': return <Mail className="h-4 w-4 text-orange-600" />;
      case 'ANNOUNCEMENT': return <Megaphone className="h-4 w-4 text-purple-500" />;
      case 'ACADEMIC': return <Activity className="h-4 w-4 text-emerald-500" />;
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

  const fallbackAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'Parent')}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;

  return (
    <div className="w-full max-w-[99%] mx-auto flex flex-col gap-4 sm:gap-6 pb-10 animate-in fade-in duration-200">
      
      {/* Upgraded Premium Hero Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-orange-50/25 to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-slate-200/80 dark:border-slate-800 rounded-[22px] p-4 sm:p-6 shadow-xs">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 size-72 rounded-full bg-gradient-to-bl from-orange-400/10 via-amber-400/5 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-5">
            {/* User Avatar */}
            <div className="relative size-14 sm:size-16 shrink-0 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm bg-orange-100 dark:bg-orange-950/40">
              <Image
                src={fallbackAvatar}
                alt={user.name || 'Parent'}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            {/* Title & Metadata */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={13} />
                  Parent Account Security
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {user.email}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Account Settings
                </h1>
                <HeaderTooltip
                  content="Central management hub for your parent account. Update your contact phone and email, choose your primary student focus for dashboard analytics, toggle between Light and Dark interface modes, manage passwords, 2FA security, and active device logins."
                  size={17}
                />
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 leading-snug">
                Manage personal contact records, default student focus, security protocols, and visual preferences.
              </p>
            </div>
          </div>

          {/* Quick Actions (Full width grid on mobile, row on desktop) */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <Button
              variant="outline"
              onClick={() => window.open('/onboarding?revisit=true', '_blank')}
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:border-orange-300 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Onboarding Tour</span>
              <ExternalLink size={13} />
            </Button>
            <Button
              onClick={handleProfileSubmit}
              disabled={isUpdating}
              className="h-9 sm:h-10 px-4 sm:px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs shadow-orange-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              {!isUpdating && <Save size={14} />}
              <span>{isUpdating ? 'Saving...' : 'Save Profile'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <Tabs defaultValue="profile" className="w-full space-y-5 sm:space-y-6">
        <div className="overflow-x-auto no-scrollbar pb-1">
          <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl inline-flex min-w-full sm:min-w-0 sm:w-auto gap-1 h-auto">
            <TabsTrigger 
              value="profile" 
              className="rounded-lg h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all flex-1 sm:flex-initial"
            >
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <User size={15} className="shrink-0" /> 
                <span>Profile</span>
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="rounded-lg h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all flex-1 sm:flex-initial"
            >
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <Palette size={15} className="shrink-0" /> 
                <span>Theme</span>
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="rounded-lg h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all flex-1 sm:flex-initial"
            >
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <Lock size={15} className="shrink-0" /> 
                <span>Security</span>
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="rounded-lg h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-orange-600 dark:data-[state=active]:text-orange-400 data-[state=active]:shadow-sm transition-all flex-1 sm:flex-initial"
            >
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <Bell size={15} className="shrink-0" /> 
                <span>Alerts</span>
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ========================================================= */}
        {/* PROFILE TAB */}
        {/* ========================================================= */}
        <TabsContent value="profile" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
            
            {/* Form Section (Spans 2 columns on wide screens) */}
            <div className="lg:col-span-2">
              <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 h-full">
                <CardHeader className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base sm:text-lg font-bold">Personal Information</CardTitle>
                        <HeaderTooltip
                          content="Keep your official contact records current. Your email and phone are used by school authorities for emergency broadcasts, report card releases, and direct messaging from class teachers."
                          size={14}
                        />
                      </div>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">Update your contact details and active student focus</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                          <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="h-10 sm:h-11 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700 focus-visible:ring-orange-500 text-xs sm:text-sm font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                          <Input 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            type="email"
                            className="h-10 sm:h-11 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700 focus-visible:ring-orange-500 text-xs sm:text-sm font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</Label>
                        <div className="relative">
                          <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                          <Input 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="h-10 sm:h-11 pl-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700 focus-visible:ring-orange-500 text-xs sm:text-sm font-medium"
                          />
                        </div>
                      </div>

                      {/* Default Child Selection */}
                      <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Default Student Focus</Label>
                          <HeaderTooltip
                            content="Select which enrolled child displays by default when opening your Parent Portal dashboard, academic performance graphs, and attendance records. You can switch between children at any time using the student switcher pills."
                            size={13}
                          />
                        </div>
                        <Select 
                          value={selectedChildId || ""} 
                          onValueChange={(val) => {
                            setSelectedChildId(val);
                            toast.success.show("Default student focus updated");
                          }}
                        >
                          <SelectTrigger className="h-10 sm:h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700 focus:ring-orange-500 text-xs sm:text-sm font-medium">
                            <SelectValue placeholder="Select Default Child" />
                          </SelectTrigger>
                          <SelectContent>
                            {children.map(child => (
                              <SelectItem value={child.id} key={child.id} className="text-xs sm:text-sm font-medium">
                                {child.name} {child.currentClass?.name ? `(${child.currentClass.name})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] text-slate-500 mt-1">This child will be automatically selected across your dashboard and academic reports.</p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button 
                        disabled={isUpdating}
                        className="w-full sm:w-auto h-10 sm:h-11 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all text-xs sm:text-sm shadow-xs shadow-orange-600/20"
                      >
                        {isUpdating ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving...</span>
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-1.5">
                            <Save size={15} />
                            <span>Save Changes</span>
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Information Widgets */}
            <div className="space-y-3.5 sm:space-y-4">
              {/* Account Verified Card */}
              <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 sm:p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Account Verified</h4>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 leading-snug">
                        Confirmed guardian standing granted by school administration.
                      </p>
                    </div>
                  </div>
                  <HeaderTooltip
                    content="Your identity and guardianship relationships have been confirmed by institutional administrators, granting full access to grades, attendance logs, and school notifications."
                    size={13}
                  />
                </div>
              </div>
              
              {/* Public Profile Card */}
              <div 
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3.5 cursor-pointer hover:border-orange-500/40 transition-all shadow-xs group" 
                onClick={() => window.location.href = '/dashboard/parent/profile'}
              >
                <div className="size-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform shrink-0">
                  <UserCircle size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Public Profile</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">View how teachers and staff see your profile</p>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>

              {/* Subscription Tier Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Subscription Tier</h4>
                    <HeaderTooltip
                      content="Active membership plan covering parent portal features, continuous assessment analytics, exam results, and family communication allowances."
                      size={13}
                    />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">Active</span>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{user.plan || 'Standard Tier'}</p>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                    Coverage: {user.trialEndsAt ? `Renews on ${new Date(user.trialEndsAt).toLocaleDateString()}` : 'Continuous School License'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* APPEARANCE TAB */}
        {/* ========================================================= */}
        <TabsContent value="appearance" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none w-full">
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 overflow-hidden w-full">
            <CardHeader className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                  <Palette size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold">Display &amp; Appearance</CardTitle>
                    <HeaderTooltip
                      content="Choose between high-contrast Light mode for daylight reading or eye-friendly Dark mode for low-light environments. System Default dynamically follows your operating system's theme schedule."
                      size={14}
                    />
                  </div>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">Customize theme styling and interface brightness across devices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
                <div 
                  onClick={() => setTheme('light')}
                  className={cn(
                    "p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative",
                    theme === 'light' 
                      ? "border-orange-600 bg-orange-50/50 dark:bg-orange-950/20 shadow-xs" 
                      : "border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center text-orange-600">
                      <Sun size={20} />
                    </div>
                    {theme === 'light' && <CheckCircle2 className="text-orange-600 size-5" />}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Light Mode</h4>
                  <p className="text-xs text-slate-500 mt-0.5">High-contrast presentation designed for bright daylight environments</p>
                </div>

                <div 
                  onClick={() => setTheme('dark')}
                  className={cn(
                    "p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative",
                    theme === 'dark' 
                      ? "border-orange-600 bg-slate-800 shadow-xs" 
                      : "border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200">
                      <Moon size={20} />
                    </div>
                    {theme === 'dark' && <CheckCircle2 className="text-orange-600 size-5" />}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Dark Mode</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Sleek dark theme gentle on the eyes in dim and evening settings</p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                 <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shrink-0 shadow-xs">
                      <Monitor size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">System Default Synchronization</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Automatically match your operating system theme schedule</p>
                    </div>
                 </div>
                 <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                   <span className="text-xs font-semibold text-slate-500 sm:hidden">Auto Sync</span>
                   <Switch 
                     checked={theme === 'system'} 
                     onCheckedChange={(checked) => setTheme(checked ? 'system' : 'light')}
                   />
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================= */}
        {/* SECURITY TAB */}
        {/* ========================================================= */}
        <TabsContent value="security" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none w-full space-y-4 sm:space-y-6">
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 overflow-hidden w-full">
            <CardHeader className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold">Security Protocols</CardTitle>
                    <HeaderTooltip
                      content="Safeguard your family's portal access. Regularly update your master password, enforce Two-Factor Authentication (2FA) with authenticator apps or email OTP, and audit logged-in device sessions to terminate unauthorized access."
                      size={14}
                    />
                  </div>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">Manage master passwords, two-factor authorization, and active sessions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-3 sm:gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Account Password</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500">Update your password to defend against credential compromise.</p>
                </div>
                <ChangePasswordModal>
                  <Button className="w-full sm:w-auto h-9 sm:h-10 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold rounded-xl shadow-xs">
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
        </TabsContent>

        {/* ========================================================= */}
        {/* NOTIFICATIONS TAB */}
        {/* ========================================================= */}
        <TabsContent value="notifications" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none w-full">
          <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 overflow-hidden w-full">
            <CardHeader className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 rounded-xl shrink-0">
                  <Bell size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg font-bold">Notification Center</CardTitle>
                    <HeaderTooltip
                      content="Review all past alerts and institutional communications. Unread items are highlighted with an amber tint. Click any notification to mark it as read. Filter categories include Academic updates, Link Requests, and System Announcements."
                      size={14}
                    />
                  </div>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">Review academic alerts, school broadcasts, and connection updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center min-h-[220px] sm:min-h-[260px]">
                  <div className="size-14 sm:size-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3 text-slate-400">
                    <Bell size={26} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    No Notifications Yet
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-xs">
                    When teachers post grades or school announcements are dispatched, alerts will appear here.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="max-h-[600px] overflow-y-auto no-scrollbar divide-y divide-slate-100 dark:divide-slate-800/50">
                    {notifications.map((n: Notification) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-3.5 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors flex items-start gap-3 sm:gap-4 cursor-pointer",
                          !n.isRead && "bg-orange-50/40 dark:bg-orange-950/20"
                        )}
                        onClick={() => {
                          if (!n.isRead) handleMarkAsRead(n.id);
                        }}
                      >
                        <div className="mt-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shrink-0 size-9 sm:size-10 flex items-center justify-center shadow-xs">
                          {getTypeIcon(n.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-0.5">
                            <p className={cn("text-xs sm:text-sm leading-tight text-slate-900 dark:text-white", !n.isRead ? "font-bold" : "font-semibold")}>
                              {n.title}
                            </p>
                            <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap font-medium">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
                      className="rounded-xl border-slate-200 dark:border-slate-700 text-xs h-8 sm:h-9 px-3 font-bold"
                    >
                      Previous
                    </Button>
                    <span className="text-xs font-bold text-slate-500">Page {page}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={notifications.length < ITEMS_PER_PAGE}
                      onClick={() => setPage(p => p + 1)}
                      className="rounded-xl border-slate-200 dark:border-slate-700 text-xs h-8 sm:h-9 px-3 font-bold"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
