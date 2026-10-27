import { apiClient } from "../client";

export interface Student {
  id: string;
  name: string;
  email: string;
  studentCode: string;
  verified: boolean;
  role: string;
  schoolId?: string;
  departmentId?: string;
  classes?: {
    class: {
      id: string;
      name: string;
      section?: string;
      session?: string;
      term?: string;
      subjects?: any[];
      teachers?: any[];
    };
  }[];
  department?: {
    id: string;
    name: string;
    code: string;
  };
  gender?: string;
  dateOfBirth?: string;
  gradeLevel?: string;
  level?: string;
  createdAt?: string;
  profileImage?: string;
  bannerImage?: string;
  height?: number;
  weight?: number;
  club?: string;
  favouriteColour?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
}

export interface StudentBehaviourProfile {
  id: string;
  studentId: string;
  conductScore: number;
  strengths: { name: string; description: string; icon: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile extends Student {
  behaviourProfile?: StudentBehaviourProfile | null;
  school?: {
    id: string;
    name: string;
    levels?: string[];
  };
  parentLinks?: {
    parent: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
  }[];
  prefectRole?: string;
  hasSeenPrefectCelebration?: boolean;
  attendances?: {
    id: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  }[];
}

export interface AssessmentGradeItem {
  id: string;
  title: string;
  category: string;
  score: number;
  maxMarks: number;
  percentage: number;
  gradeLetter: string;
  date: string;
}

export interface SubjectHistoryRecord {
  subjectName: string;
  subjectCode?: string | null;
  score: number | null;
  maxMarks: number;
  percentage: number;
  grade: string;
  gradeLabel: string;
  gradeColor: string;
  assessmentsCount: number;
  assessments: AssessmentGradeItem[];
}

export interface AcademicHistoryCohort {
  cohortId: string;
  classId?: string | null;
  className: string;
  classCode?: string | null;
  session: string;
  term: string;
  termDisplay: string;
  enrolledAt: string;
  termAverage: number;
  termGrade: string;
  termGradeLabel: string;
  totalSubjects: number;
  subjects: SubjectHistoryRecord[];
}

export interface StudentHistoryTimelineItem {
  id: string;
  date: string;
  eventType: string;
  title: string;
  description?: string | null;
  meta?: Record<string, unknown> | null;
  performedBy?: string | null;
  school?: { id: string; name: string; logo?: string | null } | null;
}

export interface StudentHistorySummary {
  totalClasses: number;
  totalSessions: number;
  totalSubjects: number;
  overallAverage: number;
}

export interface StudentHistoryResponse {
  timeline: StudentHistoryTimelineItem[];
  academicHistory: AcademicHistoryCohort[];
  summary: StudentHistorySummary;
}

export interface StudentSchoolHistoryRecord {
  id: string;
  schoolId?: string | null;
  name: string;
  logo?: string | null;
  address?: string | null;
  schoolAddress?: string | null;
  schoolType?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  isCurrent: boolean;
  status: string;
  enrolledAt?: string | null;
  enrollmentDate?: string | null;
  exitedAt?: string | null;
  exitDate?: string | null;
  academicSession?: string | null;
  gradeLevel?: string | null;
  classesAttended: string[];
  overallAverage: number;
  overallGrade?: number | null;
  overallGradeLetter: string;
  totalGradesRecorded: number;
  totalGradesCount?: number;
  totalSubjects: number;
  topSubjects: Array<{
    subjectName: string;
    averageScore: number;
    gradeLetter: string;
  }>;
  subjectAverages?: Array<{
    subject: string;
    average: number;
    count: number;
  }>;
  exitReason?: string | null;
  notes?: string | null;
  isExternal?: boolean;
}

export interface StudentSchoolsResponse {
  schools: StudentSchoolHistoryRecord[];
  overallAverage?: number;
  summary: {
    totalSchools: number;
    currentSchoolName: string;
    overallAverage: number;
    overallGradeLetter: string;
  };
}

export const studentService = {
  getSchoolStudents: async (schoolId: string, filters: Record<string, string | number | boolean | undefined> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });

    const response = await apiClient.get<{ data: Student[] }>(`/schools/${schoolId}/students?${params.toString()}`);
    return response.data.data || [];
  },

  getProfile: async () => {
    const response = await apiClient.get<{ data: StudentProfile }>("/students/profile");
    return response.data.data ?? null;
  },

  getStudentById: async (id: string) => {
    const response = await apiClient.get<{ data: StudentProfile }>(`/students/${id}`);
    return response.data.data ?? null;
  },

