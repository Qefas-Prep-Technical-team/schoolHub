import { apiClient } from "../client";

export interface Exam {
  id: string;
  title: string;
  description?: string;
  scope: "SCHOOL" | "CLASS" | "DEPARTMENT";
  creationMode: "MANUAL" | "AI" | "OMR";
  mode: "SINGLE_SUBJECT" | "BILINGUAL" | "MULTI_SUBJECT";
  schoolId: string;
  sessionId?: string;
  term?: "FIRST" | "SECOND" | "THIRD";
  status: "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED";
  category: "EXAM" | "QUIZ";
  durationMinutes?: number;
  startDate?: string;
  endDate?: string;
  resultReleaseAt?: string;
  allowImmediateResult?: boolean;
  shuffleQuestions?: boolean;
  classId?: string;
  class?: { id: string; name: string; section?: string };
  departments?: { department: { id: string; name: string } }[];
  teacherId?: string;
  createdAt: string;
  updatedAt: string;
  instructions?: string;
  // New fields added based on linting/updates
  totalMarks?: number;
  totalQuestions?: number;
  totalPapers?: number;
  subjectPapers?: (SubjectPaper & { 
    subject?: { name: string }, 
    questions?: SubjectExamQuestion[] 
  })[];
}

export interface SubjectPaper {
  id: string;
  examId?: string; // Optional legacy field
  exams?: { examId: string; exam?: Exam }[];
  subjectId?: string;
  teacherId?: string;
  schoolId?: string;
  title: string;
  instructions: string;
  durationMinutes: number;
  totalMarks: number;
  passMark?: number;
  readingContent?: string;
  images: string[];
  imageLabels: string[];
  status: "DRAFT" | "REVIEW" | "APPROVED" | "REJECTED" | "PUBLISHED";
  createdAt: string;
  subject?: { name: string; schoolId: string };
  questions?: SubjectExamQuestion[];
  _count?: { questions: number };
}

export interface SubjectExamQuestion {
  id: string;
  subjectPaperId: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  question: string;
  images: string[];
  imageLabels: string[];
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  explanation?: string;
  marks: number;
  order: number;
}

export interface CreateExamDTO {
  title: string;
  description: string;
  scope: string;
  creationMode: string;
  category: string;
  mode: string;
  schoolId: string;
  sessionId?: string;
  term?: string;
  teacherId?: string;
  startDate?: string;
  endDate?: string;
  resultReleaseAt?: string;
  allowImmediateResult?: boolean;
  shuffleQuestions?: boolean;
  classId?: string;
  departmentIds?: string[];
}

export interface CreatePaperDTO {
  subjectId?: string | null;
  teacherId?: string | null;
  schoolId?: string | null;
  title: string;
  instructions: string;
  durationMinutes: number;
  passMark?: number;
  readingContent?: string;
  images?: string[];
  imageLabels?: string[];
}

