'use client';

import React from 'react';
import { Download, Gem, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolSettings, useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useSubscriptionUsage } from '@/lib/api/hooks/useSubscriptionUsage';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PremiumExportButtonProps {
  onExport: () => void;
  className?: string;
  label?: string;
  icon?: React.ReactNode;
}

export function PremiumExportButton({ 
  onExport, 
  className = "", 
  label = "Export",
  icon = <Download size={16} className="mr-2" />
}: PremiumExportButtonProps) {
  const { user } = useAuthStore();
  const schoolId = (user as any)?.school?.id || user?.schools?.[0]?.schoolId || "";

  const { data: usageData, isLoading: usageLoading } = useSubscriptionUsage();
  const { data: settings, isLoading: settingsLoading } = useSchoolSettings(schoolId);
  const { data: schoolProfile, isLoading: profileLoading } = useSchoolProfile(schoolId);

  const isEnforced = settings?.sub_enforced_teachers !== "false";

  const isTeacherPaying = usageData?.subscriptionStatus?.toLowerCase() === 'active' || usageData?.isTrial;
  const isSchoolPaying = schoolProfile?.subscriptionStatus?.toLowerCase() === 'active' || schoolProfile?.isTrialActive;

  const hasAccess = isEnforced ? isTeacherPaying : isSchoolPaying;
  const isLoading = usageLoading || settingsLoading || profileLoading;

  if (isLoading) {
    return (
      <button disabled className={`flex items-center justify-center gap-2 opacity-50 cursor-not-allowed ${className}`}>
        <Loader2 size={16} className="animate-spin mr-1" />
        <span className="truncate">{label}</span>
      </button>
    );
  }

  if (!hasAccess) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-block">
              <button 
                disabled
                className={`flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-xl border border-amber-200 dark:border-amber-800/50 cursor-not-allowed transition-all ${className}`}
              >
                <Gem size={16} className="text-amber-500" />
                <span className="truncate">{label}</span>
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900 font-medium px-3 py-2 text-xs">
            <div className="flex items-center gap-2">
              <Gem size={14} className="text-amber-500" />
              Only Premium users can export this data.
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <button
      type="button"
      onClick={onExport}
      className={`flex items-center justify-center transition-all ${className}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
