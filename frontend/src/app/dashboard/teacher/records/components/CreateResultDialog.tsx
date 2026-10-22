'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useCreateClassSubjectResult } from '@/lib/api/hooks/useRecords';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

import { ShieldAlert, BookOpen, Building2 } from 'lucide-react';

export interface OptionItem {
  id: string;
  name: string;
}

export interface AssignedSubjectItem {
  id: string;
  name: string;
  code?: string;
  departments?: Array<{
    departmentId?: string;
    department?: { id: string; name: string; code?: string };
    id?: string;
    name?: string;
  }>;
}

interface CreateResultDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classes: OptionItem[];
  subjects: AssignedSubjectItem[];
  departments: OptionItem[];
  sessions: OptionItem[];
  isLoadingClasses?: boolean;
  isLoadingSubjects?: boolean;
  isLoadingDepartments?: boolean;
  isLoadingSessions?: boolean;
}

export function CreateResultDialog({
  isOpen,
  onOpenChange,
  classes,
  subjects,
  departments,
  sessions,
  isLoadingClasses,
  isLoadingSubjects,
  isLoadingDepartments,
  isLoadingSessions,
}: CreateResultDialogProps) {
  const router = useRouter();
  const { mutate: createResult, isPending: isCreating } = useCreateClassSubjectResult();

  const [formData, setFormData] = useState({
    name: '',
    classId: '',
    subjectId: '',
    departmentId: '',
    sessionId: '',
    term: 'FIRST',
    revealDate: '',
    releaseDate: '',
    assignmentMax: 10,
    quizMax: 10,
    caMax: 20,
    examMax: 60,
  });

  // Filter subjects based on selected department (if any)
  const availableSubjects = React.useMemo(() => {
    if (!formData.departmentId) return subjects;
    return subjects.filter((s) => {
      if (!s.departments || s.departments.length === 0) return true;
      return s.departments.some((d: any) => {
        const dId = d.departmentId || d.department?.id || d.id;
        return dId === formData.departmentId;
      });
    });
  }, [subjects, formData.departmentId]);

  const handleSubjectChange = (subjectId: string) => {
    const selectedSubj = subjects.find((s) => s.id === subjectId);
    let newDeptId = formData.departmentId;
    if (selectedSubj && selectedSubj.departments && selectedSubj.departments.length > 0) {
      const matchesCurrent = selectedSubj.departments.some((d: any) => {
        const dId = d.departmentId || d.department?.id || d.id;
        return dId === formData.departmentId;
      });
      if (!matchesCurrent) {
        const firstDept = selectedSubj.departments[0];
        newDeptId = firstDept.departmentId || firstDept.department?.id || firstDept.id || '';
      }
    }
    setFormData((prev) => ({
      ...prev,
      subjectId,
      departmentId: newDeptId,
    }));
  };

  const handleDepartmentChange = (departmentId: string) => {
    let newSubjectId = formData.subjectId;
    if (departmentId && newSubjectId) {
      const currentSubj = subjects.find((s) => s.id === newSubjectId);
      if (currentSubj && currentSubj.departments && currentSubj.departments.length > 0) {
        const belongs = currentSubj.departments.some((d: any) => {
          const dId = d.departmentId || d.department?.id || d.id;
          return dId === departmentId;
        });
        if (!belongs) {
          newSubjectId = '';
        }
      }
    }
    setFormData((prev) => ({
      ...prev,
      departmentId,
      subjectId: newSubjectId,
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.classId || !formData.subjectId || !formData.sessionId) {
      toast.error('Please fill in all required fields (Name, Class, Subject, Session).');
      return;
    }

    createResult(
      {
        ...formData,
        departmentId: formData.departmentId || null,
        revealDate: formData.revealDate ? new Date(formData.revealDate).toISOString() : null,
        releaseDate: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : null,
      },
      {
        onSuccess: (res: { data: { id: string } }) => {
          toast.success('Final result configured successfully!');
          onOpenChange(false);
          router.push(`/dashboard/teacher/records/new?id=${res.data.id}`);
        },
        onError: (err: unknown) => {
          const errorMsg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Failed to create result configuration';
          toast.error(errorMsg);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[620px] max-h-[90vh] overflow-y-auto bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              Add New Final Result
            </DialogTitle>
            <HeaderTooltip
              content="Configure parameters for a new termly subject mark sheet. Setting these values determines the grading scale and automated score sync thresholds."
              size={13}
            />
          </div>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure the class, subject, session, and assessment weightings for this report sheet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Warning banner if teacher has no assigned subjects */}
          {!isLoadingSubjects && subjects.length === 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">No Assigned Subjects</p>
                <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                  You are not currently assigned to any subjects. Teachers are only permitted to configure and edit final results for their assigned subjects. Please contact your school administrator.
                </p>
              </div>
            </div>
          )}

          {/* Result Sheet Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Result Sheet Name <span className="text-emerald-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Term 1 Mathematics Result"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
            />
          </div>

          {/* Class, Department, Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Class <span className="text-emerald-500">*</span>
              </label>
              {isLoadingClasses ? (
                <div className="w-full h-11 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer font-medium"
                >
                  <option value="">Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Department
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Assigned</span>
              </div>
              {isLoadingDepartments ? (
                <div className="w-full h-11 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={formData.departmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer font-medium"
                >
                  <option value="">All Assigned Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Subject <span className="text-emerald-500">*</span>
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">My Subjects</span>
              </div>
              {isLoadingSubjects ? (
                <div className="w-full h-11 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={formData.subjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={availableSubjects.length === 0}
                  className="w-full h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {availableSubjects.length === 0 ? 'No assigned subject' : 'Select Assigned Subject'}
                  </option>
                  {availableSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.code ? `(${s.code})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Session & Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Academic Session <span className="text-emerald-500">*</span>
              </label>
              {isLoadingSessions ? (
                <div className="w-full h-11 bg-slate-100 dark:bg-zinc-900 animate-pulse rounded-xl" />
              ) : (
                <select
                  value={formData.sessionId}
                  onChange={(e) => setFormData({ ...formData, sessionId: e.target.value })}
                  className="w-full h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer font-medium"
                >
                  <option value="">Select Session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Term <span className="text-emerald-500">*</span>
              </label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer font-medium"
              >
                <option value="FIRST">First Term</option>
                <option value="SECOND">Second Term</option>
                <option value="THIRD">Third Term</option>
              </select>
            </div>
          </div>

          {/* Reveal & Release Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Reveal Date <span className="text-[10px] text-slate-400 font-normal">(Scores shown)</span>
              </label>
              <input
                type="date"
                value={formData.revealDate}
                onChange={(e) => setFormData({ ...formData, revealDate: e.target.value })}
                className="w-full h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Release Date <span className="text-[10px] text-slate-400 font-normal">(Card visible)</span>
              </label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                className="w-full h-11 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              />
            </div>
          </div>

          {/* Assessment Max Marks */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              Include Assessments & Max Marks
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Assignment</label>
                <input
                  type="number"
                  value={formData.assignmentMax}
                  onChange={(e) => setFormData({ ...formData, assignmentMax: Number(e.target.value) })}
                  className="w-full h-10 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-center font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Quiz Max</label>
                <input
                  type="number"
                  value={formData.quizMax}
                  onChange={(e) => setFormData({ ...formData, quizMax: Number(e.target.value) })}
                  className="w-full h-10 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-center font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">CA Max</label>
                <input
                  type="number"
                  value={formData.caMax}
                  onChange={(e) => setFormData({ ...formData, caMax: Number(e.target.value) })}
                  className="w-full h-10 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-center font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Exam Max</label>
                <input
                  type="number"
                  value={formData.examMax}
                  onChange={(e) => setFormData({ ...formData, examMax: Number(e.target.value) })}
                  className="w-full h-10 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-center font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto h-11 px-5 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating || (!isLoadingSubjects && subjects.length === 0)}
            className="w-full sm:w-auto h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
          >
            {isCreating ? 'Creating Configuration...' : 'Create Result Sheet'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
