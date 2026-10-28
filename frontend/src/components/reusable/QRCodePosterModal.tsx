/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import saveAs from "file-saver";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  Printer,
  Sparkles,
  Layers,
  Palette,
  Check,
  Smartphone,
  School,
  GraduationCap,
  Copy,
  Loader2,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { copyToClipboard } from "@/lib/utils/clipboard";

export type PosterThemeId = "cyber-navy" | "emerald-prestige" | "sunset-violet" | "clean-minimal";

export interface QRCodePosterVariant {
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  qrValue: string;
  codeLabel?: string;
  codeValue?: string;
  badge?: string;
}

export interface QRCodePosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Main details
  institutionName?: string;
  schoolLogo?: string | null;
  title: string;
  subtitle?: string;
  qrValue: string;
  codeLabel?: string;
  codeValue?: string;
  badgeText?: string;
  // Multiple QR type variations (e.g. Student Signup, Teacher Signup, Quick Link)
  variants?: QRCodePosterVariant[];
  initialVariantId?: string;
}

interface ThemeConfig {
  id: PosterThemeId;
  name: string;
  dotColor: string;
  containerBg: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  headingColor: string;
  bodyColor: string;
  cardBorder: string;
  cardShadow: string;
  badgeBg: string;
  badgeText: string;
  cornerBorder: string;
  isLight: boolean;
}

const THEMES: ThemeConfig[] = [
  {
    id: "cyber-navy",
    name: "Cyber Navy",
    dotColor: "#06B6D4",
    containerBg: "from-[#080D1A] via-[#0E1726] to-[#060A14]",
    accentText: "text-cyan-400",
    accentBg: "bg-cyan-500/10",
    accentBorder: "border-cyan-500/30",
    headingColor: "text-white",
    bodyColor: "text-slate-300",
    cardBorder: "border-cyan-500/30",
    cardShadow: "shadow-[0_0_50px_-10px_rgba(6,182,212,0.25)]",
    badgeBg: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white",
    badgeText: "text-cyan-300",
    cornerBorder: "border-cyan-400/40",
    isLight: false,
  },
  {
    id: "emerald-prestige",
    name: "Emerald Prestige",
    dotColor: "#10B981",
    containerBg: "from-[#02231A] via-[#063C2D] to-[#021A13]",
    accentText: "text-amber-300",
    accentBg: "bg-amber-400/10",
    accentBorder: "border-amber-400/30",
    headingColor: "text-white",
    bodyColor: "text-emerald-100",
    cardBorder: "border-amber-400/30",
    cardShadow: "shadow-[0_0_50px_-10px_rgba(245,158,11,0.25)]",
    badgeBg: "bg-gradient-to-r from-emerald-600 to-teal-500 text-white",
    badgeText: "text-amber-300",
    cornerBorder: "border-amber-400/40",
    isLight: false,
  },
  {
    id: "sunset-violet",
    name: "Sunset Violet",
    dotColor: "#F43F5E",
    containerBg: "from-[#170624] via-[#2A0845] to-[#12031D]",
    accentText: "text-rose-400",
    accentBg: "bg-rose-500/10",
    accentBorder: "border-rose-500/30",
    headingColor: "text-white",
    bodyColor: "text-pink-100",
    cardBorder: "border-rose-500/30",
    cardShadow: "shadow-[0_0_50px_-10px_rgba(244,63,94,0.25)]",
    badgeBg: "bg-gradient-to-r from-purple-600 to-rose-500 text-white",
    badgeText: "text-rose-300",
    cornerBorder: "border-rose-400/40",
    isLight: false,
  },
  {
    id: "clean-minimal",
    name: "Clean Minimal (White)",
    dotColor: "#2563EB",
    containerBg: "from-slate-50 via-white to-slate-100",
    accentText: "text-blue-600",
    accentBg: "bg-blue-50/80",
    accentBorder: "border-blue-200",
    headingColor: "text-slate-900",
    bodyColor: "text-slate-700",
    cardBorder: "border-blue-300/80",
    cardShadow: "shadow-2xl shadow-blue-500/10",
    badgeBg: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
    badgeText: "text-blue-600",
    cornerBorder: "border-blue-300",
    isLight: true,
  },
];

