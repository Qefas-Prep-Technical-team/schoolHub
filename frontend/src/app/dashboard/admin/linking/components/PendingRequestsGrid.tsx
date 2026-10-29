/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Clock, CheckCircle2, Loader2, XCircle, CheckSquare, Square } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ConnectionCard } from './ConnectionCard';

interface PendingRequestsGridProps {
  requests: any[];
  mainTab: string;
  currentUserId?: string;
  isAcceptAllPending: boolean;
  totalPending?: number;
  onAcceptAll: () => void;
  onRespond: (id: string, action: 'ACCEPT' | 'REJECT') => void;
  onCancel: (id: string) => void;
  onCopy: (text: string) => void;
  onViewProfile?: (item: any, details: any) => void;
  respondingIds?: Set<string>;
  cancellingId?: string | null;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  onBatchAction?: (action: 'ACCEPT' | 'REJECT') => void;
  isBatchPending?: boolean;
}

export function PendingRequestsGrid({
  requests,
  mainTab,
  currentUserId,
  isAcceptAllPending,
  totalPending,
  onAcceptAll,
  onRespond,
  onCancel,
  onCopy,
  onViewProfile,
  respondingIds,
  cancellingId,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onBatchAction,
  isBatchPending = false,
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

  const selectedCount = selectedIds?.size ?? 0;
  const allOnPageSelected = requests.length > 0 && requests.every((r) => selectedIds?.has(r.id));
  const busy = isAcceptAllPending || isBatchPending;
  const total = totalPending ?? requests.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-primary/5 dark:bg-primary/10 p-4 rounded-3xl border border-primary/10 dark:border-primary/20 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          {onToggleSelectAll && (
            <button
              id="linking-select-all"
              type="button"
              onClick={onToggleSelectAll}
              disabled={busy}
              className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors disabled:opacity-50"
              aria-label={allOnPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
            >
              {allOnPageSelected ? <CheckSquare className="text-primary" size={22} /> : <Square className="text-primary" size={22} />}
            </button>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-tight truncate">Batch Actions</h3>
            <p className="text-[10px] font-bold text-gray-500 truncate">
              {selectedCount > 0
                ? `${selectedCount} selected on this page`
                : `You have ${total} pending ${mainTab} request${total === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {selectedCount > 0 && onBatchAction && (
            <>
              <Button
                id="linking-batch-reject"
                variant="outline"
                onClick={() => onBatchAction('REJECT')}
                disabled={busy}
                className="h-10 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
              >
                <XCircle className="mr-2" size={14} />
                Reject {selectedCount}
              </Button>
              <Button
                id="linking-batch-accept"
                onClick={() => onBatchAction('ACCEPT')}
                disabled={busy}
                className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/30 transition-all"
              >
                {isBatchPending ? <Loader2 className="animate-spin mr-2" size={14} /> : <CheckCircle2 className="mr-2" size={14} />}
                Accept {selectedCount} Selected
              </Button>
            </>
          )}
          <Button
            id="linking-accept-all"
            onClick={onAcceptAll}
            disabled={busy}
            className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
          >
            {isAcceptAllPending ? (
              <Loader2 className="animate-spin mr-2" size={14} />
            ) : (
              <CheckCircle2 className="mr-2" size={14} />
            )}
            {isAcceptAllPending ? 'Processing queue…' : `Accept All ${mainTab} (${total})`}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-6">
        {requests.map((req) => {
          const isSelected = selectedIds?.has(req.id) ?? false;
          return (
            <div
              key={req.id}
              className={`relative rounded-[1.75rem] transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent' : ''}`}
            >
              {onToggleSelect && (
                <button
                  id={`linking-select-${req.id}`}
                  type="button"
                  onClick={() => onToggleSelect(req.id)}
                  disabled={busy}
                  className="absolute top-3 left-3 z-10 w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-900/90 shadow flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                  aria-label={isSelected ? 'Deselect request' : 'Select request'}
                >
                  {isSelected ? <CheckSquare className="text-primary" size={16} /> : <Square className="text-slate-400" size={16} />}
                </button>
              )}
              <ConnectionCard
                item={req}
                type="pending"
                currentUserId={currentUserId}
                onRespond={onRespond}
                onCancel={onCancel}
                onCopy={onCopy}
                onViewProfile={onViewProfile}
                isLoading={(respondingIds?.has(req.id) ?? false) || cancellingId === req.id || isAcceptAllPending}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
