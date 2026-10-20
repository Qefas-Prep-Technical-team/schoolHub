export interface AssessmentRecord {
  id: string;
  title: string;
  subject: string;
  date: string;
  rawDate: string;
  type: string;
  score: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  status: 'Graded' | 'Pending';
  teacher?: string;
  remarks?: string;
}

export interface TrendPoint {
  label: string;
  date: string;
  score: number;
  classAverage: number;
}

export interface CategoryBreakdown {
  category: string;
  score: number;
  count: number;
  classAverage: number;
  status: string;
}

export interface SubjectAnalyticsData {
  subjectName: string;
  allSubjects: string[];
  studentId: string;
  studentName: string;
  studentCode: string;
  studentImage?: string;
  currentClass?: string;
  schoolName?: string;
  averageScore: number;
  grade: string;
  trend: {
    value: string;
    isPositive: boolean;
  };
  highestScore: number;
  lowestScore: number;
  totalAssessments: number;
  classAverage: number;
  trendData: TrendPoint[];
  assessments: AssessmentRecord[];
  categories: CategoryBreakdown[];
  strengths: string[];
  weaknesses: string[];
  teacherNote?: {
    teacherName: string;
    subject: string;
    note: string;
  };
}
