import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
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

interface StudentConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentConnectModal({ isOpen, onClose }: StudentConnectModalProps) {
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');
  const [linkType, setLinkType] = useState('STUDENT_CLASS');
  
  const createMutation = useCreateLinkRequest();
  const joinClassMutation = useRequestToJoinClass();
  const { data: studentProfile } = useStudentProfile();
  
  const connectedSchool = studentProfile?.school;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCode = linkType === 'STUDENT_CLASS' ? code.toUpperCase() : 
                         (linkType === 'SCHOOL_STUDENT' ? code.toLowerCase() : code);
    
    if (linkType === 'STUDENT_CLASS') {
      joinClassMutation.mutate(
        { classCode: formattedCode, note },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(
        { targetCode: formattedCode, linkType: linkType as any, note },
        { onSuccess: onClose }
      );
    }
  };

  const isPending = createMutation.isPending || joinClassMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-8 border-none bg-white dark:bg-slate-900">
        <DialogHeader className="text-left space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600">
            <Link2 size={28} />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">Expand Your Network</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Link up with your school, join a new classroom, or connect with your parents using a secure code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleConnect} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Connection Type</label>
            <Select value={linkType} onValueChange={(val) => {
              setLinkType(val);
              setCode(''); 
            }}>
              <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="STUDENT_CLASS">🎓 Student to Class</SelectItem>
                <SelectItem value="SCHOOL_STUDENT">🏫 Student to School</SelectItem>
                <SelectItem value="PARENT_STUDENT">👪 Student to Parent</SelectItem>
              </SelectContent>
            </Select>
            {linkType === 'SCHOOL_STUDENT' && connectedSchool && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 leading-relaxed">
                  Note: You are already connected to <span className="font-black uppercase tracking-tight">{connectedSchool.name}</span>. Linking to a new school may override your current academic affiliation.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Secure Code</label>
            <Input 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              placeholder={
                linkType === 'STUDENT_CLASS' ? 'e.g. MATH101' : 
                (linkType === 'SCHOOL_STUDENT' ? 'e.g. school-code' : 'e.g. parent-code')
              } 
              className="h-12 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 font-mono tracking-widest uppercase"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Note <span className="text-slate-300 lowercase font-normal">(Optional)</span></label>
            <Input 
              value={note} 
              onChange={(e) => setNote(e.target.value)}
              placeholder="Hi, I'm joining your class..." 
              className="h-12 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-12 font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !code.trim()}
              className="flex-1 rounded-xl h-12 bg-pink-600 hover:bg-pink-700 text-white font-bold shadow-lg shadow-pink-200"
            >
              {isPending ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
