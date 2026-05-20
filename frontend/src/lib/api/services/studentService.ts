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
  dateOfBirth?: string;
  gradeLevel?: string;
  createdAt?: string;
  profileImage?: string;
  bannerImage?: string;
}

export interface StudentBehaviourProfile {
  id: string;
  studentId: string;
  conductScore: number;
  strengths: { name: string; description: string; icon: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile extends Student {
  behaviourProfile?: StudentBehaviourProfile | null;
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

  updateProfile: async (data: { 
    name?: string; 
    email?: string; 
    gender?: string; 
    dateOfBirth?: string | Date;
    profileImage?: string;
    bannerImage?: string;
  }) => {
    const response = await apiClient.patch<{ data: StudentProfile }>("/students/profile", data);
    return response.data.data;
  },

  requestEmailUpdate: async (newEmail: string) => {
    const response = await apiClient.post("/students/profile/email/request", { newEmail });
    return response.data;
  },

  verifyEmailUpdate: async (code: string) => {
    const response = await apiClient.post("/students/profile/email/verify", { code });
    return response.data;
  },

  getBehaviourProfile: async (studentId: string) => {
    const response = await apiClient.get<{ data: StudentBehaviourProfile }>(`/students/${studentId}/behaviour-profile`);
    return response.data.data;
  },

  updateBehaviourProfile: async (studentId: string, data: { conductScore?: number; strengths?: { name: string; description: string; icon: string }[] }) => {
    const response = await apiClient.put<{ data: StudentBehaviourProfile }>(`/students/${studentId}/behaviour-profile`, data);
    return response.data.data;
  },
};

