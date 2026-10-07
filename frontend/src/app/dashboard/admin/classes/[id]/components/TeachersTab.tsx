'use client';

import React, { useState, useMemo, useEffect } from "react";
import { User, Mail, Phone, BadgeCheck, Download, Loader2, FileText, FileSpreadsheet } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import TeacherDetailsModal from "./TeacherDetailsModal";
import { generatePDF } from '@/utils/pdfGenerator';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { toast } from 'react-toastify';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  teacherCode?: string;
}

interface ClassTeacher {
  teacher: Teacher;
  isLead: boolean;
}

interface TeachersTabProps {
  teachers: ClassTeacher[];
  classData?: any;
  className?: string;
}

const TeachersTab: React.FC<TeachersTabProps> = ({ teachers = [], classData, className }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isLeadTeacher, setIsLeadTeacher] = useState<boolean>(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [teachers]);

  const paginatedTeachers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return teachers.slice(startIndex, startIndex + itemsPerPage);
  }, [teachers, currentPage]);

  const totalPages = Math.ceil(teachers.length / itemsPerPage);

  const handleTeacherClick = (teacher: Teacher, isLead: boolean) => {
    setSelectedTeacher(teacher);
    setIsLeadTeacher(isLead);
    setIsDetailsOpen(true);
  };

  const { data: schoolProfile } = useSchoolProfile(classData?.schoolId || '');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (teachers.length === 0) {
      toast.warning("No teachers to export");
      return;
    }
    
    setIsExporting(true);
    const toastId = toast.loading("Generating PDF...", { autoClose: false });

    try {
      const tableData = teachers.map((ct, index) => [
        index + 1,
        ct.teacher.name,
        ct.teacher.email || '-',
        ct.teacher.phone || '-',
        ct.isLead ? 'Yes' : 'No'
      ]);

      await generatePDF({
        title: 'Class Teachers Report',
        filename: `${schoolProfile?.name?.replace(/\\s+/g, '_') || 'School'}_${className?.replace(/\\s+/g, '_') || 'Class'}_Teachers.pdf`,
        schoolProfile,
        metaData: [
          { label: 'Class Name', value: className || 'Unknown Class' },
          { label: 'Date Exported', value: new Date().toLocaleDateString() },
          { label: 'Total Teachers', value: teachers.length.toString() },
          { label: 'Lead Teachers', value: teachers.filter(t => t.isLead).length.toString() }
        ],
        tableHeaders: [['S/N', 'Teacher Name', 'Email', 'Phone', 'Lead Teacher']],
        tableData
      });

      toast.update(toastId, { render: "PDF Exported Successfully!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.update(toastId, { render: "Failed to export PDF", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    if (teachers.length === 0) {
      toast.warning("No teachers to export");
      return;
    }
    
    const headers = ['S/N', 'Teacher Name', 'Email', 'Phone', 'Lead Teacher'];
    const rows = teachers.map((ct, index) => [
      index + 1,
      `"${ct.teacher.name}"`,
      `"${ct.teacher.email || '-'}"`,
      `"${ct.teacher.phone || '-'}"`,
      `"${ct.isLead ? 'Yes' : 'No'}"`
    ]);
    
    const schoolName = schoolProfile?.name || (globalThis as any)?.settings?.schoolName || 'School';
    const schoolAddress = schoolProfile?.address || '';
    const csvContent = [
      `"${schoolName}"`,
      `"${schoolAddress}"`,
      `"Class: ${className || 'Class'}"`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].filter(r => r !== '""').join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${schoolProfile?.name?.replace(/\\s+/g, '_') || 'School'}_${className?.replace(/\\s+/g, '_') || 'Class'}_Teachers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported Successfully!");
  };

  if (!teachers || teachers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mt-6">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <User className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Teachers Assigned</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
          There are currently no teachers assigned to this class.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
      {/* Page Header */}
      <header className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-gray-900 dark:text-white text-xl font-bold">
          Class Teachers
        </h2>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                disabled={isExporting}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                <span className="hidden sm:inline">Export</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleExport} className="cursor-pointer flex items-center gap-2">
                <FileText size={16} className="text-rose-500" />
                <span>Export as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-emerald-500" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedTeachers.map((ct) => (
          <div 
            key={ct.teacher.id}
            onClick={() => handleTeacherClick(ct.teacher, ct.isLead)}
            className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            {ct.isLead && (
              <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800/50">
                <BadgeCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Lead Teacher</span>
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                {ct.teacher.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {ct.teacher.name}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">
                  {ct.teacher.teacherCode || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                  <Mail size={14} className="text-slate-400" />
                </div>
                <span className="text-xs truncate">{ct.teacher.email}</span>
              </div>
              {ct.teacher.phone && (
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                    <Phone size={14} className="text-slate-400" />
                  </div>
                  <span className="text-xs">{ct.teacher.phone}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleTeacherClick(ct.teacher, ct.isLead);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all duration-300"
              >
                View Full Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {teachers.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          totalItems={teachers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          theme="blue"
        />
      )}

      <TeacherDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        teacher={selectedTeacher}
        isLead={isLeadTeacher}
      />
    </div>
  );
};

export default TeachersTab;
