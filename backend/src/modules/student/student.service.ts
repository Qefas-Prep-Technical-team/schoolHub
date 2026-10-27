import prisma from "../../config/database";
import { LinkEntityType, UserRole, HistoryEventType } from "@prisma/client";
import { createNotification } from "../notification/notification.service";

export const pickDepartmentService = async ({
  studentId,
  departmentId,
  currentUserId,
  currentUserType,
}: {
  studentId: string;
  departmentId: string;
  currentUserId: string;
  currentUserType: UserRole;
}) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      classes: {
        include: {
          class: {
            include: {
              teachers: { include: { teacher: true } },
            },
          },
        },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // Restriction: Students can only pick it ONCE
  if (currentUserType === UserRole.STUDENT && student.departmentId) {
    if (student.departmentId !== departmentId) {
      throw new Error("Department already set. Only schools can change it now.");
    }
    return student; // No change needed if same
  }

  // Validate department exists and belongs to school
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });

  if (!department) {
    throw new Error("Department not found");
  }

  if (student.schoolId && department.schoolId && department.schoolId !== student.schoolId) {
    throw new Error("Invalid department for this school");
  }

  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data: { departmentId },
    include: { 
      department: true,
      school: true,
      classes: {
        include: {
          class: {
            include: {
              teachers: { include: { teacher: true } },
            },
          },
        },
      },
      parentLinks: {
        where: { status: "active" },
      }
    },
  });

  // SIDE EFFECTS: Notifications
  console.log(`Triggering notifications for department update: Student ${updatedStudent.name}, Dept ${department.name}`);

  // 1. Notify the Student
  await createNotification({
    recipientType: "STUDENT",
    recipientId: updatedStudent.id,
    senderType: currentUserType as any,
    senderId: currentUserId,
    type: "GENERAL",
    title: "Department Updated",
    message: `Your department has been successfully updated to ${department.name}`,
    meta: { studentId: updatedStudent.id, departmentId },
  }).catch(err => console.error("Failed to notify student:", err));

  // 2. Notify Linked School (Admins)
  if (updatedStudent.schoolId) {
    const schoolAdmins = await prisma.schoolAdmin.findMany({
      where: { schoolId: updatedStudent.schoolId, active: true },
    });

    for (const admin of schoolAdmins) {
      if (admin.adminId === currentUserId) continue; // Don't notify the person who made the change
      
      await createNotification({
        recipientType: "ADMIN",
        recipientId: admin.adminId,
        senderType: currentUserType as any,
        senderId: currentUserId,
        type: "GENERAL",
        title: "Student Department Updated",
        message: `${updatedStudent.name}'s department was updated to ${department.name}`,
        meta: { studentId: updatedStudent.id, departmentId },
      }).catch(err => console.error(`Failed to notify admin ${admin.adminId}:`, err));
    }
  }

  // 3. Notify Parent
  for (const link of updatedStudent.parentLinks) {
    await createNotification({
      recipientType: "PARENT",
      recipientId: link.parentId,
      senderType: currentUserType as any,
      senderId: currentUserId,
      type: "GENERAL",
      title: "Child's Department Updated",
      message: `${updatedStudent.name}'s department has been updated to ${department.name}`,
      meta: { studentId: updatedStudent.id, departmentId },
    }).catch(err => console.error(`Failed to notify parent ${link.parentId}:`, err));
  }

  // 4. Notify Teachers
  const teacherIds = new Set<string>();
  updatedStudent.classes.forEach((c) => {
    c.class.teachers.forEach((ct: any) => {
      if (ct.teacherId) teacherIds.add(ct.teacherId);
    });
  });

  for (const teacherId of teacherIds) {
    await createNotification({
      recipientType: "TEACHER",
      recipientId: teacherId,
      senderType: currentUserType as any,
      senderId: currentUserId,
      type: "GENERAL",
      title: "Student Department Updated",
      message: `Student ${updatedStudent.name} in your class has updated their department to ${department.name}`,
      meta: { studentId: updatedStudent.id, departmentId },
    }).catch(err => console.error(`Failed to notify teacher ${teacherId}:`, err));
  }

  return updatedStudent;
};

export const getStudentProfileService = async (studentId: string) => {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      department: true,
      school: true,
      behaviourProfile: true,
      attendances: true,
      classes: {
        include: {
          class: {
            include: {
              subjects: {
                include: {
                  subject: true,
                },
              },
              teachers: {
                include: {
                  teacher: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      subject: true,
                      department: true,
                      bannerImage: true,
                      gender: true,
                    }
                  }
                }
              }
            },
          },
        },
      },
      parentLinks: {
        include: {
          parent: true,
        },
      },
    },
  });
};

export const updateStudentProfileService = async (studentId: string, data: {
  name?: string;
  email?: string;
  gender?: any;
  dateOfBirth?: string | Date;
  profileImage?: string;
  bannerImage?: string;
  height?: number;
  weight?: number;
  club?: string;
  favouriteColour?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
}) => {
  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.gender) updateData.gender = data.gender;
  if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
  if (data.profileImage !== undefined) updateData.profileImage = data.profileImage;
  if (data.bannerImage !== undefined) updateData.bannerImage = data.bannerImage;
  if (data.height !== undefined) updateData.height = Number(data.height);
  if (data.weight !== undefined) updateData.weight = Number(data.weight);
  if (data.club !== undefined) updateData.club = data.club;
  if (data.favouriteColour !== undefined) updateData.favouriteColour = data.favouriteColour;
  if (data.guardianName !== undefined) updateData.guardianName = data.guardianName;
  if (data.guardianPhone !== undefined) updateData.guardianPhone = data.guardianPhone;
  if (data.address !== undefined) updateData.address = data.address;

  return prisma.student.update({
    where: { id: studentId },
    data: updateData,
    include: {
      department: true,
      school: true,
      classes: {
        include: {
          class: true,
        },
      },
    },
  });
};

