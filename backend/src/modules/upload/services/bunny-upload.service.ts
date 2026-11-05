import https from "https";
import { v4 as uuidv4 } from "uuid";
import prisma from "../../../config/database";
import { enforceStorageLimit } from "../../subscription/quota.helpers";
import { EntitlementService } from "../../subscription/entitlement.service";

/**
 * Upload a buffer to Bunny.net using their native HTTP Storage API.
 */
export const uploadBufferToBunnyService = async (
  buffer: Buffer,
  fileType: string = "image/png",
  meta?: { userId: string; userType: string; schoolId?: string; fileName?: string },
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
  const apiKey = (process.env.BUNNY_STORAGE_API_KEY || "").trim();
  const pullZoneUrl = (process.env.BUNNY_PULL_ZONE_URL || "").trim();
  const region = (process.env.BUNNY_STORAGE_REGION || "").trim();

  if (!storageZone || !apiKey || !pullZoneUrl) {
    console.error("[Bunny Service] Missing configuration:", {
      storageZone,
      hasKey: !!apiKey,
      pullZoneUrl,
    });
    throw new Error("Upload service is not correctly configured on the server.");
  }

  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    "image/gif": "gif",
    "image/webp": "webp",
    "video/mp4": "mp4",
  };
  const extension = extMap[fileType] || "png";

  const rawFileName = meta?.fileName || `${uuidv4()}-${Date.now()}.${extension}`;
  const safeFileName = rawFileName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "");

  const key = `institutional/${safeFileName}`;
  const hostname = region
    ? `${region}.storage.bunnycdn.com`
    : `storage.bunnycdn.com`;
  const path = encodeURI(`/${storageZone}/${key}`);

  return new Promise<{ publicUrl: string; key: string }>((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: "PUT",
      headers: {
        AccessKey: apiKey,
        "Content-Type": fileType,
        "Content-Length": buffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", async () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          const cleanPullZone = pullZoneUrl
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, "");
          const publicUrl = `https://${cleanPullZone}/${key}`;

          try {
            if (meta?.schoolId) {
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
                  },
                });

                await tx.school.update({
                  where: { id: meta.schoolId },
                  data: {
                    storageUsedBytes: {
                      increment: buffer.length,
                    },
                  },
                });
              });
            }
          } catch (metricError) {
            console.error("[Bunny Service] Failed to create FileRecord:", metricError);
          }

          resolve({ publicUrl, key });
        } else {
          reject(
            new Error(`Bunny.net storage returned ${res.statusCode}: ${body}`),
          );
        }
      });
    });

    req.on("error", (err) => reject(err));
    req.write(buffer);
    req.end();
  });
};

export const getCloudflareUploadUrlService = async () => {
  throw new Error(
    "Use the /upload/proxy endpoint instead. Direct presigned URLs are not supported.",
  );
};

export const deleteBunnyFileService = async (
  fileRecordId: string,
  schoolId: string,
) => {
  const fileRecord = await prisma.fileRecord.findUnique({
    where: { id: fileRecordId },
  });

  if (!fileRecord || fileRecord.schoolId !== schoolId) {
    throw new Error("File not found or unauthorized.");
  }

  const storageZone = (process.env.BUNNY_STORAGE_ZONE_NAME || "").trim();
  const apiKey = (process.env.BUNNY_STORAGE_API_KEY || "").trim();
  const region = (process.env.BUNNY_STORAGE_REGION || "").trim();
  const pullZoneUrl = (process.env.BUNNY_PULL_ZONE_URL || "").trim();

  let key = "";
  if (pullZoneUrl) {
    const cleanPullZone = pullZoneUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    const match = fileRecord.fileUrl.match(
      new RegExp(`https://${cleanPullZone}/(.+)`),
    );
    if (match && match[1]) {
      key = match[1];
    }
  }

  if (key && storageZone && apiKey) {
    const hostname = region
      ? `${region}.storage.bunnycdn.com`
      : `storage.bunnycdn.com`;
    const path = encodeURI(`/${storageZone}/${key}`);

    try {
      await new Promise<void>((resolve) => {
        const req = https.request(
          {
            hostname,
            path,
            method: "DELETE",
            headers: { AccessKey: apiKey },
          },
          () => resolve(),
        );
        req.on("error", () => resolve());
        req.end();
      });
    } catch (e) {
      console.error("[Bunny Delete] Failed:", e);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.fileRecord.delete({ where: { id: fileRecordId } });

    const school = await tx.school.findUnique({ where: { id: schoolId } });
    const newStorage = Math.max(
      0,
      (school?.storageUsedBytes || 0) - fileRecord.fileSize,
    );

    await tx.school.update({
      where: { id: schoolId },
      data: { storageUsedBytes: newStorage },
    });
  });

  return { success: true };
};

