import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  examService,
  CreateExamDTO,
  CreatePaperDTO,
} from "../services/examService";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export const examKeys = {
  all: ["exams"] as const,
  lists: () => [...examKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...examKeys.lists(), filters] as const,
  details: () => [...examKeys.all, "detail"] as const,
  detail: (id: string) => [...examKeys.details(), id] as const,
  papers: (id: string) => [...examKeys.detail(id), "papers"] as const,
};

export const useExams = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: examKeys.list(filters || {}),
    queryFn: () => examService.getExams(filters),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
};

export const useExamsPaginated = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [...examKeys.list(filters || {}), "paginated"],
    queryFn: () => examService.getExamsPaginated(filters),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });
};

export const useExam = (id: string) => {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: () => examService.getExamById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useExamPapers = (examId: string) => {
  return useQuery({
    queryKey: examKeys.papers(examId),
    queryFn: () => examService.getExamPapers(examId),
    enabled: !!examId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExamDTO) => examService.createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.lists() });
      toast.success("Exam created successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to create exam");
    },
  });
};

export const useCreatePaper = (examId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaperDTO) =>
      examService.createSubjectPaper(examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.papers(examId) });
      toast.success("Subject paper created successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message || "Failed to create subject paper",
      );
    },
  });
};

export const usePublishExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examService.publishExam(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: examKeys.all });
      toast.success("Exam published successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to publish exam");
    },
  });
};

export const useUnpublishExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examService.unpublishExam(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: examKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: examKeys.all });
      toast.success("Exam unpublished successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to unpublish exam");
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      args:
        | string
        | {
          id: string;
          options?: { deletePapers?: boolean; paperIds?: string[] };
        },
    ) => {
      if (typeof args === "string") {
        return examService.deleteExam(args);
      }
      return examService.deleteExam(args.id, args.options);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
      queryClient.invalidateQueries({ queryKey: ["subject-papers"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam deleted successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete exam");
    },
  });
};

export const useUnpublishPaper = (examId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paperId: string) =>
      examService.unpublishPaper(examId, paperId),
    onSuccess: (_, paperId) => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      queryClient.invalidateQueries({ queryKey: examKeys.papers(examId) });
      toast.success("Subject paper unpublished successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to unpublish paper");
    },
  });
};

export const useDeletePaper = (examId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paperId: string) => examService.deletePaper(examId, paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.papers(examId) });
      toast.success("Subject paper deleted successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to delete paper");
    },
  });
};

export const useSubjectPapers = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["subject-papers", params],
    queryFn: () => examService.getSubjectPapers(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useSubjectPapersPaginated = (
  filters?: Record<string, unknown>,
) => {
  return useQuery({
    queryKey: ["subject-papers", "paginated", filters],
    queryFn: () => examService.getSubjectPapersPaginated(filters),
    staleTime: 1000 * 60 * 2,
  });
};

export const useLinkPaperToExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { paperId: string; examId: string }) =>
      examService.linkSubjectPaperToExam(params.paperId, params.examId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exam-papers", variables.examId],
      });
      queryClient.invalidateQueries({
        queryKey: examKeys.papers(variables.examId),
      });
      queryClient.invalidateQueries({ queryKey: ["subject-papers"] });
      toast.success("Subject paper linked successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(
        error.response?.data?.message || "Failed to link subject paper",
      );
    },
  });
};

export const useUnlinkPaper = (examId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paperId: string) =>
      examService.unlinkSubjectPaper(paperId, examId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.papers(examId) });
      queryClient.invalidateQueries({ queryKey: ["subject-papers"] });
      toast.success("Subject paper unlinked!");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to unlink paper");
    },
  });
};

export {
  useExamAttempt,
  useExamAttempts,
  useStartExamAttempt,
  useExamReview,
  useSaveAnswer,
  useSubmitAttempt,
  useSubmitSubjectPaper,
  useExamResult,
  useStudentExamAttempts,
  useStudentStats,
} from "./useExamAttempts";
