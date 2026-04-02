"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useCreateLinkRequest } from "@/lib/api/hooks/useLinks";
import { Loader2, School, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function JoinSchoolPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const { mutate: createLink, isPending, isSuccess, error } = useCreateLinkRequest();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      // Redirect to student signup by default if not logged in
      router.push(`/signup/student?schoolCode=${code}`);
      return;
    }

    if (isAuthenticated && user && !hasStarted) {
      if (!code) {
        console.error("JoinSchoolPage: Missing school code");
        return;
      }

      setHasStarted(true);
      console.log(`JoinSchoolPage: Initiating join request for school ${code}`);
      
      // Determine link type based on user role
      let linkType: any = "SCHOOL_STUDENT";
      if (user.userType === "TEACHER") linkType = "SCHOOL_TEACHER";
      
      createLink({
        targetCode: code,
        linkType,
        note: `Requested to join school via QR code`,
      }, {
        onSuccess: () => {
          console.log("JoinSchoolPage: Join request success");
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        },
        onError: (err) => {
          console.error("JoinSchoolPage: Join request failed", err);
        }
      });
    }
  }, [isInitialized, isAuthenticated, code, user, createLink, hasStarted, router]);

  if (!isInitialized || (isAuthenticated && isPending)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Joining School...</h1>
        <p className="text-slate-500 dark:text-gray-400">Please wait while we process your request.</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Request Sent!</h1>
        <p className="text-xl text-slate-600 dark:text-gray-300 max-w-md mb-8">
          Your request to join the school has been sent to the administrator. 
          You will be redirected to your dashboard shortly.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="rounded-xl h-12 px-8 font-bold">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Oops! Something went wrong</h1>
        <p className="text-xl text-slate-600 dark:text-gray-300 max-w-md mb-8">
          {(error as any)?.response?.data?.message || "Failed to join school. The code might be invalid or you might already be connected."}
        </p>
        <div className="flex gap-4">
          <Button onClick={() => router.push("/dashboard")} variant="outline" className="rounded-xl h-12 px-8 font-bold">
            Back to Dashboard
          </Button>
          <Button onClick={() => window.location.reload()} className="rounded-xl h-12 px-8 font-bold">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
