'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import RedirectOverlay from '@/components/ui/RedirectOverlay';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStudentRegistration } from '../../services/useRegistrationMutations';
import { StudentFormData, studentSchema } from '../../services/regSchema';
import { UserRole } from '@/lib/types/user.types';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { linkService } from '@/lib/api/services/linkService';
import { classService } from '@/lib/api/services/classService';
import { toast } from 'react-toastify';

import StudentFormHeader from './StudentFormHeader';
import StudentRegistrationForm from './StudentRegistrationForm';
import StudentAuthStatus from './StudentAuthStatus';
import StudentVisualPanel from './StudentVisualPanel';
import { PrivacyModal, TermsModal } from './StudentModals';

const featureCards = [
  {
    icon: 'menu_book',
    title: 'Access Lessons',
    desc: 'View your daily lessons, timetable, and study materials anywhere.',
  },
  {
    icon: 'assignment',
    title: 'Submit Assignments',
    desc: 'Complete your homework and track your grades effortlessly.',
  },
  {
    icon: 'emoji_events',
    title: 'Track Progress',
    desc: 'Monitor your performance and earn achievements as you learn.',
  },
];

const trustBadges = [
  { label: '500 000+', sublabel: 'Students', icon: 'groups' },
  { label: '24/7', sublabel: 'Access', icon: 'bolt' },
  { label: '100%', sublabel: 'Free Tools', icon: 'redeem' },
];

export default function StudentCard() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isLinking, setIsLinking] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isInitialized, clearAuth } = useAuthStore();

  const schoolCode = searchParams.get('schoolCode');
  const classCode = searchParams.get('classCode');
  const teacherCode = searchParams.get('teacherCode');
  const parentCode = searchParams.get('parentCode');

  const invitationCodes = useMemo(
    () => ({ schoolCode, classCode, teacherCode, parentCode }),
    [schoolCode, classCode, teacherCode, parentCode]
  );

  const invitationSummary = useMemo(() => {
    const parts = [
      schoolCode ? `School (${schoolCode})` : null,
      classCode ? `Class (${classCode})` : null,
      teacherCode ? `Teacher (${teacherCode})` : null,
      parentCode ? `Parent (${parentCode})` : null,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : null;
  }, [schoolCode, classCode, teacherCode, parentCode]);

  const handleDirectStudentLink = async () => {
    if (!schoolCode && !classCode && !teacherCode && !parentCode) {
      router.push('/dashboard/student');
      return;
    }

    try {
      setIsLinking(true);
      const promises: Promise<unknown>[] = [];

      if (schoolCode) {
        promises.push(
          linkService.createLinkRequest({
            targetCode: schoolCode.trim(),
            linkType: 'SCHOOL_STUDENT',
            note: 'Student requested connection via direct school link',
          })
        );
      }
      if (classCode) {
        promises.push(
          classService.requestToJoinClass({
            classCode: classCode.trim(),
            note: 'Student requested to join class via direct invite link',
          })
        );
      }
      if (teacherCode) {
        promises.push(
          linkService.createLinkRequest({
            targetCode: teacherCode.trim(),
            linkType: 'TEACHER_STUDENT',
            note: 'Student requested connection with teacher via invite link',
          })
        );
      }
      if (parentCode) {
        promises.push(
          linkService.createLinkRequest({
            targetCode: parentCode.trim(),
            linkType: 'PARENT_STUDENT',
            note: 'Student requested connection with parent via invite link',
          })
        );
      }

      await Promise.all(promises);
      toast.success('Connection request submitted successfully! Redirecting to your dashboard...');
      setTimeout(() => {
        router.push('/dashboard/student');
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMsg || 'Failed to submit connection request. Please verify the code.');
    } finally {
      setIsLinking(false);
    }
  };

  const { mutate: registerStudent, isPending, isSuccess, data: regData } = useStudentRegistration();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<StudentFormData>({
    resolver: yupResolver(studentSchema) as unknown as import('react-hook-form').Resolver<StudentFormData>,
    mode: 'onBlur',
    defaultValues: useMemo(
      () => ({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        schoolCode: schoolCode || '',
        teacherCode: teacherCode || '',
        parentCode: parentCode || '',
        classCode: classCode || '',
        acceptTerms: false,
      }),
      [schoolCode, teacherCode, parentCode, classCode]
    ),
  });

  /* Sync with search params if they change */
  useEffect(() => {
    if (schoolCode) setValue('schoolCode', schoolCode);
    if (teacherCode) setValue('teacherCode', teacherCode);
    if (parentCode) setValue('parentCode', parentCode);
    if (classCode) setValue('classCode', classCode);
  }, [schoolCode, teacherCode, parentCode, classCode, setValue]);

  /* Rotate feature card every 3 s */
  useEffect(() => {
    const id = setInterval(() => setActiveFeature(p => (p + 1) % featureCards.length), 3000);
    return () => clearInterval(id);
  }, []);

  /* Handle successful registration */
  useEffect(() => {
    if (isSuccess && regData) {
      const email = regData.data?.data?.student?.email || watch('email');
      setShowOverlay(true);
      reset();
      const redirectParam = searchParams.get('redirect');
      const redirectQuery = redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : '';
      setTimeout(() => {
        router.push(
          `/verification?email=${encodeURIComponent(email)}&userType=${UserRole.STUDENT}&requestCode=true${redirectQuery}`
        );
      }, 2000);
    }
  }, [isSuccess, regData, router, reset, watch, searchParams]);

  const onSubmit = (data: StudentFormData) => {
    const backendData = {
      fullName: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      password: data.password,
      confirmPassword: data.confirmPassword,
      acceptTerms: data.acceptTerms,
      ...(data.schoolCode && { schoolCode: data.schoolCode.trim() }),
      ...(data.teacherCode && { teacherCode: data.teacherCode.trim() }),
      ...(data.parentCode && { parentCode: data.parentCode.trim() }),
      ...(data.classCode && { classCode: data.classCode.trim() }),
    };
    registerStudent(backendData);
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
          <StudentFormHeader onSignInClick={() => router.push('/login')} />

          {isInitialized && isAuthenticated && user ? (
            <StudentAuthStatus
              user={user}
              invitationCodes={invitationCodes}
              isLinking={isLinking}
              onLink={handleDirectStudentLink}
              onNavigateDashboard={(path) => router.push(path)}
              onSignOut={() => clearAuth()}
            />
          ) : (
            <StudentRegistrationForm
              register={register}
              errors={errors}
              isPending={isPending}
              onSubmit={handleSubmit(onSubmit)}
              onOpenTerms={() => setShowTermsModal(true)}
              onOpenPrivacy={() => setShowPrivacyModal(true)}
              invitationSummary={invitationSummary}
            />
          )}
        </div>

        {/* Right Visual Panel */}
        <StudentVisualPanel
          featureCards={featureCards}
          trustBadges={trustBadges}
          activeFeature={activeFeature}
          onSelectFeature={setActiveFeature}
        />
      </div>

      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </>
  );
}
