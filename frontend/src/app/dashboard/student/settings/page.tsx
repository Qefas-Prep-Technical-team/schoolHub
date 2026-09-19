"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/lib/api/services/studentService";
import { departmentService } from "@/app/dashboard/admin/departments/services/departmentService";
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
  BookOpen
} from "lucide-react";
import { usePublicPlatformSettings } from "@/lib/api/hooks/usePlatformGovernance";
import { useSchoolBilling, useUserBilling } from "@/lib/api/hooks/useSchool";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DeviceSessions from "@/components/DeviceSessions";
import ChangePasswordModal from "@/components/auth/ChangePasswordModal";
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import Image from 'next/image';
import { useStudentProfile, studentKeys } from "@/lib/api/hooks/useStudent";

export default function StudentSettingsPage() {
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const router = useRouter();

  const { data: profile, isLoading: isProfileLoading } = useStudentProfile();

  const { data: departments = [], isLoading: isDeptsLoading } = useQuery({
    queryKey: ["school-departments", profile?.schoolId],
    queryFn: () => departmentService.getDepartments(profile?.schoolId!),
    enabled: !!profile?.schoolId,
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
    if (profile?.departmentId) {
      setSelectedDept(profile.departmentId);
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
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update department");
    },
  });

  const levelMutation = useMutation({
    mutationFn: (level: string) => studentService.updateLevel(level),
    onSuccess: () => {
      toast.success('Level successfully selected!');
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
    },
    onError: (error: any) => {
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

  const isLocked = !!profile?.departmentId;
  const isLevelLocked = !!profile?.level;
  const schoolLevels: string[] = (profile as any)?.school?.levels || [];

  const [activeTab, setActiveTab] = useState<string>("account");
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, []);

  if (isProfileLoading) {
    return (
      <div className="w-[95%] max-w-[1600px] mx-auto py-8 space-y-6 md:space-y-8 px-4 md:px-8 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-72" />
              </div>
          </div>
          <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                  <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                      <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50 space-y-2">
                          <Skeleton className="h-6 w-40" />
                          <Skeleton className="h-4 w-60" />
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                          <div className="flex items-center gap-5 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                              <Skeleton className="h-16 w-16 rounded-xl" />
                              <div className="space-y-2">
                                  <Skeleton className="h-5 w-32" />
                                  <Skeleton className="h-4 w-24" />
                              </div>
                              <Skeleton className="ml-auto h-9 w-24 rounded-lg" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              <div className="space-y-2">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-10 w-full rounded-lg" />
                              </div>
                              <div className="space-y-2">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-10 w-full rounded-lg" />
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              </div>

              <div className="space-y-6">
                  {/* Linked Academy Card Skeleton */}
                  <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                      <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                          <Skeleton className="h-6 w-40" />
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-5 w-40" />
                              </div>
                              <div className="space-y-2">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-5 w-32" />
                              </div>
                          </div>
                      </CardContent>
                  </Card>
              </div>
          </div>
      </div>
    );
  }

  const initials = profile?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "S";

  return (
    <div className="w-[95%] max-w-[1600px] mx-auto py-8 animate-in fade-in duration-500 space-y-6 md:space-y-8 px-4 md:px-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                  <Settings className="text-rose-500" size={28} />
                  Settings
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Manage your student profile, academic configurations, and security.
              </p>
          </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="bg-slate-50 dark:bg-slate-900 rounded-lg p-1 w-full max-w-lg grid grid-cols-4 h-auto">
              <TabsTrigger value="account" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                  <div className="flex flex-row items-center justify-center gap-2">
                      <User size={14} /> <span className="hidden sm:inline">Account</span>
                  </div>
              </TabsTrigger>
              <TabsTrigger value="academic" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                  <div className="flex flex-row items-center justify-center gap-2">
                      <GraduationCap size={14} /> <span className="hidden sm:inline">Academic</span>
                  </div>
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                  <div className="flex flex-row items-center justify-center gap-2">
                      <Shield size={14} /> <span className="hidden sm:inline">Security</span>
                  </div>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="rounded-md h-9 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all">
                  <div className="flex flex-row items-center justify-center gap-2">
                      <Palette size={14} /> <span className="hidden sm:inline">Preferences</span>
                  </div>
              </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                      <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                          <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                              <CardTitle className="text-lg font-bold flex items-center gap-2">
                                  <Fingerprint className="text-rose-500" size={18} /> Student Identity
                              </CardTitle>
                              <CardDescription>Manage your primary account identity.</CardDescription>
                          </CardHeader>
                          <CardContent className="p-6 space-y-6">
                              <div className="flex items-center gap-5 p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                  <div className="h-16 w-16 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center text-xl font-bold text-rose-600 dark:text-rose-400 overflow-hidden">
                                      {profile?.profileImage ? (
                                          <Image src={profile.profileImage} alt={profile.name} width={64} height={64} className="w-full h-full object-cover" />
                                      ) : (
                                          initials
                                      )}
                                  </div>
                                  <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                          <p className="text-base font-bold text-slate-900 dark:text-white">{profile?.name}</p>
                                          {profile?.verified && (
                                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 px-2 py-0 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                  <CheckCircle2 size={10} /> Verified
                                              </Badge>
                                          )}
                                      </div>
                                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#{profile?.studentCode} • Student</p>
                                  </div>
                                  <Button variant="outline" className="ml-auto rounded-lg h-9 px-4 text-xs font-semibold border-slate-200 dark:border-slate-700" onClick={() => router.push('/dashboard/student/profile')}>
                                      View Profile
                                  </Button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                  <div className="space-y-1.5">
                                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Display Name</Label>
                                      <Input value={profile?.name || ''} disabled className="h-10 rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-500" />
                                  </div>
                                  <div className="space-y-1.5">
                                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Institutional Email</Label>
                                      <Input value={profile?.email || ''} disabled className="h-10 rounded-lg bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 text-slate-500" />
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                  </div>

                  <div className="space-y-6">
                      <Card className="rounded-2xl border-rose-100 dark:border-rose-500/20 shadow-sm bg-rose-50/50 dark:bg-rose-500/5 overflow-hidden">
                          <CardHeader className="px-6 py-5 bg-rose-50/80 dark:bg-rose-500/10 border-b border-rose-100/50 dark:border-rose-500/20">
                              <CardTitle className="text-lg font-bold text-rose-900 dark:text-rose-400 flex items-center gap-2">
                                  <School className="text-rose-600 dark:text-rose-400" size={18} /> Linked Academy
                              </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6 space-y-6">
                              <div className="space-y-4">
                                  <div>
                                      <p className="text-xs font-semibold text-rose-500 dark:text-rose-400/70 uppercase tracking-wider mb-1">Institution</p>
                                      <p className="text-base font-bold text-rose-950 dark:text-rose-100">{profile?.school?.name || 'Not Linked'}</p>
                                  </div>
                                  <div>
                                      <p className="text-xs font-semibold text-rose-500 dark:text-rose-400/70 uppercase tracking-wider mb-1">Status</p>
                                      <p className="text-base font-bold text-rose-950 dark:text-rose-100">{profile?.verified ? "Active" : "Pending Verification"}</p>
                                  </div>
                                  {profile?.classes && profile.classes.length > 0 && (
                                      <div>
                                          <p className="text-xs font-semibold text-rose-500 dark:text-rose-400/70 uppercase tracking-wider mb-2">My Classes</p>
                                          <div className="flex flex-wrap gap-2">
                                              {profile.classes.map((c: any) => (
                                                  <Badge key={c.class.id} className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-0 font-bold text-[10px]">
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

          <TabsContent value="academic" className="space-y-6 focus-visible:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Department Card */}
                  <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                      <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                          <CardTitle className="text-lg font-bold flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                  <Building2 className="text-rose-500" size={18} /> Department
                              </div>
                              {isLocked && (
                                  <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-tighter">
                                      <CheckCircle2 size={12} className="mr-1" /> Locked
                                  </Badge>
                              )}
                          </CardTitle>
                          <CardDescription>Your academic department or faculty.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                          {isLocked ? (
                              <div className="flex gap-4 items-center p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                  <Lock className="text-slate-400" size={18} />
                                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                      Department is locked. Contact administration for changes.
                                  </p>
                              </div>
                          ) : (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Department selection is a one-time choice.</p>
                          )}
                          
                          <div className="space-y-2">
                              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Academic Field</Label>
                              <div className="flex flex-col sm:flex-row gap-3">
                                  <div className="flex-1">
                                      <Select value={selectedDept} onValueChange={setSelectedDept} disabled={isLocked || isDeptsLoading}>
                                          <SelectTrigger className="h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                              <SelectValue placeholder={isDeptsLoading ? "Loading..." : "Choose Department"} />
                                          </SelectTrigger>
                                          <SelectContent className="rounded-xl">
                                              {departments.map((dept: any) => (
                                                  <SelectItem key={dept.id} value={dept.id} className="text-sm font-medium">
                                                      {dept.name} ({dept.code})
                                                  </SelectItem>
                                              ))}
                                          </SelectContent>
                                      </Select>
                                  </div>
                                  {!isLocked && (
                                      <Button onClick={handleUpdate} disabled={updateMutation.isPending || !selectedDept} className="h-10 px-6 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                                          {updateMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                          Lock In
                                      </Button>
                                  )}
                              </div>
                          </div>
                      </CardContent>
                  </Card>

                  {/* Level Card */}
                  <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                      <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                          <CardTitle className="text-lg font-bold flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                  <GraduationCap className="text-rose-500" size={18} /> Academic Level
                              </div>
                              {isLevelLocked && (
                                  <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-tighter">
                                      <CheckCircle2 size={12} className="mr-1" /> Locked
                                  </Badge>
                              )}
                          </CardTitle>
                          <CardDescription>Your current grade or academic level.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                          {isLevelLocked ? (
                              <div className="flex items-center gap-4 p-5 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
                                  <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0">
                                      <BookOpen className="text-rose-600 dark:text-rose-400" size={20} />
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Level</p>
                                      <p className="text-lg font-bold text-slate-900 dark:text-white">{profile?.level}</p>
                                  </div>
                              </div>
                          ) : (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Level selection is permanent. Only the school can update it after.</p>
                          )}

                          {!isLevelLocked && (
                              <div className="space-y-2">
                                  <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Level</Label>
                                  <div className="flex flex-col sm:flex-row gap-3">
                                      <div className="flex-1">
                                          <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={isLevelLocked}>
                                              <SelectTrigger className="h-10 rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                                  <SelectValue placeholder="Choose Level" />
                                              </SelectTrigger>
                                              <SelectContent className="rounded-xl">
                                                  {schoolLevels.map((lvl: string) => (
                                                      <SelectItem key={lvl} value={lvl} className="text-sm font-medium">
                                                          {lvl}
                                                      </SelectItem>
                                                  ))}
                                              </SelectContent>
                                          </Select>
                                      </div>
                                      <Button onClick={handleLevelUpdate} disabled={levelMutation.isPending || !selectedLevel} className="h-10 px-6 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                                          {levelMutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                          Lock In
                                      </Button>
                                  </div>
                              </div>
                          )}
                      </CardContent>
                  </Card>
              </div>
          </TabsContent>

          <TabsContent value="security" className="focus-visible:outline-none">
              <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                          <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                              <CardTitle className="text-lg font-bold flex items-center gap-2">
                                  <Lock className="text-rose-500" size={18} /> Password
                              </CardTitle>
                              <CardDescription>Manage your account password.</CardDescription>
                          </CardHeader>
                          <CardContent className="p-6">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 gap-4">
                                  <div className="space-y-1">
                                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Account Password</h4>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">Change your password to ensure account security.</p>
                                  </div>
                                  <ChangePasswordModal>
                                      <Button className="shrink-0 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-6 h-10 shadow-sm">
                                          Change Password
                                      </Button>
                                  </ChangePasswordModal>
                              </div>
                          </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden relative">
                          <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                              <CardTitle className="text-lg font-bold flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                      <Shield className="text-rose-500" size={18} /> Two-Factor Auth
                                  </div>
                              </CardTitle>
                              <CardDescription>Extra layer of account security.</CardDescription>
                          </CardHeader>
                          <CardContent className="p-6 space-y-5">
                              <TwoFactorSetup 
                                  isTwoFactorEnabled={(profile as any)?.isTwoFactorEnabled || false} 
                                  onUpdate={() => {
                                      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
                                  }} 
                              />
                          </CardContent>
                      </Card>
                  </div>

                  <DeviceSessions />
              </div>
          </TabsContent>

          <TabsContent value="preferences" className="focus-visible:outline-none">
              <Card className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                  <CardHeader className="px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <Palette className="text-rose-500" size={18} /> Preferences & Billing
                      </CardTitle>
                      <CardDescription>View your subscription plan and system preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div onClick={() => router.push(isEnforced ? "/dashboard/student/billing" : "#")} className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                              <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                          <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-widest">{activePlanName}</h4>
                                          {!isEnforced && <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-0 text-[10px] font-bold">Linked</Badge>}
                                      </div>
                                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{activeLicenseText}</p>
                                  </div>
                                  <BookOpen className="text-slate-400 group-hover:text-rose-500 transition-colors" size={20} />
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
