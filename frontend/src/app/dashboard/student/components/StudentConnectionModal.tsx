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
import { Copy, UserPlus, GraduationCap, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { motion } from "framer-motion";

interface StudentConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentCode: string;
}

export const StudentConnectionModal: React.FC<StudentConnectionModalProps> = ({
  isOpen,
  onClose,
  studentCode,
}) => {
  const baseUrl = "https://www.schoolhub.flexitistudio.com";
  const parentLink = `${baseUrl}/signup/parent?studentCode=${studentCode}`;
  const teacherLink = `${baseUrl}/signup/teacher?studentCode=${studentCode}`;

  const handleCopy = (link: string, type: string) => {
    copyToClipboard(link, `${type} link`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[2.5rem]">
        <div className="bg-primary/5 p-8 border-b border-primary/10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <UserPlus className="text-primary" size={32} />
              Connect with SchoolHub
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-lg mt-2">
              Invite your parents and teachers to join your academic journey.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Parent Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">For Parents</h3>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-6 group-hover:border-primary/30 transition-colors">
              <div className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
                <QRCode value={parentLink} size={160} />
              </div>
              <Button 
                onClick={() => handleCopy(parentLink, "Parent")}
                variant="outline" 
                className="w-full rounded-xl border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all gap-2"
              >
                <Copy size={16} />
                Copy Parent Link
              </Button>
            </div>
          </motion.div>

          {/* Teacher Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">For Teachers</h3>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-6 group-hover:border-primary/30 transition-colors">
              <div className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none">
                <QRCode value={teacherLink} size={160} />
              </div>
              <Button 
                onClick={() => handleCopy(teacherLink, "Teacher")}
                variant="outline" 
                className="w-full rounded-xl border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all gap-2"
              >
                <Copy size={16} />
                Copy Teacher Link
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-8 flex justify-center">
            <p className="text-xs font-bold text-slate-400 text-center uppercase tracking-widest">
                Student ID: <span className="text-primary">{studentCode}</span>
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
