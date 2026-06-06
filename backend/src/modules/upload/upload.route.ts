import { Router } from "express";
import multer from "multer";
import { authenticateToken } from "../../middleware/authMiddleware";
import { getCloudflareUploadUrl, proxyUpload, getS3PresignedUrl, confirmS3Upload, deleteS3File, deleteBunnyFile } from "./upload.controller";

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
 * @route   POST /api/v1/upload/proxy
 * @desc    Directly upload image file to backend to proxy to Bunny.net
 * @access  Private
 */
router.post("/proxy", upload.single("file"), proxyUpload);

/**
 * @route   DELETE /api/v1/upload/proxy/:id
 * @desc    Delete a file from Bunny.net and decrement storage quota
 * @access  Private
 */
router.delete("/proxy/:id", deleteBunnyFile);

// --- New S3 Endpoints ---

/**
 * @route   POST /api/v1/upload/presigned-url
 * @desc    Get a signed URL for direct upload to AWS S3
 * @access  Private
 */
router.post("/presigned-url", getS3PresignedUrl);

/**
 * @route   POST /api/v1/upload/confirm
 * @desc    Confirm an S3 upload has finished, logs it and updates storage quota
 * @access  Private
 */
router.post("/confirm", confirmS3Upload);

/**
 * @route   DELETE /api/v1/upload/:id
 * @desc    Delete a file from S3 and decrement storage quota
 * @access  Private
 */
router.delete("/:id", deleteS3File);

export default router;
