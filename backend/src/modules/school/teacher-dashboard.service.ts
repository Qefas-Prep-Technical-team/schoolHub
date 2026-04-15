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
export const getTeacherStudentsService = async (options: {
  teacherId: string;
  schoolId?: string;
  classId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const { teacherId, schoolId, classId, search = "", page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  console.log(`LOG: [getTeacherStudentsService] Params: teacherId=${teacherId}, schoolId=${schoolId}, classId=${classId}, search=${search}, page=${page}, limit=${limit}`);

  // 1. Check School Connection (following user's request)
  if (schoolId) {
    const activeLink = await prisma.relationshipLink.findFirst({
      where: {
        linkType: LinkType.SCHOOL_TEACHER,
        status: LinkStatus.ACTIVE,
        leftEntityId: schoolId,
        rightEntityId: teacherId,
      }
    });

    if (!activeLink) {
      console.log(`LOG: [getTeacherStudentsService] No active SCHOOL_TEACHER link found for teacher ${teacherId} in school ${schoolId}`);
      return { students: [], total: 0 };
    }
    console.log(`LOG: [getTeacherStudentsService] Active SCHOOL_TEACHER link confirmed for teacher ${teacherId}`);
  }

  // 2. Find assigned classes
  const classTeachers = await prisma.classTeacher.findMany({
    where: {
      teacherId,
      ...(classId ? { classId } : schoolId ? { class: { schoolId } } : {}),
    },
    select: { classId: true },
  });

  const assignedClassIds = classTeachers.map((ct) => ct.classId);
  console.log(`LOG: [getTeacherStudentsService] Found ${assignedClassIds.length} classes for teacher ${teacherId}${classId ? ` in class ${classId}` : schoolId ? ` in school ${schoolId}` : ''}`);


  if (assignedClassIds.length === 0) {
    return { students: [], total: 0 };
  }

  // 3. Count total unique matching students
  const countResult = await prisma.classEnrollment.groupBy({
    by: ['studentId'],
    where: {
      classId: { in: assignedClassIds },
      student: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { studentCode: { contains: search, mode: 'insensitive' } }
        ]
      } : {}
    },
  });
  const total = countResult.length;

  // 4. Find unique students in these classes with pagination
  const enrollments = await prisma.classEnrollment.findMany({
    where: {
      classId: { in: assignedClassIds },
      student: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { studentCode: { contains: search, mode: 'insensitive' } }
        ]
      } : {}
    },
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
    distinct: ['studentId'],
    skip,
    take: limit,
  }) as any[];

  console.log(`LOG: [getTeacherStudentsService] Successfully fetched ${enrollments.length} students (total matching: ${total})`);

  // 5. Map to final format
  const students = enrollments.map(e => {
    const student = e.student;
    const lastGrade = student.grades[0];
    const performance = lastGrade 
        ? (lastGrade.score / lastGrade.maxMarks > 0.8 ? 'High' : lastGrade.score / lastGrade.maxMarks > 0.5 ? 'Medium' : 'Low')
        : 'Low';
        
    const presentCount = student.attendances.filter((a: any) => a.status === 'present').length;
    const totalAttendance = student.attendances.length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

    return {
        id: e.studentId,
        name: student.name,
        grade: e.class.name,
        avatarUrl: student.profileImage,
        performance,
        attendance: attendanceRate,
        lastExam: lastGrade ? `${Math.round((lastGrade.score / lastGrade.maxMarks) * 100)}/100` : 'N/A'
    };
  });

  return { students, total };
};

/**
 * Fetch classes assigned to a teacher, optionally filtered by school
 */
