/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "../client";

export const adminService = {
  /**
   * Update current admin profile
   */
  updateProfile: async (data: { name?: string; gender?: string; profileImage?: string; bannerImage?: string }) => {
    const response = await apiClient.patch("/admin/profile", data);
    return response.data;
  },

  /**
   * Get school students (paginated)
   */
  getSchoolStudents: async (schoolId: string, page: number = 1, limit: number = 10, search?: string, filters?: any) => {
    const response = await apiClient.get("/admin/students", {
      params: { 
        schoolId, 
        page, 
        limit, 
        search,
        ...filters
      },
    });
    return response.data;
  },

  /**
   * Manually verify a student
   */
  verifyStudent: async (studentId: string) => {
    const response = await apiClient.patch(`/admin/students/${studentId}/verify`);
    return response.data;
  },

  /**
   * Get teacher by ID
   */
  getTeacherById: async (teacherId: string) => {
    const response = await apiClient.get(`/admin/teachers/${teacherId}`);
    return response.data.data;
  },

  /**
   * Get teacher timetable
   */
  getTeacherTimetable: async (teacherId: string) => {
    const response = await apiClient.get(`/admin/teachers/${teacherId}/timetable`);
    return response.data.data;
  },

  /**
   * Upsert timetable period
   */
  upsertTimetablePeriod: async (teacherId: string, data: any) => {
    const response = await apiClient.post(`/admin/teachers/${teacherId}/timetable`, data);
    return response.data.data;
  },

  /**
   * Delete timetable period
   */
  deleteTimetablePeriod: async (teacherId: string, periodId: string) => {
    const response = await apiClient.delete(`/admin/teachers/${teacherId}/timetable/${periodId}`);
    return response.data;
  },

  /**
   * Update teacher details
   */
  updateTeacher: async (teacherId: string, data: any) => {
    const response = await apiClient.patch(`/admin/teachers/${teacherId}`, data);
    return response.data;
  },
};
