/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FormInput from './components/FormInput';
import LogoUpload from './components/LogoUpload';
import PreviewPanel from './components/PreviewPanel';
import FormActionBar from './components/FormActionBar';
import InfoCardV2 from './components/InfoCardV2';
import { SchoolEditData } from './components/types';

// Mock initial data
const initialSchoolData: SchoolEditData = {
  id: 'lexend-academy',
  name: 'Lexend Academy',
  motto: 'Excellence in Education',
  description: 'A premier educational institution focused on academic excellence and holistic development.',
  logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuFCtQv1RIMVILQeroeO3KxMHIYhNX8A4cwRigbaqp3W6Z1_-xrPdXNAWlhui9pO3K98YeEh_aivQk2v_diYPtFH-vq1sXnvT4o4aDpyUUJfEA0hCvT4XH47lhP42H6whmK6qVBzQ2eqAJ0DkYzXQUqhqfx6UwwKYPfnHVifxfz9S-8QLIB7i09r9Z8sz-sKUU_Ms3jgpsRabpTQJQltHdoZZ9rfqS42GSBy5f-pwChDgkB2DH6N17tsWme2gHDaE16xOuzWEPjLM',
  contact: {
    email: 'contact@lexendacademy.com',
    phone: '+1 (555) 123-4567',
    website: 'https://lexendacademy.com',
    address: '123 Education Lane, Knowledge City, USA 12345'
  },
  academic: {
    currentSession: '2024-2025',
    currentTerm: 'First Term',
    sessions: ['2024-2025', '2023-2024', '2022-2023'],
    terms: ['First Term', 'Second Term', 'Third Term', 'Final Term']
  },
  branding: {
    primaryColor: '#3670e2',
    secondaryColor: '#10b981',
    logoPreview: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZn7ZI1t9CKce6xWO6tro7dPftfzOY69ol-_s5BeV3eMXoWWdcHZjR_dRNlc0m2FBrfh31TGJAsNu2FDIjNGRBCjL_DLFZhwR6fAXAr4t0gm2Kt_Eq8y76GYHumdSsZGfMV97iZue59jJM881ZGCQxTITrJ2mIRSVs5rnoSAbagIrkWl0PFrS-hbGXfxoerYEXGjY9gy1YrzR9E2nBKfNGkM2kHawkQE50SJTQFJKgimxEsRC2rZnT2s7a3yoJlxeQWss_faj1mow'
  },
  metadata: {
    lastUpdated: '2024-01-15',
    updatedBy: 'Admin Name'
  }
};

