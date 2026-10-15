'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, GraduationCap, CheckSquare, Activity } from 'lucide-react';
import Header from './Header';
import ControlsBar from './ControlsBar';
import StudentGrid from './StudentGrid';
import StudentList from './StudentList';
import Pagination from './Pagination';
import QuickAttendanceModal from './QuickAttendanceModal';
import { ViewType } from './ViewToggle';
import { useToast } from "@/lib/hooks/useToast";
import { teacherService } from "@/lib/api/services/teacherService";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { HeaderTooltip } from "@/app/dashboard/teacher/components/dashboard/HeaderTooltip";
import { Student } from "./types";

interface ExportStudent {
  id: string;
  name: string;
  studentCode?: string;
  email?: string;
  gender?: string;
  status?: string;
  grade?: string;
  performance?: string;
  attendance?: number;
  lastExam?: string;
}

const StudentPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [viewType, setViewType] = useState<ViewType>('List View');
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const { loading, error: toastError } = useToast();
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();

  // On mobile screens, make Grid View the default
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewType('Grid View');
    }
  }, []);

  const { data: dashboardStats } = useQuery({
    queryKey: ['teacher-dashboard-stats', selectedSchoolId],
    queryFn: () => teacherService.getDashboardStats(selectedSchoolId),
    staleTime: 1000 * 60 * 5,
  });

  const { data: classesData = [] } = useQuery({
    queryKey: ['teacher-classes', selectedSchoolId],
    queryFn: async () => {
      const isPersonal = selectedSchoolName === "Personal Dashboard" || selectedSchoolId === user?.id;
      const filterId = isPersonal ? undefined : selectedSchoolId;
      return await teacherService.getClasses(filterId ? { schoolId: filterId } : {});
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-students', selectedSchoolId, searchQuery, selectedClassId, currentPage, itemsPerPage],
    queryFn: async () => {
      const isPersonal = selectedSchoolName === "Personal Dashboard" || selectedSchoolId === user?.id;
      const filterId = isPersonal ? undefined : selectedSchoolId;
      const result = await teacherService.getStudents({
        schoolId: filterId || undefined,
        search: searchQuery || undefined,
        classId: selectedClassId || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });
      if (result?.total !== undefined) {
        setTotalItems(result.total);
      }
      return result;
    },
  });

  const students = data?.students || [];

  const handleExport = async () => {
    let toastId;
    try {
      toastId = loading.show("Preparing export...");
      const isPersonal = selectedSchoolName === "Personal Dashboard" || selectedSchoolId === user?.id;
      const filterId = isPersonal ? undefined : selectedSchoolId;
      
      const result = await teacherService.getStudents({
        schoolId: filterId || undefined,
        search: searchQuery || undefined,
        classId: selectedClassId || undefined,
        limit: 1000, 
      });

      if (!result?.students || result.students.length === 0) {
        loading.update(toastId, "No students found to export.", "error");
        return;
      }

      const headers = ["ID", "Name", "Student Code", "Email", "Gender", "Status", "Grade", "Performance", "Attendance", "Last Exam"];
      const csvData = result.students.map((s: ExportStudent) => [
        s.id,
        `"${s.name}"`,
        s.studentCode || '',
        s.email || '',
        s.gender || '',
        s.status || '',
        `"${s.grade || ''}"`,
        s.performance || '',
        `${s.attendance ?? 0}%`,
        `"${s.lastExam || ''}"`
      ]);

      const csvContent = [headers.join(","), ...csvData.map((row: string[]) => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `students_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      loading.update(toastId, "Export successful!", "success");
    } catch (err) {
      console.error("Export failed:", err);
      if (toastId) {
        loading.update(toastId, "Failed to export students", "error");
      } else {
        toastError.show("Failed to export students");
      }
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };
  
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentPage(1);
  };

  const totalClassesCount = dashboardStats?.stats?.totalClasses ?? (Array.isArray(classesData) ? classesData.length : 0);

  return (
    <div className="font-display bg-slate-50/50 dark:bg-transparent min-h-screen">
      <div className="relative flex min-h-screen w-full flex-row">
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="w-full space-y-6 sm:space-y-8">
            <Header onQuickAttendance={() => setIsAttendanceModalOpen(true)} onExport={handleExport} />

            {/* Top Stat Cards — 2 Columns on Mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <StatCard 
                label="Total Scholars" 
                value={(dashboardStats?.stats?.totalStudents ?? totalItems).toLocaleString()} 
                icon={Users} 
                color="text-emerald-500" 
                bgColor="bg-emerald-500/10" 
                tooltip="Total count of students currently enrolled across your assigned class rosters. Use this metric to verify your complete student reach and track enrolment coverage." 
              />
              <StatCard 
                label="Avg. Attendance" 
                value={`${dashboardStats?.stats?.attendanceRate ?? 95}%`} 
                icon={CheckSquare} 
                color="text-emerald-500" 
                bgColor="bg-emerald-500/10" 
                tooltip="Calculates cumulative attendance percentage across your active student directory. Use this to spot attendance decline early and trigger proactive check-ins." 
              />
              <StatCard 
                label="Academic Average" 
                value={`${dashboardStats?.stats?.averagePerformance ?? 78}%`} 
                icon={Activity} 
                color="text-blue-500" 
                bgColor="bg-blue-500/10" 
                tooltip="Aggregates the overall mean academic score across all student evaluations and coursework. Use this to gauge general comprehension across your curriculum." 
              />
              <StatCard 
                label="Active Cohorts" 
                value={totalClassesCount} 
                icon={GraduationCap} 
                color="text-purple-500" 
                bgColor="bg-purple-500/10" 
                tooltip="The total number of distinct class cohorts and grade levels currently assigned to you. Use the class filter below to isolate any specific cohort roster." 
              />
            </div>

            <ControlsBar 
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              selectedClassId={selectedClassId}
              onClassChange={handleClassChange}
              viewType={viewType}
              onViewChange={setViewType}
            />
            
            {viewType === 'List View' ? (
              <StudentList 
                students={students}
                isLoading={isLoading}
                error={error}
                searchQuery={searchQuery}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />
            ) : (
              <StudentGrid 
                students={students}
                isLoading={isLoading}
                error={error}
                searchQuery={searchQuery}
                limit={itemsPerPage}
              />
            )}
            
            {!isLoading && !error && students.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </main>
      </div>
      
      {isAttendanceModalOpen && (
        <QuickAttendanceModal 
          onClose={() => setIsAttendanceModalOpen(false)} 
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  bgColor, 
  tooltip 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ElementType; 
  color: string; 
  bgColor: string; 
  tooltip: string; 
}) {
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.01 }}
      className="p-3 sm:p-5 md:p-6 bg-white dark:bg-emerald-950/60 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-emerald-800/50 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`p-2 sm:p-3 md:p-3.5 rounded-lg sm:rounded-xl ${bgColor} ${color} transition-transform group-hover:scale-105 shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" strokeWidth={2.5} />
        </div>
        <HeaderTooltip content={tooltip} />
      </div>
      <div>
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-emerald-500 transition-colors line-clamp-1">{label}</p>
        <p className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5 sm:mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

export default StudentPage;
