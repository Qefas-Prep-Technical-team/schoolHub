"use client";

import React, { useState } from 'react'
import { StudentProfile, studentService } from '@/lib/api/services/studentService'
import { departmentService } from '@/app/dashboard/admin/departments/services/departmentService'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'react-toastify'
import { User, ShieldCheck, Mail, Building2, Edit2, Key, MessageSquare, AlertCircle } from 'lucide-react'

export default function StudentHeroCard({ student }: { student: StudentProfile }) {
  const queryClient = useQueryClient();
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(student.departmentId || "");

  // Fetch departments for the school
  const { data: departments = [] } = useQuery({
    queryKey: ['school-departments', student.schoolId],
    queryFn: () => departmentService.getDepartments(student.schoolId!),
    enabled: !!student.schoolId && isDeptDialogOpen,
  });

  const updateDeptMutation = useMutation({
    mutationFn: (deptId: string) => studentService.updateDepartmentByAdmin(student.id, deptId),
    onSuccess: () => {
      toast.success("Student department updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-student-profile', student.id] });
      setIsDeptDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update department");
    }
  });

  const handleDeptUpdate = () => {
    if (!selectedDeptId) {
      toast.error("Please select a department");
      return;
    }
    updateDeptMutation.mutate(selectedDeptId);
  };

  return (
    <div className="w-full lg:w-80 flex-shrink-0 animate-in slide-in-from-left-4 duration-500">
      <div className="sticky top-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
               {student.profileImage ? (
                 <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
               ) : (
                 <User size={48} strokeWidth={1.5} />
               )}
            </div>
            {student.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-2xl border-4 border-white dark:border-slate-900 shadow-md">
                <ShieldCheck size={18} />
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {student.name}
            </h2>
            <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg text-xs font-mono">
                #{student.studentCode}
              </span>
              <span>•</span>
              <span className="text-sm font-bold uppercase tracking-wider text-slate-400">
                {student.role}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Email</div>
             <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200 break-all">
               <Mail size={14} className="shrink-0 text-slate-400" />
               {student.email}
             </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
             <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 underline decoration-indigo-200 decoration-2 underline-offset-4">Department</div>
             <div className="flex items-center justify-between gap-2 mt-2">
               <div className="flex items-center gap-2 text-sm font-black text-indigo-700 dark:text-indigo-300">
                 <Building2 size={16} />
                 {student.department?.name || "Unassigned"}
               </div>
               
               <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                 <DialogTrigger asChild>
                   <Button variant="ghost" size="sm" className="h-8 px-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-500">
                     <Edit2 size={14} />
                   </Button>
                 </DialogTrigger>
                 <DialogContent className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-2xl">
                   <DialogHeader>
                     <DialogTitle className="text-2xl font-black tracking-tight">Change Department</DialogTitle>
                     <DialogDescription className="text-base">
                       Assign {student.name} to a different academic department. 
                       <div className="flex gap-2 items-center mt-3 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs leading-relaxed font-bold italic">
                         <AlertCircle size={14} className="shrink-0" />
                         This will notify the student, their parents, and relevant teachers.
                       </div>
                     </DialogDescription>
                   </DialogHeader>
                   <div className="py-6 space-y-4">
                      <div className="space-y-2">
                         <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">New Department</label>
                         <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                           <SelectTrigger className="h-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all text-base font-medium">
                             <SelectValue placeholder="Select a department" />
                           </SelectTrigger>
                           <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                             {departments.map((dept) => (
                               <SelectItem 
                                 key={dept.id} 
                                 value={dept.id}
                                 className="rounded-xl my-1 focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer"
                               >
                                  <div className="flex flex-col py-1">
                                    <span className="font-bold">{dept.name}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">{dept.code}</span>
                                  </div>
                               </SelectItem>
                             ))}
                           </SelectContent>
                         </Select>
                      </div>
                   </div>
                   <DialogFooter className="gap-2 sm:gap-0">
                     <Button 
                       variant="ghost" 
                       onClick={() => setIsDeptDialogOpen(false)}
                       className="h-12 rounded-2xl font-bold px-6"
                     >
                       Cancel
                     </Button>
                     <Button 
                       onClick={handleDeptUpdate}
                       disabled={updateDeptMutation.isPending}
                       className="h-12 rounded-2xl bg-primary text-white font-black px-8 shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                     >
                       {updateDeptMutation.isPending ? "Updating..." : "Confirm Change"}
                     </Button>
                   </DialogFooter>
                 </DialogContent>
               </Dialog>
             </div>
          </div>
        </div>

        <div className="flex flex-col w-full gap-3 mt-8">
          <Button variant="outline" className="h-12 rounded-2xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 group">
            <Edit2 size={16} className="mr-2 group-hover:scale-110 transition-transform" />
            Edit Profile
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 group">
            <Key size={16} className="mr-2 group-hover:scale-110 transition-transform" />
            Reset Password
          </Button>
          <Button className="h-14 rounded-2xl bg-primary text-white font-black shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 group">
            <MessageSquare size={18} className="mr-2 group-hover:-translate-y-0.5 transition-transform" />
            Message Parent
          </Button>
        </div>
      </div>
    </div>
  )
}