'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolSettings, useUpdateSchoolSettings } from '@/lib/api/hooks/useSchool';
import { 
  Settings, 
  Bell, 
  Lock, 
  Palette, 
  Database, 
  Rocket,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.defaultTenantId || '';
  
  const { data: settings, isLoading } = useSchoolSettings(schoolId);
  const updateMutation = useUpdateSchoolSettings();

  const [localSettings, setLocalSettings] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggle = (field: string, checked: boolean) => {
    setLocalSettings((prev: any) => ({ ...prev, [field]: checked }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        schoolId,
        data: localSettings
      });
      toast.success('Settings updated successfully');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (isLoading || !localSettings) {
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
                onClick={() => {
                  setLocalSettings(settings);
                  setHasChanges(false);
                }}
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
        {/* Navigation / Shortcut Sidebar */}
        <aside className="md:col-span-3 space-y-2">
            {[
                { label: 'General', icon: Database, active: true },
                { label: 'Appearance', icon: Palette },
                { label: 'Notifications', icon: Bell },
                { label: 'Security', icon: Lock },
            ].map((item, idx) => (
                <button 
                  key={idx}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-2xl text-sm font-bold transition-all",
                    item.active ? "bg-white dark:bg-slate-900 shadow-md text-primary" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                    <item.icon size={18} />
                    {item.label}
                </button>
            ))}
        </aside>

        {/* Settings Content */}
        <main className="md:col-span-9 space-y-8">
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
                      checked={localSettings.showComingSoon}
                      onCheckedChange={(val) => handleToggle('showComingSoon', val)}
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
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
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
                             onChange={(e) => {
                                 setLocalSettings((prev: any) => ({ ...prev, defaultSession: e.target.value }));
                                 setHasChanges(true);
                             }}
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
                              onChange={(e) => {
                                setLocalSettings((prev: any) => ({ ...prev, defaultTerm: e.target.value }));
                                setHasChanges(true);
                            }}
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
