import { Request, Response } from "express";
import { getParentChildrenService, getChildDetailsService, getChildAssignmentDetailsService, getParentDashboardService, updateParentProfileService, updateChildProfileService } from "./parent.service";
import { getStudentAssignmentsService } from "../assignment/assignment.service";
import { handleError } from "../../utils/error-handler";

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const updatedParent = await updateParentProfileService(req.user.id, req.body);
    return res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedParent });
  } catch (error: any) {
    return handleError(res, error, "parent.updateProfile");
  }
};

export const getChildren = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const children = await getParentChildrenService(req.user.id);
    return res.status(200).json({ success: true, message: "Children fetched successfully", data: children });
  } catch (error: any) {
    return handleError(res, error, "parent.getChildren");
  }
};

export const getChildDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const childId = req.params.childId as string;
    const child = await getChildDetailsService(req.user.id, childId);
    return res.status(200).json({ success: true, message: "Child details fetched successfully", data: child });
  } catch (error: any) {
    return handleError(res, error, "parent.getChildDetails");
  }
};

export const getChildAssignments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const childId = req.params.childId as string;
    const { status, page = "1", limit = "10" } = req.query;

    const data = await getStudentAssignmentsService({
      studentId: childId,
      status: status as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    return res.status(200).json({ success: true, message: "Child assignments fetched successfully", data });
  } catch (error: any) {
    return handleError(res, error, "parent.getChildAssignments");
  }
};

export const getChildAssignmentDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const childId = req.params.childId as string;
    const assignmentId = req.params.assignmentId as string;
    const details = await getChildAssignmentDetailsService(req.user.id, childId, assignmentId);
    return res.status(200).json({ success: true, message: "Assignment details fetched successfully", data: details });
  } catch (error: any) {
    return handleError(res, error, "parent.getChildAssignmentDetails");
  }
};

export const getParentDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const childId = req.query.childId as string | undefined;
    const dashboard = await getParentDashboardService(req.user.id, childId);
    return res.status(200).json({ success: true, message: "Dashboard fetched successfully", data: dashboard });
  } catch (error: any) {
    return handleError(res, error, "parent.getParentDashboard");
  }
};

export const updateChildProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const childId = req.params.childId as string;
    const updatedChild = await updateChildProfileService(req.user.id, childId, req.body);
    return res.status(200).json({ success: true, message: "Child profile updated successfully", data: updatedChild });
  } catch (error: any) {
    return handleError(res, error, "parent.updateChildProfile");
  }
};
