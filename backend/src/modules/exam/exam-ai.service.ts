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
            enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"],
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
}: {
  rawText: string;
  subjectName?: string;
  examTitle?: string;
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
              "You are an exam parser. Convert pasted exam text into structured exam questions. " +
              "Always include correct answers. Infer question type carefully. " +
              "For MCQ, map options into optionA-optionD when possible. " +
              "If an answer key exists in the text, use it. If explanations are absent, return null explanation. " +
              "If marks are absent, default to 1.",
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
}: {
  prompt: string;
  subjectName?: string;
  examTitle?: string;
  questionCount?: number;
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
              "You are an exam generation assistant. Create high-quality structured exam questions. " +
              "Every question must include a correctAnswer. " +
              "Use MULTIPLE_CHOICE, TRUE_FALSE, or SHORT_ANSWER only. " +
              "Default marks to 1 unless the prompt requires otherwise.",
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
