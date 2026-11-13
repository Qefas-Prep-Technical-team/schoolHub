'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { SchoolFormData } from '../../services/regSchema';
import { Field, EyeBtn, inputCls, BLUE, BLUE_DARK } from './SchoolFormFields';
import SocialAuthRow from '@/app/(auth)/login/components/SocialAuthRow';

interface SchoolRegisterFormProps {
  registerForm: UseFormRegister<SchoolFormData>;
  registerErrors: FieldErrors<SchoolFormData>;
  watchRegister: UseFormWatch<SchoolFormData>;
  isPending: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export default function SchoolRegisterForm({
  registerForm,
  registerErrors,
  watchRegister,
  isPending,
  onSubmit,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onOpenTerms,
  onOpenPrivacy,
}: SchoolRegisterFormProps) {
  const isChecked = !!watchRegister('acceptTerms');

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-4">
      {/* Row 1: School Name + Admin Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="School Name" icon="apartment" error={registerErrors.schoolName?.message}>
          <input
            {...registerForm('schoolName')}
            placeholder="Green Valley High"
            disabled={isPending}
            className={inputCls(!!registerErrors.schoolName)}
          />
        </Field>
        <Field label="Your Name" icon="person" error={registerErrors.adminName?.message}>
          <input
            {...registerForm('adminName')}
            placeholder="Yasir Noori"
            disabled={isPending}
            className={inputCls(!!registerErrors.adminName)}
          />
        </Field>
      </div>

      {/* Email */}
      <Field label="Work Email" icon="mail" error={registerErrors.email?.message}>
        <input
          {...registerForm('email')}
          type="email"
          placeholder="you@school.edu"
          disabled={isPending}
          className={inputCls(!!registerErrors.email)}
        />
      </Field>

      {/* Row 2: Password + Confirm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Password" icon="lock" error={registerErrors.password?.message}>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...registerForm('password')}
              placeholder="••••••••"
              disabled={isPending}
              className={`${inputCls(!!registerErrors.password)} pr-11`}
            />
            <EyeBtn show={showPassword} toggle={() => setShowPassword(p => !p)} />
          </div>
        </Field>

        <Field label="Confirm Password" icon="lock_reset" error={registerErrors.confirmPassword?.message}>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...registerForm('confirmPassword')}
              placeholder="••••••••"
              disabled={isPending}
              className={`${inputCls(!!registerErrors.confirmPassword)} pr-11`}
            />
            <EyeBtn show={showConfirmPassword} toggle={() => setShowConfirmPassword(p => !p)} />
          </div>
        </Field>
      </div>

      {/* Subdomain — always visible */}
      <Field
        label={<>Subdomain <span className="font-normal text-slate-400 dark:text-slate-500">(auto-generated if empty)</span></>}
        icon="link"
        error={registerErrors.subdomain?.message}
      >
        <div className="flex rounded-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-blue-500/40 transition-all">
          <input
            {...registerForm('subdomain')}
            placeholder="your-school"
            disabled={isPending}
            className="flex-1 h-11 px-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-slate-50 dark:bg-slate-800 outline-none"
          />
          <div className="flex items-center px-3 bg-slate-100 dark:bg-slate-700 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap border-l border-slate-200 dark:border-slate-700">
            .qefashub.com
          </div>
        </div>
      </Field>

      {/* Terms — checkbox card */}
      <label
        htmlFor="school-terms"
        className={`group flex items-start gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 select-none shadow-sm ${
          registerErrors.acceptTerms
            ? 'border-red-300 dark:border-red-800 bg-red-50/40 dark:bg-red-950/20 ring-1 ring-red-400/30'
            : isChecked
              ? 'border-blue-500/60 dark:border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/25 shadow-blue-500/5'
              : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-blue-300 dark:hover:border-blue-700/60 hover:bg-blue-50/20 dark:hover:bg-blue-950/15'
        }`}
      >
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            id="school-terms"
            {...registerForm('acceptTerms')}
            className="peer sr-only"
          />
          <div
            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
              isChecked
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/30 scale-100'
                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 group-hover:border-blue-400 dark:group-hover:border-blue-600 scale-95 group-hover:scale-100'
            }`}
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              className={`w-3 h-3 transition-transform duration-200 ${
                isChecked ? 'scale-100 text-white' : 'scale-0 text-transparent'
              }`}
            >
              <path
                d="M2.5 6.2L5 8.7L9.5 3.5"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <span className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal pt-0.5">
          I agree to the{' '}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenTerms(); }}
            className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            style={{ color: BLUE }}
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenPrivacy(); }}
            className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            style={{ color: BLUE }}
          >
            Privacy Policy
          </button>
        </span>
      </label>
      {registerErrors.acceptTerms && (
        <p className="text-red-500 dark:text-red-400 text-xs -mt-2">{registerErrors.acceptTerms.message}</p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full rounded-xl text-white text-[15px] font-semibold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 relative overflow-hidden group shadow-lg shadow-blue-500/20"
        style={{ background: `linear-gradient(135deg, ${BLUE_DARK} 0%, ${BLUE} 100%)`, height: '52px' }}
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative flex items-center gap-2">
          {isPending ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Registering Institution…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">school</span>
              Register Institution
            </>
          )}
        </span>
      </button>

      {/* Social login row */}
      <SocialAuthRow userType="school" mode="signup" />

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5 mt-auto pt-2">
        <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500">mail</span>
        <span className="text-[12px] text-slate-400 dark:text-slate-500">help@qefashub.com</span>
      </div>
    </form>
  );
}
