import { Router } from "express";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getCloudflareUploadUrl } from "./upload.controller";

const router = Router();

// Only authenticated users can get upload URLs
router.use(authenticateToken);

/**
 * @route   POST /api/v1/upload/cloudflare-url
 * @desc    Get a signed URL for direct upload to Cloudflare Images V2
 * @access  Private
 */
router.post("/cloudflare-url", getCloudflareUploadUrl);

export default router;
