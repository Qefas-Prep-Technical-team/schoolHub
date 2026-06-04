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
    const { name, email, gender, dateOfBirth, profileImage, bannerImage } = req.body;

    const updatedProfile = await updateStudentProfileService(currentUserId, {
      name,
      email,
      gender,
      dateOfBirth,
      profileImage,
      bannerImage,
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

    if (currentUserType !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can fetch student profiles by ID",
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

    const updatedAttendance = await updateStudentAttendanceService(studentId, { date, status, note });

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: updatedAttendance,
    });
  } catch (error: any) {
    return handleError(res, error, "student.updateStudentAttendance");
  }
};
