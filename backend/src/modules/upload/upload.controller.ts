import { Request, Response } from "express";
import { uploadBufferToBunnyService } from "./upload.service";

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

    const data = await uploadBufferToBunnyService(file.buffer, file.mimetype);
    
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Proxy Upload Controller Error]`, {
      message: error.message,
      stack: error.stack,
      details: error.response?.data
    });
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to proxy upload",
    });
  }
};
