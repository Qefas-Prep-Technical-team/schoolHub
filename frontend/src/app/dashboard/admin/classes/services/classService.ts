import { apiClient } from "@/lib/api/client";

export interface Class {
  id: string;
  name: string;
  section?: string;
  classCode: string;
  scope: 'PERSONAL' | 'SCHOOL';
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';
  schoolId?: string;
  teacher?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  teachers?: {
    teacherId: string;
    isLead: boolean;
    teacher: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  }[];
  subjects?: {
    subject: {
      id: string;
      name: string;
      code: string;
    }
  }[];
  departments?: {
    department: {
      id: string;
      name: string;
    }
  }[];
  enrollments?: any[];
  _count?: {
    enrollments: number;
    subjects: number;
  }
}

export const classService = {
  getClasses: async (schoolId?: string): Promise<Class[]> => {
    const response = await apiClient.get("/classes", {
      params: { schoolId },
    });
    return response.data.data;
  },

  getSingleClass: async (id: string): Promise<Class> => {
    const response = await apiClient.get(`/classes/${id}`);
    return response.data.data;
  },

  createClass: async (data: {
    name: string;
    section?: string;
    scope: string;
    schoolId?: string;
    subjectIds?: string[];
    departmentIds?: string[];
    teacherIds?: string[];
  }) => {
    const response = await apiClient.post("/classes", data);
    return response.data.data;
  },

  updateClass: async (id: string, data: {
    name?: string;
    section?: string;
    teacherIds?: string[];
    departmentIds?: string[];
  }) => {
    const response = await apiClient.patch(`/classes/${id}`, data);
    return response.data.data;
  },

  archiveClass: async (id: string) => {
    const response = await apiClient.patch(`/classes/${id}/archive`);
    return response.data;
  },

  deleteClass: async (id: string) => {
    // Note: The backend currently has archiveClass, but no hard delete.
    // Using archive for delete consistency if that's the intent.
    return await classService.archiveClass(id);
  },

  attachSubjects: async (classId: string, subjectIds: string[]) => {
    const response = await apiClient.post("/classes/subjects/attach", {
      classId,
      subjectIds,
    });
    return response.data.data;
  },

  getSchoolTeachers: async (schoolId: string) => {
    const response = await apiClient.get("/admin/teachers", {
      params: { schoolId },
    });
    return response.data.data;
  },

  // Attendance
  getAttendance: async (classId: string, date?: string) => {
    const response = await apiClient.get(`/classes/${classId}/attendance`, {
      params: { date },
    });
    return response.data.data;
  },

  submitAttendance: async (classId: string, records: any[]) => {
    const response = await apiClient.post(`/classes/${classId}/attendance`, { records });
    return response.data.data;
  },

  getAttendanceSummary: async (classId: string) => {
    const response = await apiClient.get(`/classes/${classId}/attendance/summary`);
    return response.data.data;
  },

  // Timetable
  getTimetable: async (classId: string) => {
    const response = await apiClient.get(`/classes/${classId}/timetable`);
    return response.data.data;
  },

  upsertTimetablePeriod: async (classId: string, data: any) => {
    const response = await apiClient.post(`/classes/${classId}/timetable`, data);
    return response.data.data;
  },

  deleteTimetablePeriod: async (classId: string, periodId: string) => {
    const response = await apiClient.delete(`/classes/${classId}/timetable/${periodId}`);
    return response.data.data;
  }
};
