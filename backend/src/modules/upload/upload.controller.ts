import { Request, Response } from "express";
import { handleError } from "../../utils/error-handler";
import {
  resolveSchoolId,
  validateSchoolAccess,
} from "../school/services/school-access.service";
import {
  uploadBufferToBunnyService,
  getS3PresignedUrlService,
  confirmS3UploadService,
  deleteS3FileService,
  deleteBunnyFileService,
  getUploadHistoryService,
  cleanupUnusedImagesService,
  deleteFileByUrlService,
} from "./upload.service";

export const getCloudflareUploadUrl = async (_req: Request, res: Response) => {
  return res.status(410).json({
    success: false,
    message: "This endpoint is deprecated. Use POST /upload/proxy instead.",
  });
};

const resolveAuthorizedUploadSchoolId = async (
  req: Request,
  requestedSchoolId?: string,
): Promise<string | null> => {
  const user = req.user;
  const candidate = requestedSchoolId || user?.schoolId || user?.tenantId;
  if (!candidate) return null;

  if (!validateSchoolAccess(req, candidate)) {
    throw new Error("Access denied: You do not belong to the target school.");
  }

  return resolveSchoolId(candidate);
};

export const proxyUpload = async (req: Request, res: Response) => {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file received. Please check the field name is 'file'.",
      });
    }
    if (!file.buffer || file.buffer.length === 0) {
      return res.status(400).json({ success: false, message: "File is empty" });
    }

    let resolvedSchoolId: string | null = null;
    try {
      resolvedSchoolId = await resolveAuthorizedUploadSchoolId(req, req.body.schoolId);
    } catch {
      return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized schoolId.",
      });
    }

    const user = req.user;
    const data = await uploadBufferToBunnyService(file.buffer, file.mimetype, {
      userId: user.id,
      userType: user.userType,
      schoolId: resolvedSchoolId || undefined,
      fileName: req.body.fileName || file.originalname,
    });

    return res.status(200).json({ success: true, url: data.publicUrl, data });
  } catch (error: unknown) {
    return handleError(res, error, "upload.proxyUpload");
  }
};

export const getS3PresignedUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType, fileSize, schoolId } = req.body;
    if (!fileName || !fileType || !fileSize) {
      return res.status(400).json({
        success: false,
        message: "fileName, fileType, and fileSize are required",
      });
    }

    let resolvedSchoolId: string | null = null;
    try {
      resolvedSchoolId = await resolveAuthorizedUploadSchoolId(req, schoolId);
    } catch {
      return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized schoolId.",
      });
    }

    if (!resolvedSchoolId) {
      return res.status(400).json({
        success: false,
        message: "Valid schoolId is required for S3 presigned upload.",
      });
    }

    const data = await getS3PresignedUrlService({
      schoolId: resolvedSchoolId,
      fileName,
      fileType,
      fileSize: Number(fileSize),
    });

    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "upload.getS3PresignedUrl");
  }
};

export const confirmS3Upload = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { fileName, fileUrl, fileSize, mimeType, schoolId } = req.body;
    if (!fileName || !fileUrl || !fileSize) {
      return res.status(400).json({
        success: false,
        message: "fileName, fileUrl, and fileSize are required",
      });
    }

    let finalSchoolId: string | null = null;
    try {
      finalSchoolId = await resolveAuthorizedUploadSchoolId(req, schoolId);
    } catch {
      return res.status(403).json({
        success: false,
        message: "Access denied: Unauthorized schoolId.",
      });
    }

    if (!finalSchoolId) {
      return res.status(200).json({
        success: true,
        data: { fileUrl, note: "Quota tracking bypassed (no schoolId)" },
      });
    }

    const record = await confirmS3UploadService({
      schoolId: finalSchoolId,
      fileName,
      fileUrl,
      fileSize: Number(fileSize),
      mimeType: mimeType || "application/octet-stream",
      uploaderId: user.id,
      uploaderType: user.userType || "ADMIN",
    });

    return res.status(200).json({ success: true, data: record });
  } catch (error: unknown) {
    return handleError(res, error, "upload.confirmS3Upload");
  }
};

export const deleteS3File = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "File ID is required" });

    const resolvedSchoolId = await resolveSchoolId(req.user.schoolId || req.user.tenantId || "");
    if (!resolvedSchoolId) return res.status(403).json({ success: false, message: "Access denied" });

    await deleteS3FileService(id as string, resolvedSchoolId);
    return res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error: unknown) {
    return handleError(res, error, "upload.deleteS3File");
  }
};

export const deleteBunnyFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "File ID is required" });

    const resolvedSchoolId = await resolveSchoolId(req.user.schoolId || req.user.tenantId || "");
    if (!resolvedSchoolId) return res.status(403).json({ success: false, message: "Access denied" });

    await deleteBunnyFileService(id as string, resolvedSchoolId);
    return res.status(200).json({
      success: true,
      message: "File deleted successfully from Bunny.net",
    });
  } catch (error: unknown) {
    return handleError(res, error, "upload.deleteBunnyFile");
  }
};

export const deleteFileByUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "File URL is required" });

    const resolvedSchoolId = await resolveSchoolId(req.user.schoolId || req.user.tenantId || "");
    if (!resolvedSchoolId) return res.status(403).json({ success: false, message: "Access denied" });

    await deleteFileByUrlService(url, resolvedSchoolId);
    return res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error: unknown) {
    return handleError(res, error, "upload.deleteFileByUrl");
  }
};

export const getUploadHistory = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const resolvedSchoolId = await resolveSchoolId(req.user.schoolId || req.user.tenantId || "");
    if (!resolvedSchoolId) {
      return res.status(200).json({
        success: true,
        data: { records: [], total: 0, page, limit },
      });
    }

    const history = await getUploadHistoryService(resolvedSchoolId, req.user.id, page, limit);
    return res.status(200).json({ success: true, data: history });
  } catch (error: unknown) {
    return handleError(res, error, "upload.getUploadHistory");
  }
};

export const cleanupUnusedImages = async (req: Request, res: Response) => {
  try {
    const resolvedSchoolId = await resolveSchoolId(req.user.schoolId || req.user.tenantId || "");
    if (!resolvedSchoolId) {
      return res.status(200).json({ success: true, data: { deletedCount: 0, deletedUrls: [] } });
    }

    const result = await cleanupUnusedImagesService(resolvedSchoolId, req.user.id);
    return res.status(200).json({
      success: true,
      data: result,
      message: `Cleaned up ${result.deletedCount} unused images.`,
    });
  } catch (error: unknown) {
    return handleError(res, error, "upload.cleanupUnusedImages");
  }
};
