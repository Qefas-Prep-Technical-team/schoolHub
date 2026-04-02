import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

/**
 * Initialize S3-compatible client for Bunny.net
 */
const getS3Client = () => {
  let region = process.env.BUNNY_STORAGE_REGION || "";
  
  // Clean region if it's a full hostname by mistake (e.g. storage.bunnycdn.com -> "")
  if (region.includes(".")) {
    console.warn("[Bunny.net] Invalid region detected in .env, defaulting to Global (s3.bunnycdn.com)");
    region = "";
  }

  const endpoint = region 
    ? `https://${region}.s3.bunnycdn.com` 
    : `https://s3.bunnycdn.com`;

  return new S3Client({
    region: region || "de", // Bunny S3 defaults to Falkenstein (de) or 'auto'
    endpoint,
    credentials: {
      accessKeyId: process.env.BUNNY_STORAGE_ZONE_NAME || "",
      secretAccessKey: process.env.BUNNY_STORAGE_API_KEY || "",
    },
    forcePathStyle: true,
  });
};

/**
 * Get a signed upload URL from Bunny.net Edge Storage
 * Uses S3-compatible presigned PUT flow
 */
export const getCloudflareUploadUrlService = async (fileType: string = "image/png") => {
  const storageZone = process.env.BUNNY_STORAGE_ZONE_NAME;
  const pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL;

  if (!storageZone || !pullZoneUrl) {
    console.error("[Bunny.net Config Missing]", { storageZone: !!storageZone, pullZoneUrl: !!pullZoneUrl });
    throw new Error(`Bunny.net Media Engine is not configured. Missing: ${!storageZone ? 'BUNNY_STORAGE_ZONE_NAME' : ''} ${!pullZoneUrl ? 'BUNNY_PULL_ZONE_URL' : ''}`);
  }

  try {
    const s3Client = getS3Client();
    
    // Generate a unique path/key for the institutional asset
    // Format: institutional/<uuid>-<timestamp>
    const key = `institutional/${uuidv4()}-${Date.now()}`;
    
    const command = new PutObjectCommand({
      Bucket: storageZone, // Bunny uses Storage Zone Name as Bucket
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    const publicUrl = `${pullZoneUrl.endsWith('/') ? pullZoneUrl : pullZoneUrl + '/'}${key}`;

    return {
      uploadUrl,
      publicUrl,
      key,
    };
  } catch (error: any) {
    console.error("[Bunny.net Upload Service Error]", error);
    throw new Error(error.message || "Failed to communicate with Bunny.net Media Engine");
  }
};
