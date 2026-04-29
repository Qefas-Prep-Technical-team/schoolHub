import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { linkService, LinkType } from "../services/linkService";
import { toast } from "react-toastify";

export const queryKeys = {
  all: ["links"] as const,
  requests: (params: any = {}) => [...queryKeys.all, "requests", params] as const,
  pending: (params: any = {}) => [...queryKeys.all, "requests", "pending", params] as const,
  active: (params: any = {}) => [...queryKeys.all, "active", params] as const,
  profile: () => [...queryKeys.all, "profile"] as const,
};

export const useLinkRequests = (params: { page?: number; limit?: number; category?: string; status?: string } = {}, options: any = {}) => {
  return useQuery<any>({
    queryKey: queryKeys.requests(params),
    queryFn: () => linkService.getLinkRequests(params),
    ...options
  });
};

export const usePendingLinkRequests = (params: { page?: number; limit?: number; category?: string } = {}, options: any = {}) => {
  return useQuery<any>({
    queryKey: queryKeys.pending(params),
    queryFn: () => linkService.getPendingLinkRequests(params),
    ...options
  });
};

export const useActiveLinks = (params: { page?: number; limit?: number; category?: string } = {}, options: any = {}) => {
  return useQuery<any>({
    queryKey: queryKeys.active(params),
    queryFn: () => linkService.getActiveLinks(params),
    ...options
  });
};

export const useLinkProfile = () => {
  return useQuery<any>({
    queryKey: queryKeys.profile(),
    queryFn: linkService.getProfile,
  });
};

export const useSingleLinkRequest = (id: string, options: any = {}) => {
  return useQuery({
    queryKey: [...queryKeys.all, "request", id],
    queryFn: () => linkService.getLinkRequestById(id),
    enabled: !!id,
    ...options
  });
};

export const useCreateLinkRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { targetCode?: string; linkType: LinkType; note?: string }) =>
      linkService.createLinkRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast.success("Link request sent successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send link request");
    },
  });
};

export const useRespondToLinkRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "ACCEPT" | "REJECT" }) =>
      linkService.respondToLinkRequest(id, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      if (variables.action === "ACCEPT") {
        toast.success("Link request accepted");
      } else {
        toast.success("Link request rejected");
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to respond to request");
    },
  });
};

export const useCancelLinkRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => linkService.cancelLinkRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast.success("Link request cancelled");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel request");
    },
  });
};

export const useRevokeActiveLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => linkService.revokeActiveLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast.success("Connection revoked");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to revoke link");
    },
  });
};

export const useAcceptAllLinkRequests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (category: "network" | "classroom") =>
      linkService.acceptAllRequests(category),
    onSuccess: (_, category) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      toast.success(`Successfully accepted all ${category} requests`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to accept all requests");
    },
  });
};
