import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { 
  pickDepartmentService, 
  getStudentProfileService, 
  updateStudentProfileService,
  requestEmailUpdateService,
  verifyEmailUpdateService,
  getStudentAttendanceService,
  updateStudentAttendanceService
} from "./student.service";
import { sendEmailUpdateVerification } from "../auth/auth.service";
import { handleError } from "../../utils/error-handler";
import prisma from "../../config/database";
import { getStudentAssignmentsService } from "../assignment/assignment.service";
import { canTeacherAccessStudent } from "./student.permissions";

export const requestEmailUpdate = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.user!;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ success: false, message: "New email is required" });
    }

    const code = await requestEmailUpdateService(studentId, newEmail);
    await sendEmailUpdateVerification(newEmail, code);

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your new email",
    });
  } catch (error: any) {
    return handleError(res, error, "student.requestEmailUpdate");
  }
};

export const confirmEmailUpdate = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.user!;
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: "Verification code is required" });
    }

    await verifyEmailUpdateService(studentId, code);

    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error: any) {
    return handleError(res, error, "student.confirmEmailUpdate");
  }
};

export const updateStudentProfile = async (req: Request, res: Response) => {
  try {
    const { id: currentUserId } = req.user!;
    const { 
      name, email, gender, dateOfBirth, profileImage, bannerImage,
      height, weight, club, favouriteColour, guardianName, guardianPhone, address 
    } = req.body;

    const updatedProfile = await updateStudentProfileService(currentUserId, {
      name,
      email,
      gender,
      dateOfBirth,
      profileImage,
      bannerImage,
      height,
      weight,
      club,
      favouriteColour,
      guardianName,
      guardianPhone,
      address
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error: any) {
    return handleError(res, error, "student.updateStudentProfile");
  }
};

export const pickDepartment = async (req: Request, res: Response) => {
  try {
    const { departmentId } = req.body;
    const { id: currentUserId, userType: currentUserType } = req.user!;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "departmentId is required",
      });
    }

    const updatedStudent = await pickDepartmentService({
      studentId: currentUserId, // For students picking their own department
      departmentId,
      currentUserId,
      currentUserType: currentUserType as UserRole,
    });

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: updatedStudent,
    });
  } catch (error: any) {
    return handleError(res, error, "student.pickDepartment");
  }
};

export const updateStudentDepartmentByAdmin = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { departmentId } = req.body;
    const { id: currentUserId, userType: currentUserType } = req.user!;

    if (!studentId || !departmentId) {
      return res.status(400).json({
        success: false,
        message: "studentId and departmentId are required",
      });
    }

    if (currentUserType !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can change other student departments",
      });
    }

    const updatedStudent = await pickDepartmentService({
      studentId: studentId as string,
      departmentId: departmentId as string,
      currentUserId,
      currentUserType: currentUserType as UserRole,
    });

    return res.status(200).json({
      success: true,
      message: "Student department updated successfully by admin",
      data: updatedStudent,
    });
  } catch (error: any) {
    return handleError(res, error, "student.updateStudentDepartmentByAdmin");
  }
};

export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    const { id: currentUserId } = req.user!;
    const profile = await getStudentProfileService(currentUserId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    return handleError(res, error, "student.getStudentProfile");
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { userType: currentUserType, id: currentUserId } = req.user!;

    if (currentUserType === UserRole.PARENT) {
      const link = await prisma.parentChildLink.findFirst({
        where: { parentId: currentUserId, studentId: studentId as string, status: "active" },
      });
      if (!link) {
        return res.status(403).json({
          success: false,
          message: "You can only view profiles of your own linked children",
        });
      }
    } else if (currentUserType !== UserRole.ADMIN && currentUserType !== UserRole.TEACHER) {
      return res.status(403).json({
        success: false,
        message: "Only admins, teachers, and linked parents can fetch student profiles by ID",
      });
    }

    if (currentUserType === UserRole.TEACHER) {
      const hasAccess = await canTeacherAccessStudent(currentUserId, studentId as string);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You can only view details of students enrolled in your assigned classes.",
        });
      }
    }

    const profile = await getStudentProfileService(studentId as string);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    if (currentUserType === UserRole.ADMIN && req.user!.schoolId && profile.schoolId !== req.user!.schoolId) {
      const isAlumni =
        profile.originalSchoolId === req.user!.schoolId ||
        (await prisma.studentEnrollment.findFirst({
          where: { studentId: studentId as string, schoolId: req.user!.schoolId },
        })) !== null;
      if (!isAlumni) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You can only view profiles of students in your school",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    return handleError(res, error, "student.getStudentById");
  }
};

