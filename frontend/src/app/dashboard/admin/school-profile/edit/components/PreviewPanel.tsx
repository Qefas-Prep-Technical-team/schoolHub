'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, School } from 'lucide-react';
import { SchoolEditData, PreviewMode } from './types';

interface PreviewPanelProps {
  schoolData: SchoolEditData;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ schoolData }) => {
  const [previewMode, setPreviewMode] = useState<PreviewMode['id']>('dashboard');

  const previewModes: PreviewMode[] = [
    { id: 'dashboard', label: 'Dashboard View' },
    { id: 'portal', label: 'Portal View' }
  ];

  return (
    <div className="sticky top-8">
      <div className="p-6 border bg-card-light dark:bg-card-dark rounded-xl border-border-light dark:border-border-dark">
        <h3 className="text-lg font-semibold text-text-light-primary dark:text-text-dark-primary">
          Branding Preview
        </h3>
        <p className="mt-1 text-sm text-text-light-secondary dark:text-text-dark-secondary">
          A real-time preview of the school&apos;s branding.
        </p>
        
        <div className="mt-6">
          <div className="flex gap-1 p-1 rounded-lg bg-background-light dark:bg-background-dark">
            {previewModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPreviewMode(mode.id)}
                className={`w-full h-8 text-xs font-medium transition-colors rounded-md ${
                  previewMode === mode.id
                    ? 'text-white bg-primary'
                    : 'text-text-light-secondary dark:text-text-dark-secondary hover:bg-primary/10'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 mt-4 border rounded-lg border-border-light dark:border-border-dark">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-background-light dark:bg-background-dark">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-12 shrink-0"
              style={{ backgroundImage: `url(${schoolData.logo})` }}
              aria-label="School logo preview"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold leading-tight text-text-light-primary dark:text-text-dark-primary line-clamp-1">
                {schoolData.name}
              </p>
              <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary line-clamp-1">
                {schoolData.motto}
              </p>
            </div>
          </div>
          
          <div className="pt-4 mt-4 space-y-3 border-t border-border-light dark:border-border-dark">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-text-light-secondary dark:text-text-dark-secondary flex-shrink-0" />
              <p className="text-sm truncate text-text-light-primary dark:text-text-dark-primary">
                {schoolData.contact.email || 'contact@lexendacademy.com'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-text-light-secondary dark:text-text-dark-secondary flex-shrink-0" />
              <p className="text-sm truncate text-text-light-primary dark:text-text-dark-primary">
                {schoolData.contact.phone || '+1 (555) 123-4567'}
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-text-light-secondary dark:text-text-dark-secondary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-text-light-primary dark:text-text-dark-primary">
                {schoolData.contact.address || '123 Education Lane, Knowledge City, USA 12345'}
              </p>
            </div>
          </div>
          
          {previewMode === 'dashboard' && (
            <div className="pt-4 mt-4 border-t border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background-light dark:bg-background-dark">
                <School size={16} className="text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">
                    Current Session
                  </p>
                  <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                    {schoolData.academic.currentSession}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;