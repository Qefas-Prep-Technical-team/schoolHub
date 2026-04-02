import { apiClient } from "../client";

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
};
