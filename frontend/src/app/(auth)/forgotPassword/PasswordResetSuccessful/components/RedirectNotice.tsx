"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function RedirectNotice() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    if (countdown === 1) router.push("/login");
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  const progress = (countdown / 5) * 100;

  return (
    <div className="flex w-full flex-col gap-2 p-2">
      <p className="text-center text-sm font-medium text-text-secondary dark:text-slate-400">
        Redirecting to login in {countdown} second{countdown !== 1 && "s"}...
      </p>
      <div className="w-full rounded-full bg-gray-200 dark:bg-slate-700">
        <motion.div
          className="h-2 rounded-full bg-primary"
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </div>
    </div>
  );
}
