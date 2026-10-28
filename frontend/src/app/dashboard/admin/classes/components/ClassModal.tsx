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
import { Search, Users, BookOpen, Building2, GraduationCap, Calendar, Zap, Layers } from "lucide-react"
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
  const [availableLevels, setAvailableLevels] = useState<string[]>([])
  
  const [teacherSearch, setTeacherSearch] = useState("")
  const [subjectSearch, setSubjectSearch] = useState("")
  const [departmentSearch, setDepartmentSearch] = useState("")
  const [studentSearch, setStudentSearch] = useState("")
  const [sessionSearch, setSessionSearch] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    section: "",
    level: "",
    term: "",
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
          sessionService.getSessions(activeSchoolId),
          schoolService.getProfile(activeSchoolId)
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

        if (results[5].status === 'fulfilled' && results[5].value?.levels) {
          setAvailableLevels(results[5].value.levels || [])
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
          level: classItem.level || "",
          term: classItem.term || "",
          sessionId: classItem.session || (classItem as { session?: string; sessionId?: string }).sessionId || "",
          selectedTeacherIds: classItem.teachers?.map(t => t.teacherId) || [],
          selectedSubjectIds: classItem.subjects?.map((s: { subject?: { id: string }; id?: string }) => s.subject?.id || s.id || "") || [],
          selectedDepartmentIds: classItem.departments?.map((d: { department?: { id: string; name?: string } }) => d.department?.id || "") || [],
          selectedStudentIds: classItem.enrollments?.map((e: { student?: { id: string }; id?: string }) => e.student?.id || e.id || "") || [],
        })
      } else {
        setFormData({
          name: "",
          section: "",
          level: "",
          term: "",
          sessionId: "",
          selectedTeacherIds: [],
          selectedSubjectIds: [],
          selectedDepartmentIds: [],
          selectedStudentIds: [],
        })
      }
    }
  }, [isOpen, classItem, fetchInitialData])

  const defaultLevels = [
    "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
    "JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"
  ];
  const displayLevels = Array.from(new Set([
    ...(availableLevels.length > 0 ? availableLevels : defaultLevels),
    ...(formData.level ? [formData.level] : [])
  ]));

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

      const selectedSession = sessions.find(s => s.id === formData.sessionId || s.name === formData.sessionId);
      const sessionToSave = selectedSession ? selectedSession.name : (formData.sessionId || undefined);

      if (classItem) {
        // Update class basic info
        await classService.updateClass(classItem.id, {
          name: formData.name,
          section: formData.section,
          level: formData.level || undefined,
          term: formData.term || undefined,
          session: sessionToSave,
          sessionId: selectedSession?.id || formData.sessionId || undefined,
          teacherIds: formData.selectedTeacherIds,
          departmentIds: mappedDepartmentIds,
          studentIds: formData.selectedStudentIds,
        });

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
          level: formData.level || undefined,
          term: formData.term || undefined,
          session: sessionToSave,
          sessionId: selectedSession?.id || formData.sessionId || undefined,
          subjectIds: formData.selectedSubjectIds,
          departmentIds: mappedDepartmentIds,
          teacherIds: formData.selectedTeacherIds,
          studentIds: formData.selectedStudentIds,
        });
        toast.success("Class created successfully!");
      }

      onSuccess()
      onClose()
    } catch (error: unknown) {
      console.error("Failed to save class", error)
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to save class")
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
    <div className="p-12 flex flex-col items-center justify-center gap-4 min-h-[380px]">
      <div className="relative size-12 flex items-center justify-center">
        {/* Minimal Spinner */}
        <div className="absolute inset-0 rounded-full border-2 border-slate-100 dark:border-slate-800 animate-spin" style={{ borderTopColor: '#2563eb' }} />
        <BookOpen className="size-4 text-slate-400 animate-pulse" />
      </div>
      <div className="space-y-1 text-center">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Loading class details
        </h4>
        <p className="text-xs font-medium text-slate-500">
          Gathering teachers, subjects, and student lists...
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] w-full p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            {classItem ? "Edit Class" : "Create New Class"}
          </DialogTitle>
        </DialogHeader>

        {fetchingData ? (
          <FormSkeleton />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-8 space-y-6 bg-white dark:bg-slate-900 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <GraduationCap size={16} className="text-blue-500" /> Class Name
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-3 text-sm transition-all"
                    placeholder="e.g. Grade 10"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Layers size={16} className="text-blue-500" /> Section / Room
                  </Label>
                  <Input
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-3 text-sm transition-all"
                    placeholder="e.g. A, B, Science"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <GraduationCap size={16} className="text-indigo-500" /> Class Level
                  </Label>
                  <Select
                    value={formData.level || "NONE"}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, level: val === "NONE" ? "" : val }))}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-3 text-sm transition-all h-[42px]">
                      <SelectValue placeholder="Select Level..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900 max-h-56">
                      <SelectItem value="NONE" className="rounded-lg text-slate-400">No Level Assigned</SelectItem>
                      {displayLevels.map((lvl) => (
                        <SelectItem key={lvl} value={lvl} className="rounded-lg">
                          {lvl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar size={16} className="text-orange-500" /> Class Session (Academic Year)
                  </Label>
                  <Select 
                    value={formData.sessionId || "NONE"} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, sessionId: val === "NONE" ? "" : val }))}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-3 text-sm transition-all h-[42px]">
                      <SelectValue placeholder="Select Session..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <Input 
                            placeholder="Search sessions..." 
                            className="pl-9 h-9 text-xs border-none bg-slate-100 dark:bg-slate-800 rounded-lg"
                            value={sessionSearch}
                            onChange={(e) => setSessionSearch(e.target.value)}
                          />
                        </div>
                      </div>
                      <SelectItem value="NONE" className="rounded-lg text-slate-400">Select Session</SelectItem>
                      {filteredSessions.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">No sessions found</div>
                      ) : (
                        filteredSessions.map((session) => (
                          <SelectItem key={session.id} value={session.name} className="rounded-lg">
                            {session.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Calendar size={16} className="text-emerald-500" /> Academic Term
                  </Label>
                  <Select 
                    value={formData.term || "NONE"} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, term: val === "NONE" ? "" : val }))}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-3 text-sm transition-all h-[42px]">
                      <SelectValue placeholder="Select Term..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-100 dark:border-slate-800 shadow-lg bg-white dark:bg-slate-900">
                      <SelectItem value="NONE" className="rounded-lg text-slate-400">Select Term</SelectItem>
                      <SelectItem value="First Term" className="rounded-lg">First Term</SelectItem>
                      <SelectItem value="Second Term" className="rounded-lg">Second Term</SelectItem>
                      <SelectItem value="Third Term" className="rounded-lg">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users size={16} className="text-blue-500" /> Assign Educators / Teachers
              </Label>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4 border border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Search teachers by name or email..." 
                    className="pl-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
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
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          formData.selectedTeacherIds.includes(teacher.id) 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          formData.selectedTeacherIds.includes(teacher.id) 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-slate-200 dark:border-slate-700'
                        }`}>
                          {formData.selectedTeacherIds.includes(teacher.id) && (
                            <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold truncate">{teacher.name}</span>
                          <span className="text-xs text-slate-500 truncate">{teacher.email}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookOpen size={16} className="text-blue-500" /> Select Curriculum Subjects
              </Label>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4 border border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Search subjects..." 
                    className="pl-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
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
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          formData.selectedSubjectIds.includes(subject.id) 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          formData.selectedSubjectIds.includes(subject.id) 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-slate-200 dark:border-slate-700'
                        }`}>
                          {formData.selectedSubjectIds.includes(subject.id) && (
                            <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold truncate">{subject.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-500" /> Assign Academic Departments
              </Label>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4 border border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Search departments..." 
                    className="pl-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
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
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          formData.selectedDepartmentIds.includes(dept.id) 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          formData.selectedDepartmentIds.includes(dept.id) 
                            ? 'bg-blue-600 border-blue-600' 
                            : 'border-slate-200 dark:border-slate-700'
                        }`}>
                          {formData.selectedDepartmentIds.includes(dept.id) && (
                            <span className="material-symbols-outlined text-[14px] text-white font-bold leading-none">check</span>
                          )}
                        </div>
                        <span className="text-sm font-semibold truncate">{dept.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users size={16} className="text-blue-500" /> Assign Enrolled Students
              </Label>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-4 border border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Search students by name, email or code..." 
                    className="pl-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
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
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border ${
                          formData.selectedStudentIds.includes(student.id) 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            formData.selectedStudentIds.includes(student.id) 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-slate-200 dark:border-slate-700'
                          }`}>
                            {formData.selectedStudentIds.includes(student.id) && (
                              <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold truncate">{student.name}</span>
                            <span className="text-xs text-slate-500">{student.email} • {student.studentCode}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-slate-500 font-medium">
                  {formData.selectedStudentIds.length} Students Selected
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="px-4 h-10 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-6 h-10 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
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

