import prisma, { withRetry } from "../../../config/database";
import * as recordsService from "../records.service";

export interface ResolvePublishedResultsContextParams {
  userId?: string;
  userType?: string;
  schoolIdFromToken?: string;
  queryStudentId?: string;
}

export async function resolveAndFetchPublishedResultsService(
  params: ResolvePublishedResultsContextParams,
) {
  const isStaff =
    params.userType === "ADMIN" || params.userType === "TEACHER";

  // SECURITY FIX: Never grant isAdmin = true just because queryStudentId was passed
  const isAdmin = isStaff;

  let studentId = params.userId;

  if (params.queryStudentId) {
    if (isStaff) {
      studentId = params.queryStudentId;
    } else if (params.userType === "PARENT" && params.userId) {
      // Verify active parent-child link before allowing a parent to query a child's published results
      const link = await withRetry(
        () =>
          prisma.parentChildLink.findFirst({
            where: {
              parentId: params.userId,
              studentId: params.queryStudentId,
              status: { in: ["active", "ACCEPTED", "Active", "approved"] },
            },
            select: { studentId: true },
          }),
        "records.publishedResults.verifyParentChildLink",
      );
      if (!link) {
        return {
          status: 403 as const,
          body: {
            success: false,
            message: "Forbidden: You are not linked to this student account",
          },
        };
      }
      studentId = link.studentId;
    }
    // If STUDENT, ignore queryStudentId or enforce their own userId
  }

  if (!studentId) {
    return {
      status: 401 as const,
      body: { success: false, message: "Authentication required" },
    };
  }

  // Always resolve the target student's schoolId (especially for parents or graduated students)
  let schoolId = params.schoolIdFromToken;
  if (!schoolId || params.userType === "PARENT") {
    const student = await withRetry(
      () =>
        prisma.student.findUnique({
          where: { id: studentId },
          select: { schoolId: true, originalSchoolId: true },
        }),
      "records.publishedResults.findStudentSchool",
    );
    const resolvedStudentSchoolId =
      student?.schoolId || student?.originalSchoolId;
    if (!resolvedStudentSchoolId) {
      return {
        status: 400 as const,
        body: { success: false, message: "School not found for your account" },
      };
    }
    schoolId = resolvedStudentSchoolId;
  }

  const results = await recordsService.getMyPublishedResults(
    studentId,
    schoolId,
    isAdmin,
  );
  return { status: 200 as const, body: { success: true, data: results } };
}
