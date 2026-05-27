import { Request, Response } from "express";
import { getParentChildrenService, getChildDetailsService, getParentDashboardService, updateParentProfileService, updateChildProfileService } from "./parent.service";
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
