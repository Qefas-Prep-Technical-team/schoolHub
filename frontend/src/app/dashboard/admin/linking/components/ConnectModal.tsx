/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link2, Hash, Loader2, Send, Sparkles, CheckCircle2, School, GraduationCap, Users, BookOpen } from 'lucide-react';
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
import { useCreateLinkRequest } from '@/lib/api/hooks/useLinks';
import { LinkType } from '@/lib/api/services/linkService';
import { toast } from 'react-toastify';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectModal({ isOpen, onClose }: ConnectModalProps) {
  const [code, setCode] = useState('');
  const [linkType, setLinkType] = useState<LinkType>('SCHOOL_STUDENT');
  const [note, setNote] = useState('');
  const [detectedType, setDetectedType] = useState<string | null>(null);

  const createMutation = useCreateLinkRequest();
  const loading = createMutation.isPending;

  const handleCodeChange = (val: string) => {
    setCode(val);
    const upper = val.toUpperCase().trim();
    if (upper.startsWith('STU-')) {
      setLinkType('SCHOOL_STUDENT');
      setDetectedType('Student Code');
    } else if (upper.startsWith('TEA-')) {
      setLinkType('SCHOOL_TEACHER');
      setDetectedType('Teacher Code');
    } else if (upper.startsWith('SCH-')) {
      setLinkType('SCHOOL_ADMIN');
      setDetectedType('School Code');
    } else if (upper.startsWith('CLS-')) {
      setLinkType('STUDENT_CLASS');
      setDetectedType('Class Code');
    } else if (upper.includes('@') && upper.includes('.')) {
      setDetectedType('Email Address');
    } else {
      setDetectedType(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a student/teacher code or email');
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
          setDetectedType(null);
        },
        onError: (err: any) => {
          const message =
            err?.response?.data?.message ||
            err?.message ||
            'Failed to send connection request';
          toast.error(message);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-transparent dark:from-indigo-600/25 dark:via-blue-600/15 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-500/10 via-indigo-500/5 to-transparent dark:from-purple-600/20 dark:via-indigo-600/10 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />

        <DialogHeader className="relative z-10 mb-6 text-left">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/80 dark:to-blue-950/80 border border-indigo-100 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
              <Link2 size={26} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Connect with Code
              </DialogTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">
                  Direct Link Engine
                </span>
              </div>
            </div>
          </div>
          <DialogDescription className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
            Connect your school directly to students (including independent learners), teachers, or classes via unique code or email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Connection Type */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between pl-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Connection Type
              </label>
              {detectedType && (
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 animate-fadeIn">
                  <Sparkles size={11} /> {detectedType}
                </span>
              )}
            </div>
            <Select value={linkType} onValueChange={(val: any) => setLinkType(val)}>
              <SelectTrigger className="h-12 sm:h-13 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 px-4 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-semibold text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-1.5 z-50">
                <SelectItem value="SCHOOL_STUDENT" className="rounded-xl h-11 text-slate-800 dark:text-slate-200 focus:bg-indigo-50 dark:focus:bg-indigo-950/60 focus:text-indigo-600 dark:focus:text-indigo-300 font-semibold cursor-pointer">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-indigo-500 dark:text-indigo-400" />
                    <span>School to Student</span>
                  </div>
                </SelectItem>
                <SelectItem value="SCHOOL_TEACHER" className="rounded-xl h-11 text-slate-800 dark:text-slate-200 focus:bg-indigo-50 dark:focus:bg-indigo-950/60 focus:text-indigo-600 dark:focus:text-indigo-300 font-semibold cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-blue-500 dark:text-blue-400" />
                    <span>School to Teacher</span>
                  </div>
                </SelectItem>
                <SelectItem value="SCHOOL_ADMIN" className="rounded-xl h-11 text-slate-800 dark:text-slate-200 focus:bg-indigo-50 dark:focus:bg-indigo-950/60 focus:text-indigo-600 dark:focus:text-indigo-300 font-semibold cursor-pointer">
                  <div className="flex items-center gap-2">
                    <School size={16} className="text-purple-500 dark:text-purple-400" />
                    <span>School to Admin</span>
                  </div>
                </SelectItem>
                <SelectItem value="TEACHER_CLASS" className="rounded-xl h-11 text-slate-800 dark:text-slate-200 focus:bg-indigo-50 dark:focus:bg-indigo-950/60 focus:text-indigo-600 dark:focus:text-indigo-300 font-semibold cursor-pointer">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-amber-500 dark:text-amber-400" />
                    <span>Teacher to Class</span>
                  </div>
                </SelectItem>
                <SelectItem value="STUDENT_CLASS" className="rounded-xl h-11 text-slate-800 dark:text-slate-200 focus:bg-indigo-50 dark:focus:bg-indigo-950/60 focus:text-indigo-600 dark:focus:text-indigo-300 font-semibold cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    <span>Student to Class</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Code or Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">
              Code or Email
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                <Hash size={18} />
              </div>
              <Input 
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="STU-123456 or user@email.com"
                className="h-12 sm:h-13 pl-11 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-semibold focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm tracking-wide"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pl-1 pt-0.5">
              <span className="font-medium">Supported prefixes:</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">STU-</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">TEA-</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-semibold">CLS-</span>
              <span className="text-slate-400 dark:text-slate-500">or Email</span>
            </div>
          </div>

          {/* Note (Optional) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">
              Note (Optional)
            </label>
            <Input 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Official school invitation or class enrollment"
              className="h-12 sm:h-13 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/70 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-sm"
            />
          </div>

          {/* Action Footer */}
          <DialogFooter className="pt-3 flex flex-row items-center gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="h-12 sm:h-13 px-5 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !code.trim()}
              className="group h-12 sm:h-13 flex-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 dark:from-indigo-600 dark:via-blue-600 dark:to-indigo-500 dark:hover:from-indigo-500 dark:hover:via-blue-500 dark:hover:to-indigo-400 text-white font-bold shadow-lg shadow-indigo-600/25 dark:shadow-[0_4px_24px_rgba(99,102,241,0.45)] hover:shadow-indigo-600/35 dark:hover:shadow-[0_6px_32px_rgba(99,102,241,0.6)] ring-1 ring-white/20 dark:ring-indigo-400/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Sending Request...</span>
                </>
              ) : (
                <>
                  <span>Send Request</span>
                  <Send size={16} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
