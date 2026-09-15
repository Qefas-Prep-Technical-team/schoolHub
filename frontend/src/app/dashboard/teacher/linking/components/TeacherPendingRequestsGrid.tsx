/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Clock } from 'lucide-react';
import { TeacherConnectionCard } from './TeacherConnectionCard';

interface TeacherPendingRequestsGridProps {
  requests: any[];
  mainTab: string;
  isPersonal?: boolean;
  currentUserId?: string;
  onRespond: (id: string, action: 'ACCEPT' | 'REJECT') => void;
  onCancel: (id: string) => void;
  onCopy?: (text: string) => void;
  onViewProfile?: (item: any, details: any) => void;
}

export function TeacherPendingRequestsGrid({
  requests,
  mainTab,
  isPersonal,
  currentUserId,
  onRespond,
  onCancel,
  onCopy,
  onViewProfile
}: TeacherPendingRequestsGridProps) {
  if (requests.length === 0) {
    return (
      <div className="col-span-full py-20 text-center bg-white dark:bg-slate-800 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-700">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Clock className="text-slate-300 dark:text-slate-600" size={32} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          No pending {isPersonal ? mainTab : ''} requests
        </h3>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">When you send or receive link requests, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {requests.map((req) => (
        <TeacherConnectionCard
          key={req.id}
          item={req}
          type="pending"
          currentUserId={currentUserId}
          onRespond={onRespond}
          onCancel={onCancel}
          onCopy={onCopy}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  );
}
