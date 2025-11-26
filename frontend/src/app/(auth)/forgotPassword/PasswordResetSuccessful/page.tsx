"use client"
import { useEffect } from "react";
import SuccessCard from "./components/SuccessCard";
import { useRouter } from "next/navigation";

export default function ResetSuccessPage() {
  const router  = useRouter()
  useEffect(() => {
     // Redirect to login after successful password reset
      setTimeout(() => {
        router.push("/login");
      }, 2000);
  }, [])
  
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
          <SuccessCard />
        </div>
      </div>
    </div>
  );
}
