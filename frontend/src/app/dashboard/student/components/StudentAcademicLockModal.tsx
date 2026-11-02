"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Building2,
  GraduationCap,
  CheckCircle2,
  Lock,
  BookOpen,
  Loader2,
  AlertTriangle,
  Sparkles,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { studentService } from "@/lib/api/services/studentService";
import { schoolService } from "@/lib/api/services/schoolService";
import { studentKeys } from "@/lib/api/hooks/useStudent";

interface DepartmentItem {
  id: string;
  name: string;
  code?: string;
  departmentId?: string;
}

interface StudentAcademicLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export const DONT_SHOW_ACADEMIC_LOCK_KEY = "qefas_student_dismiss_academic_lock_modal";

export function StudentAcademicLockModal({
  isOpen,
  onClose,
  profile,
}: StudentAcademicLockModalProps) {
  const queryClient = useQueryClient();

  const [selectedDept, setSelectedDept] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const hasSchool = Boolean(profile?.schoolId || profile?.school?.id);
  const schoolId = profile?.schoolId || profile?.school?.id;

  const isLocked = Boolean(
    profile?.departmentId || profile?.department?.id || profile?.department?.name
  );
  const isLevelLocked = Boolean(profile?.level);

  // Sync state whenever profile updates
  useEffect(() => {
    const deptId = profile?.departmentId || profile?.department?.id;
    if (deptId) {
      setSelectedDept(deptId);
    }
    if (profile?.level) {
      setSelectedLevel(profile.level);
    }
  }, [profile]);

  // Fetch school departments adhering to AGENTS.md staleTime rules (10 min)
  const { data: departments = [], isLoading: isDeptsLoading } = useQuery<DepartmentItem[]>({
    queryKey: ["schoolDepartments", schoolId],
    queryFn: () => schoolService.getDepartments(schoolId!),
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const enrolledDeptName =
    profile?.department?.name ||
    departments.find(
      (d: DepartmentItem) =>
        d.id === (profile?.departmentId || selectedDept) ||
        d.departmentId === (profile?.departmentId || selectedDept)
    )?.name ||
    (selectedDept
      ? departments.find(
          (d: DepartmentItem) => d.id === selectedDept || d.departmentId === selectedDept
        )?.name
      : null) ||
    "Assigned Department";

  const enrolledDeptCode =
    profile?.department?.code ||
    departments.find(
      (d: DepartmentItem) =>
        d.id === (profile?.departmentId || selectedDept) ||
        d.departmentId === (profile?.departmentId || selectedDept)
    )?.code ||
    (selectedDept
      ? departments.find(
          (d: DepartmentItem) => d.id === selectedDept || d.departmentId === selectedDept
        )?.code
      : null);

  const schoolLevels: string[] = profile?.school?.levels || [];

  // Update department mutation
  const updateDeptMutation = useMutation({
    mutationFn: (deptId: string) => studentService.updateDepartment(deptId),
    onSuccess: () => {
      toast.success("Department successfully locked in!");
      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update department");
    },
  });

  // Update level mutation
  const updateLevelMutation = useMutation({
    mutationFn: (level: string) => studentService.updateLevel(level),
    onSuccess: () => {
      toast.success("Grade level successfully locked in!");
      queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to update level");
    },
  });

  const handleDepartmentLock = () => {
    if (!selectedDept) {
      toast.warn("Please select a department first");
      return;
    }
    updateDeptMutation.mutate(selectedDept);
  };

  const handleLevelLock = () => {
    if (!selectedLevel) {
      toast.warn("Please select a grade level first");
      return;
    }
    updateLevelMutation.mutate(selectedLevel);
  };

  const handleDontShowAgain = () => {
    if (typeof window !== "undefined") {
      try {
        const studentId = profile?.id || "guest";
        localStorage.setItem(`${DONT_SHOW_ACADEMIC_LOCK_KEY}_${studentId}`, "true");
      } catch (e) {
        console.error("Failed to set localStorage", e);
      }
    }
    onClose();
  };

  if (!hasSchool) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl sm:max-w-3xl rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 text-left pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Complete Your Academic Profile
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Lock in your academic department and grade level to personalize your curriculum, timetable, and enrolled subjects.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Department Card */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
              <CardHeader className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80">
                <CardTitle className="text-sm sm:text-base font-bold flex items-center justify-between gap-2 text-zinc-900 dark:text-zinc-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-pink-600 dark:text-pink-400" size={17} />
                    <span>Department / Faculty</span>
                  </div>
                  {isLocked && (
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 font-black text-[9px] uppercase tracking-wider">
                      <CheckCircle2 size={10} className="mr-1" /> Locked In
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                  Your academic division or major study branch.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {isLocked ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-900/30">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0 text-pink-600 dark:text-pink-400">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            Enrolled Department
                          </p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {enrolledDeptName}
                            </p>
                            {enrolledDeptCode && (
                              <Badge className="bg-pink-100/70 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-none font-bold text-[10px] px-1.5 py-0.5">
                                {enrolledDeptCode}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      <Lock className="text-zinc-400 shrink-0" size={13} />
                      <span>Department locked in records.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!hasSchool ? (
                      <div className="flex gap-2 items-center px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs font-medium text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="text-amber-500 shrink-0" size={14} />
                        <span>Connect to a school first to select a department.</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        Department choice is permanent once locked.
                      </p>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        Academic Department
                      </Label>
                      <div className="flex flex-col gap-2">
                        <Select
                          value={selectedDept}
                          onValueChange={setSelectedDept}
                          disabled={!hasSchool || isDeptsLoading}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs">
                            <SelectValue
                              placeholder={
                                !hasSchool
                                  ? "No School Connected"
                                  : isDeptsLoading
                                  ? "Loading departments..."
                                  : "Choose Department"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                            {departments.map((dept) => {
                              const deptValue = dept.id || dept.departmentId || "";
                              return (
                                <SelectItem
                                  key={deptValue}
                                  value={deptValue}
                                  className="text-xs font-medium"
                                >
                                  {dept.name} {dept.code ? `(${dept.code})` : ""}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleDepartmentLock}
                          disabled={!hasSchool || updateDeptMutation.isPending || !selectedDept}
                          className="w-full h-9 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50"
                        >
                          {updateDeptMutation.isPending && (
                            <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />
                          )}
                          Lock In Department
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Level Card */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
              <CardHeader className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/80">
                <CardTitle className="text-sm sm:text-base font-bold flex items-center justify-between gap-2 text-zinc-900 dark:text-zinc-100">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="text-pink-600 dark:text-pink-400" size={17} />
                    <span>Academic Grade Level</span>
                  </div>
                  {isLevelLocked && (
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 font-black text-[9px] uppercase tracking-wider">
                      <CheckCircle2 size={10} className="mr-1" /> Locked In
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                  Your current grade or academic standing level.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {isLevelLocked ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-900/30">
                      <div className="h-9 w-9 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0 text-pink-600 dark:text-pink-400">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          Enrolled Level
                        </p>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {profile?.level}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      <Lock className="text-zinc-400 shrink-0" size={13} />
                      <span>Level locked in records.</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!hasSchool ? (
                      <div className="flex gap-2 items-center px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs font-medium text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="text-amber-500 shrink-0" size={14} />
                        <span>Connect to a school first to select a grade level.</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        Level selection is permanent once confirmed.
                      </p>
                    )}

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        Select Grade Level
                      </Label>
                      <div className="flex flex-col gap-2">
                        <Select
                          value={selectedLevel}
                          onValueChange={setSelectedLevel}
                          disabled={!hasSchool || isLevelLocked}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs">
                            <SelectValue
                              placeholder={!hasSchool ? "No School Connected" : "Choose Level"}
                            />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                            {schoolLevels.map((lvl) => (
                              <SelectItem key={lvl} value={lvl} className="text-xs font-medium">
                                {lvl}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleLevelLock}
                          disabled={!hasSchool || updateLevelMutation.isPending || !selectedLevel}
                          className="w-full h-9 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50"
                        >
                          {updateLevelMutation.isPending && (
                            <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />
                          )}
                          Lock In Level
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Modal Footer with Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDontShowAgain}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 gap-1.5 cursor-pointer order-2 sm:order-1"
            >
              <EyeOff size={14} />
              <span>Don't show again</span>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-10 px-5 rounded-xl border-slate-200 dark:border-zinc-800 font-bold text-xs cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
