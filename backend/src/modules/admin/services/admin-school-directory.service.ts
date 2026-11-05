import { Gender, Prisma } from "@prisma/client";
import prisma, { withRetry } from "../../../config/database";
import { AppError } from "../../../utils/app-error";
import { resolveSchoolId } from "../../school/services/school-access.service";
import {
  getActiveSchoolStudentFilter,
  getActiveSchoolTeacherFilter,
} from "../../school/services/school-member-filters.service";

export interface GetSchoolTeachersParams {
  schoolId: string;
  search?: string;
  isClaimed?: string;
  page?: string;
  limit?: string;
}

export const getSchoolTeachersDirectoryService = async (
  params: GetSchoolTeachersParams,
) => {
  const resolvedId = await resolveSchoolId(params.schoolId);
  if (!resolvedId) {
    throw new AppError("School not found", 404);
  }

  const pageNum = Math.max(1, Number(params.page || "1"));
  const take = Math.max(1, Number(params.limit || "10"));
  const skip = (pageNum - 1) * take;

  const baseFilter = await getActiveSchoolTeacherFilter(resolvedId);
  const andConditions: Prisma.TeacherWhereInput[] = [baseFilter];

  if (params.search) {
    andConditions.push({
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { teacherCode: { contains: params.search, mode: "insensitive" } },
      ],
    });
  }

  if (params.isClaimed !== undefined && params.isClaimed !== null && params.isClaimed !== "") {
    andConditions.push({ isClaimed: params.isClaimed === "true" });
  }

  const where: Prisma.TeacherWhereInput = { AND: andConditions };

  const [total, teachers] = await withRetry(() =>
    Promise.all([
      prisma.teacher.count({ where }),
      prisma.teacher.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          teacherCode: true,
          authProvider: true,
          verified: true,
          isClaimed: true,
          profileImage: true,
          gender: true,
          phone: true,
          department: true,
          role: true,
          teacherSubjects: {
            where: { subject: { schoolId: resolvedId } },
            include: { subject: true },
          },
          classTeachers: {
            where: { class: { schoolId: resolvedId } },
            include: { class: true },
          },
        },
        orderBy: { name: "asc" },
      }),
    ]),
  );

  return {
    count: teachers.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / take),
    data: teachers,
  };
};

export interface GetSchoolStudentsParams {
  schoolId: string;
  search?: string;
  classId?: string;
  gender?: string;
  status?: string;
  lifecycleStatus?: string;
  isClaimed?: string;
  departmentId?: string;
  subjectId?: string;
  page?: string;
  limit?: string;
}

export const getSchoolStudentsDirectoryService = async (
  params: GetSchoolStudentsParams,
) => {
  const resolvedId = await resolveSchoolId(params.schoolId);
  if (!resolvedId) {
    throw new AppError("School not found", 404);
  }

  const pageNum = Math.max(1, Number(params.page || "1"));
  const take = Math.max(1, Number(params.limit || "10"));
  const skip = (pageNum - 1) * take;

  const baseSchoolCondition = await getActiveSchoolStudentFilter(resolvedId);
  const andConditions: Prisma.StudentWhereInput[] = [baseSchoolCondition];

  if (params.search) {
    andConditions.push({
      OR: [
        { name: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { studentCode: { contains: params.search, mode: "insensitive" } },
      ],
    });
  }

  if (params.classId) {
    andConditions.push({
      classes: { some: { classId: params.classId, class: { schoolId: resolvedId } } },
    });
  }

  if (params.departmentId) {
    andConditions.push({ departmentId: params.departmentId });
  }

  if (params.subjectId) {
    andConditions.push({
      studentSubjectTermResults: { some: { subjectId: params.subjectId } },
    });
  }

  if (params.gender && ["MALE", "FEMALE", "OTHER"].includes(params.gender.toUpperCase())) {
    andConditions.push({ gender: params.gender.toUpperCase() as Gender });
  }

  if (params.status) {
    andConditions.push({ verified: params.status === "verified" });
  }

  if (params.isClaimed !== undefined && params.isClaimed !== null && params.isClaimed !== "") {
    andConditions.push({ isClaimed: params.isClaimed === "true" });
  }

  if (params.lifecycleStatus) {
    const upper = params.lifecycleStatus.toUpperCase();
    if (upper === "ENROLLED") {
      andConditions.push({
        status: { notIn: ["GRADUATED", "EXPELLED", "TRANSFERRED", "WITHDRAWN"] },
      });
    } else if (["GRADUATED", "EXPELLED", "TRANSFERRED"].includes(upper)) {
      andConditions.push({ status: upper });
    }
  }

  const where: Prisma.StudentWhereInput = { AND: andConditions };

  const [
    total,
    allCount,
    enrolledCount,
    graduatedCount,
    expelledCount,
    transferredCount,
    verifiedCount,
    pendingCount,
    students,
  ] = await withRetry(() =>
    Promise.all([
      prisma.student.count({ where }),
      prisma.student.count({ where: { AND: [baseSchoolCondition] } }),
      prisma.student.count({
        where: {
          AND: [
            baseSchoolCondition,
            { status: { notIn: ["GRADUATED", "EXPELLED", "TRANSFERRED", "WITHDRAWN"] } },
          ],
        },
      }),
      prisma.student.count({ where: { AND: [baseSchoolCondition, { status: "GRADUATED" }] } }),
      prisma.student.count({ where: { AND: [baseSchoolCondition, { status: "EXPELLED" }] } }),
      prisma.student.count({ where: { AND: [baseSchoolCondition, { status: "TRANSFERRED" }] } }),
      prisma.student.count({ where: { AND: [...andConditions, { verified: true }] } }),
      prisma.student.count({ where: { AND: [...andConditions, { verified: false }] } }),
      prisma.student.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          studentCode: true,
          authProvider: true,
          verified: true,
          isClaimed: true,
          status: true,
          profileImage: true,
          gender: true,
          classes: {
            where: { class: { schoolId: resolvedId } },
            include: { class: true },
          },
          department: true,
        },
        orderBy: { name: "asc" },
      }),
    ]),
  );

  return {
    count: students.length,
    total,
    allCount,
    enrolledCount,
    graduatedCount,
    expelledCount,
    transferredCount,
    verifiedCount,
    pendingCount,
    page: pageNum,
    totalPages: Math.ceil(total / take),
    data: students,
  };
};

export const getSchoolMembersDirectoryService = async (schoolId: string) => {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) {
    throw new AppError("School not found", 404);
  }

  const [teacherFilter, studentFilter] = await Promise.all([
    getActiveSchoolTeacherFilter(resolvedId),
    getActiveSchoolStudentFilter(resolvedId),
  ]);

  const [teachers, students] = await withRetry(() =>
    Promise.all([
      prisma.teacher.findMany({
        where: teacherFilter,
        select: { id: true, name: true, email: true, teacherCode: true, role: true },
      }),
      prisma.student.findMany({
        where: studentFilter,
        select: { id: true, name: true, email: true, studentCode: true, role: true },
      }),
    ]),
  );

  return { teachers, students };
};
