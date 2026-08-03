export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "SUPER_ADMIN";

export interface RoleTheme {
  role: string;
  label: string;
  colorName: "blue" | "green" | "pink" | "orange";
  primaryHex: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  avatarBg: string;
  activeNavBg: string;
  activeNavText: string;
  activeNavBorder: string;
  activeNavIcon: string;
  accentBg: string;
  hoverBg: string;
  glowShadow: string;
  gradientHeader: string;
}

export const ROLE_THEMES: Record<string, RoleTheme> = {
  ADMIN: {
    role: "ADMIN",
    label: "Administrator",
    colorName: "blue",
    primaryHex: "#2563eb",
    badgeBg: "bg-blue-50 dark:bg-blue-950/60",
    badgeText: "text-blue-600 dark:text-blue-400",
    badgeBorder: "border-blue-200 dark:border-blue-800/50",
    avatarBg: "bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500",
    activeNavBg: "bg-blue-500/10 dark:bg-blue-500/10",
    activeNavText: "text-blue-600 dark:text-blue-400 font-semibold",
    activeNavBorder: "border-blue-500/30 dark:border-blue-500/30",
    activeNavIcon: "text-blue-600 dark:text-blue-400",
    accentBg: "bg-blue-600",
    hoverBg: "hover:bg-blue-600",
    glowShadow: "shadow-[0_0_20px_rgba(37,99,235,0.3)]",
    gradientHeader: "from-blue-600 to-indigo-600"
  },
  TEACHER: {
    role: "TEACHER",
    label: "Teacher",
    colorName: "green",
    primaryHex: "#16a34a",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    badgeBorder: "border-emerald-200 dark:border-emerald-800/50",
    avatarBg: "bg-gradient-to-tr from-emerald-600 via-green-600 to-teal-500",
    activeNavBg: "bg-emerald-500/10 dark:bg-emerald-500/10",
    activeNavText: "text-emerald-600 dark:text-emerald-400 font-semibold",
    activeNavBorder: "border-emerald-500/30 dark:border-emerald-500/30",
    activeNavIcon: "text-emerald-600 dark:text-emerald-400",
    accentBg: "bg-emerald-600",
    hoverBg: "hover:bg-emerald-600",
    glowShadow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    gradientHeader: "from-emerald-600 to-teal-600"
  },
  STUDENT: {
    role: "STUDENT",
    label: "Student",
    colorName: "pink",
    primaryHex: "#ec4899",
    badgeBg: "bg-pink-50 dark:bg-pink-950/60",
    badgeText: "text-pink-600 dark:text-pink-400",
    badgeBorder: "border-pink-200 dark:border-pink-800/50",
    avatarBg: "bg-gradient-to-tr from-pink-600 via-rose-500 to-fuchsia-500",
    activeNavBg: "bg-pink-500/10 dark:bg-pink-500/10",
    activeNavText: "text-pink-600 dark:text-pink-400 font-semibold",
    activeNavBorder: "border-pink-500/30 dark:border-pink-500/30",
    activeNavIcon: "text-pink-600 dark:text-pink-400",
    accentBg: "bg-pink-600",
    hoverBg: "hover:bg-pink-600",
    glowShadow: "shadow-[0_0_20px_rgba(236,72,153,0.3)]",
    gradientHeader: "from-pink-600 to-rose-500"
  },
  PARENT: {
    role: "PARENT",
    label: "Parent",
    colorName: "orange",
    primaryHex: "#f97316",
    badgeBg: "bg-orange-50 dark:bg-orange-950/60",
    badgeText: "text-orange-600 dark:text-orange-400",
    badgeBorder: "border-orange-200 dark:border-orange-800/50",
    avatarBg: "bg-gradient-to-tr from-orange-600 via-amber-600 to-yellow-500",
    activeNavBg: "bg-orange-500/10 dark:bg-orange-500/10",
    activeNavText: "text-orange-600 dark:text-orange-400 font-semibold",
    activeNavBorder: "border-orange-500/30 dark:border-orange-500/30",
    activeNavIcon: "text-orange-600 dark:text-orange-400",
    accentBg: "bg-orange-600",
    hoverBg: "hover:bg-orange-600",
    glowShadow: "shadow-[0_0_20px_rgba(249,115,22,0.3)]",
    gradientHeader: "from-orange-600 to-amber-500"
  }
};

export function getRoleTheme(role?: string | null): RoleTheme {
  if (!role) return ROLE_THEMES.ADMIN;
  const upper = role.toUpperCase();
  return ROLE_THEMES[upper] || ROLE_THEMES.ADMIN;
}
