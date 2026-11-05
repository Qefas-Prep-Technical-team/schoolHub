import prisma, { withRetry } from "../../../config/database";
import { Gender, Prisma } from "@prisma/client";
import { resolveSchoolId } from "./school-access.service";
import {
  getActiveSchoolStudentFilter,
  getActiveSchoolTeacherFilter,
} from "./school-member-filters.service";

export { getActiveSchoolStudentFilter, getActiveSchoolTeacherFilter };

/**
 * Fetch all teachers linked to a school via active RelationshipLinks or direct school assignment.
 */
export const getSchoolTeachersService = async (schoolId: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return [];

  const teacherWhere = await getActiveSchoolTeacherFilter(resolvedId);

  return withRetry(
    () =>
      prisma.teacher.findMany({
        where: teacherWhere,
        select: {
          id: true,
          name: true,
          email: true,
          teacherCode: true,
          authProvider: true,
          verified: true,
          role: true,
          gender: true,
          primarySchoolId: true,
          activeSchoolId: true,
          currentSchoolId: true,
          schoolId: true,
          isClaimed: true,
          teacherSubjects: {
            where: { schoolId: resolvedId },
            include: { subject: true },
          },
          classTeachers: {
            where: { class: { schoolId: resolvedId } },
            include: { class: true },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
    "school.getSchoolTeachersService",
  );
};

export interface SchoolStudentFilters {
  classId?: string;
  departmentId?: string;
  gender?: Gender | string;
  verified?: boolean;
  search?: string;
}

/**
 * Fetch all students linked to a school via active RelationshipLinks or direct schoolId
 */
export const getSchoolStudentsService = async (
  schoolId: string,
  filters: SchoolStudentFilters = {},
) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return { data: [], total: 0 };

  const baseStudentWhere = await getActiveSchoolStudentFilter(resolvedId);
  const andConditions: Prisma.StudentWhereInput[] = [baseStudentWhere];

  if (filters.classId) {
    andConditions.push({
      classes: {
        some: {
          classId: filters.classId,
          class: { schoolId: resolvedId },
        },
      },
    });
  }

  if (filters.departmentId) {
    andConditions.push({
      departmentId: filters.departmentId,
    });
  }

  if (filters.gender) {
    andConditions.push({ gender: filters.gender as Gender });
  }

  if (filters.verified !== undefined) {
    andConditions.push({ verified: filters.verified });
  }

  if (filters.search) {
    andConditions.push({
      OR: [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { studentCode: { contains: filters.search, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.StudentWhereInput = { AND: andConditions };

  const [data, total] = await Promise.all([
    withRetry(
      () =>
        prisma.student.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            studentCode: true,
            authProvider: true,
            verified: true,
            role: true,
            gender: true,
            profileImage: true,
            bannerImage: true,
            classes: {
              where: { class: { schoolId: resolvedId } },
              include: {
                class: true,
              },
            },
            department: true,
            departmentId: true,
          },
          orderBy: {
            name: "asc",
          },
        }),
      "school.getSchoolStudentsService.findMany",
    ),
    withRetry(
      () => prisma.student.count({ where }),
      "school.getSchoolStudentsService.count",
    ),
  ]);

  return { data, total };
};
