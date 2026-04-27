// config/studentFeatureFlags.ts
export const STUDENT_FEATURE_FLAGS = {
  // === CORE FEATURES ===
  dashboard: true,
  classes: true,
  assignments: false,
  results: true,
  attendance: true,
  exams: true,
  documents: false,

  // === COMMUNICATION ===
  messages: false,
  notifications: false,
  linking: true,

  // === PROFILE & SETTINGS ===
  profile: true,
  settings: true,
  support: false,

  // === OPTIONAL/ADVANCED FEATURES ===
  library: false,
  payments: false,
  billing: true,
  aiStudy: false,
  timetable: false,
};

export type StudentFeatureFlagKey = keyof typeof STUDENT_FEATURE_FLAGS;
