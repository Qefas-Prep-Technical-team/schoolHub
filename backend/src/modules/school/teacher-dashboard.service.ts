import { LinkEntityType, LinkStatus, LinkType, PrismaClient } from "@prisma/client";
import prisma from "../../config/database";

/**
 * Fetch dashboard stats for a teacher, optionally filtered by school
 */
export const getTeacherDashboardStatsService = async (teacherId: string, schoolId?: string) => {
  // 1. Get classes assigned to the teacher
  const classTeachers = await prisma.classTeacher.findMany({
    where: {
      teacherId,
      ...(schoolId ? { class: { schoolId } } : {}),
    },
    include: {
      class: {
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
      },
    },
  });

  const assignedClassIds = classTeachers.map((ct) => ct.classId);
  const totalClasses = assignedClassIds.length;

  // 2. Get unique students across those classes
  const enrollments = await prisma.classEnrollment.findMany({
    where: {
      classId: { in: assignedClassIds },
    },
    select: {
      studentId: true,
    },
  });

  const uniqueStudentIds = new Set(enrollments.map((e) => e.studentId));
  const totalStudents = uniqueStudentIds.size;

  // 3. Fetch recent exams/assignments for these classes
  const recentExams = await prisma.exam.findMany({
    where: {
      classId: { in: assignedClassIds },
      ...(schoolId ? { schoolId } : {}),
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      class: true,
      subject: true,
    },
  });

  // 4. Calculate some performance analytics (simplified)
  // Get grades for students in these classes
  const grades = await prisma.grade.findMany({
    where: {
      classId: { in: assignedClassIds },
    },
    select: {
      score: true,
      maxMarks: true,
    },
    take: 100, // Limit for performance
  });

  let averageScore = 0;
  if (grades.length > 0) {
    const totalPercentage = grades.reduce((acc, g) => acc + (g.score / g.maxMarks) * 100, 0);
    averageScore = Math.round(totalPercentage / grades.length);
  }

  // 5. Performance Metrics (Detailed)
  // Fetch top 5 students in these classes by their average grade
  const studentGrades = await prisma.grade.findMany({
    where: { classId: { in: assignedClassIds } },
    select: {
      studentId: true,
      score: true,
      maxMarks: true,
    },
  });

  const studentAveragesMap = new Map<string, { total: number; count: number }>();
  studentGrades.forEach((g) => {
    const current = studentAveragesMap.get(g.studentId) || { total: 0, count: 0 };
    studentAveragesMap.set(g.studentId, {
      total: current.total + (g.score / g.maxMarks) * 100,
      count: current.count + 1,
    });
  });

  const sortedStudents = Array.from(studentAveragesMap.entries())
    .map(([studentId, data]) => ({
      studentId,
      average: Math.round(data.total / data.count),
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 5);

  // Fetch student names for the top performers
  const topStudentsWithInfo = await Promise.all(
    sortedStudents.map(async (s) => {
      const student = await prisma.student.findUnique({
        where: { id: s.studentId },
        select: { name: true, profileImage: true },
      });
      return {
        id: s.studentId,
        name: student?.name || "Unknown Student",
        image: student?.profileImage,
        average: s.average,
      };
    })
  );

  // Performance Distribution
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  studentAveragesMap.forEach((data) => {
    const avg = data.total / data.count;
    if (avg >= 90) distribution.A++;
    else if (avg >= 80) distribution.B++;
    else if (avg >= 70) distribution.C++;
    else if (avg >= 60) distribution.D++;
    else distribution.F++;
  });

  // 6. Attendance Summary (simplified)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attendance = await prisma.attendance.findMany({
    where: {
      classId: { in: assignedClassIds },
      date: today,
    },
  });

  const totalPresent = attendance.filter((a) => a.status === "present").length;
  const attendancePercentage = attendance.length > 0 ? Math.round((totalPresent / attendance.length) * 100) : 100;

  return {
    stats: {
      totalClasses,
      totalStudents,
      upcomingLessons: 0,
      averagePerformance: averageScore,
      attendanceRate: attendancePercentage,
    },
    performanceMetrics: {
      topStudents: topStudentsWithInfo,
      distribution,
    },
    recentExams: recentExams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      className: exam.class?.name || "N/A",
      subject: exam.subject?.name || "N/A",
      status: exam.status,
      date: exam.createdAt,
    })),
  };
};

/**
 * Fetch schools linked to the teacher
 */
