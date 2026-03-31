// components/SuccessAlert.tsx
"use client";

interface SuccessAlertProps {
  message: string;
}

export default function SuccessAlert({ message }: SuccessAlertProps) {
  return (
    <div className="mt-6 p-4 text-sm text-green-600 bg-green-50 rounded-lg dark:bg-green-900/20 dark:text-green-400 animate-fadeIn">
      {message}
    </div>
  );
}