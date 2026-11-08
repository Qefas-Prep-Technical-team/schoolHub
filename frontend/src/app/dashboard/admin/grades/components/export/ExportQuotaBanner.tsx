"use client";

import React from 'react';
import { Crown, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ExportQuotaBannerProps {
  isPaying: boolean;
  used: number;
  limit: number;
  remaining: number;
  userRole?: string;
}

export const ExportQuotaBanner: React.FC<ExportQuotaBannerProps> = ({
  isPaying,
  used,
  limit,
  remaining,
  userRole,
}) => {
  const router = useRouter();

  if (isPaying) {
    return (
      <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-xs">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
          <Crown className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Institutional Premium Tier: Unlimited downloads, official signatures & all formats active.</span>
        </div>
      </div>
    );
  }

  const isExhausted = remaining <= 0;

  return (
    <div className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${isExhausted
        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
      }`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold">
          {isExhausted ? (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          )}
          <span>
            Free Plan Monthly Export Quota: <strong className="font-bold">{used}/{limit} used</strong> ({remaining} remaining)
          </span>
        </div>
        {userRole === 'ADMIN' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push('/dashboard/admin/billing')}
            className="h-7 text-[11px] px-2.5 font-bold border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
          >
            Upgrade Plan
          </Button>
        )}
      </div>
      <p className="text-[11px] opacity-85 leading-relaxed">
        Free institutions can export up to 10 Master Sheet PDFs per month without verified signatures. Multi-format downloads (.xlsx, .csv), batch zip archives, and authorized endorsements are exclusive to paid plans.
      </p>
    </div>
  );
};

