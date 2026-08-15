'use client';

import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Users,
  Settings,
  BellRing,
  ChevronRight,
  Camera,
  LogOut,
  CreditCard,
  History,
  Lock,
  Smartphone,
  Globe,
  Wallet,
  Activity,
  Shield,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import { useLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { imageService } from '@/lib/api/services/imageService';
import { useUpdateParentProfile } from '@/lib/api/hooks/useParent';
import { useToast } from '@/lib/hooks/useToast';
import EditProfileModal from './components/EditProfileModal';
import { useParentChildren } from '@/lib/api/hooks/useParentChildren';
import { usePublicPlatformSettings } from '@/lib/api/hooks/usePlatformGovernance';

export default function ParentProfilePage() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogoutMutation();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateParentProfile();
  const toast = useToast();
  const { data: settings } = usePublicPlatformSettings();

  // Check if subscription enforcement is enabled for parents
  const isSubscriptionEnforced = settings?.sub_enforced_parents !== "false"

  const [imgError, setImgError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: children = [], isLoading: isLoadingChildren } = useParentChildren();

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in duration-1000">
      <div className="w-32 h-32 bg-orange-100 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center">
        <Lock className="w-16 h-16 text-orange-500" />
      </div>
      <div className="text-center">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Session Expired</h3>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2">Please re-authenticate to view your profile.</p>
      </div>
    </div>
  );

  const handleImageClick = () => {
    if (isUploading || isUpdating) return;
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error.validation("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error.validation("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const { publicUrl } = await imageService.proxyUploadToBunny(file);

      updateProfile({ profileImage: publicUrl }, {
        onSuccess: () => {
          setImgError(false);
          setIsUploading(false);
        },
        onError: () => {
          setIsUploading(false);
        }
      });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error.show("Failed to upload image. Please try again.");
      setIsUploading(false);
    }
  };

  const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;
  const displayImage = (!imgError && user.profileImage && user.profileImage !== "null" && user.profileImage !== "")
    ? user.profileImage
    : placeholderUrl;

  return (
    <div className="space-y-12 pb-12 p-4 md:p-0 animate-in fade-in duration-700">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* Console Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            <span>Parent Portal</span>
            <ChevronRight size={10} className="text-orange-500" />
            <span className="text-orange-600">Profile</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-600 rounded-2xl shadow-2xl shadow-orange-600/30">
              <User size={24} className="text-white fill-current" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              My Profile
            </h1>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-tight max-w-xl leading-relaxed">
            Overview of your personal details, security settings, and linked children.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            className="h-14 px-8 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-600/20 transition-all font-black text-xs uppercase tracking-widest active:scale-95 group cursor-pointer"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Settings className="mr-3 group-hover:rotate-90 transition-transform duration-500" size={18} />
            Edit Profile
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-1">
        {/* Profile Card (Left) */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="rounded-[3.5rem] border-none shadow-2xl overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <CardContent className="p-10 flex flex-col items-center text-center relative z-10">
              <div className="relative mb-10 group/avatar">
                <div
                  onClick={handleImageClick}
                  className={cn(
                    "size-52 p-2 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-[3rem] shadow-2xl transition-all duration-700 group-hover/avatar:rotate-3 relative overflow-hidden",
                    (isUploading || isUpdating) ? "cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  <div className="size-full rounded-[2.5rem] overflow-hidden border-8 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 relative">
                    <Image
                      src={displayImage}
                      alt={user.name}
                      fill
                      className={cn("object-cover transition-opacity duration-500", (isUploading || isUpdating) ? "opacity-30" : "opacity-100")}
                      onError={() => setImgError(true)}
                      unoptimized={displayImage.includes('api.dicebear.com')}
                    />
                    {(isUploading || isUpdating) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                        <Loader2 className="w-12 h-12 text-white animate-spin mb-2" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Processing</span>
                      </div>
                    )}
                  </div>
                  {/* Hover Overlay */}
                  {!(isUploading || isUpdating) && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm rounded-[3rem]">
                      <Camera className="text-white w-12 h-12" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleImageClick}
                  disabled={isUploading || isUpdating}
                  className="absolute -bottom-2 -right-2 size-14 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-4 border-slate-50 dark:border-slate-900 flex items-center justify-center text-orange-600 hover:scale-110 active:scale-90 transition-all z-20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-10 w-full">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">
                  {user.name || 'N/A'}
                </h2>
                <div className="flex flex-col items-center gap-3">
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] bg-orange-600/10 px-5 py-2 rounded-full border border-orange-500/10">
                    Primary Guardian
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    <ShieldCheck size={12} className="text-orange-500" />
                    <span>ID: {user.parentCode || 'PAR-HUB-XXXX'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Family Size</h4>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{children.length} {children.length === 1 ? 'Child' : 'Children'}</p>
                </div>
                <div className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Status</h4>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="rounded-[3rem] border-none shadow-2xl bg-slate-900 text-white p-10 relative group overflow-hidden">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-orange-600/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/10 rounded-[1.5rem] backdrop-blur-md border border-white/10">
                  <Lock className="text-orange-500" size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tight">Security Settings</h4>
                  <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-0.5">Account Protected</p>
                </div>
              </div>
              <p className="text-xs text-white/60 font-bold leading-relaxed uppercase tracking-widest italic border-l-2 border-orange-600 pl-4">
                Your account is secure. Keep your password confidential and review your privacy settings.
              </p>
              <Button onClick={() => window.location.href = '/dashboard/parent/settings'} className="w-full h-16 rounded-[1.5rem] bg-orange-600 text-white font-black uppercase tracking-widest text-[11px] hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95 group cursor-pointer">
                <Shield className="mr-3 group-hover:rotate-12 transition-transform" size={18} />
                Manage Security
              </Button>
            </div>
          </Card>
        </div>

        {/* Account Details (Right) */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-[4rem] border-none shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl relative overflow-hidden h-full">
            <CardHeader className="p-12 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-slate-900 dark:bg-orange-600 rounded-2xl shadow-xl">
                  <ShieldCheck size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Personal Details</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Your Contact Information</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-12 space-y-16">
              {/* Contact mapping */}
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <Mail className="text-orange-500" size={18} />
                  <h4 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">
                    Contact Information
                  </h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent dark:from-white/10" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <InfoRow icon={<Mail size={20} />} label="Email Address" value={user.email} />
                  <InfoRow icon={<Smartphone size={20} />} label="Phone Number" value={user.phone} />
                  <InfoRow icon={<Globe size={20} />} label="Language" value="English" />
                  <InfoRow icon={<MapPin size={20} />} label="Location" value="Nigeria" />
                </div>
              </div>

              {/* Subscription Details - Only show if subscription is enforced */}
              {isSubscriptionEnforced && (
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <Wallet className="text-orange-500" size={18} />
                    <h4 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.3em]">
                      Subscription Details
                    </h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent dark:from-white/10" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <InfoRow icon={<CreditCard size={20} />} label="Current Plan" value={user.plan?.toUpperCase() || 'FREE TRIAL'} />
                    <InfoRow
                      icon={<History size={20} />}
                      label="Renewal Date"
                      value={user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
                    />
                  </div>
                </div>
              )}

              {/* Family Summary Highlight */}
              <div className="pt-4">
                <div className="bg-slate-900 dark:bg-white/[0.03] rounded-[3.5rem] p-12 text-white dark:text-slate-100 relative overflow-hidden group border border-white/5">
                  <div className="absolute right-0 bottom-0 p-12 opacity-5 -rotate-12 group-hover:scale-110 transition-transform duration-1000">
                    <Users size={200} />
                  </div>
                  <div className="relative z-10 space-y-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-3">
                        <Badge className="bg-orange-600 text-white font-black uppercase tracking-widest text-[9px] px-3 py-1 border-none">
                          Family Members
                        </Badge>
                        <h4 className="text-3xl font-black uppercase tracking-tight">Linked Children</h4>
                        <p className="text-white/40 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Children currently linked to your account</p>
                      </div>
                      <div className="p-6 bg-orange-600 rounded-[2rem] shadow-2xl shadow-orange-600/30">
                        <Users size={32} className="text-white" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-8">
                      {children.length > 0 ? children.map((child, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/10 dark:bg-white/5 p-3 pr-6 rounded-2xl backdrop-blur-md border border-white/5">
                          <div className="size-10 rounded-xl overflow-hidden relative border-2 border-white/10">
                            <Image src={child.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&background=ea580c&color=fff`} alt={child.name} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-tight">{child.name || 'N/A'}</p>
                            <p className="text-[9px] text-orange-500 font-black uppercase tracking-widest">{child.studentCode || 'N/A'}</p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-white/30 font-bold uppercase tracking-[0.2em] text-xs italic">No children linked to this account.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={{
          name: user.name,
          email: user.email,
          phone: user.phone || ''
        }}
      />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined | null }) {
  const displayValue = (!value || value === "null" || value === "") ? "N/A" : value;

  return (
    <div className="flex items-center gap-6 group">
      <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 group-hover:bg-orange-500/10 group-hover:scale-110 transition-all border border-slate-100 dark:border-white/10 shadow-sm">
        {icon}
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <p className={cn(
          "text-[16px] font-black uppercase tracking-tight leading-none transition-colors",
          displayValue === "N/A" ? "text-slate-300 dark:text-slate-700" : "text-slate-900 dark:text-white group-hover:text-orange-600"
        )}>
          {displayValue}
        </p>
      </div>
    </div>
  );
}