export const requestEmailUpdateService = async (studentId: string, newEmail: string) => {
  // Check if email is already taken
  const existingUser = await prisma.student.findUnique({ where: { email: newEmail } });
  if (existingUser) {
    throw new Error("This email is already registered with another account");
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // @ts-ignore - pendingEmail fields added to schema but prisma generate not run
  await prisma.student.update({
    where: { id: studentId },
    data: {
      pendingEmail: newEmail,
      emailVerificationCode: code,
      emailVerificationExpiry: expiry,
    },
  });

  return code;
};

export const verifyEmailUpdateService = async (studentId: string, code: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) throw new Error("Student not found");
  
  const s = student as any;

  if (s.emailVerificationCode !== code) {
    throw new Error("Invalid verification code");
  }

  if (new Date() > new Date(s.emailVerificationExpiry)) {
    throw new Error("Verification code has expired");
  }

  if (!s.pendingEmail) {
    throw new Error("No pending email update found");
  }

  return prisma.student.update({
    where: { id: studentId },
    data: {
      email: s.pendingEmail,
      // @ts-ignore - fields exist in schema
      pendingEmail: null,
      emailVerificationCode: null,
      emailVerificationExpiry: null,
    },
  });
};

export const getStudentAttendanceService = async (studentId: string, query?: { startDate?: string; endDate?: string }) => {
  const whereClause: any = { studentId };

  if (query?.startDate || query?.endDate) {
    whereClause.date = {};
    if (query.startDate) whereClause.date.gte = new Date(query.startDate);
    if (query.endDate) whereClause.date.lte = new Date(query.endDate);
  }

  const attendances = await prisma.attendance.findMany({
    where: whereClause,
    orderBy: { date: 'asc' },
    include: {
      class: {
        include: {
          subjects: {
            include: {
              subject: {
                include: {
                  departments: {
                    include: { department: true }
                  }
                }
              }
            }
          }
        }
      },
      student: {
        include: {
          department: true
        }
      }
    }
  });

  return attendances.map((rec) => {
    let comment = rec.note || "";
    let subjects: Record<string, any> = {};
    let noteStr = rec.note ? rec.note.trim() : "";

    while (noteStr.startsWith("{") && noteStr.endsWith("}")) {
      try {
        const parsed = JSON.parse(noteStr);
        if (parsed && typeof parsed === "object") {
          if (parsed.subjects && typeof parsed.subjects === "object") {
            subjects = { ...subjects, ...parsed.subjects };
          }
          if (typeof parsed.comment === "string") {
            noteStr = parsed.comment.trim();
            continue;
          } else if (typeof parsed.note === "string") {
            noteStr = parsed.note.trim();
            continue;
          }
        }
        noteStr = "";
        break;
      } catch {
        break;
      }
    }
    comment = noteStr;

    return {
      ...rec,
      note: comment,
      comment,
      subjects,
    };
  });
};

export const updateStudentAttendanceService = async (
  studentId: string, 
  data: { 
    date: string; 
    status: string; 
    note?: string;
    subjects?: Record<string, any>;
    recordedByName?: string;
    recordedByRole?: string;
  }
) => {
  // Find the student's primary class
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { classes: true }
  });

  if (!student) {
    throw new Error("Student not found");
  }

  const primaryClass = student.classes[0];
  if (!primaryClass) {
    throw new Error("Student is not assigned to any class. Cannot log attendance.");
  }

  const classId = primaryClass.classId;
  const attendanceDate = new Date(new Date(data.date).toISOString().split('T')[0] + 'T00:00:00.000Z');

  let finalNote = data.note || "";
  if (data.subjects !== undefined) {
    let comment = data.note || "";
    if (typeof comment === 'string' && comment.startsWith('{')) {
      try {
        const parsed = JSON.parse(comment);
        comment = parsed.comment || "";
      } catch {}
    }
    finalNote = JSON.stringify({
      comment,
      subjects: data.subjects || {},
    });
  }

  return prisma.attendance.upsert({
    where: {
      classId_studentId_date: {
        classId,
        studentId,
        date: attendanceDate,
      }
    },
    update: {
      status: data.status.toLowerCase(),
      note: finalNote,
      ...(data.recordedByName ? { recordedByName: data.recordedByName } : {}),
      ...(data.recordedByRole ? { recordedByRole: data.recordedByRole } : {}),
    },
    create: {
      classId,
      studentId,
      date: attendanceDate,
      status: data.status.toLowerCase(),
      note: finalNote,
      recordedByName: data.recordedByName,
      recordedByRole: data.recordedByRole,
    }
  });
};

import { StudentLifecycleService } from "./student.lifecycle.service";
import { EnrollmentStatus } from "@prisma/client";

export const exitStudentService = async (
  studentId: string,
  schoolId: string,
  exitData: {
    exitType: EnrollmentStatus;
    exitDate: string | Date;
    exitReason?: string;
    exitNotes?: string;
  },
  adminId: string
) => {
  const student = await prisma.student.findFirst({
    where: { id: studentId, schoolId },
    include: { parentLinks: true },
  });

  if (!student) {
    throw new Error("Student not found or not actively enrolled in your school.");
  }

  const result = await prisma.$transaction(async (tx) => {
    await StudentLifecycleService.exitStudentFromSchool(
      tx,
      studentId,
      schoolId,
      {
        exitType: exitData.exitType,
        exitDate: new Date(exitData.exitDate),
        exitReason: exitData.exitReason,
        exitNotes: exitData.exitNotes,
      },
      adminId
    );
    return true;
  });

  // Notify Student
  await createNotification({
    recipientType: "STUDENT",
    recipientId: student.id,
    senderType: "SCHOOL",
    senderId: schoolId,
    type: "GENERAL",
    title: `School Enrollment Ended`,
    message: `Your enrollment at the school has been updated to ${exitData.exitType.toLowerCase()}.`,
    meta: { studentId: student.id, exitType: exitData.exitType },
  }).catch(err => console.error("Failed to notify student of exit:", err));

  // Notify Parents
  for (const link of student.parentLinks) {
    await createNotification({
      recipientType: "PARENT",
      recipientId: link.parentId,
      senderType: "SCHOOL",
      senderId: schoolId,
      type: "GENERAL",
      title: "Child's School Enrollment Ended",
      message: `${student.name}'s school enrollment has been marked as ${exitData.exitType.toLowerCase()}.`,
      meta: { studentId: student.id, exitType: exitData.exitType },
    }).catch(err => console.error(`Failed to notify parent ${link.parentId} of exit:`, err));
  }

  return result;
};