  getStudentAssignments: async (id: string, page = 1, limit = 10) => {
    const response = await apiClient.get(`/students/${id}/assignments?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  updateDepartment: async (departmentId: string) => {
    const response = await apiClient.patch<{ data: Student }>("/students/profile/department", { departmentId });
    return response.data.data ?? null;
  },

  updateLevel: async (level: string) => {
    const response = await apiClient.patch<{ data: Student }>("/students/profile/level", { level });
    return response.data.data ?? null;
  },

  updateDepartmentByAdmin: async (studentId: string, departmentId: string) => {
    const response = await apiClient.patch<{ data: Student }>(`/students/${studentId}/department`, { departmentId });
    return response.data.data ?? null;
  },

  updateProfile: async (data: { 
    name?: string; 
    email?: string; 
    gender?: string; 
    dateOfBirth?: string | Date;
    profileImage?: string;
    bannerImage?: string;
    height?: string | number;
    weight?: string | number;
    club?: string;
    favouriteColour?: string;
    guardianName?: string;
    guardianPhone?: string;
    address?: string;
  }) => {
    const response = await apiClient.patch<{ data: StudentProfile }>("/students/profile", data);
    return response.data.data ?? null;
  },

  requestEmailUpdate: async (newEmail: string) => {
    const response = await apiClient.post("/students/profile/email/request", { newEmail });
    return response.data;
  },

  verifyEmailUpdate: async (code: string) => {
    const response = await apiClient.post("/students/profile/email/verify", { code });
    return response.data;
  },

  getBehaviourProfile: async (studentId: string) => {
    const response = await apiClient.get<{ data: StudentBehaviourProfile }>(`/students/${studentId}/behaviour-profile`);
    return response.data.data ?? null;
  },

  updateBehaviourProfile: async (studentId: string, data: { conductScore?: number; strengths?: { name: string; description: string; icon: string }[] }) => {
    const response = await apiClient.put<{ data: StudentBehaviourProfile }>(`/students/${studentId}/behaviour-profile`, data);
    return response.data.data ?? null;
  },

  getAttendance: async (studentId: string, filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    const response = await apiClient.get<{ data: any[] }>(`/students/${studentId}/attendance${queryString}`);
    return response.data.data ?? [];
  },

  updateAttendance: async (studentId: string, data: { date: string; status: string; note?: string; subjects?: Record<string, any> }) => {
    const response = await apiClient.post<{ data: any }>(`/students/${studentId}/attendance`, data);
    return response.data.data ?? null;
  },

  updatePassword: async (data: any): Promise<any> => {
    const response = await apiClient.post("/auth/password/change", data);
    return response.data;
  },

  exitStudent: async (studentId: string, data: { exitType: string; exitDate: string; exitReason?: string; exitNotes?: string }): Promise<any> => {
    const response = await apiClient.post(`/students/${studentId}/exit`, data);
    return response.data;
  },

  batchExitStudents: async (data: { studentIds: string[]; exitType: string; exitDate: string; exitReason?: string; exitNotes?: string }): Promise<any> => {
    const response = await apiClient.post("/students/batch-exit", data);
    return response.data;
  },

  getStudentHistory: async (studentId: string): Promise<StudentHistoryResponse> => {
    const response = await apiClient.get<{ success: boolean; data: StudentHistoryResponse | StudentHistoryTimelineItem[] }>(`/students/${studentId}/history`);
    const raw = response.data.data;
    if (Array.isArray(raw)) {
      return {
        timeline: raw,
        academicHistory: [],
        summary: { totalClasses: 0, totalSessions: 0, totalSubjects: 0, overallAverage: 0 },
      };
    }
    return raw;
  },

  getStudentSchools: async (studentId: string): Promise<StudentSchoolsResponse> => {
    const response = await apiClient.get<{ success: boolean; data: StudentSchoolsResponse }>(`/students/${studentId}/schools`);
    return response.data.data;
  },

  addPreviousSchoolRecord: async (
    studentId: string,
    data: {
      schoolName: string;
      schoolAddress?: string;
      enrollmentDate?: string;
      exitDate?: string;
      exitReason?: string;
      gradeLevel?: string;
      overallGrade?: number;
      overallAverage?: number;
      overallGradeLetter?: string;
      notes?: string;
    }
  ) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/students/${studentId}/previous-school`, data);
    return response.data.data;
  },

  promoteStudent: async (
    studentId: string,
    data: {
      toClassId: string;
      fromClassId?: string;
      reason?: string;
      academicSession?: string;
    }
  ) => {
    const response = await apiClient.post<{ success: boolean; message: string; data?: any }>(
      `/students/${studentId}/promote`,
      data
    );
    return response.data;
  },

