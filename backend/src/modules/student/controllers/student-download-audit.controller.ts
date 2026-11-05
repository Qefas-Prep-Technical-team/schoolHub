import { Request, Response } from "express";
import { handleError } from "../../../utils/error-handler";
import {
  getStudentDownloadAuditService,
  recordResultDownloadService,
} from "../services/student-download-audit.service";

export const getStudentDownloadAudit = async (req: Request, res: Response) => {
  try {
    const studentId = String(req.params.id || "");
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await getStudentDownloadAuditService(studentId, {
      id: user.id,
      userType: String(user.userType || user.role || ""),
      schoolId: user.schoolId,
    });

    if (result.status === "NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    if (result.status === "FORBIDDEN") {
      return res
        .status(403)
        .json({ success: false, message: result.message || "Access denied" });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error: unknown) {
    return handleError(res, error, "student.getStudentDownloadAudit");
  }
};

export const recordResultDownload = async (req: Request, res: Response) => {
  try {
    const studentId = String(req.params.id || "");
    const user = req.user;
    if (!user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { fileName, fileType } = req.body || {};
    const result = await recordResultDownloadService(
      studentId,
      {
        id: user.id,
        userType: String(user.userType || user.role || ""),
        schoolId: user.schoolId,
      },
      {
        fileName: typeof fileName === "string" ? fileName : undefined,
        fileType: typeof fileType === "string" ? fileType : undefined,
        ipAddress: req.ip || null,
      },
    );

    if (result.status === "NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }
    if (result.status === "FORBIDDEN") {
      return res
        .status(403)
        .json({ success: false, message: result.message || "Access denied" });
    }

    return res.status(201).json({
      success: true,
      message: "Download event tracked successfully",
      data: result.data,
    });
  } catch (error: unknown) {
    return handleError(res, error, "student.recordResultDownload");
  }
};