export default function EditSchoolProfilePageV2() {
  const router = useRouter();
  const [schoolData, setSchoolData] = useState<SchoolEditData>(initialSchoolData);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState<SchoolEditData>(initialSchoolData);

  useEffect(() => {
    // Check if data has changed
    const hasDataChanged = JSON.stringify(schoolData) !== JSON.stringify(originalData);
    setHasChanges(hasDataChanged);
  }, [schoolData, originalData]);

  const handleChange = (field: keyof SchoolEditData | string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSchoolData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setSchoolData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleLogoChange = (file: File) => {
    // In a real app, you would upload the file and get a URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSchoolData(prev => ({
          ...prev,
          logo: e.target!.result as string,
          branding: {
            ...prev.branding,
            logoPreview: e.target!.result as string
          }
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      console.log('Saving school data:', schoolData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update original data to mark as saved
      setOriginalData(schoolData);
      setHasChanges(false);
      
      // Show success message
      alert('School profile updated successfully!');
      
      // In a real app, you might redirect or show a success notification
    } catch (error) {
      console.error('Failed to save school profile:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      setSchoolData(originalData);
    }
  };

  const formFields = {
    basic: [
      {
        id: 'name' as const,
        label: 'School Name',
        type: 'text' as const,
        placeholder: 'e.g., Northwood High School',
        required: true
      },
      {
        id: 'motto' as const,
        label: 'Motto',
        type: 'text' as const,
        placeholder: 'e.g., Knowledge is Power',
        required: true
      }
    ],
    academic: [
      {
        id: 'academic.currentSession' as const,
        label: 'Current Session',
        type: 'select' as const,
        placeholder: 'Select session',
        required: true,
        options: schoolData.academic.sessions
      },
      {
        id: 'academic.currentTerm' as const,
        label: 'Current Term/Semester',
        type: 'select' as const,
        placeholder: 'Select term',
        required: true,
        options: schoolData.academic.terms
      }
    ],
    contact: [
      {
        id: 'contact.email' as const,
        label: 'Official Email',
        type: 'email' as const,
        placeholder: 'contact@school.com',
        required: true
      },
      {
        id: 'contact.phone' as const,
        label: 'Contact Phone',
        type: 'tel' as const,
        placeholder: '+1 (555) 123-4567',
        required: true
      },
      {
        id: 'contact.website' as const,
        label: 'Website URL',
        type: 'url' as const,
        placeholder: 'https://www.yourschool.com',
        required: true
      }
    ]
  };

  return (
    <div className="relative flex min-h-screen w-full">
      
      <main className="flex-1 w-full overflow-y-auto">
        <div className="p-6 mx-auto max-w-7xl lg:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Form */}
            <div className="space-y-8 lg:col-span-2">
              {/* Page Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h1 className="text-3xl font-bold tracking-tight text-text-light-primary dark:text-text-dark-primary">
                    Edit School Profile
                  </h1>
                  <p className="text-text-light-secondary dark:text-text-dark-secondary">
                    Manage your school&apos;s core information and branding.
                  </p>
                </div>
              </div>

              {/* Card 1: Basic Info */}
              <InfoCardV2 title="Basic Information">
                <LogoUpload
                  currentLogo={schoolData.logo}
                  onLogoChange={handleLogoChange}
                  alt="Current school logo"
                />

                {formFields.basic.map((field) => (
                  <FormInput
                    key={field.id}
                    label={field.label}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={schoolData[field.id as keyof SchoolEditData] as string}
                    onChange={(value) => handleChange(field.id, value)}
                    required={field.required}
                  />
                ))}

                <FormInput
                  label="School Description"
                  type="textarea"
                  placeholder="A brief description of the school."
                  value={schoolData.description}
                  onChange={(value) => handleChange('description', value)}
                  rows={4}
                />
              </InfoCardV2>

              {/* Card 2: Academic Settings */}
              <InfoCardV2 title="Academic Settings">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {formFields.academic.map((field) => (
                    <FormInput
                      key={field.id}
                      label={field.label}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={field.id.includes('.') ? 
                        (schoolData as any)[field.id.split('.')[0]][field.id.split('.')[1]] :
                        schoolData[field.id as keyof SchoolEditData] as string
                      }
                      onChange={(value) => handleChange(field.id, value)}
                      required={field.required}
                      options={field.options}
                    />
                  ))}
                </div>
              </InfoCardV2>

              {/* Card 3: Contact & Location */}
              <InfoCardV2 title="Contact & Location">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {formFields.contact.map((field) => (
                    <FormInput
                      key={field.id}
                      label={field.label}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={field.id.includes('.') ? 
                        (schoolData as any)[field.id.split('.')[0]][field.id.split('.')[1]] :
                        schoolData[field.id as keyof SchoolEditData] as string
                      }
                      onChange={(value) => handleChange(field.id, value)}
                      required={field.required}
                      className={field.label === 'Website URL' ? 'sm:col-span-2' : ''}
                    />
                  ))}

                  <FormInput
                    label="Full Address"
                    type="textarea"
                    placeholder="123 Education Lane, Knowledge City, USA 12345"
                    value={schoolData.contact.address}
                    onChange={(value) => handleChange('contact.address', value)}
                    rows={3}
                    className="sm:col-span-2"
                  />
                </div>
              </InfoCardV2>
            </div>

            {/* Right Column: Preview Panel */}
            <div className="lg:col-span-1">
              <PreviewPanel schoolData={schoolData} />
            </div>
          </div>

          {/* Form Action Bar */}
          <FormActionBar
            onSave={handleSave}
            onReset={handleReset}
            isSaving={isSaving}
            hasChanges={hasChanges}
          />
        </div>
      </main>
    </div>
  );
}