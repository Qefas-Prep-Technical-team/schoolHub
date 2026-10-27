"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Type, Sparkles, Check } from "lucide-react";
import { trimTransparentPng } from "@/lib/signature/process";
import { cn } from "@/lib/utils";

interface TypeSignatureProps {
  initialName?: string;
  onSignatureGenerated: (data: { blob: Blob; dataUrl: string } | null) => void;
  className?: string;
}

const SCRIPT_FONTS = [
  { id: "caveat", name: "Caveat", family: "'Caveat', cursive, sans-serif" },
  { id: "dancing", name: "Dancing Script", family: "'Dancing Script', cursive, sans-serif" },
  { id: "pacifico", name: "Pacifico", family: "'Pacifico', cursive, sans-serif" },
  { id: "greatvibes", name: "Great Vibes", family: "'Great Vibes', cursive, serif" },
];

export const TypeSignature: React.FC<TypeSignatureProps> = ({
  initialName = "",
  onSignatureGenerated,
  className,
}) => {
  const [typedName, setTypedName] = useState(initialName);
  const [selectedFont, setSelectedFont] = useState(SCRIPT_FONTS[0].id);
  const [selectedColor, setSelectedColor] = useState("#111111");

  // Load Google Fonts link dynamically if not already present
  useEffect(() => {
    if (typeof document !== "undefined") {
      const fontLinkId = "schoolhub-signature-fonts";
      if (!document.getElementById(fontLinkId)) {
        const link = document.createElement("link");
        link.id = fontLinkId;
        link.rel = "stylesheet";
        link.href =
          "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Pacifico&display=swap";
        document.head.appendChild(link);
      }
    }
  }, []);

  const generateSignatureFromText = useCallback(
    async (text: string, fontId: string, color: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        onSignatureGenerated(null);
        return;
      }

      const fontObj = SCRIPT_FONTS.find((f) => f.id === fontId) || SCRIPT_FONTS[0];

      // Draw onto offscreen canvas
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = `bold 82px ${fontObj.family}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Slight natural tilt
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-0.02);
      ctx.fillText(trimmed, 0, 0);
      ctx.restore();

      try {
        const trimmedBlob = await trimTransparentPng(canvas, 14, 800);
        const dataUrl = URL.createObjectURL(trimmedBlob);
        onSignatureGenerated({
          blob: trimmedBlob,
          dataUrl,
        });
      } catch (err) {
        console.warn("Could not generate typed signature:", err);
        onSignatureGenerated(null);
      }
    },
    [onSignatureGenerated]
  );

  // Debounced generator
  useEffect(() => {
    const timer = setTimeout(() => {
      generateSignatureFromText(typedName, selectedFont, selectedColor);
    }, 200);

    return () => clearTimeout(timer);
  }, [typedName, selectedFont, selectedColor, generateSignatureFromText]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Name Input Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
          <Type size={13} className="text-blue-600" />
          <span>Type Full Name:</span>
        </label>
        <input
          type="text"
          value={typedName}
          onChange={(e) => setTypedName(e.target.value)}
          placeholder="e.g. Dr. Arthur Pendelton"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
        />
      </div>

      {/* Script Font Selection Grid */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
          Choose Calligraphy Style:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SCRIPT_FONTS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => setSelectedFont(font.id)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-20 shadow-2xs",
                selectedFont === font.id
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/10"
                  : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/60"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-black uppercase text-slate-400">
                  {font.name}
                </span>
                {selectedFont === font.id && (
                  <Check size={14} className="text-blue-600 shrink-0" />
                )}
              </div>
              <span
                className="text-2xl text-slate-900 dark:text-white truncate"
                style={{ fontFamily: font.family }}
              >
                {typedName.trim() || "Signature"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TypeSignature;
