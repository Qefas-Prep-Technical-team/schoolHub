'use client';

import { useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Toolbar, StudentFilters } from './components/Toolbar';
import { StudentTable } from './components/StudentTable';
import { Pagination } from './components/Pagination';
import { Student } from './components/types';
import { teacherService } from '@/lib/api/services/teacherService';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";
import { TabSkeleton } from '../TabSkeleton';

import { cn } from '@/lib/utils';

export type StudentStatusTab = 'ALL' | 'ENROLLED' | 'GRADUATED' | 'EXPELLED' | 'TRANSFERRED';

export default function StudentsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<StudentStatusTab>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filters, setFilters] = useState<StudentFilters>({ gender: '', status: '', performance: '' });
  const itemsPerPage = 10;

  const { data: classDetailData } = useQuery({
    queryKey: ['class-detail', classId],
    queryFn: () => teacherService.getClassDetail(classId),
    enabled: !!classId,
    staleTime: 1000 * 60 * 5,
  });

  const classInfo = classDetailData?.classInfo;
  const schoolInfo = (user as any)?.school;

  const { data, isLoading, error } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => teacherService.getStudents({ classId, page: 1, limit: 500 }),
    enabled: !!classId,
    staleTime: 1000 * 60 * 5,
  });

  const allStudents: Student[] = useMemo(() => (data?.students ?? []).map((s: {
    id: string; name: string; studentCode?: string; email?: string;
    gender?: string; status?: string; avatarUrl?: string;
    performance?: string; attendance?: number; grade?: string; lastExam?: string;
  }) => {
    const rawStatus = (s.status || '').toLowerCase();
    let normalizedStatus: Student['status'] = 'enrolled';
    if (rawStatus.includes('graduat')) normalizedStatus = 'graduated';
    else if (rawStatus.includes('expel')) normalizedStatus = 'expelled';
    else if (rawStatus.includes('transfer')) normalizedStatus = 'transferred';
    else if (rawStatus.includes('suspend')) normalizedStatus = 'suspended';
    else normalizedStatus = 'enrolled';

    return {
      id: s.id,
      name: s.name,
      studentId: `#${(s.studentCode || s.id).slice(-6).toUpperCase()}`,
      studentCode: s.studentCode,
      email: s.email,
      gender: (s.gender?.toLowerCase() as Student['gender']) || 'male',
      status: normalizedStatus,
      avatar: s.avatarUrl || '',
      performance: s.performance || 'Medium',
      attendance: s.attendance ?? 100,
      grade: s.grade,
      lastExam: s.lastExam,
    };
  }), [data]);

  const statusCounts = useMemo(() => {
    let enrolled = 0;
    let graduated = 0;
    let expelled = 0;
    let transferred = 0;

    allStudents.forEach(s => {
      if (s.status === 'graduated') graduated++;
      else if (s.status === 'expelled') expelled++;
      else if (s.status === 'transferred') transferred++;
      else enrolled++;
    });

    return {
      all: allStudents.length,
      enrolled,
      graduated,
      expelled,
      transferred
    };
  }, [allStudents]);

  const filtered = useMemo(() => allStudents.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || s.name.toLowerCase().includes(q) || (s.studentCode || s.studentId).toLowerCase().includes(q);
    const matchesGender = !filters.gender || s.gender === filters.gender;
    const matchesStatus = !filters.status || s.status === filters.status;
    const matchesPerformance = !filters.performance || s.performance === filters.performance;

    let matchesTab = true;
    if (selectedStatusTab === 'ENROLLED') {
      matchesTab = s.status === 'enrolled' || s.status === 'active';
    } else if (selectedStatusTab === 'GRADUATED') {
      matchesTab = s.status === 'graduated';
    } else if (selectedStatusTab === 'EXPELLED') {
      matchesTab = s.status === 'expelled';
    } else if (selectedStatusTab === 'TRANSFERRED') {
      matchesTab = s.status === 'transferred';
    }

    return matchesSearch && matchesGender && matchesStatus && matchesPerformance && matchesTab;
  }), [allStudents, searchQuery, filters, selectedStatusTab]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearchChange = (q: string) => { setSearchQuery(q); setCurrentPage(1); };
  const handleFilterChange = (f: StudentFilters) => { setFilters(f); setCurrentPage(1); };

  // ── PDF Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const schoolName = schoolInfo?.name || 'School';
    const schoolPhone = schoolInfo?.phone || 'N/A';
    const schoolAddress = schoolInfo?.location || schoolInfo?.address || 'N/A';
    const className = classInfo?.name || 'Class';
    const subject = classInfo?.subject || '';
    const teacherName = user?.name || 'Teacher';
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    const rows = filtered.map((s, i) => {
      const att = typeof s.attendance === 'number' ? s.attendance : parseInt(s.attendance || '0', 10);
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${s.name}</td>
          <td>${s.studentCode || s.studentId}</td>
          <td>${s.gender === 'male' ? 'Male' : 'Female'}</td>
          <td>${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</td>
          <td>${s.performance || 'Medium'}</td>
          <td>${att}%</td>
          <td>${s.lastExam || 'N/A'}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${className} - Student Register</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 40px; font-size: 13px; }
    .header { border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 24px; }
    .school-name { font-size: 22px; font-weight: 900; color: #1e3a8a; letter-spacing: -0.5px; }
    .school-meta { font-size: 11px; color: #64748b; margin-top: 4px; }
    .doc-title { font-size: 16px; font-weight: 800; color: #1e293b; margin-top: 16px; }
    .doc-sub { font-size: 11px; color: #64748b; margin-top: 3px; }
    .teacher-copy {
      display: inline-block;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 12px;
      border-radius: 6px;
      border: 1.5px solid #93c5fd;
      margin-top: 12px;
    }
    .meta-row { display: flex; gap: 40px; margin-bottom: 20px; font-size: 11px; }
    .meta-item label { font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-item span { color: #0f172a; font-weight: 600; margin-left: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: #1e3a8a; color: white; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 9px 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) td { background: #f8fafc; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
    .count-badge { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">${schoolName}</div>
    <div class="school-meta">Phone: ${schoolPhone} &nbsp;|&nbsp; Address: ${schoolAddress}</div>
    <div class="doc-title">Student Class Register — ${className}${subject ? ` (${subject})` : ''}</div>
    <div class="doc-sub">Generated on ${date}</div>
    <div class="teacher-copy">📋 Teacher's Copy — ${teacherName}</div>
  </div>

  <div class="meta-row">
    <div class="meta-item"><label>Class</label><span>${className}</span></div>
    <div class="meta-item"><label>Subject</label><span>${subject || '—'}</span></div>
    <div class="meta-item"><label>Term</label><span>${classInfo?.term || '—'}</span></div>
    <div class="meta-item"><label>Session</label><span>${classInfo?.academicYear || '—'}</span></div>
  </div>

  <div class="count-badge">${filtered.length} Students</div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Full Name</th>
        <th>Student ID</th>
        <th>Gender</th>
        <th>Status</th>
        <th>Performance</th>
        <th>Attendance</th>
        <th>Last Exam</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    <span>Teacher: ${teacherName} — ${subject || className}</span>
    <span>Total: ${filtered.length} students &nbsp;|&nbsp; ${date}</span>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  if (isLoading) {
    return <TabSkeleton tabId="students" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-10 bg-rose-500/5 rounded-[3rem] border border-dashed border-rose-500/20 text-center">
        <h3 className="text-xl font-black text-rose-500 mb-2">Failed to Load Students</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest max-w-sm">
          There was an error retrieving the enrollment list. Please try again.
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-4">
      {/* Student Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        <button
          type="button"
          onClick={() => { setSelectedStatusTab('ALL'); setCurrentPage(1); }}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
            selectedStatusTab === 'ALL'
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800"
          )}
        >
          <span>All Students</span>
          <span className={cn(
            "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
            selectedStatusTab === 'ALL'
              ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
              : "bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200"
          )}>
            {statusCounts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedStatusTab('ENROLLED'); setCurrentPage(1); }}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
            selectedStatusTab === 'ENROLLED'
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200/60 dark:border-emerald-800/50"
          )}
        >
          <span>Enrolled</span>
          <span className={cn(
            "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
            selectedStatusTab === 'ENROLLED'
              ? "bg-white/25 text-white"
              : "bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200"
          )}>
            {statusCounts.enrolled}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedStatusTab('GRADUATED'); setCurrentPage(1); }}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
            selectedStatusTab === 'GRADUATED'
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200/60 dark:border-purple-800/50"
          )}
        >
          <span>Graduated</span>
          <span className={cn(
            "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
            selectedStatusTab === 'GRADUATED'
              ? "bg-white/25 text-white"
              : "bg-purple-100 dark:bg-purple-900/80 text-purple-800 dark:text-purple-200"
          )}>
            {statusCounts.graduated}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedStatusTab('EXPELLED'); setCurrentPage(1); }}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
            selectedStatusTab === 'EXPELLED'
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200/60 dark:border-rose-800/50"
          )}
        >
          <span>Expelled</span>
          <span className={cn(
            "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
            selectedStatusTab === 'EXPELLED'
              ? "bg-white/25 text-white"
              : "bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200"
          )}>
            {statusCounts.expelled}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setSelectedStatusTab('TRANSFERRED'); setCurrentPage(1); }}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5",
            selectedStatusTab === 'TRANSFERRED'
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200/60 dark:border-amber-800/50"
          )}
        >
          <span>Transferred</span>
          <span className={cn(
            "px-1.5 py-0.2 rounded-full text-[10px] font-extrabold",
            selectedStatusTab === 'TRANSFERRED'
              ? "bg-white/25 text-white"
              : "bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200"
          )}>
            {statusCounts.transferred}
          </span>
        </button>
      </div>

      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onExport={handleExport}
        filters={filters}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {allStudents.length} Total
        </div>
        {filtered.length !== allStudents.length && (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-600/5 px-3 py-1.5 rounded-full border border-emerald-600/10">
            {filtered.length} Matching filters
          </div>
        )}
      </div>

      {/* Table / Grid */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[28vh] rounded-[2rem] border border-dashed border-slate-200 dark:border-emerald-800/50 p-10 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-slate-400">No students match your filters</p>
          <button
            onClick={() => { handleSearchChange(''); handleFilterChange({ gender: '', status: '', performance: '' }); }}
            className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-600 underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <StudentTable 
          students={paginated} 
          onView={(student) => router.push(`/dashboard/teacher/students/${student.id}`)} 
          onCall={() => {}} 
          viewMode={viewMode} 
          startIndex={(currentPage - 1) * itemsPerPage} 
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );
}