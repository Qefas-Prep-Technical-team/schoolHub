"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { useToast } from "@/lib/hooks/useToast";
import { adminService } from "@/lib/api/services/adminService";
import { useQueryClient } from "@tanstack/react-query";

interface InviteStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
}

export default function InviteStudentDialog({
  open,
  onOpenChange,
  student,
}: InviteStudentDialogProps) {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || "";
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || "#2563eb";
  const toast = useToast();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const handleSendInvite = async () => {
    if (!email || !email.includes("@")) {
      toast.error.show("Please enter a valid email address.");
      return;
    }

    setIsSending(true);
    try {
      const res = await adminService.inviteStudent(student.id, email);
      
      if (res.success) {
        toast.success.show(`Invitation sent successfully to ${email}`);
        queryClient.invalidateQueries({ queryKey: ["school-students-invitations"] });
        queryClient.invalidateQueries({ queryKey: ["school-students"] });
        onOpenChange(false);
        setEmail(""); // Reset
      } else {
        toast.error.show(res.message || "Failed to send invitation.");
      }
    } catch (error: any) {
      console.error("Failed to send invitation:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to send invitation.";
      toast.error.show(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border border-slate-100 dark:border-slate-800 p-0 overflow-hidden bg-white dark:bg-slate-900 shadow-xl">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Invite Student
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-500">
                Student
              </p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {student?.name}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                Real Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors"
                  size={18}
                />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter student's personal email..."
                  className="h-11 pl-11 pr-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 transition-all font-semibold text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 placeholder:font-medium"
                  style={{ "--tw-ring-color": `${primaryColor}30` } as any}
                />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                A verification link will be sent to this email. The student will use it to set their password and claim their account.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={isSending}
              style={{ backgroundColor: primaryColor }}
              className="flex-1 h-11 rounded-xl text-white font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 border-none"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
