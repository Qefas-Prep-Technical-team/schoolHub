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
    <div className="w-[95%] mx-auto py-8 animate-in fade-in duration-700">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span>Parent Portal</span>
            <ChevronRight size={14} className="text-orange-500" />
            <span className="text-orange-600 font-bold">Profile</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of your personal details, security settings, and linked children.
          </p>
        </div>

        <Button
          className="h-10 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-sm transition-colors cursor-pointer"
          onClick={() => setIsEditModalOpen(true)}
        >
          <Settings className="mr-2" size={16} />
          Edit Profile
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card (Left) */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="relative mb-6 group/avatar">
                <div
                  onClick={handleImageClick}
                  className={cn(
                    "size-32 rounded-full shadow-sm relative overflow-hidden border border-slate-200 dark:border-slate-700",
                    (isUploading || isUpdating) ? "cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  <Image
                    src={displayImage}
                    alt={user.name}
                    fill
                    className={cn("object-cover transition-opacity duration-300", (isUploading || isUpdating) ? "opacity-50" : "opacity-100")}
                    onError={() => setImgError(true)}
                    unoptimized={displayImage.includes('api.dicebear.com')}
                  />
                  {(isUploading || isUpdating) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[1px]">
                      <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
                    </div>
                  )}
                  {!(isUploading || isUpdating) && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="text-white w-8 h-8" />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleImageClick}
                  disabled={isUploading || isUpdating}
                  className="absolute bottom-0 right-0 size-10 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 hover:text-orange-500 transition-colors z-20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera size={16} />
                </button>
              </div>

              <div className="space-y-2 mb-8 w-full">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user.name || 'N/A'}
                </h2>
                <div className="flex flex-col items-center gap-2">
                  <Badge className="bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 hover:bg-orange-100 rounded-lg px-3 py-1 font-semibold">
                    Primary Guardian
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                    <ShieldCheck size={14} className="text-slate-400" />
                    <span>ID: {user.parentCode || 'PAR-HUB-XXXX'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Family Size</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{children.length} {children.length === 1 ? 'Child' : 'Children'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Status</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  <Lock className="text-slate-600 dark:text-slate-300" size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Security Settings</h4>
                  <p className="text-xs text-green-600 font-semibold mt-0.5">Account Protected</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your account is secure. Keep your password confidential and review your privacy settings.
              </p>
              <Button onClick={() => window.location.href = '/dashboard/parent/settings'} className="w-full h-10 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm cursor-pointer">
                <Shield className="mr-2" size={16} />
                Manage Security
              </Button>
            </div>
          </Card>
        </div>

        {/* Account Details (Right) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden h-full">
            <CardHeader className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-100 dark:border-orange-500/20">
                  <User size={20} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Details</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Your Contact Information</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-10">
              {/* Contact Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Mail className="text-slate-400" size={16} />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Contact Information
                  </h4>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoRow icon={<Mail size={18} />} label="Email Address" value={user.email} />
                  <InfoRow icon={<Smartphone size={18} />} label="Phone Number" value={user.phone} />
                  <InfoRow icon={<Globe size={18} />} label="Language" value="English" />
                  <InfoRow icon={<MapPin size={18} />} label="Location" value="Nigeria" />
                </div>
              </div>

              {/* Subscription Details - Only show if subscription is enforced */}
              {isSubscriptionEnforced && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Wallet className="text-slate-400" size={16} />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Subscription Details
                    </h4>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoRow icon={<CreditCard size={18} />} label="Current Plan" value={user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free Trial'} />
                    <InfoRow
                      icon={<History size={18} />}
                      label="Renewal Date"
                      value={user.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
                    />
                  </div>
                </div>
              )}

              {/* Family Summary Highlight */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Users className="text-slate-400" size={16} />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Linked Children
                  </h4>
                  <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {children.length > 0 ? children.map((child, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[16px] border border-slate-100 dark:border-slate-800 transition-colors hover:border-orange-200 dark:hover:border-orange-500/30">
                      <div className="size-12 rounded-full overflow-hidden relative border border-slate-200 dark:border-slate-700 shrink-0">
                        <Image src={child.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(child.name)}&background=ea580c&color=fff`} alt={child.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{child.name || 'N/A'}</p>
                        <p className="text-xs font-semibold text-orange-500 mt-0.5 truncate">{child.studentCode || 'N/A'}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-500 font-medium text-sm">No children linked to this account.</p>
                  )}
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
    <div className="flex items-center gap-4 group">
      <div className="size-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 transition-colors border border-slate-100 dark:border-slate-800 shrink-0">
        {icon}
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <p className={cn(
          "text-sm font-bold transition-colors",
          displayValue === "N/A" ? "text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"
        )}>
          {displayValue}
        </p>
      </div>
    </div>
  );
}
