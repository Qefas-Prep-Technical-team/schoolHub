'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCcw, 
  Wrench, 
  Check, 
  Sliders, 
  ExternalLink, 
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lock,
  Layers,
  Info
} from 'lucide-react';
import { ADMIN_PAGES_MANIFEST } from './adminPagesManifest';
import { ADMIN_FEATURE_FLAGS, AdminFeatureFlagKey } from '@/app/dashboard/admin/components/adminFeatureFlags';
import { usePlatformFeatures, useHarvestFeatures } from '@/lib/api/hooks/usePricingManagement';
import { useUpdatePlatformFeature } from '@/lib/api/hooks/usePlatformSchools';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/lib/api/hooks/usePlatformGovernance';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

interface AdminModulesContentProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function AdminModulesContent({ searchQuery, setSearchQuery }: AdminModulesContentProps) {
  const { data: entitlementFeatures, isLoading: isLoadingEntitlement } = usePlatformFeatures();
  const { mutate: updateFeature } = useUpdatePlatformFeature();
  const { data: platformSettings, isLoading: isLoadingSettings } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSettings();
  const harvestFeatures = useHarvestFeatures();

  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Parse custom page visibility from platform settings
  const visibilityMap = React.useMemo<Record<string, boolean>>(() => {
    try {
      if (platformSettings?.admin_pages_visibility) {
        return JSON.parse(platformSettings.admin_pages_visibility as string);
      }
    } catch {}
    return {};
  }, [platformSettings?.admin_pages_visibility]);

  // Combined module list: Aligning Platform Features Registry + Admin Dashboard Pages Manifest
  const combinedModules = React.useMemo(() => {
    const registryMap = new Map<string, any>();
    (entitlementFeatures || []).forEach((f: any) => {
      registryMap.set(f.featureKey, f);
    });

    return ADMIN_PAGES_MANIFEST.map((page) => {
      const regFeature = registryMap.get(page.featureKey);
      
      // Determine if page is visible on the admin dashboard
      const isVisibleOnDashboard = visibilityMap[page.featureKey] !== undefined
        ? visibilityMap[page.featureKey]
        : (ADMIN_FEATURE_FLAGS[page.featureKey as AdminFeatureFlagKey] ?? true);

      // Determine if module is enabled in the database / feature flags
      const isModuleEnabled = regFeature 
        ? regFeature.adminEnabled !== false 
        : (ADMIN_FEATURE_FLAGS[page.featureKey as AdminFeatureFlagKey] ?? true);

      return {
        ...page,
        regFeature,
        isVisibleOnDashboard,
        isModuleEnabled,
        registeredInRegistry: !!regFeature,
      };
    });
  }, [entitlementFeatures, visibilityMap]);

