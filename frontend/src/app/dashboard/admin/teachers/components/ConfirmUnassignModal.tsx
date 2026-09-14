import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

interface ConfirmUnassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  isPending: boolean;
  primaryColor: string;
}

export function ConfirmUnassignModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  isPending,
  primaryColor,
}: ConfirmUnassignModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="size-16 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 flex items-center justify-center mb-2">
              <AlertTriangle size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Are you sure you want to unassign this teacher from <strong className="text-slate-700 dark:text-slate-300">{itemName}</strong>? This action will remove them from the roster.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className={`w-full sm:w-auto border-none ${isPending ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 transition-all duration-200'}`}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Removing...</span>
                </span>
              ) : (
                'Yes, Unassign'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
