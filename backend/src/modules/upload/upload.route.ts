import { Router } from "express";
import multer from "multer";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getCloudflareUploadUrl, proxyUpload } from "./upload.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Only authenticated users can upload
router.use(authenticateToken);

/**
 * @route   POST /api/upload/cloudflare-url
 * @desc    Get a signed URL for direct upload to Cloudflare Images V2
 * @access  Private
 */
router.post("/cloudflare-url", getCloudflareUploadUrl);

/**
 * @route   POST /api/upload/proxy
 * @desc    Directly upload image file to backend to proxy to Bunny.net
 * @access  Private
 */
router.post("/proxy", upload.single("file"), proxyUpload);

export default router;
