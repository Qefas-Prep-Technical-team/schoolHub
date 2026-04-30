'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Camera, Save, X } from 'lucide-react';
import { useUpdateChild } from '@/lib/api/hooks/useParentChildren';
import { useToast } from '@/lib/hooks/useToast';
import Image from 'next/image';

interface EditChildModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  child: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export default function EditChildModal({ isOpen, onOpenChange, child }: EditChildModalProps) {
  const [name, setName] = useState(child.name);
  const [imageUrl, setImageUrl] = useState(child.imageUrl);
  const { mutate: updateChild, isPending } = useUpdateChild();
  const toast = useToast();

  useEffect(() => {
    setName(child.name);
    setImageUrl(child.imageUrl);
  }, [child]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error.validation("Node identifier (name) cannot be empty");
      return;
    }

    updateChild({ 
      childId: child.id, 
      data: { name, profileImage: imageUrl } 
    }, {
      onSuccess: () => {
        toast.success.show("Student node updated successfully");
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error.show(error.message || "Failed to update node");
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 border-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl rounded-[3rem] overflow-hidden shadow-2xl">
        <DialogHeader className="p-10 pb-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-2xl shadow-xl shadow-orange-600/20">
              <User size={20} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Node Identity</DialogTitle>
              <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Configure linked student parameters</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="size-32 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-800 relative">
                <Image 
                  src={imageUrl || placeholderUrl} 
                  alt={name} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
                />
              </div>
              <label 
                htmlFor="child-image-upload" 
                className="absolute -bottom-2 -right-2 p-3 bg-orange-600 rounded-2xl text-white shadow-xl hover:bg-orange-700 transition-all cursor-pointer hover:scale-110 active:scale-95"
              >
                <Camera size={20} />
              </label>
              <input 
                id="child-image-upload" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Update Visual ID</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Legal Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter child's name"
                  className="h-16 pl-12 rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-bold text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 flex-col sm:flex-row gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-16 flex-1 rounded-2xl border-2 border-slate-200 dark:border-white/10 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
            >
              <X size={18} className="mr-2" /> Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="h-16 flex-1 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-600/20 font-black text-xs uppercase tracking-widest transition-all active:scale-95 group"
            >
              {isPending ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Syncing</span>
              ) : (
                <span className="flex items-center gap-2"><Save size={18} className="group-hover:translate-y-[-2px] transition-transform" /> Save Node</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
