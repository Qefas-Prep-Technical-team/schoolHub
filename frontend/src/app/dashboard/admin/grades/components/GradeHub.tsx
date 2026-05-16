"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  User, 
  FileText, 
  Calendar, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  History,
  FileUp,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GradeEntryModal from './GradeEntryModal';
import GradeUploadModal from './GradeUploadModal';
import GradeOCRModal from './GradeOCRModal';
import Pagination from './Pagination';

interface GradeHubProps {
  grades: any[];
  isLoading: boolean;
  schoolId: string;
  primaryColor?: string;
}

export default function GradeHub({ grades, isLoading, schoolId, primaryColor = '#2563eb' }: GradeHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);

  // Safely handle cases where grades might not be an array (e.g. if it's an object from the API)
  const safeGrades = Array.isArray(grades) ? grades : (grades as any)?.data || [];

  const filteredGrades = safeGrades.filter((g: any) => 
    g.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGrades.length / itemsPerPage);
  const paginatedGrades = filteredGrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const { institutionalMean, publishedCount, draftCount, publishedPercentage, draftPercentage } = React.useMemo(() => {
    if (!safeGrades.length) return { institutionalMean: 0, publishedCount: 0, draftCount: 0, publishedPercentage: 0, draftPercentage: 0 };
    
    const validGrades = safeGrades.filter((g: any) => g.maxMarks > 0);
    const sum = validGrades.reduce((acc: number, g: any) => acc + (g.score / g.maxMarks), 0);
    const mean = validGrades.length > 0 ? (sum / validGrades.length) * 100 : 0;
    
    const published = safeGrades.filter((g: any) => g.status === 'PUBLISHED' || g.examAttemptId || g.subjectExamAttemptId).length;
    const drafts = safeGrades.length - published;
    
    return {
      institutionalMean: mean.toFixed(1),
      publishedCount: published,
      draftCount: drafts,
      publishedPercentage: Math.round((published / safeGrades.length) * 100),
      draftPercentage: Math.round((drafts / safeGrades.length) * 100)
    };
  }, [safeGrades]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900/40 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="relative group w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" style={{ color: searchTerm ? primaryColor : undefined } as any} />
            <Input 
                type="text" 
                placeholder="Search candidates or subjects..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                }}
                className="w-full pl-12 h-12 bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 transition-all font-medium"
                style={{ '--tw-ring-color': `${primaryColor}20`, borderColor: searchTerm ? primaryColor : undefined } as any}
            />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
             <Button 
                onClick={() => setIsOCRModalOpen(true)}
                variant="outline" 
                className="flex-1 md:flex-none rounded-xl h-12 px-6 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 transition-all"
                style={{ color: primaryColor, borderColor: `${primaryColor}40`, backgroundColor: `${primaryColor}10` }}
              >
                <Camera size={18} className="mr-2" /> AI Vision
             </Button>
             <Button 
                onClick={() => setIsUploadModalOpen(true)}
                variant="outline" 
                className="flex-1 md:flex-none rounded-xl h-12 px-6 font-bold border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 transition-all"
              >
                <FileUp size={18} className="mr-2" /> Batch Upload
             </Button>
             <Button 
                onClick={() => setIsEntryModalOpen(true)}
                className="flex-1 md:flex-none rounded-xl h-12 px-8 font-black uppercase tracking-widest hover:opacity-90 shadow-lg active:scale-95 transition-all text-white"
                style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}40` }}
              >
                <Plus size={18} className="mr-2" /> Create Entry
             </Button>
        </div>
      </div>

      {/* Bento Grid Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[2.5rem] shadow-xl group relative overflow-hidden text-white" style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}30` }}>
                <TrendingUp className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700" size={160} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Institutional Mean</p>
                <h3 className="text-4xl font-black tracking-tighter mb-4">{institutionalMean}%</h3>
                <p className="text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
                   Aggregated Performance
                </p>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Records</p>
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{safeGrades.length}</h3>
                </div>
                <div className="flex gap-2 mt-6">
                   <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${publishedPercentage}%` }} />
                   <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${draftPercentage}%` }} />
                   {safeGrades.length === 0 && <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-800" />}
                </div>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white border border-slate-800 shadow-xl shadow-slate-900/20 overflow-hidden relative group">
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Status Overview</p>
                    <div className="space-y-4 mt-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold flex items-center gap-2"><CheckCircle2 className="text-emerald-400" size={14} /> Published</span>
                            <span className="text-xs font-black">{publishedPercentage}%</span>
                        </div>
                        <div className="flex items-center justify-between opacity-60">
                            <span className="text-xs font-bold flex items-center gap-2"><Clock className="text-amber-400" size={14} /> Drafts</span>
                            <span className="text-xs font-black">{draftPercentage}%</span>
                        </div>
                    </div>
                </div>
                <History className="absolute -left-6 -bottom-6 text-white/5" size={120} />
          </div>
      </div>



      {/* Main Data Table */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-none relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Detail</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Efficiency Score</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-12">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Compiling Grade Hub...</span>
                    </div>
                </td></tr>
              ) : paginatedGrades.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-32 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    <div className="flex flex-col items-center gap-4 opacity-50">
                        <AlertCircle size={40} />
                        <span>No institutional records found matching criteria</span>
                    </div>
                </td></tr>
              ) : paginatedGrades.map((grade: any) => (
                <tr key={grade.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all duration-300">
                  <td className="px-8 py-7">
                    <div className="flex items-center gap-4">
                        <div 
                          className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-inner group-hover:text-white transition-all duration-300"
                          style={{ '--hover-bg': primaryColor } as any}
                        >
                            <User size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100">{grade.student?.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lvl {grade.student?.gradeLevel} • {grade.class?.name}{grade.class?.section}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="space-y-1">
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200 flex items-center gap-2">
                           <FileText size={14} style={{ color: primaryColor }} /> {grade.subject}
                        </p>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{grade.category || grade.assessmentType}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">W:{grade.weight?.toFixed(1) || '1.0'}</span>
                            </div>
                            {(grade.exam || grade.subjectPaper) && (
                              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50 dark:border-slate-800/50 mt-1">
                                {grade.exam && (
                                  <span 
                                    className="text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-md"
                                    style={{ color: primaryColor, backgroundColor: `${primaryColor}10` }}
                                  >
                                    {grade.exam.title}
                                  </span>
                                )}
                                {grade.subjectPaper && (
                                  <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-tight bg-emerald-50/50 dark:bg-emerald-500/5 px-2 py-0.5 rounded-md">
                                    {grade.subjectPaper.title}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                          {grade.score}<span className="text-[10px] text-slate-400 ml-0.5">/{grade.maxMarks}</span>
                        </span>
                        <div className="w-16 h-1 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
                           <div 
                              className="h-full rounded-full" 
                              style={{ width: `${(grade.score / grade.maxMarks) * 100}%`, backgroundColor: primaryColor }} 
                           />
                        </div>
                      </div>
                  </td>
                  <td className="px-8 py-7">
                      {(grade.status === 'PUBLISHED' || grade.examAttemptId || grade.subjectExamAttemptId) ? (
                        <span className="px-4 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-[0.1em] border border-emerald-100 dark:border-emerald-900/30">
                          {grade.examAttemptId || grade.subjectExamAttemptId ? 'Graded' : 'Published'}
                        </span>
                      ) : (
                        <span className="px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] border border-slate-100 dark:border-slate-800">
                          Draft
                        </span>
                      )}
                  </td>
                  <td className="px-8 py-7 text-right pr-12">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                            <MoreVertical size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 dark:border-slate-800 w-48 p-2 shadow-2xl">
                          <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer">
                            Edit Entry
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer text-emerald-600">
                            Publish Now
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl font-bold text-xs py-3 cursor-pointer text-rose-600">
                            Delete Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredGrades.length > 0 && (
            <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800">
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredGrades.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        )}
      </div>

      <GradeEntryModal 
        isOpen={isEntryModalOpen} 
        onClose={() => setIsEntryModalOpen(false)} 
        schoolId={schoolId}
      />
      <GradeUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        schoolId={schoolId}
      />
      <GradeOCRModal 
        isOpen={isOCRModalOpen} 
        onClose={() => setIsOCRModalOpen(false)} 
        schoolId={schoolId}
      />
    </div>
  );
}

