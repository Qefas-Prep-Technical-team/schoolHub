import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { updateBehaviourProfileSchema } from "./behaviourProfile.schema";
import {
  getStudentBehaviourProfileService,
  upsertStudentBehaviourProfileService,
} from "./behaviourProfile.service";
import { handleError } from "../../utils/error-handler";
import { canTeacherAccessStudent } from "./student.permissions";

export const getStudentBehaviourProfile = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id as string;
    const { userType: currentUserType, id: currentUserId } = req.user!;

    if (currentUserType === UserRole.TEACHER) {
      const hasAccess = await canTeacherAccessStudent(currentUserId, studentId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You can only view details of students enrolled in your assigned classes.",
        });
      }
    }

    const profile = await getStudentBehaviourProfileService(studentId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    return handleError(res, error, "student.getStudentBehaviourProfile");
  }
};

export const upsertStudentBehaviourProfile = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id as string;
    const { userType: currentUserType } = req.user!;

    if (currentUserType !== UserRole.ADMIN && currentUserType !== UserRole.TEACHER) {
      return res.status(403).json({
        success: false,
        message: "Only administrators and teachers are authorized to update behavior profiles",
      });
    }

    if (currentUserType === UserRole.TEACHER) {
      const hasAccess = await canTeacherAccessStudent(req.user!.id, studentId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "You can only update details of students enrolled in your assigned classes.",
        });
      }
    }

    const parseResult = updateBehaviourProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.issues[0]?.message || "Invalid input data",
      });
    }

    const updatedProfile = await upsertStudentBehaviourProfileService(
      studentId,
      parseResult.data
    );

    return res.status(200).json({
      success: true,
      message: "Behaviour profile updated successfully",
      data: updatedProfile,
    });
  } catch (error: any) {
    return handleError(res, error, "student.upsertStudentBehaviourProfile");
  }
};

