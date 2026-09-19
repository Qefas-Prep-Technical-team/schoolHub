/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Image from 'next/image';
import RedirectOverlay from '@/components/ui/RedirectOverlay';
import { useGlobalFeatures } from "@/lib/api/hooks/useGlobalFeatures";
import { useRouter, useSearchParams } from 'next/navigation';
import { useTeacherRegistration } from '../../services/useRegistrationMutations';
import { TeacherFormData, teacherSchema } from '../../services/regSchema';
import { UserRole } from '@/lib/types/user.types';
import { getPasswordStrength } from '../../services/passwordStrength';

/* ─── Design tokens — Teacher = Emerald ─── */
const EMERALD      = '#047857'; // emerald-700
const EMERALD_DARK = '#064e3b'; // emerald-900
const EMERALD_LITE = '#d1fae5'; // emerald-100
const EMERALD_MID  = '#10b981'; // emerald-500

const featureCards = [
  {
    icon: 'menu_book',
    title: 'Classroom Management',
    desc: 'Organize your classes, take attendance, and manage schedules effortlessly.',
  },
  {
    icon: 'assignment',
    title: 'Assignments & Grading',
    desc: 'Create assignments, track submissions, and grade student work efficiently.',
  },
  {
    icon: 'forum',
    title: 'Parent Communication',
    desc: 'Stay connected with parents and share updates on student progress.',
  },
];

const trustBadges = [
  { label: '50 000+', sublabel: 'Teachers', icon: 'person_play' },
  { label: '99%',     sublabel: 'Satisfaction', icon: 'thumb_up' },
  { label: 'Free',    sublabel: 'Basic Tools', icon: 'redeem' },
];

