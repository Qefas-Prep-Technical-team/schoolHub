'use client';

import React from 'react';
import { Link2 } from 'lucide-react';
import { TeacherConnectionCard } from './TeacherConnectionCard';

interface TeacherActiveLinksGridProps {
  links: any[];
  mainTab: string;
  isPersonal?: boolean;
  currentUserId?: string;
  onRevoke: (id: string) => void;
  onCopy: (text: string) => void;
  onViewProfile?: (item: any, details: any) => void;
}

export function TeacherActiveLinksGrid({
  links,
  mainTab,
  isPersonal,
  currentUserId,
  onRevoke,
  onCopy,
  onViewProfile,
}: TeacherActiveLinksGridProps) {
  if (links.length === 0) {
    return (
      <div className="col-span-full py-16 sm:py-20 text-center bg-white dark:bg-black rounded-2xl sm:rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 p-6">
        <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100 dark:border-zinc-800">
          <Link2 className="text-slate-400 dark:text-slate-500" size={28} />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1.5">
          No active {isPersonal ? mainTab : ''} connections
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
          Use your Teacher Code or QR badge to start connecting scholars and colleagues.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5 w-full">
      {links.map((link) => (
        <TeacherConnectionCard
          key={link.id}
          item={link}
          type="active"
          currentUserId={currentUserId}
          onRevoke={onRevoke}
          onCopy={onCopy}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
}
