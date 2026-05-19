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
import { Copy, GraduationCap, Users } from "lucide-react";

interface ClassQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
}

const ClassQRCodeModal: React.FC<ClassQRCodeModalProps> = ({ isOpen, onClose, classData }) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "");
  
  const classCode = classData?.classCode || "";
  const schoolCode = classData?.school?.schoolCode || "";
  
  const joinUrl = `${baseUrl}/join/class/${classData?.id}`;
  const signupUrl = `${baseUrl}/signup/student?schoolCode=${schoolCode}&classCode=${classCode}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl overflow-hidden p-0">
        <div className="bg-gradient-to-br from-primary to-blue-700 p-8 text-white">
          <DialogHeader className="text-white">
            <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Users size={32} />
              Class Access
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-lg opacity-90">
              Invite students to join <strong>{classData?.name} {classData?.section || ""}</strong>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex flex-col items-center">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 mb-6">
              <QRCode
                value={joinUrl}
                size={200}
                level="H"
                className="max-w-full h-auto"
              />
            </div>
            
            <p className="text-center text-slate-500 dark:text-gray-400 text-sm font-medium max-w-[300px]">
              Scan this code to request to join this class. 
              Users will be prompted to login or signup.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => copyToClipboard(joinUrl, "Class Join link")}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 font-bold h-12 rounded-xl transition-all active:scale-95"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Join Link</span>
            </Button>
            
            <Button
              onClick={() => copyToClipboard(signupUrl, "Class Signup link")}
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-primary font-bold h-12 rounded-xl transition-all active:scale-95"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Copy Direct Signup Link</span>
            </Button>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 flex justify-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
            {classData?.name} • CODE: {classCode}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassQRCodeModal;
