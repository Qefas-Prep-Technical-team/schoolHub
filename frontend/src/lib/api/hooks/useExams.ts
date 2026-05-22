import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService, CreateExamDTO, CreatePaperDTO } from "../services/examService";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export const examKeys = {
  all: ["exams"] as const,
  lists: () => [...examKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...examKeys.lists(), filters] as const,
  details: () => [...examKeys.all, "detail"] as const,
  detail: (id: string) => [...examKeys.details(), id] as const,
  papers: (id: string) => [...examKeys.detail(id), "papers"] as const,
};

export const useExams = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: examKeys.list(filters || {}),
    queryFn: () => examService.getExams(filters),
    refetchOnWindowFocus: true,
  });
};

export const useExamsPaginated = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: [...examKeys.list(filters || {}), "paginated"],
    queryFn: () => examService.getExamsPaginated(filters),
    refetchOnWindowFocus: true,
  });
};

export const useExam = (id: string) => {
  return useQuery({
    queryKey: examKeys.detail(id),
    queryFn: () => examService.getExamById(id),
    enabled: !!id,
  });
};

export const useExamPapers = (examId: string) => {
  return useQuery({
    queryKey: examKeys.papers(examId),
    queryFn: () => examService.getExamPapers(examId),
    enabled: !!examId,
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
    mutationFn: (data: CreatePaperDTO) => examService.createSubjectPaper(examId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.papers(examId) });
      toast.success("Subject paper created successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to create subject paper");
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
    mutationFn: (id: string) => examService.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: examKeys.all });
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
    mutationFn: (paperId: string) => examService.unpublishPaper(examId, paperId),
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

export const useExamAttempt = (examId: string) => {
  return useQuery({
    queryKey: [...examKeys.detail(examId), "attempt"],
    queryFn: async () => {
      try {
        return await examService.getExamAttempt(examId);
      } catch (error) {
        const err = error as AxiosError;
        if (err.response?.status === 404) {
          return null; // Return null if no attempt exists
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
    mutationFn: (examId: string) => examService.startExamAttempt(examId),
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: [...examKeys.detail(examId), "attempt"] });
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
  });
};

export const useSaveAnswer = () => {
  return useMutation({
    mutationFn: (params: { examId: string, data: { subjectPaperId: string, questionId: string, answer: string } }) => 
      examService.saveAnswer(params.examId, params.data),
  });
};

export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (examId: string) => examService.submitAttempt(examId),
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: [...examKeys.detail(examId), "attempt"] });
      toast.success("Exam submitted successfully!", { toastId: "exam-submit-success" });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to submit exam");
    },
  });
};

export const useExamResult = (examId: string, studentId?: string) => {
  return useQuery({
    queryKey: [...examKeys.detail(examId), "result", studentId || "me"],
    queryFn: () => examService.getExamResult(examId, studentId || ""),
    enabled: !!examId,
  });
};

export const useStudentExamAttempts = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["my-attempts", params],
    queryFn: () => examService.getMyExamAttempts(params),
  });
};

export const useStudentStats = () => {
  return useQuery({
    queryKey: ["my-stats"],
    queryFn: () => examService.getMyStats(),
  });
};

export const useSubjectPapers = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["subject-papers", params],
    queryFn: () => examService.getSubjectPapers(params),
  });
};

export const useSubjectPapersPaginated = (filters?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["subject-papers", "paginated", filters],
    queryFn: () => examService.getSubjectPapersPaginated(filters),
  });
};

export const useLinkPaperToExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { paperId: string, examId: string }) => 
      examService.linkSubjectPaperToExam(params.paperId, params.examId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["exam-papers", variables.examId] });
      queryClient.invalidateQueries({ queryKey: examKeys.papers(variables.examId) });
      queryClient.invalidateQueries({ queryKey: ["subject-papers"] });
      toast.success("Subject paper linked successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to link subject paper");
    },
  });
};
export const useUnlinkPaper = (examId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paperId: string) => examService.unlinkSubjectPaper(paperId, examId),
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
