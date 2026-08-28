'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolProfile, useUpdateSchoolProfile } from '@/lib/api/hooks/useSchool';
import FormInput from './components/FormInput';
import ImageUpload from './components/ImageUpload';
import PreviewPanel from './components/PreviewPanel';
import FormActionBar from './components/FormActionBar';
import { toast } from 'react-toastify';
import { 
  Building2, 
  Globe, 
  Share2, 
  CheckCircle2, 
  Camera,
  MapPin,
  GraduationCap,
  X,
  Plus,
  Info,
  ChevronLeft
} from 'lucide-react';

export default function EditSchoolProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  
  const { data: school, isLoading } = useSchoolProfile(schoolId);
  const updateMutation = useUpdateSchoolProfile();

  const [schoolData, setSchoolData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (school) {
      setSchoolData({
        id: school.id,
        name: school.name || '',
        motto: school.motto || '',
        description: school.description || '',
        logo: school.logo || '',
        bannerImage: school.bannerImage || '',
        favicon: school.favicon || '',
        schoolEmail: school.schoolEmail || '',
        phone: school.phone || '',
        website: school.website || '',
        address: school.address || '',
        foundedYear: school.foundedYear || new Date().getFullYear(),
        principal: school.principal || '',
        schoolType: school.schoolType || 'Private',
        socialLinks: typeof school.socialLinks === 'string' 
          ? JSON.parse(school.socialLinks) 
          : (school.socialLinks || { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' }),
        operatingHours: school.operatingHours || 'Mon - Fri: 8:00 AM - 4:00 PM',
        mapLocation: school.mapLocation || '',
        levels: school.levels || []
      });
    }
  }, [school]);

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSchoolData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSchoolData((prev: any) => ({
        ...prev,
        [field]: value
      }));
    }
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        schoolId,
        data: schoolData
      });
      toast.success('Institutional profile updated successfully');
      setHasChanges(false);
      router.push('/dashboard/admin/school-profile');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save changes');
    }
  };

  if (isLoading || !schoolData) {
    return (
      <div className="p-8 space-y-6 animate-pulse bg-transparent">
        <div className="h-10 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <div className="h-96 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl" />
              <div className="h-96 w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl" />
           </div>
           <div className="h-[500px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8 pb-24">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Minimal Header */}
        <header className="flex flex-col gap-2">
            <button 
                onClick={() => router.push('/dashboard/admin/school-profile')}
                className="w-fit flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
            >
                <ChevronLeft size={16} /> Back to Profile
            </button>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
                <CheckCircle2 size={14} /> School Configuration
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Edit Profile
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-md">
                Manage your school's digital identity and public-facing metadata.
            </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Editing Area (Stacked Cards) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Visual Identity Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8">
                <SectionHeader title="Visual Identity" desc="Define how your school looks across the platform." icon={Camera} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ImageUpload 
                    label="Institution Logo" 
                    description="Professional emblem (Square, min 500x500px)"
                    value={schoolData.logo} 
                    onChange={(url) => handleChange('logo', url)} 
                    schoolId={schoolId}
                    />
                    <ImageUpload 
                    label="Browser Favicon" 
                    aspectRatio="favicon"
                    description="Small tab icon (ICO/PNG, 32x32px)"
                    value={schoolData.favicon} 
                    onChange={(url) => handleChange('favicon', url)} 
                    schoolId={schoolId}
                    />
                </div>

                <ImageUpload 
                    label="Campus Banner" 
                    aspectRatio="video"
                    description="Hero background for your public portal (Wide, 1920x1080px recommended)"
                    value={schoolData.bannerImage} 
                    onChange={(url) => handleChange('bannerImage', url)} 
                    schoolId={schoolId}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput 
                    label="Official School Name" 
                    placeholder="Enter school name" 
                    value={schoolData.name} 
                    onChange={(val) => handleChange('name', val)}
                    type="text"
                    required
                    />
                    <FormInput 
                    label="Institutional Motto" 
                    placeholder="e.g. Knowledge is Power" 
                    value={schoolData.motto} 
                    onChange={(val) => handleChange('motto', val)}
                    type="text"
                    />
                </div>

                <FormInput 
                    label="Institutional Narrative (About)" 
                    placeholder="Describe your school's history and mission..." 
                    value={schoolData.description} 
                    onChange={(val) => handleChange('description', val)}
                    type="textarea"
                    rows={4}
                />
            </div>

            {/* Connectivity Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8">
                <SectionHeader title="Connectivity & Reach" desc="Official contact channels and physical presence." icon={Globe} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput 
                    label="Official Academic Email" 
                    placeholder="admin@school.com" 
                    value={schoolData.schoolEmail} 
                    onChange={(val) => handleChange('schoolEmail', val)}
                    type="email"
                    required
                    />
                    <FormInput 
                    label="Institutional Phone" 
                    placeholder="+234..." 
                    value={schoolData.phone} 
                    onChange={(val) => handleChange('phone', val)}
                    type="tel"
                    />
                    <FormInput 
                    label="Official Website" 
                    placeholder="https://myschool.com" 
                    value={schoolData.website} 
                    onChange={(val) => handleChange('website', val)}
                    type="url"
                    className="md:col-span-2"
                    />
                </div>

                <FormInput 
                    label="Campus Address" 
                    placeholder="Street, City, State, Country" 
                    value={schoolData.address} 
                    onChange={(val) => handleChange('address', val)}
                    type="textarea"
                    rows={2}
                />

                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <SectionHeader title="Operational Data" desc="Business hours and location precision." icon={MapPin} small />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput 
                        label="Operating Hours" 
                        placeholder="e.g. Mon-Fri: 8AM - 4PM" 
                        value={schoolData.operatingHours} 
                        onChange={(val) => handleChange('operatingHours', val)}
                        type="text"
                    />
                    <FormInput 
                        label="Map Embed URL" 
                        placeholder="Google Maps Share Embed URL" 
                        value={schoolData.mapLocation} 
                        onChange={(val) => handleChange('mapLocation', val)}
                        type="url"
                    />
                    </div>
                </div>
            </div>

            {/* Governance Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8">
                <SectionHeader title="Governance & Social" desc="Leadership details and social media presence." icon={Share2} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormInput 
                    label="Principal Name" 
                    placeholder="Dr. John Doe" 
                    value={schoolData.principal} 
                    onChange={(val) => handleChange('principal', val)}
                    type="text"
                    />
                    <FormInput 
                    label="Founded Year" 
                    placeholder="1995" 
                    value={String(schoolData.foundedYear)} 
                    onChange={(val) => handleChange('foundedYear', parseInt(val) || 2024)}
                    type="text"
                    />
                    <FormInput 
                    label="Institution Category" 
                    placeholder="e.g. Private" 
                    value={schoolData.schoolType} 
                    onChange={(val) => handleChange('schoolType', val)}
                    type="select"
                    options={['Private', 'Public', 'Mission', 'International', 'Charter']}
                    />
                </div>

                <div className="space-y-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <SectionHeader title="Social Footprint" desc="Connect your official social media channels." icon={Share2} small />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => (
                        <FormInput 
                        key={platform}
                        label={platform.charAt(0).toUpperCase() + platform.slice(1)} 
                        placeholder={`Official ${platform} URL`} 
                        value={schoolData.socialLinks[platform] || ''} 
                        onChange={(val) => handleChange(`socialLinks.${platform}`, val)}
                        type="url"
                        />
                        ))}
                    </div>
                </div>
            </div>

            {/* Academic Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-8">
                <SectionHeader title="Academic Configuration" desc="Manage custom levels for your institution's classes." icon={GraduationCap} />
                
                <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Custom Levels</label>
                    <p className="text-xs text-slate-500 font-medium">Add the levels (e.g. Grade 1, Year 7, JSS 1) that are applicable in your school.</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                    {schoolData.levels.map((lvl: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{lvl}</span>
                        <button
                            onClick={() => {
                            const newLevels = schoolData.levels.filter((_: any, i: number) => i !== idx);
                            handleChange('levels', newLevels);
                            }}
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
                            const input = e.target as HTMLInputElement;
                            const val = input.value.trim();
                            if (val && !schoolData.levels.includes(val)) {
                            handleChange('levels', [...schoolData.levels, val]);
                            input.value = '';
                            }
                        }
                        }}
                    />
                    <button
                        onClick={(e) => {
                        e.preventDefault();
                        const input = document.getElementById('new-level-input') as HTMLInputElement;
                        const val = input.value.trim();
                        if (val && !schoolData.levels.includes(val)) {
                            handleChange('levels', [...schoolData.levels, val]);
                            input.value = '';
                        }
                        }}
                        className="h-11 px-6 w-full sm:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus size={16} /> Add Level
                    </button>
                    </div>
                </div>
            </div>

          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                <Info size={120} />
              </div>
              <h3 className="text-base font-semibold mb-2 relative z-10 flex items-center gap-2 text-slate-800 dark:text-white">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Live Synchronization
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed relative z-10 font-medium">
                Witness real-time updates as you refine your institution's identity. Changes are only permanent once published.
              </p>
            </div>
            
            <PreviewPanel schoolData={schoolData} />
          </div>
        </div>

        <FormActionBar
          onSave={handleSave}
          onReset={() => router.push('/dashboard/admin/school-profile')}
          isSaving={updateMutation.isPending}
          hasChanges={hasChanges}
          variant="floating"
        />
      </div>
    </div>
  );
}

function SectionHeader({ title, desc, icon: Icon, small }: { title: string, desc: string, icon: any, small?: boolean }) {
  return (
    <div className={`flex items-center gap-4 ${small ? 'mb-4' : 'mb-6'}`}>
      <div className={`${small ? 'h-10 w-10 p-2' : 'h-12 w-12 p-3'} rounded-2xl bg-slate-50 dark:bg-slate-800 text-primary flex items-center justify-center shrink-0`}>
        <Icon size={small ? 18 : 24} />
      </div>
      <div>
        <h2 className={`${small ? 'text-base font-semibold' : 'text-lg font-bold'} text-slate-900 dark:text-white tracking-tight`}>{title}</h2>
        <p className={`${small ? 'text-xs' : 'text-sm'} text-slate-500 font-medium`}>{desc}</p>
      </div>
    </div>
  );
}
