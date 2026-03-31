import { hasActiveSchoolAccess } from "utils/school-access";
import prisma from "../../config/database";
import { generateUniqueClassCode } from "../../utils/class-code-generator";
import {
  ClassScope,
  ClassStatus,
  LinkEntityType,
  LinkRequestStatus,
  LinkType,
  UserRole,
} from "@prisma/client";
import { updateCurrentSchoolContext } from "utils/update-current-school";
import { hasActiveSchoolLink } from "../academic/academic.permissions";

type CreateClassInput = {
  currentUserId: string;
  currentUserType: UserRole;
  name: string;
  section?: string;
  scope: ClassScope;
  schoolId?: string;
  subjectIds?: string[];
  departmentIds?: string[];
  teacherIds?: string[];
  studentIds?: string[];
};

export const createClassService = async ({
  currentUserId,
  currentUserType,
  name,
  section,
  scope,
  schoolId,
  subjectIds = [],
  departmentIds = [],
  teacherIds = [],
  studentIds = [],
}: CreateClassInput) => {
  const classCode = await generateUniqueClassCode(name);

  if (currentUserType === UserRole.ADMIN) {
    if (scope === ClassScope.PERSONAL) {
      throw new Error("Admins cannot create personal classes");
    }

    if (!schoolId) {
      throw new Error("schoolId is required for school class");
    }

    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: currentUserId,
        schoolId,
        active: true,
      },
    });

    if (!schoolAdmin) {
      throw new Error("You are not allowed to create a class in this school");
    }

    return prisma.class.create({
      data: {
        name,
        section: section || null,
        schoolId,
        classCode,
        scope,
        status: ClassStatus.ACTIVE,
        createdById: currentUserId,
        createdByType: LinkEntityType.ADMIN,
        subjects: {
          create: subjectIds.map((subjectId) => ({ subjectId })),
        },
        departments: {
          create: departmentIds.map((departmentId) => ({ departmentId })),
        },
        enrollments: {
          create: studentIds.filter(Boolean).map((studentId) => ({ studentId })),
        },
      },
      include: {
        school: true,
        teachers: { include: { teacher: true } },
        subjects: { include: { subject: true } },
        departments: { include: { department: true } },
        enrollments: { include: { student: true } },
      },
    });
  }

  if (currentUserType !== UserRole.TEACHER) {
    throw new Error("Only teachers and admins can create classes");
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: currentUserId },
  });

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  if (scope === ClassScope.PERSONAL) {
    return prisma.class.create({
      data: {
        name,
        section: section || null,
        schoolId: null,
        teachers: {
          create: { teacherId: teacher.id, isLead: true }
        },
        classCode,
        scope: ClassScope.PERSONAL,
        status: ClassStatus.ACTIVE,
        createdById: teacher.id,
        createdByType: LinkEntityType.TEACHER,
        subjects: {
          create: subjectIds.map((subjectId) => ({ subjectId })),
        },
        departments: {
          create: departmentIds.map((departmentId) => ({ departmentId })),
        },
      },
      include: {
        school: true,
        teachers: { include: { teacher: true } },
        subjects: { include: { subject: true } },
        departments: { include: { department: true } },
        enrollments: { include: { student: true } },
      },
    });
  }

  if (scope === "SCHOOL") {
    if (!schoolId) {
      throw new Error("schoolId is required for school class");
    }

    const allowed = await hasActiveSchoolAccess({
      userId: currentUserId,
      userType: currentUserType,
      schoolId,
    });

    if (!allowed) {
      throw new Error("You are not linked to this school");
    }
    await updateCurrentSchoolContext({
      userId: currentUserId,
      userType: currentUserType,
      schoolId,
    });
  }

  return prisma.class.create({
    data: {
      name,
      section: section || null,
      schoolId: teacher.schoolId,
      teachers: {
        create: { teacherId: teacher.id, isLead: true }
      },
      classCode,
      scope: ClassScope.SCHOOL,
      status: ClassStatus.PENDING,
      createdById: teacher.id,
      createdByType: LinkEntityType.TEACHER,
      subjects: {
        create: subjectIds.map((subjectId) => ({ subjectId })),
      },
      departments: {
        create: departmentIds.map((departmentId) => ({ departmentId })),
      },
      enrollments: {
        create: studentIds.map((studentId) => ({ studentId })),
      },
    },
    include: {
      school: true,
      teachers: { include: { teacher: true } },
      subjects: { include: { subject: true } },
      enrollments: { include: { student: true } },
    },
  });
};

