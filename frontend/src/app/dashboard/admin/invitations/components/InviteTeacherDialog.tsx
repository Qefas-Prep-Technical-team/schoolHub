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

interface InviteTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: any;
}

export default function InviteTeacherDialog({
  open,
  onOpenChange,
  teacher,
}: InviteTeacherDialogProps) {
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
      const res = await adminService.resendTeacherClaimEmail(teacher.id, email);
      
      if (res.success) {
        toast.success.show(`Invitation sent successfully to ${email}`);
        queryClient.invalidateQueries({ queryKey: ["school-teachers-invitations"] });
        queryClient.invalidateQueries({ queryKey: ["teachers"] });
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
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border border-slate-100 dark:border-white/10 p-0 overflow-hidden bg-white dark:bg-slate-950">
        <div className="p-8 pb-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
              Invite Teacher
            </DialogTitle>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Teacher
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white uppercase">
                {teacher?.name}
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
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
                  placeholder="Enter teacher's personal email..."
                  className="h-14 pl-12 pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl focus:ring-2 transition-all font-bold text-slate-700 dark:text-slate-200"
                  style={{ "--tw-ring-color": `${primaryColor}50` } as any}
                />
              </div>
              <p className="text-xs text-slate-500">
                A verification link will be sent to this email. The teacher will use it to set their password and claim their account.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5">
          <div className="flex w-full gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 rounded-2xl border-2 border-slate-200 dark:border-white/10 font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvite}
              disabled={isSending}
              style={{ backgroundColor: primaryColor }}
              className="flex-1 h-14 rounded-2xl text-white font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
