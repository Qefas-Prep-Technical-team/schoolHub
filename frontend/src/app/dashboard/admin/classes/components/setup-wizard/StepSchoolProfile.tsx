'use client';

import React, { useState } from 'react';
import {
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ImageUpload from '@/app/dashboard/admin/school-profile/edit/components/ImageUpload';
import { DEFAULT_GRADING_SYSTEM } from '@/utils/gradingSystem';

export interface SetupProfileFormData {
  name: string;
  motto: string;
  principal: string;
  schoolType: string;
  schoolEmail: string;
  phone: string;
  website: string;
  address: string;
  logo: string;
  gradingSystem: Array<{ grade: string; min: number; max: number }>;
}

interface StepSchoolProfileProps {
  schoolId: string;
  formData: SetupProfileFormData;
  onChange: (field: keyof SetupProfileFormData, value: unknown) => void;
  onSaveProfile: () => Promise<void>;
  isSaving: boolean;
}

export const StepSchoolProfile: React.FC<StepSchoolProfileProps> = ({
  schoolId,
  formData,
  onChange,
  onSaveProfile,
  isSaving,
}) => {
  const [savedOnce, setSavedOnce] = useState(false);

  const handleQuickSave = async () => {
    await onSaveProfile();
    setSavedOnce(true);
  };

  const hasStandardGrading =
    Array.isArray(formData.gradingSystem) && formData.gradingSystem.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 size={16} className="text-indigo-600 dark:text-indigo-400" />
            Step 1: Core Institutional Identity
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure your school&apos;s essential profile details, leadership, and grading curve.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleQuickSave}
          disabled={isSaving || !formData.name.trim()}
          className="h-9 px-4 w-full sm:w-auto rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0"
        >
          {isSaving ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving Profile...
            </>
          ) : savedOnce ? (
            <>
              <CheckCircle2 size={14} /> Saved Profile
            </>
          ) : (
            'Save Profile Details'
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <ImageUpload
            label="School Crest / Logo"
            description="Official emblem for reports & portal"
            value={formData.logo}
            onChange={(url) => onChange('logo', url)}
            schoolId={schoolId}
          />
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Official School Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="e.g. Royal Crown Academy"
              className="rounded-xl bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              School Motto
            </Label>
            <Input
              value={formData.motto}
              onChange={(e) => onChange('motto', e.target.value)}
              placeholder="e.g. Excellence & Integrity"
              className="rounded-xl bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UserCheck size={13} className="text-indigo-500" /> Principal / Head of School
            </Label>
            <Input
              value={formData.principal}
              onChange={(e) => onChange('principal', e.target.value)}
              placeholder="e.g. Dr. Adewale Martins"
              className="rounded-xl bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Institution Category
            </Label>
            <Select
              value={formData.schoolType || 'Private'}
              onValueChange={(val) => onChange('schoolType', val)}
            >
              <SelectTrigger className="rounded-xl bg-white dark:bg-slate-900 h-10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white dark:bg-slate-900">
                {['Private', 'Public', 'Mission', 'International', 'Charter'].map((cat) => (
                  <SelectItem key={cat} value={cat} className="rounded-lg">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail size={13} className="text-blue-500" /> Official Email
            </Label>
            <Input
              type="email"
              value={formData.schoolEmail}
              onChange={(e) => onChange('schoolEmail', e.target.value)}
              placeholder="info@school.edu.ng"
              className="rounded-xl bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone size={13} className="text-emerald-500" /> Official Phone
            </Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="+234 800 000 0000"
              className="rounded-xl bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe size={13} className="text-purple-500" /> Website (Optional)
            </Label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => onChange('website', e.target.value)}
              placeholder="https://www.myschool.com"
              className="rounded-xl bg-white dark:bg-slate-900"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin size={13} className="text-rose-500" /> Campus Address
            </Label>
            <Textarea
              rows={2}
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              placeholder="Street address, City, State"
              className="rounded-xl bg-white dark:bg-slate-900 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Quick Grading Curve Setup */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Standardized 9-Grade WAEC/NERDC Grading Matrix
            </span>
            {hasStandardGrading && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                Active ({formData.gradingSystem.length} Tiers)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {hasStandardGrading
              ? formData.gradingSystem.map((g) => `${g.grade}: ${g.min}-${g.max}%`).join(' • ')
              : 'Load the standard Nigerian 9-grade scale (A1 to F9) with one click.'}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const formatted = DEFAULT_GRADING_SYSTEM.map((g) => ({
              grade: g.grade,
              min: g.min,
              max: g.max,
            }));
            onChange('gradingSystem', formatted);
          }}
          className="h-9 px-3.5 w-full sm:w-auto rounded-xl text-xs font-semibold border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 shrink-0 flex items-center justify-center gap-1.5"
        >
          <Sparkles size={13} />
          {hasStandardGrading ? 'Reset to Standard 9-Grade Scale' : 'Apply Standard 9-Grade Scale'}
        </Button>
      </div>
    </div>
  );
};

