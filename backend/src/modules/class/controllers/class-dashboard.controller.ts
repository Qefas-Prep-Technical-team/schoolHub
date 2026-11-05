import { Request, Response } from "express";
import { canManageClass } from "../class.permissions";
import { getClassesService, sendClassAnnouncementService } from "../class.service";
import { handleError } from "../../../utils/error-handler";

export const getClasses = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const schoolId =
      (req.query.schoolId as string | undefined) ||
      (req.user.userType === "ADMIN"
        ? req.user.schoolId || req.user.tenantId
        : undefined);

    const data = await getClassesService({
      currentUserId: req.user.id,
      currentUserType: req.user.userType,
      schoolId,
    });

    return res.status(200).json({
      success: true,
      message: "Classes fetched successfully",
      count: data.length,
      data,
    });
  } catch (error: unknown) {
    return handleError(res, error, "class.getClasses");
  }
};

export const sendClassAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classId = id as string;
    const { title, message, targets, priority } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const allowed = await canManageClass({
      userId: req.user.id,
      userType: req.user.userType,
      classId,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: You are not authorized to broadcast announcements to this class.",
      });
    }

    const result = await sendClassAnnouncementService(classId, req.user.id, {
      title,
      message,
      targets,
      priority,
    });

    return res.status(200).json(result);
  } catch (error: unknown) {
    return handleError(res, error, "class.sendClassAnnouncement");
  }
};