export default function TeacherCard() {
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOverlay,         setShowOverlay]         = useState(false);
  const [showPrivacyModal,    setShowPrivacyModal]    = useState(false);
  const [showTermsModal,      setShowTermsModal]      = useState(false);
  const [showOptional,        setShowOptional]        = useState(false);
  const [activeFeature,       setActiveFeature]       = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutate: registerTeacher, isPending } = useTeacherRegistration();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: globalFeatures } = useGlobalFeatures('teacher');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TeacherFormData>({
    resolver: yupResolver(teacherSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      schoolCode: searchParams.get('schoolCode') || '',
      classCode: searchParams.get('classCode') || '',
      isIndependent: false,
      acceptTerms: false
    },
  });

  /* Sync with search params if they change */
  useEffect(() => {
    if (searchParams.get('schoolCode')) setValue('schoolCode', searchParams.get('schoolCode') || '');
    if (searchParams.get('studentCode')) setValue('studentCode', searchParams.get('studentCode') || '');
    if (searchParams.get('classCode')) setValue('classCode', searchParams.get('classCode') || '');
  }, [searchParams, setValue]);

  /* Clear schoolCode when independent account is selected */
  const isIndependentValue = watch('isIndependent');
  useEffect(() => {
    if (isIndependentValue) {
      setValue('schoolCode', '');
    }
  }, [isIndependentValue, setValue]);

  /* Rotate feature card every 3 s */
  useEffect(() => {
    const id = setInterval(() => setActiveFeature(p => (p + 1) % featureCards.length), 3000);
    return () => clearInterval(id);
  }, []);

  const onSubmit = async (data: TeacherFormData) => {
    try {
      const backendData = {
        fullName: data.fullName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        isIndependent: data.isIndependent,
        acceptTerms: data.acceptTerms,
        ...(data.schoolCode && !data.isIndependent && { schoolCode: data.schoolCode.trim() }),
        ...(data.studentCode && { studentCode: data.studentCode.trim() }),
        ...(data.classCode && { classCode: data.classCode.trim() })
      };

      await registerTeacher(backendData, {
        onSuccess: (response: any) => {
          const email = response.data.data?.teacher?.email || data.email;
          setShowOverlay(true);
          reset();
          setTimeout(() => {
            router.push(
              `/verification?email=${encodeURIComponent(email)}&userType=${UserRole.TEACHER}&requestCode=true`
            );
          }, 2000);
        },
        onError: (error: any) => {
          console.error('❌ Teacher registration failed:', error);
        },
      });
    } catch (error) {
      console.error('❌ Unexpected error:', error);
    }
  };

  return (
    <>
      <RedirectOverlay isVisible={showOverlay} />

      {/* ═══════════ OUTER SHELL ═══════════ */}
      <div
        className="w-full flex flex-col lg:flex-row min-h-[780px] rounded-[32px] overflow-hidden shadow-2xl dark:shadow-none dark:ring-1 dark:ring-slate-800"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >

        {/* ════════════════════════════════════
            LEFT — FORM PANEL
        ════════════════════════════════════ */}
        <div className="flex-1 bg-white dark:bg-slate-900 flex flex-col px-10 py-10 lg:px-14 lg:py-12 overflow-y-auto transition-colors duration-300">

          {/* ── Logo row ── */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: EMERALD }}
              >
                <span className="material-symbols-outlined text-white text-[17px]">person_play</span>
              </div>
              <span className="text-[15px] font-semibold" style={{ color: EMERALD }}>Qefas Hub</span>
            </div>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-[13px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              Already have an account?{' '}
              <span className="font-semibold" style={{ color: EMERALD }}>Sign in</span>
            </button>
          </div>

          {/* ── Heading ── */}
          <div className="mb-8">

            <h1
              className="text-[2rem] font-bold leading-[1.15] mb-2 text-slate-900 dark:text-white"
            >
              Join Qefas Hub<br />
              <span style={{ color: EMERALD }}>as a Teacher</span>
            </h1>
            <p className="text-[14px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Manage your classroom efficiently and build a brighter future.
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-4">

            {/* Row 1: Full Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" icon="person" error={errors.fullName?.message}>
                <input
                  {...register('fullName')}
                  placeholder="Jane Doe"
                  disabled={isPending}
                  className={inputCls(!!errors.fullName)}
                />
              </Field>
              <Field label="Email" icon="mail" error={errors.email?.message}>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@school.edu"
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
                    <Field
                      label={<>School Code <span className="font-normal text-slate-400 dark:text-slate-500">(Ask admin)</span></>}
                      icon="apartment"
                      error={errors.schoolCode?.message}
                    >
                      <input
                        {...register('schoolCode')}
                        placeholder="sch-1234"
                        disabled={isPending || isIndependentValue}
                        className={inputCls(!!errors.schoolCode)}
                      />
                    </Field>

                    <Field
                      label={<>Class Code</>}
                      icon="class"
                      error={errors.classCode?.message}
                    >
                      <input
                        {...register('classCode')}
                        placeholder="cls-123456"
                        disabled={isPending}
                        className={inputCls(!!errors.classCode)}
                      />
                    </Field>
                </div>
                <div className="mt-4">
                  <Field
                    label={<>Student Code <span className="font-normal text-slate-400 dark:text-slate-500">(Link a student)</span></>}
                    icon="badge"
                    error={errors.studentCode?.message}
                  >
                    <input
                      {...register('studentCode')}
                      placeholder="stu-123456"
                      disabled={isPending}
                      className={inputCls(!!errors.studentCode)}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Independent Account Checkbox */}
            <div className="flex items-start gap-2.5 pt-2">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  id="independent-teacher-checkbox"
                  {...register('isIndependent')}
                  className="peer w-4 h-4 rounded appearance-none border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 transition-all cursor-pointer"
                  style={{ accentColor: EMERALD }}
                />
                <span
                  className="absolute inset-0 rounded flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                  style={{ background: EMERALD }}
                >
                  <span className="material-symbols-outlined text-white text-[11px] font-bold">check</span>
                </span>
              </div>
              <label htmlFor="independent-teacher-checkbox" className="text-[13px] text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                I want to create an independent teaching account
              </label>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2.5 pt-1">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  id="teacher-terms"
                  {...register('acceptTerms')}
                  className="peer w-4 h-4 rounded appearance-none border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 transition-all cursor-pointer"
                  style={{ accentColor: EMERALD }}
                />
                {/* Custom checkmark overlay */}
                <span
                  className="absolute inset-0 rounded flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                  style={{ background: EMERALD }}
                >
                  <span className="material-symbols-outlined text-white text-[11px] font-bold">check</span>
                </span>
              </div>
              <label htmlFor="teacher-terms" className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer">
                I agree to the{' '}
                <button type="button" onClick={() => setShowTermsModal(true)}
                  className="font-semibold hover:underline underline-offset-2"
                  style={{ color: EMERALD }}>
                  Terms of Service
                </button>
                {' '}and{' '}
                <button type="button" onClick={() => setShowPrivacyModal(true)}
                  className="font-semibold hover:underline underline-offset-2"
                  style={{ color: EMERALD }}>
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
              style={{ background: `linear-gradient(135deg, ${EMERALD_DARK} 0%, ${EMERALD} 100%)`, height: '52px' }}
            >
              {/* hover shimmer */}
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating your account…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">school</span>
                    Create Teacher Account
                  </>
                )}
              </span>
            </button>

            {/* Footer */}
            <div className="flex items-center justify-center gap-1.5 mt-auto pt-2">
              <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500">mail</span>
              <span className="text-[12px] text-slate-400 dark:text-slate-500">help@qefashub.com</span>
            </div>
          </form>
        </div>

        {/* ════════════════════════════════════
            RIGHT — VISUAL PANEL (emerald gradient)
        ════════════════════════════════════ */}
        <div
          className="hidden lg:flex flex-col w-[44%] shrink-0 relative overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${EMERALD_DARK} 0%, ${EMERALD} 60%, ${EMERALD_MID} 100%)` }}
        >
          {/* Ambient blobs */}
          <div
            className="absolute -top-32 -right-32 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: '#6ee7b7' }}
          />
          <div
            className="absolute bottom-0 -left-20 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: '#a7f3d0' }}
          />

          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between px-8 pt-8 pb-4">
            <div
              className="flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: 'white' }}
            >
              <span className="material-symbols-outlined text-[14px]">local_library</span>
              For Educators
            </div>
            <div className="text-white/60 text-[12px]">Join thousands of teachers</div>
          </div>

          {/* Hero image */}
          <div className="relative mx-6 rounded-2xl overflow-hidden flex-shrink-0" style={{ height: '320px' }}>
            <Image
              src="/images/teacher-login-3d.png"
              alt="Teacher managing classroom"
              fill
              className="object-cover"
              priority
            />
            {/* bottom gradient matching right panel */}
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to top, ${EMERALD_DARK} 0%, transparent 60%)` }}
            />
            {/* Floating status pill */}
            <div
              className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-full px-4 py-2.5 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-300" />
              <span className="text-white text-[13px] font-medium">Tools designed for you</span>
            </div>
          </div>

          {/* Feature rotating card */}
          <div className="relative z-10 mx-6 mt-5">
            <div
              className="rounded-2xl p-5 backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  <span className="material-symbols-outlined text-[20px] text-white">
                    {featureCards[activeFeature].icon}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold text-[15px] mb-1">
                    {featureCards[activeFeature].title}
                  </p>
                  <p className="text-white/60 text-[13px] leading-relaxed">
                    {featureCards[activeFeature].desc}
                  </p>
                </div>
              </div>
              {/* Dot indicators */}
              <div className="flex items-center gap-1.5 mt-4 justify-end">
                {featureCards.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveFeature(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width:  i === activeFeature ? '20px' : '6px',
                      height: '6px',
                      background: i === activeFeature ? '#6ee7b7' : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Trust stats */}
          <div className="relative z-10 grid grid-cols-3 gap-3 mx-6 mt-5 mb-8">
            {trustBadges.map(b => (
              <div
                key={b.label}
                className="rounded-xl p-3.5 text-center"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <span className="material-symbols-outlined text-[18px] mb-1.5 block text-emerald-300">
                  {b.icon}
                </span>
                <p className="text-white font-bold text-[17px] leading-none">{b.label}</p>
                <p className="text-white/50 text-[11px] mt-0.5">{b.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <TermsModal   isOpen={showTermsModal}   onClose={() => setShowTermsModal(false)} />
    </>
  );
}

/* ─────────────────────────────── helpers ─────────────────────────────── */

function inputCls(hasError: boolean) {
  return [
    'w-full h-11 px-4 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500',
    'bg-slate-50 dark:bg-slate-800 outline-none border transition-all',
    hasError
      ? 'border-red-400 dark:border-red-500 ring-1 ring-red-300 dark:ring-red-800'
      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50',
  ].join(' ');
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: React.ReactNode;
  icon: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[15px]">{icon}</span>
        {label}
      </label>
      {children}
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function EyeBtn({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button
      type="button"
      tabIndex={-1}
      onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">
        {show ? 'visibility_off' : 'visibility'}
      </span>
    </button>
  );
}

/* ─── Shared modal wrapper ─── */
function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-none dark:ring-1 dark:ring-slate-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon, title, onClose }: { icon: string; title: string; onClose: () => void }) {
  return (
    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]" style={{ color: EMERALD }}>{icon}</span>
        {title}
      </h3>
      <button
        onClick={onClose}
        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 dark:text-slate-400"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
  );
}

function ModalFooter({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
      <button
        onClick={onClose}
        className="w-full py-3 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
        style={{ background: `linear-gradient(135deg, ${EMERALD_DARK} 0%, ${EMERALD} 100%)` }}
      >
        {label}
      </button>
    </div>
  );
}

/* ─── Privacy Modal ─── */
const PrivacyModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <ModalShell onClose={onClose}>
      <ModalHeader icon="security" title="Privacy Policy" onClose={onClose} />
      <div className="p-6 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-slate-600 dark:text-slate-400 space-y-3">
        <p className="font-semibold text-slate-900 dark:text-white">Last Updated: May 9, 2026</p>
        <p>Your privacy is important to us. We collect minimal data required for school management, including your name, email, and institutional details.</p>
        <p>We do not sell your data to third parties. All data is encrypted and stored securely on our servers.</p>
        <p>We use your information to:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Provide and maintain our Service</li>
          <li>Notify you about changes to our Service</li>
          <li>Provide customer support</li>
          <li>Gather analysis to improve our Service</li>
        </ul>
        <p>By using Qefas Hub, you consent to our data collection practices as outlined in this policy.</p>
      </div>
      <ModalFooter label="I Understand" onClose={onClose} />
    </ModalShell>
  );
};

/* ─── Terms Modal ─── */
const TermsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <ModalShell onClose={onClose}>
      <ModalHeader icon="gavel" title="Terms of Service" onClose={onClose} />
      <div className="p-6 max-h-[60vh] overflow-y-auto text-sm leading-relaxed text-slate-600 dark:text-slate-400 space-y-3">
        <p className="font-semibold text-slate-900 dark:text-white">Last Updated: May 9, 2026</p>
        <p>By using Qefas Hub, you agree to provide accurate information and use the platform for educational management purposes only.</p>
        <p>Unauthorized use, data scraping, or any attempt to compromise the security of the platform is strictly prohibited.</p>
        <p>Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.</p>
        <p>We reserve the right to terminate accounts that violate these terms or engage in behavior harmful to other users or the platform.</p>
        <p>Qefas Hub is provided &ldquo;as is&rdquo; without any warranties of any kind, either express or implied.</p>
      </div>
      <ModalFooter label="Accept Terms" onClose={onClose} />
    </ModalShell>
  );
};
