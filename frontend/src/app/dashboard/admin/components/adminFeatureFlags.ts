// config/adminFeatureFlags.ts
export const ADMIN_FEATURE_FLAGS = {
  // === CORE MANAGEMENT ===
  overview: true,
  schoolProfile: true,
  team: true,
  teachers: true,
  students: true,
  invitations: true,
  classes: true,
  sessions: true,
  subdomain: true,

  // === ACADEMICS ===
  grades: true,
  exams: true,
  assignments: true,
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
  support: false,
};

export type AdminFeatureFlagKey = keyof typeof ADMIN_FEATURE_FLAGS;

/**
 * RBAC: Which admin roles are allowed to see each nav item.
 * If a key is omitted, ALL roles can see it (no restriction).
 * SCHOOL_OWNER always sees everything.
 */
export type AdminRole = "SCHOOL_OWNER" | "PRINCIPAL" | "REGISTRAR" | "ACCOUNTANT" | "SUPPORT";

export const ROLE_NAV_PERMISSIONS: Partial<Record<AdminFeatureFlagKey, AdminRole[]>> = {
  // Only owner & principal manage the team
  team: ["SCHOOL_OWNER", "PRINCIPAL"],

  // School profile: owner and principal only
  schoolProfile: ["SCHOOL_OWNER", "PRINCIPAL"],

  // Finance-related: owner and accountant
  finance: ["SCHOOL_OWNER", "ACCOUNTANT"],
  payments: ["SCHOOL_OWNER", "ACCOUNTANT"],
  transactionHistory: ["SCHOOL_OWNER", "ACCOUNTANT"],
  billing: ["SCHOOL_OWNER", "ACCOUNTANT"],

  // Academics-related: restrict from accountant
  grades: ["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR", "SUPPORT"],
  exams: ["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR", "SUPPORT"],
  assignments: ["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR", "SUPPORT"],
  subjects: ["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR", "SUPPORT"],
  departments: ["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR", "SUPPORT"],
  attendance: ["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR", "SUPPORT"],

  // Settings: owner only
  settings: ["SCHOOL_OWNER"],

  // Subdomain: owner only
  subdomain: ["SCHOOL_OWNER"],

  // Invitations: owner, principal, registrar
  invitations: ["SCHOOL_OWNER", "PRINCIPAL", "REGISTRAR"],

  // Sessions: owner, principal
  sessions: ["SCHOOL_OWNER", "PRINCIPAL"],

  // Linking hub: owner, principal
  linkingHub: ["SCHOOL_OWNER", "PRINCIPAL"],
};
