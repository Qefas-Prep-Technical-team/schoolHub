import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { updateBehaviourProfileSchema } from "./behaviourProfile.schema";
import {
  getStudentBehaviourProfileService,
  upsertStudentBehaviourProfileService,
} from "./behaviourProfile.service";

export const getStudentBehaviourProfile = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id as string;

    const profile = await getStudentBehaviourProfileService(studentId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error("getStudentBehaviourProfile error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch student behaviour profile",
    });
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
    console.error("upsertStudentBehaviourProfile error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update student behaviour profile",
    });
  }
};

