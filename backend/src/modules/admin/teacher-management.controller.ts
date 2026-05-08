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

    // Format data for frontend
    const formattedData = {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      teacherCode: teacher.teacherCode,
      avatar: teacher.profileImage,
      status: teacher.verified ? 'active' : 'inactive',
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

    const timetable = await getTeacherTimetableService(teacher.id);

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
      if (!name || !email) {
        return res.status(400).json({ success: false, message: "Name and email are required for action 'create'" });
      }

      const [existingStudent, existingTeacher, existingAdmin, existingParent] = await Promise.all([
        prisma.student.findUnique({ where: { email } }),
        prisma.teacher.findUnique({ where: { email } }),
        prisma.admin.findUnique({ where: { email } }),
        prisma.parent.findUnique({ where: { email } })
      ]);

      if (existingStudent || existingTeacher || existingAdmin || existingParent) {
        return res.status(400).json({ success: false, message: "Email is already in use" });
      }

      const newTeacherCode = await generateUniqueCode(prisma, "teacher", name);
      const invitationToken = crypto.randomBytes(32).toString('hex');

      const teacher = await prisma.teacher.create({
        data: {
          name,
          email,
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

      // Send the email
      await sendTeacherInvitationEmail(email, invitationToken, school.name, teacher.name);

      return res.status(200).json({
        success: true,
        message: "Teacher pre-registered and invitation email sent",
        data: { teacherId: teacher.id, teacherCode: teacher.teacherCode }
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

    await deleteTimetablePeriodService(periodId);

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
