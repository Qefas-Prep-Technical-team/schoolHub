/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolProfile, useUpdateSchoolProfile } from '@/lib/api/hooks/useSchool';
import FormInput from './components/FormInput';
import ImageUpload from './components/ImageUpload';
import PreviewPanel from './components/PreviewPanel';
import FormActionBar from './components/FormActionBar';
import { toast } from 'react-toastify';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Globe, 
  Share2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Camera,
  MapPin,
  GraduationCap,
  X,
  Plus
} from 'lucide-react';

export default function EditSchoolProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  
  const { data: school, isLoading } = useSchoolProfile(schoolId);
  const updateMutation = useUpdateSchoolProfile();

  const [activeStep, setActiveStep] = useState(1);
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

  const steps = [
    { id: 1, title: 'Identity', icon: Building2, desc: 'Logo, Banner & Motto' },
    { id: 2, title: 'Presence', icon: Globe, desc: 'Contact & Location' },
    { id: 3, title: 'Governance', icon: Share2, desc: 'Admin & Socials' },
    { id: 4, title: 'Academic', icon: GraduationCap, desc: 'Levels Configuration' },
  ];

  if (isLoading || !schoolData) {
    return (
      <div className="p-12 space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 space-y-12">
              <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-[3rem]" />
              <div className="h-96 w-full bg-slate-200 dark:bg-slate-800 rounded-[3rem]" />
           </div>
           <div className="h-[500px] bg-slate-100 dark:bg-slate-900 rounded-[3rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Modern Multi-step Header */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                <CheckCircle2 size={14} /> School Configuration
             </div>
             <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Institutional <span className="text-primary italic">Profile</span>
             </h1>
             <p className="text-slate-500 font-medium max-w-md italic">
                Manage your school&apos;s digital identity and public-facing metadata.
             </p>
          </div>

          <nav className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all ${
                    activeStep === step.id 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <step.icon size={18} className={activeStep === step.id ? 'animate-bounce' : ''} />
                  <div className="text-left hidden md:block">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{step.title}</p>
                    <p className={`text-[8px] font-medium opacity-60`}>{step.desc}</p>
                  </div>
                </button>
                {idx < steps.length - 1 && <ChevronRight size={14} className="text-slate-200" />}
              </React.Fragment>
            ))}
          </nav>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Main Editing Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 p-10 lg:p-16 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-12"
              >
                {activeStep === 1 && (
                  <div className="space-y-12">
                    <SectionHeader title="Visual Identity" desc="Define how your school looks across the platform." icon={Camera} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      rows={5}
                    />
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-12">
                    <SectionHeader title="Connectivity & Reach" desc="Official contact channels and physical presence." icon={Globe} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      rows={3}
                    />

                    <div className="space-y-6">
                      <SectionHeader title="Operational Data" desc="Business hours and location precision." icon={MapPin} small />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                )}

                {activeStep === 3 && (
                  <div className="space-y-12">
                    <SectionHeader title="Governance & Social" desc="Leadership details and social media presence." icon={Share2} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                    <div className="space-y-8 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                      <SectionHeader title="Social Footprint" desc="Connect your official social media channels." icon={Share2} small />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                )}

                {activeStep === 4 && (
                  <div className="space-y-12">
                    <SectionHeader title="Academic Configuration" desc="Manage custom levels for your institution's classes." icon={GraduationCap} />
                    
                    <div className="space-y-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Custom Levels</label>
                        <p className="text-xs text-slate-500">Add the levels (e.g. Grade 1, Year 7, JSS 1) that are applicable in your school.</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {schoolData.levels.map((lvl: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
                            <span className="text-sm font-medium text-slate-900 dark:text-white">{lvl}</span>
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

                      <div className="flex items-center gap-3">
                        <input
                          id="new-level-input"
                          type="text"
                          placeholder="e.g. Primary 1"
                          className="flex-1 max-w-sm h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
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
                          className="h-11 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-2"
                        >
                          <Plus size={16} /> Add Level
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Navigation Button inside the main card */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                    disabled={activeStep === 1}
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <ChevronLeft size={16} /> Previous Section
                  </button>
                  
                  {activeStep < 4 ? (
                    <button 
                      onClick={() => setActiveStep(prev => Math.min(4, prev + 1))}
                      className="group flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      Next Section <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button 
                      onClick={handleSave}
                      disabled={!hasChanges || updateMutation.isPending}
                      className={`flex items-center gap-3 px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${
                        !hasChanges || updateMutation.isPending
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:scale-105 active:scale-95 shadow-primary/30'
                      }`}
                    >
                      {updateMutation.isPending ? 'Propagating Changes...' : 'Publish Update'}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Premium Real-time Preview */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                <Info size={180} />
              </div>
              <h3 className="text-xl font-black mb-6 tracking-tight relative z-10 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                Live Synchronization
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed relative z-10">
                Witness real-time updates as you refine your institution&apos;s identity. Changes are only permanent once published.
              </p>
            </div>
            
            {/* The existing PreviewPanel updated with new fields */}
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
    <div className={`flex items-start gap-4 ${small ? 'mb-4' : 'mb-8'}`}>
      <div className={`${small ? 'h-10 w-10 p-2' : 'h-14 w-14 p-4'} rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0`}>
        <Icon size={small ? 20 : 28} strokeWidth={2.5} />
      </div>
      <div>
        <h2 className={`${small ? 'text-lg font-black' : 'text-2xl font-black'} tracking-tight`}>{title}</h2>
        <p className={`${small ? 'text-[10px]' : 'text-sm'} text-slate-500 font-medium`}>{desc}</p>
      </div>
    </div>
  );
}