export const getTeacherClassesService = async (teacherId: string, schoolId?: string) => {
    console.log(`LOG: [getTeacherClassesService] Params: teacherId=${teacherId}, schoolId=${schoolId}`);

    // 1. Check School Connection
    if (schoolId) {
        const activeLink = await prisma.relationshipLink.findFirst({
            where: {
                linkType: LinkType.SCHOOL_TEACHER,
                status: LinkStatus.ACTIVE,
                leftEntityId: schoolId,
                rightEntityId: teacherId,
            }
        });

        if (!activeLink) {
            console.log(`LOG: [getTeacherClassesService] No active SCHOOL_TEACHER link found for teacher ${teacherId} in school ${schoolId}`);
            return [];
        }
    }

    // 2. Fetch classes from ClassTeacher
    const classTeachers = await prisma.classTeacher.findMany({
        where: {
            teacherId,
            ...(schoolId ? { class: { schoolId } } : {}),
        },
        include: {
            class: {
                include: {
                    subjects: {
                        include: {
                            subject: true,
                        }
                    },
                    _count: {
                        select: {
                            enrollments: true,
                            exams: true,
                        }
                    },
                    // Fetch all grades for stats
                    grades: {
                        select: {
                            score: true,
                            maxMarks: true,
                        }
                    },
                    // Fetch all attendances for stats
                    attendances: {
                        select: {
                            status: true,
                        }
                    }
                }
            }
        }
    });

    console.log(`LOG: [getTeacherClassesService] Found ${classTeachers.length} classes`);

    // 3. Map to final format with aggregated stats
    return classTeachers.map(ct => {
        const c = ct.class;
        
        // Calculate attendance rate
        const totalAttendance = c.attendances.length;
        const presentCount = c.attendances.filter(a => a.status === 'present').length;
        const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

        // Calculate average grade
        const grades = c.grades;
        let averageGrade = 0;
        if (grades.length > 0) {
            const totalPercentage = grades.reduce((acc, g) => acc + (g.score / g.maxMarks) * 100, 0);
            averageGrade = Math.round(totalPercentage / grades.length);
        }

        return {
            id: c.id,
            name: c.name,
            subject: c.subjects[0]?.subject.name || "Multiple Subjects",
            level: c.name.split(' ')[0] || "N/A", // Heuristic for level if not explicit
            section: c.section || "N/A",
            studentCount: c._count.enrollments,
            schedule: ["Mon 10:00 AM", "Wed 11:00 AM"], // TODO: Implement timetable fetching if needed
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAL0zLD-Zw46tNNL9EF1qqlpRbHgO1uuHKCc1UzyBWbcMscRxmReR48BycWbICZ1XucCngOmFuhIQypaoYOkrb_tyfO-EqXeyW0xp5nbQG3aN2C3YPS1PYFCsYngX4jGiAFreP25p26O9Qapvyl2IEgHYHbUWMbbGX3rQ89Gwk8FKCS9y7U3WBVV2lItx5X1EK1WgBsz1FlCTK_8BVi3B8LOqjtmgTT1H-323TgrkkE_t1syWBrbat_SnihV4WOPjvz-Tkg1US2yvY",
            assignments: 0, // Simplified for now
            exams: c._count.exams,
            attendance: attendanceRate,
            averageGrade: averageGrade,
        };
    });
};

/**
 * Fetch detailed data for a specific class
 */
