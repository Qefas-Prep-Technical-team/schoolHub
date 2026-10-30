'use client';

import React, { useState } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { StudentFormData } from '../../services/regSchema';
import { ROSE, ROSE_DARK, Field, EyeBtn, inputCls } from './StudentFormFields';
import SocialAuthRow from '@/app/(auth)/login/components/SocialAuthRow';

interface StudentRegistrationFormProps {
  register: UseFormRegister<StudentFormData>;
  errors: FieldErrors<StudentFormData>;
  isPending: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
  invitationSummary?: string | null;
}

export default function StudentRegistrationForm({
  register,
  errors,
  isPending,
  onSubmit,
  onOpenTerms,
  onOpenPrivacy,
  invitationSummary,
}: StudentRegistrationFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  return (
    <>
      {invitationSummary && (
        <div className="p-3 mb-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300 font-medium">
          <span className="material-symbols-outlined text-[16px] text-rose-600">verified</span>
          <span>
            Invite detected: <strong>{invitationSummary}</strong>
          </span>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-4">
        {/* Row 1: Full Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" icon="person" error={errors.fullName?.message}>
            <input
              {...register('fullName')}
              placeholder="John Doe"
              disabled={isPending}
              className={inputCls(!!errors.fullName)}
            />
          </Field>
          <Field label="Email" icon="mail" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="you@student.edu"
              disabled={isPending}
              className={inputCls(!!errors.email)}
            />
          </Field>
        </div>

        {/* Row 2: Password + Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Password" icon="lock" error={errors.password?.message}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                disabled={isPending}
                className={`${inputCls(!!errors.password)} pr-11`}
              />
              <EyeBtn show={showPassword} toggle={() => setShowPassword(p => !p)} />
            </div>
          </Field>

          <Field label="Confirm Password" icon="lock_reset" error={errors.confirmPassword?.message}>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="••••••••"
                disabled={isPending}
                className={`${inputCls(!!errors.confirmPassword)} pr-11`}
              />
              <EyeBtn show={showConfirmPassword} toggle={() => setShowConfirmPassword(p => !p)} />
            </div>
          </Field>
        </div>

        {/* Optional Fields Accordion */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-2">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px]">settings</span>
              <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200">Optional Information</span>
            </div>
            <span className={`material-symbols-outlined text-slate-500 dark:text-slate-400 transition-transform duration-300 ${showOptional ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <div className={`transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 ${showOptional ? 'max-h-[500px] opacity-100 p-4 border-t border-slate-200 dark:border-slate-700' : 'max-h-0 opacity-0 pointer-events-none'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="School Code" icon="apartment" error={errors.schoolCode?.message}>
                <input
                  {...register('schoolCode')}
                  placeholder="sch-1234"
                  disabled={isPending}
                  className={inputCls(!!errors.schoolCode)}
                />
              </Field>

              <Field label="Class Code" icon="class" error={errors.classCode?.message}>
                <input
                  {...register('classCode')}
                  placeholder="cls-123456"
                  disabled={isPending}
                  className={inputCls(!!errors.classCode)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Field label="Teacher Code" icon="person_play" error={errors.teacherCode?.message}>
                <input
                  {...register('teacherCode')}
                  placeholder="tch-123456"
                  disabled={isPending}
                  className={inputCls(!!errors.teacherCode)}
                />
              </Field>
              <Field label="Parent Code" icon="family_restroom" error={errors.parentCode?.message}>
                <input
                  {...register('parentCode')}
                  placeholder="par-123456"
                  disabled={isPending}
                  className={inputCls(!!errors.parentCode)}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5 pt-2">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              id="student-terms"
              {...register('acceptTerms')}
              className="peer w-4 h-4 rounded appearance-none border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 transition-all cursor-pointer"
              style={{ accentColor: ROSE }}
            />
            <span
              className="absolute inset-0 rounded flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
              style={{ background: ROSE }}
            >
              <span className="material-symbols-outlined text-white text-[11px] font-bold">check</span>
            </span>
          </div>
          <label htmlFor="student-terms" className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer">
            I agree to the{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="font-semibold hover:underline underline-offset-2"
              style={{ color: ROSE }}
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="font-semibold hover:underline underline-offset-2"
              style={{ color: ROSE }}
            >
              Privacy Policy
            </button>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-red-500 text-xs -mt-3">{errors.acceptTerms.message}</p>
        )}

        {/* CTA button */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full rounded-xl text-white text-[15px] font-semibold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 relative overflow-hidden group"
          style={{ background: `linear-gradient(135deg, ${ROSE_DARK} 0%, ${ROSE} 100%)`, height: '52px' }}
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center gap-2">
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating your account…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">backpack</span>
                Create Student Account
              </>
            )}
          </span>
        </button>

        <SocialAuthRow userType="student" mode="signup" />

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-auto pt-2">
          <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500">mail</span>
          <span className="text-[12px] text-slate-400 dark:text-slate-500">help@qefashub.com</span>
        </div>
      </form>
    </>
  );
}
