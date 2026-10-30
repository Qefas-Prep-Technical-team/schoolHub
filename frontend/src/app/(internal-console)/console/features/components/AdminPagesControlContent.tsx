'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Lock, 
  Search, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Layers, 
  Users, 
  GraduationCap, 
  CreditCard, 
  Award, 
  Settings as SettingsIcon,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { ADMIN_PAGES_MANIFEST } from './adminPagesManifest';
import { ADMIN_FEATURE_FLAGS, AdminFeatureFlagKey, AdminRole, ROLE_NAV_PERMISSIONS } from '@/app/dashboard/admin/components/adminFeatureFlags';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/lib/api/hooks/usePlatformGovernance';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

const ADMIN_ROLES_LIST: { role: AdminRole; label: string; color: string }[] = [
  { role: 'SCHOOL_OWNER', label: 'School Owner', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { role: 'PRINCIPAL', label: 'Principal', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { role: 'REGISTRAR', label: 'Registrar', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { role: 'ACCOUNTANT', label: 'Accountant', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { role: 'SUPPORT', label: 'Support Staff', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  { role: 'ADMIN', label: 'General Admin', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
];

export default function AdminPagesControlContent() {
  const { data: platformSettings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Parse saved visibility state
  const visibilityMap = React.useMemo<Record<string, boolean>>(() => {
    try {
      if (platformSettings?.admin_pages_visibility) {
        return JSON.parse(platformSettings.admin_pages_visibility as string);
      }
    } catch {
      // fallback
    }
    return {};
  }, [platformSettings?.admin_pages_visibility]);

  // Parse saved role permissions state
  const rolePermissionsMap = React.useMemo<Record<string, AdminRole[]>>(() => {
    try {
      if (platformSettings?.admin_role_permissions) {
        return JSON.parse(platformSettings.admin_role_permissions as string);
      }
    } catch {
      // fallback
    }
    return {};
  }, [platformSettings?.admin_role_permissions]);

  // Handle Visibility Toggle
  const handleToggleVisibility = async (featureKey: string, currentVisible: boolean) => {
    const updated = {
      ...visibilityMap,
      [featureKey]: !currentVisible,
    };
    try {
      await updateSetting.mutateAsync({
        key: 'admin_pages_visibility',
        value: JSON.stringify(updated),
      });
      toast.success(`Page visibility updated for ${featureKey}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update visibility');
    }
  };

  // Handle Role Assignment Toggle
  const handleToggleRoleAccess = async (featureKey: string, role: AdminRole) => {
    const currentRoles: AdminRole[] = rolePermissionsMap[featureKey] !== undefined
      ? rolePermissionsMap[featureKey]
      : (ROLE_NAV_PERMISSIONS[featureKey as AdminFeatureFlagKey] || ['SCHOOL_OWNER', 'PRINCIPAL', 'REGISTRAR', 'ACCOUNTANT', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN']);

    let updatedRoles: AdminRole[];
    if (currentRoles.includes(role)) {
      // Do not allow removing SCHOOL_OWNER
      if (role === 'SCHOOL_OWNER') {
        toast.info('School Owner must always retain access to all configured modules.');
        return;
      }
      updatedRoles = currentRoles.filter((r) => r !== role);
    } else {
      updatedRoles = [...currentRoles, role];
    }

    const updatedMap = {
      ...rolePermissionsMap,
      [featureKey]: updatedRoles,
    };

    try {
      await updateSetting.mutateAsync({
        key: 'admin_role_permissions',
        value: JSON.stringify(updatedMap),
      });
      toast.success(`Access permissions updated for ${role}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update role access');
    }
  };

  // Reset to institutional defaults
  const handleResetDefaults = async () => {
    try {
      await updateSetting.mutateAsync({
        key: 'admin_pages_visibility',
        value: JSON.stringify({}),
      });
      await updateSetting.mutateAsync({
        key: 'admin_role_permissions',
        value: JSON.stringify({}),
      });
      toast.success('Admin dashboard page permissions reset to default institutional configuration');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset defaults');
    }
  };

  // Filtered pages
  const filteredPages = ADMIN_PAGES_MANIFEST.filter((page) => {
    const matchesSearch =
      page.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.featureKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.href.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSection = selectedSection === 'all' || page.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const sectionsList = [
    { id: 'all', label: 'All Pages' },
    { id: 'core', label: 'Core Operations' },
    { id: 'academics', label: 'Academics & Exams' },
    { id: 'administration', label: 'Finance & Admin' },
    { id: 'communication', label: 'Communication' },
    { id: 'advanced', label: 'Advanced AI & STEM' },
    { id: 'settings', label: 'Settings & Billing' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Banner / Info Card */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-[2.5rem] p-8 overflow-hidden relative group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Governance</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin Dashboard <span className="text-indigo-600">Access Matrix</span>
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xl">
              Turn off visibility of specific admin dashboard pages globally, or customize exactly which sub-role (Owner, Principal, Registrar, Accountant, Support) has access to each page.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleResetDefaults}
              disabled={updateSetting.isPending}
              className="rounded-2xl border-slate-200 dark:border-white/10 px-6 py-6 text-xs font-black uppercase tracking-widest gap-2 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <RotateCcw size={16} /> Reset Institutional Defaults
            </Button>
          </div>
        </div>
      </div>

      {/* Filter and Section Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 px-2 scrollbar-none">
          {sectionsList.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSection(sec.id)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer',
                selectedSection === sec.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              )}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="relative group min-w-[280px] px-2">
          <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <Input
            placeholder="Search pages or routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl font-medium text-sm"
          />
        </div>
      </div>

      {/* Pages Grid */}
      <div className="space-y-4">
        {filteredPages.map((page) => {
          const isVisible = visibilityMap[page.featureKey] !== undefined
            ? visibilityMap[page.featureKey]
            : (ADMIN_FEATURE_FLAGS[page.featureKey as AdminFeatureFlagKey] ?? true);

          const assignedRoles: AdminRole[] = rolePermissionsMap[page.featureKey] !== undefined
            ? rolePermissionsMap[page.featureKey]
            : (ROLE_NAV_PERMISSIONS[page.featureKey as AdminFeatureFlagKey] || ['SCHOOL_OWNER', 'PRINCIPAL', 'REGISTRAR', 'ACCOUNTANT', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN']);

          return (
            <div
              key={page.featureKey}
              className={cn(
                'group bg-white dark:bg-slate-900 border rounded-[2rem] p-6 transition-all duration-300 shadow-sm hover:shadow-md',
                isVisible
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-dashed border-rose-300/80 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 opacity-75'
              )}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Page Info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight">
                      {page.label}
                    </span>
                    <code className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold">
                      {page.href}
                    </code>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black py-0.5 text-slate-500">
                      {page.section}
                    </Badge>
                    {!isVisible && (
                      <Badge className="bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest">
                        Hidden from Sidebar
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {page.description}
                  </p>
                </div>

                {/* Controls (Visibility Switch & Role Checkboxes) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  {/* Role Selector Badges */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Lock size={12} /> Accessible Sub-Roles:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ADMIN_ROLES_LIST.map(({ role, label, color }) => {
                        const hasAccess = assignedRoles.includes(role);
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleToggleRoleAccess(page.featureKey, role)}
                            disabled={updateSetting.isPending}
                            className={cn(
                              'px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wide border transition-all cursor-pointer flex items-center gap-1.5',
                              hasAccess
                                ? color
                                : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-40 hover:opacity-80'
                            )}
                            title={hasAccess ? `Revoke access for ${label}` : `Grant access to ${label}`}
                          >
                            {hasAccess && <Check size={11} className="stroke-[3]" />}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Visibility Switch */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pl-4 sm:border-l border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {isVisible ? 'Visible' : 'Disabled'}
                      </span>
                      <Switch
                        checked={isVisible}
                        onCheckedChange={() => handleToggleVisibility(page.featureKey, isVisible)}
                        disabled={updateSetting.isPending}
                        className="data-[state=checked]:bg-indigo-600"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">
                      {isVisible ? 'Active on dashboard' : 'Turned off for all admins'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPages.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
            <p className="text-base font-bold text-slate-500">No dashboard pages matched your query.</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for a different keyword or view All Pages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
