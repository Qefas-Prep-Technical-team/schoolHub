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
      title: "Parent Linking",
      description: "Ask your parent to scan this to link their account to yours.",
      icon: <UserPlus className="w-5 h-5" />,
      url: `${baseUrl}/signup/parent?studentCode=${studentCode}`,
      color: "blue",
      label: "For Parents"
    },
    {
      title: "Identity Verification",
      description: "Quickly share your profile with teachers or school staff.",
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
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden p-0">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          
          <DialogHeader className="text-white relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                 <Share2 className="w-6 h-6" />
               </div>
               <DialogTitle className="text-3xl font-black tracking-tight">Access Hub</DialogTitle>
            </div>
            <DialogDescription className="text-indigo-100 text-lg opacity-90 font-medium">
              Share these QR codes to quickly link with parents or verify your identity.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {links.map((link) => (
              <div 
                key={link.title}
                className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/20 transition-all duration-300 group"
              >
                <div className="w-full flex justify-between items-center mb-6">
                  <div className={`p-2.5 rounded-2xl ${
                    link.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {link.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {link.label}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-center">
                  {link.title}
                </h3>
                <p className="text-xs text-slate-500 text-center mb-6 line-clamp-2 min-h-[32px]">
                  {link.description}
                </p>
                
                <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow duration-300">
                  <QRCode
                    value={link.url}
                    size={180}
                    level="H"
                    className="max-w-full h-auto"
                  />
                </div>

                <Button
                  onClick={() => copyToClipboard(link.url, link.title)}
                  variant="ghost"
                  className="mt-6 w-full flex items-center justify-center gap-2 font-bold py-6 rounded-2xl hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 flex flex-col items-center gap-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Student ID:</span>
            <span className="text-[10px] uppercase tracking-widest font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
              {studentCode}
            </span>
          </div>
          <p className="text-[8px] uppercase tracking-widest font-black text-slate-300">
            Powered by Qefas Hub Security
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentQRCodeModal;
