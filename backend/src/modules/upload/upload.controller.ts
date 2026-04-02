import { Request, Response } from "express";
import { getCloudflareUploadUrlService } from "./upload.service";

/**
 * Handle fetching a signed upload URL for Cloudflare
 */
export const getCloudflareUploadUrl = async (req: Request, res: Response) => {
  try {
    const { fileType } = req.body;
    const data = await getCloudflareUploadUrlService(fileType);
    
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(`[Upload Controller Error]`, error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch upload URL",
    });
  }
};
