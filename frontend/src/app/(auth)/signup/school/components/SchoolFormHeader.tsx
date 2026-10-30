'use client';

import React from 'react';
import { BLUE } from './SchoolFormFields';

interface SchoolFormHeaderProps {
  mode: 'register' | 'join';
  setMode: (mode: 'register' | 'join') => void;
  onSignInClick: () => void;
}

export default function SchoolFormHeader({
  mode,
  setMode,
  onSignInClick,
}: SchoolFormHeaderProps) {
  return (
    <>
      {/* ── Logo row ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: BLUE }}
          >
            <span className="material-symbols-outlined text-white text-[17px]">school</span>
          </div>
          <span className="text-[15px] font-semibold" style={{ color: BLUE }}>Qefas Hub</span>
        </div>
        <button
          type="button"
          onClick={onSignInClick}
          className="text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          Already have an account?{' '}
          <span className="font-semibold" style={{ color: BLUE }}>Sign in</span>
        </button>
      </div>

      {/* ── Mode Toggle ── */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition-all ${
            mode === 'register' 
              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Register New School
        </button>
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`flex-1 py-2 text-[14px] font-semibold rounded-lg transition-all ${
            mode === 'join' 
              ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          Join Existing School
        </button>
      </div>

      {/* ── Heading ── */}
      <div className="mb-6">
        <h1 className="text-[2rem] font-bold leading-[1.15] mb-2 text-slate-900 dark:text-white">
          {mode === 'register' ? (
            <>
              Register Your School<br />
              <span style={{ color: BLUE }}>on Qefas Hub</span>
            </>
          ) : (
            <>
              Join Your School<br />
              <span style={{ color: BLUE }}>as an Administrator</span>
            </>
          )}
        </h1>
        <p className="text-[14px] text-slate-400 dark:text-slate-500 leading-relaxed">
          {mode === 'register'
            ? 'Get full administrative access to student management, academics, and finances.'
            : 'Enter your school code to join your institution’s administrative team.'}
        </p>
      </div>
    </>
  );
}
