"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Subject, CreateSubjectDTO } from "../services/subjectService"
import { departmentService, Department } from "../../departments/services/departmentService"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { apiClient } from "@/lib/api/client"
import { toast } from "react-toastify"
import { useSchoolTeachers } from "@/lib/api/hooks/useSchool"

interface SubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  subject?: Subject | null
}

const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subject,
}) => {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description?: string;
    departmentIds: string[];
    teacherIds: string[];
    scope: "SCHOOL";
  }>({
    name: "",
    code: "",
    description: "",
    departmentIds: [],
    teacherIds: [],
    scope: "SCHOOL",
  })

  const { user } = useAuthStore()
  
  // Get schoolId for teachers fetch
  const [schoolId, setSchoolId] = useState<string>("");
  
  useEffect(() => {
    const checkStatus = async () => {
      if (user?.email) {
        const res = await apiClient.get(`/admin/admin-status/${user.email}`);
        setSchoolId(res.data.data.schoolAdmins?.[0]?.schoolId || "");
      }
    };
    checkStatus();
  }, [user?.email]);

  const { data: schoolTeachers = [] } = useSchoolTeachers(schoolId);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments()
      if (subject) {
        setFormData({
          name: subject.name,
          code: subject.code,
          description: subject.description || "",
          departmentIds: subject.departments?.map((d: any) => d.departmentId) || [],
          teacherIds: (subject as any).teacherSubjects?.map((ts: any) => ts.teacherId) || [],
          scope: "SCHOOL",
        })
      } else {
        setFormData({
          name: "",
          code: "",
          description: "",
          departmentIds: [],
          teacherIds: [],
          scope: "SCHOOL",
        })
      }
    }
  }, [isOpen, subject])

  const fetchDepartments = async () => {
    try {
        // We need schoolId. For admin, we get it from status check
        const statusRes = await apiClient.get(`/admin/admin-status/${user?.email}`);
        const schoolId = statusRes.data.data.schoolAdmins?.[0]?.schoolId;
        if (schoolId) {
            const deps = await departmentService.getDepartments(schoolId);
            setDepartments(deps);
        }
    } catch (error) {
        console.error("Failed to fetch departments", error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const statusRes = await apiClient.get(`/admin/admin-status/${user?.email}`);
      const schoolId = statusRes.data.data.schoolAdmins?.[0]?.schoolId;

      if (!schoolId) {
        toast.error("School context not found. Please try logging in again.");
        return;
      }

      let savedSubject;
      const { departmentIds, ...subjectData } = formData;

      if (subject) {
        const response = await apiClient.patch(`/academic/subjects/${subject.id}`, {
          ...subjectData,
          scope: "SCHOOL",
        });
        savedSubject = response.data.data;
        toast.success("Subject updated successfully!");
      } else {
        const response = await apiClient.post("/academic/subjects", {
          ...subjectData,
          schoolId,
          scope: "SCHOOL",
        });
        savedSubject = response.data.data;
        toast.success("Subject created successfully!");
      }

      // If departments are selected, link the subject to them
      if (formData.departmentIds.length > 0 && savedSubject?.id) {
        try {
            await apiClient.post(`/academic/subjects/${savedSubject.id}/departments`, {
                departmentIds: formData.departmentIds,
            });
        } catch (attachErr) {
            console.error("Failed to link subject to departments", attachErr);
            toast.warning("Subject created, but failed to link to all selected departments.");
        }
      }

      // If teachers are selected, link them
      if (formData.teacherIds.length > 0 && savedSubject?.id) {
        try {
            await apiClient.post(`/academic/subjects/${savedSubject.id}/teachers`, {
                teacherIds: formData.teacherIds,
                schoolId,
            });
        } catch (attachErr) {
            console.error("Failed to link subject to teachers", attachErr);
            toast.warning("Subject created, but failed to link to all selected teachers.");
        }
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Failed to save subject", error)
      const message = error.response?.data?.message || "Failed to save subject";
      toast.error(message);
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
          <DialogTitle className="text-2xl font-black font-headline text-slate-900 dark:text-white">
            {subject ? "Edit Subject" : "Create New Subject"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Subject Name
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. Quantum Mechanics"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Subject Code
              </Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. PHY-501"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Departments
            </Label>
            <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-transparent focus-within:border-blue-500/30 transition-all">
                {departments.length === 0 ? (
                    <div className="col-span-2 py-4 text-center text-xs text-slate-400 italic">
                        No departments found. Create one first.
                    </div>
                ) : (
                    departments.map((dep) => {
                        const isSelected = formData.departmentIds.includes(dep.id);
                        return (
                            <div 
                                key={dep.id}
                                onClick={() => {
                                    const newIds = isSelected 
                                        ? formData.departmentIds.filter(id => id !== dep.id)
                                        : [...formData.departmentIds, dep.id];
                                    setFormData({ ...formData, departmentIds: newIds });
                                }}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border
                                    ${isSelected 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'}
                                `}
                            >
                                <div className={`
                                    w-4 h-4 rounded border flex items-center justify-center transition-all
                                    ${isSelected 
                                        ? 'bg-blue-600 border-blue-600' 
                                        : 'border-slate-300 dark:border-slate-600'}
                                `}>
                                    {isSelected && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
                                </div>
                                <span className={`text-xs font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {dep.name}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
            {formData.departmentIds.length > 0 && (
                <p className="text-[10px] text-blue-600 font-medium">
                    {formData.departmentIds.length} department(s) selected
                </p>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Assign Teachers
            </Label>
            <div className="grid grid-cols-2 gap-3 max-h-[150px] overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-transparent focus-within:border-blue-500/30 transition-all">
                {schoolTeachers.length === 0 ? (
                    <div className="col-span-2 py-4 text-center text-xs text-slate-400 italic">
                        No teachers found.
                    </div>
                ) : (
                    schoolTeachers.map((teacher: any) => {
                        const isSelected = formData.teacherIds.includes(teacher.id);
                        return (
                            <div 
                                key={teacher.id}
                                onClick={() => {
                                    const newIds = isSelected 
                                        ? formData.teacherIds.filter(id => id !== teacher.id)
                                        : [...formData.teacherIds, teacher.id];
                                    setFormData({ ...formData, teacherIds: newIds });
                                }}
                                className={`
                                    flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border
                                    ${isSelected 
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'}
                                `}
                            >
                                <div className={`
                                    w-4 h-4 rounded border flex items-center justify-center transition-all
                                    ${isSelected 
                                        ? 'bg-blue-600 border-blue-600' 
                                        : 'border-slate-300 dark:border-slate-600'}
                                `}>
                                    {isSelected && <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                                        {teacher.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500 uppercase">{teacher.teacherCode}</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {formData.teacherIds.length > 0 && (
                <p className="text-[10px] text-blue-600 font-medium">
                    {formData.teacherIds.length} teacher(s) selected
                </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Provide a brief overview of the subject scope and objectives..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-blue-600">
                  visibility
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  School-wide Scope
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Visible only to your school and departments
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full uppercase tracking-tighter">
                Default
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-4 pt-4 border-t dark:border-slate-800 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
            >
              {loading ? "Saving..." : subject ? "Update Subject" : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SubjectModal
