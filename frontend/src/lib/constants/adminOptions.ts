export const adminRoleOptions = [
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full system access across all schools",
    badgeColor: "purple",
  },
  {
    value: "SCHOOL_OWNER",
    label: "School Owner",
    description: "Full access to a specific school",
    badgeColor: "red",
  },
  {
    value: "PRINCIPAL",
    label: "Principal",
    description: "Academic leadership and teacher management",
    badgeColor: "blue",
  },
  {
    value: "REGISTRAR",
    label: "Registrar",
    description: "Student enrollment and records management",
    badgeColor: "green",
  },
  {
    value: "ACCOUNTANT",
    label: "Accountant",
    description: "Financial management and fee processing",
    badgeColor: "orange",
  },
  {
    value: "SUPPORT",
    label: "Support Staff",
    description: "Limited administrative access",
    badgeColor: "gray",
  },
] as const;
