import https from "https";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../config/database";
import { enforceStorageLimit } from "../subscription/quota.helpers";
import { EntitlementService } from "../subscription/entitlement.service";

/**
 * Upload a buffer to Bunny.net using their native HTTP Storage API.
 * Bunny.net is NOT truly S3-compatible - must use AccessKey header auth.
 * Endpoint: PUT https://{region}.storage.bunnycdn.com/{storageZone}/{key}
 */
export const uploadBufferToBunnyService = async (
  buffer: Buffer, 
  fileType: string = "image/png",
  meta?: { userId: string; userType: string; schoolId?: string; fileName?: string }
) => {
  if (meta?.schoolId) {
    let enforceForUploader = true;
    if (meta.userType === "STUDENT") {
      enforceForUploader = await EntitlementService.isEnforced("students");
    } else if (meta.userType === "TEACHER") {
      enforceForUploader = await EntitlementService.isEnforced("teachers");
    }

    if (enforceForUploader) {
      await enforceStorageLimit(meta.schoolId, buffer.length);
    }
  }

  const storageZone = (process.env.BUNNY_STORAGE_ZONE_NAME || "").trim();
  const apiKey      = (process.env.BUNNY_STORAGE_API_KEY      || "").trim();
  const pullZoneUrl = (process.env.BUNNY_PULL_ZONE_URL      || "").trim();
  const region      = (process.env.BUNNY_STORAGE_REGION      || "").trim();

  if (!storageZone || !apiKey || !pullZoneUrl) {
    console.error("[Bunny Service] Missing configuration:", { storageZone, hasKey: !!apiKey, pullZoneUrl });
    throw new Error("Upload service is not correctly configured on the server.");
  }

  // Determine extension from fileType
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4"
  };
  const extension = extMap[fileType] || "png";
  
  // Sanitize filename to remove spaces and special characters that break HTTP paths
  const rawFileName = meta?.fileName || `${uuidv4()}-${Date.now()}.${extension}`;
  const safeFileName = rawFileName
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/[^a-zA-Z0-9.\-_]/g, ""); // Remove other special characters
  
  const key = `institutional/${safeFileName}`;
  
  // Regional hostname: storage.bunnycdn.com for default, {region}.storage.bunnycdn.com for others
  const hostname = region ? `${region}.storage.bunnycdn.com` : `storage.bunnycdn.com`;
  
  // Ensure path is properly encoded for the HTTP request
  const path     = encodeURI(`/${storageZone}/${key}`);

  console.log(`[Bunny Upload] PUT https://${hostname}${path} (Type: ${fileType})`);

  return new Promise<{ publicUrl: string; key: string }>((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: "PUT",
      headers: {
        AccessKey:       apiKey,
        "Content-Type":  fileType,
        "Content-Length": buffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", async () => {
        console.log(`[Bunny Service] Response: ${res.statusCode} - ${body}`);
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          // Construct public URL cleanly
          const cleanPullZone = pullZoneUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
          const publicUrl = `https://${cleanPullZone}/${key}`;
          
          console.log(`[Bunny Service] Success. Public URL: ${publicUrl}`);

          // Log metrics if meta is provided
          try {
            if (meta) {
               // Map userType back to safe fields
               await prisma.$transaction(async (tx) => {
                 await tx.fileRecord.create({
                   data: {
                     fileName: safeFileName,
                     fileUrl: publicUrl,
                     fileSize: buffer.length,
                     mimeType: fileType,
                     uploaderId: meta.userId,
                     uploaderType: meta.userType,
                     schoolId: meta.schoolId as string,
                   }
                 });

                 // Increment school storage
                 await tx.school.update({
                   where: { id: meta.schoolId },
                   data: {
                     storageUsedBytes: {
                       increment: buffer.length
                     }
                   }
                 });
               });

               console.log("[Bunny Service] FileRecord created:", { fileName: safeFileName, size: buffer.length });
             }
          } catch (metricError) {
            console.error("[Bunny Service] Failed to create FileRecord:", metricError);
            // Don't fail the upload just because metric logging failed
          }

          resolve({ publicUrl, key });
        } else {
          console.error(`[Bunny Service] Failed (${res.statusCode}): ${body}`);
          reject(new Error(`Bunny.net storage returned ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(buffer);
    req.end();
  });
};

/**
 * Get a signed upload URL (legacy - kept for compatibility)
 */
export const getCloudflareUploadUrlService = async (fileType: string = "image/png") => {
  // No longer using S3-style presigned URLs. Return a placeholder that signals
  // the caller should use the proxy endpoint instead.
  throw new Error(
    "Use the /upload/proxy endpoint instead. Direct presigned URLs are not supported."
  );
};

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const getS3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
};

export const getS3PresignedUrlService = async (options: {
  schoolId: string;
  fileSize: number;
  fileName: string;
  fileType: string;
}) => {
  const { schoolId, fileSize, fileName, fileType } = options;

  // Validate limits (even if enforcement is disabled, this helper allows bypassing correctly)
  await enforceStorageLimit(schoolId, fileSize);

  const s3 = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET_NAME || "";

  // Generate safe key
  const safeFileName = fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9.\-_]/g, "");
  const key = `schools/${schoolId}/${uuidv4()}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  
  // Construct the future public URL
  const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl, key };
};

export const confirmS3UploadService = async (data: {
  schoolId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploaderId: string;
  uploaderType: string;
}) => {
  // Record the file and increment storage used in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.fileRecord.create({
      data: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        uploaderId: data.uploaderId,
        uploaderType: data.uploaderType,
        schoolId: data.schoolId,
      }
    });

    await tx.school.update({
      where: { id: data.schoolId },
      data: {
        storageUsedBytes: {
          increment: data.fileSize
        }
      }
    });

    return record;
  });

  return result;
};

