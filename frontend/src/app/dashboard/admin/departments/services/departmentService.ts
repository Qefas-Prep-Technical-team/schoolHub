import { apiClient } from "@/lib/api/client";

export interface Department {
  id: string;
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
    return response.data.data;
  },

  getSingleDepartment: async (id: string): Promise<Department> => {
    const response = await apiClient.get(`/academic/departments/${id}`);
    return response.data.data;
  },

  createDepartment: async (data: CreateDepartmentDTO): Promise<Department> => {
    const response = await apiClient.post('/academic/departments', data);
    return response.data.data;
  },

  updateDepartment: async (id: string, data: UpdateDepartmentDTO): Promise<Department> => {
    const response = await apiClient.patch(`/academic/departments/${id}`, data);
    return response.data.data;
  },

  archiveDepartment: async (id: string): Promise<Department> => {
    const response = await apiClient.patch(`/academic/departments/${id}/archive`);
    return response.data.data;
  }
};
