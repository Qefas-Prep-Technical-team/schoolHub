import prisma from "../../config/database";

export class TeacherAttendanceService {
  /**
   * Save attendance for multiple students in a class.
   * Verifies the teacher has access to the school and class.
   */
  async saveClassAttendance(
    schoolId: string,
    teacherId: string,
    classId: string,
    date: Date,
    attendanceRecords: { studentId: string; status: string; note?: string }[]
  ) {
    // Verify Teacher is assigned to the Class AND Class belongs to the specified School (or has no strict school assigned)
    const classTeacher = await prisma.classTeacher.findFirst({
      where: {
        teacherId: teacherId,
        classId: classId,
        class: {
          OR: [
            { schoolId: schoolId },
            { schoolId: null }
          ]
        }
      },
      include: {
        teacher: true,
        class: true,
      }
    });

    if (!classTeacher) {
      throw new Error('Teacher is not assigned to this class in the specified school');
    }

    const teacher = classTeacher.teacher;

    // 3. Upsert Attendance Records
    const results = await prisma.$transaction(
      attendanceRecords.map((record) => {
        return prisma.attendance.upsert({
          where: {
            classId_studentId_date: {
              classId,
              studentId: record.studentId,
              date,
            },
          },
          update: {
            status: record.status,
            note: record.note,
            recordedById: teacher.id,
            recordedByName: teacher.name,
            recordedByRole: 'TEACHER',
          },
          create: {
            classId,
            studentId: record.studentId,
            date,
            status: record.status,
            note: record.note,
            recordedById: teacher.id,
            recordedByName: teacher.name,
            recordedByRole: 'TEACHER',
          },
        });
      })
    );

    return results;
  }
}

export const teacherAttendanceService = new TeacherAttendanceService();
