import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "../services/examService";

export const useStudentExamAttempts = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["my-attempts", params],
    queryFn: () => examService.getMyExamAttempts(params),
    staleTime: 1000 * 60 * 2, // 2 minutes — prevents double-refetch from useFocusEffect + implicit stale
  });
};

export const useExams = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["exams", params],
    queryFn: () => examService.getExams(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useSingleExam = (id: string) => {
  return useQuery({
    queryKey: ["exam", id],
    queryFn: () => examService.getExam(id),
    enabled: !!id,
  });
};

export const useExamAttempt = (examId: string) => {
  return useQuery({
    queryKey: ["exam", examId, "attempt"],
    queryFn: async () => {
      try {
        const result = await examService.getExamAttempt(examId);
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

export const useExamReview = (examId: string) => {
  return useQuery({
    queryKey: ["exam", examId, "review"],
    queryFn: () => examService.getExamReview(examId),
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
