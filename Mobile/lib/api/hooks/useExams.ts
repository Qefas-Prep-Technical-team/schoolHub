import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { examService } from "../services/examService";

export const useStudentExamAttempts = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["my-attempts", params],
    queryFn: () => examService.getMyExamAttempts(params),
    staleTime: 1000 * 60 * 2, // 2 minutes — prevents double-refetch from useFocusEffect + implicit stale
  });
};

export const useExams = (params?: Record<string, unknown>, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["exams", params],
    queryFn: () => examService.getExams(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
};

export const useInfiniteExams = (params?: Record<string, unknown>, options?: { enabled?: boolean }) => {
  return useInfiniteQuery({
    queryKey: ["exams", "infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await examService.getExams({ ...params, page: pageParam, limit: 10 });
      // Depending on API response shape, adjust here
      return res as any; 
    },
    getNextPageParam: (lastPage: any, allPages: any) => {
      if (lastPage.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2,
    enabled: options?.enabled,
  });
};

export const useSingleExam = (id: string) => {
  return useQuery({
    queryKey: ["exam", id],
    queryFn: () => examService.getExam(id),
    enabled: !!id,
  });
};

export const useExamAttempt = (examId: string, studentId?: string) => {
  return useQuery({
    queryKey: ["exam", examId, "attempt", studentId],
    queryFn: async () => {
      try {
        const result = await examService.getExamAttempt(examId, studentId);
        return result.data || result; // Handle both nested `{data}` and flat cases
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return null; // Return null if no attempt exists
        }
        throw error;
      }
    },
    enabled: !!examId,
    retry: false,
  });
};

export const useStartExamAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (examId: string) => {
      const { getDeviceId } = require('../../utils/device');
      const deviceId = await getDeviceId();
      return examService.startExamAttempt(examId, { deviceId });
    },
    onSuccess: (data, examId) => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId, "attempt"] });
    },
  });
};

export const useExamReview = (examId: string, studentId?: string) => {
  return useQuery({
    queryKey: ["exam", examId, "review", studentId],
    queryFn: () => examService.getExamReview(examId, studentId),
    enabled: !!examId,
  });
};

export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => examService.submitAttempt(examId),
    onSuccess: (data, examId) => {
      queryClient.invalidateQueries({ queryKey: ["exam", examId] });
      queryClient.invalidateQueries({ queryKey: ["my-attempts"] });
    },
  });
};

export const useSaveAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, payload }: { examId: string, payload: { subjectPaperId: string, questionId: string, answer: string } }) => 
      examService.saveAnswer(examId, payload),
    onSuccess: () => {
      // Intentionally not invalidating queries here to prevent UI lag. 
      // The local UI handles optimistic updates.
    },
  });
};
