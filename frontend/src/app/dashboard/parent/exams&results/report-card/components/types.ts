export interface ReportSubjectGrade {
  id: string;
  name: string;
  caScore: number;
  caMax: number;
  examScore: number;
  examMax: number;
  totalScore: number;
  totalMax: number;
  percentage: number;
  grade: string;
  remark: string;
  teacher?: string;
}

export interface ReportCardData {
  studentId: string;
  studentName: string;
  studentCode: string;
  studentImage?: string;
  currentClass?: string;
  schoolName: string;
  schoolAddress?: string;
  schoolEmail?: string;
  schoolPhone?: string;
  schoolLogo?: string;
  term: string;
  session: string;
  reportType: string;
  date: string;
  averageScore: number;
  totalSubjects: number;
  attendanceRate: number;
  position?: string;
  overallGrade: string;
  standing: string;
  subjects: ReportSubjectGrade[];
  classTeacherRemark?: string;
  principalRemark?: string;
  nextTermBegins?: string;
  promotionStatus?: string;
  schoolProfile?: {
    id?: string;
    name?: string;
    plan?: string | null;
    subscriptionStatus?: string | null;
    isTrialActive?: boolean;
    subscriptionEnd?: string | Date | null;
    logo?: string;
    address?: string;
    email?: string;
    phone?: string;
  };
}
