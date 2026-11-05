import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "../services/examService";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { examKeys } from "./useExams";

export const useExamAttempt = (examId: string) => {
  return useQuery({
    queryKey: [...examKeys.detail(examId), "attempt"],
    queryFn: async () => {
      try {
        return await examService.getExamAttempt(examId);
      } catch (error) {
        const err = error as AxiosError;
        if (err.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!examId,
    retry: false,
  });
};

export const useExamAttempts = (examId: string) => {
  return useQuery({
    queryKey: [...examKeys.detail(examId), "attempts"],
    queryFn: () => examService.getExamAttempts(examId),
    enabled: !!examId,
  });
};

export const useStartExamAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => {
      const { getDeviceId } = require("@/lib/utils/device");
      return examService.startExamAttempt(examId, { deviceId: getDeviceId() });
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({
        queryKey: [...examKeys.detail(examId), "attempt"],
      });
      toast.success("Exam started! Good luck.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to start exam");
    },
  });
};

export const useExamReview = (examId: string, studentId?: string) => {
  return useQuery({
    queryKey: [...examKeys.detail(examId), "review", studentId || "me"],
    queryFn: () => examService.getExamReview(examId, studentId),
    enabled: !!examId,
    retry: false,
  });
};

export const useSaveAnswer = () => {
  return useMutation({
    mutationFn: (params: {
      examId: string;
      data: { subjectPaperId: string; questionId: string; answer: string };
    }) => examService.saveAnswer(params.examId, params.data),
  });
};

export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => examService.submitAttempt(examId),
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({
        queryKey: [...examKeys.detail(examId), "attempt"],
      });
      toast.success("Exam submitted successfully!", {
        toastId: "exam-submit-success",
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to submit exam");
    },
  });
};

export const useSubmitSubjectPaper = () => {
  return useMutation({
    mutationFn: (params: { examId: string; paperId: string }) =>
      examService.submitSubjectPaperAttempt(params.examId, params.paperId),
  });
};

export const useExamResult = (examId: string, studentId?: string) => {
  return useQuery({
    queryKey: [...examKeys.detail(examId), "result", studentId || "me"],
    queryFn: () => examService.getExamResult(examId, studentId || ""),
    enabled: !!examId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
};

export const useStudentExamAttempts = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["my-attempts", params],
    queryFn: () => examService.getMyExamAttempts(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useStudentStats = () => {
  return useQuery({
    queryKey: ["my-stats"],
    queryFn: () => examService.getMyStats(),
    staleTime: 1000 * 60 * 5,
  });
};

