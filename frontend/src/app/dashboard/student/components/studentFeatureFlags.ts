// config/studentFeatureFlags.ts
export const STUDENT_FEATURE_FLAGS = {
  // === CORE FEATURES ===
  dashboard: true,
  classes: true,
  assignments: true,
  results: true,
  attendance: true,
  
  // === COMMUNICATION ===
  messages: false,
  notifications: false,
  
  // === PROFILE & SETTINGS ===
  profile: true,
  settings: true,
  support: false,
  
  // === OPTIONAL/ADVANCED FEATURES ===
  exams: false,
  library: false,
  payments: false,
  aiStudy: false,
  timetable: false,
};

export type StudentFeatureFlagKey = keyof typeof STUDENT_FEATURE_FLAGS;