export const approveClassService = async (classId: string, adminId: string) => {
  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!foundClass) {
    throw new Error("Class not found");
  }

  if (!foundClass.schoolId) {
    throw new Error("Personal classes do not require approval");
  }

  const schoolAdmin = await prisma.schoolAdmin.findFirst({
    where: {
      adminId,
      schoolId: foundClass.schoolId,
      active: true,
    },
  });

  if (!schoolAdmin) {
    throw new Error("You are not allowed to approve this class");
  }

  return prisma.class.update({
    where: { id: classId },
    data: { status: ClassStatus.ACTIVE },
  });
};

export const rejectClassService = async (classId: string, adminId: string) => {
  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!foundClass) {
    throw new Error("Class not found");
  }

  if (!foundClass.schoolId) {
    throw new Error("Personal classes do not require rejection");
  }

  const schoolAdmin = await prisma.schoolAdmin.findFirst({
    where: {
      adminId,
      schoolId: foundClass.schoolId,
      active: true,
    },
  });

  if (!schoolAdmin) {
    throw new Error("You are not allowed to reject this class");
  }

  return prisma.class.update({
    where: { id: classId },
    data: { status: ClassStatus.REJECTED },
  });
};

export const getClassesService = async ({
  currentUserId,
  currentUserType,
  schoolId,
}: {
  currentUserId: string;
  currentUserType: UserRole;
  schoolId?: string;
}) => {
  if (currentUserType === UserRole.ADMIN) {
    if (!schoolId) {
      throw new Error("schoolId is required for admin class listing");
    }

    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: {
        adminId: currentUserId,
        schoolId,
        active: true,
      },
    });

    if (!schoolAdmin) {
      throw new Error("You are not allowed to view classes in this school");
    }

    return prisma.class.findMany({
      where: { schoolId },
      include: {
        school: true,
        teachers: { include: { teacher: true } },
        subjects: { include: { subject: true } },
        departments: { include: { department: true } },
        enrollments: { include: { student: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (currentUserType === UserRole.TEACHER) {
    return prisma.class.findMany({
      where: { teachers: { some: { teacherId: currentUserId } } },
      include: {
        school: true,
        teachers: { include: { teacher: true } },
        subjects: { include: { subject: true } },
        departments: { include: { department: true } },
        enrollments: { include: { student: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (currentUserType === UserRole.STUDENT) {
    return prisma.classEnrollment.findMany({
      where: { studentId: currentUserId },
      include: {
        class: {
          include: {
            school: true,
            teachers: { include: { teacher: true } },
            subjects: { include: { subject: true } },
            departments: { include: { department: true } },
            enrollments: { include: { student: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });
  }

  throw new Error("You are not allowed to view classes");
};

export const getSingleClassService = async (classId: string) => {
  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      school: true,
      teachers: { include: { teacher: true } },
      subjects: { include: { subject: true } },
      departments: { include: { department: true } },
      enrollments: { include: { student: true } },
      exams: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          totalMarks: true,
          durationMinutes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      quizzes: true,
    },
  });

  if (!foundClass) {
    throw new Error("Class not found");
  }

  return foundClass;
};

export const previewClassByCodeService = async (classCode: string) => {
  const foundClass = await prisma.class.findUnique({
    where: { classCode },
    include: {
      school: true,
      teachers: { include: { teacher: true } },
      subjects: { include: { subject: true } },
      departments: { include: { department: true } },
      enrollments: true,
    },
  });

  if (!foundClass) {
    throw new Error("Invalid class code");
  }

  if (foundClass.status !== ClassStatus.ACTIVE) {
    throw new Error("This class is not open for joining");
  }

  return foundClass;
};

export const requestToJoinClassService = async ({
  studentId,
  classCode,
  note,
}: {
  studentId: string;
  classCode: string;
  note?: string;
}) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const foundClass = await prisma.class.findUnique({
    where: { classCode },
    include: {
      school: true,
      teachers: { include: { teacher: true } },
      subjects: { include: { subject: true } },
    },
  });

  if (!foundClass) {
    throw new Error("Invalid class code");
  }

  if (foundClass.status !== ClassStatus.ACTIVE) {
    throw new Error("This class is not open for joining");
  }

  if (foundClass.scope === ClassScope.SCHOOL && foundClass.schoolId) {
    const isLinked = 
      student.schoolId === foundClass.schoolId || 
      await hasActiveSchoolLink({ 
        userId: student.id, 
        userType: LinkEntityType.STUDENT, 
        schoolId: foundClass.schoolId 
      });

    if (!isLinked) {
      throw new Error("You must be linked to this school to join its classes");
    }
  }

  const existingEnrollment = await prisma.classEnrollment.findUnique({
    where: {
      classId_studentId: {
        classId: foundClass.id,
        studentId: student.id,
      },
    },
  });

  if (existingEnrollment) {
    throw new Error("You are already enrolled in this class");
  }

  const existingPending = await prisma.linkRequest.findFirst({
    where: {
      linkType: LinkType.STUDENT_CLASS,
      status: LinkRequestStatus.PENDING,
      requesterType: LinkEntityType.STUDENT,
      requesterId: student.id,
      targetType: LinkEntityType.CLASS,
      targetId: foundClass.id,
    },
  });

  if (existingPending) {
    throw new Error("You already have a pending join request for this class");
  }

  const request = await prisma.linkRequest.create({
    data: {
      linkType: LinkType.STUDENT_CLASS,
      status: LinkRequestStatus.PENDING,
      requesterType: LinkEntityType.STUDENT,
      requesterId: student.id,
      requesterCode: student.studentCode,
      targetType: LinkEntityType.CLASS,
      targetId: foundClass.id,
      targetCode: foundClass.classCode,
      requesterStudentId: student.id,
      classId: foundClass.id,
      schoolId: foundClass.schoolId,
      targetSchoolId: foundClass.schoolId,
      note: note || null,
    },
  });

  return {
    request,
    class: foundClass,
    student,
  };
};

export const addStudentToClassService = async ({
  classId,
  studentId,
}: {
  classId: string;
  studentId: string;
}) => {
  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!foundClass) {
    throw new Error("Class not found");
  }

  if (foundClass.status !== ClassStatus.ACTIVE) {
    throw new Error("Only active classes can accept students");
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  if (foundClass.scope === ClassScope.SCHOOL && foundClass.schoolId) {
    const isLinked = 
      student.schoolId === foundClass.schoolId || 
      await hasActiveSchoolLink({ 
        userId: student.id, 
        userType: LinkEntityType.STUDENT, 
        schoolId: foundClass.schoolId 
      });

    if (!isLinked) {
      throw new Error("Student does not belong to this school");
    }
  }

  return prisma.classEnrollment.upsert({
    where: {
      classId_studentId: {
        classId,
        studentId,
      },
    },
    update: {},
    create: {
      classId,
      studentId,
    },
  });
};

export const removeStudentFromClassService = async ({
  classId,
  studentId,
}: {
  classId: string;
  studentId: string;
}) => {
  await prisma.classEnrollment.deleteMany({
    where: { classId, studentId },
  });

  return true;
};

export const attachSubjectsToClassService = async ({
  classId,
  subjectIds,
  currentUserId,
}: {
  classId: string;
  subjectIds: string[];
  currentUserId: string;
}) => {
  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!foundClass) {
    throw new Error("Class not found");
  }

  const subjects = await prisma.subject.findMany({
    where: {
      id: { in: subjectIds },
    },
  });

  if (subjects.length !== subjectIds.length) {
    throw new Error("Some subjects were not found");
  }

  if (foundClass.scope === "PERSONAL") {
    const invalidSubjects = subjects.filter(
      (subject) =>
        subject.scope !== "PERSONAL" || subject.teacherId !== currentUserId,
    );

    if (invalidSubjects.length) {
      throw new Error("Personal classes can only use your personal subjects");
    }
  }

  if (foundClass.scope === "SCHOOL") {
    const invalidSubjects = subjects.filter(
      (subject) =>
        subject.scope !== "SCHOOL" || subject.schoolId !== foundClass.schoolId,
    );

    if (invalidSubjects.length) {
      throw new Error(
        "School classes can only use subjects from the same school",
      );
    }
  }

  await prisma.classSubject.createMany({
    data: subjectIds.map((subjectId) => ({
      classId,
      subjectId,
    })),
    skipDuplicates: true,
  });

  return prisma.class.findUnique({
    where: { id: classId },
    include: {
      subjects: {
        include: {
          subject: true,
        },
      },
    },
  });
};

export const updateClassService = async ({
  classId,
  name,
  section,
  teacherIds,
  departmentIds,
  studentIds,
}: {
  classId: string;
  name?: string;
  section?: string;
  teacherIds?: string[];
  departmentIds?: string[];
  studentIds?: string[];
}) => {
  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!foundClass) {
    throw new Error("Class not found");
  }

  return prisma.class.update({
    where: { id: classId },
    data: {
      name: name ?? undefined,
      section: section ?? undefined,
      teachers: teacherIds ? {
        deleteMany: {},
        create: teacherIds.filter(Boolean).map(id => ({ teacherId: id }))
      } : undefined,
      departments: departmentIds ? {
        deleteMany: {},
        create: departmentIds.map(id => ({ departmentId: id }))
      } : undefined,
      enrollments: studentIds ? {
        deleteMany: {},
        create: studentIds.filter(Boolean).map(id => ({ studentId: id }))
      } : undefined
    },
    include: {
      school: true,
      teachers: { include: { teacher: true } },
      subjects: { include: { subject: true } },
      departments: { include: { department: true } },
      enrollments: { include: { student: true } },
    },
  });
};

export const changeClassStatusService = async ({
  classId,
  status,
}: {
  classId: string;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "ARCHIVED";
}) => {
  return prisma.class.update({
    where: { id: classId },
    data: { status },
  });
};

export const archiveClassService = async (classId: string) => {
  return prisma.class.update({
    where: { id: classId },
    data: { status: "ARCHIVED" },
  });
};

export const replaceClassSubjectsService = async ({
  classId,
  subjectIds,
  currentUserId,
}: {
  classId: string;
  subjectIds: string[];
  currentUserId: string;
}) => {
  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
  });

  if (!foundClass) {
    throw new Error("Class not found");
  }

  const subjects = await prisma.subject.findMany({
    where: {
      id: { in: subjectIds },
      isArchived: false,
    },
  });

  if (subjects.length !== subjectIds.length) {
    throw new Error("Some subjects were not found");
  }

  if (foundClass.scope === "PERSONAL") {
    const invalid = subjects.filter(
      (s) => s.scope !== "PERSONAL" || s.teacherId !== currentUserId
    );

    if (invalid.length) {
      throw new Error("Personal classes can only use your personal subjects");
    }
  }

  if (foundClass.scope === "SCHOOL") {
    const invalid = subjects.filter(
      (s) => s.scope !== "SCHOOL" || s.schoolId !== foundClass.schoolId
    );

    if (invalid.length) {
      throw new Error("School classes can only use subjects from the same school");
    }
  }

  await prisma.classSubject.deleteMany({
    where: { classId },
  });

  await prisma.classSubject.createMany({
    data: subjectIds.map((subjectId) => ({
      classId,
      subjectId,
    })),
    skipDuplicates: true,
  });

  return prisma.class.findUnique({
    where: { id: classId },
    include: {
      subjects: { include: { subject: true } },
    },
  });
};

export const removeSubjectFromClassService = async ({
  classId,
  subjectId,
}: {
  classId: string;
  subjectId: string;
}) => {
  await prisma.classSubject.deleteMany({
    where: {
      classId,
      subjectId,
    },
  });

  return true;
};
