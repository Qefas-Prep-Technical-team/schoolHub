import https from "https";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../config/database";
import { enforceStorageLimit } from "../subscription/quota.helpers";

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
    await enforceStorageLimit(meta.schoolId, buffer.length);
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
              const metricData: any = {
                id: uuidv4(),
                fileName: safeFileName,
                fileSize: BigInt(buffer.length),
                fileType: fileType,
                schoolId: meta.schoolId
              };
 
               // Map userType back to safe fields
               if (meta.userType === "STUDENT") metricData.studentId = meta.userId;
               if (meta.userType === "TEACHER") metricData.teacherId = meta.userId;
               if (meta.userType === "PARENT") metricData.parentId = meta.userId;
 
               await prisma.fileMetric.create({ data: metricData });
               console.log("[Bunny Service] Metric created:", { fileName: safeFileName, size: buffer.length });
             }
          } catch (metricError) {
            console.error("[Bunny Service] Failed to create metric:", metricError);
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
