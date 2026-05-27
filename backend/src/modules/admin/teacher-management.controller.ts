import prisma from "../../config/database";
import { Request, Response } from "express";
import { getTeacherTimetableService, upsertTimetablePeriodService, deleteTimetablePeriodService } from "../class/timetable.service";
import { getSingleString } from "../../utils/request-utils";
import { generateUniqueCode } from "../../utils/code-generator";
import { sendTeacherInvitationEmail } from "../auth/auth.service";
import crypto from "crypto";
import { enforceTeacherLimit } from "../subscription/quota.helpers";

/**
 * Get detailed teacher information by ID
 */
export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const id = getSingleString(req.params.id as string | string[] | undefined);

    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { id },
          { teacherCode: id }
        ]
      },
      include: {
        school: true,
        currentSchool: true,
        teacherSubjects: {
          include: {
            subject: true,
          },
        },
        classTeachers: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    let resolvedSchoolId = teacher.activeSchoolId || teacher.primarySchoolId || teacher.schoolId;
    if (!resolvedSchoolId && teacher.teacherSubjects.length > 0) {
      resolvedSchoolId = teacher.teacherSubjects[0].subject.schoolId;
    }

    // Format data for frontend
    const formattedData = {
      id: teacher.id,
      activeSchoolId: teacher.activeSchoolId,
      primarySchoolId: teacher.primarySchoolId,
      schoolId: teacher.schoolId,
      resolvedSchoolId,
      name: teacher.name,
      email: teacher.email,
      teacherCode: teacher.teacherCode,
      avatar: teacher.profileImage,
      status: teacher.verified ? 'active' : 'inactive',
      verified: teacher.verified,
      isClaimed: teacher.isClaimed,
      personalInfo: {
        fullName: teacher.name,
        gender: teacher.gender,
        email: teacher.email,
        phone: "Not provided",
        address: "Not provided",
        highestQualification: "Not provided",
        yearsOfExperience: "Not provided"
      },
      professionalInfo: {
        department: teacher.department || "General",
        subjects: teacher.teacherSubjects.map((ts: any) => ts.subject.name),
        assignedClasses: teacher.classTeachers.map((ct: any) => ct.class.name)
      },
      statistics: {
        classPerformance: '85%', // Placeholder
        attendanceRate: '95%',    // Placeholder
        upcomingClasses: teacher.classTeachers.length.toString(),
        studentsTaught: '0'       // Placeholder
      }
    };

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error: any) {
    console.error("getTeacherById error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Assign a teacher to a class
 */
export const assignTeacherToClass = async (req: Request, res: Response) => {
  try {
    const inputId = getSingleString(req.params.id as string | string[] | undefined);
    const { classId, isLead = false } = req.body;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "classId is required",
      });
    }

    // Resolve real teacher ID if inputId is a teacherCode
    let teacherId = inputId;
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: inputId }, { teacherCode: inputId }]
      },
      select: { id: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    teacherId = teacher.id;

    // Create the assignment
    const assignment = await prisma.classTeacher.upsert({
      where: {
        classId_teacherId: {
          classId,
          teacherId,
        }
      },
      update: { isLead },
      create: {
        classId,
        teacherId,
        isLead,
      }
    });

    return res.status(200).json({
      success: true,
      message: "Teacher assigned to class successfully",
      data: assignment,
    });
  } catch (error: any) {
    console.error("assignTeacherToClass error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Update teacher information
 */
export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const inputId = getSingleString(req.params.id as string | string[] | undefined);
    const { department, name, gender } = req.body;

    // Resolve real teacher ID if inputId is a teacherCode
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: inputId }, { teacherCode: inputId }]
      },
      select: { id: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Update teacher record
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        ...(department && { department }),
        ...(name && { name }),
        ...(gender && { gender }),
      }
    });

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error: any) {
    console.error("updateTeacher error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Get teacher timetable
 */
export const getTeacherTimetable = async (req: Request, res: Response) => {
  try {
    const inputId = getSingleString(req.params.id as string | string[] | undefined);

    // Resolve real teacher ID if inputId is a teacherCode
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: inputId }, { teacherCode: inputId }]
      },
      select: { id: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const termPeriodId = req.query.termPeriodId as string | undefined;
    const schoolId = req.query.schoolId as string | undefined;
    const timetable = await getTeacherTimetableService(teacher.id, termPeriodId, schoolId);

    return res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error: any) {
    console.error("getTeacherTimetable error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Create/Update a timetable period for a teacher
 */
export const createTimetablePeriod = async (req: Request, res: Response) => {
  try {
    const inputId = getSingleString(req.params.id as string | string[] | undefined);
    const { classId, day, startTime, endTime, subjectId, room } = req.body;

    // Resolve real teacher ID if inputId is a teacherCode
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: inputId }, { teacherCode: inputId }]
      },
      select: { id: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Use existing upsert logic from class timetable
    const data = await upsertTimetablePeriodService({
      ...req.body,
      teacherId: teacher.id,
      classId // classId must be provided in body
    });

    return res.status(200).json({
      success: true,
      message: "Timetable period created successfully",
      data,
    });
  } catch (error: any) {
    console.error("createTimetablePeriod error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Invite a teacher by code or create a pre-registered account
 */
export const inviteTeacher = async (req: Request, res: Response) => {
  try {
    const { action, teacherCode, name, email } = req.body;
    const adminId = (req as any).user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Get the school for the admin
    const adminRecord = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { schoolAdmins: { include: { school: true } } }
    });

    const school = adminRecord?.schoolAdmins[0]?.school;
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found for this admin" });
    }

    // Check quota
    await enforceTeacherLimit(school.id);

    if (action === "code") {
      if (!teacherCode) {
        return res.status(400).json({ success: false, message: "teacherCode is required for action 'code'" });
      }

      const teacher = await prisma.teacher.findUnique({
        where: { teacherCode }
      });

      if (!teacher) {
        return res.status(404).json({ success: false, message: "Teacher not found" });
      }

      // Check if relationship already exists
      const existingLink = await prisma.relationshipLink.findFirst({
        where: {
          leftEntityId: school.id,
          rightEntityId: teacher.id,
          status: "ACTIVE"
        }
      });

      if (existingLink) {
        return res.status(400).json({ success: false, message: "Teacher is already connected to this school" });
      }

      // Create LinkRequest
      await prisma.linkRequest.create({
        data: {
          linkType: "SCHOOL_TEACHER",
          requesterType: "SCHOOL",
          requesterId: school.id,
          requesterCode: school.schoolCode,
          targetType: "TEACHER",
          targetId: teacher.id,
          targetCode: teacher.teacherCode,
          schoolId: school.id,
          requestedByAdminId: adminId,
          targetTeacherId: teacher.id,
          requesterSchoolId: school.id,
        }
      });

      return res.status(200).json({
        success: true,
        message: "Invitation request sent to teacher successfully",
      });

    } else if (action === "create") {
      if (!name) {
        return res.status(400).json({ success: false, message: "Name is required for action 'create'" });
      }

      const { classId, subjectId } = req.body;
      const schoolDomain = school.name.toLowerCase().trim().replace(/[^a-z0-9]/g, "") || "school";
      const normalizedTeacher = name.toLowerCase().trim().replace(/[^a-z0-9]/g, "") || "teacher";
      
      let loginEmail = email;
      let tempPassword = "";

      if (!loginEmail) {
        const existingTeachers = await prisma.teacher.findMany({
          where: {
            schoolId: school.id,
            email: {
              startsWith: "teacher",
              endsWith: `@${schoolDomain}.com`,
            },
          },
          select: { email: true },
        });

        let maxNumber = 0;
        const emailRegex = new RegExp(`^teacher(\\d+)@${schoolDomain}\\.com$`, "i");

        for (const t of existingTeachers) {
          const match = t.email?.match(emailRegex);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) {
              maxNumber = num;
            }
          }
        }

        const nextNumber = maxNumber + 1;
        loginEmail = `teacher${nextNumber}@${schoolDomain}.com`;
        tempPassword = `${normalizedTeacher}${schoolDomain}${nextNumber}`;
      } else {
        tempPassword = `Teach${Math.random().toString(36).slice(-4)}${Math.floor(Math.random() * 100)}`;
      }

      const [existingStudent, existingTeacher, existingAdmin, existingParent] = await Promise.all([
        prisma.student.findUnique({ where: { email: loginEmail } }),
        prisma.teacher.findUnique({ where: { email: loginEmail } }),
        prisma.admin.findUnique({ where: { email: loginEmail } }),
        prisma.parent.findUnique({ where: { email: loginEmail } })
      ]);

      if (existingStudent || existingTeacher || existingAdmin || existingParent) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }

      const newTeacherCode = await generateUniqueCode(prisma, "teacher", name);
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const invitationToken = crypto.randomBytes(32).toString('hex');

      const teacher = await prisma.teacher.create({
        data: {
          name,
          email: loginEmail,
          password: hashedPassword,
          teacherCode: newTeacherCode,
          role: "TEACHER",
          isClaimed: false,
          verified: false,
          invitationToken,
          primarySchoolId: school.id,
          activeSchoolId: school.id,
          schoolId: school.id,
        }
      });

      // Automatically create relationship link
      await prisma.relationshipLink.create({
        data: {
          linkType: "SCHOOL_TEACHER",
          leftEntityType: "SCHOOL",
          leftEntityId: school.id,
          leftCode: school.schoolCode,
          rightEntityType: "TEACHER",
          rightEntityId: teacher.id,
          rightCode: teacher.teacherCode,
          schoolId: school.id,
          status: "ACTIVE",
        }
      });

      // Optionally attach to class
      if (classId) {
        // Unassign any existing class teacher for this class to avoid duplicates
        await prisma.classTeacher.deleteMany({
          where: { classId }
        });
        await prisma.classTeacher.create({
          data: {
            classId,
            teacherId: teacher.id,
          }
        });
      }

      // Optionally attach to subject
      if (subjectId) {
        await prisma.teacherSubject.create({
          data: {
            teacherId: teacher.id,
            subjectId,
            schoolId: school.id,
          }
        });
      }

      // Only send the email if the user explicitly provided one (so it's real)
      if (email) {
        await sendTeacherInvitationEmail(loginEmail, invitationToken, school.name, teacher.name);
      }

      return res.status(200).json({
        success: true,
        message: "Teacher registered successfully",
        data: { 
          teacherId: teacher.id, 
          teacherCode: teacher.teacherCode,
          email: loginEmail,
          password: tempPassword
        }
      });
    }

    return res.status(400).json({ success: false, message: "Invalid action" });

  } catch (error: any) {
    console.error("inviteTeacher error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Resend claim email to a pre-registered teacher
 */
export const resendClaimEmail = async (req: Request, res: Response) => {
  try {
    const teacherId = getSingleString(req.params.id as string | string[] | undefined);
    const adminId = (req as any).user?.id;

    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const adminRecord = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { schoolAdmins: { include: { school: true } } }
    });

    const school = adminRecord?.schoolAdmins[0]?.school;
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: teacherId }, { teacherCode: teacherId }],
        primarySchoolId: school.id
      }
    });

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found or not connected to your school" });
    }

    if (teacher.isClaimed || !teacher.email) {
      return res.status(400).json({ success: false, message: "Teacher account is already claimed or has no email" });
    }

    // Generate new token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { invitationToken }
    });

    await sendTeacherInvitationEmail(teacher.email, invitationToken, school.name, teacher.name);

    return res.status(200).json({
      success: true,
      message: "Claim email resent successfully",
    });

  } catch (error: any) {
    console.error("resendClaimEmail error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};


/**
 * Delete a timetable period
 */
export const deleteTimetablePeriod = async (req: Request, res: Response) => {
  try {
    const periodId = req.params.periodId;

    if (!periodId) {
      return res.status(400).json({
        success: false,
        message: "periodId is required",
      });
    }

    await deleteTimetablePeriodService(periodId as string);

    return res.status(200).json({
      success: true,
      message: "Timetable period deleted successfully",
    });
  } catch (error: any) {
    console.error("deleteTimetablePeriod error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Get teacher attendance
 */
export const getTeacherAttendance = async (req: Request, res: Response) => {
  try {
    const teacherId = getSingleString(req.params.id as string | string[] | undefined);
    const month = req.query.month as string; // YYYY-MM
    const schoolId = req.query.schoolId as string;

    if (!teacherId || !schoolId) {
      return res.status(400).json({ success: false, message: "Teacher ID and School ID are required" });
    }

    let startDate, endDate;
    if (month) {
      startDate = new Date(`${month}-01T00:00:00.000Z`);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    const whereClause: any = { teacherId, schoolId };
    if (startDate && endDate) {
      whereClause.date = { gte: startDate, lte: endDate };
    }

    const attendance = await prisma.teacherAttendance.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    });

    return res.status(200).json({ success: true, data: attendance });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

/**
 * Mark teacher attendance
 */
export const markTeacherAttendance = async (req: Request, res: Response) => {
  try {
    const teacherId = getSingleString(req.params.id as string | string[] | undefined);
    const { schoolId, date, status, note } = req.body;

    if (!teacherId || !schoolId || !date || !status) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const parsedDate = new Date(date);
    
    // Check if record exists for this date
    // Create start and end of the specific date to ensure uniqueness check works regardless of time
    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const record = await prisma.teacherAttendance.upsert({
      where: {
        teacherId_date: {
          teacherId,
          date: startOfDay
        }
      },
      update: {
        status,
        note
      },
      create: {
        teacherId,
        schoolId,
        date: startOfDay,
        status,
        note
      }
    });

    return res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

/**
 * Bulk mark teacher attendance
 */
export const markBulkTeacherAttendance = async (req: Request, res: Response) => {
  try {
    const { schoolId, records } = req.body;
    
    if (!schoolId || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: "Missing required fields or invalid records format" });
    }
    
    const results = await Promise.all(records.map(async (record: any) => {
      const parsedDate = new Date(record.date);
      const startOfDay = new Date(parsedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      
      return prisma.teacherAttendance.upsert({
        where: {
          teacherId_date: {
            teacherId: record.teacherId,
            date: startOfDay
          }
        },
        update: {
          status: record.status,
          note: record.note || ""
        },
        create: {
          teacherId: record.teacherId,
          schoolId,
          date: startOfDay,
          status: record.status,
          note: record.note || ""
        }
      });
    }));
    
    return res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

/**
 * Get all teacher attendance for a school on a specific date
 */
export const getSchoolTeacherAttendanceByDate = async (req: Request, res: Response) => {
  try {
    const schoolId = getSingleString(req.query.schoolId as string | string[] | undefined);
    const date = getSingleString(req.query.date as string | string[] | undefined);

    if (!schoolId || !date) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const parsedDate = new Date(date);
    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const attendance = await prisma.teacherAttendance.findMany({
      where: {
        schoolId,
        date: startOfDay
      }
    });

    return res.status(200).json({ success: true, data: attendance });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};

/**
 * Get aggregated teacher attendance trend for a school over the last N days
 */
export const getSchoolTeacherAttendanceTrend = async (req: Request, res: Response) => {
  try {
    const schoolId = getSingleString(req.query.schoolId as string | string[] | undefined);
    const days = parseInt(getSingleString(req.query.days as string | string[] | undefined) || "5", 10);

    if (!schoolId) {
      return res.status(400).json({ success: false, message: "Missing schoolId" });
    }

    const endDate = new Date();
    endDate.setUTCHours(0, 0, 0, 0);
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1));

    const records = await prisma.teacherAttendance.findMany({
      where: {
        schoolId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const trendMap = new Map<string, { day: string; present: number; absent: number; late: number }>();
    
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      trendMap.set(d.toISOString().split('T')[0], { day: dayStr, present: 0, absent: 0, late: 0 });
    }

    for (const record of records) {
      const dateStr = record.date.toISOString().split('T')[0];
      if (trendMap.has(dateStr)) {
        const stats = trendMap.get(dateStr)!;
        if (record.status.toLowerCase() === 'present') {
          stats.present += 1;
        } else if (record.status.toLowerCase() === 'absent') {
          stats.absent += 1;
        } else if (record.status.toLowerCase() === 'late') {
          stats.late += 1;
        }
      }
    }

    const data = Array.from(trendMap.values());

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};
