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
import { copyToClipboard } from "@/lib/utils/clipboard";
import { Copy, User, GraduationCap, Users } from "lucide-react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolCode: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, schoolCode }) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "");
  
  const links = [
    {
      title: "Student Signup",
      role: "Student",
      icon: <GraduationCap className="w-5 h-5" />,
      url: `${baseUrl}/signup/student?schoolCode=${schoolCode}`,
      color: "blue",
    },
    {
      title: "Teacher Signup",
      role: "Teacher",
      icon: <User className="w-5 h-5" />,
      url: `${baseUrl}/signup/teacher?schoolCode=${schoolCode}`,
      color: "emerald",
    },
    {
      title: "Quick Link",
      role: "Join School",
      icon: <Users className="w-5 h-5" />,
      url: `${baseUrl}/join/school/${schoolCode}`,
      color: "blue",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="bg-gradient-to-br from-blue-600 to-primary p-8 text-white">
          <DialogHeader className="text-white">
            <DialogTitle className="text-3xl font-black tracking-tight">QR Access Hub</DialogTitle>
            <DialogDescription className="text-blue-100 text-lg opacity-90">
              Share these QR codes to quickly link students and teachers to your school.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {links.map((link) => (
              <div 
                key={link.role}
                className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/20 transition-all duration-300 group"
              >
                <div className={`p-3 rounded-full mb-4 ${
                  link.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {link.icon}
                </div>
                
                <h3 className="font-bold text-slate-900 dark:text-white mb-6 tracking-wide uppercase text-xs">
                  {link.title}
                </h3>
                
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow duration-300">
                  <QRCode
                    value={link.url}
                    size={160}
                    level="H"
                    className="max-w-full h-auto"
                  />
                </div>

                <Button
                  onClick={() => copyToClipboard(link.url, link.role)}
                  variant="ghost"
                  className="mt-6 w-full flex items-center justify-center gap-2 font-bold py-5 rounded-xl hover:bg-white dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 flex justify-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
            Powered by Qefas Hub Security System
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal;

