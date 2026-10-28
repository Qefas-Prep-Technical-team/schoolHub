"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { Copy, User, GraduationCap, Users, Sparkles, QrCode, ShieldCheck, Check } from "lucide-react";
import QRCodePosterModal, {
  QRCodePosterVariant,
} from "@/components/reusable/QRCodePosterModal";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolCode: string;
  schoolName?: string;
  schoolLogo?: string | null;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  schoolCode,
  schoolName = "Qefas Hub",
  schoolLogo = null,
}) => {
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("student");
  const [copiedCode, setCopiedCode] = useState(false);

  const baseUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const links = [
    {
      id: "student",
      title: "Student Signup",
      role: "Student Signup",
      description: "Direct registration link for students to link into your school network.",
      icon: <GraduationCap className="w-4 h-4" />,
      url: `${baseUrl}/signup/student?schoolCode=${schoolCode}`,
      color: "blue",
      posterTitle: `Join ${schoolName} on Qefas Hub`,
      posterSubtitle:
        "Scan this code to create your student account and link directly to classrooms.",
      badge: "STUDENT ENROLLMENT",
    },
    {
      id: "teacher",
      title: "Teacher Signup",
      role: "Teacher Signup",
      description: "Invite educators and faculty members to register and manage classes.",
      icon: <User className="w-4 h-4" />,
      url: `${baseUrl}/signup/teacher?schoolCode=${schoolCode}`,
      color: "emerald",
      posterTitle: `Faculty Access - ${schoolName}`,
      posterSubtitle:
        "Scan this code to register as an educator and connect with your classes.",
      badge: "TEACHER ACCESS",
    },
    {
      id: "school",
      title: "Quick Link",
      role: "Quick School Link",
      description: "Allow registered students & teachers to instantly link to your school.",
      icon: <Users className="w-4 h-4" />,
      url: `${baseUrl}/join/school/${schoolCode}`,
      color: "indigo",
      posterTitle: `Connect to ${schoolName}`,
      posterSubtitle:
        "Scan this code to directly link your existing Qefas account with our school.",
      badge: "SCHOOL NETWORK",
    },
  ];

  const posterVariants: QRCodePosterVariant[] = links.map((l) => ({
    id: l.id,
    label: l.title,
    title: l.posterTitle,
    subtitle: l.posterSubtitle,
    qrValue: l.url,
    codeLabel: "SCHOOL CODE",
    codeValue: schoolCode,
    badge: l.badge,
  }));

  const handleOpenPoster = (variantId: string) => {
    setSelectedVariantId(variantId);
    setIsPosterModalOpen(true);
  };

  const handleCopySchoolCode = () => {
    copyToClipboard(schoolCode, "School Code");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[960px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl rounded-3xl p-0 overflow-hidden">
          {/* Top Admin Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 dark:from-slate-900 dark:via-indigo-950/70 dark:to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden border-b border-white/10 dark:border-slate-800">
            {/* Ambient Lighting Accent */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 dark:bg-indigo-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-white/15 dark:bg-indigo-900/50 backdrop-blur-md border border-white/20 dark:border-indigo-400/30 flex items-center justify-center text-white shadow-inner shrink-0">
                  <QrCode size={26} />
                </div>
                <div>
                  <DialogHeader className="text-left space-y-1">
                    <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                      QR Access Hub
                    </DialogTitle>
                    <DialogDescription className="text-blue-100/90 dark:text-slate-300 text-xs sm:text-sm font-medium">
                      Share these QR codes to quickly link students and teachers to <span className="font-bold text-white">{schoolName}</span>.
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </div>

              {/* School Code Badge with Quick Copy */}
              {schoolCode && (
                <div className="flex items-center gap-2 self-start md:self-center bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 dark:border-slate-700 px-3.5 py-1.5 rounded-2xl shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-wider text-blue-200 dark:text-slate-400">School Code</span>
                    <span className="font-mono font-bold text-white text-xs sm:text-sm tracking-wide">{schoolCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySchoolCode}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer ml-1"
                    title="Copy School Code"
                  >
                    {copiedCode ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col items-center p-5 sm:p-6 bg-slate-50/80 dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
                >
                  {/* Category Pill */}
                  <div
                    className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                      link.id === "student"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800/70"
                        : link.id === "teacher"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70"
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/70"
                    }`}
                  >
                    {link.icon}
                    <span>{link.title}</span>
                  </div>

                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center mb-4 line-clamp-2 min-h-[32px]">
                    {link.description}
                  </p>

                  {/* QR Code Container */}
                  <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200/90 dark:border-slate-700 group-hover:shadow-md transition-shadow duration-300">
                    <QRCode
                      value={link.url}
                      size={145}
                      level="H"
                      className="max-w-full h-auto"
                    />
                  </div>

                  {/* Action Buttons under QR */}
                  <div className="mt-5 w-full space-y-2">
                    <Button
                      type="button"
                      onClick={() => handleOpenPoster(link.id)}
                      className="w-full h-11 flex items-center justify-center gap-2 font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 dark:from-indigo-600 dark:via-blue-600 dark:to-indigo-500 dark:hover:from-indigo-500 dark:hover:via-blue-500 dark:hover:to-indigo-400 text-white shadow-md shadow-indigo-600/20 dark:shadow-[0_4px_16px_rgba(99,102,241,0.35)] ring-1 ring-white/15 dark:ring-indigo-400/25 transition-all active:scale-95 text-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Download / Preview Poster</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => copyToClipboard(link.url, link.role)}
                      variant="outline"
                      className="w-full h-10 flex items-center justify-center gap-2 font-bold rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-all active:scale-95 text-xs shadow-xs cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-slate-50/90 dark:bg-slate-900/90 px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Verified High-Resolution QR Access • Level H Redundancy</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Poster Generator Modal */}
      <QRCodePosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        institutionName={schoolName}
        schoolLogo={schoolLogo}
        title={links.find((l) => l.id === selectedVariantId)?.posterTitle || `Join ${schoolName}`}
        subtitle={links.find((l) => l.id === selectedVariantId)?.posterSubtitle}
        qrValue={links.find((l) => l.id === selectedVariantId)?.url || links[0].url}
        codeLabel="SCHOOL CODE"
        codeValue={schoolCode}
        variants={posterVariants}
        initialVariantId={selectedVariantId}
      />
    </>
  );
};

export default QRCodeModal;
