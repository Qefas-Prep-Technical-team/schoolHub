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
  const [linkType, setLinkType] = useState<LinkType>('TEACHER_STUDENT');
  const [note, setNote] = useState('');

  const createMutation = useCreateLinkRequest();
  const loading = createMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a linking code or email');
      return;
    }

    createMutation.mutate(
      { targetCode: code.trim(), linkType, note: note.trim() },
      {
        onSuccess: () => {
          toast.success('Connection request sent successfully!');
          onClose();
          setCode('');
          setNote('');
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } }; message?: string };
          toast.error(error?.response?.data?.message || error?.message || 'Failed to connect. Please check the code.');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

        <DialogHeader className="text-left relative z-10">
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-800/60 rounded-2xl flex items-center justify-center mb-3">
            <Link2 className="text-emerald-600 dark:text-emerald-400" size={26} />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">Connect with Code</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Enter a linking code or registered email to establish a secure connection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Connection Type</label>
            <Select value={linkType} onValueChange={(val: string) => setLinkType(val as LinkType)}>
              <SelectTrigger className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3 text-sm focus:ring-green-500 focus:border-green-500 transition-all">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl p-1.5">
                <SelectItem value="TEACHER_STUDENT" className="rounded-lg h-9 text-sm">🎓 Connect with Student</SelectItem>
                <SelectItem value="SCHOOL_STUDENT" className="rounded-lg h-9 text-sm">🏫 Link Student to School</SelectItem>
                <SelectItem value="TEACHER_CLASS" className="rounded-lg h-9 text-sm">👨‍🏫 Teacher to Class</SelectItem>
                <SelectItem value="SCHOOL_TEACHER" className="rounded-lg h-9 text-sm">🏢 Link to School</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 transition-all focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/20">
            <div className="flex items-center gap-1.5 shrink-0">
              <Hash size={14} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Code / Email</span>
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 shrink-0" />
            <input
              value={code}
              onChange={(e) => {
                const val = e.target.value;
                setCode(val);
                const upper = val.trim().toUpperCase();
                if (upper.startsWith('STU-')) setLinkType('TEACHER_STUDENT');
                else if (upper.startsWith('SCH-')) setLinkType('SCHOOL_TEACHER');
                else if (upper.startsWith('CLS-')) setLinkType('TEACHER_CLASS');
                else if (upper.startsWith('TEA-')) setLinkType('SCHOOL_TEACHER');
              }}
              placeholder="e.g. STU-123456, SCH-123456 or email"
              className="flex-1 bg-transparent text-sm font-black tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white outline-none min-w-0"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Note (Optional)</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Linking to my primary account or class"
              className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium focus:ring-green-500 focus:border-green-500 transition-all"
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
                h-10 flex-1 rounded-xl font-bold text-sm cursor-pointer
                text-white transition-all duration-300
                bg-emerald-600 hover:bg-emerald-700
                shadow-lg shadow-emerald-500/25
                dark:bg-gradient-to-r dark:from-emerald-600 dark:to-teal-600
                dark:hover:from-emerald-500 dark:hover:to-teal-500
                dark:shadow-[0_4px_20px_rgba(16,185,129,0.35)]
                dark:hover:shadow-[0_4px_28px_rgba(16,185,129,0.55)]
                hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-60 disabled:pointer-events-none
                ring-1 ring-white/10 dark:ring-emerald-400/20
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
