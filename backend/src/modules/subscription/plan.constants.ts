export interface PlanLimits {
  maxStudents: number;
  maxExams: number;
  maxClasses: number;
  maxStorageGb: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: {
    maxStudents: 50,
    maxExams: 5,
    maxClasses: 3,
    maxStorageGb: 1,
  },
  STARTER: {
    maxStudents: 200,
    maxExams: 50,
    maxClasses: 20,
    maxStorageGb: 10,
  },
  PRO: { // Generic intermediate fallback
    maxStudents: 1000,
    maxExams: 100,
    maxClasses: 50,
    maxStorageGb: 25,
  },
  GROWTH: {
    maxStudents: 999999, // Reflects "Unlimited" as seen in Pricing data
    maxExams: 999999,
    maxClasses: 999999,
    maxStorageGb: 100,
  },
};

export const DEFAULT_PLAN = "FREE";
