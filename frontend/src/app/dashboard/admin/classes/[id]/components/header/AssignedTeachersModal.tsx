"use client";

import React from "react";
import { X } from "lucide-react";

interface AssignedTeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers?: Array<{
    isLead?: boolean;
    teacher?: {
      id?: string;
      name?: string;
      email?: string;
    };
  }>;
}

export function AssignedTeachersModal({
  isOpen,
  onClose,
  teachers = [],
}: AssignedTeachersModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1b2232] border border-gray-200 dark:border-[#364563] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transition-all duration-300 transform scale-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#364563] bg-slate-50/50 dark:bg-slate-900/10">
          <h3 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            Assigned Teachers
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-650 hover:bg-gray-105 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 max-h-[300px] overflow-y-auto space-y-3">
          {teachers.map((t, index) => (
            <div
              key={t.teacher?.id || index}
              className="flex items-center justify-between p-3.5 rounded-xl border border-gray-150 dark:border-[#364563]/60 bg-gray-50/30 dark:bg-slate-900/5 hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col gap-0.5">
                <p className="font-bold text-gray-950 dark:text-white text-sm">
                  {t.teacher?.name || "Staff Member"}
                </p>
                {t.teacher?.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.teacher.email}
                  </p>
                )}
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  t.isLead
                    ? "bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400"
                    : "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400"
                }`}
              >
                {t.isLead ? "Lead" : "Assistant"}
              </span>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-[#364563] bg-slate-50/50 dark:bg-slate-900/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-105 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

