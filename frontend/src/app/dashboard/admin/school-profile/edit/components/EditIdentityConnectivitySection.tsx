'use client';

import React from 'react';
import { Camera, Globe, MapPin, type LucideIcon } from 'lucide-react';
import FormInput from './FormInput';
import ImageUpload from './ImageUpload';

export interface EditableSchoolFormState {
  id: string;
  name: string;
  motto: string;
  description: string;
  logo: string;
  bannerImage: string;
  favicon: string;
  schoolEmail: string;
  phone: string;
  website: string;
  address: string;
  foundedYear: number;
  principal: string;
  schoolType: string;
  socialLinks: Record<string, string>;
  operatingHours: string;
  mapLocation: string;
  levels: string[];
  gradingSystem: Array<{ grade: string; min: number; max: number }>;
}

export function EditSectionHeader({
  title,
  desc,
  icon: Icon,
  small,
}: {
  title: string;
  desc: string;
  icon: LucideIcon;
  small?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 ${small ? 'mb-4' : 'mb-6'}`}>
      <div
        className={`${small ? 'h-10 w-10 p-2' : 'h-12 w-12 p-3'} rounded-2xl bg-slate-50 dark:bg-slate-800 text-primary flex items-center justify-center shrink-0`}
      >
        <Icon size={small ? 18 : 24} />
      </div>
      <div>
        <h2
          className={`${small ? 'text-base font-semibold' : 'text-lg font-bold'} text-slate-900 dark:text-white tracking-tight`}
        >
          {title}
        </h2>
        <p className={`${small ? 'text-xs' : 'text-sm'} text-slate-500 font-medium`}>
          {desc}
        </p>
      </div>
    </div>
  );
}

interface EditIdentityConnectivitySectionProps {
  schoolData: EditableSchoolFormState;
  schoolId: string;
  onChange: (field: string, value: unknown) => void;
}

export default function EditIdentityConnectivitySection({
  schoolData,
  schoolId,
  onChange,
}: EditIdentityConnectivitySectionProps) {
  return (
    <>
      {/* Visual Identity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8">
        <EditSectionHeader
          title="Visual Identity"
          desc="Define how your school looks across the platform."
          icon={Camera}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageUpload
            label="Institution Logo"
            description="Professional emblem (Square, min 500x500px)"
            value={schoolData.logo}
            onChange={(url) => onChange('logo', url)}
            schoolId={schoolId}
          />
          <ImageUpload
            label="Browser Favicon"
            aspectRatio="favicon"
            description="Small tab icon (ICO/PNG, 32x32px)"
            value={schoolData.favicon}
            onChange={(url) => onChange('favicon', url)}
            schoolId={schoolId}
          />
        </div>

        <ImageUpload
          label="Campus Banner"
          aspectRatio="video"
          description="Hero background for your public portal (Wide, 1920x1080px recommended)"
          value={schoolData.bannerImage}
          onChange={(url) => onChange('bannerImage', url)}
          schoolId={schoolId}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Official School Name"
            placeholder="Enter school name"
            value={schoolData.name}
            onChange={(val) => onChange('name', val)}
            type="text"
            required
          />
          <FormInput
            label="Institutional Motto"
            placeholder="e.g. Knowledge is Power"
            value={schoolData.motto}
            onChange={(val) => onChange('motto', val)}
            type="text"
          />
        </div>

        <FormInput
          label="Institutional Narrative (About)"
          placeholder="Describe your school's history and mission..."
          value={schoolData.description}
          onChange={(val) => onChange('description', val)}
          type="textarea"
          rows={4}
        />
      </div>

      {/* Connectivity Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8">
        <EditSectionHeader
          title="Connectivity & Reach"
          desc="Official contact channels and physical presence."
          icon={Globe}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Official Academic Email"
            placeholder="admin@school.com"
            value={schoolData.schoolEmail}
            onChange={(val) => onChange('schoolEmail', val)}
            type="email"
            required
          />
          <FormInput
            label="Institutional Phone"
            placeholder="+234..."
            value={schoolData.phone}
            onChange={(val) => onChange('phone', val)}
            type="tel"
          />
          <FormInput
            label="Official Website"
            placeholder="https://myschool.com"
            value={schoolData.website}
            onChange={(val) => onChange('website', val)}
            type="url"
            className="md:col-span-2"
          />
        </div>

        <FormInput
          label="Campus Address"
          placeholder="Street, City, State, Country"
          value={schoolData.address}
          onChange={(val) => onChange('address', val)}
          type="textarea"
          rows={2}
        />

        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <EditSectionHeader
            title="Operational Data"
            desc="Business hours and location precision."
            icon={MapPin}
            small
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Operating Hours"
              placeholder="e.g. Mon-Fri: 8AM - 4PM"
              value={schoolData.operatingHours}
              onChange={(val) => onChange('operatingHours', val)}
              type="text"
            />
            <FormInput
              label="Map Embed URL"
              placeholder="Google Maps Share Embed URL"
              value={schoolData.mapLocation}
              onChange={(val) => onChange('mapLocation', val)}
              type="url"
            />
          </div>
        </div>
      </div>
    </>
  );
}

