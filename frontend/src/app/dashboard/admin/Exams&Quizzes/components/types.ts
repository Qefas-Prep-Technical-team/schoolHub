export interface ExamFormData {
  title: string;
  type: "cbt" | "written";
  classLevel: string;
  startDate: string;
  endDate: string;
  duration: number;
  totalMarks: number;
  instructions: string;
  cbtSettings: {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showHints: boolean;
    negativeMarking: boolean;
  };
  publishingSettings: {
    allowLateSubmissions: boolean;
    allowMultipleAttempts: boolean;
    resultVisibilityDate: string;
  };
}
