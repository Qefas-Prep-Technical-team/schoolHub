export interface PlanLimits {
  maxStudents: number;
  maxExams: number;
  maxClasses: number;
  maxTeachers: number;
  maxStorageGb: number;
  maxAiUsage: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxStudents: 50,
    maxExams: 200,
    maxClasses: 10,
    maxTeachers: 10,
    maxStorageGb: 2,
    maxAiUsage: 20,
  },
  "INSTITUTIONAL BASIC": {
    maxStudents: 50,
    maxExams: 200,
    maxClasses: 10,
    maxTeachers: 10,
    maxStorageGb: 2,
    maxAiUsage: 20,
  },
  "INSTITUTIONAL STARTER": {
    maxStudents: 500,
    maxExams: 2000,
    maxClasses: 100,
    maxTeachers: 50,
    maxStorageGb: 20,
    maxAiUsage: 200,
  },
  "INSTITUTIONAL GROWTH": {
    maxStudents: 999999,
    maxExams: 999999,
    maxClasses: 999999,
    maxTeachers: 999999,
    maxStorageGb: 100,
    maxAiUsage: 999999,
  },
  STARTER: {
    maxStudents: 200,
    maxExams: 50,
    maxClasses: 20,
    maxTeachers: 50,
    maxStorageGb: 10,
    maxAiUsage: 100,
  },
  PRO: { // Generic intermediate fallback
    maxStudents: 1000,
    maxExams: 100,
    maxClasses: 50,
    maxTeachers: 100,
    maxStorageGb: 25,
    maxAiUsage: 500,
  },
  GROWTH: {
    maxStudents: 999999, // Reflects "Unlimited" as seen in Pricing data
    maxExams: 999999,
    maxClasses: 999999,
    maxTeachers: 999999,
    maxStorageGb: 100,
    maxAiUsage: 999999,
  },
};

export const DEFAULT_PLAN = "FREE";
