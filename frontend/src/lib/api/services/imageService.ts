import { apiClient } from "../client";
import { getSupabase } from "../../supabaseClient";

export const imageService = {
  /**
   * Get a signed upload URL for Cloudflare R2
   */
  getCloudflareUploadUrl: async (fileType: string = "image/png") => {
    const response = await apiClient.post("/upload/cloudflare-url", { fileType });
    return response.data.data;
  },

  /**
   * Upload a file directly to Cloudflare R2 using a signed PUT URL
   */
  uploadToR2: async (uploadUrl: string, file: File) => {
    // S3/R2 presigned PUT takes the binary file directly as the request body
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudflare R2 Upload failed: ${response.statusText}`);
    }

    return true;
  },

  /**
   * Proxy upload through backend to bypass CORS/DNS issues with Bunny.net
   */
  proxyUploadToBunny: async (file: File, schoolId?: string) => {
    // 1. Upload to Supabase directly (migrated from legacy Bunny.net proxy)
    const { publicUrl, key } = await imageService.uploadToSupabase(file, "school-assets");

    // 2. Call the backend to confirm the upload and log the FileRecord for quota tracking
    await apiClient.post("/upload/confirm", {
      fileName: file.name,
      fileUrl: publicUrl,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      schoolId,
    });

    return { publicUrl, key };
  },

  /**
   * Upload file directly to Supabase Storage
   */
  uploadToSupabase: async (file: File, bucket: string = "school-assets") => {
    const supabase = getSupabase();
    const fileExt = file.name.split('.').pop() || 'bin';
    // Preserve the original name: lowercase it, replace spaces/special chars, prefix with short timestamp for uniqueness
    const baseName = file.name
      .replace(`.${fileExt}`, '')          // strip extension
      .toLowerCase()
      .replace(/\s+/g, '-')               // spaces → hyphens
      .replace(/[^a-z0-9\-_]/g, '')       // strip special chars
      .slice(0, 80)                        // cap at 80 chars
      || 'file';
    const timestamp = Date.now().toString(36);  // short base36 timestamp (e.g. "lm6v1e")
    const fileName = `${timestamp}-${baseName}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { publicUrl, key: filePath };
  },
};
