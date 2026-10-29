import { toast } from "react-toastify";
import { AxiosError } from "axios";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  keepPreviousData,
} from "@tanstack/react-query";
import { linkService, LinkType, BatchActionResult } from "@/lib/api/services/linkService";

const LINK_LIST_STALE_TIME = 1000 * 60 * 2;

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
    staleTime: LINK_LIST_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: 1,
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
    staleTime: LINK_LIST_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: 1,
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
    staleTime: LINK_LIST_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: 1,
    ...options,
  });
};

export const useLinkProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: linkService.getProfile,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useSingleLinkRequest = (
  id: string,
  options: Partial<UseQueryOptions<unknown, AxiosError>> = {},
) => {
  return useQuery({
    queryKey: [...queryKeys.all, "request", id],
    queryFn: () => linkService.getLinkRequestById(id),
    enabled: !!id,
    ...options,
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
      toast.success("Link request sent successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message || "Failed to send link request",
      );
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
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (variables.action === "ACCEPT") {
        toast.success("Link request accepted");
      } else {
        toast.success("Link request rejected");
      }
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message || "Failed to respond to request",
      );
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
    onError: (error: AxiosError<{ message?: string }>) => {
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
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to revoke link");
    },
  });
};

const reportBatchResult = (label: string, totals: { success: number; failed: number }, firstError?: string) => {
  if (totals.success === 0 && totals.failed === 0) {
    toast.info(`No pending ${label} requests to accept`);
    return;
  }
  if (totals.failed === 0) {
    toast.success(`Accepted ${totals.success} ${label} request${totals.success === 1 ? "" : "s"}`);
  } else if (totals.success === 0) {
    toast.error(`Failed to accept ${totals.failed} request(s)${firstError ? `: ${firstError}` : ""}`);
  } else {
    toast.warning(
      `Accepted ${totals.success}, failed ${totals.failed}${firstError ? ` (${firstError})` : ""}`,
    );
  }
};

/**
 * Accept every pending request in a category. The server processes up to 200 per call
 * in a sequential FIFO queue; we keep calling until nothing remains (or no progress is made).
 */
export const useAcceptAllLinkRequests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: "network" | "classroom") => {
      const totals = { success: 0, failed: 0 };
      let firstError: string | undefined;
      for (let round = 0; round < 20; round++) {
        const res: BatchActionResult = await linkService.acceptAllRequests(category);
        totals.success += res.successCount;
        totals.failed += res.failedCount;
        firstError ??= res.results.find((r) => !r.success)?.message;
        // Stop when the queue is drained or a round made no progress (all remaining failing)
        if (!res.remaining || res.successCount === 0) break;
      }
      return { totals, firstError };
    },
    onSuccess: ({ totals, firstError }, category) => {
      reportBatchResult(category, totals, firstError);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message || "Failed to accept all requests",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

/** Accept or reject a hand-picked set of requests in a single server-side queue. */
export const useBatchLinkRequestAction = () => {
  const queryClient = useQueryClient();
  return useMutation<
    BatchActionResult,
    AxiosError<{ message?: string }>,
    { ids: string[]; action: "ACCEPT" | "REJECT" }
  >({
    mutationFn: ({ ids, action }) => linkService.batchRequestAction(ids, action),
    onSuccess: (res, { action }) => {
      const firstError = res.results.find((r) => !r.success)?.message;
      if (action === "ACCEPT") {
        reportBatchResult("selected", { success: res.successCount, failed: res.failedCount }, firstError);
      } else if (res.failedCount === 0) {
        toast.success(`Rejected ${res.successCount} request${res.successCount === 1 ? "" : "s"}`);
      } else {
        toast.warning(`Rejected ${res.successCount}, failed ${res.failedCount}`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Batch action failed");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
