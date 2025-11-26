// config/adminFeatureFlags.ts
export const ADMIN_FEATURE_FLAGS = {
  // === CORE MANAGEMENT ===
  overview: true,
  schoolProfile: true,
  teachers: true,
  students: true,
  classes: true,

  // === ACADEMICS ===
  grades: true,
  exams: true,
  attendance: false,
  library: false,

  // === ADMINISTRATION ===
  finance: false,
  payments: false,
  reports: false,

  // === COMMUNICATION ===
  communication: false,
  gallery: false,

  // === ADVANCED TOOLS ===
  aiTools: false,
  simulations: false,

  // === SETTINGS ===
  settings: true,
};

export type AdminFeatureFlagKey = keyof typeof ADMIN_FEATURE_FLAGS;