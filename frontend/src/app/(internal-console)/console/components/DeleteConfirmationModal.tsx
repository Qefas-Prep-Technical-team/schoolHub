"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { adminPassword: string; reason?: string }) => Promise<void> | void;
  entityName: string;
  entityType: "School" | "Student" | "Teacher" | "Parent" | "Admin" | "User";
  identifier?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  entityName,
  entityType,
  identifier,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const [adminPassword, setAdminPassword] = useState("");
  const [reason, setReason] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) return;
    await onConfirm({ adminPassword, reason });
  };

  const handleClose = () => {
    if (isLoading) return;
    setAdminPassword("");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-2xl bg-white dark:bg-zinc-950 border border-red-200/80 dark:border-red-950 shadow-2xl p-6">
        <DialogHeader className="space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
            <Trash2 size={24} />
          </div>
          <DialogTitle className="text-xl font-black text-zinc-900 dark:text-white">
            Permanently Delete {entityType}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            You are about to permanently purge <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{entityName}</strong>
            {identifier && ` (${identifier})`} from the primary platform database.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 p-3.5 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 flex gap-3 text-xs text-red-800 dark:text-red-300">
          <ShieldAlert className="shrink-0 text-red-600 dark:text-red-400" size={18} />
          <p className="leading-relaxed font-medium">
            <strong>Irreversible Action:</strong> This user record alone will be permanently destroyed. Related device sessions, login tokens, and links will be cleanly unlinked. This action will be recorded in the Platform Audit Log.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Staff Administrator Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your console login password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="h-10 pr-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-xs text-zinc-900 dark:text-zinc-100 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Reason for Deletion <span className="text-zinc-400 font-normal">(Optional)</span>
            </Label>
            <Input
              type="text"
              placeholder="e.g. Compliance request, duplicate account, GDPR ticket"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-10 rounded-xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 text-xs text-zinc-900 dark:text-zinc-100 font-medium"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="h-10 rounded-xl font-bold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !adminPassword.trim()}
              className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={14} />
                  Purging Record...
                </>
              ) : (
                `Permanently Delete ${entityType}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
