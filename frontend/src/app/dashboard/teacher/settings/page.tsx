'use client';

import { useState } from 'react';
import { 
    Settings, 
    Bell, 
    Shield, 
    User, 
    Palette, 
    Smartphone, 
    Mail, 
    Lock, 
    Globe, 
    Eye,
    CheckCircle2,
    Loader2,
    Save,
    ChevronDown,
    School,
    LogOut,
    Languages,
    Clock
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
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { teacherService } from '@/lib/api/services/teacherService';
import { toast } from 'react-toastify';

export default function TeacherSettingsPage() {
    const { theme: currentTheme, setTheme } = useTheme();
    const { data: profile, isLoading: isProfileLoading } = useTeacherProfile();
    const { data: backendSettings, isLoading: isSettingsLoading } = useTeacherSettings();
    const updateSettings = useUpdateTeacherSettings();
    const { mutate: logout } = useLogoutMutation();

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const changePasswordMutation = useMutation({
        mutationFn: (data: any) => teacherService.updatePassword(data),
        onSuccess: () => {
            toast.success("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update password");
        }
    });

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all password fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        changePasswordMutation.mutate({ currentPassword, newPassword });
    };

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
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700 space-y-10 px-6 md:px-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Settings size={28} />
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white">Settings</h1>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-14 italic">Control Center & System Preferences</p>
                </div>
                
                <Button 
                    onClick={handleSave} 
                    disabled={updateSettings.isPending}
                    className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    {updateSettings.isPending ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                    Sync Preferences
                </Button>
            </div>

            <Tabs defaultValue="account" className="w-full space-y-10">
                <div className="bg-slate-100/50 dark:bg-slate-900/50 p-1.5 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 w-fit">
                    <TabsList className="bg-transparent gap-2 h-auto">
                        <TabsTrigger value="account" className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-lg transition-all">
                            <User size={16} className="mr-2" /> Account
                        </TabsTrigger>
                        <TabsTrigger value="security" className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-lg transition-all">
                            <Shield size={16} className="mr-2" /> Security
                        </TabsTrigger>
                        <TabsTrigger value="preferences" className="rounded-2xl h-12 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-lg transition-all">
                            <Palette size={16} className="mr-2" /> Display
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Account Settings */}
                <TabsContent value="account" className="space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="rounded-[2.5rem] md:rounded-[3rem] border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
                                <CardHeader className="p-8 md:p-10 pb-6">
                                    <CardTitle className="text-xl font-black italic uppercase flex items-center gap-3">
                                        <Fingerprint className="text-primary" /> Educator Profile
                                    </CardTitle>
                                    <CardDescription>Manage your primary account identity.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-8 md:p-10 pt-0 space-y-8">
                                    <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50">
                                        <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-lg overflow-hidden">
                                            {profile?.profileImage ? (
                                                <Image 
                                                    src={profile.profileImage} 
                                                    alt={profile.name} 
                                                    width={80} 
                                                    height={80} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                profile?.name?.charAt(0) || 'T'
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-black italic tracking-tight">{profile?.name}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{profile?.teacherCode} • Official Member</p>
                                        </div>
                                        <Button variant="outline" className="ml-auto rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest" onClick={() => window.location.href='/dashboard/teacher/profile'}>
                                            Edit
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Display Name</Label>
                                                <Input value={profile?.name} disabled className="h-14 rounded-2xl bg-slate-100/50 dark:bg-slate-900 border-none opacity-50" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Institutional Email</Label>
                                                <Input value={profile?.email} disabled className="h-14 rounded-2xl bg-slate-100/50 dark:bg-slate-900 border-none opacity-50" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] md:rounded-[3rem] border-none shadow-2xl overflow-hidden bg-slate-950 text-white">
                                <CardContent className="p-8 md:p-10 flex items-center justify-between gap-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black italic uppercase">Logout Session</h3>
                                        <p className="text-xs text-white/50 font-medium">Terminate your current secure session on this device.</p>
                                    </div>
                                    <Button onClick={() => logout()} variant="destructive" className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-900/40">
                                        <LogOut size={18} className="mr-2" /> Sign Out
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="rounded-[2.5rem] bg-indigo-600 text-white shadow-xl overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                                    <School size={120} />
                                </div>
                                <CardHeader className="relative z-10 p-8">
                                    <CardTitle className="text-lg font-black uppercase italic tracking-widest">Linked Academy</CardTitle>
                                </CardHeader>
                                <CardContent className="relative z-10 p-8 pt-0 space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black italic leading-tight">{profile?.school?.name || 'Qefas Hub Academy'}</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">{profile?.school?.schoolCode || 'SH-2024'}</p>
                                    </div>
                                    <Button variant="outline" className="w-full rounded-2xl h-12 bg-white/10 border-white/20 text-white hover:bg-white/20 font-black text-[10px] uppercase tracking-widest">
                                        View Institution
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>



                {/* Security Settings */}
                <TabsContent value="security" className="focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="rounded-[2.5rem] md:rounded-[3rem] border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-black italic uppercase flex items-center gap-3">
                                    <Lock className="text-rose-500" /> Password
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6">
                                <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Current Password</Label>
                                        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">New Password</Label>
                                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Confirm New Password</Label>
                                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-primary/20" />
                                    </div>
                                    <Button type="submit" disabled={changePasswordMutation.isPending} className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-rose-600 hover:bg-rose-700 text-white">
                                        {changePasswordMutation.isPending ? "Updating..." : "Update Credentials"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[2.5rem] md:rounded-[3rem] border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl relative">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-xl font-black italic uppercase flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Shield className="text-emerald-500" /> Two-Factor Auth
                                    </div>
                                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black text-emerald-500 bg-emerald-500/10 border-emerald-500/20">Coming Soon</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-0 space-y-6 opacity-60 pointer-events-none">
                                <div className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 space-y-4">
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 italic leading-relaxed">
                                        Extra layer of security. We&apos;ll ask for a code on your phone in addition to your password.
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Enable 2FA Protection</span>
                                        <Switch checked={false} disabled />
                                    </div>
                                </div>
                                <Separator className="bg-slate-200/50 dark:bg-slate-800/50" />
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authentication Method</p>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <Globe size={16} />
                                        </div>
                                        {profile?.authProvider || 'Google Account'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Display Preferences */}
                <TabsContent value="preferences" className="focus-visible:outline-none">
                    <Card className="rounded-[2.5rem] md:rounded-[3rem] border-slate-200/60 dark:border-slate-800/60 shadow-xl overflow-hidden bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
                        <CardHeader className="p-8 md:p-12">
                            <CardTitle className="text-2xl font-black italic uppercase flex items-center gap-4 tracking-tight">
                                <Palette className="text-primary" /> Visual & Regional
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 pt-0 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <Eye size={20} />
                                        </div>
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Interface Theme</Label>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['light', 'dark', 'system'].map((t) => (
                                            <button 
                                                key={t}
                                                onClick={() => {
                                                    setTheme(t);
                                                    setSettings({...settings, theme: t});
                                                }}
                                                className={cn(
                                                    "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    currentTheme === t 
                                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg" 
                                                        : "bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 opacity-60 pointer-events-none relative">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <Languages size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Default Language</Label>
                                            <Badge variant="outline" className="w-fit mt-1 text-[8px] uppercase tracking-widest font-black text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">Coming Soon</Badge>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <Input value="English (US)" disabled className="h-14 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border-none font-bold" />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    </div>
                                </div>

                                <div className="space-y-4 opacity-60 pointer-events-none relative">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                            <Clock size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">Academic Timezone</Label>
                                            <Badge variant="outline" className="w-fit mt-1 text-[8px] uppercase tracking-widest font-black text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">Coming Soon</Badge>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <Input value="UTC +0:00 (London)" disabled className="h-14 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border-none font-bold" />
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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

function SettingsToggle({ icon, title, description, checked, onCheckedChange }: { 
    icon: React.ReactNode, 
    title: string, 
    description: string, 
    checked: boolean,
    onCheckedChange: (val: boolean) => void 
}) {
    return (
        <div className="flex items-start justify-between p-6 md:p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 group hover:border-primary/20 transition-all">
            <div className="flex gap-4 md:gap-6">
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                    {icon}
                </div>
                <div className="space-y-1">
                    <h4 className="text-lg font-black italic tracking-tight">{title}</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-[240px]">{description}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-2" />
        </div>
    );
}

function Fingerprint({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("lucide lucide-fingerprint", className)}>
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.02-.3 3"/>
            <path d="M14 22a10 10 0 0 0-4-19.5"/>
            <path d="M18 8a6 6 0 0 0-12 0c0 .7 0 1.4.1 2.1"/>
            <path d="M22 10a10 10 0 0 0-1.7-5.3"/>
            <path d="M2 10c0-1.2.2-2.3.6-3.4"/>
            <path d="M6 18c.2 1 .4 1.9.8 2.8"/>
            <path d="M12 22c1.1 0 2.2-.2 3.3-.5"/>
            <path d="M7 15c.1-.4.1-.7.1-1.1"/>
            <path d="M12 14c1.1 0 2 .9 2 2"/>
            <path d="M14 11c0-1.1-.9-2-2-2s-2 .9-2 2"/>
        </svg>
    )
}
