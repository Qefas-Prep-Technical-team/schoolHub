/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolProfile, useUpdateSchoolProfile } from '@/lib/api/hooks/useSchool';
import FormInput from './components/FormInput';
import LogoUpload from './components/LogoUpload';
import PreviewPanel from './components/PreviewPanel';
import FormActionBar from './components/FormActionBar';
import InfoCardV2 from './components/InfoCardV2';
import { toast } from 'react-toastify';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditSchoolProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.defaultTenantId || '';
  
  const { data: school, isLoading } = useSchoolProfile(schoolId);
  const updateMutation = useUpdateSchoolProfile();

  const [schoolData, setSchoolData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (school) {
      setSchoolData({
        name: school.name || '',
        motto: school.motto || '',
        description: school.description || '',
        logo: school.logo || '',
        schoolEmail: school.schoolEmail || '',
        phone: school.phone || '',
        website: school.website || '',
        address: school.address || '',
        foundedYear: school.foundedYear || 2024,
        principal: school.principal || '',
        schoolType: school.schoolType || 'Private'
      });
    }
  }, [school]);

  const handleChange = (field: string, value: any) => {
    setSchoolData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleLogoChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleChange('logo', e.target!.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    try {
      await updateMutation.mutateAsync({
        schoolId,
        data: schoolData
      });
      toast.success('School profile updated successfully!');
      setHasChanges(false);
      router.push('/dashboard/admin/school-profile');
    } catch (error) {
      console.error('Failed to save school profile:', error);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      if (school) {
        setSchoolData({
            name: school.name || '',
            motto: school.motto || '',
            description: school.description || '',
            logo: school.logo || '',
            schoolEmail: school.schoolEmail || '',
            phone: school.phone || '',
            website: school.website || '',
            address: school.address || '',
            foundedYear: school.foundedYear || 2024,
            principal: school.principal || '',
            schoolType: school.schoolType || 'Private'
        });
        setHasChanges(false);
      }
    }
  };

  if (isLoading || !schoolData) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full bg-slate-50 dark:bg-slate-950">
      <main className="flex-1 w-full overflow-y-auto">
        <div className="p-6 mx-auto max-w-7xl lg:p-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Left Column: Form */}
            <div className="space-y-10 lg:col-span-2">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  Edit Profile
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  Refine your institution&apos;s public identity and metadata.
                </p>
              </div>

              {/* Card 1: Basic Identity */}
              <InfoCardV2 title="Institutional Identity">
                <LogoUpload
                  currentLogo={schoolData.logo}
                  onLogoChange={handleLogoChange}
                  alt="School logo"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormInput
                        label="School Name"
                        type="text"
                        value={schoolData.name}
                        onChange={(val) => handleChange('name', val)}
                        required
                        placeholder=""
                    />
                    <FormInput
                        label="Institutional Motto"
                        type="text"
                        value={schoolData.motto}
                        onChange={(val) => handleChange('motto', val)}
                        placeholder=""
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormInput
                        label="Principal Name"
                        type="text"
                        value={schoolData.principal}
                        onChange={(val) => handleChange('principal', val)}
                        placeholder=""
                    />
                    <FormInput
                        label="School Type"
                        type="select"
                        value={schoolData.schoolType}
                        onChange={(val) => handleChange('schoolType', val)}
                        options={['Private', 'Public', 'Charter', 'International']}
                        placeholder=""
                    />
                </div>

                <FormInput
                  label="Mission Statement / Description"
                  type="textarea"
                  value={schoolData.description}
                  onChange={(val) => handleChange('description', val)}
                  rows={4}
                  placeholder=""
                />
              </InfoCardV2>

              {/* Card 2: Contact & Presence */}
              <InfoCardV2 title="Connectivity & Location">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormInput
                        label="Official Email"
                        type="email"
                        value={schoolData.schoolEmail}
                        onChange={(val) => handleChange('schoolEmail', val)}
                        required
                        placeholder=""
                    />
                    <FormInput
                        label="Contact Phone"
                        type="tel"
                        value={schoolData.phone}
                        onChange={(val) => handleChange('phone', val)}
                        placeholder=""
                    />
                    <FormInput
                        label="Website URL"
                        type="url"
                        value={schoolData.website}
                        onChange={(val) => handleChange('website', val)}
                        className="sm:col-span-2"
                        placeholder=""
                    />
                    <FormInput
                        label="Physical Address"
                        type="textarea"
                        value={schoolData.address}
                        onChange={(val) => handleChange('address', val)}
                        rows={3}
                        className="sm:col-span-2"
                        placeholder=""
                    />
                </div>
              </InfoCardV2>
            </div>

            {/* Right Column: Preview Panel */}
            <div className="lg:col-span-1">
              <PreviewPanel schoolData={schoolData} />
            </div>
          </div>

          <FormActionBar
            onSave={handleSave}
            onReset={handleReset}
            isSaving={updateMutation.isPending}
            hasChanges={hasChanges}
          />
        </div>
      </main>
    </div>
  );
}