  // Filter modules by search and section
  const filteredModules = combinedModules.filter((mod) => {
    const matchesSearch =
      mod.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.featureKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.href.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSection = selectedSection === 'all' || mod.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  // Toggle Module Activation
  const handleToggleModule = async (mod: typeof combinedModules[0], nextValue: boolean) => {
    setUpdatingKey(mod.featureKey);
    try {
      if (mod.regFeature) {
        // Update in PlatformFeatures table
        await updateFeature(
          { id: mod.regFeature.id, updateData: { adminEnabled: nextValue } },
          {
            onSuccess: () => {
              toast.success(`${mod.label} module ${nextValue ? 'activated' : 'deactivated'}`);
            },
            onError: (err: any) => {
              toast.error(err.response?.data?.message || 'Failed to update module state');
            },
            onSettled: () => setUpdatingKey(null),
          }
        );
      } else {
        // If not yet in registry, synchronize visibility in platform settings
        const updated = {
          ...visibilityMap,
          [mod.featureKey]: nextValue,
        };
        await updateSetting.mutateAsync({
          key: 'admin_pages_visibility',
          value: JSON.stringify(updated),
        });
        toast.success(`${mod.label} visibility updated to ${nextValue ? 'active' : 'inactive'}`);
        setUpdatingKey(null);
      }
    } catch {
      setUpdatingKey(null);
    }
  };

  // Toggle Visibility directly
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
      toast.success(`Dashboard visibility updated for ${featureKey}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update visibility');
    }
  };

  const sectionsList = [
    { id: 'all', label: 'All Modules' },
    { id: 'core', label: 'Core Operations' },
    { id: 'academics', label: 'Academics' },
    { id: 'administration', label: 'Finance & Admin' },
    { id: 'communication', label: 'Communication' },
    { id: 'advanced', label: 'Advanced STEM' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info Banner */}
      <div className="bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 rounded-[2.5rem] p-8 overflow-hidden relative group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/10">
              <Sliders size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Institutional Alignment</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin <span className="text-purple-600">Modules Hub</span>
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xl">
              Strictly aligned with all pages and navigation items on the Admin Dashboard. Turn module execution and sidebar visibility on or off in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => harvestFeatures.mutate({ category: 'ADMIN', role: 'admin' })}
              disabled={harvestFeatures.isPending}
              className="rounded-2xl border-purple-500/20 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 px-6 py-6 text-xs font-black uppercase tracking-widest gap-2"
            >
              {harvestFeatures.isPending ? <RefreshCcw className="animate-spin" size={16} /> : <Sparkles size={16} />}
              Sync Admin Modules
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
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              )}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="relative group min-w-[280px] px-2">
          <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
          <Input
            placeholder="Search admin modules or routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 rounded-xl font-medium text-sm"
          />
        </div>
      </div>

      {/* Modules Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingEntitlement || isLoadingSettings ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 space-y-4 animate-pulse">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ))
        ) : (
          filteredModules.map((mod) => {
            const isUpdating = updatingKey === mod.featureKey;
            const isFullyActive = mod.isModuleEnabled && mod.isVisibleOnDashboard;

            return (
              <div
                key={mod.featureKey}
                className={cn(
                  'group relative bg-white dark:bg-slate-900 border rounded-[2.5rem] p-7 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between',
                  isFullyActive
                    ? 'border-purple-500/20 ring-1 ring-purple-500/10'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 opacity-80'
                )}
              >
                <div className="space-y-4">
                  {/* Top Bar: Title, Key, Route */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        {mod.label}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <code className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold uppercase tracking-tight">
                          {mod.featureKey}
                        </code>
                        <span className="text-[10px] font-mono text-slate-400">
                          {mod.href}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0',
                        mod.isVisibleOnDashboard
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      )}
                    >
                      {mod.isVisibleOnDashboard ? 'Visible' : 'Hidden'}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                    {mod.description}
                  </p>
                </div>

                {/* Bottom Controls */}
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Module State
                      </span>
                      <span className={cn('text-xs font-black uppercase tracking-wide', mod.isModuleEnabled ? 'text-purple-600' : 'text-slate-400')}>
                        {mod.isModuleEnabled ? 'Active in Core' : 'Disabled'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUpdating && <RefreshCcw size={12} className="animate-spin text-purple-600" />}
                      <Switch
                        checked={mod.isModuleEnabled}
                        onCheckedChange={(val) => handleToggleModule(mod, val)}
                        disabled={isUpdating}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/60 dark:border-white/[0.03]">
                    <span className="text-[10px] font-bold text-slate-400">
                      Sidebar Navigation
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(mod.featureKey, mod.isVisibleOnDashboard)}
                      disabled={isUpdating}
                      className={cn(
                        'text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-all cursor-pointer',
                        mod.isVisibleOnDashboard
                          ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                          : 'border-rose-500/30 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                      )}
                    >
                      {mod.isVisibleOnDashboard ? 'Turn Off Visibility' : 'Enable in Sidebar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isLoadingEntitlement && filteredModules.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
          <p className="text-base font-bold text-slate-500">No admin modules matched your search query.</p>
          <p className="text-xs text-slate-400 mt-1">Try searching by page name or select All Modules.</p>
        </div>
      )}
    </div>
  );
}
