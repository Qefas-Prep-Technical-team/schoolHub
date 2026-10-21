'use client';

import React, { useState } from 'react';
import { X, Send, Megaphone, Users, AlertCircle, Check, Sparkles } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '@/lib/api/services/classService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export interface ClassItem {
  id: string;
  name: string;
  section?: string;
  studentCount?: number;
  classCode?: string;
}

interface TeacherAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  defaultClassId?: string;
}

export default function TeacherAnnouncementModal({
  isOpen,
  onClose,
  classes,
  defaultClassId,
}: TeacherAnnouncementModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    defaultClassId || (classes.length === 1 ? classes[0].id : 'ALL')
  );
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targets, setTargets] = useState<string[]>(['STUDENT', 'PARENT']);
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  const queryClient = useQueryClient();

  const toggleTarget = (target: string) => {
    setTargets((prev) =>
      prev.includes(target)
        ? prev.length > 1
          ? prev.filter((t) => t !== target)
          : prev // keep at least one
        : [...prev, target]
    );
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('Announcement title is required.');
      if (!message.trim()) throw new Error('Announcement message body is required.');
      if (targets.length === 0) throw new Error('Please select at least one recipient audience.');

      if (classes.length === 0) {
        throw new Error('You do not have any assigned classes to announce to.');
      }

      const targetClassIds =
        selectedClassId === 'ALL'
          ? classes.map((c) => c.id)
          : [selectedClassId];

      if (targetClassIds.length === 0) {
        throw new Error('Please select a valid class cohort.');
      }

      // Dispatch announcement to selected classes
      const results = await Promise.all(
        targetClassIds.map((cId) =>
          classService.sendAnnouncement(cId, {
            title: title.trim(),
            message: message.trim(),
            targets,
            priority,
          })
        )
      );

      return results;
    },
    onSuccess: () => {
      const cohortText =
        selectedClassId === 'ALL'
          ? `all ${classes.length} assigned classes`
          : classes.find((c) => c.id === selectedClassId)?.name || 'the class';

      toast.success(`Announcement broadcasted to ${cohortText}!`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setTitle('');
      setMessage('');
      setPriority('NORMAL');
      onClose();
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to broadcast announcement. Please try again.';
      toast.error(typeof msg === 'string' ? msg : 'Broadcast error');
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center z-[100] p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-5 sm:p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner">
                <Megaphone size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight">Class Announcement</h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 text-[9px] font-black uppercase tracking-widest">
                    Teacher Broadcast
                  </span>
                </div>
                <p className="text-xs text-emerald-100/80 font-medium mt-0.5">
                  Publish instant updates directly to your students and parents
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Form */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          {/* Class Cohort Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Target Cohort
            </label>
            {classes.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} />
                No classes assigned to your profile yet.
              </div>
            ) : (
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                {classes.length > 1 && (
                  <option value="ALL">
                    All My Assigned Classes ({classes.length} Classes)
                  </option>
                )}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section ? `(${c.section})` : ''} — {c.studentCount ?? 0} Students
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Recipients & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Target Audience */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Recipient Audience
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'STUDENT', label: 'Students' },
                  { id: 'PARENT', label: 'Parents' },
                ].map((aud) => {
                  const isChecked = targets.includes(aud.id);
                  return (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => toggleTarget(aud.id)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isChecked
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-white ${
                          isChecked ? 'bg-emerald-600' : 'border border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && <Check size={10} strokeWidth={3} />}
                      </div>
                      <span>{aud.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <div className="flex gap-1.5">
                {(['NORMAL', 'HIGH', 'URGENT'] as const).map((p) => {
                  const isSel = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 px-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                        isSel
                          ? p === 'URGENT'
                            ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                            : p === 'HIGH'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Announcement Title */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Subject / Title
            </label>
            <input
              type="text"
              placeholder="e.g., Mid-Term Assessment Schedule & Revision Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Message Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Announcement Body
              </label>
              <span className="text-[10px] font-medium text-slate-400">
                {message.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              placeholder="Write your announcement details here. Mention any upcoming dates, requirements, or study materials..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={sendMutation.isPending}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending || classes.length === 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {sendMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Broadcasting...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Publish Announcement</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
