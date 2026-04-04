/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ConnectionCard } from './ConnectionCard';

interface PendingRequestsGridProps {
  requests: any[];
  mainTab: string;
  currentUserId?: string;
  isAcceptAllPending: boolean;
  onAcceptAll: () => void;
  onRespond: (id: string, action: 'ACCEPT' | 'REJECT') => void;
  onCancel: (id: string) => void;
  onCopy: (text: string) => void;
  onViewProfile?: (item: any, details: any) => void;
  respondingId?: string | null;
  cancellingId?: string | null;
}

export function PendingRequestsGrid({
  requests,
  mainTab,
  currentUserId,
  isAcceptAllPending,
  onAcceptAll,
  onRespond,
  onCancel,
  onCopy,
  onViewProfile,
  respondingId,
  cancellingId
}: PendingRequestsGridProps) {
  if (requests.length === 0) {
    return (
      <div className="col-span-full py-20 text-center bg-white dark:bg-gray-800 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-700">
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Clock className="text-orange-300" size={32} />
        </div>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">No pending {mainTab} requests</h3>
        <p className="text-gray-500 max-w-sm mx-auto font-medium">Any new connection requests for this category will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-orange-50/50 dark:bg-orange-950/10 p-4 rounded-3xl border border-orange-100 dark:border-orange-900/20 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="text-orange-500" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight">Batch Actions</h3>
            <p className="text-[10px] font-bold text-gray-500">You have {requests.length} pending {mainTab} requests</p>
          </div>
        </div>
        <Button 
          onClick={onAcceptAll}
          disabled={isAcceptAllPending}
          className="h-10 px-6 rounded-xl bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-200 hover:scale-105 active:scale-95 transition-all"
        >
          {isAcceptAllPending ? (
            <Loader2 className="animate-spin mr-2" size={14} />
          ) : (
            <CheckCircle2 className="mr-2" size={14} />
          )}
          Accept All {mainTab}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => (
          <ConnectionCard
            key={req.id}
            item={req}
            type="pending"
            currentUserId={currentUserId}
            onRespond={onRespond}
            onCancel={onCancel}
            onCopy={onCopy}
            onViewProfile={onViewProfile}
            isLoading={respondingId === req.id || cancellingId === req.id}
          />
        ))}
      </div>
    </div>
  );
}
