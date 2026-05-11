import { apiClient } from "../client";

export type LinkType =
  | "PARENT_STUDENT"
  | "TEACHER_CLASS"
  | "STUDENT_CLASS"
  | "SCHOOL_ADMIN"
  | "SCHOOL_TEACHER"
  | "SCHOOL_STUDENT";
export type LinkStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface LinkRequest {
  id: string;
  requesterId: string;
  requesterType: string;
  targetId: string;
  targetType: string;
  linkType: LinkType;
  status: LinkStatus;
  note?: string;
  rejectionReason?: string;
  requesterCode?: string;
  targetCode?: string;
  expiresAt: string;
  createdAt: string;
  requesterAdmin?: Record<string, unknown>;
  targetAdmin?: Record<string, unknown>;
  requesterSchool?: Record<string, unknown>;
  targetSchool?: Record<string, unknown>;
  requesterTeacher?: Record<string, unknown>;
  targetTeacher?: Record<string, unknown>;
  requesterStudent?: Record<string, unknown>;
  targetStudent?: Record<string, unknown>;
  requesterParent?: Record<string, unknown>;
  targetParent?: Record<string, unknown>;
  relationshipLink?: Record<string, unknown>;
  class?: Record<string, unknown>;
}

export const linkService = {
  // Get all link requests (sent and received)
  getLinkRequests: async (options: { page?: number; limit?: number; category?: string; status?: string } = {}) => {
    const response = await apiClient.get<Record<string, unknown>>("/links/requests", { params: options });
    return response.data;
  },
  getPendingLinkRequests: async (options: { page?: number; limit?: number; category?: string } = {}) => {
    try {
      const response = await apiClient.get<Record<string, unknown>>("/links/requests/pending", { params: options });
      return response.data;
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      throw error;
    }
  },

  // Initiate a new link request
  createLinkRequest: async (data: {
    targetCode?: string;
    linkType: LinkType;
    note?: string;
  }) => {
    const response = await apiClient.post<LinkRequest>("/links/request", data);
    return response.data;
  },

  // Respond to a link request (ACCEPT/REJECT)
  respondToLinkRequest: async (id: string, action: "ACCEPT" | "REJECT") => {
    const response = await apiClient.patch<LinkRequest>(
      `/links/request/${id}/respond`,
      { action },
    );
    return response.data;
  },

  // Get active links for the current user
  getActiveLinks: async (options: { page?: number; limit?: number; category?: string } = {}) => {
    const response = await apiClient.get<Record<string, unknown>>("/links/active", { params: options });
    return response.data;
  },

  // Cancel a sent link request
  cancelLinkRequest: async (id: string) => {
    const response = await apiClient.patch(`/links/request/${id}/cancel`);
    return response.data;
  },

  // Revoke an active link
  revokeActiveLink: async (id: string) => {
    const response = await apiClient.patch(`/links/active/${id}/revoke`);
    return response.data;
  },

  // Search for entities to link with (students, teachers, etc.)
  searchEntities: async (query: string, type: string) => {
    const response = await apiClient.get(
      `/links/search?q=${query}&type=${type}`,
    );
    return response.data;
  },

  // Get current user profile (to show linking code)
  getProfile: async () => {
    const response = await apiClient.get("/links/profile");
    return response.data;
  },

  // Get single link request by ID
  getLinkRequestById: async (id: string) => {
    const response = await apiClient.get<Record<string, unknown>>(`/links/request/${id}`);
    return response.data;
  },

  // Accept all requests by category (network | classroom)
  acceptAllRequests: async (category?: "network" | "classroom") => {
    const response = await apiClient.post("/links/requests/accept-all", {
      category,
    });
    return response.data;
  },
};
