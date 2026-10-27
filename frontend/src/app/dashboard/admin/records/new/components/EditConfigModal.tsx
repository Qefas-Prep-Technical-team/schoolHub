import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateClassSubjectResult } from "@/lib/api/hooks/useRecords";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useClasses } from "@/lib/api/hooks/useClasses";
import { useSessions } from "@/lib/api/hooks/useSessions";
import { useSchoolDepartments, useSchoolSubjects } from "@/lib/api/hooks/useSchool";
import { toast } from "react-toastify";
import { Loader2, Settings2, Calendar, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface EditConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
}

export function EditConfigModal({ isOpen, onClose, config }: EditConfigModalProps) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateClassSubjectResult();

  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { data: classesResult } = useClasses(schoolId);
  const { data: departmentsResult } = useSchoolDepartments(schoolId);
  const { data: subjectsResult } = useSchoolSubjects(schoolId);
  const { data: sessionsResult } = useSessions(schoolId);

  const classes = Array.isArray(classesResult) ? classesResult : (classesResult as any)?.data || [];
  const departments = Array.isArray(departmentsResult) ? departmentsResult : (departmentsResult as any)?.data || [];
  const subjects = Array.isArray(subjectsResult) ? subjectsResult : (subjectsResult as any)?.data || [];
  const sessions = useMemo(() => {
    if (Array.isArray(sessionsResult)) return sessionsResult;
    return (sessionsResult as any)?.data || [];
  }, [sessionsResult]);

  const [formData, setFormData] = useState({
    name: "",
    assignmentMax: "10",
    quizMax: "10",
    caMax: "20",
    examMax: "60",
    sessionId: "",
    term: "FIRST",
    revealDate: "",
    releaseDate: "",
    classId: "",
    departmentId: "",
    subjectId: "",
  });

  useEffect(() => {
    if (config && isOpen) {
      setFormData({
        name: config.name || "",
        assignmentMax: config.assignmentMax != null ? String(config.assignmentMax) : "10",
        quizMax: config.quizMax != null ? String(config.quizMax) : "10",
        caMax: config.caMax != null ? String(config.caMax) : "20",
        examMax: config.examMax != null ? String(config.examMax) : "60",
        sessionId: config.sessionId || config.session?.id || "",
        term: config.term || "FIRST",
        revealDate: config.revealDate ? new Date(config.revealDate).toISOString().slice(0, 16) : "",
        releaseDate: config.releaseDate ? new Date(config.releaseDate).toISOString().slice(0, 16) : "",
        classId: config.classId || "",
        departmentId: config.departmentId || "",
        subjectId: config.subjectId || "",
      });
    }
  }, [config, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Dynamic sum calculation of max marks
  const totalMaxMarks = useMemo(() => {
    const assign = parseFloat(formData.assignmentMax) || 0;
    const quiz = parseFloat(formData.quizMax) || 0;
    const ca = parseFloat(formData.caMax) || 0;
    const exam = parseFloat(formData.examMax) || 0;
    return assign + quiz + ca + exam;
  }, [formData.assignmentMax, formData.quizMax, formData.caMax, formData.examMax]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!config?.id) return;

    const payload: Record<string, any> = {
      name: formData.name.trim(),
    };

    payload.assignmentMax = formData.assignmentMax !== "" ? Number(formData.assignmentMax) : null;
    payload.quizMax = formData.quizMax !== "" ? Number(formData.quizMax) : null;
    payload.caMax = formData.caMax !== "" ? Number(formData.caMax) : null;
    payload.examMax = formData.examMax !== "" ? Number(formData.examMax) : null;
    payload.revealDate = formData.revealDate ? new Date(formData.revealDate).toISOString() : null;
    payload.releaseDate = formData.releaseDate ? new Date(formData.releaseDate).toISOString() : null;
    if (formData.classId) payload.classId = formData.classId;
    if (formData.departmentId) {
      payload.departmentId = formData.departmentId === "none" ? null : formData.departmentId;
    }
    if (formData.subjectId) payload.subjectId = formData.subjectId;
    if (formData.sessionId) payload.sessionId = formData.sessionId;
    if (formData.term) payload.term = formData.term;

    mutate(
      { id: config.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Configuration updated successfully!");
          queryClient.invalidateQueries({ queryKey: ["classSubjectResult", config.id] });
          queryClient.invalidateQueries({ queryKey: ["classSubjectResults"] });
          onClose();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || err.message || "Failed to update configuration");
        },
      }
    );
  };

  const selectedSubject = subjects.find((s: any) => s.id === formData.subjectId);
  const filteredDepartments = formData.subjectId
    ? departments.filter((d: any) => {
        if (selectedSubject?.departments && selectedSubject.departments.length > 0) {
          return selectedSubject.departments.some((sd: any) => sd.departmentId === d.id);
        }
        if (d.subjects && d.subjects.length > 0) {
          return d.subjects.some((s: any) => s.subjectId === formData.subjectId || s.id === formData.subjectId);
        }
        return true;
      })
    : departments;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[760px] max-h-[92vh] overflow-y-auto bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl p-0 shadow-2xl">
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#5B5CE6]/10 text-[#5B5CE6] flex items-center justify-center shrink-0">
              <Settings2 size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Configuration Settings
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                Control maximum marks, session, term, release dates, and academic details.
              </DialogDescription>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Information */}
          <div className="space-y-4">
            <div>
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">
                Result Configuration Name
              </Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. First Term Mathematics"
                className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl font-medium"
                required
              />
            </div>

            {/* Session & Term Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div>
                <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">
                  Academic Session
                </Label>
                <Select
                  value={formData.sessionId}
                  onValueChange={(val) => setFormData((p) => ({ ...p, sessionId: val }))}
                >
                  <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl font-medium">
                    <SelectValue placeholder="Select Session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">
                  Academic Term
                </Label>
                <Select
                  value={formData.term}
                  onValueChange={(val) => setFormData((p) => ({ ...p, term: val }))}
                >
                  <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 rounded-xl font-medium">
                    <SelectValue placeholder="Select Term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIRST">First Term</SelectItem>
                    <SelectItem value="SECOND">Second Term</SelectItem>
                    <SelectItem value="THIRD">Third Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Class, Department & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Class</Label>
                <Select value={formData.classId} onValueChange={(val) => setFormData((p) => ({ ...p, classId: val }))}>
                  <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.section ? `(${c.section})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Department</Label>
                <Select value={formData.departmentId} onValueChange={(val) => setFormData((p) => ({ ...p, departmentId: val }))}>
                  <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / All Departments</SelectItem>
                    {filteredDepartments.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Subject</Label>
                <Select value={formData.subjectId} onValueChange={(val) => setFormData((p) => ({ ...p, subjectId: val }))}>
                  <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Assessment Maximum Marks Section */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    Score Distribution & Maximum Marks
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Define maximum weightings across assessments (Standard: 10 + 10 + 20 + 60 = 100).
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    totalMaxMarks === 100
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                  }`}
                >
                  {totalMaxMarks === 100 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span>Total: {totalMaxMarks} Marks</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-rose-50/50 dark:bg-rose-950/10 p-3 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">
                      Assignment
                    </Label>
                    <span className="text-[9px] text-rose-400 font-semibold">Max 10</span>
                  </div>
                  <Input
                    name="assignmentMax"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.assignmentMax}
                    onChange={handleChange}
                    className="h-10 text-center font-black text-base bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg shadow-sm"
                  />
                </div>

                <div className="bg-amber-50/50 dark:bg-amber-950/10 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">
                      Quiz / Test
                    </Label>
                    <span className="text-[9px] text-amber-400 font-semibold">Max 10</span>
                  </div>
                  <Input
                    name="quizMax"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.quizMax}
                    onChange={handleChange}
                    className="h-10 text-center font-black text-base bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-lg shadow-sm"
                  />
                </div>

                <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                      Continuous (CA)
                    </Label>
                    <span className="text-[9px] text-emerald-400 font-semibold">Max 20</span>
                  </div>
                  <Input
                    name="caMax"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.caMax}
                    onChange={handleChange}
                    className="h-10 text-center font-black text-base bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg shadow-sm"
                  />
                </div>

                <div className="bg-[#5B5CE6]/5 dark:bg-[#5B5CE6]/10 p-3 rounded-xl border border-[#5B5CE6]/30">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] text-[#5B5CE6] font-bold uppercase">
                      Final Exam
                    </Label>
                    <span className="text-[9px] text-[#5B5CE6]/70 font-semibold">Max 60</span>
                  </div>
                  <Input
                    name="examMax"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.examMax}
                    onChange={handleChange}
                    className="h-10 text-center font-black text-base bg-white dark:bg-slate-900 border-[#5B5CE6]/40 text-[#5B5CE6] rounded-lg shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Release Dates Section */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#5B5CE6]" />
                  Result Publication & Reveal Dates
                </h3>
                <p className="text-[11px] text-slate-400">
                  Optionally control when results become visible or released to students and parents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] text-slate-500 font-bold uppercase">
                      Reveal Date (Visible in Portal)
                    </Label>
                    {formData.revealDate && (
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, revealDate: "" }))}
                        className="text-[10px] text-rose-500 hover:text-rose-700 flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>
                  <Input
                    name="revealDate"
                    type="datetime-local"
                    value={formData.revealDate}
                    onChange={handleChange}
                    className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-[10px] text-slate-500 font-bold uppercase">
                      Release Date (Official Release)
                    </Label>
                    {formData.releaseDate && (
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, releaseDate: "" }))}
                        className="text-[10px] text-rose-500 hover:text-rose-700 flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>
                  <Input
                    name="releaseDate"
                    type="datetime-local"
                    value={formData.releaseDate}
                    onChange={handleChange}
                    className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-xl font-bold bg-[#5B5CE6] hover:bg-[#4a4bd4] text-white shadow-md shadow-[#5B5CE6]/20 px-6"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Configuration Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
