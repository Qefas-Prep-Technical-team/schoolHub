import { Request, Response } from "express";
import { BehaviourType } from "@prisma/client";
import {
  getClassBehaviourAlertsService,
  createBehaviourAlertService,
  updateBehaviourAlertService,
  deleteBehaviourAlertService,
} from "./behaviour.service";

export const getClassBehaviourAlerts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId } = req.query;
    const alerts = await getClassBehaviourAlertsService(
      id as string,
      typeof studentId === 'string' ? studentId : undefined
    );
    return res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch behavior alerts",
    });
  }
};

export const createBehaviourAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // classId
    const { type, title, description, studentId } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!title || !studentId) {
      return res.status(400).json({ success: false, message: "title and studentId are required" });
    }

    const alert = await createBehaviourAlertService({
      type: (type as BehaviourType) || BehaviourType.WARNING,
      title,
      description,
      studentId,
      reportedById: req.user.id,
      classId: id as string,
    });

    return res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create behavior alert",
    });
  }
};

export const updateBehaviourAlert = async (req: Request, res: Response) => {
  try {
    const alertId = req.params.alertId as string;
    const { type, title, description } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const alert = await updateBehaviourAlertService(alertId, {
      ...(type ? { type: type as BehaviourType } : {}),
      ...(title ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
    });

    return res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update behavior alert",
    });
  }
};

export const deleteBehaviourAlert = async (req: Request, res: Response) => {
  try {
    const alertId = req.params.alertId as string;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await deleteBehaviourAlertService(alertId);

    return res.status(200).json({
      success: true,
      message: "Behaviour alert deleted successfully",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete behavior alert",
    });
  }
};

