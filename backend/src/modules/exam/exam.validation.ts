import { QuestionType } from "@prisma/client";

export const validateExamQuestionInput = (question: {
  type: QuestionType;
  question: string;
  images?: string[];
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer: string;
  marks?: number;
}) => {
  if (!question.question?.trim()) {
    throw new Error("Question text is required");
  }

  if (!question.correctAnswer?.trim()) {
    throw new Error("Correct answer is required");
  }

  if (!question.marks || question.marks <= 0) {
    throw new Error("Question marks must be greater than 0");
  }

  if (question.type === "MULTIPLE_CHOICE") {
    // Check if correctAnswer is a label (A, B, C, D)
    const labels = ["A", "B", "C", "D"];
    const isLabel = labels.includes(question.correctAnswer.trim().toUpperCase());

    if (isLabel) {
      const label = question.correctAnswer.trim().toUpperCase();
      const optionContent = (question as any)[`option${label}`];
      if (!optionContent || !String(optionContent).trim()) {
        throw new Error(`Correct answer is set to option ${label}, but that option is empty`);
      }
    } else {
      // If not a label, check if it matches one of the option texts
      const options = [
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
      ].filter(Boolean);

      if (options.length < 2) {
        throw new Error("Multiple choice question must have at least 2 options");
      }

      const validAnswers = options.map((opt) => String(opt).trim());
      if (!validAnswers.includes(question.correctAnswer.trim())) {
        throw new Error("Correct answer must be A, B, C, D or match one of the provided option texts");
      }
    }
  }

  if (question.type === "TRUE_FALSE") {
    const normalized = question.correctAnswer.trim().toUpperCase();
    if (!["TRUE", "FALSE"].includes(normalized)) {
      throw new Error('True/False question must have correctAnswer as "TRUE" or "FALSE"');
    }
  }

  return true;
};
