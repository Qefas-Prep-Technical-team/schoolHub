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

    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new Error("No file data received. Please attach a file with field name 'file'.");
    }

    const data = await uploadBufferToBunnyService(file.buffer, file.mimetype);
    
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Proxy Upload Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to proxy upload",
    });
  }
};
