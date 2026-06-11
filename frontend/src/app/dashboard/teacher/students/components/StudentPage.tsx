'use client';

import { useState } from 'react';
import Header from './Header';
import ControlsBar from './ControlsBar';
import StudentGrid from './StudentGrid';
import Pagination from './Pagination';
import QuickAttendanceModal from './QuickAttendanceModal';
import { useToast } from "@/lib/hooks/useToast";
import { teacherService } from "@/lib/api/services/teacherService";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";


const StudentPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const { loading, error, success } = useToast();
  const { selectedSchoolId, selectedSchoolName } = useDashboardStore();
  const { user } = useAuthStore();

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
        limit: 1000, // fetch up to 1000 for export
      });

      if (!result?.students || result.students.length === 0) {
        loading.update(toastId, "No students found to export.", "error");
        return;
      }

      // Convert to CSV
      const headers = ["ID", "Name", "Student Code", "Email", "Gender", "Status", "Grade", "Performance", "Attendance", "Last Exam"];
      const csvData = result.students.map((s: any) => [
        s.id,
        `"${s.name}"`,
        s.studentCode,
        s.email,
        s.gender,
        s.status,
        `"${s.grade}"`,
        s.performance,
        `${s.attendance}%`,
        `"${s.lastExam}"`
      ]);

      const csvContent = [headers.join(","), ...csvData.map((row: any) => row.join(","))].join("\n");
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
        error.show("Failed to export students");
      }
    }
  };

  // Reset to first page on search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };
  
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setCurrentPage(1);
  };

  return (
    <div className="font-display bg-background-light dark:bg-background-dark">
      <div className="relative flex min-h-screen w-full flex-row">
        
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <Header onQuickAttendance={() => setIsAttendanceModalOpen(true)} onExport={handleExport} />
            <ControlsBar 
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              selectedClassId={selectedClassId}
              onClassChange={handleClassChange}
            />
            <StudentGrid 
              page={currentPage}
              searchQuery={searchQuery}
              selectedClassId={selectedClassId}
              limit={itemsPerPage}
              onDataLoaded={(total: number) => setTotalItems(total)}
            />
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
            />
          </div>
        </main>
      </div>
      
      {isAttendanceModalOpen && (
        <QuickAttendanceModal 
          onClose={() => setIsAttendanceModalOpen(false)} 
          onSuccess={() => {
            // Optionally refresh the student grid if needed to show updated attendance percentages
          }}
        />
      )}
    </div>
  );
};


export default StudentPage;
