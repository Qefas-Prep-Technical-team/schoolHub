import { apiClient } from "../client";

export interface Student {
  id: string;
  name: string;
  email: string;
  studentCode: string;
  verified: boolean;
  role: string;
  schoolId?: string;
  departmentId?: string;
  classes?: {
    class: {
      id: string;
      name: string;
      section?: string;
    };
  }[];
  department?: {
    id: string;
    name: string;
    code: string;
  };
  gender?: string;
}

export interface StudentProfile extends Student {
  school?: {
    id: string;
    name: string;
  };
  parentLinks?: {
    parent: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
  }[];
}

export const studentService = {
  getSchoolStudents: async (schoolId: string, filters: Record<string, string | boolean | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get<{ data: Student[] }>(`/schools/${schoolId}/students?${params.toString()}`);
    return response.data.data || [];
  },

  getProfile: async () => {
    const response = await apiClient.get<{ data: StudentProfile }>("/students/profile");
    return response.data.data;
  },

  getStudentById: async (id: string) => {
    const response = await apiClient.get<{ data: StudentProfile }>(`/students/${id}`);
    return response.data.data;
  },

  updateDepartment: async (departmentId: string) => {
    const response = await apiClient.patch<{ data: Student }>("/students/profile/department", { departmentId });
    return response.data.data;
  },

  updateDepartmentByAdmin: async (studentId: string, departmentId: string) => {
    const response = await apiClient.patch<{ data: Student }>(`/students/${studentId}/department`, { departmentId });
    return response.data.data;
  },
};
