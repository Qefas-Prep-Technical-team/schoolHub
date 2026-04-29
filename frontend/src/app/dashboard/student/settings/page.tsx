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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import {
  ShieldAlert,
  GraduationCap,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Mail,
  Fingerprint,
  Settings,
  Bell,
  SunMoon,
  Camera,
  School,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentSettingsPage() {
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState<string>("");

  // 1. Fetch Student Profile
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => studentService.getProfile(),
  });

  // 2. Fetch Departments (only if schoolId is available)
  const { data: departments = [], isLoading: isDeptsLoading } = useQuery({
    queryKey: ["school-departments", profile?.schoolId],
    queryFn: () => departmentService.getDepartments(profile?.schoolId!),
    enabled: !!profile?.schoolId,
  });

  useEffect(() => {
    if (profile?.departmentId) {
      setSelectedDept(profile.departmentId);
    }
  }, [profile]);

  // 3. Mutation for picked department
  const updateMutation = useMutation({
    mutationFn: (deptId: string) => studentService.updateDepartment(deptId),
    onSuccess: () => {
      toast.success("Department successfully selected!");
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update department");
    },
  });

  const handleUpdate = () => {
    if (!selectedDept) {
      toast.warn("Please select a department first");
      return;
    }
    updateMutation.mutate(selectedDept);
  };

  const isLocked = !!profile?.departmentId;

  if (isProfileLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  const initials = profile?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("") || "S";

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-black/40 p-4 md:p-8 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Modern Header / Profile Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-pink-600 via-rose-600 to-pink-700 p-8 md:p-12 text-white shadow-2xl shadow-pink-500/20">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="relative group">
              <Avatar className="size-28 md:size-32 border-4 border-white/20 shadow-2xl ring-4 ring-white/10 group-hover:scale-105 transition-transform duration-500">
                <AvatarImage src="" />
                <AvatarFallback className="bg-white/10 text-4xl font-black text-white backdrop-blur-md">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-1 right-1 bg-white text-pink-600 p-2 rounded-full shadow-lg hover:bg-rose-50 transition-colors">
                <Camera size={18} />
              </button>
            </div>

            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight drop-shadow-sm">
                  {profile?.name}
                </h1>
                {profile?.verified && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-widest flex gap-1.5">
                    <CheckCircle2 size={12} /> Verified
                  </Badge>
                )}
              </div>
              <p className="text-rose-100 font-medium text-lg opacity-90">{profile?.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <Badge variant="outline" className="border-white/30 text-white font-bold text-xs">
                  ID: {profile?.studentCode}
                </Badge>
                <Badge variant="outline" className="border-white/30 text-white font-bold text-xs uppercase">
                  {profile?.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-80 bg-rose-400/20 rounded-full blur-3xl opacity-50" />
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:flex p-1 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl h-14 mb-8">
            <TabsTrigger value="general" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all">
              General
            </TabsTrigger>
            <TabsTrigger value="academic" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-rose-600 data-[state=active]:text-white transition-all">
              Academic
            </TabsTrigger>
            <TabsTrigger value="account" className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-pink-500 data-[state=active]:text-white transition-all">
              Account
            </TabsTrigger>
          </TabsList>

          <div className="grid gap-8">
            {/* General Tab */}
            <TabsContent value="general" className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Card className="rounded-3xl border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
                      <div className="flex items-center gap-3">
                        <User className="text-pink-600" size={20} />
                        <CardTitle className="text-lg font-black uppercase tracking-wider">Personal Information</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <User size={16} className="text-slate-400" /> {profile?.name}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Mail size={16} className="text-slate-400" /> {profile?.email}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Code</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Fingerprint size={16} className="text-slate-400" /> #{profile?.studentCode}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                        <div className="flex items-center gap-2">
                          <div className={cn("size-2 rounded-full", profile?.verified ? "bg-emerald-500" : "bg-amber-500")} />
                          <p className="text-base font-black text-slate-900 dark:text-white">
                            {profile?.verified ? "Active & Verified" : "Pending Verification"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="p-8 rounded-[2rem] bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-500/10">
                    <div className="flex gap-4">
                      <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center shrink-0">
                        <Settings className="text-pink-500" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-rose-900 dark:text-rose-200 text-lg">Quick Preferences</h3>
                        <p className="text-rose-700/70 dark:text-rose-400/60 text-sm leading-relaxed mb-4">
                          Looking to update your profile picture or security details? Head over to the Account tab.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <Card className="rounded-3xl border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">Support</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                        If you need to change your name or linked email, please contact your school administrator.
                      </p>
                      <Button className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white font-bold text-xs" variant="ghost">
                        Help Center
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Academic Tab */}
            <TabsContent value="academic" className="animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Department Section */}
                  <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                    <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 className="text-pink-500" size={20} />
                          <CardTitle className="text-lg font-black uppercase tracking-wider">Department Configuration</CardTitle>
                        </div>
                        {isLocked && (
                          <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-tighter">
                            <CheckCircle2 size={12} className="mr-1" /> Locked
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">
                      {!isLocked ? (
                        <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-400 p-6 rounded-2xl flex gap-4">
                          <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                          <div>
                            <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm uppercase tracking-tight">One-Time Choice</h4>
                            <p className="text-amber-700/80 dark:text-amber-400/80 text-sm mt-1 leading-relaxed font-medium">
                              Department selection is restricted to a single update. Ensure your choice is accurate.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                          <Lock className="text-slate-400" size={20} />
                          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                            Updates are currently locked. Contact administration for changes.
                          </p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Academic Field
                        </label>
                        {!profile?.schoolId ? (
                          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                            <School size={32} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-sm font-bold text-slate-400">Please link to a school first.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                              <Select
                                value={selectedDept}
                                onValueChange={setSelectedDept}
                                disabled={isLocked || isDeptsLoading}
                              >
                                <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20 text-base font-bold">
                                  <SelectValue placeholder={isDeptsLoading ? "Loading..." : "Choose Department"} />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl shadow-2xl overflow-hidden p-1">
                                  {departments.map((dept: any) => (
                                    <SelectItem 
                                      key={dept.id} 
                                      value={dept.id}
                                      className="rounded-xl my-1 focus:bg-pink-50 dark:focus:bg-pink-900/40 text-sm cursor-pointer py-3"
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{dept.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold tracking-widest">{dept.code}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {!isLocked && (
                              <Button
                                onClick={handleUpdate}
                                disabled={updateMutation.isPending || !selectedDept}
                                className="h-14 px-8 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-black shadow-lg shadow-pink-200 transition-all hover:-translate-y-1 active:scale-95 group"
                              >
                                {updateMutation.isPending ? "Syncing..." : "Lock In Selection"}
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-8">
                  <Card className="rounded-3xl border-0 shadow-lg bg-pink-600 p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10 space-y-4">
                      <div className="size-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                        <School size={24} />
                      </div>
                      <h3 className="text-xl font-black">Institution</h3>
                      <p className="text-rose-100 text-sm font-medium leading-relaxed opacity-80">
                        Primary: <span className="font-bold text-white">{profile?.school?.name || "No School Linked"}</span>
                      </p>
                      {profile?.classes && profile.classes.length > 0 && (
                        <div className="pt-2">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">My Classes</p>
                           <div className="flex flex-wrap gap-2">
                             {profile.classes.map((c: any) => (
                               <Badge key={c.class.id} className="bg-white/10 hover:bg-white/20 border-0 text-white text-[10px] font-bold">
                                 {c.class.name} {c.class.section}
                               </Badge>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-0 right-0 -tr-10 -mt-10 size-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="animate-in fade-in duration-500">
               <Card className="rounded-3xl border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                  <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 px-8 py-6">
                    <div className="flex items-center gap-3">
                      <Settings className="text-violet-600" size={20} />
                      <CardTitle className="text-lg font-black uppercase tracking-wider">Account Preferences</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                       <div className="p-8 border-b md:border-r space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="flex gap-4">
                               <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                 <Lock className="text-violet-600" size={18} />
                               </div>
                               <div>
                                 <h4 className="font-bold text-slate-900 dark:text-white">Security</h4>
                                 <p className="text-xs text-slate-500 font-medium">Password and Two-Factor Authentication</p>
                               </div>
                             </div>
                             <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-2">Change</Button>
                          </div>
                          <Separator className="opacity-50" />
                          <div className="flex items-center justify-between">
                             <div className="flex gap-4">
                               <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                 <Bell className="text-violet-600" size={18} />
                               </div>
                               <div>
                                 <h4 className="font-bold text-slate-900 dark:text-white">Notifications</h4>
                                 <p className="text-xs text-slate-500 font-medium">Control what alerts you receive</p>
                               </div>
                             </div>
                             <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-2">Configure</Button>
                          </div>
                       </div>
                       
                       <div className="p-8 space-y-6 bg-slate-50/30 dark:bg-slate-800/30">
                          <div className="flex items-center justify-between">
                             <div className="flex gap-4">
                               <div className="size-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                                 <SunMoon className="text-orange-600" size={18} />
                               </div>
                               <div>
                                 <h4 className="font-bold text-slate-900 dark:text-white">Appearance</h4>
                                 <p className="text-xs text-slate-500 font-medium">Customize your interface theme</p>
                               </div>
                             </div>
                             <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-700 font-black text-[9px] uppercase tracking-widest">System Default</Badge>
                          </div>
                          
                          <div className="mt-12 p-6 rounded-2xl bg-violet-600 text-white relative flex items-center justify-between group overflow-hidden cursor-pointer">
                             <div className="relative z-10">
                                <h4 className="font-black text-sm uppercase tracking-widest">Qefas Hub Pro</h4>
                                <p className="text-[10px] opacity-80 font-bold">Standard Student License</p>
                             </div>
                             <BookOpen size={24} className="opacity-20 group-hover:scale-125 transition-transform" />
                             <div className="absolute bottom-0 right-0 -mr-10 -mb-10 size-32 bg-white/10 rounded-full blur-2xl" />
                          </div>
                       </div>
                    </div>
                  </CardContent>
               </Card>
            </TabsContent>
          </div>
        </Tabs>

      </div>
    </div>
  );
}

