import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recordService } from "../services/recordService";

export const useClassSubjectResults = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["classSubjectResults", params],
    queryFn: () => recordService.getClassSubjectResults(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useStudentTermResults = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["studentTermResults", params],
    queryFn: () => recordService.getStudentTermResults(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useMyPublishedResults = (studentId?: string) => {
  return useQuery({
    queryKey: ["myPublishedResults", studentId],
    queryFn: () => recordService.getMyPublishedResults(studentId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
};

export const useCreateClassSubjectResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => recordService.createClassSubjectResult(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classSubjectResults"] });
    },
  });
};

export const useClassSubjectResult = (id?: string) => {
  return useQuery({
    queryKey: ["classSubjectResult", id],
    queryFn: () => recordService.getClassSubjectResultById(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateClassSubjectResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      recordService.updateClassSubjectResult(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classSubjectResult", variables.id] });
    },
  });
};

export const useStudentSubjectResults = (params: Record<string, any>) => {
  return useQuery({
    queryKey: ["studentSubjectResults", params],
    queryFn: () => recordService.getStudentSubjectResults(params),
    enabled: !!params.classId && !!params.subjectId && !!params.sessionId && !!params.term,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBulkSaveStudentSubjectResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => recordService.bulkUpsertStudentSubjectResults(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studentSubjectResults"] });
    }
  });
};

export const useUpdatePaperLinks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paperLinks }: { id: string; paperLinks: Record<string, string[]> }) =>
      recordService.updatePaperLinks(id, paperLinks),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classSubjectResult", variables.id] });
    },
  });
};

export const useCalculatePaperSync = () => {
  return useMutation({
    mutationFn: ({ id, studentIds, category }: { id: string; studentIds: string[], category?: string }) =>
      recordService.calculatePaperSync(id, studentIds, category),
  });
};

export const useStudentScoreBreakdown = (id?: string, studentId?: string) => {
  return useQuery({
    queryKey: ["scoreBreakdown", id, studentId],
    queryFn: () => recordService.getStudentScoreBreakdown(id as string, studentId as string),
    enabled: !!id && !!studentId,
  });
};

export const usePublishClassSubjectResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: string | { id: string; signature?: string; role?: string }) => {
      const id = typeof args === "string" ? args : args.id;
      const signature = typeof args === "string" ? undefined : args.signature;
      const role = typeof args === "string" ? undefined : args.role;
      return recordService.publishClassSubjectResult(id, (signature || role) ? { signature, role } : undefined);
    },
    onSuccess: (data, args) => {
      const id = typeof args === "string" ? args : args.id;
      queryClient.invalidateQueries({ queryKey: ["classSubjectResult", id] });
      queryClient.invalidateQueries({ queryKey: ["studentSubjectResults"] });
    },
  });
};

export const useUnpublishClassSubjectResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: string | { id: string; reason?: string }) => {
      const id = typeof args === "string" ? args : args.id;
      const reason = typeof args === "string" ? undefined : args.reason;
      return recordService.unpublishClassSubjectResult(id, reason ? { reason } : undefined);
    },
    onSuccess: (data, args) => {
      const id = typeof args === "string" ? args : args.id;
      queryClient.invalidateQueries({ queryKey: ["classSubjectResult", id] });
      queryClient.invalidateQueries({ queryKey: ["studentSubjectResults"] });
    },
  });
};

