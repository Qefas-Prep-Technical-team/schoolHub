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

export interface PaginatedLinkRequestsResponse {
  success: boolean;
  message: string;
  items: LinkRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const linkService = {
  getLinkRequests: async (
    options: {
      page?: number;
      limit?: number;
      category?: string;
      status?: string;
    } = {},
  ) => {
    const response = await apiClient.get<Record<string, unknown>>(
      "/links/requests",
      { params: options },
    );
    return response.data;
  },
  
  getPendingLinkRequests: async (
    options: { page?: number; limit?: number; category?: string } = {},
  ) => {
    const response = await apiClient.get<PaginatedLinkRequestsResponse>(
      "/links/requests/pending",
      { params: options },
    );
    return response.data;
  },

  getSentLinkRequests: async (
    options: { page?: number; limit?: number; category?: string; status?: string } = {},
  ) => {
    const response = await apiClient.get<PaginatedLinkRequestsResponse>(
      "/links/requests/sent",
      { params: options },
    );
    return response.data;
  },

  createLinkRequest: async (data: {
    targetCode?: string;
    linkType: LinkType;
    note?: string;
  }) => {
    const response = await apiClient.post<LinkRequest>("/links/request", data);
    return response.data;
  },

  respondToLinkRequest: async (id: string, action: "ACCEPT" | "REJECT") => {
    const response = await apiClient.patch<LinkRequest>(
      `/links/request/${id}/respond`,
      { action },
    );
    return response.data;
  },

  getActiveLinks: async (
    options: { page?: number; limit?: number; category?: string } = {},
  ) => {
    const response = await apiClient.get<PaginatedLinkRequestsResponse>(
      "/links/active",
      { params: options },
    );
    return response.data;
  },

  cancelLinkRequest: async (id: string) => {
    const response = await apiClient.patch(`/links/request/${id}/cancel`);
    return response.data;
  },

  revokeActiveLink: async (id: string) => {
    const response = await apiClient.patch(`/links/active/${id}/revoke`);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get("/links/profile");
    return response.data;
  },
};
