"use client";
import { UserType } from "@/app/(auth)/login/services/auth-store";
import { useEffect, useState, useRef } from "react";
import { School } from "lucide-react";

interface LoadingDashboardProps {
  userType?: UserType | null;
  message?: string;
  duration?: number;
}

export default function LoadingDashboard({
  userType = "PARENT",
  message = "Preparing your dashboard...",
  duration = 2000
}: LoadingDashboardProps) {
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const progressAnimationRef = useRef<number | null>(null);
  const stepAnimationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const loadingSteps = [
    { progress: 20, message: "Verifying your account..." },
    { progress: 45, message: "Loading your profile..." },
    { progress: 70, message: "Setting up dashboard..." },
    { progress: 90, message: "Almost ready..." },
    { progress: 100, message: "Welcome!" }
  ];

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    startTimeRef.current = Date.now();

    const animateProgress = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        progressAnimationRef.current = requestAnimationFrame(animateProgress);
      }
    };

    const animateSteps = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / duration) * 100, 100);

      const idx = loadingSteps.findIndex(step => pct <= step.progress);
      if (idx !== -1 && idx !== currentStep) {
        setCurrentStep(idx);
      }

      if (pct < 100) {
        stepAnimationRef.current = requestAnimationFrame(animateSteps);
      }
    };

    progressAnimationRef.current = requestAnimationFrame(animateProgress);
    stepAnimationRef.current = requestAnimationFrame(animateSteps);

    return () => {
      clearInterval(dotsInterval);
      if (progressAnimationRef.current) cancelAnimationFrame(progressAnimationRef.current);
      if (stepAnimationRef.current) cancelAnimationFrame(stepAnimationRef.current);
    };
  }, [duration]);

  const typeDisplay = {
    PARENT: "Parent",
    TEACHER: "Teacher",
    ADMIN: "Administrator",
    STUDENT: "Student"
  };

  const currentMessage = loadingSteps[currentStep]?.message || message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="flex flex-col items-center space-y-8">

        {/* ICON + SPINNER (Perfectly Centered) */}
        <div className="relative w-20 h-20 flex items-center justify-center">

          {/* iOS Spinner */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-4 bg-blue-600/40 dark:bg-blue-400/40 rounded-full animate-ios-fade"
                style={{
                  transform: `rotate(${i * 30}deg) translate(0, -14px)`,
                  animationDelay: `${-i * 0.083}s`
                }}
              />
            ))}
          </div>

          {/* ICON */}
          <School
            className="text-blue-600 dark:text-blue-400"
            size={36}
            strokeWidth={1.8}
          />
        </div>

        {/* TEXT */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Welcome, {typeDisplay[(userType ?? "PARENT") as keyof typeof typeDisplay]}!
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-300">
            {currentMessage}{dots}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-56 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* DOT STEPS */}
        <div className="flex space-x-1">
          {loadingSteps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i <= currentStep
                  ? "bg-blue-600 dark:bg-blue-400 scale-110"
                  : "bg-gray-300 dark:bg-gray-600"
                }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