export const QRCodePosterModal: React.FC<QRCodePosterModalProps> = ({
  isOpen,
  onClose,
  institutionName = "Qefas Hub",
  schoolLogo = null,
  title: initialTitle,
  subtitle: initialSubtitle,
  qrValue: initialQrValue,
  codeLabel: initialCodeLabel = "CODE",
  codeValue: initialCodeValue = "",
  badgeText: initialBadgeText = "OFFICIAL INVITATION",
  variants = [],
  initialVariantId,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<PosterThemeId>("cyber-navy");
  const [activeVariantId, setActiveVariantId] = useState<string>(
    initialVariantId || (variants.length > 0 ? variants[0].id : "")
  );
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const posterRef = useRef<HTMLDivElement>(null);

  // Active theme configuration
  const theme = THEMES.find((t) => t.id === selectedThemeId) || THEMES[0];

  // Resolve current active variant or fallback to direct props
  const activeVariant = variants.find((v) => v.id === activeVariantId);
  const currentTitle = activeVariant?.title || initialTitle;
  const currentSubtitle =
    activeVariant?.subtitle ||
    initialSubtitle ||
    "Scan this code to request access. Log in or sign up if prompted.";
  const currentQrValue = activeVariant?.qrValue || initialQrValue;
  const currentCodeLabel = activeVariant?.codeLabel || initialCodeLabel;
  const currentCodeValue = activeVariant?.codeValue || initialCodeValue;
  const currentBadgeText = activeVariant?.badge || initialBadgeText;

  // Handle Download Poster as PNG
  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      setIsExporting(true);
      // Wait for rendering & images to settle
      await new Promise((resolve) => setTimeout(resolve, 200));

      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2.5,
        quality: 0.98,
        skipFonts: true, // Prevents SecurityError on remote Google Fonts stylesheets
      });

      const cleanFileName = (currentTitle || "poster")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");

      saveAs(dataUrl, `qefas-poster-${cleanFileName}.png`);
      toast.success("Promotional poster downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate poster image:", error);
      toast.error("Failed to download poster. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Direct Clean Print
  const handlePrint = async () => {
    if (!posterRef.current) return;
    try {
      setIsPrinting(true);
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        quality: 0.95,
        skipFonts: true, // Prevents SecurityError on remote Google Fonts stylesheets
      });

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.warning("Pop-up blocked. Please allow pop-ups to print the poster.");
        setIsPrinting(false);
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${currentTitle} - Qefas Hub Poster</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background-color: #000;
              }
              img {
                max-width: 90vw;
                max-height: 95vh;
                object-fit: contain;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                border-radius: 16px;
              }
              @media print {
                body {
                  background-color: transparent;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.focus(); window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Print generation error:", err);
      toast.error("Unable to prepare print version.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1040px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl p-0 shadow-2xl">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-md">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Sparkles size={16} />
              </span>
              <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                QR Code Promotional Poster
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Generate a high-resolution, print-ready educational poster for social media and on-campus displays.
            </DialogDescription>
          </DialogHeader>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={isPrinting || isExporting}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-bold gap-2 h-9 px-3.5 transition-all active:scale-95 cursor-pointer"
            >
              {isPrinting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
              <span>Print Poster</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleDownload}
              disabled={isExporting || isPrinting}
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold gap-2 h-9 px-4 shadow-lg shadow-indigo-600/20 dark:shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all active:scale-95 cursor-pointer"
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              <span>Download PNG</span>
            </Button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (Left / Top) */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
            {/* 1. QR Code / Type Selector (if variants are provided) */}
            {variants.length > 1 && (
              <div className="space-y-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Layers size={14} className="text-blue-500 dark:text-blue-400" />
                  Select QR Code Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {variants.map((v) => {
                    const isSelected = activeVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setActiveVariantId(v.id)}
                        className={`w-full p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-blue-50/90 dark:bg-blue-600/20 border-blue-600 dark:border-blue-500 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div
                            className={`text-xs font-bold ${
                              isSelected
                                ? "text-blue-900 dark:text-white"
                                : "text-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {v.label}
                          </div>
                          <div
                            className={`text-[11px] truncate ${
                              isSelected
                                ? "text-blue-700/80 dark:text-blue-300/80 font-medium"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {v.title}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shrink-0">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Theme / Variation Chooser */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Palette size={14} className="text-indigo-500 dark:text-indigo-400" />
                Choose Poster Theme
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {THEMES.map((t) => {
                  const isThemeSelected = selectedThemeId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedThemeId(t.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        isThemeSelected
                          ? "bg-white dark:bg-slate-800/80 border-blue-600 dark:border-cyan-500 ring-2 ring-blue-500/20 dark:ring-cyan-500/20 text-slate-900 dark:text-white shadow-sm"
                          : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 dark:border-white/20 shrink-0 shadow-xs"
                        style={{ backgroundColor: t.dotColor }}
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold truncate text-slate-900 dark:text-slate-200">
                          {t.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {t.isLight ? "Print-friendly" : "Digital modern"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Poster Details Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Poster Information
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                  <span className="text-slate-500 dark:text-slate-400">Institution:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 truncate ml-2">
                    {institutionName}
                  </span>
                </div>

                {currentCodeValue && (
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <span className="text-slate-500 dark:text-slate-400">{currentCodeLabel}:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                      {currentCodeValue}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Target Join URL:</span>
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 truncate flex-1">
                      {currentQrValue}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentQrValue, "Join link")}
                      className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Tips / Instructions */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-500/5 border border-blue-200/80 dark:border-blue-500/10 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              <p className="font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                <Smartphone size={13} />
                Guaranteed Scannable
              </p>
              This poster generates a vector QR code with high-error tolerance (Level H) and optimal
              margins, ensuring rapid scans from smartphones even from distance or in low lighting.
            </div>
          </div>

          {/* Live Poster Preview (Right / Center) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center order-1 lg:order-2">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <span>Live Preview</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                4 : 5 Aspect Ratio
              </span>
            </div>

            {/* Poster Card Container */}
            <div className="relative max-w-full overflow-hidden p-1.5 rounded-[32px] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div
                ref={posterRef}
                className={`relative w-full max-w-[420px] aspect-[4/5] rounded-[26px] overflow-hidden bg-gradient-to-b ${theme.containerBg} p-7 flex flex-col justify-between select-none ${theme.cardShadow} transition-all duration-300`}
                style={{ minHeight: "525px" }}
              >
                {/* Subtle Geometric Background Decorative Accents */}
                <div
                  className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-25 pointer-events-none"
                  style={{ backgroundColor: theme.dotColor }}
                />
                <div
                  className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: theme.dotColor }}
                />

                {/* Corner Geometric Lines */}
                <div className={`absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg pointer-events-none ${theme.cornerBorder}`} />
                <div className={`absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg pointer-events-none ${theme.cornerBorder}`} />
                <div className={`absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg pointer-events-none ${theme.cornerBorder}`} />
                <div className={`absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 rounded-br-lg pointer-events-none ${theme.cornerBorder}`} />

                {/* Section 1: Header Brand & Institution */}
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    {/* Brand Pill */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                        <GraduationCap size={18} strokeWidth={2.5} />
                      </div>
                      <div className="leading-tight">
                        <div
                          className={`text-[12px] font-black tracking-widest uppercase ${
                            theme.isLight ? "text-slate-900" : "text-white"
                          }`}
                        >
                          QEFAS <span className={theme.accentText}>HUB</span>
                        </div>
                        <div
                          className={`text-[8px] font-bold tracking-wider uppercase ${
                            theme.isLight ? "text-slate-500" : "text-slate-300 opacity-60"
                          }`}
                        >
                          Education Network
                        </div>
                      </div>
                    </div>

                    {/* Official Invitation Badge */}
                    <div
                      className={`text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm ${theme.badgeBg}`}
                    >
                      {currentBadgeText}
                    </div>
                  </div>

                  {/* School / Institution Name Banner */}
                  <div className="flex items-center gap-2 pt-1">
                    {schoolLogo ? (
                      <img
                        src={schoolLogo}
                        alt="Logo"
                        crossOrigin="anonymous"
                        className="w-6 h-6 rounded-md object-contain bg-white/20 p-0.5 shrink-0"
                      />
                    ) : (
                      <School size={16} className={theme.accentText} />
                    )}
                    <span
                      className={`text-xs font-bold tracking-wide uppercase truncate ${
                        theme.isLight ? "text-slate-700" : "text-slate-300"
                      }`}
                    >
                      {institutionName}
                    </span>
                  </div>

                  {/* Dynamic Title */}
                  <div className="pt-0.5">
                    <h2
                      className={`text-2xl font-black tracking-tight leading-tight ${theme.headingColor}`}
                    >
                      {currentTitle}
                    </h2>
                    <p
                      className={`text-[11px] font-medium leading-snug mt-1 ${theme.bodyColor}`}
                    >
                      {currentSubtitle}
                    </p>
                  </div>
                </div>

                {/* Section 2: Centered QR Code Card */}
                <div className="relative z-10 flex flex-col items-center justify-center my-3">
                  <div
                    className={`bg-white p-4 sm:p-5 rounded-3xl shadow-xl border-2 ${theme.cardBorder} flex flex-col items-center justify-center group relative`}
                  >
                    {/* The Exact Scannable QR Code */}
                    <QRCode
                      value={currentQrValue}
                      size={180}
                      level="H"
                      className="max-w-full h-auto"
                    />

                    {/* Code Badge beneath QR code */}
                    {currentCodeValue && (
                      <div className="mt-3 px-3.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                        <span className={`${theme.isLight ? "text-blue-400" : "text-cyan-400"} font-bold`}>
                          {currentCodeLabel}:
                        </span>
                        <span>{currentCodeValue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Educational Highlights & Instructions */}
                <div className="relative z-10 space-y-3">
                  {/* Feature Highlights Pills */}
                  <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-center flex-wrap">
                    <div
                      className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${theme.accentBg} ${theme.accentBorder} border`}
                    >
                      <BookOpen size={11} className={theme.accentText} />
                      <span className={theme.headingColor}>Online Classes</span>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${theme.accentBg} ${theme.accentBorder} border`}
                    >
                      <ShieldCheck size={11} className={theme.accentText} />
                      <span className={theme.headingColor}>Direct School Access</span>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${theme.accentBg} ${theme.accentBorder} border`}
                    >
                      <Sparkles size={11} className={theme.accentText} />
                      <span className={theme.headingColor}>Instant Sync</span>
                    </div>
                  </div>

                  {/* Footer Security / URL watermark */}
                  <div
                    className={`pt-2 border-t flex items-center justify-between text-[8px] font-bold tracking-wider uppercase ${
                      theme.isLight
                        ? "border-slate-300 text-slate-500"
                        : "border-white/10 text-slate-400"
                    }`}
                  >
                    <span>Scan with any camera app</span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={10} className={theme.accentText} />
                      Verified Institutional Link
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodePosterModal;
