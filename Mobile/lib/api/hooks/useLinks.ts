import { Alert } from "react-native";
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { linkService, LinkType } from "../services/linkService";
import { AxiosError } from "axios";

export const queryKeys = {
  all: ["links"] as const,
  requests: (params: Record<string, unknown> = {}) =>
    [...queryKeys.all, "requests", params] as const,
  pending: (params: Record<string, unknown> = {}) =>
    [...queryKeys.all, "requests", "pending", params] as const,
  active: (params: Record<string, unknown> = {}) =>
    [...queryKeys.all, "active", params] as const,
  profile: () => [...queryKeys.all, "profile"] as const,
};

export const useLinkRequests = (
  params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
  } = {},
  options: Partial<UseQueryOptions<unknown, AxiosError>> = {},
) => {
  return useQuery({
    queryKey: queryKeys.requests(params),
    queryFn: () => linkService.getLinkRequests(params),
    ...options,
  });
};

export const usePendingLinkRequests = (
  params: { page?: number; limit?: number; category?: string } = {},
  options: Partial<UseQueryOptions<unknown, AxiosError>> = {},
) => {
  return useQuery({
    queryKey: queryKeys.pending(params),
    queryFn: () => linkService.getPendingLinkRequests(params),
    ...options,
  });
};

export const useActiveLinks = (
  params: { page?: number; limit?: number; category?: string } = {},
  options: Partial<UseQueryOptions<unknown, AxiosError>> = {},
) => {
  return useQuery({
    queryKey: queryKeys.active(params),
    queryFn: () => linkService.getActiveLinks(params),
    ...options,
  });
};

export const useLinkProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: linkService.getProfile,
  });
};

export const useCreateLinkRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      targetCode?: string;
      linkType: LinkType;
      note?: string;
    }) => linkService.createLinkRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      Alert.alert("Success", "Link request sent successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to send link request");
    },
  });
};

export const useRespondToLinkRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof linkService.respondToLinkRequest>>,
    AxiosError<{ message?: string }>,
    { id: string; action: "ACCEPT" | "REJECT" }
  >({
    mutationFn: ({ id, action }) =>
      linkService.respondToLinkRequest(id, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      if (variables.action === "ACCEPT") {
        Alert.alert("Success", "Link request accepted");
      } else {
        Alert.alert("Success", "Link request rejected");
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to respond to request");
    },
  });
};

export const useCancelLinkRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => linkService.cancelLinkRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      Alert.alert("Success", "Link request cancelled");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to cancel request");
    },
  });
};

export const useRevokeActiveLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => linkService.revokeActiveLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      Alert.alert("Success", "Connection revoked");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to revoke link");
    },
  });
};
