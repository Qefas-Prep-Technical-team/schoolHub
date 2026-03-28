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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Class, classService } from "../services/classService"
import { subjectService, Subject } from "../../subjects/services/subjectService"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { apiClient } from "@/lib/api/client"
import { toast } from "react-toastify"

interface ClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  classItem?: Class | null
}

interface Teacher {
  id: string
  name: string
  email: string
}

const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classItem,
}) => {
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    teacherId: "",
    selectedSubjectIds: [] as string[],
  })

  const { user } = useAuthStore()

  useEffect(() => {
    if (isOpen) {
      fetchInitialData()
      if (classItem) {
        setFormData({
          name: classItem.name,
          section: classItem.section || "",
          teacherId: classItem.teacherId || "",
          selectedSubjectIds: classItem.subjects?.map(s => s.subject.id) || [],
        })
      } else {
        setFormData({
          name: "",
          section: "",
          teacherId: "",
          selectedSubjectIds: [],
        })
      }
    }
  }, [isOpen, classItem])

  const fetchInitialData = async () => {
    try {
      const statusRes = await apiClient.get(`/admin/admin-status/${user?.email}`);
      const schoolId = statusRes.data.data.schoolAdmins?.[0]?.schoolId;
      
      if (schoolId) {
        const [teachersData, subjectsData] = await Promise.all([
          classService.getSchoolTeachers(schoolId),
          subjectService.getSubjects(schoolId)
        ])
        setTeachers(teachersData)
        setSubjects(subjectsData)
      }
    } catch (error) {
      console.error("Failed to fetch initial data", error)
      toast.error("Failed to load teachers or subjects")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const statusRes = await apiClient.get(`/admin/admin-status/${user?.email}`);
      const schoolId = statusRes.data.data.schoolAdmins?.[0]?.schoolId;

      if (!schoolId) {
        toast.error("School context not found");
        return;
      }

      if (classItem) {
        // Update class basic info
        await classService.updateClass(classItem.id, {
          name: formData.name,
          section: formData.section,
          teacherId: formData.teacherId || undefined,
        });

        // Update subjects (this is a separate call in our service, but let's assume updateClass handles it or we call it)
        // If we need to replace subjects, we might need a replaceSubjects endpoint
        // For now, let's just use attachSubjects if that's what we have
        if (formData.selectedSubjectIds.length > 0) {
            await classService.attachSubjects(classItem.id, formData.selectedSubjectIds);
        }

        toast.success("Class updated successfully!");
      } else {
        // Create class
        await classService.createClass({
          name: formData.name,
          section: formData.section,
          scope: "SCHOOL",
          schoolId,
          subjectIds: formData.selectedSubjectIds,
        });
        toast.success("Class created successfully!");
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Failed to save class", error)
      toast.error(error.response?.data?.message || "Failed to save class")
    } finally {
      setLoading(false)
    }
  }

  const toggleSubject = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjectIds: prev.selectedSubjectIds.includes(subjectId)
        ? prev.selectedSubjectIds.filter(id => id !== subjectId)
        : [...prev.selectedSubjectIds, subjectId]
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
          <DialogTitle className="text-2xl font-black font-headline text-slate-900 dark:text-white">
            {classItem ? "Edit Class" : "Create New Class"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-slate-900 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Class Name
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. Grade 10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Section / Arm
              </Label>
              <Input
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="e.g. A, Science, Blue"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Assign Homeroom Teacher
            </Label>
            <Select 
                value={formData.teacherId} 
                onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
            >
              <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all">
                <SelectValue placeholder="Select Teacher..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Teacher Assigned</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Select Subjects
            </Label>
            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              {subjects.map((subject) => (
                <div 
                  key={subject.id} 
                  onClick={() => toggleSubject(subject.id)}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                    formData.selectedSubjectIds.includes(subject.id) 
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    formData.selectedSubjectIds.includes(subject.id) 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {formData.selectedSubjectIds.includes(subject.id) && (
                      <span className="material-symbols-outlined text-[12px] text-white font-bold">
                        check
                      </span>
                    )}
                  </div>
                  <span className="text-sm truncate">{subject.name}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              Selected: {formData.selectedSubjectIds.length} subjects
            </p>
          </div>

          <DialogFooter className="flex items-center justify-end gap-4 pt-4 border-t dark:border-slate-800 mt-6 sticky bottom-0 bg-white dark:bg-slate-900">
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
              {loading ? "Saving..." : classItem ? "Update Class" : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ClassModal;
