"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, CheckCircle2, ChevronRight, Mail, Shield, UploadCloud, Settings, Sparkles, Users, CreditCard, MessageSquare, GraduationCap, LayoutDashboard, Calendar, Layers, BookOpen, FileSpreadsheet, Maximize2, X, Info, FileText, Clock, QrCode, ClipboardList, FileCheck2, BarChart3, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import CheerAnimation from './_components/CheerAnimation';
import { useAuthStore } from '../login/services/auth-store';
import Lottie from "lottie-react";
import Success from "../../../lotties/Success.json";

const THEME_MAP = {
  ADMIN: {
    gradientSidebar: 'from-slate-900 via-blue-950 to-black',
    gradientBlob: 'from-blue-600/10 to-indigo-600/10',
    gradientText: 'from-blue-400 to-indigo-300',
    glowClass: 'bg-blue-500/20 border-blue-400/30 shadow-blue-500/20',
    borderColor: 'border-blue-500',
    primaryText: 'text-blue-500',
    primaryBg: 'bg-blue-500',
    primaryHover: 'hover:bg-blue-600',
    primaryBgSubtle: 'bg-blue-50 dark:bg-blue-500/10',
    primaryTextSubtle: 'text-blue-600 dark:text-blue-400',
    iconColor: 'text-blue-500',
    buttonColor: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  TEACHER: {
    gradientSidebar: 'from-slate-900 via-emerald-950 to-black',
    gradientBlob: 'from-emerald-600/10 to-teal-600/10',
    gradientText: 'from-emerald-400 to-teal-300',
    glowClass: 'bg-emerald-500/20 border-emerald-400/30 shadow-emerald-500/20',
    borderColor: 'border-emerald-500',
    primaryText: 'text-emerald-500',
    primaryBg: 'bg-emerald-500',
    primaryHover: 'hover:bg-emerald-600',
    primaryBgSubtle: 'bg-emerald-50 dark:bg-emerald-500/10',
    primaryTextSubtle: 'text-emerald-600 dark:text-emerald-400',
    iconColor: 'text-emerald-500',
    buttonColor: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
  STUDENT: {
    gradientSidebar: 'from-slate-900 via-pink-950 to-black',
    gradientBlob: 'from-pink-600/10 to-rose-600/10',
    gradientText: 'from-pink-400 to-rose-300',
    glowClass: 'bg-pink-500/20 border-pink-400/30 shadow-pink-500/20',
    borderColor: 'border-pink-500',
    primaryText: 'text-pink-500',
    primaryBg: 'bg-pink-500',
    primaryHover: 'hover:bg-pink-600',
    primaryBgSubtle: 'bg-pink-50 dark:bg-pink-500/10',
    primaryTextSubtle: 'text-pink-600 dark:text-pink-400',
    iconColor: 'text-pink-500',
    buttonColor: 'bg-pink-500 hover:bg-pink-600 text-white',
  },
  PARENT: {
    gradientSidebar: 'from-slate-900 via-orange-950 to-black',
    gradientBlob: 'from-orange-600/10 to-amber-600/10',
    gradientText: 'from-orange-400 to-amber-300',
    glowClass: 'bg-orange-500/20 border-orange-400/30 shadow-orange-500/20',
    borderColor: 'border-orange-500',
    primaryText: 'text-orange-500',
    primaryBg: 'bg-orange-500',
    primaryHover: 'hover:bg-orange-600',
    primaryBgSubtle: 'bg-orange-50 dark:bg-orange-500/10',
    primaryTextSubtle: 'text-orange-600 dark:text-orange-400',
    iconColor: 'text-orange-500',
    buttonColor: 'bg-orange-500 hover:bg-orange-600 text-white',
  }
};

const getSteps = (userType: string) => {
    if (userType === 'ADMIN') {
        return [
          { id: 'welcome', label: 'Welcome' },
          { id: 'setup', label: 'Initial Setup' },
          { id: 'academic', label: 'Academic Structure' },
          { id: 'staff', label: 'Staff & Students' },
          { id: 'assessments', label: 'Records' },
          { id: 'finance', label: 'Finance' },
          { id: 'success', label: 'Ready to Launch' }
        ];
    }
    if (userType === 'TEACHER') {
        return [
          { id: 'welcome', label: 'Welcome' },
          { id: 'classes', label: 'Classes & Subjects' },
          { id: 'exams', label: 'Exams & Quizzes' },
          { id: 'assignments', label: 'Assignments & Grading' },
          { id: 'grades', label: 'Gradebook & Records' },
          { id: 'schedule', label: 'Schedule & Attendance' },
          { id: 'success', label: 'Ready to Teach' }
        ];
    }
    if (userType === 'STUDENT') {
        return [
          { id: 'welcome', label: 'Welcome' },
          { id: 'classes', label: 'Classes & Schedule' },
          { id: 'assignments', label: 'Assignments & Tasks' },
          { id: 'exams', label: 'Exams & Quizzes' },
          { id: 'grades', label: 'Grades & Results' },
          { id: 'attendance', label: 'Attendance & Linking' },
          { id: 'success', label: 'Ready to Excel' }
        ];
    }
    if (userType === 'PARENT') {
        return [
          { id: 'welcome', label: 'Welcome' },
          { id: 'children', label: 'My Children' },
          { id: 'performance', label: 'Grades & Results' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'assignments', label: 'Homework & Tasks' },
          { id: 'billing', label: 'Fees & Communication' },
          { id: 'success', label: 'Ready to Support' }
        ];
    }
    return [
      { id: 'welcome', label: 'Welcome' },
      { id: 'management', label: 'Dashboard' },
      { id: 'communication', label: 'Communication' },
      { id: 'academics', label: 'Academics' },
      { id: 'success', label: 'Ready to Launch' }
    ];
};

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [previewRole, setPreviewRole] = useState<string | null>(null);
  
  const queryRole = (searchParams.get('type') || searchParams.get('role'))?.toUpperCase();
  const userType = previewRole || user?.userType || queryRole || 'ADMIN';
  const theme = THEME_MAP[userType as keyof typeof THEME_MAP] || THEME_MAP.ADMIN;
  const currentSteps = getSteps(userType);

  React.useEffect(() => {
    // If not authenticated and no explicit preview/role query param is set, redirect to login
    if (!isAuthenticated && !user && !queryRole && !previewRole) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, queryRole, previewRole, router]);
  
  const getLoginRoute = (role: string) => {
      switch (role) {
          case 'ADMIN': return '/login/school-admin';
          case 'TEACHER': return '/login/teacher';
          case 'STUDENT': return '/login/student';
          case 'PARENT': return '/login/parent';
          default: return '/login';
      }
  };

  const getDashboardRoute = (role: string) => {
      const normalized = role.toLowerCase().replace('_', '-');
      if (normalized === 'school-admin' || normalized === 'admin') return '/dashboard/admin';
      return `/dashboard/${normalized}`;
  };

  const pendingRedirect = searchParams.get('redirect') || null;

  const handleNext = () => {
    if (currentStep < currentSteps.length - 1) {
        setCurrentStep(prev => prev + 1);
    } else {
        useAuthStore.getState().setHasCompletedOnboarding(true);
        if (isAuthenticated || user) {
            // Honor a pending join redirect (e.g. from Google sign-up via class invite link)
            router.push(pendingRedirect || getDashboardRoute(userType));
        } else {
            router.push(getLoginRoute(userType));
        }
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const isSplitScreen = currentStep === 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-500">
      <CheerAnimation duration={6000}>
        <div className="flex w-full min-h-screen">
          {/* Premium Left Sidebar (Always Visible) */}
          <div className={`hidden lg:flex w-[40%] bg-gradient-to-br ${theme.gradientSidebar} flex-col justify-between p-12 text-white relative overflow-hidden transition-colors duration-500 border-r border-white/5`}>
            {/* Glassmorphic decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className={`absolute -top-[30%] -left-[20%] w-[150%] h-[150%] rounded-full bg-gradient-to-tr ${theme.gradientBlob} blur-[100px]`} 
                />
                <motion.div 
                    animate={{ y: [0, -20, 0], rotate: [12, 15, 12] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[15%] right-[10%] size-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl"
                />
                <motion.div 
                    animate={{ y: [0, 30, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute bottom-[25%] left-[15%] size-24 rounded-full ${theme.glowClass} backdrop-blur-xl`}
                />
            </div>
            
            <div className="relative z-10 flex items-center gap-3">
                <div className="size-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center p-3 shadow-2xl shadow-black/50">
                    <img src="/logo/favicon.svg" alt="Qefas Hub Logo" className="w-full h-full object-contain drop-shadow-md" />
                </div>
                <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">QEFAS HUB</span>
            </div>
            
            <div className="relative z-10 space-y-8">
                <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight">
                    Transform your <br/>
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.gradientText}`}>
                        {userType === 'STUDENT' ? 'learning.' : userType === 'PARENT' ? 'involvement.' : 'institution.'}
                    </span>
                </h1>
                <p className={`text-slate-300 text-xl font-medium max-w-md leading-relaxed border-l-4 ${theme.borderColor} pl-5 opacity-90`}>
                    Everything you need to run a modern, digital academy—all in one elegant workspace.
                </p>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
                <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">© 2026 Qefas Hub</p>
                <div className="flex gap-2">
                    <div className={`size-2 rounded-full ${theme.primaryBg} animate-pulse`} />
                    <div className={`size-2 rounded-full ${theme.primaryBg} opacity-40`} />
                    <div className={`size-2 rounded-full ${theme.primaryBg} opacity-40`} />
                </div>
            </div>
          </div>

          {/* Right Content Area (Dynamic Steps) */}
          <div className="flex-1 flex flex-col p-8 lg:p-20 bg-white dark:bg-slate-950 relative transition-colors duration-500 overflow-y-auto">
            
            {/* Quick Skip Tour option for authenticated users */}
            {(isAuthenticated || user) && currentStep < currentSteps.length - 1 && (
              <div className="w-full max-w-xl mx-auto mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    useAuthStore.getState().setHasCompletedOnboarding(true);
                    // Honor a pending join redirect (e.g. from Google sign-up via class invite link)
                    router.push(pendingRedirect || getDashboardRoute(userType));
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors uppercase tracking-wider flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
                >
                  {pendingRedirect ? 'Skip Tour & Continue' : 'Skip Tour & Go to Dashboard'} <ChevronRight size={13} />
                </button>
              </div>
            )}

            {/* Minimal Top Stepper (Hidden on Step 0) */}
            {currentStep > 0 && (
              <div className="w-full max-w-xl mx-auto mb-12 flex items-center justify-between">
                  {currentSteps.slice(1, -1).map((step, idx) => {
                      const stepIndex = idx + 1;
                      const isActive = currentStep === stepIndex;
                      const isPast = currentStep > stepIndex;
                      return (
                          <React.Fragment key={step.id}>
                              <div className={`flex items-center gap-2 ${isActive ? theme.primaryText : isPast ? 'text-emerald-500' : 'text-slate-400'}`}>
                                  <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${isActive ? `${theme.borderColor} ${theme.primaryBgSubtle}` : isPast ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-200 dark:border-slate-800'}`}>
                                      {isPast ? <CheckCircle2 className="size-4" /> : stepIndex}
                                  </div>
                              </div>
                              {idx < currentSteps.slice(1, -1).length - 1 && (
                                  <div className={`flex-1 h-[2px] rounded-full mx-2 ${isPast ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                              )}
                          </React.Fragment>
                      );
                  })}
              </div>
            )}

            <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    {currentStep === 0 ? (
                        <motion.div 
                            key="step-0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full space-y-8"
                        >
                            <div className="space-y-3 text-center">
                                <div className={`mx-auto size-16 ${theme.primaryBgSubtle} ${theme.primaryTextSubtle} rounded-full flex items-center justify-center mb-6 transition-colors duration-500`}>
                                    <Sparkles className="size-8" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Welcome to Qefas Hub, {user?.name || (userType.charAt(0) + userType.slice(1).toLowerCase())}!
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    {user?.adminRole ? `As a ${user.adminRole.replace('_', ' ').toLowerCase()}, ` : 'Before you dive in, '} let's take a quick tour of what you can accomplish with your new platform.
                                </p>
                            </div>

                            <Button onClick={handleNext} className={`w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all flex items-center justify-center group gap-2 border-none ${theme.buttonColor}`}>
                                Start Tour <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </Button>

                        </motion.div>
                    ) : (
                        <motion.div 
                            key={`step-${currentStep}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full space-y-12"
                        >
                            {userType === 'ADMIN' ? (
                                <>
                                    {currentStep === 1 && <SetupStep theme={theme} />}
                                    {currentStep === 2 && <AcademicStructureStep theme={theme} />}
                                    {currentStep === 3 && <StaffStudentStep theme={theme} />}
                                    {currentStep === 4 && <AssessmentsStep theme={theme} />}
                                    {currentStep === 5 && <FinanceStep theme={theme} />}
                                    {currentStep === 6 && <SuccessStep theme={theme} userType={userType} />}
                                </>
                            ) : userType === 'TEACHER' ? (
                                <>
                                    {currentStep === 1 && <TeacherClassesStep theme={theme} />}
                                    {currentStep === 2 && <TeacherExamsStep theme={theme} />}
                                    {currentStep === 3 && <TeacherAssignmentsStep theme={theme} />}
                                    {currentStep === 4 && <TeacherGradesStep theme={theme} />}
                                    {currentStep === 5 && <TeacherScheduleAttendanceStep theme={theme} />}
                                    {currentStep === 6 && <SuccessStep theme={theme} userType={userType} />}
                                </>
                            ) : userType === 'STUDENT' ? (
                                <>
                                    {currentStep === 1 && <StudentClassesStep theme={theme} />}
                                    {currentStep === 2 && <StudentAssignmentsStep theme={theme} />}
                                    {currentStep === 3 && <StudentExamsStep theme={theme} />}
                                    {currentStep === 4 && <StudentGradesStep theme={theme} />}
                                    {currentStep === 5 && <StudentAttendanceLinkingStep theme={theme} />}
                                    {currentStep === 6 && <SuccessStep theme={theme} userType={userType} />}
                                </>
                            ) : userType === 'PARENT' ? (
                                <>
                                    {currentStep === 1 && <ParentChildrenStep theme={theme} />}
                                    {currentStep === 2 && <ParentPerformanceStep theme={theme} />}
                                    {currentStep === 3 && <ParentAttendanceStep theme={theme} />}
                                    {currentStep === 4 && <ParentAssignmentsStep theme={theme} />}
                                    {currentStep === 5 && <ParentFinanceCommunicationStep theme={theme} />}
                                    {currentStep === 6 && <SuccessStep theme={theme} userType={userType} />}
                                </>
                            ) : (
                                <>
                                    {currentStep === 1 && <ManagementStep theme={theme} userType={userType} />}
                                    {currentStep === 2 && <CommunicationStep theme={theme} userType={userType} />}
                                    {currentStep === 3 && <AcademicsStep theme={theme} userType={userType} />}
                                    {currentStep === 4 && <SuccessStep theme={theme} userType={userType} />}
                                </>
                            )}

                            <div className="flex justify-between items-center pt-8 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    variant="ghost" 
                                    onClick={handleBack}
                                    className={`font-bold rounded-xl ${currentStep === currentSteps.length - 1 ? 'invisible' : ''}`}
                                >
                                    Previous
                                </Button>
                                <Button 
                                    onClick={handleNext}
                                    className={`h-12 px-8 rounded-xl font-bold shadow-lg border-none ${theme.buttonColor}`}
                                >
                                    {currentStep === currentSteps.length - 1 ? ((isAuthenticated || user) ? 'Go to your Dashboard' : 'Login to your Dashboard') : 'Continue'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          </div>
        </div>
      </CheerAnimation>
    </div>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

function ManagementStep({ theme, userType }: { theme: any; userType: string }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Total School Management</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Say goodbye to scattered spreadsheets. Qefas Hub gives you complete control over your administrative tasks.
                </p>
            </div>
            <div className="space-y-4 max-w-lg">
                <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                    <Users className={`${theme.primaryText} mt-1 size-6`} />
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Staff & Student Roster</h4>
                        <p className="text-base text-slate-500">Manage admissions, staff assignments, and detailed user profiles with ease.</p>
                    </div>
                </div>
                {userType === 'ADMIN' && (
                  <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                      <LayoutDashboard className={`${theme.primaryText} mt-1 size-6`} />
                      <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Custom Subdomains</h4>
                          <p className="text-base text-slate-500">Launch a dedicated website for your school instantly.</p>
                      </div>
                  </div>
                )}
                {userType === 'ADMIN' && (
                  <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                      <CreditCard className={`${theme.primaryText} mt-1 size-6`} />
                      <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-lg">Fee Collection</h4>
                          <p className="text-base text-slate-500">Seamlessly collect tuition, issue digital receipts, and track outstanding balances.</p>
                      </div>
                  </div>
                )}
            </div>
        </motion.div>
    );
}

function CommunicationStep({ theme, userType }: { theme: any; userType: string }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-8">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Connect Everyone</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Build a thriving digital community. Keep teachers, students, and parents in the loop effortlessly.
                </p>
            </div>
             <div className="space-y-4 max-w-lg">
                <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                    <MessageSquare className={`${theme.primaryText} mt-1 size-6`} />
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Instant Messaging</h4>
                        <p className="text-base text-slate-500">Secure, internal chat systems and announcement broadcasting for all stakeholders.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function AcademicsStep({ theme, userType }: { theme: any; userType: string }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-8">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Academic Excellence</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Modern tools designed to help educators teach better and students learn faster.
                </p>
            </div>
             <div className="space-y-4 max-w-lg">
                <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl">
                    <GraduationCap className={`${theme.primaryText} mt-1 size-6`} />
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Grades & Exams</h4>
                        <p className="text-base text-slate-500">Generate report cards automatically, manage online assignments, and track attendance.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function SuccessStep({ theme, userType }: { theme: any; userType?: string }) {
    const subtitle = useMemo(() => {
        switch (userType) {
            case 'STUDENT': return "The tour is complete. It's time to explore your learning portal and start achieving your academic goals.";
            case 'PARENT': return "The tour is complete. It's time to connect with your student and monitor their academic progress.";
            case 'TEACHER': return "The tour is complete. It's time to prepare your classes and engage with your students.";
            default: return "The tour is complete. It's time to take the reins and start building your digital academy.";
        }
    }, [userType]);

    return (
        <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="flex flex-col items-center justify-center text-center space-y-6 py-12">
            <div className="mb-4">
                <Lottie
                    animationData={Success}
                    loop={true}
                    className="w-40 h-40"
                />
            </div>
                        <div>
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">You're ready <br/> to launch!</h3>
                <p className="text-slate-500 text-lg max-w-md mx-auto">{subtitle}</p>
                
                <div className="mt-8 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 max-w-md mx-auto flex gap-3 items-start text-left">
                    <Info className="text-orange-500 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Need a refresher?</strong> You can always revisit this onboarding tour by clicking the <strong>"Revisit Onboarding"</strong> button on your dashboard's <strong>Settings</strong> page.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function PreviewableImage({ src, alt, theme }: { src: string, alt: string, theme: any }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div 
                onClick={() => setIsOpen(true)}
                className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 w-full sm:w-48 h-32 bg-slate-100 dark:bg-slate-900 flex items-center justify-center"
            >
                {src ? (
                    <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <UploadCloud size={24} className="mb-2" />
                        <span className="text-[10px] uppercase tracking-wider font-bold">Add Image Here</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={24} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        {src ? (
                            <motion.img 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                src={src} 
                                alt={alt} 
                                className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-white/10"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <motion.div 
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-2xl aspect-video rounded-2xl shadow-2xl border border-white/10 bg-slate-800 flex flex-col items-center justify-center text-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <UploadCloud size={48} className="mb-4 opacity-50" />
                                <p className="text-lg font-medium opacity-80">No image provided yet</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function PreviewableImageSlider({ images, alt, theme }: { images: string[], alt: string, theme: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            <div 
                onClick={() => images.length > 0 && setIsOpen(true)}
                className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 w-full sm:w-48 h-32 bg-slate-100 dark:bg-slate-900 flex items-center justify-center"
            >
                {images.length > 0 && images[currentIndex] ? (
                    <>
                        <img src={images[currentIndex]} alt={`${alt} ${currentIndex + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        {images.length > 1 && (
                            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 z-10">
                                {images.map((_, i) => (
                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`} />
                                ))}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" size={24} />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <UploadCloud size={24} className="mb-2" />
                        <span className="text-[10px] uppercase tracking-wider font-bold">Add Images</span>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    >
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                        >
                            <X size={24} />
                        </button>
                        
                        {images.length > 1 && (
                            <>
                                <button 
                                    onClick={handlePrev}
                                    className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                                >
                                    <ChevronRight className="rotate-180" size={32} />
                                </button>
                                <button 
                                    onClick={handleNext}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        {images.length > 0 && images[currentIndex] && (
                            <div className="relative max-w-full max-h-[90vh] flex flex-col items-center">
                                <motion.img 
                                    key={currentIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    src={images[currentIndex]} 
                                    alt={`${alt} ${currentIndex + 1}`}
                                    className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                {images.length > 1 && (
                                    <div className="absolute -bottom-8 flex justify-center gap-2 z-50" onClick={(e) => e.stopPropagation()}>
                                        {images.map((_, i) => (
                                            <button 
                                                key={i} 
                                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`} 
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function SetupStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Initial Setup</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Set up your school's foundational identity, contact details, and custom login URL.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Building2 className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">School Profile</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>School Profile</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Edit Profile</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Add and edit your school's information.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Upload your school's logo and motto.</li>
                            <li>Add official phone numbers and emails.</li>
                            <li>This data is used automatically on student report cards and invoices.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/admin%20onboarding%202%20(2).png" alt="School Profile Settings" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <LayoutDashboard className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Custom Subdomain</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Core Management</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Sub Domain</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Redesign your custom domain to match your taste.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Build and personalize your own public landing page.</li>
                            <li>Outsiders can visit your custom domain to view your beautifully designed custom website.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/admin%20onboarding%202%20(1).png" alt="Custom Subdomain Setup" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function AcademicStructureStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Academic Structure</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Define how your school operates by setting up sessions, terms, and departments.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Calendar className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Sessions & Terms</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Core Management</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Session Management</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Configure your academic calendar.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Add the start and end dates for your academic sessions.</li>
                            <li>Define terms within each session so that results and assessments can be properly categorized.</li>
                            <li><strong>Important:</strong> You cannot create exams or records without an active session!</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/admin%20onboarding%203.png" alt="Sessions and Terms Management" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Layers className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Departments & Classes</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Departments</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Core Management</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Classes & Timetable</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Set up classes and sections.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Create departments like "Science", "Arts", or "Primary".</li>
                            <li>Create individual classes within the <strong>Classes & Timetable</strong> section.</li>
                            <li>Inside those individual classes, you can manage the timetable, students, subjects, teachers, exams, attendance, final results, and analytics.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/admin%20onboarding%204.png" alt="Departments and Classes" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StaffStudentStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Staff & Students</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Bring your team on board, enroll students, and connect families.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Users className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Linking Admins</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span className="font-bold mr-1">Admin:</span>
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Core Management</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Team</span>
                        </div>


                            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
                            <div>
                                <strong className="text-slate-800 dark:text-slate-200 block mb-1">1. Linking Admins</strong>
                                <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
                                    <li>Go to the school admin register page and click <strong>Join existing school</strong>.</li>
                                    <li>Fill out the form and add the <strong>School Code</strong> from the Linking Hub page.</li>
                                    <li>Once registered, the name appears on the Team page under <em>Pending</em>, where existing admins can accept/reject and assign a role.</li>
                                </ul>
                            </div>
                        </div>






                    </div>
                    <PreviewableImageSlider images={["/onboarding/admin onboarding 4 - linking admin -1.png", "/onboarding/admin onboarding 4 - linking admin -2.png", "/onboarding/admin onboarding 4 - linking admin -3.png", "/onboarding/admin onboarding 4 - linking admin -4.png"]} alt="Linking Admins" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>


                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Users className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Linking Teachers</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span className="font-bold mr-1">Teacher:</span>
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Core Management</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Linking Hub</span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4">
                            <ul className="list-disc list-inside space-y-2 text-slate-500 dark:text-slate-400">
                                <li><strong>During Registration:</strong> On the teacher register page, select optional information, enter data, and add the school code from the Linking Hub. A request will be sent to the school admins. Alternatively, teachers can scan the QR code from the Linking Hub or use a copied link for auto sign-up.</li>
                                <li><strong>After Registration:</strong> Registered teachers can go to their own Linking Hub, click <strong>Connect with Code</strong>, select "School to Teacher", and paste the code. School admins will then accept the connection.</li>
                            </ul>
                        </div>
                    </div>
                    <PreviewableImageSlider images={["/onboarding/admin onboarding 4 - Linking Teachers -1.png", "/onboarding/admin onboarding 4 - Linking Teachers -2.png", "/onboarding/admin onboarding 4 - Linking Teachers -3.png", "/onboarding/admin onboarding 4 - Linking Teachers -4.png", "/onboarding/admin onboarding 4 - Linking Teachers -5.png"]} alt="Linking Teachers" theme={theme} />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <GraduationCap className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Linking Students</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Students can be linked to your school in two ways:
                        </p>











                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li><strong>During Registration:</strong> On the student register page, select optional information, enter data, and add the school code from the Linking Hub. A request will be sent to the school admins. Alternatively, students can scan the QR code from the Linking Hub or use a copied link for auto sign-up.</li>
                            <li><strong>After Registration:</strong> Registered students can go to their own Linking Hub, click Connect with Code, select "School to Student", and paste the code. School admins will then accept the connection.</li>
                        </ul>
                    </div>
                    <PreviewableImageSlider images={["/onboarding/admin onboarding 4 - Linking Students -1.png", "/onboarding/admin onboarding 4 - Linking Students -2.png", "/onboarding/admin onboarding 4 - Linking Students -3.png", "/onboarding/admin onboarding 4 - Linking Students -4.png", "/onboarding/admin onboarding 4 - Linking Students -5.png"]} alt="Linking Students" theme={theme} />
                </div>

                {/* Linking Parents */}
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 mt-6">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Users className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Linking Parents</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Parents can only connect to students. This can be done during registration or after:
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li><strong>During Registration:</strong> On the parent register page, select optional information, enter data, and add the student code from the student's Linking Hub. A request will be sent to the student to accept.</li>
                            <li><strong>After Registration:</strong> Registered parents can go to their own Linking Hub, click Connect with Code, select "Student to Parent", and paste the student's code. The student will then accept the connection.</li>
                        </ul>
                    </div>
                    <PreviewableImageSlider images={["/onboarding/admin onboarding 4 - Linking parents -1.png", "/onboarding/admin onboarding 4 - Linking parents -2.png", "/onboarding/admin onboarding 4 - Linking parents -3.png", "/onboarding/admin onboarding 4 - Linking parents - 4.png", "/onboarding/admin onboarding 4 - Linking parents - 5.png"]} alt="Linking Parents" theme={theme} />
                </div>

            </div>
        </motion.div>
    );
}

function AssessmentsStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Assessments & Records</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Understand the grading system and how to publish results.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <BookOpen className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Exam Setup</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Exams</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Design and deploy formal assessments and Computer-Based Tests (CBT).
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Create structured, timed exams with customizable question banks.</li>
                            <li>Set strict grading logic, time limits, and automated scoring parameters.</li>
                            <li>Monitor active exam sessions and track student submission statuses.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/aadmin- Assessments & Records - exam setup.png" alt="Exam Setup" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <GraduationCap className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Grades</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Grades</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Comprehensively track and manage student academic performance.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Review detailed scores for individual students across all enrolled subjects.</li>
                            <li>Monitor term-long performance trends, including continuous assessments.</li>
                            <li>Identify areas for improvement and analyze class-wide averages.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/aadmin- Assessments & Records - grades.png" alt="Grades" theme={theme} />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Layers className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Assignments</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Assignments</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Orchestrate day-to-day continuous assessments and homework.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Empower teachers to assign and grade daily or weekly tasks.</li>
                            <li>Set clear submission deadlines and provide direct feedback on student work.</li>
                            <li>Assignment scores automatically compile and weight toward final records.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/aadmin- Assessments & Records - asignment.png" alt="Assignments" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 mt-6">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <FileSpreadsheet className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Final Result (Records)</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Records</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Aggregate, verify, and publish official end-of-term academic results.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Automatically compile all Continuous Assessment (CA) and Exam scores.</li>
                            <li>Generate comprehensive report cards and performance analytics for each class.</li>
                            <li>Administrators must explicitly verify and click "Publish" to make results visible to parents and students.</li>
                        </ul>
                    </div>
                    <PreviewableImage src="/onboarding/aadmin- Assessments & Records -  final result.png" alt="Final Result" theme={theme} />
                </div>
            </div>
        </motion.div>
    );
}

function FinanceStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Billing & Finance</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Manage your subscription, usage limits, and financial transactions.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <CreditCard className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Subscription & Usage Limits</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Finance</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Billing</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Manage school billing from your dashboard.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Access full subscription details (plan, usage, and transaction limits) from the sidebar.</li>
                            <li>Click "Change Plan" or "Upgrade Plan" to browse and select a new plan.</li>
                            <li>Review your plan breakdown, apply a coupon, and proceed through checkout.</li>
                            <li>Payments trigger automatic subscription activation (and deactivation upon expiry).</li>

                        </ul>
                    </div>
                    <PreviewableImageSlider images={["/onboarding/Billing & Finance - Subscription & Usage Limits-1.png", "/onboarding/Billing & Finance - Subscription & Usage Limits-2.png", "/onboarding/Billing & Finance - Subscription & Usage Limits- 3.png", "/onboarding/Billing & Finance - Subscription & Usage Limits- 4.png"]} alt="Billing and Subscription" theme={theme} />
                    <div className="hidden">
                        <ul>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 mt-6">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <CreditCard className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Pricing on Landing Page</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Website</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Pricing</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Pay directly from the landing page.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Click the "Pricing" link on the top navigation bar to see a list of plans we offer.</li>
                            <li>Select a plan to view a payment breakdown and apply any coupon codes. Unauthenticated users will be prompted for their email.</li>
                            <li>First-time registrations receive a free trial, which is activated upon completing the payment process.</li>
                            <li>Subscriptions are automatically activated and deactivated based on their expiration date.</li>
                        </ul>
                    </div>
                    <PreviewableImageSlider images={["/onboarding/Billing & Finance - pricing -1.png", "/onboarding/Billing & Finance - pricing -2.png"]} alt="Pricing on Landing Page" theme={theme} />
                </div>
            </div>
        </motion.div>
    );
}

function TeacherClassesStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Classrooms & Assigned Subjects</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Access your assigned classrooms, review enrolled student rosters, and manage subject curricula.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Users className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">My Classes Hub</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">My Classes</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Central workspace for all classrooms and homerooms assigned to you.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>View class rosters, total student counts, and individual student academic dossiers.</li>
                            <li>Track student engagement, special learning accommodations, and homeroom logs.</li>
                            <li>Quickly access timetable schedules, exams, and attendance for each assigned class arm.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <BookOpen className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Assigned Subjects & Curriculum</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Subjects</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Manage the curriculum scope and topics for your assigned courses.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Review all subjects assigned to you across classes and grade levels.</li>
                            <li>Track syllabus completion and organize lesson plans for upcoming terms.</li>
                            <li>Prepare structured continuous assessments and term examination papers per subject.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function TeacherExamsStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Exams, Quizzes & Question Engine</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Design multi-paper exams, build rich question banks with LaTeX math formatting, and monitor student tests.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Layers className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Multi-Paper Assessment Engine</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Exams & Quizzes</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Create Exam</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Deploy formal term exams, Computer-Based Tests (CBT), and periodic class quizzes.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Create multi-paper exams (e.g. Paper 1 Objectives + Paper 2 Essay/Theory).</li>
                            <li>Configure strict time windows, automatic question shuffling, and pass thresholds.</li>
                            <li>Monitor live student attempts and review test completion metrics in real time.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <FileText className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Advanced Question Bank with LaTeX</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Exams & Quizzes</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Question List</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Add Question</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Author versatile questions with equations, multiple-choice options, and scoring keys.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Native LaTeX / KaTeX rendering for math symbols, scientific equations, and chemical notation.</li>
                            <li>Support for Single Choice, Multiple Choice, and open-ended Theory questions.</li>
                            <li>Reuse verified questions from your subject bank across different assessment papers.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function TeacherAssignmentsStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Assignments & Rapid Bulk Grading</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Distribute homework, attach reference study files, and grade classroom cohorts with one-click bulk tools.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <FileSpreadsheet className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Homework & Project Distribution</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Assignments</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Create Assignment</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Send homework tasks, reading exercises, and term projects directly to students.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Set strict submission deadlines and attach reference documents or PDF guidelines.</li>
                            <li>Target assignments to specific class arms or multiple classes simultaneously.</li>
                            <li>Monitor live submission statuses (Submitted on time, Late, or Pending).</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <CheckCircle2 className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">One-Click Bulk Grading & Feedback</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Assignments</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Submissions</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Bulk Grading</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Review and grade an entire classroom roster on a single unified screen.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Grade students in batch mode without opening separate pages for each submission.</li>
                            <li>Preview student document attachments directly in-browser while entering scores.</li>
                            <li>Provide tailored feedback that instantly reflects in student and parent portals.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function TeacherGradesStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Gradebook, Scores & Academic Records</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Record continuous assessment scores, calculate final grades, and compile remarks for term report cards.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <GraduationCap className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Continuous Assessment (CA) & Exam Recording</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Academics</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Grades</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Record Grades</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Maintain the official score ledger for all subjects and classroom arms.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Input Continuous Assessment (tests, quizzes, homework) and final examination marks.</li>
                            <li>Automated calculation of total percentage scores, letter grades (A1–F9 / A+–F), and grade points.</li>
                            <li>Perform batch score adjustments before submitting grades for administrative sign-off.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <FileSpreadsheet className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Student Records, Dossiers & Remarks</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Records</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">New Record</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Document behavioral observations, conduct remarks, and psychomotor evaluations.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Enter teacher remarks, attendance summaries, and character assessments for each pupil.</li>
                            <li>Track longitudinal performance trajectories across past terms to support student growth.</li>
                            <li>Comments and ratings feed directly into institutional report cards and parent result dossiers.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function TeacherScheduleAttendanceStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Daily Schedule, Attendance & Linking</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Keep track of your timetable, roll-call attendance, and connect with parents and students.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Calendar className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Today's Teaching Schedule & Roll Call</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Home Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Schedule & Attendance</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Daily classroom operational schedule and quick attendance roll call.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>View scheduled periods, assigned subject classrooms, and room allocations at a glance.</li>
                            <li>Mark daily student roll call (Present, Late, Excused, Absent) in seconds.</li>
                            <li>Real-time attendance logs synchronize immediately with school administration and parents.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <QrCode className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Student QR Linking & Parent Directory</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Linking</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Parents & Students</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Bridge your classroom with students and verify parent communication channels.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Display class QR codes and invite keys for rapid student device onboarding.</li>
                            <li>Access the verified guardian directory for parent-teacher consultations and inquiries.</li>
                            <li>Send academic alerts and progress updates directly to involved parents.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StudentClassesStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Classrooms & Daily Timetable</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Explore your enrolled subjects, view assigned teachers, and stay on top of your daily schedule.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <BookOpen className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Enrolled Classes & Subjects</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Classes</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">My Subjects</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Access every course you are taking this academic term with complete syllabus visibility.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>View your assigned subject teachers, weekly topics, and official curriculum syllabi.</li>
                            <li>Access teacher-shared lecture notes, reading materials, and classroom guidelines.</li>
                            <li>Stay informed about subject announcements and class-specific study recommendations.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Clock className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Daily Timetable & Schedule</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Timetable</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Schedule View</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Plan your school days efficiently with clear timetables for all periods and sessions.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Real-time display of daily classroom periods, designated room numbers, and subject order.</li>
                            <li>View break times, laboratory practicals, sports activities, and school assemblies.</li>
                            <li>Never miss a class transition or an upcoming period with an organized daily schedule.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StudentAssignmentsStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Assignments & Coursework Tasks</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Track coursework deadlines, submit homework digitally, and view teacher grading and remarks.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <ClipboardList className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Active Assignments & Due Date Tracker</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Assignments</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Homework Hub</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Stay organized and never miss homework deadlines with categorized task boards.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Color-coded badges for assignment statuses (Pending, Submitted, Graded, and Overdue).</li>
                            <li>Read detailed project briefs, rubrics, and download teacher-attached worksheets or PDFs.</li>
                            <li>Clear countdown timers and submission cutoffs to help you prioritize your study time.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <UploadCloud className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Digital Submissions & Teacher Feedback</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Assignments</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Submit Coursework</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Hand in your homework directly through your student portal and receive fast feedback.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Upload essays, documents, scanned handwritten solutions, or project files in multiple formats.</li>
                            <li>Add private submission comments or clarification questions for your subject teacher.</li>
                            <li>Review graded assignments with teacher annotations, correction notes, and earned points.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StudentExamsStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">CBT Exams, Quizzes & Assessments</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Take timed computer-based assessments, practice quizzes, and review your performance.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <FileCheck2 className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Online Assessment & CBT Exam Center</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Exams/Quizzes</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Assessment Hub</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Clean, distraction-free environment for midterms, mocks, and official examinations.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Real-time countdown timer with automated warnings before your exam duration expires.</li>
                            <li>Automatic answer auto-saving ensures your progress is protected even during network hiccups.</li>
                            <li>Multi-paper support for continuous assessments, mock drills, and final term exams.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Sparkles className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Rich Question Engine & Performance Review</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Exams/Quizzes</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Exam Review</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Interactive question interface featuring formulas, diagrams, and instant attempt scoring.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Crisp mathematical formulas and chemical equations rendered seamlessly with LaTeX/KaTeX.</li>
                            <li>Supports multiple-choice, true/false, fill-in-the-blank, and written theory response questions.</li>
                            <li>Instant objective score feedback and detailed question-by-question reviews once published.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StudentGradesStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Academic Performance, Grades & Results</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Monitor continuous assessment scores, calculate term averages, and view official report cards.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <BarChart3 className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Continuous Assessment (CA) & Grade Tracker</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Grades</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Gradebook</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Transparent gradebook showing test, quiz, homework, and midterm scores.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Continuous scoring breakdown showing how classwork and tests contribute to your final mark.</li>
                            <li>Visual progress indicators and subject averages to help identify areas needing improvement.</li>
                            <li>Compare current term results against your past academic trends across the school year.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <GraduationCap className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Termly Report Cards & Class Standing</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Final Results</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Report Cards</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Official end-of-term academic records, class standings, and principal remarks.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Download and print official term report cards with grade distributions and GPA calculations.</li>
                            <li>View class ranking, overall position, and total aggregate scores across all enrolled subjects.</li>
                            <li>Read formal character assessments, behavioral remarks, and promotion recommendations.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function StudentAttendanceLinkingStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Attendance, Documents & Parent Linking</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Verify your attendance record, access official school documents, and connect your parents.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Calendar className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Daily Attendance Records & Digital Documents</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Attendance</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Attendance Log</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Complete log of classroom roll call and centralized storage for school credentials.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Check your present, late, and excused absence tallies alongside term attendance percentages.</li>
                            <li>Access your digital student ID, certificates, admission letters, and school clearances.</li>
                            <li>Keep a verifiable record of academic standing for transfers and scholarship applications.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <QrCode className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Parent QR Linking Hub</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Linking</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Parent Connect</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Connect with your parents or guardians so they can stay updated on your education.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Share your unique student QR code or 6-character linking code with your parent or guardian.</li>
                            <li>Parents can link their accounts to view report cards, fee receipts, and attendance notifications.</li>
                            <li>Simple one-tap linking maintains transparent communication between school and home.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ParentChildrenStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">My Children & Multi-Student Hub</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Monitor all your children from a single dashboard, switch between profiles, and link new students.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Users className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Children Directory & Profile Switching</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>My Children</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Child Overview</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Centralized family dashboard keeping tabs on each of your children's educational journeys.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>View individual profiles for each child with their current grade level, classroom, and school.</li>
                            <li>Effortlessly switch between multiple children without needing separate logins or accounts.</li>
                            <li>View key metrics at a glance: upcoming tasks, term GPA, and recent attendance roll calls.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <QrCode className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Rapid Student Linking via QR Code or ID</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>My Children</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Link Child</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Connect new students to your guardian account using their secure linking credentials.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Scan your child's student QR code or enter their 6-character linking code issued by the school.</li>
                            <li>Instant verification establishes private, authorized parental access to academic records.</li>
                            <li>Support for multiple schools and institutions within one unified parent dashboard.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ParentPerformanceStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Grades, Exams & Academic Results</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Track ongoing continuous assessments, subject breakdowns, and official termly report cards.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <BarChart3 className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Continuous Assessment & Subject Strengths</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Performance</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Subject Analytics</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Granular visibility into tests, quizzes, and project scores across all subjects.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Real-time score updates as teachers grade quizzes, midterms, and class presentations.</li>
                            <li>Visual performance graphs highlighting subject strengths and areas requiring support.</li>
                            <li>Longitudinal tracking showing progress and grade trends across terms.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <GraduationCap className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Official Report Cards & Class Standing</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Final Results</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Report Sheets</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Access authenticated end-of-term report sheets and teacher-principal remarks.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>View term GPA, overall class ranking, grade distributions, and total cumulative marks.</li>
                            <li>Read detailed behavioral comments, character assessments, and teacher remarks.</li>
                            <li>Download and print official, tamper-proof PDF report cards directly for your records.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ParentAttendanceStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Daily Attendance & Roll Call Logs</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Stay informed on your child's classroom presence, punctuality, and absence records.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <Calendar className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Classroom Attendance & Arrival Monitoring</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Attendance</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Attendance Records</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Live updates on daily school attendance recorded directly by classroom teachers.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Daily roll call status: Present, Late, Excused, or Unexcused Absence.</li>
                            <li>Monthly attendance rate indicators with term-wide consistency tracking.</li>
                            <li>Instant alerts when an unverified absence or late arrival is recorded.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <FileText className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Digital Absence Notes & Medical Excuses</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Attendance</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Absence Notices</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Communicate planned absences or medical leaves directly with school administration.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Submit absence notices with dates and medical reasonings in advance.</li>
                            <li>Attach doctor notes or official documentation directly through the portal.</li>
                            <li>Track approval status from class teachers and the principal's office.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ParentAssignmentsStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Homework, Assignments & Learning Resources</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Guide your child's learning at home by monitoring assignment cutoffs and homework briefs.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <ClipboardList className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Active Homework & Due Date Tracker</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Assignments</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Tasks Board</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Keep track of all pending, submitted, and overdue coursework across all subjects.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Review assignment requirements, deadlines, and teacher-attached worksheets.</li>
                            <li>Track your child's submission status to help them stay accountable and avoid overdue work.</li>
                            <li>View teacher grading rubrics and specific scoring criteria for projects.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <BookOpen className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Teacher Feedback & Curriculum Resources</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Assignments</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Teacher Feedback</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Understand teacher evaluations and access supplementary study materials.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Read personalized teacher corrections, commendations, and guidance on submitted tasks.</li>
                            <li>Access recommended textbooks, curriculum syllabi, and practice materials.</li>
                            <li>Empower productive home discussions about academic progress and study habits.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ParentFinanceCommunicationStep({ theme }: { theme: any }) {
    return (
        <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} className="space-y-6">
            <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">School Fees, Invoices & Communication</h3>
                <p className="text-slate-500 text-xl leading-relaxed">
                    Manage tuition payments, view financial receipts, and message school teachers directly.
                </p>
            </div>
            <div className="space-y-4 max-w-4xl">
                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <CreditCard className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">Fee Statements, Invoices & Instant Receipts</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Billing</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">Invoices & Fees</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Transparent billing with clear tuition schedules and instant payment confirmation.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>View itemized fee invoices for tuition, books, uniforms, bus services, and examination fees.</li>
                            <li>Pay school dues securely online via card, bank transfer, or mobile money.</li>
                            <li>Download and print official payment receipts with unique transaction reference numbers.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${theme.primaryBgSubtle}`}>
                                <MessageSquare className={`${theme.primaryText} size-5`} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg">School Announcements & Teacher Messaging</h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                            <span>Navigate to Dashboard</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Sidebar</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span>Messages</span>
                            <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-900 dark:text-white font-bold">School Chat</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Direct line of communication with class teachers and school administrators.
                        </p>
                        <ul className="list-disc list-inside text-sm text-slate-500 dark:text-slate-400 space-y-1">
                            <li>Send private messages to subject teachers and guidance counselors regarding child progress.</li>
                            <li>Receive urgent school-wide announcements, emergency notices, and term calendar updates.</li>
                            <li>Schedule parent-teacher conferences and academic consultation sessions seamlessly.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
