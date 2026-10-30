'use client';

import React from 'react';
import { ROSE } from './StudentFormFields';

interface StudentAuthStatusProps {
  user: {
    name?: string;
    email?: string;
    userType?: string;
  };
  invitationCodes: {
    schoolCode?: string | null;
    classCode?: string | null;
    teacherCode?: string | null;
    parentCode?: string | null;
  };
  isLinking: boolean;
  onLink: () => void;
  onNavigateDashboard: (path: string) => void;
  onSignOut: () => void;
}

export default function StudentAuthStatus({
  user,
  invitationCodes,
  isLinking,
  onLink,
  onNavigateDashboard,
  onSignOut,
}: StudentAuthStatusProps) {
  const isStudent = user.userType === 'STUDENT';
  const hasInvites = Boolean(
    invitationCodes.schoolCode ||
    invitationCodes.classCode ||
    invitationCodes.teacherCode ||
    invitationCodes.parentCode
  );

  if (isStudent) {
    return (
      <div className="flex-1 flex flex-col justify-center py-4 space-y-6">
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-rose-600/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">backpack</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Signed In as Student
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {user.name || 'Student Account'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>

          {hasInvites ? (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/30 space-y-3">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Detected Invitations:</span>
              {invitationCodes.schoolCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">School Code:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{invitationCodes.schoolCode}</span>
                </div>
              )}
              {invitationCodes.classCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Class Code:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{invitationCodes.classCode}</span>
                </div>
              )}
              {invitationCodes.teacherCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Teacher Code:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{invitationCodes.teacherCode}</span>
                </div>
              )}
              {invitationCodes.parentCode && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Parent Code:</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{invitationCodes.parentCode}</span>
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Click below to send a connection request directly from your active student account.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              You are already signed into your Student account. You can join classes and link to your school directly from your dashboard.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {hasInvites ? (
            <button
              type="button"
              disabled={isLinking}
              onClick={onLink}
              className="w-full h-12 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
              style={{ background: ROSE }}
            >
              {isLinking ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending Connection Request...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">link</span>
                  <span>Connect &amp; Send Request</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateDashboard('/dashboard/student')}
              className="w-full h-12 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-[0.99]"
              style={{ background: ROSE }}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>Go to Student Dashboard</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSignOut}
            className="w-full h-11 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          >
            Sign in with a different account
          </button>
        </div>
      </div>
    );
  }

  /* Role Mismatch State */
  return (
    <div className="flex-1 flex flex-col justify-center py-4 space-y-6">
      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/20 shrink-0">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Different Role Signed In
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You are currently logged in as a <span className="font-bold text-amber-700 dark:text-amber-400 capitalize">{user.userType?.toLowerCase()}</span> ({user.email}).
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          To register or link as a Student, please sign out first or switch to a Student account.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => onNavigateDashboard(`/dashboard/${user.userType?.toLowerCase() || ''}`)}
          className="w-full h-12 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-[0.99]"
          style={{ background: ROSE }}
        >
          <span>Go to {user.userType} Dashboard</span>
        </button>

        <button
          type="button"
          onClick={onSignOut}
          className="w-full h-11 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
        >
          Sign out to Register as Student
        </button>
      </div>
    </div>
  );
}
