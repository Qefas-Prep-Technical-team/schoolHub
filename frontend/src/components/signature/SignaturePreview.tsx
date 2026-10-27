"use client";

import React, { useState } from "react";
import { Check, Eye, Grid, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePreviewProps {
  signatureUrl: string | null;
  signerName?: string;
  signerRole?: string;
  className?: string;
}

export const SignaturePreview: React.FC<SignaturePreviewProps> = ({
  signatureUrl,
  signerName = "Administrator",
  signerRole = "Authorized Signatory",
  className,
}) => {
  const [backgroundMode, setBackgroundMode] = useState<"paper" | "checkered">("paper");

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Eye size={13} className="text-blue-600" />
          <span>Live Document Preview</span>
        </label>

        {/* Background Toggle (White Paper vs Transparency Grid) */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setBackgroundMode("paper")}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold transition-all",
              backgroundMode === "paper"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            )}
          >
            Paper
          </button>
          <button
            type="button"
            onClick={() => setBackgroundMode("checkered")}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1",
              backgroundMode === "checkered"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            )}
            title="Verify transparent PNG background"
          >
            <Grid size={10} />
            <span>Transparent</span>
          </button>
        </div>
      </div>

      {/* Simulated Document Paper Card */}
      <div
        className={cn(
          "relative rounded-2xl border p-5 sm:p-6 transition-all shadow-sm overflow-hidden",
          backgroundMode === "paper"
            ? "bg-white dark:bg-slate-50 border-slate-200 text-slate-900"
            : "border-slate-300 dark:border-zinc-700 bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0] text-slate-900"
        )}
      >
        {/* Institutional Document Header Mock */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 mb-4 select-none">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-xs">
              Q
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              Official Certification Endorsement
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">SEAL-REF-2026</span>
        </div>

        {/* Signature Area */}
        <div className="py-2 flex flex-col items-center justify-center min-h-[110px]">
          {signatureUrl ? (
            <div className="relative group max-w-full">
              <img
                src={signatureUrl}
                alt="Signature preview"
                className="max-h-24 sm:max-h-28 w-auto object-contain transition-transform duration-300 drop-shadow-2xs"
              />
            </div>
          ) : (
            <div className="text-center py-4 text-slate-400 text-xs italic font-medium">
              Draw, upload, or type your signature to preview here
            </div>
          )}
        </div>

        {/* Signature Line & Metadata */}
        <div
          className={cn(
            "pt-3 flex items-end justify-between transition-all",
            signatureUrl
              ? ""
              : "border-t-2 border-dashed border-slate-400/60"
          )}
        >
          <div>
            <p className="text-xs font-black text-slate-900 tracking-tight leading-tight">
              {signerName}
            </p>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {signerRole}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 shadow-2xs">
            <ShieldCheck size={12} />
            <span>Verified Official</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePreview;
