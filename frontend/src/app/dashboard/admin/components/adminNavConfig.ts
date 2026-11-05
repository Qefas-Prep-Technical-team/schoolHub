import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  CalendarDays,
  Award,
  BookOpenCheck,
  ClipboardList,
  CheckSquare,
  LibraryBig,
  CreditCard,
  WalletCards,
  BarChart3,
  MessageSquare,
  Landmark,
  Globe,
  BrainCircuit,
  Workflow,
  Settings,
  LucideIcon,
  MailPlus,
  Shield,
  Folder,
  FileSpreadsheet,
} from "lucide-react";
import {
  ADMIN_FEATURE_FLAGS,
  AdminFeatureFlagKey,
  AdminRole,
  ROLE_NAV_PERMISSIONS,
  canAdminRoleAccessFeature,
} from "./adminFeatureFlags";

export interface AdminMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  featureKey: AdminFeatureFlagKey;
  section?: string;
}

export const adminMenuItems: AdminMenuItem[] = [
  // === CORE MANAGEMENT ===
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/admin", featureKey: "overview", section: "core" },
  { icon: Building2, label: "School Profile", href: "/dashboard/admin/school-profile", featureKey: "schoolProfile", section: "core" },
  { icon: Shield, label: "Team", href: "/dashboard/admin/team", featureKey: "team", section: "core" },
  { icon: Users, label: "Teachers", href: "/dashboard/admin/teachers", featureKey: "teachers", section: "core" },
  { icon: GraduationCap, label: "Students", href: "/dashboard/admin/students", featureKey: "students", section: "core" },
  { icon: MailPlus, label: "Invitations", href: "/dashboard/admin/invitations", featureKey: "invitations", section: "core" },
  { icon: CalendarDays, label: "Classes & Timetable", href: "/dashboard/admin/classes", featureKey: "classes", section: "core" },
  { icon: BrainCircuit, label: "Linking Hub", href: "/dashboard/admin/linking", featureKey: "linkingHub", section: "core" },
  { icon: CalendarDays, label: "Session Management", href: "/dashboard/admin/sessions", featureKey: "sessions", section: "core" },
  { icon: Globe, label: "Sub Domain", href: "/dashboard/admin/subdomain", featureKey: "subdomain", section: "core" },
  { icon: MessageSquare, label: "Inquiries", href: "/dashboard/admin/inquiries", featureKey: "subdomain", section: "core" },
  { icon: Folder, label: "Final Result", href: "/dashboard/admin/records", featureKey: "records", section: "core" },

  // === ACADEMICS ===
  { icon: Award, label: "Grades", href: "/dashboard/admin/grades", featureKey: "grades", section: "academics" },
  { icon: FileSpreadsheet, label: "Offline Grades", href: "/dashboard/admin/offline-grades", featureKey: "offlineGrades", section: "academics" },
  { icon: GraduationCap, label: "Transcripts", href: "/dashboard/admin/transcript", featureKey: "transcript", section: "academics" },
  { icon: BookOpenCheck, label: "Exam Setup", href: "/dashboard/admin/exams", featureKey: "exams", section: "academics" },
  { icon: ClipboardList, label: "Assignments", href: "/dashboard/admin/assignments", featureKey: "assignments", section: "academics" },
  { icon: BookOpenCheck, label: "Subjects", href: "/dashboard/admin/subjects", featureKey: "subjects", section: "academics" },
  { icon: Building2, label: "Departments", href: "/dashboard/admin/departments", featureKey: "departments", section: "academics" },
  { icon: CheckSquare, label: "Attendance", href: "/dashboard/admin/attendance", featureKey: "attendance", section: "academics" },
  { icon: LibraryBig, label: "Library", href: "/dashboard/admin/library", featureKey: "library", section: "academics" },

  // === ADMINISTRATION ===
  { icon: CreditCard, label: "Finance", href: "/dashboard/admin/finance", featureKey: "finance", section: "administration" },
  { icon: WalletCards, label: "Payments", href: "/dashboard/admin/payments", featureKey: "payments", section: "administration" },
  { icon: CreditCard, label: "Transaction History", href: "/dashboard/admin/transactions", featureKey: "transactionHistory", section: "administration" },
  { icon: BarChart3, label: "Reports & Analytics", href: "/dashboard/admin/reports", featureKey: "reports", section: "administration" },

  // === COMMUNICATION ===
  { icon: MessageSquare, label: "Communication", href: "/dashboard/admin/chat", featureKey: "communication", section: "communication" },
  { icon: Landmark, label: "Gallery & Media", href: "/dashboard/admin/gallery", featureKey: "gallery", section: "communication" },

  // === ADVANCED TOOLS ===
  { icon: BrainCircuit, label: "Artificial Intelligence", href: "/dashboard/admin/ai-tools", featureKey: "aiTools", section: "advanced" },
  { icon: Workflow, label: "Simulations", href: "/dashboard/admin/simulations", featureKey: "simulations", section: "advanced" },

  // === SETTINGS ===
  { icon: Settings, label: "Settings", href: "/dashboard/admin/settings", featureKey: "settings", section: "settings" },
  { icon: CreditCard, label: "Subscription", href: "/dashboard/admin/billing", featureKey: "billing", section: "settings" },
  { icon: MessageSquare, label: "Help & Support", href: "/dashboard/admin/support", featureKey: "support", section: "settings" },
];

