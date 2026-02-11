/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grade, GradeFilters, PaginationInfo } from "./types";

// Mock data
const mockGrades: Grade[] = [
  {
    id: "1",
    studentId: "#STU-001",
    studentName: "Olivia Chen",
    className: "7A",
    subject: "Mathematics",
    examType: "Midterm",
    score: 92,
    grade: "A",
    remarks: "Excellent work on calculus.",
    status: "pass",
    date: "2024-10-15",
  },
  {
    id: "2",
    studentId: "#STU-002",
    studentName: "Benjamin Carter",
    className: "7A",
    subject: "History",
    examType: "Midterm",
    score: 85,
    grade: "B",
    remarks: "Good understanding of the material.",
    status: "pass",
    date: "2024-10-16",
  },
  {
    id: "3",
    studentId: "#STU-005",
    studentName: "Ava Nguyen",
    className: "7A",
    subject: "Art",
    examType: "Final",
    score: 55,
    grade: "F",
    remarks: "Struggling with core concepts.",
    status: "fail",
    date: "2024-10-17",
  },
  {
    id: "4",
    studentId: "#STU-003",
    studentName: "Sophia Rodriguez",
    className: "7A",
    subject: "Science",
    examType: "Final",
    score: 78,
    grade: "C",
    remarks: "Needs improvement in lab reports.",
    status: "pass",
    date: "2024-10-18",
  },
  {
    id: "5",
    studentId: "#STU-004",
    studentName: "Liam Goldberg",
    className: "7A",
    subject: "English",
    examType: "Midterm",
    score: 95,
    grade: "A",
    remarks: "Outstanding essay submission.",
    status: "pass",
    date: "2024-10-19",
  },
  {
    id: "6",
    studentId: "#STU-006",
    studentName: "Mia Johnson",
    className: "7B",
    subject: "Mathematics",
    examType: "Midterm",
    score: 88,
    grade: "B+",
    remarks: "Good problem-solving skills.",
    status: "pass",
    date: "2024-10-15",
  },
  {
    id: "7",
    studentId: "#STU-007",
    studentName: "Noah Smith",
    className: "7B",
    subject: "Science",
    examType: "Final",
    score: 45,
    grade: "F",
    remarks: "Needs to review basic concepts.",
    status: "fail",
    date: "2024-10-16",
  },
  {
    id: "8",
    studentId: "#STU-008",
    studentName: "Emma Wilson",
    className: "8A",
    subject: "History",
    examType: "Midterm",
    score: 91,
    grade: "A",
    remarks: "Excellent historical analysis.",
    status: "pass",
    date: "2024-10-17",
  },
  {
    id: "9",
    studentId: "#STU-009",
    studentName: "James Brown",
    className: "8A",
    subject: "English",
    examType: "Final",
    score: 82,
    grade: "B",
    remarks: "Good writing skills.",
    status: "pass",
    date: "2024-10-18",
  },
  {
    id: "10",
    studentId: "#STU-010",
    studentName: "Isabella Davis",
    className: "8B",
    subject: "Art",
    examType: "Midterm",
    score: 96,
    grade: "A+",
    remarks: "Exceptional creativity.",
    status: "pass",
    date: "2024-10-19",
  },
];

export class GradeService {
  static async getGrades(
    filters: GradeFilters,
    pagination: PaginationInfo
  ): Promise<{ grades: Grade[]; pagination: PaginationInfo }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredGrades = [...mockGrades];

    // Apply filters
    if (filters.class && filters.class !== "All Classes") {
      filteredGrades = filteredGrades.filter(
        (grade) => grade.className === filters.class
      );
    }

    if (filters.subject && filters.subject !== "All Subjects") {
      filteredGrades = filteredGrades.filter(
        (grade) => grade.subject === filters.subject
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredGrades = filteredGrades.filter(
        (grade) =>
          grade.studentName.toLowerCase().includes(searchLower) ||
          grade.studentId.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredGrades.sort((a, b) => {
      let aValue: any = a[filters.sortBy as keyof Grade];
      let bValue: any = b[filters.sortBy as keyof Grade];

      if (filters.sortBy === "score") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const paginatedGrades = filteredGrades.slice(startIndex, endIndex);

    return {
      grades: paginatedGrades,
      pagination: {
        ...pagination,
        totalItems: filteredGrades.length,
        totalPages: Math.ceil(filteredGrades.length / pagination.itemsPerPage),
      },
    };
  }

  static async getGradeStats() {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const totalStudents = new Set(mockGrades.map((g) => g.studentId)).size;
    const averageScore =
      mockGrades.reduce((sum, grade) => sum + grade.score, 0) /
      mockGrades.length;
    const passingStudents = mockGrades.filter(
      (g) => g.status === "pass"
    ).length;
    const failingStudents = mockGrades.filter(
      (g) => g.status === "fail"
    ).length;

    return {
      totalStudents,
      averageGrade: `${averageScore.toFixed(1)}% (${this.getGradeLetter(
        averageScore
      )})`,
      passingStudents,
      failingStudents,
    };
  }

  private static getGradeLetter(score: number): string {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }
}
