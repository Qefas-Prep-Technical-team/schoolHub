'use client';

import React from 'react';
import { X, List, Layers } from 'lucide-react';

interface AttendanceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectList: () => void;
  onSelectSwipe: () => void;
}

const AttendanceModeModal: React.FC<AttendanceModeModalProps> = ({
  isOpen,
  onClose,
  onSelectList,
  onSelectSwipe,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-800">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Take Attendance
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm font-medium">
            How would you like to take attendance for this class today?
          </p>
          
          <div className="flex flex-col gap-4">
            <button
              onClick={onSelectSwipe}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Layers size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Swipe Cards</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fast, Tinder-style swiping interface. Best for mobile or rapid entry.
                </p>
              </div>
            </button>

            <button
              onClick={onSelectList}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition-all group text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform">
                <List size={24} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Standard List</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  View all students at once. Best for reviewing and adding specific notes.
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModeModal;