export const SECTION_TITLES = {
  core: "Core Management",
  academics: "Academics",
  administration: "Administration",
  communication: "Communication",
  advanced: "Advanced Tools",
  settings: "Settings",
} as const;

export function buildAdminMenuSections(params: {
  dynamicFeatures?: Record<string, boolean> | null;
  publicPlatformSettings?: Record<string, unknown> | null;
  adminRole?: AdminRole | string | null;
}) {
  const { dynamicFeatures, publicPlatformSettings, adminRole } = params;
  const currentFeatures = { ...ADMIN_FEATURE_FLAGS, ...(dynamicFeatures || {}) };
  const role = adminRole as AdminRole | undefined;

  let customVisibility: Record<string, boolean> = {};
  try {
    if (publicPlatformSettings?.admin_pages_visibility) {
      customVisibility = JSON.parse(
        publicPlatformSettings.admin_pages_visibility as string,
      );
    }
  } catch {
    // ignore parse error
  }

  let customRolePermissions: Record<string, AdminRole[]> = {};
  try {
    if (publicPlatformSettings?.admin_role_permissions) {
      customRolePermissions = JSON.parse(
        publicPlatformSettings.admin_role_permissions as string,
      );
    }
  } catch {
    // ignore parse error
  }

  const filtered = adminMenuItems.filter((item) => {
    if (customVisibility[item.featureKey] === false) {
      return false;
    }

    if (item.featureKey === "finance") {
      if (customVisibility["finance"] === false) return false;
    } else {
      const isExplicitlyVisible = customVisibility[item.featureKey] === true;
      if (
        !isExplicitlyVisible &&
        !(currentFeatures as Record<string, boolean>)[item.featureKey]
      ) {
        return false;
      }
    }

    if (customRolePermissions[item.featureKey]) {
      const allowedCustom = customRolePermissions[item.featureKey];
      if (role && !allowedCustom.includes(role)) {
        if (role !== "SCHOOL_OWNER" && role !== "SUPER_ADMIN") {
          return false;
        }
      }
      return true;
    }

    return canAdminRoleAccessFeature(role, item.featureKey);
  });

  return {
    core: filtered.filter((item) => item.section === "core"),
    academics: filtered.filter((item) => item.section === "academics"),
    administration: filtered.filter((item) => item.section === "administration"),
    communication: filtered.filter((item) => item.section === "communication"),
    advanced: filtered.filter((item) => item.section === "advanced"),
    settings: filtered.filter((item) => item.section === "settings"),
  };
}

