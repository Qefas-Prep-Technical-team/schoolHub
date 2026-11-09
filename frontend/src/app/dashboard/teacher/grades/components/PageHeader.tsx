'use client';

import React from 'react';
import { Plus, Camera, FileUp, Settings2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { HeaderTooltip } from "@/app/dashboard/teacher/components/dashboard/HeaderTooltip";

interface PageHeaderProps {
  onAddGrade: () => void;
  onOCRClick: () => void;
  onUploadClick: () => void;
  onSettingsClick?: () => void;
  onExportClick?: () => void;
  hasOCRAccess: boolean;
  hasCSVAccess: boolean;
  selectedSchoolName: string;
  isPersonal: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  onAddGrade, 
  onOCRClick, 
  onUploadClick, 
  onSettingsClick,
  onExportClick,
  hasOCRAccess, 
  hasCSVAccess,
  selectedSchoolName, 
  isPersonal 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
      {/* Title & Badge Context */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight">
            Academic Grades
          </h1>
          <HeaderTooltip content="Centralized gradebook and academic evaluation console. Use this to record marks, execute AI Vision document OCR scanning, batch-upload CSV grades, and calibrate grade-scale thresholds across your classes." />
        </div>
        <p className="text-slate-700 dark:text-slate-300 mt-1 font-bold text-xs bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-3 py-0.5 rounded-full w-fit">
          {isPersonal 
            ? "All Connected Schools"
            : selectedSchoolName}
        </p>
      </div>
      
      {/* Actions Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
        <div className="flex items-center gap-2 justify-between sm:justify-start">
          {/* AI Vision Scanner */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 sm:flex-none"
          >
            <Button
              variant="outline"
              className="h-10 sm:h-11 rounded-xl px-3 sm:px-3.5 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold w-full sm:w-auto group relative cursor-pointer"
              onClick={onOCRClick}
              title={hasOCRAccess ? "Scan Physical Mark Sheet via AI" : "AI Scanner (Locked - Upgrade Required)"}
            >
              <Camera size={18} className="mr-1.5 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>AI Scanner</span>
              {!hasOCRAccess && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-[9px] font-black uppercase text-white shadow-xs">
                  PRO
                </span>
              )}
            </Button>
          </motion.div>

          {/* Batch CSV Upload */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 sm:flex-none"
          >
            <Button
              variant="outline"
              className="h-10 sm:h-11 rounded-xl px-3 sm:px-3.5 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold w-full sm:w-auto group relative cursor-pointer"
              onClick={onUploadClick}
              title={hasCSVAccess ? "Upload CSV Scores" : "CSV Upload (Locked - Upgrade Required)"}
            >
              {hasCSVAccess ? (
                <FileUp size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
              ) : (
                <>
                  <FileUp size={18} className="text-slate-400 dark:text-slate-600" />
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="white">
                      <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                    </svg>
                  </span>
                </>
              )}
            </Button>
          </motion.div>

          {/* Settings Button */}
          {onSettingsClick && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-none"
            >
              <Button
                variant="outline"
                className="h-10 sm:h-11 rounded-xl px-3 sm:px-3.5 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors text-xs font-bold w-full sm:w-auto cursor-pointer"
                onClick={onSettingsClick}
                title="Grading Scale Settings"
              >
                <Settings2 className="mr-1.5 h-4 w-4" />
                Settings
              </Button>
            </motion.div>
          )}

          {/* Export Grade Pad Button */}
          {onExportClick && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-none"
            >
              <Button
                variant="outline"
                className="h-10 sm:h-11 rounded-xl px-3 sm:px-3.5 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold w-full sm:w-auto cursor-pointer"
                onClick={onExportClick}
                title="Export Grade Pad"
              >
                <Download className="mr-1.5 h-4 w-4 text-emerald-600" />
                Export
              </Button>
            </motion.div>
          )}
        </div>

        {/* Record New Grade Primary Action */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full sm:w-auto"
        >
          <Button 
            className="h-10 sm:h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-300 font-bold text-xs sm:text-sm w-full sm:w-auto cursor-pointer"
            onClick={onAddGrade}
          >
            <Plus className="mr-2 h-4 w-4" strokeWidth={2.5} />
            Record Grade
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PageHeader;