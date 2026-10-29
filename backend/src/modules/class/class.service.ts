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
  term?: string;
  session?: string;
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
  term,
  session,
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

    const createdClass = await prisma.class.create({
      data: {
        name,
        section: section || null,
        schoolId,
        classCode,
        level: level || null,
        term: term || null,
        session: session || null,
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
          create: teacherIds.filter(Boolean).map((teacherId, index) => ({ teacherId, isLead: index === 0 })),
        },
      },
      include: {
        school: true,
        teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
        subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
        departments: { include: { department: true } },
        enrollments: { include: { student: true } },
      },
    });

    // Notify assigned teachers
    if (teacherIds && teacherIds.length > 0) {
      const validTeacherIds = teacherIds.filter(Boolean);
      for (const tId of validTeacherIds) {
        createNotification({
          recipientType: "TEACHER",
          recipientId: tId,
          senderType: "ADMIN",
          senderId: currentUserId,
          type: "ACADEMIC",
          title: "Assigned to New Class",
          message: `You have been assigned to teach ${createdClass.name}${createdClass.section ? ` (${createdClass.section})` : ""}.`,
          link: `/dashboard/teacher/my-classes/${createdClass.id}`,
        }).catch(err => console.error(`[Notification] Failed to notify teacher ${tId}:`, err));
      }
    }

    return createdClass;
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
        term: term || null,
        session: session || null,
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
        teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
        subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
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
      term: term || null,
      session: session || null,
      teachers: {
        create: teacherIds && teacherIds.length > 0
          ? teacherIds.filter(Boolean).map((id, index) => ({ teacherId: id, isLead: id === teacher.id || index === 0 }))
          : [{ teacherId: teacher.id, isLead: true }]
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
      teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
      subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
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
        teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
        subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
        departments: { include: { department: true } },
        enrollments: { include: { student: true } },
        timetablePeriods: { select: { day: true, startTime: true, endTime: true, subject: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (currentUserType === UserRole.TEACHER) {
    return prisma.class.findMany({
      where: { teachers: { some: { teacherId: currentUserId } } },
      include: {
        school: true,
        teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
        subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
        departments: { include: { department: true } },
        enrollments: { include: { student: true } },
        timetablePeriods: { select: { day: true, startTime: true, endTime: true, subject: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (currentUserType === UserRole.STUDENT) {
    if (schoolId) {
      const student = await prisma.student.findUnique({
        where: { id: currentUserId },
        select: { schoolId: true },
      });

      if (!student?.schoolId || student.schoolId !== schoolId) {
        throw new Error("You are not linked to this school");
      }

      return prisma.class.findMany({
        where: {
          schoolId,
          status: ClassStatus.ACTIVE,
        },
        include: {
          school: true,
          teachers: { include: { teacher: { select: { id: true, name: true, email: true, bannerImage: true, gender: true } } } },
          subjects: { include: { subject: true } },
          departments: { include: { department: true } },
          enrollments: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  studentCode: true,
                  gender: true,
                  status: true,
                },
              },
            },
          },
          timetablePeriods: { select: { day: true, startTime: true, endTime: true, subject: { select: { name: true } } } },
        },
        orderBy: { name: "asc" },
      });
    }

    return prisma.classEnrollment.findMany({
      where: { studentId: currentUserId },
      include: {
        class: {
          include: {
            school: true,
            teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
            subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
            departments: { include: { department: true } },
            enrollments: { include: { student: true } },
            timetablePeriods: { select: { day: true, startTime: true, endTime: true, subject: { select: { name: true } } } },
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
      teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
      subjects: {
        include: {
          subject: {
            include: {
              teacher: true,
              teacherSubjects: {
                include: { teacher: true }
              },
              departments: {
                include: {
                  department: true
                }
              },
              _count: {
                select: {
                  subjectExamPapers: true,
                }
              }
            }
          }
        }
      },
      departments: { 
        include: { 
          department: {
            include: {
              subjects: {
                include: {
                  subject: true
                }
              }
            }
          }
        } 
      },
      enrollments: { 
        include: { 
          student: {
            include: {
              department: true
            }
          } 
        } 
      },
      exams: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          category: true,
          scope: true,
          totalMarks: true,
          durationMinutes: true,
          startDate: true,
          endDate: true,
          createdAt: true,
          updatedAt: true,
          teacherId: true,
          teacher: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            }
          },
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

  // Fetch assignments separately since there's no direct Prisma relation defined
  const classAssignments = await prisma.assignment.findMany({
    where: { classId },
    select: {
      id: true,
      title: true,
      instructions: true,
      dueDate: true,
      totalMarks: true,
      status: true,
      subjectId: true,
      teacherId: true,
      attachmentUrl: true,
      videoUrl: true,
      referenceUrl: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { questions: true, submissions: true }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  // Resolve creators (Teachers or Admins) for assignments and exams
  const assignmentTeacherIds = [...new Set(classAssignments.map(a => a.teacherId).filter(Boolean))] as string[];
  const examTeacherIds = [...new Set(foundClass.exams.map(e => e.teacherId).filter(Boolean))] as string[];
  const allCreatorIds = [...new Set([...assignmentTeacherIds, ...examTeacherIds])];

  const [creatorTeachers, creatorAdmins] = await Promise.all([
    prisma.teacher.findMany({
      where: { id: { in: allCreatorIds } },
      select: { id: true, name: true, email: true, profileImage: true }
    }),
    prisma.admin.findMany({
      where: { id: { in: allCreatorIds } },
      select: { id: true, name: true, email: true, profileImage: true }
    }),
  ]);
  const creatorMap = Object.fromEntries([...creatorTeachers, ...creatorAdmins].map(c => [c.id, c]));

  const enrichedAssignments = classAssignments.map(a => {
    const subject = foundClass.subjects.find(s => s.subjectId === a.subjectId)?.subject;
    const creator = a.teacherId ? creatorMap[a.teacherId] || null : null;
    return {
      ...a,
      subject: subject ? { name: subject.name } : null,
      teacher: creator,
      instructor: creator,
      creator,
      teacherName: creator?.name || null,
    };
  });

  // Also ensure exams have their creator resolved even if created by school admin
  const enrichedExams = foundClass.exams.map(e => {
    const creator = e.teacher || (e.teacherId ? creatorMap[e.teacherId] || null : null);
    return {
      ...e,
      teacher: creator,
      creator,
      teacherName: creator?.name || null,
    };
  });

  const enrichedClass = {
    ...foundClass,
    exams: enrichedExams,
    assignments: enrichedAssignments,
  };

  // Resolve session UUID to session name if necessary
  if (enrichedClass.session && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(enrichedClass.session)) {
    const sessionObj = await prisma.session.findUnique({
      where: { id: enrichedClass.session },
      select: { name: true }
    });
    if (sessionObj) {
      enrichedClass.session = sessionObj.name;
    }
  }

  return enrichedClass;
};

export const previewClassByCodeService = async (classCode: string) => {
  const trimmed = classCode.trim();
  const variants = Array.from(new Set([trimmed, trimmed.toUpperCase(), trimmed.toLowerCase()]));

  const foundClass = await prisma.class.findFirst({
    where: {
      OR: [
        { classCode: { in: variants } },
        { id: trimmed },
      ],
    },
    include: {
      school: true,
      teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
      subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
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
  const trimmed = id.trim();
  const variants = Array.from(new Set([trimmed, trimmed.toUpperCase(), trimmed.toLowerCase()]));

  const foundClass = await prisma.class.findFirst({
    where: {
      OR: [
        { id: trimmed },
        { classCode: { in: variants } },
      ],
    },
    include: {
      school: true,
      teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
      subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
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

  const trimmed = classCode.trim();
  const variants = Array.from(new Set([trimmed, trimmed.toUpperCase(), trimmed.toLowerCase()]));

  const foundClass = await prisma.class.findFirst({
    where: {
      OR: [
        { classCode: { in: variants } },
        { id: trimmed },
      ],
    },
    include: {
      school: true,
      teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
      subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
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
      if (Boolean(student.schoolId)) {
        throw new Error("You are currently enrolled in another school. You must be linked to this school to join its classes");
      }
      // If student has no schoolId (unaffiliated independent student), allow them to request to join!
      // When accepted, StudentLifecycleService.enrollStudentInSchool will enroll them in this school.
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
          subject: {
            include: { teacher: true },
          },
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
  currentUserId,
  currentUserType,
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
  currentUserId?: string;
  currentUserType?: string;
}) => {
  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      teachers: { select: { teacherId: true } },
    },
  });

  if (!foundClass) {
    throw new Error("Class not found");
  }

  const existingTeacherIds = new Set(foundClass.teachers.map((t) => t.teacherId));

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
      teachers: { include: { teacher: { include: { subjects: true, teacherSubjects: true } } } },
      subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
      departments: { include: { department: true } },
      enrollments: { include: { student: true } },
    },
  });

  // Notify newly assigned teachers
  if (teacherIds && teacherIds.length > 0) {
    const newlyAssigned = teacherIds.filter(id => Boolean(id) && !existingTeacherIds.has(id));
    for (const tId of newlyAssigned) {
      createNotification({
        recipientType: "TEACHER",
        recipientId: tId,
        senderType: currentUserType === "TEACHER" ? "TEACHER" : "ADMIN",
        senderId: currentUserId || undefined,
        type: "ACADEMIC",
        title: "Assigned to Class",
        message: `You have been assigned to teach ${updatedClass.name}${updatedClass.section ? ` (${updatedClass.section})` : ""}.`,
        link: `/dashboard/teacher/my-classes/${updatedClass.id}`,
      }).catch(err => console.error(`[Notification] Failed to notify teacher ${tId}:`, err));
    }
  }

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
      subjects: { include: { subject: { include: { teacher: true, teacherSubjects: { include: { teacher: true } } } } } },
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

export const sendClassAnnouncementService = async (
  classId: string,
  senderId: string,
  payload: { title: string; message: string; targets: string[], priority?: string }
) => {
  const { title, message, targets, priority = 'NORMAL' } = payload;
  
  if (!targets || targets.length === 0) {
    throw new Error("At least one target audience (STUDENT, PARENT) must be selected.");
  }

  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      enrollments: {
        include: {
          student: {
            include: { parentLinks: { include: { parent: true } } },
          },
        },
      },
      teachers: {
        include: { teacher: true }
      }
    },
  });

  if (!foundClass) throw new Error("Class not found");

  // Resolve sender name and role
  const teacherSender = await prisma.teacher.findUnique({
    where: { id: senderId },
    select: { id: true, name: true },
  });
  const adminSender = !teacherSender
    ? await prisma.admin.findUnique({
        where: { id: senderId },
        select: { id: true, name: true },
      })
    : null;

  const senderName = teacherSender?.name || adminSender?.name || "Teacher";
  const senderRole = adminSender ? "School Admin" : "Teacher";
  const senderType = adminSender ? "ADMIN" : "TEACHER";

  const notificationsToCreate = [];

  for (const enrollment of foundClass.enrollments) {
    const student = enrollment.student;

    if (targets.includes("STUDENT") && student.id) {
      notificationsToCreate.push({
        recipientType: "STUDENT" as any,
        recipientId: student.id,
        senderType: senderType as any,
        senderId,
        type: "GENERAL" as any,
        title,
        message,
        meta: {
          priority,
          senderName,
          senderRole,
          className: foundClass.name,
          classId: foundClass.id,
        },
      });
    }

    if (targets.includes("PARENT") && student.parentLinks && student.parentLinks.length > 0) {
      for (const parentLink of student.parentLinks) {
        if (parentLink.parent?.id) {
          notificationsToCreate.push({
            recipientType: "PARENT" as any,
            recipientId: parentLink.parent.id,
            senderType: senderType as any,
            senderId,
            type: "GENERAL" as any,
            title,
            message,
            meta: {
              priority,
              senderName,
              senderRole,
              className: foundClass.name,
              classId: foundClass.id,
            },
          });
        }
      }
    }
  }

  if (targets.includes("TEACHER") && foundClass.teachers) {
    for (const classTeacher of foundClass.teachers) {
      if (classTeacher.teacherId) {
        notificationsToCreate.push({
          recipientType: "TEACHER" as any,
          recipientId: classTeacher.teacherId,
          senderType: senderType as any,
          senderId,
          type: "GENERAL" as any,
          title,
          message,
          meta: {
            priority,
            senderName,
            senderRole,
            className: foundClass.name,
            classId: foundClass.id,
          },
        });
      }
    }
  }

  if (notificationsToCreate.length > 0) {
    await prisma.notification.createMany({
      data: notificationsToCreate,
      skipDuplicates: true,
    });
  }

  return { 
    success: true, 
    message: `Announcement sent to ${notificationsToCreate.length} recipients.` 
  };
};

export const getClassHistoryService = async (classId: string, currentUser: any) => {
  const foundClass = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      school: {
        select: { id: true, name: true, logo: true },
      },
      teachers: {
        include: {
          teacher: {
            select: { id: true, name: true, email: true, profileImage: true, gender: true },
          },
        },
      },
      subjects: {
        include: {
          subject: {
            select: { id: true, name: true, code: true },
          },
        },
      },
      departments: {
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
        },
      },
      enrollments: {
        include: {
          student: {
            select: { id: true, name: true, studentCode: true, gender: true, profileImage: true },
          },
        },
      },
    },
  });

  if (!foundClass) {
    throw new Error("Class not found");
  }

  // Permission verification
  if (currentUser.userType === UserRole.ADMIN) {
    if (foundClass.schoolId) {
      const schoolAdmin = await prisma.schoolAdmin.findFirst({
        where: {
          adminId: currentUser.id,
          schoolId: foundClass.schoolId,
          active: true,
        },
      });
      if (!schoolAdmin) {
        throw new Error("You are not allowed to view history for this class");
      }
    }
  }

  const schoolId = foundClass.schoolId;

  // 1. Fetch all classes in this school to translate class IDs into readable names
  const schoolClasses = schoolId
    ? await prisma.class.findMany({
        where: { schoolId },
        select: { id: true, name: true, section: true },
      })
    : [];
  const classNameMap = new Map(
    schoolClasses.map((c) => [c.id, `${c.name}${c.section ? ` (${c.section})` : ""}`])
  );

  // 2. Fetch student history records in this school
  let studentHistories: any[] = [];
  if (schoolId) {
    studentHistories = await prisma.studentHistory.findMany({
      where: { schoolId },
      include: {
        student: {
          select: { id: true, name: true, studentCode: true, profileImage: true, gender: true },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  // 3. Fetch published final results
  const publishedResults = await prisma.classSubjectResult.findMany({
    where: { classId },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      session: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // 4. Fetch behavioural alerts
  const alerts = await prisma.behaviourAlert.findMany({
    where: { classId },
    include: {
      student: { select: { id: true, name: true, studentCode: true, profileImage: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 5. Build timeline events
  interface HistoryTimelineItem {
    id: string;
    date: string;
    type:
      | "CLASS_CREATED"
      | "PROMOTION_IN"
      | "PROMOTION_OUT"
      | "ENROLLMENT"
      | "GRADUATION"
      | "WITHDRAWAL"
      | "TEACHER_ASSIGNED"
      | "SUBJECT_ATTACHED"
      | "RESULT_PUBLISHED"
      | "BEHAVIOUR_ALERT";
    category: "lifecycle" | "students" | "academics" | "staff";
    title: string;
    description: string;
    session?: string | null;
    term?: string | null;
    actor?: { name: string; role?: string };
    meta?: Record<string, any>;
  }

  const events: HistoryTimelineItem[] = [];

  // A. Class creation event
  events.push({
    id: `class-created-${foundClass.id}`,
    date: foundClass.createdAt.toISOString(),
    type: "CLASS_CREATED",
    category: "lifecycle",
    title: "Class Established & Configured",
    description: `Class ${foundClass.name}${foundClass.section ? ` (${foundClass.section})` : ""} was created with code ${foundClass.classCode}. Level: ${foundClass.level || "Standard"}.`,
    session: foundClass.session,
    term: foundClass.term,
    actor: {
      name: foundClass.createdByType === "ADMIN" ? "School Administration" : "Class Instructor",
      role: foundClass.createdByType || "ADMIN",
    },
    meta: {
      classCode: foundClass.classCode,
      level: foundClass.level,
      section: foundClass.section,
      session: foundClass.session,
      term: foundClass.term,
    },
  });

  // B. Student Enrollments
  foundClass.enrollments.forEach((enrollment) => {
    events.push({
      id: `enrollment-${enrollment.id}`,
      date: enrollment.enrolledAt.toISOString(),
      type: "ENROLLMENT",
      category: "students",
      title: "Student Enrolled in Class",
      description: `${enrollment.student.name} (${enrollment.student.studentCode}) was enrolled into the roster.`,
      session: foundClass.session,
      term: foundClass.term,
      meta: {
        student: enrollment.student,
        session: foundClass.session,
        term: foundClass.term,
      },
    });
  });

  // C. Student History Records (Promotions & Exits)
  let countPromotedOut = 0;
  let countPromotedIn = 0;
  let countGraduated = 0;

  studentHistories.forEach((sh) => {
    const meta = sh.meta as any;
    const isFromThisClass = meta?.fromClassId === classId;
    const isToThisClass = meta?.toClassId === classId;

    if (sh.eventType === "PROMOTED") {
      if (isFromThisClass) {
        countPromotedOut++;
        const destination = classNameMap.get(meta?.toClassId) || "Senior Class";
        events.push({
          id: `promoted-out-${sh.id}`,
          date: (sh.date || sh.createdAt).toISOString(),
          type: "PROMOTION_OUT",
          category: "students",
          title: "Student Promoted to Higher Level",
          description: `${sh.student.name} was promoted out of ${foundClass.name} to ${destination}.`,
          session: meta?.session || foundClass.session,
          term: meta?.term || foundClass.term,
          actor: { name: sh.performedBy || "Administrator", role: "ADMIN" },
          meta: {
            student: sh.student,
            toClassId: meta?.toClassId,
            toClassName: destination,
            session: meta?.session || foundClass.session,
            term: meta?.term || foundClass.term,
            achievements: meta?.achievements,
          },
        });
      } else if (isToThisClass) {
        countPromotedIn++;
        const origin = classNameMap.get(meta?.fromClassId) || "Previous Class";
        events.push({
          id: `promoted-in-${sh.id}`,
          date: (sh.date || sh.createdAt).toISOString(),
          type: "PROMOTION_IN",
          category: "students",
          title: "Student Promoted Into Cohort",
          description: `${sh.student.name} was promoted into ${foundClass.name} from ${origin}.`,
          session: meta?.session || foundClass.session,
          term: meta?.term || foundClass.term,
          actor: { name: sh.performedBy || "Administrator", role: "ADMIN" },
          meta: {
            student: sh.student,
            fromClassId: meta?.fromClassId,
            fromClassName: origin,
            session: meta?.session || foundClass.session,
            term: meta?.term || foundClass.term,
            achievements: meta?.achievements,
          },
        });
      }
    } else if (sh.eventType === "GRADUATED" || sh.eventType === "EXITED_SCHOOL") {
      const wasInClass =
        meta?.classId === classId ||
        foundClass.enrollments.some((e) => e.student.id === sh.studentId);
      if (wasInClass) {
        countGraduated++;
        events.push({
          id: `exit-${sh.id}`,
          date: (sh.date || sh.createdAt).toISOString(),
          type: sh.eventType === "GRADUATED" ? "GRADUATION" : "WITHDRAWAL",
          category: "students",
          title: sh.title || (sh.eventType === "GRADUATED" ? "Student Graduated" : "Student Exited School"),
          description: sh.description || `${sh.student.name} completed curriculum or departed.`,
          session: meta?.session || foundClass.session,
          term: meta?.term || foundClass.term,
          actor: { name: sh.performedBy || "Administrator", role: "ADMIN" },
          meta: {
            student: sh.student,
            exitReason: meta?.exitReason,
            notes: meta?.exitNotes,
            session: meta?.session || foundClass.session,
            term: meta?.term || foundClass.term,
          },
        });
      }
    }
  });

  // D. Teacher Assignments
  foundClass.teachers.forEach((ct) => {
    events.push({
      id: `teacher-${ct.id}`,
      date: (ct.createdAt || foundClass.createdAt).toISOString(),
      type: "TEACHER_ASSIGNED",
      category: "staff",
      title: ct.isLead ? "Lead Form Teacher Appointed" : "Subject/Class Instructor Assigned",
      description: `${ct.teacher.name} was appointed as ${ct.isLead ? "Lead Form Teacher" : "Class Instructor"}.`,
      session: foundClass.session,
      term: foundClass.term,
      meta: {
        teacher: ct.teacher,
        isLead: ct.isLead,
        session: foundClass.session,
        term: foundClass.term,
      },
    });
  });

  // E. Curriculum Subjects Attached
  foundClass.subjects.forEach((cs) => {
    events.push({
      id: `subject-${cs.id}`,
      date: (cs.createdAt || foundClass.createdAt).toISOString(),
      type: "SUBJECT_ATTACHED",
      category: "academics",
      title: "Subject Added to Syllabus",
      description: `${cs.subject.name} (${cs.subject.code}) was assigned to this class curriculum.`,
      session: foundClass.session,
      term: foundClass.term,
      meta: {
        subject: cs.subject,
        session: foundClass.session,
        term: foundClass.term,
      },
    });
  });

  // F. Results Published
  publishedResults.forEach((res) => {
    const approval = (res.paperLinks as any)?.approval;
    events.push({
      id: `result-${res.id}`,
      date: res.updatedAt.toISOString(),
      type: "RESULT_PUBLISHED",
      category: "academics",
      title: `Final Results Certified: ${res.subject.name}`,
      description: `Official results published for ${res.subject.name} (${res.term} Term${res.session?.name ? ` • ${res.session.name}` : ""}).`,
      session: res.session?.name || foundClass.session,
      term: res.term || foundClass.term,
      actor: approval?.approvedByName
        ? { name: approval.approvedByName, role: "ADMIN" }
        : undefined,
      meta: {
        subject: res.subject,
        term: res.term || foundClass.term,
        session: res.session?.name || foundClass.session,
        approval,
      },
    });
  });

  // G. Behaviour Alerts
  alerts.forEach((alert) => {
    events.push({
      id: `alert-${alert.id}`,
      date: alert.createdAt.toISOString(),
      type: "BEHAVIOUR_ALERT",
      category: "students",
      title: `Conduct Record: ${alert.title}`,
      description: alert.description || `Conduct note logged for student ${alert.student?.name}.`,
      session: foundClass.session,
      term: foundClass.term,
      meta: {
        student: alert.student,
        severity: alert.type,
        session: foundClass.session,
        term: foundClass.term,
      },
    });
  });

  // Sort descending by date
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Lead teacher
  const leadTeacher = foundClass.teachers.find((t) => t.isLead)?.teacher || null;

  return {
    classInfo: {
      id: foundClass.id,
      name: foundClass.name,
      section: foundClass.section,
      classCode: foundClass.classCode,
      level: foundClass.level,
      status: foundClass.status,
      session: foundClass.session,
      term: foundClass.term,
      createdAt: foundClass.createdAt,
      school: foundClass.school,
      leadTeacher,
    },
    metrics: {
      currentEnrollments: foundClass.enrollments.length,
      promotedOut: countPromotedOut,
      promotedIn: countPromotedIn,
      graduated: countGraduated,
      totalEvents: events.length,
      publishedResultsCount: publishedResults.length,
      subjectsCount: foundClass.subjects.length,
      teachersCount: foundClass.teachers.length,
    },
    timeline: events,
  };
};
