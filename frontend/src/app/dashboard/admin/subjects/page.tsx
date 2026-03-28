"use client"

import React, { useEffect, useState } from "react"
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
import { toast } from "react-toastify"

const SubjectsPage = () => {
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
    
    const matchesDepartment = selectedDepartment === "all" || subject.departmentId === selectedDepartment
    const matchesScope = selectedScope === "all" || subject.scope === selectedScope
    
    return matchesSearch && matchesDepartment && matchesScope
  })

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setIsModalOpen(true)
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
            <h1 className="text-4xl font-black font-headline tracking-tight text-slate-900 dark:text-white mb-2">
              Subjects
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Manage the academic curriculum and subject assignments across departments.
            </p>
          </div>
          <Button 
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-bold shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Subject</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 mb-8">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
              placeholder="Search subjects by name or code..."
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 whitespace-nowrap">
              Filter By:
            </span>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px] bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg text-xs font-semibold py-2">
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
              <SelectTrigger className="w-[150px] bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg text-xs font-semibold py-2">
                <SelectValue placeholder="Scope: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Scope: All</SelectItem>
                <SelectItem value="SCHOOL">School-wide</SelectItem>
                <SelectItem value="GLOBAL">Global</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="icon" className="text-blue-600">
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Subjects Bento Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map((subject) => (
              <SubjectCard 
                key={subject.id} 
                subject={subject} 
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="material-symbols-outlined text-6xl text-slate-200 mb-4">menu_book</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No subjects found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? "Try adjusting your search or filters" : "Get started by adding your first subject"}
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