export interface AssessmentGradeItem {
  id: string;
  title: string;
  category: string;
  score: number;
  maxMarks: number;
  percentage: number;
  gradeLetter: string;
  date: Date | string;
}

export interface SubjectHistoryRecord {
  subjectName: string;
  subjectCode?: string | null;
  score: number | null;
  maxMarks: number;
  percentage: number;
  grade: string;
  gradeLabel: string;
  gradeColor: string;
  assessmentsCount: number;
  assessments: AssessmentGradeItem[];
}

export interface AcademicHistoryCohort {
  cohortId: string;
  classId?: string | null;
  className: string;
  classCode?: string | null;
  session: string;
  term: string;
  termDisplay: string;
  enrolledAt: Date | string;
  termAverage: number;
  termGrade: string;
  termGradeLabel: string;
  totalSubjects: number;
  subjects: SubjectHistoryRecord[];
}

export interface StudentHistoryTimelineItem {
  id: string;
  date: Date | string;
  eventType: string;
  title: string;
  description?: string | null;
  meta?: Record<string, unknown> | null;
  performedBy?: string | null;
  school?: { id: string; name: string; logo?: string | null } | null;
}

export interface StudentHistorySummary {
  totalClasses: number;
  totalSessions: number;
  totalSubjects: number;
  overallAverage: number;
}

export interface StudentHistoryResponse {
  timeline: StudentHistoryTimelineItem[];
  academicHistory: AcademicHistoryCohort[];
  summary: StudentHistorySummary;
}

function normalizeTerm(rawTerm?: string | null): string {
  if (!rawTerm) return "FIRST";
  const upper = String(rawTerm).toUpperCase();
  if (upper.includes("SECOND") || upper.includes("2ND") || upper.includes("2")) return "SECOND";
  if (upper.includes("THIRD") || upper.includes("3RD") || upper.includes("3")) return "THIRD";
  return "FIRST";
}

function formatTermDisplay(term?: string | null): string {
  const norm = normalizeTerm(term);
  switch (norm) {
    case "FIRST": return "First Term";
    case "SECOND": return "Second Term";
    case "THIRD": return "Third Term";
    default: return norm;
  }
}

function calculateGradeLetter(percentage: number): { grade: string; label: string; color: string } {
  if (percentage >= 75) return { grade: "A1", label: "Distinction", color: "emerald" };
  if (percentage >= 70) return { grade: "B2", label: "Very Good", color: "emerald" };
  if (percentage >= 65) return { grade: "B3", label: "Good", color: "indigo" };
  if (percentage >= 60) return { grade: "C4", label: "Credit", color: "indigo" };
  if (percentage >= 55) return { grade: "C5", label: "Credit", color: "blue" };
  if (percentage >= 50) return { grade: "C6", label: "Credit", color: "blue" };
  if (percentage >= 45) return { grade: "D7", label: "Pass", color: "amber" };
  if (percentage >= 40) return { grade: "E8", label: "Pass", color: "amber" };
  return { grade: "F9", label: "Fail", color: "rose" };
}

