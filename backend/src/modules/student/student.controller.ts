import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { pickDepartmentService, getStudentProfileService } from "./student.service";

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
    console.error("pickDepartment error:", error);
    return res.status(error.status || 400).json({
      success: false,
      message: error.message || "Failed to update department",
    });
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
      studentId,
      departmentId,
      currentUserId,
      currentUserType: currentUserType as UserRole,
    });

    return res.status(200).json({
      success: true,
      message: "Student department updated successfully by admin",
      data: updatedStudent,
    });
  } catch (error: any) {
    console.error("updateStudentDepartmentByAdmin error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update student department",
    });
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
    console.error("getStudentProfile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
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

    const profile = await getStudentProfileService(studentId);

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
    console.error("getStudentById error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