export const deleteS3FileService = async (fileRecordId: string, schoolId: string) => {
  const fileRecord = await prisma.fileRecord.findUnique({
    where: { id: fileRecordId }
  });

  if (!fileRecord || fileRecord.schoolId !== schoolId) {
    throw new Error("File not found or unauthorized.");
  }

  // Delete from S3
  const s3 = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET_NAME || "";

  // Extract key from URL
  // Example URL: https://bucket.s3.region.amazonaws.com/schools/123/file.png
  const keyMatch = fileRecord.fileUrl.match(new RegExp(`https://${bucket}.s3.[a-z0-9-]+.amazonaws.com/(.+)`));
  if (keyMatch && keyMatch[1]) {
    const key = keyMatch[1];
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    try {
      await s3.send(command);
    } catch (e) {
      console.error("[S3 Delete] Failed to delete from S3:", e);
      // Even if S3 delete fails (e.g., file already deleted), we still remove from DB to correct state.
    }
  }

  // Delete from DB and decrement storage
  await prisma.$transaction(async (tx) => {
    await tx.fileRecord.delete({ where: { id: fileRecordId } });
    
    // Decrement, ensuring we don't go below 0
    const school = await tx.school.findUnique({ where: { id: schoolId } });
    const newStorage = Math.max(0, (school?.storageUsedBytes || 0) - fileRecord.fileSize);
    
    await tx.school.update({
      where: { id: schoolId },
      data: { storageUsedBytes: newStorage }
    });
  });

  return { success: true };
};

export const deleteBunnyFileService = async (fileRecordId: string, schoolId: string) => {
  const fileRecord = await prisma.fileRecord.findUnique({
    where: { id: fileRecordId }
  });

  if (!fileRecord || fileRecord.schoolId !== schoolId) {
    throw new Error("File not found or unauthorized.");
  }

  const storageZone = (process.env.BUNNY_STORAGE_ZONE_NAME || "").trim();
  const apiKey      = (process.env.BUNNY_STORAGE_API_KEY      || "").trim();
  const region      = (process.env.BUNNY_STORAGE_REGION      || "").trim();
  const pullZoneUrl = (process.env.BUNNY_PULL_ZONE_URL      || "").trim();

  // Extract key from URL
  // Example URL: https://schoolhub.b-cdn.net/institutional/file.png
  let key = "";
  if (pullZoneUrl) {
    const cleanPullZone = pullZoneUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const match = fileRecord.fileUrl.match(new RegExp(`https://${cleanPullZone}/(.+)`));
    if (match && match[1]) {
      key = match[1];
    }
  }
  
  if (key && storageZone && apiKey) {
    const hostname = region ? `${region}.storage.bunnycdn.com` : `storage.bunnycdn.com`;
    const path = encodeURI(`/${storageZone}/${key}`);

    try {
      await new Promise<void>((resolve, reject) => {
        const req = https.request({
          hostname,
          path,
          method: "DELETE",
          headers: { AccessKey: apiKey }
        }, (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            console.error(`[Bunny Delete] HTTP ${res.statusCode}`);
            resolve(); // We resolve anyway to continue with DB deletion
          }
        });
        req.on("error", (e) => {
          console.error(`[Bunny Delete] Error: ${e.message}`);
          resolve(); // Resolve to allow DB cleanup
        });
        req.end();
      });
    } catch (e) {
      console.error("[Bunny Delete] Failed:", e);
    }
  }

  // Delete from DB and decrement storage
  await prisma.$transaction(async (tx) => {
    await tx.fileRecord.delete({ where: { id: fileRecordId } });
    
    // Decrement, ensuring we don't go below 0
    const school = await tx.school.findUnique({ where: { id: schoolId } });
    const newStorage = Math.max(0, (school?.storageUsedBytes || 0) - fileRecord.fileSize);
    
    await tx.school.update({
      where: { id: schoolId },
      data: { storageUsedBytes: newStorage }
    });
  });

  return { success: true };
};
