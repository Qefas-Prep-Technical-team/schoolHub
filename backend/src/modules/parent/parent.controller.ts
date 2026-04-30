import { Request, Response } from "express";
import { getParentChildrenService, getChildDetailsService, getParentDashboardService, updateParentProfileService, updateChildProfileService } from "./parent.service";

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const updatedParent = await updateParentProfileService(req.user.id, req.body);
    return res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedParent });
  } catch (error: any) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update profile" });
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
    console.error("getChildren error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch children" });
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
    console.error("getChildDetails error:", error);
    return res.status(error.message.includes("Unauthorized") ? 403 : 500).json({
      success: false,
      message: error.message || "Failed to fetch child details",
    });
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
    console.error("getParentDashboard error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch dashboard" });
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
    console.error("updateChildProfile error:", error);
    return res.status(error.message.includes("Unauthorized") ? 403 : 500).json({
      success: false,
      message: error.message || "Failed to update child profile",
    });
  }
};
