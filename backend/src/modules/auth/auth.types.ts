interface RegisterStudentBody {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  tenantId?: string;
  teacherCode?: string;
}


// parent.dto.ts
export interface ParentRegisterDTO {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentCodeOrEmail?: string; // optional
}