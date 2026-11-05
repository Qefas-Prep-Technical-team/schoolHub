'use client';

import React from 'react';
import MaterialItem from './MaterialItem';
import { MaterialCard, RoleTheme, getThemeTokens } from './types';
import { FileDown } from 'lucide-react';
import { groupByDate } from '../utils/dateSectioning';

interface MaterialsListProps {
  materials: MaterialCard[];
  viewMode: 'list' | 'grid';
  emptyMessage?: string;
  onPreview: (material: MaterialCard) => void;
  accentRole?: RoleTheme;
}

export default function MaterialsList({ 
  materials, 
  viewMode, 
  onPreview,
  emptyMessage = "No study materials or files found",
  accentRole = 'student'
}: MaterialsListProps) {
  const theme = getThemeTokens(accentRole);

  if (materials.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
          <FileDown className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
          {emptyMessage}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          No uploaded documents, question papers, reading passages, or video links match the selected stream.
        </p>
      </div>
    );
  }

  // Apply canonical date sectioning display pattern
  const dateGroups = groupByDate(materials, (m) => m.rawDate || m.uploadDate);

  return (
    <div className="space-y-6">
      {dateGroups.map((group) => (
        <section key={group.label} className="space-y-3">
          {/* Section Header Pattern according to date_sectioning_display skill */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2.5">
              <div className={`size-2 rounded-full ${theme.accentDot}`} />
              <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                {group.label}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400 font-mono">
              {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {group.items.map((material) => (
                <MaterialItem 
                  key={material.id} 
                  material={material} 
                  viewMode="grid"
                  onPreview={onPreview}
                  role={accentRole}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {group.items.map((material) => (
                <MaterialItem 
                  key={material.id} 
                  material={material} 
                  viewMode="list"
                  onPreview={onPreview}
                  role={accentRole}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
