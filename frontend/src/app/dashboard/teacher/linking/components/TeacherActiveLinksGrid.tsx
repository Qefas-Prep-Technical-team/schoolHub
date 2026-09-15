/* eslint-disable @typescript-eslint/no-explicit-any */
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
  onViewProfile
}: TeacherActiveLinksGridProps) {
  if (links.length === 0) {
    return (
      <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Link2 className="text-slate-300 dark:text-slate-600" size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          No active {isPersonal ? mainTab : ''} connections
        </h3>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">Use the invitation system to start linking members in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
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
