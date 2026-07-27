'use client';
import React from 'react';
import { getRoleTheme } from '@/lib/theme/roleTheme';

interface Props {
  disabled?: boolean;
  label: string;
  userType?: string | null;
  onClick?: () => void;
}

export default function VerifyButton({ disabled = false, label, userType, onClick }: Props) {
  const roleTheme = getRoleTheme(userType);

  return (
    <button
      className={`group relative flex h-14 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r ${roleTheme.gradientHeader} text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl ${roleTheme.glowShadow} transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
      disabled={disabled}
      onClick={onClick}
    >
      <div className="absolute inset-0 w-full h-full bg-white/10 group-hover:bg-white/20 transition-colors duration-300"></div>
      <span className="relative z-10 truncate">{label}</span>
    </button>
  );
}
