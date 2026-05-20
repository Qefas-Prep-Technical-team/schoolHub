// config/adminFeatureFlags.ts
export const ADMIN_FEATURE_FLAGS = {
  // === CORE MANAGEMENT ===
  overview: true,
  schoolProfile: true,
  teachers: true,
  students: true,
  classes: true,
  sessions: true,
  subdomain: true,

  // === ACADEMICS ===
  grades: true,
  exams: true,
  attendance: true,
  library: false,
  departments: true,
  subjects: true,

  // === ADMINISTRATION ===
  finance: true,
  payments: true,
  transactionHistory: true,
  globalTransactions: true,
  billing: true,
  reports: false,

  // === COMMUNICATION ===
  communication: false,
  gallery: false,
  linkingHub: true,

  // === ADVANCED TOOLS ===
  aiTools: false,
  simulations: false,

  // === SETTINGS ===
  settings: true,
  support: true,
};

export type AdminFeatureFlagKey = keyof typeof ADMIN_FEATURE_FLAGS;
