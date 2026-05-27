"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/lib/api/services/adminService";
import { 
  GraduationCap, 
  UserPlus, 
  Search, 
  Filter, 
  Download,
  Users,
  ShieldCheck,
  Activity,
  Zap,
  ArrowRight,
  TrendingUp,
  Globe,
  Cpu,
  LayoutGrid,
  List,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StudentsTable from "./components/StudentsTable";
import AddStudentDialog from "./components/AddStudentDialog";
import FilterChips from "./components/FilterChips";
import { cn } from "@/lib/utils";

export default function StudentsPage() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    classId: "",
    gender: "",
    status: "",
  });

  useEffect(() => {
    if (searchParams.get('showAdd') === 'true') {
      setOpen(true);
    }
  }, [searchParams]);

  const { data: studentStats } = useQuery({
    queryKey: ["school-students-stats", schoolId],
    queryFn: () => adminService.getSchoolStudents(schoolId!, 1, 1),
    enabled: !!schoolId,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const stats = [
    { 
        label: 'Total Students', 
        value: studentStats?.total || 0, 
        icon: GraduationCap, 
        color: primaryColor,
        desc: 'Registered Students'
    },
    { 
        label: 'Verified Students', 
        value: studentStats?.total || 0, 
        icon: ShieldCheck, 
        color: '#10b981', // Emerald
        desc: 'Active Accounts'
    },
    { 
        label: 'Attendance Rate', 
        value: '89%', 
        icon: Activity, 
        color: '#2563eb', // Indigo
        desc: 'Average Attendance'
    },
    { 
        label: 'Pending Students', 
        value: '14', 
        icon: Zap, 
        color: '#f59e0b', // Amber
        desc: 'Awaiting Enrollment'
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Student Management</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Students<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Manage your school students, track their academic progress, and verify new enrollments.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              style={{ backgroundColor: primaryColor }}
              className="h-16 px-10 rounded-[2rem] text-white font-black uppercase tracking-widest gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
              onClick={() => setOpen(true)}
            >
              <UserPlus size={20} strokeWidth={3} />
              Add New Student
            </Button>
          </div>
        </div>

        {/* Analytics Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
                <div 
                    key={index}
                    className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group"
                >
                    <div 
                        className="absolute -right-6 -bottom-6 size-40 rounded-full blur-3xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none" 
                        style={{ backgroundColor: stat.color }}
                    />
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div 
                                className="size-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-500 group-hover:scale-110"
                                style={{ 
                                    backgroundColor: `${stat.color}10`,
                                    borderColor: `${stat.color}20`,
                                    color: stat.color
                                }}
                            >
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <TrendingUp size={10} /> Live
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{stat.value}</h3>
                            <p className="text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest flex items-center gap-2">
                                <Target size={12} className="text-slate-300" /> {stat.desc}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

            <div className="flex flex-wrap items-center justify-between gap-6 p-4 rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                <div className="relative group flex-1 max-w-xl">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
                    <input 
                        type="text" 
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full h-16 pl-16 pr-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[2rem] focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                        style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                    />
                </div>
                
                <div className="flex items-center gap-4">
                     <FilterChips selectedFilters={filters} onFilterChange={handleFilterChange} />
                     <Button 
                       onClick={async () => {
                         try {
                           const result = await adminService.getSchoolStudents(schoolId!, 1, 10000, searchTerm, filters);
                           const studentsToDownload = result?.data || [];
                           if (studentsToDownload.length === 0) return;
                           
                           const headers = ["Student Name", "Email", "Student Code", "Class", "Department", "Verification Status"];
                           const csvContent = [
                             headers.join(","),
                             ...studentsToDownload.map((student: any) => [
                               `"${student.name || ''}"`,
                               `"${student.email || ''}"`,
                               `"${student.studentCode || 'UNASSIGNED'}"`,
                               `"${student.classes?.[0]?.class?.name || ''} ${student.classes?.[0]?.class?.section || ''}"`,
                               `"${student.department?.name || ''}"`,
                               `"${student.verified ? 'Verified' : 'Pending'}"`
                             ].join(","))
                           ].join("\n");
                           
                           const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                           const url = URL.createObjectURL(blob);
                           const link = document.createElement("a");
                           link.setAttribute("href", url);
                           link.setAttribute("download", `students_export_${new Date().toISOString().split('T')[0]}.csv`);
                           document.body.appendChild(link);
                           link.click();
                           document.body.removeChild(link);
                         } catch (error) {
                           console.error("Failed to download students:", error);
                         }
                       }}
                       variant="outline" 
                       className="h-16 px-6 sm:px-8 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 font-black uppercase tracking-widest gap-3 flex hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                     >
                        <Download size={22} strokeWidth={3} className="text-slate-400" />
                     </Button>
                </div>
            </div>
            <div className="rounded-[4rem] bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 p-2 shadow-2xl overflow-hidden">
                <StudentsTable 
                  searchTerm={searchTerm} 
                  filters={filters} 
                  page={page}
                  onPageChange={setPage}
                />
            </div>

        <AddStudentDialog open={open} onOpenChange={setOpen} />
      </div>
    </div>
  );
}

