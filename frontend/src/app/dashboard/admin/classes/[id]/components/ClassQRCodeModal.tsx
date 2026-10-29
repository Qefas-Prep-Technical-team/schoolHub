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
import { Copy, GraduationCap, Users, Sparkles, Check, ShieldCheck } from "lucide-react";
import QRCodePosterModal, {
  QRCodePosterVariant,
} from "@/components/reusable/QRCodePosterModal";

interface ClassQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  classData: any;
}

const ClassQRCodeModal: React.FC<ClassQRCodeModalProps> = ({
  isOpen,
  onClose,
  classData,
}) => {
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("join");
  const [copiedCode, setCopiedCode] = useState(false);

  const baseUrl = (
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  ).replace(/\/+$/, "");

  const classCode = classData?.classCode || "";
  const schoolCode = classData?.school?.schoolCode || "";
  const className = classData?.name || "Class";
  const classSection = classData?.section ? ` (${classData.section})` : "";
  const fullClassName = `${className}${classSection}`;
  const schoolName = classData?.school?.name || "Qefas Hub";
  const schoolLogo = classData?.school?.logo || null;

  const joinUrl = `${baseUrl}/join/class/${classData?.id}`;
  const signupUrl = `${baseUrl}/signup/student?schoolCode=${schoolCode}&classCode=${classCode}`;

  const posterVariants: QRCodePosterVariant[] = [
    {
      id: "join",
      label: "Class Join Code",
      title: `Join ${fullClassName}`,
      subtitle:
        "Scan this code to request to join the class. Log in or sign up if prompted.",
      qrValue: joinUrl,
      codeLabel: "CLASS CODE",
      codeValue: classCode,
      badge: "CLASSROOM ACCESS",
    },
    {
      id: "signup",
      label: "Direct Student Signup",
      title: `Enroll in ${fullClassName}`,
      subtitle:
        "Scan this code to create your student account and directly enroll in this class.",
      qrValue: signupUrl,
      codeLabel: "CLASS CODE",
      codeValue: classCode,
      badge: "STUDENT ENROLLMENT",
    },
  ];

  const handleCopyClassCode = () => {
    copyToClipboard(classCode, "Class Code");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[540px] max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl rounded-3xl p-0 overflow-hidden">
          {/* Top Admin Header */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 dark:from-slate-900 dark:via-indigo-950/70 dark:to-slate-900 p-6 sm:p-7 text-white relative overflow-hidden border-b border-white/10 dark:border-slate-800">
            {/* Ambient Lighting Accent */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 dark:bg-indigo-500/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-white/15 dark:bg-indigo-900/50 backdrop-blur-md border border-white/20 dark:border-indigo-400/30 flex items-center justify-center text-white shadow-inner shrink-0">
                  <Users size={24} />
                </div>
                <div>
                  <DialogHeader className="text-left space-y-0.5">
                    <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      Class Access
                    </DialogTitle>
                    <DialogDescription className="text-blue-100/90 dark:text-slate-300 text-xs sm:text-sm font-medium">
                      Invite students to join <span className="font-bold text-white">{fullClassName}</span>
                    </DialogDescription>
                  </DialogHeader>
                </div>
              </div>

              {/* Class Code Badge with Quick Copy */}
              {classCode && (
                <div className="flex items-center gap-1.5 bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-white/20 dark:border-slate-700 px-3 py-1.5 rounded-2xl shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-wider text-blue-200 dark:text-slate-400">Code</span>
                    <span className="font-mono font-bold text-white text-xs tracking-wide">{classCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyClassCode}
                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer ml-1"
                    title="Copy Class Code"
                  >
                    {copiedCode ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {/* Centered QR Card */}
            <div className="flex flex-col items-center p-6 bg-slate-50/80 dark:bg-slate-800/60 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
              <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/90 dark:border-slate-700 mb-3">
                <QRCode
                  value={joinUrl}
                  size={175}
                  level="H"
                  className="max-w-full h-auto"
                />
              </div>

              <p className="text-center text-slate-500 dark:text-slate-400 text-xs font-medium max-w-[340px] leading-relaxed">
                Scan with any smartphone camera to request admission into <strong className="text-slate-800 dark:text-slate-200">{fullClassName}</strong>.
              </p>
            </div>

            {/* Poster Generator Button */}
            <Button
              type="button"
              onClick={() => {
                setSelectedVariantId("join");
                setIsPosterModalOpen(true);
              }}
              className="w-full h-11 flex items-center justify-center gap-2 font-bold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 dark:from-indigo-600 dark:via-blue-600 dark:to-indigo-500 dark:hover:from-indigo-500 dark:hover:via-blue-500 dark:hover:to-indigo-400 text-white shadow-md shadow-indigo-600/20 dark:shadow-[0_4px_16px_rgba(99,102,241,0.35)] ring-1 ring-white/15 dark:ring-indigo-400/25 transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Download / Preview Poster</span>
            </Button>

            {/* Quick Copy Link Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <Button
                type="button"
                onClick={() => copyToClipboard(joinUrl, "Class Join link")}
                variant="outline"
                className="w-full h-10 flex items-center justify-center gap-2 font-bold rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-all active:scale-95 text-xs cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Join Link</span>
              </Button>

              <Button
                type="button"
                onClick={() => copyToClipboard(signupUrl, "Class Signup link")}
                variant="outline"
                className="w-full h-10 flex items-center justify-center gap-2 font-bold rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 transition-all active:scale-95 text-xs cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Copy Direct Signup</span>
              </Button>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-slate-50/90 dark:bg-slate-900/90 px-6 py-4 flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Level H Redundancy • Class ID: {classCode || "ACTIVE"}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-8 px-3 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Poster Modal */}
      <QRCodePosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
        institutionName={schoolName}
        schoolLogo={schoolLogo}
        title={`Join ${fullClassName}`}
        subtitle="Scan this code to request to join the class. Log in or sign up if prompted."
        qrValue={joinUrl}
        codeLabel="CLASS CODE"
        codeValue={classCode}
        variants={posterVariants}
        initialVariantId={selectedVariantId}
      />
    </>
  );
};

export default ClassQRCodeModal;
