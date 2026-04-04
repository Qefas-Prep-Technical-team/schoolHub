import { Request, Response } from "express";
import { BehaviourType } from "@prisma/client";
import {
  getClassBehaviourAlertsService,
  createBehaviourAlertService,
} from "./behaviour.service";

export const getClassBehaviourAlerts = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alerts = await getClassBehaviourAlertsService(id as string);
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

    const alert = await createBehaviourAlertService({
      type: type as BehaviourType,
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
