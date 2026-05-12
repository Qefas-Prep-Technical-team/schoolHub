import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { User, Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useLinkProfile } from "@/lib/api/hooks/useLinks";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserQRModal: React.FC<UserQRModalProps> = ({ isOpen, onClose }) => {
  const { user, userType } = useAuthStore();
  const { data: profileResponse, isLoading } = useLinkProfile();
  const profile = profileResponse?.data || {};
  
  // For admins, prioritize the school's identification code
  const activeSchool = profile.schoolAdmins?.[0]?.school;
  const linkingCode = (userType === 'ADMIN') 
    ? (profile.schoolCode || activeSchool?.schoolCode || '') 
    : (profile.linkingCode || user?.id || '');

  const displayName = (userType === 'ADMIN')
    ? (activeSchool?.name || profile.name || user?.name || user?.email)
    : (profile.name || user?.name || user?.email);

  const displayImage = (userType === 'ADMIN')
    ? (activeSchool?.logo || profile.profileImage || user?.profileImage)
    : (profile.profileImage || user?.profileImage);

  // Determine the display label for the role hub
  const hubLabel = userType === 'ADMIN' 
    ? 'School Hub' 
    : userType ? `${userType.charAt(0).toUpperCase()}${userType.slice(1).toLowerCase()} Hub` : 'Hub';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(linkingCode);
    toast.success("Linking code copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <QrCode className="text-blue-500" />
            Your Identification QR
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-xs">
            Scan this code to link with other users or schools.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 gap-6">
          {/* User Info */}
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
                "w-16 h-16 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center border border-blue-500/20 overflow-hidden relative",
                isLoading && "animate-pulse"
            )}>
                {isLoading ? (
                    <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                ) : displayImage ? (
                    <Image 
                        src={displayImage} 
                        alt={displayName || "Profile"} 
                        fill
                        className="object-cover"
                    />
                ) : (
                    <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                )}
            </div>
            <div className="text-center">
                <h3 className={cn(
                    "text-lg font-black text-slate-900 dark:text-white leading-tight",
                    isLoading && "h-6 w-32 bg-slate-100 dark:bg-white/5 animate-pulse rounded-md mx-auto"
                )}>
                    {!isLoading && displayName}
                </h3>
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                    {hubLabel}
                </span>
            </div>
          </div>

          {/* QR Code */}
          <div className="p-5 bg-white rounded-[2rem] shadow-2xl shadow-blue-500/10 border border-slate-100 relative group transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <QRCode
              value={linkingCode}
              size={180}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox={`0 0 256 256`}
              fgColor="#0f172a" 
            />
          </div>

          {/* Linking Code Section */}
          <div className="w-full flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                {userType === 'ADMIN' ? 'School Identification Code' : 'Linking Code'}
            </label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/5">
                <code className={cn(
                    "flex-1 text-sm font-bold text-slate-700 dark:text-slate-300 font-mono px-2 truncate",
                    isLoading && "h-4 w-24 bg-slate-100 dark:bg-white/5 animate-pulse rounded mx-2"
                )}>
                    {!isLoading && (linkingCode || '---')}
                </code>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all"
                    onClick={handleCopyCode}
                >
                    <Copy size={16} className="text-slate-500" />
                </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-center pb-2">
           <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed max-w-[240px]">
             Keep this code private. Only share it with people you trust to connect with on Qefas Hub.
           </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
