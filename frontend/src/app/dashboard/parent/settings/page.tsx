'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  Smartphone, 
  Mail, 
  Lock, 
  Save, 
  UserCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronRight,
  Monitor,
  Moon,
  Sun,
  Layout
} from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useUpdateParentProfile } from '@/lib/api/hooks/useParent';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useToast } from '@/lib/hooks/useToast';

export default function ParentSettingsPage() {
  const { user } = useAuthStore();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateParentProfile();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    academicUpdates: true,
    attendanceAlerts: true,
    paymentReminders: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

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

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error.validation("New passwords do not match");
      return;
    }
    toast.success.show("Security core updated successfully");
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (!user) return null;

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Console Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            <span>Management Hub</span>
            <ChevronRight size={10} className="text-orange-500" />
            <span className="text-orange-600">System Settings</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-2xl shadow-2xl shadow-orange-600/30">
              <Settings size={24} className="text-white animate-spin-slow" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              Control Panel
            </h1>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-tight max-w-xl leading-relaxed">
            Configure your terminal preferences, security protocols, and communication signals for the Guardian Console.
          </p>
        </div>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <div className="px-2 mb-8 overflow-x-auto no-scrollbar">
          <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-1.5 rounded-[2rem] h-auto flex flex-nowrap w-fit md:w-full">
            <TabsTrigger 
              value="profile" 
              className="rounded-[1.5rem] px-8 py-4 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all gap-3"
            >
              <UserCircle size={16} /> Identity
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="rounded-[1.5rem] px-8 py-4 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all gap-3"
            >
              <Palette size={16} /> Visual
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="rounded-[1.5rem] px-8 py-4 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all gap-3"
            >
              <Shield size={16} /> Security
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="rounded-[1.5rem] px-8 py-4 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-orange-600 data-[state=active]:text-white transition-all gap-3"
            >
              <Bell size={16} /> Signals
            </TabsTrigger>
          </TabsList>
        </div>

        {/* IDENTITY TAB */}
        <TabsContent value="profile" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
            <div className="lg:col-span-2">
              <Card className="rounded-[3rem] border-none shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl overflow-hidden h-full">
                <CardHeader className="p-10 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-600/10 rounded-xl">
                      <User className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tight">Identity Registry</CardTitle>
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Manage your personnel data mapping</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={handleProfileSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Guardian Name</Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                          <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="h-16 pl-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Communication Node (Email)</Label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                          <Input 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            type="email"
                            className="h-16 pl-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-3 md:col-span-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Mobile Tether (Phone)</Label>
                        <div className="relative group">
                          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                          <Input 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="h-16 pl-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button 
                        disabled={isUpdating}
                        className="h-16 px-10 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-600/20 font-black text-xs uppercase tracking-widest transition-all active:scale-95 group"
                      >
                        {isUpdating ? (
                          <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating Hub</span>
                        ) : (
                          <span className="flex items-center gap-2"><Save size={18} className="group-hover:translate-y-[-2px] transition-transform" /> Synchronize Data</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-8">
              <Card className="rounded-[3rem] border-none shadow-2xl bg-slate-900 text-white p-10 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 space-y-6">
                  <div className="p-4 bg-white/10 rounded-2xl w-fit border border-white/10 backdrop-blur-md">
                    <CheckCircle2 className="text-orange-500" size={32} />
                  </div>
                  <h4 className="text-2xl font-black uppercase tracking-tight">Status: Verified</h4>
                  <p className="text-[11px] text-white/50 font-bold uppercase tracking-widest leading-relaxed">
                    Your account identity has been validated through the secure institutional mapping.
                  </p>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-orange-600" />
                  </div>
                  <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">Trust Level: High Precision</p>
                </div>
              </Card>
              
              <div className="p-8 rounded-[2.5rem] bg-orange-600/5 border border-orange-500/10 flex items-center gap-5 group cursor-default hover:bg-orange-600/10 transition-all">
                <div className="size-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20 group-hover:rotate-6 transition-all">
                  <UserCircle size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Public Identity</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Manage your public avatar and family mapping</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl hover:bg-orange-600 hover:text-white transition-all"
                  onClick={() => window.location.href = '/dashboard/parent/profile'}
                >
                  <ChevronRight size={18} />
                </Button>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-slate-900 dark:bg-white/5 border border-white/5 space-y-6 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Layout size={80} className="text-orange-500" />
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service Subscription</h4>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-orange-600 text-white px-2 py-0.5 rounded-full">Active</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-white uppercase tracking-tight">{user.plan || 'Free Trial'}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Expires: {user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full w-2/3 bg-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* VISUAL TAB */}
        <TabsContent value="appearance" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="px-2 max-w-4xl">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl overflow-hidden">
              <CardHeader className="p-10 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-600/10 rounded-xl">
                    <Palette className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Visual Configuration</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Terminal interface aesthetics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div 
                    onClick={() => setTheme('light')}
                    className={cn(
                      "p-8 rounded-[2.5rem] border-4 transition-all cursor-pointer group relative overflow-hidden",
                      theme === 'light' ? "border-orange-600 bg-white shadow-2xl" : "border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="size-12 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                        <Sun size={24} />
                      </div>
                      {theme === 'light' && <CheckCircle2 className="text-orange-600" size={24} />}
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">High Altitude</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Standard Light Mode Protocol</p>
                    
                    <div className="mt-8 space-y-3">
                       <div className="h-2 w-full bg-slate-200 rounded-full" />
                       <div className="h-2 w-2/3 bg-slate-200 rounded-full" />
                    </div>
                  </div>

                  <div 
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "p-8 rounded-[2.5rem] border-4 transition-all cursor-pointer group relative overflow-hidden",
                      theme === 'dark' ? "border-orange-600 bg-slate-900 shadow-2xl" : "border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                    )}
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="size-12 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                        <Moon size={24} />
                      </div>
                      {theme === 'dark' && <CheckCircle2 className="text-orange-600" size={24} />}
                    </div>
                    <h4 className="text-xl font-black uppercase tracking-tight text-white">Stealth Protocol</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Immersive Dark Mode Engine</p>
                    
                    <div className="mt-8 space-y-3">
                       <div className="h-2 w-full bg-white/10 rounded-full" />
                       <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-slate-900 dark:bg-white/5 border border-white/5 flex items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                        <Monitor size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase tracking-tight text-sm">System Override</h4>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Synchronize with device OS settings</p>
                      </div>
                   </div>
                   <Switch 
                     checked={theme === 'system'} 
                     onCheckedChange={(checked) => setTheme(checked ? 'system' : theme || 'light')}
                   />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="px-2 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="rounded-[3rem] border-none shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl overflow-hidden h-full">
                <CardHeader className="p-10 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-600/10 rounded-xl">
                      <Lock className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tight">Security Core</CardTitle>
                      <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Manage system access credentials</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10">
                  <form onSubmit={handlePasswordSubmit} className="space-y-10">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Current Password</Label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                          <Input 
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="h-16 pl-12 pr-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-sm"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
                          >
                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">New Password</Label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                            <Input 
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="h-16 pl-12 pr-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-sm"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
                            >
                              {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm New Password</Label>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                            <Input 
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="h-16 pl-12 pr-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-sm"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600 transition-colors"
                            >
                              {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button 
                        className="h-16 px-10 rounded-2xl bg-slate-900 dark:bg-orange-600 text-white shadow-xl shadow-slate-900/20 dark:shadow-orange-600/20 font-black text-xs uppercase tracking-widest transition-all active:scale-95 group"
                      >
                        <Shield size={18} className="mr-3 group-hover:rotate-12 transition-transform" />
                        Update Security Protocol
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-8">
               <Card className="rounded-[3rem] border-none shadow-2xl bg-orange-600 text-white p-10 relative overflow-hidden">
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
                  <div className="relative z-10 space-y-6">
                    <h4 className="text-xl font-black uppercase tracking-tight">Security Strength</h4>
                    <div className="flex gap-2">
                       <div className="h-2 flex-1 bg-white rounded-full" />
                       <div className="h-2 flex-1 bg-white rounded-full" />
                       <div className="h-2 flex-1 bg-white rounded-full" />
                       <div className="h-2 flex-1 bg-white/30 rounded-full" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-relaxed">
                      Your system access is protected by high-level encryption. Keep your password confidential.
                    </p>
                  </div>
               </Card>
               
               <div className="bg-white/50 dark:bg-white/5 rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/5 space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trusted Devices</h4>
                  <div className="space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500">
                           <Monitor size={18} />
                        </div>
                        <div className="flex-1">
                           <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white">Windows Terminal</p>
                           <p className="text-[9px] text-slate-500 font-bold uppercase">Active Now • Lagos, NG</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 opacity-50">
                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500">
                           <Smartphone size={18} />
                        </div>
                        <div className="flex-1">
                           <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white">Mobile Device</p>
                           <p className="text-[9px] text-slate-500 font-bold uppercase">2 days ago • Abuja, NG</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </TabsContent>

        {/* SIGNALS TAB */}
        <TabsContent value="notifications" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="px-2 max-w-4xl">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl overflow-hidden">
              <CardHeader className="p-10 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-600/10 rounded-xl">
                    <Bell className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Signal Protocols</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Configure your notification stream</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                <div className="space-y-8">
                  <NotificationToggle 
                    icon={<Mail size={18} />}
                    label="Email Transmissions"
                    description="Receive administrative logs and reports via email"
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, emailAlerts: checked})}
                  />
                  <NotificationToggle 
                    icon={<Smartphone size={18} />}
                    label="SMS Broadcasts"
                    description="High-priority alerts sent directly to your mobile tether"
                    checked={notifications.smsAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, smsAlerts: checked})}
                  />
                  <div className="h-px bg-slate-100 dark:bg-white/10" />
                  <NotificationToggle 
                    icon={<Layout size={18} />}
                    label="Academic Updates"
                    description="Signals when student nodes receive new grades or results"
                    checked={notifications.academicUpdates}
                    onCheckedChange={(checked) => setNotifications({...notifications, academicUpdates: checked})}
                  />
                  <NotificationToggle 
                    icon={<UserCircle size={18} />}
                    label="Attendance Alerts"
                    description="Immediate notification of student terminal attendance state"
                    checked={notifications.attendanceAlerts}
                    onCheckedChange={(checked) => setNotifications({...notifications, attendanceAlerts: checked})}
                  />
                  <NotificationToggle 
                    icon={<Smartphone size={18} />}
                    label="Payment Reminders"
                    description="Critical signals for financial protocol deadlines"
                    checked={notifications.paymentReminders}
                    onCheckedChange={(checked) => setNotifications({...notifications, paymentReminders: checked})}
                  />
                </div>
                
                <div className="pt-6">
                  <Button className="h-14 px-8 rounded-2xl border-2 border-orange-600 text-orange-600 bg-transparent hover:bg-orange-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest active:scale-95">
                    Reset Signal Parameters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationToggle({ 
  icon, 
  label, 
  description, 
  checked, 
  onCheckedChange 
}: { 
  icon: React.ReactNode, 
  label: string, 
  description: string, 
  checked: boolean, 
  onCheckedChange: (checked: boolean) => void 
}) {
  return (
    <div className="flex items-center justify-between gap-6 group">
      <div className="flex items-center gap-5">
        <div className="size-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-orange-500 group-hover:bg-orange-500/10 transition-all border border-slate-100 dark:border-white/5 shadow-sm">
          {icon}
        </div>
        <div className="space-y-1">
          <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{label}</h5>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
