/**
 * Centralized Route Configuration for SchoolHub
 */
export const ROUTES = {
  AUTH: {
    LOGIN: {
      STUDENT: "/login/student",
      TEACHER: "/login/teacher",
      ADMIN: "/login/school-admin",
      PARENT: "/login/parent",
    },
    SIGNUP: {
      STUDENT: "/signup/student",
      TEACHER: "/signup/teacher",
      PARENT: "/signup/parent",
    },
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFICATION: "/verification",
    ONBOARDING: "/onboarding",
  },
  DASHBOARD: {
    STUDENT: "/dashboard/student",
    TEACHER: "/dashboard/teacher",
    ADMIN: "/dashboard/admin",
    PARENT: "/dashboard/parent",
  },
};
