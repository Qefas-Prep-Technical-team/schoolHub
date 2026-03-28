"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Archive, 
  ChevronRight,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-toastify"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { departmentService, Department } from "./services/departmentService"
import { apiClient } from "@/lib/api/client"
import DepartmentModal from "./components/DepartmentModal"
import Header from "./components/Header"

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  
  const { user } = useAuthStore()
  // As discussed, admins have a defaultTenantId. We need to fetch the school record to get its UUID 'id'.
  // However, for this implementation, we'll try to get departments using the current context.
  // We'll call checkAdminStatus to get the school record which contains the UUID.
  const [schoolId, setSchoolId] = useState<string | null>(null)

  const fetchSchoolId = useCallback(async () => {
    if (!user?.email) return
    try {
      const response = await apiClient.get(`/admin/admin-status/${user.email}`)
      const data = response.data
      if (data.success && data.data.schoolAdmins?.[0]?.school?.id) {
        setSchoolId(data.data.schoolAdmins[0].school.id)
      }
    } catch (error) {
      console.error("Failed to fetch school ID:", error)
    }
  }, [user?.email])

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await departmentService.getDepartments(schoolId || undefined)
      setDepartments(data)
    } catch (error) {
      toast.error("Failed to fetch departments")
    } finally {
      setLoading(false)
    }
  }, [schoolId])

  useEffect(() => {
    fetchSchoolId()
  }, [fetchSchoolId])

  useEffect(() => {
    if (schoolId) {
      fetchDepartments()
    }
  }, [schoolId, fetchDepartments])

  const handleSave = async (data: any) => {
    try {
      if (selectedDepartment) {
        await departmentService.updateDepartment(selectedDepartment.id, data)
        toast.success("Department updated successfully")
      } else {
        await departmentService.createDepartment(data)
        toast.success("Department created successfully")
      }
      fetchDepartments()
      setIsModalOpen(false)
    } catch (error) {
      toast.error("Failed to save department")
    }
  }

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this department?")) {
      try {
        await departmentService.archiveDepartment(id)
        toast.success("Department archived successfully")
        fetchDepartments()
      } catch (error) {
        toast.error("Failed to archive department")
      }
    }
  }

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 p-6">
      <Header 
        title="Departments" 
        description="Manage your school's academic departments and organizational structure."
        icon={Building2}
      >
        <Button onClick={() => {
          setSelectedDepartment(null)
          setIsModalOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </Header>

      <div className="flex flex-col gap-4">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search by name or code..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Departments Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Department Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading departments...
                  </TableCell>
                </TableRow>
              ) : filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((dept) => (
                  <TableRow key={dept.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building2 size={16} className="text-primary" />
                        </div>
                        {dept.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{dept.code}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">
                      {dept.description || "No description provided"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {dept.subjects?.length || 0} subjects
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedDepartment(dept)
                            setIsModalOpen(true)
                          }}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleArchive(dept.id)}
                          >
                            <Archive className="mr-2 h-4 w-4" /> Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DepartmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        department={selectedDepartment}
        schoolId={schoolId}
      />
    </div>
  )
}
