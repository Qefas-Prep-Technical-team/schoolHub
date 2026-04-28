import { Request, Response } from "express";
import { getParentChildrenService, getChildDetailsService, getParentDashboardService } from "./parent.service";

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
    const { childId } = req.params;
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
    const dashboard = await getParentDashboardService(req.user.id);
    return res.status(200).json({ success: true, message: "Dashboard fetched successfully", data: dashboard });
  } catch (error: any) {
    console.error("getParentDashboard error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch dashboard" });
  }
};
