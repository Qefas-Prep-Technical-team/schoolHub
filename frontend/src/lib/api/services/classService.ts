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
};
