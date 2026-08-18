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
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { useParentStore } from '@/lib/api/hooks/useParentStore';

export default function ParentSettingsPage() {
  const { user } = useAuthStore();
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
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 md:px-8 mt-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 mb-1">
            <span>Settings</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl shadow-sm">
              <Settings size={28} className="text-orange-600 dark:text-orange-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Account Settings
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl">
            Manage your personal information, security preferences, and visual appearance.
          </p>
        </div>
      </header>

      <Tabs defaultValue="profile" className="w-full">
        <div className="mb-10 w-full overflow-x-auto no-scrollbar pb-2">
          <TabsList className="inline-flex h-14 items-center justify-start rounded-full bg-slate-100 dark:bg-slate-900/50 p-1.5 border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
            <TabsTrigger 
              value="profile" 
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-orange-500"
            >
              Profile
            </TabsTrigger>
            
            <TabsTrigger 
              value="appearance" 
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-orange-500"
            >
              Appearance
            </TabsTrigger>

            <TabsTrigger 
              value="security" 
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-orange-500"
            >
              Security
            </TabsTrigger>

            <TabsTrigger 
              value="notifications" 
              className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:text-slate-900 dark:hover:text-slate-100 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-orange-500"
            >
              Notifications
            </TabsTrigger>
          </TabsList>
        </div>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 h-full">
                <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                      <User className="text-orange-600 dark:text-orange-500" size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
                      <CardDescription className="text-sm text-slate-500 mt-1">Update your contact details and basic info</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-orange-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <Input 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            type="email"
                            className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-orange-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</Label>
                        <div className="relative">
                          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <Input 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus-visible:ring-orange-500"
                          />
                        </div>
                      </div>

                      {/* Default Child Selection */}
                      <div className="space-y-2 md:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800/50 mt-4">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Default Child</Label>
                        <Select 
                          value={selectedChildId || ""} 
                          onValueChange={(val) => {
                            setSelectedChildId(val);
                            toast.success("Default child updated");
                          }}
                        >
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-orange-500">
                            <SelectValue placeholder="Select Default Child" />
                          </SelectTrigger>
                          <SelectContent>
                            {children.map(child => (
                              <SelectItem value={child.id} key={child.id}>{child.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">This child will be automatically selected across your dashboard.</p>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button 
                        disabled={isUpdating}
                        className="h-12 px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all"
                      >
                        {isUpdating ? (
                          <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                        ) : (
                          <span className="flex items-center gap-2"><Save size={18} /> Save Changes</span>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="rounded-3xl border border-green-200 dark:border-green-900/50 shadow-sm bg-green-50 dark:bg-green-900/10 p-8 relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-green-600 dark:text-green-500" size={28} />
                    <h4 className="text-xl font-bold text-green-800 dark:text-green-400">Account Verified</h4>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-500/80 leading-relaxed">
                    Your account has been successfully verified by the school administration.
                  </p>
                </div>
              </Card>
              
              <div 
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:border-orange-200 dark:hover:border-orange-900/50 transition-all shadow-sm group" 
                onClick={() => window.location.href = '/dashboard/parent/profile'}
              >
                <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-500 group-hover:scale-110 transition-transform">
                  <UserCircle size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Public Profile</h4>
                  <p className="text-sm text-slate-500 mt-0.5">View how others see you</p>
                </div>
                <ChevronRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-500">Subscription</h4>
                  <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full">Active</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{user.plan || 'Free Plan'}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Expires: {user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="max-w-4xl mx-auto">
            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Palette className="text-orange-600 dark:text-orange-500" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Appearance</CardTitle>
                    <CardDescription className="text-sm text-slate-500 mt-1">Customize how the app looks on your device</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => setTheme('light')}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all cursor-pointer relative",
                      theme === 'light' ? "border-orange-600 bg-orange-50 dark:bg-orange-900/10 shadow-md" : "border-slate-200 dark:border-slate-800 hover:border-orange-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <Sun size={24} />
                      </div>
                      {theme === 'light' && <CheckCircle2 className="text-orange-600" size={24} />}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Light Mode</h4>
                    <p className="text-sm text-slate-500 mt-1">Bright and clear for daytime use</p>
                  </div>

                  <div 
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all cursor-pointer relative",
                      theme === 'dark' ? "border-orange-600 bg-slate-800 shadow-md" : "border-slate-200 dark:border-slate-800 hover:border-orange-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="size-12 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200">
                        <Moon size={24} />
                      </div>
                      {theme === 'dark' && <CheckCircle2 className="text-orange-600" size={24} />}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">Dark Mode</h4>
                    <p className="text-sm text-slate-500 mt-1">Easy on the eyes in low light</p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                   <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        <Monitor size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">System Default</h4>
                        <p className="text-sm text-slate-500 mt-0.5">Automatically match your device's theme</p>
                      </div>
                   </div>
                   <Switch 
                     checked={theme === 'system'} 
                     onCheckedChange={(checked) => setTheme(checked ? 'system' : 'light')}
                   />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                    <Lock className="text-orange-600 dark:text-orange-500" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Security Settings</CardTitle>
                    <CardDescription className="text-sm text-slate-500 mt-1">Manage your password and security</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Account Password</h4>
                    <p className="text-sm text-slate-500">Update your password to keep your account secure.</p>
                  </div>
                  <ChangePasswordModal>
                    <Button className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 h-12 w-full sm:w-auto">
                      Change Password
                    </Button>
                  </ChangePasswordModal>
                </div>
              </CardContent>
            </Card>
            
            <DeviceSessions />
          </div>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="animate-in fade-in slide-in-from-left-4 duration-500 outline-none">
          <div className="max-w-4xl mx-auto">
            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                      <Bell className="text-orange-600 dark:text-orange-500" size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">All Notifications</CardTitle>
                      <CardDescription className="text-sm text-slate-500 mt-1">Stay updated with messages and announcements</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 text-center min-h-[300px]">
                    <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                      <Bell size={32} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      No Notifications Yet
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
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
                            "p-6 border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors flex gap-4 cursor-pointer",
                            !n.isRead && "bg-orange-50/50 dark:bg-orange-900/10"
                          )}
                          onClick={() => {
                            if (!n.isRead) handleMarkAsRead(n.id);
                          }}
                        >
                          <div className="mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-2 shrink-0 h-10 w-10 flex items-center justify-center shadow-sm">
                            {getTypeIcon(n.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className={cn("text-[15px] leading-tight truncate pr-4 text-slate-900 dark:text-white", !n.isRead ? "font-bold" : "font-semibold")}>
                                {n.title}
                              </p>
                              <span className="text-xs text-slate-400 whitespace-nowrap font-medium">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="rounded-xl border-slate-200 dark:border-slate-700"
                      >
                        Previous
                      </Button>
                      <span className="text-sm font-medium text-slate-500">Page {page}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={notifications.length < ITEMS_PER_PAGE}
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-xl border-slate-200 dark:border-slate-700"
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
