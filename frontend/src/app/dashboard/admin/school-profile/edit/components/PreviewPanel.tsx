'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, School, Globe, Facebook, Twitter, Instagram, Linkedin, Youtube, Image as ImageIcon } from 'lucide-react';
import { SchoolEditData, PreviewMode } from './types';

interface PreviewPanelProps {
  schoolData: SchoolEditData;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ schoolData }) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode['id']>('dashboard');

  const previewModes: PreviewMode[] = [
    { id: 'dashboard', label: 'Admin' },
    { id: 'portal', label: 'Portal' }
  ];

  return (
    <div className="sticky top-8 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Live Preview
              </h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Institutional Rendering
              </p>
           </div>
           <div className="flex gap-1 p-1 rounded-xl bg-slate-50 dark:bg-slate-800">
            {previewModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setPreviewMode(mode.id)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg ${
                  previewMode === mode.id
                    ? 'text-white bg-slate-900 dark:bg-white dark:text-slate-900 shadow-lg'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* The Actual Preview Card */}
        <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 shadow-inner">
          
          {/* Banner Area */}
          <div className="relative h-32 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            {schoolData.bannerImage ? (
              <img src={schoolData.bannerImage} alt="Banner" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                  <ImageIcon size={32} />
               </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Logo Overlay */}
            <div className="absolute -bottom-6 left-6 h-20 w-20 rounded-2xl bg-white dark:bg-slate-900 p-1 shadow-2xl overflow-hidden">
               <div className="w-full h-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  {schoolData.logo ? (
                    <img src={schoolData.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <School size={24} className="text-primary" />
                  )}
               </div>
            </div>
          </div>

          <div className="p-8 pt-10 space-y-6">
            <div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight truncate">
                {schoolData.name || 'Your School Name'}
              </h4>
              <p className="text-[10px] text-slate-500 font-bold italic line-clamp-1">
                {schoolData.motto || 'Empowering through education.'}
              </p>
            </div>

            <div className="space-y-3">
               <PreviewInfoItem icon={Mail} value={schoolData.schoolEmail} placeholder="admin@school.com" />
               <PreviewInfoItem icon={Phone} value={schoolData.phone} placeholder="+234..." />
               <PreviewInfoItem icon={MapPin} value={schoolData.address} placeholder="Campus Location" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
               {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map(platform => {
                  const url = schoolData.socialLinks?.[platform as keyof typeof schoolData.socialLinks];
                  if (!url) return null;
                  return (
                    <div key={platform} className="h-8 w-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary shadow-sm hover:scale-110 transition-transform">
                       <SocialIcon platform={platform} size={14} />
                    </div>
                  )
               })}
               {!Object.values(schoolData.socialLinks || {}).some(v => v) && (
                 <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">No social links</p>
               )}
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Sync Active</p>
        </div>
      </div>
    </div>
  );
};

function PreviewInfoItem({ icon: Icon, value, placeholder }: { icon: any, value?: string, placeholder: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-7 w-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 shadow-sm border border-slate-100 dark:border-slate-700">
        <Icon size={14} />
      </div>
      <p className={`text-[10px] font-bold truncate ${value ? 'text-slate-700 dark:text-slate-300' : 'text-slate-200 dark:text-slate-800 italic'}`}>
        {value || placeholder}
      </p>
    </div>
  );
}

function SocialIcon({ platform, size }: { platform: string, size: number }) {
  switch (platform) {
    case 'facebook': return <Facebook size={size} />;
    case 'twitter': return <Twitter size={size} />;
    case 'instagram': return <Instagram size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
    case 'youtube': return <Youtube size={size} />;
    default: return <Globe size={size} />;
  }
}

export default PreviewPanel;