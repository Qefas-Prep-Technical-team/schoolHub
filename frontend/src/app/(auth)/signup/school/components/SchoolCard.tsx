'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import RedirectOverlay from '@/components/ui/RedirectOverlay';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSchoolRegistration, useAdminSelfRegistration } from '../../services/useRegistrationMutations';
import { SchoolFormData, AdminJoinFormData, schoolSchema, adminJoinSchema } from '../../services/regSchema';

import SchoolFormHeader from './SchoolFormHeader';
import SchoolRegisterForm from './SchoolRegisterForm';
import SchoolJoinForm from './SchoolJoinForm';
import SchoolVisualPanel from './SchoolVisualPanel';
import { SchoolPrivacyModal, SchoolTermsModal } from './SchoolModals';

const featureCards = [
  {
    icon: 'manage_accounts',
    title: 'Staff & Student Records',
    desc: 'Centralize admissions, enrollment, profiles, and attendance across all departments.',
  },
  {
    icon: 'payments',
    title: 'Billing & Fee Invoices',
    desc: 'Generate itemized fee schedules, automate dues, and receive secure online payments.',
  },
  {
    icon: 'analytics',
    title: 'Academic Analytics',
    desc: 'Track termly exam performances, report cards, and institutional KPIs effortlessly.',
  },
];

const trustBadges = [
  { label: '1 200+', sublabel: 'Schools', icon: 'domain' },
  { label: '99.9%', sublabel: 'Uptime', icon: 'verified' },
  { label: 'Zero', sublabel: 'Paper Waste', icon: 'eco' },
];

export default function SchoolCard() {
  const [mode, setMode] = useState<'register' | 'join'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  const { mutateAsync: registerSchool, isPending: isRegistering } = useSchoolRegistration();
  const { mutateAsync: joinSchool, isPending: isJoining } = useAdminSelfRegistration();
  const isPending = mode === 'register' ? isRegistering : isJoining;

  // --- REGISTER FORM ---
  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
    watch: watchRegister,
    setValue: setRegisterValue,
  } = useForm<SchoolFormData>({
    resolver: yupResolver(schoolSchema) as unknown as import('react-hook-form').Resolver<SchoolFormData>,
    mode: 'onBlur',
    defaultValues: {
      schoolName: '',
      adminName: '',
      email: '',
      password: '',
      confirmPassword: '',
      subdomain: '',
      acceptTerms: false,
    },
  });

  const schoolNameValue = watchRegister('schoolName');
  const subdomainValue = watchRegister('subdomain');
  const previousAutoSubdomainRef = useRef<string>('');

  /* Auto-generate and keep subdomain matched to schoolName */
  useEffect(() => {
    if (!schoolNameValue) {
      if (!subdomainValue || subdomainValue === previousAutoSubdomainRef.current) {
        setRegisterValue('subdomain', '', { shouldValidate: false });
        previousAutoSubdomainRef.current = '';
      }
      return;
    }

    const currentSub = (subdomainValue || '').trim();
    const isAutoOrEmpty = !currentSub || currentSub === previousAutoSubdomainRef.current;

    if (isAutoOrEmpty) {
      const suggested = schoolNameValue
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 63);

      setRegisterValue('subdomain', suggested, { shouldValidate: true, shouldDirty: false });
      previousAutoSubdomainRef.current = suggested;
    }
  }, [schoolNameValue, subdomainValue, setRegisterValue]);

  // --- JOIN FORM ---
  const {
    register: joinForm,
    handleSubmit: handleJoinSubmit,
    formState: { errors: joinErrors },
    reset: resetJoin,
  } = useForm<AdminJoinFormData>({
    resolver: yupResolver(adminJoinSchema) as unknown as import('react-hook-form').Resolver<AdminJoinFormData>,
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      schoolCode: '',
    },
  });

  /* Rotate feature card every 3 s */
  useEffect(() => {
    const id = setInterval(() => setActiveFeature(p => (p + 1) % featureCards.length), 3000);
    return () => clearInterval(id);
  }, []);

  const onRegisterSubmit = async (data: SchoolFormData) => {
    try {
      const backendData = {
        schoolName: data.schoolName.trim(),
        adminName: data.adminName.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
        ...(data.subdomain && { subdomain: data.subdomain.trim() }),
      };

      await registerSchool(backendData, {
        onSuccess: (response: any) => {
          const email = response.data.data?.school?.email || data.email;
          setShowOverlay(true);
          resetRegister();
          const redirectParam = searchParams.get('redirect');
          const redirectQuery = redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : '';
          setTimeout(() => {
            router.push(`/verification?email=${encodeURIComponent(email)}&userType=ADMIN&requestCode=true${redirectQuery}`);
          }, 2000);
        },
        onError: (error: any) => {
          console.error('❌ School registration failed:', error);
        },
      });
    } catch (error) {
      console.error('❌ Unexpected error:', error);
    }
  };

  const onJoinSubmit = async (data: AdminJoinFormData) => {
    try {
      const backendData = {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
        schoolCode: data.schoolCode.trim(),
      };

      await joinSchool(backendData, {
        onSuccess: () => {
          setShowOverlay(true);
          resetJoin();
          setTimeout(() => {
            router.push('/login/school-admin?message=pending_approval');
          }, 2000);
        },
        onError: (error: any) => {
          console.error('❌ Admin join failed:', error);
        },
      });
    } catch (error) {
      console.error('❌ Unexpected error:', error);
    }
  };

  return (
    <>
      <RedirectOverlay isVisible={showOverlay} />

      <div
        className="w-full flex flex-col lg:flex-row min-h-[780px] rounded-[32px] overflow-hidden shadow-2xl dark:shadow-none dark:ring-1 dark:ring-slate-800"
        style={{ fontFamily: "'Lexend', sans-serif" }}
      >
        {/* Left Form Panel */}
        <div className="flex-1 bg-white dark:bg-slate-900 flex flex-col px-10 py-10 lg:px-14 lg:py-12 overflow-y-auto transition-colors duration-300">
          <SchoolFormHeader
            mode={mode}
            setMode={setMode}
            onSignInClick={() => router.push('/login')}
          />

          {mode === 'register' ? (
            <SchoolRegisterForm
              registerForm={registerForm}
              registerErrors={registerErrors}
              watchRegister={watchRegister}
              isPending={isPending}
              onSubmit={handleRegisterSubmit(onRegisterSubmit)}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              onOpenTerms={() => setShowTermsModal(true)}
              onOpenPrivacy={() => setShowPrivacyModal(true)}
            />
          ) : (
            <SchoolJoinForm
              joinForm={joinForm}
              joinErrors={joinErrors}
              isPending={isPending}
              onSubmit={handleJoinSubmit(onJoinSubmit)}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />
          )}
        </div>

        {/* Right Visual Panel */}
        <SchoolVisualPanel
          featureCards={featureCards}
          trustBadges={trustBadges}
          activeFeature={activeFeature}
          onSelectFeature={setActiveFeature}
        />
      </div>

      <SchoolPrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <SchoolTermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </>
  );
}
