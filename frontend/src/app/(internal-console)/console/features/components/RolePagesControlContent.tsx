'use client';

import React, { useMemo, useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Search, 
  RotateCcw, 
  WalletCards, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  LucideIcon
} from 'lucide-react';
import { 
  RolePageManifestItem, 
  TEACHER_PAGES_MANIFEST, 
  STUDENT_PAGES_MANIFEST, 
  PARENT_PAGES_MANIFEST 
} from './rolePagesManifest';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/lib/api/hooks/usePlatformGovernance';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

interface RolePagesControlContentProps {
  role: 'teacher' | 'student' | 'parent';
  roleLabel: string;
  icon: LucideIcon;
  accentColor: string;
}

export default function RolePagesControlContent({
  role,
  roleLabel,
  icon: Icon,
  accentColor,
}: RolePagesControlContentProps) {
  const queryClient = useQueryClient();
  const { data: platformSettings, isLoading } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isUpdatingRevenue, setIsUpdatingRevenue] = useState(false);

  // Select manifest by role
  const manifest: RolePageManifestItem[] = useMemo(() => {
    switch (role) {
      case 'teacher':
        return TEACHER_PAGES_MANIFEST;
      case 'student':
        return STUDENT_PAGES_MANIFEST;
      case 'parent':
        return PARENT_PAGES_MANIFEST;
      default:
        return [];
    }
  }, [role]);

  // Settings key for this role's visibility map
  const visibilityKey = `${role}_pages_visibility`;
  const revenueKey = `sub_enforced_${role === 'student' ? 'students' : role === 'teacher' ? 'teachers' : 'parents'}`;

  // Parse saved visibility state
  const visibilityMap = useMemo<Record<string, boolean>>(() => {
    try {
      if (platformSettings?.[visibilityKey]) {
        return JSON.parse(platformSettings[visibilityKey] as string);
      }
    } catch {
      // Fallback
    }
    return {};
  }, [platformSettings, visibilityKey]);

  // Is revenue enforcement enabled
  const isRevenueEnabled = platformSettings ? platformSettings[revenueKey] !== 'false' : true;

  // Distinct sections
  const sections = useMemo(() => {
    const list = Array.from(new Set(manifest.map((item) => item.section)));
    return ['all', ...list];
  }, [manifest]);

  // Filtered pages
  const filteredPages = useMemo(() => {
    return manifest.filter((page) => {
      const matchesSearch =
        page.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.featureKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.href.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection = selectedSection === 'all' || page.section === selectedSection;
      return matchesSearch && matchesSection;
    });
  }, [manifest, searchQuery, selectedSection]);

  // Toggle page visibility
  const handleToggleVisibility = (featureKey: string, currentVal: boolean) => {
    const updated = { ...visibilityMap, [featureKey]: !currentVal };
    updateSetting.mutate(
      { key: visibilityKey, value: JSON.stringify(updated) },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['global-features', role] });
          toast.success(
            !currentVal
              ? `"${featureKey}" is now visible to ${roleLabel}s`
              : `"${featureKey}" turned off and hidden from ${roleLabel}s`
          );
        },
        onError: () => {
          toast.error('Failed to update visibility setting');
        },
      }
    );
  };

  // Turn all visible or all off
  const handleBulkVisibility = (visible: boolean) => {
    const updated: Record<string, boolean> = {};
    manifest.forEach((page) => {
      updated[page.featureKey] = visible;
    });
    updateSetting.mutate(
      { key: visibilityKey, value: JSON.stringify(updated) },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['global-features', role] });
          toast.success(`All ${roleLabel} pages set to ${visible ? 'Visible' : 'Hidden'}`);
        },
        onError: () => toast.error('Bulk update failed'),
      }
    );
  };

  // Toggle revenue enforcement
  const handleRevenueToggle = (checked: boolean) => {
    setIsUpdatingRevenue(true);
    updateSetting.mutate(
      { key: revenueKey, value: checked ? 'true' : 'false' },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['global-features', role] });
          toast.success(`${roleLabel} subscription paywall ${checked ? 'enforced' : 'deactivated (free access)'}`);
        },
        onSettled: () => setIsUpdatingRevenue(false),
      }
    );
  };

  const isPageVisible = (featureKey: string) => {
    return visibilityMap[featureKey] !== undefined ? visibilityMap[featureKey] : true;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Controls bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 shadow-xl shadow-slate-200/40 dark:shadow-none">
        <div className="flex items-center gap-4">
          <div className={cn("p-4 rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10", accentColor)}>
            <Icon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {roleLabel} <span className={accentColor}>Pages & Access Matrix</span>
              </h2>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                Live Sync
              </Badge>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Toggle visibility to instantly display or completely restrict pages across the {roleLabel} portal navigation and URL router.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end lg:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkVisibility(true)}
            className="rounded-2xl text-[10px] font-black uppercase tracking-wider h-10 px-4 gap-1.5 border-slate-200 dark:border-white/10 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/20"
          >
            <Eye size={14} /> Show All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkVisibility(false)}
            className="rounded-2xl text-[10px] font-black uppercase tracking-wider h-10 px-4 gap-1.5 border-slate-200 dark:border-white/10 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
          >
            <EyeOff size={14} /> Hide All
          </Button>
        </div>
      </div>

      {/* Revenue Enforcement Protocol Card */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-[2.5rem] p-6 lg:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
          <WalletCards size={100} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Commercial Subscription Gate
              </span>
              <Sparkles size={14} className="text-amber-500" />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {roleLabel} Subscription Enforcement
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              When enabled, {roleLabel} accounts must maintain an active paid subscription plan or active school tier to access gated features. When disabled, portal tools remain completely open for testing and free access.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 dark:border-white/10 self-start md:self-auto shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Status</span>
              <span className={cn("text-xs font-black uppercase tracking-wider", isRevenueEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                {isRevenueEnabled ? "Paywall Enforced" : "Free Access Mode"}
              </span>
            </div>
            <Switch
              checked={isRevenueEnabled}
              onCheckedChange={handleRevenueToggle}
              disabled={isUpdatingRevenue || isLoading}
            />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 custom-scrollbar">
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={cn(
                "px-4 py-2 rounded-2xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200",
                selectedSection === sec
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5"
              )}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${roleLabel} pages...`}
            className="pl-11 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold"
          />
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredPages.map((page) => {
          const visible = isPageVisible(page.featureKey);

          return (
            <div
              key={page.featureKey}
              className={cn(
                "p-6 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between group relative overflow-hidden",
                visible
                  ? "bg-white/90 dark:bg-slate-900/90 border-slate-200/80 dark:border-white/5 shadow-md shadow-slate-100 dark:shadow-none"
                  : "bg-slate-50/70 dark:bg-slate-950/40 border-dashed border-slate-200 dark:border-white/5 opacity-70"
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                    {page.section}
                  </Badge>

                  <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest", visible ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500")}>
                      {visible ? "Visible" : "Off / Hidden"}
                    </span>
                    <Switch
                      checked={visible}
                      onCheckedChange={() => handleToggleVisibility(page.featureKey, visible)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {page.label}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed line-clamp-2">
                    {page.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <code className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[190px]">
                  {page.href}
                </code>

                <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md", visible ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600")}>
                  {visible ? "Active" : "Inaccessible"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
