'use client';

import React from 'react';
import {
  Share2,
  GraduationCap,
  X,
  Plus,
  Percent,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { DEFAULT_GRADING_SYSTEM } from '@/utils/gradingSystem';
import FormInput from './FormInput';
import {
  EditableSchoolFormState,
  EditSectionHeader,
} from './EditIdentityConnectivitySection';

interface EditGovernanceAcademicSectionProps {
  schoolData: EditableSchoolFormState;
  onChange: (field: string, value: unknown) => void;
}

export default function EditGovernanceAcademicSection({
  schoolData,
  onChange,
}: EditGovernanceAcademicSectionProps) {
  const addLevelFromInput = (input: HTMLInputElement | null) => {
    if (!input) return;
    const val = input.value.trim();
    if (val && !schoolData.levels.includes(val)) {
      onChange('levels', [...schoolData.levels, val]);
      input.value = '';
    }
  };

  return (
    <>
      {/* Governance Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8">
        <EditSectionHeader
          title="Governance & Social"
          desc="Leadership details and social media presence."
          icon={Share2}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            label="Principal Name"
            placeholder="Dr. John Doe"
            value={schoolData.principal}
            onChange={(val) => onChange('principal', val)}
            type="text"
          />
          <FormInput
            label="Founded Year"
            placeholder="1995"
            value={String(schoolData.foundedYear)}
            onChange={(val) => onChange('foundedYear', parseInt(String(val), 10) || 2024)}
            type="text"
          />
          <FormInput
            label="Institution Category"
            placeholder="e.g. Private"
            value={schoolData.schoolType}
            onChange={(val) => onChange('schoolType', val)}
            type="select"
            options={['Private', 'Public', 'Mission', 'International', 'Charter']}
          />
        </div>

        <div className="space-y-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
          <EditSectionHeader
            title="Social Footprint"
            desc="Connect your official social media channels."
            icon={Share2}
            small
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => (
              <FormInput
                key={platform}
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                placeholder={`Official ${platform} URL`}
                value={schoolData.socialLinks[platform] || ''}
                onChange={(val) => onChange(`socialLinks.${platform}`, val)}
                type="url"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Academic Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8">
        <EditSectionHeader
          title="Academic Configuration"
          desc="Manage custom levels for your institution's classes."
          icon={GraduationCap}
        />

        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Custom Levels</label>
            <p className="text-xs text-slate-500 font-medium">
              Add the levels (e.g. Grade 1, Year 7, JSS 1) that are applicable in your school.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {schoolData.levels.map((lvl: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{lvl}</span>
                <button
                  type="button"
                  onClick={() => onChange('levels', schoolData.levels.filter((_, i: number) => i !== idx))}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <input
              id="new-level-input"
              type="text"
              placeholder="e.g. Primary 1"
              className="flex-1 w-full max-w-sm h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLevelFromInput(e.target as HTMLInputElement);
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addLevelFromInput(document.getElementById('new-level-input') as HTMLInputElement | null);
              }}
              className="h-11 px-6 w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Level
            </button>
          </div>
        </div>
      </div>

      {/* Grading System Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8">
        <EditSectionHeader
          title="Grading System Configuration"
          desc="Set up custom score ranges and their corresponding letter grades."
          icon={Percent}
        />

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Grade Boundaries</label>
              <p className="text-xs text-slate-500 font-medium">
                Define the minimum and maximum score for each grade (e.g. A = 70 to 89).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const formatted = DEFAULT_GRADING_SYSTEM.map((g) => ({ grade: g.grade, min: g.min, max: g.max }));
                onChange('gradingSystem', formatted);
                toast.info('Loaded standardized 9-grade boundaries (A+ to F9).');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Sparkles size={13} />
              Load Standardized 9 Grades
            </button>
          </div>

          <div className="space-y-3">
            {(!schoolData.gradingSystem || schoolData.gradingSystem.length === 0) && (
              <div className="text-sm text-slate-500 italic px-2 py-6 bg-slate-50 dark:bg-slate-800 rounded-xl text-center border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                <p>No custom grading boundaries defined yet.</p>
                <p className="text-xs text-slate-400 font-medium">
                  The system is currently using the standardized 9-grade academic matrix (A+ to F9) by default.
                </p>
              </div>
            )}
            {(schoolData.gradingSystem || []).map((gradeRow: { grade: string; min: number; max: number }, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <input
                  type="text"
                  placeholder="Grade (e.g. A)"
                  value={gradeRow.grade}
                  onChange={(e) => {
                    const newSys = [...schoolData.gradingSystem];
                    newSys[idx] = { ...newSys[idx], grade: e.target.value.toUpperCase() };
                    onChange('gradingSystem', newSys);
                  }}
                  className="w-24 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold text-center focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <span className="text-sm font-medium text-slate-400">Min:</span>
                <input
                  type="number"
                  placeholder="0"
                  value={gradeRow.min}
                  onChange={(e) => {
                    const newSys = [...schoolData.gradingSystem];
                    newSys[idx] = { ...newSys[idx], min: parseInt(e.target.value, 10) || 0 };
                    onChange('gradingSystem', newSys);
                  }}
                  className="w-20 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-center focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <span className="text-sm font-medium text-slate-400">Max:</span>
                <input
                  type="number"
                  placeholder="100"
                  value={gradeRow.max}
                  onChange={(e) => {
                    const newSys = [...schoolData.gradingSystem];
                    newSys[idx] = { ...newSys[idx], max: parseInt(e.target.value, 10) || 0 };
                    onChange('gradingSystem', newSys);
                  }}
                  className="w-20 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-center focus:ring-2 focus:ring-primary/20 outline-none"
                />
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => onChange('gradingSystem', schoolData.gradingSystem.filter((_, i: number) => i !== idx))}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onChange('gradingSystem', [...(schoolData.gradingSystem || []), { grade: '', min: 0, max: 0 }]);
            }}
            className="h-11 px-6 w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Plus size={16} /> Add Grade Range
          </button>
        </div>
      </div>
    </>
  );
}
