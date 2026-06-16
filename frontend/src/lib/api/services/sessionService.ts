import { apiClient } from "../client";

export interface TermPeriod {
  id: string;
  sessionId: string;
  term: "FIRST" | "SECOND" | "THIRD";
  startDate: string;
  endDate: string;
}

export interface Session {
  id: string;
  name: string; // e.g., "2023/2024 Academic Session"
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  termPeriods?: TermPeriod[];
}

export interface CreateSessionDTO {
  name: string;
  startDate: string;
  endDate: string;
  schoolId: string;
  isActive?: boolean;
  termDates?: { term: string; startDate: string; endDate: string }[];
  isActive?: boolean;
}

export const sessionService = {
  getSessions: async () => {
    const response = await apiClient.get<{ data: Session[] }>("/sessions");
    return response.data.data || [];
  },

  getSessionById: async (id: string) => {
    const response = await apiClient.get<{ data: Session }>(`/sessions/${id}`);
    return response.data.data;
  },

  getActiveSession: async () => {
    const response = await apiClient.get<{ data: Session }>("/sessions/active");
    return response.data.data;
  },

  createSession: async (data: CreateSessionDTO) => {
    // console.log("Creating session with data:", data);
    const response = await apiClient.post<{ data: Session }>("/sessions", data);
    return response.data.data;
  },

  updateSession: async (id: string, data: Partial<CreateSessionDTO>) => {
    const response = await apiClient.patch<{ data: Session }>(
      `/sessions/${id}`,
      data,
    );
    return response.data.data;
  },

  archiveSession: async (id: string) => {
    const response = await apiClient.post<{ data: Session }>(
      `/sessions/${id}/archive`,
    );
    return response.data.data;
  },

  deleteSession: async (id: string) => {
    const response = await apiClient.delete(`/sessions/${id}`);
    return response.data;
  },
};
