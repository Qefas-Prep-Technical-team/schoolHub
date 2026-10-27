"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signatureService, SignatureRecord } from "../services/signatureService";

export const useActiveSignature = (userId?: string) => {
  return useQuery<SignatureRecord | null>({
    queryKey: ["activeSignature", userId],
    queryFn: async () => {
      if (!userId) return null;
      return signatureService.getActiveSignature(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
  });
};

export const useSignaturesByUserIds = (userIds: string[]) => {
  const normalizedKey = userIds.filter(Boolean).sort().join(",");
  return useQuery<Record<string, SignatureRecord>>({
    queryKey: ["signaturesByUserIds", normalizedKey],
    queryFn: () => signatureService.getSignaturesByUserIds(userIds.filter(Boolean)),
    enabled: userIds.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes per rules
    retry: 1,
  });
};

export const useSaveSignatureMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signatureService.saveSignature,
    onSuccess: (data) => {
      queryClient.setQueryData(["activeSignature", data.userId], data);
      queryClient.invalidateQueries({ queryKey: ["activeSignature", data.userId] });
    },
  });
};