export const getStudentHistoryService = async (
  studentId: string,
  schoolId?: string
): Promise<StudentHistoryResponse> => {
  const whereClause: { studentId: string; schoolId?: string } = { studentId };
  if (schoolId) {
    whereClause.schoolId = schoolId;
  }

  const [student, rawHistories, grades, subjectTermResults, termResults] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      include: {
        school: { select: { id: true, name: true, logo: true } },
        classes: {
          include: {
            class: {
              include: {
                school: { select: { id: true, name: true, logo: true } },
              },
            },
          },
        },
        enrollments: {
          include: {
            school: { select: { id: true, name: true, logo: true } },
          },
        },
      },
    }),
    prisma.studentHistory.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        school: {
          select: { id: true, name: true, logo: true },
        },
      },
    }),
    prisma.grade.findMany({
      where: { studentId },
      include: {
        class: true,
        session: true,
        exam: true,
        subjectPaper: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.studentSubjectTermResult.findMany({
      where: { studentId },
      include: {
        class: true,
        session: true,
        subject: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.studentTermResult.findMany({
      where: { studentId },
      include: {
        class: true,
        session: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  interface CohortGroup {
    classId?: string | null;
    className: string;
    classCode?: string | null;
    sessionName: string;
    term: string;
    enrolledAt: Date | string;
    school?: { id: string; name: string; logo?: string | null } | null;
    grades: typeof grades;
    subjectTermResults: typeof subjectTermResults;
    termResult?: (typeof termResults)[0] | null;
  }

  const cohortGroups = new Map<string, CohortGroup>();

  // 1. Seed cohort groups from class enrollments
  for (const ce of student?.classes || []) {
    const cls = ce.class;
    const sessionName = cls?.session || "Current Academic Session";
    const term = normalizeTerm(cls?.term);
    const key = `${cls?.id || "noclass"}_${sessionName}_${term}`;
    if (!cohortGroups.has(key)) {
      cohortGroups.set(key, {
        classId: cls?.id,
        className: cls?.name || "Class",
        classCode: cls?.classCode,
        sessionName,
        term,
        enrolledAt: ce.enrolledAt,
        school: cls?.school || student?.school,
        grades: [],
        subjectTermResults: [],
        termResult: null,
      });
    }
  }

  // 2. Distribute grades into cohort groups
  for (const g of grades) {
    const className = g.class?.name || student?.classes?.[0]?.class?.name || "Class";
    const classId = g.classId || student?.classes?.[0]?.classId;
    const sessionName =
      g.session?.name ||
      g.class?.session ||
      student?.classes?.[0]?.class?.session ||
      "2025/2026";
    const term = normalizeTerm(g.term || g.exam?.term || g.class?.term);
    const key = `${classId || "noclass"}_${sessionName}_${term}`;

    if (!cohortGroups.has(key)) {
      cohortGroups.set(key, {
        classId,
        className,
        sessionName,
        term,
        enrolledAt: g.createdAt,
        school: student?.school,
        grades: [],
        subjectTermResults: [],
        termResult: null,
      });
    }
    cohortGroups.get(key)!.grades.push(g);
  }

  // 3. Distribute subjectTermResults into cohort groups
  for (const str of subjectTermResults) {
    const classId = str.classId || student?.classes?.[0]?.classId;
    const className = str.class?.name || student?.classes?.[0]?.class?.name || "Class";
    const sessionName = str.session?.name || str.class?.session || "2025/2026";
    const term = normalizeTerm(str.term);
    const key = `${classId || "noclass"}_${sessionName}_${term}`;

    if (!cohortGroups.has(key)) {
      cohortGroups.set(key, {
        classId,
        className,
        sessionName,
        term,
        enrolledAt: str.createdAt,
        school: student?.school,
        grades: [],
        subjectTermResults: [],
        termResult: null,
      });
    }
    cohortGroups.get(key)!.subjectTermResults.push(str);
  }

  // 4. Distribute termResults into cohort groups
  for (const tr of termResults) {
    const classId = tr.classId || student?.classes?.[0]?.classId;
    const sessionName = tr.session?.name || tr.class?.session || "2025/2026";
    const term = normalizeTerm(tr.term);
    const key = `${classId || "noclass"}_${sessionName}_${term}`;
    if (cohortGroups.has(key)) {
      cohortGroups.get(key)!.termResult = tr;
    }
  }

  // 5. Build structured Academic History Cohorts with subject grades
  const academicHistory: AcademicHistoryCohort[] = [];

  for (const [key, group] of cohortGroups.entries()) {
    interface SubjectAccumulator {
      subjectName: string;
      subjectCode?: string | null;
      totalScore: number | null;
      officialResult: boolean;
      assessments: AssessmentGradeItem[];
    }
    const subjectMap = new Map<string, SubjectAccumulator>();

    // Process official subject term results first
    for (const str of group.subjectTermResults) {
      const sName = str.subject?.name || "Subject";
      if (!subjectMap.has(sName)) {
        subjectMap.set(sName, {
          subjectName: sName,
          subjectCode: str.subject?.code,
          totalScore: str.totalScore,
          officialResult: str.totalScore !== null,
          assessments: [],
        });
      } else {
        const item = subjectMap.get(sName)!;
        item.totalScore = str.totalScore;
        item.officialResult = true;
      }
    }

    // Process individual grades
    for (const g of group.grades) {
      if (g.subject.includes("(Total)")) continue;

      const sName = g.subject;
      if (!subjectMap.has(sName)) {
        subjectMap.set(sName, {
          subjectName: sName,
          totalScore: null,
          officialResult: false,
          assessments: [],
        });
      }

      const sItem = subjectMap.get(sName)!;
      const percentage = Number(
        ((g.score / Math.max(1, g.maxMarks)) * 100).toFixed(1)
      );

      sItem.assessments.push({
        id: g.id,
        title: g.subjectPaper?.title || g.exam?.title || `${g.category} Assessment`,
        category: g.category,
        score: g.score,
        maxMarks: g.maxMarks,
        percentage,
        gradeLetter: calculateGradeLetter(percentage).grade,
        date: g.createdAt,
      });
    }

    const subjects: SubjectHistoryRecord[] = [];
    let termSumPercentage = 0;
    let gradedSubjectsCount = 0;

    for (const [sName, sData] of subjectMap.entries()) {
      let subjectPercentage = 0;
      let subjectScore = sData.totalScore;
      let subjectMaxMarks = 100;

      if (sData.officialResult && sData.totalScore !== null) {
        subjectPercentage = sData.totalScore;
        subjectScore = sData.totalScore;
        subjectMaxMarks = 100;
      } else if (sData.assessments.length > 0) {
        const totalAwarded = sData.assessments.reduce((acc, a) => acc + a.score, 0);
        const totalPossible = sData.assessments.reduce(
          (acc, a) => acc + a.maxMarks,
          0
        );
        subjectPercentage = Number(
          ((totalAwarded / Math.max(1, totalPossible)) * 100).toFixed(1)
        );
        subjectScore = totalAwarded;
        subjectMaxMarks = totalPossible;
      }

      const gradeEval = calculateGradeLetter(subjectPercentage);

      subjects.push({
        subjectName: sName,
        subjectCode: sData.subjectCode,
        score: subjectScore,
        maxMarks: subjectMaxMarks,
        percentage: subjectPercentage,
        grade: gradeEval.grade,
        gradeLabel: gradeEval.label,
        gradeColor: gradeEval.color,
        assessmentsCount: sData.assessments.length,
        assessments: sData.assessments.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      });

      if (sData.assessments.length > 0 || sData.officialResult) {
        termSumPercentage += subjectPercentage;
        gradedSubjectsCount++;
      }
    }

    const termAverage =
      group.termResult?.averageScore ??
      (gradedSubjectsCount > 0
        ? Number((termSumPercentage / gradedSubjectsCount).toFixed(1))
        : 0);

    const termEval = calculateGradeLetter(termAverage);

    subjects.sort((a, b) => a.subjectName.localeCompare(b.subjectName));

    academicHistory.push({
      cohortId: key,
      classId: group.classId,
      className: group.className,
      classCode: group.classCode,
      session: group.sessionName,
      term: group.term,
      termDisplay: formatTermDisplay(group.term),
      enrolledAt: group.enrolledAt,
      termAverage,
      termGrade: termEval.grade,
      termGradeLabel: termEval.label,
      totalSubjects: subjects.length,
      subjects,
    });
  }

  // Sort academic cohorts by newest first
  academicHistory.sort(
    (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
  );

  // 6. Build unified chronological timeline items
  const timeline: StudentHistoryTimelineItem[] = [];

  // A. Add academic completion milestones
  for (const cohort of academicHistory) {
    timeline.push({
      id: `academic-${cohort.cohortId}`,
      date: cohort.enrolledAt,
      eventType: "ACADEMIC_RECORD",
      title: `${cohort.className} • ${cohort.termDisplay}`,
      description: `Academic record in ${cohort.session} (${cohort.termDisplay}) with ${cohort.totalSubjects} subjects evaluated. Overall Average: ${cohort.termAverage}% (${cohort.termGradeLabel}).`,
      meta: {
        type: "ACADEMIC_RECORD",
        className: cohort.className,
        classId: cohort.classId,
        session: cohort.session,
        term: cohort.term,
        termDisplay: cohort.termDisplay,
        termAverage: cohort.termAverage,
        termGrade: cohort.termGrade,
        termGradeLabel: cohort.termGradeLabel,
        totalSubjects: cohort.totalSubjects,
        subjects: cohort.subjects,
      },
      school: student?.school,
    });
  }

  // B. Add class enrollments
  for (const ce of student?.classes || []) {
    timeline.push({
      id: `class-enrollment-${ce.id}`,
      date: ce.enrolledAt,
      eventType: "ENROLLMENT",
      title: `Enrolled in ${ce.class.name}`,
      description: `Active cohort enrollment in ${ce.class.name} (${ce.class.session || "Session"} • ${formatTermDisplay(ce.class.term)})`,
      meta: {
        type: "CLASS_ENROLLMENT",
        className: ce.class.name,
        classId: ce.classId,
        session: ce.class.session,
        term: ce.class.term,
        status: "Active",
      },
      school: ce.class.school || student?.school,
    });
  }

  // C. Add school enrollments
  for (const se of student?.enrollments || []) {
    timeline.push({
      id: `school-enrollment-${se.id}`,
      date: se.enrollmentDate,
      eventType: "JOINED_SCHOOL",
      title: `Joined ${se.school.name}`,
      description: `Formally admitted into ${se.school.name} for ${se.academicSession || "Academic Session"} (${formatTermDisplay(se.academicTerm)})`,
      meta: {
        type: "SCHOOL_ENROLLMENT",
        session: se.academicSession,
        term: se.academicTerm,
        level: se.academicLevel,
        status: se.status,
      },
      school: se.school,
    });
  }

  // D. Add all raw studentHistory records
  for (const rh of rawHistories) {
    timeline.push({
      id: rh.id,
      date: rh.date,
      eventType: rh.eventType,
      title: rh.title,
      description: rh.description,
      meta: (rh.meta as Record<string, unknown>) || null,
      performedBy: rh.performedBy,
      school: rh.school,
    });
  }

  // Deduplicate timeline by id and sort descending
  const seenIds = new Set<string>();
  const uniqueTimeline: StudentHistoryTimelineItem[] = [];
  for (const item of timeline) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueTimeline.push(item);
    }
  }
  uniqueTimeline.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 7. Calculate summary metrics
  const uniqueClassIds = new Set(
    academicHistory.map((a) => a.classId).filter(Boolean)
  );
  if (student?.classes) {
    for (const c of student.classes) {
      uniqueClassIds.add(c.classId);
    }
  }

  const uniqueSessions = new Set(
    academicHistory.map((a) => a.session).filter(Boolean)
  );

  const uniqueSubjects = new Set(
    academicHistory.flatMap((a) => a.subjects.map((s) => s.subjectName))
  );

  const overallAverage =
    academicHistory.length > 0
      ? Number(
          (
            academicHistory.reduce((acc, a) => acc + a.termAverage, 0) /
            academicHistory.length
          ).toFixed(1)
        )
      : 0;

  return {
    timeline: uniqueTimeline,
    academicHistory,
    summary: {
      totalClasses: uniqueClassIds.size,
      totalSessions: uniqueSessions.size,
      totalSubjects: uniqueSubjects.size,
      overallAverage,
    },
  };
};

export const assignPrefectRoleService = async (studentId: string, role: string, adminId: string, schoolId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId, schoolId },
    include: { parentLinks: true }
  });

  if (!student) throw new Error("Student not found");

  const oldRole = student.prefectRole;
  const eventType = oldRole ? HistoryEventType.PREFECT_UPDATED : HistoryEventType.PREFECT_ASSIGNED;

  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data: {
      prefectRole: role,
      hasSeenPrefectCelebration: false
    }
  });

  await prisma.studentHistory.create({
    data: {
      studentId,
      schoolId,
      eventType,
      title: `Appointed as ${role}`,
      description: oldRole ? `Role updated from ${oldRole} to ${role}` : `Assigned prefect role: ${role}`,
      performedBy: adminId
    }
  });

  await createNotification({
    recipientType: "STUDENT",
    recipientId: studentId,
    senderType: "SCHOOL",
    senderId: schoolId,
    type: "GENERAL",
    title: `Congratulations! You are now ${role}`,
    message: `You have been appointed as ${role}. Log in to view your new responsibilities.`,
    meta: { studentId, role }
  }).catch(console.error);

  for (const link of student.parentLinks) {
    await createNotification({
      recipientType: "PARENT",
      recipientId: link.parentId,
      senderType: "SCHOOL",
      senderId: schoolId,
      type: "GENERAL",
      title: `Your child is now ${role}`,
      message: `${student.name} has been appointed as ${role}.`,
      meta: { studentId, role }
    }).catch(console.error);
  }

  return updatedStudent;
};

export const removePrefectRoleService = async (studentId: string, reason: string, adminId: string, schoolId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId, schoolId }
  });

  if (!student || !student.prefectRole) throw new Error("Student does not have an active prefect role");

  const oldRole = student.prefectRole;

  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data: {
      prefectRole: null,
      hasSeenPrefectCelebration: true
    }
  });

  await prisma.studentHistory.create({
    data: {
      studentId,
      schoolId,
      eventType: HistoryEventType.PREFECT_REMOVED,
      title: `Removed from ${oldRole} role`,
      description: `Reason: ${reason}`,
      performedBy: adminId
    }
  });

  return updatedStudent;
};

