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
      <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Link2 className="text-gray-300 dark:text-gray-600" size={32} />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No active {mainTab} connections</h3>
        <p className="text-gray-500 max-w-sm mx-auto font-medium">Use the invitation system to start linking members in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

