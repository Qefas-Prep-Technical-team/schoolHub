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
      height, weight, club, favouriteColour, guardianName, guardianPhone 
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
      guardianPhone
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
    const { userType: currentUserType } = req.user!;

    if (currentUserType !== UserRole.ADMIN && currentUserType !== UserRole.TEACHER) {
      return res.status(403).json({
        success: false,
        message: "Only admins and teachers can fetch student profiles by ID",
      });
    }

    const profile = await getStudentProfileService(studentId as string);

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
    return handleError(res, error, "student.getStudentById");
  }
};

export const getStudentAttendance = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { startDate, endDate } = req.query;
    const { userType: currentUserType, id: currentUserId } = req.user!;

    // Admins and teachers can view. Students/Parents can view if it's them.
    // Assuming middleware handles high-level auth, but we might want to check if the student can view their own.
    if (currentUserType === UserRole.STUDENT && currentUserId !== studentId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own attendance",
      });
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
    const { date, status, note } = req.body;
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

    const updatedAttendance = await updateStudentAttendanceService(studentId as string, { date, status, note });

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

    if (!schoolAdmin) {
      return res.status(403).json({ success: false, message: 'You are not assigned to a school' });
    }

    await exitStudentService(
      studentId as string,
      schoolAdmin.schoolId,
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

import { getStudentHistoryService } from "./student.service";

export const getStudentHistory = async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { userType: currentUserType, id: currentUserId } = req.user!;

    // Security check: if not admin, maybe check if it's the student themselves or a parent
    if (currentUserType === UserRole.STUDENT && currentUserId !== studentId) {
       return res.status(403).json({ success: false, message: 'Forbidden' });
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
