"use client"
import { useState } from 'react'
import Card from './ui/Card'
import Tag from './ui/Tag'
import Button from './ui/Button'
import { useClasses } from '@/lib/api/hooks/useClasses'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subjectService } from '../../../subjects/services/subjectService'
import { useAuthStore } from '@/app/(auth)/login/services/auth-store'
import { apiClient } from '@/lib/api/client'
import { toast } from 'react-toastify'

interface ProfessionalInfo {
  department: string
  subjects: string[]
  assignedClasses: string[]
}

interface ProfessionalInfoCardProps {
  teacherId: string
  professionalInfo: ProfessionalInfo
}

export default function ProfessionalInfoCard({ teacherId, professionalInfo }: ProfessionalInfoCardProps) {
  const [isAssigningClass, setIsAssigningClass] = useState(false)
  const [isAssigningSubject, setIsAssigningSubject] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  
  const [isEditingDept, setIsEditingDept] = useState(false)
  const [newDepartment, setNewDepartment] = useState(professionalInfo.department)

  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || ''

  // Fetch available classes and subjects
  const { data: classes } = useClasses(schoolId)
  const { data: subjects } = useQuery({
    queryKey: ['available-subjects', schoolId],
    queryFn: () => subjectService.getSubjects(schoolId)
  })

  // Mutation for updating teacher details
  const updateTeacherMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.patch(`/admin/teachers/${teacherId}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teacher', teacherId] })
      setIsEditingDept(false)
      toast.success('Department updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update department')
    }
  })

  // Mutations for assignment
  const assignClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      return await apiClient.post(`/admin/teachers/${teacherId}/assign-class`, { classId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teacher', teacherId] })
      setIsAssigningClass(false)
      setSelectedClassId('')
      toast.success('Teacher assigned to class successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign class')
    }
  })

  const assignSubjectMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      return await apiClient.post(`/academic/teacher-subjects/assign`, { 
        teacherId, 
        subjectId,
        schoolId 
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-teacher', teacherId] })
      setIsAssigningSubject(false)
      setSelectedSubjectId('')
      toast.success('Teacher assigned to subject successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign subject')
    }
  })

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-text-primary-light dark:text-text-primary-dark text-xl font-bold leading-tight tracking-[-0.015em]">
          Professional Information
        </h2>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
        {/* Department */}
        <div className="flex flex-col gap-1.5 border-t border-solid border-border-light dark:border-border-dark py-4">
          <div className="flex items-center justify-between">
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
              Department
            </p>
            <button 
              onClick={() => {
                if (isEditingDept) {
                  updateTeacherMutation.mutate({ department: newDepartment })
                } else {
                  setIsEditingDept(true)
                }
              }}
              className="text-primary-600 hover:text-primary-700 text-xs font-semibold"
              disabled={updateTeacherMutation.isPending}
            >
              {isEditingDept ? (updateTeacherMutation.isPending ? 'Saving...' : 'Save') : 'Edit'}
            </button>
          </div>
          {isEditingDept ? (
            <input 
              type="text"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              className="text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 mt-1 focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          ) : (
            <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium leading-normal">
              {professionalInfo.department}
            </p>
          )}
        </div>

        {/* Subjects */}
        <div className="flex flex-col gap-1.5 border-t border-solid border-border-light dark:border-border-dark py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
              Subjects Taught
            </p>
            <button 
              onClick={() => setIsAssigningSubject(!isAssigningSubject)}
              className="text-primary-600 hover:text-primary-700 text-xs font-semibold"
            >
              {isAssigningSubject ? 'Cancel' : '+ Assign Subject'}
            </button>
          </div>
          
          {isAssigningSubject && (
            <div className="flex gap-2 mb-3">
              <select 
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="flex-1 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1"
              >
                <option value="">Select Subject</option>
                {subjects?.filter((s: any) => !professionalInfo.subjects.includes(s.name)).map((subject: any) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              <Button 
                variant="primary" 
                className="!py-1 !px-3 text-xs"
                onClick={() => selectedSubjectId && assignSubjectMutation.mutate(selectedSubjectId)}
                loading={assignSubjectMutation.isPending}
              >
                Add
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {professionalInfo.subjects.map((subject, index) => (
              <Tag key={index} variant="primary">
                {subject}
              </Tag>
            ))}
          </div>
        </div>

        {/* Classes */}
        <div className="flex flex-col gap-1.5 border-t border-solid border-border-light dark:border-border-dark py-4 sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-normal leading-normal">
              Assigned Classes
            </p>
            <button 
              onClick={() => setIsAssigningClass(!isAssigningClass)}
              className="text-primary-600 hover:text-primary-700 text-xs font-semibold"
            >
              {isAssigningClass ? 'Cancel' : '+ Assign Class'}
            </button>
          </div>

          {isAssigningClass && (
            <div className="flex gap-2 mb-3 max-w-sm">
              <select 
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="flex-1 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1"
              >
                <option value="">Select Class</option>
                {classes?.filter((c: any) => !professionalInfo.assignedClasses.includes(c.name)).map((cls: any) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
              <Button 
                variant="primary" 
                className="!py-1 !px-3 text-xs"
                onClick={() => selectedClassId && assignClassMutation.mutate(selectedClassId)}
                loading={assignClassMutation.isPending}
              >
                Add
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {professionalInfo.assignedClasses.map((className, index) => (
              <Tag key={index} variant="secondary">
                {className}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}