export const getTeacherClassDetailService = async (teacherId: string, classId: string) => {
    console.log(`LOG: [getTeacherClassDetailService] Params: teacherId=${teacherId}, classId=${classId}`);

    // 1. Verify Teacher-Class Assignment
    const classTeacher = await prisma.classTeacher.findFirst({
        where: {
            teacherId,
            classId,
        },
        include: {
            class: {
                include: {
                    subjects: { include: { subject: true } },
                    _count: { select: { enrollments: true, exams: true } },
                    grades: { include: { student: true } },
                    attendances: true,
                    exams: { include: { subject: true } },
                }
            }
        }
    });

    if (!classTeacher) {
        throw new Error("Class not found or not assigned to you");
    }

    const c = classTeacher.class;

    // 2. Aggregate Stats
    const totalAttendance = c.attendances.length;
    const presentCount = c.attendances.filter(a => a.status === 'present').length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

    const grades = c.grades;
    let averageGrade = 0;
    if (grades.length > 0) {
        const totalPercentage = grades.reduce((acc, g) => acc + (g.score / g.maxMarks) * 100, 0);
        averageGrade = Math.round(totalPercentage / grades.length);
    }

    // 3. Top Performing Students
    const studentGradesMap = new Map<string, { total: number; count: number; student: any }>();
    grades.forEach(g => {
        const current = studentGradesMap.get(g.studentId) || { total: 0, count: 0, student: g.student };
        studentGradesMap.set(g.studentId, {
            total: current.total + (g.score / g.maxMarks) * 100,
            count: current.count + 1,
            student: g.student
        });
    });

    const topStudents = Array.from(studentGradesMap.values())
        .map(data => ({
            id: data.student.id,
            name: data.student.name,
            score: Math.round(data.total / data.count),
            avatar: data.student.profileImage,
            rank: 0, // Assigned below
            improvement: "+2%" // Mockup for now
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((s, idx) => ({ ...s, rank: idx + 1 }));

    // 4. Upcoming Activities (Exams/Quizzes)
    const upcomingActivities = c.exams
        .filter(e => new Date(e.date) > new Date())
        .map(e => ({
            id: e.id,
            title: e.title,
            type: 'exam',
            date: new Date(e.date).toLocaleDateString(),
            description: e.subject.name,
            status: 'upcoming',
            icon: 'description',
            color: 'red'
        }))
        .slice(0, 5);

    // 5. Recent Submissions (Pending Grades or recently graded)
    const recentSubmissions = grades
        .slice(0, 5)
        .map(g => ({
            id: g.id,
            studentName: g.student.name,
            assignment: "Assessment", // Generic
            avatar: g.student.profileImage,
            submittedDate: new Date(g.createdAt).toLocaleDateString(),
            status: 'graded'
        }));

    return {
        classInfo: {
            id: c.id,
            name: c.name,
            subject: c.subjects[0]?.subject.name || "Multiple Subjects",
            subjectCode: c.classCode,
            level: c.name.split(' ')[0] || "N/A",
            teacher: "You", // TODO: Fetch teacher name if needed
            studentCount: c._count.enrollments,
            academicYear: "2024-2025",
            term: "Term 1",
            room: "TBD",
            schedule: "Mon/Wed 10:00 AM"
        },
        stats: {
            averageGrade: averageGrade,
            assignmentsCompleted: grades.length,
            quizzesCompleted: 0,
            upcomingDeadlines: upcomingActivities.length,
            participationRate: attendanceRate
        },
        upcomingActivities,
        topStudents,
        attendance: {
            overallPercentage: attendanceRate,
            present: presentCount,
            absent: totalAttendance - presentCount,
            late: 0,
            trend: "+0%"
        },
        recentSubmissions
    };
};

/**
 * Fetch assessments (exams/quizzes/assignments) for a specific class
 */
export const getTeacherClassAssignmentsService = async (teacherId: string, classId: string, category?: string) => {
    // 1. Verify assignment
    const assigned = await prisma.classTeacher.findUnique({
        where: { classId_teacherId: { classId, teacherId } }
    });

    if (!assigned) {
        throw new Error("You are not assigned to this class");
    }

    // 2. Fetch exams for this class
    const exams = await prisma.exam.findMany({
        where: { 
            classId,
            ...(category ? { category: category as any } : {})
        },
        include: {
            examAttempts: {
                select: { id: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // 3. Get total students in class for submission ratio
    const totalStudents = await prisma.classEnrollment.count({
        where: { classId }
    });

    return exams.map(exam => ({
        id: exam.id,
        title: exam.title,
        dueDate: exam.endDate,
        status: exam.status.toLowerCase(), // draft, published, etc
        submissions: {
            submitted: exam.examAttempts.length,
            total: totalStudents
        },
        createdAt: exam.createdAt,
        updatedAt: exam.updatedAt
    }));
};

/**
 * Fetch grades for students in a specific class
 */
export const getTeacherClassGradesService = async (teacherId: string, classId: string) => {
    // 1. Verify assignment
    const assigned = await prisma.classTeacher.findUnique({
        where: { classId_teacherId: { classId, teacherId } }
    });

    if (!assigned) {
        throw new Error("You are not assigned to this class");
    }

    // 2. Fetch all students in the class
    const enrollments = await prisma.classEnrollment.findMany({
        where: { classId },
        include: {
            student: {
                include: {
                    grades: {
                        where: { classId }
                    }
                }
            }
        }
    });

    // 3. Map to StudentGrade format
    const studentGrades = enrollments.map(e => {
        const student = e.student;
        const grades = student.grades;

        const caGrades = grades.filter(g => g.category !== 'EXAM');
        const examGrades = grades.filter(g => g.category === 'EXAM');

        const caScore = caGrades.reduce((acc, g) => acc + g.score, 0);
        const caTotal = caGrades.reduce((acc, g) => acc + g.maxMarks, 0);

        const examScore = examGrades.reduce((acc, g) => acc + g.score, 0);
        const examTotal = examGrades.reduce((acc, g) => acc + g.maxMarks, 0);

        const totalScore = caScore + examScore;
        const totalMarks = caTotal + examTotal;

        return {
            id: student.id,
            studentId: student.studentCode || student.id.slice(-5).toUpperCase(),
            studentName: student.name,
            avatar: student.profileImage,
            grades: {
                continuousAssessment: { 
                    score: caTotal > 0 ? caScore : undefined, 
                    total: caTotal > 0 ? caTotal : 50,
                    percentage: caTotal > 0 ? Math.round((caScore / caTotal) * 100) : 0
                },
                exams: { 
                    score: examTotal > 0 ? examScore : undefined, 
                    total: examTotal > 0 ? examTotal : 50,
                    percentage: examTotal > 0 ? Math.round((examScore / examTotal) * 100) : 0
                },
                total: totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0,
                position: 0 // Will calculate after
            },
            status: grades.length > 0 ? 'graded' : 'pending',
            lastUpdated: grades.length > 0 ? grades[0].updatedAt : undefined
        };
    });

    // 4. Calculate positions
    const sorted = [...studentGrades].sort((a, b) => (b.grades.total || 0) - (a.grades.total || 0));
    studentGrades.forEach(sg => {
        sg.grades.position = sorted.findIndex(s => s.id === sg.id) + 1;
    });

    return studentGrades;
};
