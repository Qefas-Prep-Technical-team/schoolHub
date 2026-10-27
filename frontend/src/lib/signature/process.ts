/**
 * Signature Processing & Normalization Module
 * Handles client-side background removal, luminance illumination compensation,
 * alpha thresholding, recoloring, and transparent PNG trimming.
 */

export interface ProcessSignatureOptions {
  threshold?: number; // 100 - 240, default 190
  inkColor?: [number, number, number]; // [r, g, b], default [17, 17, 17] (near-black)
  maxWidth?: number; // final export max width, default 800
  padding?: number; // trim padding around ink bounding box, default 12
}

/**
 * Trims transparent margins around ink on a canvas and resizes to maxWidth.
 */
export async function trimTransparentPng(
  canvas: HTMLCanvasElement,
  pad: number = 12,
  maxWidth: number = 800
): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let hasInk = false;

  const alphaThreshold = 38; // ~0.15 * 255

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > alphaThreshold) {
        hasInk = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasInk) {
    throw new Error("We couldn't find a signature. Try a darker pen or better light.");
  }

  // Apply padding and clamp to canvas boundaries
  const cropX = Math.max(0, minX - pad);
  const cropY = Math.max(0, minY - pad);
  const cropWidth = Math.min(width - cropX, maxX - minX + pad * 2);
  const cropHeight = Math.min(height - cropY, maxY - minY + pad * 2);

  // Compute final dimensions (scale down if exceeds maxWidth)
  let destWidth = cropWidth;
  let destHeight = cropHeight;

  if (destWidth > maxWidth) {
    const scale = maxWidth / destWidth;
    destWidth = maxWidth;
    destHeight = Math.round(cropHeight * scale);
  }

  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = destWidth;
  trimmedCanvas.height = destHeight;

  const trimmedCtx = trimmedCanvas.getContext("2d");
  if (!trimmedCtx) throw new Error("Could not create trimmed canvas context");

  trimmedCtx.imageSmoothingEnabled = true;
  trimmedCtx.imageSmoothingQuality = "high";

  trimmedCtx.drawImage(
    canvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    destWidth,
    destHeight
  );

  return new Promise<Blob>((resolve, reject) => {
    trimmedCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Canvas export to PNG Blob failed"));
      }
    }, "image/png");
  });
}

/**
 * Loads image bitmap or element with EXIF orientation handling.
 */
async function loadSourceImage(file: Blob): Promise<{ source: ImageBitmap | HTMLImageElement; width: number; height: number }> {
  if (typeof window !== "undefined" && "createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height };
    } catch {
      // Fallback if options unsupported
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ source: img, width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load signature image"));
    };
    img.src = url;
  });
}

/**
 * Computes blurred background illumination map.
 * Uses ctx.filter = 'blur(25px)' with a low-res fallback for older Safari/iOS.
 */
function createIlluminationMap(
  source: ImageBitmap | HTMLImageElement,
  w: number,
  h: number
): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not create illumination context");

  // Check if ctx.filter is supported
  const supportsFilter = typeof ctx.filter === "string";

  if (supportsFilter) {
    ctx.filter = "blur(25px)";
    ctx.drawImage(source, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h);
  }

  // Fallback for Safari/iOS without ctx.filter:
  // Downscale to ~40px wide, then upscale back to original dimensions with smoothing.
  const scratchCanvas = document.createElement("canvas");
  const scratchWidth = 40;
  const scratchHeight = Math.max(1, Math.round((h / w) * scratchWidth));
  scratchCanvas.width = scratchWidth;
  scratchCanvas.height = scratchHeight;

  const sCtx = scratchCanvas.getContext("2d");
  if (!sCtx) throw new Error("Could not create scratch context");
  sCtx.drawImage(source, 0, 0, scratchWidth, scratchHeight);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(scratchCanvas, 0, 0, scratchWidth, scratchHeight, 0, 0, w, h);

  return ctx.getImageData(0, 0, w, h);
}

/**
 * Processes a photo of a signature written on paper into a clean, transparent PNG.
 */
export async function processSignaturePhoto(
  file: Blob,
  opts: ProcessSignatureOptions = {}
): Promise<Blob> {
  const threshold = opts.threshold ?? 190;
  const inkColor = opts.inkColor ?? [17, 17, 17];
  const maxWidth = opts.maxWidth ?? 800;
  const padding = opts.padding ?? 12;

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File exceeds 2MB limit. Please upload a smaller photo.");
  }

  const { source, width, height } = await loadSourceImage(file);

  // Downscale to max 1600px wide for working canvas to prevent mobile memory spikes
  const workingMaxWidth = 1600;
  let workW = width;
  let workH = height;
  if (workW > workingMaxWidth) {
    const scale = workingMaxWidth / workW;
    workW = workingMaxWidth;
    workH = Math.round(height * scale);
  }

  // Draw working image
  const workCanvas = document.createElement("canvas");
  workCanvas.width = workW;
  workCanvas.height = workH;
  const workCtx = workCanvas.getContext("2d");
  if (!workCtx) throw new Error("Could not initialize processing canvas context");

  workCtx.drawImage(source, 0, 0, workW, workH);
  const srcImgData = workCtx.getImageData(0, 0, workW, workH);
  const srcData = srcImgData.data;

  // Illumination compensation map
  const bgImgData = createIlluminationMap(source, workW, workH);
  const bgData = bgImgData.data;

  const totalPixels = workW * workH;
  let inkCount = 0;

  // Output image buffer
  const outImgData = workCtx.createImageData(workW, workH);
  const outData = outImgData.data;

  // Soft edge band width around threshold
  const edgeBand = 18;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;

    const r = srcData[idx];
    const g = srcData[idx + 1];
    const b = srcData[idx + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    const bgR = bgData[idx];
    const bgG = bgData[idx + 1];
    const bgB = bgData[idx + 2];
    const bgLum = Math.max(1, 0.299 * bgR + 0.587 * bgG + 0.114 * bgB);

    // Normalized ratio against background illumination (255 = paper white)
    const normalizedLum = (lum / bgLum) * 255;

    // Determine alpha: dark pixels -> opaque (255), bright pixels -> transparent (0)
    let alpha = 0;

    if (normalizedLum <= threshold - edgeBand) {
      alpha = 255;
    } else if (normalizedLum >= threshold + edgeBand) {
      alpha = 0;
    } else {
      // Linear interpolation in soft edge band for anti-aliased contours
      const t = (normalizedLum - (threshold - edgeBand)) / (edgeBand * 2);
      alpha = Math.round((1 - t) * 255);
    }

    if (alpha > 38) {
      inkCount++;
    }

    // Recolor all ink pixels to crisp solid ink color (removes lighting tints)
    outData[idx] = inkColor[0];
    outData[idx + 1] = inkColor[1];
    outData[idx + 2] = inkColor[2];
    outData[idx + 3] = alpha;
  }

  // Reject if no ink detected (less than 60 pixels)
  if (inkCount < 60) {
    throw new Error(
      "We couldn't find a signature. Try a darker pen or better light."
    );
  }

  workCtx.putImageData(outImgData, 0, 0);

  // Trim and scale
  return trimTransparentPng(workCanvas, padding, maxWidth);
}

/**
 * Computes SHA-256 hex string for a given blob for audit and verification.
 */
export async function computeSha256(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback simple checksum if Web Crypto subtle is unavailable
  let hash = 0;
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    hash = (hash << 5) - hash + bytes[i];
    hash |= 0;
  }
  return "hash-" + Math.abs(hash).toString(16);
}
