import React, { useState } from 'react';
import { Link2, Hash, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { LinkType } from '@/lib/api/services/linkService';
import { useCreateLinkRequest } from '@/lib/api/hooks/useLinks';

export function TeacherConnectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [code, setCode] = useState('');
  const [linkType, setLinkType] = useState<LinkType>('SCHOOL_TEACHER');
  const [note, setNote] = useState('');

  const createMutation = useCreateLinkRequest();
  const loading = createMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a linking code');
      return;
    }

    createMutation.mutate(
      { targetCode: code.trim(), linkType, note: note.trim() },
      {
        onSuccess: () => {
          onClose();
          setCode('');
          setNote('');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-8 border-none overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />

        <DialogHeader className="relative z-10 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Link2 className="text-primary" size={32} />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight leading-tight">Connect with Code</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
            Enter a linking code to establish a secure connection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Connection Type</label>
            <Select value={linkType} onValueChange={(val: string) => setLinkType(val as LinkType)}>
              <SelectTrigger className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3 text-sm focus:ring-primary focus:border-primary transition-all">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl p-1.5">
                <SelectItem value="TEACHER_CLASS" className="rounded-lg h-9 text-sm">👨‍🏫 Teacher to Class</SelectItem>
                <SelectItem value="SCHOOL_TEACHER" className="rounded-lg h-9 text-sm">🏫 Link to School</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <div className="flex items-center gap-1.5 shrink-0">
              <Hash size={14} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Code</span>
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABC-123-XYZ"
              className="flex-1 bg-transparent text-sm font-black tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white outline-none min-w-0"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Note (Optional)</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Linking to my primary account"
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-10 px-5 rounded-xl font-black text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={loading}
              className="
                inline-flex items-center justify-center gap-2
                h-10 flex-1 rounded-xl font-black text-sm cursor-pointer
                text-white transition-all duration-300
                bg-primary hover:bg-primary/90
                shadow-lg shadow-primary/25
                dark:bg-gradient-to-r dark:from-indigo-500 dark:to-violet-600
                dark:hover:from-indigo-400 dark:hover:to-violet-500
                dark:shadow-[0_4px_20px_rgba(99,102,241,0.35)]
                dark:hover:shadow-[0_4px_28px_rgba(99,102,241,0.55)]
                hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-60 disabled:pointer-events-none
              "
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Send Request'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
