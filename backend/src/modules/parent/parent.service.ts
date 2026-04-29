import prisma from "../../config/database";
import { GradeStatus, NotificationStatus } from "@prisma/client";

export const getParentChildrenService = async (parentId: string) => {
  const childrenLinks = await prisma.parentChildLink.findMany({
    where: { parentId, status: "active" },
    include: {
      student: {
        include: {
          school: {
            select: {
              id: true,
              name: true,
              schoolCode: true,
            },
          },
          classes: {
            orderBy: { enrolledAt: 'desc' },
            take: 1,
            include: {
              class: {
                select: {
                  id: true,
                  name: true,
                  section: true,
                },
              },
            },
          },
          grades: {
            where: { status: GradeStatus.PUBLISHED },
            select: {
              score: true,
              maxMarks: true,
            },
          },
          attendances: {
            select: {
              status: true,
            },
          },
        },
      },
    },
  });

  return childrenLinks.map((link) => {
    const student = link.student;
    
    // Calculate Average Grade
    const totalScore = student.grades.reduce((sum, g) => sum + g.score, 0);
    const totalMax = student.grades.reduce((sum, g) => sum + g.maxMarks, 0);
    const averageGrade = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    // Calculate Attendance Rate
    const totalAttendance = student.attendances.length;
    const presentCount = student.attendances.filter(a => a.status.toLowerCase() === 'present').length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    return {
      id: student.id,
      name: student.name,
      studentCode: student.studentCode,
      profileImage: student.profileImage,
      school: student.school,
      currentClass: student.classes[0]?.class || null,
      stats: {
        averageGrade,
        attendanceRate,
        totalGrades: student.grades.length,
      },
      linkStatus: link.status,
      relationship: link.relationship,
    };
  });
};

export const getChildDetailsService = async (parentId: string, childId: string) => {
  // First verify the link exists and is accepted
  const link = await prisma.parentChildLink.findFirst({
    where: { parentId, studentId: childId, status: "active" },
  });

  if (!link) {
    throw new Error("Unauthorized access to child data or child not linked.");
  }

  const student = await prisma.student.findUnique({
    where: { id: childId },
    include: {
      school: true,
      department: true,
      classes: {
        include: {
          class: true,
        },
      },
      grades: {
        where: { status: GradeStatus.PUBLISHED },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          exam: true,
          subjectPaper: {
            include: {
              subject: true,
            }
          },
        },
      },
      attendances: {
        orderBy: { date: 'desc' },
        take: 30,
      },
      behaviourAlerts: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          reporter: {
            select: {
              name: true,
              profileImage: true,
            }
          }
        }
      }
    },
  });

  if (!student) {
    throw new Error("Student not found.");
  }

  return {
    ...student,
    // Add additional derived stats if needed
  };
};

export const getParentDashboardService = async (parentId: string) => {
  // Find first accepted child with all needed data
  const firstLink = await prisma.parentChildLink.findFirst({
    where: { parentId, status: "active" },
    include: {
      student: {
        include: {
          school: { select: { id: true, name: true, schoolCode: true } },
          classes: {
            orderBy: { enrolledAt: "desc" },
            take: 1,
            include: { class: { select: { id: true, name: true, section: true } } },
          },
          grades: {
            where: { status: GradeStatus.PUBLISHED },
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              subject: true,
              score: true,
              maxMarks: true,
              assessmentType: true,
              createdAt: true,
            },
          },
          attendances: {
            orderBy: { date: "desc" },
            take: 30,
            select: { status: true, date: true },
          },
        },
      },
    },
  });

  // Attendance rate for the first child
  const attendanceRecords = firstLink?.student.attendances || [];
  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(
    (a) => a.status.toLowerCase() === "present"
  ).length;
  const attendanceRate =
    totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Last 30 days attendance breakdown (for the bar chart) — oldest first
  const attendanceBreakdown = [...attendanceRecords].reverse().map((r) => ({
    date: r.date,
    present: r.status.toLowerCase() === "present",
  }));

  // Average grade across all grades of first child
  const allGrades = firstLink?.student.grades || [];
  const totalScore = allGrades.reduce((s, g) => s + g.score, 0);
  const totalMax = allGrades.reduce((s, g) => s + g.maxMarks, 0);
  const averageGrade = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  // Upcoming exams for the student's current class
  const classId = firstLink?.student.classes[0]?.class?.id;
  const upcomingExams = classId
    ? await prisma.exam.findMany({
        where: {
          classId,
          status: "PUBLISHED",
          startDate: { gte: new Date() },
        },
        orderBy: { startDate: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          startDate: true,
          durationMinutes: true,
          subject: { select: { name: true } },
          category: true,
        },
      })
    : [];

  // Recent parent notifications (used as announcements)
  const notifications = await prisma.notification.findMany({
    where: { recipientType: "PARENT", recipientId: parentId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      status: true,
      createdAt: true,
    },
  });

  // Payments summary
  const payments = await prisma.payment.findMany({
    where: { parentId },
    select: { amount: true, status: true },
  });
  const totalPaid = payments
    .filter((p) => p.status === "SUCCESS" || p.status === "PAID")
    .reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = payments
    .filter((p) => p.status === "PENDING")
    .reduce((s, p) => s + p.amount, 0);
  const totalFees = totalPaid + totalOutstanding;

  const student = firstLink?.student;

  return {
    child: student
      ? {
          id: student.id,
          name: student.name,
          studentCode: student.studentCode,
          profileImage: student.profileImage,
          school: student.school,
          currentClass: student.classes[0]?.class || null,
          recentGrades: student.grades,
        }
      : null,
    stats: {
      attendanceRate,
      averageGrade,
      attendanceBreakdown,
    },
    upcomingExams,
    notifications,
    payments: {
      totalPaid,
      totalOutstanding,
      totalFees,
    },
  };
};
