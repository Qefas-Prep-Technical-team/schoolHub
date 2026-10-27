"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Cropper, { Area } from "react-easy-crop";
import { UploadCloud, Camera, Sliders, AlertCircle, Check, RefreshCw, Scissors, Sparkles, Loader2 } from "lucide-react";
import { processSignaturePhoto } from "@/lib/signature/process";
import { cn } from "@/lib/utils";

interface UploadSignatureProps {
  onSignatureGenerated: (data: { blob: Blob; dataUrl: string } | null) => void;
  className?: string;
}

export const UploadSignature: React.FC<UploadSignatureProps> = ({
  onSignatureGenerated,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [isCropping, setIsCropping] = useState(false);
  const [threshold, setThreshold] = useState<number>(190);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  // Handle file selection / capture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Photo exceeds 2MB limit. Please upload a smaller image.");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Unsupported file type. Please upload a JPEG, PNG, or WEBP image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsCropping(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Helper to crop image from pixel coordinates
  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not create canvas context");

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Cropping canvas export failed"));
      }, "image/jpeg", 0.95);
    });
  };

  // Perform background removal & trimming with current threshold
  const runBackgroundRemoval = useCallback(
    async (rawBlob: Blob, cleanUpThreshold: number) => {
      setIsProcessing(true);
      setErrorMessage(null);

      try {
        const transparentBlob = await processSignaturePhoto(rawBlob, {
          threshold: cleanUpThreshold,
          maxWidth: 800,
          padding: 12,
        });

        const dataUrl = URL.createObjectURL(transparentBlob);
        onSignatureGenerated({
          blob: transparentBlob,
          dataUrl,
        });
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to process signature.");
        onSignatureGenerated(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [onSignatureGenerated]
  );

  // Confirm crop and execute background removal
  const handleConfirmCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const cropBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedBlob(cropBlob);
      setIsCropping(false);
      await runBackgroundRemoval(cropBlob, threshold);
    } catch (err: any) {
      setErrorMessage(err.message || "Cropping failed");
      setIsProcessing(false);
    }
  };

  // Debounced threshold slider change
  useEffect(() => {
    if (!croppedBlob || isCropping) return;

    const timer = setTimeout(() => {
      runBackgroundRemoval(croppedBlob, threshold);
    }, 280);

    return () => clearTimeout(timer);
  }, [threshold, croppedBlob, isCropping, runBackgroundRemoval]);

  const handleReset = () => {
    setImageSrc(null);
    setCroppedBlob(null);
    setIsCropping(false);
    setErrorMessage(null);
    onSignatureGenerated(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* ── STEP 1: INITIAL UPLOAD / CAPTURE ── */}
      {!imageSrc && (
        <div className="space-y-3">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 px-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500/50 bg-slate-50/60 dark:bg-zinc-900/60 hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-all cursor-pointer flex flex-col items-center justify-center text-center group shadow-xs"
          >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors shadow-2xs mb-2">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Upload photo of handwritten signature
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              PNG, JPG, or WEBP up to 2MB
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* User Guidance Tip Callout */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Best Quality Instructions:</span>
              <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed text-[11px]">
                Sign with a dark black or navy ink pen on plain white paper in good light, and fill most of the frame. Avoid light pencils or textured paper.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: TIGHT CROPPER (react-easy-crop) ── */}
      {imageSrc && isCropping && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Scissors size={14} className="text-blue-600" />
              Crop tightly around your signature
            </span>
            <span className="text-[11px] text-slate-400">Pinch or scroll to zoom</span>
          </div>

          <div className="relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden bg-black shadow-inner">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={3 / 1.5}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmCrop}
              disabled={isProcessing}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Crop & Clean Background</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: CLEAN-UP STRENGTH SLIDER & CONTROLS ── */}
      {croppedBlob && !isCropping && (
        <div className="space-y-4 pt-1">
          {/* Threshold Clean-up slider */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <label className="text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sliders size={13} className="text-blue-600" />
                <span>Clean-up Strength</span>
              </label>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {threshold}
              </span>
            </div>

            <input
              type="range"
              min="100"
              max="240"
              step="2"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Lighter (Gentle)</span>
              <span>Default (190)</span>
              <span>Darker (Crisp)</span>
            </div>
          </div>

          {/* Reset / Pick Another Photo Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1 shadow-2xs"
            >
              <RefreshCw size={12} />
              <span>Choose Another Photo</span>
            </button>

            {isProcessing && (
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <Loader2 size={12} className="animate-spin text-blue-600" />
                Updating preview...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Callout */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default UploadSignature;
