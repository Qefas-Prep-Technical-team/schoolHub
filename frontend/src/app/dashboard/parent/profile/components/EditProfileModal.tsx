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
      <DialogContent className="sm:max-w-[500px] rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 p-0 overflow-hidden">
        <DialogHeader className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-100 dark:border-orange-500/20">
              <User size={20} className="text-orange-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Edit Profile
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Update your administrative personnel data
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Full Name
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={16} />
                </div>
                <Input
                  id="name"
                  {...register("name")}
                  className="h-11 pl-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-orange-500 focus:ring-orange-500/20 font-medium transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2 opacity-80">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={16} />
                </div>
                <Input
                  id="email"
                  {...register("email")}
                  disabled
                  className="h-11 pl-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 font-medium cursor-not-allowed text-slate-500"
                />
              </div>
              <p className="text-xs font-medium text-slate-500">Email updates require secondary verification.</p>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Phone Number
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone size={16} />
                </div>
                <Input
                  id="phone"
                  {...register("phone")}
                  className="h-11 pl-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:border-orange-500 focus:ring-orange-500/20 font-medium transition-colors"
                  placeholder="+234 800 XXX XXXX"
                />
              </div>
              {errors.phone && <p className="text-xs font-semibold text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-2 flex gap-3">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => reset()}
                disabled={isPending}
                className="flex-1 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isPending}
              className="flex-[2] h-10 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
