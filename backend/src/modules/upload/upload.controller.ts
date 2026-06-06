import { Request, Response } from "express";
import { handleError } from "../../utils/error-handler";
import { uploadBufferToBunnyService, getS3PresignedUrlService, confirmS3UploadService, deleteS3FileService, deleteBunnyFileService } from "./upload.service";

/**
 * Legacy - No longer supported. Use /upload/proxy instead.
 */
export const getCloudflareUploadUrl = async (req: Request, res: Response) => {
  return res.status(410).json({
    success: false,
    message: "This endpoint is deprecated. Use POST /upload/proxy instead.",
  });
};

/**
 * Handle direct binary upload from frontend via multer
 * Proxies the file to Bunny.net to avoid CORS/DNS issues
 */
export const proxyUpload = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File;

    if (!file) {
      console.error("[Proxy Upload] Multer did not find 'file' in request");
      return res.status(400).json({
        success: false,
        message: "No file received. Please check the field name is 'file'.",
      });
    }

    if (!file.buffer || file.buffer.length === 0) {
      console.error("[Proxy Upload] File received but buffer is empty");
      return res.status(400).json({
        success: false,
        message: "File is empty",
      });
    }

    console.log(`[Proxy Upload] Received file: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);

    const user = (req as any).user;
    const data = await uploadBufferToBunnyService(file.buffer, file.mimetype, {
      userId: user.id,
      userType: user.userType,
      schoolId: req.body.schoolId || user.schoolId,
      fileName: req.body.fileName || file.originalname
    });
    
    return res.status(200).json({
      success: true,
      url: data.publicUrl,
      data,
    });
  } catch (error: any) {
    return handleError(res, error, "upload.proxyUpload");
  }
};

export const getS3PresignedUrl = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { fileName, fileType, fileSize } = req.body;

    if (!fileName || !fileType || !fileSize) {
      return res.status(400).json({ success: false, message: "fileName, fileType, and fileSize are required" });
    }

    const data = await getS3PresignedUrlService({
      schoolId: user.schoolId,
      fileName,
      fileType,
      fileSize: Number(fileSize),
    });

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return handleError(res, error, "upload.getS3PresignedUrl");
  }
};

export const confirmS3Upload = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { fileName, fileUrl, fileSize, mimeType } = req.body;

    if (!fileName || !fileUrl || !fileSize) {
      return res.status(400).json({ success: false, message: "fileName, fileUrl, and fileSize are required" });
    }

    const record = await confirmS3UploadService({
      schoolId: user.schoolId,
      fileName,
      fileUrl,
      fileSize: Number(fileSize),
      mimeType: mimeType || "application/octet-stream",
      uploaderId: user.id,
      uploaderType: user.userType || "ADMIN",
    });

    return res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    return handleError(res, error, "upload.confirmS3Upload");
  }
};

export const deleteS3File = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "File ID is required" });
    }

    await deleteS3FileService(id as string, user.schoolId);

    return res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error: any) {
    return handleError(res, error, "upload.deleteS3File");
  }
};

export const deleteBunnyFile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "File ID is required" });
    }

    await deleteBunnyFileService(id as string, user.schoolId);

    return res.status(200).json({ success: true, message: "File deleted successfully from Bunny.net" });
  } catch (error: any) {
    return handleError(res, error, "upload.deleteBunnyFile");
  }
};
