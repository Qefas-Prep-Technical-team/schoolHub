import { apiClient } from "../api/client";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  rawData?: unknown;
}

export class ApiService {
  public static async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<T>(url, { params });
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: unknown) {
      const err = error as { success: false; error: string; status?: number; rawData?: unknown };
      return {
        success: false,
        error: err.error || "Failed to execute GET request",
        status: err.status,
        rawData: err.rawData,
      };
    }
  }

  public static async post<T>(url: string, payload?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<T>(url, payload);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: unknown) {
      const err = error as { success: false; error: string; status?: number; rawData?: unknown };
      return {
        success: false,
        error: err.error || "Failed to execute POST request",
        status: err.status,
        rawData: err.rawData,
      };
    }
  }

  public static async put<T>(url: string, payload?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<T>(url, payload);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: unknown) {
      const err = error as { success: false; error: string; status?: number };
      return {
        success: false,
        error: err.error || "Failed to execute PUT request",
        status: err.status,
      };
    }
  }

  public static async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<T>(url);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error: unknown) {
      const err = error as { success: false; error: string; status?: number };
      return {
        success: false,
        error: err.error || "Failed to execute DELETE request",
        status: err.status,
      };
    }
  }
}
