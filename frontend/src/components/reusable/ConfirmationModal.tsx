import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: 'default' | 'destructive';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = 'default'
}: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 border-none overflow-hidden bg-white dark:bg-slate-900">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        
        <DialogHeader className="relative z-10 mb-6">
          <div className={`w-16 h-16 ${variant === 'destructive' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'} rounded-2xl flex items-center justify-center mb-4`}>
            <AlertCircle size={32} />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight leading-tight">{title}</DialogTitle>
          <DialogDescription className="text-sm font-medium text-gray-500 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="relative z-10 pt-4 flex gap-3 sm:gap-0">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            disabled={isLoading}
            className="h-14 flex-1 rounded-2xl font-black text-gray-500 hover:bg-gray-100"
          >
            {cancelText}
          </Button>
          <Button 
            type="button" 
            disabled={isLoading}
            onClick={onConfirm}
            className={`h-14 flex-1 rounded-2xl ${variant === 'destructive' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' : 'bg-primary hover:scale-[1.02] shadow-primary/25'} text-white font-black shadow-lg active:scale-[0.98] transition-all`}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
