import { Plus, FilePlus, ChevronDown, Download, FileText, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeaderTooltip } from "@/app/dashboard/teacher/components/dashboard/HeaderTooltip";

interface PageHeaderProps {
  title: string;
  onCreateNew: (category: 'EXAM' | 'QUIZ' | 'CA' | 'ASSIGNMENT') => void;
  onAddPaper?: () => void;
  activeTab?: 'exams' | 'quizzes' | 'subject-papers' | 'ca' | 'assignment';
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  isExporting?: boolean;
}

export default function PageHeader({ 
  title, 
  onCreateNew, 
  onAddPaper, 
  activeTab,
  onExportPDF,
  onExportCSV,
  isExporting = false
}: PageHeaderProps) {
  const baseItemStyle = "flex items-center gap-2 cursor-pointer text-xs font-semibold py-2";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <h1 className="text-slate-900 dark:text-white text-2xl sm:text-3xl font-black leading-tight tracking-tight">
          {title}
        </h1>
        <HeaderTooltip content="Centralized assessment command center for authoring, scheduling, and reviewing single-paper examinations, quizzes, continuous assessments (CA), and assignments across your classes." />
      </div>
      
      <div className="w-full sm:w-auto flex flex-wrap items-center gap-2.5">
        {/* Admin-Style Export Dropdown */}
        {(onExportPDF || onExportCSV) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                disabled={isExporting} 
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl h-10 px-4 text-xs font-bold transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                {isExporting ? (
                  <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={15} strokeWidth={2.5} />
                )}
                <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" strokeWidth={2.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1.5 z-50">
              {onExportPDF && (
                <DropdownMenuItem onClick={onExportPDF} className="cursor-pointer flex items-center gap-2.5 text-xs font-semibold py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <FileText size={15} className="text-rose-500 shrink-0" />
                  <span>Export as PDF</span>
                </DropdownMenuItem>
              )}
              {onExportCSV && (
                <DropdownMenuItem onClick={onExportCSV} className="cursor-pointer flex items-center gap-2.5 text-xs font-semibold py-2 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <FileSpreadsheet size={15} className="text-emerald-500 shrink-0" />
                  <span>Export as CSV</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Create New Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full sm:w-auto flex items-center cursor-pointer justify-center gap-2 rounded-xl h-10 px-4 text-xs font-bold shadow-sm transition-all duration-300 border hover:-translate-y-0.5 active:scale-95 whitespace-nowrap bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 hover:shadow-emerald-900/20">
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span>Create New</span>
              <ChevronDown className="w-4 h-4 opacity-70" strokeWidth={2.5} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 z-50">
            <DropdownMenuItem onClick={() => onCreateNew('EXAM')} className={baseItemStyle}>
              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
              <span>Single Paper Exam</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateNew('QUIZ')} className={baseItemStyle}>
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
              <span>Quiz</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateNew('CA')} className={baseItemStyle}>
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
              <span>CA</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCreateNew('ASSIGNMENT')} className={baseItemStyle}>
              <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" strokeWidth={2.5} />
              <span>Assignment</span>
            </DropdownMenuItem>
            {onAddPaper && (
              <DropdownMenuItem onClick={onAddPaper} className={baseItemStyle}>
                <FilePlus className="w-4 h-4 text-slate-600 dark:text-slate-400" strokeWidth={2.5} />
                <span>Paper</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
