import { LinkEntityType, LinkStatus, LinkType } from "@prisma/client";
import prisma from "../../config/database";

/**
 * Get settings for a teacher
 */
export const getTeacherSettingsService = async (teacherId: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { settings: true },
  });
  return (teacher?.settings as any) || {};
};

/**
 * Update settings for a teacher
 */
export const updateTeacherSettingsService = async (teacherId: string, settings: any) => {
  const teacher = await prisma.teacher.update({
    where: { id: teacherId },
    data: { settings },
    select: { settings: true },
  });
  return teacher.settings;
};

/**
 * Fetch dashboard stats for a teacher, optionally filtered by school
 */
export const getTeacherDashboardStatsService = async (teacherId: string, schoolId?: string) => {
  // 1. Get classes assigned to the teacher (Core dependency for other queries)
  const classTeachers = await prisma.classTeacher.findMany({
    where: {
      teacherId,
      ...(schoolId ? { class: { schoolId } } : {}),
    },
    select: { classId: true },
  });

  const assignedClassIds = classTeachers.map((ct) => ct.classId);
  const totalClasses = assignedClassIds.length;

  if (totalClasses === 0) {
    return {
      stats: { totalClasses: 0, totalStudents: 0, upcomingLessons: 0, averagePerformance: 0, attendanceRate: 100 },
      performanceMetrics: { topStudents: [], distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 } },
      recentExams: [],
    };
  }

  // 2. Parallelize independent queries
  const [
    enrollmentCount,
    recentExams,
    gradeStats,
    studentGradeAverages,
    distributionStats,
    attendanceToday
  ] = await Promise.all([
    // Unique student count across assigned classes
    prisma.classEnrollment.groupBy({
      by: ['studentId'],
      where: { classId: { in: assignedClassIds } },
    }).then(groups => groups.length),

    // Recent exams
    prisma.exam.findMany({
      where: {
        classId: { in: assignedClassIds },
        ...(schoolId ? { schoolId } : {}),
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { class: { select: { name: true } }, subject: { select: { name: true } } },
    }),

    // Global performance average (Summing scores and max marks for accurate percentage)
    prisma.grade.aggregate({
      where: { classId: { in: assignedClassIds } },
      _sum: { score: true, maxMarks: true },
    }),

    // Top performers (Grouped by student)
    prisma.grade.groupBy({
      by: ['studentId'],
      where: { classId: { in: assignedClassIds } },
      _sum: { score: true, maxMarks: true },
      orderBy: { _sum: { score: 'desc' } }, // Note: This doesn't sort by average, but it's a good proxy for finding candidates
      take: 10,
    }),

    // Distribution (using raw data but limited for summary speed)
    prisma.grade.findMany({
      where: { classId: { in: assignedClassIds } },
      select: { score: true, maxMarks: true },
      take: 200,
      orderBy: { createdAt: 'desc' }
    }),

    // Attendance rate for today
    prisma.attendance.aggregate({
      where: {
        classId: { in: assignedClassIds },
        date: { gte: new Date(new Date().setHours(0,0,0,0)) },
      },
      _count: { status: true },
    })
  ]);

  // 3. Process Attendance (Separate query for "present" to be efficient)
  const presentCount = await prisma.attendance.count({
    where: {
      classId: { in: assignedClassIds },
      date: { gte: new Date(new Date().setHours(0,0,0,0)) },
      status: "present"
    }
  });

  const totalAttendance = attendanceToday._count.status;
  const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

  // 4. Process Performance
  let averageScore = 0;
  if (gradeStats._sum.maxMarks && gradeStats._sum.maxMarks > 0) {
    averageScore = Math.round((gradeStats._sum.score || 0) / gradeStats._sum.maxMarks * 100);
  }

  // 5. Process Distribution
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  distributionStats.forEach((g) => {
    const avg = (g.score / g.maxMarks) * 100;
    if (avg >= 90) distribution.A++;
    else if (avg >= 80) distribution.B++;
    else if (avg >= 70) distribution.C++;
    else if (avg >= 60) distribution.D++;
    else distribution.F++;
  });

  // 6. Process Top Students (Fetch minimal info for top candidates)
  const topStudentsWithInfo = await Promise.all(
    studentGradeAverages.map(async (s) => {
      const student = await prisma.student.findUnique({
        where: { id: s.studentId },
        select: { name: true, profileImage: true, studentCode: true },
      });
      return {
        id: s.studentId,
        name: student?.name || "Unknown",
        studentCode: student?.studentCode || "N/A",
        image: student?.profileImage,
        average: s._sum.maxMarks && s._sum.maxMarks > 0 ? Math.round((s._sum.score || 0) / s._sum.maxMarks * 100) : 0,
      };
    })
  );

  return {
    stats: {
      totalClasses,
      totalStudents: enrollmentCount,
      upcomingLessons: 0,
      averagePerformance: averageScore,
      attendanceRate,
    },
    performanceMetrics: {
      topStudents: topStudentsWithInfo.sort((a, b) => b.average - a.average || 0).slice(0, 5),
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
        primarySchool: true,
        currentSchool: true
    }
  });

  const schoolsMap = new Map();

  if (teacher?.primarySchool) schoolsMap.set(teacher.primarySchool.id, teacher.primarySchool);
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
  const { teacherId, schoolId, classId, search, page = 1, limit = 8 } = options;
  const skip = (page - 1) * limit;

  // 1. Authorization: Resolve the school context first
  let targetSchoolId = schoolId;
  
  if (classId && !targetSchoolId) {
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      select: { schoolId: true }
    });
    if (classInfo?.schoolId) targetSchoolId = classInfo.schoolId;
  }

  // Ensure teacher actually has access to this data (School or Class level)
  if (targetSchoolId) {
      const teacherProfile = await prisma.teacher.findUnique({
          where: { id: teacherId },
          select: { schoolId: true, currentSchoolId: true }
      });

      const isDirectlyAssociated = teacherProfile?.schoolId === targetSchoolId || teacherProfile?.currentSchoolId === targetSchoolId;
      
      if (!isDirectlyAssociated) {
          const link = await prisma.relationshipLink.findFirst({
              where: {
                  linkType: LinkType.SCHOOL_TEACHER,
                  status: LinkStatus.ACTIVE,
                  OR: [
                      { leftEntityId: targetSchoolId, rightEntityId: teacherId },
                      { leftEntityId: teacherId, rightEntityId: targetSchoolId }
                  ]
              }
          });
          
          if (!link) {
              // Final fallback: Are they explicitly assigned to ANY class in this school?
              const anyAssigned = await prisma.classTeacher.findFirst({
                  where: { teacherId, class: { schoolId: targetSchoolId } }
              });
              if (!anyAssigned) {
                  console.log(`LOG: [getTeacherStudentsService] UNAUTHORIZED for school ${targetSchoolId}`);
                  return { students: [], total: 0 };
              }
          }
      }
  }

  // 2. Resolve exactly which classes to pull students from
  let assignedIds: string[] = [];
  if (classId) {
      assignedIds = [classId];
  } else {
      const classTeachers = await prisma.classTeacher.findMany({
          where: {
              teacherId,
              ...(targetSchoolId ? { class: { schoolId: targetSchoolId } } : {}),
          },
          select: { classId: true }
      });
      assignedIds = classTeachers.map(ct => ct.classId);
  }

  if (assignedIds.length === 0) {
      console.log(`LOG: [getTeacherStudentsService] No classes found for query.`);
      return { students: [], total: 0 };
  }

  // 3. Robust Querying for Students
  const whereClause = {
      classId: { in: assignedIds },
      ...(search ? {
          student: {
              OR: [
                  { name: { contains: search, mode: 'insensitive' as const } },
                  { studentCode: { contains: search, mode: 'insensitive' as const } }
              ]
          }
      } : {})
  };

  // Count enrollments
  const total = await prisma.classEnrollment.count({
      where: whereClause,
  });

  const enrollments = await prisma.classEnrollment.findMany({
      where: whereClause,
      include: {
          student: {
              include: {
                  grades: {
                      where: { classId: { in: assignedIds } },
                      orderBy: { createdAt: 'desc' },
                      take: 1,
                  },
                  attendances: {
                      where: { classId: { in: assignedIds } },
                      take: 10,
                  }
              },
          },
          class: true,
      },
      distinct: ['studentId'],
      skip,
      take: limit,
      orderBy: { enrolledAt: 'desc' }
  });

  console.log(`LOG: [getTeacherStudentsService] Result sets: total=${total}, returned=${enrollments.length}`);

  // 4. Clean Mapping
  const students = enrollments.map(e => {
      const s = e.student;
      if (!s) return null; // Safety check

      const lastGrade = s.grades?.[0];
      const performance = lastGrade 
          ? (lastGrade.score / lastGrade.maxMarks > 0.8 ? 'High' : lastGrade.score / lastGrade.maxMarks > 0.5 ? 'Medium' : 'Low')
          : 'Medium';
          
      const presentCount = s.attendances?.filter((a: any) => a.status === 'present').length || 0;
      const totalAttendance = s.attendances?.length || 0;
      const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

      return {
          id: s.id,
          name: s.name,
          grade: e.class.name,
          avatarUrl: s.profileImage,
          performance,
          attendance: attendanceRate,
          lastExam: lastGrade ? `${Math.round((lastGrade.score / lastGrade.maxMarks) * 100)}/100` : 'N/A'
      };
  }).filter(Boolean);

  return { students, total };
};

