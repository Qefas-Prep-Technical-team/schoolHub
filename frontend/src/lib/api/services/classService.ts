import { apiClient } from "../client";

export interface ClassJoinRequestData {
  classCode: string;
  note?: string;
}

export const classService = {
  requestToJoinClass: async (data: ClassJoinRequestData) => {
    const response = await apiClient.post("/classes/join/request", data);
    return response.data;
  },

  // Other class related methods can be added here as needed
  getClasses: async (schoolId?: string) => {
    const response = await apiClient.get(`/classes${schoolId ? `?schoolId=${schoolId}` : ''}`);
    return response.data.data || [];
  },

  getSingleClass: async (id: string) => {
    const response = await apiClient.get(`/classes/${id}`);
    return response.data.data;
  },

  previewClassById: async (id: string) => {
    const response = await apiClient.get(`/classes/preview/${id}`);
    return response.data.data;
  },

  getClassStats: async (id: string) => {
    const response = await apiClient.get(`/classes/${id}/stats`);
    return response.data.data;
  },

  // Attendance
  getAttendance: async (classId: string, date?: string) => {
    const response = await apiClient.get(`/classes/${classId}/attendance`, {
      params: { date },
    });
    return response.data.data;
  },

  submitAttendance: async (classId: string, records: Record<string, unknown>[]) => {
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

  upsertTimetablePeriod: async (classId: string, data: Record<string, unknown>) => {
    const response = await apiClient.post(`/classes/${classId}/timetable`, data);
    return response.data.data;
  },

  deleteTimetablePeriod: async (classId: string, periodId: string) => {
    const response = await apiClient.delete(`/classes/${classId}/timetable/${periodId}`);
    return response.data.data;
  },

  updateClass: async (id: string, data: { name?: string; section?: string; teacherIds?: string[]; departmentIds?: string[] }) => {
    const response = await apiClient.patch(`/classes/${id}`, data);
    return response.data.data;
  },

  getAllTeachers: async () => {
    const response = await apiClient.get('/teachers');
    return response.data.data || [];
  }
};
