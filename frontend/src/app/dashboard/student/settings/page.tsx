"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/lib/api/services/studentService";
import { departmentService, Department } from "@/app/dashboard/admin/departments/services/departmentService";
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
import { toast } from "react-toastify";
import {
  ShieldAlert,
  GraduationCap,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";

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
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-primary">
            <GraduationCap size={32} strokeWidth={2.5} />
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Student Settings
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Manage your academic preferences and profile details.
          </p>
        </div>

        {/* Department Card */}
        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Building2 className="text-indigo-500" size={24} />
                Department Selection
              </CardTitle>
              {isLocked && (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest">
                  <CheckCircle2 size={14} />
                  Confirmed
                </div>
              )}
            </div>
            <CardDescription className="text-base">
              Select your primary field of study. This helps us tailor your exams and learning resources.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            
            {/* Warning Box */}
            {!isLocked ? (
              <div className="bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-400 p-6 rounded-2xl flex gap-4 transition-all hover:shadow-lg hover:shadow-amber-100/50">
                <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-tight text-sm">One-Time Selection</h4>
                  <p className="text-amber-700 dark:text-amber-400/80 text-sm mt-1 leading-relaxed">
                    You can only set your department **once**. Subsequent changes must be requested through your school administration for security and academic integrity.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl flex gap-4 border border-slate-200 dark:border-slate-800 shadow-inner">
                <Lock className="text-slate-400 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight text-sm">Selection Locked</h4>
                  <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                    Your department was successfully registered. To request a change, please contact the **{profile?.school?.name || "School"}** office.
                  </p>
                </div>
              </div>
            )}

            {/* Selection UI */}
            <div className="flex flex-col md:flex-row items-end gap-6 pt-4">
              <div className="flex-1 space-y-3 w-full">
                <label className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  Primary Department
                </label>
                {!profile?.schoolId ? (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                    Your profile is not linked to a school yet. Go to the **Linking Hub** to connect with your institution and select your department.
                  </div>
                ) : (
                  <div className="relative group">
                    <Select
                      value={selectedDept}
                      onValueChange={setSelectedDept}
                      disabled={isLocked || isDeptsLoading}
                    >
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all focus:ring-2 focus:ring-primary/20 text-base font-medium">
                        <SelectValue placeholder={isDeptsLoading ? "Loading departments..." : "Choose your department"} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                        {departments.length > 0 ? (
                          departments.map((dept) => (
                            <SelectItem 
                              key={dept.id} 
                              value={dept.id}
                              className="rounded-xl my-1 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
                            >
                              <div className="flex flex-col py-1">
                                <span className="font-bold">{dept.name}</span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{dept.code}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-500">
                            No departments found for your school.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {!isLocked && profile?.schoolId && (
                <Button
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending || !selectedDept}
                  className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95 group w-full md:w-fit"
                >
                  {updateMutation.isPending ? "Syncing..." : "Confirm Selection"}
                  {!updateMutation.isPending && (
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
          <div className="p-8 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">Why is this important?</h3>
            <p className="text-indigo-700/70 dark:text-indigo-400/60 text-sm leading-relaxed">
              Linking your profile to a department ensures you only see exams, subjects, and announcements relevant to your course of study.
            </p>
          </div>
          <div className="p-8 rounded-[2rem] bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-200 mb-2">Verified Sync</h3>
            <p className="text-emerald-700/70 dark:text-emerald-400/60 text-sm leading-relaxed">
              Your selection triggers a secure sync with your linked instructors and guardians, keeping everyone in your academic circle informed.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
