"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2, Sparkles, ShieldAlert } from "lucide-react";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DeleteSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  subjectName?: string;
  selectedCount?: number;
}

const DeleteSubjectModal: React.FC<DeleteSubjectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subjectName,
  selectedCount,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || "#2563eb";

  const isBulk = !!selectedCount && selectedCount > 0;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to delete subject:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!isDeleting) onClose();
    }}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-[0_30px_70px_rgba(0,0,0,0.2)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.6)] bg-white dark:bg-slate-900 rounded-[3rem] transition-colors duration-500">
        <div className="relative p-10 flex flex-col items-center text-center">
          {/* Dynamic Ambient Background Glow */}
          <div
            className="absolute -top-20 w-72 h-72 rounded-full blur-[80px] opacity-[0.08] transition-opacity duration-700 pointer-events-none"
            style={{ backgroundColor: isDeleting ? primaryColor : "#ef4444" }}
          />

          <AnimatePresence mode="wait">
            {isDeleting ? (
              <motion.div
                key="loading-stage"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full py-8 flex flex-col items-center justify-center gap-6"
              >
                {/* Visual Loading Stage */}
                <div className="relative size-24 flex items-center justify-center">
                  {/* Rotating Premium Spinner */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[3.5px] border-slate-100 dark:border-white/5"
                    style={{ borderTopColor: primaryColor }}
                  />
                  <Trash2 className="size-8 text-slate-400 animate-pulse" />
                </div>

                <div className="space-y-2 mt-2">
                  <h3 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    Archiving Curriculum
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm max-w-[280px] mx-auto leading-relaxed">
                    {isBulk
                      ? `Removing ${selectedCount} selected subjects from school records...`
                      : `Safely archiving "${subjectName}" and removing references...`}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm-stage"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full flex flex-col items-center"
              >
                {/* Visual Icon Header with gradient ring */}
                <div className="size-20 rounded-[1.8rem] bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center text-red-500 shadow-inner mb-6">
                  <ShieldAlert size={36} strokeWidth={2.2} />
                </div>

                <DialogHeader className="space-y-3 mb-8 w-full">
                  <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">
                    Confirm Deletion
                  </DialogTitle>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm px-4 leading-relaxed">
                    {isBulk ? (
                      <>
                        Are you sure you want to delete and archive the{" "}
                        <span className="font-black text-red-500 uppercase">
                          {selectedCount} selected subjects
                        </span>
                        ? This will safely remove them from all active school classes.
                      </>
                    ) : (
                      <>
                        Are you sure you want to archive{" "}
                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                          "{subjectName}"
                        </span>
                        ? This action will remove it from all active curriculum references.
                      </>
                    )}
                  </p>
                </DialogHeader>

                <DialogFooter className="w-full flex flex-row gap-4 justify-center items-center mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-red-500/20 active:scale-95 transition-all border-none"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                    Confirm
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSubjectModal;