export const getStudentAssignments = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { status, page = "1", limit = "10" } = req.query;
    const { userType: currentUserType, id: currentUserId } = req.user!;

    if (currentUserType === UserRole.TEACHER) {
      const hasAccess = await canTeacherAccessStudent(currentUserId, studentId as string);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You can only view details of students enrolled in your assigned classes.",
        });
      }
    }

    const data = await getStudentAssignmentsService({
      studentId: studentId as string,
      status: status as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    return res.status(200).json({
      success: true,
      message: "Student assignments fetched successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "student.getStudentAssignments");
  }
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { startDate, endDate } = req.query;
    const { userType: currentUserType, id: currentUserId } = req.user!;

    // Admins and teachers can view. Students can view if it's them. Parents can view if linked.
    if (currentUserType === UserRole.STUDENT && currentUserId !== studentId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own attendance",
      });
    }

    if (currentUserType === UserRole.PARENT) {
      const isLinked = await prisma.parentChildLink.findFirst({
        where: {
          parentId: currentUserId,
          studentId: studentId as string,
          status: { in: ["active", "ACCEPTED", "Active"] },
        },
      });
      if (!isLinked) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not connected to this student",
        });
      }
    }

    if (currentUserType === UserRole.TEACHER) {
      const hasAccess = await canTeacherAccessStudent(currentUserId, studentId as string);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You can only view details of students enrolled in your assigned classes.",
        });
      }
    }

    const attendance = await getStudentAttendanceService(studentId as string, {
      startDate: startDate as string,
      endDate: endDate as string,
    });

    return res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error: any) {
    return handleError(res, error, "student.getStudentAttendance");
  }
};

export const updateStudentAttendance = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { date, status, note, subjects } = req.body;
    const { userType: currentUserType } = req.user!;

    // Ensure only admins or authorized staff can update attendance
    if (currentUserType === UserRole.STUDENT || currentUserType === UserRole.PARENT) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update attendance records",
      });
    }

    if (!date || !status) {
      return res.status(400).json({
        success: false,
        message: "Date and status are required fields",
      });
    }

    const recordedByName = (req.user as any)?.name || (currentUserType === UserRole.ADMIN ? "Admin" : "Staff");
    const recordedByRole = currentUserType;

    const updatedAttendance = await updateStudentAttendanceService(studentId as string, { 
      date, 
      status, 
      note,
      subjects,
      recordedByName,
      recordedByRole
    });

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error: any) {
    return handleError(res, error, "student.updateStudentAttendance");
  }
};

export const pickLevel = async (req: Request, res: Response) => {
  try {
    const { level } = req.body;
    const { id: studentId, userType: currentUserType } = req.user!;

    if (!level || typeof level !== 'string') {
      return res.status(400).json({ success: false, message: 'level is required' });
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // One-time lock: students can only pick once
    if (currentUserType === UserRole.STUDENT && student.level && student.level !== level) {
      return res.status(403).json({ success: false, message: 'Level already set. Only the connected school can change it.' });
    }

    // Validate the level is in the school's allowed list
    if (student.schoolId) {
      const school = await prisma.school.findUnique({ where: { id: student.schoolId! }, select: { levels: true } });
      if (school && school.levels.length > 0 && !school.levels.includes(level)) {
        return res.status(400).json({ success: false, message: `"${level}" is not a valid level for this school.` });
      }
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { level },
      include: { department: true, school: true },
    });

    return res.status(200).json({ success: true, message: 'Level updated successfully', data: updated });
  } catch (error: any) {
    return handleError(res, error, 'student.pickLevel');
  }
};

export const updateStudentLevelByAdmin = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { level } = req.body;
    const { userType: currentUserType } = req.user!;

    if (currentUserType !== UserRole.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only admins can change student levels' });
    }
    if (!level || typeof level !== 'string') {
      return res.status(400).json({ success: false, message: 'level is required' });
    }

    const updated = await prisma.student.update({
      where: { id: studentId as string },
      data: { level },
      include: { department: true, school: true },
    });

    return res.status(200).json({ success: true, message: 'Student level updated by admin', data: updated });
  } catch (error: any) {
    return handleError(res, error, 'student.updateStudentLevelByAdmin');
  }
};

