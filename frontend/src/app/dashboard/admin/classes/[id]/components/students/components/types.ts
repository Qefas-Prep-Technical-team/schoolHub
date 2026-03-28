export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  profileImage: string;
  performance: 'excellent' | 'good' | 'average' | 'weak';
  attendance: number;
  lastScore: number;
  averageScore: number;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address: string;
  joinedDate: string;
  notes?: string;
}

export interface ClassInfo {
  id: string;
  name: string;
  code: string;
  subject: string;
  teacher: string;
  department: string;
  totalStudents: number;
  semester: string;
  academicYear: string;
}

export interface FilterOptions {
  search: string;
  gender: 'all' | 'male' | 'female';
  sortBy: 'name' | 'performance' | 'attendance' | 'score';
  sortOrder: 'asc' | 'desc';
}

export interface PerformanceBadgeProps {
  performance: Student['performance'];
  size?: 'sm' | 'md' | 'lg';
}