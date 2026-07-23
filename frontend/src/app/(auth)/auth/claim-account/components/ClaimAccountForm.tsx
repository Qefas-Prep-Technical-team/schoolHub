"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/hooks/useToast";
import { authAPI } from "@/app/(auth)/login/services/auth-api";
import { motion } from "framer-motion";

const claimSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ClaimFormValues = z.infer<typeof claimSchema>;

export default function ClaimAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  
  const token = searchParams.get("token");
  const type = searchParams.get("type");

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ClaimFormValues) => {
    if (!token || !type) {
      toast.error.show("Invalid claim link. Missing token or account type.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        token,
        type,
        password: data.password,
      };

      const res = await authAPI.claimAccount(payload);

      if (res.success) {
        setIsSuccess(true);
        toast.success.show("Account claimed successfully! You can now log in.");
        setTimeout(() => {
          const rolePath = type.toUpperCase() === 'ADMIN' || type.toUpperCase() === 'SCHOOL_ADMIN'
            ? 'school-admin'
            : type.toLowerCase();
          router.push(`/login/${rolePath}`);
        }, 3000);
      } else {
        toast.error.show(res.message || "Failed to claim account.");
      }
    } catch (error: any) {
      console.error("Account claim error:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to claim account.";
      toast.error.show(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !type) {
    return (
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl text-center">
        <p className="text-red-500 font-bold uppercase tracking-widest text-sm">
          Invalid link. Please check your email and try again.
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl text-center space-y-6"
      >
        <div className="mx-auto size-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            Account Claimed!
          </h2>
          <p className="text-slate-500 font-medium">
            Your password has been set. Redirecting you to the login page...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md p-8 sm:p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5"
    >
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
          Claim Account
        </h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
          Set up a new password to access your account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  New Password
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="h-14 pl-12 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 focus:ring-blue-500 transition-all font-medium"
                      placeholder="••••••••"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="h-14 pl-12 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 focus:ring-blue-500 transition-all font-medium"
                      placeholder="••••••••"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl hover:shadow-2xl transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                <span>Processing...</span>
              </div>
            ) : (
              "Claim Account"
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
