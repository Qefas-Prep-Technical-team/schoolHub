// config/parentFeatureFlags.ts
export const PARENT_FEATURE_FLAGS = {
  // === CORE FEATURES ===
  dashboard: true,
  children: true,
  assignments: true,
  results: true,
  performance: true,
  attendance: true,
  
  // === MONITORING & COMMUNICATION ===
  behavior: false,
  messages: false,
  notifications: false,
  
  // === FINANCIAL & RESOURCES ===
  payments: false,
  resources: false,
  
  // === ADVANCED TOOLS ===
  aiInsights: false,
  events: false,
  
  // === PROFILE & SETTINGS ===
  profile: true,
  settings: true,
  support: false,
};

export type ParentFeatureFlagKey = keyof typeof PARENT_FEATURE_FLAGS;