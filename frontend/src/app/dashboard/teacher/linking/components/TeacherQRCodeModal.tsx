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
import { toast } from "react-toastify";
import { Copy, GraduationCap, School, Users, QrCode } from "lucide-react";

interface TeacherQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkingCode: string;
  schoolCode?: string;
  isPersonal: boolean;
}

const TeacherQRCodeModal: React.FC<TeacherQRCodeModalProps> = ({ 
  isOpen, 
  onClose, 
  linkingCode, 
  schoolCode,
  isPersonal
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "");
  
  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} link copied to clipboard`);
  };

  const links = React.useMemo(() => {
    const allLinks = [
      {
        id: "personal",
        title: "Personal Classroom",
        subtitle: "Direct Student Connection",
        icon: <Users className="w-5 h-5" />,
        url: `${baseUrl}/signup/student?teacherCode=${linkingCode}`,
        color: "blue",
        active: true,
        type: 'personal'
      },
      {
        id: "onboarding",
        title: "Student Onboarding",
        subtitle: "Link with School",
        icon: <GraduationCap className="w-5 h-5" />,
        url: `${baseUrl}/signup/student?teacherCode=${linkingCode}${schoolCode ? `&schoolCode=${schoolCode}` : ''}`,
        color: "indigo",
        active: !!schoolCode,
        type: 'school'
      },
      {
        id: "school",
        title: "School Access",
        subtitle: "Join the school",
        icon: <School className="w-5 h-5" />,
        url: `${baseUrl}/join/school/${schoolCode || ''}`,
        color: "blue",
        active: !!schoolCode,
        type: 'school'
      },
      {
        id: "colleagues",
        title: "Invite Colleagues",
        subtitle: "For fellow teachers",
        icon: <Users className="w-5 h-5" />,
        url: `${baseUrl}/signup/teacher?schoolCode=${schoolCode || ''}`,
        color: "emerald",
        active: !!schoolCode,
        type: 'school'
      },
    ];

    return allLinks.filter(link => isPersonal ? link.type === 'personal' : link.type === 'school');
  }, [baseUrl, linkingCode, schoolCode, isPersonal]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] bg-white dark:bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden p-0 animate-fadeIn">
        <div className="bg-gradient-to-br from-primary to-indigo-700 p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <DialogHeader className="text-white relative z-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <QrCode size={32} />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black tracking-tight">QR Access Hub</DialogTitle>
                <DialogDescription className="text-blue-100 text-lg opacity-90 font-medium">
                  {isPersonal ? "Your personal classroom connection tools." : "Quickly onboard students and link with your school community."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className={`p-10 ${links.length === 1 ? 'flex justify-center' : ''}`}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(links.length, 4)} gap-8 w-full max-w-5xl`}>
            {links.map((link) => (
              <div 
                key={link.title}
                className={`flex flex-col items-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-transparent hover:border-primary/20 transition-all duration-300 group relative ${!link.active ? 'opacity-40 grayscale pointer-events-none' : ''}`}
              >
                {!link.active && (
                   <div className="absolute inset-x-0 bottom-4 flex justify-center">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">School Link Required</span>
                   </div>
                )}

                <div className={`p-4 rounded-2xl mb-4 shadow-sm ${
                  link.color === 'blue' ? 'bg-blue-100 text-blue-600' : 
                  link.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : 
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  {link.icon}
                </div>
                
                <h3 className="font-black text-slate-900 dark:text-white mb-1 tracking-tight">
                  {link.title}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
                  {link.subtitle}
                </p>
                
                <div className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                  <QRCode
                    value={link.url}
                    size={140}
                    level="H"
                    className="max-w-full h-auto"
                  />
                </div>

                <Button
                  onClick={() => copyToClipboard(link.url, link.title)}
                  variant="ghost"
                  className="mt-8 w-full flex items-center justify-center gap-2 font-black py-6 rounded-2xl bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-800 hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 flex justify-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            Teacher ID: {linkingCode}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherQRCodeModal;
