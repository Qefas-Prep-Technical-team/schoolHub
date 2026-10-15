"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertTriangle, Lock, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface DeactivateAccountSectionProps {
  userRole?: string;
}

export default function DeactivateAccountSection({ userRole }: DeactivateAccountSectionProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [reason, setReason] = useState("");

  const deactivateMutation = useMutation({
    mutationFn: async (payload: { password: string; reason?: string }) => {
      const response = await apiClient.post("/auth/account/deactivate", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Your account has been deactivated successfully.");
      setOpen(false);
      setPassword("");
      setReason("");

      // Clear local credentials
      Cookies.remove("token", { path: "/" });
      Cookies.remove("refreshToken", { path: "/" });
      clearAuth();

      // Redirect to login portal
      const rolePath = (userRole || user?.userType || "student").toLowerCase().replace("_", "-");
      router.replace(`/login/${rolePath}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to deactivate account. Please try again.";
      toast.error(msg);
    },
  });

  const handleDeactivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter your password to confirm deactivation.");
      return;
    }

    deactivateMutation.mutate({
      password: password.trim(),
      reason: reason || undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setPassword("");
      setReason("");
    }
  };

  return (
    <Card className="rounded-2xl border border-red-200/80 dark:border-red-950/40 shadow-sm bg-red-50/20 dark:bg-red-950/10 overflow-hidden">
      <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-red-100 dark:border-red-950/30">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle size={18} /> Danger Zone: Account Deactivation
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500 dark:text-zinc-400">
          Temporarily deactivate your account. Active sessions will be terminated and logged out immediately.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-950/40">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Deactivate This Account</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              Deactivation immediately revokes your active device sessions and disables your login. Your academic records remain securely archived in compliance with institutional policies.
            </p>
          </div>

          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="shrink-0 rounded-xl border-red-300 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold text-xs sm:text-sm px-5 h-10 cursor-pointer"
              >
                Deactivate Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-slate-950">
              <DialogHeader className="space-y-2 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-1">
                  <ShieldAlert size={24} />
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Confirm Account Deactivation
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 leading-relaxed">
                  To protect your account against unauthorized changes, please enter your password to confirm deactivation. This action is tracked and stored in platform audit logs.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleDeactivate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Reason for Deactivation <span className="text-slate-400 font-normal">(Optional)</span>
                  </Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                      <SelectItem value="taking_a_break" className="text-xs">Taking a temporary break</SelectItem>
                      <SelectItem value="transferring_school" className="text-xs">Transferring to another school</SelectItem>
                      <SelectItem value="privacy_concerns" className="text-xs">Privacy or security concerns</SelectItem>
                      <SelectItem value="account_reset" className="text-xs">Account maintenance or reset</SelectItem>
                      <SelectItem value="other" className="text-xs">Other reason</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Account Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="h-11 pr-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    If you created this account with Google, type <span className="font-mono font-bold text-red-500">DEACTIVATE</span> to verify.
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 p-3 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Lock size={12} /> Important Notes:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                    <li>All active sessions on this and other devices will be revoked immediately.</li>
                    <li>A confirmation receipt will be sent to your registered email.</li>
                    <li>This event will be logged in platform compliance records.</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="rounded-xl h-10 px-4 text-xs font-bold border-slate-200 dark:border-zinc-800"
                    disabled={deactivateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl h-10 px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20"
                    disabled={deactivateMutation.isPending || !password.trim()}
                  >
                    {deactivateMutation.isPending && <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />}
                    Confirm Deactivation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
