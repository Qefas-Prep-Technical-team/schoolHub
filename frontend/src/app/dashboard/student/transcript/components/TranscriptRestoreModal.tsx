import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldCheck, Key } from "lucide-react";

interface TranscriptRestoreModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  restoreInput: string;
  setRestoreInput: (val: string) => void;
  isRestoring: boolean;
  onRestoreAccess: () => void;
}

export function TranscriptRestoreModal({
  isOpen,
  onOpenChange,
  restoreInput,
  setRestoreInput,
  isRestoring,
  onRestoreAccess,
}: TranscriptRestoreModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Key size={22} />
          </div>
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
            Restore Official Transcript Access
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            Paste your payment reference or 30-day pass link below to restore full access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <Input
            placeholder="e.g. TRX-172938... or paste pass link"
            value={restoreInput}
            onChange={(e) => setRestoreInput(e.target.value)}
            className="h-11 rounded-xl text-xs font-semibold"
          />
          <Button
            onClick={onRestoreAccess}
            disabled={isRestoring || !restoreInput.trim()}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 cursor-pointer"
          >
            <ShieldCheck size={14} />
            <span>
              {isRestoring ? "Validating Clearance..." : "Validate & Unlock Transcript"}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

