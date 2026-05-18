import { apiClient } from "@/lib/api/client";

export interface Department {
  id: string;
  departmentId?: string;
  name: string;
  code: string;
  description: string | null;
  schoolId: string | null;
  teacherId: string | null;
  scope: 'SCHOOL' | 'PERSONAL';
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  subjects?: unknown[];
  _count?: {
    students: number;
    classes: number;
    exams: number;
    quizzes: number;
  };
}

export interface CreateDepartmentDTO {
  name: string;
  code: string;
  description?: string;
  schoolId: string;
  scope: 'SCHOOL';
}

export interface UpdateDepartmentDTO {
  name?: string;
  code?: string;
  description?: string;
}

export const departmentService = {
  getDepartments: async (schoolId?: string): Promise<Department[]> => {
    const response = await apiClient.get('/academic/departments', {
      params: { schoolId }
    });
    return (response.data.data || []).map((dept: any) => ({
      ...dept,
      departmentId: dept.id,
      id: dept.code,
    }));
  },

  getSingleDepartment: async (code: string): Promise<Department> => {
    const response = await apiClient.get(`/academic/departments/${code}`);
    const dept = response.data.data;
    return dept ? { ...dept, departmentId: dept.id, id: dept.code } : dept;
  },

  createDepartment: async (data: CreateDepartmentDTO): Promise<Department> => {
    const response = await apiClient.post('/academic/departments', data);
    const dept = response.data.data;
    return dept ? { ...dept, departmentId: dept.id, id: dept.code } : dept;
  },

  updateDepartment: async (code: string, data: UpdateDepartmentDTO): Promise<Department> => {
    const response = await apiClient.patch(`/academic/departments/${code}`, data);
    const dept = response.data.data;
    return dept ? { ...dept, departmentId: dept.id, id: dept.code } : dept;
  },

  archiveDepartment: async (code: string): Promise<Department> => {
    const response = await apiClient.patch(`/academic/departments/${code}/archive`);
    const dept = response.data.data;
    return dept ? { ...dept, departmentId: dept.id, id: dept.code } : dept;
  }
};
