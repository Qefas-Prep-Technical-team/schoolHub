'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUpdateParentProfile } from '@/lib/api/hooks/useParent';
import { Loader2, User, Phone, Mail } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { mutate: updateProfile, isPending } = useUpdateParentProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
    }
  });

  // Reset form when user data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-transparent pointer-events-none" />
        
        <DialogHeader className="p-8 pb-4 relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20">
              <User size={20} className="text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                Registry Edit
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                Update your administrative personnel data
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-4 space-y-8 relative z-10">
          <div className="space-y-6">
            {/* Name Field */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Full Name
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                  <User size={18} />
                </div>
                <Input
                  id="name"
                  {...register("name")}
                  className="h-14 pl-12 rounded-2xl border-2 border-slate-100 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-orange-500/50 focus:ring-0 font-bold transition-all"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.name.message}</p>}
            </div>

            {/* Email Field (ReadOnly or restricted depending on business logic) */}
            <div className="space-y-3 opacity-70">
              <Label htmlFor="email" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Communication Node (Email)
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <Input
                  id="email"
                  {...register("email")}
                  disabled
                  className="h-14 pl-12 rounded-2xl border-2 border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] font-bold cursor-not-allowed"
                />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Email updates require secondary verification.</p>
            </div>

            {/* Phone Field */}
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Mobile Link (Phone)
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                  <Phone size={18} />
                </div>
                <Input
                  id="phone"
                  {...register("phone")}
                  className="h-14 pl-12 rounded-2xl border-2 border-slate-100 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-orange-500/50 focus:ring-0 font-bold transition-all"
                  placeholder="+234 800 XXX XXXX"
                />
              </div>
              {errors.phone && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">{errors.phone.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-4 flex flex-row gap-3">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => reset()}
                disabled={isPending}
                className="flex-1 h-14 rounded-2xl border-2 border-slate-200 dark:border-white/10 font-black text-xs uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isPending}
              className="flex-[2] h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-600/20 transition-all font-black text-xs uppercase tracking-widest active:scale-95 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Synchronizing...
                </>
              ) : (
                "Update Registry"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
