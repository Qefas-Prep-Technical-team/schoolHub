'use client';

import React, { useState } from 'react';
import { X, Send, Megaphone, Users, AlertCircle, Check, Sparkles, Building2 } from 'lucide-react';
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

interface AdminAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  schoolName: string;
}

export default function AdminAnnouncementModal({
  isOpen,
  onClose,
  classes = [],
  schoolName,
}: AdminAnnouncementModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targets, setTargets] = useState<string[]>(['STUDENT', 'TEACHER', 'PARENT']);
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');

  const queryClient = useQueryClient();

  const toggleTarget = (target: string) => {
    setTargets((prev) =>
      prev.includes(target)
        ? prev.length > 1
          ? prev.filter((t) => t !== target)
          : prev
        : [...prev, target]
    );
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error('Announcement title is required.');
      if (!message.trim()) throw new Error('Announcement message body is required.');
      if (targets.length === 0) throw new Error('Please select at least one recipient audience.');

      const targetClassIds =
        selectedClassId === 'ALL'
          ? classes.map((c) => c.id)
          : [selectedClassId];

      if (targetClassIds.length === 0) {
        throw new Error('Please ensure there is at least one active class in your school to broadcast to.');
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
          ? `the entire school across ${classes.length} class cohorts`
          : classes.find((c) => c.id === selectedClassId)?.name || 'the selected class';

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
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 my-auto flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 px-6 py-6 sm:px-8 sm:py-7 text-white shrink-0">
          <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-md shrink-0">
                <Megaphone size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/20 text-white">
                    Official Notice
                  </span>
                  <span className="text-xs text-white/80 font-medium truncate max-w-[200px]">{schoolName}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                  School-Wide Announcement
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={sendMutation.isPending}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
          {/* Target Audience Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Recipient Audience
            </label>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {[
                { id: 'STUDENT', label: 'Students', desc: 'All enrolled learners' },
                { id: 'TEACHER', label: 'Teachers', desc: 'Teaching staff' },
                { id: 'PARENT', label: 'Parents', desc: 'Guardians' },
              ].map((grp) => {
                const isSelected = targets.includes(grp.id);
                return (
                  <button
                    key={grp.id}
                    type="button"
                    onClick={() => toggleTarget(grp.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-bold">{grp.label}</span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check size={11} strokeWidth={3} />}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">{grp.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class Cohort Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Target Class Cohort
              </label>
              <span className="text-[10px] font-bold text-slate-400">
                {classes.length} Available Classes
              </span>
            </div>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="ALL">All Classes (Entire School Broadcast)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section ? `(${c.section})` : ''} {c.studentCount ? `— ${c.studentCount} students` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Pill Radios */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Notice Urgency Level
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'NORMAL', label: 'Standard', color: 'blue' },
                { id: 'HIGH', label: 'Important', color: 'amber' },
                { id: 'URGENT', label: 'Urgent', color: 'rose' },
              ].map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as any)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                      isSelected
                        ? p.color === 'rose'
                          ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          : p.color === 'amber'
                          ? 'bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Subject Line / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Mid-Term Examination Schedule & School Closure"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Announcement Message Body <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Write the full announcement message here. All targeted recipients will receive an immediate push notice on their dashboards and alerts feed..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            <Sparkles size={13} className="text-blue-500" />
            Notifies selected cohorts across school
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={sendMutation.isPending}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending || !title.trim() || !message.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer"
            >
              {sendMutation.isPending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Broadcasting...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Broadcast Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