import { exitStudentService } from "./student.service";
import { EnrollmentStatus } from "@prisma/client";

export const exitStudent = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { exitType, exitDate, exitReason, exitNotes } = req.body;
    const { id: currentUserId, userType: currentUserType } = req.user!;

    if (currentUserType !== UserRole.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only admins can exit students from school' });
    }

    if (!exitType || !exitDate) {
      return res.status(400).json({ success: false, message: 'exitType and exitDate are required' });
    }

    // Get the school ID of the admin
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: { adminId: currentUserId, active: true },
    });
    const schoolId = schoolAdmin?.schoolId || req.user?.schoolId;

    if (!schoolId) {
      return res.status(403).json({ success: false, message: 'You are not assigned to a school' });
    }

    await exitStudentService(
      studentId as string,
      schoolId,
      {
        exitType: exitType as EnrollmentStatus,
        exitDate,
        exitReason,
        exitNotes,
      },
      currentUserId
    );

    return res.status(200).json({ success: true, message: `Student successfully marked as ${exitType}` });
  } catch (error: any) {
    return handleError(res, error, 'student.exitStudent');
  }
};

export const batchExitStudents = async (req: Request, res: Response) => {
  try {
    const { studentIds, exitType, exitDate, exitReason, exitNotes } = req.body;
    const { id: currentUserId, userType: currentUserType } = req.user!;

    if (currentUserType !== UserRole.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only admins can exit students from school' });
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0 || !exitType || !exitDate) {
      return res.status(400).json({ success: false, message: 'studentIds array, exitType, and exitDate are required' });
    }

    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: { adminId: currentUserId, active: true },
    });
    const schoolId = schoolAdmin?.schoolId || req.user?.schoolId;

    if (!schoolId) {
      return res.status(403).json({ success: false, message: 'You are not assigned to a school' });
    }

    for (const sId of studentIds) {
      await exitStudentService(
        sId,
        schoolId,
        {
          exitType: exitType as EnrollmentStatus,
          exitDate: new Date(exitDate),
          exitReason,
          exitNotes,
        },
        currentUserId
      );
    }

    return res.status(200).json({ success: true, message: `Successfully marked ${studentIds.length} student(s) as ${exitType}` });
  } catch (error: any) {
    return handleError(res, error, 'student.batchExitStudents');
  }
};

import { getStudentHistoryService } from "./student.service";

export const getStudentHistory = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { userType: currentUserType, id: currentUserId } = req.user!;

    if (currentUserType === UserRole.STUDENT && currentUserId !== studentId) {
       return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (currentUserType === UserRole.PARENT) {
      const isLinked = await prisma.parentChildLink.findFirst({
        where: {
          parentId: currentUserId,
          studentId: studentId as string,
          status: { in: ["active", "ACCEPTED", "Active"] },
        },
      });
      if (!isLinked) {
        return res.status(403).json({
          success: false,
          message: "Access denied: You are not connected to this student",
        });
      }
    }

    if (currentUserType === UserRole.TEACHER) {
      const hasAccess = await canTeacherAccessStudent(currentUserId, studentId as string);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You can only view details of students enrolled in your assigned classes.",
        });
      }
    }

    let schoolIdFilter: string | undefined = undefined;
    if (currentUserType === UserRole.ADMIN) {
      const schoolAdmin = await prisma.schoolAdmin.findFirst({
        where: { adminId: currentUserId, active: true },
      });
      if (schoolAdmin) {
        schoolIdFilter = schoolAdmin.schoolId;
      }
    }

    const history = await getStudentHistoryService(studentId as string, schoolIdFilter);

    return res.status(200).json({ success: true, data: history });
  } catch (error: any) {
    return handleError(res, error, 'student.getStudentHistory');
  }
};

