import { apiClient } from "@/lib/api/client"

export interface Subject {
  id: string
  name: string
  code: string
  description?: string
  schoolId?: string
  scope: "SCHOOL" | "PERSONAL"
  classesCount?: number
  teachersCount?: number
  departments?: Array<{ departmentId: string; department: { name: string } }>
  classes?: Array<{ classId: string; class: { name: string; gradeLevel: string } }>
  schemesOfWork?: SchemeOfWork[]
  subjectExamPapers?: any[]
}

export interface SchemeOfWork {
  id: string
  subjectId: string
  term?: number
  week: number
  topic: string
  objectives?: string
  resources?: string
  isCompleted: boolean
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
    return response.data.data.map((s: any) => ({
      ...s,
      teachersCount: s._count?.teacherSubjects || 0,
      classesCount: s._count?.classes || 0
    }))
  },

  getSubject: async (id: string): Promise<Subject> => {
    const response = await apiClient.get(`/academic/subjects/${id}`)
    const s = response.data.data
    return {
      ...s,
      teachersCount: (s as any).teacherSubjects?.length || 0,
      classesCount: s.classes?.length || 0
    }
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

  getScheme: async (subjectId: string): Promise<SchemeOfWork[]> => {
    const response = await apiClient.get(`/academic/subjects/${subjectId}/scheme`)
    return response.data.data
  },

  syncScheme: async (subjectId: string, entries: Partial<SchemeOfWork>[]): Promise<SchemeOfWork[]> => {
    const response = await apiClient.post(`/academic/subjects/${subjectId}/scheme/sync`, { entries })
    return response.data.data
  },

  updateSchemeEntry: async (id: string, data: Partial<SchemeOfWork>): Promise<SchemeOfWork> => {
    const response = await apiClient.patch(`/academic/scheme/${id}`, data)
    return response.data.data
  },

  deleteSchemeEntry: async (id: string): Promise<void> => {
    await apiClient.delete(`/academic/scheme/${id}`)
  },
}
