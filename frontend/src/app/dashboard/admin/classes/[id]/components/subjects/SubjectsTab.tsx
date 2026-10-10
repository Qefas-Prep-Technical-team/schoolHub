'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';

import { Plus, Download, Loader2, FileText, FileSpreadsheet, Info } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import SubjectCard from './components/SubjectCard';
import AddSubjectModal from './components/AddSubjectModal';
import { Subject } from './components/types';
import Pagination from '@/components/ui/Pagination';
import SubjectDetailsModal from './components/SubjectDetailsModal';
import { generatePDF } from '@/utils/pdfGenerator';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { toast } from 'react-toastify';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClassSubjectsPageProps {
  classSubjects?: any[];
  className?: string;
  classId?: string;
  classData?: any;
}

export default function ClassSubjectsPage({ 
  classSubjects = [], 
  className = '',
  classId: propClassId,
  classData
}: ClassSubjectsPageProps) {
  const router = useRouter();
  const params = useParams();
  const classId = propClassId || (params.id as string);

  const { data: schoolProfile } = useSchoolProfile(classData?.schoolId || '');
  const [isExporting, setIsExporting] = useState(false);

  // Map real classSubject data to Subject type
  const subjects: Subject[] = useMemo(() => {
    return classSubjects.map(cs => {
      let matchedTeachers: string[] = [];

      // 1. Try to find from class teachers who teach this subject
      if (classData?.teachers) {
        const matchingClassTeachers = classData.teachers.filter((ct: any) => 
          ct.teacher?.subjects?.some((s: any) => s.id === cs.subject.id) ||
          ct.teacher?.teacherSubjects?.some((ts: any) => ts.subjectId === cs.subject.id)
        );
        if (matchingClassTeachers.length > 0) {
          matchedTeachers = matchingClassTeachers.map((ct: any) => ct.teacher.name).filter(Boolean);
        }
      }

      // 2. If no class-specific teacher matches, fall back to globally assigned teachers
      if (matchedTeachers.length === 0) {
        if (cs.subject.teacher?.name) {
          matchedTeachers.push(cs.subject.teacher.name);
        }
        if (cs.subject.teacherSubjects && cs.subject.teacherSubjects.length > 0) {
          const globalTeachers = cs.subject.teacherSubjects.map((ts: any) => ts.teacher?.name).filter(Boolean);
          matchedTeachers = Array.from(new Set([...matchedTeachers, ...globalTeachers])); // Remove duplicates
        }
      }

      const finalTeacherName = matchedTeachers.length > 0 ? matchedTeachers.join('\n') : 'Not assigned';

      return {
        id: cs.subject.id,
        name: cs.subject.name,
        code: cs.subject.code,
        description: cs.subject.description || '',
        teacherName: finalTeacherName,
        teacherId: '', // You can safely ignore this for the PDF
        icon: '',
        assignments: 0,
        exams: cs.subject._count?.subjectExamPapers || 0,
        averageScore: 0,
        classPerformance: 0,
        enrolledStudents: 0,
        credits: 0,
        semester: 'fall' as any,
        academicYear: ''
      };
    });
  }, [classSubjects, classData]);

  const [currentSubjects, setCurrentSubjects] = useState<Subject[]>(subjects);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    setCurrentSubjects(subjects);
    setCurrentPage(1);
  }, [subjects]);

  // Calculate Paginated Subjects
  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return currentSubjects.slice(startIndex, startIndex + itemsPerPage);
  }, [currentSubjects, currentPage]);

  const totalPages = Math.ceil(currentSubjects.length / itemsPerPage);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDetailsOpen(true);
  };

  const handleAddSubject = (subjectData: Partial<Subject>) => {
    // In real app, this would refresh the parent class data or call an API
    // console.log('Adding subject to class:', subjectData);
  };

  const handleExport = async () => {
    if (currentSubjects.length === 0) {
      toast.warning("No subjects to export");
      return;
    }
    
    setIsExporting(true);
    const toastId = toast.loading("Generating PDF...", { autoClose: false });

    try {
      const tableData = currentSubjects.map((subject, index) => [
        index + 1,
        subject.name,
        subject.code || '-',
        subject.teacherName || 'Not Assigned',
        subject.exams > 0 ? `${subject.exams} Exams` : 'None'
      ]);

      await generatePDF({
        title: 'Class Subjects Report',
        filename: `${schoolProfile?.name || 'School'}_${className || 'Class'}_Subjects.pdf`,
        schoolProfile,
        metaData: [
          { label: 'Class Name', value: className || 'Unknown Class' },
          { label: 'Date Exported', value: new Date().toLocaleDateString() },
          { label: 'Total Subjects', value: currentSubjects.length.toString() },
          { label: 'Assigned Teachers', value: currentSubjects.filter(s => s.teacherName && s.teacherName !== 'Not assigned').length.toString() }
        ],
        tableHeaders: [['S/N', 'Subject Name', 'Subject Code', 'Assigned Teacher', 'Total Exams']],
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
    if (currentSubjects.length === 0) {
      toast.warning("No subjects to export");
      return;
    }
    
    const headers = ['S/N', 'Subject Name', 'Subject Code', 'Assigned Teacher', 'Total Exams'];
    const rows = currentSubjects.map((subject, index) => [
      index + 1,
      `"${subject.name}"`,
      `"${subject.code || '-'}"`,
      `"${subject.teacherName || 'Not Assigned'}"`,
      `"${subject.exams > 0 ? `${subject.exams} Exams` : 'None'}"`
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
    link.setAttribute('download', `${schoolProfile?.name || 'School'}_${className || 'Class'}_Subjects.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported Successfully!");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold">
            Class Subjects
          </h2>
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none">
                  <Info size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                Details all academic subjects actively taught to this class. Use this view to ensure comprehensive curriculum coverage and to configure distinct grading requirements or pass marks per subject.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
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
          
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 overflow-hidden rounded-full h-10 px-5 bg-primary text-white dark:text-gray-900 text-sm font-semibold leading-normal tracking-wide shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={18} />
            <span className="truncate">Add Subject</span>
          </button>
        </div>
      </header>
      
      {/* Subjects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedSubjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onClick={handleSubjectClick}
          />
        ))}
      </div>

      {currentSubjects.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-slate-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No subjects yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
            This class has no subjects assigned to it yet.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-primary text-white dark:text-gray-900 rounded-full hover:bg-primary/90 font-semibold"
          >
            Add Subject
          </button>
        </div>
      )}

      {currentSubjects.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          totalItems={currentSubjects.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          theme="blue"
        />
      )}

      <AddSubjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSubject}
        classId={classId}
      />

      <SubjectDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        subject={selectedSubject}
      />
    </div>
  );
}