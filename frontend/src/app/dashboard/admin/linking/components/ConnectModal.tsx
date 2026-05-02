/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link2, Hash, Loader2 } from 'lucide-react';
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
  const [linkType, setLinkType] = useState<LinkType>('SCHOOL_ADMIN');
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
          <DialogTitle className="text-2xl font-black tracking-tight line-height-1">Connect with Code</DialogTitle>
          <DialogDescription className="text-sm font-medium text-gray-500 mt-2">
            Enter a unique linking code to established a secure connection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Connection Type</label>
            <Select value={linkType} onValueChange={(val: any) => setLinkType(val)}>
              <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 px-4 focus:ring-primary focus:border-primary transition-all">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                <SelectItem value="SCHOOL_ADMIN" className="rounded-xl h-12">🏫 School to Admin</SelectItem>
                <SelectItem value="SCHOOL_TEACHER" className="rounded-xl h-12">🏫 School to Teacher </SelectItem>
                <SelectItem value="SCHOOL_STUDENT" className="rounded-xl h-12">🏫 School to Student </SelectItem>
                <SelectItem value="TEACHER_CLASS" className="rounded-xl h-12">👨‍🏫 Teacher to Class</SelectItem>
                <SelectItem value="STUDENT_CLASS" className="rounded-xl h-12">🎓 Student to Class</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Linking Code</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC-123-XYZ"
                className="h-14 pl-12 rounded-2xl border-2 border-gray-100 bg-gray-50/50 font-black tracking-widest placeholder:tracking-normal placeholder:font-medium focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <p className="text-[10px] text-gray-400 pl-1 font-bold">Case-insensitive. Codes usually look like ABC-123.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">Note (Optional)</label>
            <Input 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Linking to my primary school account"
              className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50/50 font-medium focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="h-14 px-6 rounded-2xl font-black text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-14 flex-1 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