export const acknowledgePrefectCelebrationService = async (studentId: string) => {
  return prisma.student.update({
    where: { id: studentId },
    data: { hasSeenPrefectCelebration: true }
  });
};

export interface StudentSchoolHistoryRecord {
  id: string;
  schoolId?: string | null;
  name: string;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  isCurrent: boolean;
  status: string;
  enrolledAt?: Date | string | null;
  exitedAt?: Date | string | null;
  academicSession?: string | null;
  gradeLevel?: string | null;
  classesAttended: string[];
  overallAverage: number;
  overallGradeLetter: string;
  totalGradesRecorded: number;
  totalSubjects: number;
  topSubjects: Array<{
    subjectName: string;
    averageScore: number;
    gradeLetter: string;
  }>;
  exitReason?: string | null;
  notes?: string | null;
  isExternal?: boolean;
}

export interface StudentSchoolsResponse {
  schools: StudentSchoolHistoryRecord[];
  summary: {
    totalSchools: number;
    currentSchoolName: string;
    overallAverage: number;
    overallGradeLetter: string;
  };
}

const calculateWaecGradeLetter = (pct: number): string => {
  if (pct >= 75) return "A1";
  if (pct >= 70) return "B2";
  if (pct >= 65) return "B3";
  if (pct >= 60) return "C4";
  if (pct >= 55) return "C5";
  if (pct >= 50) return "C6";
  if (pct >= 45) return "D7";
  if (pct >= 40) return "E8";
  return "F9";
};