  assignPrefectRole: async (studentId: string, role: string) => {
    const response = await apiClient.post(`/students/${studentId}/prefect-role`, { role });
    return response.data.data;
  },

  removePrefectRole: async (studentId: string, reason: string) => {
    const response = await apiClient.delete(`/students/${studentId}/prefect-role`, { data: { reason } });
    return response.data.data;
  },

  acknowledgePrefectCelebration: async (studentId: string) => {
    const response = await apiClient.post(`/students/${studentId}/prefect-role/acknowledge`);
    return response.data.data;
  },

  getTermlyEvaluation: async (studentId: string, classId: string, sessionId: string, term: string) => {
    const response = await apiClient.get<{ data: any }>(`/students/${studentId}/termly-evaluation?classId=${classId}&sessionId=${sessionId}&term=${term}`);
    return response.data.data ?? null;
  },

  upsertTermlyEvaluation: async (studentId: string, data: any) => {
    const response = await apiClient.put<{ data: any }>(`/students/${studentId}/termly-evaluation`, data);
    return response.data.data ?? null;
  },

  getClassTermlyEvaluations: async (classId: string, sessionId: string, term: string): Promise<TermlyEvaluationRecord[]> => {
    const response = await apiClient.get<{ success: boolean; data: TermlyEvaluationRecord[] }>(
      `/students/termly-evaluations/class/${classId}?sessionId=${sessionId}&term=${term}`
    );
    return response.data.data || [];
  },

  bulkUpsertTermlyEvaluations: async (payload: {
    classId: string;
    sessionId: string;
    term: string;
    evaluations: Array<{
      studentId: string;
      attentiveness?: number | null;
      honesty?: number | null;
      neatness?: number | null;
      politeness?: number | null;
      punctuality?: number | null;
      selfControl?: number | null;
      obedience?: number | null;
      reliability?: number | null;
      responsibility?: number | null;
      relationship?: number | null;
      handlingTools?: number | null;
      drawingPainting?: number | null;
      handwriting?: number | null;
      publicSpeaking?: number | null;
      speechFluency?: number | null;
      sportsGames?: number | null;
      teacherRemark?: string | null;
      principalRemark?: string | null;
    }>;
  }): Promise<TermlyEvaluationRecord[]> => {
    const response = await apiClient.post<{ success: boolean; data: TermlyEvaluationRecord[] }>(
      "/students/termly-evaluations/bulk",
      payload
    );
    return response.data.data || [];
  },

  getDownloadAudit: async (studentId: string): Promise<StudentDownloadAuditData | null> => {
    const response = await apiClient.get<{ success: boolean; data: StudentDownloadAuditData }>(`/students/${studentId}/download-audit`);
    return response.data.data ?? null;
  },

  recordDownload: async (studentId: string, data?: { fileName?: string; fileType?: string }) => {
    const response = await apiClient.post<{ success: boolean; data: any }>(`/students/${studentId}/download-audit`, data || {});
    return response.data.data ?? null;
  },
};

export interface StudentDownloadAuditData {
  studentId: string;
  studentName: string;
  studentCode: string;
  downloadStats: {
    totalDownloads: number;
    studentDownloads: number;
    parentDownloads: number;
    recentDownloads: Array<{
      id: string;
      fileName: string;
      fileType?: string;
      downloadedBy: "STUDENT" | "PARENT" | "STAFF";
      performerName: string;
      date: string;
    }>;
    lastDownloadedAt: string | null;
  };
  paymentStats: {
    hasPaid: boolean;
    totalPaid: number;
    totalOutstanding: number;
    currency: string;
    currencySymbol: string;
    payments: Array<{
      id: string;
      reference: string;
      amount: number;
      term: string;
      session: string;
      paymentType: string;
      status: string;
      paymentMethod: string;
      paidAt: string | null;
      createdAt: string;
      paidBy: string;
      parentEmail: string | null;
      parentPhone: string | null;
    }>;
  };
  linkedParents: Array<{
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    profileImage?: string | null;
    relationship?: string;
    status: string;
  }>;
}

export interface TermlyEvaluationRecord {
  id?: string;
  studentId: string;
  classId: string;
  sessionId: string;
  term: string;
  attentiveness?: number | null;
  honesty?: number | null;
  neatness?: number | null;
  politeness?: number | null;
  punctuality?: number | null;
  selfControl?: number | null;
  obedience?: number | null;
  reliability?: number | null;
  responsibility?: number | null;
  relationship?: number | null;
  handlingTools?: number | null;
  drawingPainting?: number | null;
  handwriting?: number | null;
  publicSpeaking?: number | null;
  speechFluency?: number | null;
  sportsGames?: number | null;
  teacherRemark?: string | null;
  principalRemark?: string | null;
}

