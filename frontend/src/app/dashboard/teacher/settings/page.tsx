'use client';

import { useState, useEffect } from 'react';
import { 
    Settings, 
    Bell, 
    Shield, 
    User, 
    Palette, 
    Globe, 
    Eye,
    Loader2,
    Save,
    ChevronDown,
    School,
    LogOut,
    Languages,
    Clock,
    Lock,
    Fingerprint
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useTeacherProfile, useTeacherSettings, useUpdateTeacherSettings } from '@/lib/api/hooks/useTeacher';
import { cn } from '@/lib/utils';
import { useLogoutMutation } from '@/app/(auth)/login/services/use-auth-mutations';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal';
import DeviceSessions from '@/components/DeviceSessions';

export default function TeacherSettingsPage() {
    const { theme: currentTheme, setTheme } = useTheme();
    const { data: profile, isLoading: isProfileLoading } = useTeacherProfile();
    const { data: backendSettings, isLoading: isSettingsLoading } = useTeacherSettings();
    const updateSettings = useUpdateTeacherSettings();
    const { mutate: logout } = useLogoutMutation();

    // Local state for settings
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        behaviorAlerts: true,
        gradingReminders: false,
        theme: 'system',
        language: 'en',
        timezone: 'UTC+0',
        twoFactor: false
    });

    useEffect(() => {
        if (backendSettings) {
            setSettings(prev => ({
                ...prev,
                ...backendSettings
            }));
        }
    }, [backendSettings]);

    const handleSave = async () => {
        await updateSettings.mutateAsync(settings);
    };

    const isLoading = isProfileLoading || isSettingsLoading;

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500 opacity-50" />
            </div>
        );
    }

    const initials = (profile?.name || 'T').split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <div className="w-[80%] max-w-none mx-auto py-8 animate-in fade-in duration-500 space-y-6 md:space-y-8 px-4 md:px-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Settings className="text-emerald-500" size={28} />
                        Settings
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Control your account preferences and system configuration.
                    </p>
                </div>
                
                <Button 
                    onClick={handleSave} 
                    disabled={updateSettings.isPending}
                    className="h-10 px-6 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 font-semibold shadow-sm transition-all"
                >
                    {updateSettings.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save size={16} className="mr-2" />}
                    Save Preferences
                </Button>
            </div>

            <Tabs defaultValue="account" className="w-full space-y-6">
                <TabsList className="bg-slate-50 dark:bg-slate-900 rounded-lg p-1 w-full max-w-md grid grid-cols-3 h-auto">
                    <TabsTrigger value="account" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                        <div className="flex flex-row items-center justify-center gap-2">
                            <User size={14} /> <span>Account</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Shield size={14} /> <span>Security</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Palette size={14} /> <span>Display</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                {/* Account Settings */}
                <TabsContent value="account" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                                <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Fingerprint className="text-emerald-500" size={18} /> Educator Identity
                                    </CardTitle>
                                    <CardDescription>Manage your primary account identity.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center gap-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                        <div className="h-16 w-16 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-xl font-bold text-emerald-600 dark:text-emerald-400 overflow-hidden">
                                            {profile?.profileImage ? (
                                                <Image 
                                                    src={profile.profileImage} 
                                                    alt={profile.name} 
                                                    width={64} 
                                                    height={64} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                initials
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-bold text-slate-900 dark:text-white">{profile?.name}</p>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{profile?.teacherCode} • Educator</p>
                                        </div>
                                        <Button variant="outline" className="ml-auto rounded-lg h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-700" onClick={() => window.location.href='/dashboard/teacher/profile'}>
                                            Edit Profile
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Display Name</Label>
                                            <Input value={profile?.name} disabled className="h-10 rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-500" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Institutional Email</Label>
                                            <Input value={profile?.email} disabled className="h-10 rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-rose-100 dark:border-rose-900/30 shadow-sm bg-rose-50/50 dark:bg-rose-950/20 overflow-hidden">
                                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-rose-900 dark:text-rose-400">Logout Session</h3>
                                        <p className="text-xs text-rose-700 dark:text-rose-300/70">Terminate your current secure session on this device.</p>
                                    </div>
                                    <Button onClick={() => logout()} variant="destructive" className="h-10 px-6 rounded-lg font-semibold text-xs bg-rose-600 hover:bg-rose-700 shadow-sm">
                                        <LogOut size={16} className="mr-2" /> Sign Out
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="rounded-2xl border-emerald-100 dark:border-emerald-500/20 shadow-sm bg-emerald-50/50 dark:bg-emerald-500/5 overflow-hidden">
                                <CardHeader className="px-6 py-5 bg-emerald-50/80 dark:bg-emerald-500/10 border-b border-emerald-100/50 dark:border-emerald-500/20">
                                    <CardTitle className="text-lg font-bold text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
                                        <School className="text-emerald-600 dark:text-emerald-400" size={18} /> Linked Academy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-500 dark:text-emerald-400/70 uppercase tracking-wider mb-1">Institution</p>
                                            <p className="text-base font-bold text-emerald-950 dark:text-emerald-100">{profile?.school?.name || 'Qefas Hub Academy'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-emerald-500 dark:text-emerald-400/70 uppercase tracking-wider mb-1">School Code</p>
                                            <p className="text-base font-bold text-emerald-950 dark:text-emerald-100">{profile?.school?.schoolCode || 'SH-2024'}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full rounded-lg h-10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-semibold text-xs">
                                        View Institution
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="focus-visible:outline-none">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                                <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Lock className="text-emerald-500" size={18} /> Password
                                    </CardTitle>
                                    <CardDescription>Manage your account password.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 gap-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Account Password</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Change your password to ensure account security.</p>
                                        </div>
                                        <ChangePasswordModal>
                                            <Button className="shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 h-10 shadow-sm">
                                                Change Password
                                            </Button>
                                        </ChangePasswordModal>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden relative">
                                <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                                    <CardTitle className="text-lg font-bold flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Shield className="text-emerald-500" size={18} /> Two-Factor Auth
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">Coming Soon</Badge>
                                    </CardTitle>
                                    <CardDescription>Extra layer of account security.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-5 opacity-60 pointer-events-none">
                                    <div className="flex items-center justify-between p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Require 2FA</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Ask for a code on your phone when signing in.</p>
                                        </div>
                                        <Switch checked={false} disabled />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Authentication Method</Label>
                                        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <Globe size={16} className="text-emerald-500" />
                                            {profile?.authProvider || 'Google Account'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <DeviceSessions />
                    </div>
                </TabsContent>

                {/* Display Preferences */}
                <TabsContent value="preferences" className="focus-visible:outline-none">
                    <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                        <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Palette className="text-emerald-500" size={18} /> Visual & Regional
                            </CardTitle>
                            <CardDescription>Customize how the dashboard looks and feels.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                        <Eye size={16} className="text-slate-400" /> Interface Theme
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                        {['light', 'dark', 'system'].map((t) => (
                                            <button 
                                                key={t}
                                                onClick={() => {
                                                    setTheme(t);
                                                    setSettings({...settings, theme: t});
                                                }}
                                                className={cn(
                                                    "h-9 rounded-lg text-[11px] font-semibold capitalize transition-all",
                                                    currentTheme === t 
                                                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700" 
                                                        : "text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 opacity-60 pointer-events-none">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                            <Languages size={16} className="text-slate-400" /> Default Language
                                        </Label>
                                        <Badge variant="outline" className="text-[9px] uppercase font-semibold text-slate-500">Coming Soon</Badge>
                                    </div>
                                    <div className="relative">
                                        <Input value="English (US)" disabled className="h-10 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 font-medium" />
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-3 opacity-60 pointer-events-none">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                            <Clock size={16} className="text-slate-400" /> Academic Timezone
                                        </Label>
                                        <Badge variant="outline" className="text-[9px] uppercase font-semibold text-slate-500">Coming Soon</Badge>
                                    </div>
                                    <div className="relative">
                                        <Input value="UTC +0:00 (London)" disabled className="h-10 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 font-medium" />
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
