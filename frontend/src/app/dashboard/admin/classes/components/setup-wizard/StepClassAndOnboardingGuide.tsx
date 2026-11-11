'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Plus,
  Loader2,
  CheckCircle2,
  Link2,
  Users,
  BookOpen,
  Bot,
  ExternalLink,
  Sparkles,
  Calendar,
  GraduationCap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Subject } from '@/app/dashboard/admin/subjects/services/subjectService';
import { Department } from '@/app/dashboard/admin/departments/services/departmentService';
import { Session } from '@/lib/api/services/sessionService';
import { Class } from '@/app/dashboard/admin/classes/services/classService';
import { getFilteredLevelSuggestions } from '@/utils/levelConstants';
import { cn } from '@/lib/utils';

interface StepClassAndOnboardingGuideProps {
  levels: string[];
  subjects: Subject[];
  departments: Department[];
  sessions: Session[];
  existingClasses: Class[];
  onCreateClass: (data: {
    name: string;
    section?: string;
    level?: string;
    sessionId?: string;
    term?: string;
    subjectIds: string[];
    departmentIds: string[];
  }) => Promise<void>;
  onOpenFullClassModal: () => void;
  isCreatingClass: boolean;
}

export const StepClassAndOnboardingGuide: React.FC<StepClassAndOnboardingGuideProps> = ({
  levels,
  subjects,
  departments,
  sessions,
  existingClasses,
  onCreateClass,
  onOpenFullClassModal,
  isCreatingClass,
}) => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [level, setLevel] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [term, setTerm] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);

  const suggestedLevels = getFilteredLevelSuggestions(levels);

  const availableTermsForSession = useMemo<string[]>(() => {
    if (!sessionId) return [];
    const selectedSessionObj = sessions.find(
      (s) => s.name === sessionId || s.id === sessionId
    );
    if (
      selectedSessionObj?.termPeriods &&
      selectedSessionObj.termPeriods.length > 0
    ) {
      const termMap: Record<string, string> = {
        FIRST: 'First Term',
        SECOND: 'Second Term',
        THIRD: 'Third Term',
      };
      return selectedSessionObj.termPeriods.map((tp) => {
        const raw = String(tp.term);
        return (
          termMap[raw] ||
          raw.charAt(0).toUpperCase() +
          raw.slice(1).toLowerCase() +
          (raw.toLowerCase().includes('term') ? '' : ' Term')
        );
      });
    }
    return ['First Term', 'Second Term', 'Third Term'];
  }, [sessionId, sessions]);

  const toggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleDepartment = (id: string) => {
    setSelectedDepartmentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreateClass({
      name: name.trim(),
      section: section.trim() || undefined,
      level: level || undefined,
      sessionId: sessionId || undefined,
      term: term || undefined,
      subjectIds: selectedSubjectIds,
      departmentIds: selectedDepartmentIds,
    });
    setName('');
    setSection('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers size={16} className="text-indigo-600 dark:text-indigo-400" />
            Step 5: Create Your Classes &amp; Connect Teachers / Students
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create a class right here and review how to link students, assign teachers, and get instant AI assistance.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onOpenFullClassModal}
          className="h-8 px-3 w-full sm:w-auto rounded-xl text-xs font-semibold border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 shrink-0"
        >
          Open Full Class Creator
        </Button>
      </div>

      {/* Quick Class Creation Form */}
      <form
        onSubmit={handleQuickCreate}
        className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4"
      >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Plus size={14} className="text-indigo-600 shrink-0" /> Quick Create Class ({existingClasses.length} Created So Far)
            </span>
            {existingClasses.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {existingClasses.slice(0, 3).map((cls) => (
                  <span
                    key={cls.id}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"
                  >
                    {cls.name} {cls.section ? `(${cls.section})` : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Class Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. JSS 1 Gold / SSS 2 Science"
                className="rounded-xl bg-white dark:bg-slate-900 h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Section / Arm
              </Label>
              <Input
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A, B, Science"
                className="rounded-xl bg-white dark:bg-slate-900 h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <GraduationCap size={12} className="text-indigo-500" /> Class Level
              </Label>
              <Select
                value={level || 'NONE'}
                onValueChange={(val) => setLevel(val === 'NONE' ? '' : val)}
              >
                <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900 h-9 text-xs">
                  <SelectValue placeholder="Select Level..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-slate-900 max-h-60">
                  <SelectItem value="NONE">No Level Assigned</SelectItem>
                  {levels.map((lvl) => (
                    <SelectItem key={`cfg-${lvl}`} value={lvl}>
                      {lvl}
                    </SelectItem>
                  ))}
                  {suggestedLevels.map((lvl) => (
                    <SelectItem key={`sug-${lvl}`} value={lvl}>
                      {lvl} (Suggested)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar size={12} className="text-orange-500" /> Academic Session
              </Label>
              <Select
                value={sessionId || 'NONE'}
                onValueChange={(val) => {
                  setSessionId(val === 'NONE' ? '' : val);
                  setTerm('');
                }}
              >
                <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900 h-9 text-xs">
                  <SelectValue placeholder="Select Session..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-slate-900">
                  <SelectItem value="NONE">Select Session</SelectItem>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar size={12} className="text-emerald-500" /> Academic Term
              </Label>
              <Select
                value={term || 'NONE'}
                onValueChange={(val) => setTerm(val === 'NONE' ? '' : val)}
                disabled={!sessionId}
              >
                <SelectTrigger
                  className={cn(
                    'rounded-xl bg-white dark:bg-slate-900 h-9 text-xs',
                    !sessionId && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  <SelectValue
                    placeholder={sessionId ? 'Select Term...' : 'Select a session first'}
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white dark:bg-slate-900">
                  <SelectItem value="NONE">Select Term</SelectItem>
                  {availableTermsForSession.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Quick Pick Subjects & Departments */}
          {(subjects.length > 0 || departments.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {subjects.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Attach Subjects ({selectedSubjectIds.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSubjectIds(
                          selectedSubjectIds.length === subjects.length
                            ? []
                            : subjects.map((s) => s.id)
                        )
                      }
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {selectedSubjectIds.length === subjects.length ? 'Clear All' : 'Select All'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {subjects.map((sub) => {
                      const active = selectedSubjectIds.includes(sub.id);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSubject(sub.id)}
                          className={cn(
                            'px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors',
                            active
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          )}
                        >
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {departments.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Attach Departments ({selectedDepartmentIds.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {departments.map((dept) => {
                      const dKey = dept.id || dept.departmentId || dept.code;
                      const active = selectedDepartmentIds.includes(dKey);
                      return (
                        <button
                          key={dKey}
                          type="button"
                          onClick={() => toggleDepartment(dKey)}
                          className={cn(
                            'px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors',
                            active
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          )}
                        >
                          {dept.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              disabled={isCreatingClass || !name.trim()}
              className="h-9 px-5 w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              {isCreatingClass ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Creating Class...
                </>
              ) : (
                <>
                  <Plus size={14} /> Create Class Now
                </>
              )}
            </Button>
          </div>
      </form>

      {/* Essential Next-Step Instructions for Admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. Link Students & Teachers */}
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Link2 size={16} />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              1. Link Students &amp; Teachers
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Connect with your students and teachers in the <strong>Linking Hub</strong> using your school&apos;s linking code or invitations so you can enroll and add them directly to your classes.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/admin/linking')}
            className="h-8 w-full rounded-xl text-[11px] font-semibold border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 flex items-center justify-center gap-1.5"
          >
            Open Linking Hub <ExternalLink size={12} />
          </Button>
        </div>

        {/* 2. Assign Teachers to Subjects */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="size-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Users size={16} />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              2. Assign Teachers to Subjects
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Visit the <strong>Teachers Page</strong>, open a teacher&apos;s details, and assign them to their specific curriculum subjects and classes so they can manage grades, exams, and attendance.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/admin/teachers')}
            className="h-8 w-full rounded-xl text-[11px] font-semibold border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 flex items-center justify-center gap-1.5"
          >
            Go to Teachers Page <ExternalLink size={12} />
          </Button>
        </div>

        {/* 3. Ask AI in Support or Landing Page */}
        <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="size-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Bot size={16} />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              3. Need Help? Ask Our AI <Sparkles size={12} className="text-purple-500" />
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              If anything is unclear at any point, ask our <strong>AI Assistant</strong> in the <strong>Support Center</strong> or directly on the <strong>Landing Page</strong> for instant step-by-step guidance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/admin/support')}
              className="h-8 flex-1 rounded-xl text-[11px] font-semibold border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 flex items-center justify-center gap-1"
            >
              Support AI <ExternalLink size={11} />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open('/', '_blank')}
              className="h-8 flex-1 rounded-xl text-[11px] font-semibold border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 flex items-center justify-center gap-1"
            >
              Landing Page <ExternalLink size={11} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
