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
      className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-wide transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:bg-primary/50"
      disabled={disabled}
      onClick={onClick}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}