export const getStudentSchoolsService = async (studentId: string): Promise<StudentSchoolsResponse> => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      school: true,
      originalSchool: true,
      enrollments: {
        include: { school: true },
        orderBy: { enrollmentDate: "desc" },
      },
      classes: {
        include: {
          class: {
            include: { school: true },
          },
        },
      },
      grades: {
        include: { school: true },
      },
      histories: {
        include: { school: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  // School lookup map: keyed by schoolId or external ID
  const schoolMap = new Map<string, StudentSchoolHistoryRecord>();

  // 1. Current school
  if (student.school) {
    const curSchoolId = student.school.id;
    schoolMap.set(curSchoolId, {
      id: curSchoolId,
      schoolId: curSchoolId,
      name: student.school.name,
      logo: student.school.logo || null,
      address: student.school.address || null,
      phone: student.school.phone || null,
      email: student.school.schoolEmail || null,
      website: (student.school as any).website || null,
      isCurrent: true,
      status: "CURRENT",
      enrolledAt: student.createdAt,
      exitedAt: null,
      academicSession: null,
      gradeLevel: student.gradeLevel || student.level || null,
      classesAttended: [],
      overallAverage: 0,
      overallGradeLetter: "N/A",
      totalGradesRecorded: 0,
      totalSubjects: 0,
      topSubjects: [],
      exitReason: null,
      notes: null,
      isExternal: false,
    });
  }

  // 2. Original School (if different from current school)
  if (student.originalSchool && student.originalSchool.id !== student.schoolId) {
    const origId = student.originalSchool.id;
    if (!schoolMap.has(origId)) {
      schoolMap.set(origId, {
        id: origId,
        schoolId: origId,
        name: student.originalSchool.name,
        logo: student.originalSchool.logo || null,
        address: student.originalSchool.address || null,
        phone: student.originalSchool.phone || null,
        email: student.originalSchool.schoolEmail || null,
        website: (student.originalSchool as any).website || null,
        isCurrent: false,
        status: "PREVIOUS",
        enrolledAt: null,
        exitedAt: null,
        academicSession: null,
        gradeLevel: null,
        classesAttended: [],
        overallAverage: 0,
        overallGradeLetter: "N/A",
        totalGradesRecorded: 0,
        totalSubjects: 0,
        topSubjects: [],
        exitReason: "Transferred from original institution",
        notes: null,
        isExternal: false,
      });
    }
  }

  // 3. Platform Enrollments (student_enrollments table)
  student.enrollments.forEach((enrollment) => {
    if (!enrollment.school) return;
    const schId = enrollment.school.id;
    const isCur = schId === student.schoolId;

    if (!schoolMap.has(schId)) {
      schoolMap.set(schId, {
        id: schId,
        schoolId: schId,
        name: enrollment.school.name,
        logo: enrollment.school.logo || null,
        address: enrollment.school.address || null,
        phone: enrollment.school.phone || null,
        email: enrollment.school.schoolEmail || null,
        website: (enrollment.school as any).website || null,
        isCurrent: isCur,
        status: isCur ? "CURRENT" : (enrollment.status || "PREVIOUS"),
        enrolledAt: enrollment.enrollmentDate,
        exitedAt: enrollment.exitDate || null,
        academicSession: enrollment.academicSession || null,
        gradeLevel: enrollment.academicLevel || null,
        classesAttended: [],
        overallAverage: 0,
        overallGradeLetter: "N/A",
        totalGradesRecorded: 0,
        totalSubjects: 0,
        topSubjects: [],
        exitReason: enrollment.exitReason || null,
        notes: enrollment.exitNotes || null,
        isExternal: false,
      });
    } else {
      const existing = schoolMap.get(schId)!;
      if (enrollment.enrollmentDate && (!existing.enrolledAt || new Date(enrollment.enrollmentDate) < new Date(existing.enrolledAt))) {
        existing.enrolledAt = enrollment.enrollmentDate;
      }
      if (enrollment.exitDate) existing.exitedAt = enrollment.exitDate;
      if (enrollment.exitReason) existing.exitReason = enrollment.exitReason;
      if (enrollment.exitNotes) existing.notes = enrollment.exitNotes;
      if (enrollment.academicLevel && !existing.gradeLevel) existing.gradeLevel = enrollment.academicLevel;
      if (enrollment.academicSession && !existing.academicSession) existing.academicSession = enrollment.academicSession;
    }
  });

  // 4. Classes attended per school
  student.classes.forEach((c) => {
    if (!c.class) return;
    const schId = c.class.schoolId || (c.class.school && c.class.school.id);
    if (!schId) return;

    if (!schoolMap.has(schId) && c.class.school) {
      schoolMap.set(schId, {
        id: schId,
        schoolId: schId,
        name: c.class.school.name,
        logo: c.class.school.logo || null,
        address: c.class.school.address || null,
        phone: c.class.school.phone || null,
        email: c.class.school.schoolEmail || null,
        isCurrent: schId === student.schoolId,
        status: schId === student.schoolId ? "CURRENT" : "PREVIOUS",
        enrolledAt: null,
        exitedAt: null,
        academicSession: c.class.session || null,
        gradeLevel: c.class.level || null,
        classesAttended: [c.class.name],
        overallAverage: 0,
        overallGradeLetter: "N/A",
        totalGradesRecorded: 0,
        totalSubjects: 0,
        topSubjects: [],
        exitReason: null,
        notes: null,
        isExternal: false,
      });
    } else if (schoolMap.has(schId)) {
      const rec = schoolMap.get(schId)!;
      if (!rec.classesAttended.includes(c.class.name)) {
        rec.classesAttended.push(c.class.name);
      }
      if (c.class.session && !rec.academicSession) rec.academicSession = c.class.session;
      if (c.class.level && !rec.gradeLevel) rec.gradeLevel = c.class.level;
    }
  });

  // 5. External Previous School records recorded in student_histories
  student.histories.forEach((h) => {
    const meta = (h.meta as Record<string, unknown>) || {};
    if (meta.isPreviousSchoolRecord === true || (h.eventType === "TRANSFERRED" && meta.schoolName)) {
      const extSchoolName = String(meta.schoolName || h.title.replace(/^Previous School:\s*/i, "")).trim();
      const extKey = `ext-${extSchoolName.toLowerCase().replace(/\s+/g, "-")}`;

      if (!schoolMap.has(extKey)) {
        const avg = typeof meta.overallAverage === "number" ? meta.overallAverage : 0;
        const letter = (meta.overallGradeLetter as string) || (avg > 0 ? calculateWaecGradeLetter(avg) : "N/A");

        schoolMap.set(extKey, {
          id: h.id,
          schoolId: null,
          name: extSchoolName,
          logo: null,
          address: (meta.address as string) || null,
          phone: null,
          email: null,
          isCurrent: false,
          status: "PREVIOUS",
          enrolledAt: (meta.enrollmentDate as string) || null,
          exitedAt: (meta.exitDate as string) || h.date,
          academicSession: (meta.academicSession as string) || null,
          gradeLevel: (meta.gradeLevel as string) || null,
          classesAttended: meta.className ? [String(meta.className)] : [],
          overallAverage: avg,
          overallGradeLetter: letter,
          totalGradesRecorded: typeof meta.totalGradesRecorded === "number" ? meta.totalGradesRecorded : 0,
          totalSubjects: typeof meta.totalSubjects === "number" ? meta.totalSubjects : 0,
          topSubjects: Array.isArray(meta.topSubjects) ? (meta.topSubjects as any) : [],
          exitReason: (meta.exitReason as string) || h.description || "Transferred to current institution",
          notes: (meta.notes as string) || null,
          isExternal: true,
        });
      }
    }
  });

  // 6. Aggregate Grades and compute Overall Student Grade for each school
  student.grades.forEach((g) => {
    const schId = g.schoolId;
    if (!schId) return;

    if (!schoolMap.has(schId) && g.school) {
      schoolMap.set(schId, {
        id: schId,
        schoolId: schId,
        name: g.school.name,
        logo: g.school.logo || null,
        address: g.school.address || null,
        phone: g.school.phone || null,
        email: g.school.schoolEmail || null,
        isCurrent: schId === student.schoolId,
        status: schId === student.schoolId ? "CURRENT" : "PREVIOUS",
        enrolledAt: null,
        exitedAt: null,
        academicSession: null,
        gradeLevel: null,
        classesAttended: [],
        overallAverage: 0,
        overallGradeLetter: "N/A",
        totalGradesRecorded: 0,
        totalSubjects: 0,
        topSubjects: [],
        exitReason: null,
        notes: null,
        isExternal: false,
      });
    }
  });

  // For each school in map, calculate grades & subjects breakdown
  schoolMap.forEach((schoolRec, key) => {
    if (schoolRec.isExternal) return; // External records already have manual overall grade snapshot

    const relevantGrades = student.grades.filter((g) => g.schoolId === schoolRec.schoolId);
    if (relevantGrades.length === 0) return;

    let totalPct = 0;
    const subjectMap = new Map<string, { totalScore: number; totalMax: number; count: number }>();

    relevantGrades.forEach((g) => {
      const maxMarks = g.maxMarks > 0 ? g.maxMarks : 100;
      const pct = (g.score / maxMarks) * 100;
      totalPct += pct;

      const subName = g.subject || "General";
      if (!subjectMap.has(subName)) {
        subjectMap.set(subName, { totalScore: g.score, totalMax: maxMarks, count: 1 });
      } else {
        const cur = subjectMap.get(subName)!;
        cur.totalScore += g.score;
        cur.totalMax += maxMarks;
        cur.count += 1;
      }
    });

    const avgPct = Math.round((totalPct / relevantGrades.length) * 10) / 10;
    schoolRec.overallAverage = avgPct;
    schoolRec.overallGradeLetter = calculateWaecGradeLetter(avgPct);
    schoolRec.totalGradesRecorded = relevantGrades.length;
    schoolRec.totalSubjects = subjectMap.size;

    // Top subjects
    const topSubs: Array<{ subjectName: string; averageScore: number; gradeLetter: string }> = [];
    subjectMap.forEach((subData, subName) => {
      const subAvg = Math.round((subData.totalScore / subData.totalMax) * 100 * 10) / 10;
      topSubs.push({
        subjectName: subName,
        averageScore: subAvg,
        gradeLetter: calculateWaecGradeLetter(subAvg),
      });
    });

    topSubs.sort((a, b) => b.averageScore - a.averageScore);
    schoolRec.topSubjects = topSubs.slice(0, 5);
  });

  // Sort schools: Current school first, then previous schools
  const schoolsList = Array.from(schoolMap.values()).sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1;
    if (!a.isCurrent && b.isCurrent) return 1;
    const dateA = a.enrolledAt ? new Date(a.enrolledAt).getTime() : 0;
    const dateB = b.enrolledAt ? new Date(b.enrolledAt).getTime() : 0;
    return dateB - dateA;
  });

  // Calculate platform cumulative average
  const scoredSchools = schoolsList.filter((s) => s.totalGradesRecorded > 0 || s.overallAverage > 0);
  const overallAvg = scoredSchools.length > 0
    ? Math.round(
        (scoredSchools.reduce((acc, s) => acc + s.overallAverage, 0) / scoredSchools.length) * 10
      ) / 10
    : 0;

  return {
    schools: schoolsList,
    summary: {
      totalSchools: schoolsList.length,
      currentSchoolName: student.school?.name || "Unassigned",
      overallAverage: overallAvg,
      overallGradeLetter: calculateWaecGradeLetter(overallAvg),
    },
  };
};

