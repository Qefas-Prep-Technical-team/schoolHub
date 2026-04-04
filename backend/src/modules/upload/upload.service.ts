import https from "https";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload a buffer to Bunny.net using their native HTTP Storage API.
 * Bunny.net is NOT truly S3-compatible - must use AccessKey header auth.
 * Endpoint: PUT https://{region}.storage.bunnycdn.com/{storageZone}/{key}
 */
export const uploadBufferToBunnyService = async (buffer: Buffer, fileType: string = "image/png") => {
  const storageZone = process.env.BUNNY_STORAGE_ZONE_NAME;
  const apiKey      = process.env.BUNNY_STORAGE_API_KEY;
  const pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL;
  const region      = (process.env.BUNNY_STORAGE_REGION || "").trim();

  if (!storageZone || !apiKey || !pullZoneUrl) {
    throw new Error(
      `Bunny.net is not configured. Missing: ${!storageZone ? "BUNNY_STORAGE_ZONE_NAME " : ""}${!apiKey ? "BUNNY_STORAGE_API_KEY " : ""}${!pullZoneUrl ? "BUNNY_PULL_ZONE_URL" : ""}`
    );
  }

  const key      = `institutional/${uuidv4()}-${Date.now()}`;
  // Regional hostname: storage.bunnycdn.com for default, {region}.storage.bunnycdn.com for others
  const hostname = region ? `${region}.storage.bunnycdn.com` : `storage.bunnycdn.com`;
  const path     = `/${storageZone}/${key}`;

  console.log(`[Bunny Upload] PUT https://${hostname}${path}`);

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
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          const base       = pullZoneUrl.endsWith("/") ? pullZoneUrl : pullZoneUrl + "/";
          const publicUrl  = `https://${base.replace(/^https?:\/\//, "")}${key}`;
          resolve({ publicUrl, key });
        } else {
          reject(new Error(`Bunny.net returned ${res.statusCode}: ${body}`));
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