/**
 * Fetch classes assigned to a teacher, optionally filtered by school
 */
export const getTeacherClassesService = async (teacherId: string, schoolId?: string) => {
    console.log(`LOG: [getTeacherClassesService] Params: teacherId=${teacherId}, schoolId=${schoolId}`);

    // 1. Check School Connection
    if (schoolId) {
        // 1. Check direct association in Teacher profile
        const teacherProfile = await prisma.teacher.findUnique({
            where: { id: teacherId },
            select: { schoolId: true, currentSchoolId: true }
        });

        const isDirectlyAssociated = teacherProfile?.schoolId === schoolId || teacherProfile?.currentSchoolId === schoolId;

        if (!isDirectlyAssociated) {
            // 2. Check relationship links (robust bidirectional check)
            const activeLink = await prisma.relationshipLink.findFirst({
                where: {
                    linkType: LinkType.SCHOOL_TEACHER,
                    status: LinkStatus.ACTIVE,
                    OR: [
                        {
                            leftEntityType: LinkEntityType.SCHOOL,
                            leftEntityId: schoolId,
                            rightEntityType: LinkEntityType.TEACHER,
                            rightEntityId: teacherId,
                        },
                        {
                            leftEntityType: LinkEntityType.TEACHER,
                            leftEntityId: teacherId,
                            rightEntityType: LinkEntityType.SCHOOL,
                            rightEntityId: schoolId,
                        }
                    ]
                }
            });

            if (!activeLink) {
                console.log(`LOG: [getTeacherClassesService] No active SCHOOL_TEACHER link or direct association found for teacher ${teacherId} in school ${schoolId}`);
                return [];
            }
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
            subjectId: c.subjects[0]?.subject.id || null,
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
            studentCode: data.student.studentCode,
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
        .filter(e => new Date(e.startDate || e.createdAt) > new Date())
        .map(e => ({
            id: e.id,
            title: e.title,
            type: 'exam',
            date: new Date(e.startDate || e.createdAt).toLocaleDateString(),
            description: e.subject?.name || "No Subject",
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

/**
 * Fetch subjects assigned to a teacher, filtered by school.
 * This checks both direct assignment (Subject.teacherId) and the TeacherSubject relation.
 */
export const getTeacherSubjectsService = async (teacherId: string, schoolId: string) => {
    return prisma.subject.findMany({
        where: {
            schoolId,
            isArchived: false,
            OR: [
                { teacherId },
                { teacherSubjects: { some: { teacherId } } }
            ]
        },
        include: {
            teacher: {
                select: { name: true, id: true }
            }
        },
        orderBy: { name: 'asc' }
    });
};

/**
 * Fetch teacher profile
 */
export const getTeacherProfileService = async (teacherId: string) => {
    return prisma.teacher.findUnique({
        where: { id: teacherId },
        include: {
            school: { select: { id: true, name: true, schoolCode: true } },
            currentSchool: { select: { id: true, name: true, schoolCode: true } }
        }
    });
};

/**
 * Update teacher profile
 */
export const updateTeacherProfileService = async (teacherId: string, data: {
    name?: string;
    gender?: any;
    dateOfBirth?: string | Date;
    profileImage?: string;
    bannerImage?: string;
}) => {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.gender) updateData.gender = data.gender;
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.profileImage !== undefined) updateData.profileImage = data.profileImage;
    if (data.bannerImage !== undefined) updateData.bannerImage = data.bannerImage;

    return prisma.teacher.update({
        where: { id: teacherId },
        data: updateData,
        include: {
            school: true,
            currentSchool: true
        }
    });
};

/**
 * Request email update for teacher
 */
export const requestTeacherEmailUpdateService = async (teacherId: string, newEmail: string) => {
    // Check if email is already taken in the teacher table
    const existingUser = await prisma.teacher.findUnique({ where: { email: newEmail } });
    if (existingUser) {
        throw new Error("This email is already registered with another account");
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.teacher.update({
        where: { id: teacherId },
        data: {
            // @ts-ignore - pending fields exist in schema
            pendingEmail: newEmail,
            emailVerificationCode: code,
            emailVerificationExpiry: expiry,
        } as any,
    });

    return code;
};

/**
 * Verify and finalize email update for teacher
 */
export const verifyTeacherEmailUpdateService = async (teacherId: string, code: string) => {
    const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
    });

    if (!teacher) throw new Error("Teacher not found");
    
    const t = teacher as any;

    if (t.emailVerificationCode !== code) {
        throw new Error("Invalid verification code");
    }

    if (new Date() > new Date(t.emailVerificationExpiry)) {
        throw new Error("Verification code has expired");
    }

    if (!t.pendingEmail) {
        throw new Error("No pending email update found");
    }

    return prisma.teacher.update({
        where: { id: teacherId },
        data: {
            email: t.pendingEmail,
            // @ts-ignore - fields exist in schema
            pendingEmail: null,
            emailVerificationCode: null,
            emailVerificationExpiry: null,
        } as any,
    });
};
