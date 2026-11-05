'use client';

import React, { useState } from 'react';
import {
  Info,
  Share2,
  ChevronDown,
  ChevronUp,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
} from 'lucide-react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { SchoolProfileData, SchoolProfileAdminRecord } from './SchoolProfileHero';

const DEFAULT_ABOUT_TEXT =
  'A premier educational institution focused on excellence and holistic development. Committed to nurturing future leaders through innovative teaching methodologies and a balanced approach to academic and extracurricular growth.';

export function SocialIcon({ platform, size }: { platform: string; size: number }) {
  switch (platform) {
    case 'facebook': return <Facebook size={size} />;
    case 'twitter': return <Twitter size={size} />;
    case 'instagram': return <Instagram size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
    case 'youtube': return <Youtube size={size} />;
    default: return <Globe size={size} />;
  }
}

function CardTitleTooltip({ title, tooltip }: { title: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-base font-semibold text-slate-800 dark:text-white">{title}</h2>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
              <Info size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

interface SchoolProfileOverviewColumnProps {
  school?: SchoolProfileData | null;
  primaryColor: string;
  socialLinks: Record<string, string> | null;
}

export default function SchoolProfileOverviewColumn({
  school,
  primaryColor,
  socialLinks,
}: SchoolProfileOverviewColumnProps) {
  const [leadershipPage, setLeadershipPage] = useState(1);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  const aboutText = school?.description || DEFAULT_ABOUT_TEXT;
  const admins = school?.admins || [];

  return (
    <div className="space-y-6">
      {/* About Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="mb-4">
          <CardTitleTooltip
            title="About Institution"
            tooltip="Displays your official institutional mission and description. This information represents your school's public identity across the system."
          />
        </div>
        <div className="relative">
          <p className={cn('text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-all duration-300', !isAboutExpanded && 'line-clamp-3')}>
            {aboutText}
          </p>
          {(aboutText.length > 150 || aboutText.includes('\n')) && (
            <button
              type="button"
              onClick={() => setIsAboutExpanded((prev) => !prev)}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-colors focus:outline-none cursor-pointer"
            >
              <span>{isAboutExpanded ? 'Show less' : 'Read more'}</span>
              {isAboutExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Academic Leadership */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <CardTitleTooltip
            title="Leadership Protocol"
            tooltip="Lists key administrative personnel and their delegated access levels. Ensure only authorized staff members hold top-tier roles here."
          />
        </div>

        <div className="space-y-6">
          {admins.length > 0 ? (
            admins
              .slice((leadershipPage - 1) * 10, leadershipPage * 10)
              .map((sa: SchoolProfileAdminRecord, idx: number) => (
                <div key={sa.id || idx} className="flex gap-4 items-start">
                  <span className="text-slate-400 text-sm font-medium pt-3 w-5">
                    {(leadershipPage - 1) * 10 + idx + 1}.
                  </span>
                  <div className="size-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-bold text-lg text-slate-400 shrink-0">
                    {sa.admin?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{sa.admin?.name}</p>
                    <p className="text-xs font-semibold text-slate-500 tracking-wide">
                      {sa.role
                        ? sa.role.replace(/_/g, ' ').replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())
                        : 'Administrator'}
                    </p>
                    <p className="text-xs text-slate-400">Managing institutional operations and academic excellence since participation.</p>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-slate-400 italic text-sm">No leadership data detected.</p>
          )}
        </div>
        {admins.length > 10 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" disabled={leadershipPage === 1} onClick={() => setLeadershipPage((p) => p - 1)} className="text-xs">
              Previous
            </Button>
            <span className="text-xs text-slate-500">Page {leadershipPage} of {Math.ceil(admins.length / 10)}</span>
            <Button variant="ghost" size="sm" disabled={leadershipPage === Math.ceil(admins.length / 10)} onClick={() => setLeadershipPage((p) => p + 1)} className="text-xs">
              Next
            </Button>
          </div>
        )}
      </div>

      {/* System Architecture */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="mb-6">
          <CardTitleTooltip
            title="Digital Capabilities"
            tooltip="Highlights your system credentials and authorized feature access tier. Upgrading your plan will unlock additional capabilities here."
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-500">Institutional Hash</p>
            <p className="text-lg font-bold text-slate-800 dark:text-white font-mono tracking-wide">{school?.schoolCode || '---'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-500">System Subdomain</p>
            <p className="text-base font-bold truncate" style={{ color: primaryColor }}>
              {school?.subdomain ? `${school.subdomain}.qefashub.com` : 'OFFLINE'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-6">
          {school?.subscriptionPlan?.features?.map((feature: string, idx: number) => (
            <Badge key={idx} variant="outline" className="rounded-xl px-3 py-1 text-[10px] font-semibold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <div className="size-1.5 rounded-full mr-2" style={{ backgroundColor: primaryColor }} />
              {feature}
            </Badge>
          ))}
        </div>
      </div>

      {/* Governance & Social */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
            <Share2 size={20} />
          </div>
          <div>
            <CardTitleTooltip
              title="Governance & Social"
              tooltip="Consolidates core foundational details, such as the principal and institutional categorization, along with your official social media channels."
            />
            <p className="text-xs text-slate-500">Leadership details and social media presence.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-500">Principal Name</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{school?.principal || 'Not Assigned'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-500">Founded Year</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{school?.foundedYear || '---'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-500">Institution Category</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{school?.schoolType || 'Private'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Social Footprint</h3>
          <div className="flex flex-wrap gap-3">
            {socialLinks && Object.entries(socialLinks).some(([_, url]) => url) ? (
              Object.entries(socialLinks).map(([platform, url]) =>
                url ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <SocialIcon platform={platform} size={16} />
                    <span className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">{platform}</span>
                  </a>
                ) : null,
              )
            ) : (
              <p className="text-xs text-slate-400 italic">No social media channels configured.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
