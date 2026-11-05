'use client';

import React from 'react';
import {
  Mail,
  Phone,
  Globe,
  Navigation,
  Clock,
  Info,
  User as UserIcon,
  Trophy,
  BookOpen,
  Users,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SchoolStats } from '@/lib/api/services/schoolService';
import { SchoolProfileData } from './SchoolProfileHero';
import { SocialIcon } from './SchoolProfileOverviewColumn';

interface SchoolProfileSidebarProps {
  school?: SchoolProfileData | null;
  stats?: SchoolStats | null;
  primaryColor: string;
  isVerified: boolean;
  socialLinks: Record<string, string> | null;
}

export default function SchoolProfileSidebar({
  school,
  stats,
  primaryColor,
  isVerified,
  socialLinks,
}: SchoolProfileSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Contact Details Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">
            Connectivity
          </h2>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  <Info size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl"
              >
                Centralizes essential communication nodes—email, phone lines,
                and physical coordinates—facilitating parent and staff outreach.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-6">
          <SidebarInfoItem
            icon={Mail}
            label="Academic Dispatch"
            value={school?.schoolEmail}
            themeColor={primaryColor}
          />
          <SidebarInfoItem
            icon={Phone}
            label="Voice Frequency"
            value={school?.phone}
            themeColor={primaryColor}
          />
          <SidebarInfoItem
            icon={Globe}
            label="Institutional Portal"
            value={school?.website}
            themeColor={primaryColor}
          />
          <SidebarInfoItem
            icon={Navigation}
            label="Physical Coordinate"
            value={school?.address}
            themeColor={primaryColor}
          />
          <SidebarInfoItem
            icon={Clock}
            label="Operating Hours"
            value={school?.operatingHours}
            themeColor={primaryColor}
          />
        </div>

        <div className="pt-6 mt-6 flex justify-center gap-4 border-t border-slate-100 dark:border-slate-800">
          {socialLinks &&
            Object.entries(socialLinks).map(([platform, url]) =>
              url ? (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <SocialIcon platform={platform} size={18} />
                </a>
              ) : null,
            )}
        </div>
      </div>

      {/* Operational Insights */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-base font-semibold text-slate-800 dark:text-white">
            Institutional Stats
          </h2>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-slate-400 hover:text-primary transition-colors focus:outline-none"
                >
                  <Info size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl"
              >
                Quickly audits key performance indicators and validation
                statuses that reflect the administrative health of the
                institution.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-5">
          <StatRow
            label="Principal"
            value={school?.principal || 'Not Assigned'}
            icon={UserIcon}
            color="text-purple-500 bg-purple-50 dark:bg-purple-900/20"
          />
          <StatRow
            label="Founded Year"
            value={school?.foundedYear || '---'}
            icon={Trophy}
            color="text-amber-500 bg-amber-50 dark:bg-amber-900/20"
          />
          <StatRow
            label="Education Type"
            value={school?.schoolType || 'General'}
            icon={BookOpen}
            color="text-blue-500 bg-blue-50 dark:bg-blue-900/20"
          />
          <StatRow
            label="Active Classes"
            value={stats?.classes || 0}
            icon={Users}
            color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
          />
          <StatRow
            label="Verification"
            value={isVerified ? 'Verified' : 'Unverified'}
            icon={ShieldCheck}
            color={
              isVerified
                ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
            }
          />
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Zap size={72} style={{ color: primaryColor }} />
        </div>
        <div className="space-y-1 relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Service Status
          </p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
            System <br />
            Operational
          </h3>
        </div>
        <div className="flex items-center gap-2 mt-4 relative z-10">
          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-500">
            Session Secure
          </span>
        </div>
      </div>
    </div>
  );
}

function SidebarInfoItem({
  icon: Icon,
  label,
  value,
  themeColor,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  themeColor: string;
}) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
        <Icon size={14} style={{ color: themeColor }} /> {label}
      </p>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight break-words">
        {value}
      </p>
    </div>
  );
}

function StatRow({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={cn('size-8 rounded-xl flex items-center justify-center', color)}>
          <Icon size={16} />
        </div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {label}
        </p>
      </div>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

