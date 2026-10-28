import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformClient } from "../platformClient";
import apiClient from "../client";
import { toast } from "react-toastify";

export interface SupportFaqItem {
  id: string;
  category: string;
  categoryLabel?: string | null;
  question: string;
  summary: string;
  answer: string[];
  targetRole: string; // TEACHER, STUDENT, ADMIN, ALL
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FaqPayload {
  category: string;
  categoryLabel?: string | null;
  question: string;
  summary: string;
  answer: string[];
  targetRole?: string;
  order?: number;
  isPublished?: boolean;
}

/**
 * Public/User Hook: Fetch published FAQs by role
 * staleTime: 5 minutes
 */
export const useSupportFaqs = (role?: string) => {
  return useQuery<SupportFaqItem[]>({
    queryKey: ["support-faqs", role || "ALL"],
    queryFn: async () => {
      const url = role ? `/support/faqs?role=${role}` : `/support/faqs`;
      const { data } = await apiClient.get<{ success: boolean; data: SupportFaqItem[] }>(url);
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

/**
 * Platform Console Hook: Fetch all FAQs (including unpublished) for admin management
 * staleTime: 2 minutes
 */
export const usePlatformFaqs = () => {
  return useQuery<SupportFaqItem[]>({
    queryKey: ["platform-faqs"],
    queryFn: async () => {
      const { data } = await platformClient.get<{ success: boolean; data: SupportFaqItem[] }>("/platform/support/faqs");
      return data.data;
    },
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

/**
 * Platform Console Mutation: Create a new FAQ entry
 */
export const useCreateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FaqPayload) => {
      const { data } = await platformClient.post<{ success: boolean; data: SupportFaqItem; message: string }>(
        "/platform/support/faqs",
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success("FAQ created and saved to database!");
      queryClient.invalidateQueries({ queryKey: ["platform-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["support-faqs"] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to create FAQ";
      toast.error(msg);
    },
  });
};

/**
 * Platform Console Mutation: Update an existing FAQ entry in DB
 */
export const useUpdateFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: payload }: { id: string; data: Partial<FaqPayload> }) => {
      const { data } = await platformClient.patch<{ success: boolean; data: SupportFaqItem; message: string }>(
        `/platform/support/faqs/${id}`,
        payload
      );
      return data.data;
    },
    onSuccess: (updatedFaq) => {
      toast.success("FAQ updated successfully in database!");
      queryClient.invalidateQueries({ queryKey: ["platform-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["support-faqs"] });
      // Optimistically update item in cache
      queryClient.setQueryData<SupportFaqItem[]>(["platform-faqs"], (old) => {
        if (!old) return [updatedFaq];
        return old.map((item) => (item.id === updatedFaq.id ? updatedFaq : item));
      });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update FAQ";
      toast.error(msg);
    },
  });
};

/**
 * Platform Console Mutation: Delete an FAQ entry from DB
 */
export const useDeleteFaq = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await platformClient.delete<{ success: boolean; message: string }>(
        `/platform/support/faqs/${id}`
      );
      return data;
    },
    onSuccess: () => {
      toast.success("FAQ deleted from database");
      queryClient.invalidateQueries({ queryKey: ["platform-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["support-faqs"] });
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to delete FAQ";
      toast.error(msg);
    },
  });
};
