"use client";

import React, { useState } from "react";
import { X, Send, Megaphone, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { classService } from "@/lib/api/services/classService";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  AnnouncementAudienceFields,
  AnnouncementPriority,
} from "./announcement/AnnouncementAudienceFields";

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
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targets, setTargets] = useState<string[]>([
    "STUDENT",
    "TEACHER",
    "PARENT",
  ]);
  const [priority, setPriority] = useState<AnnouncementPriority>("NORMAL");

  const queryClient = useQueryClient();

  const toggleTarget = (target: string) => {
    setTargets((prev) =>
      prev.includes(target)
        ? prev.length > 1
          ? prev.filter((t) => t !== target)
          : prev
        : [...prev, target],
    );
  };

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Announcement title is required.");
      if (!message.trim())
        throw new Error("Announcement message body is required.");
      if (targets.length === 0)
        throw new Error("Please select at least one recipient audience.");

      const targetClassIds =
        selectedClassId === "ALL"
          ? classes.map((c) => c.id)
          : [selectedClassId];

      if (targetClassIds.length === 0) {
        throw new Error(
          "Please ensure there is at least one active class in your school to broadcast to.",
        );
      }

      return Promise.all(
        targetClassIds.map((cId) =>
          classService.sendAnnouncement(cId, {
            title: title.trim(),
            message: message.trim(),
            targets,
            priority,
          }),
        ),
      );
    },
    onSuccess: () => {
      const cohortText =
        selectedClassId === "ALL"
          ? `the entire school across ${classes.length} class cohorts`
          : classes.find((c) => c.id === selectedClassId)?.name ||
          "the selected class";

      toast.success(`Announcement broadcasted to ${cohortText}!`);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setTitle("");
      setMessage("");
      setPriority("NORMAL");
      onClose();
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to broadcast announcement. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Broadcast error");
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
                  <span className="text-xs text-white/80 font-medium truncate max-w-[200px]">
                    {schoolName}
                  </span>
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
          <AnnouncementAudienceFields
            targets={targets}
            onToggleTarget={toggleTarget}
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClassId={setSelectedClassId}
            priority={priority}
            onSelectPriority={setPriority}
          />

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
              disabled={
                sendMutation.isPending || !title.trim() || !message.trim()
              }
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