export const assignPrefectRole = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { role } = req.body;
    const adminId = req.user!.id;
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: { adminId, active: true }
    });
    if (!schoolAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    if (!role) return res.status(400).json({ success: false, message: 'Role is required' });

    const updated = await import('./student.service.js').then(m => m.assignPrefectRoleService(studentId as string, role, adminId, schoolAdmin.schoolId));
    return res.status(200).json({ success: true, message: 'Prefect role assigned successfully', data: updated });
  } catch (error: any) {
    return handleError(res, error, 'student.assignPrefectRole');
  }
};

export const removePrefectRole = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.id;
    const schoolAdmin = await prisma.schoolAdmin.findFirst({
      where: { adminId, active: true }
    });
    if (!schoolAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    if (!reason) return res.status(400).json({ success: false, message: 'Reason is required' });

    const updated = await import('./student.service.js').then(m => m.removePrefectRoleService(studentId as string, reason, adminId, schoolAdmin.schoolId));
    return res.status(200).json({ success: true, message: 'Prefect role removed successfully', data: updated });
  } catch (error: any) {
    return handleError(res, error, 'student.removePrefectRole');
  }
};

export const acknowledgePrefectCelebration = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    if (req.user!.id !== studentId && req.user!.userType !== UserRole.STUDENT) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const updated = await import('./student.service.js').then(m => m.acknowledgePrefectCelebrationService(studentId as string));
    return res.status(200).json({ success: true, message: 'Celebration acknowledged', data: updated });
  } catch (error: any) {
    return handleError(res, error, 'student.acknowledgePrefectCelebration');
  }
};

export const getStudentDownloadAudit = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { userType: currentUserType, id: currentUserId, schoolId: userSchoolId } = req.user!;

    const student = await prisma.student.findUnique({
      where: { id: studentId as string },
      include: {
        school: { select: { id: true, name: true, logo: true } },
        parentLinks: {
          include: {
            parent: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (currentUserType === UserRole.STUDENT && currentUserId !== studentId) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (currentUserType === UserRole.PARENT) {
      const isLinked = student.parentLinks.some((l) => l.parentId === currentUserId);
      if (!isLinked) {
        return res.status(403).json({ success: false, message: "Access denied: Not linked to this student" });
      }
    }
    if (currentUserType === UserRole.ADMIN && userSchoolId && student.schoolId !== userSchoolId) {
      return res.status(403).json({ success: false, message: "Access denied: Student belongs to another school" });
    }

    const fileMetrics = await prisma.fileMetric.findMany({
      where: {
        studentId: studentId as string,
        fileType: { in: ["RESULT_DOWNLOAD", "TRANSCRIPT_DOWNLOAD", "REPORT_CARD"] },
      },
      orderBy: { createdAt: "desc" },
    });

    const payments = await prisma.payment.findMany({
      where: { studentId: studentId as string },
      include: {
        parent: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        transactionHistory: true,
      },
      orderBy: { createdAt: "desc" },
    });

    let studentDownloads = 0;
    let parentDownloads = 0;
    const recentDownloads: Array<{
      id: string;
      fileName: string;
      fileType?: string;
      downloadedBy: "STUDENT" | "PARENT" | "STAFF";
      performerName: string;
      date: string;
    }> = [];

    fileMetrics.forEach((m) => {
      const isParent = Boolean(m.parentId);
      if (isParent) {
        parentDownloads++;
        const parentObj = student.parentLinks.find((pl) => pl.parentId === m.parentId)?.parent;
        recentDownloads.push({
          id: m.id,
          fileName: m.fileName,
          fileType: m.fileType,
          downloadedBy: "PARENT",
          performerName: parentObj?.fullName || "Parent / Guardian",
          date: m.createdAt.toISOString(),
        });
      } else {
        studentDownloads++;
        recentDownloads.push({
          id: m.id,
          fileName: m.fileName,
          fileType: m.fileType,
          downloadedBy: "STUDENT",
          performerName: student.name,
          date: m.createdAt.toISOString(),
        });
      }
    });

    const totalPaid = payments
      .filter((p) => p.status === "SUCCESS" || p.status === "PAID")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalOutstanding = payments
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const hasPaid = totalPaid > 0;

    const formattedPayments = payments.map((p) => ({
      id: p.id,
      reference: p.paymentReference,
      amount: p.amount,
      term: p.term,
      session: p.session,
      paymentType: p.paymentType,
      status: p.status,
      paymentMethod: p.paymentMethod || "Electronic Gateway",
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      paidBy: p.parent?.fullName || "Parent / Sponsor",
      parentEmail: p.parent?.email || null,
      parentPhone: p.parent?.phone || null,
    }));

    const linkedParents = student.parentLinks.map((pl) => ({
      id: pl.parent.id,
      fullName: pl.parent.fullName,
      email: pl.parent.email,
      phone: pl.parent.phone,
      profileImage: pl.parent.profileImage,
      relationship: (pl as any).relationship || "Parent / Guardian",
      status: pl.status,
    }));

    return res.status(200).json({
      success: true,
      data: {
        studentId: student.id,
        studentName: student.name,
        studentCode: student.studentCode,
        downloadStats: {
          totalDownloads: studentDownloads + parentDownloads,
          studentDownloads,
          parentDownloads,
          recentDownloads: recentDownloads.slice(0, 10),
          lastDownloadedAt: recentDownloads[0]?.date || null,
        },
        paymentStats: {
          hasPaid,
          totalPaid,
          totalOutstanding,
          currency: "NGN",
          currencySymbol: "₦",
          payments: formattedPayments,
        },
        linkedParents,
      },
    });
  } catch (error: any) {
    return handleError(res, error, "student.getStudentDownloadAudit");
  }
};

export const recordResultDownload = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { fileName = "Official_Transcript.pdf", fileType = "TRANSCRIPT_DOWNLOAD" } = req.body;
    const user = req.user!;

    const student = await prisma.student.findUnique({
      where: { id: studentId as string },
      select: { id: true, schoolId: true, name: true },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const { randomUUID } = await import("crypto");
    const metricId = randomUUID();
    const isParent = user.userType === UserRole.PARENT;
    const isTeacher = user.userType === UserRole.TEACHER;

    const fileMetric = await prisma.fileMetric.create({
      data: {
        id: metricId,
        fileName,
        fileSize: BigInt(128000),
        fileType,
        schoolId: student.schoolId,
        studentId: student.id,
        parentId: isParent ? user.id : null,
        teacherId: isTeacher ? user.id : null,
      },
    });

    await prisma.securityAuditLog.create({
      data: {
        userId: user.id,
        userRole: String(user.userType),
        action: `DOWNLOAD_${fileType}`,
        ipAddress: req.ip || null,
      },
    }).catch((e) => console.warn("Failed to create security audit log:", e));

    return res.status(201).json({
      success: true,
      message: "Download event tracked successfully",
      data: {
        id: fileMetric.id,
        fileName: fileMetric.fileName,
        createdAt: fileMetric.createdAt,
      },
    });
  } catch (error: any) {
    return handleError(res, error, "student.recordResultDownload");
  }
};

import {
  getStudentSchoolsService,
  addPreviousSchoolRecordService,
  promoteStudentDirectService,
} from "./student.service";

export const getStudentSchools = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const data = await getStudentSchoolsService(studentId as string);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "student.getStudentSchools");
  }
};

