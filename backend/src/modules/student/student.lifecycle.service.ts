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

    // 1. Close any existing ACTIVE enrollments for this student
    const activeEnrollments = await tx.studentEnrollment.findMany({
      where: {
        studentId,
        schoolId,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    if (activeEnrollments.length === 0) {
      throw new Error("Student does not have an active enrollment in this school.");
    }

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

    // 3. Create History Entry
    await tx.studentHistory.create({
      data: {
        studentId,
        schoolId,
        eventType,
        title: `Student ${exitType.charAt(0) + exitType.slice(1).toLowerCase()}`,
        description: exitReason || `Student was marked as ${exitType.toLowerCase()}.`,
        meta: exitNotes ? { notes: exitNotes } : undefined,
        performedBy,
        date: exitDate,
      },
    });

    // 4. Disconnect Student from the School
    // This maintains the single active enrollment rule (they are no longer actively enrolled anywhere)
    await tx.student.update({
      where: { id: studentId },
      data: {
        schoolId: null, // Clear the active school linkage
      },
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

      if (!existingEnrollment) {
        continue; // Student isn't in this class
      }

      // 2. Remove from old class
      await tx.classEnrollment.delete({
        where: { id: existingEnrollment.id },
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

      // 4. Update student level
      if (toClass.level) {
        await tx.student.update({
          where: { id: studentId },
          data: {
            gradeLevel: toClass.level,
            level: toClass.level,
          },
        });
      }

      // 5. Generate history record
      await tx.studentHistory.create({
        data: {
          studentId,
          schoolId,
          eventType: HistoryEventType.PROMOTED,
          title: "Student Promoted",
          description: `Student was promoted from ${fromClass.name} ${fromClass.section || ''} to ${toClass.name} ${toClass.section || ''}.`.trim(),
          meta: { fromClassId, toClassId, session: toClass.session || undefined },
          performedBy,
        },
      });
    }
  }
}
