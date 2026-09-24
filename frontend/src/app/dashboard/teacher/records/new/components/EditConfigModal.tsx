import React, { useState, useEffect } from "react";
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
import { useSchoolDepartments, useSchoolSubjects } from "@/lib/api/hooks/useSchool";
import { toast } from "react-toastify";
import { Loader2, Settings2 } from "lucide-react";
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

  const classes = Array.isArray(classesResult) ? classesResult : (classesResult as any)?.data || [];
  const departments = Array.isArray(departmentsResult) ? departmentsResult : (departmentsResult as any)?.data || [];
  const subjects = Array.isArray(subjectsResult) ? subjectsResult : (subjectsResult as any)?.data || [];

  const [formData, setFormData] = useState({
    name: "",
    assignmentMax: "",
    quizMax: "",
    caMax: "",
    examMax: "",
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
        assignmentMax: config.assignmentMax?.toString() || "",
        quizMax: config.quizMax?.toString() || "",
        caMax: config.caMax?.toString() || "",
        examMax: config.examMax?.toString() || "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!config?.id) return;

    const payload: any = {
      name: formData.name,
    };

    if (formData.assignmentMax) payload.assignmentMax = Number(formData.assignmentMax);
    if (formData.quizMax) payload.quizMax = Number(formData.quizMax);
    if (formData.caMax) payload.caMax = Number(formData.caMax);
    if (formData.examMax) payload.examMax = Number(formData.examMax);
    if (formData.revealDate) payload.revealDate = new Date(formData.revealDate).toISOString();
    if (formData.releaseDate) payload.releaseDate = new Date(formData.releaseDate).toISOString();
    if (formData.classId) payload.classId = formData.classId;
    if (formData.departmentId) {
      payload.departmentId = formData.departmentId === "none" ? null : formData.departmentId;
    }
    if (formData.subjectId) payload.subjectId = formData.subjectId;

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
          toast.error(err.message || "Failed to update configuration");
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
        return true; // Fallback if no relation data is present
      })
    : departments;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[780px] bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-0">
        <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Settings2 size={20} />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">Edit Configuration</DialogTitle>
            <DialogDescription className="text-xs">
              Update the settings, maximum scores, and release dates for this assessment.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Result Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. First Term Mathematics"
                className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Class</Label>
                <Select value={formData.classId} onValueChange={(val) => setFormData(p => ({ ...p, classId: val }))}>
                  <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Department</Label>
                <Select value={formData.departmentId} onValueChange={(val) => setFormData(p => ({ ...p, departmentId: val }))}>
                  <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / All</SelectItem>
                    {filteredDepartments.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Subject</Label>
                <Select value={formData.subjectId} onValueChange={(val) => setFormData(p => ({ ...p, subjectId: val }))}>
                  <SelectTrigger className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                Maximum Scores
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Assignment</Label>
                  <Input
                    name="assignmentMax"
                    type="number"
                    value={formData.assignmentMax}
                    onChange={handleChange}
                    className="h-10 text-center font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Quiz</Label>
                  <Input
                    name="quizMax"
                    type="number"
                    value={formData.quizMax}
                    onChange={handleChange}
                    className="h-10 text-center font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">CA</Label>
                  <Input
                    name="caMax"
                    type="number"
                    value={formData.caMax}
                    onChange={handleChange}
                    className="h-10 text-center font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-primary font-bold uppercase mb-1 block">Exam</Label>
                  <Input
                    name="examMax"
                    type="number"
                    value={formData.examMax}
                    onChange={handleChange}
                    className="h-10 text-center font-bold bg-primary/5 dark:bg-primary/10 border-primary/20 text-primary rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-200 dark:border-slate-800 pb-2 mt-4">
                Dates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Reveal Date</Label>
                  <Input
                    name="revealDate"
                    type="datetime-local"
                    value={formData.revealDate}
                    onChange={handleChange}
                    className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400 font-bold uppercase mb-1 block">Release Date</Label>
                  <Input
                    name="releaseDate"
                    type="datetime-local"
                    value={formData.releaseDate}
                    onChange={handleChange}
                    className="h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-500">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="rounded-xl font-bold">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
