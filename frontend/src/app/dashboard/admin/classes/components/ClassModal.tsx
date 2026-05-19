"use client"

import React, { useEffect, useState, useCallback } from "react"
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
import { classService, Class } from "../services/classService"
import { subjectService, Subject } from "../../subjects/services/subjectService"
import { departmentService, Department } from "../../departments/services/departmentService"
import { schoolService } from "@/lib/api/services/schoolService"
import { sessionService, Session } from "@/lib/api/services/sessionService"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { apiClient } from "@/lib/api/client"
import { toast } from "react-toastify"
import { Search, Users, BookOpen, Building2, GraduationCap, Calendar, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ClassModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  classItem?: Class | null
  schoolId?: string
}

interface Student {
  id: string
  name: string
  email: string
  studentCode: string
}

interface Teacher {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  classItem,
  schoolId,
}) => {
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  
  const [teacherSearch, setTeacherSearch] = useState("")
  const [subjectSearch, setSubjectSearch] = useState("")
  const [departmentSearch, setDepartmentSearch] = useState("")
  const [studentSearch, setStudentSearch] = useState("")
  const [sessionSearch, setSessionSearch] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    section: "",
    sessionId: "",
    selectedTeacherIds: [] as string[],
    selectedSubjectIds: [] as string[],
    selectedDepartmentIds: [] as string[],
    selectedStudentIds: [] as string[],
  })

  const { user } = useAuthStore()
  const activeSchoolId = schoolId || user?.schools?.[0]?.schoolId || user?.tenantId || '';

  const fetchInitialData = useCallback(async () => {
    setFetchingData(true)
    try {
      if (activeSchoolId) {
        const results = await Promise.allSettled([
          schoolService.getTeachers(activeSchoolId),
          subjectService.getSubjects(activeSchoolId),
          departmentService.getDepartments(activeSchoolId),
          schoolService.getStudents(activeSchoolId, { limit: 1000 }),
          sessionService.getSessions()
        ])
        
        if (results[0].status === 'fulfilled') {
          setTeachers(results[0].value || [])
        } else {
          console.error("Failed to fetch school teachers:", results[0].reason)
        }

        if (results[1].status === 'fulfilled') {
          setSubjects(results[1].value || [])
        } else {
          console.error("Failed to fetch school subjects:", results[1].reason)
        }

        if (results[2].status === 'fulfilled') {
          setDepartments(results[2].value || [])
        } else {
          console.error("Failed to fetch school departments:", results[2].reason)
        }

        if (results[3].status === 'fulfilled') {
          setStudents(results[3].value || [])
        } else {
          console.error("Failed to fetch school students:", results[3].reason)
        }

        if (results[4].status === 'fulfilled') {
          setSessions(results[4].value || [])
        } else {
          console.error("Failed to fetch academic sessions:", results[4].reason)
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial data", error)
      toast.error("Failed to load school data")
    } finally {
      setFetchingData(false)
    }
  }, [activeSchoolId])

  useEffect(() => {
    if (isOpen) {
      fetchInitialData()
      if (classItem) {
        setFormData({
          name: classItem.name,
          section: classItem.section || "",
          sessionId: (classItem as any).sessionId || "",
          selectedTeacherIds: classItem.teachers?.map(t => t.teacherId) || [],
          selectedSubjectIds: classItem.subjects?.map((s: any) => s.subject?.id || s.id) || [],
          selectedDepartmentIds: classItem.departments?.map((d: any) => d.department?.code || d.departmentId || d.id) || [],
          selectedStudentIds: classItem.enrollments?.map((e: any) => e.student?.id || e.id) || [],
        })
      } else {
        setFormData({
          name: "",
          section: "",
          sessionId: "",
          selectedTeacherIds: [],
          selectedSubjectIds: [],
          selectedDepartmentIds: [],
          selectedStudentIds: [],
        })
      }
    }
  }, [isOpen, classItem, fetchInitialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!activeSchoolId) {
        toast.error("School context not found");
        return;
      }

      // Map department code selections back to real database UUIDs to satisfy foreign key constraints
      const mappedDepartmentIds = formData.selectedDepartmentIds.map(code => {
        const dept = departments.find(d => d.id === code || d.code === code);
        return dept?.departmentId || code;
      });

      if (classItem) {
        // Update class basic info
        await classService.updateClass(classItem.id, {
          name: formData.name,
          section: formData.section,
          teacherIds: formData.selectedTeacherIds,
          departmentIds: mappedDepartmentIds,
          studentIds: formData.selectedStudentIds,
          sessionId: formData.sessionId || undefined,
        } as any);

        // Update subjects with replacement strategy (allows removal)
        await classService.replaceSubjects(classItem.id, formData.selectedSubjectIds);

        toast.success("Class updated successfully!");
      } else {
        // Create class
        await classService.createClass({
          name: formData.name,
          section: formData.section,
          scope: "SCHOOL",
          schoolId: activeSchoolId,
          subjectIds: formData.selectedSubjectIds,
          departmentIds: mappedDepartmentIds,
          teacherIds: formData.selectedTeacherIds,
          studentIds: formData.selectedStudentIds,
          sessionId: formData.sessionId || undefined,
        } as any);
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

  const toggleTeacher = (teacherId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTeacherIds: prev.selectedTeacherIds.includes(teacherId)
        ? prev.selectedTeacherIds.filter(id => id !== teacherId)
        : [...prev.selectedTeacherIds, teacherId]
    }))
  }

  const toggleSubject = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjectIds: prev.selectedSubjectIds.includes(subjectId)
        ? prev.selectedSubjectIds.filter(id => id !== subjectId)
        : [...prev.selectedSubjectIds, subjectId]
    }))
  }

  const toggleDepartment = (departmentId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedDepartmentIds: prev.selectedDepartmentIds.includes(departmentId)
        ? prev.selectedDepartmentIds.filter(id => id !== departmentId)
        : [...prev.selectedDepartmentIds, departmentId]
    }))
  }

  const toggleStudent = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStudentIds: prev.selectedStudentIds.includes(studentId)
        ? prev.selectedStudentIds.filter(id => id !== studentId)
        : [...prev.selectedStudentIds, studentId]
    }))
  }

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
    t.email.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentCode.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredSessions = sessions.filter(s => 
    s.name.toLowerCase().includes(sessionSearch.toLowerCase())
  );

  const FormSkeleton = () => (
    <div className="p-12 flex flex-col items-center justify-center gap-6 min-h-[380px]">
      <div className="relative size-16 flex items-center justify-center">
        {/* Rotating Premium Spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-white/5 animate-spin" style={{ borderTopColor: '#2563eb' }} />
        <Users className="size-6 text-blue-600/60 animate-pulse" />
      </div>
      <div className="space-y-2 text-center">
        <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
          Syncing School Registry
        </h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse leading-normal">
          Loading teachers, students and departments...
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
          <DialogTitle className="text-2xl font-black font-headline text-slate-900 dark:text-white">
            {classItem ? "Edit Class" : "Create New Class"}
          </DialogTitle>
        </DialogHeader>

        {fetchingData ? (
          <FormSkeleton />
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white dark:bg-slate-900 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <GraduationCap size={14} className="text-blue-500" /> Class Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-xl py-3 px-4 text-sm transition-all"
                  placeholder="e.g. Grade 10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} className="text-orange-500" /> Class Session
                </Label>
                <Select 
                    value={formData.sessionId} 
                    onValueChange={(value) => setFormData({ ...formData, sessionId: value })}
                >
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-blue-500 rounded-xl py-3 px-4 text-sm transition-all">
                    <SelectValue placeholder="Select Session..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-slate-100 shadow-xl">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <Input 
                          placeholder="Search sessions..." 
                          className="pl-9 h-9 text-xs border-none bg-slate-100 rounded-lg"
                          value={sessionSearch}
                          onChange={(e) => setSessionSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    {filteredSessions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No sessions found</div>
                    ) : (
                      filteredSessions.map((session) => (
                        <SelectItem key={session.id} value={session.id} className="rounded-lg">
                          {session.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={14} className="text-emerald-500" /> Assign Educators / Teachers
              </Label>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4 border-2 border-slate-100 dark:border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Search teachers by name or email..." 
                    className="pl-10 bg-white dark:bg-slate-900 border-none rounded-lg text-sm shadow-sm"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredTeachers.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-8 text-slate-400">
                      <Users size={32} className="opacity-20 mb-2" />
                      <p className="text-xs">No matching teachers found</p>
                    </div>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <div 
                        key={teacher.id} 
                        onClick={() => toggleTeacher(teacher.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          formData.selectedTeacherIds.includes(teacher.id) 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          formData.selectedTeacherIds.includes(teacher.id) 
                            ? 'bg-emerald-600 border-emerald-600' 
                            : 'border-slate-200 dark:border-slate-700'
                        }`}>
                          {formData.selectedTeacherIds.includes(teacher.id) && (
                            <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold truncate">{teacher.name}</span>
                          <span className="text-[10px] opacity-60 truncate">{teacher.email}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} className="text-blue-500" /> Select Curriculum Subjects
              </Label>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4 border-2 border-slate-100 dark:border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Search subjects..." 
                    className="pl-10 bg-white dark:bg-slate-900 border-none rounded-lg text-sm shadow-sm"
                    value={subjectSearch}
                    onChange={(e) => setSubjectSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredSubjects.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-8 text-slate-400">
                      <BookOpen size={32} className="opacity-20 mb-2" />
                      <p className="text-xs">No matching subjects found</p>
                    </div>
                  ) : (
                    filteredSubjects.map((subject) => (
                      <div 
                        key={subject.id} 
                        onClick={() => toggleSubject(subject.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          formData.selectedSubjectIds.includes(subject.id) 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500/30 text-blue-700 dark:text-blue-300' 
                            : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          formData.selectedSubjectIds.includes(subject.id) 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-slate-200 dark:border-slate-700'
                        }`}>
                          {formData.selectedSubjectIds.includes(subject.id) && (
                            <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>
                          )}
                        </div>
                        <span className="text-sm font-bold truncate">{subject.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={14} className="text-indigo-500" /> Assign Academic Departments
              </Label>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4 border-2 border-slate-100 dark:border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Search departments..." 
                    className="pl-10 bg-white dark:bg-slate-900 border-none rounded-lg text-sm shadow-sm"
                    value={departmentSearch}
                    onChange={(e) => setDepartmentSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredDepartments.length === 0 ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-8 text-slate-400">
                      <Building2 size={32} className="opacity-20 mb-2" />
                      <p className="text-xs">No matching departments found</p>
                    </div>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <div 
                        key={dept.id} 
                        onClick={() => toggleDepartment(dept.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                          formData.selectedDepartmentIds.includes(dept.id) 
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-bold' 
                            : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          formData.selectedDepartmentIds.includes(dept.id) 
                            ? 'bg-indigo-600 border-indigo-600 shadow-sm' 
                            : 'border-slate-200 dark:border-slate-700'
                        }`}>
                          {formData.selectedDepartmentIds.includes(dept.id) && (
                            <span className="material-symbols-outlined text-[14px] text-white font-bold leading-none">check</span>
                          )}
                        </div>
                        <span className="text-sm font-bold truncate">{dept.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Users size={14} className="text-blue-500" /> Assign Enrolled Students
              </Label>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-4 border-2 border-slate-100 dark:border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Search students by name, email or code..." 
                    className="pl-10 bg-white dark:bg-slate-900 border-none rounded-lg text-sm shadow-sm"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <Users size={32} className="opacity-20 mb-2" />
                      <p className="text-xs">No matching students found</p>
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div 
                        key={student.id} 
                        onClick={() => toggleStudent(student.id)}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          formData.selectedStudentIds.includes(student.id) 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500/30 text-blue-700 dark:text-blue-300' 
                            : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            formData.selectedStudentIds.includes(student.id) 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-slate-200 dark:border-slate-700'
                          }`}>
                            {formData.selectedStudentIds.includes(student.id) && (
                              <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black truncate">{student.name}</span>
                            <span className="text-[10px] opacity-60">{student.email} • {student.studentCode}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                  {formData.selectedStudentIds.length} Students Selected
                </p>
                <div className="h-[2px] flex-1 mx-4 bg-slate-100 dark:bg-white/5 rounded-full" />
                <Zap size={12} className="text-orange-400" />
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end gap-4 pt-6 border-t dark:border-slate-800 mt-6 sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-10 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 py-6 gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </>
                ) : (
                  classItem ? "Update Class" : "Create Class"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ClassModal;

