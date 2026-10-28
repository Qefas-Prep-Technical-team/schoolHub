import prisma from "../../../config/database";
import { z } from "zod";

export const CreateFaqSchema = z.object({
  category: z.string().min(1, "Category is required"),
  categoryLabel: z.string().optional().nullable(),
  question: z.string().min(3, "Question must be at least 3 characters"),
  summary: z.string().min(3, "Summary is required"),
  answer: z.array(z.string()).min(1, "At least one answer step or bullet point is required"),
  targetRole: z.string().default("TEACHER"),
  order: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const UpdateFaqSchema = CreateFaqSchema.partial();

export type CreateFaqInput = z.infer<typeof CreateFaqSchema>;
export type UpdateFaqInput = z.infer<typeof UpdateFaqSchema>;

export interface SupportFaqData {
  id: string;
  category: string;
  categoryLabel: string | null;
  question: string;
  summary: string;
  answer: string[];
  targetRole: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class FaqService {
  /**
   * Get FAQs with optional role filtering
   */
  static async getFaqs(targetRole?: string, includeUnpublished = false): Promise<SupportFaqData[]> {
    const where: Record<string, unknown> = {};

    if (!includeUnpublished) {
      where.isPublished = true;
    }

    if (targetRole && targetRole !== "ALL") {
      where.OR = [
        { targetRole },
        { targetRole: "ALL" }
      ];
    }

    const faqs = await prisma.supportFaq.findMany({
      where,
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });

    // If database has 0 FAQs, automatically seed initial default FAQs
    if (faqs.length === 0) {
      await this.seedInitialFaqs();
      return prisma.supportFaq.findMany({
        where,
        orderBy: [
          { order: "asc" },
          { createdAt: "asc" },
        ],
      });
    }

    return faqs;
  }

  /**
   * Get single FAQ by ID
   */
  static async getFaqById(id: string): Promise<SupportFaqData | null> {
    return prisma.supportFaq.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new FAQ entry
   */
  static async createFaq(data: CreateFaqInput): Promise<SupportFaqData> {
    const parsed = CreateFaqSchema.parse(data);
    return prisma.supportFaq.create({
      data: {
        category: parsed.category,
        categoryLabel: parsed.categoryLabel ?? null,
        question: parsed.question,
        summary: parsed.summary,
        answer: parsed.answer,
        targetRole: parsed.targetRole || "TEACHER",
        order: parsed.order ?? 0,
        isPublished: parsed.isPublished ?? true,
      },
    });
  }

  /**
   * Update an existing FAQ entry
   */
  static async updateFaq(id: string, data: UpdateFaqInput): Promise<SupportFaqData> {
    const parsed = UpdateFaqSchema.parse(data);
    return prisma.supportFaq.update({
      where: { id },
      data: {
        ...parsed,
        categoryLabel: parsed.categoryLabel !== undefined ? parsed.categoryLabel : undefined,
      },
    });
  }

  /**
   * Delete an FAQ entry
   */
  static async deleteFaq(id: string): Promise<{ id: string; success: boolean }> {
    await prisma.supportFaq.delete({
      where: { id },
    });
    return { id, success: true };
  }

  /**
   * Seeds the database with default platform & teacher FAQs if table is empty
   */
  static async seedInitialFaqs(): Promise<void> {
    const count = await prisma.supportFaq.count();
    if (count > 0) return;

    const initialFaqs: CreateFaqInput[] = [
      {
        category: "Continuous Assessment & Grading",
        categoryLabel: "Grading & Evaluation",
        question: "How are Continuous Assessment (CA) and Exam scores calculated?",
        summary: "Understand the weighted composite percentage and automated GPA grade boundaries.",
        answer: [
          "Qefas Hub uses standard weighted percentage aggregates configured by your institution (e.g. 20% First CA + 20% Second CA + 60% Exam = 100%).",
          "When you input scores on the Grades portal, the system automatically checks against maximum achievable marks for each assessment.",
          "The system computes cumulative totals instantly and translates them into letter grades (A1, B2, B3, C4, C5, C6, D7, E8, F9) and GPA points (0.00 – 4.00 or 0.00 – 5.00 based on institution policy).",
          "Important: Once scores are approved and officially signed off by the Principal or Examination Officer, the record is locked against modifications to safeguard academic integrity."
        ],
        targetRole: "TEACHER",
        order: 1,
        isPublished: true,
      },
      {
        category: "Offline Grades & Spreadsheet Sync",
        categoryLabel: "Data Synchronization",
        question: "How do I work offline and safely sync grades back later?",
        summary: "Download official CSV/Excel templates, enter marks offline, and upload without merge conflicts.",
        answer: [
          "Navigate to 'Offline Grades' in your left sidebar menu.",
          "Select your assigned class and subject, then click 'Download Grade Sheet Template'. The generated template includes secure system student identifiers.",
          "Fill in your scores using Excel, Google Sheets, or WPS Office. Never modify the first column containing Student IDs or Class Codes.",
          "When you regain internet connectivity, return to the 'Offline Grades' page and drag-and-drop the saved spreadsheet. The preview engine will validate every row for errors before synchronizing directly into the database."
        ],
        targetRole: "TEACHER",
        order: 2,
        isPublished: true,
      },
      {
        category: "Daily Attendance & Roll Call",
        categoryLabel: "Classroom Management",
        question: "How do I record class attendance and notify parents of unexcused absences?",
        summary: "Mark presence, excused absences, and late arrivals in seconds.",
        answer: [
          "Open your class roster from 'Classes' or 'Attendance' on your dashboard.",
          "Use the 'Mark All Present' quick button to set everyone to present with one tap, then individually toggle students who are absent or late.",
          "For excused absences, click the note icon to attach an explanatory reason (e.g. Medical, Family Emergency, Official School Representation).",
          "Once saved, parent portals and SMS/email notifications are automatically updated based on the institution's automated attendance alert configuration."
        ],
        targetRole: "TEACHER",
        order: 3,
        isPublished: true,
      },
      {
        category: "Digital Exams & Quizzes",
        categoryLabel: "Examinations",
        question: "How do I create and submit exam papers for administrative approval?",
        summary: "Create paper blueprints, import question banks, and request Principal approval.",
        answer: [
          "Go to 'Exams & Quizzes' -> 'Create New Paper'.",
          "Select whether the paper is purely objective (multiple-choice), theory/structured essay, or a hybrid paper.",
          "Add questions manually or use the AI Question Generator by providing your syllabus topic and target difficulty level.",
          "Once finalized, click 'Submit for Administrative Approval'. Your School Principal or Exam Officer will receive an instant alert to review and certify the questions before the exam goes live to students."
        ],
        targetRole: "TEACHER",
        order: 4,
        isPublished: true,
      },
      {
        category: "Timetable & Hall Scheduling",
        categoryLabel: "Scheduling",
        question: "What should I do if there is a lecture hall or timetable clash?",
        summary: "Escalate period collisions directly to the timetable committee or administration.",
        answer: [
          "Review your weekly schedule on 'Timetable' to verify period numbers and allocated classroom halls.",
          "If two subjects or classes have been scheduled in the same physical venue or at the same time, switch to the 'Complaints' tab on this Support page.",
          "Select 'Classroom & Facility Issue' or 'Timetable Conflict' as the category and specify the affected date, period, and subject code.",
          "The academic directorate will receive high-priority dispatch to resolve the scheduling collision."
        ],
        targetRole: "TEACHER",
        order: 5,
        isPublished: true,
      },
      {
        category: "Multi-School Teaching & Linking",
        categoryLabel: "Account & Profile",
        question: "How do I switch between different schools where I teach?",
        summary: "Manage multiple institutions using a single unified teacher account.",
        answer: [
          "You do not need multiple logins. In the top navigation bar, click the School Switcher dropdown beside your profile.",
          "All institutions where your teacher account is linked will be listed with their official badges.",
          "Click on any institution to instantly load that school's classes, students, exams, and academic calendar."
        ],
        targetRole: "TEACHER",
        order: 6,
        isPublished: true,
      },
    ];

    for (const faq of initialFaqs) {
      await prisma.supportFaq.create({
        data: {
          category: faq.category,
          categoryLabel: faq.categoryLabel ?? null,
          question: faq.question,
          summary: faq.summary,
          answer: faq.answer,
          targetRole: faq.targetRole,
          order: faq.order,
          isPublished: faq.isPublished,
        },
      });
    }
  }
}
