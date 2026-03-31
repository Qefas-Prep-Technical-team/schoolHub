import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { linkService, LinkType } from "../services/linkService";
import { toast } from "react-toastify";

export const queryKeys = {
  all: ["links"] as const,
  requests: () => [...queryKeys.all, "requests"] as const,
  pending: () => [...queryKeys.requests(), "pending"] as const,
  active: () => [...queryKeys.all, "active"] as const,
  profile: () => [...queryKeys.all, "profile"] as const,
};

export const useLinkRequests = () => {
  return useQuery({
    queryKey: queryKeys.requests(),
    queryFn: linkService.getLinkRequests,
  });
};

export const usePendingLinkRequests = () => {
  return useQuery({
    queryKey: queryKeys.pending(),
    queryFn: linkService.getPendingLinkRequests,
  });
};

export const useActiveLinks = () => {
  return useQuery({
    queryKey: queryKeys.active(),
    queryFn: linkService.getActiveLinks,
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
