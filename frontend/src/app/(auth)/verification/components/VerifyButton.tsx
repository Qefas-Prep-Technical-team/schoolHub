'use client';
import React from 'react';

interface Props {
  disabled?: boolean;
  label: string;
  onClick?: () => void;
}

export default function VerifyButton({ disabled = false, label, onClick }: Props) {
  return (
    <button
      className="group relative flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#1e40af] to-[#2563eb] dark:from-[#3b82f6] dark:to-[#6366f1] text-[15px] font-bold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={disabled}
      onClick={onClick}
    >
      <div className="absolute inset-0 w-full h-full bg-white/10 group-hover:bg-white/20 transition-colors duration-300"></div>
      <span className="relative z-10 truncate">{label}</span>
    </button>
  );
}
