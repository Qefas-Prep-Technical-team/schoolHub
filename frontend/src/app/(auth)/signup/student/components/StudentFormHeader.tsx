'use client';

import React from 'react';
import { ROSE } from './StudentFormFields';

interface StudentFormHeaderProps {
  onSignInClick: () => void;
}

export default function StudentFormHeader({ onSignInClick }: StudentFormHeaderProps) {
  return (
    <>
      {/* ── Logo row ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: ROSE }}
          >
            <span className="material-symbols-outlined text-white text-[17px]">backpack</span>
          </div>
          <span className="text-[15px] font-semibold" style={{ color: ROSE }}>Qefas Hub</span>
        </div>
        <button
          type="button"
          onClick={onSignInClick}
          className="text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          Already have an account?{' '}
          <span className="font-semibold" style={{ color: ROSE }}>Sign in</span>
        </button>
      </div>

      {/* ── Heading ── */}
      <div className="mb-8">
        <h1 className="text-[2rem] font-bold leading-[1.15] mb-2 text-slate-900 dark:text-white">
          Join Qefas Hub<br />
          <span style={{ color: ROSE }}>as a Student</span>
        </h1>
        <p className="text-[14px] text-slate-400 dark:text-slate-500 leading-relaxed">
          Access your lessons, assignments, and teachers all in one place.
        </p>
      </div>
    </>
  );
}
