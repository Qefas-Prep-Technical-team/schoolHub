'use client';

import React, { useState, useEffect } from 'react';
import { Link2, AlertCircle, School, GraduationCap, Users } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateLinkRequest } from '@/lib/api/hooks/useLinks';
import { useRequestToJoinClass } from '@/lib/api/hooks/useClasses';
import { useStudentProfile } from '@/lib/api/hooks/useStudent';
import { toast } from 'react-toastify';

interface StudentConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLinkType?: string;
}

export function StudentConnectModal({ isOpen, onClose, defaultLinkType }: StudentConnectModalProps) {
  const { data: studentProfile } = useStudentProfile();
  const connectedSchool = studentProfile?.school || (studentProfile?.schoolId ? { name: 'Connected School' } : null);

  const [code, setCode] = useState('');
  const [note, setNote] = useState('');
  const [linkType, setLinkType] = useState<string>(() => {
    if (defaultLinkType) return defaultLinkType;
    return connectedSchool ? 'STUDENT_CLASS' : 'SCHOOL_STUDENT';
  });
  
  const createMutation = useCreateLinkRequest();
  const joinClassMutation = useRequestToJoinClass();

  // Reset or initialize default link type when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode('');
      setNote('');
      if (defaultLinkType) {
        setLinkType(defaultLinkType);
      } else if (!connectedSchool) {
        setLinkType('SCHOOL_STUDENT');
      } else {
        setLinkType('STUDENT_CLASS');
      }
    }
  }, [isOpen, connectedSchool, defaultLinkType]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCode(val);
    const clean = val.trim().toUpperCase();
    if (clean.startsWith('SCH-') || clean.startsWith('SCH_')) {
      if (linkType !== 'SCHOOL_STUDENT') {
        setLinkType('SCHOOL_STUDENT');
      }
    } else if (clean.startsWith('PAR-') || clean.startsWith('PAR_')) {
      if (linkType !== 'PARENT_STUDENT') {
        setLinkType('PARENT_STUDENT');
      }
    }
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode) return;

    if (linkType === 'STUDENT_CLASS') {
      joinClassMutation.mutate(
        { classCode: trimmedCode.toUpperCase(), note },
        { 
          onSuccess: () => {
            toast.success("Class join request sent successfully!");
            onClose();
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.message || "Failed to join class";
            toast.error(msg);
          }
        }
      );
    } else {
      createMutation.mutate(
        { targetCode: trimmedCode, linkType: linkType as any, note },
        { 
          onSuccess: () => {
            toast.success("Connection request sent successfully!");
            onClose();
          },
          onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.message || "Failed to send connection request";
            toast.error(msg);
          }
        }
      );
    }
  };

  const isPending = createMutation.isPending || joinClassMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-6 sm:p-7 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
        <DialogHeader className="text-left space-y-2.5">
          <div className="h-12 w-12 rounded-2xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <Link2 size={24} />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Expand Your Network
          </DialogTitle>
          <DialogDescription className="font-normal text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Link up with your school, join a new classroom, or connect with your parents using a secure code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConnect} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Connection Type
            </label>
            <Select value={linkType} onValueChange={(val) => {
              setLinkType(val);
              setCode(''); 
            }}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <SelectItem value="SCHOOL_STUDENT">🏫 Student to School</SelectItem>
                <SelectItem value="STUDENT_CLASS">🎓 Student to Classroom</SelectItem>
                <SelectItem value="PARENT_STUDENT">👪 Student to Parent</SelectItem>
              </SelectContent>
            </Select>

            {/* Informational tip if user selects STUDENT_CLASS without being connected to a school */}
            {linkType === 'STUDENT_CLASS' && !connectedSchool && (
              <div className="mt-2.5 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl space-y-1.5 animate-in fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 leading-relaxed">
                    Note: Joining a school class will automatically connect you to that school once your request is accepted.
                  </p>
                </div>
              </div>
            )}

            {linkType === 'SCHOOL_STUDENT' && connectedSchool && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                  Note: You are already connected to <span className="font-bold uppercase tracking-tight">{connectedSchool.name}</span>. Linking to a new school may update your current affiliation.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {linkType === 'SCHOOL_STUDENT' ? 'School Code' : 
               linkType === 'STUDENT_CLASS' ? 'Classroom Code' : 'Parent Code'}
            </label>
            <Input 
              value={code} 
              onChange={handleCodeChange}
              placeholder={
                linkType === 'SCHOOL_STUDENT' ? 'e.g. SCH-XXXXXX' : 
                (linkType === 'STUDENT_CLASS' ? 'e.g. MATH101' : 'e.g. PAR-XXXXXX')
              } 
              className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 font-mono tracking-wider uppercase text-zinc-900 dark:text-zinc-100"
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Personal Note <span className="text-zinc-400 lowercase font-normal">(Optional)</span>
            </label>
            <Input 
              value={note} 
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                linkType === 'SCHOOL_STUDENT' ? "Hi, I am connecting to my school..." :
                linkType === 'STUDENT_CLASS' ? "Hi, I am joining your class..." :
                "Hi, linking parent account..."
              } 
              className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs"
            />
          </div>

          <div className="pt-3 flex gap-2.5">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 rounded-xl h-11 font-bold text-xs border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-850"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !code.trim()}
              className="flex-1 rounded-xl h-11 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20"
            >
              {isPending ? 'Connecting...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
