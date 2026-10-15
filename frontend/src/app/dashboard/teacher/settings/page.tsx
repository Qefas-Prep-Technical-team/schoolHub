'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Settings, 
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTeacherProfile, useTeacherSettings, useUpdateTeacherSettings } from '@/lib/api/hooks/useTeacher';
import { cn } from '@/lib/utils';
import { useLogoutMutation } from '@/app/(auth)/login/services/use-auth-mutations';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal';
import DeviceSessions from '@/components/DeviceSessions';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import DeactivateAccountSection from '@/components/auth/DeactivateAccountSection';
import { useQueryClient } from '@tanstack/react-query';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

interface TeacherProfileData {
    id?: string;
    name?: string;
    email?: string;
    teacherCode?: string;
    profileImage?: string;
    isTwoFactorEnabled?: boolean;
    twoFactorEnabled?: boolean;
    authProvider?: string;
    school?: {
        id?: string;
        name?: string;
        schoolCode?: string;
    };
}

export default function TeacherSettingsPage() {
    const router = useRouter();
    const { theme: currentTheme, setTheme } = useTheme();
    const { data: rawProfile, isLoading: isProfileLoading } = useTeacherProfile();
    const profile = rawProfile as TeacherProfileData | undefined;
    const { data: backendSettings, isLoading: isSettingsLoading } = useTeacherSettings();
    const updateSettings = useUpdateTeacherSettings();
    const { mutate: logout } = useLogoutMutation();
    const queryClient = useQueryClient();

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

    const [activeTab, setActiveTab] = useState<string>("account");
    
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab) setActiveTab(tab);
    }, []);

    const isLoading = isProfileLoading || isSettingsLoading;

    if (isLoading) {
        return (
            <div className="p-3.5 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-black font-sans space-y-6 md:space-y-8 animate-pulse">
                {/* Page Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-zinc-800">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 bg-slate-200 dark:bg-zinc-900 rounded-lg" />
                        <Skeleton className="h-4 w-72 bg-slate-200 dark:bg-zinc-900 rounded" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-36 bg-slate-200 dark:bg-zinc-900 rounded-xl" />
                        <Skeleton className="h-10 w-40 bg-slate-200 dark:bg-zinc-900 rounded-xl" />
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <Skeleton className="h-11 w-full max-w-md bg-slate-200 dark:bg-zinc-900 rounded-xl" />

                {/* Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                    <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                        {/* Educator Identity Card Skeleton */}
                        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden">
                            <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 space-y-2">
                                <Skeleton className="h-6 w-40 bg-slate-200 dark:bg-zinc-900 rounded" />
                                <Skeleton className="h-4 w-60 bg-slate-200 dark:bg-zinc-900 rounded" />
                            </CardHeader>
                            <CardContent className="p-5 sm:p-6 space-y-6">
                                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
                                    <Skeleton className="h-16 w-16 rounded-2xl bg-slate-200 dark:bg-zinc-900" />
                                    <div className="space-y-2 text-center sm:text-left">
                                        <Skeleton className="h-5 w-36 bg-slate-200 dark:bg-zinc-900 rounded mx-auto sm:mx-0" />
                                        <Skeleton className="h-4 w-28 bg-slate-200 dark:bg-zinc-900 rounded mx-auto sm:mx-0" />
                                    </div>
                                    <Skeleton className="h-10 w-28 bg-slate-200 dark:bg-zinc-900 rounded-xl sm:ml-auto" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-zinc-900 rounded" />
                                        <Skeleton className="h-11 w-full bg-slate-200 dark:bg-zinc-900 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-zinc-900 rounded" />
                                        <Skeleton className="h-11 w-full bg-slate-200 dark:bg-zinc-900 rounded-xl" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Logout Card Skeleton */}
                        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden">
                            <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-zinc-900 rounded" />
                                    <Skeleton className="h-4 w-60 bg-slate-200 dark:bg-zinc-900 rounded" />
                                </div>
                                <Skeleton className="h-10 w-32 bg-slate-200 dark:bg-zinc-900 rounded-xl" />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-5 sm:space-y-6">
                        {/* Linked Academy Card Skeleton */}
                        <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-black shadow-sm overflow-hidden">
                            <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800">
                                <Skeleton className="h-6 w-40 bg-slate-200 dark:bg-zinc-900 rounded" />
                            </CardHeader>
                            <CardContent className="p-5 sm:p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-zinc-900 rounded" />
                                        <Skeleton className="h-5 w-40 bg-slate-200 dark:bg-zinc-900 rounded" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-zinc-900 rounded" />
                                        <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-zinc-900 rounded" />
                                    </div>
                                </div>
                                <Skeleton className="h-11 w-full bg-slate-200 dark:bg-zinc-900 rounded-xl" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    const initials = (profile?.name || 'T').split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <div className="p-3.5 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-black font-sans space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-4 border-b border-slate-200/80 dark:border-zinc-800">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                            <Settings className="text-emerald-500 h-6 w-6 sm:h-7 sm:w-7" />
                            <span>Settings</span>
                        </h1>
                        <HeaderTooltip 
                            content="System configuration and educator account governance. Manage your profile identity, active multi-factor security credentials, connected devices, and interface display preferences."
                        />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
                        Control your account preferences, security credentials, and system configuration.
                    </p>
                </div>
                
                {/* Header Actions */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={() => window.open('/onboarding?revisit=true', '_blank')}
                        className="h-11 sm:h-10 px-4 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-all border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 flex-1 sm:flex-initial"
                    >
                        Revisit Onboarding
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={updateSettings.isPending}
                        className="h-11 sm:h-10 px-5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                    >
                        {updateSettings.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={15} />}
                        <span>Save Preferences</span>
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5 sm:space-y-6">
                <TabsList className="bg-slate-100 dark:bg-zinc-900 rounded-xl p-1 w-full max-w-md grid grid-cols-3 h-auto">
                    <TabsTrigger value="account" className="rounded-lg h-10 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs transition-all">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <User size={15} /> <span>Account</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg h-10 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs transition-all">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <Shield size={15} /> <span>Security</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="rounded-lg h-10 text-xs sm:text-sm font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs transition-all">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            <Palette size={15} /> <span>Display</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                {/* Account Settings */}
                <TabsContent value="account" className="space-y-5 sm:space-y-6 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                            {/* Educator Identity Card */}
                            <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-black overflow-hidden">
                                <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                                <Fingerprint className="text-emerald-500" size={18} /> Educator Identity
                                            </CardTitle>
                                            <HeaderTooltip 
                                                content="Your primary institutional credential and verification profile registered with the school portal. Keep your personal and contact details up-to-date."
                                            />
                                        </div>
                                    </div>
                                    <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">Manage your primary account identity and contact data.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                                        <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center text-xl font-bold text-emerald-600 dark:text-emerald-400 overflow-hidden shrink-0">
                                            {profile?.profileImage ? (
                                                <Image 
                                                    src={profile.profileImage} 
                                                    alt={profile.name || 'Educator Avatar'} 
                                                    width={64} 
                                                    height={64} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                initials
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-bold text-slate-900 dark:text-white">{profile?.name || 'Teacher'}</p>
                                            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{profile?.teacherCode || 'TEACHER'} • Educator</p>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            className="rounded-xl h-10 sm:h-9 px-4 text-xs font-semibold border-slate-200 dark:border-zinc-800 w-full sm:w-auto sm:ml-auto" 
                                            onClick={() => router.push('/dashboard/teacher/profile')}
                                        >
                                            Edit Profile
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Display Name</Label>
                                            <Input value={profile?.name || ''} disabled className="h-11 sm:h-10 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-zinc-400" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Institutional Email</Label>
                                            <Input value={profile?.email || ''} disabled className="h-11 sm:h-10 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border-slate-200/80 dark:border-zinc-800 text-slate-500 dark:text-zinc-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Logout Card */}
                            <Card className="rounded-2xl border-rose-100 dark:border-rose-900/30 shadow-sm bg-rose-50/50 dark:bg-rose-950/20 overflow-hidden">
                                <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-bold text-rose-900 dark:text-rose-400">Logout Session</h3>
                                        <p className="text-xs text-rose-700 dark:text-rose-300/70">Terminate your current secure session on this device.</p>
                                    </div>
                                    <Button onClick={() => logout()} variant="destructive" className="h-11 sm:h-10 px-5 rounded-xl font-semibold text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 shadow-sm w-full sm:w-auto">
                                        <LogOut size={15} className="mr-2" /> Sign Out
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Linked Academy Card */}
                        <div className="space-y-5 sm:space-y-6">
                            <Card className="rounded-2xl border-emerald-200/70 dark:border-emerald-500/20 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/10 overflow-hidden">
                                <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 bg-emerald-100/50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-500/20">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                                            <School className="text-emerald-600 dark:text-emerald-400" size={18} /> Linked Academy
                                        </CardTitle>
                                        <HeaderTooltip 
                                            content="The primary educational institution to which your teacher account is bound. All your courses, rosters, and administrative links stem from this school affiliation."
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                                    <div className="space-y-3.5">
                                        <div>
                                            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Institution</p>
                                            <p className="text-base font-bold text-emerald-950 dark:text-emerald-100">{profile?.school?.name || 'Qefas Hub Academy'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">School Code</p>
                                            <p className="text-base font-bold text-emerald-950 dark:text-emerald-100">{profile?.school?.schoolCode || 'SH-2024'}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        className="w-full rounded-xl h-11 sm:h-10 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-semibold text-xs sm:text-sm"
                                        onClick={() => router.push('/dashboard/teacher/school-profile')}
                                    >
                                        View Institution
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-5 sm:space-y-6 focus-visible:outline-none">
                    <div className="space-y-5 sm:space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                            {/* Password Card */}
                            <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-black overflow-hidden">
                                <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                            <Lock className="text-emerald-500" size={18} /> Password
                                        </CardTitle>
                                        <HeaderTooltip 
                                            content="Enforce strong account authentication. Regularly updating your password prevents unauthorized access to student records and grading registries."
                                        />
                                    </div>
                                    <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">Manage and update your account password.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 gap-4">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Account Password</h4>
                                            <p className="text-xs text-slate-500 dark:text-zinc-400">Change your password to maintain rigorous account security.</p>
                                        </div>
                                        <ChangePasswordModal>
                                            <Button className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-5 h-11 sm:h-10 shadow-sm w-full sm:w-auto">
                                                Change Password
                                            </Button>
                                        </ChangePasswordModal>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Two-Factor Auth Card */}
                            <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-black overflow-hidden relative">
                                <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                            <Shield className="text-emerald-500" size={18} /> Two-Factor Authentication
                                        </CardTitle>
                                        <HeaderTooltip 
                                            content="Adds a critical secondary layer of protection using time-based one-time passwords (TOTP) from an authenticator app such as Google Authenticator."
                                        />
                                    </div>
                                    <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">Extra layer of protection for academic logs.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-5 sm:p-6 space-y-5">
                                    <TwoFactorSetup 
                                        isTwoFactorEnabled={profile?.isTwoFactorEnabled || profile?.twoFactorEnabled || false} 
                                        onUpdate={() => {
                                            queryClient.invalidateQueries({ queryKey: ['teachers', 'profile'] });
                                        }} 
                                    />
                                    <div className="space-y-1.5 opacity-70">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-400">Primary Authentication Method</Label>
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-xs sm:text-sm font-medium text-slate-700 dark:text-zinc-300">
                                            <Globe size={16} className="text-emerald-500 shrink-0" />
                                            <span>{profile?.authProvider || 'Email & Password / Institutional SSO'}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Active Sessions */}
                        <DeviceSessions />

                        {/* Account Deactivation / Danger Zone */}
                        <DeactivateAccountSection userRole="teacher" />
                    </div>
                </TabsContent>

                {/* Display Preferences */}
                <TabsContent value="preferences" className="space-y-5 sm:space-y-6 focus-visible:outline-none">
                    <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-black overflow-hidden">
                        <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                    <Palette className="text-emerald-500" size={18} /> Visual & Regional Preferences
                                </CardTitle>
                                <HeaderTooltip 
                                    content="Customize your visual working environment. Choose light mode for bright settings, dark mode for low-light environments, or sync automatically with your system theme."
                                />
                            </div>
                            <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">Customize how the educator dashboard displays and behaves.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {/* Interface Theme */}
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300 flex items-center gap-2">
                                        <Eye size={16} className="text-emerald-500" /> Interface Theme
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                                        {['light', 'dark', 'system'].map((t) => (
                                            <button 
                                                key={t}
                                                type="button"
                                                onClick={() => {
                                                    setTheme(t);
                                                    setSettings({...settings, theme: t});
                                                }}
                                                className={cn(
                                                    "h-10 rounded-lg text-xs font-semibold capitalize transition-all focus:outline-none",
                                                    currentTheme === t 
                                                        ? "bg-white dark:bg-black text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-zinc-700 font-bold" 
                                                        : "text-slate-500 dark:text-zinc-400 hover:bg-slate-200/50 dark:hover:bg-zinc-800/50"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Default Language */}
                                <div className="space-y-3 opacity-60">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300 flex items-center gap-2">
                                            <Languages size={16} className="text-emerald-500" /> Default Language
                                        </Label>
                                        <Badge variant="outline" className="text-[9px] uppercase font-semibold text-slate-500 border-slate-300 dark:border-zinc-700">Coming Soon</Badge>
                                    </div>
                                    <div className="relative">
                                        <Input value="English (US)" disabled className="h-11 sm:h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 font-medium" />
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    </div>
                                </div>

                                {/* Academic Timezone */}
                                <div className="space-y-3 opacity-60">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300 flex items-center gap-2">
                                            <Clock size={16} className="text-emerald-500" /> Academic Timezone
                                        </Label>
                                        <Badge variant="outline" className="text-[9px] uppercase font-semibold text-slate-500 border-slate-300 dark:border-zinc-700">Coming Soon</Badge>
                                    </div>
                                    <div className="relative">
                                        <Input value="UTC +0:00 (London / West Africa)" disabled className="h-11 sm:h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 font-medium" />
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
