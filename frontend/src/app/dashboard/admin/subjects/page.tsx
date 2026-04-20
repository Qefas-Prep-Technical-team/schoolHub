"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, LayoutGrid, List } from "lucide-react"
import SubjectCard from "./components/SubjectCard"
import SubjectModal from "./components/SubjectModal"
import { subjectService, Subject } from "./services/subjectService"
import { departmentService, Department } from "../departments/services/departmentService"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { apiClient } from "@/lib/api/client"

const SubjectsPage = () => {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedScope, setSelectedScope] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  const { user } = useAuthStore()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const statusRes = await apiClient.get(`/admin/admin-status/${user?.email}`);
      const schoolId = statusRes.data.data.schoolAdmins?.[0]?.schoolId;
      
      const [subjectsData, departmentsData] = await Promise.all([
        subjectService.getSubjects(schoolId),
        departmentService.getDepartments(schoolId)
      ])
      
      setSubjects(subjectsData)
      setDepartments(departmentsData)
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = 
        subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.code.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment = selectedDepartment === "all" || 
        subject.departments?.some(d => d.departmentId === selectedDepartment);
    const matchesScope = selectedScope === "all" || subject.scope === selectedScope
    
    return matchesSearch && matchesDepartment && matchesScope
  })

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setIsModalOpen(true)
  }

  const handleView = (subject: Subject) => {
    router.push(`/dashboard/admin/subjects/${subject.id}`)
  }

  const handleCreate = () => {
    setEditingSubject(null)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      <main className="pt-24 pb-12 px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tighter text-slate-900 dark:text-white mb-2 uppercase">
              Curriculum & Subjects
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
              Manage the academic core, departmental scope, and faculty assignments.
            </p>
          </div>
          <Button 
            onClick={handleCreate}
            className="flex items-center gap-3 px-8 py-7 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 text-base uppercase tracking-tight"
          >
            <Plus className="h-6 w-6 stroke-[3]" />
            <span>New Subject</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 mb-8 shadow-sm">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
              placeholder="Filter by subject name or code..."
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px] h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-black uppercase tracking-wider px-4">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dep => (
                  <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedScope} onValueChange={setSelectedScope}>
              <SelectTrigger className="w-[160px] h-12 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-black uppercase tracking-wider px-4">
                <SelectValue placeholder="Scope: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Scope: All</SelectItem>
                <SelectItem value="SCHOOL">School-wide</SelectItem>
                <SelectItem value="PERSONAL">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subjects Bento Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-blue-600/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSubjects.map((subject) => (
              <SubjectCard 
                key={subject.id} 
                subject={subject} 
                onEdit={handleEdit}
                onView={handleView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-7xl text-slate-200 dark:text-slate-800 mb-6">menu_book</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Empty Curriculum</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">
              {searchQuery ? "No subjects match your current filter settings." : "Ready to build your school's curriculum? Start by adding your first subject module."}
            </p>
          </div>
        )}
      </main>

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        subject={editingSubject}
      />
    </div>
  )
}

export default SubjectsPage
