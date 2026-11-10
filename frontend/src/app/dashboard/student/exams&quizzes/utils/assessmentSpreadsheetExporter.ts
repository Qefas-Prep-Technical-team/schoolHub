import * as XLSX from "xlsx";

export interface StudentAssessmentSpreadsheetRecord {
  title: string;
  type: string;
  subject: string;
  className: string;
  date: string;
  score: string | number;
  grade: string;
  standing: string;
  status: string;
  durationMinutes?: number;
  questionsCount?: number;
}

export interface StudentAssessmentSpreadsheetData {
  studentName: string;
  studentCode: string;
  className: string;
  schoolName: string;
  assessments: StudentAssessmentSpreadsheetRecord[];
}

function escapeCSV(val: string | number | null | undefined): string {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports student assessment history into Excel (.xlsx)
 */
export function exportAssessmentListToExcel(data: StudentAssessmentSpreadsheetData) {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [data.schoolName.toUpperCase()],
    [`STUDENT ASSESSMENTS, EXAMS & QUIZZES DOSSIER`],
    [`Student Name: ${data.studentName} | Student ID: ${data.studentCode}`],
    [`Class / Grade: ${data.className} | Total Records: ${data.assessments.length}`],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
  ];

  const headers = [
    "#",
    "Assessment Title",
    "Category",
    "Subject",
    "Class",
    "Scheduled Date",
    "Duration (Mins)",
    "Questions",
    "Score",
    "Grade",
    "Standing",
    "Status",
  ];

  const rows = data.assessments.map((a, idx) => [
    idx + 1,
    a.title,
    a.type.toUpperCase(),
    a.subject,
    a.className || "—",
    a.date,
    a.durationMinutes || "—",
    a.questionsCount || "—",
    a.score,
    a.grade,
    a.standing,
    a.status.toUpperCase(),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...rows]);
  ws["!cols"] = [
    { wch: 5 },  // #
    { wch: 32 }, // Title
    { wch: 12 }, // Type
    { wch: 22 }, // Subject
    { wch: 18 }, // Class
    { wch: 16 }, // Date
    { wch: 16 }, // Duration
    { wch: 12 }, // Questions
    { wch: 12 }, // Score
    { wch: 10 }, // Grade
    { wch: 18 }, // Standing
    { wch: 14 }, // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Assessments");
  const safeName = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `${safeName}_Assessments_Dossier.xlsx`);
}

/**
 * Exports student assessment history into CSV (.csv)
 */
export function exportAssessmentListToCSV(data: StudentAssessmentSpreadsheetData) {
  const metaLines = [
    `# Institution: ${escapeCSV(data.schoolName)}`,
    `# Report: Student Assessments, Exams & Quizzes Dossier`,
    `# Student Name: ${escapeCSV(data.studentName)}`,
    `# Student ID: ${escapeCSV(data.studentCode)}`,
    `# Class: ${escapeCSV(data.className)}`,
    `# Generated: ${new Date().toLocaleDateString()}`,
    "",
  ];

  const headers = [
    "S/N",
    "Assessment Title",
    "Category",
    "Subject",
    "Class",
    "Date",
    "Duration (Mins)",
    "Questions",
    "Score",
    "Grade",
    "Standing",
    "Status",
  ].map(escapeCSV).join(",");

  const dataLines = data.assessments.map((a, idx) =>
    [
      idx + 1,
      a.title,
      a.type.toUpperCase(),
      a.subject,
      a.className || "—",
      a.date,
      a.durationMinutes || "—",
      a.questionsCount || "—",
      a.score,
      a.grade,
      a.standing,
      a.status.toUpperCase(),
    ]
      .map(escapeCSV)
      .join(",")
  );

  const csvContent = [...metaLines, headers, ...dataLines].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeName}_Assessments_Dossier.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ExamReviewSpreadsheetRecord {
  questionNumber: number;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  scoreAwarded: number | string;
  maxMarks: number;
  evaluation: string;
}

export interface ExamReviewSpreadsheetData {
  studentName: string;
  studentCode: string;
  className: string;
  examTitle: string;
  subjectName: string;
  scoreObtained: number;
  totalMarks: number;
  accuracy: number;
  questions: ExamReviewSpreadsheetRecord[];
}

/**
 * Exports exam question review and solution key to Excel (.xlsx)
 */
export function exportExamReviewToExcel(data: ExamReviewSpreadsheetData, schoolName: string = "School Portal") {
  const wb = XLSX.utils.book_new();

  const titleRows = [
    [schoolName.toUpperCase()],
    [`EXAMINATION SOLUTION KEY & PERFORMANCE REVIEW`],
    [`Examination: ${data.examTitle} | Subject Paper: ${data.subjectName}`],
    [`Student Name: ${data.studentName} | Student ID: ${data.studentCode} | Class: ${data.className}`],
    [`Score: ${data.scoreObtained} / ${data.totalMarks} (${data.accuracy}%) | Generated: ${new Date().toLocaleDateString()}`],
    [],
  ];

  const headers = [
    "Q#",
    "Question Text",
    "Student Answer",
    "Official Solution Key",
    "Points Awarded",
    "Max Points",
    "Evaluation",
  ];

  const rows = data.questions.map((q) => [
    `Q${q.questionNumber}`,
    q.questionText,
    q.studentAnswer,
    q.correctAnswer,
    q.scoreAwarded,
    q.maxMarks,
    q.evaluation,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...titleRows, headers, ...rows]);
  ws["!cols"] = [
    { wch: 8 },  // Q#
    { wch: 45 }, // Question
    { wch: 22 }, // Student Ans
    { wch: 22 }, // Correct Ans
    { wch: 16 }, // Points
    { wch: 12 }, // Max
    { wch: 14 }, // Evaluation
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Solution_Key");
  const safeStudent = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  const safeExam = data.examTitle.replace(/[^a-zA-Z0-9]/g, "_");
  XLSX.writeFile(wb, `${safeStudent}_${safeExam}_Solution_Key.xlsx`);
}

/**
 * Exports exam question review and solution key to CSV (.csv)
 */
export function exportExamReviewToCSV(data: ExamReviewSpreadsheetData, schoolName: string = "School Portal") {
  const metaLines = [
    `# Institution: ${escapeCSV(schoolName)}`,
    `# Report: Examination Solution Key & Performance Review`,
    `# Exam: ${escapeCSV(data.examTitle)}`,
    `# Subject: ${escapeCSV(data.subjectName)}`,
    `# Student Name: ${escapeCSV(data.studentName)}`,
    `# Student ID: ${escapeCSV(data.studentCode)}`,
    `# Score: ${data.scoreObtained} / ${data.totalMarks} (${data.accuracy}%)`,
    `# Generated: ${new Date().toLocaleDateString()}`,
    "",
  ];

  const headers = [
    "Question Number",
    "Question Text",
    "Student Answer",
    "Official Solution Key",
    "Points Awarded",
    "Max Marks",
    "Evaluation",
  ].map(escapeCSV).join(",");

  const dataLines = data.questions.map((q) =>
    [
      `Q${q.questionNumber}`,
      q.questionText,
      q.studentAnswer,
      q.correctAnswer,
      q.scoreAwarded,
      q.maxMarks,
      q.evaluation,
    ]
      .map(escapeCSV)
      .join(",")
  );

  const csvContent = [...metaLines, headers, ...dataLines].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeStudent = data.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  const safeExam = data.examTitle.replace(/[^a-zA-Z0-9]/g, "_");
  link.setAttribute("href", url);
  link.setAttribute("download", `${safeStudent}_${safeExam}_Solution_Key.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