export const addPreviousSchoolRecordService = async ({
  studentId,
  schoolName,
  enrollmentDate,
  exitDate,
  exitReason,
  gradeLevel,
  overallAverage,
  overallGradeLetter,
  notes,
  currentUserId,
}: {
  studentId: string;
  schoolName: string;
  enrollmentDate?: string | Date;
  exitDate?: string | Date;
  exitReason?: string;
  gradeLevel?: string;
  overallAverage?: number;
  overallGradeLetter?: string;
  notes?: string;
  currentUserId: string;
}) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  if (!student) throw new Error("Student not found");

  const schoolId = student.schoolId || "default-school";
  const avg = overallAverage ? Number(overallAverage) : 0;
  const letter = overallGradeLetter || (avg > 0 ? calculateWaecGradeLetter(avg) : "N/A");

  const history = await prisma.studentHistory.create({
    data: {
      studentId,
      schoolId,
      eventType: HistoryEventType.TRANSFERRED,
      title: `Previous School: ${schoolName}`,
      description: `Prior enrollment at ${schoolName}${gradeLevel ? ` (${gradeLevel})` : ""}. Overall academic grade: ${avg > 0 ? `${avg}% (${letter})` : "Not recorded"}. ${notes || ""}`.trim(),
      date: exitDate ? new Date(exitDate) : new Date(),
      performedBy: currentUserId,
      meta: {
        isPreviousSchoolRecord: true,
        schoolName,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate).toISOString() : null,
        exitDate: exitDate ? new Date(exitDate).toISOString() : null,
        exitReason: exitReason || "Transferred to current institution",
        gradeLevel: gradeLevel || null,
        overallAverage: avg,
        overallGradeLetter: letter,
        notes: notes || null,
      },
    },
  });

  return history;
};

