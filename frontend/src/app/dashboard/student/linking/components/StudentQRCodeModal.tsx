"use client";

import React from "react";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, UserPlus, ShieldCheck, Share2 } from "lucide-react";
import { toast } from "react-toastify";

interface StudentQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentCode: string;
  studentName?: string;
}

const StudentQRCodeModal: React.FC<StudentQRCodeModalProps> = ({ 
  isOpen, 
  onClose, 
  studentCode,
  studentName 
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "");
  
  const links = [
    {
      title: "Parent Account Linking",
      description: "Ask your parent or guardian to scan this code to link their portal with your academic records.",
      icon: <UserPlus className="w-5 h-5" />,
      url: `${baseUrl}/signup/parent?studentCode=${studentCode}`,
      color: "pink",
      label: "For Parents"
    },
    {
      title: "Student Verification",
      description: "Share your verified profile code directly with teachers, administrators, or school staff.",
      icon: <ShieldCheck className="w-5 h-5" />,
      url: `${baseUrl}/verify/student/${studentCode}`,
      color: "emerald",
      label: "Verification"
    }
  ];

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${title} link copied to clipboard`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-3xl overflow-hidden p-0 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-br from-pink-600 via-rose-600 to-indigo-700 p-6 sm:p-7 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <DialogHeader className="text-white relative z-10 text-left">
            <div className="flex items-center gap-2.5 mb-1.5">
               <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                 <Share2 className="w-5 h-5" />
               </div>
               <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                 Digital Passports
               </DialogTitle>
            </div>
            <DialogDescription className="text-pink-100 text-xs sm:text-sm font-medium">
              Share these QR codes to quickly link your account with parents or verify your student credentials.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 sm:p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {links.map((link) => (
              <div 
                key={link.title}
                className="flex flex-col items-center p-5 bg-slate-50 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 transition-all duration-200"
              >
                <div className="w-full flex justify-between items-center mb-4">
                  <div className={`p-2 rounded-xl ${
                    link.color === 'pink' 
                      ? 'bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400' 
                      : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  }`}>
                    {link.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-zinc-800">
                    {link.label}
                  </span>
                </div>
                
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1 text-center">
                  {link.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mb-5 line-clamp-2 min-h-[32px]">
                  {link.description}
                </p>
                
                <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800">
                  <QRCode
                    value={link.url}
                    size={140}
                    level="H"
                    className="max-w-full h-auto"
                  />
                </div>

                <Button
                  onClick={() => copyToClipboard(link.url, link.title)}
                  variant="outline"
                  className="mt-5 w-full flex items-center justify-center gap-2 font-bold h-10 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-850 border-slate-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Direct URL</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-900/40 p-4 sm:p-5 flex flex-col items-center gap-1.5 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Student Code:</span>
            <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded border border-pink-200 dark:border-pink-900/50">
              {studentCode || "---"}
            </span>
          </div>
          <p className="text-[9px] uppercase tracking-wider font-bold text-zinc-400">
            Powered by Qefas Hub Digital Passports
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentQRCodeModal;
