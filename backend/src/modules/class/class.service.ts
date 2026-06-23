import { hasActiveSchoolAccess } from "utils/school-access";
import prisma from "../../config/database";
import { enforceClassLimit } from "../subscription/quota.helpers";
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
import { StudentLifecycleService } from "../student/student.lifecycle.service";
import { createNotification } from "../notification/notification.service";

type CreateClassInput = {
  currentUserId: string;
  currentUserType: UserRole;
  name: string;
  section?: string;
  scope: ClassScope;
  schoolId?: string;
  level?: string;
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
  level,
  subjectIds = [],
  departmentIds = [],
  teacherIds = [],
  studentIds = [],
}: CreateClassInput) => {
  if (schoolId) await enforceClassLimit(schoolId);
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
        level: level || null,
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
        teachers: {
          create: teacherIds.filter(Boolean).map((teacherId) => ({ teacherId })),
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
        level: level || null,
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
      schoolId: schoolId || teacher.activeSchoolId || teacher.primarySchoolId,
      level: level || null,
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
      subjects: {
        include: {
          subject: {
            include: {
              _count: {
                select: {
                  subjectExamPapers: true,
                }
              }
            }
          }
        }
      },
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
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          subject: {
            select: {
              name: true,
            }
          },
          subjectExamPapers: {
            include: {
              subjectPaper: {
                include: {
                  subject: true,
                  questions: {
                    select: { id: true }
                  }
                }
              }
            }
          },
          examAttempts: {
            select: {
              id: true,
              isSubmitted: true,
            }
          }
        },
      },
      quizzes: true,
      behaviourAlerts: {
        include: {
          student: true,
        },
      },
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

export const previewClassByIdService = async (id: string) => {
  const foundClass = await prisma.class.findUnique({
    where: { id },
    include: {
      school: true,
      teachers: { include: { teacher: true } },
      subjects: { include: { subject: true } },
      departments: { include: { department: true } },
      enrollments: true,
    },
  });

  if (!foundClass) {
    throw new Error("Class not found");
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

  const enrollment = await prisma.classEnrollment.upsert({
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

  if (foundClass.level && student.level !== foundClass.level) {
    await prisma.student.update({
      where: { id: studentId },
      data: { level: foundClass.level }
    });
  }

  return enrollment;
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
  term,
  session,
  level,
  teacherIds,
  departmentIds,
  studentIds,
}: {
  classId: string;
  name?: string;
  section?: string;
  term?: string;
  session?: string;
  level?: string;
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

  const updatedClass = await prisma.class.update({
    where: { id: classId },
    data: {
      name: name ?? undefined,
      section: section ?? undefined,
      term: term ?? undefined,
      session: session ?? undefined,
      level: level ?? undefined,
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

  if (level && foundClass.level !== level) {
    await prisma.student.updateMany({
      where: {
        classes: {
          some: { classId }
        }
      },
      data: {
        level
      }
    });
  }

  return updatedClass;
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

export const getClassStatsService = async (classId: string) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const attendances = await prisma.attendance.findMany({
    where: {
      classId,
      date: {
        gte: fourteenDaysAgo,
        lte: today,
      },
    },
  });

  const attendanceTrend = Array.from({ length: 14 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const daily = attendances.filter((a) => {
      const aStr = new Date(a.date).toISOString().split("T")[0];
      return aStr === dateStr;
    });
    const total = daily.length;
    const present = daily.filter((a) => a.status === "present").length;
    return {
      date: dateStr,
      label: date.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
      value: total > 0 ? Math.round((present / total) * 100) : 0,
      total,
    };
  }).reverse();

  // 2. Performance (Recent Exams)
  const recentExams = await prisma.exam.findMany({
    where: { classId },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      examAttempts: {
        select: {
          totalScore: true,
          totalMarks: true,
        },
      },
    },
  });

  const performanceTrend = recentExams.map((exam: any) => {
    const validAttempts = exam.examAttempts.filter((a: any) => a.totalMarks > 0);
    const avgScore =
      validAttempts.length > 0
        ? Math.round(
            (validAttempts.reduce((acc: number, curr: any) => acc + (curr.totalScore / curr.totalMarks), 0) /
              validAttempts.length) *
              100
          )
        : 0;

    return {
      label: exam.title.length > 10 ? exam.title.substring(0, 8) + "..." : exam.title,
      fullTitle: exam.title,
      value: avgScore,
    };
  }).reverse();

  // 3. Overall Average Score
  const allAttempts = recentExams.flatMap((e: any) => e.examAttempts || []);
  const validAllAttempts = allAttempts.filter((a: any) => a.totalMarks > 0);
  const overallAvgScore = validAllAttempts.length > 0
    ? Math.round((validAllAttempts.reduce((acc: number, curr: any) => acc + (curr.totalScore / curr.totalMarks), 0) / validAllAttempts.length) * 100)
    : 0;

  return {
    attendanceTrend,
    performanceTrend,
    overallAvgScore,
  };
};

export const promoteStudentsService = async ({
  classId,
  toClassId,
  studentIds,
  currentUserId,
}: {
  classId: string;
  toClassId: string;
  studentIds: string[];
  currentUserId: string;
}) => {
  const fromClass = await prisma.class.findUnique({
    where: { id: classId },
    include: { teachers: true }
  });
  
  const toClass = await prisma.class.findUnique({
    where: { id: toClassId },
    include: { teachers: true }
  });

  if (!fromClass || !toClass) throw new Error("Source or Target class not found");

  if (!fromClass.schoolId) {
    throw new Error("Promotion is only applicable to school classes");
  }

  await prisma.$transaction(async (tx) => {
    await StudentLifecycleService.promoteStudents(
      tx,
      studentIds,
      fromClass.schoolId!,
      classId,
      toClassId,
      currentUserId
    );
  });

  // Post-transaction notifications
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    include: { parentLinks: true }
  });

  const notificationPromises: Promise<any>[] = [];

  for (const student of students) {
    // Notify parents
    if (student.parentLinks && student.parentLinks.length > 0) {
      for (const parentLink of student.parentLinks) {
        notificationPromises.push(
          createNotification({
            recipientType: "PARENT",
            recipientId: parentLink.parentId,
            senderType: "ADMIN",
            senderId: currentUserId,
            type: "GENERAL",
            title: "Student Promoted",
            message: `${student.name} has been promoted to ${toClass.name}.`,
          }).catch(err => console.error(`Failed to notify parent ${parentLink.parentId}:`, err))
        );
      }
    }
  }

  // Notify new class teachers
  for (const classTeacher of toClass.teachers) {
    notificationPromises.push(
      createNotification({
        recipientType: "TEACHER",
        recipientId: classTeacher.teacherId,
        senderType: "ADMIN",
        senderId: currentUserId,
        type: "GENERAL",
        title: "Students Promoted",
        message: `${studentIds.length} students have been promoted to your class ${toClass.name}.`,
      }).catch(err => console.error(`Failed to notify teacher ${classTeacher.teacherId}:`, err))
    );
  }

  await Promise.all(notificationPromises);

  return { success: true, message: `Successfully promoted ${studentIds.length} students` };
};
