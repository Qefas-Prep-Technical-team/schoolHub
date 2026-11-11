'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Subject } from '@/app/dashboard/admin/subjects/services/subjectService';
import {
  NigerianStandardSubject,
  getFilteredSubjectSuggestions,
} from '@/utils/curriculumConstants';
import { cn } from '@/lib/utils';

interface StepCurriculumSubjectsProps {
  subjects: Subject[];
  onAddSuggestedSubject: (sug: NigerianStandardSubject) => Promise<void>;
  onAddCustomSubject: (data: { name: string; code: string; description?: string }) => Promise<void>;
  addingSubjectCode: string | null;
}

export const StepCurriculumSubjects: React.FC<StepCurriculumSubjectsProps> = ({
  subjects,
  onAddSuggestedSubject,
  onAddCustomSubject,
  addingSubjectCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  const suggestions = getFilteredSubjectSuggestions(subjects);
  const filteredSchoolSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCustom = async () => {
    const trimmedName = customName.trim();
    const trimmedCode =
      customCode.trim().toUpperCase() ||
      trimmedName
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 4)
        .toUpperCase();
    if (!trimmedName || !trimmedCode) return;

    setIsCreatingCustom(true);
    try {
      await onAddCustomSubject({
        name: trimmedName,
        code: trimmedCode,
        description: customDesc.trim() || undefined,
      });
      setCustomName('');
      setCustomCode('');
      setCustomDesc('');
    } finally {
      setIsCreatingCustom(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-600 dark:text-indigo-400" />
            Step 3: Configure School Curriculum Subjects
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add NERDC standard Nigerian subjects (each pre-loaded with a 10-week Term 1 Scheme of Work) or create custom school subjects.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 shrink-0 self-start sm:self-auto">
          {subjects.length} Subjects
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your school's subjects or Nigerian curriculum suggestions..."
          className="pl-10 rounded-xl bg-white dark:bg-slate-900"
        />
      </div>

      {/* Active School Subjects */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-500" /> Your School&apos;s Subjects ({filteredSchoolSubjects.length})
        </span>
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 max-h-36 overflow-y-auto custom-scrollbar">
          {filteredSchoolSubjects.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-3">
              No school subjects found. Click any suggestion below or add a custom subject.
            </p>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredSchoolSubjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {sub.name}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase truncate">
                        {sub.code}
                      </p>
                    </div>
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  </div>
                ))}
              </div>
          )}
            </div>
      </div>

        {/* Create New Custom Subject */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Add a Custom Subject
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <Input
              value={customName}
              onChange={(e) => {
                setCustomName(e.target.value);
                if (!customCode) {
                  setCustomCode(
                    e.target.value
                      .replace(/[^a-zA-Z0-9]/g, '')
                      .slice(0, 4)
                      .toUpperCase()
                  );
                }
              }}
              placeholder="Subject Name (e.g. French Language)"
              className="sm:col-span-5 rounded-xl bg-white dark:bg-slate-900 h-9 text-xs"
            />
            <Input
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              placeholder="Code (e.g. FRE)"
              className="sm:col-span-2 rounded-xl bg-white dark:bg-slate-900 h-9 text-xs uppercase"
            />
            <Input
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Optional description..."
              className="sm:col-span-3 rounded-xl bg-white dark:bg-slate-900 h-9 text-xs"
            />
            <Button
              type="button"
              onClick={handleCreateCustom}
              disabled={!customName.trim() || isCreatingCustom || !!addingSubjectCode}
              className="sm:col-span-2 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1"
            >
              {isCreatingCustom ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Add
            </Button>
          </div>
        </div>

        {/* Suggested Nigerian Curriculum Subjects */}
        <div className="space-y-2.5 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles size={14} /> Suggested Nigerian Curriculum Subjects ({filteredSuggestions.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Click + to add with 10-Week Scheme of Work
              </span>
            </div>

            {filteredSuggestions.length === 0 ? (
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-center text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                All matching suggested subjects have been added to your school!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                {filteredSuggestions.map((sug) => {
                  const isAdding = addingSubjectCode === sug.code;
                  return (
                    <button
                      key={sug.code}
                      type="button"
                      disabled={!!addingSubjectCode || isCreatingCustom}
                      onClick={() => onAddSuggestedSubject(sug)}
                      className={cn(
                        'group flex items-center justify-between p-2.5 rounded-xl text-left bg-indigo-50/50 hover:bg-indigo-100/70 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800/60 transition-all',
                        addingSubjectCode && !isAdding && 'opacity-50 cursor-not-allowed',
                        isAdding && 'ring-2 ring-indigo-500/40 bg-indigo-100/80 dark:bg-indigo-900/60 cursor-wait'
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {sug.name}
                        </p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate">
                          {isAdding
                            ? 'Adding to your school subjects...'
                            : `${sug.category} • ${sug.code} • 10-Wk Scheme`}
                        </p>
                      </div>
                      <span className="size-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold group-hover:scale-105 transition-transform shrink-0">
                        {isAdding ? <Loader2 size={12} className="animate-spin" /> : '+'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        );
};

