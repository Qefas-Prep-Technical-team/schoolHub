"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useAdminProfile } from "@/lib/api/hooks/useAdmin";
import { adminService } from "@/lib/api/services/adminService";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Edit3,
  School,
  Lock,
  Award,
  Sparkles,
  ChevronRight,
  Layers,
  Phone,
  MapPin,
  Clock,
  Key,
  CheckCircle2,
  Loader2,
  Save,
  X,
  PenTool,
  CheckCheck,
  Trash2,
  Eye,
  ExternalLink,
  BadgeCheck,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import SignatureModal from "@/components/signature/SignatureModal";
import { useActiveSignature } from "@/lib/api/hooks/useSignature";
import { signatureService } from "@/lib/api/services/signatureService";

function formatAdminRole(role?: string) {
  if (!role) return "School Administrator";
  switch (role.toUpperCase()) {
    case "SCHOOL_OWNER":
      return "School Owner";
    case "PRINCIPAL":
      return "Principal";
    case "VICE_PRINCIPAL":
      return "Vice Principal";
    case "REGISTRAR":
      return "Registrar";
    case "ACCOUNTANT":
      return "Accountant";
    case "SUPPORT":
      return "Support Administrator";
    case "ADMIN":
    case "ADMINISTRATOR":
      return "School Administrator";
    default:
      return role
        .replace(/_/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
  }
}

export default function AdminProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  const { data: profileData, isLoading: isProfileLoading, refetch } = useAdminProfile();
  const effectiveSchoolId =
    (user as any)?.schoolId ||
    (user as any)?.school?.id ||
    user?.schools?.[0]?.schoolId ||
    user?.tenantId ||
    "";
  const { data: currentSchoolProfile } = useSchoolProfile(effectiveSchoolId);

  // Fallback to auth store user data while loading or if profileData has matching fields
  const adminName = profileData?.name || user?.name || "Administrator";
  const adminEmail = profileData?.email || user?.email || "admin@school.com";
  const adminCode = profileData?.adminCode || (user as any)?.adminCode || "ADM-000000";
  const adminRole = profileData?.role || user?.role || (user as any)?.adminRole || "ADMIN";
  const gender = profileData?.gender || (user as any)?.gender || "Not specified";
  const profileImage = profileData?.profileImage || user?.profileImage;
  const bannerImage = profileData?.bannerImage || (user as any)?.bannerImage;
  const isTwoFactorEnabled = profileData?.isTwoFactorEnabled || (user as any)?.require2FA || false;
  const createdAt = profileData?.createdAt;

  // Affiliated schools list
  const schoolsList: any[] = profileData?.schools || (user as any)?.schools || [];

  // Active School vs Other Schools
  const activeSchool =
    schoolsList.find((s: any) => s.schoolId === effectiveSchoolId || s.active) ||
    schoolsList[0] ||
    null;

  const otherSchools = schoolsList.filter(
    (s: any) => s.schoolId !== activeSchool?.schoolId
  );

  // Copy Code State
  const [copiedCode, setCopiedCode] = useState(false);
  const handleCopyCode = () => {
    navigator.clipboard.writeText(adminCode);
    setCopiedCode(true);
    toast.success("Admin Code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Active Signature State
  const adminUserId = user?.id || (user as any)?.userId || "admin-system";
  const { data: activeSignature, refetch: refetchSignature } = useActiveSignature(adminUserId);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    toast.success("Signature SHA-256 fingerprint copied!");
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleRemoveSignature = async () => {
    if (confirm("Are you sure you want to remove your active digital signature?")) {
      await signatureService.removeSignature(adminUserId);
      queryClient.setQueryData(["activeSignature", adminUserId], null);
      queryClient.invalidateQueries({ queryKey: ["activeSignature", adminUserId] });
      toast.info("Signature removed from active profile.");
    }
  };

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
  });

  useEffect(() => {
    if (profileData || user) {
      setFormData({
        name: profileData?.name || user?.name || "",
        gender: profileData?.gender || (user as any)?.gender || "",
      });
    }
  }, [profileData, user]);

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSavingProfile(true);
    try {
      await adminService.updateProfile({
        name: formData.name.trim(),
        gender: formData.gender || undefined,
      });
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      if (updateUser) {
        updateUser({ name: formData.name.trim(), gender: formData.gender } as any);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 font-sans">
      {/* ── Breadcrumbs & Top Page Title ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-400 mb-1 flex-wrap">
            <Link href="/dashboard/admin" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-400">Administration</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-zinc-200">Admin Profile</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800/60 shadow-xs">
              <User size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Official Administrative Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium">
                Institutional credentials, security authorizations, and multi-school governance tenures.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => setIsEditModalOpen(true)}
            variant="outline"
            size="sm"
            className="h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border-slate-200 dark:border-zinc-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700"
          >
            <Edit3 size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* ── Admin Hero Card Banner ────────────────────────────────────────── */}
      {isProfileLoading ? (
        <Skeleton className="w-full h-64 rounded-3xl" />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 overflow-hidden shadow-xs relative">
          {/* Banner Graphic Header */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 relative overflow-hidden">
            {bannerImage && (
              <img
                src={bannerImage}
                alt="Banner"
                className="w-full h-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                <ShieldCheck size={13} />
                <span>Verified School Administrator</span>
              </span>
            </div>
          </div>

          {/* Profile Identity Details Row */}
          <div className="px-5 sm:px-8 pb-6 sm:pb-8 pt-0 -mt-12 sm:-mt-14 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Avatar with Ring */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white dark:bg-zinc-900 border-4 border-white dark:border-zinc-900 shadow-lg overflow-hidden shrink-0 flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={adminName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black text-3xl flex items-center justify-center select-none">
                        {(adminName || "A").trim().charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div
                    className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-xs"
                    title="Account Active"
                  />
                </div>

                {/* Name & Titles */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {adminName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {formatAdminRole(activeSchool?.adminRole || adminRole)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Mail size={13} className="text-slate-400" />
                    <span>{adminEmail}</span>
                  </p>
                </div>
              </div>

              {/* Admin Code Badge & Digital Signature Action */}
              <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-end pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200/80 dark:border-zinc-750 hover:border-blue-500/50 text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2.5 transition-all shadow-2xs hover:shadow-xs group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 group-hover:scale-105 transition-transform">
                    <PenTool size={14} />
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                      Digital Signature
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      {activeSignature ? "Certified & Active" : "Add Signature"}
                      {activeSignature && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      )}
                    </span>
                  </div>
                </button>

                <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 flex items-center gap-2.5 shadow-2xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
                      Official Admin ID
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-wide">
                      {adminCode}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-700 transition-colors"
                    title="Copy Admin Code"
                  >
                    {copiedCode ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Tab Navigation & Content ─────────────────────────────────── */}
      <Tabs defaultValue="affiliations" className="w-full space-y-6">
        <TabsList className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/80 dark:border-zinc-800 flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="affiliations"
            className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-xs transition-all flex items-center gap-1.5"
          >
            <Building2 size={14} />
            <span>School Affiliations & Tenures</span>
            {schoolsList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                {schoolsList.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="signature"
            className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-xs transition-all flex items-center gap-1.5"
          >
            <PenTool size={14} />
            <span>Digital Signature</span>
            {activeSignature ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            ) : (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                New
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="overview"
            className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-xs transition-all flex items-center gap-1.5"
          >
            <User size={14} />
            <span>Personal & Account Info</span>
          </TabsTrigger>

          <TabsTrigger
            value="privileges"
            className="rounded-xl text-xs font-bold px-4 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-xs transition-all flex items-center gap-1.5"
          >
            <ShieldCheck size={14} />
            <span>System Privileges</span>
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: SCHOOL AFFILIATIONS & TENURES (User Key Request) ───────── */}
        <TabsContent value="affiliations" className="space-y-6">
          {/* Primary Current School Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <School size={16} className="text-blue-600 dark:text-blue-400" />
                <span>Primary / Active Administrative Institution</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active Session Context
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-50/50 via-white to-slate-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-950 border border-blue-200/80 dark:border-blue-900/40 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center p-2 shadow-xs shrink-0 overflow-hidden">
                    {activeSchool?.logo || currentSchoolProfile?.logo ? (
                      <img
                        src={activeSchool?.logo || currentSchoolProfile?.logo}
                        alt="School Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Building2 size={26} className="text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {activeSchool?.schoolName || currentSchoolProfile?.name || "Connected School"}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {activeSchool?.schoolCode || currentSchoolProfile?.schoolCode || "SCH-001"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                      {currentSchoolProfile?.address || activeSchool?.address || "Registered Educational Institution"}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Institutional Role
                  </span>
                  <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                    {formatAdminRole(activeSchool?.adminRole || adminRole)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Tenure Status
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={12} />
                    Active In-Office
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Institutional Code
                  </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">
                    {activeSchool?.schoolCode || currentSchoolProfile?.schoolCode || "SCH-001"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Official Contact
                  </span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300 mt-0.5 block truncate">
                    {activeSchool?.email || currentSchoolProfile?.email || adminEmail}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Appointed Since
                  </span>
                  <span className="font-medium text-slate-700 dark:text-zinc-300 mt-0.5 block">
                    {activeSchool?.joinedAt
                      ? new Date(activeSchool.joinedAt).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })
                      : "Current Tenure"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Other School Affiliations / Past Administrative Tenures */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <History size={16} className="text-indigo-600" />
                  <span>Other School Affiliations & Administrative Tenures</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Complete institutional governance track record across affiliated academic campuses.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {otherSchools.length} {otherSchools.length === 1 ? "Tenure" : "Tenures"}
              </span>
            </div>

            {otherSchools.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-500 flex items-center justify-center mx-auto">
                  <Building2 size={20} />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  Single Institutional Tenure
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                  You are currently active exclusively at{" "}
                  <strong>{activeSchool?.schoolName || "your connected school"}</strong>. No secondary or past school appointments exist on this administrative profile.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {otherSchools.map((schoolRecord: any) => (
                  <div
                    key={schoolRecord.schoolId || schoolRecord.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-800/60 shadow-xs space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                          {schoolRecord.logo ? (
                            <img
                              src={schoolRecord.logo}
                              alt={schoolRecord.schoolName}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 size={22} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {schoolRecord.schoolName}
                          </h4>
                          <span className="font-mono text-[11px] font-bold text-slate-400">
                            {schoolRecord.schoolCode || "SCH-CODE"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          schoolRecord.active
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700"
                        )}
                      >
                        {schoolRecord.active ? "Concurrent Role" : "Former Tenure"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100 dark:border-zinc-800">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Administrative Role:</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          {formatAdminRole(schoolRecord.adminRole)}
                        </span>
                      </div>
                      {schoolRecord.address && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Campus Location:</span>
                          <span className="font-medium text-slate-600 dark:text-zinc-400 truncate max-w-[180px]">
                            {schoolRecord.address}
                          </span>
                        </div>
                      )}
                      {schoolRecord.joinedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Appointment Date:</span>
                          <span className="font-medium text-slate-600 dark:text-zinc-400">
                            {new Date(schoolRecord.joinedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── TAB: DIGITAL SIGNATURE & ENDORSEMENT SEAL ─────────────────────── */}
        <TabsContent value="signature" className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <PenTool size={16} className="text-blue-600 dark:text-blue-400" />
                  <span>Official Administrative Digital Signature</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Used as an authorized digital endorsement seal for certified final result sheets, transcripts, and official letters.
                </p>
              </div>

              {activeSignature && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveSignature}
                    className="h-9 px-3 rounded-xl border-rose-200 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Trash2 size={13} />
                    <span>Remove</span>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <PenTool size={13} />
                    <span>Update Signature</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Signature Presentation Card */}
            {activeSignature ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Simulated Document Seal Box (Certificate Preview) */}
                  <div className="lg:col-span-7 xl:col-span-7 relative rounded-2xl border border-slate-200/90 dark:border-slate-300 bg-white dark:bg-slate-50 text-slate-900 p-6 sm:p-7 shadow-sm overflow-hidden flex flex-col justify-between">
                    {/* Background guilloche / certificate pattern decoration */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:16px_16px]" />

                    <div>
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-5 select-none flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-200/60">
                            Q
                          </div>
                          <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 block">
                              Institutional Endorsement Certificate
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Authorized Administrative Document Seal
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs flex items-center gap-1.5">
                          <ShieldCheck size={13} className="text-emerald-600" />
                          <span>Certified Active & Valid</span>
                        </span>
                      </div>

                      {/* High-Resolution Transparent PNG Preview (Crisp White Document Pad for 100% Dark Mode Contrast) */}
                      <div className="py-8 px-6 flex flex-col items-center justify-center min-h-[160px] bg-white dark:bg-white rounded-xl border border-dashed border-slate-300 dark:border-slate-300 shadow-inner relative">
                        <img
                          src={activeSignature.signedUrl}
                          alt="Official Signature"
                          className="max-h-28 sm:max-h-36 w-auto object-contain drop-shadow-xs transition-transform hover:scale-105 duration-300"
                        />
                        <span className="text-[10px] font-mono text-slate-500 mt-2 select-none">
                          Digital Vector Render • 300 DPI Transparent
                        </span>
                      </div>
                    </div>

                    {/* Signatory Endorsement Stamp */}
                    <div className="pt-4 mt-4 border-t border-slate-200 flex items-end justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
                          {adminName}
                        </p>
                        <p className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-600 tracking-wider mt-0.5">
                          {formatAdminRole(activeSchool?.adminRole || adminRole)} • {activeSchool?.schoolName || "Institutional Admin"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {activeSignature.method === "drawn"
                            ? "Drawn on Canvas"
                            : activeSignature.method === "uploaded"
                            ? "Cleaned Photo Upload"
                            : "Calligraphy Script"}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          Added {new Date(activeSignature.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Cryptographic Fingerprint, Audit Trail & Endorsement Scope */}
                  <div className="lg:col-span-5 xl:col-span-5 space-y-4 flex flex-col justify-between">
                    {/* SHA-256 Cryptographic Hash & Verification Details */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
                        <span className="flex items-center gap-1.5">
                          <Key size={14} className="text-blue-600 dark:text-blue-400" />
                          <span>SHA-256 Audit Fingerprint</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(activeSignature.sha256)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors"
                        >
                          {copiedHash ? (
                            <>
                              <Check size={12} className="text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Hash</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                        <p className="font-mono text-[11px] text-slate-700 dark:text-zinc-300 break-all select-all leading-relaxed">
                          {activeSignature.sha256}
                        </p>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Every certified transcript and grade export embeds this hash to guarantee the document has not been altered.
                      </p>
                    </div>

                    {/* Authorized Endorsement Scope Card */}
                    <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 space-y-3">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-zinc-300 block">
                        Authorized Endorsement Scope
                      </span>
                      <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Official Cumulative Academic Transcripts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Published Termly Report Cards & Gradesheets</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Administrative Letters & Institutional Attestations</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty Signature State */
              <div className="p-8 sm:p-14 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-4 bg-slate-50/40 dark:bg-zinc-900/30">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center mx-auto shadow-2xs">
                  <PenTool size={28} />
                </div>
                <div className="space-y-1.5 max-w-lg mx-auto">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    No Official Digital Signature Registered
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Capture or upload your authorized signature to enable automated 1-click approvals on student report cards, cumulative academic transcripts, and institutional certificates.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    type="button"
                    onClick={() => setIsSignatureModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-2"
                  >
                    <PenTool size={14} />
                    <span>Capture Official Signature</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Compliance & Security Guarantee Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px]">
                  <Sparkles size={13} className="text-blue-600 dark:text-blue-400" />
                  Transparent Clean-Up
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Automatically extracts ink from background paper, eliminating gray shadows and paper edges.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  Tamper Proof
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Cryptographically hashed with SHA-256 to ensure authenticity on certified transcripts.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px]">
                  <Lock size={13} className="text-blue-600" />
                  Private Access
                </span>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Stored securely in private cloud storage and served via short-lived signed URLs.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 2: PERSONAL & ACCOUNT DETAILS ─────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-blue-600 dark:text-blue-400" />
              <span>Identity & Registration Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Full Name
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{adminName}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Primary Email Address
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{adminEmail}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  System Admin Code
                </span>
                <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                  {adminCode}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Gender Designation
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-sm capitalize">
                  {gender?.toLowerCase() || "Not specified"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Two-Factor Authentication
                </span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>{isTwoFactorEnabled ? "Active & Enforced" : "Configured via Security"}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Account Created
                </span>
                <p className="font-bold text-slate-800 dark:text-zinc-200 text-sm">
                  {createdAt
                    ? new Date(createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Verified Profile"}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── TAB 3: SYSTEM PRIVILEGES & CAPABILITIES ───────────────────────── */}
        <TabsContent value="privileges" className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BadgeCheck size={16} className="text-blue-600 dark:text-blue-400" />
                <span>Authorized Administrative Permissions</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Institutional capabilities granted under your assigned role:{" "}
                <strong className="text-slate-800 dark:text-zinc-200">
                  {formatAdminRole(activeSchool?.adminRole || adminRole)}
                </strong>
                .
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={15} />
                  <span>Final Result Approval & Certification</span>
                </div>
                <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                  Apply official administrative seal, digital signature, and publish certified grade sheets to student & parent dashboards.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={15} />
                  <span>Cumulative Academic Transcripts</span>
                </div>
                <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                  Generate, audit, and issue institutional PDF transcripts with verified registrar endorsements and 5.00 CGPA grading scales.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={15} />
                  <span>Staff & Faculty Oversight</span>
                </div>
                <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                  Manage teachers, assign subject papers, review teacher submission requests, and audit academic attendances.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/80 dark:border-zinc-800 space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 size={15} />
                  <span>Student Enrollment & Cohorts</span>
                </div>
                <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                  Admit students, assign classroom arms, manage class enrollment rosters, and oversee academic promotions.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Edit Profile Modal ────────────────────────────────────────────── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-[#1a1b2e] dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Edit Profile Details</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs">
              Update your administrative profile name and personal preferences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Full Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Enter your full name"
                className="h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 min-w-[100px]"
            >
              {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Capture Signature Modal ─────────────────────────────────────── */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        userId={adminUserId}
        userName={adminName}
        userRole={formatAdminRole(activeSchool?.adminRole || adminRole)}
        onSaveSuccess={() => {
          refetchSignature();
          queryClient.invalidateQueries({ queryKey: ["activeSignature", adminUserId] });
        }}
      />
    </div>
  );
}
