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

export const useCreateClassSubjectResult = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>) => recordService.createClassSubjectResult(data),
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
  return useMutation({
    mutationFn: (data: Record<string, any>) => recordService.bulkUpsertStudentSubjectResults(data),
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
    mutationFn: (id: string) => recordService.publishClassSubjectResult(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["classSubjectResult", id] });
      queryClient.invalidateQueries({ queryKey: ["studentSubjectResults"] });
    },
  });
};

export const useUnpublishClassSubjectResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recordService.unpublishClassSubjectResult(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["classSubjectResult", id] });
      queryClient.invalidateQueries({ queryKey: ["studentSubjectResults"] });
    },
  });
};
