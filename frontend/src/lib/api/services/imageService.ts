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
  proxyUploadToBunny: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/upload/proxy", formData);

    return response.data.data; // Returns { publicUrl, key }
  },

  /**
   * Upload file directly to Supabase Storage
   */
  uploadToSupabase: async (file: File, bucket: string = "school-assets") => {
    const supabase = getSupabase();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabase.storage
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
