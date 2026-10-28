import { Prisma, EnrollmentStatus, HistoryEventType } from "@prisma/client";

export class StudentLifecycleService {
  /**
   * Enrolls a student into a school, ensuring previous active enrollments are closed,
   * and generating the appropriate history records.
   */
  static async enrollStudentInSchool(
    tx: Prisma.TransactionClient,
    studentId: string,
    schoolId: string,
    performedBy?: string
  ) {
    // 1. Close any existing ACTIVE enrollments for this student
    const activeEnrollments = await tx.studentEnrollment.findMany({
      where: {
        studentId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    for (const enrollment of activeEnrollments) {
      await tx.studentEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: EnrollmentStatus.WITHDRAWN,
          exitDate: new Date(),
          exitNotes: "Automatically withdrawn due to new enrollment.",
        },
      });

      // Create history for closing the old enrollment
      await tx.studentHistory.create({
        data: {
          studentId,
          schoolId: enrollment.schoolId,
          eventType: HistoryEventType.EXITED_SCHOOL,
          title: "Student Withdrawn",
          description: "Student was automatically withdrawn to enroll in a new school.",
          performedBy,
        },
      });
    }

    // 2. Create the new Active Enrollment
    await tx.studentEnrollment.create({
      data: {
        studentId,
        schoolId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    // 3. Create the Joined School History Event
    await tx.studentHistory.create({
      data: {
        studentId,
        schoolId,
        eventType: HistoryEventType.JOINED_SCHOOL,
        title: "Student Enrolled",
        description: "Student was successfully enrolled into the school.",
        performedBy,
      },
    });

    // 4. Update the Student's current schoolId
    await tx.student.update({
      where: { id: studentId },
      data: {
        schoolId,
      },
    });
  }

  /**
   * Exits a student from a school by closing their active enrollment,
   * generating a history event, and clearing their school linking.
   */
  static async exitStudentFromSchool(
    tx: Prisma.TransactionClient,
    studentId: string,
    schoolId: string,
    exitData: {
      exitType: EnrollmentStatus;
      exitDate: Date;
      exitReason?: string;
      exitNotes?: string;
    },
    performedBy?: string
  ) {
    const { exitType, exitDate, exitReason, exitNotes } = exitData;

    // 1. Close any existing ACTIVE enrollments for this student, or record departure enrollment
    const activeEnrollments = await tx.studentEnrollment.findMany({
      where: {
        studentId,
        schoolId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (activeEnrollments.length === 0) {
      // Student is enrolled directly via schoolId or class without prior StudentEnrollment row
      await tx.studentEnrollment.create({
        data: {
          studentId,
          schoolId,
          status: exitType,
          exitDate,
          exitReason,
          exitNotes,
        },
      });
    } else {
      for (const enrollment of activeEnrollments) {
        await tx.studentEnrollment.update({
          where: { id: enrollment.id },
          data: {
            status: exitType,
            exitDate,
            exitReason,
            exitNotes,
          },
        });
      }
    }

    // 2. Map EnrollmentStatus to HistoryEventType
    let eventType: HistoryEventType = HistoryEventType.EXITED_SCHOOL;
    switch (exitType) {
      case EnrollmentStatus.GRADUATED:
        eventType = HistoryEventType.GRADUATED;
        break;
      case EnrollmentStatus.TRANSFERRED:
        eventType = HistoryEventType.TRANSFERRED;
        break;
      case EnrollmentStatus.EXPELLED:
        eventType = HistoryEventType.EXPELLED;
        break;
      default:
        eventType = HistoryEventType.EXITED_SCHOOL;
        break;
    }

    // 3. Capture active class context before closing enrollments
    const currentClassEnrollments = await tx.classEnrollment.findMany({
      where: { studentId },
      include: { class: true },
    });
    const lastClass = currentClassEnrollments[0]?.class;

    // 4. Create History Entry with detailed class metadata
    await tx.studentHistory.create({
      data: {
        studentId,
        schoolId,
        eventType,
        title: exitType === EnrollmentStatus.GRADUATED ? "Graduated from School" : `Student ${exitType.charAt(0) + exitType.slice(1).toLowerCase()}`,
        description: exitReason || (exitType === EnrollmentStatus.GRADUATED ? `Student has successfully graduated and completed their studies${lastClass ? ` in ${lastClass.name}` : ''}.` : `Student was marked as ${exitType.toLowerCase()}.`),
        meta: {
          notes: exitNotes || undefined,
          classId: lastClass?.id || undefined,
          className: lastClass?.name || undefined,
          classCode: lastClass?.classCode || undefined,
          exitType,
        },
        performedBy,
        date: exitDate,
      },
    });

    // 5. Update the Student record
    const existingStudent = await tx.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true, originalSchoolId: true },
    });

    await tx.student.update({
      where: { id: studentId },
      data: {
        status: exitType === EnrollmentStatus.GRADUATED ? "GRADUATED" : exitType,
        originalSchoolId: existingStudent?.originalSchoolId || existingStudent?.schoolId || schoolId,
        // For GRADUATED alumni: preserve schoolId so the school retains alumni ownership,
        // and admin dashboard/transcript access doesn't 403.
        // For departed students (transferred, expelled, withdrawn): clear active school linkage.
        schoolId: exitType === EnrollmentStatus.GRADUATED ? (existingStudent?.schoolId || schoolId) : null,
      },
    });

    // 6. Clean up active class enrollments so student leaves active class rosters
    await tx.classEnrollment.deleteMany({
      where: { studentId },
    });
  }

  /**
   * Promotes/Moves students from one class to another.
   */
  static async promoteStudents(
    tx: Prisma.TransactionClient,
    studentIds: string[],
    schoolId: string,
    fromClassId: string,
    toClassId: string,
    performedBy?: string
  ) {
    const fromClass = await tx.class.findUnique({ where: { id: fromClassId } });
    const toClass = await tx.class.findUnique({ where: { id: toClassId } });

    if (!fromClass || !toClass) throw new Error("Invalid class ID provided.");

    for (const studentId of studentIds) {
      // 1. Check existing ClassEnrollment
      const existingEnrollment = await tx.classEnrollment.findUnique({
        where: {
          classId_studentId: { classId: fromClassId, studentId },
        },
      });

      // 2. Remove from old class if enrolled
      if (existingEnrollment) {
        await tx.classEnrollment.delete({
          where: { id: existingEnrollment.id },
        });
      }

      // Also clean up any other active class enrollments to enforce single active class rule
      await tx.classEnrollment.deleteMany({
        where: {
          studentId,
          classId: { not: toClassId },
        },
      });

      // 3. Add to new class
      await tx.classEnrollment.upsert({
        where: {
          classId_studentId: { classId: toClassId, studentId },
        },
        create: {
          classId: toClassId,
          studentId,
        },
        update: {},
      });

      // 4. Update student level, schoolId, and reactivate status to ACTIVE
      await tx.student.update({
        where: { id: studentId },
        data: {
          status: "ACTIVE",
          schoolId: toClass.schoolId || schoolId,
          ...(toClass.level ? { gradeLevel: toClass.level, level: toClass.level } : {}),
        },
      });

      // 5. Gather academic snapshot (Term & Subject Results for this class)
      const termResults = await tx.studentTermResult.findMany({
        where: { studentId, classId: fromClassId },
        include: { session: true }
      });
      
      const subjectResults = await tx.studentSubjectTermResult.findMany({
        where: { studentId, classId: fromClassId },
        include: { subject: true, session: true }
      });

      // 6. Generate history record with comprehensive metadata
      await tx.studentHistory.create({
        data: {
          studentId,
          schoolId,
          eventType: HistoryEventType.PROMOTED,
          title: "Student Promoted",
          description: `Student was promoted from ${fromClass.name} ${fromClass.section || ''} to ${toClass.name} ${toClass.section || ''}.`.trim(),
          meta: { 
            fromClassId, 
            toClassId, 
            fromClassName: `${fromClass.name} ${fromClass.section || ''}`.trim(),
            toClassName: `${toClass.name} ${toClass.section || ''}`.trim(),
            fromClassCode: fromClass.classCode,
            toClassCode: toClass.classCode,
            session: toClass.session || undefined,
            achievements: {
              termResults: termResults.map(tr => ({
                term: tr.term,
                sessionName: tr.session?.name || '',
                averageScore: tr.averageScore,
                totalScore: tr.totalScore,
                position: tr.position
              })),
              subjectResults: subjectResults.map(sr => ({
                term: sr.term,
                sessionName: sr.session?.name || '',
                subjectName: sr.subject?.name || '',
                examScore: sr.examScore,
                caScore: sr.caScore,
                totalScore: sr.totalScore
              }))
            }
          },
          performedBy,
        },
      });
    }
  }
}
