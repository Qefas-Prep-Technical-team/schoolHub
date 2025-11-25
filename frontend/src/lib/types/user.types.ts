// types/user.types.ts
export enum UserRole {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
  GUEST = "GUEST",
}

export enum AdminRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  SCHOOL_OWNER = "SCHOOL_OWNER",
  PRINCIPAL = "PRINCIPAL",
  REGISTRAR = "REGISTRAR",
  ACCOUNTANT = "ACCOUNTANT",
  SUPPORT = "SUPPORT",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  verified: boolean;
  createdAt: Date;
}

export interface AdminUser extends User {
  status: "PENDING" | "APPROVED" | "REJECTED";
  tenantIds: string[];
  adminRole?: AdminRole;
  schoolId?: string;
}

export interface TeacherUser extends User {
  teacherCode: string;
  subject?: string;
  department?: string;
  schoolId?: string;
  tenantIds: string[];
}

export interface StudentUser extends User {
  studentCode: string;
  gradeLevel?: string;
  dateOfBirth?: Date;
  schoolId?: string;
  tenantIds: string[];
  teacherCode?: string;
}

export interface ParentUser extends User {
  phone?: string;
  children: string[]; // student IDs or codes
}

export type AnyUser = AdminUser | TeacherUser | StudentUser | ParentUser;

// Registration related types
export interface RegistrationData {
  email: string;
  userType: UserRole;
  name: string;
  schoolName?: string;
  schoolId?: string;
  tenantId?: string;
  teacherCode?: string;
  studentCode?: string;
}

// Verification related types
export interface VerificationData {
  email: string;
  code: string;
  userType: UserRole;
}

// Login related types
export interface LoginData {
  email: string;
  password: string;
  userType: UserRole;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: AnyUser;
    accessToken: string;
    refreshToken?: string;
  };
  userRole?: UserRole;
}

