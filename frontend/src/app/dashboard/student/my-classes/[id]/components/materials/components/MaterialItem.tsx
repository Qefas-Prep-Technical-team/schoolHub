'use client';

import React from 'react';
import { 
  FileText, 
  Video, 
  File, 
  Presentation, 
  Music, 
  Image as ImageIcon, 
  Eye, 
  Calendar
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MaterialCard, RoleTheme, getThemeTokens } from './types';

interface MaterialItemProps {
  material: MaterialCard;
  viewMode: 'list' | 'grid';
  onPreview: (material: MaterialCard) => void;
  role?: RoleTheme;
}

export default function MaterialItem({ material, viewMode, onPreview, role = 'student' }: MaterialItemProps) {
  const theme = getThemeTokens(role);

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'pdf':
        return { icon: FileText, bgColor: 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900', textColor: 'text-red-600 dark:text-red-400' };
      case 'video':
        return { icon: Video, bgColor: 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900', textColor: 'text-blue-600 dark:text-blue-400' };
      case 'image':
        return { icon: ImageIcon, bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900', textColor: 'text-emerald-600 dark:text-emerald-400' };
      case 'slideshow':
        return { icon: Presentation, bgColor: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900', textColor: 'text-amber-600 dark:text-amber-400' };
      case 'audio':
        return { icon: Music, bgColor: 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900', textColor: 'text-purple-600 dark:text-purple-400' };
      default:
        return { icon: File, bgColor: 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700', textColor: 'text-slate-600 dark:text-slate-300' };
    }
  };

  const iconConfig = getIconConfig(material.type);
  const IconComponent = iconConfig.icon;

  const assessmentTag = material.assessmentName || material.assignmentTitle || material.sourceTitle;

  if (viewMode === 'grid') {
    return (
      <Card 
        onClick={() => onPreview(material)}
        className={cn(
          "p-4 sm:p-5 transition-all cursor-pointer border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl flex flex-col justify-between group active:scale-[0.99] overflow-hidden",
          theme.cardHoverBorder,
          "hover:shadow-md"
        )}
      >
        <div className="space-y-3">
          {/* Top category badges & origin assessment tag */}
          <div className="flex items-start justify-between gap-2">
            <div className={`flex items-center justify-center size-11 rounded-xl shrink-0 ${iconConfig.bgColor}`}>
              <IconComponent className={`h-5 w-5 ${iconConfig.textColor}`} />
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0 max-w-[65%]">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80 truncate">
                {material.folder}
              </span>
              {material.isFile && (
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border",
                  theme.badgeBg,
                  theme.badgeText,
                  theme.badgeBorder
                )}>
                  Direct File
                </span>
              )}
            </div>
          </div>
          
          {/* File / Resource Title */}
          <div>
            <h3 className={cn(
              "font-bold text-slate-900 dark:text-white transition-colors line-clamp-2 text-sm sm:text-base leading-snug",
              role === 'admin' ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' : 'group-hover:text-pink-600 dark:group-hover:text-pink-400'
            )}>
              {material.title}
            </h3>
            
            {/* Tagged Assessment Context */}
            {assessmentTag && (
              <div className="mt-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-150 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                <span className={cn("text-[9px] font-bold uppercase tracking-wider block", theme.primaryText)}>
                  Associated Assessment
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {assessmentTag}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer meta & action button */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 truncate">
              <Calendar size={11} className="shrink-0" />
              {material.uploadDate}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
              By {material.teacher}
            </span>
          </div>

          <Button 
            size="sm" 
            variant="ghost" 
            className={cn(
              "h-8 px-2.5 text-xs font-bold rounded-xl gap-1 shrink-0 cursor-pointer",
              theme.primaryText,
              role === 'admin' ? 'hover:bg-indigo-50 dark:hover:bg-indigo-950/50' : 'hover:bg-pink-50 dark:hover:bg-pink-950/50'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onPreview(material);
            }}
          >
            <Eye size={13} />
            <span>Open</span>
          </Button>
        </div>
      </Card>
    );
  }

  // ── List View ─────────────────────────────────────────────────────────────
  return (
    <div 
      onClick={() => onPreview(material)}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all cursor-pointer group shadow-2xs",
        theme.cardHoverBorder
      )}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <div className={`flex items-center justify-center size-10 rounded-xl shrink-0 mt-0.5 sm:mt-0 ${iconConfig.bgColor}`}>
          <IconComponent className={`h-5 w-5 ${iconConfig.textColor}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/80">
              {material.folder}
            </span>
            {material.isFile && (
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border",
                theme.badgeBg,
                theme.badgeText,
                theme.badgeBorder
              )}>
                Direct File
              </span>
            )}
            {material.subjectName && (
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                • {material.subjectName}
              </span>
            )}
          </div>

          <h4 className={cn(
            "font-bold text-slate-900 dark:text-white transition-colors line-clamp-1 text-sm sm:text-base",
            role === 'admin' ? 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400' : 'group-hover:text-pink-600 dark:group-hover:text-pink-400'
          )}>
            {material.title}
          </h4>

          {assessmentTag && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
              <span className={cn("font-medium", theme.primaryText)}>Assessment:</span> {assessmentTag}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pl-13 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
        <div className="text-left sm:text-right">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {material.teacher}
          </p>
          <p className="text-[10px] text-slate-400">
            {material.uploadDate}
          </p>
        </div>

        <Button 
          size="sm" 
          variant="outline"
          className="h-8 px-3 text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl gap-1.5"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(material);
          }}
        >
          <Eye size={13} />
          <span>View</span>
        </Button>
      </div>
    </div>
  );
}
