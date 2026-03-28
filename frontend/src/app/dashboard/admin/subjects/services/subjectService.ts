import { apiClient } from "@/lib/api/client"

export interface Subject {
  id: string
  name: string
  code: string
  description?: string
  schoolId: string
  scope: "SCHOOL" | "GLOBAL"
  classesCount?: number
  teachersCount?: number
  departmentId?: string
}

export interface CreateSubjectDTO {
  name: string
  code: string
  description?: string
  schoolId: string
  scope: "SCHOOL" | "GLOBAL"
  departmentId?: string
}

export interface UpdateSubjectDTO {
  name?: string
  code?: string
  description?: string
  departmentId?: string
}

export const subjectService = {
  getSubjects: async (schoolId?: string): Promise<Subject[]> => {
    const response = await apiClient.get("/academic/subjects", {
      params: { schoolId },
    })
    return response.data.data
  },

  getSubject: async (id: string): Promise<Subject> => {
    const response = await apiClient.get(`/academic/subjects/${id}`)
    return response.data.data
  },

  createSubject: async (data: CreateSubjectDTO): Promise<Subject> => {
    const response = await apiClient.post("/academic/subjects", data)
    return response.data.data
  },

  updateSubject: async (id: string, data: UpdateSubjectDTO): Promise<Subject> => {
    const response = await apiClient.patch(`/academic/subjects/${id}`, data)
    return response.data.data
  },

  archiveSubject: async (id: string): Promise<void> => {
    await apiClient.patch(`/academic/subjects/${id}/archive`)
  },
}
