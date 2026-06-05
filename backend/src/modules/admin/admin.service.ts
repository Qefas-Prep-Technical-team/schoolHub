import prisma from "../../config/database";
import { UserRole, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateUniqueCode } from "../../utils/code-generator";
import { UserSubscriptionService } from "../subscription/user-subscription.service";
import { enforceStudentLimit } from "../subscription/quota.helpers";
import { StudentLifecycleService } from "../student/student.lifecycle.service";

/**
 * Update personal admin profile
 * @param adminId The ID of the admin
 * @param data Data to update
 */
export const updateAdminProfileService = async (adminId: string, data: { name?: string; gender?: any }) => {
  return await prisma.admin.update({
    where: { id: adminId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      adminCode: true,
      verified: true,
      status: true,
      gender: true,
      profileImage: true,
      bannerImage: true,
    },
  });
};

const normalizeName = (name: string): string => {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
};

interface CreateStudentParams {
  fullName: string;
  classId: string;
  schoolId: string;
  gender?: Gender;
  adminId: string;
}

export const createStudentService = async (params: CreateStudentParams) => {
  const { fullName, classId, schoolId, gender, adminId } = params;

  // 1. Verify school exists
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  if (!school) {
    throw new Error("School not found");
  }

  // 2. Verify requesting admin is authorized for this school
  const schoolAdmin = await prisma.schoolAdmin.findFirst({
    where: {
      adminId,
      schoolId,
      active: true,
    },
  });

  const hasAccess = !!schoolAdmin;

  if (!hasAccess) {
    throw new Error("Unauthorized: You do not have permission to manage this school");
  }

  // 3. Enforce subscription student limit
  await enforceStudentLimit(schoolId);

  // 4. Verify class exists and belongs to the school
  const targetClass = await prisma.class.findFirst({
    where: {
      id: classId,
      schoolId,
    },
  });

  if (!targetClass) {
    throw new Error("Class not found in this school");
  }

  // 5. Generate unique Email & Password
  const normalizedSchool = normalizeName(school.name) || "qefashub";
  const normalizedStudent = normalizeName(fullName) || "student";

  // Query existing student emails matching the pattern student[number]@domain.com
  const existingStudents = await prisma.student.findMany({
    where: {
      schoolId,
      email: {
        startsWith: "student",
        endsWith: `@${normalizedSchool}.com`,
      },
    },
    select: { email: true },
  });

  let maxNumber = 0;
  const emailRegex = new RegExp(`^student(\\d+)@${normalizedSchool}\\.com$`, "i");

  for (const s of existingStudents) {
    const match = s.email.match(emailRegex);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) {
        maxNumber = num;
      }
    }
  }

  const nextNumber = maxNumber + 1;
  const email = `student${nextNumber}@${normalizedSchool}.com`;
  const passwordPlaintext = `${normalizedStudent}${normalizedSchool}${nextNumber}`;

  // 6. Hash password
  const passwordHash = await bcrypt.hash(passwordPlaintext, 10);

  // 7. Generate studentCode
  const studentCode = await generateUniqueCode(prisma, "student", fullName);

  // 8. Execute Database transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create Student record
    const student = await tx.student.create({
      data: {
        name: fullName.trim(),
        email: email,
        password: passwordHash,
        studentCode: studentCode,
        role: UserRole.STUDENT,
        verified: true,
        acceptedTerms: true,
        gender: gender || null,
        tenantId: school.tenantId || "default-tenant-id",
        // Note: schoolId is set in the lifecycle service to ensure enrollments are generated
      },
    });

    // Enroll in School via Lifecycle Service
    await StudentLifecycleService.enrollStudentInSchool(tx, student.id, schoolId, adminId);

    // Enroll student in class
    await tx.classEnrollment.create({
      data: {
        classId: classId,
        studentId: student.id,
      },
    });

    // Initialize Student Free Plan
    await UserSubscriptionService.initializeFreePlan(student.id, UserRole.STUDENT, tx);

    return student;
  });

  return {
    student: result,
    email,
    passwordPlaintext,
  };
};

