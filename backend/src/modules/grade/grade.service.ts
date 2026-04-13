import prisma from "../../config/database";
import { GradeCategory, GradeStatus, Term } from "@prisma/client";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getGradeHubService = async (schoolId: string, filters: any) => {
  const where: any = { schoolId };
  
  if (filters.classId && filters.classId !== 'all') where.classId = filters.classId;
  if (filters.category && filters.category !== 'all') where.category = filters.category;
  if (filters.status && filters.status !== 'all') where.status = filters.status;
  if (filters.term && filters.term !== 'all') where.term = filters.term;
  if (filters.sessionId && filters.sessionId !== 'all') where.sessionId = filters.sessionId;
  if (filters.examId && filters.examId !== 'all') where.examId = filters.examId;
  if (filters.subjectPaperId && filters.subjectPaperId !== 'all') where.subjectPaperId = filters.subjectPaperId;

  return prisma.grade.findMany({
    where,
    include: {
      student: {
        select: { id: true, name: true, gradeLevel: true }
      },
      class: {
        select: { id: true, name: true, section: true }
      },
      session: {
        select: { id: true, name: true }
      },
      exam: {
        select: { id: true, title: true }
      },
      subjectPaper: {
        select: { id: true, title: true, subject: { select: { id: true, name: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const createGradeEntryService = async (data: any) => {
  const gradeData = {
    ...data,
    score: Number(data.score),
    maxMarks: Number(data.maxMarks),
    weight: Number(data.weight || 1.0),
  };

  // Find if it exists using the unique fields
  const existing = await prisma.grade.findFirst({
    where: {
      studentId: data.studentId,
      examId: data.examId || null,
      subjectPaperId: data.subjectPaperId || null,
    }
  });

  if (existing) {
    return prisma.grade.update({
      where: { id: existing.id },
      data: gradeData,
    });
  }

  return prisma.grade.create({
    data: gradeData,
  });
};

export const updateGradeScoreService = async (id: string, score: number, remarks?: string) => {
  return prisma.grade.update({
    where: { id },
    data: { 
      score: Number(score),
      remarks: remarks || undefined,
      updatedAt: new Date()
    }
  });
};

export const processGradeOCRService = async (imageUrl: string) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing");
  }

  console.log("[OCR] Processing image:", imageUrl);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Act as a data entry clerk. Extract the student names and their corresponding numerical scores from this image. Return the data as a JSON object with a 'grades' key containing an array: { \"grades\": [{ \"studentName\": \"string\", \"score\": number }] }. If a score is illegible, mark it as null."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please extract the grades from this mark sheet." },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    console.log("[OCR] AI Response Received");
    
    if (!content) throw new Error("AI failed to extract data");

    const parsed = JSON.parse(content);
    // Normalize to array, checking for common keys used by AI
    const grades = parsed.grades || parsed.data || (Array.isArray(parsed) ? parsed : []);
    
    return Array.isArray(grades) ? grades : [];
  } catch (error: any) {
    console.error("[OCR] Error during processing:", error.message);
    if (error.response) {
      console.error("[OCR] OpenAI Response Error:", error.response.data);
    }
    throw error;
  }
};

export const bulkCreateGradesService = async (schoolId: string, grades: any[]) => {
  // Fields that are valid on the Grade model
  const VALID_FIELDS = new Set([
    'studentId', 'schoolId', 'teacherId', 'classId', 'sessionId', 'term',
    'subject', 'category', 'assessmentType', 'status', 'score', 'maxMarks',
    'weight', 'remarks', 'examId', 'subjectPaperId', 'examAttemptId', 'subjectExamAttemptId'
  ]);

  // Resolve studentName -> studentId if studentId is missing
  const resolved = await Promise.all(
    grades.map(async (g) => {
      let studentId = g.studentId;

      if (!studentId && g.studentName) {
        const student = await prisma.student.findFirst({
          where: {
            schoolId,
            name: { contains: g.studentName, mode: 'insensitive' }
          },
          select: { id: true }
        });
        if (student) studentId = student.id;
      }

      if (!studentId) return null; // Skip rows where we can't resolve student

      // Strip unknown fields
      const clean: Record<string, any> = { schoolId };
      for (const [k, v] of Object.entries(g)) {
        if (VALID_FIELDS.has(k) && v !== undefined && v !== null && v !== '') {
          clean[k] = v;
        }
      }

      return {
        ...clean,
        studentId,
        score: Number(g.score || 0),
        maxMarks: Number(g.maxMarks || 100),
        weight: Number(g.weight || 1.0),
        status: (g.status as any) || 'DRAFT',
        category: (g.category as any) || 'EXAM',
      };
    })
  );

  const validGrades = resolved.filter(Boolean) as any[];

  if (validGrades.length === 0) {
    return { count: 0, message: 'No valid grades to create — could not resolve any student IDs.' };
  }

  // Robust alternative to 'upsert' that handles nullable fields better
  try {
    // 1. Extract common filters
    const examId = validGrades[0]?.examId || null;
    const subjectPaperId = validGrades[0]?.subjectPaperId || null;

    // 2. Fetch existing grades for these students/exam/paper combo
    const existingGrades = await prisma.grade.findMany({
      where: {
        schoolId,
        examId: examId || undefined,
        subjectPaperId: subjectPaperId || undefined,
        studentId: { in: validGrades.map(g => g.studentId) }
      }
    });

    const existingMap = new Map(existingGrades.map(g => [g.studentId, g.id]));

    // 3. Separate into updates and creates
    const operations = validGrades.map((g) => {
      const existingId = existingMap.get(g.studentId);
      if (existingId) {
        return prisma.grade.update({
          where: { id: existingId },
          data: {
            score: g.score,
            maxMarks: g.maxMarks,
            status: g.status,
            updatedAt: new Date(),
          }
        });
      } else {
        return prisma.grade.create({ data: g });
      }
    });

    const results = await prisma.$transaction(operations);
    return { count: results.length };
  } catch (error: any) {
    console.error("CRITICAL: [bulkCreateGradesService] Error during manual sync transaction:", error);
    throw error;
  }
};

export const deleteGradeService = async (id: string) => {
  return prisma.grade.delete({
    where: { id },
  });
};
