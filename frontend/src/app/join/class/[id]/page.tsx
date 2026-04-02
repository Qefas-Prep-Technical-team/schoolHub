"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { usePreviewClassById, useRequestToJoinClass } from "@/lib/api/hooks/useClasses";
import { Loader2, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JoinClassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const { data: classData, isLoading: isClassLoading, error: classError } = usePreviewClassById(id);
  const { mutate: joinClass, isPending: isJoining, isSuccess, error: joinError } = useRequestToJoinClass();
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!isInitialized || isClassLoading || !classData) return;

    if (!isAuthenticated) {
      // Redirect to student signup with class and school codes
      const schoolCode = classData.school?.schoolCode || "";
      const classCode = classData.classCode || "";
      router.push(`/signup/student?schoolCode=${schoolCode}&classCode=${classCode}`);
      return;
    }

    if (isAuthenticated && user && !hasStarted) {
      if (!classData.classCode) {
        console.error("JoinClassPage: Missing classCode in classData", classData);
        return;
      }
      
      setHasStarted(true);
      console.log(`JoinClassPage: Initiating join request for class ${classData.classCode}`);
      
      joinClass({
        classCode: classData.classCode,
        note: `Requested to join class ${classData.name} via QR code`,
      }, {
        onSuccess: () => {
          console.log("JoinClassPage: Join request success");
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        },
        onError: (err) => {
          console.error("JoinClassPage: Join request failed", err);
        }
      });
    }
  }, [isInitialized, isAuthenticated, classData, isClassLoading, user, joinClass, hasStarted, router]);

  if (!isInitialized || isClassLoading || (isAuthenticated && isJoining)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          {isClassLoading ? "Fetching Class Details..." : "Joining Class..."}
        </h1>
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
          Your request to join <strong>{classData?.name}</strong> has been sent. 
          You will be redirected to your dashboard shortly.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="rounded-xl h-12 px-8 font-bold">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  if (classError || joinError) {
    const errorMsg = (joinError as any)?.response?.data?.message || 
                   (classError as any)?.response?.data?.message || 
                   "Failed to process join request. The class might not exist or you might already be enrolled.";
                   
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-4">Oops! Something went wrong</h1>
        <p className="text-xl text-slate-600 dark:text-gray-300 max-w-md mb-8">
          {errorMsg}
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