export const examService = {
  getExams: async (params?: {
    schoolId?: string;
    sessionId?: string;
    classId?: string;
    departmentIds?: string[];
    term?: string;
    teacherId?: string;
    category?: string;
    status?: string;
  }) => {
    const response = await apiClient.get<{ data: Exam[] }>("/exams", { params });
    return response.data.data || [];
  },

  getExamById: async (id: string) => {
    const response = await apiClient.get<{ data: Exam }>(`/exams/${id}`);
    return response.data.data;
  },

  createExam: async (data: CreateExamDTO) => {
    const response = await apiClient.post<{ data: Exam }>("/exams", data);
    return response.data.data;
  },

  getExamPapers: async (examId: string) => {
    const response = await apiClient.get<{ data: SubjectPaper[] }>(
      `/exams/${examId}/papers`,
    );
    return response.data.data || [];
  },

  getPaperById: async (examId: string, paperId: string) => {
    const response = await apiClient.get<{ data: SubjectPaper }>(
      `/exams/${examId}/papers/${paperId}`,
    );
    return response.data.data;
  },

  createSubjectPaper: async (examId: string | null | undefined, data: CreatePaperDTO) => {
   
    const url = examId ? `/exams/${examId}/papers` : "/exams/papers";
    const response = await apiClient.post<{ data: SubjectPaper }>(url, data);
    return response.data.data;
  },

  updateQuestion: async (questionId: string, data: any) => {
    const response = await apiClient.patch(`/exams/questions/${questionId}`, data);
    return response.data;
  },

  deleteQuestion: async (questionId: string) => {
    const response = await apiClient.delete(`/exams/questions/${questionId}`);
    return response.data;
  },

  validatePaper: async (examId: string, paperId: string) => {
    const response = await apiClient.post(`/exams/${examId}/papers/${paperId}/validate`);
    return response.data;
  },

  publishPaper: async (examId: string, paperId: string) => {
    const response = await apiClient.post(`/exams/${examId}/papers/${paperId}/publish`);
    return response.data;
  },

  validateExam: async (id: string) => {
    const response = await apiClient.post(`/exams/${id}/validate`);
    return response.data;
  },

  publishExam: async (id: string) => {
    const response = await apiClient.post(`/exams/${id}/publish`);
    return response.data;
  },

  unpublishExam: async (id: string) => {
    const response = await apiClient.post(`/exams/${id}/unpublish`);
    return response.data;
  },

  deleteExam: async (id: string) => {
    const response = await apiClient.delete(`/exams/${id}`);
    return response.data;
  },

  unpublishPaper: async (examId: string, paperId: string) => {
    const response = await apiClient.post(`/exams/${examId}/papers/${paperId}/unpublish`);
    return response.data;
  },

  deletePaper: async (examId: string, paperId: string) => {
    const response = await apiClient.delete(`/exams/${examId}/papers/${paperId}`);
    return response.data;
  },
  
  updateSubjectPaper: async (paperId: string, data: Partial<CreatePaperDTO>) => {
    const response = await apiClient.patch<{ data: SubjectPaper }>(`/exams/papers/${paperId}`, data);
    return response.data.data;
  },

  updateExam: async (id: string, data: Partial<CreateExamDTO>) => {
    const response = await apiClient.patch<{ data: Exam }>(`/exams/${id}`, data);
    return response.data.data;
  },

  // Student Attempt Endpoints
  getExamAttempt: async (examId: string) => {
    const response = await apiClient.get<{ data: any }>(`/exams/${examId}/attempt`);
    return response.data.data;
  },

  getExamAttempts: async (examId: string) => {
    const response = await apiClient.get<{ data: any[] }>(`/exams/${examId}/attempts`);
    return response.data.data || [];
  },

  startExamAttempt: async (examId: string) => {
    const response = await apiClient.post(`/exams/${examId}/start`);
    return response.data.data;
  },

  saveAnswer: async (examId: string, data: { subjectPaperId: string, questionId: string, answer: string }) => {
    const response = await apiClient.post(`/exams/${examId}/answers`, data);
    return response.data;
  },

  submitAttempt: async (examId: string) => {
    const response = await apiClient.post(`/exams/${examId}/submit`);
    return response.data.data;
  },

  deleteExamAttempt: async (examId: string, studentId: string) => {
    const response = await apiClient.delete(`/exams/${examId}/attempts/${studentId}`);
    return response.data;
  },

  getExamResult: async (examId: string, studentId?: string) => {
    const url = studentId ? `/exams/${examId}/result?studentId=${studentId}` : `/exams/${examId}/result`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  getExamReview: async (examId: string, studentId?: string) => {
    const url = studentId ? `/exams/${examId}/review?studentId=${studentId}` : `/exams/${examId}/review`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  getSubjectPapers: async (params?: { unlinkedOnly?: boolean }) => {
    const response = await apiClient.get<{ data: SubjectPaper[] }>("/exams/papers/all", { params });
    return response.data.data || [];
  },

  linkSubjectPaperToExam: async (paperId: string, examId: string) => {
    const response = await apiClient.patch(`/exams/papers/${paperId}/link`, { examId });
    return response.data;
  },
  unlinkSubjectPaper: async (paperId: string, examId?: string) => {
    const response = await apiClient.patch(`/exams/papers/${paperId}/unlink`, { examId });
    return response.data;
  },

  getMyExamAttempts: async () => {
    const response = await apiClient.get('/exams/my/attempts');
    return response.data.data;
  },

  getMyStats: async () => {
    const response = await apiClient.get('/exams/my/stats');
    return response.data.data;
  },
};
