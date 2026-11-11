'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Department } from '@/app/dashboard/admin/departments/services/departmentService';
import {
  NigerianStandardDepartment,
  getFilteredDepartmentSuggestions,
} from '@/utils/curriculumConstants';
import { cn } from '@/lib/utils';

interface StepAcademicDepartmentsProps {
  departments: Department[];
  onAddSuggestedDepartment: (sug: NigerianStandardDepartment) => Promise<void>;
  onAddCustomDepartment: (data: { name: string; code: string; description?: string }) => Promise<void>;
  addingDepartmentCode: string | null;
}

export const StepAcademicDepartments: React.FC<StepAcademicDepartmentsProps> = ({
  departments,
  onAddSuggestedDepartment,
  onAddCustomDepartment,
  addingDepartmentCode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  const suggestions = getFilteredDepartmentSuggestions(departments);
  const filteredSchoolDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSuggestions = suggestions.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase())
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
      await onAddCustomDepartment({
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
            <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" />
            Step 4: Configure School Academic Departments
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add standard Nigerian departments (Science, Arts &amp; Humanities, Commercial, Junior Secondary, Primary, Early Years) — auto-links core subjects.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 shrink-0 self-start sm:self-auto">
          {departments.length} Departments
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your school's departments or suggestions..."
          className="pl-10 rounded-xl bg-white dark:bg-slate-900"
        />
      </div>

      {/* Active School Departments */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-emerald-500" /> Your School&apos;s Departments ({filteredSchoolDepts.length})
        </span>
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 max-h-36 overflow-y-auto custom-scrollbar">
          {filteredSchoolDepts.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-3">
              No school departments found. Click any suggestion below or add a custom department.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredSchoolDepts.map((dept) => (
                <div
                  key={dept.departmentId || dept.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {dept.name}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase truncate">
                      {dept.code}
                    </p>
                  </div>
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create New Custom Department */}
      <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Add a Custom Department
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
            placeholder="Department Name (e.g. Vocational & Technical)"
            className="sm:col-span-5 rounded-xl bg-white dark:bg-slate-900 h-9 text-xs"
          />
          <Input
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            placeholder="Code (e.g. VOC)"
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
            disabled={!customName.trim() || isCreatingCustom || !!addingDepartmentCode}
            className="sm:col-span-2 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold flex items-center justify-center gap-1"
          >
            {isCreatingCustom ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Add
          </Button>
        </div>
      </div>

      {/* Suggested Nigerian Departments */}
      <div className="space-y-2.5 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles size={14} /> Suggested Nigerian Academic Departments ({filteredSuggestions.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Auto-creates &amp; links core subjects
            </span>
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-center text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              All standard Nigerian departments have been added to your school!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
              {filteredSuggestions.map((sug) => {
                const isAdding = addingDepartmentCode === sug.code;
                return (
                  <button
                    key={sug.code}
                    type="button"
                    disabled={!!addingDepartmentCode || isCreatingCustom}
                    onClick={() => onAddSuggestedDepartment(sug)}
                    className={cn(
                      'group flex items-center justify-between p-2.5 rounded-xl text-left bg-indigo-50/50 hover:bg-indigo-100/70 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800/60 transition-all',
                      addingDepartmentCode && !isAdding && 'opacity-50 cursor-not-allowed',
                      isAdding && 'ring-2 ring-indigo-500/40 bg-indigo-100/80 dark:bg-indigo-900/60 cursor-wait'
                    )}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {sug.name}
                      </p>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate">
                        {isAdding
                          ? 'Adding department & linking subjects...'
                          : `${sug.recommendedSubjectCodes.length} Core Subjects • ${sug.description}`}
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

