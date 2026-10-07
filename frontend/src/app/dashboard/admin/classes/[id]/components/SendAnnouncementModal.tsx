"use client";

import React, { useState } from "react";
import { X, Send, Megaphone, Check, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { classService } from "@/lib/api/services/classService";
import { toast } from "react-toastify";

interface SendAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
}

export default function SendAnnouncementModal({ isOpen, onClose, classId }: SendAnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targets, setTargets] = useState<string[]>(["STUDENT"]);
  const [priority, setPriority] = useState<"NORMAL" | "HIGH" | "URGENT">("NORMAL");
  
  const queryClient = useQueryClient();

  const toggleTarget = (target: string) => {
    setTargets(prev => 
      prev.includes(target) 
        ? prev.filter(t => t !== target)
        : [...prev, target]
    );
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required.");
      if (!message.trim()) throw new Error("Message is required.");
      if (targets.length === 0) throw new Error("Please select at least one recipient group.");

      return await classService.sendAnnouncement(classId, {
        title,
        message,
        targets,
        priority
      });
    },
    onSuccess: (res: any) => {
      const successMsg = typeof res?.message === 'string' ? res.message : "Announcement sent successfully!";
      toast.success(successMsg);
      setTitle("");
      setMessage("");
      setTargets(["STUDENT"]);
      setPriority("NORMAL");
      onClose();
    },
    onError: (error: any) => {
      let msg = "Failed to send announcement.";
      if (error?.response?.data?.message) {
        msg = typeof error.response.data.message === 'string' 
          ? error.response.data.message 
          : JSON.stringify(error.response.data.message);
      } else if (error?.message) {
        msg = error.message;
      }
      toast.error(msg);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden border border-slate-200/60 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 px-6 py-6 sm:px-8 sm:py-8 border-b border-slate-100 dark:border-slate-800">
          <div className="absolute top-0 right-0 p-24 sm:p-32 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 pointer-events-none" />
          
          <div className="relative flex items-start justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-slate-800 shadow-xl shadow-indigo-500/10 dark:shadow-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-700">
                <Megaphone size={24} className="sm:hidden" />
                <Megaphone size={28} className="hidden sm:block" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Send Announcement
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Broadcast an important message to this class.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 bg-slate-50/50 dark:bg-slate-900/50 max-h-[60vh] sm:max-h-none overflow-y-auto">
          
          {/* Priority Status Toggle */}
          <div>
            <label className="block text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
              Priority Status
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setPriority("NORMAL")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  priority === "NORMAL"
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setPriority("HIGH")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  priority === "HIGH"
                    ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                High
              </button>
              <button
                type="button"
                onClick={() => setPriority("URGENT")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  priority === "URGENT"
                    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <AlertCircle size={16} />
                Urgent
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Announcement Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Upcoming Science Fair"
                className="w-full px-5 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:ring-indigo-500/20 outline-none transition-all shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Message Body
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Type your message here..."
                className="w-full px-5 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 dark:focus:ring-indigo-500/20 outline-none transition-all resize-none shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                Send To
              </label>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => toggleTarget("STUDENT")}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border ${
                    targets.includes("STUDENT")
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${targets.includes("STUDENT") ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {targets.includes("STUDENT") && <Check size={12} className="text-white" />}
                  </div>
                  All Students
                </button>
                <button
                  type="button"
                  onClick={() => toggleTarget("PARENT")}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all border ${
                    targets.includes("PARENT")
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${targets.includes("PARENT") ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {targets.includes("PARENT") && <Check size={12} className="text-white" />}
                  </div>
                  Parents / Guardians
                </button>
                <button
                  type="button"
                  onClick={() => toggleTarget("TEACHER")}
                  className={`flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border ${
                    targets.includes("TEACHER")
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-colors ${targets.includes("TEACHER") ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {targets.includes("TEACHER") && <Check size={12} className="text-white" />}
                  </div>
                  Teachers
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 items-center">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 sm:py-3.5 text-sm text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending || targets.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {sendMutation.isPending ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Send Announcement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
