'use client';

import { useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Toolbar, StudentFilters } from './components/Toolbar';
import { StudentTable } from './components/StudentTable';
import { Pagination } from './components/Pagination';
import { Student } from './components/types';
import { teacherService } from '@/lib/api/services/teacherService';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filters, setFilters] = useState<StudentFilters>({ gender: '', status: '', performance: '' });
  const itemsPerPage = 10;

  const { data: classDetailData } = useQuery({
    queryKey: ['class-detail', classId],
    queryFn: () => teacherService.getClassDetail(classId),
    enabled: !!classId,
  });

  const classInfo = classDetailData?.classInfo;
  const schoolInfo = (user as any)?.school;

  const { data, isLoading, error } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => teacherService.getStudents({ classId, page: 1, limit: 500 }),
    enabled: !!classId,
  });

  const allStudents: Student[] = useMemo(() => (data?.students ?? []).map((s: {
    id: string; name: string; studentCode?: string; email?: string;
    gender?: string; status?: string; avatarUrl?: string;
    performance?: string; attendance?: number; grade?: string; lastExam?: string;
  }) => ({
    id: s.id,
    name: s.name,
    studentId: `#${(s.studentCode || s.id).slice(-6).toUpperCase()}`,
    studentCode: s.studentCode,
    email: s.email,
    gender: (s.gender?.toLowerCase() as Student['gender']) || 'male',
    status: (s.status?.toLowerCase() as Student['status']) || 'active',
    avatar: s.avatarUrl,
    performance: s.performance || 'Medium',
    attendance: s.attendance ?? 100,
    grade: s.grade,
    lastExam: s.lastExam,
  })), [data]);

  const filtered = useMemo(() => allStudents.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (!q || s.name.toLowerCase().includes(q) || (s.studentCode || s.studentId).toLowerCase().includes(q)) &&
      (!filters.gender || s.gender === filters.gender) &&
      (!filters.status || s.status === filters.status) &&
      (!filters.performance || s.performance === filters.performance)
    );
  }), [allStudents, searchQuery, filters]);

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
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
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
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-9 w-28 rounded-xl" />)}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
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
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
            {filtered.length} Matching filters
          </div>
        )}
      </div>

      {/* Table / Grid */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[28vh] rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center">
          <p className="text-sm font-black uppercase tracking-widest text-slate-400">No students match your filters</p>
          <button
            onClick={() => { handleSearchChange(''); handleFilterChange({ gender: '', status: '', performance: '' }); }}
            className="mt-3 text-[10px] font-black uppercase tracking-widest text-primary underline underline-offset-4"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <StudentTable 
          students={paginated} 
          onView={() => {}} 
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