export const promoteStudentDirectService = async ({
  studentId,
  toClassId,
  fromClassId,
  currentUserId,
}: {
  studentId: string;
  toClassId: string;
  fromClassId?: string;
  currentUserId: string;
}) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      classes: {
        include: { class: true },
      },
    },
  });

  if (!student) throw new Error("Student not found");

  const effectiveFromClassId = fromClassId || student.classes[0]?.classId;
  const toClass = await prisma.class.findUnique({
    where: { id: toClassId },
    include: { teachers: true },
  });

  if (!toClass) throw new Error("Destination class not found");

  const schoolId = toClass.schoolId || student.schoolId;
  if (!schoolId) throw new Error("School ID missing for promotion");

  if (effectiveFromClassId) {
    const fromClass = await prisma.class.findUnique({ where: { id: effectiveFromClassId } });
    if (!fromClass) throw new Error("Current class not found");

    await prisma.$transaction(async (tx) => {
      await StudentLifecycleService.promoteStudents(
        tx,
        [studentId],
        schoolId,
        effectiveFromClassId,
        toClassId,
        currentUserId
      );
    });
  } else {
    // If student isn't enrolled in a class yet, enroll them directly
    await prisma.$transaction(async (tx) => {
      await tx.classEnrollment.upsert({
        where: { classId_studentId: { classId: toClassId, studentId } },
        create: { classId: toClassId, studentId },
        update: {},
      });

      if (toClass.level) {
        await tx.student.update({
          where: { id: studentId },
          data: { gradeLevel: toClass.level, level: toClass.level },
        });
      }

      await tx.studentHistory.create({
        data: {
          studentId,
          schoolId,
          eventType: HistoryEventType.CLASS_CHANGED,
          title: `Enrolled in ${toClass.name}`,
          description: `Student was enrolled into ${toClass.name} ${toClass.section || ""}`.trim(),
          meta: { toClassId, session: toClass.session },
          performedBy: currentUserId,
        },
      });
    });
  }

  // Post-promotion notification
  await createNotification({
    recipientType: "STUDENT",
    recipientId: studentId,
    senderType: "ADMIN",
    senderId: currentUserId,
    type: "GENERAL",
    title: "Promoted to New Class",
    message: `Congratulations! You have been promoted to ${toClass.name}.`,
    meta: { classId: toClassId },
  }).catch(console.error);

  return {
    success: true,
    message: `Successfully promoted ${student.name} to ${toClass.name}`,
    studentId,
    toClassId,
    className: toClass.name,
  };
};
