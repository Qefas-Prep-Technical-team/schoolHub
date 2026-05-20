'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolSettings, useUpdateSchoolSettings, useSchoolLandingPage, useUpdateSchoolLandingPage } from '@/lib/api/hooks/useSchool';
import { adminService } from '@/lib/api/services/adminService';
import { 
  Settings, 
  Bell, 
  Lock, 
  Palette, 
  Database, 
  Rocket,
  Save,
  RotateCcw,
  AlertCircle,
  Mail,
  Smartphone,
  ShieldCheck,
  UserCheck,
  Paintbrush,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  
  const { data: settings, isLoading } = useSchoolSettings(schoolId);
  const updateMutation = useUpdateSchoolSettings();

  const { data: landingPageSettings, isLoading: isLandingPageLoading } = useSchoolLandingPage(schoolId);
  const updateLandingPageMutation = useUpdateSchoolLandingPage();

  const [localSettings, setLocalSettings] = useState<any>(null);
  const [localLandingPage, setLocalLandingPage] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('General');
  const [personalProfile, setPersonalProfile] = useState<any>({
    name: user?.name || '',
    gender: (user as any)?.gender || '',
  });

  useEffect(() => {
    if (user) {
      setPersonalProfile({
        name: user.name || '',
        gender: (user as any).gender || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      // Ensure all fields have at least a default value to avoid uncontrolled input warnings
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
              { title: 'Expert Faculty', description: 'Learn from highly qualified educators who are passionate about teaching and mentoring.', icon: 'Users' },
              { title: 'Modern Curriculum', description: 'An innovative, dynamic curriculum tailored to meet global standards.', icon: 'BookOpen' },
              { title: 'Holistic Development', description: 'Strong focus on co-curricular activities and character building.', icon: 'Award' }
            ],
        testimonials: Array.isArray(landingPageSettings.testimonials) && landingPageSettings.testimonials.length > 0
          ? landingPageSettings.testimonials
          : [
              { name: 'Sarah Jenkins', role: 'Parent', text: 'Choosing this school was the best decision for my son. The individual attention is exceptional.' },
              { name: 'David Cole', role: 'Alumni', text: 'The skills and values I gained here laid the foundation for my career.' }
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
      if (activeTab === 'Profile') {
        await adminService.updateProfile(personalProfile);
        toast.success('Profile updated successfully');
        setHasChanges(false);
        return;
      }

      if (activeTab === 'Landing Page') {
        await updateLandingPageMutation.mutateAsync({
          schoolId,
          data: localLandingPage
        });
        toast.success('Landing page settings updated successfully');
        setHasChanges(false);
        return;
      }

      // Strip metadata fields that Prisma doesn't expect in an update
      const { id, schoolId: sid, createdAt, updatedAt, ...cleanData } = localSettings;

      await updateMutation.mutateAsync({
        schoolId,
        data: cleanData
      });
      toast.success('Settings updated successfully');
      setHasChanges(false);
    } catch (error: any) {
      console.error('Update Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update settings';
      toast.error(errorMessage);
    }
  };

  const resetSettings = () => {
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
              { title: 'Expert Faculty', description: 'Learn from highly qualified educators who are passionate about teaching and mentoring.', icon: 'Users' },
              { title: 'Modern Curriculum', description: 'An innovative, dynamic curriculum tailored to meet global standards.', icon: 'BookOpen' },
              { title: 'Holistic Development', description: 'Strong focus on co-curricular activities and character building.', icon: 'Award' }
            ],
        testimonials: Array.isArray(landingPageSettings.testimonials) && landingPageSettings.testimonials.length > 0
          ? landingPageSettings.testimonials
          : [
              { name: 'Sarah Jenkins', role: 'Parent', text: 'Choosing this school was the best decision for my son. The individual attention is exceptional.' },
              { name: 'David Cole', role: 'Alumni', text: 'The skills and values I gained here laid the foundation for my career.' }
            ]
      });
    }
    setHasChanges(false);
  };

  if (isLoading || isLandingPageLoading || !localSettings || !localLandingPage) {
    return (
        <div className="p-8 space-y-8">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-64 rounded-3xl" />
                <Skeleton className="h-64 rounded-3xl" />
            </div>
        </div>
    );
  }

  const tabs = [
    { label: 'General', icon: Database },
    { label: 'Appearance', icon: Palette },
    { label: 'Notifications', icon: Bell },
    { label: 'Security', icon: Lock },
    { label: 'Profile', icon: UserCircle },
    { label: 'Landing Page', icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 lg:p-12 max-w-6xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Settings className="text-primary" size={36} />
            Institutional Settings
          </h1>
          <p className="text-slate-500 font-medium">Manage your school&apos;s digital infrastructure and preferences.</p>
        </div>

        <AnimatePresence>
          {hasChanges && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3"
            >
              <Button 
                variant="outline" 
                onClick={resetSettings}
                className="rounded-xl border-slate-200 h-11"
              >
                <RotateCcw size={16} className="mr-2" /> Reset
              </Button>
              <Button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-11 px-8 font-black uppercase tracking-widest text-[10px]"
              >
                {updateMutation.isPending ? 'Saving...' : <><Save size={16} className="mr-2" /> Save Changes</>}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Navigation Sidebar */}
        <aside className="md:col-span-3 space-y-2">
            {tabs.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveTab(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all",
                    activeTab === item.label ? "bg-white dark:bg-slate-900 shadow-md text-primary" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                    <item.icon size={18} />
                    {item.label}
                </button>
            ))}
        </aside>

        {/* Settings Content */}
        <main className="md:col-span-9 space-y-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'General' && (
                        <div className="space-y-8">
                            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Rocket size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">Feature Management</h3>
                                        <p className="text-xs text-slate-500">Control feature availability across dashboards</p>
                                    </div>
                                </div>
                                <CardContent className="p-8 space-y-8">
                                    <SettingItem 
                                      title="Coming Soon Overlay"
                                      description="Enable a 'Coming Soon' placeholder for features currently in development."
                                      icon={Rocket}
                                      checked={localSettings.showComingSoon ?? false}
                                      onCheckedChange={(val: boolean) => handleToggle('showComingSoon', val)}
                                    />
                                    
                                    <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 flex gap-4">
                                        <AlertCircle className="text-amber-600 shrink-0" size={24} />
                                        <div>
                                            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Development Mode Warning</p>
                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                                Enabling the Coming Soon overlay will globally restrict access to beta features for all students and staff members.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900">
                                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-primary/50/10 text-primary flex items-center justify-center">
                                        <Database size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-lg">Academic Configuration</h3>
                                        <p className="text-xs text-slate-500">Default settings for the current academic cycle</p>
                                    </div>
                                </div>
                                <CardContent className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Session</Label>
                                            <select 
                                             className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 font-bold text-sm"
                                             value={localSettings.defaultSession || ''}
                                             onChange={(e) => handleChange('defaultSession', e.target.value)}
                                            >
                                                <option value="">Select Session</option>
                                                <option value="2023/2024">2023/2024</option>
                                                <option value="2024/2025">2024/2025</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Default Term</Label>
                                            <select 
                                              className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 font-bold text-sm"
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
                        </div>
                    )}

                    {activeTab === 'Appearance' && (
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                                    <Paintbrush size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Theme Settings</h3>
                                    <p className="text-xs text-slate-500">Personalize your institution&apos;s digital atmosphere</p>
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Institutional Color Presets</Label>
                                        <div className="flex flex-wrap gap-4">
                                            {[
                                                { name: 'Institutional Blue', hex: '#2563eb' },
                                                { name: 'Royal Blue', hex: '#2563eb' },
                                                { name: 'Royal Blue', hex: '#2563eb' },
                                                { name: 'Emerald Growth', hex: '#10b981' },
                                                { name: 'Academic Slate', hex: '#475569' },
                                                { name: 'Rose Excellence', hex: '#e11d48' },
                                            ].map((preset) => (
                                                <button
                                                    key={preset.hex}
                                                    onClick={() => handleChange('themeColor', preset.hex)}
                                                    className={cn(
                                                        "h-12 w-12 rounded-2xl transition-all hover:scale-110 active:scale-95 border-4",
                                                        localSettings.themeColor === preset.hex ? "border-white dark:border-slate-800 shadow-xl scale-110" : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: preset.hex }}
                                                    title={preset.name}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center pt-8 border-t border-slate-100 dark:border-white/5">
                                        <div className="space-y-4 flex-1">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Custom System Frequency (Hex)</Label>
                                            <div className="flex gap-4 items-center">
                                                <div className="relative">
                                                    <Input 
                                                        type="color" 
                                                        value={localSettings.themeColor || '#2563eb'} 
                                                        onChange={(e) => handleChange('themeColor', e.target.value)}
                                                        className="w-16 h-14 p-1 rounded-2xl cursor-copy border-none bg-transparent relative z-10"
                                                    />
                                                    <div className="absolute inset-0 rounded-2xl border-2 border-slate-200 dark:border-slate-800 pointer-events-none" />
                                                </div>
                                                <Input 
                                                    type="text" 
                                                    value={localSettings.themeColor || ''} 
                                                    onChange={(e) => handleChange('themeColor', e.target.value)}
                                                    placeholder="#000000"
                                                    className="h-14 rounded-[1.4rem] font-mono font-black border-slate-200 dark:border-white/10 text-lg uppercase tracking-widest px-6"
                                                />
                                            </div>
                                            <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed">
                                                Select a preset or enter a custom hex code. This primary frequency will be broadcast across all user dashboard interfaces.
                                            </p>
                                        </div>
                                        <div 
                                            className="h-40 w-40 rounded-[3rem] shadow-3xl border-[8px] border-white dark:border-slate-800 group relative overflow-hidden"
                                            style={{ backgroundColor: localSettings.themeColor || '#2563eb' }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Paintbrush className="text-white" size={32} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'Notifications' && (
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Communication Preferences</h3>
                                    <p className="text-xs text-slate-500">Configure how the platform interacts with stakeholders</p>
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-8">
                                <SettingItem 
                                    title="Email Notifications"
                                    description="Send automated emails for announcements, grading updates, and system alerts."
                                    icon={Mail}
                                    checked={localSettings.enableEmailNotifications ?? true}
                                    onCheckedChange={(val: boolean) => handleToggle('enableEmailNotifications', val)}
                                />
                                <SettingItem 
                                    title="Push Notifications"
                                    description="Deliver real-time alerts to mobile devices and browsers for urgent updates."
                                    icon={Smartphone}
                                    checked={localSettings.enablePushNotifications ?? true}
                                    onCheckedChange={(val: boolean) => handleToggle('enablePushNotifications', val)}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'Security' && (
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Institutional Security</h3>
                                    <p className="text-xs text-slate-500">Global safeguards and administrative controls</p>
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-8">
                                <SettingItem 
                                    title="Maintenance Mode"
                                    description="Restrict access to all users except administrators during system upgrades."
                                    icon={Settings}
                                    checked={localSettings.enableMaintenanceMode ?? false}
                                    onCheckedChange={(val: boolean) => handleToggle('enableMaintenanceMode', val)}
                                />
                                <SettingItem 
                                    title="Teacher Digital Signatures"
                                    description="Enable cryptographic signing for report cards and official documents."
                                    icon={UserCheck}
                                    checked={localSettings.allowTeacherDigitalSignature ?? false}
                                    onCheckedChange={(val: boolean) => handleToggle('allowTeacherDigitalSignature', val)}
                                />
                                <SettingItem 
                                    title="Lock Institutional Settings"
                                    description="Prevent modifications to these settings by non-owner administrators."
                                    icon={Lock}
                                    checked={localSettings.lockSettings ?? false}
                                    onCheckedChange={(val: boolean) => handleToggle('lockSettings', val)}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'Profile' && (
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                    <UserCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Personal Profile</h3>
                                    <p className="text-xs text-slate-500">Manage your personal account details</p>
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                                        <Input 
                                            value={personalProfile.name}
                                            onChange={(e) => {
                                                setPersonalProfile((p: any) => ({ ...p, name: e.target.value }));
                                                setHasChanges(true);
                                            }}
                                            placeholder="Your Full Name"
                                            className="h-12 rounded-2xl border-slate-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</Label>
                                        <select 
                                            className="w-full h-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 font-bold text-sm"
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

                                <div className="p-6 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 flex gap-4">
                                    <ShieldCheck className="text-blue-600 shrink-0" size={24} />
                                    <div>
                                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Security & Email</p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                            To change your login email or password, please use the security verification flow available in the dropdown menu.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'Landing Page' && (
                        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                    <Rocket size={20} />
                                </div>
                                <div>
                                    <h3 className="font-black text-lg">Landing Page Settings</h3>
                                    <p className="text-xs text-slate-500">Configure your public school landing page design and content.</p>
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-8">
                                <div className="space-y-6">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Hero Section</h4>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hero Title</Label>
                                            <Input 
                                                value={localLandingPage?.heroTitle || ''}
                                                onChange={(e) => handleLandingPageChange('heroTitle', e.target.value)}
                                                placeholder="Welcome to Greenwood Academy"
                                                className="h-12 rounded-2xl border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hero Subtitle</Label>
                                            <Input 
                                                value={localLandingPage?.heroSubtitle || ''}
                                                onChange={(e) => handleLandingPageChange('heroSubtitle', e.target.value)}
                                                placeholder="Nurturing Minds, Shaping the Future of Education."
                                                className="h-12 rounded-2xl border-slate-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 border-t border-slate-100 dark:border-white/5 pt-8">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">About Section</h4>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">About Title</Label>
                                            <Input 
                                                value={localLandingPage?.aboutTitle || ''}
                                                onChange={(e) => handleLandingPageChange('aboutTitle', e.target.value)}
                                                placeholder="Our Vision & Mission"
                                                className="h-12 rounded-2xl border-slate-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">About Text</Label>
                                            <textarea
                                                value={localLandingPage?.aboutText || ''}
                                                onChange={(e) => handleLandingPageChange('aboutText', e.target.value)}
                                                placeholder="Describe your school vision and mission..."
                                                rows={4}
                                                className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 border-t border-slate-100 dark:border-white/5 pt-8">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">School Features / Highlights</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {localLandingPage?.features?.map((feat: any, index: number) => (
                                            <div key={index} className="p-5 border border-slate-100 dark:border-slate-850 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10 space-y-4">
                                                <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">Feature {index + 1}</h5>
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Title</Label>
                                                    <Input 
                                                        value={feat.title || ''}
                                                        onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                                                        placeholder="Feature Title"
                                                        className="h-10 rounded-xl border-slate-200 text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Description</Label>
                                                    <textarea
                                                        value={feat.description || ''}
                                                        onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                                                        placeholder="Feature description..."
                                                        rows={3}
                                                        className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-medium focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6 border-t border-slate-100 dark:border-white/5 pt-8">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Parent / Alumni Testimonials</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {localLandingPage?.testimonials?.map((t: any, index: number) => (
                                            <div key={index} className="p-5 border border-slate-100 dark:border-slate-850 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10 space-y-4">
                                                <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">Testimonial {index + 1}</h5>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Name</Label>
                                                        <Input 
                                                            value={t.name || ''}
                                                            onChange={(e) => handleTestimonialChange(index, 'name', e.target.value)}
                                                            placeholder="Name"
                                                            className="h-10 rounded-xl border-slate-200 text-xs"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Role</Label>
                                                        <Input 
                                                            value={t.role || ''}
                                                            onChange={(e) => handleTestimonialChange(index, 'role', e.target.value)}
                                                            placeholder="Role (e.g., Parent)"
                                                            className="h-10 rounded-xl border-slate-200 text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Testimonial Text</Label>
                                                    <textarea
                                                        value={t.text || ''}
                                                        onChange={(e) => handleTestimonialChange(index, 'text', e.target.value)}
                                                        placeholder="Testimonial text..."
                                                        rows={3}
                                                        className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-medium focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SettingItem({ title, description, icon: Icon, checked, onCheckedChange }: any) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div className="flex gap-4">
        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
          <Icon size={20} />
        </div>
        <div className="space-y-0.5">
          <p className="font-black text-sm">{title}</p>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

