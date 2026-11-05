"use client";

import React from "react";
import dynamic from "next/dynamic";
import { CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import SuccessLottie from "@/lotties/Success.json";
import { ClassItem } from "./types";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface ClassSelectionSuccessViewProps {
  requestedClass: ClassItem;
  schoolName: string;
  onDismiss: () => void;
}

export function ClassSelectionSuccessView({
  requestedClass,
  schoolName,
  onDismiss,
}: ClassSelectionSuccessViewProps) {
  return (
    <motion.div
      key="success-step"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-5 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 w-full min-w-0 overflow-hidden"
    >
      <div className="relative">
        <div className="w-28 h-28 sm:w-44 sm:h-44 flex items-center justify-center">
          <Lottie animationData={SuccessLottie} loop={true} className="w-full h-full" />
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 max-w-lg w-full min-w-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <CheckCircle2 size={13} />
          Request Sent Successfully
        </div>
        <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-words">
          Class Request Submitted!
        </h3>
        <p className="text-slate-600 dark:text-zinc-300 text-xs sm:text-base leading-relaxed break-words">
          A request to join{" "}
          <span className="font-bold text-pink-600 dark:text-pink-400">
            {requestedClass.name}
          </span>{" "}
          has been sent to{" "}
          <span className="font-bold text-slate-900 dark:text-white">
            {schoolName}
          </span>
          . Once the school administration accepts, you will be allowed in and can start
          accessing class subjects, timetables, and assessments.
        </p>
      </div>

      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 max-w-md w-full flex items-start gap-2.5 text-left min-w-0">
        <Clock className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={16} />
        <p className="text-[11px] sm:text-sm text-amber-800 dark:text-amber-300 break-words">
          <strong>What happens next?</strong> School administrators or class teachers receive
          your request instantly. When approved, your enrolled subjects and timetable will update
          automatically.
        </p>
      </div>

      <Button
        onClick={onDismiss}
        className="w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-600/20 cursor-pointer"
      >
        Go to Dashboard
      </Button>
    </motion.div>
  );
}

