'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { AdminJoinFormData } from '../../services/regSchema';
import { Field, EyeBtn, inputCls, BLUE, BLUE_DARK } from './SchoolFormFields';

interface SchoolJoinFormProps {
  joinForm: UseFormRegister<AdminJoinFormData>;
  joinErrors: FieldErrors<AdminJoinFormData>;
  isPending: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SchoolJoinForm({
  joinForm,
  joinErrors,
  isPending,
  onSubmit,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}: SchoolJoinFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-4">
      {/* Full Name */}
      <Field label="Your Full Name" icon="person" error={joinErrors.name?.message}>
        <input
          {...joinForm('name')}
          placeholder="Yasir Noori"
          disabled={isPending}
          className={inputCls(!!joinErrors.name)}
        />
      </Field>

      {/* Email */}
      <Field label="Work Email" icon="mail" error={joinErrors.email?.message}>
        <input
          {...joinForm('email')}
          type="email"
          placeholder="you@school.edu"
          disabled={isPending}
          className={inputCls(!!joinErrors.email)}
        />
      </Field>

      {/* School Code */}
      <Field
        label="School Code"
        icon="tag"
        error={joinErrors.schoolCode?.message}
      >
        <input
          {...joinForm('schoolCode')}
          placeholder="SCH-ABC123"
          disabled={isPending}
          className={`${inputCls(!!joinErrors.schoolCode)} uppercase tracking-wider font-mono`}
        />
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
          Ask your head administrator or school owner for the school code.
        </p>
      </Field>

      {/* Row: Password + Confirm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Password" icon="lock" error={joinErrors.password?.message}>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...joinForm('password')}
              placeholder="••••••••"
              disabled={isPending}
              className={`${inputCls(!!joinErrors.password)} pr-11`}
            />
            <EyeBtn show={showPassword} toggle={() => setShowPassword(p => !p)} />
          </div>
        </Field>

        <Field label="Confirm Password" icon="lock_reset" error={joinErrors.confirmPassword?.message}>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...joinForm('confirmPassword')}
              placeholder="••••••••"
              disabled={isPending}
              className={`${inputCls(!!joinErrors.confirmPassword)} pr-11`}
            />
            <EyeBtn show={showConfirmPassword} toggle={() => setShowConfirmPassword(p => !p)} />
          </div>
        </Field>
      </div>

      {/* Join button */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 w-full rounded-xl text-white text-[15px] font-semibold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 relative overflow-hidden group shadow-lg shadow-blue-500/20"
        style={{ background: `linear-gradient(135deg, ${BLUE_DARK} 0%, ${BLUE} 100%)`, height: '52px' }}
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative flex items-center gap-2">
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting Request…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">group_add</span>
              Request to Join School
            </>
          )}
        </span>
      </button>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5 mt-auto pt-6">
        <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500">mail</span>
        <span className="text-[12px] text-slate-400 dark:text-slate-500">help@qefashub.com</span>
      </div>
    </form>
  );
}
