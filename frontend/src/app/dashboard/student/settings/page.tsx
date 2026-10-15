"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/lib/api/services/studentService";
import { schoolService } from "@/lib/api/services/schoolService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import {
  Shield,
  GraduationCap,
  Building2,
  CheckCircle2,
  Lock,
  User,
  Fingerprint,
  Settings,
  Palette,
  Loader2,
  School,
  BookOpen,
  ArrowRight,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { usePublicPlatformSettings } from "@/lib/api/hooks/usePlatformGovernance";
import { useSchoolBilling, useUserBilling } from "@/lib/api/hooks/useSchool";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DeviceSessions from "@/components/DeviceSessions";
import ChangePasswordModal from "@/components/auth/ChangePasswordModal";
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import DeactivateAccountSection from "@/components/auth/DeactivateAccountSection";
import Image from 'next/image';
import { useStudentProfile, studentKeys } from "@/lib/api/hooks/useStudent";
import { HeaderTooltip } from "@/app/dashboard/student/components/dashboard/HeaderTooltip";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

interface DepartmentItem {
  id: string;
  name: string;
  code?: string;
  departmentId?: string;
}

interface EnrolledClassItem {
  class: {
    id: string;
    name: string;
    section?: string;
  };
}

export default function StudentSettingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const router = useRouter();

  const { data: profile, isLoading: isProfileLoading } = useStudentProfile();

  const { data: departments = [], isLoading: isDeptsLoading } = useQuery<DepartmentItem[]>({
    queryKey: ["schoolDepartments", profile?.schoolId],
    queryFn: () => schoolService.getDepartments(profile?.schoolId!),
    enabled: !!profile?.schoolId,
    staleTime: 1000 * 60 * 10,
  });

  const { data: platformSettings, isLoading: isSettingsLoading } = usePublicPlatformSettings();
  const { data: userBilling, isLoading: isUserBillingLoading } = useUserBilling(profile?.id as string, { limit: 1 });
  const { data: schoolBilling, isLoading: isSchoolBillingLoading } = useSchoolBilling(profile?.schoolId as string, { limit: 1 });

  const isEnforced = platformSettings?.sub_enforced_students !== "false";
  const isLoadingBilling = isSettingsLoading || isUserBillingLoading || isSchoolBillingLoading;
  
  const activePlanName = isLoadingBilling 
    ? "Loading..."
    : isEnforced 
      ? (userBilling?.data?.subscription?.plan || "Free Plan")
      : (schoolBilling?.subscription?.plan || "No School Plan");

  const activeLicenseText = isEnforced
    ? "Standard Student License"
    : `Institutional License (${profile?.school?.name || "School"})`;

  useEffect(() => {
    const deptId = profile?.departmentId || profile?.department?.id;
    if (deptId) {
      setSelectedDept(deptId);
    }
    if (profile?.level) {
      setSelectedLevel(profile.level);
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (deptId: string) => studentService.updateDepartment(deptId),
    onSuccess: () => {
      toast.success("Department successfully selected!");
      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update department");
    },
  });

  const levelMutation = useMutation({
    mutationFn: (level: string) => studentService.updateLevel(level),
    onSuccess: () => {
      toast.success('Level successfully selected!');
      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to update level');
    },
  });

  const handleLevelUpdate = () => {
    if (!selectedLevel) { toast.warn('Please select a level first'); return; }
    levelMutation.mutate(selectedLevel);
  };

  const handleUpdate = () => {
    if (!selectedDept) {
      toast.warn("Please select a department first");
      return;
    }
    updateMutation.mutate(selectedDept);
  };

  const isLocked = Boolean(profile?.departmentId || profile?.department?.id || profile?.department?.name);
  const isLevelLocked = Boolean(profile?.level);
  const hasSchool = Boolean(profile?.schoolId || profile?.school?.id);
  const schoolLevels: string[] = profile?.school?.levels || [];

  const enrolledDeptName =
    profile?.department?.name ||
    departments.find((d: DepartmentItem) => d.id === (profile?.departmentId || selectedDept) || d.departmentId === (profile?.departmentId || selectedDept))?.name ||
    (selectedDept ? departments.find((d: DepartmentItem) => d.id === selectedDept || d.departmentId === selectedDept)?.name : null) ||
    "Assigned Department";

  const enrolledDeptCode =
    profile?.department?.code ||
    departments.find((d: DepartmentItem) => d.id === (profile?.departmentId || selectedDept) || d.departmentId === (profile?.departmentId || selectedDept))?.code ||
    (selectedDept ? departments.find((d: DepartmentItem) => d.id === selectedDept || d.departmentId === selectedDept)?.code : null);

  const [activeTab, setActiveTab] = useState<string>("account");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab) setActiveTab(tab);
    }
  }, []);

  if (isProfileLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-zinc-800">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-xl bg-slate-200 dark:bg-zinc-800" />
            <Skeleton className="h-4 w-72 rounded-lg bg-slate-200 dark:bg-zinc-800" />
          </div>
        </div>
        <Skeleton className="h-11 w-full max-w-xl rounded-xl bg-slate-200 dark:bg-zinc-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-6">
              <Skeleton className="h-16 w-full rounded-xl bg-slate-200 dark:bg-zinc-800" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-10 rounded-xl bg-slate-200 dark:bg-zinc-800" />
                <Skeleton className="h-10 rounded-xl bg-slate-200 dark:bg-zinc-800" />
              </div>
            </Card>
          </div>
          <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <Skeleton className="h-32 w-full rounded-xl bg-slate-200 dark:bg-zinc-800" />
          </Card>
        </div>
      </div>
    );
  }

  const initials = profile?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "S";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Student Settings
              </h1>
              <HeaderTooltip 
                content="Manage your primary student profile, lock in academic faculties and grade levels, configure two-factor security, and inspect active device sessions."
              />
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Manage your student profile, academic configurations, security credentials, and preferences.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            onClick={() => window.open('/onboarding?revisit=true', '_blank')}
            className="h-10 px-4 rounded-xl font-bold text-xs sm:text-sm border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 cursor-pointer shadow-sm"
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-pink-600 dark:text-pink-400" />
            Revisit Onboarding
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-slate-100 dark:bg-zinc-900 rounded-xl p-1 w-full max-w-xl grid grid-cols-4 h-auto border border-slate-200/80 dark:border-zinc-800">
          <TabsTrigger 
            value="account" 
            className="rounded-lg h-9 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm transition-all"
          >
            <div className="flex items-center justify-center gap-1.5">
              <User size={13} /> 
              <span>Account</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="academic" 
            className="rounded-lg h-9 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm transition-all"
          >
            <div className="flex items-center justify-center gap-1.5">
              <GraduationCap size={13} /> 
              <span>Academic</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-lg h-9 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm transition-all"
          >
            <div className="flex items-center justify-center gap-1.5">
              <Shield size={13} /> 
              <span>Security</span>
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="rounded-lg h-9 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm transition-all"
          >
            <div className="flex items-center justify-center gap-1.5">
              <Palette size={13} /> 
              <span>Plan</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Account Tab Content */}
        <TabsContent value="account" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800/80">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Fingerprint className="text-pink-600 dark:text-pink-400" size={18} /> 
                    Student Identity
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                    Primary student account credentials and contact affiliation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 flex items-center justify-center text-lg sm:text-xl font-bold text-pink-600 dark:text-pink-400 overflow-hidden shrink-0">
                      {profile?.profileImage ? (
                        <Image src={profile.profileImage} alt={profile.name || "Student"} width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">{profile?.name}</p>
                        {profile?.verified && (
                          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 size={10} /> Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                        #{profile?.studentCode || "STU-ID"} • Student
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="rounded-xl h-9 px-4 text-xs font-bold border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 shrink-0 cursor-pointer" 
                      onClick={() => router.push('/dashboard/student/profile')}
                    >
                      View Profile
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Display Name</Label>
                      <Input value={profile?.name || ''} disabled className="h-10 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Institutional Email</Label>
                      <Input value={profile?.email || ''} disabled className="h-10 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border-slate-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800/80">
                  <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <School className="text-pink-600 dark:text-pink-400" size={18} /> 
                    Linked Academy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 sm:p-6 space-y-5">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Institution</p>
                      <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{profile?.school?.name || 'Not Linked'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Affiliation Status</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        <CheckCircle2 size={12} />
                        {profile?.verified ? "Active Verified" : "Pending Verification"}
                      </span>
                    </div>
                    {profile?.classes && (profile.classes as EnrolledClassItem[]).length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Enrolled Classes</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(profile.classes as EnrolledClassItem[]).map((c) => (
                            <Badge key={c.class.id} className="bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-200 dark:border-pink-800/40 font-bold text-[10px] rounded-lg">
                              {c.class.name} {c.class.section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Academic Tab Content */}
        <TabsContent value="academic" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Card */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
              <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800/80">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between gap-3 text-zinc-900 dark:text-zinc-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-pink-600 dark:text-pink-400" size={18} /> 
                    Department / Faculty
                  </div>
                  {isLocked && (
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 font-black text-[10px] uppercase tracking-wider">
                      <CheckCircle2 size={11} className="mr-1" /> Locked In
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                  Your academic division or major study branch.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-5">
                {isLocked ? (
                  <>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-900/30">
                      <div className="flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0 text-pink-600 dark:text-pink-400">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Enrolled Department</p>
                          <div className="flex items-center gap-2">
                            <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">{enrolledDeptName}</p>
                            {enrolledDeptCode && (
                              <Badge className="bg-pink-100/70 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-none font-bold text-[10px] px-2 py-0.5">
                                {enrolledDeptCode}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-center px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      <Lock className="text-zinc-400 shrink-0" size={14} />
                      <span>Your department is locked in your student records. Contact administration if updates are required.</span>
                    </div>
                  </>
                ) : (
                  <>
                    {!hasSchool ? (
                      <div className="flex gap-2.5 items-center px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs font-medium text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="text-amber-500 shrink-0" size={14} />
                        <span>You are not currently linked to an enrolled school. Connect with a school code to select your institutional department.</span>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Department selection is a one-time choice. Please choose carefully.
                      </p>
                    )}
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Academic Department</Label>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <div className="flex-1">
                          <Select value={selectedDept} onValueChange={setSelectedDept} disabled={!hasSchool || isDeptsLoading}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed">
                              <SelectValue placeholder={!hasSchool ? "No School Connected" : (isDeptsLoading ? "Loading departments..." : "Choose Department")} />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                              {departments.map((dept) => {
                                const deptValue = dept.id || dept.departmentId || '';
                                return (
                                  <SelectItem key={deptValue} value={deptValue} className="text-xs font-medium">
                                    {dept.name} {dept.code ? `(${dept.code})` : ''}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={handleUpdate} 
                          disabled={!hasSchool || updateMutation.isPending || !selectedDept} 
                          className="h-10 px-5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateMutation.isPending && <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />}
                          Lock In
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Level Card */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
              <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800/80">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between gap-3 text-zinc-900 dark:text-zinc-100">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="text-pink-600 dark:text-pink-400" size={18} /> 
                    Academic Grade Level
                  </div>
                  {isLevelLocked && (
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 font-black text-[10px] uppercase tracking-wider">
                      <CheckCircle2 size={11} className="mr-1" /> Locked In
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                  Your current grade or academic standing level.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-5">
                {isLevelLocked ? (
                  <>
                    <div className="flex items-center gap-3.5 p-4 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-900/30">
                      <div className="h-10 w-10 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0 text-pink-600 dark:text-pink-400">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Enrolled Level</p>
                        <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">{profile?.level}</p>
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-center px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      <Lock className="text-zinc-400 shrink-0" size={14} />
                      <span>Your grade level is locked in your student records. Contact administration if updates are required.</span>
                    </div>
                  </>
                ) : !hasSchool ? (
                  <div className="flex gap-2.5 items-center px-3.5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs font-medium text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="text-amber-500 shrink-0" size={14} />
                    <span>You are not currently linked to an enrolled school. Connect with a school code to select your academic grade level.</span>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Level selection is permanent once confirmed.
                  </p>
                )}

                {!isLevelLocked && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Select Grade Level</Label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="flex-1">
                        <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!hasSchool || isLevelLocked}>
                          <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            <SelectValue placeholder={!hasSchool ? "No School Connected" : "Choose Level"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                            {schoolLevels.map((lvl) => (
                              <SelectItem key={lvl} value={lvl} className="text-xs font-medium">
                                {lvl}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={handleLevelUpdate} 
                        disabled={!hasSchool || levelMutation.isPending || !selectedLevel} 
                        className="h-10 px-5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {levelMutation.isPending && <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />}
                        Lock In
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab Content */}
        <TabsContent value="security" className="focus-visible:outline-none">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800/80">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <Lock className="text-pink-600 dark:text-pink-400" size={18} /> 
                    Account Password
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                    Keep your account secure with regular password updates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 gap-4">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Primary Password</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Last changed recently. Minimum 8 characters required.</p>
                    </div>
                    <ChangePasswordModal>
                      <Button className="shrink-0 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-5 h-10 shadow-md shadow-pink-500/20 cursor-pointer">
                        Change Password
                      </Button>
                    </ChangePasswordModal>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800/80">
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center justify-between gap-3 text-zinc-900 dark:text-zinc-100">
                    <div className="flex items-center gap-2">
                      <Shield className="text-pink-600 dark:text-pink-400" size={18} /> 
                      Two-Factor Authentication
                    </div>
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                    Extra layer of protection using authenticator codes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <TwoFactorSetup 
                    isTwoFactorEnabled={user?.isTwoFactorEnabled ?? false} 
                    onUpdate={() => {
                      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
                    }} 
                  />
                </CardContent>
              </Card>
            </div>

            {/* Device Sessions Ledger */}
            <DeviceSessions />

            {/* Account Deactivation / Danger Zone */}
            <DeactivateAccountSection userRole="student" />
          </div>
        </TabsContent>

        {/* Preferences & Billing Tab Content */}
        <TabsContent value="preferences" className="focus-visible:outline-none">
          <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
            <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800/80">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <Palette className="text-pink-600 dark:text-pink-400" size={18} /> 
                Subscription & Plan Governance
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Review your active student license tier and institutional plan privileges.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  onClick={() => router.push(isEnforced ? "/dashboard/student/billing" : "#")} 
                  className="p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 cursor-pointer hover:border-pink-500/40 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{activePlanName}</h4>
                        {!isEnforced && (
                          <Badge className="bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400 border border-pink-200 dark:border-pink-800/40 text-[10px] font-bold">
                            School Linked
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{activeLicenseText}</p>
                    </div>
                    <ArrowRight className="text-zinc-400 group-hover:text-pink-600 transition-colors" size={18} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
