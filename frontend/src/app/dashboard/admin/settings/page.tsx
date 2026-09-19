'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolSettings, useUpdateSchoolSettings, useSchoolLandingPage, useUpdateSchoolLandingPage } from '@/lib/api/hooks/useSchool';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { adminService } from '@/lib/api/services/adminService';
import {
    Settings,
    Lock,
    Palette,
    Database,
    Rocket,
    Save,
    AlertCircle,
    ShieldCheck,
    UserCheck,
    Paintbrush,
    UserCircle,
    Key,
    Fingerprint
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeviceSessions from '@/components/DeviceSessions';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import ImageUpload from '@/components/reusable/ImageUpload';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function SettingsPage() {
    const { user, updateUser } = useAuthStore();
    const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';

    const { data: sessionsResponse } = useSessions(schoolId);
    const dbSessions = sessionsResponse?.data || [];

    const { data: settings, isLoading: isSettingsLoading } = useSchoolSettings(schoolId);
    const updateMutation = useUpdateSchoolSettings();

    const { data: landingPageSettings, isLoading: isLandingPageLoading } = useSchoolLandingPage(schoolId);
    const updateLandingPageMutation = useUpdateSchoolLandingPage();

    const [localSettings, setLocalSettings] = useState<any>(null);
    const [localLandingPage, setLocalLandingPage] = useState<any>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [personalProfile, setPersonalProfile] = useState<any>({
        name: user?.name || '',
        gender: (user as any)?.gender || '',
        profileImage: (user as any)?.profileImage || '',
    });

    useEffect(() => {
        if (user) {
            setPersonalProfile({
                name: user.name || '',
                gender: (user as any).gender || '',
                profileImage: (user as any).profileImage || '',
            });
        }
    }, [user]);

    useEffect(() => {
        if (!user?.id) return;

        let isMounted = true;

        apiClient
            .get('/auth/me')
            .then(({ data }) => {
                if (!isMounted || !data?.success || !data?.data) return;

                updateUser({
                    ...data.data,
                    userType: user.userType ?? data.data.role,
                });
            })
            .catch(() => undefined);

        return () => {
            isMounted = false;
        };
    }, [user?.id, updateUser]);

    useEffect(() => {
        if (settings) {
            setLocalSettings({
                ...settings,
                themeColor: settings.themeColor || '#2563eb',
                defaultSession: settings.defaultSession || '',
                defaultTerm: settings.defaultTerm || '',
                enableEmailNotifications: settings.enableEmailNotifications ?? true,
                enablePushNotifications: settings.enablePushNotifications ?? true,
                enableMaintenanceMode: settings.enableMaintenanceMode ?? false,
                allowTeacherDigitalSignature: settings.allowTeacherDigitalSignature ?? false,
                lockSettings: settings.lockSettings ?? false,
            });
        }
    }, [settings]);

    useEffect(() => {
        if (landingPageSettings) {
            setLocalLandingPage({
                heroTitle: landingPageSettings.heroTitle || '',
                heroSubtitle: landingPageSettings.heroSubtitle || '',
                aboutTitle: landingPageSettings.aboutTitle || '',
                aboutText: landingPageSettings.aboutText || '',
                primaryColor: landingPageSettings.primaryColor || '#3b82f6',
                features: Array.isArray(landingPageSettings.features) && landingPageSettings.features.length > 0
                    ? landingPageSettings.features
                    : [
                        { title: 'Expert Faculty', description: 'Learn from highly qualified educators.', icon: 'Users' },
                        { title: 'Modern Curriculum', description: 'An innovative, dynamic curriculum.', icon: 'BookOpen' },
                        { title: 'Holistic Development', description: 'Strong focus on co-curricular activities.', icon: 'Award' }
                    ],
                testimonials: Array.isArray(landingPageSettings.testimonials) && landingPageSettings.testimonials.length > 0
                    ? landingPageSettings.testimonials
                    : [
                        { name: 'Sarah Jenkins', role: 'Parent', text: 'Choosing this school was the best decision.' },
                        { name: 'David Cole', role: 'Alumni', text: 'The skills I gained laid the foundation.' }
                    ]
            });
        }
    }, [landingPageSettings]);

    const handleToggle = (field: string, checked: boolean) => {
        setLocalSettings((prev: any) => prev ? ({ ...prev, [field]: checked }) : null);
        setHasChanges(true);
    };

    const handleChange = (field: string, value: any) => {
        setLocalSettings((prev: any) => prev ? ({ ...prev, [field]: value }) : null);
        setHasChanges(true);
    };

    const handleLandingPageChange = (field: string, value: any) => {
        setLocalLandingPage((prev: any) => prev ? ({ ...prev, [field]: value }) : null);
        setHasChanges(true);
    };

    const handleFeatureChange = (index: number, field: string, value: any) => {
        setLocalLandingPage((prev: any) => {
            if (!prev) return null;
            const updatedFeatures = [...prev.features];
            updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
            return { ...prev, features: updatedFeatures };
        });
        setHasChanges(true);
    };

    const handleTestimonialChange = (index: number, field: string, value: any) => {
        setLocalLandingPage((prev: any) => {
            if (!prev) return null;
            const updatedTestimonials = [...prev.testimonials];
            updatedTestimonials[index] = { ...updatedTestimonials[index], [field]: value };
            return { ...prev, testimonials: updatedTestimonials };
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            let savedAny = false;

            // Check if profile changed
            if (personalProfile.name !== user?.name || personalProfile.gender !== (user as any)?.gender || personalProfile.profileImage !== (user as any)?.profileImage) {
                setIsSavingProfile(true);
                await adminService.updateProfile(personalProfile);
                updateUser({ name: personalProfile.name, gender: personalProfile.gender, profileImage: personalProfile.profileImage } as any);
                savedAny = true;
            }

            // Check if settings changed
            if (localSettings && localSettings !== settings) {
                const { id, schoolId: sid, createdAt, updatedAt, ...cleanData } = localSettings;
                await updateMutation.mutateAsync({ schoolId, data: cleanData });
                savedAny = true;
            }

            // Check if landing page changed
            if (localLandingPage && localLandingPage !== landingPageSettings) {
                await updateLandingPageMutation.mutateAsync({ schoolId, data: localLandingPage });
                savedAny = true;
            }

            if (savedAny) {
                toast.success('Settings updated successfully');
                setHasChanges(false);
            }
        } catch (error: any) {
            console.error('Update Error:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to update settings');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const isLoading = isSettingsLoading || isLandingPageLoading || !localSettings || !localLandingPage;

    if (isLoading) {
        return (
            <div className="w-[80%] max-w-none mx-auto py-8 space-y-6 md:space-y-8 px-4 md:px-8">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        <Skeleton className="h-4 w-72 bg-slate-100 dark:bg-slate-800/50 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>

                {/* Tabs Skeleton */}
                <div className="space-y-6">
                    <Skeleton className="h-12 w-full max-w-3xl bg-slate-100 dark:bg-slate-800/50 rounded-lg" />

                    {/* Content Skeleton */}
                    <div className="space-y-6">
                        <Skeleton className="h-[300px] w-full bg-slate-100 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800" />
                        <Skeleton className="h-[200px] w-full bg-slate-100 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800" />
                    </div>
                </div>
            </div>
        );
    }

    const isPending = updateMutation.isPending || updateLandingPageMutation.isPending || isSavingProfile;
    const initials = (personalProfile?.name || 'A').split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <div className="w-[80%] max-w-none mx-auto py-8 animate-in fade-in duration-500 space-y-6 md:space-y-8 px-4 md:px-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Settings className="text-blue-500" size={28} />
                        Settings
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Manage your school&apos;s digital infrastructure and preferences.
                    </p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isPending || !hasChanges}
                    className="h-10 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold shadow-sm transition-all"
                >
                    {!isPending && <Save size={16} className="mr-2" />}
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full space-y-6">
                <TabsList className="bg-slate-50 dark:bg-slate-900 rounded-lg p-1 w-full max-w-3xl grid grid-cols-5 h-auto">
                    <TabsTrigger value="general" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Database size={14} /> <span className="hidden sm:inline">General</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Palette size={14} /> <span className="hidden sm:inline">Appearance</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                        <div className="flex flex-row items-center justify-center gap-2">
                            <ShieldCheck size={14} /> <span className="hidden sm:inline">Security</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                        <div className="flex flex-row items-center justify-center gap-2">
                            <UserCircle size={14} /> <span className="hidden sm:inline">Profile</span>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="landing" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                        <div className="flex flex-row items-center justify-center gap-2">
                            <Rocket size={14} /> <span className="hidden sm:inline">Landing Page</span>
                        </div>
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6 focus-visible:outline-none">
                    <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                        <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Rocket className="text-blue-500" size={18} /> Feature Management
                            </CardTitle>
                            <CardDescription>Control feature availability across dashboards.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <SettingItem
                                title="Coming Soon Overlay"
                                description="Enable a 'Coming Soon' placeholder for features currently in development."
                                icon={Rocket}
                                checked={localSettings.showComingSoon ?? false}
                                onCheckedChange={(val: boolean) => handleToggle('showComingSoon', val)}
                            />

                            <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex gap-4">
                                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Development Mode Warning</p>
                                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mt-1">
                                        Enabling the Coming Soon overlay will globally restrict access to beta features for all students and staff members.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                        <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Database className="text-blue-500" size={18} /> Academic Configuration
                            </CardTitle>
                            <CardDescription>Default settings for the current academic cycle.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Default Session</Label>
                                    <select
                                        className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        value={localSettings.defaultSession || ''}
                                        onChange={(e) => handleChange('defaultSession', e.target.value)}
                                    >
                                        <option value="">Select Session</option>
                                        {dbSessions.map((session: any) => (
                                            <option key={session.id} value={session.name}>
                                                {session.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Default Term</Label>
                                    <select
                                        className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        value={localSettings.defaultTerm || ''}
                                        onChange={(e) => handleChange('defaultTerm', e.target.value)}
                                    >
                                        <option value="">Select Term</option>
                                        <option value="First Term">First Term</option>
                                        <option value="Second Term">Second Term</option>
                                        <option value="Third Term">Third Term</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-6 focus-visible:outline-none">
                    <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                        <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Paintbrush className="text-blue-500" size={18} /> Theme Settings
                            </CardTitle>
                            <CardDescription>Personalize your institution&apos;s digital atmosphere.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Institutional Color Presets</Label>
                                <div className="flex flex-wrap gap-4">
                                    {[
                                        { name: 'Institutional Blue', hex: '#2563eb' },
                                        { name: 'Emerald Growth', hex: '#10b981' },
                                        { name: 'Academic Slate', hex: '#475569' },
                                        { name: 'Rose Excellence', hex: '#e11d48' },
                                    ].map((preset) => (
                                        <button
                                            key={preset.hex}
                                            onClick={() => handleChange('themeColor', preset.hex)}
                                            className={cn(
                                                "h-10 w-10 rounded-lg transition-all hover:scale-110 active:scale-95 border-2",
                                                localSettings.themeColor === preset.hex ? "border-slate-900 dark:border-white shadow-md scale-110" : "border-transparent"
                                            )}
                                            style={{ backgroundColor: preset.hex }}
                                            title={preset.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="space-y-4 flex-1">
                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Custom System Color (Hex)</Label>
                                    <div className="flex gap-3 items-center">
                                        <div className="relative">
                                            <Input
                                                type="color"
                                                value={localSettings.themeColor || '#2563eb'}
                                                onChange={(e) => handleChange('themeColor', e.target.value)}
                                                className="w-12 h-10 p-1 rounded-lg cursor-copy border border-slate-200 dark:border-slate-800 bg-transparent relative z-10"
                                            />
                                        </div>
                                        <Input
                                            type="text"
                                            value={localSettings.themeColor || ''}
                                            onChange={(e) => handleChange('themeColor', e.target.value)}
                                            placeholder="#000000"
                                            className="h-10 rounded-lg font-mono text-sm border-slate-200 dark:border-slate-800 px-3 uppercase w-32"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Select a preset or enter a custom hex code. This primary color will be used across all user dashboards.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6 focus-visible:outline-none">
                    <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                        <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck className="text-blue-500" size={18} /> Institutional Security
                            </CardTitle>
                            <CardDescription>Global safeguards and administrative controls.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <SettingItem
                                title="Maintenance Mode"
                                description="Restrict access to all users except administrators during system upgrades."
                                icon={Settings}
                                checked={localSettings.enableMaintenanceMode ?? false}
                                onCheckedChange={(val: boolean) => handleToggle('enableMaintenanceMode', val)}
                                comingSoon={true}
                            />
                            <SettingItem
                                title="Teacher Digital Signatures"
                                description="Enable cryptographic signing for report cards and official documents."
                                icon={UserCheck}
                                checked={localSettings.allowTeacherDigitalSignature ?? false}
                                onCheckedChange={(val: boolean) => handleToggle('allowTeacherDigitalSignature', val)}
                                comingSoon={true}
                            />
                            <SettingItem
                                title="Lock Institutional Settings"
                                description="Prevent modifications to these settings by non-owner administrators."
                                icon={Lock}
                                checked={localSettings.lockSettings ?? false}
                                onCheckedChange={(val: boolean) => handleToggle('lockSettings', val)}
                                comingSoon={true}
                            />
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                        <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Key className="text-blue-500" size={18} /> Password & Authentication
                            </CardTitle>
                            <CardDescription>Manage your login credentials.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Account Password</h4>
                                    <p className="text-xs font-medium text-slate-500">Change your password to ensure account security.</p>
                                </div>
                                <ChangePasswordModal>
                                    <Button className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 h-9 shadow-sm">
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
                                    <ShieldCheck className="text-blue-500" size={18} /> Two-Factor Auth
                                </div>
                            </CardTitle>
                            <CardDescription>Extra layer of account security.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <TwoFactorSetup
                                isTwoFactorEnabled={user?.isTwoFactorEnabled ?? user?.require2FA ?? false}
                                onUpdate={(enabled) => updateUser({ require2FA: enabled, isTwoFactorEnabled: enabled })}
                            />
                        </CardContent>
                    </Card>

                    <DeviceSessions />
                </TabsContent>

                {/* Profile Settings */}
                <TabsContent value="profile" className="space-y-6 focus-visible:outline-none">
                    <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                        <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <UserCircle className="text-blue-500" size={18} /> Personal Profile
                            </CardTitle>
                            <CardDescription>Manage your personal account details.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="flex items-center gap-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                <div className="h-16 w-16 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-400 overflow-hidden">
                                    {personalProfile?.profileImage ? (
                                        <Image
                                            src={personalProfile.profileImage}
                                            alt={personalProfile.name}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        initials
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Admin Avatar</h3>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                                        Upload a professional picture. It will appear on your top navigation bar.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</Label>
                                    <Input
                                        value={personalProfile.name}
                                        onChange={(e) => {
                                            setPersonalProfile((p: any) => ({ ...p, name: e.target.value }));
                                            setHasChanges(true);
                                        }}
                                        placeholder="Your Full Name"
                                        className="h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Gender</Label>
                                    <select
                                        className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                        value={personalProfile.gender}
                                        onChange={(e) => {
                                            setPersonalProfile((p: any) => ({ ...p, gender: e.target.value }));
                                            setHasChanges(true);
                                        }}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <ImageUpload
                                    label="Profile Picture"
                                    description="Update your photo by uploading a new one below. Changes save automatically."
                                    value={personalProfile.profileImage}
                                    onChange={async (url) => {
                                        setPersonalProfile((p: any) => ({ ...p, profileImage: url }));

                                        try {
                                            const newProfile = { ...personalProfile, profileImage: url };
                                            await adminService.updateProfile(newProfile);
                                            updateUser({ name: newProfile.name, gender: newProfile.gender, profileImage: url } as any);
                                            toast.success(url ? 'Profile picture updated successfully' : 'Profile picture removed successfully');
                                        } catch (error) {
                                            toast.error('Failed to update profile picture');
                                        }
                                    }}
                                    aspectRatio="square"
                                />
                            </div>

                            <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex gap-4">
                                <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Security & Email</p>
                                    <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mt-1">
                                        To change your login email or password, please use the security verification flow available in the Security tab.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Landing Page Settings */}
                <TabsContent value="landing" className="space-y-6 focus-visible:outline-none">
                    <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                        <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Rocket className="text-blue-500" size={18} /> Landing Page Content
                            </CardTitle>
                            <CardDescription>Configure your public school landing page design and content.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Hero Section</h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Title</Label>
                                        <Input
                                            value={localLandingPage?.heroTitle || ''}
                                            onChange={(e) => handleLandingPageChange('heroTitle', e.target.value)}
                                            placeholder="Welcome to Greenwood Academy"
                                            className="h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hero Subtitle</Label>
                                        <Input
                                            value={localLandingPage?.heroSubtitle || ''}
                                            onChange={(e) => handleLandingPageChange('heroSubtitle', e.target.value)}
                                            placeholder="Nurturing Minds, Shaping the Future of Education."
                                            className="h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">About Section</h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">About Title</Label>
                                        <Input
                                            value={localLandingPage?.aboutTitle || ''}
                                            onChange={(e) => handleLandingPageChange('aboutTitle', e.target.value)}
                                            placeholder="Our Vision & Mission"
                                            className="h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">About Text</Label>
                                        <textarea
                                            value={localLandingPage?.aboutText || ''}
                                            onChange={(e) => handleLandingPageChange('aboutText', e.target.value)}
                                            placeholder="Describe your school vision and mission..."
                                            rows={4}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">School Features / Highlights</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {localLandingPage?.features?.map((feat: any, index: number) => (
                                        <div key={index} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
                                            <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">Feature {index + 1}</h5>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</Label>
                                                <Input
                                                    value={feat.title || ''}
                                                    onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                                                    placeholder="Feature Title"
                                                    className="h-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</Label>
                                                <textarea
                                                    value={feat.description || ''}
                                                    onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                                                    placeholder="Feature description..."
                                                    rows={3}
                                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs font-medium focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Parent / Alumni Testimonials</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {localLandingPage?.testimonials?.map((t: any, index: number) => (
                                        <div key={index} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
                                            <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">Testimonial {index + 1}</h5>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</Label>
                                                    <Input
                                                        value={t.name || ''}
                                                        onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                                                        placeholder="Name"
                                                        className="h-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</Label>
                                                    <Input
                                                        value={t.role || ''}
                                                        onChange={(e) => handleTestimonialChange(index, 'role', e.target.value)}
                                                        placeholder="Role (e.g., Parent)"
                                                        className="h-9 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Testimonial Text</Label>
                                                <textarea
                                                    value={t.text || ''}
                                                    onChange={(e) => handleTestimonialChange(index, 'text', e.target.value)}
                                                    placeholder="Testimonial text..."
                                                    rows={3}
                                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs font-medium focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SettingItem({ title, description, icon: Icon, checked, onCheckedChange, comingSoon }: any) {
    return (
        <div className={cn("flex items-center justify-between gap-6", comingSoon && "opacity-60 pointer-events-none")}>
            <div className="flex gap-4">
                <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <Icon size={18} />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{title}</p>
                        {comingSoon && <Badge variant="outline" className="text-[9px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 py-0 px-1.5">Coming Soon</Badge>}
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-md">{description}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={comingSoon} />
        </div>
    );
}
