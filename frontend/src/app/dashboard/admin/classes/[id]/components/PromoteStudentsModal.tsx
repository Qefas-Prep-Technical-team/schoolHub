"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Users,
  ArrowRight,
  Check,
  Search,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Award,
  FileText,
} from "lucide-react";
import { classService } from "@/lib/api/services/classService";
import { studentService } from "@/lib/api/services/studentService";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { toast } from "react-toastify";

export type StudentActionMode = "promote" | "graduate";

interface PromoteStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
  initialStudentId?: string;
  initialMode?: StudentActionMode;
}

const PromoteStudentsModal: React.FC<PromoteStudentsModalProps> = ({
  isOpen,
  onClose,
  classData,
  initialStudentId,
  initialMode = "promote",
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const [mode, setMode] = useState<StudentActionMode>(initialMode);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [targetClassId, setTargetClassId] = useState<string>("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  // Graduation form fields
  const [graduationDate, setGraduationDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [graduationReason, setGraduationReason] = useState<string>(
    "Completed Curriculum & Graduated"
  );
  const [graduationNotes, setGraduationNotes] = useState<string>("");

  // Sync mode and preselected student when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || "promote");
      if (initialStudentId) {
        setSelectedStudentIds([initialStudentId]);
      } else {
        setSelectedStudentIds([]);
      }
      setTargetClassId("");
      setStudentSearchTerm("");
      setGraduationDate(new Date().toISOString().split("T")[0]);
      setGraduationReason("Completed Curriculum & Graduated");
      setGraduationNotes("");
    }
  }, [isOpen, initialStudentId, initialMode]);

  // Fetch all classes for the school to select the target class
  const { data: allClasses = [], isLoading: loadingClasses } = useQuery({
    queryKey: ["school-classes", schoolId],
    queryFn: () => classService.getClasses(schoolId),
    enabled: isOpen && !!schoolId,
  });

  // Promote Mutation
  const promoteMutation = useMutation({
    mutationFn: async () => {
      if (!targetClassId) throw new Error("Please select a destination class.");
      if (selectedStudentIds.length === 0)
        throw new Error("Please select at least one student to promote.");

      return await classService.promoteStudents(classData.id, {
        toClassId: targetClassId,
        studentIds: selectedStudentIds,
      });
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Students successfully promoted.");
      queryClient.invalidateQueries({
        queryKey: ["single-class", classData.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["single-class", targetClassId],
      });
      queryClient.invalidateQueries({ queryKey: ["school-classes"] });
      queryClient.invalidateQueries({ queryKey: ["adminStudents"] });
      queryClient.invalidateQueries({ queryKey: ["studentHistory"] });
      onClose();
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to promote students.";
      toast.error(msg);
    },
  });

  // Graduate Mutation
  const graduateMutation = useMutation({
    mutationFn: async () => {
      if (selectedStudentIds.length === 0)
        throw new Error("Please select at least one student to graduate.");

      return await studentService.batchExitStudents({
        studentIds: selectedStudentIds,
        exitType: "GRADUATED",
        exitDate: graduationDate
          ? new Date(graduationDate).toISOString()
          : new Date().toISOString(),
        exitReason: graduationReason || "Completed Academic Program",
        exitNotes: graduationNotes || undefined,
      });
    },
    onSuccess: (res) => {
      toast.success(
        res?.message ||
          `Successfully graduated ${selectedStudentIds.length} student(s). Graduation recorded in academic history.`
      );
      queryClient.invalidateQueries({
        queryKey: ["single-class", classData.id],
      });
      queryClient.invalidateQueries({ queryKey: ["school-classes"] });
      queryClient.invalidateQueries({ queryKey: ["adminStudents"] });
      queryClient.invalidateQueries({ queryKey: ["studentHistory"] });
      onClose();
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to graduate students.";
      toast.error(msg);
    },
  });

  const isPending = promoteMutation.isPending || graduateMutation.isPending;

  // Filter out the current class from the destination options
  const targetClassOptions = useMemo(() => {
    return allClasses.filter((c: any) => c.id !== classData?.id);
  }, [allClasses, classData?.id]);

  const students = useMemo(() => {
    return classData?.enrollments?.map((e: any) => e.student) || [];
  }, [classData]);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s: any) =>
        s?.name?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        s?.studentCode?.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );
  }, [students, studentSearchTerm]);

  // Handle Select All
  const handleSelectAll = () => {
    if (
      selectedStudentIds.length === filteredStudents.length &&
      filteredStudents.length > 0
    ) {
      const filteredIds = filteredStudents.map((s: any) => s.id);
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      const newIds = [...selectedStudentIds];
      filteredStudents.forEach((s: any) => {
        if (!newIds.includes(s.id)) newIds.push(s.id);
      });
      setSelectedStudentIds(newIds);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "promote") {
      promoteMutation.mutate();
    } else {
      graduateMutation.mutate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              {mode === "promote" ? (
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <ArrowRight size={20} />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap size={20} />
                </div>
              )}
              <span>
                {mode === "promote"
                  ? "Promote Students to Next Class"
                  : "Mark Students as Graduated"}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {mode === "promote"
                ? `Transition enrolled students from ${classData?.name || "this class"} into a higher class level.`
                : `Conclude academic journey for students in ${classData?.name || "this class"} and record their official graduation history.`}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="p-4 px-6 bg-slate-50/40 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-2xl">
            <button
              type="button"
              onClick={() => setMode("promote")}
              disabled={isPending}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                mode === "promote"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ArrowRight size={15} />
              <span>Promote to Class</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("graduate")}
              disabled={isPending}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                mode === "graduate"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap size={15} />
              <span>Mark as Graduated</span>
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {mode === "promote" ? (
            /* Destination Class Picker */
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Destination Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-xs font-semibold text-slate-900 dark:text-white"
                required
              >
                <option value="">-- Select Destination Class --</option>
                {loadingClasses ? (
                  <option disabled>Loading classes...</option>
                ) : targetClassOptions.length === 0 ? (
                  <option disabled>No other classes available</option>
                ) : (
                  targetClassOptions.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.section ? `(${c.section})` : ""} — Level: {c.level || "Standard"}
                    </option>
                  ))
                )}
              </select>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Selected students will be transferred, enrolled into the destination class, and recorded in their academic timeline as <span className="font-bold text-indigo-600 dark:text-indigo-400">PROMOTED</span>.
              </p>
            </div>
          ) : (
            /* Graduation Information */
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Award size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Graduation Credentials & Record
                  </h4>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                    Marking students as graduated will record a permanent <span className="font-bold">GRADUATED</span> event in their academic history, update their enrollment status, and archive their class membership.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Calendar size={13} className="text-emerald-600" />
                    Graduation Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={graduationDate}
                    onChange={(e) => setGraduationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Award size={13} className="text-emerald-600" />
                    Reason / Honors
                  </label>
                  <input
                    type="text"
                    value={graduationReason}
                    onChange={(e) => setGraduationReason(e.target.value)}
                    placeholder="e.g. Completed Senior Secondary, Valedictorian"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <FileText size={13} className="text-emerald-600" />
                  Graduation Notes / Commendation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={graduationNotes}
                  onChange={(e) => setGraduationNotes(e.target.value)}
                  placeholder="Official graduation remarks, certificate numbers, or honors notes..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>
          )}

          {/* Student Roster Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users size={15} className="text-slate-400" />
                Select Students ({selectedStudentIds.length} of {students.length} Selected)
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline transition-all"
              >
                {selectedStudentIds.length === filteredStudents.length &&
                filteredStudents.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <input
                type="text"
                placeholder="Search students by name or student ID..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 mt-2">
              {students.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <AlertTriangle
                    className="mx-auto text-amber-500 mb-2"
                    size={22}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    No active students enrolled in this class.
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">
                  No students match your search criteria.
                </p>
              ) : (
                filteredStudents.map((student: any) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? mode === "promote"
                            ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700"
                            : "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs uppercase ${
                            isSelected
                              ? mode === "promote"
                                ? "bg-indigo-600 text-white"
                                : "bg-emerald-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {student.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isSelected
                                ? mode === "promote"
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {student.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            ID: {student.studentCode || student.studentId || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isSelected
                            ? mode === "promote"
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-emerald-600 border-emerald-600"
                            : "border-slate-300 dark:border-slate-600 bg-transparent"
                        }`}
                      >
                        {isSelected && (
                          <Check size={13} className="text-white" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isPending ||
                selectedStudentIds.length === 0 ||
                (mode === "promote" && !targetClassId)
              }
              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                mode === "promote"
                  ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
              }`}
            >
              {isPending ? (
                <span>Processing...</span>
              ) : mode === "promote" ? (
                <>
                  <ArrowRight size={14} />
                  <span>
                    Promote {selectedStudentIds.length} Student{selectedStudentIds.length === 1 ? "" : "s"}
                  </span>
                </>
              ) : (
                <>
                  <GraduationCap size={15} />
                  <span>
                    Graduate {selectedStudentIds.length} Student{selectedStudentIds.length === 1 ? "" : "s"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoteStudentsModal;
