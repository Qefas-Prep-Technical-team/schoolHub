"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/services/adminService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Hash, 
  BookOpen, 
  MoreVertical, 
  Eye, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusChipProps {
  status: boolean;
  themeColor: string;
}

const StatusChip = ({ status, themeColor }: StatusChipProps) => {
  const isActive = status;
  return (
    <div className="flex items-center gap-2">
      <div className={cn("size-2 rounded-full", isActive ? 'bg-green-500' : 'bg-primary')} />
      <span className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? 'text-green-600' : 'text-primary')}>
        {isActive ? 'Verified' : 'Pending'}
      </span>
    </div>
  );
};

interface StudentsTableProps {
  searchTerm: string;
  filters: {
    classId: string;
    gender: string;
    status: string;
  };
  page: number;
  onPageChange: (page: number) => void;
}

export default function StudentsTable({ searchTerm, filters, page, onPageChange }: StudentsTableProps) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId;
  const { data: settings } = useSchoolSettings(schoolId!);
  const primaryColor = settings?.themeColor || '#2563eb';
  
  const [selectAll, setSelectAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["school-students", schoolId, searchTerm, filters, page],
    queryFn: () => adminService.getSchoolStudents(schoolId!, page, 1000, searchTerm, filters),
    enabled: !!schoolId,
  });

  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;
  const students = data?.data || [];

  const verifyMutation = useMutation({
    mutationFn: (studentId: string) => adminService.verifyStudent(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-students"] });
      queryClient.invalidateQueries({ queryKey: ["links"] });
      toast.success("Student successfully authorized!", { theme: "colored" });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to authorize student.");
    }
  });

  const handleVerify = (e: React.MouseEvent, studentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    verifyMutation.mutate(studentId);
  };

  const toggleSelect = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((existingId) => existingId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s: any) => s.id));
    }
    setSelectAll(!selectAll);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 bg-slate-950/40 rounded-[3.5rem] backdrop-blur-3xl border border-white/5">
        <div className="flex items-center justify-between mb-8 px-10">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-3 w-24 rounded-full bg-white/5" />
          ))}
        </div>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-8 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" 
              style={{ backgroundSize: '200% 100%' }}
            />
            <Skeleton className="size-6 rounded-lg bg-white/5" />
            <div className="flex items-center gap-6 flex-1">
              <Skeleton className="size-16 rounded-2xl bg-white/10" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-48 rounded-lg bg-white/10" />
                <Skeleton className="h-3 w-32 rounded-full bg-white/5" />
              </div>
            </div>
            <Skeleton className="h-4 w-28 rounded-full bg-white/5" />
            <Skeleton className="h-4 w-36 rounded-full bg-white/5" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-28 rounded-2xl bg-white/10" />
              <Skeleton className="size-12 rounded-2xl bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-20 text-center rounded-[3.5rem] bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-xs">
        Failed to synchronize student registry. Re-initializing connection...
      </div>
    );
  }

  return (
    <div className="rounded-[3.5rem] bg-white dark:bg-slate-900/50 backdrop-blur-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-3xl">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/5">
              <th className="p-8 w-10">
                <input
                  type="checkbox"
                  className="size-5 rounded-lg border-2 border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                  style={{ accentColor: primaryColor }}
                  checked={selectAll}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
              <th className="p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Code</th>
              <th className="p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Class</th>
              <th className="p-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Status</th>
              <th className="p-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {students.map((student: any) => {
              const isSelected = selectedIds.includes(student.id);
              const studentClass = student.classes?.[0]?.class;
              
              return (
                <tr
                  key={student.id}
                  className={cn(
                    "group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all cursor-pointer",
                    isSelected && "bg-opacity-10"
                  )}
                  style={isSelected ? { backgroundColor: `${primaryColor}10` } : {}}
                >
                  <td className="p-8">
                    <input
                      type="checkbox"
                      className="size-5 rounded-lg border-2 border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                      style={{ accentColor: primaryColor }}
                      checked={isSelected}
                      onChange={(e) => toggleSelect(e, student.id)}
                    />
                  </td>
                  <td className="p-8">
                    <Link href={`/dashboard/admin/students/${student.id}`} className="flex items-center gap-5">
                      <div className="relative">
                        <div className="size-14 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg relative group-hover:scale-105 transition-transform duration-500">
                          {student.profileImage ? (
                            <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                               <User size={24} />
                            </div>
                          )}
                        </div>
                        {student.verified && (
                          <div className="absolute -bottom-1 -right-1 size-5 bg-blue-500 rounded-lg border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-white">
                             <ShieldCheck size={10} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p 
                          className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg transition-colors"
                          style={{ color: 'inherit' }}
                        >
                          <span className="group-hover:text-primary" style={{ '--primary': primaryColor } as any}>{student.name}</span>
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{student.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="p-8">
                    <code className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg uppercase tracking-widest">
                      {student.studentCode || 'UNASSIGNED'}
                    </code>
                  </td>
                  <td className="p-8">
                    <div className="flex flex-col gap-1">
                      {studentClass ? (
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                          <BookOpen size={14} />
                          {studentClass.name} {studentClass.section}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">No Class Path</span>
                      )}
                      {student.department && (
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                          {student.department.name}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-8">
                    <StatusChip status={student.verified} themeColor={primaryColor} />
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!student.verified && (
                        <Button 
                          onClick={(e) => handleVerify(e, student.id)}
                          disabled={verifyMutation.isPending}
                          style={{ backgroundColor: primaryColor }}
                          className="h-10 px-4 rounded-xl text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all border-none"
                        >
                          {verifyMutation.isPending && verifyMutation.variables === student.id ? "Syncing..." : "Authorize"}
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-12 rounded-2xl hover:bg-opacity-10 transition-all"
                        style={{ color: primaryColor }}
                      >
                        <MoreVertical size={20} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden flex flex-col space-y-4 p-4">
        {students.map((student: any) => {
          const isSelected = selectedIds.includes(student.id);
          const studentClass = student.classes?.[0]?.class;
          
          return (
            <div 
              key={student.id} 
              className={cn(
                "bg-white dark:bg-slate-900/60 p-5 rounded-3xl border shadow-sm flex flex-col gap-4 relative transition-all",
                isSelected ? "border-primary" : "border-slate-200 dark:border-slate-800"
              )}
              style={isSelected ? { backgroundColor: `${primaryColor}05`, borderColor: primaryColor } : {}}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    className="size-5 shrink-0 rounded-lg border-2 border-slate-200 dark:border-white/10 transition-all cursor-pointer"
                    style={{ accentColor: primaryColor }}
                    checked={isSelected}
                    onChange={(e) => toggleSelect(e, student.id)}
                  />
                  <div className="relative shrink-0">
                    <div className="size-10 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                      {student.profileImage ? (
                        <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                           <User size={18} />
                        </div>
                      )}
                    </div>
                    {student.verified && (
                      <div className="absolute -bottom-1 -right-1 size-3.5 bg-blue-500 rounded-lg border-2 border-white dark:border-slate-900 shadow-md flex items-center justify-center text-white">
                         <ShieldCheck size={7} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 pr-2">
                    <Link href={`/dashboard/admin/students/${student.id}`}>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{student.name}</h4>
                    </Link>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{student.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <StatusChip status={student.verified} themeColor={primaryColor} />
                  <code className="text-[8px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest max-w-[80px] truncate">
                    {student.studentCode || 'UNASSIGNED'}
                  </code>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Class</span>
                  {studentClass ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                      <BookOpen size={12} />
                      {studentClass.name} {studentClass.section}
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">None</span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2">
                  {!student.verified && (
                    <Button 
                      onClick={(e) => handleVerify(e, student.id)}
                      disabled={verifyMutation.isPending}
                      style={{ backgroundColor: primaryColor }}
                      className="h-8 px-3 rounded-lg text-white font-black text-[9px] uppercase tracking-widest shadow-md"
                    >
                      {verifyMutation.isPending && verifyMutation.variables === student.id ? "Syncing..." : "Authorize"}
                    </Button>
                  )}
                  <Link href={`/dashboard/admin/students/${student.id}`}>
                    <Button 
                      variant="outline"
                      className="h-8 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest"
                      style={{ color: primaryColor, borderColor: `${primaryColor}30` }}
                    >
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {students.length === 0 && (
        <div className="p-20 text-center space-y-6">
          <div className="size-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-slate-400">
            <GraduationCap size={40} />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Students Found</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Distribute your institutional code to initiate secure links.</p>
          </div>
        </div>
      )}

      {/* Pagination Terminal */}
      {totalItems > 0 && (
        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50 dark:bg-white/[0.01]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Displaying <span className="text-slate-900 dark:text-white">{(page - 1) * 1000 + 1} - {Math.min(page * 1000, totalItems)}</span> of <span className="text-slate-900 dark:text-white">{totalItems}</span> students
          </p>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="size-12 rounded-2xl border-2 border-slate-200 dark:border-white/10 transition-all bg-white dark:bg-slate-900"
              style={{ borderColor: page === 1 ? undefined : `${primaryColor}30` }}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={20} />
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "ghost"}
                    className={cn(
                      "size-12 rounded-2xl font-black text-xs transition-all",
                      p === page 
                        ? "shadow-xl text-white" 
                        : "text-slate-400 hover:bg-opacity-10"
                    )}
                    style={p === page ? { backgroundColor: primaryColor } : { color: 'inherit' }}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="size-12 rounded-2xl border-2 border-slate-200 dark:border-white/10 transition-all bg-white dark:bg-slate-900"
              style={{ borderColor: page === totalPages ? undefined : `${primaryColor}30` }}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


