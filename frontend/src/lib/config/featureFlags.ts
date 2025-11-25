// config/featureFlags.ts
export const FEATURE_FLAGS_TEACHERS = {
  // Feature Set 1: Core Teaching Tools (ALWAYS ENABLED)
  dashboard: true,
  classes: true,
  assignments: true,
  exams: true,
  grades: true,
  students: true,

  // Feature Set 2: Daily Operations (DISABLE DURING DEVELOPMENT)
  attendance: false,
  messages: false,
  notifications: false,

  // Feature Set 3: Analytics & AI (DISABLE DURING DEVELOPMENT)
  reports: false,
  resources: false,
  aiTools: false,
  timetable: false,

  // Feature Set 4: System & Profile (ENABLE AS NEEDED)
  profile: true,
  settings: true,
  support: false,
};

export type FeatureTeacherFlagKey = keyof typeof FEATURE_FLAGS_TEACHERS;
