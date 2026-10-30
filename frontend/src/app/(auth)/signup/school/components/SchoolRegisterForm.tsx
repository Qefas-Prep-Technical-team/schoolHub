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
        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
          registerErrors.acceptTerms
            ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10'
            : isChecked
              ? 'border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
        }`}
      >
        <input
          type="checkbox"
          id="school-terms"
          {...registerForm('acceptTerms')}
          className="sr-only"
        />
        <div
          className="mt-0.5 w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200"
          style={{
            borderColor: isChecked ? BLUE : '#cbd5e1',
            background: isChecked ? BLUE : 'transparent',
          }}
        >
          {isChecked && (
            <span className="material-symbols-outlined text-white text-[13px] font-bold">
              check
            </span>
          )}
        </div>
        <span className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed select-none">
          I agree to the{' '}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenTerms(); }}
            className="font-semibold underline underline-offset-2 hover:opacity-80"
            style={{ color: BLUE }}
          >
            Terms of Service
          </button>{' '}
          and{' '}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenPrivacy(); }}
            className="font-semibold underline underline-offset-2 hover:opacity-80"
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