export const getTeacherLinkedSchoolsService = async (teacherId: string) => {
  // Find active school-teacher links from RelationshipLink
  const links = await prisma.relationshipLink.findMany({
    where: {
      linkType: LinkType.SCHOOL_TEACHER,
      status: LinkStatus.ACTIVE,
      OR: [
        { leftEntityType: LinkEntityType.TEACHER, leftEntityId: teacherId },
        { rightEntityType: LinkEntityType.TEACHER, rightEntityId: teacherId },
      ],
    },
    include: {
        school: true
    }
  });

  // Also include the primary school associated with the teacher record
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
        school: true,
        currentSchool: true
    }
  });

  const schoolsMap = new Map();

  if (teacher?.school) schoolsMap.set(teacher.school.id, teacher.school);
  if (teacher?.currentSchool) schoolsMap.set(teacher.currentSchool.id, teacher.currentSchool);

  links.forEach(link => {
      // Find which side is the school
      // The RelationLink model doesn't have a direct 'school' relation that matches left/right automatically in queries usually
      // But based on RelationshipLink model: school School? @relation(fields: [schoolId], references: [id], onDelete: SetNull)
      if (link.schoolId && link.school) {
          schoolsMap.set(link.schoolId, link.school);
      }
  });
  return Array.from(schoolsMap.values()).map(school => ({
      id: school.id,
      name: school.name,
      logo: school.logo,
      schoolCode: school.schoolCode
  }));
};

/**
 * Fetch performance trends for a teacher, grouped by month
 */
export const getTeacherPerformanceTrendsService = async (teacherId: string, schoolId?: string, range: 'week' | 'month' | 'semester' = 'month') => {
  // 1. Get classes assigned to the teacher
  const classTeachers = await prisma.classTeacher.findMany({
    where: {
      teacherId,
      ...(schoolId ? { class: { schoolId } } : {}),
    },
    select: { classId: true },
  });

  const assignedClassIds = classTeachers.map((ct) => ct.classId);

  // 2. Fetch grades for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const grades = await prisma.grade.findMany({
    where: {
      classId: { in: assignedClassIds },
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      score: true,
      maxMarks: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // 3. Group by month (simplified aggregation)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendsMap = new Map<string, { total: number; count: number; top: number; low: number }>();

  grades.forEach((g) => {
    const date = new Date(g.createdAt);
    const monthName = months[date.getMonth()];
    const percentage = (g.score / g.maxMarks) * 100;

    if (!trendsMap.has(monthName)) {
      trendsMap.set(monthName, { total: percentage, count: 1, top: percentage, low: percentage });
    } else {
      const current = trendsMap.get(monthName)!;
      current.total += percentage;
      current.count += 1;
      current.top = Math.max(current.top, percentage);
      current.low = Math.min(current.low, percentage);
    }
  });

  // 4. Transform to array
  const trends = Array.from(trendsMap.entries()).map(([month, data]) => ({
    month,
    average: Math.round(data.total / data.count),
    top: Math.round(data.top),
    low: Math.round(data.low),
  }));

  // Ensure we have at least some data points for the chart if empty
  if (trends.length === 0) {
    const currentMonth = months[new Date().getMonth()];
    trends.push({ month: currentMonth, average: 0, top: 0, low: 0 });
  }

  return {
    trends,
    summary: {
      currentAvg: trends.length > 0 ? trends[trends.length - 1].average : 0,
      previousAvg: trends.length > 1 ? trends[trends.length - 2].average : 0,
      status: trends.length > 1 && trends[trends.length - 1].average >= trends[trends.length - 2].average ? 'up' : 'down'
    }
  };
};

/**
 * Fetch students for a teacher, filtered by school
 */
export const getTeacherStudentsService = async (teacherId: string, schoolId?: string) => {
  // 1. Get classes assigned to the teacher
  const classTeachers = await prisma.classTeacher.findMany({
    where: {
      teacherId,
      ...(schoolId ? { class: { schoolId } } : {}),
    },
    select: { classId: true },
  });

  const assignedClassIds = classTeachers.map((ct) => ct.classId);

  // 2. Find unique students in these classes
  const enrollments = await prisma.classEnrollment.findMany({
    where: { classId: { in: assignedClassIds } },
    include: {
      student: {
        include: {
          grades: {
            where: { classId: { in: assignedClassIds } },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          attendances: {
            where: { classId: { in: assignedClassIds } },
            take: 10,
          }
        },
      },
      class: true,
    },
  }) as any[];

  // 3. Map to final format
  const studentsMap = new Map();
  
  enrollments.forEach(e => {
    if (!studentsMap.has(e.studentId)) {
        const student = e.student;
        const lastGrade = student.grades[0];
        const performance = lastGrade 
            ? (lastGrade.score / lastGrade.maxMarks > 0.8 ? 'High' : lastGrade.score / lastGrade.maxMarks > 0.5 ? 'Medium' : 'Low')
            : 'Low';
            
        // Calculate attendance average for this student in teacher's classes
        const presentCount = student.attendances.filter((a: any) => a.status === 'present').length;
        const totalAttendance = student.attendances.length;
        const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

        studentsMap.set(e.studentId, {
            id: e.studentId,
            name: student.name,
            grade: e.class.name,
            avatarUrl: student.profileImage,
            performance,
            attendance: attendanceRate,
            lastExam: lastGrade ? `${Math.round((lastGrade.score / lastGrade.maxMarks) * 100)}/100` : 'N/A'
        });
    }
  });

  return Array.from(studentsMap.values());
};