export const addPreviousSchoolRecord = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const currentUserId = req.user!.id;
    const {
      schoolName,
      enrollmentDate,
      exitDate,
      exitReason,
      gradeLevel,
      overallAverage,
      overallGradeLetter,
      notes,
    } = req.body;

    if (!schoolName || typeof schoolName !== "string" || !schoolName.trim()) {
      return res.status(400).json({
        success: false,
        message: "schoolName is required",
      });
    }

    const data = await addPreviousSchoolRecordService({
      studentId: studentId as string,
      schoolName: schoolName.trim(),
      enrollmentDate,
      exitDate,
      exitReason,
      gradeLevel,
      overallAverage: overallAverage !== undefined ? Number(overallAverage) : undefined,
      overallGradeLetter,
      notes,
      currentUserId,
    });

    return res.status(201).json({
      success: true,
      message: "Previous school record added successfully",
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "student.addPreviousSchoolRecord");
  }
};

export const promoteStudentDirect = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const currentUserId = req.user!.id;
    const { toClassId, fromClassId } = req.body;

    if (!toClassId) {
      return res.status(400).json({
        success: false,
        message: "toClassId is required",
      });
    }

    const result = await promoteStudentDirectService({
      studentId: studentId as string,
      toClassId,
      fromClassId,
      currentUserId,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    return handleError(res, error, "student.promoteStudentDirect");
  }
};

