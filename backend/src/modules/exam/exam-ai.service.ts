import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL || "gpt-5.4";

const questionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    instructions: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"],
          },
          question: { type: "string" },
          optionA: { type: ["string", "null"] },
          optionB: { type: ["string", "null"] },
          optionC: { type: ["string", "null"] },
          optionD: { type: ["string", "null"] },
          correctAnswer: { type: "string" },
          explanation: { type: ["string", "null"] },
          marks: { type: "number" },
        },
        required: [
          "type",
          "question",
          "optionA",
          "optionB",
          "optionC",
          "optionD",
          "correctAnswer",
          "explanation",
          "marks",
        ],
      },
    },
  },
  required: ["title", "instructions", "questions"],
};

export const parseRawExamTextToStructuredQuestions = async ({
  rawText,
  subjectName,
  examTitle,
  questionType,
}: {
  rawText: string;
  subjectName?: string;
  examTitle?: string;
  questionType?: string;
}) => {
  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are a specialized Exam & Quiz Parser. Convert pasted exam text into perfectly structured, render-ready exam questions.\n" +
              "LATEX FORMATTING RULES (MANDATORY):\n" +
              "- Any formula, equation, chemical notation, or scientific symbol MUST be wrapped in LaTeX delimiters.\n" +
              "- Use $ ... $ (with spaces) for INLINE expressions. Example: 'Solve for $x$ in the equation $2x + 3 = 7$.'\n" +
              "- Use $$ ... $$ for standalone/block equations that deserve their own line. Example: $$\\frac{d}{dx}(x^2) = 2x$$\n" +
              "- Use \\frac{numerator}{denominator} for ALL fractions. Do NOT use the / character for math fractions.\n" +
              "- Use \\sqrt{expression} for square roots and \\sqrt[n]{expression} for n-th roots.\n" +
              "- Use ^ for superscripts (exponents): $x^2$, $e^{i\\pi}$.\n" +
              "- Use _ for subscripts: $H_2O$, $a_n$.\n" +
              "- Use \\times for multiplication (not x or *): $3 \\times 4 = 12$.\n" +
              "- Use \\pm for plus-minus: $\\pm 5$.\n" +
              "- Use \\pi, \\theta, \\alpha, \\beta, \\lambda, \\Sigma for Greek letters.\n" +
              "- Use \\sin, \\cos, \\tan, \\log, \\ln for functions (not sin, cos, etc.).\n" +
              "JSON ESCAPING: In JSON strings, write all LaTeX backslashes as double backslashes (\\\\). For example: \"\\\\frac{1}{2}\" renders as \\frac{1}{2}.\n" +
              "CORRECTNESS: For MULTIPLE_CHOICE, correctAnswer MUST be exactly 'A', 'B', 'C', or 'D'. Apply LaTeX to optionA-optionD as needed.\n" +
              "If explanations are absent in the source text, return null for explanation."
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              `Exam title: ${examTitle || "Untitled Exam"}\n` +
              `Subject: ${subjectName || "Unknown Subject"}\n\n` +
              (questionType ? `MANDATORY RULE: YOU MUST PARSE THE TEXT AND OUTPUT ONLY QUESTIONS OF TYPE: ${questionType}. Ignore or adapt text that doesn't fit.\n\n` : "") +
              `Raw exam text:\n${rawText}`,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "parsed_exam_questions",
        schema: questionSchema,
        strict: true,
      },
    },
  });

  const content = response.output_text;
  return JSON.parse(content);
};

export const generateStructuredExamQuestionsFromPrompt = async ({
  prompt,
  subjectName,
  examTitle,
  questionCount = 20,
  questionType,
}: {
  prompt: string;
  subjectName?: string;
  examTitle?: string;
  questionCount?: number;
  questionType?: string;
}) => {
  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are a specialized Exam & Quiz Content Creator. Generate high-quality, pedagogically sound exam questions.\n" +
              "LATEX FORMATTING RULES (MANDATORY):\n" +
              "- Any formula, equation, chemical notation, or scientific symbol MUST be wrapped in LaTeX delimiters.\n" +
              "- Use $ ... $ (with spaces) for INLINE expressions. Example: 'What is the value of $\\pi$ to 2 decimal places?'\n" +
              "- Use $$ ... $$ for standalone/block equations that deserve their own line. Example: $$E = mc^2$$\n" +
              "- Use \\frac{numerator}{denominator} for ALL fractions. Example: $\\frac{1}{2}$, not '1/2'.\n" +
              "- Use \\sqrt{expression} for square roots: $\\sqrt{x^2 + y^2}$.\n" +
              "- Use ^ for superscripts: $x^2$, $10^{-3}$. Use _ for subscripts: $H_2O$, $CO_2$.\n" +
              "- Use \\times for multiplication: $3 \\times 10^8$.\n" +
              "- Use \\pm for plus-minus: $x = \\pm 5$.\n" +
              "- Use \\pi, \\theta, \\alpha, \\beta, \\lambda, \\Sigma for common Greek letters.\n" +
              "- Use \\sin, \\cos, \\tan, \\log, \\ln for function names: $\\sin(\\theta)$.\n" +
              "JSON ESCAPING: In JSON strings, ALL LaTeX backslashes must be doubled (\\\\). Example: \"\\\\frac{1}{2}\" in JSON renders as $\\frac{1}{2}$.\n" +
              "CORRECTNESS: For MULTIPLE_CHOICE, correctAnswer MUST be exactly 'A', 'B', 'C', or 'D'. Apply LaTeX formatting to options as needed.\n" +
              "QUESTION TYPES: Use MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, or ESSAY only."
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text:
              `Exam title: ${examTitle || "Generated Exam"}\n` +
              `Subject: ${subjectName || "Unknown Subject"}\n` +
              `Question count: ${questionCount}\n\n` +
              (questionType ? `MANDATORY RULE: YOU MUST ONLY GENERATE QUESTIONS OF TYPE: ${questionType}. Do not generate any other type.\n\n` : "") +
              `Prompt:\n${prompt}`,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "generated_exam_questions",
        schema: questionSchema,
        strict: true,
      },
    },
  });

  const content = response.output_text;
  return JSON.parse(content);
};

export const generateStudentPerformanceInsight = async ({
  studentName,
  totalScore,
  totalMarks,
  grade,
  proficiency,
  subjects,
}: {
  studentName: string;
  totalScore: number;
  totalMarks: number;
  grade: string;
  proficiency: string;
  subjects: any[];
}) => {
  try {
    const percentage = Math.round((totalScore / totalMarks) * 100);
    const subjectData = subjects.map(s => `${s.subjectName}: ${Math.round((s.score / s.totalMarks) * 100)}%`).join(", ");

    const response = await client.chat.completions.create({
      model: "gpt-4o", // Using a standard chat model for insights
      messages: [
        {
          role: "system",
          content: "You are the Registrar of a top Nigerian academic institution. Provide a professional, encouraging, and data-driven academic insight for a student's performance report. Your response should be a single paragraph (max 60 words), include specific suggestions for improvement, and reflect Nigerian academic excellence standards."
        },
        {
          role: "user",
          content: `Student Name: ${studentName}\nOverall Percentage: ${percentage}%\nWAEC Grade: ${grade}\nProficiency: ${proficiency}\nSubject Breakdown: ${subjectData}`
        }
      ],
      max_tokens: 150,
    });

    return response.choices[0]?.message?.content || "The student exhibits consistent engagement and has a solid path towards future academic excellence.";
  } catch (error) {
    console.error("AI Insight Generation Error:", error);
    return "The student exhibits consistent engagement and has a solid path towards future academic excellence.";
  }
};
