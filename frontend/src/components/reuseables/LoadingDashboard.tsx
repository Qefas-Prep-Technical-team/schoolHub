// components/reuseables/LoadingDashboard.tsx
"use client"
import { UserType } from "@/app/(auth)/login/services/auth-store";
import { useEffect, useState, useRef } from "react";

interface LoadingDashboardProps {
  userType?: UserType | null;
  message?: string;
  duration?: number; // Total loading duration in milliseconds
}

export default function LoadingDashboard({
  userType = "PARENT",
  message = "Preparing your dashboard...",
  duration = 2000 // Match your 2-second timeout
}: LoadingDashboardProps) {
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Separate refs for progress animation
  const progressAnimationRef = useRef<number>();
  const stepAnimationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const loadingSteps = [
    { progress: 20, message: "Verifying your account..." },
    { progress: 45, message: "Loading your profile..." },
    { progress: 70, message: "Setting up dashboard..." },
    { progress: 90, message: "Almost ready..." },
    { progress: 100, message: "Welcome!" }
  ];

  useEffect(() => {
    // Dots animation
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    // Initialize progress animation
    startTimeRef.current = Date.now();

    // Progress animation - completely separate from step updates
    const updateProgress = () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);

      setProgress(newProgress);

      if (newProgress < 100) {
        progressAnimationRef.current = requestAnimationFrame(updateProgress);
      }
    };

    // Step animation - runs independently
    const updateSteps = () => {
      if (!startTimeRef.current) return;

      const elapsed = Date.now() - startTimeRef.current;
      const currentProgress = Math.min((elapsed / duration) * 100, 100);

      const currentStepIndex = loadingSteps.findIndex(step => currentProgress <= step.progress);
      if (currentStepIndex !== -1 && currentStepIndex !== currentStep) {
        setCurrentStep(currentStepIndex);
      }

      if (currentProgress < 100) {
        stepAnimationRef.current = requestAnimationFrame(updateSteps);
      }
    };

    // Start both animations
    progressAnimationRef.current = requestAnimationFrame(updateProgress);
    stepAnimationRef.current = requestAnimationFrame(updateSteps);

    return () => {
      clearInterval(dotsInterval);
      if (progressAnimationRef.current) {
        cancelAnimationFrame(progressAnimationRef.current);
      }
      if (stepAnimationRef.current) {
        cancelAnimationFrame(stepAnimationRef.current);
      }
    };
  }, [duration]); // Only depend on duration

  const getUserTypeDisplay = (type: string) => {
    const types = {
      PARENT: "Parent",
      TEACHER: "Teacher",
      ADMIN: "Administrator",
      STUDENT: "Student"
    };
    return types[type as keyof typeof types] || type;
  };

  const currentMessage = loadingSteps[currentStep]?.message || message;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Logo/App Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">
              school
            </span>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="relative mb-6">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {getUserTypeDisplay(userType)}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {currentMessage}{dots}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Real-time Progress Bar */}
        <div className="mt-6 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-75 ease-linear"
            style={{
              width: `${progress}%`
            }}
          />
        </div>

        {/* Progress Percentage */}
        <div className="mt-3 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span className="font-medium">{Math.round(progress)}%</span>
          <span>100%</span>
        </div>

        {/* Loading Steps Indicator */}
        <div className="mt-4 flex justify-center space-x-1">
          {loadingSteps.map((step, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index <= currentStep
                  ? 'bg-primary scale-125'
                  : 'bg-gray-300 dark:bg-gray-600'
                }`}
            />
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <span className="font-semibold">Tip:</span> You can access all your courses,
            assignments, and progress from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}