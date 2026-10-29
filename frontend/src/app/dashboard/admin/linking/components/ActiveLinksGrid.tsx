/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Link2 } from 'lucide-react';
import { ConnectionCard } from './ConnectionCard';

interface ActiveLinksGridProps {
  links: any[];
  mainTab: string;
  currentUserId?: string;
  onRevoke: (id: string) => void;
  onCopy: (text: string) => void;
  onViewProfile?: (item: any, details: any) => void;
  revokingId?: string | null;
}

export function ActiveLinksGrid({
  links,
  mainTab,
  currentUserId,
  onRevoke,
  onCopy,
  onViewProfile,
  revokingId
}: ActiveLinksGridProps) {
  if (links.length === 0) {
    return (
      <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Link2 className="text-slate-300 dark:text-slate-600" size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No active {mainTab} connections</h3>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">Use the invitation system to start linking members in this category.</p>
      </div>
    );
  }

  // When viewing Network tab, group links into categorized date sections
  if (mainTab === 'network') {
    const getDateCategory = (dateStr?: string | Date) => {
      if (!dateStr) return 'Earlier';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Earlier';

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays <= 7) return 'This Week';
      if (diffDays <= 30) return 'This Month';
      return 'Earlier';
    };

    const categoryOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];
    const groups: Record<string, any[]> = {};
    for (const link of links) {
      const cat = getDateCategory(link.startedAt || link.createdAt);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(link);
    }

    return (
      <div className="space-y-8">
        {categoryOrder.map((category) => {
          const items = groups[category];
          if (!items || items.length === 0) return null;
          return (
            <div key={category} className="space-y-3.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {category}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {items.length}
                </span>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
                {items.map((link) => (
                  <ConnectionCard
                    key={link.id}
                    item={link}
                    type="active"
                    currentUserId={currentUserId}
                    onRevoke={onRevoke}
                    onCopy={onCopy}
                    onViewProfile={onViewProfile}
                    isLoading={revokingId === link.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
      {links.map((link) => (
        <ConnectionCard
          key={link.id}
          item={link}
          type="active"
          currentUserId={currentUserId}
          onRevoke={onRevoke}
          onCopy={onCopy}
          onViewProfile={onViewProfile}
          isLoading={revokingId === link.id}
        />
      ))}
    </div>
  );
}

