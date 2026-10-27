"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import SignaturePad from "signature_pad";
import { RotateCcw, Trash2, Check, PenTool } from "lucide-react";
import { trimTransparentPng } from "@/lib/signature/process";
import { cn } from "@/lib/utils";

interface DrawSignatureProps {
  onSignatureGenerated: (data: { blob: Blob; vectorData: any; dataUrl: string } | null) => void;
  className?: string;
}

const PEN_COLORS = [
  { label: "Black", value: "#111111", bg: "bg-[#111111]" },
  { label: "Navy", value: "#0f172a", bg: "bg-[#0f172a]" },
  { label: "Royal Blue", value: "#1d4ed8", bg: "bg-[#1d4ed8]" },
];

export const DrawSignature: React.FC<DrawSignatureProps> = ({
  onSignatureGenerated,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedColor, setSelectedColor] = useState<string>("#111111");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Function to resize canvas respecting devicePixelRatio without losing strokes
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const pad = padRef.current;
    const currentData = pad ? pad.toData() : null;

    const rect = container.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.scale(ratio, ratio);
    }

    if (pad) {
      pad.clear();
      if (currentData && currentData.length > 0) {
        pad.fromData(currentData);
      }
    }
  }, []);

  // Initialize SignaturePad
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePad(canvas, {
      backgroundColor: "rgba(0,0,0,0)", // Transparent background
      penColor: selectedColor,
      minWidth: 1.2,
      maxWidth: 3.2,
      velocityFilterWeight: 0.7,
    });

    padRef.current = pad;
    resizeCanvas();

    const handleEndStroke = async () => {
      if (pad.isEmpty()) {
        setHasDrawn(false);
        onSignatureGenerated(null);
        return;
      }

      setHasDrawn(true);
      const strokeData = pad.toData();
      setHistory((prev) => [...prev, strokeData]);

      try {
        const trimmedBlob = await trimTransparentPng(canvas, 14, 800);
        const dataUrl = URL.createObjectURL(trimmedBlob);
        onSignatureGenerated({
          blob: trimmedBlob,
          vectorData: strokeData,
          dataUrl,
        });
      } catch (err) {
        console.warn("Could not trim drawn signature:", err);
      }
    };

    pad.addEventListener("endStroke", handleEndStroke);

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      pad.removeEventListener("endStroke", handleEndStroke);
      window.removeEventListener("resize", handleResize);
      pad.off();
    };
  }, [resizeCanvas, selectedColor, onSignatureGenerated]);

  // Update pen color
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (padRef.current) {
      padRef.current.penColor = color;
    }
  };

  // Clear Canvas
  const handleClear = () => {
    if (padRef.current) {
      padRef.current.clear();
      setHasDrawn(false);
      setHistory([]);
      onSignatureGenerated(null);
    }
  };

  // Undo Last Stroke
  const handleUndo = async () => {
    const pad = padRef.current;
    const canvas = canvasRef.current;
    if (!pad || !canvas) return;

    const data = pad.toData();
    if (data.length > 0) {
      data.pop(); // Remove last stroke
      pad.fromData(data);

      if (data.length === 0) {
        setHasDrawn(false);
        setHistory([]);
        onSignatureGenerated(null);
      } else {
        try {
          const trimmedBlob = await trimTransparentPng(canvas, 14, 800);
          const dataUrl = URL.createObjectURL(trimmedBlob);
          onSignatureGenerated({
            blob: trimmedBlob,
            vectorData: data,
            dataUrl,
          });
        } catch {}
      }
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Canvas Container with baseline & 'X' guide */}
      <div
        ref={containerRef}
        className="relative w-full h-[220px] sm:h-[260px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/90 shadow-inner overflow-hidden cursor-crosshair select-none"
      >
        {/* Real Signature Baseline Guide */}
        <div className="absolute left-10 right-10 bottom-12 border-b-2 border-slate-200 dark:border-zinc-800 pointer-events-none" />

        {/* Real Signature 'X' Mark */}
        <div className="absolute left-6 bottom-9 text-slate-300 dark:text-zinc-700 font-serif text-lg font-bold select-none pointer-events-none">
          ✕
        </div>

        {/* Empty Canvas Callout */}
        {!hasDrawn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 pointer-events-none select-none">
            <PenTool size={22} className="mb-1 text-slate-300 dark:text-zinc-600" />
            <p className="text-xs font-semibold">Draw your signature with finger or mouse</p>
          </div>
        )}

        {/* Transparent Canvas with touch-action: none */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none"
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Control Bar: Pen Colors, Undo, Clear */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        {/* Pen Color Options */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mr-1">
            Pen Color:
          </span>
          {PEN_COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => handleColorChange(c.value)}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-transform flex items-center justify-center shadow-2xs",
                c.bg,
                selectedColor === c.value
                  ? "border-blue-500 scale-110 ring-2 ring-blue-500/20"
                  : "border-white dark:border-zinc-800 hover:scale-105"
              )}
              title={c.label}
            >
              {selectedColor === c.value && <Check size={12} className="text-white" />}
            </button>
          ))}
        </div>

        {/* Action Buttons: Undo & Clear */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={!hasDrawn}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shadow-2xs"
          >
            <RotateCcw size={13} />
            <span>Undo</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!hasDrawn}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 shadow-2xs"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawSignature;
