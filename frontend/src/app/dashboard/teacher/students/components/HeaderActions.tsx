'use client';

import { useState } from "react";
import Button from "./ui/Button";
import { MessageSquare, X } from "lucide-react";

interface HeaderActionsProps {
  onQuickAttendance?: () => void;
  onExport?: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ onQuickAttendance, onExport }) => {
  const [showModal, setShowModal] = useState(false);

  const handleBulkMessage = () => {
    setShowModal(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" icon="ios_share" onClick={onExport}>
          Export List
        </Button>
        <Button variant="secondary" icon="forward_to_inbox" onClick={handleBulkMessage}>
          Bulk Message
        </Button>
        <Button variant="primary" icon="checklist" onClick={onQuickAttendance}>
          Quick Attendance
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-emerald-950/60 rounded-[2rem] shadow-2xl w-full max-w-md p-8 border border-slate-200 dark:border-emerald-800/50 text-center relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
            
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={32} />
            </div>
            
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Coming Soon</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              We're currently building a powerful bulk messaging feature that will allow you to instantly reach all students and parents in your classes. Stay tuned!
            </p>
            
            <button 
              onClick={() => setShowModal(false)}
              className="w-full px-6 py-3 rounded-xl bg-slate-900 dark:bg-emerald-900/40 text-white dark:text-slate-200 text-xs font-black uppercase tracking-widest hover:bg-emerald-600 dark:hover:bg-emerald-600 transition-colors shadow-lg"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderActions;
